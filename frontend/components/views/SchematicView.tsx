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
  CheckCircle
} from "lucide-react";

type TransistorData = {
  id: string;
  type: "PMOS" | "NMOS";
  cell: string;
  w: number;
  l: number;
  m: number;
  fingers: number;
  orientation: string;
  x: number;
  y: number;
};

export function SchematicView() {
  const {
    activeProject,
    handleSelect
  } = useAppContext();

  // Active sub-page & view states
  const [activePage, setActivePage] = useState<string>("sense_amp");
  const [selectedComponentId, setSelectedComponentId] = useState<string>("P1");
  const [selectedLayer, setSelectedLayer] = useState<string>("All Layers");
  const [activePropertyTab, setActivePropertyTab] = useState<"element" | "net">("element");
  const [activeLogTab, setActiveLogTab] = useState<"erc" | "warn" | "drc" | "lvs">("erc");
  const [zoomSlider, setZoomSlider] = useState(50);
  const [netlistSearch, setNetlistSearch] = useState("");
  const [isPositionExpanded, setIsPositionExpanded] = useState(true);

  // Transistor parameters database state
  const [transistors, setTransistors] = useState<Record<string, TransistorData>>({
    P1: { id: "P1", type: "PMOS", cell: "pfet_01v8", w: 0.42, l: 0.15, m: 1, fingers: 1, orientation: "R0", x: 120.000, y: 80.000 },
    P2: { id: "P2", type: "PMOS", cell: "pfet_01v8", w: 0.42, l: 0.15, m: 1, fingers: 1, orientation: "R0", x: 360.000, y: 80.000 },
    N1: { id: "N1", type: "NMOS", cell: "nfet_01v8", w: 0.42, l: 0.15, m: 1, fingers: 1, orientation: "R0", x: 120.000, y: 180.000 },
    N2: { id: "N2", type: "NMOS", cell: "nfet_01v8", w: 0.42, l: 0.15, m: 1, fingers: 1, orientation: "R0", x: 360.000, y: 180.000 },
    N3: { id: "N3", type: "NMOS", cell: "nfet_01v8", w: 0.20, l: 0.15, m: 1, fingers: 1, orientation: "R0", x: 50.000, y: 120.000 },
    N4: { id: "N4", type: "NMOS", cell: "nfet_01v8", w: 0.20, l: 0.15, m: 1, fingers: 1, orientation: "R0", x: 430.000, y: 120.000 }
  });

  const handleParamChange = (field: keyof TransistorData, val: any) => {
    setTransistors(prev => ({
      ...prev,
      [selectedComponentId]: {
        ...prev[selectedComponentId],
        [field]: val
      }
    }));
  };

  const selectedDevice = transistors[selectedComponentId];

  const netlistItems = [
    { name: "BL" },
    { name: "BLB" },
    { name: "WL" },
    { name: "VDD" },
    { name: "GND" },
    { name: "Q" },
    { name: "QB" },
    { name: "VSS" }
  ].filter(n => n.name.toLowerCase().includes(netlistSearch.toLowerCase()));

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-sans bg-[#f8fafc]">
        Select or create a project to load the Schematic Editor.
      </div>
    );
  }

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
              6T_SRAM_SKY130
            </span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span>Schematic</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <div className="flex items-center gap-1 text-slate-800 font-bold lowercase">
              <span>sense_amp.sch</span>
              <Edit2 className="w-2.5 h-2.5 text-slate-400 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Top Controls Panel */}
        <div className="flex items-center gap-3">
          {/* Saved Status Badge */}
          <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Saved</span>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
            <button className="p-1 text-slate-500 hover:text-slate-850 hover:bg-white rounded transition"><Undo2 className="w-3.5 h-3.5" /></button>
            <button className="p-1 text-slate-500 hover:text-slate-850 hover:bg-white rounded transition"><Redo2 className="w-3.5 h-3.5" /></button>
          </div>

          {/* Action buttons */}
          <button className="border border-slate-205 hover:bg-slate-55 text-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-lg transition font-sans">
            Check ERC
          </button>
          <button className="border border-slate-205 hover:bg-slate-55 text-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-lg transition font-sans">
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
            <button className="p-1 hover:bg-white rounded hover:text-slate-800"><ZoomIn className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-white rounded hover:text-slate-800"><ZoomOut className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:bg-white rounded hover:text-slate-800"><RotateCcw className="w-3.5 h-3.5" /></button>
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
            <span className="text-slate-250 px-1">|</span>
            <button className="p-1 hover:bg-white rounded hover:text-slate-800" title="Eraser">✏</button>
            <button className="p-1 hover:bg-white rounded hover:text-slate-800" title="Rotate">⟳</button>
            <button className="p-1 hover:bg-white rounded hover:text-slate-800" title="Mirror">⇄</button>
            <button className="p-1 hover:bg-white rounded hover:text-slate-800" title="Help"><HelpCircle className="w-3.5 h-3.5" /></button>
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

          <button className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg transition">
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
              <svg className="w-full h-full opacity-40" viewBox="0 0 480 260">
                <line x1="240" y1="20" x2="240" y2="40" stroke="#1e293b" strokeWidth="2" />
                <line x1="170" y1="40" x2="310" y2="40" stroke="#1e293b" strokeWidth="2" />
                <line x1="170" y1="40" x2="170" y2="60" stroke="#1e293b" strokeWidth="2" />
                <line x1="310" y1="40" x2="310" y2="60" stroke="#1e293b" strokeWidth="2" />
                <circle cx="170" cy="70" r="4" fill="none" stroke="#1e293b" strokeWidth="2" />
                <circle cx="310" cy="70" r="4" fill="none" stroke="#1e293b" strokeWidth="2" />
                <line x1="170" y1="74" x2="170" y2="170" stroke="#1e293b" strokeWidth="2" />
                <line x1="310" y1="74" x2="310" y2="170" stroke="#1e293b" strokeWidth="2" />
                <line x1="170" y1="210" x2="310" y2="210" stroke="#1e293b" strokeWidth="2" />
              </svg>
              {/* Highlight viewport boundary */}
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
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider font-sans">Pages</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="space-y-1 font-sans text-xs">
              {[
                { id: "sense_amp", label: "sense_amp (Top)" },
                { id: "write_driver", label: "write_driver" },
                { id: "bitcell_array", label: "bitcell_array" },
                { id: "control_logic", label: "control_logic" }
              ].map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => setActivePage(p.id)}
                  className={`px-3 py-1.5 rounded-lg flex items-center justify-between cursor-pointer font-bold transition ${
                    activePage === p.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-650 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] ${activePage === p.id ? "text-blue-200" : "text-slate-400"}`}>{idx + 1}</span>
                    <span>{p.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Netlist list */}
          <div className="p-4 flex-1 flex flex-col space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider font-sans">Netlist</span>
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
              {netlistItems.map(net => (
                <div key={net.name} className="flex justify-between items-center py-1 hover:text-blue-600 transition cursor-pointer">
                  <span>{net.name}</span>
                  <span className="text-slate-350 font-mono text-[9px]">...</span>
                </div>
              ))}
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

            {/* Clickable High-Fidelity 6T SRAM SVG Schematic */}
            <div className="w-full max-w-[500px] h-[340px] relative select-none">
              <svg className="w-full h-full" viewBox="0 0 480 260">
                {/* VDD Node */}
                <line x1="240" y1="20" x2="240" y2="40" stroke="#2563eb" strokeWidth="1.75" />
                <circle cx="240" cy="20" r="2.5" fill="#2563eb" />
                <text x="240" y="12" textAnchor="middle" className="text-[10px] font-black font-sans fill-slate-800">VDD</text>
                
                {/* Upper VDD cross connection wire */}
                <line x1="170" y1="40" x2="310" y2="40" stroke="#2563eb" strokeWidth="1.5" />
                <circle cx="170" cy="40" r="2" fill="#2563eb" />
                <circle cx="310" cy="40" r="2" fill="#2563eb" />

                {/* Transistor P1 */}
                <g 
                  onClick={() => setSelectedComponentId("P1")}
                  className={`cursor-pointer transition-all ${selectedComponentId === "P1" ? "stroke-blue-600 text-blue-600 filter drop-shadow-[0_0_4px_rgba(37,99,235,0.3)]" : "hover:stroke-blue-400"}`}
                >
                  <line x1="170" y1="40" x2="170" y2="60" stroke={selectedComponentId === "P1" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  {/* Gate, drain, source */}
                  <line x1="150" y1="60" x2="190" y2="60" stroke={selectedComponentId === "P1" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="150" y1="65" x2="190" y2="65" stroke={selectedComponentId === "P1" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <circle cx="170" cy="70" r="3" fill="white" stroke={selectedComponentId === "P1" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="170" y1="73" x2="170" y2="100" stroke={selectedComponentId === "P1" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  {/* Labels */}
                  <text x="145" y="70" textAnchor="middle" className="text-[10px] font-black font-sans fill-slate-800">P1</text>
                  <text x="195" y="68" textAnchor="start" className="text-[7.5px] font-mono fill-slate-400 leading-none">
                    sky130_fd_pr__pfet_01v8 W={transistors.P1.w}u L={transistors.P1.l}u
                  </text>
                </g>

                {/* Transistor P2 */}
                <g 
                  onClick={() => setSelectedComponentId("P2")}
                  className={`cursor-pointer transition-all ${selectedComponentId === "P2" ? "stroke-blue-600 text-blue-600 filter drop-shadow-[0_0_4px_rgba(37,99,235,0.3)]" : "hover:stroke-blue-400"}`}
                >
                  <line x1="310" y1="40" x2="310" y2="60" stroke={selectedComponentId === "P2" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="290" y1="60" x2="330" y2="60" stroke={selectedComponentId === "P2" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="290" y1="65" x2="330" y2="65" stroke={selectedComponentId === "P2" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <circle cx="310" cy="70" r="3" fill="white" stroke={selectedComponentId === "P2" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="310" y1="73" x2="310" y2="100" stroke={selectedComponentId === "P2" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <text x="335" y="70" textAnchor="middle" className="text-[10px] font-black font-sans fill-slate-800">P2</text>
                  <text x="335" y="68" textAnchor="start" className="text-[7.5px] font-mono fill-slate-400 leading-none">
                    sky130_fd_pr__pfet_01v8 W={transistors.P2.w}u L={transistors.P2.l}u
                  </text>
                </g>

                {/* Transistor N1 */}
                <g 
                  onClick={() => setSelectedComponentId("N1")}
                  className={`cursor-pointer transition-all ${selectedComponentId === "N1" ? "stroke-blue-600 text-blue-600 filter drop-shadow-[0_0_4px_rgba(37,99,235,0.3)]" : "hover:stroke-blue-400"}`}
                >
                  <line x1="170" y1="100" x2="170" y2="170" stroke={selectedComponentId === "N1" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="150" y1="170" x2="190" y2="170" stroke={selectedComponentId === "N1" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="150" y1="175" x2="190" y2="175" stroke={selectedComponentId === "N1" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="170" y1="175" x2="170" y2="210" stroke={selectedComponentId === "N1" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <text x="145" y="175" textAnchor="middle" className="text-[10px] font-black font-sans fill-slate-800">N1</text>
                  <text x="195" y="178" textAnchor="start" className="text-[7.5px] font-mono fill-slate-400 leading-none">
                    sky130_fd_pr__nfet_01v8 W={transistors.N1.w}u L={transistors.N1.l}u
                  </text>
                </g>

                {/* Transistor N2 */}
                <g 
                  onClick={() => setSelectedComponentId("N2")}
                  className={`cursor-pointer transition-all ${selectedComponentId === "N2" ? "stroke-blue-600 text-blue-600 filter drop-shadow-[0_0_4px_rgba(37,99,235,0.3)]" : "hover:stroke-blue-400"}`}
                >
                  <line x1="310" y1="100" x2="310" y2="170" stroke={selectedComponentId === "N2" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="290" y1="170" x2="330" y2="170" stroke={selectedComponentId === "N2" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="290" y1="175" x2="330" y2="175" stroke={selectedComponentId === "N2" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="310" y1="175" x2="310" y2="210" stroke={selectedComponentId === "N2" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <text x="335" y="175" textAnchor="middle" className="text-[10px] font-black font-sans fill-slate-800">N2</text>
                  <text x="335" y="178" textAnchor="start" className="text-[7.5px] font-mono fill-slate-400 leading-none">
                    sky130_fd_pr__nfet_01v8 W={transistors.N2.w}u L={transistors.N2.l}u
                  </text>
                </g>

                {/* GND Rail */}
                <line x1="170" y1="210" x2="310" y2="210" stroke="#2563eb" strokeWidth="1.5" />
                <circle cx="170" cy="210" r="2" fill="#2563eb" />
                <circle cx="310" cy="210" r="2" fill="#2563eb" />
                <line x1="240" y1="210" x2="240" y2="230" stroke="#2563eb" strokeWidth="1.75" />
                <circle cx="240" cy="230" r="2.5" fill="#2563eb" />
                <text x="240" y="244" textAnchor="middle" className="text-[10px] font-black font-sans fill-slate-800">GND</text>

                {/* Cross coupling wires */}
                {/* Q Junction */}
                <circle cx="170" cy="115" r="3.5" fill="#2563eb" />
                <text x="190" y="111" textAnchor="middle" className="text-[10px] font-black fill-slate-800">Q</text>
                <line x1="170" y1="115" x2="210" y2="115" stroke="#2563eb" strokeWidth="1.5" />
                <line x1="210" y1="115" x2="210" y2="160" stroke="#2563eb" strokeWidth="1.5" />
                <line x1="210" y1="160" x2="270" y2="160" stroke="#2563eb" strokeWidth="1.5" />
                <line x1="270" y1="160" x2="270" y2="120" stroke="#2563eb" strokeWidth="1.5" />
                <line x1="270" y1="120" x2="290" y2="120" stroke="#2563eb" strokeWidth="1.5" />

                {/* QB Junction */}
                <circle cx="310" cy="115" r="3.5" fill="#2563eb" />
                <text x="290" y="111" textAnchor="middle" className="text-[10px] font-black fill-slate-800">QB</text>
                <line x1="310" y1="115" x2="270" y2="115" stroke="#2563eb" strokeWidth="1.5" />
                <line x1="270" y1="115" x2="270" y2="85" stroke="#2563eb" strokeWidth="1.5" />
                <line x1="270" y1="85" x2="210" y2="85" stroke="#2563eb" strokeWidth="1.5" />
                <line x1="210" y1="85" x2="210" y2="120" stroke="#2563eb" strokeWidth="1.5" />
                <line x1="210" y1="120" x2="190" y2="120" stroke="#2563eb" strokeWidth="1.5" />

                {/* Left Access Transistor (N3) */}
                <g 
                  onClick={() => setSelectedComponentId("N3")}
                  className={`cursor-pointer transition-all ${selectedComponentId === "N3" ? "stroke-blue-600 text-blue-600 filter drop-shadow-[0_0_4px_rgba(37,99,235,0.3)]" : "hover:text-blue-400"}`}
                >
                  <line x1="170" y1="115" x2="100" y2="115" stroke={selectedComponentId === "N3" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="100" y1="95" x2="100" y2="135" stroke={selectedComponentId === "N3" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="95" y1="95" x2="95" y2="135" stroke={selectedComponentId === "N3" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="95" y1="115" x2="70" y2="115" stroke={selectedComponentId === "N3" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <circle cx="70" cy="115" r="2.5" fill="#2563eb" />
                  <text x="70" y="103" textAnchor="middle" className="text-[10px] font-black fill-slate-800">BL</text>
                  {/* Gate connected to WL */}
                  <line x1="110" y1="115" x2="110" y2="155" stroke={selectedComponentId === "N3" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="110" y1="155" x2="110" y2="180" stroke={selectedComponentId === "N3" ? "#2563eb" : "#334155"} strokeWidth="1.5" />
                  <circle cx="110" cy="180" r="2.5" fill="#2563eb" />
                  <text x="110" y="193" textAnchor="middle" className="text-[9px] font-black fill-slate-800">WL</text>
                  <text x="120" y="125" textAnchor="middle" className="text-[10px] font-black font-sans fill-slate-800">N3</text>
                  <text x="100" y="85" textAnchor="middle" className="text-[7px] font-mono fill-slate-400 leading-none">
                    W={transistors.N3.w} L={transistors.N3.l}
                  </text>
                </g>

                {/* Right Access Transistor (N4) */}
                <g 
                  onClick={() => setSelectedComponentId("N4")}
                  className={`cursor-pointer transition-all ${selectedComponentId === "N4" ? "stroke-blue-600 text-blue-600 filter drop-shadow-[0_0_4px_rgba(37,99,235,0.3)]" : "hover:text-blue-400"}`}
                >
                  <line x1="310" y1="115" x2="380" y2="115" stroke={selectedComponentId === "N4" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="380" y1="95" x2="380" y2="135" stroke={selectedComponentId === "N4" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="385" y1="95" x2="385" y2="135" stroke={selectedComponentId === "N4" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="385" y1="115" x2="410" y2="115" stroke={selectedComponentId === "N4" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <circle cx="410" cy="115" r="2.5" fill="#2563eb" />
                  <text x="410" y="103" textAnchor="middle" className="text-[10px] font-black fill-slate-800">BLB</text>
                  {/* Gate connected to WL */}
                  <line x1="370" y1="115" x2="370" y2="155" stroke={selectedComponentId === "N4" ? "#2563eb" : "#334155"} strokeWidth="1.75" />
                  <line x1="370" y1="155" x2="370" y2="180" stroke={selectedComponentId === "N4" ? "#2563eb" : "#334155"} strokeWidth="1.5" />
                  <circle cx="370" cy="180" r="2.5" fill="#2563eb" />
                  <text x="370" y="193" textAnchor="middle" className="text-[9px] font-black fill-slate-800">WL</text>
                  <text x="360" y="125" textAnchor="middle" className="text-[10px] font-black font-sans fill-slate-800">N4</text>
                  <text x="380" y="85" textAnchor="middle" className="text-[7px] font-mono fill-slate-400 leading-none">
                    W={transistors.N4.w} L={transistors.N4.l}
                  </text>
                </g>
              </svg>
            </div>

            {/* Bottom Canvas Floating Toolbar */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-400 text-xs flex items-center gap-3 shadow-lg select-none">
              <button className="hover:text-white transition"><MousePointer className="w-3.5 h-3.5" /></button>
              <button className="hover:text-white transition">✋</button>
              <button className="hover:text-white transition"><Maximize2 className="w-3.5 h-3.5" /></button>
              <span className="text-slate-800">|</span>
              <button className="hover:text-white transition"><ZoomIn className="w-3.5 h-3.5" /></button>
              <button className="hover:text-white transition"><ZoomOut className="w-3.5 h-3.5" /></button>
              <button className="hover:text-white transition"><RotateCcw className="w-3.5 h-3.5" /></button>
              <span className="text-slate-800">|</span>
              <button className="hover:text-white transition"><Undo2 className="w-3.5 h-3.5" /></button>
              <button className="hover:text-white transition"><Redo2 className="w-3.5 h-3.5" /></button>
              <span className="text-slate-800">|</span>
              <button className="hover:text-white transition"><Settings className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Bottom logs list logs panel */}
          <div className="bg-white p-6 h-36 shrink-0 flex flex-col justify-between">
            <div className="flex gap-6 text-[10px] font-bold text-slate-400 font-sans border-b border-slate-100 pb-2 uppercase tracking-wider shrink-0 select-none">
              {[
                { id: "erc", label: "ERC (0)" },
                { id: "warn", label: "Warnings (0)" },
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
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-slate-700 font-semibold">No ERC errors found.</span>
              </div>
              <button 
                onClick={() => alert("ERC checkout details report loaded.")}
                className="text-[10px] text-slate-400 hover:text-slate-655 font-bold uppercase transition"
              >
                View Details ➔
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
                  activePropertyTab === "element" ? "text-blue-600 border-b-2 border-blue-600 font-black" : "hover:text-slate-800"
                }`}
              >
                Element
              </button>
              <button
                onClick={() => setActivePropertyTab("net")}
                className={`flex-1 text-center font-bold transition pb-1 ${
                  activePropertyTab === "net" ? "text-blue-600 border-b-2 border-blue-600 font-black" : "hover:text-slate-800"
                }`}
              >
                Net
              </button>
            </div>

            {activePropertyTab === "element" && selectedDevice ? (
              <div className="space-y-3.5 font-sans text-xs">
                {/* Properties fields */}
                <div>
                  <label className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">Type</label>
                  <input
                    type="text"
                    value={selectedDevice.type}
                    disabled
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg outline-none cursor-not-allowed font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedDevice.id}
                    onChange={(e) => handleParamChange("id", e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">Library</label>
                  <select
                    className="w-full bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg outline-none focus:border-blue-500 font-semibold cursor-pointer"
                  >
                    <option>sky130_fd_pr</option>
                  </select>
                </div>

                <div>
                  <label className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">Cell</label>
                  <select
                    value={selectedDevice.cell}
                    onChange={(e) => handleParamChange("cell", e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg outline-none focus:border-blue-500 font-semibold cursor-pointer"
                  >
                    <option value="pfet_01v8">pfet_01v8</option>
                    <option value="nfet_01v8">nfet_01v8</option>
                  </select>
                </div>

                {/* Dimension tuning inputs */}
                <div>
                  <label className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">Width (W)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={selectedDevice.w}
                      onChange={(e) => handleParamChange("w", parseFloat(e.target.value) || 0.15)}
                      className="w-full bg-white border border-slate-200 text-slate-800 px-3 py-1.5 pr-10 rounded-lg outline-none focus:border-blue-500 font-bold font-mono"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold uppercase">um</span>
                  </div>
                </div>

                <div>
                  <label className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">Length (L)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={selectedDevice.l}
                      onChange={(e) => handleParamChange("l", parseFloat(e.target.value) || 0.15)}
                      className="w-full bg-white border border-slate-200 text-slate-800 px-3 py-1.5 pr-10 rounded-lg outline-none focus:border-blue-500 font-bold font-mono"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold uppercase">um</span>
                  </div>
                </div>

                <div>
                  <label className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">M</label>
                  <input
                    type="number"
                    value={selectedDevice.m}
                    onChange={(e) => handleParamChange("m", parseInt(e.target.value) || 1)}
                    className="w-full bg-white border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">Mult Finger</label>
                  <input
                    type="number"
                    value={selectedDevice.fingers}
                    onChange={(e) => handleParamChange("fingers", parseInt(e.target.value) || 1)}
                    className="w-full bg-white border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">Orientation</label>
                  <select
                    value={selectedDevice.orientation}
                    onChange={(e) => handleParamChange("orientation", e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg outline-none focus:border-blue-500 font-semibold cursor-pointer"
                  >
                    <option value="R0">R0</option>
                    <option value="R90">R90</option>
                    <option value="R180">R180</option>
                    <option value="R270">R270</option>
                  </select>
                </div>

                {/* Collapsible Coordinate position */}
                <div className="border-t border-slate-100 pt-3">
                  <div
                    onClick={() => setIsPositionExpanded(!isPositionExpanded)}
                    className="flex justify-between items-center cursor-pointer text-slate-500 hover:text-slate-800 font-bold uppercase text-[9px] select-none"
                  >
                    <span>Position</span>
                    <ChevronDown className={`w-3.5 h-3.5 transform transition ${isPositionExpanded ? "" : "rotate-180"}`} />
                  </div>

                  {isPositionExpanded && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="text-[8px] uppercase font-bold text-slate-400 block mb-1">X</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={selectedDevice.x}
                            onChange={(e) => handleParamChange("x", parseFloat(e.target.value) || 0)}
                            className="w-full bg-white border border-slate-200 text-slate-800 px-2 py-1.5 pr-8 rounded-lg outline-none text-[11px] font-semibold font-mono"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-slate-400 font-bold uppercase">um</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Y</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={selectedDevice.y}
                            onChange={(e) => handleParamChange("y", parseFloat(e.target.value) || 0)}
                            className="w-full bg-white border border-slate-200 text-slate-800 px-2 py-1.5 pr-8 rounded-lg outline-none text-[11px] font-semibold font-mono"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-slate-400 font-bold uppercase">um</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
                <span className="text-slate-805 font-bold font-mono">SKY130</span>
              </div>
              <div className="flex justify-between">
                <span>Template</span>
                <span className="text-slate-805 font-bold font-sans">Custom</span>
              </div>
              <div className="flex justify-between">
                <span>Created</span>
                <span className="text-slate-800 font-mono text-[9.5px]">May 30, 2025 10:21 AM</span>
              </div>
              <div className="flex justify-between">
                <span>Last Modified</span>
                <span className="text-slate-800 font-mono text-[9.5px]">May 30, 2025 02:45 PM</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
