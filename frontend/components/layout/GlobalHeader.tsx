import React from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

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
          {currentView !== "projects" && (
            <span className="font-bold text-slate-850 truncate uppercase">
              {currentView === "overview" ? "Projects" : currentView}
            </span>
          )}
          {activeProject && (currentView === "overview" || currentView === "workspace") && (
            <>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-primary truncate">{activeProject.name}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search and Profile Avatar removed on user request */}
      </div>
    </div>
  );
}
