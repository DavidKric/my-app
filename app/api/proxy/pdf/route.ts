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
    
    // Ensure we're dealing with a PDF (allow various content types that could be PDFs)
    if (contentType && 
        !contentType.includes('application/pdf') &&
        !contentType.includes('application/octet-stream') && 
        !contentType.includes('binary/octet-stream')) {
      console.warn('PDF Proxy: Unexpected content type:', contentType);
      // Continue anyway, but log the warning
    }
    
    // Get the PDF content
    const pdfArrayBuffer = await response.arrayBuffer();
    console.log('PDF Proxy: Received file size:', pdfArrayBuffer.byteLength, 'bytes');
    
    if (pdfArrayBuffer.byteLength === 0) {
      console.error('PDF Proxy: Received empty response');
      return NextResponse.json(
        { error: 'Received empty PDF from source' },
        { status: 400 }
      );
    }
    
    // Detect PDF header signature - %PDF
    const headerView = new Uint8Array(pdfArrayBuffer, 0, 4);
    const isPDF = headerView[0] === 0x25 && // %
                 headerView[1] === 0x50 && // P
                 headerView[2] === 0x44 && // D
                 headerView[3] === 0x46;   // F
    
    if (!isPDF) {
      console.error('PDF Proxy: File does not appear to be a valid PDF (missing %PDF header)');
      // Continue anyway, but log the warning
    }
    
    // Debug the first few bytes of the PDF
    const firstBytes = new Uint8Array(pdfArrayBuffer.slice(0, Math.min(32, pdfArrayBuffer.byteLength)));
    console.log('PDF Proxy: First bytes:', Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    // Comprehensive CORS headers to ensure browser compatibility
    const headers = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Length': pdfArrayBuffer.byteLength.toString(),
      'X-Proxy-Status': 'success',
      'Accept-Ranges': 'bytes',
    };
    
    console.log('PDF Proxy: Returning PDF with headers:', headers);
    
    // Return the PDF with appropriate headers
    return new NextResponse(pdfArrayBuffer, { headers });
  } catch (error) {
    console.error('Error in PDF proxy:', error);
    return NextResponse.json(
      { error: 'Failed to proxy PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
      'Access-Control-Max-Age': '86400',
    },
  });
} 