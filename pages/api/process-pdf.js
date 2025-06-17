import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing to use formidable
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = formidable({});
    try {
      const [fields, files] = await form.parse(req);

      const pdfFile = files.pdfFile?.[0];

      if (!pdfFile) {
        return res.status(400).json({ message: 'No PDF file uploaded. Make sure the field name is "pdfFile".' });
      }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(pdfFile.filepath), pdfFile.originalFilename || 'upload.pdf');
      formData.append('to_formats', 'text');
      formData.append('to_formats', 'json');
      formData.append('ocr_engine', 'tesseract');
      formData.append('ocr_lang', 'heb');
      formData.append('ocr_lang', 'eng');

      const doclingServeUrl = 'http://localhost:5001/v1alpha/convert/file';
      let doclingResponse;
      try {
        doclingResponse = await fetch(doclingServeUrl, {
          method: 'POST',
          body: formData,
          headers: formData.getHeaders(), // Pass through headers from FormData
        });

        if (doclingResponse.ok) {
          const jsonData = await doclingResponse.json();

          const text_content = jsonData.document?.text_content;
          const json_content = jsonData.document?.json_content;
          const doclingStatus = jsonData.status;
          const doclingErrors = jsonData.errors;

          // Log json_content structure for inspection
          console.log('Structure of json_content from Docling-Serve:', JSON.stringify(json_content, null, 2));

          if (doclingStatus !== 'success' && doclingStatus !== 'partial_success') {
            console.error('Docling-Serve processing failed:', doclingStatus, doclingErrors);
            return res.status(502).json({ // 502 Bad Gateway, as our server received an invalid response from upstream
              message: 'Docling-Serve processing failed.',
              doclingStatus,
              doclingErrors,
            });
          }

          if (!jsonData.document || typeof text_content === 'undefined') {
            console.error('Unexpected response structure from Docling-Serve:', jsonData);
            return res.status(502).json({
              message: 'Unexpected response structure from Docling-Serve. Missing document or text_content.',
            });
          }

          res.status(200).json({
            message: 'File processed successfully by Docling-Serve.',
            doclingStatus,
            textContent: text_content,
            jsonContentStructureAnalysis: 'json_content received and logged for structural analysis.',
            doclingErrors: doclingErrors || null, // Ensure it's null if undefined
          });
        } else {
          const errorBody = await doclingResponse.text();
          console.error('Docling-Serve responded with an error:', doclingResponse.status, errorBody);
          res.status(doclingResponse.status).json({ message: 'Error from Docling-Serve.', details: errorBody });
        }
      } catch (fetchError) {
        console.error('Failed to send file to Docling-Serve:', fetchError);
        res.status(500).json({ message: 'Failed to send file to Docling-Serve.', error: fetchError.message });
      }

    } catch (error) {
      console.error('Error parsing form data:', error);
      res.status(500).json({ message: 'Error processing file upload.', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
