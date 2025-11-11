// IMPORTANT: pdf.js can be large. For a production app, it's better to
// perform PDF parsing on a backend server. This is a client-side
// implementation for the MVP as requested.
import * as pdfjs from 'pdfjs-dist/build/pdf';
import { PageContent } from '../types';

export const extractTextFromPdf = async (file: File): Promise<PageContent[]> => {
  // Lazily initialize the worker inside the function to prevent top-level errors
  // that can crash the entire application on startup.
  pdfjs.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@5.4.394/build/pdf.worker.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjs.getDocument(arrayBuffer);
  const pdf = await loadingTask.promise;

  const pagesContent: PageContent[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
    pagesContent.push({
      pageNumber: i,
      content: pageText,
    });
  }

  return pagesContent;
};