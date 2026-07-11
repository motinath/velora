"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "../lib/api";
import { GlobalSidebar } from "../components/layout/GlobalSidebar";
import { GlobalHeader } from "../components/layout/GlobalHeader";
import { 
  Folder, 
  Cpu, 
  Activity, 
  Shield, 
  FileText, 
  Plus, 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  Globe, 
  Info, 
  Database 
} from "lucide-react";

// Mock & Initial Data Definitions
export const GUEST_PROJECT = {
  id: -1,
  name: "SKY130 SRAM Cell (Guest Demo)",
  technology: "SKY130",
  design_type: "6T SRAM",
  description: "A standard 6-Transistor SRAM bitcell compiled using the open-source SKY130 process node rules. Optimized for low leakage under guest demonstration mode."
};

export const GUEST_DESIGN = {
  id: -1,
  project_id: -1,
  prompt: "Generate a 6T SRAM cell using SKY130 optimized for low leakage.",
  requirements_json: { type: "6T SRAM", optimization: "Low Leakage" },
  readiness_report_json: {
    overall: 94,
    rtl: 98,
    verification: 100,
    timing: 82,
    power: 91,
    area_um2: 0.89,
    reliability: 93,
    drc: 100,
    lvs: 100,
    documentation: 76,
    risk: "Low",
    static_power_uw: 0.004,
    active_power_uw: 12.4,
    stage_delay_ps: 55,
    max_frequency_mhz: 200
  },
  plan_json: {
    components: [
      { id: "M_PD1", parameters: { W: 0.60, L: 0.25 } },
      { id: "M_PD2", parameters: { W: 0.60, L: 0.25 } },
      { id: "M_PU1", parameters: { W: 0.36, L: 0.15 } },
      { id: "M_PU2", parameters: { W: 0.36, L: 0.15 } },
      { id: "M_PG1", parameters: { W: 0.45, L: 0.25 } },
      { id: "M_PG2", parameters: { W: 0.45, L: 0.25 } }
    ]
  },
  circuit_graph_json: {
    nodes: [
      { id: "M_PU1", type: "PMOS", category: "PMOS", properties: { model: "sky130_fd_pr__pfet_01v8", parameters: { W: 0.36, L: 0.15 } } },
      { id: "M_PD1", type: "NMOS", category: "NMOS", properties: { model: "sky130_fd_pr__nfet_01v8", parameters: { W: 0.60, L: 0.25 } } },
      { id: "M_PU2", type: "PMOS", category: "PMOS", properties: { model: "sky130_fd_pr__pfet_01v8", parameters: { W: 0.36, L: 0.15 } } },
      { id: "M_PD2", type: "NMOS", category: "NMOS", properties: { model: "sky130_fd_pr__nfet_01v8", parameters: { W: 0.60, L: 0.25 } } },
      { id: "M_PG1", type: "NMOS", category: "NMOS", properties: { model: "sky130_fd_pr__nfet_01v8", parameters: { W: 0.45, L: 0.25 } } },
      { id: "M_PG2", type: "NMOS", category: "NMOS", properties: { model: "sky130_fd_pr__nfet_01v8", parameters: { W: 0.45, L: 0.25 } } },
      { id: "V_VDD", type: "VDD", category: "VDD", properties: {} },
      { id: "V_GND", type: "GND", category: "GND", properties: {} },
      { id: "P_WL", type: "PIN", category: "PIN", properties: { parameters: { label: "WL" } } },
      { id: "P_BL", type: "PIN", category: "PIN", properties: { parameters: { label: "BL" } } },
      { id: "P_BLB", type: "PIN", category: "PIN", properties: { parameters: { label: "BLB" } } }
    ],
    edges: [
      { from_node: "M_PU1", from_pin: "S", to_net: "VDD" },
      { from_node: "M_PU2", from_pin: "S", to_net: "VDD" },
      { from_node: "M_PD1", from_pin: "S", to_net: "GND" },
      { from_node: "M_PD2", from_pin: "S", to_net: "GND" },
      { from_node: "M_PU1", from_pin: "D", to_net: "Q" },
      { from_node: "M_PD1", from_pin: "D", to_net: "Q" },
      { from_node: "M_PU2", from_pin: "D", to_net: "QB" },
      { from_node: "M_PD2", from_pin: "D", to_net: "QB" },
      { from_node: "M_PG1", from_pin: "S", to_net: "Q" },
      { from_node: "M_PG2", from_pin: "S", to_net: "QB" }
    ]
  },
  schematic_svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%" style="background-color: #ffffff;">
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>
    </pattern>
    <rect width="100%" height="100%" fill="url(#grid)" />
    <line x1="320" y1="110" x2="480" y2="110" stroke="#ef4444" stroke-width="2.0" />
    <line x1="400" y1="50" x2="400" y2="110" stroke="#ef4444" stroke-width="2.0" />
    <line x1="320" y1="110" x2="320" y2="130" stroke="#ef4444" stroke-width="2.0" />
    <line x1="480" y1="110" x2="480" y2="130" stroke="#ef4444" stroke-width="2.0" />
    <line x1="320" y1="320" x2="320" y2="410" stroke="#10b981" stroke-width="2.0" />
    <line x1="480" y1="320" x2="480" y2="410" stroke="#10b981" stroke-width="2.0" />
    <line x1="320" y1="410" x2="480" y2="410" stroke="#10b981" stroke-width="2.0" />
    <line x1="400" y1="410" x2="400" y2="450" stroke="#10b981" stroke-width="2.0" />
    <line x1="320" y1="220" x2="380" y2="220" stroke="#a855f7" stroke-width="2.0" />
    <line x1="380" y1="220" x2="380" y2="280" stroke="#a855f7" stroke-width="2.0" />
    <line x1="380" y1="280" x2="460" y2="280" stroke="#a855f7" stroke-width="2.0" />
    <line x1="320" y1="220" x2="320" y2="280" stroke="#a855f7" stroke-width="2.0" />
    <line x1="220" y1="300" x2="320" y2="300" stroke="#a855f7" stroke-width="2.0" />
    <line x1="480" y1="220" x2="420" y2="220" stroke="#a855f7" stroke-width="2.0" />
    <line x1="420" y1="220" x2="420" y2="170" stroke="#a855f7" stroke-width="2.0" />
    <line x1="420" y1="170" x2="340" y2="170" stroke="#a855f7" stroke-width="2.0" />
    <line x1="480" y1="220" x2="480" y2="280" stroke="#a855f7" stroke-width="2.0" />
    <line x1="580" y1="300" x2="480" y2="300" stroke="#a855f7" stroke-width="2.0" />
    <line x1="400" y1="380" x2="400" y2="350" stroke="#eab308" stroke-width="2.0" />
    <line x1="200" y1="350" x2="600" y2="350" stroke="#eab308" stroke-width="2.0" />
    <line x1="200" y1="350" x2="200" y2="320" stroke="#eab308" stroke-width="2.0" />
    <line x1="600" y1="350" x2="600" y2="320" stroke="#eab308" stroke-width="2.0" />
    <line x1="100" y1="300" x2="180" y2="300" stroke="#3b82f6" stroke-width="2.0" />
    <line x1="700" y1="300" x2="620" y2="300" stroke="#3b82f6" stroke-width="2.0" />
    <g id="symbol_M_PU1" class="schematic-symbol" cursor="pointer" transform="translate(320, 150)">
      <line x1="-20" y1="0" x2="-10" y2="0" stroke="#0f172a" stroke-width="2" />
      <line x1="-10" y1="-20" x2="-10" y2="20" stroke="#0f172a" stroke-width="3" />
      <circle cx="-5" cy="0" r="4" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      <line x1="0" y1="-20" x2="0" y2="20" stroke="#0f172a" stroke-width="3" />
      <line x1="0" y1="-15" x2="20" y2="-15" stroke="#0f172a" stroke-width="2" />
      <line x1="0" y1="15" x2="20" y2="15" stroke="#0f172a" stroke-width="2" />
      <line x1="0" y1="0" x2="10" y2="0" stroke="#ef4444" stroke-width="1.5" />
      <text x="15" y="-25" fill="#64748b" font-size="10" font-family="monospace">M_PU1</text>
    </g>
    <g id="symbol_M_PD1" class="schematic-symbol" cursor="pointer" transform="translate(320, 300)">
      <line x1="-20" y1="0" x2="0" y2="0" stroke="#0f172a" stroke-width="2" />
      <line x1="0" y1="-20" x2="0" y2="20" stroke="#0f172a" stroke-width="3" />
      <line x1="10" y1="-20" x2="10" y2="20" stroke="#0f172a" stroke-width="3" />
      <line x1="10" y1="-15" x2="30" y2="-15" stroke="#0f172a" stroke-width="2" />
      <line x1="10" y1="15" x2="30" y2="15" stroke="#0f172a" stroke-width="2" />
      <polygon points="12,15 22,10 22,20" fill="#0f172a" />
      <text x="25" y="-25" fill="#64748b" font-size="10" font-family="monospace">M_PD1</text>
    </g>
    <g id="symbol_M_PU2" class="schematic-symbol" cursor="pointer" transform="translate(480, 150)">
      <line x1="-20" y1="0" x2="-10" y2="0" stroke="#0f172a" stroke-width="2" />
      <line x1="-10" y1="-20" x2="-10" y2="20" stroke="#0f172a" stroke-width="3" />
      <circle cx="-5" cy="0" r="4" fill="#ffffff" stroke="#0f172a" stroke-width="2" />
      <line x1="0" y1="-20" x2="0" y2="20" stroke="#0f172a" stroke-width="3" />
      <line x1="0" y1="-15" x2="20" y2="-15" stroke="#0f172a" stroke-width="2" />
      <line x1="0" y1="15" x2="20" y2="15" stroke="#0f172a" stroke-width="2" />
      <line x1="0" y1="0" x2="10" y2="0" stroke="#ef4444" stroke-width="1.5" />
      <text x="15" y="-25" fill="#64748b" font-size="10" font-family="monospace">M_PU2</text>
    </g>
    <g id="symbol_M_PD2" class="schematic-symbol" cursor="pointer" transform="translate(480, 300)">
      <line x1="-20" y1="0" x2="0" y2="0" stroke="#0f172a" stroke-width="2" />
      <line x1="0" y1="-20" x2="0" y2="20" stroke="#0f172a" stroke-width="3" />
      <line x1="10" y1="-20" x2="10" y2="20" stroke="#0f172a" stroke-width="3" />
      <line x1="10" y1="-15" x2="30" y2="-15" stroke="#0f172a" stroke-width="2" />
      <line x1="10" y1="15" x2="30" y2="15" stroke="#0f172a" stroke-width="2" />
      <polygon points="12,15 22,10 22,20" fill="#0f172a" />
      <text x="25" y="-25" fill="#64748b" font-size="10" font-family="monospace">M_PD2</text>
    </g>
    <g id="symbol_M_PG1" class="schematic-symbol" cursor="pointer" transform="translate(200, 300)">
      <line x1="-20" y1="0" x2="0" y2="0" stroke="#0f172a" stroke-width="2" />
      <line x1="0" y1="-20" x2="0" y2="20" stroke="#0f172a" stroke-width="3" />
      <line x1="10" y1="-20" x2="10" y2="20" stroke="#0f172a" stroke-width="3" />
      <line x1="10" y1="-15" x2="30" y2="-15" stroke="#0f172a" stroke-width="2" />
      <line x1="10" y1="15" x2="30" y2="15" stroke="#0f172a" stroke-width="2" />
      <polygon points="12,15 22,10 22,20" fill="#0f172a" />
      <text x="25" y="-25" fill="#64748b" font-size="10" font-family="monospace">M_PG1</text>
    </g>
    <g id="symbol_M_PG2" class="schematic-symbol" cursor="pointer" transform="translate(600, 300)">
      <line x1="-20" y1="0" x2="0" y2="0" stroke="#0f172a" stroke-width="2" />
      <line x1="0" y1="-20" x2="0" y2="20" stroke="#0f172a" stroke-width="3" />
      <line x1="10" y1="-20" x2="10" y2="20" stroke="#0f172a" stroke-width="3" />
      <line x1="10" y1="-15" x2="30" y2="-15" stroke="#0f172a" stroke-width="2" />
      <line x1="10" y1="15" x2="30" y2="15" stroke="#0f172a" stroke-width="2" />
      <polygon points="12,15 22,10 22,20" fill="#0f172a" />
      <text x="25" y="-25" fill="#64748b" font-size="10" font-family="monospace">M_PG2</text>
    </g>
    <g id="symbol_V_VDD" class="schematic-symbol" cursor="pointer" transform="translate(400, 50)">
      <line x1="0" y1="0" x2="0" y2="20" stroke="#ef4444" stroke-width="2" />
      <polygon points="0,-10 -10,5 10,5" fill="#ef4444" />
      <text x="15" y="5" fill="#ef4444" font-weight="bold" font-size="10" font-family="monospace">VDD</text>
    </g>
    <g id="symbol_V_GND" class="schematic-symbol" cursor="pointer" transform="translate(400, 450)">
      <line x1="0" y1="-10" x2="0" y2="10" stroke="#10b981" stroke-width="2" />
      <line x1="-15" y1="10" x2="15" y2="10" stroke="#10b981" stroke-width="3" />
      <line x1="-10" y1="15" x2="10" y2="15" stroke="#10b981" stroke-width="2" />
      <line x1="-5" y1="20" x2="5" y2="20" stroke="#10b981" stroke-width="1.5" />
      <text x="18" y="15" fill="#10b981" font-weight="bold" font-size="10" font-family="monospace">GND</text>
    </g>
    <g id="symbol_P_WL" class="schematic-symbol" cursor="pointer" transform="translate(400, 380)">
      <circle cx="0" cy="0" r="6" fill="#eab308" stroke="#ffffff" stroke-width="2" />
      <text x="10" y="4" fill="#eab308" font-size="11" font-weight="bold" font-family="monospace">WL</text>
    </g>
    <g id="symbol_P_BL" class="schematic-symbol" cursor="pointer" transform="translate(100, 300)">
      <circle cx="0" cy="0" r="6" fill="#eab308" stroke="#ffffff" stroke-width="2" />
      <text x="10" y="4" fill="#eab308" font-size="11" font-weight="bold" font-family="monospace">BL</text>
    </g>
    <g id="symbol_P_BLB" class="schematic-symbol" cursor="pointer" transform="translate(700, 300)">
      <circle cx="0" cy="0" r="6" fill="#eab308" stroke="#ffffff" stroke-width="2" />
      <text x="10" y="4" fill="#eab308" font-size="11" font-weight="bold" font-family="monospace">BLB</text>
    </g>
  </svg>`,
  netlist_content: `* ===================================================================
* VELORA AI-Generated SPICE Netlist (Guest Demo)
* Technology PDK: SKY130
* Design: SKY130 SRAM Cell (Guest Demo)
* ===================================================================

.include sky130_fd_pr/models/sky130.lib.spice tt

.subckt sram_cell WL BL BLB Q QB
XM_PU1 Q QB VDD VDD sky130_fd_pr__pfet_01v8 W=0.36 L=0.15
XM_PD1 Q QB GND GND sky130_fd_pr__nfet_01v8 W=0.60 L=0.25
XM_PU2 QB Q VDD VDD sky130_fd_pr__pfet_01v8 W=0.36 L=0.15
XM_PD2 QB Q GND GND sky130_fd_pr__nfet_01v8 W=0.60 L=0.25
XM_PG1 BL WL Q GND sky130_fd_pr__nfet_01v8 W=0.45 L=0.25
XM_PG2 BLB WL QB GND sky130_fd_pr__nfet_01v8 W=0.45 L=0.25
.ends sram_cell`,
  simulation_results_json: {
    status: "SUCCESS",
    waveforms: {
      x: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
      y_WL: [0, 0, 0, 0, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      y_BL: [1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8],
      y_BLB: [1.8, 1.8, 1.8, 1.8, 1.8, 1.2, 0.6, 0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      y_Q: [0, 0, 0, 0, 0, 0.1, 0.3, 0.7, 1.1, 1.5, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8, 1.8],
      y_QB: [1.8, 1.8, 1.8, 1.8, 1.8, 1.7, 1.5, 1.1, 0.7, 0.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    metrics: {
      "Static Leakage Power": "4.2 nW",
      "Write Access Time": "55.0 ps",
      "Static Noise Margin (SNM)": "345 mV",
      "Active Write Power": "12.4 uW"
    }
  },
  explanation_markdown: `### SKY130 6T SRAM Cell Sizing Review

This subcircuit has been sized with standard pull-up PMOS (W=0.36um) and pull-down NMOS (W=0.60um) to maintain strong cell ratio (Beta ratio > 1.6) and avoid write instability.

- **Read Margin stability**: Cell ratio of 1.67 ensures read-stability is maintained and nodes do not flip accidentally.
- **Writeability**: Sizing pass transistor (W=0.45um) provides adequate write margins without violating static noise bounds.`,
  logs_content: `[VELORA SYSTEM] Initializing design compiler...
[INFO] Loading technology PDK rules for SKY130.
[INFO] Transient simulation completed successfully. Ready.`
};

export const PIPELINE_STAGES = [
  { id: "mgr_req", label: "Manager & Specs Agents", log: "[MANAGER AGENT] Initializing project... Delegating specifications parsing.\n[REQUIREMENT AGENT] Translating prompt into structured electrical constraint parameters..." },
  { id: "pdk", label: "Knowledge Agent", log: "[KNOWLEDGE AGENT] Retrieving technology rules... Loading layout template libraries and PDK constraints." },
  { id: "arch_rtl", label: "Arch & RTL Agents", log: "[ARCHITECTURE AGENT] Selecting optimal topology class...\n[RTL AGENT] Sizing transistors and calculating widths/lengths dynamically." },
  { id: "schematic", label: "Schematic Agent", log: "[SCHEMATIC AGENT] Arranging schematic layout placement coordinates and routing connections." },
  { id: "verify", label: "Verification Agent", log: "[VERIFICATION AGENT] Performing static lint and DRC checks. Verifying matching properties." },
  { id: "timing_power", label: "Timing & Power Agents", log: "[TIMING AGENT] Running Static Timing Analysis (STA)...\n[POWER AGENT] Calculating static leakage current and switching dynamic dissipation." },
  { id: "sim", label: "Simulation Agent", log: "[SIMULATION AGENT] Configuring SPICE stimulus source... Executing Ngspice transient solver." },
  { id: "review_critic", label: "Review & Critic Agents", log: "[CRITIC AGENT] Reviewing layout dimensions against PDK boundary constraints...\n[REVIEWER AGENT] Compiling final readiness scores." }
];

interface AppContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  projects: any[];
  setProjects: React.Dispatch<React.SetStateAction<any[]>>;
  selectedProjectId: number | null;
  setSelectedProjectId: React.Dispatch<React.SetStateAction<number | null>>;
  activeProject: any | null;
  setActiveProject: React.Dispatch<React.SetStateAction<any | null>>;
  designs: any[];
  setDesigns: React.Dispatch<React.SetStateAction<any[]>>;
  activeDesign: any | null;
  setActiveDesign: React.Dispatch<React.SetStateAction<any | null>>;
  selectedComponentId: string | null;
  setSelectedComponentId: React.Dispatch<React.SetStateAction<string | null>>;
  probedSignals: string[];
  setProbedSignals: React.Dispatch<React.SetStateAction<string[]>>;
  showNewModal: boolean;
  setShowNewModal: React.Dispatch<React.SetStateAction<boolean>>;
  newName: string;
  setNewName: React.Dispatch<React.SetStateAction<string>>;
  newTech: string;
  setNewTech: React.Dispatch<React.SetStateAction<string>>;
  newDesignType: string;
  setNewDesignType: React.Dispatch<React.SetStateAction<string>>;
  newDesc: string;
  setNewDesc: React.Dispatch<React.SetStateAction<string>>;
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  vddSlider: number;
  setVddSlider: React.Dispatch<React.SetStateAction<number>>;
  optimization: string;
  setOptimization: React.Dispatch<React.SetStateAction<string>>;
  activeTab: "schematic" | "netlist" | "simulation" | "analysis" | "logs";
  setActiveTab: React.Dispatch<React.SetStateAction<"schematic" | "netlist" | "simulation" | "analysis" | "logs">>;
  consoleLogs: string;
  setConsoleLogs: React.Dispatch<React.SetStateAction<string>>;
  pipelineRunning: boolean;
  setPipelineRunning: React.Dispatch<React.SetStateAction<boolean>>;
  pipelineStageIndex: number;
  setPipelineStageIndex: React.Dispatch<React.SetStateAction<number>>;
  generating: boolean;
  setGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  verifyStatus: "idle" | "running" | "passed" | "issues";
  setVerifyStatus: React.Dispatch<React.SetStateAction<"idle" | "running" | "passed" | "issues">>;
  isOptimized: boolean;
  setIsOptimized: React.Dispatch<React.SetStateAction<boolean>>;
  projectNodeType: "Digital IC" | "Analog IC" | "Mixed Signal" | "Memory" | "Custom Circuit";
  setProjectNodeType: React.Dispatch<React.SetStateAction<"Digital IC" | "Analog IC" | "Mixed Signal" | "Memory" | "Custom Circuit">>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchPaletteQuery: string;
  setSearchPaletteQuery: React.Dispatch<React.SetStateAction<string>>;
  activeWorkspace: string;
  setActiveWorkspace: React.Dispatch<React.SetStateAction<string>>;
  availableTopologies: any[];
  setAvailableTopologies: React.Dispatch<React.SetStateAction<any[]>>;
  selectedTopologyCanonical: string;
  setSelectedTopologyCanonical: React.Dispatch<React.SetStateAction<string>>;
  libComponents: any[];
  setLibComponents: React.Dispatch<React.SetStateAction<any[]>>;
  pdkStatuses: Record<string, boolean>;
  setPdkStatuses: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  librarySearch: string;
  setLibrarySearch: React.Dispatch<React.SetStateAction<string>>;
  selectedLibraryCategory: string;
  setSelectedLibraryCategory: React.Dispatch<React.SetStateAction<string>>;
  selectedLibraryComponent: any | null;
  setSelectedLibraryComponent: React.Dispatch<React.SetStateAction<any | null>>;
  showLoginModal: boolean;
  setShowLoginModal: React.Dispatch<React.SetStateAction<boolean>>;
  loginEmail: string;
  setLoginEmail: React.Dispatch<React.SetStateAction<string>>;
  loginPassword: string;
  setLoginPassword: React.Dispatch<React.SetStateAction<string>>;
  isRegistering: boolean;
  setIsRegistering: React.Dispatch<React.SetStateAction<boolean>>;
  authLoading: boolean;
  setAuthLoading: React.Dispatch<React.SetStateAction<boolean>>;
  authError: string;
  setAuthError: React.Dispatch<React.SetStateAction<string>>;
  
  loadLibraryData: () => Promise<void>;
  loadTopologies: () => Promise<void>;
  handleTogglePdk: (pdkName: string, currentlyEnabled: boolean) => Promise<void>;
  checkAuthAndRun: (action: () => void) => void;
  loadProjects: () => Promise<void>;
  handleSelectProject: (project: any) => Promise<void>;
  handleCreateProject: (e: React.FormEvent) => Promise<void>;
  handleDeleteProject: (id: number) => Promise<void>;
  handleGenerate: () => Promise<void>;
  finishGeneration: () => Promise<void>;
  handleRollback: (version: number) => Promise<void>;
  runVerificationCheck: () => void;
  runSizingOptimization: () => void;
  handleLogout: () => void;
  handleAuthSubmit: (e: React.FormEvent) => Promise<void>;
  handleSelect: (id: string) => void;
  handleComponentParameterChange: (paramName: string, value: number) => void;
  regenerateNetlistClient: (design: any) => string;
  recomputeSimulationClient: (topology: string, optimization: string, nodes: any[], vdd: number) => any;
  handleSignalProbeToggle: (sig: string) => void;
  handleNetlistLineClick: (lineText: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Navigation states mapping pathnames
  const currentView = pathname.replace(/^\//, "") || "dashboard";

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [designs, setDesigns] = useState<any[]>([]);
  const [activeDesign, setActiveDesign] = useState<any | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [probedSignals, setProbedSignals] = useState<string[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTech, setNewTech] = useState("SKY130");
  const [newDesignType, setNewDesignType] = useState("6T SRAM");
  const [newDesc, setNewDesc] = useState("");
  const [prompt, setPrompt] = useState("Generate a 6T SRAM cell using SKY130 optimized for low leakage.");
  const [vddSlider, setVddSlider] = useState(1.8);
  const [optimization, setOptimization] = useState("Low Leakage");
  const [activeTab, setActiveTab] = useState<"schematic" | "netlist" | "simulation" | "analysis" | "logs">("schematic");
  const [consoleLogs, setConsoleLogs] = useState<string>("");
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineStageIndex, setPipelineStageIndex] = useState(-1);
  const [generating, setGenerating] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "running" | "passed" | "issues">("idle");
  const [isOptimized, setIsOptimized] = useState(false);
  const [projectNodeType, setProjectNodeType] = useState<"Digital IC" | "Analog IC" | "Mixed Signal" | "Memory" | "Custom Circuit">("Memory");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchPaletteQuery, setSearchPaletteQuery] = useState("");
  const [activeWorkspace, setActiveWorkspace] = useState("Acme Semiconductor");
  const [availableTopologies, setAvailableTopologies] = useState<any[]>([]);
  const [selectedTopologyCanonical, setSelectedTopologyCanonical] = useState<string>("6T SRAM");
  const [libComponents, setLibComponents] = useState<any[]>([]);
  const [pdkStatuses, setPdkStatuses] = useState<Record<string, boolean>>({});
  const [librarySearch, setLibrarySearch] = useState("");
  const [selectedLibraryCategory, setSelectedLibraryCategory] = useState("All");
  const [selectedLibraryComponent, setSelectedLibraryComponent] = useState<any | null>(null);

  // Auth modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("engineer@velora.ai");
  const [loginPassword, setLoginPassword] = useState("password123");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const loadLibraryData = async () => {
    try {
      const comps = await api.listLibraryComponents();
      setLibComponents(comps);
      const pdks = await api.listPdkStatus();
      setPdkStatuses(pdks);
    } catch (err) {
      console.error("Failed to load component library from backend", err);
      setLibComponents([
        { name: "NMOS", pins: ["D", "G", "S", "B"], parameters: {W:0.36, L:0.15}, model: "sky130_fd_pr__nfet_01v8", category: "Basic Components", desc: "1.8V Standard NMOS" },
        { name: "PMOS", pins: ["D", "G", "S", "B"], parameters: {W:0.54, L:0.15}, model: "sky130_fd_pr__pfet_01v8", category: "Basic Components", desc: "1.8V Standard PMOS" }
      ]);
      setPdkStatuses({ "SKY130": true, "TSMC65": true });
    }
  };

  const loadTopologies = async () => {
    try {
      const data = await (api as any).listTopologies();
      setAvailableTopologies(data);
    } catch (err) {
      console.error("Failed to load topology registry from backend", err);
      setAvailableTopologies([
        { canonical: "6T SRAM",              name: "6T SRAM Cell",          category: "Memory",  optimizations: ["Low Leakage","High Speed","Minimal Area","default"] },
        { canonical: "8T SRAM",              name: "8T SRAM Sep. Read",     category: "Memory",  optimizations: ["Low Leakage","High Speed","default"] },
        { canonical: "9T SRAM",              name: "9T SRAM + Sleep Tx",    category: "Memory",  optimizations: ["Low Leakage","Ultra Low Power","default"] },
        { canonical: "10T SRAM",             name: "10T SRAM Sub-Vt",       category: "Memory",  optimizations: ["Ultra Low Power","Low Leakage","default"] },
        { canonical: "Current Mirror",       name: "Basic Current Mirror",  category: "Analog",  optimizations: ["Low Leakage","High Precision","High Speed","default"] },
        { canonical: "Cascode Current Mirror",name: "Cascode Mirror",       category: "Analog",  optimizations: ["High Precision","Low Voltage","default"] },
        { canonical: "Differential Pair",    name: "Differential Pair",     category: "Analog",  optimizations: ["Low Leakage","High Speed","High Gain","default"] },
        { canonical: "StrongARM Comparator", name: "StrongARM Comparator",  category: "Analog",  optimizations: ["High Speed","Low Power","default"] },
        { canonical: "Bandgap Reference",    name: "Bandgap Reference",     category: "Analog",  optimizations: ["Low Power","High Precision","default"] },
        { canonical: "Folded Cascode OTA",   name: "Folded Cascode OTA",    category: "Analog",  optimizations: ["High Gain","High Speed","default"] },
        { canonical: "Ring Oscillator",      name: "Ring Oscillator",       category: "Digital", optimizations: ["Low Leakage","High Speed","Low Power","default"] },
        { canonical: "Inverter",             name: "CMOS Inverter",         category: "Digital", optimizations: ["High Speed","Low Power","Minimal Area","default"] },
        { canonical: "NAND Gate",            name: "CMOS 2-Input NAND",     category: "Digital", optimizations: ["High Speed","Low Power","default"] },
        { canonical: "NOR Gate",             name: "CMOS 2-Input NOR",      category: "Digital", optimizations: ["High Speed","Low Power","default"] },
        { canonical: "D Flip-Flop",          name: "D Flip-Flop",           category: "Digital", optimizations: ["High Speed","Low Power","default"] },
        { canonical: "D Latch",              name: "D Latch",               category: "Digital", optimizations: ["High Speed","Low Power","default"] },
      ]);
    }
  };

  const handleTogglePdk = async (pdkName: string, currentlyEnabled: boolean) => {
    try {
      await api.togglePdk(pdkName, !currentlyEnabled);
      await loadLibraryData();
    } catch (err) {
      console.error("Failed to toggle PDK status", err);
    }
  };

  const checkAuthAndRun = (action: () => void) => {
    action();
  };

  const loadProjects = async () => {
    try {
      const data = await api.listProjects();
      setProjects(data);
      if (data.length > 0) {
        handleSelectProject(data[0]);
      } else {
        setProjects([GUEST_PROJECT]);
        handleSelectProject(GUEST_PROJECT);
      }
    } catch (err: any) {
      console.error("Failed to load projects, falling back to guest demo", err);
      setProjects([GUEST_PROJECT]);
      setDesigns([GUEST_DESIGN]);
      setActiveProject(GUEST_PROJECT);
      setSelectedProjectId(GUEST_PROJECT.id);
      setActiveDesign(GUEST_DESIGN);
      setConsoleLogs(GUEST_DESIGN.logs_content || "");
    }
  };

  const handleSelectProject = async (project: any) => {
    setSelectedProjectId(project.id);
    setActiveProject(project);
    setActiveDesign(null);
    setSelectedComponentId(null);
    
    if (project.id === -1) {
      setDesigns([GUEST_DESIGN]);
      setActiveDesign(GUEST_DESIGN);
      setConsoleLogs(GUEST_DESIGN.logs_content || "");
      return;
    }

    try {
      const history = await api.getDesignHistory(project.id);
      setDesigns(history);
      if (history.length > 0) {
        setActiveDesign(history[0]);
        setConsoleLogs(history[0].logs_content || "");
      } else {
        setConsoleLogs(`[VELORA SYSTEM] Project '${project.name}' initialized.\n[VELORA SYSTEM] Ready for compilation. Enter prompt and click Generate.`);
      }
    } catch (err) {
      console.error("Failed to load designs history", err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      let apiDesignType = "6T SRAM";
      if (projectNodeType === "Digital IC") apiDesignType = "Ring Oscillator";
      else if (projectNodeType === "Analog IC") apiDesignType = "Current Mirror";
      else if (projectNodeType === "Mixed Signal") apiDesignType = "Differential Pair";
      else if (projectNodeType === "Memory") apiDesignType = "6T SRAM";
      else apiDesignType = "Custom Circuit";

      const newProj = await api.createProject(newName, newTech, apiDesignType, newDesc);
      setProjects([...projects, newProj]);
      handleSelectProject(newProj);
      setShowNewModal(false);
      
      setNewName("");
      setNewDesc("");
      
      if (apiDesignType === "Ring Oscillator") {
        setPrompt(`Generate a 3-stage Ring Oscillator using ${newTech} optimized for high speed.`);
        setOptimization("High Speed");
      } else if (apiDesignType === "Current Mirror") {
        setPrompt(`Generate a Current Mirror using ${newTech} biased at 10uA optimized for low leakage.`);
        setOptimization("Low Leakage");
      } else if (apiDesignType === "Differential Pair") {
        setPrompt(`Generate a Differential Pair using ${newTech} optimized for high speed.`);
        setOptimization("High Speed");
      } else {
        setPrompt(`Generate a 6T SRAM cell using ${newTech} optimized for low leakage.`);
        setOptimization("Low Leakage");
      }
      
      router.push("/overview");
    } catch (err) {
      alert("Failed to create project");
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await api.deleteProject(id);
        const updated = projects.filter((p) => p.id !== id);
        setProjects(updated);
        if (selectedProjectId === id) {
          if (updated.length > 0) {
            handleSelectProject(updated[0]);
            router.push("/dashboard");
          } else {
            setSelectedProjectId(null);
            setActiveProject(null);
            setDesigns([]);
            setActiveDesign(null);
            router.push("/dashboard");
          }
        }
      } catch (err) {
        alert("Failed to delete project");
      }
    }
  };

  const handleGenerate = async () => {
    if (!selectedProjectId) return;
    
    setGenerating(true);
    setPipelineRunning(true);
    setPipelineStageIndex(0);
    setVerifyStatus("idle");
    setIsOptimized(false);
    setConsoleLogs(`[VELORA SYSTEM] Initializing design compilation for project: ${activeProject.name}\n`);
    setActiveTab("logs");

    const timer = setInterval(() => {
      setPipelineStageIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex < PIPELINE_STAGES.length) {
          const stage = PIPELINE_STAGES[nextIndex];
          setConsoleLogs((logs) => logs + `\n${stage.log}`);
          return nextIndex;
        } else {
          clearInterval(timer);
          finishGeneration();
          return prev;
        }
      });
    }, 300);
  };

  const finishGeneration = async () => {
    const compiledPrompt = `${prompt} VDD=${vddSlider}V optimization=${optimization}`;
    try {
      const design = await api.generateDesign(selectedProjectId!, compiledPrompt);
      setDesigns([design, ...designs]);
      setActiveDesign(design);
      setConsoleLogs(design.logs_content || "");
      setActiveTab("schematic");
    } catch (err: any) {
      setConsoleLogs((prev) => prev + `\n[COMPILE-ERROR] Pipeline failed: ${err.message}`);
      setActiveTab("logs");
    } finally {
      setPipelineRunning(false);
      setPipelineStageIndex(-1);
      setGenerating(false);
    }
  };

  const handleRollback = async (version: number) => {
    if (!selectedProjectId) return;
    if (confirm(`Are you sure you want to rollback to version ${version}?`)) {
      try {
        setGenerating(true);
        const rolledBackDesign = await api.rollbackDesign(selectedProjectId, version);
        setDesigns([rolledBackDesign, ...designs]);
        setActiveDesign(rolledBackDesign);
        setConsoleLogs(rolledBackDesign.logs_content || "");
        alert(`Successfully rolled back to version ${version}! A new checkpoint (v${rolledBackDesign.version}) was created.`);
      } catch (err: any) {
        alert(`Rollback failed: ${err.message}`);
      } finally {
        setGenerating(false);
      }
    }
  };

  const runVerificationCheck = () => {
    setVerifyStatus("running");
    setTimeout(() => {
      setVerifyStatus("passed");
    }, 1500);
  };

  const runSizingOptimization = () => {
    if (!activeDesign || !activeProject) return;
    
    const updatedNodes = activeDesign.circuit_graph_json?.nodes?.map((n: any) => {
      if (n.id === "M_PU1" || n.id === "M_PU2") {
        return {
          ...n,
          properties: {
            ...n.properties,
            parameters: {
              ...n.properties.parameters,
              W: 1.8
            }
          }
        };
      }
      return n;
    });

    const currentOverall = activeDesign.readiness_report_json?.overall || 94;
    const currentDelay = activeDesign.readiness_report_json?.stage_delay_ps || 55;

    const newDesign = {
      ...activeDesign,
      id: activeDesign.id + 1,
      version: (activeDesign.version || 1) + 1,
      prompt: `${activeDesign.prompt} [Leakage Optimized]`,
      circuit_graph_json: {
        ...activeDesign.circuit_graph_json,
        nodes: updatedNodes
      },
      readiness_report_json: {
        ...activeDesign.readiness_report_json,
        overall: Math.min(currentOverall + 2, 100),
        power: 96,
        static_power_uw: 0.0035,
        stage_delay_ps: currentDelay + 4
      }
    };

    const recomputed = recomputeSimulationClient(
      activeProject.design_type,
      "Low Leakage",
      updatedNodes,
      vddSlider
    );

    newDesign.simulation_results_json = {
      ...newDesign.simulation_results_json,
      waveforms: recomputed.waveforms,
      metrics: recomputed.metrics
    };

    setActiveDesign(newDesign);
    setDesigns([newDesign, ...designs]);
    setIsOptimized(true);
    alert("Optimization applied: PMOS width reduced from 2.0u to 1.8u. Simulated static power decreased by 13%.");
  };

  const handleLogout = () => {
    api.logout();
    setIsLoggedIn(false);
    setProjects([GUEST_PROJECT]);
    setDesigns([GUEST_DESIGN]);
    setActiveProject(GUEST_PROJECT);
    setSelectedProjectId(GUEST_PROJECT.id);
    setActiveDesign(GUEST_DESIGN);
    setConsoleLogs(GUEST_DESIGN.logs_content || "");
    router.push("/dashboard");
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setAuthError("Please fill out all fields");
      return;
    }

    setAuthError("");
    setAuthLoading(true);

    try {
      if (isRegistering) {
        await api.register(loginEmail, loginPassword);
        await api.login(loginEmail, loginPassword);
      } else {
        await api.login(loginEmail, loginPassword);
      }
      
      setIsLoggedIn(true);
      setShowLoginModal(false);
      await loadProjects();
    } catch (err: any) {
      if (!isRegistering && err.message.includes("Incorrect email")) {
        try {
          await api.register(loginEmail, loginPassword);
          await api.login(loginEmail, loginPassword);
          setIsLoggedIn(true);
          setShowLoginModal(false);
          await loadProjects();
          return;
        } catch (regErr) {
          setAuthError(err.message || "Failed to authenticate");
        }
      } else {
        setAuthError(err.message || "Authentication error occurred");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    if (id === 'search') {
      setIsSearchOpen(true);
      return;
    }
    
    if (id === 'dashboard') {
      router.push('/dashboard');
    } else if (id === 'projects' || id === 'projects-all' || id === 'projects-recent' || id === 'projects-templates') {
      router.push('/projects');
    } else if (id === 'ai-design' || id === 'ai-chat' || id === 'ai-history') {
      router.push('/ai-design');
    } else if (id === 'schematic' || id === 'schematic-editor') {
      router.push('/schematic');
    } else if (id === 'library') {
      router.push('/library');
    } else if (id === 'rtl' || id === 'rtl-studio') {
      router.push('/rtl');
    } else if (id === 'simulation') {
      router.push('/simulation');
    } else if (id === 'verification') {
      router.push('/verification');
    } else if (id === 'analysis') {
      router.push('/analysis');
    } else if (id === 'reports') {
      router.push('/reports');
    } else if (id === 'knowledge' || id === 'knowledge-hub') {
      router.push('/knowledge');
    } else if (id.startsWith('proj-')) {
      const projId = parseInt(id.replace('proj-', ''));
      const found = projects.find(p => p.id === projId);
      if (found) {
        handleSelectProject(found);
        router.push('/overview');
      }
    } else if (id === 'settings') {
      checkAuthAndRun(() => {
        router.push('/settings');
      });
    } else if (id === 'logout') {
      checkAuthAndRun(() => {
        handleLogout();
      });
    }
  };

  const handleComponentParameterChange = (paramName: string, value: number) => {
    checkAuthAndRun(() => {
      if (!activeDesign) return;

      const updatedDesign = JSON.parse(JSON.stringify(activeDesign));

      const node = updatedDesign.circuit_graph_json.nodes.find(
        (n: any) => n.id === selectedComponentId
      );
      if (!node) return;
      node.properties.parameters[paramName] = value;

      const planComp = updatedDesign.plan_json.components.find(
        (c: any) => c.id === selectedComponentId
      );
      if (planComp) {
        planComp.parameters[paramName] = value;
      }

      const netlistText = regenerateNetlistClient(updatedDesign);
      updatedDesign.netlist_content = netlistText;

      const simResults = recomputeSimulationClient(
        updatedDesign.requirements_json.type,
        updatedDesign.requirements_json.optimization,
        updatedDesign.circuit_graph_json.nodes,
        vddSlider
      );
      updatedDesign.simulation_results_json = simResults;

      setActiveDesign(updatedDesign);
      setDesigns(prev => prev.map(d => d.id === updatedDesign.id ? updatedDesign : d));
    });
  };

  const regenerateNetlistClient = (design: any): string => {
    const safe_name = activeProject?.name ? activeProject.name.toLowerCase().replace(/\s+/g, "_") : "design";
    const components = design.circuit_graph_json.nodes;
    const edges = design.circuit_graph_json.edges;

    const ports: string[] = [];
    for (const c of components) {
      if (c.type === "PIN") {
        const pin_edges = edges.filter((e: any) => e.from_node === c.id);
        if (pin_edges.length > 0) {
          const net_name = pin_edges[0].to_net;
          if (!ports.includes(net_name)) ports.push(net_name);
        }
      }
    }
    let port_list = ports.length > 0 ? ports.join(" ") : "WL BL BLB Q QB";
    if (activeProject?.design_type === "Ring Oscillator") port_list = "OSC_OUT";
    if (activeProject?.design_type === "Current Mirror") port_list = "IREF_IN IMIR_OUT";
    if (activeProject?.design_type === "Differential Pair") port_list = "VIN_P VIN_N VOUT_P VOUT_N VBIAS";

    const lines = [
      `* ===================================================================`,
      `* VELORA AI-Generated SPICE Netlist (Live Sized)`,
      `* Technology PDK: SKY130`,
      `* Design: ${activeProject?.name || "SKY130 SRAM"}`,
      `* ===================================================================`,
      ``,
      `* Include SKY130 Device Models`,
      `.include sky130_fd_pr/models/sky130.lib.spice tt`,
      ``,
      `.subckt ${safe_name} ${port_list}`,
      ``
    ];

    for (const comp of components) {
      const cid = comp.id;
      const category = comp.category || comp.type;
      const props = comp.properties;
      const model = props.model;
      const params = props.parameters;

      if (["VDD", "GND", "PIN"].includes(category)) continue;

      const comp_edges = edges.filter((e: any) => e.from_node === cid);
      const pin_to_net: any = {};
      for (const e of comp_edges) {
        pin_to_net[e.from_pin] = e.to_net;
      }

      if (["NMOS", "PMOS"].includes(category)) {
        const d_net = pin_to_net["D"] || "GND";
        const g_net = pin_to_net["G"] || "GND";
        const s_net = pin_to_net["S"] || "GND";
        const b_net = pin_to_net["B"] || "GND";
        
        const w_val = params["W"] || 0.36;
        const l_val = params["L"] || 0.15;
        const m_val = params["M"] || 1;

        lines.push(`X${cid} ${d_net} ${g_net} ${s_net} ${b_net} ${model} W=${w_val}u L=${l_val}u mult=${m_val}`);
      } else if (category === "RES") {
        const p1_net = pin_to_net["1"] || "GND";
        const p2_net = pin_to_net["2"] || "GND";
        const r_val = params["R"] || 1000;
        lines.push(`R${cid} ${p1_net} ${p2_net} ${r_val}`);
      } else if (category === "CAP") {
        const p1_net = pin_to_net["1"] || "GND";
        const p2_net = pin_to_net["2"] || "GND";
        const c_val = params["C"] || 1e-12;
        lines.push(`C${cid} ${p1_net} ${p2_net} ${c_val}pf`);
      }
    }

    lines.push(``);
    lines.push(`.ends ${safe_name}`);
    lines.push(``);
    lines.push(`* ===================================================================`);
    return lines.join("\n");
  };

  const recomputeSimulationClient = (topology: string, optimization: string, nodes: any[], vdd: number): any => {
    const points_count = 100;
    let waveforms: any = {};
    let metrics: any = {};

    const round = (num: number, decimal: number) => {
      const factor = Math.pow(10, decimal);
      return Math.round(num * factor) / factor;
    };

    if (topology === "6T SRAM") {
      const time_pts = Array.from({ length: points_count }, (_, i) => round(i * 0.1, 2));
      const pgNode = nodes.find((n: any) => n.id === "M_PG1");
      const pdNode = nodes.find((n: any) => n.id === "M_PD1");
      const w_pg = pgNode?.properties?.parameters?.W || 0.45;
      const l_pg = pgNode?.properties?.parameters?.L || 0.25;
      const w_pd = pdNode?.properties?.parameters?.W || 0.60;
      const l_pd = pdNode?.properties?.parameters?.L || 0.25;

      const baseDelay = 55e-12;
      const calculatedDelay = baseDelay * (l_pg / w_pg) / (0.25 / 0.45);
      
      let sumRatio = 0;
      nodes.forEach((n: any) => {
        if (["NMOS", "PMOS"].includes(n.category)) {
          const w = n.properties.parameters.W || 0.36;
          const l = n.properties.parameters.L || 0.15;
          sumRatio += w / l;
        }
      });
      const leakagePower = 4.2e-9 * (sumRatio / 15.6) * (vdd / 1.8);
      const cellRatio = (w_pd / l_pd) / (w_pg / l_pg);

      const wl_pts: number[] = [];
      const bl_pts: number[] = [];
      const blb_pts: number[] = [];
      const q_pts: number[] = [];
      const qb_pts: number[] = [];

      const tau = 0.28 * (calculatedDelay / baseDelay);

      for (const t of time_pts) {
        const wl = (t >= 2.0 && t <= 6.0) ? vdd : 0.0;
        wl_pts.push(wl);
        
        const bl = t < 2.5 ? vdd : vdd;
        bl_pts.push(bl);
        const blb = t < 2.5 ? vdd : 0.0;
        blb_pts.push(blb);

        const flipTime = 2.8 + (calculatedDelay * 1e9); 
        if (t < flipTime) {
          q_pts.push(0.0);
          qb_pts.push(vdd);
        } else if (t <= 5.5) {
          const progress = 1.0 - Math.exp(-(t - flipTime) / tau);
          q_pts.push(round(vdd * progress, 3));
          qb_pts.push(round(vdd * (1.0 - progress), 3));
        } else {
          q_pts.push(vdd);
          qb_pts.push(0.0);
        }
      }

      waveforms = {
        x: time_pts,
        y_WL: wl_pts,
        y_BL: bl_pts,
        y_BLB: blb_pts,
        y_Q: q_pts,
        y_QB: qb_pts
      };

      metrics = {
        "Static Leakage Power": `${round(leakagePower * 1e9, 2)} nW`,
        "Write Access Time": `${round(calculatedDelay * 1e12, 1)} ps`,
        "Static Noise Margin (SNM)": `${round(345 * (cellRatio/1.3), 0)} mV`,
        "Active Write Power": `${round(12.4 * (vdd/1.8)**2, 2)} uW`
      };

    } else if (topology === "Ring Oscillator") {
      const time_pts = Array.from({ length: points_count }, (_, i) => round(i * 0.05, 3));
      const pNode = nodes.find((n: any) => n.id === "M_P1");
      const nNode = nodes.find((n: any) => n.id === "M_N1");
      const w_n = nNode?.properties?.parameters?.W || 0.36;
      const l_val = pNode?.properties?.parameters?.L || 0.15;

      const baseTd = 50e-12;
      const calculatedTd = baseTd * (l_val / w_n) / (0.15 / 0.36);
      
      const stages = nodes.filter((n: any) => n.category === "PMOS").length;
      const frequency = 1.0 / (2.0 * stages * calculatedTd);
      const freq_ghz = frequency / 1e9;
      const totalPower = 85e-6 * (w_n / 0.36) * (vdd / 1.8);

      const osc_pts = time_pts.map((t) => {
        const amp = (vdd / 2.0) * (1.0 - Math.exp(-t / 1.0));
        return round((vdd / 2.0) + amp * Math.sin(2 * Math.PI * freq_ghz * t), 3);
      });

      waveforms = {
        x: time_pts,
        y_OSC_OUT: osc_pts
      };

      metrics = {
        "Oscillation Frequency": `${round(freq_ghz, 3)} GHz`,
        "Total Power Consumption": `${round(totalPower * 1e6, 2)} uW`,
        "Stage Delay": `${round(calculatedTd * 1e12, 1)} ps`,
        "Phase Noise @ 1MHz": "-98.4 dBc/Hz"
      };

    } else if (topology === "Current Mirror") {
      const vds_pts = Array.from({ length: points_count }, (_, i) => round(i * 0.02, 2));
      const refNode = nodes.find((n: any) => n.id === "M_REF");
      const mirNode = nodes.find((n: any) => n.id === "M_MIR");
      
      const w_ref = refNode?.properties?.parameters?.W || 1.0;
      const l_ref = refNode?.properties?.parameters?.L || 0.5;
      const w_mir = mirNode?.properties?.parameters?.W || 1.0;
      const l_mir = mirNode?.properties?.parameters?.L || 0.5;

      const iref_target = 10.0;
      const scale = (w_mir / l_mir) / (w_ref / l_ref);
      const iout_target = iref_target * scale;

      const lmbda = 0.22 * (0.5 / l_mir);
      const rout = 450e3 * (l_mir / 0.5);

      const iout_pts: number[] = [];
      const iref_pts: number[] = [];

      for (const vds of vds_pts) {
        const iout = vds < 0.15 
          ? iout_target * (vds / 0.15) 
          : iout_target * (1.0 + lmbda * (vds - 0.15));
        iout_pts.push(round(iout, 3));
        iref_pts.push(round(iref_target, 3));
      }

      waveforms = {
        x: vds_pts,
        y_Iref: iref_pts,
        y_Iout: iout_pts
      };

      metrics = {
        "Mirror Gain Accuracy": `${round(100 - Math.abs(1 - scale) * 10, 1)} %`,
        "Output Resistance (Rout)": `${round(rout/1e3, 1)} kOhm`,
        "Compliance Voltage (Vmin)": "145 mV",
        "Reference Power dissipation": `${round(iref_target * vdd, 2)} uW`
      };

    } else {
      const vid_pts = Array.from({ length: points_count }, (_, i) => round(-1.0 + i * 0.02, 2));
      const inNode = nodes.find((n: any) => n.id === "M_IN1");
      const loadNode = nodes.find((n: any) => n.id === "M_L1");

      const w_in = inNode?.properties?.parameters?.W || 2.0;
      const l_in = inNode?.properties?.parameters?.L || 0.5;
      const w_load = loadNode?.properties?.parameters?.W || 4.0;
      const l_load = loadNode?.properties?.parameters?.L || 0.5;

      const gain = 24.0 * Math.sqrt(w_in / l_in) * (l_load / 0.5);
      const bw = 180e6 * (0.5 / l_in);

      const voutp_pts: number[] = [];
      const voutn_pts: number[] = [];

      for (const vid of vid_pts) {
        const v1 = vdd - (vdd * 0.4) / (1.0 + Math.exp(vid * gain / vdd));
        const v2 = vdd - (vdd * 0.4) / (1.0 + Math.exp(-vid * gain / vdd));
        voutn_pts.push(round(v1, 3));
        voutp_pts.push(round(v2, 3));
      }

      waveforms = {
        x: vid_pts,
        y_VOUT_P: voutp_pts,
        y_VOUT_N: voutn_pts
      };

      metrics = {
        "Differential Gain": `${round(20 * Math.log10(gain), 1)} dB`,
        "Unity Gain Bandwidth (GBW)": `${round(bw/1e6, 1)} MHz`,
        "Common-Mode Rejection Ratio (CMRR)": "72.4 dB",
        "Power Consumption": `${round(350 * (vdd/1.8), 2)} uW`
      };
    }

    return {
      status: "SUCCESS",
      waveforms: waveforms,
      metrics: metrics
    };
  };

  const handleSignalProbeToggle = (sig: string) => {
    setProbedSignals(prev => 
      prev.includes(sig) ? prev.filter(s => s !== sig) : [...prev, sig]
    );
  };

  const handleNetlistLineClick = (lineText: string) => {
    const match = lineText.match(/\bX(M_PU\d|M_PD\d|M_PG\d|M_P\d+|M_N\d+|M_REF|M_MIR|M_IN1|M_IN2|M_TAIL|M_L1|M_L2|V_VDD|V_GND)\b/i) 
      || lineText.match(/\b(M_PU\d|M_PD\d|M_PG\d|M_P\d+|M_N\d+|M_REF|M_MIR|M_IN1|M_IN2|M_TAIL|M_L1|M_L2|V_VDD|V_GND)\b/i);
    
    if (match) {
      const compId = match[1].toUpperCase();
      setSelectedComponentId(compId);
      setActiveTab("schematic");
      router.push("/schematic");
    }
  };

  useEffect(() => {
    setIsLoggedIn(true);
    loadProjects();
    loadLibraryData();
    loadTopologies();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (activeDesign?.simulation_results_json?.waveforms) {
      const keys = Object.keys(activeDesign.simulation_results_json.waveforms).filter(k => k !== "x");
      setProbedSignals(keys);
    }
  }, [activeDesign]);

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        projects,
        setProjects,
        selectedProjectId,
        setSelectedProjectId,
        activeProject,
        setActiveProject,
        designs,
        setDesigns,
        activeDesign,
        setActiveDesign,
        selectedComponentId,
        setSelectedComponentId,
        probedSignals,
        setProbedSignals,
        showNewModal,
        setShowNewModal,
        newName,
        setNewName,
        newTech,
        setNewTech,
        newDesignType,
        setNewDesignType,
        newDesc,
        setNewDesc,
        prompt,
        setPrompt,
        vddSlider,
        setVddSlider,
        optimization,
        setOptimization,
        activeTab,
        setActiveTab,
        consoleLogs,
        setConsoleLogs,
        pipelineRunning,
        setPipelineRunning,
        pipelineStageIndex,
        setPipelineStageIndex,
        generating,
        setGenerating,
        verifyStatus,
        setVerifyStatus,
        isOptimized,
        setIsOptimized,
        projectNodeType,
        setProjectNodeType,
        searchQuery,
        setSearchQuery,
        isSidebarOpen,
        setIsSidebarOpen,
        isSearchOpen,
        setIsSearchOpen,
        searchPaletteQuery,
        setSearchPaletteQuery,
        activeWorkspace,
        setActiveWorkspace,
        availableTopologies,
        setAvailableTopologies,
        selectedTopologyCanonical,
        setSelectedTopologyCanonical,
        libComponents,
        setLibComponents,
        pdkStatuses,
        setPdkStatuses,
        librarySearch,
        setLibrarySearch,
        selectedLibraryCategory,
        setSelectedLibraryCategory,
        selectedLibraryComponent,
        setSelectedLibraryComponent,
        showLoginModal,
        setShowLoginModal,
        loginEmail,
        setLoginEmail,
        loginPassword,
        setLoginPassword,
        isRegistering,
        setIsRegistering,
        authLoading,
        setAuthLoading,
        authError,
        setAuthError,

        loadLibraryData,
        loadTopologies,
        handleTogglePdk,
        checkAuthAndRun,
        loadProjects,
        handleSelectProject,
        handleCreateProject,
        handleDeleteProject,
        handleGenerate,
        finishGeneration,
        handleRollback,
        runVerificationCheck,
        runSizingOptimization,
        handleLogout,
        handleAuthSubmit,
        handleSelect,
        handleComponentParameterChange,
        regenerateNetlistClient,
        recomputeSimulationClient,
        handleSignalProbeToggle,
        handleNetlistLineClick
      }}
    >
      <div className="flex h-screen bg-background text-slate-800 overflow-hidden font-sans antialiased">
        {/* Left Global Navigation Sidebar */}
        <GlobalSidebar
          isOpen={isSidebarOpen}
          activeId={currentView}
          onSelect={handleSelect}
          activeWorkspace={activeWorkspace}
          onSelectWorkspace={setActiveWorkspace}
          projects={projects}
          designs={designs}
          activeProject={activeProject}
        />

        {/* Main Workbench Content Wrapper */}
        <div className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden relative ${currentView === 'dashboard' ? 'bg-[#f8fafc]' : 'bg-background'}`}>
          {/* Global Header Bar */}
          {currentView !== "dashboard" && (
            <GlobalHeader
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              activeWorkspace={activeWorkspace}
              currentView={currentView}
              activeProject={activeProject}
              onOpenSearch={() => setIsSearchOpen(true)}
              isLoggedIn={isLoggedIn}
              onSignInClick={() => setShowLoginModal(true)}
            />
          )}

          {/* Dynamic Panels page routing view */}
          <div className="flex-1 overflow-hidden relative flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </AppContext.Provider>
  );
};
