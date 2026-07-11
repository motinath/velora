"use client";

import React from "react";
import { useAppContext } from "../../app/providers";
import { 
  Plus, 
  ChevronRight, 
  Sparkles, 
  Cpu, 
  FileCode, 
  Activity, 
  CheckCircle, 
  BarChart2, 
  BookOpen, 
  Settings 
} from "lucide-react";

export function ProjectsView() {
  const {
    projects,
    searchQuery,
    setSearchQuery,
    handleSelectProject,
    handleSelect,
    setShowNewModal,
    checkAuthAndRun,
    handleDeleteProject
  } = useAppContext();

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.design_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-6 bg-background">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 font-sans">Projects</h1>
          <p className="text-xs text-slate-500 mt-1">Manage and access your semiconductor repositories.</p>
        </div>
        <button
          onClick={() => checkAuthAndRun(() => setShowNewModal(true))}
          className="bg-slate-100 hover:bg-slate-200 text-primary border border-border text-xs font-bold uppercase px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-md bg-card border border-border rounded-xl flex items-center px-3 py-1 shadow-sm">
        <span className="text-slate-400 text-[10px] mr-2 font-bold font-sans">SEARCH:</span>
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-xs text-slate-800 outline-none py-2 font-mono"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600 text-xs font-sans">
            ✕
          </button>
        )}
      </div>

      {/* List of projects */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-xl shadow-sm">
          <p className="text-xs text-slate-500">No projects found matching query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                handleSelectProject(p);
                handleSelect("proj-" + p.id);
              }}
              className="p-5 bg-card border border-border hover:border-primary/50 rounded-xl cursor-pointer transition relative group flex flex-col justify-between h-[150px] shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xs font-bold text-slate-800 group-hover:text-primary truncate pr-6 font-sans">{p.name}</h3>
                  {p.id !== -1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        checkAuthAndRun(() => handleDeleteProject(p.id));
                      }}
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-rose-600 absolute right-4 top-4 transition"
                      title="Delete Project"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="flex gap-2 mb-3">
                  <span className="bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded text-[8px] text-primary font-bold uppercase">{p.technology}</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[8px] text-slate-600 uppercase font-semibold">{p.design_type}</span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{p.description || "No description."}</p>
              </div>
              <div className="text-[8px] text-slate-500 font-mono flex justify-between items-center border-t border-slate-100 pt-2.5 mt-2">
                <span>CREATED: {p.id === -1 ? "N/A" : new Date(p.created_at || Date.now()).toLocaleDateString()}</span>
                <span className="text-primary opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5 uppercase font-bold text-[9px]">
                  Open Overview <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectOverviewView() {
  const {
    activeProject,
    handleSelect
  } = useAppContext();

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-slate-500 text-xs font-sans">
        Select a project from the sidebar to view details.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-8 bg-background font-sans">
      {/* Breadcrumb Header */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => handleSelect("projects")}
            className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer font-bold uppercase flex items-center gap-1 transition"
          >
            ← Projects
          </div>
          <span className="text-slate-300">/</span>
          <h1 className="text-lg font-bold tracking-tight text-slate-800 font-sans uppercase">{activeProject.name} Dashboard</h1>
        </div>
        
        <div className="flex gap-2 text-xs font-mono">
          <span className="bg-blue-50 border border-blue-100 px-2.5 py-1 rounded text-primary font-bold uppercase">{activeProject.technology}</span>
          <span className="bg-slate-100 px-2.5 py-1 rounded text-slate-700 font-bold uppercase">{activeProject.design_type}</span>
        </div>
      </div>

      {/* Project description card */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Project Description</h2>
        <p className="text-xs text-slate-600 leading-relaxed font-sans">{activeProject.description || "No project description provided. Use AI Design or Schematic editor to generate content."}</p>
      </div>

      {/* Choose Your Task section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">Choose Your Task</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Task 1: AI Design */}
          <div 
            onClick={() => handleSelect("ai-design")}
            className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-primary/50 cursor-pointer transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase group-hover:text-primary transition font-sans">AI Design</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-sans leading-relaxed">Specify constraints and auto-generate circuit layouts.</p>
          </div>

          {/* Task 2: Schematic */}
          <div 
            onClick={() => handleSelect("schematic")}
            className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-purple-600/50 cursor-pointer transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase group-hover:text-purple-600 transition font-sans">Schematic</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-sans leading-relaxed">Edit transistor channel dimensions visually on canvas.</p>
          </div>

          {/* Task 3: RTL */}
          <div 
            onClick={() => handleSelect("rtl")}
            className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-amber-500/50 cursor-pointer transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
              <FileCode className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-xs font-bold text-slate-805 uppercase group-hover:text-amber-500 transition font-sans">RTL Workspace</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-sans leading-relaxed">Edit logic description files and inspect Verilog outputs.</p>
          </div>

          {/* Task 4: Simulation */}
          <div 
            onClick={() => handleSelect("simulation")}
            className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-emerald-500/50 cursor-pointer transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <Activity className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-xs font-bold text-slate-850 uppercase group-hover:text-emerald-500 transition font-sans">Simulation</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-sans leading-relaxed">Plot logic node voltage transient waveforms sweeps.</p>
          </div>

          {/* Task 5: Verification */}
          <div 
            onClick={() => handleSelect("verification")}
            className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-indigo-600/50 cursor-pointer transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-xs font-bold text-slate-850 uppercase group-hover:text-indigo-600 transition font-sans">Verification</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-sans leading-relaxed">Run DRC, LVS, timing slack, and power drop layout checkouts.</p>
          </div>

          {/* Task 6: Reports */}
          <div 
            onClick={() => handleSelect("reports")}
            className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-rose-500/50 cursor-pointer transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-4">
              <BarChart2 className="w-5 h-5 text-rose-505" />
            </div>
            <h3 className="text-xs font-bold text-slate-850 uppercase group-hover:text-rose-505 transition font-sans">Reports</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-sans leading-relaxed">Check Tapeout aggregate margins readiness score indexes.</p>
          </div>

          {/* Task 7: Knowledge */}
          <div 
            onClick={() => handleSelect("knowledge")}
            className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-slate-500/50 cursor-pointer transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5 text-slate-650" />
            </div>
            <h3 className="text-xs font-bold text-slate-850 uppercase group-hover:text-slate-650 transition font-sans">Knowledge Graph</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-sans leading-relaxed">Search primitives PDK standard libraries database references.</p>
          </div>

          {/* Task 8: Settings */}
          <div 
            onClick={() => handleSelect("settings")}
            className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-zinc-500/50 cursor-pointer transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-4">
              <Settings className="w-5 h-5 text-zinc-650" />
            </div>
            <h3 className="text-xs font-bold text-slate-850 uppercase group-hover:text-zinc-650 transition font-sans">Settings</h3>
            <p className="text-[10px] text-slate-500 mt-1 font-sans leading-relaxed">Tune active LLM provider endpoints router and model fallbacks.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
