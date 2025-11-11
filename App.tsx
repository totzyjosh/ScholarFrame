import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import BottomNavBar from './components/BottomNavBar';
import PdfAnalysisView from './components/PdfAnalysisView';
import ExploreView from './components/ExploreView';
import { AppView } from './types';
import LibraryView from './components/LibraryView';
import PlaceholderView from './components/PlaceholderView';
import { User } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('explore');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    // FIX: Added curly braces to the catch block to fix a syntax error.
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

  const renderView = () => {
    switch (currentView) {
      case 'pdf':
        return <PdfAnalysisView />;
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
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:ml-64">
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          {renderView()}
        </main>
        <BottomNavBar currentView={currentView} onNavigate={setCurrentView} />
      </div>
    </div>
  );
};

export default App;