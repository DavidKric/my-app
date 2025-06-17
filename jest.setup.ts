// Jest setup for TypeScript and Next.js App Router API testing

// Mock environment variables for testing
if (!process.env.DOCLING_SERVE_URL) {
  process.env.DOCLING_SERVE_URL = 'http://localhost:5001';
} 