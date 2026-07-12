"use client";

import React, { useState } from "react";
import { useAppContext } from "../../app/providers";
import { 
  Search, 
  Bell, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  CheckCircle, 
  MoreVertical, 
  Eye, 
  Maximize2, 
  Filter, 
  Trash2, 
  Info,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sparkles
} from "lucide-react";

export function SimulationView() {
  const { activeProject, activeDesign, vddSlider, optimization } = useAppContext();

  // State values
  const [activeTab, setActiveTab] = useState<"run" | "waveform" | "logs" | "coverage" | "perf">("run");
  const [activeConsoleTab, setActiveConsoleTab] = useState<"console" | "messages" | "warnings" | "errors">("console");
  const [currentTime, setCurrentTime] = useState<number>(340); // in ns
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [signalSearch, setSignalSearch] = useState("");
  
  // Section collapsed toggles
  const [signalsOpen, setSignalsOpen] = useState({
    inputs: true,
    outputs: true,
    internal: true
  });
  
  const [settingsOpen, setSettingsOpen] = useState({
    general: true,
    signals: true,
    saved: true
  });

  const toggleSignalSection = (sect: keyof typeof signalsOpen) => {
    setSignalsOpen(prev => ({ ...prev, [sect]: !prev[sect] }));
  };

  const toggleSettingSection = (sect: keyof typeof settingsOpen) => {
    setSettingsOpen(prev => ({ ...prev, [sect]: !prev[sect] }));
  };

  // Helper function to round values
  const round = (num: number, decimal: number) => {
    const factor = Math.pow(10, decimal);
    return Math.round(num * factor) / factor;
  };

  // Check if simulation results exist in activeDesign
  const simResults = activeDesign?.simulation_results_json;
  const hasSimResults = simResults && simResults.status === "SUCCESS" && simResults.waveforms;

  // Determine x-axis bounds and configurations
  let xMin = 0;
  let xMax = 1000;
  let xUnit = "ns";
  let xTitle = "Time";

  let waveformsData: any = {};

  if (hasSimResults) {
    waveformsData = simResults.waveforms;
    const xArr = waveformsData.x || [];
    if (xArr.length > 0) {
      xMin = xArr[0];
      xMax = xArr[xArr.length - 1];
    }
    const designType = activeDesign?.requirements_json?.type;
    if (designType === "Current Mirror") {
      xUnit = "V";
      xTitle = "VDS";
    } else if (designType === "Differential Pair" || designType === "OTA") {
      xUnit = "V";
      xTitle = "Vid";
    } else if (designType === "Bandgap Reference") {
      xUnit = "°C";
      xTitle = "Temp";
    }
  } else {
    // Generate fallback dynamic waveforms based on activeProject design_type
    const points_count = 100;
    const time_pts = Array.from({ length: points_count }, (_, i) => round(i * 10, 2));
    waveformsData.x = time_pts;
    const vdd = vddSlider || 1.8;
    
    if (activeProject?.design_type === "6T SRAM" || activeProject?.design_type === "Memory") {
      const wl_pts = time_pts.map(t => (t >= 200 && t <= 600) ? vdd : 0.0);
      const bl_pts = time_pts.map(t => vdd);
      const blb_pts = time_pts.map(t => t < 250 ? vdd : 0.0);
      const q_pts = time_pts.map(t => t < 280 ? 0.0 : t <= 550 ? vdd * (1 - Math.exp(-(t-280)/28)) : vdd);
      const qb_pts = time_pts.map((t, idx) => vdd - q_pts[idx]);
      
      waveformsData.y_WL = wl_pts;
      waveformsData.y_BL = bl_pts;
      waveformsData.y_BLB = blb_pts;
      waveformsData.y_Q = q_pts;
      waveformsData.y_QB = qb_pts;
    } else if (activeProject?.design_type === "Ring Oscillator") {
      const osc_pts = time_pts.map(t => {
        const amp = (vdd / 2) * (1 - Math.exp(-t / 100));
        return (vdd / 2) + amp * Math.sin(2 * Math.PI * 0.01 * t);
      });
      waveformsData.y_OSC_OUT = osc_pts;
    } else if (activeProject?.design_type === "Current Mirror") {
      const vds_pts = Array.from({ length: points_count }, (_, i) => round(i * 0.02, 2));
      waveformsData.x = vds_pts;
      waveformsData.y_Iref = vds_pts.map(t => 10.0);
      waveformsData.y_Iout = vds_pts.map(t => t < 0.15 ? 10 * (t/0.15) : 10 * (1 + 0.22*(t-0.15)));
      xMin = 0;
      xMax = 1.98;
      xUnit = "V";
      xTitle = "VDS";
    } else {
      // Default ALU signals
      const clk_pts = time_pts.map(t => (t % 100 < 50) ? vdd : 0.0);
      const rst_pts = time_pts.map(t => t < 150 ? 0.0 : vdd);
      waveformsData.y_CLK = clk_pts;
      waveformsData.y_RST_N = rst_pts;
      waveformsData.y_A = time_pts.map(t => t < 300 ? 0 : t < 500 ? vdd : 0.5);
      waveformsData.y_B = time_pts.map(t => t < 300 ? 0 : vdd);
      waveformsData.y_OUT = time_pts.map((t, idx) => rst_pts[idx] === 0 ? 0 : waveformsData.y_A[idx] + waveformsData.y_B[idx]);
    }
  }

  // Playback timer effect
  React.useEffect(() => {
    let interval: any;
    if (isPlaying) {
      const step = (xMax - xMin) / 100;
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + step;
          if (next > xMax) {
            setIsPlaying(false);
            return xMax;
          }
          return next;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, xMin, xMax]);

  // Adjust default currentTime if it falls out of bounds
  React.useEffect(() => {
    if (currentTime < xMin || currentTime > xMax) {
      setCurrentTime((xMax + xMin) / 2);
    }
  }, [xMin, xMax]);

  // Dragging slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  // Dynamic value lookup for the signals
  const getSignalValueAtCursor = (signalKey: string) => {
    const values = waveformsData[signalKey] || [];
    const xArr = waveformsData.x || [];
    if (values.length === 0 || xArr.length === 0) return 0.00;
    
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < xArr.length; i++) {
      const diff = Math.abs(xArr[i] - currentTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    return values[closestIdx];
  };

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-sans bg-[#f8fafc]">
        Select or create a project to launch the Simulation Workspace.
      </div>
    );
  }

  // Calculate coordinates for waveforms SVG grid mapping
  const cursorX = xMax !== xMin ? 60 + ((currentTime - xMin) / (xMax - xMin)) * 450 : 60;

  // Dynamic waves rows construction
  const signalKeys = Object.keys(waveformsData).filter(
    (k) => k !== "x" && (signalSearch === "" || k.toLowerCase().includes(signalSearch.toLowerCase()))
  );
  
  const waveRows = signalKeys.map((key, idx) => {
    const name = key.replace(/^y_/, "");
    const values = waveformsData[key] || [];
    const maxVal = Math.max(...values, 1.8);
    const minVal = Math.min(...values, 0);
    
    // Determine type: digital vs analog
    const isDigital = values.every((v: number) => Math.abs(v - minVal) < 0.05 || Math.abs(v - maxVal) < 0.05);
    const type = isDigital ? "digital" : "analog";
    const currentVal = getSignalValueAtCursor(key);
    
    let valStr = "";
    if (type === "digital") {
      const threshold = minVal + (maxVal - minVal) * 0.5;
      valStr = currentVal >= threshold ? "1" : "0";
    } else {
      if (name.toLowerCase().includes("i")) {
        valStr = `${Number(currentVal).toFixed(3)} µA`;
      } else {
        valStr = `${Number(currentVal).toFixed(3)} V`;
      }
    }

    // Build SVG path
    let path = "";
    if (values.length > 0) {
      const xArr = waveformsData.x || [];
      const x_range = xMax - xMin || 1.0;
      const pts = values.map((val: number, i: number) => {
        const x_val = xArr[i];
        const px = 60 + ((x_val - xMin) / x_range) * 450;
        
        let py = 18;
        if (type === "digital") {
          const threshold = minVal + (maxVal - minVal) * 0.5;
          py = val >= threshold ? 5 : 18;
        } else {
          const range = maxVal - minVal || 1.0;
          py = 18 - ((val - minVal) / range) * 13;
        }
        return `${px.toFixed(1)},${py.toFixed(1)}`;
      });
      path = "M " + pts.join(" L ");
    }

    const colors = ["#eab308", "#10b981", "#3b82f6", "#a855f7", "#ec4899", "#ef4444"];
    const color = colors[idx % colors.length];

    return {
      name,
      type,
      color,
      path,
      val: valStr
    };
  });

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#f8fafc] font-sans select-text">
      
      {/* Top Header Section */}
      <div className="flex justify-between items-center px-8 py-5 bg-white border-b border-slate-100 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">Simulation</h1>
          <p className="text-xs text-slate-505 mt-1 font-sans">
            Run and analyze simulations for your RTL designs.
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Custom Search Input */}
          <div className="relative w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects, files..."
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 pl-10 pr-16 py-2.5 rounded-full outline-none font-sans focus:border-blue-500 focus:bg-white transition"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">
              Ctrl + K
            </kbd>
          </div>

          {/* Help Icon */}
          <button className="text-slate-400 hover:text-slate-700 transition">
            <HelpCircle className="w-5 h-5" />
          </button>

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
            { id: "run", label: "Run" },
            { id: "waveform", label: "Waveform" },
            { id: "logs", label: "Logs" },
            { id: "coverage", label: "Coverage" },
            { id: "perf", label: "Performance" }
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
          onClick={() => alert("Configure new simulation parameters")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition mb-1"
        >
          <span>+ New Simulation</span>
          <ChevronDown className="w-3 h-3 text-blue-250 border-l border-blue-500 pl-1 ml-1" />
        </button>
      </div>

      {/* Simulation Run Configuration Toolbar */}
      <div className="px-8 py-4 bg-white border-b border-slate-150 flex flex-wrap items-center justify-between gap-4 select-none shrink-0">
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {[
            { label: "Project", val: "alu_32bit" },
            { label: "Top Module", val: "alu_32bit" },
            { label: "Simulator", val: "Verilator" },
            { label: "Configuration", val: "Default" },
            { label: "Testbench", val: "alu_tb.sv" }
          ].map((cfg) => (
            <div key={cfg.label} className="space-y-1">
              <span className="block text-[9px] text-slate-400">{cfg.label}</span>
              <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer lowercase">
                <span className="capitalize">{cfg.val}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          ))}

          {/* Run button */}
          <button
            onClick={() => {
              setIsPlaying(true);
              alert("Starting RTL transient simulation sweep...");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition self-end"
          >
            <Play className="w-3.5 h-3.5 fill-white text-white" />
            <span>Run Simulation</span>
            <ChevronDown className="w-3 h-3 text-blue-250 border-l border-blue-500 pl-1 ml-1" />
          </button>
        </div>

        {/* Live Simulation Info card */}
        <div className="flex items-center gap-6 bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-xs text-xs font-semibold text-slate-505 font-sans">
          <div className="space-y-0.5">
            <span className="block text-[8.5px] font-bold uppercase tracking-wider text-slate-405">Status</span>
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Completed</span>
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="block text-[8.5px] font-bold uppercase tracking-wider text-slate-405">Time Elapsed</span>
            <span className="text-slate-805 font-bold font-mono">00:00:12.438</span>
          </div>
          <div className="space-y-0.5">
            <span className="block text-[8.5px] font-bold uppercase tracking-wider text-slate-405">Simulation Time</span>
            <span className="text-slate-805 font-bold font-mono">1,000 ns</span>
          </div>
          <div className="space-y-0.5">
            <span className="block text-[8.5px] font-bold uppercase tracking-wider text-slate-405">Date</span>
            <span className="text-slate-800 font-mono text-[10.5px]">May 30, 2025 02:45 PM</span>
          </div>
        </div>
      </div>

      {/* Primary Dashboard layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden min-h-0">
        
        {/* Left Column: Signals Explorer */}
        <div className="md:col-span-2 border-r border-slate-150 bg-white flex flex-col h-full overflow-y-auto shrink-0 select-none p-5">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            <span>Signals</span>
          </div>

          <div className="relative shrink-0 mb-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search signals..."
              value={signalSearch}
              onChange={(e) => setSignalSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-805 pl-8 pr-2 py-1.5 rounded-lg outline-none font-sans"
            />
          </div>

          {/* Collapsible signals sections */}
          <div className="flex-1 overflow-y-auto text-xs font-semibold text-slate-655 font-sans space-y-4">
            {/* Inputs Section */}
            <div>
              <div 
                onClick={() => toggleSignalSection("inputs")}
                className="flex items-center justify-between py-1.5 hover:text-slate-800 cursor-pointer border-b border-slate-100 pb-1"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition ${signalsOpen.inputs ? "" : "-rotate-90"}`} />
                  <span>Inputs</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">9</span>
              </div>

              {signalsOpen.inputs && (
                <div className="pl-3 space-y-1.5 mt-1.5">
                  {[
                    { name: "clk", color: "border-yellow-400 bg-yellow-50" },
                    { name: "rst_n", color: "border-emerald-400 bg-emerald-50" },
                    { name: "a[31:0]", color: "border-blue-400 bg-blue-50" },
                    { name: "b[31:0]", color: "border-blue-400 bg-blue-50" },
                    { name: "alu_ctrl[3:0]", color: "border-purple-400 bg-purple-50" }
                  ].map((sig) => (
                    <div key={sig.name} className="flex justify-between items-center py-1 hover:text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-sm border ${sig.color}`} />
                        <span className="font-mono text-[11px] font-bold text-slate-700">{sig.name}</span>
                      </div>
                      <Eye className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Outputs Section */}
            <div>
              <div 
                onClick={() => toggleSignalSection("outputs")}
                className="flex items-center justify-between py-1.5 hover:text-slate-800 cursor-pointer border-b border-slate-100 pb-1"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition ${signalsOpen.outputs ? "" : "-rotate-90"}`} />
                  <span>Outputs</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">6</span>
              </div>

              {signalsOpen.outputs && (
                <div className="pl-3 space-y-1.5 mt-1.5">
                  {[
                    { name: "y[31:0]", color: "border-emerald-400 bg-emerald-50" },
                    { name: "zero", color: "border-amber-400 bg-amber-50" },
                    { name: "carry", color: "border-red-400 bg-red-50" },
                    { name: "overflow", color: "border-purple-400 bg-purple-50" }
                  ].map((sig) => (
                    <div key={sig.name} className="flex justify-between items-center py-1 hover:text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-sm border ${sig.color}`} />
                        <span className="font-mono text-[11px] font-bold text-slate-700">{sig.name}</span>
                      </div>
                      <Eye className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Internal Section */}
            <div>
              <div 
                onClick={() => toggleSignalSection("internal")}
                className="flex items-center justify-between py-1.5 hover:text-slate-800 cursor-pointer border-b border-slate-100 pb-1"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition ${signalsOpen.internal ? "" : "-rotate-90"}`} />
                  <span>Internal</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">12</span>
              </div>

              {signalsOpen.internal && (
                <div className="pl-3 space-y-1.5 mt-1.5">
                  {[
                    { name: "result[31:0]", color: "border-purple-400 bg-purple-50" },
                    { name: "c_out", color: "border-purple-400 bg-purple-50" },
                    { name: "c_in[32:0]", color: "border-purple-400 bg-purple-50" }
                  ].map((sig) => (
                    <div key={sig.name} className="flex justify-between items-center py-1 hover:text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-sm border ${sig.color}`} />
                        <span className="font-mono text-[11px] font-bold text-slate-700">{sig.name}</span>
                      </div>
                      <Eye className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add signal actions bottom */}
          <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-sans text-slate-450 select-none shrink-0">
            <button className="hover:text-slate-700 font-bold">+ Add Signal</button>
            <button className="text-slate-400 hover:text-slate-700"><Settings className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Middle Column: Waveform Canvas + Terminal Logs */}
        <div className="md:col-span-7 flex flex-col h-full min-w-0 border-r border-slate-150 overflow-hidden">
          
          {/* Waveform viewer tool actions */}
          <div className="bg-slate-50 border-b border-slate-150 px-4 py-2 flex items-center justify-between shrink-0 select-none text-[11px] font-sans font-bold text-slate-500">
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Zoom to Fit"><Maximize2 className="w-3.5 h-3.5" /></button>
              <button className="px-2 py-1 hover:bg-slate-200 rounded text-slate-600 text-[10px]">Zoom In</button>
              <button className="px-2 py-1 hover:bg-slate-200 rounded text-slate-600 text-[10px]">Zoom Out</button>
              <button className="px-2 py-1 hover:bg-slate-200 rounded text-slate-600 text-[10px]">Actual Size</button>
            </div>

            <div className="flex items-center gap-3 text-slate-450 text-[10.5px]">
              <div className="flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded text-slate-600 cursor-pointer">
                <span>Markers</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded text-slate-600 cursor-pointer">
                <span>View</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <button className="hover:text-slate-700"><Settings className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Waveform oscilloscope display panel */}
          <div className="flex-1 bg-black overflow-y-auto relative flex min-h-0 select-none">
            
            {/* Waveform timeline grid panel */}
            <div className="flex-1 flex flex-col font-mono text-[9px] text-[#888888] h-full min-w-[500px]">
              
              {/* Timeline Header Row (x-axis) */}
              <div className="h-8 border-b border-zinc-800 flex items-end pb-1.5 relative select-none">
                <span className="absolute left-[60px]">{xMin.toFixed(1)} {xUnit}</span>
                <span className="absolute left-[150px]">{(xMin + (xMax - xMin) * 0.2).toFixed(1)} {xUnit}</span>
                <span className="absolute left-[240px]">{(xMin + (xMax - xMin) * 0.4).toFixed(1)} {xUnit}</span>
                <span className="absolute left-[330px]">{(xMin + (xMax - xMin) * 0.6).toFixed(1)} {xUnit}</span>
                <span className="absolute left-[420px]">{(xMin + (xMax - xMin) * 0.8).toFixed(1)} {xUnit}</span>
                <span className="absolute left-[510px]">{xMax.toFixed(1)} {xUnit}</span>

                {/* Draggable Scrubber Badge */}
                <div 
                  className="absolute bottom-0 z-20 flex flex-col items-center select-none"
                  style={{ left: `${cursorX}px`, transform: "translateX(-50%)" }}
                >
                  <span className="bg-blue-600 text-white text-[8.5px] px-1.5 py-0.5 rounded shadow-md font-bold mb-0.5">
                    {currentTime.toFixed(2)} {xUnit}
                  </span>
                </div>
              </div>

              {/* Waveforms rows (signals + SVGs) */}
              <div className="flex-1 flex flex-col justify-start relative text-[10.5px] font-sans">
                
                {/* Vertical Blue Scrubber cursor line */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10 pointer-events-none"
                  style={{ left: `${cursorX}px` }}
                />

                {waveRows.map((row, idx) => (
                  <div key={idx} className="h-8 border-b border-zinc-900/60 flex items-center relative select-none">
                    
                    {/* Signal label tag on far left */}
                    <span className="absolute left-3 font-mono text-[9px] text-[#aaaaaa] z-10 w-24 truncate">
                      {row.name}
                    </span>

                    {/* SVG waveform canvas */}
                    <svg className="absolute left-0 right-0 w-full h-full pointer-events-none">
                      <path d={row.path} stroke={row.color} strokeWidth="1.2" fill="none" />
                    </svg>

                    {/* Displays value badge at current cursor time */}
                    <div 
                      className="absolute z-20 pointer-events-none select-none text-[8.5px] font-mono"
                      style={{ left: `${cursorX + 6}px` }}
                    >
                      <span className="bg-zinc-800/90 text-white font-bold px-1.5 py-0.5 rounded border border-zinc-700 shadow-sm leading-none">
                        {row.val}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Time scrubber controller footer bar */}
          <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-150 flex items-center justify-between gap-4 select-none shrink-0 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-slate-200 text-slate-500 rounded"><SkipBack className="w-3.5 h-3.5" /></button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-sm"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              </button>
              <button className="p-1.5 hover:bg-slate-200 text-slate-500 rounded"><SkipForward className="w-3.5 h-3.5" /></button>
            </div>

            {/* Scrubber slider timeline */}
            <div className="flex-1 flex items-center gap-3">
              <input
                type="number"
                value={currentTime.toFixed(2)}
                onChange={(e) => setCurrentTime(Math.min(xMax, Math.max(xMin, Number(e.target.value))))}
                className="w-20 bg-white border border-slate-200 text-xs font-mono font-bold text-slate-700 text-center rounded px-1.5 py-1 outline-none"
              />
              <span className="text-xs font-bold text-slate-400 font-mono">{xUnit}</span>
              <button className="p-1 hover:bg-slate-200 text-slate-400 rounded"><RotateCcw className="w-3.5 h-3.5" /></button>
              
              <input
                type="range"
                min={xMin}
                max={xMax}
                step={(xMax - xMin) / 200}
                value={currentTime}
                onChange={handleSliderChange}
                className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 outline-none"
              />
              
              <span className="text-xs font-bold text-slate-405 font-mono">{xMax.toFixed(1)} {xUnit}</span>
              <button className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-655 shadow-sm hover:bg-slate-50 transition">Fit</button>
            </div>
          </div>

          {/* Console / logs inspect tab section */}
          <div className="bg-white p-6 h-36 shrink-0 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 select-none">
              <div className="flex gap-6">
                {[
                  { id: "console", label: "Console" },
                  { id: "messages", label: "Messages (0)" },
                  { id: "warnings", label: "Warnings (0)" },
                  { id: "errors", label: "Errors (0)" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveConsoleTab(tab.id as any)}
                    className={`pb-1.5 transition relative font-bold ${
                      activeConsoleTab === tab.id
                        ? "text-blue-600 border-b-2 border-blue-600 font-black"
                        : "hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-[9px] font-bold text-slate-655 hover:bg-slate-50 transition shadow-xs">Clear</button>
                <button className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-[9px] font-bold text-slate-655 hover:bg-slate-50 transition shadow-xs flex items-center gap-1">
                  <span>Export</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Logs inspector messages output */}
            <div className="flex-1 mt-3 font-mono text-[10px] bg-slate-950 text-slate-200 p-3 rounded-lg overflow-y-auto select-text leading-normal">
              <p className="text-emerald-500 font-bold">[INFO] Starting simulation...</p>
              <p className="text-emerald-400 font-bold">[INFO] Compiling design with Verilator...</p>
              <p className="text-slate-350">[INFO] Simulation running...</p>
              <p className="text-emerald-500 font-bold">[INFO] Simulation completed successfully.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Simulation Settings & Saved Simulations */}
        <div className="md:col-span-3 border-l border-slate-150 bg-white p-5 flex flex-col justify-start h-full overflow-y-auto shrink-0 font-sans space-y-6">
          
          {/* Simulation Settings */}
          <div>
            <div 
              onClick={() => toggleSettingSection("general")}
              className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 cursor-pointer select-none"
            >
              <span>Simulation Settings</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition ${settingsOpen.general ? "" : "-rotate-90"}`} />
            </div>

            {settingsOpen.general && (
              <div className="space-y-3 font-sans text-xs">
                {/* Time Unit */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-505 font-bold">Time Unit</span>
                  <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer text-[10px]">
                    <span>1 ns</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
                {/* Run Time */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-505 font-bold">Run Time</span>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 w-28">
                    <input
                      type="text"
                      defaultValue="1,000"
                      className="w-full bg-transparent text-right pr-2 py-1 text-xs font-mono font-bold text-slate-700 outline-none"
                    />
                    <span className="bg-slate-100 text-[9px] font-bold text-slate-450 border-l border-slate-250 px-2 py-1 select-none">ns</span>
                  </div>
                </div>
                {/* Dump Format */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-505 font-bold">Dump Format</span>
                  <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer text-[10px]">
                    <span>VCD</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
                {/* Timescale */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-505 font-bold">Timescale</span>
                  <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer text-[10px]">
                    <span>1ns / 1ps</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
                
                <button className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1">
                  <span>More Options</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Testbench Signals Table */}
          <div className="border-t border-slate-100 pt-5">
            <div 
              onClick={() => toggleSettingSection("signals")}
              className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 cursor-pointer select-none"
            >
              <span>Testbench Signals</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition ${settingsOpen.signals ? "" : "-rotate-90"}`} />
            </div>

            {settingsOpen.signals && (
              <div className="space-y-3">
                <div className="overflow-hidden border border-slate-150 rounded-xl bg-slate-50/50">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-[9px] font-bold uppercase tracking-wider text-slate-400 select-none">
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150/60 font-mono text-[10px] text-slate-700">
                      {[
                        { name: "a[31:0]", val: "0x00000005" },
                        { name: "b[31:0]", val: "0x00000003" },
                        { name: "alu_ctrl[3:0]", val: "0x1" },
                        { name: "rst_n", val: "1" }
                      ].map((sig) => (
                        <tr key={sig.name} className="hover:bg-slate-100/50 transition">
                          <td className="py-2.5 px-3 font-semibold text-slate-655">{sig.name}</td>
                          <td className="py-2.5 px-3 text-right text-slate-805 font-bold">{sig.val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={() => alert("Open parameter sizing editor")}
                  className="w-full bg-white border border-slate-200 hover:bg-slate-50 transition py-2 rounded-lg text-center text-xs font-bold text-slate-750 shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                  <span>Add/Modify</span>
                </button>
              </div>
            )}
          </div>

          {/* Saved Simulations */}
          <div className="border-t border-slate-100 pt-5">
            <div 
              onClick={() => toggleSettingSection("saved")}
              className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 cursor-pointer select-none"
            >
              <span>Saved Simulations</span>
              <span className="text-[9px] font-bold text-blue-600 hover:underline capitalize font-sans shrink-0">View All</span>
            </div>

            {settingsOpen.saved && (
              <div className="space-y-2 text-xs font-sans font-semibold text-slate-655">
                {[
                  { name: "alu_32bit_20250530_144512", date: "May 30, 2025 02:45 PM" },
                  { name: "alu_32bit_20250530_142233", date: "May 30, 2025 02:22 PM" },
                  { name: "alu_32bit_20250529_235959", date: "May 29, 2025 11:59 PM" }
                ].map((sim) => (
                  <div key={sim.name} className="flex justify-between items-center p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition">
                    <div className="space-y-0.5 max-w-[80%]">
                      <span className="text-slate-805 font-bold font-mono truncate block" title={sim.name}>
                        {sim.name}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono block">
                        {sim.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[10px] text-emerald-500 font-bold">✓</span>
                      <MoreVertical className="w-3.5 h-3.5 text-slate-400 hover:text-slate-650 cursor-pointer" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
