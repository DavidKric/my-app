// This file is kept only for Next.js middleware typing
// The PDF worker interception is now handled directly in lib/pdf-setup.ts

import { NextRequest, NextResponse } from 'next/server';

// This is a no-op middleware
export function middleware(request: NextRequest) {
  // Pass through all requests - PDF worker handling is done client-side
  return NextResponse.next();
}

// This config is no longer used but kept for reference
export const config = {
  matcher: [
    // No paths need to be matched anymore
  ],
}; 