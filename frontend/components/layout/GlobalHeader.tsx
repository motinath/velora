import React from 'react';
import { PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';

interface GlobalHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeWorkspace: string;
  currentView: string;
  activeProject: any;
  onOpenSearch: () => void;
  isLoggedIn?: boolean;
  onSignInClick?: () => void;
}

export function GlobalHeader({
  isSidebarOpen,
  onToggleSidebar,
  activeWorkspace,
  currentView,
  activeProject,
  onOpenSearch,
  isLoggedIn = true,
  onSignInClick
}: GlobalHeaderProps) {
  return (
    <div className="h-14 border-b border-border flex items-center px-6 justify-between bg-card shrink-0">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <PanelLeftOpen className="w-[18px] h-[18px]" strokeWidth={1.5} />}
        </button>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-sans font-medium">
          <span className="truncate">{activeWorkspace}</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-800 truncate uppercase">
            {currentView === "overview" ? "Projects" : currentView}
          </span>
          {activeProject && (currentView === "overview" || currentView === "workspace") && (
            <>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-primary truncate">{activeProject.name}</span>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div 
          onClick={onOpenSearch}
          className="w-48 h-8 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 flex items-center justify-between text-[11px] text-slate-500 cursor-pointer transition select-none"
        >
          <div className="flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search...</span>
          </div>
          <kbd className="text-[9px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">⌘K</kbd>
        </div>
        {isLoggedIn ? (
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-sm shrink-0 select-none">
            ME
          </div>
        ) : (
          <button 
            onClick={onSignInClick}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
}
