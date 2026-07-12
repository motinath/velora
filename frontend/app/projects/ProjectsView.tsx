"use client";

import React, { useState } from "react";
import { useAppContext } from "../../app/providers";
import { 
  Search, 
  Plus, 
  ChevronDown, 
  LayoutGrid, 
  List, 
  Star, 
  MoreVertical, 
  Folder, 
  FileCode, 
  Cpu, 
  Activity,
  Share2,
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  CheckCircle,
  BarChart2,
  BookOpen,
  Settings,
  Sparkles,
  Trash2
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

  // Tab & Filters State
  const [activeTab, setActiveTab] = useState<"all" | "recent" | "starred" | "templates" | "archived">("all");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedTech, setSelectedTech] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedOwner, setSelectedOwner] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("Last Opened");
  const [isGridView, setIsGridView] = useState<boolean>(true);
  const [starredProjects, setStarredProjects] = useState<Record<number, boolean>>({ 1: true });

  const toggleStar = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredProjects(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Helper styles based on project type
  const getTypeStyling = (type: string) => {
    switch (type.toLowerCase()) {
      case "schematic":
      case "6t sram":
        return {
          icon: Folder,
          bgColor: "bg-blue-50 text-blue-600",
          badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
          progressColor: "bg-blue-600"
        };
      case "rtl":
      case "i2c interface":
      case "32-bit alu":
        return {
          icon: FileCode,
          bgColor: "bg-emerald-50 text-emerald-600",
          badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
          progressColor: "bg-emerald-600"
        };
      case "analog":
      case "pll":
      case "12-bit successive approx adc":
        return {
          icon: Activity,
          bgColor: "bg-purple-50 text-purple-600",
          badgeColor: "bg-purple-50 text-purple-600 border-purple-100",
          progressColor: "bg-purple-600"
        };
      case "mixed-signal":
      case "spi controller":
      default:
        return {
          icon: Cpu,
          bgColor: "bg-orange-50 text-orange-655",
          badgeColor: "bg-orange-50 text-orange-655 border-orange-100",
          progressColor: "bg-orange-600"
        };
    }
  };

  const getStatusStyling = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "review":
        return "bg-orange-50 text-orange-655 border-orange-100";
      case "in progress":
      default:
        return "bg-blue-50 text-blue-600 border-blue-100";
    }
  };

  // Filter projects list
  const filteredProjects = projects.filter((p) => {
    // Search match
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technology.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.design_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Tab filters
    if (activeTab === "starred" && !starredProjects[p.id]) return false;
    
    // Dropdown filters
    const typeLabel = p.design_type.toLowerCase();
    if (selectedType !== "All") {
      if (selectedType === "Schematic" && !typeLabel.includes("sram")) return false;
      if (selectedType === "RTL" && !typeLabel.includes("alu") && !typeLabel.includes("i2c")) return false;
      if (selectedType === "Analog" && !typeLabel.includes("pll") && !typeLabel.includes("adc")) return false;
      if (selectedType === "Mixed-Signal" && !typeLabel.includes("spi")) return false;
    }

    if (selectedTech !== "All" && p.technology.toLowerCase() !== selectedTech.toLowerCase()) return false;
    if (selectedStatus !== "All" && (p.status || "In Progress").toLowerCase() !== selectedStatus.toLowerCase()) return false;

    return true;
  });

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#f8fafc] font-sans select-text">
      {/* Top Header Section */}
      <div className="flex justify-between items-center px-8 py-5 bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">Projects</h1>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Custom Search Input */}
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 pl-10 pr-16 py-2.5 rounded-full outline-none font-sans focus:border-blue-500 focus:bg-white transition"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">
              Ctrl + K
            </kbd>
          </div>

          {/* Bell Icon */}
          <button className="relative p-2 text-slate-500 hover:text-slate-800 transition">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 border border-white" />
          </button>

          {/* New Project Button */}
          <button
            onClick={() => checkAuthAndRun(() => setShowNewModal(true))}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
            <ChevronDown className="w-3 h-3 text-blue-250 border-l border-blue-500 pl-1 ml-1" />
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="px-8 bg-white border-b border-slate-100 flex gap-8 text-xs font-semibold text-slate-500 font-sans shrink-0">
        {[
          { id: "all", label: "All Projects" },
          { id: "recent", label: "Recent" },
          { id: "starred", label: "Starred" },
          { id: "templates", label: "Templates" },
          { id: "archived", label: "Archived" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-4 cursor-pointer border-b-2 font-bold transition-all relative ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 font-black"
                : "border-transparent hover:text-slate-805"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Control Bar */}
      <div className="mx-8 mt-6 bg-white border border-slate-150 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm shrink-0">
        <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-700 font-sans font-semibold">
          {/* Inner Search bar */}
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 pl-8 pr-3 py-2 rounded-lg outline-none font-sans focus:border-blue-500 transition"
            />
          </div>

          {/* Types Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent font-bold outline-none text-slate-700 cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Schematic">Schematic</option>
              <option value="RTL">RTL</option>
              <option value="Analog">Analog</option>
              <option value="Mixed-Signal">Mixed-Signal</option>
            </select>
          </div>

          {/* Technologies Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase">Tech:</span>
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="bg-transparent font-bold outline-none text-slate-700 cursor-pointer"
            >
              <option value="All">All Technologies</option>
              <option value="Sky130">Sky130</option>
              <option value="TSMC 65nm">TSMC 65nm</option>
              <option value="GF 180nm">GF 180nm</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-bold outline-none text-slate-700 cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Owner Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase">Owner:</span>
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="bg-transparent font-bold outline-none text-slate-700 cursor-pointer"
            >
              <option value="All">Owned by: All</option>
              <option value="Me">Owned by: Me</option>
              <option value="Shared">Owned by: Shared</option>
            </select>
          </div>
        </div>

        {/* Sort and View Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold">
            <span className="text-[10px] text-slate-400 uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-bold outline-none text-slate-750 cursor-pointer"
            >
              <option>Sort by: Last Opened</option>
              <option>Sort by: Alphabetical</option>
              <option>Sort by: Progress</option>
            </select>
          </div>

          {/* Grid / List Toggles */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden p-0.5 bg-slate-50">
            <button
              onClick={() => setIsGridView(true)}
              className={`p-1.5 rounded-md transition ${
                isGridView ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsGridView(false)}
              className={`p-1.5 rounded-md transition ${
                !isGridView ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid View Display */}
      {isGridView && (
        <div className="px-8 mt-6">
          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-150 rounded-2xl shadow-sm">
              <p className="text-sm font-semibold text-slate-500 font-sans">No projects match the active filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((p) => {
                const style = getTypeStyling(p.design_type);
                const isStarred = starredProjects[p.id] ?? false;
                const IconComponent = style.icon;

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      handleSelectProject(p);
                      handleSelect("proj-" + p.id);
                    }}
                    className="bg-white border border-slate-100 hover:border-blue-300 rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition relative group flex flex-col justify-between h-[180px]"
                  >
                    <div>
                      {/* Top Row: Icon + Title + Actions */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${style.bgColor} flex items-center justify-center shrink-0 shadow-sm`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate pr-6 font-sans">
                              {p.name}
                            </h3>
                            <span className="text-[9px] text-slate-400 font-mono tracking-tight">{p.technology}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => toggleStar(p.id, e)}
                            className="p-1 rounded-md text-slate-350 hover:bg-slate-50 transition"
                          >
                            <Star className={`w-4 h-4 ${isStarred ? "fill-blue-500 text-blue-500" : "text-slate-300"}`} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Are you sure you want to delete this project?")) {
                                handleDeleteProject(p.id);
                              }
                            }}
                            className="p-1 rounded-md text-slate-350 hover:bg-slate-50 hover:text-rose-600 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Middle row: Badges */}
                      <div className="flex gap-2 mb-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border ${style.badgeColor}`}>
                          {p.design_type.includes("SRAM") ? "Schematic" : (p.design_type.includes("ALU") || p.design_type.includes("I2C") ? "RTL" : "Analog")}
                        </span>
                        <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-[9px] text-slate-500 uppercase font-semibold">
                          {p.technology}
                        </span>
                      </div>
                    </div>

                    {/* Bottom row: Progress & Relative time */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-700 font-sans mb-1">
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className={`${style.progressColor} h-full rounded-full`} style={{ width: `${p.progress || 50}%` }} />
                          </div>
                          <span className="pl-3 leading-none text-slate-500">{p.progress || 50}%</span>
                        </div>
                      </div>

                      <div className="text-[9px] text-slate-450 font-mono flex justify-between items-center border-t border-slate-50 pt-2">
                        <span className="flex items-center gap-1">🕒 Opened {p.last_opened || "2 hours ago"}</span>
                        <span className="text-slate-600 flex items-center gap-1 font-sans font-semibold">
                          <User className="w-3.5 h-3.5 p-0.5 bg-slate-100 rounded-full text-slate-500" />
                          Owner
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* All Projects Table List View */}
      <div className="mx-8 mt-8 mb-12 bg-white border border-slate-150 rounded-2xl shadow-sm p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold text-slate-900 font-sans">All Projects</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-sans">
                <th className="pb-3 pl-2">Project Name</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Technology</th>
                <th className="pb-3">Progress</th>
                <th className="pb-3">Last Opened</th>
                <th className="pb-3">Owner</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs font-sans text-slate-700 font-medium">
              {filteredProjects.map((p) => {
                const style = getTypeStyling(p.design_type);
                const isStarred = starredProjects[p.id] ?? false;
                const IconComponent = style.icon;
                const activeTypeLabel = p.design_type.includes("SRAM") ? "Schematic" : (p.design_type.includes("ALU") || p.design_type.includes("I2C") ? "RTL" : "Analog");

                return (
                  <tr
                    key={p.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition cursor-pointer"
                    onClick={() => {
                      handleSelectProject(p);
                      handleSelect("proj-" + p.id);
                    }}
                  >
                    {/* Project Name */}
                    <td className="py-4 pl-2 font-bold text-slate-800 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${style.bgColor} flex items-center justify-center shrink-0`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {isStarred && <Star className="w-3.5 h-3.5 fill-blue-500 text-blue-500 shrink-0" />}
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border ${style.badgeColor}`}>
                        {activeTypeLabel}
                      </span>
                    </td>

                    {/* Technology */}
                    <td className="py-4 text-slate-500 font-semibold">{p.technology}</td>

                    {/* Progress Bar */}
                    <td className="py-4 w-40">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className={`${style.progressColor} h-full rounded-full`} style={{ width: `${p.progress || 50}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold">{p.progress || 50}%</span>
                      </div>
                    </td>

                    {/* Last Opened */}
                    <td className="py-4 text-slate-550 font-semibold">{p.last_opened || "2 hours ago"}</td>

                    {/* Owner */}
                    <td className="py-4 text-slate-550">Me</td>

                    {/* Status Badge */}
                    <td className="py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getStatusStyling(p.status || "In Progress")}`}>
                        {p.status || "In Progress"}
                      </span>
                    </td>

                    {/* Action Panel icons */}
                    <td className="py-4 text-right pr-2">
                      <div className="flex justify-end items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => alert(`Sharing project: ${p.name}`)}
                          className="p-1 rounded text-slate-400 hover:bg-slate-50 hover:text-slate-655 transition"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => toggleStar(p.id, e)}
                          className="p-1 rounded text-slate-400 hover:bg-slate-50 hover:text-slate-655 transition"
                          title="Star"
                        >
                          <Star className={`w-4 h-4 ${isStarred ? "fill-blue-500 text-blue-500" : ""}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Are you sure you want to delete this project?")) {
                              handleDeleteProject(p.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:bg-slate-50 hover:text-rose-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Bar */}
        <div className="flex justify-between items-center border-t border-slate-100 pt-5 mt-4 text-xs font-sans text-slate-500">
          <span>Showing 1 to {filteredProjects.length} of {filteredProjects.length} projects</span>
          <div className="flex items-center gap-1.5 font-bold">
            <button className="p-1.5 border border-slate-205 rounded-lg bg-slate-50 hover:bg-slate-100 transition"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-mono shadow-sm">1</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition font-mono">2</button>
            <button className="p-1.5 border border-slate-205 rounded-lg bg-slate-50 hover:bg-slate-100 transition"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>
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
        <p className="text-xs text-slate-655 leading-relaxed font-sans">{activeProject.description || "No project description provided. Use AI Design or Schematic editor to generate content."}</p>
      </div>

      {/* Choose Your Task section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-808 tracking-tight">Choose Your Task</h2>
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
              <BarChart2 className="w-5 h-5 text-rose-500" />
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
