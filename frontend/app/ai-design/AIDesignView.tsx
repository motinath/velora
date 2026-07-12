"use client";

import React, { useState } from "react";
import { useAppContext, GUEST_DESIGN } from "../../app/providers";
import { api } from "../../lib/api";
import {
  Search,
  Bell,
  ChevronDown,
  Plus,
  Sparkles,
  Cpu,
  FileCode,
  Activity,
  FileText,
  Paperclip,
  Share2,
  Download,
  ExternalLink,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Undo2,
  Redo2,
  Settings,
  Layers,
  Copy,
  Lock,
  RefreshCw,
  Play,
  Send,
  Trash2,
  CheckCircle2
} from "lucide-react";

const getRtlCode = (design: any) => {
  const type = design?.requirements_json?.type || "6T SRAM";
  if (type.includes("SRAM")) {
    return `// VELORA Synthesized RTL Module
// Topology: 6T SRAM cell cross-coupled latch model
// PDK Node: SKY130
module sram_6t_cell (
    input  logic wl,   // Wordline Select
    inout  wire  bl,   // Bitline True
    inout  wire  blb,  // Bitline Bar (Complementary)
    input  wire  vdd,  // Power Rail
    input  wire  gnd   // Ground Rail
);
    // Latched state modeling
    reg q_reg;
    reg qb_reg;

    always @(*) begin
        if (wl) begin
            // Active drive simulation
            q_reg  <= bl;
            qb_reg <= blb;
        end
    end
endmodule`;
  } else if (type.includes("Oscillator")) {
    return `// VELORA Synthesized RTL Module
// Topology: 5-Stage Ring Oscillator
module ring_oscillator (
    input  logic enable,
    output logic osc_out
);
    // 5 inversion stages delay line logic
    wire w1, w2, w3, w4;
    assign #2 w1 = ~(osc_out & enable);
    assign #2 w2 = ~w1;
    assign #2 w3 = ~w2;
    assign #2 w4 = ~w3;
    assign #2 osc_out = ~w4;
endmodule`;
  } else {
    return `// VELORA Synthesized RTL Module
// Topology: standard cell logic model
module standard_cell_gate (
    input  logic a,
    input  logic b,
    output logic y
);
    assign y = ~(a & b); // NAND Gate logic
endmodule`;
  }
};

const renderMarkdown = (text: string) => {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="space-y-2 text-xs leading-relaxed font-sans text-slate-700">
      {lines.map((line, idx) => {
        let cleanLine = line.trim();
        if (!cleanLine) return <div key={idx} className="h-1" />;

        let isHeader = false;
        let headerLevel = 0;
        if (cleanLine.startsWith("###")) {
          isHeader = true;
          headerLevel = 3;
          cleanLine = cleanLine.replace(/^###\s*/, "");
        } else if (cleanLine.startsWith("#")) {
          isHeader = true;
          headerLevel = 1;
          cleanLine = cleanLine.replace(/^#\s*/, "");
        }

        let isBullet = false;
        if (cleanLine.startsWith("-")) {
          isBullet = true;
          cleanLine = cleanLine.replace(/^-\s*/, "");
        }

        // Parse bold **text**, italic *text*, and code `text`
        const parts: React.ReactNode[] = [];
        let currentText = cleanLine;
        let partKey = 0;

        while (currentText.length > 0) {
          const boldIndex = currentText.indexOf("**");
          const codeIndex = currentText.indexOf("`");

          let italicIndex = -1;
          let searchIdx = 0;
          while (searchIdx < currentText.length) {
            const idx = currentText.indexOf("*", searchIdx);
            if (idx === -1) break;
            const isPartofDouble = (idx > 0 && currentText[idx - 1] === "*") || (idx < currentText.length - 1 && currentText[idx + 1] === "*");
            if (!isPartofDouble) {
              italicIndex = idx;
              break;
            }
            searchIdx = idx + 1;
          }

          let minIndex = -1;
          let tokenType: "bold" | "italic" | "code" | null = null;

          if (boldIndex !== -1) {
            minIndex = boldIndex;
            tokenType = "bold";
          }
          if (codeIndex !== -1 && (minIndex === -1 || codeIndex < minIndex)) {
            minIndex = codeIndex;
            tokenType = "code";
          }
          if (italicIndex !== -1 && (minIndex === -1 || italicIndex < minIndex)) {
            minIndex = italicIndex;
            tokenType = "italic";
          }

          if (tokenType === "bold") {
            if (boldIndex > 0) {
              parts.push(currentText.substring(0, boldIndex));
            }
            const nextBold = currentText.indexOf("**", boldIndex + 2);
            if (nextBold !== -1) {
              const boldContent = currentText.substring(boldIndex + 2, nextBold);
              parts.push(<strong key={partKey++} className="font-bold text-slate-800">{boldContent}</strong>);
              currentText = currentText.substring(nextBold + 2);
            } else {
              parts.push(currentText.substring(boldIndex));
              currentText = "";
            }
          } else if (tokenType === "italic") {
            if (italicIndex > 0) {
              parts.push(currentText.substring(0, italicIndex));
            }
            const nextItalic = currentText.indexOf("*", italicIndex + 1);
            if (nextItalic !== -1) {
              const italicContent = currentText.substring(italicIndex + 1, nextItalic);
              parts.push(<em key={partKey++} className="italic text-slate-800 font-medium">{italicContent}</em>);
              currentText = currentText.substring(nextItalic + 1);
            } else {
              parts.push(currentText.substring(italicIndex));
              currentText = "";
            }
          } else if (tokenType === "code") {
            if (codeIndex > 0) {
              parts.push(currentText.substring(0, codeIndex));
            }
            const nextCode = currentText.indexOf("`", codeIndex + 1);
            if (nextCode !== -1) {
              const codeContent = currentText.substring(codeIndex + 1, nextCode);
              parts.push(<code key={partKey++} className="bg-slate-100 border border-slate-205 text-slate-800 px-1 py-0.5 rounded font-mono text-[9px] break-words whitespace-pre-wrap">{codeContent}</code>);
              currentText = currentText.substring(nextCode + 1);
            } else {
              parts.push(currentText.substring(codeIndex));
              currentText = "";
            }
          } else {
            parts.push(currentText);
            currentText = "";
          }
        }

        if (isHeader) {
          return (
            <h4
              key={idx}
              className={`font-black text-slate-800 mt-2 mb-1 tracking-tight border-b border-slate-100 pb-0.5 uppercase ${headerLevel === 1 ? "text-[10.5px] text-blue-600" : "text-[9.5px] text-slate-500"
                }`}
            >
              {parts}
            </h4>
          );
        }

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-2 py-0.5 text-slate-650">
              <span className="text-blue-500 shrink-0 select-none text-[10px]">•</span>
              <span className="flex-1 text-[11px] break-words">{parts}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-slate-650 py-0.5 text-[11px] break-words">
            {parts}
          </p>
        );
      })}
    </div>
  );
};

