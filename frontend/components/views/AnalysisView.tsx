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
  Download, 
  Share2, 
  FileText, 
  LayoutGrid, 
  Zap, 
  Activity, 
  Leaf, 
  Heart, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle,
  Compass,
  ExternalLink,
  ChevronUp,
  Cpu,
  Info
} from "lucide-react";

export function AnalysisView() {
  const { activeProject } = useAppContext();

  // Navigation tab states
  const [activeTab, setActiveTab] = useState<"overview" | "perf" | "power" | "timing" | "area" | "reliability" | "health">("overview");
  const [trendMetric, setTrendMetric] = useState<"Area" | "Power" | "Delay">("Area");

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-sans bg-[#f8fafc]">
        Select or create a project to launch the Analysis Workspace.
      </div>
    );
  }

  // Key Hotspots rows
  const hotspotsData = [
    { type: "Timing", icon: Activity, color: "text-purple-600 bg-purple-50", net: "alu_top/U32/UADDER/CARRY[31]", metric: "Delay", val: "1.246 ns", pct: "13.6%", impact: "High", impColor: "bg-red-50 text-red-600 border-red-100", rec: "Optimize logic / Buffering" },
    { type: "Power", icon: Zap, color: "text-blue-600 bg-blue-50", net: "alu_top/U32/REG_FILE", metric: "Power", val: "0.358 mW", pct: "27.8%", impact: "High", impColor: "bg-red-50 text-red-600 border-red-100", rec: "Clock gating / Operand isolation" },
    { type: "Leakage", icon: Leaf, color: "text-amber-600 bg-amber-50", net: "alu_top/U32/UADDER", metric: "Leakage", val: "0.142 mW", pct: "71.7%", impact: "Medium", impColor: "bg-amber-50 text-amber-600 border-amber-100", rec: "Multi-Vt / Cell resizing" },
    { type: "Area", icon: LayoutGrid, color: "text-emerald-600 bg-emerald-50", net: "alu_top/U32/SHIFTER", metric: "Area", val: "12,452.11 µm²", pct: "14.2%", impact: "Medium", impColor: "bg-amber-50 text-amber-600 border-amber-100", rec: "Logic optimization" },
    { type: "Routing", icon: Compass, color: "text-indigo-600 bg-indigo-50", net: "alu_top/net_24567", metric: "Congestion", val: "78.4%", pct: "N/A", impact: "Low", impColor: "bg-blue-50 text-blue-600 border-blue-100", rec: "Re-route / Layer adjustment" }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#f8fafc] font-sans select-text">
      
      {/* Top Header Section */}
      <div className="flex justify-between items-center px-8 py-5 bg-white border-b border-slate-100 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">Analysis</h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Deep insights and advanced analysis of your design performance.
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Custom Search Input */}
          <div className="relative w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects, files, reports..."
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

          {/* Bell Icon with '3' badge */}
          <button className="relative p-2 text-slate-505 hover:text-slate-805 transition">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4.5 h-4.5 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-[8.5px] font-bold text-white leading-none font-mono">
              3
            </span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-600 text-sm font-sans shadow-sm">
              M
            </div>
            <span className="text-xs font-semibold text-slate-805 group-hover:text-slate-900 transition">
              Motinath
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Tabs and Actions bar */}
      <div className="px-8 bg-white border-b border-slate-100 flex items-center justify-between gap-4 shrink-0 text-xs font-semibold text-slate-505 font-sans select-none">
        <div className="flex gap-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "perf", label: "Performance" },
            { id: "power", label: "Power" },
            { id: "timing", label: "Timing" },
            { id: "area", label: "Area" },
            { id: "reliability", label: "Reliability" },
            { id: "health", label: "Design Health" }
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
          onClick={() => alert("Configure post-layout parameter sweep")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition mb-1"
        >
          <span>+ New Analysis</span>
          <ChevronDown className="w-3 h-3 text-blue-250 border-l border-blue-500 pl-1 ml-1" />
        </button>
      </div>

      {/* Analysis Parameters Bar */}
      <div className="px-8 py-4 bg-white border-b border-slate-150 flex flex-wrap items-center justify-between gap-4 select-none shrink-0 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
        <div className="flex flex-wrap items-center gap-8">
          {[
            { label: "Project", val: "alu_32bit" },
            { label: "Analysis Type", val: "Post-Synthesis" },
            { label: "Technology", val: "SKY130A" },
            { label: "Corner", val: "TT (1.8V, 25°C)" },
            { label: "Date/Run", val: "May 30, 2025 02:45 PM" }
          ].map((cfg) => (
            <div key={cfg.label} className="space-y-1">
              <span className="block text-[9px] text-slate-400">{cfg.label}</span>
              <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer lowercase">
                <span className="capitalize">{cfg.val}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Export / Share actions */}
        <div className="flex gap-2.5">
          <button 
            onClick={() => alert("Generating static PDF analysis summary...")}
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition font-sans"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export Report</span>
          </button>
          <button 
            onClick={() => alert("Link copied to share this workspace")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Container Dashboard */}
      <div className="p-8 space-y-6">
        
        {/* Row of 6 Key Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          
          {/* Total Area */}
          <div className="bg-white border border-slate-150 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs h-28 font-sans relative">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Area</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <div className="pt-2">
              <span className="text-base font-bold font-mono text-slate-800 block">87,654.21 µm²</span>
              <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1 mt-1 leading-none">
                <TrendingDown className="w-3 h-3" />
                <span>3.21% vs last run</span>
              </span>
            </div>
          </div>

          {/* Cell Area */}
          <div className="bg-white border border-slate-150 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs h-28 font-sans relative">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cell Area</span>
              <LayoutGrid className="w-4 h-4 text-slate-400" />
            </div>
            <div className="pt-2">
              <span className="text-base font-bold font-mono text-slate-800 block">82,112.45 µm²</span>
              <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1 mt-1 leading-none">
                <TrendingDown className="w-3 h-3" />
                <span>2.87% vs last run</span>
              </span>
            </div>
          </div>

          {/* Total Power */}
          <div className="bg-white border border-slate-150 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs h-28 font-sans relative">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Power</span>
              <Zap className="w-4 h-4 text-slate-400" />
            </div>
            <div className="pt-2">
              <span className="text-base font-bold font-mono text-slate-800 block">1.283 mW</span>
              <span className="text-[9px] text-rose-600 font-bold flex items-center gap-1 mt-1 leading-none">
                <TrendingUp className="w-3 h-3" />
                <span>1.45% vs last run</span>
              </span>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-white border border-slate-150 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs h-28 font-sans relative">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Performance</span>
              <Activity className="w-4 h-4 text-slate-400" />
            </div>
            <div className="pt-2">
              <span className="text-base font-bold font-mono text-slate-800 block">3.24 ns</span>
              <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1 mt-1 leading-none">
                <TrendingDown className="w-3 h-3" />
                <span>4.12% vs last run</span>
              </span>
            </div>
          </div>

          {/* Power Efficiency */}
          <div className="bg-white border border-slate-150 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs h-28 font-sans relative">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Power Efficiency</span>
              <Leaf className="w-4 h-4 text-slate-400" />
            </div>
            <div className="pt-2">
              <span className="text-base font-bold font-mono text-slate-800 block">0.397 pJ/op</span>
              <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1 mt-1 leading-none">
                <TrendingDown className="w-3 h-3" />
                <span>2.96% vs last run</span>
              </span>
            </div>
          </div>

          {/* Design Health */}
          <div className="bg-white border border-slate-150 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs h-28 font-sans relative">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Design Health</span>
              <Heart className="w-4 h-4 text-slate-400" />
            </div>
            <div className="pt-2">
              <span className="text-base font-bold font-mono text-slate-800 block">96 / 100</span>
              <span className="text-[9px] text-emerald-600 font-bold block mt-1 leading-none">Excellent</span>
            </div>
          </div>

        </div>

        {/* Grid two columns (Breakdowns & scores) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Column: Breakdown widgets & Hotspots table */}
          <div className="md:col-span-9 space-y-6">
            
            {/* Breakdown row of 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 1. Power Breakdown */}
              <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-[230px] font-sans">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Power Breakdown
                </h3>
                
                <div className="flex items-center gap-4 py-2">
                  {/* Donut Chart SVG */}
                  <div className="relative w-[85px] h-[85px] flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      {/* background */}
                      <circle cx="18" cy="18" r="15.91" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                      {/* Segment 1: Internal Power 50.1% */}
                      <circle cx="18" cy="18" r="15.91" fill="transparent" stroke="#3b82f6" strokeWidth="3" strokeDasharray="50.1 49.9" strokeDashoffset="0" />
                      {/* Segment 2: Switching Power 32.1% */}
                      <circle cx="18" cy="18" r="15.91" fill="transparent" stroke="#10b981" strokeWidth="3" strokeDasharray="32.1 67.9" strokeDashoffset="-50.1" />
                      {/* Segment 3: Leakage Power 15.4% */}
                      <circle cx="18" cy="18" r="15.91" fill="transparent" stroke="#f97316" strokeWidth="3" strokeDasharray="15.4 84.6" strokeDashoffset="-82.2" />
                      {/* Segment 4: Clock Power 2.4% */}
                      <circle cx="18" cy="18" r="15.91" fill="transparent" stroke="#ec4899" strokeWidth="3" strokeDasharray="2.4 97.6" strokeDashoffset="-97.6" />
                    </svg>
                    <div className="absolute flex flex-col items-center text-center">
                      <span className="text-[10px] font-black text-slate-805 leading-none">1.283</span>
                      <span className="text-[7.5px] font-bold text-slate-400 uppercase mt-0.5 leading-none">mW</span>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div className="space-y-1.5 text-[9px] font-sans font-bold text-slate-500 flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-1">
                      <span className="flex items-center gap-1 truncate"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />Internal Power</span>
                      <span className="font-mono text-slate-400 shrink-0">50.1%</span>
                    </div>
                    <div className="flex justify-between items-center gap-1">
                      <span className="flex items-center gap-1 truncate"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />Switching Power</span>
                      <span className="font-mono text-slate-400 shrink-0">32.1%</span>
                    </div>
                    <div className="flex justify-between items-center gap-1">
                      <span className="flex items-center gap-1 truncate"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />Leakage Power</span>
                      <span className="font-mono text-slate-400 shrink-0">15.4%</span>
                    </div>
                    <div className="flex justify-between items-center gap-1">
                      <span className="flex items-center gap-1 truncate"><span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />Clock Power</span>
                      <span className="font-mono text-slate-400 shrink-0">2.4%</span>
                    </div>
                  </div>
                </div>

                {/* Footer link */}
                <div className="text-center pt-2.5 border-t border-slate-100">
                  <button 
                    onClick={() => alert("Open detailed leakage / dynamic power simulation reports")}
                    className="text-blue-600 hover:underline text-[9px] font-bold uppercase tracking-wider"
                  >
                    View Power Report
                  </button>
                </div>
              </div>

              {/* 2. Timing Summary */}
              <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-[230px] font-sans">
                <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Timing Summary
                </h3>

                {/* Horizontal Progress Bars */}
                <div className="space-y-1.5 py-1 text-[8.5px] font-sans font-bold text-slate-500 leading-none">
                  {/* Clock Period */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between"><span>Clock Period</span><span className="text-slate-800 font-mono font-bold">10.00 ns</span></div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-600 h-full rounded-full" style={{ width: "83.3%" }} /></div>
                  </div>
                  {/* WNS */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between"><span>WNS</span><span className="text-emerald-600 font-mono font-bold">+0.842 ns</span></div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full rounded-full" style={{ width: "65%" }} /></div>
                  </div>
                  {/* TNS */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between"><span>TNS</span><span className="text-emerald-600 font-mono font-bold">0.000 ns</span></div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full rounded-full" style={{ width: "0%" }} /></div>
                  </div>
                  {/* Worst Path Delay */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between"><span>Worst Path Delay</span><span className="text-slate-850 font-mono font-bold">9.158 ns</span></div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-600 h-full rounded-full" style={{ width: "76.3%" }} /></div>
                  </div>
                  {/* Worst Slack */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between"><span>Worst Slack</span><span className="text-emerald-600 font-mono font-bold">+0.842 ns</span></div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full rounded-full" style={{ width: "65%" }} /></div>
                  </div>
                </div>

                {/* Footer link */}
                <div className="text-center pt-2.5 border-t border-slate-100">
                  <button 
                    onClick={() => alert("Open detailed logic slack path delay analysis reports")}
                    className="text-blue-600 hover:underline text-[9px] font-bold uppercase tracking-wider"
                  >
                    View Timing Report
                  </button>
                </div>
              </div>

              {/* 3. Area Utilization Treemap */}
              <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-[230px] font-sans">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Area Utilization
                </h3>

                {/* Grid Treemap visual representation */}
                <div className="flex gap-1.5 h-[115px] select-none text-[8.5px] font-bold text-white font-sans leading-none pt-1">
                  
                  {/* Left: Standard Cells */}
                  <div className="flex-1 bg-indigo-600 rounded-xl p-2 flex flex-col justify-between hover:opacity-90 cursor-pointer">
                    <span className="opacity-90 block">Standard Cells</span>
                    <div>
                      <span className="block opacity-90 text-[8px] font-medium font-mono leading-none">59,745.21 µm²</span>
                      <span className="text-sm font-black font-mono mt-1 block">68.2%</span>
                    </div>
                  </div>

                  {/* Right Blocks */}
                  <div className="w-[45%] flex flex-col gap-1.5 text-[7px] font-medium">
                    
                    {/* Top Right: I/O and Memory */}
                    <div className="flex gap-1.5 h-[50%]">
                      <div className="flex-1 bg-blue-600 rounded-lg p-1.5 flex flex-col justify-between hover:opacity-90 cursor-pointer">
                        <span className="block truncate">I/O Cells</span>
                        <span className="text-[10px] font-black font-mono block">15.6%</span>
                      </div>
                      <div className="flex-1 bg-blue-800 rounded-lg p-1.5 flex flex-col justify-between hover:opacity-90 cursor-pointer">
                        <span className="block truncate">Memory</span>
                        <span className="text-[10px] font-black font-mono block">8.7%</span>
                      </div>
                    </div>

                    {/* Bottom Right: Clock & Others */}
                    <div className="flex gap-1.5 h-[50%]">
                      <div className="flex-1 bg-orange-500 rounded-lg p-1.5 flex flex-col justify-between hover:opacity-90 cursor-pointer">
                        <span className="block truncate">Clock</span>
                        <span className="text-[10px] font-black font-mono block">4.5%</span>
                      </div>
                      <div className="flex-1 bg-yellow-500 rounded-lg p-1.5 flex flex-col justify-between hover:opacity-90 cursor-pointer text-slate-800">
                        <span className="block truncate">Others</span>
                        <span className="text-[10px] font-black font-mono block">3.0%</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer link */}
                <div className="text-center pt-2.5 border-t border-slate-100">
                  <button 
                    onClick={() => alert("Open hierarchical layout area report")}
                    className="text-blue-600 hover:underline text-[9px] font-bold uppercase tracking-wider"
                  >
                    View Area Report
                  </button>
                </div>
              </div>

            </div>

            {/* Design Hotspots Table */}
            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-xs font-sans">
              <h3 className="text-xs font-bold text-slate-800 uppercase border-b border-slate-100 pb-3 mb-4 tracking-wider">
                Design Hotspots
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 text-[9px] uppercase font-bold">
                      <th className="p-3">Type</th>
                      <th className="p-3">Instance / Net</th>
                      <th className="p-3">Metric</th>
                      <th className="p-3">Value</th>
                      <th className="p-3">% of Total</th>
                      <th className="p-3">Impact</th>
                      <th className="p-3">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700 font-sans">
                    {hotspotsData.map((row) => (
                      <tr key={row.type} className="hover:bg-slate-50/50 transition">
                        <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                          <span className={`p-1 rounded ${row.color}`}>
                            <row.icon className="w-3.5 h-3.5" />
                          </span>
                          <span>{row.type}</span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-500 truncate max-w-[170px]" title={row.net}>{row.net}</td>
                        <td className="p-3 text-slate-400 font-medium">{row.metric}</td>
                        <td className="p-3 font-mono font-bold text-slate-800">{row.val}</td>
                        <td className="p-3 font-mono text-slate-400">{row.pct}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded border text-[8px] font-bold uppercase tracking-wider ${row.impColor}`}>
                            {row.impact}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-600">{row.rec}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* View all hotspot footer */}
              <div className="text-center pt-5 border-t border-slate-100 mt-4">
                <button 
                  onClick={() => alert("Open global hot spots inspector")}
                  className="text-blue-600 hover:underline text-xs font-bold font-sans"
                >
                  View Full Hotspot Report
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Score overlays, Suggestions list, trend graph */}
          <div className="md:col-span-3 space-y-6 font-sans">
            
            {/* Overall Design Score */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-between text-center space-y-4">
              <div className="text-left w-full">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Overall Design Score</h3>
              </div>
              
              {/* Radial green progress bar ring */}
              <div className="flex items-center gap-4 py-2 w-full select-none text-left">
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke="#10b981" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="251.2" 
                      strokeDashoffset="10" 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-black font-mono text-slate-900 leading-none">96</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 leading-none">/ 100</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-600">Excellent</span>
                  <p className="text-[9.5px] text-slate-500 leading-relaxed font-sans font-semibold">
                    Your design quality is excellent. Minor optimizations possible for better efficiency.
                  </p>
                </div>
              </div>

              {/* Poor/Fair/Good/Excellent range bar */}
              <div className="w-full space-y-2">
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden relative flex">
                  <div className="w-[25%] h-full bg-red-400" />
                  <div className="w-[25%] h-full bg-orange-400" />
                  <div className="w-[25%] h-full bg-yellow-400" />
                  <div className="w-[25%] h-full bg-emerald-500" />
                  
                  {/* Selector indicator */}
                  <div className="absolute top-1/2 -translate-y-1/2 right-[10%] w-3 h-3 rounded-full bg-slate-900 border-2 border-white shadow-md" />
                </div>
                <div className="flex justify-between text-[7.5px] font-bold text-slate-400 uppercase tracking-wide px-0.5">
                  <span>Poor</span>
                  <span>Fair</span>
                  <span>Good</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>

            {/* Optimization Suggestions list */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Optimization Suggestions</h3>
              </div>

              <div className="space-y-3 text-[10.5px] font-sans font-semibold text-slate-600">
                {[
                  { title: "Reduce leakage power by resizing high leakage cells", level: "High", color: "bg-red-50 text-red-600 border-red-100" },
                  { title: "Optimize critical path in alu_top.gds:3412", level: "Medium", color: "bg-amber-50 text-amber-600 border-amber-100" },
                  { title: "Consider upsizing drivers on long nets", level: "Medium", color: "bg-amber-50 text-amber-600 border-amber-100" },
                  { title: "Clock gating can save ~12% total power", level: "Low", color: "bg-blue-50 text-blue-600 border-blue-100" }
                ].map((s, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-start gap-3">
                    <span className="leading-relaxed font-sans">{s.title}</span>
                    <span className={`px-2 py-0.5 rounded border text-[8.5px] tracking-wider uppercase font-bold shrink-0 mt-0.5 ${s.color}`}>{s.level}</span>
                  </div>
                ))}
              </div>

              <div className="text-center pt-1.5">
                <button 
                  onClick={() => alert("Open optimization suggestion database")}
                  className="text-blue-600 hover:underline text-xs font-bold font-sans"
                >
                  View All Suggestions
                </button>
              </div>
            </div>

            {/* Trend Analysis (Last 5 runs) */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Trend Analysis</h3>
                <div className="bg-slate-50 border border-slate-200 px-2 py-1 rounded text-[9px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer select-none">
                  <span>{trendMetric}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* Line chart trend representation */}
              <div className="h-36 relative select-none font-mono text-[8px] text-[#999999] pt-1">
                {/* Y Axis */}
                <div className="absolute left-0 bottom-4 top-0 flex flex-col justify-between text-right w-7 select-none">
                  <span>100K</span>
                  <span>90K</span>
                  <span>80K</span>
                  <span>70K</span>
                  <span>60K</span>
                </div>

                {/* Graph Lines grid SVG */}
                <svg className="absolute left-8 right-0 bottom-6 top-1.5 w-[80%] h-[75%] overflow-visible">
                  {/* Grid background horizontal lines */}
                  <line x1="0" y1="0" x2="100%" y2="0" stroke="#f1f5f9" strokeWidth="0.8" />
                  <line x1="0" y1="20" x2="100%" y2="20" stroke="#f1f5f9" strokeWidth="0.8" />
                  <line x1="0" y1="40" x2="100%" y2="40" stroke="#f1f5f9" strokeWidth="0.8" />
                  <line x1="0" y1="60" x2="100%" y2="60" stroke="#f1f5f9" strokeWidth="0.8" />
                  <line x1="0" y1="80" x2="100%" y2="80" stroke="#f1f5f9" strokeWidth="0.8" />

                  {/* Trend line path (total area data points) */}
                  <path 
                    d="M 5,20 L 35,22 L 65,40 L 95,40 L 125,58" 
                    fill="none" 
                    stroke="#6366f1" 
                    strokeWidth="1.8" 
                    strokeLinecap="round" 
                  />

                  {/* Dots at data points */}
                  <circle cx="5" cy="20" r="2.5" fill="#6366f1" stroke="#fff" strokeWidth="1" />
                  <circle cx="35" cy="22" r="2.5" fill="#6366f1" stroke="#fff" strokeWidth="1" />
                  <circle cx="65" cy="40" r="2.5" fill="#6366f1" stroke="#fff" strokeWidth="1" />
                  <circle cx="95" cy="40" r="2.5" fill="#6366f1" stroke="#fff" strokeWidth="1" />
                  <circle cx="125" cy="58" r="2.5" fill="#6366f1" stroke="#fff" strokeWidth="1" />
                </svg>

                {/* X Axis dates */}
                <div className="absolute left-8 right-0 bottom-0 flex justify-between select-none font-sans text-[7.5px] font-bold text-slate-400 pr-1">
                  <span>May 26</span>
                  <span>May 27</span>
                  <span>May 28</span>
                  <span>May 29</span>
                  <span>May 30</span>
                </div>

                {/* Legend indicator */}
                <div className="absolute right-0 top-1 text-[7px] font-sans font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span className="text-slate-400 uppercase">Total Area</span>
                </div>
              </div>

              {/* View all trends */}
              <div className="text-center pt-1 border-t border-slate-100 mt-2">
                <button 
                  onClick={() => alert("Open global history trend charts")}
                  className="text-blue-600 hover:underline text-xs font-bold font-sans"
                >
                  View All Trends
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Footer copyright timestamp info */}
      <div className="px-8 py-3 bg-white border-t border-slate-150 flex justify-between items-center text-[10px] text-slate-400 font-sans font-bold select-none shrink-0 mt-auto">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Analysis updated on May 30, 25 02:48 PM</span>
        </div>
        <span>Data is based on post-synthesis results</span>
      </div>

    </div>
  );
}
