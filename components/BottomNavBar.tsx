import React from 'react';
import { FileScan, Compass, Library, User, Loader2 } from 'lucide-react';
import { AppView } from '../types';

interface BottomNavBarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  ongoingAnalysesCount: number;
}

const NavItem: React.FC<{
  view: AppView;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  icon: React.ElementType;
  label: string;
  indicator?: boolean;
}> = ({ view, currentView, onNavigate, icon: Icon, label, indicator }) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={() => onNavigate(view)}
      className={`relative flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors ${
        isActive ? 'text-primary' : 'text-slate-500'
      }`}
    >
      <Icon className={`h-6 w-6 mb-1 ${isActive ? 'text-primary' : ''}`} />
      <span>{label}</span>
      {indicator && (
         <div className="absolute top-1 right-1/2 translate-x-4 flex items-center justify-center h-4 w-4">
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
        </div>
      )}
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onNavigate, ongoingAnalysesCount }) => {
  return (
    <nav className="lg:hidden flex justify-around items-center h-16 bg-white border-t border-border fixed bottom-0 w-full z-20">
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
        label="Analyze"
        indicator={ongoingAnalysesCount > 0}
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
  );
};

export default BottomNavBar;
