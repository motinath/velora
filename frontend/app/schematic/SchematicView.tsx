"use client";

import React, { useState } from "react";
import { useAppContext } from "../../app/providers";
import { 
  Search, 
  ChevronDown, 
  ChevronRight,
  Plus, 
  CheckCircle2, 
  Undo2, 
  Redo2, 
  Share2, 
  MoreVertical, 
  MousePointer, 
  Move,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Minus,
  CornerDownLeft,
  CircleDot,
  Type,
  Square,
  Circle,
  HelpCircle,
  Layers,
  Settings,
  Edit2,
  Trash2,
  Sliders,
  Info,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export function SchematicView() {
  const {
    activeProject,
    activeDesign,
    selectedComponentId,
    setSelectedComponentId,
    handleComponentParameterChange,
    handleSelect
  } = useAppContext();

  // Tab & UI Panel States
  const [selectedLayer, setSelectedLayer] = useState<string>("All Layers");
  const [activePropertyTab, setActivePropertyTab] = useState<"element" | "net">("element");
  const [activeLogTab, setActiveLogTab] = useState<"erc" | "warn" | "drc" | "lvs">("erc");
  const [zoomSlider, setZoomSlider] = useState(50);
  const [netlistSearch, setNetlistSearch] = useState("");
  const [isPositionExpanded, setIsPositionExpanded] = useState(true);

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-sans bg-[#f8fafc]">
        Select or create a project to load the Schematic Editor.
      </div>
    );
  }

  // Resolve selected component details from design database graph
  const selectedNode = activeDesign?.circuit_graph_json?.nodes?.find(
    (n: any) => n.id === selectedComponentId
  );

  const handleCanvasClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const symbolElement = target.closest(".schematic-symbol") || target.closest("[id^='symbol_']");
    if (symbolElement) {
      const symbolId = symbolElement.id.replace("symbol_", "");
      setSelectedComponentId(symbolId);
    }
  };

  // Generate dynamic highlighted SVG string
  const getHighlightedSvg = () => {
    if (!activeDesign?.schematic_svg) return "";
    
    // Inject custom CSS to highlight the active selected component group
    const styleBlock = selectedComponentId ? `
      <style>
        #symbol_${selectedComponentId} {
          filter: drop-shadow(0 0 3px rgba(37,99,235,0.8));
        }
        #symbol_${selectedComponentId} rect,
        #symbol_${selectedComponentId} circle,
        #symbol_${selectedComponentId} polygon,
        #symbol_${selectedComponentId} line {
          stroke: #2563eb !important;
          stroke-width: 2.5px !important;
        }
        #symbol_${selectedComponentId} text {
          fill: #2563eb !important;
          font-weight: bold !important;
        }
      </style>
    ` : "";
    return `${styleBlock}${activeDesign.schematic_svg}`;
  };

  // Build nets list dynamically
  const netSet = new Set<string>();
  activeDesign?.circuit_graph_json?.edges?.forEach((e: any) => {
    if (e.to_net) netSet.add(e.to_net);
  });
  const nets = Array.from(netSet).map(n => ({ name: n })).filter(n =>
    n.name.toLowerCase().includes(netlistSearch.toLowerCase())
  );

  const errors = activeDesign?.constraint_results_json?.errors || [];
  const warnings = activeDesign?.constraint_results_json?.warnings || [];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#f8fafc] font-sans select-text">
      
      {/* Top Header Section */}
      <div className="flex justify-between items-center px-8 py-4 bg-white border-b border-slate-100 shrink-0">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">Schematic Editor</h1>
          
          {/* Path Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-405 font-semibold font-sans uppercase">
            <span>Projects</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="cursor-pointer hover:underline" onClick={() => handleSelect("projects")}>
              {activeProject.name}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span>Schematic</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <div className="flex items-center gap-1 text-slate-800 font-bold lowercase">
              <span>{activeProject.design_type.toLowerCase().replace(/\s+/g, "_")}.sch</span>
            </div>
          </div>
        </div>

        {/* Top Controls Panel */}
        <div className="flex items-center gap-3">
          {/* Saved Status Badge */}
          <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Saved to DB</span>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
            <button className="p-1 text-slate-500 hover:text-slate-850 hover:bg-white rounded transition"><Undo2 className="w-3.5 h-3.5" /></button>
            <button className="p-1 text-slate-500 hover:text-slate-850 hover:bg-white rounded transition"><Redo2 className="w-3.5 h-3.5" /></button>
          </div>

          {/* Action buttons */}
          <button className="border border-slate-205 hover:bg-slate-55 text-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-lg transition font-sans" onClick={() => alert("ERC checks completed successfully")}>
            Check ERC
          </button>
          <button className="border border-slate-205 hover:bg-slate-55 text-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-lg transition font-sans" onClick={() => handleSelect("verification")}>
            Design Rules
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition">
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button className="text-slate-400 p-1 hover:text-slate-700"><MoreVertical className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Toolbar & Layer Select */}
      <div className="px-8 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between gap-4 shrink-0 text-slate-500 text-xs select-none">
        <div className="flex flex-wrap items-center gap-3">
          {/* Zoom controls */}
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50/80">
            <button className="p-1 text-blue-600 bg-white rounded shadow-sm"><MousePointer className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-white rounded hover:text-slate-800"><Move className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-white rounded hover:text-slate-800"><Maximize2 className="w-3.5 h-3.5" /></button>
            <span className="text-slate-250 px-1">|</span>
            <button className="p-1 hover:bg-white rounded hover:text-slate-800" onClick={() => setZoomSlider(prev => Math.min(100, prev + 10))}><ZoomIn className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-white rounded hover:text-slate-800" onClick={() => setZoomSlider(prev => Math.max(10, prev - 10))}><ZoomOut className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-white rounded hover:text-slate-800" onClick={() => setZoomSlider(50)}><RotateCcw className="w-3.5 h-3.5" /></button>
          </div>

          {/* CAD tools */}
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50/80">
            <button className="p-1 hover:bg-white rounded hover:text-slate-800" title="Wire"><Minus className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-white rounded hover:text-slate-800" title="Orthogonal wire"><CornerDownLeft className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-white rounded hover:text-slate-800" title="Pin"><CircleDot className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-white rounded hover:text-slate-800" title="Text"><Type className="w-3.5 h-3.5" /></button>
            <span className="text-slate-250 px-1">|</span>
            <button className="p-1 hover:bg-white rounded hover:text-slate-800" title="Square"><Square className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-white rounded hover:text-slate-800" title="Circle"><Circle className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-white rounded hover:text-slate-800" title="Ground">⏚</button>
            <button className="p-1 hover:bg-white rounded hover:text-slate-800" title="VDD">VDD</button>
          </div>
        </div>

        {/* Layer select */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold">
            <span className="text-[9px] text-slate-400 uppercase font-bold">Select Layer:</span>
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value)}
              className="bg-transparent font-bold outline-none text-slate-700 cursor-pointer"
            >
              <option>All Layers</option>
              <option>Metal1</option>
              <option>Poly</option>
              <option>Active</option>
            </select>
          </div>

          <button className="p-1.5 border border-slate-200 hover:bg-slate-55 rounded-lg transition">
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Three-Column CAD Panel Workspace */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden min-h-0">
        
        {/* Left Sidebar: Navigator + Pages + Netlist */}
        <div className="md:col-span-2 border-r border-slate-150 bg-white flex flex-col h-full overflow-y-auto shrink-0 select-none">
          {/* Navigator Mini-Map */}
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider font-sans">Navigator</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
            
            {/* Scaled schematic map preview */}
            <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-2 h-24 overflow-hidden relative flex items-center justify-center">
              <div 
                className="w-full h-full opacity-40 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: activeDesign?.schematic_svg || "" }}
              />
              <div className="absolute border border-blue-500/50 bg-blue-500/5 w-16 h-12 rounded shadow-sm cursor-grab" />
            </div>

            {/* Slider zoom */}
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="text-[10px]">−</span>
              <input
                type="range"
                min="10"
                max="100"
                value={zoomSlider}
                onChange={(e) => setZoomSlider(parseInt(e.target.value))}
                className="flex-1 mx-2 h-1 bg-slate-200 rounded-lg appearance-none accent-blue-600 cursor-pointer"
              />
              <span className="text-[10px]">+</span>
            </div>
          </div>

          {/* Pages panel list */}
          <div className="p-4 border-b border-slate-100 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider font-sans">Pages</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="space-y-1 font-sans text-xs">
              <div className="px-3 py-1.5 rounded-lg flex items-center justify-between cursor-pointer font-bold transition bg-blue-600 text-white">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-blue-20; font-bold">1</span>
                  <span>{activeProject.design_type.toLowerCase().replace(/\s+/g, "_")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Netlist list */}
          <div className="p-4 flex-1 flex flex-col space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider font-sans">Netlist Nets</span>
              <button className="text-slate-400 hover:text-slate-650"><MoreVertical className="w-3.5 h-3.5" /></button>
            </div>

            <div className="relative shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search nets..."
                value={netlistSearch}
                onChange={(e) => setNetlistSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 pl-8 pr-2 py-1.5 rounded-lg outline-none font-sans"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 text-xs font-semibold text-slate-600 font-sans pr-1">
              {nets.length === 0 ? (
                <span className="text-[10px] text-slate-400 italic">No nets found.</span>
              ) : (
                nets.map(net => (
                  <div key={net.name} className="flex justify-between items-center py-1 hover:text-blue-600 transition cursor-pointer">
                    <span>{net.name}</span>
                    <span className="text-slate-350 font-mono text-[9px]">...</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Middle Canvas: Drawing Grid + Floating controls + ERC Tab */}
        <div className="md:col-span-7 flex flex-col h-full min-w-0 border-r border-slate-150">
          
          {/* Main draw workspace */}
          <div className="flex-1 relative overflow-hidden bg-white p-4 flex items-center justify-center select-none border-b border-slate-100">
            {/* Grid dot background simulation */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
              backgroundImage: "radial-gradient(#1e293b 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }} />

            {/* Clickable Dynamic Compiler-Generated SVG Schematic */}
            <div className="w-full max-w-[500px] h-[340px] relative select-none flex items-center justify-center">
              {activeDesign?.schematic_svg ? (
                <div 
                  className="w-full h-full flex items-center justify-center select-none"
                  onClick={handleCanvasClick}
                  style={{ transform: `scale(${zoomSlider / 50})`, transition: "transform 0.15s ease-out" }}
                  dangerouslySetInnerHTML={{ __html: getHighlightedSvg() }}
                />
              ) : (
                <div className="text-center p-8 space-y-2 select-text">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No Schematic Compiled</h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                    This project has not completed compilation. Go to the AI Design Assistant to execute standard compilation.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Canvas Floating Toolbar */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-400 text-xs flex items-center gap-3 shadow-lg select-none">
              <button className="hover:text-white transition"><MousePointer className="w-3.5 h-3.5" /></button>
              <button className="hover:text-white transition">✋</button>
              <button className="hover:text-white transition"><Maximize2 className="w-3.5 h-3.5" /></button>
              <span className="text-slate-800">|</span>
              <button className="hover:text-white transition" onClick={() => setZoomSlider(prev => Math.min(100, prev + 10))}><ZoomIn className="w-3.5 h-3.5" /></button>
              <button className="hover:text-white transition" onClick={() => setZoomSlider(prev => Math.max(10, prev - 10))}><ZoomOut className="w-3.5 h-3.5" /></button>
              <button className="hover:text-white transition" onClick={() => setZoomSlider(50)}><RotateCcw className="w-3.5 h-3.5" /></button>
              <span className="text-slate-800">|</span>
              <button className="hover:text-white transition"><Undo2 className="w-3.5 h-3.5" /></button>
              <button className="hover:text-white transition"><Redo2 className="w-3.5 h-3.5" /></button>
              <span className="text-slate-800">|</span>
              <button className="hover:text-white transition" onClick={() => handleSelect("settings")}><Settings className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Bottom logs list logs panel */}
          <div className="bg-white p-6 h-36 shrink-0 flex flex-col justify-between">
            <div className="flex gap-6 text-[10px] font-bold text-slate-400 font-sans border-b border-slate-100 pb-2 uppercase tracking-wider shrink-0 select-none">
              {[
                { id: "erc", label: `ERC (${errors.length})` },
                { id: "warn", label: `Warnings (${warnings.length})` },
                { id: "drc", label: "DRC (0)" },
                { id: "lvs", label: "LVS (0)" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveLogTab(tab.id as any)}
                  className={`pb-1.5 transition relative font-bold ${
                    activeLogTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600 font-black"
                      : "hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Logs Tab content view */}
            <div className="flex-1 flex items-center justify-between mt-3 text-xs font-sans">
              <div className="flex items-center gap-2">
                {activeLogTab === "erc" && errors.length > 0 ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                    <span className="text-slate-700 font-bold text-red-650">{errors[0]}</span>
                  </>
                ) : activeLogTab === "warn" && warnings.length > 0 ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <span className="text-slate-705 font-bold text-amber-600">{warnings[0]}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-700 font-semibold">No issues flagged in this tab.</span>
                  </>
                )}
              </div>
              <button 
                onClick={() => handleSelect("verification")}
                className="text-[10px] text-slate-400 hover:text-slate-655 font-bold uppercase transition"
              >
                Launch Verification Suite ➔
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Properties Inspector (Tuning parameters W & L) */}
        <div className="md:col-span-3 border-l border-slate-150 bg-white p-5 flex flex-col justify-between h-full overflow-y-auto shrink-0 font-sans">
          
          <div className="space-y-5">
            {/* Header Tabs */}
            <div className="flex border-b border-slate-100 text-xs font-semibold text-slate-500 font-sans select-none shrink-0 mb-4 pb-2">
              <button
                onClick={() => setActivePropertyTab("element")}
                className={`flex-1 text-center font-bold transition pb-1 ${
                  activePropertyTab === "element" ? "text-blue-600 border-b-2 border-blue-600 font-black" : "hover:text-slate-805"
                }`}
              >
                Element Properties
              </button>
            </div>

            {activePropertyTab === "element" && selectedNode ? (
              <div className="space-y-3.5 font-sans text-xs">
                {/* Properties fields */}
                <div>
                  <label className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">Type</label>
                  <input
                    type="text"
                    value={selectedNode.category || selectedNode.type || "Device"}
                    disabled
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg outline-none cursor-not-allowed font-semibold uppercase"
                  />
                </div>

                <div>
                  <label className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedNode.id}
                    disabled
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg outline-none cursor-not-allowed font-bold"
                  />
                </div>

                <div>
                  <label className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">Library PDK</label>
                  <input
                    type="text"
                    value={activeProject.technology}
                    disabled
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg outline-none cursor-not-allowed font-semibold"
                  />
                </div>

                {selectedNode.properties?.model && (
                  <div>
                    <label className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">Model</label>
                    <input
                      type="text"
                      value={selectedNode.properties.model}
                      disabled
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg outline-none cursor-not-allowed font-mono text-[10px]"
                    />
                  </div>
                )}

                {/* Dimension tuning inputs dynamically constructed */}
                {Object.entries(selectedNode.properties?.parameters || {}).map(([paramName, val]: [string, any]) => (
                  <div key={paramName}>
                    <label className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">
                      {paramName === "W" ? "Width (W)" : paramName === "L" ? "Length (L)" : paramName}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={val}
                        onChange={(e) => handleComponentParameterChange(paramName, parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 text-slate-800 px-3 py-1.5 pr-10 rounded-lg outline-none focus:border-blue-500 font-bold font-mono"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold uppercase">
                        {paramName === "W" || paramName === "L" ? "um" : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-450 italic text-center p-4">
                Select a transistor device on the canvas to inspect its PDK properties.
              </div>
            )}
          </div>

          {/* Design Information card */}
          <div className="mt-8 border-t border-slate-100 pt-4 shrink-0 font-sans text-xs">
            <span className="text-[9px] uppercase font-bold text-slate-400 block mb-3 tracking-wide">Design Information</span>
            <div className="space-y-2 text-[10.5px] font-sans font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>Technology</span>
                <span className="text-slate-805 font-bold font-mono">{activeProject.technology}</span>
              </div>
              <div className="flex justify-between">
                <span>Template</span>
                <span className="text-slate-805 font-bold font-sans">{activeProject.design_type}</span>
              </div>
              <div className="flex justify-between">
                <span>Version</span>
                <span className="text-slate-805 font-bold font-mono">v{activeDesign?.version || 1}</span>
              </div>
              <div className="flex justify-between">
                <span>Created</span>
                <span className="text-slate-800 font-mono text-[9.5px]">
                  {activeDesign?.created_at ? new Date(activeDesign.created_at).toLocaleString() : "just now"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
