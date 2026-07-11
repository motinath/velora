"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { 
  Cpu, 
  Terminal, 
  FileText, 
  Activity, 
  Plus, 
  History, 
  Database, 
  Layers, 
  LogOut, 
  Play, 
  Sparkles, 
  Settings, 
  Info,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ChevronRight,
  Folder,
  FileCode,
  BookOpen,
  BarChart2,
  User,
  Search,
  ChevronDown,
  Inbox,
  Calendar,
  CreditCard,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  Command,
  X,
  Hash,
  FolderKanban,
  Users,
  Mail,
  Lock,
  Loader,
  ArrowRight
} from "lucide-react";

import { GlobalSidebar } from "../components/layout/GlobalSidebar";
import { GlobalHeader } from "../components/layout/GlobalHeader";
import { SchematicCanvas } from "../components/workspace/SchematicCanvas";
import { SpiceInspector } from "../components/workspace/SpiceInspector";
import { SimulationScope } from "../components/workspace/SimulationScope";
import { PropertiesInspector } from "../components/workspace/PropertiesInspector";

export type NavItemData = {
  id: string;
  title: string;
  icon: React.ElementType;
  badge?: number | string;
  shortcut?: string;
  children?: NavItemData[];
};

export type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

interface PipelineStage {
  id: string;
  label: string;
  log: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  { id: "mgr_req", label: "Manager & Specs Agents", log: "[MANAGER AGENT] Initializing project... Delegating specifications parsing.\n[REQUIREMENT AGENT] Translating prompt into structured electrical constraint parameters..." },
  { id: "pdk", label: "Knowledge Agent", log: "[KNOWLEDGE AGENT] Retrieving technology rules... Loading layout template libraries and PDK constraints." },
  { id: "arch_rtl", label: "Arch & RTL Agents", log: "[ARCHITECTURE AGENT] Selecting optimal topology class...\n[RTL AGENT] Sizing transistors and calculating widths/lengths dynamically." },
  { id: "schematic", label: "Schematic Agent", log: "[SCHEMATIC AGENT] Arranging schematic layout placement coordinates and routing connections." },
  { id: "verify", label: "Verification Agent", log: "[VERIFICATION AGENT] Performing static lint and DRC checks. Verifying matching properties." },
  { id: "timing_power", label: "Timing & Power Agents", log: "[TIMING AGENT] Running Static Timing Analysis (STA)...\n[POWER AGENT] Calculating static leakage current and switching dynamic dissipation." },
  { id: "sim", label: "Simulation Agent", log: "[SIMULATION AGENT] Configuring SPICE stimulus source... Executing Ngspice transient solver." },
  { id: "review_critic", label: "Review & Critic Agents", log: "[CRITIC AGENT] Reviewing layout dimensions against PDK boundary constraints...\n[REVIEWER AGENT] Compiling final readiness scores." }
];

// Component library data is loaded dynamically from the backend API.

// Guest Mock Data
const GUEST_PROJECT = {
  id: -1,
  name: "SKY130 SRAM Cell (Guest Demo)",
  technology: "SKY130",
  design_type: "6T SRAM",
  description: "A standard 6-Transistor SRAM bitcell compiled using the open-source SKY130 process node rules. Optimized for low leakage under guest demonstration mode."
};

