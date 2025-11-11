import React, { useState, useEffect, useCallback } from 'react';
import { SearchResult } from '../types';
import { searchPapers, getTrendingPapers, getTopPapersByCategory } from '../services/academicSearchService';
import { Loader2, Search, TrendingUp, Atom, Dna, FlaskConical, Stethoscope, Drama, BookOpen } from 'lucide-react';
import PaperCard from './PaperCard';


const categoryData: { [key: string]: { icon: React.ElementType, color: string } } = {
    'Computer Science': { icon: Atom, color: 'text-blue-500' },
    'Medicine': { icon: Stethoscope, color: 'text-red-500' },
    'Physics': { icon: Atom, color: 'text-purple-500' },
    'Biology': { icon: Dna, color: 'text-green-500' },
    'Chemistry': { icon: FlaskConical, color: 'text-orange-500' },
    'Social Science': { icon: BookOpen, color: 'text-yellow-500' },
    'Literature & Arts': { icon: Drama, color: 'text-teal-500' },
};

const ExploreView: React.FC<{
    bookmarkedIds: Set<string>;
    onToggleBookmark: (id: string) => void;
}> = ({ bookmarkedIds, onToggleBookmark }) => {
    const [papers, setPapers] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [title, setTitle] = useState('Trending Research');

    const fetchPapers = useCallback(async (category: string | null = null, query: string | null = null) => {
        setIsLoading(true);
        setError(null);
        try {
            let results: SearchResult[];
            if (query) {
                setTitle(`Search results for "${query}"`);
                results = await searchPapers(query);
            } else if (category) {
                setTitle(`Top Papers in ${category}`);
                results = await getTopPapersByCategory(category);
            } else {
                setTitle('Trending Research');
                results = await getTrendingPapers();
            }
            setPapers(results);
        } catch (e) {
            setError('Failed to fetch papers. Please try again later.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPapers(activeCategory);
    }, [activeCategory, fetchPapers]);
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setActiveCategory(null);
        fetchPapers(null, searchTerm);
    };

    const handleCategoryClick = (category: string) => {
        setSearchTerm('');
        setActiveCategory(category);
    };

    const categories = Object.keys(categoryData);

    return (
        <div className="h-full w-full p-4 sm:p-8 overflow-y-auto bg-slate-50">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-logo">Explore</h1>
                    <p className="text-muted-foreground mt-1">Discover the latest scientific breakthroughs</p>
                </header>
                
                <form onSubmit={handleSearch} className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for papers by keyword..."
                        className="w-full pl-12 pr-4 py-3 border border-border rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                </form>

                <section className="mb-10">
                    <h2 className="text-xl font-bold text-slate-logo mb-4">Categories</h2>
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {categories.map(cat => {
                            const Icon = categoryData[cat].icon;
                            return (
                                <button 
                                    key={cat} 
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`p-4 bg-white border rounded-lg shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:-translate-y-1 ${activeCategory === cat ? 'ring-2 ring-primary' : 'border-border'}`}
                                >
                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-3 bg-opacity-10 ${categoryData[cat].color.replace('text-', 'bg-')}`}>
                                        <Icon className={`h-6 w-6 ${categoryData[cat].color}`} />
                                    </div>
                                    <p className="font-semibold text-sm text-slate-800">{cat}</p>
                                </button>
                            )
                        })}
                    </div>
                </section>
                
                <section>
                    <h2 className="text-xl font-bold text-slate-logo mb-4 flex items-center">
                        <TrendingUp className="h-6 w-6 mr-3 text-primary" />
                        {title}
                    </h2>
                     {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        </div>
                    ) : error ? (
                        <p className="text-center text-red-500 py-20">{error}</p>
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
                        <p className="text-center text-muted-foreground py-20">No papers found.</p>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ExploreView;