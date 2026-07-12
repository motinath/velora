"use client";

import React, { useState } from "react";
import { useAppContext } from "../../app/providers";
import { 
  Search, 
  Bell, 
  HelpCircle, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  FileText, 
  Download, 
  MoreVertical, 
  Filter, 
  CheckCircle, 
  ExternalLink, 
  FileCode, 
  Settings, 
  Activity,
  Layers,
  Cpu,
  Code,
  ShieldCheck,
  Target,
  FileCheck,
  BarChart2,
  GitCommit,
  Link
} from "lucide-react";

export function VerificationView() {
  const { activeProject, activeDesign } = useAppContext();

  // Tab states
  const [activeTab, setActiveTab] = useState<"overview" | "drc" | "lvs" | "erc" | "lint" | "formal" | "assertions" | "coverage">("overview");
  const [activeIssuesTab, setActiveIssuesTab] = useState<"all" | "drc" | "lvs" | "erc" | "lint" | "assertions">("all");
  const [issuesSearch, setIssuesSearch] = useState("");

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-sans bg-[#f8fafc]">
        Select or create a project to launch the Verification Workspace.
      </div>
    );
  }

  // Resolve dynamic verification results
  const constraintResults = activeDesign?.constraint_results_json;
  const hasResults = !!constraintResults;

  const errors = constraintResults?.errors || [];
  const warnings = constraintResults?.warnings || [];

  // Parse errors/warnings categories
  const drcErrors = errors.filter((e: string) => e.includes("DRC") || e.toLowerCase().includes("width") || e.toLowerCase().includes("length"));
  const ercErrors = errors.filter((e: string) => !drcErrors.includes(e));

  const drcWarnings = warnings.filter((e: string) => e.includes("DRC") || e.toLowerCase().includes("width") || e.toLowerCase().includes("length"));
  const ercWarnings = warnings.filter((e: string) => !drcWarnings.includes(e));

  // Verification results list matching mockup screenshot
  const verificationResults = [
    { name: "DRC", status: drcErrors.length > 0 ? "Failed" : "Passed", errors: drcErrors.length, warnings: drcWarnings.length, time: "00:00:12", icon: Layers, color: drcErrors.length > 0 ? "text-red-500 bg-red-50" : "text-blue-500 bg-blue-50" },
    { name: "LVS", status: "Passed", errors: 0, warnings: 0, time: "00:00:08", icon: Link, color: "text-emerald-500 bg-emerald-50" },
    { name: "ERC", status: ercErrors.length > 0 ? "Failed" : "Passed", errors: ercErrors.length, warnings: ercWarnings.length, time: "00:00:05", icon: Cpu, color: ercErrors.length > 0 ? "text-red-500 bg-red-50" : "text-amber-500 bg-amber-50" },
    { name: "Lint", status: "Passed", errors: 0, warnings: 2, time: "00:00:03", icon: Code, color: "text-purple-500 bg-purple-50" },
    { name: "Formal Verification", status: "Passed", errors: 0, warnings: 0, time: "00:00:15", icon: ShieldCheck, color: "text-indigo-500 bg-indigo-50" },
    { name: "Assertions", status: "Passed", errors: 0, warnings: 0, time: "00:00:02", icon: Target, color: "text-rose-500 bg-rose-50" },
    { name: "Coverage", status: "Passed", errors: 0, warnings: 0, time: "00:00:04", icon: BarChart2, color: "text-cyan-500 bg-cyan-50" }
  ];

  // Recent issues table data
  const recentIssuesList: any[] = [];
  
  if (hasResults) {
    drcErrors.forEach((msg: string, i: number) => {
      recentIssuesList.push({
        type: "DRC",
        check: "MinWidth",
        msg,
        loc: `${activeProject.name.toLowerCase()}/layout/top.gds`,
        severity: "Error",
        typeColor: "text-red-600 bg-red-50 border-red-100"
      });
    });

    ercErrors.forEach((msg: string, i: number) => {
      recentIssuesList.push({
        type: "ERC",
        check: "FloatingPin",
        msg,
        loc: `${activeProject.name.toLowerCase()}/schematic/top.sch`,
        severity: "Error",
        typeColor: "text-red-600 bg-red-50 border-red-100"
      });
    });

    drcWarnings.forEach((msg: string, i: number) => {
      recentIssuesList.push({
        type: "DRC",
        check: "Spacing",
        msg,
        loc: `${activeProject.name.toLowerCase()}/layout/top.gds`,
        severity: "Warning",
        typeColor: "text-blue-600 bg-blue-50 border-blue-100"
      });
    });

    ercWarnings.forEach((msg: string, i: number) => {
      recentIssuesList.push({
        type: "ERC",
        check: "FloatingBulk",
        msg,
        loc: `${activeProject.name.toLowerCase()}/schematic/top.sch`,
        severity: "Warning",
        typeColor: "text-amber-600 bg-amber-50 border-amber-100"
      });
    });
  } else {
    recentIssuesList.push(
      { type: "DRC", check: "MinWidth", msg: "Metal1 width 0.12/µm is less than minimum 0.15/µm", loc: `${activeProject.name.toLowerCase()}/layout/top.gds:3421`, severity: "Warning", typeColor: "text-blue-600 bg-blue-50 border-blue-100" },
      { type: "DRC", check: "MinSpacing", msg: "Metal1 spacing 0.11/µm is less than minimum 0.14/µm", loc: `${activeProject.name.toLowerCase()}/layout/top.gds:3456`, severity: "Warning", typeColor: "text-blue-600 bg-blue-50 border-blue-100" },
      { type: "ERC", check: "UnconnectedPin", msg: "Pin VDD of instance U12 is unconnected", loc: `${activeProject.name.toLowerCase()}/schematic/top.sch:178`, severity: "Warning", typeColor: "text-amber-600 bg-amber-50 border-amber-100" }
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#f8fafc] font-sans select-text">
      
      {/* Top Header Section */}
      <div className="flex justify-between items-center px-8 py-5 bg-white border-b border-slate-100 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">Verification</h1>
          <p className="text-xs text-slate-505 mt-1 font-sans">
            Run verification checks and ensure design correctness before tapeout.
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Custom Search Input */}
          <div className="relative w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects, modules, files..."
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
            { id: "overview", label: "Overview" },
            { id: "drc", label: "DRC" },
            { id: "lvs", label: "LVS" },
            { id: "erc", label: "ERC" },
            { id: "lint", label: "Lint" },
            { id: "formal", label: "Formal" },
            { id: "assertions", label: "Assertions" },
            { id: "coverage", label: "Coverage" }
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
          onClick={() => alert("Launching complete hardware tapeout checks suite...")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition mb-1"
        >
          <Play className="w-3.5 h-3.5 fill-white text-white" />
          <span>Run Verification</span>
          <ChevronDown className="w-3 h-3 text-blue-250 border-l border-blue-500 pl-1 ml-1" />
        </button>
      </div>

      {/* Verification Parameters Bar */}
      <div className="px-8 py-4 bg-white border-b border-slate-150 flex flex-wrap items-center justify-between gap-4 select-none shrink-0 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
        <div className="flex flex-wrap items-center gap-8">
          {[
            { label: "Project", val: activeProject.name },
            { label: "Top Module", val: activeProject.design_type },
            { label: "Technology", val: activeProject.technology },
            { label: "Rule Deck", val: `${activeProject.technology}A` }
          ].map((cfg) => (
            <div key={cfg.label} className="space-y-1">
              <span className="block text-[9px] text-slate-400">{cfg.label}</span>
              <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer lowercase">
                <span className="capitalize">{cfg.val}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          ))}

          {/* Timestamp fields */}
          <div className="space-y-1">
            <span className="block text-[9px] text-slate-400">Last Run</span>
            <span className="block text-slate-750 font-bold text-xs pt-1.5 font-mono lowercase">
              {activeDesign?.created_at ? new Date(activeDesign.created_at).toLocaleString() : "just now"}
            </span>
          </div>

          <div className="space-y-1">
            <span className="block text-[9px] text-slate-400">Run By</span>
            <span className="block text-slate-750 font-bold text-xs pt-1.5 lowercase">system</span>
          </div>

          {/* Status field */}
          <div className="space-y-1">
            <span className="block text-[9px] text-slate-400">Status</span>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-2.5 py-1 rounded-lg mt-0.5 lowercase font-sans">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="capitalize">Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid layout wrapper */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Results Tables & Summaries */}
        <div className="md:col-span-9 space-y-6">
          
          {/* Row of 5 Horizontal Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            {/* DRC Status */}
            <div className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col justify-between shadow-xs h-28 font-sans">
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>DRC</span>
              </div>
              <div className="pt-2">
                <span className="text-xl font-bold font-mono text-slate-805">0</span>
                <span className="text-[10px] text-slate-400 font-sans font-bold ml-1">Errors</span>
              </div>
              <div className="text-[10px] text-slate-400 font-bold font-sans">
                <span className="text-amber-500">145</span> Warnings
              </div>
            </div>

            {/* LVS Status */}
            <div className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col justify-between shadow-xs h-28 font-sans">
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>LVS</span>
              </div>
              <div className="pt-2">
                <span className="text-xl font-bold font-mono text-slate-805">0</span>
                <span className="text-[10px] text-slate-400 font-sans font-bold ml-1">Errors</span>
              </div>
              <div className="text-[10px] text-slate-400 font-bold font-sans">
                <span className="text-amber-500">12</span> Warnings
              </div>
            </div>

            {/* ERC Status */}
            <div className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col justify-between shadow-xs h-28 font-sans">
              <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[10px] uppercase">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>ERC</span>
              </div>
              <div className="pt-2">
                <span className="text-xl font-bold font-mono text-slate-805">0</span>
                <span className="text-[10px] text-slate-400 font-sans font-bold ml-1">Errors</span>
              </div>
              <div className="text-[10px] text-slate-400 font-bold font-sans">
                <span className="text-amber-500">8</span> Warnings
              </div>
            </div>

            {/* Lint Status */}
            <div className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col justify-between shadow-xs h-28 font-sans">
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Lint</span>
              </div>
              <div className="pt-2">
                <span className="text-xl font-bold font-mono text-slate-805">0</span>
                <span className="text-[10px] text-slate-400 font-sans font-bold ml-1">Errors</span>
              </div>
              <div className="text-[10px] text-slate-400 font-bold font-sans">
                <span className="text-amber-500">23</span> Warnings
              </div>
            </div>

            {/* Formal Status */}
            <div className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col justify-between shadow-xs h-28 font-sans">
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Formal</span>
              </div>
              <div className="pt-2">
                <span className="text-xl font-bold font-mono text-emerald-600">12</span>
                <span className="text-[10px] text-emerald-500 font-sans font-bold ml-1">Passed</span>
              </div>
              <div className="text-[10px] text-slate-400 font-bold font-sans">
                <span>0</span> Failed
              </div>
            </div>

          </div>

          {/* Verification Results Table */}
          <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-xs font-sans">
            <h3 className="text-xs font-bold text-slate-800 uppercase border-b border-slate-100 pb-3 mb-4 tracking-wider">
              Verification Results
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 text-[9px] uppercase font-bold">
                    <th className="p-3">Check</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Errors</th>
                    <th className="p-3">Warnings</th>
                    <th className="p-3">Run Time</th>
                    <th className="p-3">Details</th>
                    <th className="p-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-700 font-sans">
                  {verificationResults.map((row) => (
                    <tr key={row.name} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                        <span className={`p-1 rounded ${row.color}`}>
                          <row.icon className="w-3.5 h-3.5" />
                        </span>
                        <span>{row.name}</span>
                      </td>
                      <td className="p-3">
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-2 py-0.5 rounded text-[8.5px] uppercase tracking-wide">
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">{row.errors}</td>
                      <td className="p-3 font-mono font-bold text-amber-500">{row.warnings || "0"}</td>
                      <td className="p-3 font-mono text-slate-450">{row.time}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => alert(`Opening verification details: ${row.name}`)}
                          className="text-blue-600 hover:underline font-bold text-[9px] uppercase tracking-wide flex items-center gap-1"
                        >
                          <span>View Report</span>
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <MoreVertical className="w-3.5 h-3.5 text-slate-350 cursor-pointer inline hover:text-slate-655" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Issues Section */}
          <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-xs font-sans">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-4 select-none">
              
              {/* Category tabs filters */}
              <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {[
                  { id: "all", label: "All (190)" },
                  { id: "drc", label: "DRC (145)" },
                  { id: "lvs", label: "LVS (12)" },
                  { id: "erc", label: "ERC (8)" },
                  { id: "lint", label: "Lint (23)" },
                  { id: "assertions", label: "Assertions (2)" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveIssuesTab(tab.id as any)}
                    className={`pb-1.5 transition relative font-bold ${
                      activeIssuesTab === tab.id
                        ? "text-blue-600 border-b-2 border-blue-600 font-black"
                        : "hover:text-slate-750"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Inner Search Box */}
              <div className="flex items-center gap-2">
                <div className="relative w-44">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={issuesSearch}
                    onChange={(e) => setIssuesSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-805 pl-8 pr-2 py-1.5 rounded-lg outline-none font-sans"
                  />
                </div>
                <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition"><Filter className="w-3.5 h-3.5 text-slate-400" /></button>
              </div>
            </div>

            {/* Issues Log Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 text-[9px] uppercase font-bold">
                    <th className="p-3">Type</th>
                    <th className="p-3">Check</th>
                    <th className="p-3">Message</th>
                    <th className="p-3">Location</th>
                    <th className="p-3 text-right">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-700">
                  {recentIssuesList
                    .filter(x => x.check.toLowerCase().includes(issuesSearch.toLowerCase()) || x.msg.toLowerCase().includes(issuesSearch.toLowerCase()))
                    .map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition text-[10.5px]">
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-mono text-[9px] border font-bold ${row.typeColor}`}>
                            {row.type}
                          </span>
                        </td>
                        <td className="p-3 text-slate-550 font-bold">{row.check}</td>
                        <td className="p-3 text-slate-655 font-medium">{row.msg}</td>
                        <td className="p-3 font-mono font-bold text-slate-500 truncate max-w-[170px]" title={row.loc}>
                          {row.loc}
                        </td>
                        <td className="p-3 text-right">
                          <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-100 text-amber-600 text-[8.5px] font-bold uppercase tracking-wider">
                            {row.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Footer View All */}
            <div className="text-center pt-5 border-t border-slate-100">
              <button 
                onClick={() => alert("Open global problems list")}
                className="text-blue-600 hover:underline text-xs font-bold font-sans"
              >
                View All Issues
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Circular Quality, Scorecard & Saved Reports */}
        <div className="md:col-span-3 space-y-6 font-sans">
          
          {/* Overall Quality Radial Gauge */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-between text-center space-y-4">
            <div className="text-left w-full">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Overall Quality</h3>
            </div>
            
            {/* Radial Green Ring */}
            <div className="relative w-28 h-28 flex items-center justify-center select-none">
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
                  strokeDashoffset="0" 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black font-mono text-slate-900 leading-none">100%</span>
                <span className="text-[8.5px] text-slate-400 font-bold uppercase mt-1">Passed</span>
              </div>
            </div>

            {/* Color legends */}
            <div className="space-y-2 text-[9.5px] font-sans font-bold text-slate-500 w-full text-left">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Passed</span>
                <span className="font-mono text-slate-800 font-bold">7</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />Warnings</span>
                <span className="font-mono text-slate-800 font-bold">190</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />Failed</span>
                <span className="font-mono text-slate-800 font-bold">0</span>
              </div>
            </div>
          </div>

          {/* Quality Metrics Scorecard (2x2 Grid boxes) */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quality Metrics</h3>
            
            <div className="grid grid-cols-2 gap-3.5">
              
              <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
                <span className="block text-[8.5px] font-bold text-slate-400 uppercase">Total Checks</span>
                <span className="block text-xl font-bold font-mono text-slate-805 mt-1 leading-none">7</span>
              </div>
              
              <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
                <span className="block text-[8.5px] font-bold text-slate-400 uppercase">Total Errors</span>
                <span className="block text-xl font-bold font-mono text-slate-805 mt-1 leading-none">0</span>
              </div>
              
              <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
                <span className="block text-[8.5px] font-bold text-slate-400 uppercase">Total Warnings</span>
                <span className="block text-xl font-bold font-mono text-slate-805 mt-1 leading-none">190</span>
              </div>
              
              <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
                <span className="block text-[8.5px] font-bold text-slate-400 uppercase">Run Time</span>
                <span className="block text-[11px] font-bold font-mono text-slate-805 mt-1.5 leading-none">00:06:25</span>
              </div>

            </div>
          </div>

          {/* Recent Runs list */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Runs</h3>
              <button className="text-[9px] font-bold text-blue-600 hover:underline">View All</button>
            </div>

            <div className="space-y-2.5 text-xs font-semibold text-slate-655 font-sans">
              {[
                { date: "May 30, 2025 02:45 PM" },
                { date: "May 30, 2025 11:32 AM" },
                { date: "May 28, 2025 10:15 PM" }
              ].map((run, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl">
                  <span className="font-mono text-[9.5px] text-slate-500 truncate max-w-[55%]">{run.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold">
                      Completed
                    </span>
                    <Download className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reports Downloads List */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-805 uppercase tracking-wider">Reports</h3>
              <button className="text-[9px] font-bold text-blue-600 hover:underline">View All</button>
            </div>

            <div className="space-y-3 font-semibold text-slate-655 font-sans">
              {[
                { name: "drc_report.html", size: "186 KB", date: "May 30, 2025 02:45 PM" },
                { name: "lvs_report.html", size: "142 KB", date: "May 30, 2025 02:45 PM" },
                { name: "erc_report.html", size: "98 KB", date: "May 30, 2025 02:45 PM" },
                { name: "lint_report.html", size: "121 KB", date: "May 30, 2025 02:45 PM" },
                { name: "formal_report.html", size: "210 KB", date: "May 30, 2025 02:45 PM" }
              ].map((r) => (
                <div key={r.name} className="flex justify-between items-center hover:text-slate-800 cursor-pointer group">
                  <div className="flex items-start gap-2.5 max-w-[80%]">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-700 font-bold block truncate group-hover:text-blue-600 transition" title={r.name}>
                        {r.name}
                      </span>
                      <span className="text-[8.5px] text-slate-400 font-mono block mt-0.5">
                        {r.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[8.5px] text-slate-400 font-mono">{r.size}</span>
                    <Download className="w-3.5 h-3.5 text-slate-400 hover:text-slate-650" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
