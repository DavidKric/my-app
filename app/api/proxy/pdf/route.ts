import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  // Get the URL from the query parameter
  const url = request.nextUrl.searchParams.get('url');

  // Validate the URL
  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Log the request
    console.log('PDF Proxy: Fetching from:', url);
    
    // Fetch the PDF from the external source
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/pdf,*/*',
      },
    });

    // Check if the request was successful
    if (!response.ok) {
      console.error('PDF Proxy: Fetch failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch PDF: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    console.log('PDF Proxy: Content-Type:', contentType);
    
    // Get the PDF content
    const pdfArrayBuffer = await response.arrayBuffer();
    console.log('PDF Proxy: Received file size:', pdfArrayBuffer.byteLength, 'bytes');
    
    // Return the PDF with appropriate headers
    return new NextResponse(pdfArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Length': pdfArrayBuffer.byteLength.toString(),
        'X-Proxy-Status': 'success',
      },
    });
  } catch (error) {
    console.error('Error in PDF proxy:', error);
    return NextResponse.json(
      { error: 'Failed to proxy PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 