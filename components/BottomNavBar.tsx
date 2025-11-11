import React from 'react';
import { FileScan, Compass, Library, User } from 'lucide-react';
import { AppView } from '../types';

interface BottomNavBarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const NavItem: React.FC<{
  view: AppView;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  icon: React.ElementType;
  label: string;
}> = ({ view, currentView, onNavigate, icon: Icon, label }) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={() => onNavigate(view)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors ${
        isActive ? 'text-primary' : 'text-slate-500'
      }`}
    >
      <Icon className={`h-6 w-6 mb-1 ${isActive ? 'text-primary' : ''}`} />
      <span>{label}</span>
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onNavigate }) => {
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