import React from 'react';
import {
  Home,
  FolderKanban,
  Sparkles,
  Cpu,
  Library,
  Terminal,
  Activity,
  ShieldCheck,
  FileText,
  BookOpen,
  Settings,
  LogOut,
  TrendingUp
} from "lucide-react";

export type NavItemData = {
  id: string;
  title: string;
  icon: React.ElementType;
};

export type NavGroupData = {
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

function VeloraLogo() {
  return (
    <div className="flex items-center gap-3 px-3 py-4 mb-4 select-none">
      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/10 border border-blue-500/20">
        <Cpu className="w-5 h-5" strokeWidth={2} />
      </div>
      <div className="flex flex-col">
        <span className="text-[16px] font-extrabold tracking-tight text-blue-600 font-sans leading-none uppercase">
          VELORA
        </span>
      </div>
    </div>
  );
}

function NavItemComponent({
  item,
  activeId,
  onSelect
}: {
  item: NavItemData;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const isActive = activeId === item.id ||
    (item.id === 'projects' && (activeId === 'projects-all' || activeId === 'projects-recent' || activeId === 'projects-templates' || activeId === 'overview')) ||
    (item.id === 'ai-design' && (activeId === 'ai-chat' || activeId === 'ai-history')) ||
    (item.id === 'schematic' && activeId === 'schematic-editor') ||
    (item.id === 'rtl' && activeId === 'rtl-studio') ||
    (item.id === 'knowledge' && activeId === 'knowledge-hub');

  return (
    <div
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 select-none font-sans font-medium text-sm
        ${isActive
          ? 'bg-blue-50 text-blue-600 font-bold'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }
      `}
      onClick={() => onSelect(item.id)}
    >
      <item.icon
        className={`w-5 h-5 shrink-0 transition-colors
          ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}
        `}
        strokeWidth={1.75}
      />
      <span className="truncate">{item.title}</span>
    </div>
  );
}

export function GlobalSidebar({
  isOpen,
  activeId,
  onSelect
}: GlobalSidebarProps) {

  const navItems: NavItemData[] = [
    { id: 'dashboard', title: 'Dashboard', icon: Home },
    { id: 'projects', title: 'Projects', icon: FolderKanban },
    { id: 'ai-design', title: 'AI Design', icon: Sparkles },
    { id: 'schematic', title: 'Schematic', icon: Cpu },
    { id: 'library', title: 'Component Library', icon: Library },
    { id: 'rtl', title: 'RTL', icon: Terminal },
    { id: 'simulation', title: 'Simulation', icon: Activity },
    { id: 'verification', title: 'Verification', icon: ShieldCheck },
    { id: 'reports', title: 'Reports', icon: FileText },
    { id: 'analysis', title: 'Analysis', icon: TrendingUp },
    { id: 'knowledge', title: 'Knowledge', icon: BookOpen }
  ];

  const bottomItems: NavItemData[] = [
    { id: 'settings', title: 'Settings', icon: Settings }
  ];

  return (
    <div
      className={`h-full border-r border-slate-100 bg-white flex flex-col justify-between z-20 shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'w-[260px] opacity-100 p-4' : 'w-0 opacity-0 p-0 border-none'
        }`}
    >
      <div className="flex-1 flex flex-col gap-2 overflow-hidden">
        <VeloraLogo />

        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-1">
          {navItems.map(item => (
            <NavItemComponent
              key={item.id}
              item={item}
              activeId={activeId}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-1 shrink-0">
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
