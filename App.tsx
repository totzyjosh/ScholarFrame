import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import BottomNavBar from './components/BottomNavBar';
import PdfAnalysisView from './components/PdfAnalysisView';
import ExploreView from './components/ExploreView';
import { AppView, AnalysisSession, PageContent, AnalysisResult } from './types';
import LibraryView from './components/LibraryView';
import PlaceholderView from './components/PlaceholderView';
import { User } from 'lucide-react';
import { extractTextFromPdf } from './services/pdfService';
import { analyzePdfText } from './services/llmService';


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('explore');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [analysisSessions, setAnalysisSessions] = useState<AnalysisSession[]>([]);

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const item = window.localStorage.getItem('bookmarkedPaperIds');
      return item ? new Set(JSON.parse(item)) : new Set();
    } catch (error) {
      console.error("Failed to load bookmarks from localStorage", error);
      return new Set();
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('bookmarkedPaperIds', JSON.stringify(Array.from(bookmarkedIds)));
    } catch (error) {
      console.error("Failed to save bookmarks to localStorage", error);
    }
  }, [bookmarkedIds]);

  const handleToggleBookmark = (paperId: string) => {
    setBookmarkedIds(prevIds => {
      const newIds = new Set(prevIds);
      if (newIds.has(paperId)) {
        newIds.delete(paperId);
      } else {
        newIds.add(paperId);
      }
      return newIds;
    });
  };

  const handleStartAnalysis = async (file: File, framework: string) => {
    const newSession: AnalysisSession = {
        id: `session_${Date.now()}`,
        file,
        fileName: file.name,
        framework,
        status: 'loading',
        createdAt: new Date().toISOString(),
    };

    setAnalysisSessions(prev => [newSession, ...prev]);

    try {
        const extractedPages = await extractTextFromPdf(file);
        const analysis = await analyzePdfText(extractedPages, framework);
        setAnalysisSessions(prev => prev.map(s => s.id === newSession.id
            ? { ...s, status: 'completed', result: analysis, pageContents: extractedPages }
            : s
        ));
    } catch (err) {
        console.error("PDF Analysis failed:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setAnalysisSessions(prev => prev.map(s => s.id === newSession.id
            ? { ...s, status: 'error', error: `Failed to analyze the PDF. ${errorMessage}` }
            : s
        ));
    }
  };
  
  const ongoingAnalysesCount = analysisSessions.filter(s => s.status === 'loading').length;


  const renderView = () => {
    switch (currentView) {
      case 'pdf':
        return <PdfAnalysisView 
                  sessions={analysisSessions} 
                  onStartAnalysis={handleStartAnalysis}
                  onSessionSelect={() => setMobileMenuOpen(false)}
               />;
      case 'library':
        return <LibraryView 
                  bookmarkedIds={bookmarkedIds} 
                  onToggleBookmark={handleToggleBookmark} 
               />;
      case 'profile':
         return <PlaceholderView icon={User} title="Profile" message="User profiles and settings are coming soon."/>;
      case 'explore':
      default:
        return <ExploreView bookmarkedIds={bookmarkedIds} onToggleBookmark={handleToggleBookmark} />;
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        isOpenOnMobile={isMobileMenuOpen} 
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        ongoingAnalysesCount={ongoingAnalysesCount}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:ml-64">
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          {renderView()}
        </main>
        <BottomNavBar 
          currentView={currentView} 
          onNavigate={setCurrentView} 
          ongoingAnalysesCount={ongoingAnalysesCount}
        />
      </div>
    </div>
  );
};

// FIX: An export assignment cannot have modifiers. `export export` is a syntax error.
export default App;