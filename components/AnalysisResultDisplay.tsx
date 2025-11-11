import React from 'react';
import { AnalysisResult, PageContent, KeyPointWithSource } from '../types';
import { BookOpen, FileText } from 'lucide-react';

const AnalysisResultDisplay: React.FC<{
  result: AnalysisResult;
  pageContents: PageContent[]; // Kept for potential future use, but not directly used for modal anymore
  onPointSelect: (point: KeyPointWithSource) => void;
  isHighlighting: boolean;
}> = ({ result, onPointSelect, isHighlighting }) => {

  return (
    <div>
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
              className={`p-4 border border-border rounded-lg shadow-sm transition-all duration-300 ${isHighlighting ? 'opacity-50 cursor-default' : 'hover:shadow-md hover:border-primary cursor-pointer'}`}
              onClick={() => !isHighlighting && onPointSelect(item)}
              role="button"
              tabIndex={isHighlighting ? -1 : 0}
              onKeyPress={(e) => !isHighlighting && e.key === 'Enter' && onPointSelect(item)}
              aria-disabled={isHighlighting}
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
