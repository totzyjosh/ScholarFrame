import React from 'react';
import { GraduationCap, FileScan, Compass, Library, User, Loader2 } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isOpenOnMobile: boolean;
  onCloseMobileMenu: () => void;
  ongoingAnalysesCount: number;
}

const NavItem: React.FC<{
  view: AppView;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  icon: React.ElementType;
  label: string;
  indicator?: React.ReactNode;
}> = ({ view, currentView, onNavigate, icon: Icon, label, indicator }) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={() => onNavigate(view)}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-primary text-white'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon className="h-5 w-5 mr-3" />
      <span className="flex-1 text-left">{label}</span>
      {indicator}
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpenOnMobile, onCloseMobileMenu, ongoingAnalysesCount }) => {
  return (
    <>
    {/* Mobile Overlay */}
    {isOpenOnMobile && (
        <div 
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={onCloseMobileMenu}
            aria-hidden="true"
        ></div>
    )}

    <aside className={`fixed top-0 left-0 w-64 h-full bg-white border-r border-border z-40 transform transition-transform lg:translate-x-0 ${isOpenOnMobile ? 'translate-x-0' : '-translate-x-full'}`}>
      <button onClick={() => onNavigate('explore')} className="flex items-center gap-3 p-6 border-b border-border w-full text-left hover:bg-slate-50 transition-colors">
        <GraduationCap className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-slate-logo">ScholarFrame</h1>
      </button>      <nav className="flex-1 p-4 space-y-2">
        <NavItem
          view="explore"
          currentView={currentView}
          onNavigate={onNavigate}
          icon={Compass}
          label="Explore"
        />
        <NavItem
          view="pdf"
          currentView={currentView}
          onNavigate={onNavigate}
          icon={FileScan}
          label="PDF Analysis"
          indicator={
            ongoingAnalysesCount > 0 ? (
                <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold">{ongoingAnalysesCount}</span>
                    <Loader2 className="h-4 w-4 animate-spin"/>
                </div>
            ) : undefined
          }
        />
        <NavItem
          view="library"
          currentView={currentView}
          onNavigate={onNavigate}
          icon={Library}
          label="Library"
        />
        <NavItem
          view="profile"
          currentView={currentView}
          onNavigate={onNavigate}
          icon={User}
          label="Profile"
        />
      </nav>
      <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
              &copy; 2024 ScholarFrame.
          </p>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
