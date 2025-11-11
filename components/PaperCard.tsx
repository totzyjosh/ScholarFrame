import React from 'react';
import { SearchResult } from '../types';
import { Bookmark, ExternalLink } from 'lucide-react';

const PaperCard: React.FC<{ 
    paper: SearchResult;
    isBookmarked: boolean;
    onToggleBookmark: (id: string) => void;
}> = ({ paper, isBookmarked, onToggleBookmark }) => (
    <div className="bg-white p-6 rounded-lg border border-border shadow-sm transition-shadow hover:shadow-md">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-slate-800 flex-1 pr-4">{paper.title}</h3>
            <button 
                onClick={() => onToggleBookmark(paper.id)}
                className={`p-1 rounded-md transition-colors ${
                    isBookmarked 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:bg-slate-100 hover:text-primary'
                }`}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
                <Bookmark className="h-5 w-5" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{paper.authors.join(', ')}</p>
        <p className="text-sm text-slate-700 mb-4 line-clamp-3">{paper.abstract}</p>
        <div className="flex items-center text-xs text-muted-foreground mb-4">
             {paper.category && <span className="inline-block bg-primary-light text-primary font-medium px-2 py-1 rounded-full mr-3">{paper.category}</span>}
            {paper.journal && <span>{paper.journal}</span>}
            {paper.publicationYear && <span className="mx-1.5">&bull;</span>}
            {paper.publicationYear && <span>{paper.publicationYear}</span>}
        </div>
        <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-slate-700">{paper.citationCount?.toLocaleString() ?? 0} citations</span>
            {paper.sourceUrl && (
                <a href={paper.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center font-semibold text-primary hover:underline">
                    Read more <ExternalLink className="h-4 w-4 ml-1" />
                </a>
            )}
        </div>
    </div>
);

export default PaperCard;