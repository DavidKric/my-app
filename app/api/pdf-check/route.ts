import { NextRequest, NextResponse } from 'next/server';

/**
 * API route that checks a PDF URL and returns debug information
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }
  
  try {
    // First check the proxy response headers
    const proxyUrl = `/api/proxy/pdf?url=${encodeURIComponent(url)}`;
    const proxyResponse = await fetch(new URL(proxyUrl, request.nextUrl.origin), {
      method: 'HEAD',
    });
    
    const proxyHeaders: Record<string, string> = {};
    proxyResponse.headers.forEach((value, key) => {
      proxyHeaders[key] = value;
    });
    
    // Now fetch the actual content to check its format
    const contentResponse = await fetch(new URL(proxyUrl, request.nextUrl.origin));
    const contentType = contentResponse.headers.get('content-type');
    const contentLength = contentResponse.headers.get('content-length');
    
    // Check the first bytes to see if it looks like a PDF
    const buffer = await contentResponse.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const signature = String.fromCharCode(...bytes.slice(0, 8));
    const isPDF = signature.startsWith('%PDF-');
    
    // Get basic summary of the content
    let summary = '';
    if (isPDF) {
      summary = 'Valid PDF signature detected';
    } else {
      // Check if it's text
      const decoder = new TextDecoder();
      summary = decoder.decode(bytes.slice(0, 100)).replace(/\n/g, '\\n').trim();
    }
    
    return NextResponse.json({
      url,
      proxyUrl,
      proxyHeaders,
      contentType,
      contentLength,
      isPDF,
      bytesReceived: bytes.length,
      summary: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      url,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 