"use client";

import React, { useState } from "react";
import { useAppContext } from "../../app/providers";
import { api } from "../../lib/api";
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Plus, 
  LayoutGrid, 
  List, 
  Star, 
  MoreVertical, 
  Share2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  ChevronUp,
  User,
  Heart
} from "lucide-react";

// Inline Custom SVG Symbols for Grid & Preview
export const DeviceSymbol = ({ name, className = "w-14 h-14" }: { name: string; className?: string }) => {
  const norm = name.toLowerCase();

  if (norm.includes("nmos")) {
    return (
      <svg className={`${className} stroke-slate-700 fill-none`} viewBox="0 0 40 40">
        <line x1="8" y1="20" x2="20" y2="20" strokeWidth="1.5" />
        <line x1="20" y1="10" x2="20" y2="30" strokeWidth="2.5" />
        <line x1="26" y1="10" x2="26" y2="30" strokeWidth="2.5" />
        <line x1="26" y1="13" x2="34" y2="13" strokeWidth="1.5" />
        <line x1="26" y1="27" x2="34" y2="27" strokeWidth="1.5" />
        <polygon points="27,27 33,23 33,31" className="fill-slate-700 stroke-none" />
      </svg>
    );
  }

  if (norm.includes("pmos")) {
    return (
      <svg className={`${className} stroke-slate-700 fill-none`} viewBox="0 0 40 40">
        <line x1="8" y1="20" x2="16" y2="20" strokeWidth="1.5" />
        <line x1="16" y1="10" x2="16" y2="30" strokeWidth="2.5" />
        <circle cx="19.5" cy="20" r="3.5" strokeWidth="1.5" fill="white" />
        <line x1="23" y1="10" x2="23" y2="30" strokeWidth="2.5" />
        <line x1="23" y1="13" x2="32" y2="13" strokeWidth="1.5" />
        <line x1="23" y1="27" x2="32" y2="27" strokeWidth="1.5" />
      </svg>
    );
  }

  if (norm.includes("inv")) {
    return (
      <svg className={`${className} stroke-slate-700 fill-none`} viewBox="0 0 40 40">
        <line x1="6" y1="20" x2="16" y2="20" strokeWidth="1.5" />
        <polygon points="16,12 16,28 28,20" strokeWidth="1.5" />
        <circle cx="31" cy="20" r="2.5" strokeWidth="1.5" fill="white" />
        <line x1="33.5" y1="20" x2="37" y2="20" strokeWidth="1.5" />
      </svg>
    );
  }

  if (norm.includes("nand")) {
    return (
      <svg className={`${className} stroke-slate-700 fill-none`} viewBox="0 0 50 30">
        <line x1="5" y1="10" x2="15" y2="10" strokeWidth="1.5" />
        <line x1="5" y1="20" x2="15" y2="20" strokeWidth="1.5" />
        <path d="M 15,5 L 22,5 C 30,5 34,15 34,15 C 34,15 30,25 22,25 L 15,25 Z" strokeWidth="1.5" />
        <circle cx="37.5" cy="15" r="2.5" strokeWidth="1.5" fill="white" />
        <line x1="40" y1="15" x2="46" y2="15" strokeWidth="1.5" />
      </svg>
    );
  }

  if (norm.includes("res_")) {
    return (
      <svg className={`${className} stroke-slate-700 fill-none`} viewBox="0 0 60 30">
        <path d="M 5,15 L 15,15 L 18,7 L 24,23 L 30,7 L 36,23 L 42,7 L 45,15 L 55,15" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (norm.includes("cap_")) {
    return (
      <svg className={`${className} stroke-slate-700 fill-none`} viewBox="0 0 40 40">
        <line x1="8" y1="20" x2="17" y2="20" strokeWidth="1.5" />
        <line x1="17" y1="10" x2="17" y2="30" strokeWidth="2.5" />
        <line x1="23" y1="10" x2="23" y2="30" strokeWidth="2.5" />
        <line x1="23" y1="20" x2="32" y2="20" strokeWidth="1.5" />
      </svg>
    );
  }

  if (norm.includes("diode_")) {
    return (
      <svg className={`${className} stroke-slate-700 fill-none`} viewBox="0 0 40 40">
        <line x1="6" y1="20" x2="34" y2="20" strokeWidth="1.5" />
        <polygon points="16,12 16,28 26,20" className="fill-slate-700 stroke-none" />
        <line x1="26" y1="12" x2="26" y2="28" strokeWidth="2" />
      </svg>
    );
  }

  if (norm.includes("bitcell")) {
    return (
      <svg className={`${className} stroke-slate-700 fill-none`} viewBox="0 0 40 40">
        <rect x="8" y="10" width="24" height="20" rx="3" strokeWidth="1.5" />
        <line x1="14" y1="10" x2="14" y2="30" strokeWidth="1.2" />
        <line x1="26" y1="10" x2="26" y2="30" strokeWidth="1.2" />
        <line x1="14" y1="20" x2="26" y2="20" strokeWidth="1.5" />
      </svg>
    );
  }

  if (norm.includes("ldo")) {
    return (
      <svg className={`${className} stroke-slate-700 fill-none`} viewBox="0 0 45 40">
        <rect x="6" y="8" width="33" height="24" rx="3" strokeWidth="1.5" />
        <line x1="6" y1="15" x2="12" y2="15" strokeWidth="1.2" />
        <line x1="33" y1="15" x2="39" y2="15" strokeWidth="1.2" />
        <line x1="20" y1="32" x2="20" y2="36" strokeWidth="1.2" />
      </svg>
    );
  }

  if (norm.includes("opamp")) {
    return (
      <svg className={`${className} stroke-slate-700 fill-none`} viewBox="0 0 40 40">
        <polygon points="10,8 10,32 30,20" strokeWidth="1.5" />
        <line x1="5" y1="14" x2="10" y2="14" strokeWidth="1.2" />
        <line x1="5" y1="26" x2="10" y2="26" strokeWidth="1.2" />
        <line x1="30" y1="20" x2="35" y2="20" strokeWidth="1.2" />
      </svg>
    );
  }

  if (norm.includes("diff_")) {
    return (
      <svg className={`${className} stroke-slate-700 fill-none`} viewBox="0 0 40 40">
        <line x1="12" y1="12" x2="28" y2="12" strokeWidth="1.2" />
        <line x1="12" y1="12" x2="12" y2="22" strokeWidth="1.2" />
        <line x1="28" y1="12" x2="28" y2="22" strokeWidth="1.2" />
        <line x1="20" y1="22" x2="20" y2="30" strokeWidth="1.2" />
      </svg>
    );
  }

  if (norm.includes("pad_")) {
    return (
      <svg className={`${className} stroke-slate-700 fill-none`} viewBox="0 0 40 40">
        <rect x="8" y="8" width="24" height="24" rx="1.5" strokeWidth="1.5" />
        <line x1="8" y1="8" x2="32" y2="32" strokeWidth="1.2" />
        <line x1="32" y1="8" x2="8" y2="32" strokeWidth="1.2" />
      </svg>
    );
  }

  return (
    <svg className={`${className} stroke-slate-400 fill-none`} viewBox="0 0 40 40">
      <rect x="8" y="8" width="24" height="24" rx="2" strokeWidth="1.5" />
    </svg>
  );
};

type ComponentItem = {
  name: string;
  category: string;
  pdk: string;
  subLabel: string;
  desc: string;
  type: string;
  library: string;
  cell: string;
  vt: string;
  vds: string;
  ids: string;
  dim: string;
  pins: string;
  tags: string[];
};

export function LibraryView() {
  const { activeProject } = useAppContext();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"library" | "my_comps" | "favs" | "recent">("library");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Components");
  const [selectedLibrary, setSelectedLibrary] = useState("All");
  
  const [componentsList, setComponentsList] = useState<ComponentItem[]>([]);
  const [pdkStatus, setPdkStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  
  const [selectedComponent, setSelectedComponent] = useState<ComponentItem | null>(null);

  const [starredMap, setStarredMap] = useState<Record<string, boolean>>({
    pmos_01v8: true
  });

  const toggleStar = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredMap(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const mapBackendComponents = (comps: any[]) => {
    return comps.map((c: any) => {
      const pdk_name = c.technology;
      const pins_count = c.pins ? c.pins.length : 0;
      const pins_str = `${pins_count} (${(c.pins || []).join(", ")})`;
      
      let subLabel = "";
      if (c.category === "MOSFET" || c.category === "PMOS" || c.category === "NMOS") {
        subLabel = `Vt: ${c.parameters?.vt || "0.45V"}  Vds: ${c.parameters?.vds || "1.8V"}`;
      } else {
        subLabel = c.desc || "";
      }

      return {
        name: c.name,
        category: c.category || "MOSFET",
        pdk: pdk_name || "SKY130",
        subLabel,
        desc: c.desc || "",
        type: c.model || c.category || "MOSFET",
        library: c.technology === "SKY130" ? "sky130_fd_pr" : "generic_lib",
        cell: c.name,
        vt: c.parameters?.vt || "N/A",
        vds: c.parameters?.vds || "N/A",
        ids: c.parameters?.ids || "N/A",
        dim: c.parameters?.width ? `W: ${c.parameters.width} μm  L: ${c.parameters.length} μm` : "N/A",
        pins: pins_str,
        tags: c.ai_metadata?.tags || [c.category, pdk_name]
      };
    });
  };

  React.useEffect(() => {
    if (!activeProject) return;
    
    const loadLibraryData = async () => {
      try {
        setLoading(true);
        const [comps, pdks] = await Promise.all([
          api.listLibraryComponents(),
          api.listPdkStatus()
        ]);

        const mapped = mapBackendComponents(comps);
        setComponentsList(mapped);
        setPdkStatus(pdks);
        
        if (mapped.length > 0) {
          setSelectedComponent(mapped[0]);
        }
      } catch (err) {
        console.error("Failed to load component library data", err);
      } finally {
        setLoading(false);
      }
    };

    loadLibraryData();
  }, [activeProject]);

  const handleTogglePdk = async (pdkName: string, enabled: boolean) => {
    try {
      await api.togglePdk(pdkName, enabled);
      setPdkStatus(prev => ({ ...prev, [pdkName]: enabled }));
      
      const comps = await api.listLibraryComponents();
      const mapped = mapBackendComponents(comps);
      setComponentsList(mapped);
    } catch (err) {
      console.error("Failed to toggle PDK status", err);
    }
  };

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-sans bg-[#f8fafc]">
        Select or create a project to launch Component Library.
      </div>
    );
  }

  const categoriesMap: Record<string, number> = {};
  componentsList.forEach(c => {
    if (c.category) {
      categoriesMap[c.category] = (categoriesMap[c.category] || 0) + 1;
    }
  });

  const filteredComps = componentsList.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All Components" || c.category === selectedCategory;
    const matchesLibrary = selectedLibrary === "All" || c.pdk.toUpperCase().includes(selectedLibrary.toUpperCase());
    return matchesSearch && matchesCategory && matchesLibrary;
  });

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#f8fafc] font-sans select-text">
      
      {/* Top Header Section */}
      <div className="flex justify-between items-center px-8 py-5 bg-white border-b border-slate-100 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">Component Library</h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Access verified components and IP for your designs.
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Custom Search Input */}
          <div className="relative w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 pl-10 pr-16 py-2.5 rounded-full outline-none font-sans focus:border-blue-500 focus:bg-white transition"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">
              Ctrl + K
            </kbd>
          </div>

          {/* Bell Icon */}
          <button className="relative p-2 text-slate-500 hover:text-slate-805 transition">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 border border-white" />
          </button>


        </div>
      </div>

      {/* Tabs and Actions bar */}
      <div className="px-8 bg-white border-b border-slate-100 flex items-center justify-between gap-4 shrink-0 text-xs font-semibold text-slate-505 font-sans select-none">
        <div className="flex gap-8">
          {[
            { id: "library", label: "Library" },
            { id: "my_comps", label: "My Components" },
            { id: "favs", label: "Favorites" },
            { id: "recent", label: "Recently Used" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 cursor-pointer border-b-2 font-bold transition-all relative ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 font-black"
                  : "border-transparent hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Add Component Button */}
        <button
          onClick={() => alert("Open Add custom cell dialog")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition mb-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add Component</span>
          <ChevronDown className="w-3 h-3 text-blue-250 border-l border-blue-500 pl-1 ml-1" />
        </button>
      </div>

      {/* Primary Dashboard layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden min-h-0">
        
        {/* Left Column: Categories + Libraries */}
        <div className="md:col-span-2 border-r border-slate-150 bg-white flex flex-col h-full overflow-y-auto shrink-0 select-none p-3.5">
          {/* Categories Accordion */}
          <div className="space-y-3.5 mb-6">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Categories</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="space-y-1 text-[11px] font-bold text-slate-700 font-sans">
              <button
                onClick={() => setSelectedCategory("All Components")}
                className={`w-full px-2 py-1.5 rounded-lg flex justify-between items-center transition ${
                  selectedCategory === "All Components" ? "bg-blue-50 text-blue-600 font-bold" : "hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <span>All Components</span>
                <span className={`text-[10px] font-mono ${selectedCategory === "All Components" ? "text-blue-500 font-bold" : "text-slate-400"}`}>
                  {componentsList.length}
                </span>
              </button>

              {Object.entries(categoriesMap).map(([catName, count]) => (
                <button
                  key={catName}
                  onClick={() => setSelectedCategory(catName)}
                  className={`w-full px-2 py-1.5 rounded-lg flex justify-between items-center transition ${
                    selectedCategory === catName ? "bg-blue-50 text-blue-600 font-bold" : "hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-400 font-bold" />
                    <span>{catName}</span>
                  </span>
                  <span className="text-[10px] text-slate-405 font-mono">{count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Libraries Accordion */}
          <div className="space-y-3.5 border-t border-slate-100 pt-4 mt-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Libraries</span>
              <button className="text-slate-400 hover:text-slate-650"><Plus className="w-3.5 h-3.5" /></button>
            </div>

            <div className="space-y-2.5 text-[11px] font-bold text-slate-700 font-sans">
              <button
                onClick={() => setSelectedLibrary("All")}
                className={`w-full px-2 py-1.5 rounded-lg flex justify-between items-center transition ${
                  selectedLibrary === "All" ? "bg-blue-50 text-blue-600 font-bold" : "hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <span>All PDKs</span>
              </button>

              {Object.entries(pdkStatus).map(([name, enabled]) => (
                <div
                  key={name}
                  onClick={() => setSelectedLibrary(name)}
                  className={`w-full px-2 py-1.5 rounded-lg flex justify-between items-center cursor-pointer transition ${
                    selectedLibrary === name ? "bg-blue-50 text-blue-600 font-bold" : "hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span className="truncate pr-1">{name}</span>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleTogglePdk(name, e.target.checked);
                    }}
                    className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column: Filters + Component Grid + Footer */}
        <div className="md:col-span-7 flex flex-col h-full min-w-0 p-6 overflow-y-auto">
          
          {/* Controls toolbar */}
          <div className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm shrink-0 mb-6 text-xs text-slate-700 font-sans font-semibold">
            <div className="flex flex-wrap items-center gap-3">
              {/* Inner Search */}
              <div className="relative w-44">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 pl-8 pr-2 py-1.5 rounded-lg outline-none font-sans"
                />
              </div>

              {/* Filters */}
              {["All Categories", "All Types", "All Technologies", "All Libraries"].map((filter) => (
                <div key={filter} className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg cursor-pointer">
                  <span>{filter}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>

            {/* View grid/list layout */}
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden p-0.5 bg-slate-50">
              <button className="p-1.5 rounded-md bg-white text-blue-600 shadow-sm"><LayoutGrid className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-md text-slate-400 hover:text-slate-600"><List className="w-4 h-4" /></button>
            </div>
          </div>           {/* Result summary header */}
          <div className="flex justify-between items-center text-xs text-slate-500 font-sans mb-4 shrink-0 font-semibold">
            <span>Showing 1–{filteredComps.length} of {filteredComps.length} components</span>
            <div className="flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg cursor-pointer text-slate-700 font-bold">
              <span>Sort by: Name (A-Z)</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* 4x3 Grid cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            {filteredComps
              .map((c) => {
                const isActive = selectedComponent?.name === c.name;
                const isStarred = starredMap[c.name] ?? false;

                // Color tags based on category
                const tagColor = c.category.toUpperCase().includes("MOSFET") || c.category.toUpperCase().includes("MOS") || c.category.toUpperCase().includes("PASSIVE")
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : (c.category.toUpperCase().includes("DIGITAL") || c.category.toUpperCase().includes("LOGIC")
                      ? "bg-blue-50 text-blue-600 border-blue-100"
                      : "bg-purple-50 text-purple-600 border-purple-100");

                return (
                  <div
                    key={c.name}
                    onClick={() => setSelectedComponent(c)}
                    className={`bg-white border rounded-2xl p-4 cursor-pointer hover:shadow-md transition relative flex flex-col justify-between h-[180px] ${
                      isActive ? "border-blue-600 ring-2 ring-blue-500/10 shadow-sm" : "border-slate-150 hover:border-blue-300"
                    }`}
                  >
                    {/* Top Row: Title + Star */}
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold text-slate-800 font-mono tracking-tight truncate max-w-[80px]" title={c.name}>
                        {c.name}
                      </span>
                      <button 
                        onClick={(e) => toggleStar(c.name, e)}
                        className="p-0.5 hover:bg-slate-55 rounded transition shrink-0"
                      >
                        <Star className={`w-3.5 h-3.5 ${isStarred ? "fill-blue-605 text-blue-600" : "text-slate-300"}`} />
                      </button>
                    </div>

                    {/* Middle: Schematic Symbol SVG Drawing */}
                    <div className="flex-1 flex items-center justify-center py-2 select-none pointer-events-none">
                      <DeviceSymbol name={c.name} />
                    </div>

                    {/* Bottom: tag badges & values */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap gap-1">
                        <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase rounded border ${tagColor}`}>
                          {c.category}
                        </span>
                        <span className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-[8px] text-slate-500 uppercase font-semibold">
                          {c.pdk}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[8.5px] text-slate-400 font-mono border-t border-slate-50 pt-1 leading-relaxed">
                        <span className="truncate max-w-[100px]">{c.subLabel}</span>
                        <span className="text-slate-350 cursor-pointer">•••</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Pagination bar */}
          <div className="flex justify-center items-center border-t border-slate-100 pt-5 mt-6 text-xs font-sans text-slate-500 shrink-0 select-none">
            <div className="flex items-center gap-1.5 font-bold">
              <button className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed"><ChevronLeft className="w-3.5 h-3.5" /></button>
              <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-mono shadow-sm">1</button>
              <button className="p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Device Inspector */}
        <div className="md:col-span-3 border-l border-slate-150 bg-white p-5 flex flex-col justify-between h-full overflow-y-auto shrink-0 font-sans">
          {selectedComponent ? (
            <div className="space-y-5">
              
              {/* Header title */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-808 uppercase tracking-wider font-sans">VUCL Inspector</h3>
                <button
                  onClick={() => alert("Closing inspector pane")}
                  className="text-slate-400 hover:text-slate-700 transition text-[10px]"
                >
                  ✕
                </button>
              </div>

              {/* Title & tags */}
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-850 font-mono tracking-tight">{selectedComponent.name}</h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase font-mono">
                    {selectedComponent.pdk} Compatible
                  </span>
                </div>
              </div>

              {/* Large CAD symbol drawing */}
              <div className="space-y-1 select-none">
                <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">CAD Visual Symbol</span>
                <div className="h-28 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                  <DeviceSymbol name={selectedComponent.name} className="w-16 h-16" />
                  
                  {/* Pin direction labels */}
                  {selectedComponent.name.includes("pmos") && (
                    <>
                      <span className="absolute top-3 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-400">D</span>
                      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-400">S</span>
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[8px] font-mono text-slate-400">G</span>
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[8px] font-mono text-slate-400">B</span>
                    </>
                  )}
                </div>

                {/* Star & Download buttons under symbol */}
                <div className="flex gap-2.5 pt-2">
                  <button 
                    onClick={() => alert(`Downloading symbol: ${selectedComponent.name}`)}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition text-[10px] font-bold text-slate-700"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Download</span>
                  </button>
                  <button 
                    onClick={(e) => toggleStar(selectedComponent.name, e)}
                    className="border border-slate-202 hover:bg-slate-50 p-2 rounded-lg transition"
                  >
                    <Heart className={`w-3.5 h-3.5 ${starredMap[selectedComponent.name] ? "fill-blue-600 text-blue-600" : "text-slate-400"}`} />
                  </button>
                </div>
              </div>

              {/* Overview block */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Overview</span>
                <p className="text-xs text-slate-550 leading-relaxed font-sans font-medium">
                  {selectedComponent.desc}
                </p>
              </div>

              {/* Details table grid */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Details</span>
                <div className="space-y-1.5 bg-slate-50 border border-slate-200 p-3 rounded-xl font-mono text-[9.5px] text-slate-655 font-semibold">
                  {[
                    { label: "Type", val: selectedComponent.type },
                    { label: "Technology", val: selectedComponent.pdk },
                    { label: "Library", val: selectedComponent.library },
                    { label: "Cell", val: selectedComponent.cell },
                    { label: "Vt (Typ.)", val: selectedComponent.vt },
                    { label: "Vds (Max)", val: selectedComponent.vds },
                    { label: "Ids (Max)", val: selectedComponent.ids },
                    { label: "Dimensions", val: selectedComponent.dim },
                    { label: "Pins", val: selectedComponent.pins }
                  ].map(row => (
                    <div key={row.label} className="flex justify-between border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                      <span className="text-slate-405 font-sans font-bold text-[8.5px] uppercase">{row.label}</span>
                      <span className="text-slate-800 font-bold truncate max-w-[110px]" title={row.val}>{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents references */}
              <div className="space-y-2 font-sans text-xs">
                <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Documents</span>
                <div className="space-y-1.5 font-bold text-blue-600">
                  <a href="#" className="flex items-center gap-1 hover:underline"><ExternalLink className="w-3.5 h-3.5 shrink-0" /> Datasheet (PDF)</a>
                  <a href="#" className="flex items-center gap-1 hover:underline"><ExternalLink className="w-3.5 h-3.5 shrink-0" /> SPICE Model</a>
                </div>
              </div>

              {/* Tags references */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedComponent.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-mono text-[9px] font-bold rounded uppercase">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-xs text-slate-400 italic text-center p-4">
              Select a library component on the grid to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
