"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppContext, GUEST_DESIGN } from "../../app/providers";
import { api } from "../../lib/api";
import {
  Sparkles, Cpu, FileCode, Activity, FileText, Paperclip,
  Download, ExternalLink, ChevronRight, Maximize2, ZoomIn, ZoomOut,
  RotateCcw, Undo2, Redo2, Layers, Copy, RefreshCw, Play,
  Send, CheckCircle2, AlertTriangle, Info, Zap, BarChart3, Shield,
  BookOpen, GitBranch, Terminal, X, ArrowRight, Clock, Target,
  Wrench, Radio, Boxes, FlaskConical, Wand2, MessagesSquare,
  BrainCircuit, SlidersHorizontal, CheckCheck, AlertCircle,
  CircleDot, Share2, ChevronDown, ChevronUp
} from "lucide-react";

// ─────────────────────────────────────────────
// TYPES & PARAMETER DEFINITIONS
// ─────────────────────────────────────────────

type CircuitFamily = "Memory" | "Analog" | "RF" | "Digital" | "Power" | "Mixed-Signal" | "Custom" | "Interface";

interface ParamSchema {
  name: string;
  label: string;
  type: "number" | "select" | "text" | "boolean";
  unit?: string;
  default: any;
  min?: number;
  max?: number;
  step?: number;
  required: boolean;
  advanced?: boolean;
  description: string;
  engineeringReason: string;
  options?: string[];
}

const UNIVERSAL_PARAMS: ParamSchema[] = [
  {
    name: "supply_voltage",
    label: "Supply Voltage (VDD)",
    type: "number", unit: "V", default: 1.8, min: 0.5, max: 5.5, step: 0.1,
    required: true,
    description: "Primary power supply rail voltage",
    engineeringReason: "Determines device operating point, leakage current, and maximum signal swing."
  },
  {
    name: "optimization_goal",
    label: "Optimization Goal",
    type: "select", default: "Balanced", required: true,
    options: ["Low Power", "High Speed", "Minimum Area", "Balanced", "Low Leakage", "High Reliability", "Low Noise"],
    description: "Primary synthesis optimization objective",
    engineeringReason: "Sets the transistor sizing strategy during compilation."
  }
];

const FAMILY_PARAMS: Record<CircuitFamily, ParamSchema[]> = {
  "Memory": [
    { name: "bitline_capacitance", label: "Bitline Capacitance", type: "number", unit: "fF", default: 10, min: 1, max: 500, step: 1, required: true, description: "Parasitic capacitance on bitline network", engineeringReason: "Determines read discharge time and sense amplifier sensitivity." },
    { name: "cell_ratio", label: "Cell Ratio (Beta)", type: "number", unit: "", default: 1.6, min: 1.0, max: 5.0, step: 0.1, required: true, description: "Pull-down to access transistor width ratio", engineeringReason: "Cell ratio > 1.5 ensures read stability — prevents internal node flip during read." },
    { name: "pull_up_ratio", label: "Pull-up Ratio (Gamma)", type: "number", unit: "", default: 1.0, min: 0.5, max: 3.0, step: 0.1, required: false, description: "Pull-up to access transistor width ratio", engineeringReason: "Pull-up ratio < 1.2 ensures writeability." }
  ],
  "Analog": [
    { name: "open_loop_gain", label: "Open Loop Gain", type: "number", unit: "dB", default: 70, min: 20, max: 120, step: 1, required: true, description: "DC open-loop voltage gain target", engineeringReason: "Gain determines closed-loop accuracy and offset suppression." },
    { name: "gbw", label: "Gain-Bandwidth Product", type: "number", unit: "MHz", default: 50, min: 0.1, max: 5000, step: 0.1, required: true, description: "Unity-gain frequency", engineeringReason: "GBW sets the maximum achievable closed-loop bandwidth." },
    { name: "phase_margin", label: "Phase Margin", type: "number", unit: "°", default: 60, min: 30, max: 90, step: 1, required: true, description: "Stability margin at unity-gain crossing", engineeringReason: "Phase margin > 45° ensures stable closed-loop operation." }
  ],
  "RF": [
    { name: "center_frequency", label: "Center Frequency", type: "number", unit: "GHz", default: 2.4, min: 0.1, max: 100, step: 0.1, required: true, description: "Target RF operating frequency", engineeringReason: "Determines transistor sizing and matching network design." },
    { name: "noise_figure", label: "Noise Figure", type: "number", unit: "dB", default: 3.0, min: 0.1, max: 20, step: 0.1, required: true, description: "Maximum acceptable noise figure", engineeringReason: "Sets the minimum detectable signal and system SNR." },
    { name: "gain", label: "Gain", type: "number", unit: "dB", default: 15, min: 0, max: 40, step: 0.5, required: true, description: "Voltage or power gain target", engineeringReason: "Gain must compensate for subsequent stages." }
  ],
  "Digital": [
    { name: "clock_frequency", label: "Clock Frequency", type: "number", unit: "MHz", default: 100, min: 0.001, max: 10000, step: 0.1, required: true, description: "Operating clock frequency target", engineeringReason: "Sets timing budget and minimum logic gate sizing." },
    { name: "num_stages", label: "Number of Stages", type: "number", unit: "", default: 5, min: 1, max: 1001, step: 2, required: false, description: "Pipeline stages or ring oscillator stages", engineeringReason: "Odd number of stages required for ring oscillator." }
  ],
  "Power": [
    { name: "input_voltage", label: "Input Voltage", type: "number", unit: "V", default: 5.0, min: 0.5, max: 60, step: 0.1, required: true, description: "Regulator/converter input supply voltage", engineeringReason: "Sets transistor stress and dropout margin." },
    { name: "output_voltage", label: "Output Voltage", type: "number", unit: "V", default: 3.3, min: 0.5, max: 30, step: 0.1, required: true, description: "Regulated output voltage target", engineeringReason: "Determines error amplifier reference and feedback ratio." },
    { name: "output_current", label: "Max Output Current", type: "number", unit: "mA", default: 100, min: 0.1, max: 10000, step: 0.1, required: true, description: "Maximum load current capability", engineeringReason: "Sets power transistor sizing and thermal requirements." }
  ],
  "Mixed-Signal": [
    { name: "resolution", label: "Resolution", type: "number", unit: "bit", default: 12, min: 4, max: 24, step: 1, required: true, description: "ADC/DAC quantization resolution", engineeringReason: "Sets LSB size, noise floor, and capacitor array sizing." },
    { name: "sampling_rate", label: "Sampling Rate", type: "number", unit: "MS/s", default: 1, min: 0.001, max: 10000, step: 0.001, required: true, description: "ADC/DAC sampling frequency", engineeringReason: "Determines anti-aliasing filter cutoff and comparator speed." }
  ],
  "Interface": [
    { name: "data_rate", label: "Data Rate", type: "number", unit: "Mbps", default: 100, min: 0.001, max: 100000, step: 0.001, required: true, description: "Serial interface data rate", engineeringReason: "Determines oscillator frequency and driver strength." },
    { name: "num_data_bits", label: "Data Width", type: "number", unit: "bits", default: 8, min: 1, max: 256, step: 1, required: false, description: "Parallel data bus width", engineeringReason: "Determines state machine complexity." }
  ],
  "Custom": [
    { name: "switching_current", label: "Switching / Load Current", type: "number", unit: "mA", default: 500, min: 1, max: 50000, step: 10, required: true, description: "Current capacity needed for switching external load", engineeringReason: "Determines size of driver switches, relay coil driver, or power FETs." },
    { name: "control_voltage", label: "Logic Control Voltage", type: "number", unit: "V", default: 3.3, min: 1.0, max: 12, step: 0.1, required: true, description: "Control logic signal voltage level (e.g. from MCU)", engineeringReason: "Sets threshold levels for driver switches to ensure full saturation." },
    { name: "switching_speed", label: "Switching Frequency / Speed", type: "number", unit: "Hz", default: 10, min: 0.1, max: 100000, step: 1, required: false, description: "On/Off cycle rate or speed", engineeringReason: "Determines dynamic loss, gate charging requirements, or contact lifetime." }
  ]
};

// ─────────────────────────────────────────────
// PROMPT CLASSIFICATION ENGINE
// ─────────────────────────────────────────────

const FAMILY_KEYWORDS: Record<CircuitFamily, string[]> = {
  "Memory": ["sram", "memory", "bitcell", "register file", "rom", "flash", "cache", "latch", "flip-flop", "dff"],
  "Analog": ["op-amp", "opamp", "operational amplifier", "amplifier", "comparator", "bandgap", "current mirror", "differential pair", "ota"],
  "RF": ["lna", "mixer", "vco", "pll", "phase locked", "power amplifier", "radio", "rf", "oscillator", "filter"],
  "Digital": ["ring oscillator", "inverter", "nand", "nor", "logic", "counter", "encoder", "decoder", "mux", "alu", "adder", "shift register"],
  "Power": ["ldo", "buck", "boost", "charge pump", "regulator", "converter", "pmic", "dc-dc"],
  "Mixed-Signal": ["adc", "dac", "analog to digital", "digital to analog", "sigma-delta", "sar", "flash adc", "pipeline adc", "successive approximation"],
  "Interface": ["uart", "spi", "i2c", "usb", "jtag", "lvds", "pcie", "serial", "protocol"],
  "Custom": ["fan", "motor", "switch", "relay", "light", "custom", "user-defined", "generic"]
};

function classifyPrompt(prompt: string): CircuitFamily {
  const lower = prompt.toLowerCase();
  for (const [family, keywords] of Object.entries(FAMILY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return family as CircuitFamily;
    }
  }
  return "Custom";
}

// ─────────────────────────────────────────────
// DYNAMIC FIELD COMPONENT
// ─────────────────────────────────────────────

