import React, { useState } from 'react';
import { AnalysisResult, PageContent, KeyPointWithSource } from '../types';
import { BookOpen, FileText, X } from 'lucide-react';

// Modal component for displaying page content
const SourceModal: React.FC<{
  pageContent: PageContent | undefined;
  onClose: () => void;
}> = ({ pageContent, onClose }) => {
  if (!pageContent) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-lg text-slate-800">Source: Page {pageContent.pageNumber}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {pageContent.content}
          </p>
        </div>
      </div>
    </div>
  );
};

const AnalysisResultDisplay: React.FC<{ result: AnalysisResult; pageContents: PageContent[] }> = ({ result, pageContents }) => {
  const [modalPage, setModalPage] = useState<number | null>(null);

  const handlePointClick = (pageNumber: number) => {
    setModalPage(pageNumber);
  };

  const currentModalContent = pageContents.find(p => p.pageNumber === modalPage);

  return (
    <div>
        {modalPage && <SourceModal pageContent={currentModalContent} onClose={() => setModalPage(null)} />}

        {/* Summary Section */}
        <div className="mb-8">
            <h3 className="flex items-center text-xl font-bold text-slate-800 mb-3">
                <BookOpen className="h-6 w-6 mr-3 text-primary" />
                AI Summary
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-md">{result.summary}</p>
        </div>

        {/* Key Points Section */}
        <div className="mb-8">
            <h3 className="flex items-center text-xl font-bold text-slate-800 mb-4">
                <FileText className="h-6 w-6 mr-3 text-primary" />
                Key Points & Analysis
            </h3>
            <div className="space-y-6">
                {result.keyPoints.map((item, index) => (
                    <div 
                        key={index} 
                        className="p-4 border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handlePointClick(item.pageNumber)}
                    >
                        <p className="text-sm font-semibold text-slate-800 mb-2">Paraphrased Point:</p>
                        <p className="text-sm text-slate-700 mb-3">
                          {item.paraphrasedPoint}
                          <span className="text-primary font-semibold ml-2">{item.inTextCitation}</span>
                        </p>
                        
                        <div className="border-t border-dashed border-border pt-3">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">Original Text (p. {item.pageNumber}):</p>
                             <blockquote className="text-sm text-slate-600 italic border-l-4 border-slate-200 pl-3">
                               "{item.originalPoint}"
                            </blockquote>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        {/* APA Reference Section */}
        <div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">APA 7 Reference</h3>
            <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-md font-mono">{result.apaReference}</p>
        </div>
    </div>
  );
};

export default AnalysisResultDisplay;