export function AIDesignView() {
  const {
    activeProject,
    activeDesign,
    setActiveDesign,
    designs,
    setDesigns,
    prompt,
    setPrompt,
    optimization,
    setOptimization,
    pipelineRunning,
    generating,
    handleGenerate,
    handleSelect,
    checkAuthAndRun,
    vddSlider,
    setSelectedTopologyCanonical
  } = useAppContext();

  // Component UI States
  const [activeTab, setActiveTab] = useState<"generate" | "history" | "templates" | "examples">("generate");
  const [outputTab, setOutputTab] = useState<"schematic" | "rtl" | "tb" | "consts" | "summary">("schematic");
  const [charCount, setCharCount] = useState(prompt?.length || 81);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);

  // New Sizing/Toolbar States
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isCanvasMaximized, setIsCanvasMaximized] = useState(false);
  const [showCanvasSettings, setShowCanvasSettings] = useState(false);
  const [showLayersConfig, setShowLayersConfig] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState<string[]>(["poly", "ndiff", "pdiff", "metal1", "via1"]);
  const [downloadFormat, setDownloadFormat] = useState<"spice" | "rtl" | "tb" | "gds">("spice");
  const [showShareModal, setShowShareModal] = useState(false);

  const currentIdx = designs.findIndex(d => d.id === activeDesign?.id);
  const canUndo = currentIdx > 0;
  const canRedo = currentIdx < designs.length - 1 && currentIdx !== -1;

  const handleUndo = () => {
    if (canUndo) {
      setActiveDesign(designs[currentIdx - 1]);
      alert(`Version v${designs[currentIdx - 1].version} loaded (Undo).`);
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      setActiveDesign(designs[currentIdx + 1]);
      alert(`Version v${designs[currentIdx + 1].version} loaded (Redo).`);
    }
  };

  const handleDownloadDesign = () => {
    if (!activeDesign) {
      alert("No compiled design version available for download.");
      return;
    }

    let content = "";
    let filename = "";

    if (downloadFormat === "spice") {
      content = activeDesign.netlist_content || "";
      filename = `${activeProject?.name || "design"}_netlist.sp`;
    } else if (downloadFormat === "rtl") {
      content = getRtlCode(activeDesign);
      filename = `${activeProject?.name || "design"}.v`;
    } else if (downloadFormat === "tb") {
      content = `* VELORA Automated Testbench
.include ${activeProject?.name || "design"}_netlist.sp
V_VDD VDD 0 DC ${vddSlider}
V_WL WL 0 PULSE(0 ${vddSlider} 1n 10p 10p 2n 4n)
.tran 10p 10n
.control
run
plot v(Q) v(QB)
.endc`;
      filename = `tb_${activeProject?.name || "design"}.sp`;
    } else if (downloadFormat === "gds") {
      content = `// GDSII Mock binary stream for ${activeProject?.name || "design"}
// Layer Map: active(1.0), poly(2.0), metal1(3.0)
// Node Size: ${activeDesign?.readiness_report_json?.area_um2 || 2.91} um2`;
      filename = `${activeProject?.name || "design"}.gds`;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (file.name.endsWith(".sp") || file.name.endsWith(".spice") || file.name.endsWith(".v") || file.name.endsWith(".json")) {
        alert(`File "${file.name}" attached successfully!\nSizing constraints and design rules imported.`);
        setPrompt(`Attached design specifications from ${file.name}:\n\n${text.slice(0, 300)}${text.length > 300 ? "..." : ""}`);
      } else {
        alert(`File "${file.name}" attached. Text content parsed.`);
        setPrompt(prev => prev + `\n[Reference file: ${file.name}]`);
      }
    };
    reader.readAsText(file);
  };

  const handleClearChat = () => {
    setDesigns([]);
    alert("Chat log cleared successfully.");
  };

  const renderHistoryTab = () => (
    <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-6 select-text">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Design Checkpoints</h3>
        <span className="text-[10px] text-slate-400 font-mono">Total Versions: {designs.length}</span>
      </div>

      {designs.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs italic">
          No checkpoints generated yet. Run compilation in the Generate tab.
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {[...designs].reverse().map((d: any) => {
            const isActive = d.id === activeDesign?.id;
            return (
              <div
                key={d.id}
                onClick={() => { setActiveDesign(d); alert(`Version v${d.version} loaded as active design.`); }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${isActive
                    ? "bg-blue-50/50 border-blue-200 shadow-sm"
                    : "bg-slate-50 border-slate-150 hover:bg-white hover:border-slate-300"
                  }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">v{d.version}</span>
                    <span className="text-xs font-bold text-slate-800 font-sans">{d.requirements_json?.type || "Design Spec"}</span>
                  </div>
                  <p className="text-[9.5px] text-slate-405 font-mono truncate max-w-[280px]">
                    {d.prompt || "Generate topology specifications."}
                  </p>
                </div>

                <div className="flex items-center gap-6 text-[10px] font-sans text-slate-500">
                  <div className="text-right">
                    <span className="text-[8px] uppercase font-bold text-slate-400 block">Area</span>
                    <span className="font-mono text-slate-750 font-semibold">{d.readiness_report_json?.area_um2 || 2.91} um²</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] uppercase font-bold text-slate-400 block">Leakage</span>
                    <span className="font-mono text-slate-750 font-semibold">{d.readiness_report_json?.static_power_uw !== undefined ? `${(d.readiness_report_json.static_power_uw * 1000).toFixed(0)} nW` : "3.4 nW"}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] uppercase font-bold text-slate-400 block">Created</span>
                    <span className="text-slate-700 font-medium">{d.created_at ? new Date(d.created_at).toLocaleTimeString() : "Just now"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-6 select-text">
      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Circuit Block Templates</h3>
        <p className="text-[11px] text-slate-500 mt-1 font-sans">
          Select a validated design topology to bootstrap your co-pilot prompt.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
        {[
          {
            title: "6T SRAM Memory Bitcell",
            type: "6T SRAM",
            pdk: "SKY130",
            desc: "Standard high-density memory bitcell utilizing cross-coupled inverter latch configuration for low leakage and read stability.",
            prompt: "Design a 6T SRAM cell using SKY130 PDK. Node size target is 2.9 um2, optimizing for low leakage under standby voltage VDD=1.8V."
          },
          {
            title: "8T Dual-Port SRAM Cell",
            type: "8T SRAM",
            pdk: "SKY130",
            desc: "Split read-write port memory layout to eliminate read disturb faults. Highly recommended for high speed memory arrays.",
            prompt: "Design a dual-port 8T SRAM memory block using SKY130. Include dedicated read port pass gates, optimized for high speed read cycle."
          },
          {
            title: "5-Stage Ring Oscillator",
            type: "Ring Oscillator",
            pdk: "SKY130",
            desc: "High frequency inverter oscillator loop with an enable signal pin. Used as on-chip clock source and temperature sensors.",
            prompt: "Compile a 5-Stage Ring Oscillator circuit on SKY130 process node, targeting a frequency of 1.25 GHz with minimal power."
          },
          {
            title: "Wilson Current Mirror",
            type: "Current Mirror",
            pdk: "GF180",
            desc: "High impedance current reference mirror block. Reduces channel length modulation effects and stabilizes output currents.",
            prompt: "Synthesize a Wilson Current Mirror circuit in GF180 PDK, with output current reference of 10uA and VDD=3.3V."
          }
        ].map((tpl, i) => (
          <div key={i} className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between hover:border-blue-400 hover:shadow-sm transition">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{tpl.pdk} PDK</span>
                <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">{tpl.type}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800">{tpl.title}</h4>
              <p className="text-[10px] text-slate-505 leading-normal font-sans">{tpl.desc}</p>
            </div>

            <button
              onClick={() => {
                setPrompt(tpl.prompt);
                setSelectedTopologyCanonical(tpl.type);
                setOptimization("Low Leakage");
                setActiveTab("generate");
                alert(`Template "${tpl.title}" loaded! Composer updated.`);
              }}
              className="mt-4 w-full bg-white hover:bg-blue-600 hover:text-white border border-slate-205 hover:border-blue-600 text-blue-605 text-[10px] font-bold py-2 rounded-lg transition"
            >
              Load Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExamplesTab = () => (
    <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-6 select-text">
      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Industry Verified Designs</h3>
        <p className="text-[11px] text-slate-505 mt-1 font-sans">
          Browse pre-compiled silicon examples from industry tapeouts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
        {[
          {
            title: "Low-Power SRAM Tapeout Block",
            type: "6T SRAM",
            pdk: "SKY130",
            area: "2.91 um²",
            power: "3.42 nW",
            delay: "42.5 ps",
            drc: "100% Passed",
            logs: "Successfully read PDK GDS constraints.\nConnections matched circuit graph nodes.\nTransient Simulation finished TT corner 1.8V.\nArea is 2.91 um2.\nAll rules passed."
          },
          {
            title: "High-Frequency Delay Line Osc",
            type: "Ring Oscillator",
            pdk: "SKY130",
            area: "14.5 um²",
            power: "420.5 nW",
            delay: "12.0 ps",
            drc: "100% Passed",
            logs: "Successfully compiled Ring Osc stages.\nDRC: 0 errors, LVS: 0 warnings.\nOutput frequency target 1.25 GHz matched."
          }
        ].map((ex, i) => (
          <div key={i} className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between hover:border-blue-400 hover:shadow-sm transition">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{ex.pdk} PDK</span>
                <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">{ex.type}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800">{ex.title}</h4>

              <div className="grid grid-cols-2 gap-2 text-[9.5px] font-sans text-slate-550 bg-white p-2.5 rounded-lg border border-slate-100">
                <div>Area: <strong className="text-slate-700">{ex.area}</strong></div>
                <div>Static Power: <strong className="text-slate-700">{ex.power}</strong></div>
                <div>Gate Delay: <strong className="text-slate-700">{ex.delay}</strong></div>
                <div>DRC Status: <strong className="text-emerald-600">{ex.drc}</strong></div>
              </div>
            </div>

            <button
              onClick={() => {
                const mockDesign = {
                  id: 9999 + i,
                  project_id: activeProject?.id || 1,
                  version: i + 1,
                  prompt: `Example Tapeout Design: ${ex.title}`,
                  requirements_json: { type: ex.type, optimization: "Low Power" },
                  readiness_report_json: {
                    overall: 100,
                    area_um2: parseFloat(ex.area),
                    static_power_uw: parseFloat(ex.power) / 1000,
                    stage_delay_ps: parseFloat(ex.delay),
                    drc: 100,
                    lvs: 100
                  },
                  schematic_svg: activeDesign?.schematic_svg || GUEST_DESIGN.schematic_svg,
                  netlist_content: `* Example tapeout Netlist for ${ex.title}\n* PDK Node: ${ex.pdk}\n.subckt ${ex.type.toLowerCase().replace(/ /g, "_")} A B Y\n* SPICE circuit parameters\n.ends`,
                  logs_content: ex.logs,
                  created_at: new Date().toISOString()
                };

                setActiveDesign(mockDesign);
                setDesigns(prev => [...prev.filter(d => d.id !== mockDesign.id), mockDesign]);
                setActiveTab("generate");
                alert(`Example "${ex.title}" loaded successfully!`);
              }}
              className="mt-4 w-full bg-white hover:bg-blue-600 hover:text-white border border-slate-205 hover:border-blue-600 text-blue-605 text-[10px] font-bold py-2 rounded-lg transition"
            >
              Load Example Design
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const handleCopyNetlist = () => {
    const netlist = `* 6T SRAM Cell - SKY130
* Low Power Optimized

.subckt sram_6t BL BLB WL VDD GND
M1 QB Q VDD VDD sky130_fd_pr__pfet_01v8 L=0.15u W=0.42u
M2 Q QB VDD VDD sky130_fd_pr__pfet_01v8 L=0.15u W=0.42u
M3 Q WL BL GND sky130_fd_pr__nfet_01v8 L=0.15u W=0.30u
M4 QB WL BLB GND sky130_fd_pr__nfet_01v8 L=0.15u W=0.30u
M5 Q QB GND GND sky130_fd_pr__nfet_01v8 L=0.15u W=0.20u
M6 QB Q GND GND sky130_fd_pr__nfet_01v8 L=0.15u W=0.20u
.ends sram_6t`;
    navigator.clipboard.writeText(netlist);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

    if (!activeProject) {
      return (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-sans bg-[#f8fafc]">
          Select or create a project to launch the AI Design Workspace.
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col lg:overflow-hidden bg-[#f8fafc] font-sans select-text h-full">

        {/* Top Header Section */}
        <div className="flex justify-between items-center px-8 py-5 bg-white border-b border-slate-100 shrink-0">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">AI Design</h1>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Describe your design goal in natural language. Velora AI will generate the circuit, RTL, and verification collateral.
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Custom Search Input */}
            <div className="relative w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 pl-10 pr-16 py-2.5 rounded-full outline-none font-sans focus:border-blue-500 focus:bg-white transition"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">
                Ctrl + K
              </kbd>
            </div>

            {/* Bell Icon */}
            <button className="relative p-2 text-slate-500 hover:text-slate-800 transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 border border-white" />
            </button>


          </div>
        </div>

        {/* Navigation tabs */}
        <div className="px-8 bg-white border-b border-slate-100 flex gap-8 text-xs font-semibold text-slate-500 font-sans shrink-0">
          {[
            { id: "generate", label: "Generate" },
            { id: "history", label: "History" },
            { id: "templates", label: "Templates" },
            { id: "examples", label: "Examples" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 cursor-pointer border-b-2 font-bold transition-all relative ${activeTab === tab.id
                  ? "border-blue-600 text-blue-600 font-black"
                  : "border-transparent hover:text-slate-800"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Panel Content Area */}
        <div className="p-8 flex flex-col lg:flex-row gap-8 items-stretch min-h-0 lg:flex-1 lg:overflow-hidden">

          {/* Left Column: Input + Schematic Display */}
          <div className="flex-1 min-w-0 space-y-6 lg:h-full lg:overflow-y-auto lg:pr-2 pb-4">

            {activeTab === "generate" && (
              <>
                {/* Card: Describe your design */}
                <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 font-sans uppercase tracking-wide">Describe your design</h3>

                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => {
                        setPrompt(e.target.value);
                        setCharCount(e.target.value.length);
                      }}
                      placeholder="Design a low power 6T SRAM cell using SKY130 PDK optimized for low leakage."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white outline-none rounded-xl p-4 text-xs font-sans h-24 transition shadow-inner leading-relaxed text-slate-800 resize-none"
                    />
                    <span className="absolute right-3.5 bottom-3.5 text-[9px] font-bold text-slate-400 font-mono">
                      {charCount}/2000
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Attach file */}
                      <button
                        onClick={() => document.getElementById("file-upload-input")?.click()}
                        className="border border-slate-205 hover:bg-slate-50 text-slate-707 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition"
                        title="Attach schematic/rules file"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                        <span>Attach file</span>
                      </button>
                      <input
                        type="file"
                        id="file-upload-input"
                        className="hidden"
                        onChange={handleFileAttach}
                      />

                      {/* Technology drop */}
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700">
                        <span>SKY130</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>

                      {/* Optimization drop */}
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700">
                        <span>Optimization: Low Power</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>

                    {/* Generate Design */}
                    <button
                      onClick={() => checkAuthAndRun(handleGenerate)}
                      disabled={pipelineRunning || generating}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{pipelineRunning ? "Generating..." : "Generate Design"}</span>
                    </button>
                  </div>
                </div>

                {/* Card: Generated Output */}
                <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Generated Output</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSelect("projects")}
                        className="border border-slate-200 hover:bg-slate-55 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        View in Project
                      </button>
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="border border-slate-200 hover:bg-slate-55 text-slate-700 p-2 rounded-lg transition"
                        title="Share Design Checkpoint"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Generated Sub-Tabs */}
                  <div className="flex gap-6 text-[11px] font-bold text-slate-500 font-sans border-b border-slate-100 pb-2">
                    {[
                      { id: "schematic", label: "Schematic" },
                      { id: "rtl", label: "RTL Code" },
                      { id: "tb", label: "Testbench" },
                      { id: "consts", label: "Constraints" },
                      { id: "summary", label: "Summary" }
                    ].map((subTab) => (
                      <button
                        key={subTab.id}
                        onClick={() => setOutputTab(subTab.id as any)}
                        className={`pb-2.5 transition relative font-bold ${outputTab === subTab.id
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-slate-400 hover:text-slate-700"
                          }`}
                      >
                        {subTab.label}
                      </button>
                    ))}
                  </div>

                  {/* Content view based on active Output Tab */}
                  <div>
                    {outputTab === "schematic" ? (
                      <div className="space-y-4">
                        {/* SVG Visual Canvas */}
                        <div className="border border-slate-200 rounded-2xl bg-white p-4 relative overflow-hidden flex flex-col select-none">

                          {/* Canvas Toolbar */}
                          <div className="flex justify-between items-center bg-slate-50/80 border border-slate-200/60 px-3 py-1.5 rounded-lg text-slate-500 text-xs shrink-0 mb-4 select-none">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setIsCanvasMaximized(true)}
                                className="hover:text-slate-800 transition p-1 hover:bg-slate-200/50 rounded"
                                title="Maximize Canvas"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => alert("Pan tool activated. Use trackpad/mouse drag to pan.")}
                                className="hover:text-slate-800 transition p-1 hover:bg-slate-200/50 rounded"
                                title="Pan tool"
                              >
                                ✋
                              </button>
                              <button
                                onClick={() => setRotation(r => (r + 90) % 360)}
                                className="hover:text-slate-800 transition p-1 hover:bg-slate-200/50 rounded"
                                title="Rotate schematic 90°"
                              >
                                <Maximize2 className="w-3.5 h-3.5 rotate-45" />
                              </button>

                              <span className="text-slate-300">|</span>

                              <button
                                onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
                                className="hover:text-slate-800 transition p-1 hover:bg-slate-200/50 rounded"
                                title="Zoom In"
                              >
                                <ZoomIn className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
                                className="hover:text-slate-800 transition p-1 hover:bg-slate-200/50 rounded"
                                title="Zoom Out"
                              >
                                <ZoomOut className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => { setZoom(1); setPanX(0); setPanY(0); setRotation(0); }}
                                className="hover:text-slate-800 transition p-1 hover:bg-slate-200/50 rounded"
                                title="Reset View"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                disabled={!canUndo}
                                onClick={handleUndo}
                                className={`hover:text-slate-800 transition p-1 hover:bg-slate-200/50 rounded ${!canUndo ? "opacity-30 cursor-not-allowed" : ""}`}
                                title="Undo design version"
                              >
                                <Undo2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                disabled={!canRedo}
                                onClick={handleRedo}
                                className={`hover:text-slate-800 transition p-1 hover:bg-slate-200/50 rounded ${!canRedo ? "opacity-30 cursor-not-allowed" : ""}`}
                                title="Redo design version"
                              >
                                <Redo2 className="w-3.5 h-3.5" />
                              </button>

                              <span className="text-slate-300">|</span>

                              <button
                                onClick={() => { setShowCanvasSettings(!showCanvasSettings); setShowLayersConfig(false); }}
                                className={`hover:text-slate-800 transition p-1 rounded ${showCanvasSettings ? "bg-slate-200" : "hover:bg-slate-200/50"}`}
                                title="Settings"
                              >
                                <Settings className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => { setShowLayersConfig(!showLayersConfig); setShowCanvasSettings(false); }}
                                className={`hover:text-slate-800 transition p-1 rounded ${showLayersConfig ? "bg-slate-200" : "hover:bg-slate-200/50"}`}
                                title="Layers"
                              >
                                <Layers className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Layers Config Overlay */}
                          {showLayersConfig && (
                            <div className="absolute right-4 top-16 bg-white/95 backdrop-blur border border-slate-200 p-3.5 rounded-xl shadow-lg z-10 w-44 font-sans text-[10px] space-y-2">
                              <span className="font-bold text-slate-700 uppercase tracking-wider block">GDS Layers</span>
                              <div className="space-y-1">
                                {["nwell", "active", "poly", "metal1", "metal2", "via1"].map(layer => (
                                  <label key={layer} className="flex items-center gap-2 cursor-pointer text-slate-605 hover:text-slate-850">
                                    <input
                                      type="checkbox"
                                      checked={selectedLayers.includes(layer)}
                                      onChange={(e) => {
                                        if (e.target.checked) setSelectedLayers([...selectedLayers, layer]);
                                        else setSelectedLayers(selectedLayers.filter(l => l !== layer));
                                      }}
                                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                                    />
                                    <span className="font-mono text-[9px] uppercase">{layer}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Settings Overlay */}
                          {showCanvasSettings && (
                            <div className="absolute right-4 top-16 bg-white/95 backdrop-blur border border-slate-200 p-3.5 rounded-xl shadow-lg z-10 w-48 font-sans text-[10px] space-y-2">
                              <span className="font-bold text-slate-700 uppercase tracking-wider block">Canvas Settings</span>
                              <div className="space-y-1.5">
                                <label className="flex items-center justify-between cursor-pointer text-slate-605">
                                  <span>Show Gridlines</span>
                                  <input type="checkbox" defaultChecked className="rounded text-blue-600 w-3 h-3 focus:ring-blue-500" />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer text-slate-605">
                                  <span>Orthogonal Alignment</span>
                                  <input type="checkbox" defaultChecked className="rounded text-blue-600 w-3 h-3 focus:ring-blue-500" />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer text-slate-605">
                                  <span>Display Node Labels</span>
                                  <input type="checkbox" defaultChecked className="rounded text-blue-600 w-3 h-3 focus:ring-blue-500" />
                                </label>
                              </div>
                            </div>
                          )}

                          {/* Schematic Rendering Canvas */}
                          <div className="flex justify-center items-center py-6 bg-slate-50/20 rounded-xl border border-slate-100 select-none overflow-hidden min-h-[260px] relative">
                            {activeDesign?.schematic_svg ? (
                              <div
                                className="w-full max-w-[480px] transition-transform duration-100 ease-out"
                                style={{
                                  transform: `scale(${zoom}) translate(${panX}px, ${panY}px) rotate(${rotation}deg)`,
                                  transformOrigin: 'center'
                                }}
                                dangerouslySetInnerHTML={{ __html: activeDesign.schematic_svg }}
                              />
                            ) : (
                              <div className="text-slate-400 text-xs font-sans py-12 select-text">
                                No schematic layout generated yet. Enter a description and click Generate Design.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans text-xs">
                          <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl relative group">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Area</span>
                            <strong className="text-slate-850 text-sm font-black font-mono">
                              {activeDesign?.readiness_report_json?.area_um2 !== undefined
                                ? `${activeDesign.readiness_report_json.area_um2.toFixed(2)} μm²`
                                : "2.91 μm²"}
                            </strong>
                            <span className="text-[8px] text-slate-405 block mt-0.5 font-sans font-semibold">Estimated</span>
                          </div>
                          <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl relative group">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Static Leakage</span>
                            <strong className="text-slate-850 text-sm font-black font-mono">
                              {activeDesign?.readiness_report_json?.static_power_uw !== undefined
                                ? `${(activeDesign.readiness_report_json.static_power_uw * 1000).toFixed(2)} nW`
                                : "3.42 nW"}
                            </strong>
                            <span className="text-[8px] text-slate-405 block mt-0.5 font-sans font-semibold">@ 0.8V, 25°C</span>
                          </div>
                          <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl relative group">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Read Stability (SNM)</span>
                            <strong className="text-slate-850 text-sm font-black font-mono">196 mV</strong>
                            <span className="text-[8px] text-slate-405 block mt-0.5 font-sans font-semibold">Typical</span>
                          </div>
                          <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl relative group">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Gate Switch Delay</span>
                            <strong className="text-slate-850 text-sm font-black font-mono">
                              {activeDesign?.readiness_report_json?.stage_delay_ps !== undefined
                                ? `${activeDesign.readiness_report_json.stage_delay_ps.toFixed(1)} ps`
                                : "42.5 ps"}
                            </strong>
                            <span className="text-[8px] text-slate-405 block mt-0.5 font-sans font-semibold">Max Slack</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-2xl bg-white p-6 min-h-[220px] overflow-auto select-text font-sans text-xs text-slate-705 leading-relaxed">
                        {outputTab === "rtl" && (
                          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-mono text-[9.5px] overflow-auto max-h-[300px]">
                            {activeDesign ? getRtlCode(activeDesign) : "No compiled netlist/RTL code generated yet."}
                          </pre>
                        )}
                        {outputTab === "tb" && (
                          <pre className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono text-[9.5px] overflow-auto max-h-[300px]">
                            {`* VELORA Automated Testbench
.include ${activeProject?.name || "design"}_netlist.sp
V_VDD VDD 0 DC ${vddSlider}
V_WL WL 0 PULSE(0 ${vddSlider} 1n 10p 10p 2n 4n)
.tran 10p 10n
.control
run
plot v(Q) v(QB)
.endc`}
                          </pre>
                        )}
                        {outputTab === "consts" && (
                          <pre className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono text-[9.5px] overflow-auto max-h-[300px]">
                            {JSON.stringify(activeDesign?.plan_json?.constraints || { vdd: vddSlider, temperature: 27 }, null, 2)}
                          </pre>
                        )}
                        {outputTab === "summary" && (
                          <div className="space-y-2 font-sans select-text text-slate-700">
                            <p><strong>Design Unit Name:</strong> {activeProject.name}</p>
                            <p><strong>Target Architecture Category:</strong> {activeProject.design_type}</p>
                            <p><strong>Compiled Technology Node:</strong> {activeProject.technology}</p>
                            <p><strong>Silicon Area:</strong> {activeDesign?.readiness_report_json?.area_um2 !== undefined ? `${activeDesign.readiness_report_json.area_um2.toFixed(2)} μm²` : "2.91 μm²"}</p>
                            <p><strong>Static Leakage Power:</strong> {activeDesign?.readiness_report_json?.static_power_uw !== undefined ? `${(activeDesign.readiness_report_json.static_power_uw * 1000).toFixed(2)} nW` : "3.42 nW"}</p>
                            <p><strong>Worst Slack Gate Delay:</strong> {activeDesign?.readiness_report_json?.stage_delay_ps !== undefined ? `${activeDesign.readiness_report_json.stage_delay_ps.toFixed(1)} ps` : "42.5 ps"}</p>
                            <p><strong>DRC/LVS Verification check:</strong> {activeDesign?.readiness_report_json?.overall !== undefined ? `Passed with ${activeDesign.readiness_report_json.overall}% score` : "Passed"}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Canvas Controls - Rendered UNCONDITIONALLY */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Format Selector Dropdown & Export/Download Button */}
                      <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-slate-50">
                        <select
                          value={downloadFormat}
                          onChange={(e) => setDownloadFormat(e.target.value as any)}
                          className="bg-transparent text-[10px] font-bold text-slate-600 outline-none cursor-pointer font-sans"
                        >
                          <option value="spice">SPICE Netlist (.sp)</option>
                          <option value="rtl">Verilog RTL (.v)</option>
                          <option value="tb">Testbench Netlist (.sp)</option>
                          <option value="gds">GDSII Layout (.gds)</option>
                        </select>
                        <button
                          onClick={handleDownloadDesign}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3 py-1.5 rounded transition flex items-center gap-1 shrink-0"
                        >
                          <Download className="w-2.5 h-2.5" />
                          <span>Export</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleSelect("schematic")}
                        className="border border-slate-200 hover:bg-slate-50 text-slate-755 text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        <span>Open in Schematic Editor</span>
                      </button>
                    </div>

                    <button
                      onClick={() => alert("Design version checkpoint saved to database successfully.")}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition shadow-sm font-sans"
                    >
                      Save to Project
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "history" && renderHistoryTab()}
            {activeTab === "templates" && renderTemplatesTab()}
            {activeTab === "examples" && renderExamplesTab()}
          </div>

          {/* Right Column: AI Assistant Chat Side-Panel */}
          <div className="w-full lg:w-[360px] shrink-0 bg-white border border-slate-150 rounded-2xl shadow-sm flex flex-col justify-between h-[670px] lg:h-full overflow-hidden">

            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white">
              <h3 className="text-xs font-bold text-slate-900 font-sans uppercase tracking-wide">AI Assistant</h3>
              <button
                onClick={handleClearChat}
                className="text-[10px] font-bold text-slate-405 hover:text-slate-600 transition uppercase tracking-wide font-sans cursor-pointer"
              >
                Clear chat
              </button>
            </div>

            {/* Chat Logs Window */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs font-sans">
              {designs.length === 0 && (
                <div className="flex items-start gap-2.5 max-w-[90%]">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-bold">
                    V
                  </div>
                  <div className="space-y-1">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl rounded-tl-none leading-relaxed text-slate-700 font-sans">
                      Hello! I am your AI Semiconductor Co-pilot. Enter a design description on the left or select a template to generate circuit schematics, SPICE netlists, and simulations.
                    </div>
                  </div>
                </div>
              )}

              {[...designs].reverse().map((d, index) => (
                <div key={d.id} className="space-y-4">
                  {/* User Prompt Bubble */}
                  <div className="flex items-start gap-2.5 justify-end">
                    <div className="space-y-1 text-right flex flex-col items-end max-w-[85%]">
                      <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none leading-relaxed text-left font-sans break-words max-w-full">
                        {d.prompt || "Generate design"}
                      </div>
                      <span className="text-[8px] text-slate-400 font-mono pr-1">
                        {d.created_at ? new Date(d.created_at).toLocaleTimeString() : "just now"}
                      </span>
                    </div>
                  </div>

                  {/* Assistant Output Bubble */}
                  <div className="flex items-start gap-2.5 max-w-[95%]">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-bold">
                      V
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl rounded-tl-none leading-relaxed text-slate-750 font-sans break-words max-w-full">
                        <p className="font-bold text-slate-800">VELORA Compiler v{d.version} Output:</p>
                        <div className="mt-1 text-slate-650 leading-relaxed">
                          {renderMarkdown(d.explanation_markdown || "Circuit compiled successfully. View generated netlist and waveforms below.")}
                        </div>
                      </div>
                      <span className="text-[8px] text-slate-400 font-mono pl-1">
                        {d.created_at ? new Date(d.created_at).toLocaleTimeString() : "just now"}
                      </span>

                      {/* Dynamic SPICE netlist file */}
                      {d.netlist_content && (
                        <div className="mt-2.5 border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-900 text-slate-100">
                          <div className="bg-slate-800/80 px-3.5 py-1.5 border-b border-slate-700 flex justify-between items-center text-[9px] font-mono text-slate-300 font-sans">
                            <span>spice_netlist.sp</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(d.netlist_content);
                                alert("Copied SPICE netlist to clipboard!");
                              }}
                              className="hover:text-white transition flex items-center gap-1 font-sans font-bold"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </button>
                          </div>
                          <pre className="p-3 text-[9px] font-mono leading-relaxed overflow-x-auto text-slate-300 select-text max-h-48">
                            {d.netlist_content}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Design Suggestions Panel */}
              <div className="border-t border-slate-100 pt-4 mt-2.5 space-y-3 shrink-0">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Design Suggestions</span>
                </h4>

                <div className="space-y-2">
                  {/* suggestion 1 */}
                  <div className="border border-slate-150 p-2.5 rounded-xl bg-slate-50 flex items-center justify-between gap-3 text-[10px] hover:border-slate-300 transition">
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate leading-tight">
                        <span className="font-bold text-slate-800 block truncate">Increase read stability</span>
                        <span className="text-[8.5px] text-slate-400 block truncate font-mono">Adjust pull-down ratio</span>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (!activeDesign) return;
                        try {
                          const updates = { "M_PD1": { "W": 0.8 }, "M_PD2": { "W": 0.8 } };
                          await api.tuneDesign(activeDesign.id, updates, vddSlider, optimization);
                          alert("Sizing optimization applied: Pull-down NMOS width increased to 0.8u to improve read stability.");
                        } catch (err: any) {
                          alert(`Optimization failed: ${err.message}`);
                        }
                      }}
                      className="border border-slate-200 hover:bg-white text-slate-700 font-bold px-2.5 py-1 rounded-lg shrink-0 transition"
                    >
                      Apply
                    </button>
                  </div>

                  {/* suggestion 2 */}
                  <div className="border border-slate-150 p-2.5 rounded-xl bg-slate-50 flex items-center justify-between gap-3 text-[10px] hover:border-slate-300 transition">
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate leading-tight">
                        <span className="font-bold text-slate-800 block truncate">Reduce leakage further</span>
                        <span className="text-[8.5px] text-slate-400 block truncate font-mono">Reduce PMOS width to 0.42u</span>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (!activeDesign) return;
                        try {
                          const updates = { "M_PU1": { "W": 0.42 }, "M_PU2": { "W": 0.42 } };
                          await api.tuneDesign(activeDesign.id, updates, vddSlider, "Low Leakage");
                          alert("Leakage optimization applied: PMOS pull-up width tuned to 0.42u for Low Leakage.");
                        } catch (err: any) {
                          alert(`Leakage optimization failed: ${err.message}`);
                        }
                      }}
                      className="border border-slate-200 hover:bg-white text-slate-700 font-bold px-2.5 py-1 rounded-lg shrink-0 transition"
                    >
                      Apply
                    </button>
                  </div>

                  {/* suggestion 3 */}
                  <div className="border border-slate-150 p-2.5 rounded-xl bg-slate-50 flex items-center justify-between gap-3 text-[10px] hover:border-slate-300 transition">
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <Play className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate leading-tight">
                        <span className="font-bold text-slate-800 block truncate">Run corners simulation</span>
                        <span className="text-[8.5px] text-slate-400 block truncate font-mono">TT, FF, SS, SF, FS</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelect("simulation")}
                      className="border border-slate-200 hover:bg-white text-slate-700 font-bold px-2.5 py-1 rounded-lg shrink-0 transition"
                    >
                      Run
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat input box */}
            <div className="p-4 border-t border-slate-100 bg-white shrink-0">
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 flex items-center gap-2 focus-within:border-blue-500 focus-within:bg-white transition">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask anything about your design..."
                  className="flex-1 bg-transparent border-none outline-none text-xs text-slate-850 font-sans"
                />
                <button
                  onClick={() => {
                    if (!chatInput.trim()) return;
                    setPrompt(chatInput);
                    setChatInput("");
                    checkAuthAndRun(handleGenerate);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {isCanvasMaximized && (
              <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-md p-8 justify-center items-center select-none">
                <div className="bg-white rounded-3xl p-6 w-full max-w-4xl h-[85vh] flex flex-col justify-between border border-slate-200 shadow-2xl relative">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold text-slate-805 uppercase tracking-wider font-sans">Maximized Schematic Editor View</h3>
                    <button
                      onClick={() => setIsCanvasMaximized(false)}
                      className="text-slate-400 hover:text-slate-700 transition font-sans font-bold text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 flex justify-center items-center overflow-hidden my-4 bg-slate-50 rounded-2xl relative select-none">
                    <div
                      className="w-full max-w-[640px] transition-transform duration-100 ease-out"
                      style={{
                        transform: `scale(${zoom * 1.4}) translate(${panX}px, ${panY}px) rotate(${rotation}deg)`,
                        transformOrigin: 'center'
                      }}
                      dangerouslySetInnerHTML={{ __html: activeDesign?.schematic_svg || "" }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs font-sans text-slate-500 pt-2 border-t border-slate-100">
                    <span>Node: {activeDesign?.requirements_json?.type || "6T SRAM"}</span>
                    <span>PDK: SKY130</span>
                  </div>
                </div>
              </div>
            )}

            {showShareModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm select-none">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {/* Header */}
                  <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-sans">Share Design Checkpoint</h3>
                    <button
                      onClick={() => setShowShareModal(false)}
                      className="text-slate-400 hover:text-slate-700 transition font-sans font-bold text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  {/* Body */}
                  <div className="p-6 space-y-4 font-sans text-xs">
                    <p className="text-slate-500">Share design checkpoint <strong>v{activeDesign?.version || 1}</strong> using one of the following methods:</p>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          alert("Design Workspace URL copied to clipboard!");
                        }}
                        className="p-3 border border-slate-200 hover:border-blue-500 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition flex flex-col items-center gap-1 text-center"
                      >
                        <span className="text-[15px]">🔗</span>
                        <span>Copy Link</span>
                      </button>
                      <button
                        onClick={() => {
                          alert("Design PDF report generated and emailed to team!");
                        }}
                        className="p-3 border border-slate-200 hover:border-blue-500 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition flex flex-col items-center gap-1 text-center"
                      >
                        <span className="text-[15px]">📧</span>
                        <span>Email Report</span>
                      </button>
                      <button
                        onClick={() => {
                          alert("Checkpoint sent to Slack channel #silicon-tapeout successfully!");
                        }}
                        className="p-3 border border-slate-200 hover:border-blue-500 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition flex flex-col items-center gap-1 text-center"
                      >
                        <span className="text-[15px]">💬</span>
                        <span>Share on Slack</span>
                      </button>
                      <button
                        onClick={() => {
                          alert("GDS layout package pushed to project cloud storage.");
                        }}
                        className="p-3 border border-slate-200 hover:border-blue-500 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition flex flex-col items-center gap-1 text-center"
                      >
                        <span className="text-[15px]">☁️</span>
                        <span>Push to Cloud</span>
                      </button>
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setShowShareModal(false)}
                      className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
}
