import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Home, 
  FolderKanban, 
  Sparkles, 
  Cpu, 
  Terminal, 
  Activity, 
  ShieldCheck, 
  FileText, 
  BookOpen, 
  Settings, 
  LogOut 
} from "lucide-react";

export type NavItemData = {
  id: string;
  title: string;
  icon: React.ElementType;
  badge?: number | string;
  shortcut?: string;
  children?: NavItemData[];
};

export type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

interface GlobalSidebarProps {
  isOpen: boolean;
  activeId: string;
  onSelect: (id: string) => void;
  activeWorkspace: string;
  onSelectWorkspace: (ws: string) => void;
  projects: any[];
  designs: any[];
  activeProject: any;
}

function WorkspaceSwitcher({ 
  selected, 
  onSelect 
}: { 
  selected: string; 
  onSelect: (ws: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-2.5 py-2 mb-4 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors select-none group border border-slate-200 bg-slate-55"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[6px] bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-[13px] shadow-sm">
            {selected.charAt(0)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[13px] font-bold leading-none mb-1 text-slate-800 truncate max-w-[120px]">{selected}</span>
            <span className="text-[10px] text-primary font-sans font-bold leading-none uppercase tracking-wider">Pro Edition</span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" strokeWidth={1.5} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[52px] left-0 w-full bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
            {['Acme Semiconductor', 'Personal Workspace', 'Client Sandbox'].map(ws => (
              <div 
                key={ws}
                onClick={() => { onSelect(ws); setIsOpen(false); }}
                className={`px-3 py-2 mx-1 text-xs rounded-md cursor-pointer transition-colors ${selected === ws ? 'bg-primary/10 text-primary font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                {ws}
              </div>
            ))}
            <div className="h-px bg-slate-200 my-1 mx-2" />
            <div className="px-3 py-2 mx-1 text-xs text-slate-500 hover:bg-slate-50 rounded-md cursor-pointer flex items-center gap-2 transition-colors">
              <span className="text-sm leading-none mb-0.5">+</span> Create Workspace
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NavItemComponent({ 
  item, 
  activeId, 
  onSelect,
  level = 0
}: { 
  item: NavItemData; 
  activeId: string; 
  onSelect: (id: string) => void;
  level?: number;
}) {
  const isActive = activeId === item.id || (item.children && item.children.some(c => c.id === activeId));
  const hasChildren = !!item.children;
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      onSelect(item.id);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div 
        className={`group flex items-center justify-between px-2.5 py-[7px] rounded-[6px] cursor-pointer transition-all duration-200 select-none
          ${isActive 
            ? 'bg-primary/5 text-primary font-semibold border-l-2 border-primary pl-[8px]' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }
        `}
        style={{ paddingLeft: isActive ? `${level * 12 + 8}px` : `${level * 12 + 10}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2.5">
          <item.icon 
            className={`w-[15px] h-[15px] transition-colors
              ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}
            `} 
            strokeWidth={1.5} 
          />
          <span className="text-xs truncate">
            {item.title}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          {item.shortcut && (
             <kbd className="hidden group-hover:inline-flex items-center justify-center h-4.5 px-1.5 text-[9px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded shadow-sm">
                {item.shortcut}
             </kbd>
          )}
          {item.badge && (
            <span className="flex items-center justify-center min-w-[18px] h-4.5 px-1 text-[8px] font-bold rounded bg-primary/10 text-primary">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight 
              className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} 
              strokeWidth={2}
            />
          )}
        </div>
      </div>

      {hasChildren && (
        <div 
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden min-h-0 relative flex flex-col gap-0.5 mt-0.5">
            <div 
              className="absolute top-0 bottom-0 border-l border-slate-200"
              style={{ left: `${level * 12 + 17.5}px` }}
            />
            {item.children!.map(child => (
              <NavItemComponent 
                key={child.id} 
                item={child} 
                activeId={activeId} 
                onSelect={onSelect} 
                level={level + 1} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function GlobalSidebar({
  isOpen,
  activeId,
  onSelect,
  activeWorkspace,
  onSelectWorkspace,
  projects,
  designs,
  activeProject
}: GlobalSidebarProps) {
  
  const navGroups: NavGroupData[] = [
    {
      items: [
        { id: 'dashboard', title: 'Dashboard', icon: Home },
        { id: 'projects', title: 'Projects', icon: FolderKanban },
        { id: 'ai-design', title: 'AI Design', icon: Sparkles },
        { id: 'schematic', title: 'Schematic', icon: Cpu },
        { id: 'rtl', title: 'RTL', icon: Terminal },
        { id: 'simulation', title: 'Simulation', icon: Activity },
        { id: 'verification', title: 'Verification', icon: ShieldCheck },
        { id: 'reports', title: 'Reports', icon: FileText },
        { id: 'knowledge', title: 'Knowledge', icon: BookOpen },
      ]
    }
  ];

  const bottomItems: NavItemData[] = [
    { id: 'settings', title: 'Settings', icon: Settings, shortcut: '⌘,' },
    { id: 'logout', title: 'Log out', icon: LogOut },
  ];

  return (
    <div 
      className={`h-full border-r border-border bg-card flex flex-col justify-between z-20 shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'w-[260px] opacity-100 p-3' : 'w-0 opacity-0 p-0 border-none'
      }`}
    >
      <div className="flex-1 flex flex-col gap-4 mt-2 overflow-hidden">
        <WorkspaceSwitcher selected={activeWorkspace} onSelect={onSelectWorkspace} />

        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-4">
          {navGroups.map((group, idx) => (
            <div key={idx} className="flex flex-col gap-0.5">
              {group.heading && (
                <span className="px-2.5 mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-sans">
                  {group.heading}
                </span>
              )}
              {group.items.map(item => (
                <NavItemComponent 
                  key={item.id} 
                  item={item} 
                  activeId={activeId} 
                  onSelect={onSelect} 
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border flex flex-col gap-0.5 shrink-0">
        {bottomItems.map(item => (
          <NavItemComponent 
            key={item.id} 
            item={item} 
            activeId={activeId} 
            onSelect={onSelect} 
          />
        ))}
      </div>
    </div>
  );
}
