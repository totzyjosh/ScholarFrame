import React, { useState, useEffect } from 'react';
import { SearchResult } from '../types';
import { getPapersByIds } from '../services/academicSearchService';
import PaperCard from './PaperCard';
import { Library, Loader2 } from 'lucide-react';

const LibraryView: React.FC<{
    bookmarkedIds: Set<string>;
    onToggleBookmark: (id: string) => void;
}> = ({ bookmarkedIds, onToggleBookmark }) => {
    const [papers, setPapers] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBookmarkedPapers = async () => {
            setIsLoading(true);
            if (bookmarkedIds.size > 0) {
                const results = await getPapersByIds(bookmarkedIds);
                setPapers(results);
            } else {
                setPapers([]);
            }
            setIsLoading(false);
        };

        fetchBookmarkedPapers();
    }, [bookmarkedIds]);

    return (
        <div className="h-full w-full p-4 sm:p-8 overflow-y-auto bg-slate-50">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 flex items-center gap-4">
                    <Library className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-logo">My Library</h1>
                        <p className="text-muted-foreground">Your saved papers and collections.</p>
                    </div>
                </header>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                ) : papers.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {papers.map(paper => 
                            <PaperCard 
                                key={paper.id} 
                                paper={paper} 
                                isBookmarked={bookmarkedIds.has(paper.id)}
                                onToggleBookmark={onToggleBookmark}
                            />
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary-light mb-6 mx-auto">
                           <Library className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-logo mb-2">Your library is empty.</h2>
                        <p className="max-w-md mx-auto text-muted-foreground">
                            Head over to Explore to discover and bookmark papers to save them here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibraryView;