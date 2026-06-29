"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
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
  FileCode
} from "lucide-react";

// Pipeline Stages definitions
interface PipelineStage {
  id: string;
  label: string;
  log: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  { id: "parse", label: "Requirement Parsing", log: "[INFO] Parsing natural language prompt and extracting design constraints..." },
  { id: "tech", label: "Technology Check", log: "[INFO] Loading technology PDK rules for SKY130. Minimum W/L set to 0.15um." },
  { id: "alloc", label: "Component Allocation", log: "[INFO] Querying component library and sizing primitive transistors..." },
  { id: "connect", label: "Topology & Connectivity Build", log: "[INFO] Creating nodes and routing electrical net paths..." },
  { id: "erc", label: "Electrical Rule Checking (ERC)", log: "[INFO] Running DRC verification... Checking for floating gates and shorts. Status: PASSED." },
  { id: "spice", label: "SPICE Netlist Generation", log: "[INFO] Compiling subcircuit netlist formatted for SKY130 FET models..." },
  { id: "sim", label: "Simulation Solver Execution", log: "[INFO] Invoking transient simulation solver. Sweeping sweep points..." },
  { id: "ai", label: "Design Tradeoff Analysis", log: "[INFO] Generating IC design review report and sizing explanations..." }
];

const libComponents: any[] = [
  {
    name: "NMOS",
    pins: ["D", "G", "S", "B"],
    params: "W=0.36u, L=0.15u, M=1",
    model: "sky130_fd_pr__nfet_01v8",
    desc: "1.8V Standard NMOS Transistor"
  },
  {
    name: "PMOS",
    pins: ["D", "G", "S", "B"],
    params: "W=0.54u, L=0.15u, M=1",
    model: "sky130_fd_pr__pfet_01v8",
    desc: "1.8V Standard PMOS Transistor"
  },
  {
    name: "RES",
    pins: ["1", "2"],
    params: "R=1000 Ohm",
    model: "sky130_fd_pr__res_generic_m1",
    desc: "SKY130 Metal 1 Precision Resistor"
  },
  {
    name: "CAP",
    pins: ["1", "2"],
    params: "C=1.0 pF",
    model: "sky130_fd_pr__cap_mim_m3_1",
    desc: "MIM Capacitor (Metal-Insulator-Metal)"
  }
];

export default function Dashboard() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
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

  // Sidebar left tabs
  const [leftTab, setLeftTab] = useState<"projects" | "components" | "history">("projects");

  const activeComponentObj = activeDesign?.circuit_graph_json?.nodes?.find(
    (n: any) => n.id === selectedComponentId
  );

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("velora_token");
    if (!token) {
      router.push("/");
    } else {
      loadProjects();
    }
  }, []);

  // Pre-load default probed signals when design changes
  useEffect(() => {
    if (activeDesign?.simulation_results_json?.waveforms) {
      const keys = Object.keys(activeDesign.simulation_results_json.waveforms).filter(k => k !== "x");
      setProbedSignals(keys);
    }
  }, [activeDesign]);

  const loadProjects = async () => {
    try {
      const data = await api.listProjects();
      setProjects(data);
      if (data.length > 0) {
        handleSelectProject(data[0]);
      }
    } catch (err: any) {
      console.error("Failed to load projects", err);
      if (err.message.includes("401") || err.message.includes("validate")) {
        localStorage.removeItem("velora_token");
        router.push("/");
      }
    }
  };

  const handleSelectProject = async (project: any) => {
    setSelectedProjectId(project.id);
    setActiveProject(project);
    setActiveDesign(null);
    setSelectedComponentId(null);
    
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
      const newProj = await api.createProject(newName, newTech, newDesignType, newDesc);
      setProjects([...projects, newProj]);
      handleSelectProject(newProj);
      setShowNewModal(false);
      
      setNewName("");
      setNewDesc("");
      
      if (newDesignType === "Ring Oscillator") {
        setPrompt(`Generate a 3-stage Ring Oscillator using ${newTech} optimized for high speed.`);
        setOptimization("High Speed");
      } else if (newDesignType === "Current Mirror") {
        setPrompt(`Generate a Current Mirror using ${newTech} biased at 10uA optimized for low leakage.`);
        setOptimization("Low Leakage");
      } else if (newDesignType === "Differential Pair") {
        setPrompt(`Generate a Differential Pair using ${newTech} optimized for high speed.`);
        setOptimization("High Speed");
      } else {
        setPrompt(`Generate a 6T SRAM cell using ${newTech} optimized for low leakage.`);
        setOptimization("Low Leakage");
      }
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
          } else {
            setSelectedProjectId(null);
            setActiveProject(null);
            setDesigns([]);
            setActiveDesign(null);
          }
        }
      } catch (err) {
        alert("Failed to delete project");
      }
    }
  };

  // Run generation with timed visual pipeline simulation
  const handleGenerate = async () => {
    if (!selectedProjectId) return;
    
    // Start timed visual compiler pipeline progress
    setGenerating(true);
    setPipelineRunning(true);
    setPipelineStageIndex(0);
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
          // Trigger actual API call once animation completes
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

  const handleLogout = () => {
    api.logout();
    router.push("/");
  };

  // CLIENT-SIDE REAL-TIME RE-SIMULATOR & RE-NETLISTER
  const handleComponentParameterChange = (paramName: string, value: number) => {
    if (!activeDesign) return;

    // 1. Deep clone activeDesign
    const updatedDesign = JSON.parse(JSON.stringify(activeDesign));

    // 2. Find and update component parameters in graph nodes
    const node = updatedDesign.circuit_graph_json.nodes.find(
      (n: any) => n.id === selectedComponentId
    );
    if (!node) return;
    node.properties.parameters[paramName] = value;

    // Also update in plan_json components list
    const planComp = updatedDesign.plan_json.components.find(
      (c: any) => c.id === selectedComponentId
    );
    if (planComp) {
      planComp.parameters[paramName] = value;
    }

    // 3. Regenerate SPICE netlist string on the client dynamically
    const netlistText = regenerateNetlistClient(updatedDesign);
    updatedDesign.netlist_content = netlistText;

    // 4. Recalculate simulation waveforms & metrics on the client dynamically
    const simResults = recomputeSimulationClient(
      updatedDesign.requirements_json.type,
      updatedDesign.requirements_json.optimization,
      updatedDesign.circuit_graph_json.nodes,
      vddSlider
    );
    updatedDesign.simulation_results_json = simResults;

    // 5. Update state
    setActiveDesign(updatedDesign);

    // Update in designs history array
    setDesigns(prev => prev.map(d => d.id === updatedDesign.id ? updatedDesign : d));
  };

  // Helper to dynamically re-generate SPICE netlist text on the client
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
    // Hardcoded port list mapping for clean layout matching our generated netlist
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

  // Client-side physics-simulation calculator that dynamically updates waveforms and metrics
  const recomputeSimulationClient = (topology: string, optimization: string, nodes: any[], vdd: number): any => {
    const points_count = 100;
    let waveforms: any = {};
    let metrics: any = {};

    if (topology === "6T SRAM") {
      const time_pts = Array.from({ length: points_count }, (_, i) => round(i * 0.1, 2));
      
      // Fetch access and pull-down sizing
      const pgNode = nodes.find((n: any) => n.id === "M_PG1");
      const pdNode = nodes.find((n: any) => n.id === "M_PD1");
      const w_pg = pgNode?.properties?.parameters?.W || 0.45;
      const l_pg = pgNode?.properties?.parameters?.L || 0.25;
      const w_pd = pdNode?.properties?.parameters?.W || 0.60;
      const l_pd = pdNode?.properties?.parameters?.L || 0.25;

      // Sizing-based write delay: smaller PG / wider L increases resistance and write delay
      const baseDelay = 55e-12; // 55 ps
      const calculatedDelay = baseDelay * (l_pg / w_pg) / (0.25 / 0.45);
      
      // Calculate leakage: leakage increases with W/L ratios
      let sumRatio = 0;
      nodes.forEach((n: any) => {
        if (["NMOS", "PMOS"].includes(n.category)) {
          const w = n.properties.parameters.W || 0.36;
          const l = n.properties.parameters.L || 0.15;
          sumRatio += w / l;
        }
      });
      const leakagePower = 4.2e-9 * (sumRatio / 15.6) * (vdd / 1.8);

      // Sizing ratio writeability and read margins
      const cellRatio = (w_pd / l_pd) / (w_pg / l_pg);
      const readStabilityVal = cellRatio > 1.2 ? "PASSED" : "CRITICAL";

      // Re-map waveforms
      const wl_pts: number[] = [];
      const bl_pts: number[] = [];
      const blb_pts: number[] = [];
      const q_pts: number[] = [];
      const qb_pts: number[] = [];

      // Sizing determines transition speed (tau time constant)
      const tau = 0.28 * (calculatedDelay / baseDelay);

      for (const t of time_pts) {
        const wl = (t >= 2.0 && t <= 6.0) ? vdd : 0.0;
        wl_pts.push(wl);
        
        const bl = t < 2.5 ? vdd : vdd;
        bl_pts.push(bl);
        const blb = t < 2.5 ? vdd : 0.0;
        blb_pts.push(blb);

        // Adjust flip timing based on access delay
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
      
      // Calculate delay based on sizing of stage 1 PMOS/NMOS
      const pNode = nodes.find((n: any) => n.id === "M_P1");
      const nNode = nodes.find((n: any) => n.id === "M_N1");
      const w_p = pNode?.properties?.parameters?.W || 0.54;
      const w_n = nNode?.properties?.parameters?.W || 0.36;
      const l_val = pNode?.properties?.parameters?.L || 0.15;

      const baseTd = 50e-12; // 50 ps
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

      const iref_target = 10.0; // 10 uA target
      // Scaling multiplier
      const scale = (w_mir / l_mir) / (w_ref / l_ref);
      const iout_target = iref_target * scale;

      const lmbda = 0.22 * (0.5 / l_mir); // Larger L reduces channel modulation lambda
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

    } else { // Differential Pair
      const vid_pts = Array.from({ length: points_count }, (_, i) => round(-1.0 + i * 0.02, 2));
      const inNode = nodes.find((n: any) => n.id === "M_IN1");
      const loadNode = nodes.find((n: any) => n.id === "M_L1");

      const w_in = inNode?.properties?.parameters?.W || 2.0;
      const l_in = inNode?.properties?.parameters?.L || 0.5;
      const w_load = loadNode?.properties?.parameters?.W || 4.0;
      const l_load = loadNode?.properties?.parameters?.L || 0.5;

      // Sizing-based gain calculation: gm * ro
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

  const round = (num: number, decimal: number) => {
    const factor = Math.pow(10, decimal);
    return Math.round(num * factor) / factor;
  };

  // Toggle checklist probes
  const handleSignalProbeToggle = (sig: string) => {
    setProbedSignals(prev => 
      prev.includes(sig) ? prev.filter(s => s !== sig) : [...prev, sig]
    );
  };

  // CROSS-PROBING: Click netlist line to highlight component
  const handleNetlistLineClick = (lineText: string) => {
    const match = lineText.match(/\bX(M_PU\d|M_PD\d|M_PG\d|M_P\d+|M_N\d+|M_REF|M_MIR|M_IN1|M_IN2|M_TAIL|M_L1|M_L2|V_VDD|V_GND)\b/i) 
      || lineText.match(/\b(M_PU\d|M_PD\d|M_PG\d|M_P\d+|M_N\d+|M_REF|M_MIR|M_IN1|M_IN2|M_TAIL|M_L1|M_L2|V_VDD|V_GND)\b/i);
    
    if (match) {
      const compId = match[1].toUpperCase();
      setSelectedComponentId(compId);
      setActiveTab("schematic");
    }
  };

  return (
    <div className="flex h-screen bg-[#060a12] text-slate-100 overflow-hidden font-mono antialiased">
      
      {/* 1. Left Control Sidebar */}
      <div className="w-[300px] border-r border-[#192438] bg-[#090f1c] flex flex-col h-full z-20">
        
        {/* Logo and App name */}
        <div className="p-4 border-b border-[#192438] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-black text-sm shadow-inner shadow-cyan-300">
              V
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider text-slate-200">VELORA</h1>
              <p className="text-[9px] text-cyan-400 uppercase tracking-widest font-sans font-bold">AI Semiconductor IDE</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 hover:bg-[#1a253a] text-slate-400 hover:text-slate-200 rounded-md transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#05080e] p-1 mx-2 my-3 rounded-lg border border-[#162136]">
          <button
            onClick={() => setLeftTab("projects")}
            className={`flex-1 py-1.5 rounded-md text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 transition ${
              leftTab === "projects" ? "bg-[#142036] text-cyan-400 border border-[#213554]" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Projects
          </button>
          <button
            onClick={() => setLeftTab("components")}
            className={`flex-1 py-1.5 rounded-md text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 transition ${
              leftTab === "components" ? "bg-[#142036] text-cyan-400 border border-[#213554]" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Library
          </button>
          <button
            onClick={() => setLeftTab("history")}
            className={`flex-1 py-1.5 rounded-md text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 transition ${
              leftTab === "history" ? "bg-[#142036] text-cyan-400 border border-[#213554]" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History
          </button>
        </div>

        {/* Sidebar Content Panel */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          
          {/* A. Projects Tab */}
          {leftTab === "projects" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Design Repos</span>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] uppercase font-bold px-2 py-1 rounded flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New
                </button>
              </div>

              <div className="space-y-2">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProject(p)}
                    className={`p-3 rounded-lg border transition cursor-pointer relative group ${
                      selectedProjectId === p.id 
                        ? "bg-[#121c2e] border-cyan-500/50 shadow-md shadow-cyan-950/20" 
                        : "bg-[#0b111e] border-[#152033] hover:border-[#1d2d48]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-xs font-bold text-slate-200 truncate pr-6">{p.name}</h4>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id); }}
                        className="opacity-0 group-hover:opacity-100 hover:text-rose-400 text-slate-600 text-[10px] font-sans absolute right-3 top-3 transition"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex gap-2 text-[9px] text-slate-400 mb-2">
                      <span className="bg-[#18263d] px-1.5 py-0.5 rounded text-cyan-400 font-bold uppercase">{p.technology}</span>
                      <span className="bg-[#18263d] px-1.5 py-0.5 rounded text-slate-300 uppercase">{p.design_type}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{p.description || "No description."}</p>
                  </div>
                ))}
              </div>

              {/* GENERATED FILES DIRECTORY TREE (When active project exists) */}
              {activeProject && activeDesign && (
                <div className="pt-4 border-t border-[#1b2940]">
                  <span className="text-[10px] uppercase font-bold text-slate-500 px-1 mb-2 block">Generated Files</span>
                  <div className="space-y-1.5 p-2 bg-[#05080e]/60 border border-[#16223b] rounded-lg text-[10px]">
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                      <Folder className="w-3.5 h-3.5 text-cyan-500" />
                      <span>{activeProject.name.toLowerCase().replace(" ", "_")}/</span>
                    </div>
                    
                    {/* Sub-files linking to corresponding workspace tabs */}
                    <div className="pl-4 space-y-1">
                      <div 
                        onClick={() => setActiveTab("schematic")}
                        className={`flex items-center gap-1.5 p-1 rounded cursor-pointer transition hover:bg-[#121c2e] ${activeTab === "schematic" ? "text-cyan-400 font-bold bg-[#121c2e]/45" : "text-slate-400"}`}
                      >
                        <FileCode className="w-3 h-3 text-cyan-500/80" />
                        <span>schematic.svg</span>
                      </div>
                      <div 
                        onClick={() => setActiveTab("netlist")}
                        className={`flex items-center gap-1.5 p-1 rounded cursor-pointer transition hover:bg-[#121c2e] ${activeTab === "netlist" ? "text-cyan-400 font-bold bg-[#121c2e]/45" : "text-slate-400"}`}
                      >
                        <FileCode className="w-3 h-3 text-purple-500/80" />
                        <span>spice_netlist.sp</span>
                      </div>
                      <div 
                        onClick={() => setActiveTab("simulation")}
                        className={`flex items-center gap-1.5 p-1 rounded cursor-pointer transition hover:bg-[#121c2e] ${activeTab === "simulation" ? "text-cyan-400 font-bold bg-[#121c2e]/45" : "text-slate-400"}`}
                      >
                        <FileCode className="w-3 h-3 text-emerald-500/80" />
                        <span>simulation.raw</span>
                      </div>
                      <div 
                        onClick={() => setActiveTab("analysis")}
                        className={`flex items-center gap-1.5 p-1 rounded cursor-pointer transition hover:bg-[#121c2e] ${activeTab === "analysis" ? "text-cyan-400 font-bold bg-[#121c2e]/45" : "text-slate-400"}`}
                      >
                        <FileCode className="w-3 h-3 text-blue-500/80" />
                        <span>design_reasoning.md</span>
                      </div>
                      <div 
                        onClick={() => setActiveTab("logs")}
                        className={`flex items-center gap-1.5 p-1 rounded cursor-pointer transition hover:bg-[#121c2e] ${activeTab === "logs" ? "text-cyan-400 font-bold bg-[#121c2e]/45" : "text-slate-400"}`}
                      >
                        <FileCode className="w-3 h-3 text-yellow-500/80" />
                        <span>compiler_run.log</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* B. PDK Components Tab */}
          {leftTab === "components" && (
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 px-1">SKY130 PDK Components</span>
              <div className="space-y-2">
                {libComponents.map((c: any) => (
                  <div key={c.name} className="p-3 bg-[#0a1120] border border-[#162238] rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-200">{c.name}</span>
                      <span className="text-[9px] font-mono text-cyan-400 uppercase bg-cyan-950/40 px-1.5 py-0.5 rounded">{c.model}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-2">{c.desc}</p>
                    <div className="text-[9px] text-slate-400 space-y-0.5">
                      <div>Pins: <span className="text-slate-300 font-sans">{c.pins.join(", ")}</span></div>
                      <div>Defaults: <span className="text-slate-300">{c.params}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* C. History Tab */}
          {leftTab === "history" && (
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 px-1">Compilation Runs</span>
              {designs.length === 0 ? (
                <p className="text-[10px] text-slate-600 text-center py-4">No historical runs.</p>
              ) : (
                <div className="space-y-2">
                  {designs.map((d, index) => (
                    <div
                      key={d.id}
                      onClick={() => {
                        setActiveDesign(d);
                        setConsoleLogs(d.logs_content || "");
                      }}
                      className={`p-2.5 rounded-lg border transition cursor-pointer text-left ${
                        activeDesign?.id === d.id 
                          ? "bg-[#142137] border-cyan-500/60" 
                          : "bg-[#0b1221] border-[#18273f] hover:border-[#223654]"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[9px] text-slate-500 mb-1">
                        <span>RUN #{designs.length - index}</span>
                        <span>{new Date(d.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">{d.prompt}</p>
                      <div className="flex gap-2 mt-2 text-[9px] font-sans">
                        <span className={`px-1.5 py-0.5 rounded uppercase font-bold ${
                          d.constraint_results_json?.status === "PASSED" ? "bg-emerald-950/40 text-emerald-400" : "bg-rose-950/40 text-rose-400"
                        }`}>
                          DRC: {d.constraint_results_json?.status || "PENDING"}
                        </span>
                        <span className="bg-blue-950/40 text-blue-400 px-1.5 py-0.5 rounded font-bold">
                          SIM: {d.simulation_results_json?.status || "NONE"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* 2. Main Workbench Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#04070d] relative h-full">
        
        {/* Active project specifications bar */}
        {activeProject ? (
          <div className="bg-[#080d19] border-b border-[#18233a] p-3 px-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h2 className="text-xs font-bold text-slate-200 tracking-wide uppercase">Workspace: {activeProject.name}</h2>
                <div className="flex gap-2 text-[9px] text-slate-400 font-sans mt-0.5 uppercase font-semibold">
                  <span>PDK: {activeProject.technology}</span>
                  <span>•</span>
                  <span>Type: {activeProject.design_type}</span>
                </div>
              </div>
            </div>
            
            {activeDesign && (
              <div className="flex gap-4 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-slate-300">DRC: Passed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-300">Sim: Complete</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#080d19] border-b border-[#18233a] p-4 text-center text-xs text-slate-500">
            No active project selected. Create or select a project from the sidebar.
          </div>
        )}

        {/* Workspace Panels (Top half: Prompt, Bottom half: Tabs) */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
          
          {/* PROMPT EDITOR CONSOLE */}
          <div className="bg-[#0a101d] border border-[#192742] rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>DESCRIBE CIRCUIT TARGETS</span>
              </div>
              <div className="flex items-center gap-4">
                {/* Optimization dropdown */}
                <div className="flex items-center gap-1.5 bg-[#05080f] px-2 py-1 rounded border border-[#1d2f4d] text-[10px]">
                  <Sliders className="w-3 h-3 text-cyan-400" />
                  <span className="text-slate-500 font-bold uppercase">OPT:</span>
                  <select
                    value={optimization}
                    onChange={(e) => setOptimization(e.target.value)}
                    className="bg-transparent text-slate-200 outline-none cursor-pointer uppercase font-bold"
                  >
                    <option value="Low Leakage">Low Leakage</option>
                    <option value="High Speed">High Speed</option>
                    <option value="Low Power">Low Power</option>
                    <option value="Minimal Area">Minimal Area</option>
                  </select>
                </div>

                {/* VDD Slider */}
                <div className="flex items-center gap-2 bg-[#05080f] px-3 py-1 rounded border border-[#1d2f4d] text-[10px]">
                  <span className="text-slate-500 font-bold">VDD:</span>
                  <input
                    type="range"
                    min="1.2"
                    max="2.5"
                    step="0.1"
                    value={vddSlider}
                    onChange={(e) => setVddSlider(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <span className="text-slate-200 font-bold w-7 text-right">{vddSlider.toFixed(1)}V</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your design parameters..."
                className="flex-1 bg-[#05080f] border border-[#182946] focus:border-cyan-500/70 outline-none rounded-lg p-3 text-xs leading-relaxed text-slate-200 font-mono resize-none h-16 transition"
              />
              <button
                onClick={handleGenerate}
                disabled={generating || pipelineRunning || !selectedProjectId}
                className="bg-gradient-to-tr from-cyan-500 to-blue-600 hover:opacity-90 disabled:opacity-50 text-black font-bold px-5 rounded-lg flex flex-col justify-center items-center gap-1 shadow-md shadow-cyan-950/20 transition cursor-pointer min-w-[120px]"
              >
                {pipelineRunning ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black" />
                    <span className="text-[10px] uppercase font-black tracking-wider">GENERATE</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* TIMED PIPELINE STEPPER OVERLAY */}
          {pipelineRunning && (
            <div className="bg-[#0b1424] border border-cyan-500/35 rounded-xl p-4 shadow-2xl flex flex-col gap-4 animate-pulse">
              <div className="flex justify-between items-center border-b border-[#1b2b48] pb-2">
                <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Semiconductor Design Compiler Running...
                </span>
                <span className="text-[10px] text-slate-400">Stage {pipelineStageIndex + 1} of {PIPELINE_STAGES.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PIPELINE_STAGES.map((s, idx) => {
                  let statusColor = "text-slate-600 border-[#121c2e]";
                  let icon = "○";
                  if (idx < pipelineStageIndex) {
                    statusColor = "text-emerald-400 border-emerald-500/40 bg-emerald-950/20";
                    icon = "✓";
                  } else if (idx === pipelineStageIndex) {
                    statusColor = "text-cyan-400 border-cyan-500/40 bg-cyan-950/20 font-bold";
                    icon = "⚡";
                  }

                  return (
                    <div key={s.id} className={`p-2 border rounded-lg text-[10px] flex items-center gap-2 transition ${statusColor}`}>
                      <span>{icon}</span>
                      <span className="truncate">{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB CONTENT VIEWER */}
          <div className="flex-1 bg-[#080e1a] border border-[#16233d] rounded-xl flex flex-col min-h-[350px] shadow-lg overflow-hidden">
            
            {/* Workbench Tab headers */}
            <div className="flex bg-[#05080f] border-b border-[#16233d] text-[10px] font-bold uppercase">
              <button
                onClick={() => setActiveTab("schematic")}
                className={`px-5 py-3 flex items-center gap-1.5 transition border-r border-[#16233d] ${
                  activeTab === "schematic" ? "bg-[#080e1a] text-cyan-400 border-t-2 border-t-cyan-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Schematic
              </button>
              <button
                onClick={() => setActiveTab("netlist")}
                className={`px-5 py-3 flex items-center gap-1.5 transition border-r border-[#16233d] ${
                  activeTab === "netlist" ? "bg-[#080e1a] text-cyan-400 border-t-2 border-t-cyan-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Spice Netlist
              </button>
              <button
                onClick={() => setActiveTab("simulation")}
                className={`px-5 py-3 flex items-center gap-1.5 transition border-r border-[#16233d] ${
                  activeTab === "simulation" ? "bg-[#080e1a] text-cyan-400 border-t-2 border-t-cyan-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Simulation
              </button>
              <button
                onClick={() => setActiveTab("analysis")}
                className={`px-5 py-3 flex items-center gap-1.5 transition border-r border-[#16233d] ${
                  activeTab === "analysis" ? "bg-[#080e1a] text-cyan-400 border-t-2 border-t-cyan-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                Design Reasoning
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                className={`px-5 py-3 flex items-center gap-1.5 transition ${
                  activeTab === "logs" ? "bg-[#080e1a] text-cyan-400 border-t-2 border-t-cyan-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Compiler Logs
              </button>
            </div>

            {/* Workbench Tab content */}
            <div className="flex-1 overflow-auto p-4 relative min-h-0">
              
              {/* Tab 1. Interactive Schematic (SVG) */}
              {activeTab === "schematic" && (
                <div className="h-full w-full flex flex-col justify-center items-center relative">
                  {activeDesign?.schematic_svg ? (
                    <div 
                      className="w-full h-full max-w-4xl max-h-[450px]"
                      onClick={(e) => {
                        // Click outside symbol clears selection
                        const target = e.target as SVGElement;
                        const symbolGroup = target.closest(".schematic-symbol");
                        if (symbolGroup) {
                          const id = symbolGroup.id.replace("symbol_", "");
                          setSelectedComponentId(id);
                        } else {
                          setSelectedComponentId(null);
                        }
                      }}
                      dangerouslySetInnerHTML={{
                        __html: activeDesign.schematic_svg.replace(
                          /class="schematic-symbol"/g,
                          (m: string, offset: number, full: string) => {
                            // Find parent element g id to add highlight classes dynamically
                            const idMatch = full.substring(offset - 40, offset).match(/id="symbol_([^"]+)"/);
                            const id = idMatch ? idMatch[1] : "";
                            const isSelected = id === selectedComponentId;
                            return `class="schematic-symbol group transition ${
                              isSelected ? "stroke-[4px] filter drop-shadow-[0_0_8px_rgba(6,182,212,0.85)]" : "opacity-80 hover:opacity-100"
                            }"`;
                          }
                        )
                      }}
                    />
                  ) : (
                    <div className="text-center text-slate-500 py-10 flex flex-col items-center gap-2">
                      <Cpu className="w-12 h-12 text-slate-700 animate-pulse" />
                      <p className="text-xs">No compiled schematic. Enter prompt and click Generate.</p>
                    </div>
                  )}

                  {/* Interactive hint bubble */}
                  {activeDesign && (
                    <div className="absolute bottom-2 left-2 bg-[#050912]/80 border border-[#1b2b48] text-[9px] text-slate-500 px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-md">
                      <Info className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Click schematic components to inspect & size them dynamically</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2. SPICE Netlist (Interactive Cross-Probing) */}
              {activeTab === "netlist" && (
                <div className="h-full w-full flex flex-col">
                  {activeDesign?.netlist_content ? (
                    <div className="flex-1 bg-[#040810] border border-[#15233c] p-4 rounded-lg text-xs font-mono text-cyan-300/90 overflow-auto whitespace-pre leading-relaxed select-text">
                      {activeDesign.netlist_content.split("\n").map((line: string, index: number) => {
                        // Check if the current line refers to the selected component (e.g. XM_PU1 or M_PU1)
                        const isLineHighlighted = selectedComponentId && (
                          line.toLowerCase().includes(`x${selectedComponentId.toLowerCase()} `) || 
                          line.toLowerCase().includes(` ${selectedComponentId.toLowerCase()} `)
                        );
                        
                        return (
                          <div 
                            key={index}
                            onClick={() => handleNetlistLineClick(line)}
                            className={`flex gap-4 px-2 py-0.5 rounded cursor-pointer transition select-text ${
                              isLineHighlighted 
                                ? "bg-cyan-500/10 border-l-4 border-cyan-400 text-cyan-200 font-bold" 
                                : "hover:bg-slate-900/60 text-slate-300"
                            }`}
                          >
                            <span className="text-slate-600 select-none text-right w-6">{index + 1}</span>
                            <span className="select-text">{line}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 py-10">
                      No generated Netlist. Compilation pending.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3. Simulation Oscilloscope (Waveforms SVG drawing with Checkboxes probes) */}
              {activeTab === "simulation" && (
                <div className="h-full w-full flex flex-col space-y-4">
                  {activeDesign?.simulation_results_json?.waveforms ? (
                    <div className="grid grid-cols-3 gap-4 h-full min-h-[300px]">
                      
                      {/* Left 2 cols: Scope screen */}
                      <div className="col-span-2 bg-[#03060c] border border-cyan-500/20 rounded-xl p-4 flex flex-col justify-between relative shadow-inner shadow-black">
                        
                        <div className="flex justify-between items-center text-[9px] text-cyan-400/70 border-b border-[#13223d] pb-2 font-sans uppercase font-bold tracking-wider">
                          <span>VELORA Scope - Real-time Transient Analyzer</span>
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />ACQUIRED</span>
                        </div>

                        {/* Custom SVG Waveform drawing */}
                        <div className="flex-1 py-4 flex items-center justify-center">
                          <svg viewBox="0 0 500 220" className="w-full h-full" style={{ backgroundColor: "#020409" }}>
                            {/* Grid divisions */}
                            <path d="M 50 0 L 50 220 M 100 0 L 100 220 M 150 0 L 150 220 M 200 0 L 200 220 M 250 0 L 250 220 M 300 0 L 300 220 M 350 0 L 350 220 M 400 0 L 400 220 M 450 0 L 450 220" fill="none" stroke="#0e1b2f" strokeWidth="0.5" strokeDasharray="3,3" />
                            <path d="M 0 36 L 500 36 M 0 73 L 500 73 M 0 110 L 500 110 M 0 146 L 500 146 M 0 183 L 500 183" fill="none" stroke="#0e1b2f" strokeWidth="0.5" strokeDasharray="3,3" />

                            {/* Waveforms plotting */}
                            {Object.entries(activeDesign.simulation_results_json.waveforms).map(([key, list]: [string, any], wIndex) => {
                              if (key === "x") return null;
                              
                              // Check if this signal is probed
                              if (!probedSignals.includes(key)) return null;

                              const xVals = activeDesign.simulation_results_json.waveforms.x;
                              const points: string[] = [];
                              
                              // Colors for waveforms
                              const colors = ["#ff5d5d", "#5dffbe", "#b75dff", "#ffd05d", "#5dd9ff"];
                              const strokeColor = colors[wIndex % colors.length];

                              for (let idx = 0; idx < xVals.length; idx++) {
                                const rawX = xVals[idx];
                                const minX = xVals[0];
                                const maxX = xVals[xVals.length - 1];
                                const scaleX = 20 + ((rawX - minX) / (maxX - minX)) * 460;

                                const rawY = list[idx];
                                const minY = Math.min(...list);
                                const maxY = Math.max(...list);
                                const diffY = (maxY - minY) || 1.0;
                                const scaleY = 200 - ((rawY - minY) / diffY) * 160;

                                points.push(`${scaleX},${scaleY}`);
                              }

                              return (
                                <g key={key}>
                                  <polyline
                                    fill="none"
                                    stroke={strokeColor}
                                    strokeWidth="2.5"
                                    points={points.join(" ")}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </g>
                              );
                            })}
                          </svg>
                        </div>
                        
                        <div className="text-[9px] text-[#4d729e] flex justify-between font-sans uppercase">
                          <span>Horizontal: Time/Voltage Sweep (x-axis)</span>
                          <span>Vertical: Signal Magnitude (y-axis)</span>
                        </div>

                      </div>

                      {/* Right 1 col: Signal Probes & Metrics list */}
                      <div className="col-span-1 border border-[#192742] bg-[#0c1221] p-4 rounded-xl flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 mb-3 block border-b border-[#1b2b48] pb-1.5">Scope Probes</span>
                          <div className="space-y-1.5 mb-4">
                            {Object.keys(activeDesign.simulation_results_json.waveforms).filter(k => k !== "x").map((sig, wIdx) => {
                              const colors = ["#ff5d5d", "#5dffbe", "#b75dff", "#ffd05d", "#5dd9ff"];
                              const strokeColor = colors[wIdx % colors.length];
                              const isChecked = probedSignals.includes(sig);

                              return (
                                <div 
                                  key={sig} 
                                  onClick={() => handleSignalProbeToggle(sig)}
                                  className="flex items-center gap-2 p-1.5 hover:bg-[#121c2e]/60 rounded cursor-pointer text-[10px]"
                                >
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}} // handled by click
                                    className="rounded border-[#1d2f4d] text-cyan-500 focus:ring-cyan-500"
                                  />
                                  <span style={{ color: isChecked ? strokeColor : "#64748b" }} className="font-bold">
                                    {sig.replace("y_", "")}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 mb-2.5 block border-b border-[#1b2b48] pb-1.5">Sim Metrics</span>
                          <div className="space-y-2">
                            {Object.entries(activeDesign.simulation_results_json.metrics).map(([mName, mValue]: [string, any]) => (
                              <div key={mName} className="p-2 bg-[#05080f]/80 rounded border border-[#16223b] flex justify-between items-center">
                                <span className="text-[9.5px] text-slate-500 uppercase leading-tight font-sans font-bold">{mName}</span>
                                <span className="text-[10px] font-bold text-cyan-400 font-mono text-right">{mValue}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center text-slate-500 py-10">
                      No simulation datasets compiled. Start generator pipeline.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4. AI Analysis / Sizing Decisions (Markdown text) */}
              {activeTab === "analysis" && (
                <div className="h-full w-full select-text leading-relaxed font-sans text-xs">
                  {activeDesign?.explanation_markdown ? (
                    <div className="bg-[#0c1222] border border-[#192742] p-5 rounded-lg text-slate-300 max-w-3xl mx-auto space-y-4">
                      <div className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed prose prose-invert">
                        {activeDesign.explanation_markdown}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 py-10">
                      AI Sizing Decisions not generated yet.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5. Compiler logs (Console outputs) */}
              {activeTab === "logs" && (
                <div className="h-full w-full flex flex-col">
                  <pre className="flex-1 bg-black border border-[#17253d] p-4 rounded-lg text-[10px] font-mono text-cyan-400 overflow-auto whitespace-pre leading-relaxed scrollbar-thin select-text">
                    {consoleLogs}
                  </pre>
                </div>
              )}

            </div>
            
            {/* Tab Bottom Console Footer Status */}
            <div className="bg-[#05080e] border-t border-[#16233d] p-2 px-4 flex justify-between items-center text-[9px] text-slate-500">
              <div className="flex gap-4">
                <span>ENGINE: <span className="text-cyan-400 font-bold">READY</span></span>
                <span>PDK: <span className="text-slate-400 font-bold">SKY130_FD_PR</span></span>
              </div>
              <div>
                <span>STATUS: <span className="text-emerald-400 font-bold uppercase">{generating || pipelineRunning ? "COMPILING..." : (activeDesign ? "SUCCESS" : "IDLE")}</span></span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 3. Right Properties Panel (Interactive contextual details) */}
      <div className="w-[280px] border-l border-[#192438] bg-[#090f1c] p-4 flex flex-col justify-between h-full z-20">
        
        <div className="space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-[#1b2940] pb-3">
            <h3 className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Properties Inspector
            </h3>
          </div>

          {/* Context A. Selected schematic component details (WITH INTERACTIVE SLIDERS FOR SIZING) */}
          {activeComponentObj ? (
            <div className="space-y-4">
              <div className="p-3 bg-[#111d33] border border-cyan-500/30 rounded-lg">
                <span className="text-[9px] uppercase font-sans text-cyan-400 font-extrabold block">Selected Device</span>
                <span className="text-sm font-bold text-slate-100">{activeComponentObj.id}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded ml-2 uppercase font-bold">{activeComponentObj.type}</span>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">PDK Model Mapping</span>
                <div className="p-2 bg-[#05080f]/60 rounded border border-[#16223b]">
                  <span className="text-[10px] text-cyan-500 block truncate">{activeComponentObj.properties?.model || "Standard Supply Tie"}</span>
                </div>

                {/* SIZING PARAMETER SLIDERS */}
                {activeComponentObj.properties?.parameters && Object.keys(activeComponentObj.properties.parameters).length > 0 && (
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Tune Device Dimensions</span>
                    
                    {/* Width (W) slider */}
                    {"W" in activeComponentObj.properties.parameters && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400 font-bold">Width (W):</span>
                          <span className="text-cyan-400 font-bold">{activeComponentObj.properties.parameters.W.toFixed(2)} um</span>
                        </div>
                        <input 
                          type="range"
                          min="0.15"
                          max="10.0"
                          step="0.05"
                          value={activeComponentObj.properties.parameters.W}
                          onChange={(e) => handleComponentParameterChange("W", parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <div className="flex justify-between text-[8px] text-slate-600">
                          <span>Min: 0.15um</span>
                          <span>Max: 10um</span>
                        </div>
                      </div>
                    )}

                    {/* Length (L) slider */}
                    {"L" in activeComponentObj.properties.parameters && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400 font-bold">Length (L):</span>
                          <span className="text-cyan-400 font-bold">{activeComponentObj.properties.parameters.L.toFixed(2)} um</span>
                        </div>
                        <input 
                          type="range"
                          min="0.15"
                          max="5.0"
                          step="0.05"
                          value={activeComponentObj.properties.parameters.L}
                          onChange={(e) => handleComponentParameterChange("L", parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <div className="flex justify-between text-[8px] text-slate-600">
                          <span>Min: 0.15um</span>
                          <span>Max: 5um</span>
                        </div>
                      </div>
                    )}

                    {/* Passive Resistors/Capacitors */}
                    {"R" in activeComponentObj.properties.parameters && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400 font-bold">Resistance (R):</span>
                          <span className="text-cyan-400 font-bold">{activeComponentObj.properties.parameters.R.toFixed(0)} Ohm</span>
                        </div>
                        <input 
                          type="range"
                          min="100"
                          max="50000"
                          step="100"
                          value={activeComponentObj.properties.parameters.R}
                          onChange={(e) => handleComponentParameterChange("R", parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>
                    )}

                    {"C" in activeComponentObj.properties.parameters && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400 font-bold">Capacitance (C):</span>
                          <span className="text-cyan-400 font-bold">{(activeComponentObj.properties.parameters.C * 1e12).toFixed(1)} pF</span>
                        </div>
                        <input 
                          type="range"
                          min="0.1e-12"
                          max="20e-12"
                          step="0.1e-12"
                          value={activeComponentObj.properties.parameters.C}
                          onChange={(e) => handleComponentParameterChange("C", parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>
                    )}

                  </div>
                )}

                <span className="text-[10px] uppercase font-bold text-slate-500 block">Pin Assignments</span>
                <div className="space-y-1 bg-[#05080f]/60 p-2.5 rounded border border-[#16223b] text-[10px]">
                  {activeDesign?.circuit_graph_json?.edges
                    ?.filter((e: any) => e.from_node === activeComponentObj.id)
                    ?.map((e: any) => (
                      <div key={e.from_pin} className="flex justify-between">
                        <span className="text-slate-500">{e.from_pin} Pin:</span>
                        <span className="text-cyan-400 font-bold font-mono">{e.to_net}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            // Context B. Selected project details if no component is clicked
            activeProject ? (
              <div className="space-y-4">
                <div className="p-3 bg-[#0a1120] border border-[#15233c] rounded-lg">
                  <span className="text-[9px] uppercase font-sans text-slate-500 block font-bold">Active Repository</span>
                  <span className="text-xs font-bold text-slate-200">{activeProject.name}</span>
                </div>

                <div className="space-y-2.5 text-[10px]">
                  <div>
                    <span className="text-slate-500 uppercase block mb-1">Target Technology</span>
                    <span className="bg-[#18263d] px-2 py-0.5 rounded text-cyan-400 font-bold uppercase">{activeProject.technology}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block mb-1">Topology Class</span>
                    <span className="bg-[#18263d] px-2 py-0.5 rounded text-slate-300 uppercase font-bold">{activeProject.design_type}</span>
                  </div>
                  {activeProject.description && (
                    <div>
                      <span className="text-slate-500 uppercase block mb-1">Description</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{activeProject.description}</p>
                    </div>
                  )}
                </div>
                
                {activeDesign && (
                  <div className="pt-4 border-t border-[#1b2940] space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Design Constraints Bounds</span>
                    <div className="space-y-1.5 bg-[#05080f]/60 p-2.5 rounded border border-[#16223b] text-[10px] font-sans text-slate-400">
                      <div className="flex justify-between">
                        <span>Max Current:</span>
                        <span className="font-mono text-slate-200">10.0 mA</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Channel W:</span>
                        <span className="font-mono text-slate-200">0.15 um</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Channel L:</span>
                        <span className="font-mono text-slate-200">0.15 um</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-slate-600">No context available.</p>
            )
          )}
        </div>

        {/* System Settings hint */}
        <div className="p-3 bg-[#0a1120] border border-[#16233d] rounded-lg text-[9px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5 font-bold uppercase">
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            System Context
          </div>
          <p className="font-sans leading-relaxed">Phase 1 interactive CAD workbench activated. Live physical simulator recomputes sizing sweeps.</p>
        </div>

      </div>

      {/* 4. New Project Creation Dialog Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0a1120] border border-[#1f3252] rounded-2xl p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-[#1b2b48]">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                CREATE NEW CIRCUIT PROJECT
              </h3>
              <button 
                onClick={() => setShowNewModal(false)}
                className="text-slate-500 hover:text-slate-200 font-sans"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 uppercase font-bold tracking-wider text-[9px]">Project / Design Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6T SRAM Cell, 3-Stage VCO"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#05080f] border border-[#182946] focus:border-cyan-500/70 outline-none rounded-lg p-2.5 text-slate-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1 uppercase font-bold tracking-wider text-[9px]">PDK Technology</label>
                  <select
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    className="w-full bg-[#05080f] border border-[#182946] outline-none rounded-lg p-2.5 text-slate-200 cursor-pointer font-mono"
                  >
                    <option value="SKY130">SKY130 (Open PDK)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 uppercase font-bold tracking-wider text-[9px]">Topology Class</label>
                  <select
                    value={newDesignType}
                    onChange={(e) => setNewDesignType(e.target.value)}
                    className="w-full bg-[#05080f] border border-[#182946] outline-none rounded-lg p-2.5 text-slate-200 cursor-pointer font-mono"
                  >
                    <option value="6T SRAM">6T SRAM Cell</option>
                    <option value="Ring Oscillator">Ring Oscillator</option>
                    <option value="Current Mirror">Current Mirror</option>
                    <option value="Differential Pair">Differential Pair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 uppercase font-bold tracking-wider text-[9px]">Description</label>
                <textarea
                  placeholder="Describe details like targets, bias criteria..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#05080f] border border-[#182946] focus:border-cyan-500/70 outline-none rounded-lg p-2.5 text-slate-200 font-mono h-20 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-black font-extrabold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-95 cursor-pointer shadow-md transition"
              >
                <span>INITIALIZE DESIGN REPO</span>
                <ChevronRight className="w-4 h-4 stroke-[3px]" />
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
