import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjs from 'pdfjs-dist/build/pdf';
import { PDFDocumentProxy, PDFPageProxy, PDFPageViewport } from 'pdfjs-dist';
import { HighlightRect } from '../types';
import { Loader2, AlertTriangle } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@5.4.394/build/pdf.worker.mjs`;

interface PdfViewerProps {
  file: File;
  onDocumentLoad: (doc: PDFDocumentProxy) => void;
  highlight: { page: number; rects: HighlightRect[] } | null;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ file, onDocumentLoad, highlight }) => {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageViewports, setPageViewports] = useState<Map<number, PDFPageViewport>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument(arrayBuffer);
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        onDocumentLoad(doc);
        
        const viewportPromises: Promise<void>[] = [];
        const newViewports = new Map<number, PDFPageViewport>();
        for (let i = 1; i <= doc.numPages; i++) {
            viewportPromises.push(
                doc.getPage(i).then(page => {
                    newViewports.set(i, page.getViewport({ scale: 1 }));
                })
            );
        }
        await Promise.all(viewportPromises);
        setPageViewports(newViewports);

      } catch (e) {
        console.error("Failed to load PDF", e);
        setError("Could not load the PDF file. It may be corrupted or unsupported.");
      }
    };
    loadPdf();

    return () => { // Cleanup
        setPdfDoc(null);
        setError(null);
        setPageViewports(new Map());
    }
  }, [file, onDocumentLoad]);

  useEffect(() => {
    if (highlight && pdfDoc) {
      const pageElement = pageRefs.current.get(highlight.page);
      pageElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlight, pdfDoc]);

  const renderPage = useCallback(async (page: PDFPageProxy, canvas: HTMLCanvasElement) => {
    const scale = 2; // Render at a higher resolution for clarity
    const viewport = page.getViewport({ scale });
    const context = canvas.getContext('2d');
    if (!context) return;
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.style.width = "100%";
    canvas.style.height = "auto";

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    await page.render(renderContext).promise;
  }, []);

  const observerCallback = useCallback((entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const pageNum = parseInt(entry.target.getAttribute('data-page-number')!, 10);
        const canvas = entry.target.querySelector('canvas');
        if (pdfDoc && canvas && !canvas.getAttribute('data-rendered')) {
          pdfDoc.getPage(pageNum).then(page => {
            renderPage(page, canvas);
            canvas.setAttribute('data-rendered', 'true');
          });
          observer.unobserve(entry.target);
        }
      }
    });
  }, [pdfDoc, renderPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, { root: containerRef.current, threshold: 0.1 });
    const pageElements = Array.from(pageRefs.current.values());
    // FIX: The type checker was inferring `el` as `unknown`. Adding `instanceof Element` as a type guard to satisfy the compiler.
    pageElements.forEach(el => {
      if (el instanceof Element) {
        observer.observe(el);
      }
    });
    return () => {
      // FIX: The type checker was inferring `el` as `unknown`. Adding `instanceof Element` as a type guard to satisfy the compiler.
      pageElements.forEach(el => {
        if (el instanceof Element) {
          observer.unobserve(el);
        }
      });
    };
  }, [pdfDoc, observerCallback]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-red-50">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="font-semibold text-red-800">PDF Load Error</h3>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!pdfDoc) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full overflow-y-auto bg-slate-200 p-4">
      {Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1).map(pageNumber => {
        const viewport = pageViewports.get(pageNumber);
        return (
          <div
            key={pageNumber}
            ref={el => el ? pageRefs.current.set(pageNumber, el) : pageRefs.current.delete(pageNumber)}
            data-page-number={pageNumber}
            className="relative mx-auto mb-4 bg-white shadow-lg"
            style={{ width: '100%' }}
          >
            <canvas />
            {highlight?.page === pageNumber && viewport && (
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {highlight.rects.map((rect, index) => (
                  <div
                    key={index}
                    className="absolute bg-yellow-400 bg-opacity-50"
                    style={{
                      left: `${(rect.x / viewport.width) * 100}%`,
                      top: `${(rect.y / viewport.height) * 100}%`,
                      width: `${(rect.width / viewport.width) * 100}%`,
                      height: `${(rect.height / viewport.height) * 100}%`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PdfViewer;