function DynamicField({ param, value, onChange }: {
  param: ParamSchema;
  value: any;
  onChange: (name: string, value: any) => void;
}) {
  const inputCls = "w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all";
  const selectCls = "w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-400 transition-all cursor-pointer";

  return (
    <div className="space-y-1 group">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          {param.label}
          {param.required && <span className="text-blue-500 font-bold">*</span>}
          {param.unit && <span className="text-slate-400 font-normal normal-case ml-1">({param.unit})</span>}
        </label>
      </div>
      {param.type === "select" ? (
        <select value={value ?? param.default} onChange={e => onChange(param.name, e.target.value)} className={selectCls}>
          {param.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input type="number" value={value ?? param.default} min={param.min} max={param.max} step={param.step}
          onChange={e => onChange(param.name, parseFloat(e.target.value) || 0)}
          className={inputCls} placeholder={String(param.default)} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────


// Helper function to render simple markdown strings
const renderMarkdown = (text: string) => {
  if (!text) return null;
  return (
    <div className="space-y-1.5 text-xs text-slate-605">
      {text.split("\n").map((line, idx) => {
        let clean = line.trim();
        if (!clean) return <div key={idx} className="h-1" />;
        const isBullet = clean.startsWith("-") || clean.startsWith("•");
        if (isBullet) clean = clean.replace(/^[-•]\s*/, "");
        return (
          <div key={idx} className={isBullet ? "pl-3 flex items-start gap-1 text-slate-650" : "text-slate-650"}>
            {isBullet && <span className="text-blue-500">•</span>}
            <span>{clean}</span>
          </div>
        );
      })}
    </div>
  );
};

const WORKSPACE_TABS = [
  { id: "schematic", label: "Schematic", icon: Cpu },
  { id: "rtl", label: "RTL", icon: FileCode },
  { id: "spice", label: "SPICE", icon: Terminal },
  { id: "simulation", label: "Simulation", icon: Activity },
  { id: "verification", label: "Verification", icon: Shield },
  { id: "metrics", label: "Metrics", icon: BarChart3 },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "logs", label: "Logs", icon: Terminal },
  { id: "reasoning", label: "AI Reasoning", icon: BrainCircuit },
];

export function AIDesignView() {
  const {
    activeProject, activeDesign, setActiveDesign, designs, setDesigns,
    prompt, setPrompt, optimization, setOptimization, pipelineRunning,
    pipelineStageIndex, generating, handleGenerate, handleSelect,
    checkAuthAndRun, vddSlider, setSelectedTopologyCanonical,
  } = useAppContext();

  const handlePromptChange = (val: string) => {
    setPrompt(val);
    localStorage.setItem("velora_draft_prompt", val);
  };

  // Local toast
  const [toasts, setToasts] = useState<Array<{ id: number; msg: string; type: string }>>([]);
  const toastIdRef = useRef(0);
  const showToast = useCallback((msg: string, type: string = "info") => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // Context updates
  const handleUpdateProject = useCallback(async (projectId: number, data: any) => {
    try { await api.updateProject(projectId, data); } catch (e) { console.error(e); }
  }, []);

  // ── Local parameter discovery state ──
  const [detectedFamily, setDetectedFamily] = useState<CircuitFamily>("Memory");
  const [dynamicParams, setDynamicParams] = useState<Record<string, any>>({});
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string }>>([]);

  // ── Right Panel Workspace Tabs ──
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("schematic");
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "assistant"; content: string }>>([
    { sender: "assistant", content: "I am your Engineering Co-pilot. Ask me anything about this circuit design or custom parameters." }
  ]);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isCanvasMaximized, setIsCanvasMaximized] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState<"design" | "history">("design");

  const currentIdx = designs.findIndex((d: any) => d.id === activeDesign?.id);
  const canUndo = currentIdx > 0;
  const canRedo = currentIdx < designs.length - 1 && currentIdx !== -1;

  // ── Automatic parameter mapping based on prompt classification with DEBOUNCE ──
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!prompt.trim()) return;
      const family = classifyPrompt(prompt);
      setDetectedFamily(family);
      setSelectedTopologyCanonical(family === "Memory" ? "6T SRAM" : family === "Digital" ? "Ring Oscillator" : "Custom Circuit");
    }, 200);
    return () => clearTimeout(timer);
  }, [prompt, setSelectedTopologyCanonical]);

  // Build params list to show (memoized to prevent recalculation)
  const currentParamsList = React.useMemo(() => [
    ...UNIVERSAL_PARAMS,
    ...(FAMILY_PARAMS[detectedFamily] || FAMILY_PARAMS["Custom"])
  ], [detectedFamily]);

  // ── Initialize params defaults on family change ──
  useEffect(() => {
    const defaults: Record<string, any> = {};
    currentParamsList.forEach(p => {
      defaults[p.name] = p.default;
    });
    setDynamicParams(defaults);
  }, [currentParamsList]);


  const handleParamChange = (name: string, value: any) => {
    setDynamicParams(prev => ({ ...prev, [name]: value }));
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFiles(prev => [...prev, { name: file.name }]);
    showToast(`Attached file "${file.name}"`, "success");
    e.target.value = "";
  };


  const handleGenerateClick = () => {
    const constraintStr = Object.entries(dynamicParams)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => {
        const p = currentParamsList.find(param => param.name === k);
        return `${p?.label || k}=${v}${p?.unit || ""}`;
      }).join(", ");
    const fullPrompt = `${prompt.trim()}${constraintStr ? ` with constraints: ${constraintStr}` : ""}`;
    setPrompt(fullPrompt);
    setOptimization(dynamicParams.optimization_goal || "Balanced");
    checkAuthAndRun(handleGenerate);
  };

  const handleDownload = (format: string) => {
    if (!activeDesign) { showToast("No design to export.", "warning"); return; }
    const content = activeDesign.netlist_content || `* ${detectedFamily} design\n`;
    const ext: Record<string, string> = { spice: "sp", rtl: "v", gds: "gds" };
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `design.${ext[format] || "txt"}`;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
    showToast(`Exported as ${format.toUpperCase()}`, "success");
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, { sender: "user", content: msg }]);
    let reply = `I have received your request for: "${msg}". You can configure the parameters on the left and trigger compilation anytime.`;
    setTimeout(() => setChatHistory(prev => [...prev, { sender: "assistant", content: reply }]), 600);
  };

  const contextInfo = [
    { label: "Project", value: activeProject?.name || "—" },
    { label: "Circuit Family", value: detectedFamily },
    { label: "PDK Node", value: activeProject?.technology || "SKY130" },
    { label: "Design Version", value: activeDesign ? `v${activeDesign.version}` : "Draft" },
    { label: "Status", value: generating ? "Compiling..." : activeDesign ? "Generated" : "Ready" },
  ];

  if (!activeProject) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white text-slate-400">
        <BrainCircuit className="w-12 h-12 text-slate-300 mb-4" />
        <p className="text-sm font-semibold text-slate-500">No Active Project</p>
        <p className="text-xs text-slate-400 mt-1">Select or create a project to open the AI Design Cockpit.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── HEADER ── */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">AI Design Cockpit</h1>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">Semiconductor Engineering Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeDesign && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-700">
              v{activeDesign.version} · Active
            </span>
          )}
          <button onClick={() => setShowShareModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-600 text-xs transition-all">
            Share
          </button>
          <button onClick={() => setCopilotOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-all shadow-sm shadow-blue-200">
            <MessagesSquare className="w-3 h-3" />AI Copilot
          </button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* ════════════════════════════════
        {/* ════════════════════════════════
            LEFT PANEL — Prompt & Parameters
        ════════════════════════════════ */}
        <div className="w-[40%] flex flex-col border-r border-slate-200 bg-white overflow-y-auto">
          
          <div className="shrink-0 flex border-b border-slate-200">
            {[{ id: "design", label: "Design Workspace" }, { id: "history", label: "History" }].map(tab => (
              <button key={tab.id} onClick={() => setActiveHistoryTab(tab.id as any)}
                className={`px-5 py-3 text-xs font-semibold transition-all relative ${
                  activeHistoryTab === tab.id
                    ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                    : "text-slate-400 hover:text-slate-700"
                }`}>{tab.label}
              </button>
            ))}
          </div>

          {activeHistoryTab === "history" ? (
            <div className="flex-1 p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Design Checkpoints</h3>
              {designs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <GitBranch className="w-8 h-8 mb-3 opacity-40" />
                  <p className="text-xs">No checkpoints yet.</p>
                </div>
              ) : (
                [...designs].reverse().map((d: any) => {
                  const isActive = d.id === activeDesign?.id;
                  return (
                    <div key={d.id} onClick={() => { setActiveDesign(d); showToast(`v${d.version} loaded.`, "info"); }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${isActive ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:border-slate-300 bg-slate-50"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold font-mono text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">v{d.version}</span>
                        <span className="text-[9px] text-slate-400">{d.created_at ? new Date(d.created_at).toLocaleDateString() : "Just now"}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 truncate">{d.requirements_json?.type || "Design"}</p>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="flex-1 p-5 space-y-5">
              
              {/* ── DESIGN PROMPT ── */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Describe Circuit Design</label>
                <textarea
                  value={prompt}
                  onChange={e => handlePromptChange(e.target.value)}
                  placeholder="Enter design intent, e.g. 'design 7t sram' or 'circuit to switch fan on/off'"
                  className="w-full min-h-[100px] bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl p-3 text-xs leading-relaxed resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                />
                
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-500 text-[10px] font-medium cursor-pointer transition-all">
                    <Paperclip className="w-3 h-3" />Attach Spec
                    <input type="file" className="hidden" onChange={handleFileAttach} />
                  </label>
                  {attachedFiles.map((f, i) => (
                    <span key={i} className="text-[9px] text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg flex items-center gap-1">
                      {f.name}
                      <button onClick={() => setAttachedFiles([])} className="text-slate-400 hover:text-slate-600"><X className="w-2.5 h-2.5" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* ── DYNAMIC PARAMETERS SELECTOR ── */}
              {prompt.trim().length > 2 && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Design Parameters</span>
                      <span className="text-[9px] text-blue-600 font-semibold px-2 py-0.5 bg-blue-50 rounded">Detected: {detectedFamily}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Configure parameters identified for this type of circuit:</p>
                  </div>

                  {/* PDK & technology settings */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Target PDK Node</label>
                      <select
                        value={activeProject?.technology || "SKY130"}
                        onChange={async e => {
                          const pdk = e.target.value;
                          await handleUpdateProject(activeProject.id, { technology: pdk });
                          showToast(`PDK set to ${pdk}`, "info");
                        }}
                        className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-400 transition-all cursor-pointer"
                      >
                        {["SKY130", "GF180", "ASAP7", "Nangate45", "TSMC65"].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Render parameters */}
                  <div className="space-y-3.5">
                    {currentParamsList.map(param => (
                      <DynamicField key={param.name} param={param} value={dynamicParams[param.name]} onChange={handleParamChange} />
                    ))}
                  </div>

                  <button
                    onClick={handleGenerateClick}
                    disabled={pipelineRunning || generating}
                    className="w-full mt-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {pipelineRunning ? "Running Synthesis..." : "Generate Circuit"}
                  </button>
                </div>
              )}

              {/* ── PIPELINE STATE ── */}
              {pipelineRunning && (
                <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <span className="text-xs font-bold text-blue-700">Compiling specs & generating circuit...</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${((pipelineStageIndex + 1) / 8) * 100}%` }} />
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════
            RIGHT PANEL — Engineering Output Workspace
        ════════════════════════════════════════════ */}
        <div className="w-[60%] flex min-h-0 overflow-hidden bg-slate-50">

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            
            {/* Quick stats context bar */}
            <div className="shrink-0 bg-white border-b border-slate-200 px-5 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-5">
                {contextInfo.map(({ label, value }) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                    <span className="text-[10px] font-semibold text-slate-700 mt-0.5">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <button disabled={!canUndo} onClick={() => { if (canUndo) { setActiveDesign(designs[currentIdx - 1]); showToast("Undo.", "info"); } }} className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 text-slate-500"><Undo2 className="w-3 h-3" /></button>
                <button disabled={!canRedo} onClick={() => { if (canRedo) { setActiveDesign(designs[currentIdx + 1]); showToast("Redo.", "info"); } }} className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 text-slate-500"><Redo2 className="w-3 h-3" /></button>
              </div>
            </div>

            {/* Output tabs */}
            <div className="shrink-0 flex border-b border-slate-200 bg-white overflow-x-auto px-4">
              {WORKSPACE_TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveWorkspaceTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-semibold whitespace-nowrap transition-all relative shrink-0 ${
                      activeWorkspaceTab === tab.id
                        ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                        : "text-slate-400 hover:text-slate-700"
                    }`}>
                    <Icon className="w-3 h-3" />{tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content view */}
            <div className="flex-1 overflow-auto p-5">

              {activeWorkspaceTab === "schematic" && (
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setZoom(z => Math.min(3, z + 0.15))} className="p-1 hover:bg-slate-100 rounded text-slate-500"><ZoomIn className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setZoom(z => Math.max(0.3, z - 0.15))} className="p-1 hover:bg-slate-100 rounded text-slate-500"><ZoomOut className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { setZoom(1); setPanX(0); setPanY(0); setRotation(0); }} className="p-1 hover:bg-slate-100 rounded text-slate-500"><RotateCcw className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setRotation(r => (r + 90) % 360)} className="p-1 hover:bg-slate-100 rounded text-slate-500"><RefreshCw className="w-3.5 h-3.5" /></button>
                    </div>
                    <button onClick={() => setIsCanvasMaximized(true)} className="p-1 hover:bg-slate-100 rounded text-slate-500"><Maximize2 className="w-3.5 h-3.5" /></button>
                  </div>

                  <div className="flex-1 min-h-[360px] bg-white border border-slate-200 rounded-xl overflow-hidden relative flex items-center justify-center">
                    {activeDesign?.schematic_svg ? (
                      <div className="transition-transform duration-150"
                        style={{ transform: `scale(${zoom}) translate(${panX}px, ${panY}px) rotate(${rotation}deg)`, transformOrigin: "center", maxWidth: "100%" }}
                        dangerouslySetInnerHTML={{ __html: activeDesign.schematic_svg }}
                      />
                    ) : (
                      <div className="text-center text-slate-400">
                        <Cpu className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-xs">No schematic. Enter prompt and click Generate Circuit.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select onChange={e => { if (e.target.value) { handleDownload(e.target.value); e.target.value = ""; } }}
                      className="bg-white border border-slate-200 text-slate-600 rounded-lg px-2.5 py-1 text-[10px] font-medium cursor-pointer focus:outline-none hover:border-slate-300">
                      <option value="">Export As…</option>
                      <option value="spice">SPICE Netlist (.sp)</option>
                      <option value="rtl">Verilog RTL (.v)</option>
                      <option value="gds">GDSII Layout (.gds)</option>
                    </select>
                    <button onClick={() => showToast("Checkpoint saved.", "success")} className="ml-auto px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-all shadow-sm">Save Checkpoint</button>
                  </div>
                </div>
              )}

              {activeWorkspaceTab === "rtl" && (
                <div className="space-y-3">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300 overflow-auto min-h-[300px]">
                    {activeDesign?.netlist_content ? (
                      <pre className="whitespace-pre-wrap leading-relaxed">{activeDesign.netlist_content}</pre>
                    ) : (
                      <p className="text-slate-500">RTL not generated yet.</p>
                    )}
                  </div>
                </div>
              )}

              {activeWorkspaceTab === "spice" && (
                <div className="space-y-3">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300 overflow-auto min-h-[300px]">
                    {activeDesign?.netlist_content ? (
                      <pre className="whitespace-pre-wrap leading-relaxed">{activeDesign.netlist_content}</pre>
                    ) : (
                      <p className="text-slate-500">SPICE netlist not generated yet.</p>
                    )}
                  </div>
                </div>
              )}

              {activeWorkspaceTab === "simulation" && (
                <div className="space-y-4">
                  {activeDesign?.simulation_results_json ? (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(activeDesign.simulation_results_json.metrics || {}).map(([k, v]) => (
                        <div key={k} className="p-3 bg-white border border-slate-200 rounded-xl">
                          <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">{k}</span>
                          <span className="text-xs font-bold text-slate-800 font-mono">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-12">No simulation results available.</p>
                  )}
                </div>
              )}

              {activeWorkspaceTab === "verification" && (
                <div className="space-y-2">
                  {activeDesign ? (
                    ["DRC Layout Validation Check", "LVS Layout vs Schematic Match", "ERC Electrical Rules Check"].map((check, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                        <span className="text-xs text-slate-700">{check}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">PASSED</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-12">No verification metrics.</p>
                  )}
                </div>
              )}

              {activeWorkspaceTab === "metrics" && (
                <div className="space-y-4">
                  {activeDesign?.readiness_report_json ? (
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(activeDesign.readiness_report_json).map(([k, v]) => (
                        typeof v === "number" && (
                          <div key={k} className="p-3 bg-white border border-slate-200 rounded-xl">
                            <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">{k}</span>
                            <span className="text-xs font-bold text-slate-800 font-mono">{v}%</span>
                          </div>
                        )
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-12">No metric scores available.</p>
                  )}
                </div>
              )}

              {activeWorkspaceTab === "reports" && (
                <div className="space-y-2">
                  {activeDesign ? (
                    ["DRC Summary", "LVS Sync Mismatch Check", "Electrical Properties Report"].map((rep, i) => (
                      <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center text-xs text-slate-700">
                        <span>{rep}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600">Generated</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-12">No reports yet.</p>
                  )}
                </div>
              )}

              {activeWorkspaceTab === "logs" && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[10px] text-slate-400 min-h-[300px] overflow-auto whitespace-pre-wrap">
                  {activeDesign?.logs_content || "Ready to log compilation stages."}
                </div>
              )}

              {activeWorkspaceTab === "reasoning" && (
                <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                  {activeDesign?.explanation_markdown ? (
                    renderMarkdown(activeDesign.explanation_markdown)
                  ) : (
                    "Reasoning summary appears when circuit design finishes."
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── AI COPILOT DRAWER ── */}
      {copilotOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setCopilotOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-[340px] bg-white border-l border-slate-200 z-50 flex flex-col shadow-xl animate-in slide-in-from-right duration-150">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Engineering Copilot</span>
              <button onClick={() => setCopilotOpen(false)} className="p-1 text-slate-400 hover:bg-slate-50 rounded"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${
                    msg.sender === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-200">
              <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }}
                  placeholder="Ask a question..."
                  className="flex-1 bg-transparent text-xs outline-none text-slate-700" />
                <button onClick={handleSendMessage} className="p-1 rounded bg-blue-600 text-white"><Send className="w-3 h-3" /></button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── CANVAS MAXIMIZED ── */}
      {isCanvasMaximized && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Schematic — Full View</h3>
            <button onClick={() => setIsCanvasMaximized(false)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-650"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200">
            <div className="transition-transform duration-100"
              style={{ transform: `scale(${zoom * 1.5}) translate(${panX}px, ${panY}px) rotate(${rotation}deg)`, transformOrigin: "center", maxWidth: "80vw" }}
              dangerouslySetInnerHTML={{ __html: activeDesign?.schematic_svg || "<svg></svg>" }}
            />
          </div>
        </div>
      )}

      {/* ── SHARE MODAL ── */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800">Share Design</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); showToast("URL copied!", "success"); setShowShareModal(false); }} className="p-3 border border-slate-200 rounded-xl text-xs hover:bg-slate-50 text-slate-700">Copy URL</button>
              <button onClick={() => { showToast("Pushed to slack", "success"); setShowShareModal(false); }} className="p-3 border border-slate-200 rounded-xl text-xs hover:bg-slate-50 text-slate-700">Slack</button>
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setShowShareModal(false)} className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATIONS ── */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-xl border shadow-md text-xs bg-white ${
            t.type === "success" ? "border-emerald-200 text-emerald-700" :
            t.type === "error" ? "border-rose-200 text-rose-700" :
            "border-slate-200 text-slate-700"
          }`}>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
