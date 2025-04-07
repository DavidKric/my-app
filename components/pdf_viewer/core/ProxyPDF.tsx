'use client';

import React, { useEffect, useState } from 'react';

/**
 * This utility makes external PDFs available through a data URL or local proxy
 * to avoid CORS issues when loading external PDFs directly
 */
export async function getProxiedPdfUrl(externalUrl: string): Promise<string> {
  try {
    // If running in the browser, convert to data URL
    if (typeof window !== 'undefined') {
      console.log('Fetching PDF from external URL:', externalUrl);

      // First try direct loading, which may work for CORS-enabled sources
      try {
        // Create a temporary link to test if the URL is directly accessible
        const testLink = document.createElement('a');
        testLink.href = externalUrl;
        // If the origin is the same or the server has CORS enabled, this might work
        if (testLink.origin === window.location.origin || testLink.hostname === 'aclanthology.org') {
          console.log('URL appears directly accessible, returning as-is');
          return externalUrl;
        }
      } catch (e) {
        console.log('URL not directly accessible, trying proxy approach');
      }

      // For ACL Anthology papers specifically, which are known to work
      if (externalUrl.includes('aclanthology.org')) {
        console.log('Using ACL Anthology URL directly as it allows CORS');
        return externalUrl;
      }
      
      // For other sources, attempt to proxy
      console.log('Using a CORS proxy to access the PDF');
      // You can implement a server route or use a public CORS proxy 
      // This is an example using a public proxy - replace with your own in production
      return `https://corsproxy.io/?${encodeURIComponent(externalUrl)}`;
    }

    // If running on server side, return the original URL as Server Components
    // won't have CORS issues when fetching
    return externalUrl;
  } catch (error) {
    console.error('Error proxying PDF URL:', error);
    return externalUrl;
  }
} 