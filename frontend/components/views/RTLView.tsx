"use client";

import React, { useState } from "react";
import { useAppContext } from "../../app/providers";
import { 
  Search, 
  Bell, 
  ChevronDown, 
  ChevronRight,
  Plus, 
  Folder, 
  FileCode, 
  Terminal, 
  Sparkles,
  HelpCircle,
  MoreVertical,
  RefreshCw,
  FolderPlus,
  Settings,
  Trash2,
  Filter,
  CheckCircle,
  Columns,
  Maximize2,
  ExternalLink
} from "lucide-react";

export function RTLView() {
  const {
    activeProject,
    handleSelect
  } = useAppContext();

  // Tab & UI Panel States
  const [activeTab, setActiveTab] = useState<"editor" | "explorer" | "build" | "terminal" | "git">("editor");
  const [activeEditorTab, setActiveEditorTab] = useState<string>("alu_32bit.sv");
  const [activeLogTab, setActiveLogTab] = useState<"problems" | "output" | "terminal" | "lint">("problems");
  const [fileSearch, setFileSearch] = useState("");
  const [isFolderOpen, setIsFolderOpen] = useState({
    project: true,
    rtl: true,
    tb: false,
    constraints: false,
    scripts: false,
    docs: false
  });

  const toggleFolder = (name: keyof typeof isFolderOpen) => {
    setIsFolderOpen(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const codeString = `// 32-bit ALU
// Author: Motinath

module alu_32bit (
    input  logic        clk,
    input  logic        rst_n,
    input  logic [31:0] a,
    input  logic [31:0] b,
    input  logic [3:0]  alu_ctrl,
    output logic [31:0] y,
    output logic        zero,
    output logic        carry,
    output logic        overflow
);
import alu_pkg::*;

logic [31:0] result;
logic        c_out;

always_comb begin
    result   = '0;
    c_out    = 1'b0;
    overflow = 1'b0;

    unique case (alu_ctrl)
        ALU_ADD:     {c_out, result} = a + b;
        ALU_SUB:     {c_out, result} = a - b;
        ALU_AND:     result = a & b;
        ALU_OR:      result = a | b;
        ALU_XOR:     result = a ^ b;
        ALU_SLL:     result = a << b[4:0];
        ALU_SRL:     result = a >> b[4:0];
        ALU_SRA:     result = $signed(a) >>> b[4:0];
        ALU_SLT:     result = ($signed(a) < $signed(b)) ? 32'd1 : 32'd0;
        default:     result = 32'h0;
    endcase
end`;

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-sans bg-[#f8fafc]">
        Select or create a project to launch the RTL Studio Workspace.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#f8fafc] font-sans select-text">
      
      {/* Top Header Section */}
      <div className="flex justify-between items-center px-8 py-5 bg-white border-b border-slate-100 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">RTL Studio</h1>
          <p className="text-xs text-slate-505 mt-1 font-sans">
            Write, edit and manage your RTL files with integrated tools.
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Custom Search Input */}
          <div className="relative w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search files, modules..."
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

          {/* Help Icon */}
          <button className="text-slate-400 hover:text-slate-700 transition">
            <HelpCircle className="w-5 h-5" />
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
            { id: "editor", label: "Editor" },
            { id: "explorer", label: "File Explorer" },
            { id: "build", label: "Build & Lint" },
            { id: "terminal", label: "Terminal" },
            { id: "git", label: "Git" }
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

        {/* Action Panel Button toggles */}
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700">
            <span>SystemVerilog</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <button
            onClick={() => alert("Launching RTL silicon design assistant")}
            className="border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition font-sans"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Assistant</span>
          </button>

          <button
            onClick={() => alert("Create new blank netlist logic file")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition"
          >
            <span>+ New File</span>
            <ChevronDown className="w-3 h-3 text-blue-250 border-l border-blue-500 pl-1 ml-1" />
          </button>
        </div>
      </div>

      {/* Grid columns layout container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden min-h-0">
        
        {/* Left Column: File Explorer Tree */}
        <div className="md:col-span-3 border-r border-slate-150 bg-white flex flex-col h-full overflow-y-auto shrink-0 select-none p-5">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            <span>File Explorer</span>
            <div className="flex items-center gap-2 text-slate-400">
              <button className="hover:text-slate-750"><RefreshCw className="w-3.5 h-3.5" /></button>
              <button className="hover:text-slate-750"><FolderPlus className="w-3.5 h-3.5" /></button>
              <button className="hover:text-slate-750"><MoreVertical className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <div className="relative shrink-0 mb-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={fileSearch}
              onChange={(e) => setFileSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 pl-8 pr-2 py-1.5 rounded-lg outline-none font-sans"
            />
          </div>

          {/* Directory Hierarchy Tree */}
          <div className="flex-1 overflow-y-auto text-xs font-semibold text-slate-600 font-sans space-y-1.5 pr-1">
            {/* Top Project Folder */}
            <div>
              <div 
                onClick={() => toggleFolder("project")}
                className="flex items-center gap-1.5 py-1 hover:text-slate-800 cursor-pointer"
              >
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition ${isFolderOpen.project ? "" : "-rotate-90"}`} />
                <Folder className="w-4 h-4 text-blue-500 fill-blue-50" />
                <span className="text-blue-600 font-bold">alu_32bit_project</span>
              </div>

              {isFolderOpen.project && (
                <div className="pl-4 space-y-1.5 mt-1.5 border-l border-slate-100 ml-2">
                  
                  {/* rtl folder */}
                  <div>
                    <div 
                      onClick={() => toggleFolder("rtl")}
                      className="flex items-center gap-1.5 py-1 hover:text-slate-800 cursor-pointer"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition ${isFolderOpen.rtl ? "" : "-rotate-90"}`} />
                      <Folder className="w-4 h-4 text-slate-450 fill-slate-50" />
                      <span>rtl</span>
                    </div>

                    {isFolderOpen.rtl && (
                      <div className="pl-5 space-y-1 mt-1 text-[11px] font-medium text-slate-550">
                        {[
                          { name: "alu_32bit.sv" },
                          { name: "alu_control.sv" },
                          { name: "alu_pkg.sv" },
                          { name: "alu_types.sv" }
                        ].map((file) => {
                          const isActive = activeEditorTab === file.name;
                          return (
                            <div
                              key={file.name}
                              onClick={() => setActiveEditorTab(file.name)}
                              className={`flex items-center gap-2 py-1 px-2.5 rounded-md cursor-pointer transition ${
                                isActive ? "bg-blue-50 text-blue-600 font-bold" : "hover:bg-slate-50 hover:text-slate-800"
                              }`}
                            >
                              <FileCode className={`w-3.5 h-3.5 ${isActive ? "text-blue-500" : "text-slate-400"}`} />
                              <span>{file.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* tb folder */}
                  <div>
                    <div 
                      onClick={() => toggleFolder("tb")}
                      className="flex items-center gap-1.5 py-1 hover:text-slate-800 cursor-pointer"
                    >
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition ${isFolderOpen.tb ? "rotate-90" : ""}`} />
                      <Folder className="w-4 h-4 text-slate-450 fill-slate-50" />
                      <span>tb</span>
                    </div>
                  </div>

                  {/* constraints folder */}
                  <div>
                    <div 
                      onClick={() => toggleFolder("constraints")}
                      className="flex items-center gap-1.5 py-1 hover:text-slate-800 cursor-pointer"
                    >
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition ${isFolderOpen.constraints ? "rotate-90" : ""}`} />
                      <Folder className="w-4 h-4 text-slate-450 fill-slate-50" />
                      <span>constraints</span>
                    </div>
                  </div>

                  {/* scripts folder */}
                  <div>
                    <div 
                      onClick={() => toggleFolder("scripts")}
                      className="flex items-center gap-1.5 py-1 hover:text-slate-800 cursor-pointer"
                    >
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition ${isFolderOpen.scripts ? "rotate-90" : ""}`} />
                      <Folder className="w-4 h-4 text-slate-450 fill-slate-50" />
                      <span>scripts</span>
                    </div>
                  </div>

                  {/* docs folder */}
                  <div>
                    <div 
                      onClick={() => toggleFolder("docs")}
                      className="flex items-center gap-1.5 py-1 hover:text-slate-800 cursor-pointer"
                    >
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition ${isFolderOpen.docs ? "rotate-90" : ""}`} />
                      <Folder className="w-4 h-4 text-slate-450 fill-slate-50" />
                      <span>docs</span>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* Add folder bottom action */}
          <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-sans text-slate-450 select-none shrink-0">
            <button className="hover:text-slate-700 font-bold">+ Add Folder</button>
            <button className="text-slate-400 hover:text-slate-700"><Settings className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Middle Column: Code Editor + Diagnostics Panels */}
        <div className="md:col-span-6 flex flex-col h-full min-w-0 border-r border-slate-150 overflow-hidden">
          
          {/* Tab row header */}
          <div className="bg-slate-50/50 border-b border-slate-150 px-4 py-2 flex items-center justify-between shrink-0 select-none text-[11px] font-sans font-bold text-slate-500">
            <div className="flex items-center gap-1">
              {["alu_32bit.sv", "alu_control.sv"].map((t) => (
                <div
                  key={t}
                  onClick={() => setActiveEditorTab(t)}
                  className={`px-3 py-1.5 rounded-t-lg border-t border-x cursor-pointer flex items-center gap-2 transition ${
                    activeEditorTab === t
                      ? "bg-white border-slate-200 text-blue-600"
                      : "bg-transparent border-transparent hover:text-slate-800"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-slate-450" />
                  <span>{t}</span>
                  <span className="text-slate-350 hover:text-slate-655 text-[8px] pl-1 font-sans">✕</span>
                </div>
              ))}
              <button className="p-1 hover:bg-slate-200 rounded text-slate-400 ml-1">+</button>
            </div>

            <div className="flex items-center gap-3 text-slate-450">
              <button className="hover:text-slate-700"><Columns className="w-3.5 h-3.5" /></button>
              <button className="hover:text-slate-700"><Maximize2 className="w-3.5 h-3.5" /></button>
              <button className="hover:text-slate-700"><MoreVertical className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Syntax Code Editor block */}
          <div className="flex-1 bg-white p-6 overflow-y-auto leading-relaxed select-text border-b border-slate-100 flex min-h-0">
            <div className="flex gap-4 font-mono text-[10.5px] leading-relaxed text-slate-700 select-text w-full">
              {/* Line numbers column */}
              <div className="text-right text-slate-300 select-none pr-1 border-r border-slate-100 font-sans font-semibold shrink-0">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="h-5">{i + 1}</div>
                ))}
              </div>
              {/* Code Editor block */}
              <pre className="flex-1 select-text overflow-x-auto whitespace-pre font-mono text-slate-800">
                {codeString}
              </pre>
            </div>
          </div>

          {/* Status bar */}
          <div className="px-6 py-1.5 bg-slate-50 border-b border-slate-150 flex items-center justify-between text-[10px] text-slate-450 font-sans font-bold select-none shrink-0 border-t border-slate-100">
            <div>
              <span>Ln 1, Col 1</span>
            </div>
            <div className="flex gap-3">
              <span>Spaces: 4</span>
              <span>UTF-8</span>
              <span>LF</span>
              <span className="text-blue-600 font-black">SystemVerilog</span>
              <span className="text-emerald-500">✓</span>
            </div>
          </div>

          {/* Diagnostics console bar (bottom) */}
          <div className="bg-white p-6 h-36 shrink-0 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 select-none">
              <div className="flex gap-6">
                {[
                  { id: "problems", label: "Problems (0)" },
                  { id: "output", label: "Output" },
                  { id: "terminal", label: "Terminal" },
                  { id: "lint", label: "Lint" }
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

              {/* Console search bar options */}
              <div className="flex items-center gap-2">
                <div className="bg-slate-50 border border-slate-200 px-2 py-1 rounded text-[9px] font-bold text-slate-655 flex items-center gap-1 cursor-pointer">
                  <span>All</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <button className="p-1 hover:bg-slate-100 rounded text-slate-400"><Filter className="w-3.5 h-3.5" /></button>
                <button className="p-1 hover:bg-slate-100 rounded text-slate-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Diagnostic content view */}
            <div className="flex-1 flex items-center mt-3 text-xs font-sans">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-slate-700 font-semibold">No problems found.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Outline Signals / Parameters Inspector */}
        <div className="md:col-span-3 border-l border-slate-150 bg-white p-5 flex flex-col justify-between h-full overflow-y-auto shrink-0 font-sans">
          
          <div className="space-y-5">
            {/* Header tab items */}
            <div className="flex border-b border-slate-100 text-xs font-semibold text-slate-550 font-sans select-none shrink-0 mb-4 pb-2">
              {["Outline", "Signals", "Parameters"].map((t) => (
                <button
                  key={t}
                  className={`flex-1 text-center font-bold pb-1 border-b-2 transition ${
                    t === "Outline" ? "text-blue-600 border-blue-600 font-black" : "border-transparent hover:text-slate-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Ports Outline List */}
            <div className="space-y-4 font-sans text-xs">
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans tracking-wide">Modules</span>
                <div className="pl-1.5 flex items-center gap-1.5 text-slate-800 font-bold">
                  <span className="text-blue-500">◆</span>
                  <span>alu_32bit</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans tracking-wide">Ports</span>
                <div className="pl-1.5 space-y-2 text-[11px] font-bold text-slate-700 font-sans">
                  {[
                    { name: "clk", type: "logic" },
                    { name: "rst_n", type: "logic" },
                    { name: "a", type: "logic [31:0]" },
                    { name: "b", type: "logic [31:0]" },
                    { name: "alu_ctrl", type: "logic [3:0]" },
                    { name: "y", type: "logic [31:0]" },
                    { name: "zero", type: "logic" },
                    { name: "carry", type: "logic" },
                    { name: "overflow", type: "logic" }
                  ].map(port => (
                    <div key={port.name} className="flex justify-between items-center">
                      <span className="text-slate-655 font-bold flex items-center gap-1">
                        <span className="text-slate-400">▪</span>
                        {port.name}
                      </span>
                      <span className="text-slate-405 font-mono text-[10px] font-bold">{port.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 border-t border-slate-100 pt-3">
                <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans tracking-wide">Internal Signals</span>
                <div className="pl-1.5 space-y-2 text-[11px] font-bold text-slate-700 font-sans">
                  {[
                    { name: "result", type: "logic [31:0]" },
                    { name: "c_out", type: "logic" }
                  ].map(sig => (
                    <div key={sig.name} className="flex justify-between items-center">
                      <span className="text-slate-655 font-bold flex items-center gap-1">
                        <span className="text-slate-400">▪</span>
                        {sig.name}
                      </span>
                      <span className="text-slate-405 font-mono text-[10px] font-bold">{sig.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* File Information card */}
          <div className="mt-8 border-t border-slate-100 pt-4 shrink-0 font-sans text-xs">
            <span className="text-[9px] uppercase font-bold text-slate-400 block mb-3 tracking-wide">File Information</span>
            <div className="space-y-2 text-[10.5px] font-sans font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>File Name</span>
                <span className="text-slate-805 font-bold font-mono">alu_32bit.sv</span>
              </div>
              <div className="flex justify-between">
                <span>File Type</span>
                <span className="text-slate-805 font-bold font-sans">SystemVerilog</span>
              </div>
              <div className="flex justify-between">
                <span>Module</span>
                <span className="text-slate-805 font-bold font-mono">alu_32bit</span>
              </div>
              <div className="flex justify-between">
                <span>Last Modified</span>
                <span className="text-slate-800 font-mono text-[9.5px]">May 30, 2025 02:45 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Lines</span>
                <span className="text-slate-800 font-mono text-[9.5px]">210</span>
              </div>
              <div className="flex justify-between">
                <span>Size</span>
                <span className="text-slate-800 font-mono text-[9.5px]">6.2 KB</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
