import path from 'path';

// Map file IDs to actual file paths
// In a real application, this would be connected to a database
// or file system that stores the actual PDFs
export function getFilePathFromId(fileId: string): string {
  // This mapping is used in the demo environment
  const fileMap: Record<string, string> = {
    'file-interrogatories': '/sample-pdfs/interrogatories.pdf',
    'file-complaint': '/sample-pdfs/complaint.pdf',
    'file-answer': '/sample-pdfs/answer.pdf',
    'file-contract': '/sample-pdfs/contract.pdf',
  };

  // If we have a direct mapping, use it
  if (fileMap[fileId]) {
    return fileMap[fileId];
  }

  // Otherwise try to construct a path based on ID
  // This is a fallback mechanism
  return `/sample-pdfs/${fileId.replace('file-', '')}.pdf`;
}

// Check if a file exists and provide a fallback if it doesn't
export function getFileUrlWithFallback(fileId: string): string {
  const filePath = getFilePathFromId(fileId);
  
  // In a browser environment, we can't easily check if a file exists
  // before trying to load it, so we'll return the path and let the
  // PDF viewer component handle errors
  return filePath;
}

// For the demo, we'll use this external PDF as a fallback
export const DEFAULT_PDF_URL = 'https://aclanthology.org/2023.emnlp-demo.45.pdf'; 