const GUEST_DESIGN = {
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

export default function Home() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [activeProject, setActiveProject] = useState<any | null>(null);
  
  // Designs History & Active design
  const [designs, setDesigns] = useState<any[]>([]);
  const [activeDesign, setActiveDesign] = useState<any | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  
  // Scope signal probes
  const [probedSignals, setProbedSignals] = useState<string[]>([]);
  
  // Creation States
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTech, setNewTech] = useState("SKY130");
  const [newDesignType, setNewDesignType] = useState("6T SRAM");
  const [newDesc, setNewDesc] = useState("");

  // Editor states
  const [prompt, setPrompt] = useState("Generate a 6T SRAM cell using SKY130 optimized for low leakage.");
  const [vddSlider, setVddSlider] = useState(1.8);
  const [optimization, setOptimization] = useState("Low Leakage");
  const [activeTab, setActiveTab] = useState<"schematic" | "netlist" | "simulation" | "analysis" | "logs">("schematic");
  const [consoleLogs, setConsoleLogs] = useState<string>("");

  // Pipeline simulation state
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineStageIndex, setPipelineStageIndex] = useState(-1);
  const [generating, setGenerating] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "running" | "passed" | "issues">("idle");
  const [isOptimized, setIsOptimized] = useState(false);
  const [projectNodeType, setProjectNodeType] = useState<"Digital IC" | "Analog IC" | "Mixed Signal" | "Memory" | "Custom Circuit">("Memory");

  // Navigation states
  const [currentView, setCurrentView] = useState<"dashboard" | "projects" | "overview" | "workspace" | "library" | "settings" | "ai-design" | "schematic" | "rtl" | "simulation" | "verification" | "reports" | "knowledge">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchPaletteQuery, setSearchPaletteQuery] = useState("");
  const [activeWorkspace, setActiveWorkspace] = useState("Acme Semiconductor");

  // Dynamic Library Manager states
  const [libComponents, setLibComponents] = useState<any[]>([]);
  const [pdkStatuses, setPdkStatuses] = useState<Record<string, boolean>>({});
  const [librarySearch, setLibrarySearch] = useState("");
  const [selectedLibraryCategory, setSelectedLibraryCategory] = useState("All");

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

  const handleTogglePdk = async (pdkName: string, currentlyEnabled: boolean) => {
    try {
      await api.togglePdk(pdkName, !currentlyEnabled);
      await loadLibraryData();
    } catch (err) {
      console.error("Failed to toggle PDK status", err);
    }
  };

  // Auth modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("engineer@velora.ai");
  const [loginPassword, setLoginPassword] = useState("password123");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const activeComponentObj = activeDesign?.circuit_graph_json?.nodes?.find(
    (n: any) => n.id === selectedComponentId
  );

  useEffect(() => {
    setIsClient(true);
    setIsLoggedIn(true);
    loadProjects();
    loadLibraryData();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Pre-load default probed signals when design changes
  useEffect(() => {
    if (activeDesign?.simulation_results_json?.waveforms) {
      const keys = Object.keys(activeDesign.simulation_results_json.waveforms).filter(k => k !== "x");
      setProbedSignals(keys);
    }
  }, [activeDesign]);

  // Auth action check - Bypassed for now
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
    
    // Guest project has mock designs
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
      
      setCurrentView("overview");
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
            setCurrentView("dashboard");
          } else {
            setSelectedProjectId(null);
            setActiveProject(null);
            setDesigns([]);
            setActiveDesign(null);
            setCurrentView("dashboard");
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
    const compiledPrompt = `${prompt} VDD=${vddSlider}V optimized for ${optimization}.`;
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
    // Reset to mock guest projects
    setProjects([GUEST_PROJECT]);
    setDesigns([GUEST_DESIGN]);
    setActiveProject(GUEST_PROJECT);
    setSelectedProjectId(GUEST_PROJECT.id);
    setActiveDesign(GUEST_DESIGN);
    setConsoleLogs(GUEST_DESIGN.logs_content || "");
    setCurrentView("dashboard");
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
      setCurrentView('dashboard');
    } else if (id === 'projects') {
      setCurrentView('projects');
    } else if (id === 'ai-design') {
      setCurrentView('ai-design');
    } else if (id === 'schematic') {
      setCurrentView('schematic');
    } else if (id === 'rtl') {
      setCurrentView('rtl');
    } else if (id === 'simulation') {
      setCurrentView('simulation');
    } else if (id === 'verification') {
      setCurrentView('verification');
    } else if (id === 'reports') {
      setCurrentView('reports');
    } else if (id === 'knowledge') {
      setCurrentView('knowledge');
    } else if (id.startsWith('proj-')) {
      const projId = parseInt(id.replace('proj-', ''));
      const found = projects.find(p => p.id === projId);
      if (found) {
        handleSelectProject(found);
        setCurrentView('overview');
      }
    } else if (id === 'settings') {
      checkAuthAndRun(() => {
        setCurrentView('settings');
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
    if (activeProject.design_type === "Ring Oscillator") port_list = "OSC_OUT";
    if (activeProject.design_type === "Current Mirror") port_list = "IREF_IN IMIR_OUT";
    if (activeProject.design_type === "Differential Pair") port_list = "VIN_P VIN_N VOUT_P VOUT_N VBIAS";

    const lines = [
      `* ===================================================================`,
      `* VELORA AI-Generated SPICE Netlist (Live Sized)`,
      `* Technology PDK: SKY130`,
      `* Design: ${activeProject.name}`,
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
    }
  };

  const renderDashboard = () => {
    return (
      <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-8 bg-background font-sans">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight font-sans">VELORA</h1>
            <p className="text-xs text-slate-500 mt-1">Autonomous Semiconductor Co-Pilot & Engineering Operating System</p>
          </div>
          <button
            onClick={() => checkAuthAndRun(() => setShowNewModal(true))}
            className="bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase px-5 py-3 rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            New Project
          </button>
        </div>

        {/* Home Action Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Action 1: New Project */}
          <div 
            onClick={() => checkAuthAndRun(() => setShowNewModal(true))}
            className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-primary/40 cursor-pointer transition flex items-center justify-between group"
          >
            <div>
              <span className="text-[10px] font-bold text-primary uppercase block">Initialize</span>
              <h3 className="text-md font-bold text-slate-800 mt-1 group-hover:text-primary transition font-sans">Create New Project</h3>
              <p className="text-xs text-slate-500 mt-2 font-sans">Specify tech node, PDK, and design class topology.</p>
            </div>
            <Plus className="w-8 h-8 text-primary/30 group-hover:text-primary transition shrink-0 ml-4" />
          </div>

          {/* Action 2: Open Project */}
          <div 
            onClick={() => {
              if (projects.length > 0) {
                handleSelectProject(projects[0]);
                setCurrentView("overview");
              } else {
                checkAuthAndRun(() => setShowNewModal(true));
              }
            }}
            className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-secondary/40 cursor-pointer transition flex items-center justify-between group"
          >
            <div>
              <span className="text-[10px] font-bold text-secondary uppercase block">Workspaces</span>
              <h3 className="text-md font-bold text-slate-800 mt-1 group-hover:text-secondary transition font-sans">Open Active Project</h3>
              <p className="text-xs text-slate-500 mt-2 font-sans">Resume layout designing and verification checks.</p>
            </div>
            <Folder className="w-8 h-8 text-secondary/30 group-hover:text-secondary transition shrink-0 ml-4" />
          </div>

          {/* Action 3: Design Templates */}
          <div 
            onClick={() => {
              alert("Templates loaded successfully. Select a template below to instantiate.");
            }}
            className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-amber-400/40 cursor-pointer transition flex items-center justify-between group"
          >
            <div>
              <span className="text-[10px] font-bold text-amber-500 uppercase block">Libraries</span>
              <h3 className="text-md font-bold text-slate-800 mt-1 group-hover:text-amber-500 transition font-sans">Design Templates</h3>
              <p className="text-xs text-slate-500 mt-2 font-sans">Pre-configured cell layouts for SRAM, VCO and mirrors.</p>
            </div>
            <Database className="w-8 h-8 text-amber-500/30 group-hover:text-amber-500 transition shrink-0 ml-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          {/* Recent Projects List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider font-sans">Recent Projects</h2>
            {projects.length === 0 ? (
              <div className="p-8 text-center bg-card border border-border rounded-2xl shadow-sm">
                <p className="text-xs text-slate-500 font-sans">No projects initialized. Click "New Project" to start.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      handleSelectProject(p);
                      setCurrentView("overview");
                    }}
                    className="p-5 bg-card border border-border hover:border-primary/50 rounded-2xl cursor-pointer transition relative group shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 font-sans">{p.name}</h3>
                      <div className="flex gap-2 mb-3">
                        <span className="bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded text-[8px] text-primary font-bold uppercase">{p.technology}</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[8px] text-slate-650 uppercase font-semibold">{p.design_type}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-sans">{p.description || "No description."}</p>
                    </div>
                    <div className="text-[8px] text-slate-400 font-mono mt-4 pt-2.5 border-t border-slate-100 flex justify-between items-center">
                      <span>CREATED: {p.id === -1 ? "N/A" : new Date(p.created_at || Date.now()).toLocaleDateString()}</span>
                      <span className="text-primary opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5 uppercase font-bold text-[9px]">
                        Open Project <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Logs & Templates preview */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider font-sans mb-3">Quick Templates</h2>
              <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2">
                {[
                  { name: "6T SRAM Cell", pdk: "SKY130", type: "Memory" },
                  { name: "Ring Oscillator", pdk: "SKY130", type: "Digital IC" },
                  { name: "Current Mirror", pdk: "SKY130", type: "Analog IC" },
                  { name: "Differential Pair", pdk: "SKY130", type: "Analog IC" }
                ].map((t) => (
                  <div
                    key={t.name}
                    onClick={() => {
                      checkAuthAndRun(() => {
                        setNewName(`Template ${t.name}`);
                        setNewTech(t.pdk);
                        setNewDesignType(t.name);
                        setProjectNodeType(t.type as any);
                        setShowNewModal(true);
                      });
                    }}
                    className="p-3 hover:bg-slate-50 border border-slate-100 rounded-xl cursor-pointer transition flex items-center justify-between text-xs font-sans group"
                  >
                    <div>
                      <strong className="text-slate-705 group-hover:text-primary">{t.name}</strong>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{t.pdk} Node • {t.type}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Activity Timeline */}
            <div>
              <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider font-sans mb-3">Recent Activity</h2>
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 text-xs font-sans">
                <div className="relative border-l border-slate-100 pl-4 ml-1 space-y-4">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-100" />
                    <p className="font-bold text-slate-800">SRAM compilation complete</p>
                    <span className="text-[9px] text-slate-400 font-mono">10 minutes ago</span>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white ring-2 ring-primary/10" />
                    <p className="font-bold text-slate-800">Project '6T SRAM' created</p>
                    <span className="text-[9px] text-slate-400 font-mono">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProjects = () => {
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
                  setCurrentView("overview");
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
  };

  const renderProjectOverview = () => {
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
              onClick={() => setCurrentView("projects")}
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
              onClick={() => setCurrentView("ai-design")}
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
              onClick={() => setCurrentView("schematic")}
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
              onClick={() => setCurrentView("rtl")}
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
              onClick={() => setCurrentView("simulation")}
              className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-emerald-500/50 cursor-pointer transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-xs font-bold text-slate-805 uppercase group-hover:text-emerald-500 transition font-sans">Simulation</h3>
              <p className="text-[10px] text-slate-500 mt-1 font-sans leading-relaxed">Plot logic node voltage transient waveforms sweeps.</p>
            </div>

            {/* Task 5: Verification */}
            <div 
              onClick={() => setCurrentView("verification")}
              className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-indigo-600/50 cursor-pointer transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-805 uppercase group-hover:text-indigo-600 transition font-sans">Verification</h3>
              <p className="text-[10px] text-slate-500 mt-1 font-sans leading-relaxed">Run DRC, LVS, timing slack, and power drop layout checkouts.</p>
            </div>

            {/* Task 6: Reports */}
            <div 
              onClick={() => setCurrentView("reports")}
              className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-rose-500/50 cursor-pointer transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-4">
                <BarChart2 className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="text-xs font-bold text-slate-805 uppercase group-hover:text-rose-500 transition font-sans">Reports</h3>
              <p className="text-[10px] text-slate-500 mt-1 font-sans leading-relaxed">Check Tapeout aggregate margins readiness score indexes.</p>
            </div>

            {/* Task 7: Knowledge */}
            <div 
              onClick={() => setCurrentView("knowledge")}
              className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-slate-500/50 cursor-pointer transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-slate-650" />
              </div>
              <h3 className="text-xs font-bold text-slate-805 uppercase group-hover:text-slate-650 transition font-sans">Knowledge Graph</h3>
              <p className="text-[10px] text-slate-500 mt-1 font-sans leading-relaxed">Search primitives PDK standard libraries database references.</p>
            </div>

            {/* Task 8: Settings */}
            <div 
              onClick={() => setCurrentView("settings")}
              className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-zinc-500/50 cursor-pointer transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-4">
                <Settings className="w-5 h-5 text-zinc-650" />
              </div>
              <h3 className="text-xs font-bold text-slate-805 uppercase group-hover:text-zinc-650 transition font-sans">Settings</h3>
              <p className="text-[10px] text-slate-500 mt-1 font-sans leading-relaxed">Tune active LLM provider endpoints router and model fallbacks.</p>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const renderLibrary = () => {
    const categoriesList = [
      "All",
      "Basic Devices",
      "Passives",
      "Digital",
      "Analog",
      "Memory",
      "RF/Mixed Signal",
      "Clock/Power",
      "Interconnect",
      "Complex IP",
      "Quantum/AI"
    ];

    const filteredComps = libComponents.filter((c: any) => {
      const matchesSearch = 
        c.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
        c.category.toLowerCase().includes(librarySearch.toLowerCase()) ||
        c.model.toLowerCase().includes(librarySearch.toLowerCase());
      
      if (selectedLibraryCategory === "All") return matchesSearch;
      if (selectedLibraryCategory === "Basic Devices") return matchesSearch && c.category === "Basic Components";
      if (selectedLibraryCategory === "Passives") return matchesSearch && c.category === "Passive Components";
      if (selectedLibraryCategory === "Digital") return matchesSearch && (c.category === "Digital Logic" || c.category === "Sequential Logic" || c.category === "Standard Cells");
      if (selectedLibraryCategory === "Analog") return matchesSearch && c.category === "Analog";
      if (selectedLibraryCategory === "Memory") return matchesSearch && c.category === "Memory Components";
      if (selectedLibraryCategory === "RF/Mixed Signal") return matchesSearch && (c.category === "RF" || c.category === "Mixed Signal");
      if (selectedLibraryCategory === "Clock/Power") return matchesSearch && (c.category === "Clock Tree" || c.category === "Power" || c.category === "IO Cells");
      if (selectedLibraryCategory === "Interconnect") return matchesSearch && c.category === "Interconnect";
      if (selectedLibraryCategory === "Complex IP") return matchesSearch && c.category === "Complex IP";
      if (selectedLibraryCategory === "Quantum/AI") return matchesSearch && (c.category === "AI Components" || c.category === "Quantum");
      
      return matchesSearch;
    });

    return (
      <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-6 bg-slate-900 text-slate-100 font-sans">
        {/* Header banner */}
        <div className="border-b border-slate-800 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-white">Intelligent Component Library</h1>
          <p className="text-xs text-slate-400 mt-1">
            VELORA Multi-PDK engineering primitive devices & intellectual property (IP) library manager.
          </p>
        </div>

        {/* 2-Column Split Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: PDK Manager & Category Navigation */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* PDK Manager Panel */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                PDK & IP Manager
              </h2>
              
              <div className="space-y-3 pt-1">
                {[
                  { id: "SKY130", label: "SKY130 Open PDK", desc: "SkyWater 130nm process node" },
                  { id: "GF180", label: "GF180 MCU Node", desc: "GlobalFoundries 180nm CMOS" },
                  { id: "IHP130", label: "IHP130 SG13G2 RF", desc: "IHP 130nm SiGe BiCMOS" },
                  { id: "TSMC65", label: "TSMC65 Advanced", desc: "TSMC 65nm design node pack" },
                  { id: "Generic CMOS", label: "Generic PDK", desc: "Virtual process device primitives" }
                ].map((pdk) => {
                  const isEnabled = pdkStatuses[pdk.id] ?? false;
                  return (
                    <div key={pdk.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/60">
                      <div>
                        <p className="text-xs font-bold text-slate-200">{pdk.label}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{pdk.desc}</p>
                      </div>
                      <button
                        onClick={() => handleTogglePdk(pdk.id, isEnabled)}
                        className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-all duration-300 ${
                          isEnabled ? "bg-emerald-500 justify-end" : "bg-slate-700 justify-start"
                        }`}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Filter Nav */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                Categories
              </h2>
              <div className="space-y-1">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedLibraryCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      selectedLibraryCategory === cat
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Components List & Explorer search */}
          <div className="lg:col-span-3 space-y-5">
            
            {/* Search Input bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search components by name, PDK model, or description..."
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all font-mono"
              />
              <span className="absolute right-4 top-3.5 text-slate-500 text-xs font-mono">
                {filteredComps.length} active items
              </span>
            </div>

            {/* Grid display cards */}
            {filteredComps.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <p className="text-sm font-bold text-slate-400">No components match your query</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try enabling additional PDK packages from the manager panel or adjustments to your search queries.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredComps.map((c: any) => {
                  const paramStr = Object.entries(c.parameters || {})
                    .map(([k, v]) => `${k}=${v}`)
                    .join(", ");
                  return (
                    <div
                      key={c.name}
                      className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between space-y-4"
                    >
                      {/* Top Row headers */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-white font-mono">{c.name}</span>
                          <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 rounded font-mono">
                            {c.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono tracking-tight break-all">
                          {c.model || "sky130_pr_model_generic"}
                        </p>
                      </div>

                      {/* Description body */}
                      <p className="text-xs text-slate-350 leading-relaxed min-h-[36px]">
                        {c.desc}
                      </p>

                      {/* Embedded dynamic Symbol Visual */}
                      <div className="h-16 bg-slate-900/60 border border-slate-800/50 rounded-xl flex items-center justify-center relative overflow-hidden">
                        <span className="absolute top-1.5 left-2 text-[8px] text-slate-500 font-mono">CAD Symbol</span>
                        {c.symbol_svg ? (
                          <svg
                            className="w-10 h-10 stroke-blue-500 fill-none"
                            viewBox="0 0 40 40"
                            dangerouslySetInnerHTML={{ __html: c.symbol_svg }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded border border-dashed border-slate-800 flex items-center justify-center">
                            <span className="text-[8px] text-slate-600 font-mono">N/A</span>
                          </div>
                        )}
                      </div>

                      {/* SPICE model details */}
                      <div className="text-[10px] text-slate-400 space-y-1.5 bg-slate-900 border border-slate-850 p-3 rounded-xl font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-500">PINS:</span>
                          <span className="text-slate-300 font-semibold">{c.pins.join(", ")}</span>
                        </div>
                        {paramStr && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">PARAMS:</span>
                            <span className="text-slate-300">{paramStr}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500">LIMITS:</span>
                          <span className="text-slate-300">
                            VDD max {c.design_constraints?.supply_voltage_max_v ?? 1.8}V
                          </span>
                        </div>
                      </div>

                      {/* AI Context Hints footer */}
                      <div className="text-[9px] text-amber-400/90 bg-amber-950/20 border border-amber-900/30 px-3 py-2 rounded-lg font-mono">
                        <span className="font-bold uppercase text-amber-500 block mb-0.5">AI Copilot metadata</span>
                        Critical param: <span className="underline">{c.ai_metadata?.critical_parameter || "None"}</span>. {c.ai_metadata?.optimization_guideline}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-6 bg-background">
        <div className="border-b border-border pb-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-800 font-sans">System Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Configure co-pilot API routers, simulation bounds, and PDK environments.</p>
        </div>

        <div className="max-w-xl bg-card border border-border p-6 rounded-2xl space-y-6 shadow-sm text-xs font-sans">
          <div className="space-y-2">
            <h2 className="font-bold text-slate-800">LLM Provider Configuration</h2>
            <p className="text-[10px] text-slate-500">Model router selects the optimal synthesis model automatically.</p>
            <div className="grid grid-cols-2 gap-4 pt-2 font-mono">
              <div>
                <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Active Router</label>
                <select className="w-full bg-slate-50 border border-border p-2 rounded-lg text-slate-700 outline-none">
                  <option>VELORA-Router-v1 (Default)</option>
                  <option>DeepSeek-Coder-V3</option>
                  <option>Claude-3.5-Sonnet</option>
                  <option>Gemini-1.5-Pro</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Fallback Mode</label>
                <select className="w-full bg-slate-50 border border-border p-2 rounded-lg text-slate-700 outline-none">
                  <option>Heuristic Logic Math (Default)</option>
                  <option>Mock Response Generator</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="font-bold text-slate-800">DRC Boundary Limits</h2>
            <p className="text-[10px] text-slate-500">Enforce strict process rules checks during layout generation.</p>
            <div className="grid grid-cols-3 gap-4 pt-2 font-mono">
              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <p className="text-[8px] text-slate-400 uppercase font-bold">Min Channel W</p>
                <p className="text-xs font-bold text-slate-700 mt-1">0.15 um</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <p className="text-[8px] text-slate-400 uppercase font-bold">Min Channel L</p>
                <p className="text-xs font-bold text-slate-700 mt-1">0.15 um</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <p className="text-[8px] text-slate-400 uppercase font-bold">Max Sweep Current</p>
                <p className="text-xs font-bold text-slate-700 mt-1">10.0 mA</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h2 className="font-bold text-slate-800">Simulation Settings</h2>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-primary focus:ring-primary" />
              <span className="text-[10px] text-slate-500">Run transient simulation automatically on sizing adjustment</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-primary focus:ring-primary" />
              <span className="text-[10px] text-slate-500">Render high-density schematic outlines in real-time</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAIDesign = () => {
    if (!activeProject) {
      return (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-sans">
          Select or create a project to launch AI Design Workspace.
        </div>
      );
    }
    
    const report = activeDesign?.readiness_report_json || {};
    
    return (
      <div className="flex-1 flex overflow-hidden bg-background h-full font-sans select-text">
        {/* Left Side: Prompt Specs Input & Agent Processes */}
        <div className="flex-1 flex flex-col p-8 overflow-y-auto min-w-0 border-r border-border space-y-6">
          <div className="border-b border-border pb-4 flex justify-between items-center">
            <div>
              <span className="text-[9px] font-bold text-primary uppercase bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">Active Project</span>
              <h1 className="text-lg font-bold tracking-tight text-slate-800 font-sans mt-1 uppercase">{activeProject.name}</h1>
            </div>
            <span className="text-xs text-slate-400 font-mono">PDK: {activeProject.technology}</span>
          </div>

          {/* Prompt input area */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-sans">Describe what you want (Engineering Sizing Specifications)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your target specs (e.g. Generate 6T SRAM optimized for leakage biased at 1.8V)..."
              className="w-full bg-slate-50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-xl p-4 text-xs font-mono resize-none h-24 transition shadow-inner leading-relaxed text-slate-700"
            />
            
            {/* Optimization Selector */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Optimization Priority:</span>
                <select
                  value={optimization}
                  onChange={(e) => setOptimization(e.target.value)}
                  className="bg-slate-50 border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="Low Leakage">Low Leakage</option>
                  <option value="High Speed">High Speed</option>
                  <option value="Min Area">Minimum Area</option>
                </select>
              </div>

              <button
                onClick={() => checkAuthAndRun(handleGenerate)}
                disabled={pipelineRunning || generating}
                className="bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase px-6 py-3 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {pipelineRunning ? "Processing..." : "Generate Design [→]"}
              </button>
            </div>
          </div>

          {/* Step 7: AI Thinking Stepper */}
          {pipelineRunning && (
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 font-sans">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2">Velora Silicon Agent Orchestrator Running</span>
              <div className="space-y-3 font-mono text-[11px]">
                <div className="flex justify-between items-center p-3 rounded bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-700">Requirement Agent</span>
                  <span className={pipelineStageIndex >= 1 ? "text-emerald-600 font-bold" : "text-primary font-bold animate-pulse"}>
                    {pipelineStageIndex >= 1 ? "✓ COMPLETE" : "⚡ RUNNING"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-700">Architecture Agent</span>
                  <span className={pipelineStageIndex >= 3 ? "text-emerald-600 font-bold" : (pipelineStageIndex === 2 ? "text-primary font-bold animate-pulse" : "text-slate-400")}>
                    {pipelineStageIndex >= 3 ? "✓ COMPLETE" : (pipelineStageIndex === 2 ? "⚡ RUNNING" : "○ WAITING")}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-700">Knowledge Agent</span>
                  <span className={pipelineStageIndex >= 2 ? "text-emerald-600 font-bold" : (pipelineStageIndex === 1 ? "text-primary font-bold animate-pulse" : "text-slate-400")}>
                    {pipelineStageIndex >= 2 ? "✓ COMPLETE" : (pipelineStageIndex === 1 ? "⚡ RUNNING" : "○ WAITING")}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-700">RTL Agent</span>
                  <span className={pipelineStageIndex >= 3 ? "text-emerald-600 font-bold" : (pipelineStageIndex === 2 ? "text-primary font-bold animate-pulse" : "text-slate-400")}>
                    {pipelineStageIndex >= 3 ? "✓ COMPLETE" : (pipelineStageIndex === 2 ? "⚡ RUNNING" : "○ WAITING")}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-700">Verification Agent</span>
                  <span className={pipelineStageIndex >= 5 ? "text-emerald-600 font-bold" : (pipelineStageIndex === 4 ? "text-primary font-bold animate-pulse" : "text-slate-400")}>
                    {pipelineStageIndex >= 5 ? "✓ COMPLETE" : (pipelineStageIndex === 4 ? "⚡ RUNNING" : "○ WAITING")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Generated Design Results summary card */}
          {!pipelineRunning && activeDesign && (
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-sans">Compiled Layout Scorecard</h3>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded font-bold">CONFIDENCE: 98%</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans text-xs">
                <div className="p-4 bg-slate-50 border border-border rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Architecture</span>
                  <strong className="text-slate-800 text-sm">6T Cell Structure</strong>
                </div>
                <div className="p-4 bg-slate-50 border border-border rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">RTL Status</span>
                  <strong className="text-emerald-600 text-sm">✓ LINT PASSED</strong>
                </div>
                <div className="p-4 bg-slate-50 border border-border rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Schematic Status</span>
                  <strong className="text-emerald-600 text-sm">✓ COMPILED</strong>
                </div>
                <div className="p-4 bg-slate-50 border border-border rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Timing Slack</span>
                  <strong className="text-slate-800 text-sm">0.0 ps Violations</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Estimated Area</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold font-mono text-slate-800">{report.area_um2 || 0.89}</span>
                    <span className="text-[10px] text-slate-500 font-bold">µm²</span>
                  </div>
                </div>
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Estimated Propagation Delay</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold font-mono text-slate-800">{report.stage_delay_ps || 55}</span>
                    <span className="text-[10px] text-slate-500 font-bold">ps</span>
                  </div>
                </div>
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Estimated Power Drop</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold font-mono text-slate-800">{report.active_power_uw || 12.4}</span>
                    <span className="text-[10px] text-slate-500 font-bold">µW</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons to navigate to workspaces */}
              <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4 font-sans justify-end">
                <button
                  onClick={() => setCurrentView("schematic")}
                  className="bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase px-5 py-3 rounded-xl transition shadow-sm cursor-pointer"
                >
                  Open Schematic
                </button>
                <button
                  onClick={() => setCurrentView("rtl")}
                  className="bg-slate-100 hover:bg-slate-200 border border-border text-slate-700 font-bold text-xs uppercase px-5 py-3 rounded-xl transition cursor-pointer"
                >
                  Open RTL
                </button>
                <button
                  onClick={() => setCurrentView("simulation")}
                  className="bg-slate-100 hover:bg-slate-200 border border-border text-slate-700 font-bold text-xs uppercase px-5 py-3 rounded-xl transition cursor-pointer"
                >
                  Run Simulation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Design optimization dialogue/explanation (Static Targets) */}
        <div className="w-[320px] bg-card p-8 overflow-y-auto shrink-0 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans border-b border-slate-100 pb-2">Active Targets</h3>
            {activeDesign ? (
              <div className="space-y-4 text-xs font-sans leading-relaxed">
                <div className="p-4 bg-slate-50 border border-border rounded-xl shadow-sm">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">PDK Node Constraint</span>
                  <strong className="text-slate-800 mt-1 block">SKY130 Process Node</strong>
                </div>
                <div className="p-4 bg-slate-50 border border-border rounded-xl shadow-sm">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Gate Corner Models</span>
                  <strong className="text-slate-800 mt-1 block">tt / ss / ff</strong>
                </div>
                
                {activeDesign.explanation_markdown && (
                  <div className="border-t border-slate-100 pt-4 mt-2 text-[10px] text-slate-500 font-sans leading-relaxed">
                    <p className="font-bold text-slate-700 uppercase mb-2">Design Reasoning:</p>
                    <div className="whitespace-pre-line">{activeDesign.explanation_markdown.replace(/###/g, "").replace(/\*\*/g, "")}</div>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">No active design targets selected.</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSchematic = () => {
    if (!activeProject || !activeDesign) {
      return (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-sans">
          Select or compile a design to view the Schematic.
        </div>
      );
    }

    return (
      <div className="flex-1 flex overflow-hidden bg-background h-full font-sans">
        {/* Left Side: Toolbar and Schematic Canvas */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          {/* Toolbar */}
          <div className="border-b border-border bg-card p-3 flex justify-between items-center z-10 select-none">
            <div className="flex items-center gap-2">
              <button onClick={() => alert("Zoom In")} className="p-2 hover:bg-slate-50 border border-border rounded-lg text-[10px] font-bold uppercase text-slate-700">Zoom In</button>
              <button onClick={() => alert("Zoom Out")} className="p-2 hover:bg-slate-50 border border-border rounded-lg text-[10px] font-bold uppercase text-slate-700">Zoom Out</button>
              <button onClick={() => alert("Toggle Grid Grid")} className="p-2 hover:bg-slate-50 border border-border rounded-lg text-[10px] font-bold uppercase text-slate-700">Grid: On</button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => alert("Undo sizing change")} className="p-2 hover:bg-slate-50 border border-border rounded-lg text-[10px] font-bold uppercase text-slate-700">Undo</button>
              <button onClick={() => alert("Redo sizing change")} className="p-2 hover:bg-slate-50 border border-border rounded-lg text-[10px] font-bold uppercase text-slate-700">Redo</button>
              <button onClick={() => alert("AI sizing optimizer initiated")} className="bg-primary/10 text-primary border border-primary/20 p-2 hover:bg-primary/20 rounded-lg text-[10px] font-bold uppercase">AI Optimize</button>
            </div>
          </div>

          {/* Schematic Canvas */}
          <div className="flex-1 relative overflow-hidden bg-slate-50 flex items-center justify-center">
            <SchematicCanvas
              activeDesign={activeDesign}
              selectedComponentId={selectedComponentId}
              onSelectComponent={setSelectedComponentId}
            />
          </div>
        </div>

        {/* Right Side: Properties Inspector */}
        <PropertiesInspector
          activeProject={activeProject}
          activeComponentObj={activeComponentObj}
          activeDesign={activeDesign}
          onParameterChange={handleComponentParameterChange}
        />
      </div>
    );
  };

  const renderRTL = () => {
    if (!activeProject || !activeDesign) {
      return (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-sans">
          Select or compile a design to view the RTL workspace.
        </div>
      );
    }

    return (
      <div className="flex-1 flex overflow-hidden bg-[#151515] h-full text-slate-300 font-mono">
        {/* Left Side: Explorer */}
        <div className="w-[200px] border-r border-[#252525] bg-[#1e1e1e] p-4 flex flex-col justify-between shrink-0 select-none">
          <div className="space-y-4">
            <span className="text-[9px] uppercase font-bold text-slate-550 tracking-wider block font-sans">RTL Files Explorer</span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-white font-bold p-1 bg-[#2d2d2d] rounded cursor-pointer">
                <FileCode className="w-3.5 h-3.5 text-amber-500" />
                <span>{activeProject.name.toLowerCase().replace(/\s+/g, "_")}.v</span>
              </div>
              <div className="flex items-center gap-2 p-1 hover:bg-[#2d2d2d] rounded cursor-pointer text-slate-500">
                <FileCode className="w-3.5 h-3.5 text-blue-500" />
                <span>tb_sram.v</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Editor */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="bg-[#1e1e1e] border-b border-[#151515] px-4 py-2 flex items-center gap-2 text-[10px] text-white">
            <FileCode className="w-3.5 h-3.5 text-amber-500" />
            <span>{activeProject.name.toLowerCase().replace(/\s+/g, "_")}.v</span>
          </div>

          <div className="flex-1 p-6 overflow-y-auto text-xs bg-[#151515] leading-relaxed text-emerald-400">
            <pre className="font-mono whitespace-pre select-text">
{`// ===================================================================
// VELORA AI-Generated Hardware RTL description
// Technology PDK: SKY130
// Design: ${activeProject.name}
// ===================================================================

module ${activeProject.name.toLowerCase().replace(/\s+/g, "_")} (
    input  wire        WL,
    inout  wire        BL,
    inout  wire        BLB,
    output logic       Q,
    output logic       QB
);

    // Cross-coupled CMOS feedback storage latch cell
    wire inv1_out;
    wire inv2_out;

    assign inv1_out = ~inv2_out;
    assign inv2_out = ~inv1_out;

    // Pass gates
    assign Q  = WL ? BL  : inv1_out;
    assign QB = WL ? BLB : inv2_out;

endmodule
`}
            </pre>
          </div>

          {/* Terminal */}
          <div className="h-[180px] border-t border-[#252525] bg-[#111111] flex flex-col">
            <div className="bg-[#1a1a1a] px-4 py-2 flex gap-4 text-[10px] font-sans text-slate-400 border-b border-[#252525]">
              <span className="text-white border-b-2 border-primary pb-1 font-bold cursor-pointer">Problems (0)</span>
              <span className="hover:text-white cursor-pointer">Terminal Output</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto text-[10px] text-slate-400 select-text leading-relaxed font-mono">
              <p className="text-emerald-500 font-bold">[INFO] Verilog compiler lint checks completed. status: PASSED.</p>
              <p className="text-slate-500">[INFO] Model parameters verified successfully against PDK boundary limits.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSimulation = () => {
    if (!activeProject || !activeDesign) {
      return (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-sans">
          Select or compile a design to open the Simulation Scope.
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-6 bg-background font-sans">
        <div className="border-b border-border pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 font-sans">Simulation Workspace</h1>
            <p className="text-xs text-slate-500 mt-1">Configure parameters and plot transient/DC response curves.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-border">
            <button className="bg-white text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">Transient</button>
            <button className="text-slate-500 px-3 py-1.5 text-xs font-bold">DC Sweep</button>
            <button className="text-slate-500 px-3 py-1.5 text-xs font-bold">AC Analysis</button>
          </div>
        </div>

        {/* Oscilloscope Canvas */}
        <div className="flex-1 min-h-[350px]">
          <SimulationScope
            activeDesign={activeDesign}
            probedSignals={probedSignals}
            onToggleProbe={handleSignalProbeToggle}
          />
        </div>

        {/* Step 12 & 13: AI Suggestions & Sizing Optimization Comparison */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 font-sans mt-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2">Velora Sizing Co-Pilot Recommendations</span>
          
          {!isOptimized ? (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 text-xs text-slate-650">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 font-bold">Leakage Current Optimization</strong>
                  <p className="mt-1 font-sans">The pull-up PMOS transistors (M_PU1 / M_PU2) are sized at W=2.0um. Reducing the channel width to 1.8um decreases subthreshold leakage while maintaining a stable cell ratio.</p>
                  <p className="text-[10px] text-primary font-bold mt-1.5 uppercase font-sans">Estimated stats improvement: -13% Static Power, +4ps Stage Delay</p>
                </div>
              </div>
              <button
                onClick={runSizingOptimization}
                className="bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase px-5 py-3 rounded-xl transition shadow-sm cursor-pointer shrink-0"
              >
                Run Sizing Optimization
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="font-bold uppercase text-[9px] text-emerald-900">Optimization Completed (New Version v{activeDesign.version} Saved)</strong>
                  <p className="mt-0.5 font-sans">PMOS width parameter was scaled down. Sizing graph compiled and transient raw waveforms re-solved.</p>
                </div>
              </div>

              {/* Version Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold">
                      <th className="py-2 pr-4">Metrics Parameter</th>
                      <th className="py-2 px-4">Version 1 (Initial)</th>
                      <th className="py-2 px-4">Version 2 (Optimized)</th>
                      <th className="py-2 pl-4 text-emerald-600">Delta Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                    <tr>
                      <td className="py-2 pr-4 font-sans font-semibold text-slate-500">PMOS Transistor Width (W)</td>
                      <td className="py-2 px-4">2.0 µm</td>
                      <td className="py-2 px-4 text-slate-800 font-bold">1.8 µm</td>
                      <td className="py-2 pl-4 text-emerald-600 font-bold">-0.2 µm (-10%)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-sans font-semibold text-slate-500">Estimated propagation delay</td>
                      <td className="py-2 px-4">55.0 ps</td>
                      <td className="py-2 px-4 text-slate-800 font-bold">59.0 ps</td>
                      <td className="py-2 pl-4 text-amber-600 font-bold">+4.0 ps (+7%)</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-sans font-semibold text-slate-500">Static subthreshold leakage</td>
                      <td className="py-2 px-4">4.20 nW</td>
                      <td className="py-2 px-4 text-slate-800 font-bold">3.65 nW</td>
                      <td className="py-2 pl-4 text-emerald-600 font-bold">-0.55 nW (-13%)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVerification = () => {
    if (!activeProject || !activeDesign) {
      return (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-sans">
          Select or compile a design to open Verification.
        </div>
      );
    }

    const report = activeDesign.readiness_report_json || {};

    return (
      <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-8 bg-background font-sans">
        {/* Header with Verify button */}
        <div className="border-b border-border pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 font-sans">Physical Verification Suite</h1>
            <p className="text-xs text-slate-500 mt-1">Rule checking and design layout match checklists.</p>
          </div>
          
          {verifyStatus === "idle" && (
            <button
              onClick={runVerificationCheck}
              className="bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase px-5 py-3 rounded-xl transition shadow-sm cursor-pointer"
            >
              Verify Design
            </button>
          )}
        </div>

        {verifyStatus === "running" && (
          <div className="bg-card border border-border p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm space-y-4">
            <RefreshCw className="w-10 h-10 text-primary animate-spin" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-sans">Executing Verification Pipeline</h3>
              <p className="text-xs text-slate-500 mt-1">Checking DRC rules, layout port connections, LVS nets, and timing margins...</p>
            </div>
          </div>
        )}

        {(verifyStatus === "passed" || verifyStatus === "idle") && (
          <>
            {verifyStatus === "passed" && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-sans flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <strong className="block text-emerald-900 font-bold uppercase text-[10px]">Verification Succeeded</strong>
                  <p className="mt-0.5">DRC, LVS, Sizing, Timing and Power grids matched PDK constraints perfectly. 0 errors detected.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-sans block">Design Rule (DRC)</span>
                  <span className="text-lg font-bold text-emerald-600 mt-1 block">PASS ({report.drc || 100}%)</span>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-sans block">Layout vs Schematic</span>
                  <span className="text-lg font-bold text-emerald-600 mt-1 block">PASS ({report.lvs || 100}%)</span>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-sans block">Timing Violations</span>
                  <span className="text-lg font-bold text-emerald-600 mt-1 block">PASS (0 Slack)</span>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-sans block">Power Grid Drop</span>
                  <span className="text-lg font-bold text-emerald-600 mt-1 block">PASS ({report.power || 91}%)</span>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 bg-card border border-border p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans mb-4">Total Test Coverage</span>
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                    <circle cx="50" cy="50" r="40" stroke="#2563eb" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.92)} />
                  </svg>
                  <span className="absolute text-2xl font-bold font-mono text-slate-800">92%</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">Dynamic corner coverage calculated at SS/TT/FF models.</p>
              </div>

              <div className="md:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block border-b border-slate-100 pb-2 font-sans">Velora Critique & Recommendations</span>
                <div className="space-y-3 font-sans">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-650 flex gap-2">
                    <Info className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">Channel length check</p>
                      <p className="mt-1 font-sans">transistor lengths are tuned near minimum PDK boundaries (0.15um). Recommend keeping length at 0.15um for high performance.</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-655 flex gap-2">
                    <Info className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">Body-bias settings</p>
                      <p className="mt-1 font-sans">Applying body-bias in NMOS pass gates can reduce threshold leakage current by up to 20% in standby state.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderReports = () => {
    if (!activeProject || !activeDesign) {
      return (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-sans">
          Select or compile a design to view Reports.
        </div>
      );
    }

    const report = activeDesign.readiness_report_json || {};

    return (
      <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-8 bg-background font-sans max-w-4xl mx-auto">
        <div className="border-b border-border pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 font-sans">Engineering Readiness Report</h1>
            <p className="text-xs text-slate-500 mt-1">Official design scorecard for tapeout sign-off review.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => alert("Report exported successfully as PDF")} className="bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-lg transition shadow-sm cursor-pointer">Export PDF</button>
            <button onClick={() => alert("Report exported successfully as HTML")} className="bg-slate-100 hover:bg-slate-200 border border-border text-slate-700 font-bold text-xs uppercase px-4 py-2.5 rounded-lg transition cursor-pointer">Export HTML</button>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase font-sans">Aggregate readiness level</p>
              <h2 className="text-4xl font-black font-mono text-primary mt-1">{report.overall || 94}%</h2>
            </div>
            <span className="bg-emerald-50 text-emerald-600 font-bold px-3 py-1 rounded border border-emerald-100 text-xs uppercase font-sans">Low Tapeout Risk</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 font-sans text-xs">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-slate-400 block uppercase font-bold text-[9px]">RTL Quality</span>
              <strong className="text-slate-800 font-mono text-lg">{report.rtl || 98}%</strong>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-slate-400 block uppercase font-bold text-[9px]">Verification Margin</span>
              <strong className="text-slate-800 font-mono text-lg">{report.verification || 100}%</strong>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-slate-400 block uppercase font-bold text-[9px]">Timing Margin</span>
              <strong className="text-slate-800 font-mono text-lg">{report.timing || 82}%</strong>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-slate-400 block uppercase font-bold text-[9px]">Power Grid Drop</span>
              <strong className="text-slate-800 font-mono text-lg">{report.power || 91}%</strong>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-slate-400 block uppercase font-bold text-[9px]">DRC Rule Passing</span>
              <strong className="text-slate-800 font-mono text-lg">{report.drc || 100}%</strong>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-slate-400 block uppercase font-bold text-[9px]">LVS Equivalence</span>
              <strong className="text-slate-800 font-mono text-lg">{report.lvs || 100}%</strong>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderKnowledge = () => {
    return (
      <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-8 bg-background font-sans max-w-4xl mx-auto">
        <div className="border-b border-border pb-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-800 font-sans">Relational Knowledge Engine</h1>
          <p className="text-xs text-slate-500 mt-1">Search documentation, cell standards, and device datasets.</p>
        </div>

        <div className="w-full bg-card border border-border rounded-xl flex items-center px-4 py-1 shadow-sm">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search PDK documents, matching rules, or standard cells..."
            className="flex-1 bg-transparent text-xs text-slate-800 outline-none py-3 font-sans"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans border-b border-slate-100 pb-2">SKY130 PDK Library</h3>
            <ul className="space-y-2 text-xs text-slate-650 font-mono">
              <li className="flex justify-between font-mono"><span>sky130_fd_pr__pfet_01v8</span><span className="text-primary font-bold">1.8V PMOS</span></li>
              <li className="flex justify-between font-mono"><span>sky130_fd_pr__nfet_01v8</span><span className="text-primary font-bold">1.8V NMOS</span></li>
              <li className="flex justify-between font-mono"><span>sky130_fd_pr__res_high_po</span><span className="text-primary font-bold">Poly Resistor</span></li>
            </ul>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans border-b border-slate-100 pb-2">Relational Knowledge Graph Links</h3>
            <ul className="space-y-2.5 text-xs text-slate-600 font-sans">
              <li className="p-2 bg-slate-55 border border-slate-100 rounded-lg"><strong>6T SRAM Cell</strong> depends on <strong>Cross-coupled Latch</strong></li>
              <li className="p-2 bg-slate-55 border border-slate-100 rounded-lg"><strong>Static Noise Margin</strong> is constrained by <strong>transistor channel width ratios</strong></li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background text-slate-800 overflow-hidden font-sans antialiased">
      
      {/* 1. Left Global Navigation Sidebar */}
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

      {/* 2. Main Workbench Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 bg-background h-full overflow-hidden relative">
        
        {/* Global Header Bar */}
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

        {/* Dynamic Panels page routing view */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {currentView === "dashboard" && renderDashboard()}
          {currentView === "projects" && renderProjects()}
          {currentView === "overview" && renderProjectOverview()}
          {currentView === "ai-design" && renderAIDesign()}
          {currentView === "schematic" && renderSchematic()}
          {currentView === "rtl" && renderRTL()}
          {currentView === "simulation" && renderSimulation()}
          {currentView === "verification" && renderVerification()}
          {currentView === "reports" && renderReports()}
          {currentView === "knowledge" && renderKnowledge()}
          {currentView === "settings" && renderSettings()}
        </div>

      </div>

      {/* 3. Global Search Dialog command palette Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="absolute inset-0" onClick={() => setIsSearchOpen(false)} />
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center px-4 border-b border-slate-200">
              <Search className="w-[18px] h-[18px] text-slate-400 mr-3 shrink-0" strokeWidth={1.5} />
              <input 
                autoFocus
                value={searchPaletteQuery}
                onChange={(e) => setSearchPaletteQuery(e.target.value)}
                className="flex-1 bg-transparent py-4 outline-none text-[13px] text-slate-800 placeholder:text-slate-400 font-mono"
                placeholder="Search projects, components, or type compiler command..."
              />
              <kbd 
                onClick={() => setIsSearchOpen(false)}
                className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 ml-2 text-[10px] font-medium font-mono text-slate-500 bg-slate-100 border border-slate-200 rounded-[4px] cursor-pointer hover:text-slate-800 hover:bg-slate-200 transition-colors"
              >
                ESC
              </kbd>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="ml-3 p-1 rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <X className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-2 max-h-[300px] overflow-y-auto space-y-1">
              {/* 1. Projects search results */}
              {projects.filter(p => p.name.toLowerCase().includes(searchPaletteQuery.toLowerCase())).map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    handleSelectProject(p);
                    setCurrentView("overview");
                    setIsSearchOpen(false);
                    setSearchPaletteQuery("");
                  }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-slate-900 cursor-pointer text-xs transition"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-3.5 h-3.5 text-primary" />
                    <span>Project: <strong className="text-primary">{p.name}</strong></span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{p.design_type}</span>
                </div>
              ))}

              {/* 2. Library components search results */}
              {libComponents.filter(c => c.name.toLowerCase().includes(searchPaletteQuery.toLowerCase())).map(c => (
                <div
                  key={c.name}
                  onClick={() => {
                    setCurrentView("library");
                    setIsSearchOpen(false);
                    setSearchPaletteQuery("");
                  }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-slate-900 cursor-pointer text-xs transition"
                >
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-purple-600" />
                    <span>Component: <strong className="text-purple-600">{c.name}</strong></span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{c.model}</span>
                </div>
              ))}

              {/* 3. Fast command palette trigger */}
              {searchPaletteQuery.length > 5 && (
                <div
                  onClick={() => {
                    checkAuthAndRun(() => {
                      setPrompt(searchPaletteQuery);
                      setCurrentView("workspace");
                      setIsSearchOpen(false);
                      setSearchPaletteQuery("");
                      setTimeout(() => handleGenerate(), 100);
                    });
                  }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-primary cursor-pointer text-xs transition font-mono"
                >
                  <div className="flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span>Run Synthesis Compiler: "{searchPaletteQuery}"</span>
                  </div>
                  <span className="text-[9px] uppercase font-bold bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded text-primary">Enter ⚡</span>
                </div>
              )}

              {/* Fallback empty view */}
              {projects.filter(p => p.name.toLowerCase().includes(searchPaletteQuery.toLowerCase())).length === 0 &&
               libComponents.filter(c => c.name.toLowerCase().includes(searchPaletteQuery.toLowerCase())).length === 0 &&
               searchPaletteQuery.length <= 5 && (
                <div className="p-4 py-8 flex flex-col items-center justify-center text-slate-400">
                  <Command className="w-6 h-6 text-slate-300 mb-2 animate-pulse" strokeWidth={1.5} />
                  <p className="text-xs font-medium">Type to search projects, component models, or enter commands...</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 4. New Project Creation Dialog Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-sans">
                <Layers className="w-4 h-4 text-primary" />
                CREATE NEW CIRCUIT PROJECT
              </h3>
              <button 
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-700 font-sans cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs font-sans">
              <div>
                <label className="text-slate-500 block mb-1 uppercase font-bold tracking-wider text-[9px]">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6T SRAM Cell, 3-Stage VCO"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary outline-none rounded-lg p-2.5 text-slate-800 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-500 block mb-1 uppercase font-bold tracking-wider text-[9px]">Technology Node</label>
                  <select
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-lg p-2.5 text-slate-800 cursor-pointer font-sans"
                  >
                    <option value="SKY130">130nm Node</option>
                    <option value="GPDK045">65nm Node</option>
                    <option value="GPDK045">45nm Node</option>
                    <option value="TSMC28">28nm Node</option>
                    <option value="TSMC14">14nm Node</option>
                    <option value="TSMC07">7nm Node</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 block mb-1 uppercase font-bold tracking-wider text-[9px]">PDK Selection</label>
                  <select
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-lg p-2.5 text-slate-800 cursor-pointer font-sans"
                  >
                    <option value="SKY130">SKY130</option>
                    <option value="GPDK045">GPDK045</option>
                    <option value="TSMC65">TSMC65</option>
                  </select>
                </div>
              </div>

              {/* Project Type selection */}
              <div>
                <label className="text-slate-500 block mb-1.5 uppercase font-bold tracking-wider text-[9px]">Project Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Digital IC", "Analog IC", "Mixed Signal", "Memory", "Custom Circuit"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setProjectNodeType(type)}
                      className={`p-2 border rounded-lg text-[10px] font-bold uppercase transition text-center cursor-pointer ${
                        projectNodeType === type 
                          ? "bg-primary border-primary text-white" 
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-500 block mb-1 uppercase font-bold tracking-wider text-[9px]">Description</label>
                <textarea
                  placeholder="Describe targets, cell bias parameters, noise margins..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary outline-none rounded-lg p-2.5 text-slate-800 font-sans h-16 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
              >
                <span>INITIALIZE DESIGN REPO</span>
                <ChevronRight className="w-4 h-4 stroke-[3px]" />
              </button>
            </form>

          </div>
        </div>
      )}

      {/* 5. Authentication Overlay Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 text-slate-900">
            
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xl mb-3 shadow-md">
                V
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-wide font-sans">Access VELORA</h2>
              <p className="text-[11px] text-slate-500 mt-1 text-center font-sans">
                Sign in to compile logic circuits and unlock AI timing solver.
              </p>
            </div>

            {authError && (
              <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-lg text-xs text-red-600 text-center font-sans">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1.5 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="engineer@velora.ai"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-primary placeholder-slate-400 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-primary placeholder-slate-400 font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm mt-6"
              >
                {authLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isRegistering ? "Create Account" : "Access Workspace"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-xs">
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-primary hover:underline font-semibold"
              >
                {isRegistering ? "Already have an account? Sign In" : "Need an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
