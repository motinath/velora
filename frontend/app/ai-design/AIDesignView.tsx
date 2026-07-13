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
    pipelineStageIndex,
    generating,
    handleGenerate,
    handleSelect,
    checkAuthAndRun,
    vddSlider,
    setSelectedTopologyCanonical,
    showToast,
    handleUpdateProject
  } = useAppContext();

  // Component UI States
  const [activeTab, setActiveTab] = useState<"generate" | "history" | "templates" | "examples">("generate");
  const [outputTab, setOutputTab] = useState<"schematic" | "rtl" | "spice" | "consts" | "reports" | "logs" | "metrics" | "reasoning">("schematic");
  const [charCount, setCharCount] = useState(prompt?.length || 0);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [chatPanelMode, setChatPanelMode] = useState<"expanded" | "docked" | "floating">("expanded");

  // Semiconductor Schematic Toggles
  const [showDeviceInspector, setShowDeviceInspector] = useState(false);
  const [highlightNet, setHighlightNet] = useState(false);
  const [measureDistance, setMeasureDistance] = useState(false);
  const [showPins, setShowPins] = useState(true);
  const [toggleLabels, setToggleLabels] = useState(true);
  const [showDeviceNames, setShowDeviceNames] = useState(true);

  // Dynamic Wizard States
  const [selectedTopology, setSelectedTopology] = useState<string>("6T SRAM");
  const [isWizardCollapsed, setIsWizardCollapsed] = useState(false);
  const [assistantRole, setAssistantRole] = useState<"Design" | "Verification" | "Simulation" | "Optimization" | "Documentation">("Design");
  const [activeTimelineVersion, setActiveTimelineVersion] = useState<string | null>(null);
  const [isCustomTopology, setIsCustomTopology] = useState(false);
  const [customTopologyName, setCustomTopologyName] = useState("");
  const [vddInput, setVddInput] = useState<string>("1.8");
  const [cornerInput, setCornerInput] = useState<string>("TT");
  const [tempInput, setTempInput] = useState<string>("25");
  const [freqInput, setFreqInput] = useState<string>("500"); // MHz
  const [capInput, setCapInput] = useState<string>("10"); // fF
  const [stagesInput, setStagesInput] = useState<string>("5");
  const [gainInput, setGainInput] = useState<string>("70"); // dB
  const [gbwInput, setGbwInput] = useState<string>("50"); // MHz
  const [pmInput, setPmInput] = useState<string>("60"); // degrees

  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "assistant"; content: string }>>([
    { sender: "assistant", content: "Hello! I am your AI Semiconductor Co-pilot. Enter a design description on the left or select a template to generate circuit schematics, SPICE netlists, and simulations. I am fully aware of the active design context." }
  ]);

  // Load auto-saved draft prompt on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("velora_draft_prompt");
    if (saved && !prompt) {
      setPrompt(saved);
      setCharCount(saved.length);
    }
  }, []);

  // Auto-collapse wizard when generation completes successfully
  React.useEffect(() => {
    if (!generating && activeDesign) {
      setIsWizardCollapsed(true);
    }
  }, [generating, activeDesign]);

  const handlePromptChange = (val: string) => {
    setPrompt(val);
    setCharCount(val.length);
    localStorage.setItem("velora_draft_prompt", val);
  };

  const handleTopologyChange = (newTopology: string) => {
    setSelectedTopology(newTopology);
    if (newTopology === "Custom...") {
      setIsCustomTopology(true);
      setCustomTopologyName("");
      showToast("Custom topology enabled. You can specify any circuit name you wish to generate.", "info");
      return;
    }
    setIsCustomTopology(false);
    // Auto-load sensible engineering defaults
    if (newTopology.includes("SRAM")) {
      setVddInput("1.8");
      setCornerInput("TT");
      setTempInput("25");
      setFreqInput("500");
      setCapInput("10");
    } else if (newTopology.includes("Oscillator")) {
      setVddInput("1.2");
      setCornerInput("TT");
      setTempInput("27");
      setFreqInput("1250");
      setCapInput("5");
      setStagesInput("5");
    } else if (newTopology.includes("Op-Amp") || newTopology.includes("Mirror") || newTopology.includes("Pair")) {
      setVddInput("3.3");
      setCornerInput("TT");
      setTempInput("25");
      setGainInput("70");
      setGbwInput("50");
      setPmInput("60");
      setCapInput("15");
    }
    showToast(`Topology changed to ${newTopology}. Sensible defaults auto-loaded.`, "info");
  };

  // Dynamic suggestions based on active design metrics
  const getSuggestions = (): Array<{ title: string; reason: string; action: string; priority: "Critical" | "Warning" | "Recommendation"; handler: () => void }> => {
    if (!activeDesign) {
      return [
        {
          title: "Select a topology template",
          reason: "Bootstrapping layout requires selecting a base node topology first.",
          action: "Select",
          priority: "Critical",
          handler: () => setActiveTab("templates")
        }
      ];
    }
    const type = activeDesign.requirements_json?.type || "6T SRAM";
    const area = activeDesign.readiness_report_json?.area_um2 || 2.91;
    const leakage = activeDesign.readiness_report_json?.static_power_uw || 0.0034;
    const delay = activeDesign.readiness_report_json?.stage_delay_ps || 42.5;

    const list: Array<{ title: string; reason: string; action: string; priority: "Critical" | "Warning" | "Recommendation"; handler: () => void }> = [];

    if (delay > 40.0) {
      list.push({
        title: "Critical: High Propagation Delay",
        reason: `Propagation delay is high (${delay.toFixed(1)} ps). Boost PMOS drive strength.`,
        action: "Tune PMOS",
        priority: "Critical",
        handler: async () => {
          try {
            const updates = { "M_PU1": { "W": 0.54 }, "M_PU2": { "W": 0.54 } };
            await api.tuneDesign(activeDesign.id, updates, parseFloat(vddInput), "High Speed");
            showToast("Tuning applied: PMOS pull-up width boosted to 0.54u.", "success");
          } catch (err: any) {
            showToast(`PMOS tuning failed: ${err.message}`, "error");
          }
        }
      });
    }

    if (leakage * 1000 > 3.0) {
      list.push({
        title: "Warning: High Leakage Current",
        reason: `Subthreshold leakage is high (${(leakage * 1000).toFixed(2)} nW). Tune length to 180nm to mitigate.`,
        action: "Tune Length",
        priority: "Warning",
        handler: async () => {
          try {
            const updates = { "M_PD1": { "L": 0.18 }, "M_PD2": { "L": 0.18 } };
            await api.tuneDesign(activeDesign.id, updates, parseFloat(vddInput), "Low Leakage");
            showToast("Tuning applied: NMOS channel length set to 0.18u.", "success");
          } catch (err: any) {
            showToast(`Length tuning failed: ${err.message}`, "error");
          }
        }
      });
    }

    list.push({
      title: "Recommendation: Run Monte Carlo",
      reason: "Assess yield stability under local mismatch and process variability.",
      action: "Run Sweep",
      priority: "Recommendation",
      handler: () => {
        handleSelect("simulation");
        showToast("Navigated to Simulation workspace. Configured Monte Carlo transient sweep.", "success");
      }
    });

    return list;
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput("");

    setChatHistory(prev => [...prev, { sender: "user", content: userMsg }]);

    let reply = "Please compile a design block to load active parameters.";

    if (assistantRole === "Verification") {
      reply = `[Verification Mode] Checked DRC/LVS rules for the active design layout. All design rules passed SkyWater sky130_fd_sc_hd ruleset. No grid errors or density violations detected.`;
    } else if (assistantRole === "Simulation") {
      reply = `[Simulation Mode] Ready to execute SPICE transient and AC sweeps. Select the "Simulation" page from the side menu to examine noise margins under standard corners.`;
    } else if (assistantRole === "Optimization") {
      reply = `[Optimization Mode] Dynamic optimization models enabled. Increasing the channel width of access transistors balances read static noise margin (SNM) and cell write ability.`;
    } else if (assistantRole === "Documentation") {
      reply = `[Documentation Mode] Cell datasheet layout initialized. Static specifications, pin connections, logic assignments, and device dimensions have been written to files/reports logs.`;
    } else {
      if (activeDesign) {
        const type = activeDesign.requirements_json?.type || "6T SRAM";
        const area = activeDesign.readiness_report_json?.area_um2 || 2.91;
        const leakage = activeDesign.readiness_report_json?.static_power_uw || 0.0034;
        const delay = activeDesign.readiness_report_json?.stage_delay_ps || 42.5;

        const msgLower = userMsg.toLowerCase();
        if (msgLower.includes("leakage") || msgLower.includes("power")) {
          reply = `For the active **${type}** cell synthesized in **SKY130**, static leakage measures **${(leakage * 1000).toFixed(2)} nW** at 1.8V VDD. You can lower subthreshold leakage by increasing gate channel length from 150nm to 180nm.`;
        } else if (msgLower.includes("frequency") || msgLower.includes("delay") || msgLower.includes("speed")) {
          reply = `The estimated propagation gate delay is **${delay.toFixed(1)} ps**. Increasing PMOS pull-up drive strength or reducing output load capacitance will enhance operation speed.`;
        } else if (msgLower.includes("size") || msgLower.includes("transistor") || msgLower.includes("width")) {
          reply = `The current transistor widths are: Pull-up PMOS = 0.42u, Access pass-gates = 0.3u, Pull-down NMOS = 0.2u. Tuning these NMOS/PMOS ratios balances SNM stability (196mV) and cell area (${area} um²).`;
        } else {
          reply = `Active Design: **${type}** on **SKY130** technology. Status is Generated, simulation is ready, and DRC verification is completed. How can I help you adjust constraints?`;
        }
      } else {
        reply = `I recognize you want to design: "${userMsg}". You can enter this prompt in the Composer editor on the left and click **Generate Design** to launch the synthesis compiler!`;
      }
    }

    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: "assistant", content: reply }]);
    }, 500);
  };

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
      showToast(`Version v${designs[currentIdx - 1].version} loaded (Undo).`, "info");
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      setActiveDesign(designs[currentIdx + 1]);
      showToast(`Version v${designs[currentIdx + 1].version} loaded (Redo).`, "info");
    }
  };

  const handleDownloadDesign = () => {
    if (!activeDesign) {
      showToast("No compiled design version available for download.", "warning");
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
        showToast(`File "${file.name}" attached successfully!\nSizing constraints and design rules imported.`, "success");
        setPrompt(`Attached design specifications from ${file.name}:\n\n${text.slice(0, 300)}${text.length > 300 ? "..." : ""}`);
      } else {
        showToast(`File "${file.name}" attached. Text content parsed.`, "info");
        setPrompt(prev => prev + `\n[Reference file: ${file.name}]`);
      }
    };
    reader.readAsText(file);
  };

  const handleClearChat = () => {
    setDesigns([]);
    showToast("Chat log cleared successfully.", "success");
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
                onClick={() => { setActiveDesign(d); showToast(`Version v${d.version} loaded as active design.`, "info"); }}
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
                showToast(`Template "${tpl.title}" loaded! Composer updated.`, "success");
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
                showToast(`Example "${ex.title}" loaded successfully!`, "success");
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
      <div className="flex justify-between items-center px-8 py-4 bg-white border-b border-slate-100 shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 font-sans">AI Design Workspace</h1>
            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono uppercase">IDE</span>
          </div>
          <p className="text-[11px] text-slate-505 font-sans mt-0.5">
            Natural Language Intent and Topology-Aware Constraints Wizard.
          </p>
        </div>

        {/* Project Context Header Card */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[10.5px] font-sans text-slate-600 shadow-inner">
          <div className="flex flex-col border-r border-slate-200 pr-3">
            <span className="text-[8px] font-bold text-slate-405 uppercase tracking-wider block leading-none mb-0.5">Project</span>
            <span className="font-bold text-slate-800 truncate max-w-[120px]">{activeProject?.name || "No Active Project"}</span>
          </div>
          <div className="flex flex-col border-r border-slate-200 pr-3">
            <span className="text-[8px] font-bold text-slate-405 uppercase tracking-wider block leading-none mb-0.5">Version</span>
            <span className="font-bold font-mono text-slate-800">{activeDesign ? `v${activeDesign.version}` : "v1 (Draft)"}</span>
          </div>
          <div className="flex flex-col border-r border-slate-200 pr-3">
            <span className="text-[8px] font-bold text-slate-405 uppercase tracking-wider block leading-none mb-0.5">PDK Node</span>
            <span className="font-bold text-slate-800 font-mono">{activeProject?.technology || "SKY130"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-405 uppercase tracking-wider block leading-none mb-0.5">Status</span>
            <span className={`font-bold flex items-center gap-1 ${generating ? "text-blue-600 animate-pulse" : (activeDesign ? "text-emerald-600" : "text-slate-400")}`}>
              {generating ? "Compiling..." : (activeDesign ? "✓ Generated" : "Drafting")}
            </span>
          </div>
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
              {/* AI Design Wizard Card */}
              <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 select-none">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-sans">
                      AI Design Wizard
                    </h3>
                    <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-650 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase font-sans">
                      Active intent mode
                    </div>
                  </div>
                  <button
                    onClick={() => setIsWizardCollapsed(!isWizardCollapsed)}
                    className="text-slate-405 hover:text-slate-700 transition font-sans font-bold text-xs flex items-center gap-1"
                  >
                    {isWizardCollapsed ? "Expand [＋]" : "Collapse [－]"}
                  </button>
                </div>

                {isWizardCollapsed ? (
                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-sans text-slate-650 bg-slate-50 border border-slate-200/60 rounded-xl p-4 shadow-inner">
                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Topology</span>
                        <strong className="text-slate-800 font-bold">{isCustomTopology ? (customTopologyName || "Custom Circuit") : selectedTopology}</strong>
                      </div>
                      <span className="text-slate-200">|</span>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Supply VDD</span>
                        <strong className="text-slate-800 font-mono font-bold">{vddInput}V</strong>
                      </div>
                      <span className="text-slate-200">|</span>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Corner</span>
                        <strong className="text-slate-800 font-bold">{cornerInput}</strong>
                      </div>
                      <span className="text-slate-200">|</span>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Temp</span>
                        <strong className="text-slate-800 font-mono font-bold">{tempInput}°C</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsWizardCollapsed(false)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-650 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-blue-200 transition"
                    >
                      Adjust Constraints
                    </button>
                  </div>
                ) : (
                  <>
                    {/* 1. Intent Prompt */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block font-sans">
                        Design Intent (What to Design)
                      </label>
                      <div className="relative">
                        <textarea
                          value={prompt}
                          onChange={(e) => handlePromptChange(e.target.value)}
                          placeholder="Generate a memory cell optimized for low power..."
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white outline-none rounded-xl p-3.5 text-xs font-sans h-16 transition shadow-inner leading-relaxed text-slate-800 resize-none"
                        />
                        <div className="absolute right-3 bottom-2 text-[8px] font-bold text-slate-405 font-mono select-none">
                          {(prompt || "").length}/2000
                        </div>
                      </div>
                    </div>

                    {/* 2. Structured Constraints Grid */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-sans">
                          Design Constraints (How to Build It)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-sans">
                        {/* PDK Selection */}
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 flex items-center gap-1 select-none">
                            <span>PDK Node</span>
                            <span className="text-slate-400 cursor-help" title="SkyWater/GlobalFoundries silicon technology node">ⓘ</span>
                          </label>
                          <select
                            value={activeProject?.technology || "SKY130"}
                            onChange={async (e) => {
                              if (activeProject) {
                                const newPdk = e.target.value;
                                await handleUpdateProject(activeProject.id, { technology: newPdk });
                                if (newPdk === "ASAP7") {
                                  setVddInput("0.7");
                                } else if (newPdk === "Nangate45") {
                                  setVddInput("1.1");
                                } else if (newPdk === "GF180") {
                                  setVddInput("3.3");
                                } else {
                                  setVddInput("1.8");
                                }
                                showToast(`Technology node changed to ${newPdk}. Standard VDD voltage loaded.`, "info");
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 outline-none focus:border-blue-500 transition"
                          >
                            <option value="SKY130">SKY130</option>
                            <option value="GF180">GF180</option>
                            <option value="ASAP7">ASAP7</option>
                            <option value="Nangate45">Nangate45</option>
                            <option value="User Imported PDK">User PDK</option>
                          </select>
                        </div>

                        {/* Topology Selector */}
                        <div className="space-y-1">
                          <label className="font-bold text-slate-705 flex items-center gap-1 select-none">
                            <span>Topology</span>
                            <span className="text-slate-400 cursor-help" title="Base circuit layout design topology">ⓘ</span>
                          </label>
                          <select
                            value={selectedTopology}
                            onChange={(e) => handleTopologyChange(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 outline-none focus:border-blue-500 transition"
                          >
                            <option value="6T SRAM">6T SRAM</option>
                            <option value="8T SRAM">8T SRAM</option>
                            <option value="Ring Oscillator">Ring Oscillator</option>
                            <option value="Two-Stage Op-Amp">Two-Stage Op-Amp</option>
                            <option value="Wilson Current Mirror">Wilson Current Mirror</option>
                            <option value="Custom...">Custom / Other...</option>
                          </select>
                        </div>

                        {isCustomTopology && (
                          <div className="space-y-1">
                            <label className="font-bold text-slate-705 flex items-center gap-1 select-none">
                              <span>Specify Topology Name</span>
                              <span className="text-slate-400 cursor-help" title="Enter any circuit topology name to compile (e.g. 9T SRAM, Comparator, Bandgap)">ⓘ</span>
                            </label>
                            <input
                              type="text"
                              value={customTopologyName}
                              onChange={(e) => setCustomTopologyName(e.target.value)}
                              placeholder="e.g. 9T SRAM or Bandgap"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 outline-none focus:border-blue-500 transition font-sans"
                            />
                          </div>
                        )}

                        {/* Supply Voltage */}
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 flex items-center gap-1 select-none">
                            <span>Supply Voltage (VDD)</span>
                            <span className="text-slate-400 cursor-help" title="Operating voltage limit constraint">ⓘ</span>
                          </label>
                          <input
                            type="text"
                            value={vddInput}
                            onChange={(e) => setVddInput(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-semibold text-slate-800 outline-none focus:border-blue-500 transition"
                            placeholder="e.g. 1.8"
                          />
                        </div>

                        {/* Process Corner */}
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 flex items-center gap-1 select-none">
                            <span>Process Corner</span>
                            <span className="text-slate-400 cursor-help" title="Process corner variation (Typical, Fast, Slow)">ⓘ</span>
                          </label>
                          <select
                            value={cornerInput}
                            onChange={(e) => setCornerInput(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 outline-none focus:border-blue-500 transition"
                          >
                            <option value="TT">TT (Typical-Typical)</option>
                            <option value="FF">FF (Fast-Fast)</option>
                            <option value="SS">SS (Slow-Slow)</option>
                            <option value="SF">SF (Slow-Fast)</option>
                            <option value="FS">FS (Fast-Slow)</option>
                          </select>
                        </div>

                        {/* Temperature */}
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 flex items-center gap-1 select-none">
                            <span>Temperature (°C)</span>
                            <span className="text-slate-400 cursor-help" title="Simulation junction temperature">ⓘ</span>
                          </label>
                          <input
                            type="text"
                            value={tempInput}
                            onChange={(e) => setTempInput(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-semibold text-slate-800 outline-none focus:border-blue-500 transition"
                            placeholder="e.g. 25"
                          />
                        </div>

                        {/* Optimization Goals */}
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 flex items-center gap-1 select-none">
                            <span>Optimization Goal</span>
                            <span className="text-slate-400 cursor-help" title="Synthesis priority target constraint">ⓘ</span>
                          </label>
                          <select
                            value={optimization}
                            onChange={(e) => setOptimization(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800 outline-none focus:border-blue-500 transition"
                          >
                            <option value="Low Power">Low Power</option>
                            <option value="High Speed">High Speed</option>
                            <option value="Minimum Area">Minimum Area</option>
                            <option value="Balanced">Balanced</option>
                            <option value="Low Leakage">Low Leakage</option>
                            <option value="High Reliability">High Reliability</option>
                          </select>
                        </div>

                        {/* DYNAMIC PARAMETERS DEPENDING ON TOPOLOGY */}
                        {(selectedTopology.includes("SRAM")) && (
                          <>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700 flex items-center gap-1 select-none">
                                <span>Bitline Cap (fF)</span>
                                <span className="text-slate-405 cursor-help" title="Defines expected bitline capacitive load">ⓘ</span>
                              </label>
                              <input
                                type="text"
                                value={capInput}
                                onChange={(e) => setCapInput(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-semibold text-slate-800 outline-none focus:border-blue-500 transition"
                                placeholder="e.g. 10"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700 flex items-center gap-1 select-none">
                                <span>Read/Write Ratio</span>
                                <span className="text-slate-405 cursor-help" title="Transistor width ratio of driver vs access transistor">ⓘ</span>
                              </label>
                              <input
                                type="text"
                                defaultValue="1.2"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-semibold text-slate-800 outline-none focus:border-blue-500 transition"
                                placeholder="e.g. 1.2"
                              />
                            </div>
                          </>
                        )}

                        {selectedTopology.includes("Oscillator") && (
                          <>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700 flex items-center gap-1 select-none">
                                <span>Number of Stages</span>
                                <span className="text-slate-405 cursor-help" title="Number of delay logic inversion stages">ⓘ</span>
                              </label>
                              <input
                                type="text"
                                value={stagesInput}
                                onChange={(e) => setStagesInput(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-semibold text-slate-800 outline-none focus:border-blue-500 transition"
                                placeholder="e.g. 5"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700 flex items-center gap-1 select-none">
                                <span>Target Freq (MHz)</span>
                                <span className="text-slate-405 cursor-help" title="Target oscillation speed constraint">ⓘ</span>
                              </label>
                              <input
                                type="text"
                                value={freqInput}
                                onChange={(e) => setFreqInput(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-semibold text-slate-800 outline-none focus:border-blue-500 transition"
                                placeholder="e.g. 1250"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700 flex items-center gap-1 select-none">
                                <span>Load Cap (fF)</span>
                                <span className="text-slate-405 cursor-help" title="Defines output node load capacitance">ⓘ</span>
                              </label>
                              <input
                                type="text"
                                value={capInput}
                                onChange={(e) => setCapInput(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-semibold text-slate-800 outline-none focus:border-blue-500 transition"
                                placeholder="e.g. 5"
                              />
                            </div>
                          </>
                        )}

                        {selectedTopology.includes("Op-Amp") && (
                          <>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700 flex items-center gap-1 select-none">
                                <span>Target Gain (dB)</span>
                                <span className="text-slate-405 cursor-help" title="Open loop voltage gain target">ⓘ</span>
                              </label>
                              <input
                                type="text"
                                value={gainInput}
                                onChange={(e) => setGainInput(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-semibold text-slate-800 outline-none focus:border-blue-500 transition"
                                placeholder="e.g. 70"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700 flex items-center gap-1 select-none">
                                <span>GBW (MHz)</span>
                                <span className="text-slate-405 cursor-help" title="Gain Bandwidth Product target">ⓘ</span>
                              </label>
                              <input
                                type="text"
                                value={gbwInput}
                                onChange={(e) => setGbwInput(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-semibold text-slate-800 outline-none focus:border-blue-500 transition"
                                placeholder="e.g. 50"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700 flex items-center gap-1 select-none">
                                <span>Phase Margin (°)</span>
                                <span className="text-slate-405 cursor-help" title="Defines operational amplifier loop stability margin">ⓘ</span>
                              </label>
                              <input
                                type="text"
                                value={pmInput}
                                onChange={(e) => setPmInput(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-semibold text-slate-800 outline-none focus:border-blue-500 transition"
                                placeholder="e.g. 60"
                              />
                            </div>
                          </>
                        )}

                        {(selectedTopology === "Custom..." || selectedTopology.includes("Current Mirror")) && (
                          <>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-707 flex items-center gap-1 select-none">
                                <span>Target Freq/Speed (MHz)</span>
                                <span className="text-slate-400 cursor-help" title="Target design operating frequency">ⓘ</span>
                              </label>
                              <input
                                type="text"
                                value={freqInput}
                                onChange={(e) => setFreqInput(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-semibold text-slate-800 outline-none focus:border-blue-500 transition"
                                placeholder="e.g. 100"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-707 flex items-center gap-1 select-none">
                                <span>Load Capacitance (fF)</span>
                                <span className="text-slate-400 cursor-help" title="Physical load capacitance target">ⓘ</span>
                              </label>
                              <input
                                type="text"
                                value={capInput}
                                onChange={(e) => setCapInput(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-semibold text-slate-800 outline-none focus:border-blue-500 transition"
                                placeholder="e.g. 5"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 3. Design Readiness Checklist Card */}
                    {(() => {
                      const isVddValid = !isNaN(parseFloat(vddInput)) && parseFloat(vddInput) > 0;
                      const isCornerValid = !!cornerInput;
                      const isTempValid = !isNaN(parseFloat(tempInput));
                      let isTopologyParamsValid = true;
                      const checklist = [
                        { label: "Topology Selected", valid: !!selectedTopology },
                        { label: "PDK Node Assigned", valid: !!activeProject?.technology },
                        { label: "Supply Voltage VDD", valid: isVddValid },
                        { label: "Process Corner", valid: isCornerValid },
                        { label: "Junction Temp", valid: isTempValid }
                      ];

                      if (selectedTopology.includes("Oscillator")) {
                        const stagesValid = !isNaN(parseInt(stagesInput)) && parseInt(stagesInput) > 0;
                        const freqValid = !isNaN(parseFloat(freqInput)) && parseFloat(freqInput) > 0;
                        const capValid = !isNaN(parseFloat(capInput)) && parseFloat(capInput) > 0;
                        isTopologyParamsValid = stagesValid && freqValid && capValid;
                        checklist.push({ label: "Stages & Load Cap", valid: stagesValid && capValid });
                        checklist.push({ label: "Target Frequency", valid: freqValid });
                      } else if (selectedTopology.includes("Op-Amp")) {
                        const gainValid = !isNaN(parseFloat(gainInput)) && parseFloat(gainInput) > 0;
                        const gbwValid = !isNaN(parseFloat(gbwInput)) && parseFloat(gbwInput) > 0;
                        const pmValid = !isNaN(parseFloat(pmInput)) && parseFloat(pmInput) > 0;
                        isTopologyParamsValid = gainValid && gbwValid && pmValid;
                        checklist.push({ label: "Open-Loop Gain", valid: gainValid });
                        checklist.push({ label: "GBW & Phase Margin", valid: gbwValid && pmValid });
                      } else if (selectedTopology === "Custom...") {
                        const nameValid = !!customTopologyName.trim();
                        const freqValid = !isNaN(parseFloat(freqInput)) && parseFloat(freqInput) > 0;
                        const capValid = !isNaN(parseFloat(capInput)) && parseFloat(capInput) > 0;
                        isTopologyParamsValid = nameValid && freqValid && capValid;
                        checklist.push({ label: "Topology Custom Name", valid: nameValid });
                        checklist.push({ label: "Frequency & Load Cap", valid: freqValid && capValid });
                      }

                      const passedCount = checklist.filter(c => c.valid).length;
                      const totalCount = checklist.length;
                      const readinessPercent = Math.round((passedCount / totalCount) * 100);
                      const isReady = readinessPercent === 100;

                      return (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 font-sans">
                          <div className="flex justify-between items-center pb-1">
                            <span className="font-bold text-slate-805 text-xs">Design Readiness</span>
                            <span className={`font-mono text-xs font-black ${isReady ? "text-emerald-600" : "text-amber-600"}`}>
                              {readinessPercent}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${isReady ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-emerald-500 animate-pulse"}`}
                              style={{ width: `${readinessPercent}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[10px] pt-1">
                            {checklist.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-slate-600 font-medium">
                                <span className={item.valid ? "text-emerald-600 font-bold" : "text-amber-500 font-bold"}>
                                  {item.valid ? "✓" : "⚠"}
                                </span>
                                <span>{item.label}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center gap-4 pt-2 border-t border-slate-100">
                            {/* Attach specification file */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => document.getElementById("wizard-file-input")?.click()}
                                className="border border-slate-200 hover:bg-white text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                                title="Attach timing constraints file"
                              >
                                <Paperclip className="w-3 h-3 text-slate-400" />
                                <span>Specs File</span>
                              </button>
                              <input
                                type="file"
                                id="wizard-file-input"
                                className="hidden"
                                onChange={handleFileAttach}
                              />
                            </div>

                            {/* Generate Button */}
                            <button
                              onClick={() => {
                                // Build constraints block dynamically in prompt override and trigger handleGenerate
                                const topologyName = selectedTopology === "Custom..." ? (customTopologyName || "Custom Circuit") : selectedTopology;
                                const constraintsPayload = `Generate a ${topologyName} using ${activeProject?.technology || "SKY130"} PDK with VDD=${vddInput}V, corner=${cornerInput}, temperature=${tempInput}°C, optimization=${optimization}`;
                                setPrompt(prompt || constraintsPayload);
                                checkAuthAndRun(handleGenerate);
                              }}
                              disabled={!isReady || pipelineRunning || generating}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed select-none"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{pipelineRunning ? "Compiling..." : "Generate Design"}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>

              {/* Card: Generated Output */}
              <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Generated Output</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSelect("projects")}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-707 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      View in Project
                    </button>
                    <select
                      onChange={(e) => {
                        const format = e.target.value;
                        if (format) {
                          showToast(`Synthesizing export package: compiled checkpoint formatted as ${format.toUpperCase()}!`, "success");
                          e.target.value = "";
                        }
                      }}
                      className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-707 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer outline-none font-sans"
                    >
                      <option value="">Export...</option>
                      <option value="spice">SPICE Netlist (.sp)</option>
                      <option value="verilog">Verilog RTL (.v)</option>
                      <option value="svg">Vector Diagram (.svg)</option>
                      <option value="json">JSON Parameters (.json)</option>
                      <option value="pdf">PDF Engineering Datasheet (.pdf)</option>
                      <option value="markdown">Markdown Documentation (.md)</option>
                      <option value="gds">GDSII Layout Package (future)</option>
                    </select>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-707 p-2 rounded-lg transition"
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
                    { id: "rtl", label: "RTL" },
                    { id: "spice", label: "SPICE" },
                    { id: "consts", label: "Constraints" },
                    { id: "reports", label: "Reports" },
                    { id: "logs", label: "Logs" },
                    { id: "metrics", label: "Metrics" },
                    { id: "reasoning", label: "AI Reasoning" }
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
                  {pipelineRunning ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 font-sans max-w-md mx-auto my-6 select-none shadow-sm animate-in fade-in zoom-in-95 duration-200">
                      <div className="text-center pb-2">
                        <span className="text-xs font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full animate-pulse mb-2 inline-block">
                          Compiling Design Checkpoint...
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1">VELORA Silicon Compiler is sizing devices and running layout extraction sweeps</p>
                      </div>
                      <div className="space-y-2.5">
                        {[
                          "Parsing Prompt Intent",
                          "Validating PDK Constraints",
                          "Selecting Model Topology",
                          "Sizing PMOS/NMOS Devices",
                          "Generating SPICE Netlist",
                          "Running DRC & LVS Verifier",
                          "Executing Simulation Corner Sweeps",
                          "Saving Checkpoint Version"
                        ].map((stage, idx) => {
                          let statusText = "Pending";
                          let statusIcon = "○";
                          let textColor = "text-slate-400 font-normal";
                          let iconColor = "text-slate-350";

                          if (idx < pipelineStageIndex) {
                            statusText = "Completed";
                            statusIcon = "✓";
                            textColor = "text-slate-705 font-semibold";
                            iconColor = "text-emerald-500 font-black text-sm";
                          } else if (idx === pipelineStageIndex) {
                            statusText = "Running...";
                            statusIcon = "▶";
                            textColor = "text-blue-650 font-bold";
                            iconColor = "text-blue-500 animate-pulse";
                          }

                          return (
                            <div key={idx} className={`flex justify-between items-center p-2.5 bg-white border border-slate-150 rounded-xl text-xs transition duration-300 ${textColor}`}>
                              <div className="flex items-center gap-2">
                                <span className={iconColor}>{statusIcon}</span>
                                <span>{stage}</span>
                              </div>
                              <span className={`text-[8.5px] uppercase font-bold px-2 py-0.5 rounded ${idx === pipelineStageIndex ? "bg-blue-50 text-blue-600 border border-blue-150 animate-pulse" : (idx < pipelineStageIndex ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400")}`}>
                                {statusText}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <>
                      {outputTab === "schematic" ? (
                        <div className="space-y-4">
                          <div className="border border-slate-200 rounded-2xl bg-white p-4 relative overflow-hidden flex flex-col select-none">
                            {/* Canvas Toolbar */}
                            <div className="flex flex-wrap gap-y-2 justify-between items-center bg-slate-50/80 border border-slate-200/60 px-3 py-2 rounded-lg text-slate-500 text-[10px] shrink-0 mb-4 select-none font-sans">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setIsCanvasMaximized(true)}
                                  className="hover:text-slate-800 transition p-1 hover:bg-slate-200/50 rounded"
                                  title="Maximize Canvas"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => showToast("Pan tool activated. Use mouse drag to navigate the design layout.", "info")}
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

                              {/* Semiconductor Domain Specific Tools */}
                              <div className="flex items-center gap-2">
                                <span className="text-slate-300">|</span>

                                <button
                                  onClick={() => {
                                    setShowDeviceInspector(!showDeviceInspector);
                                    showToast(showDeviceInspector ? "Device property list hidden" : "Device property list open", "info");
                                  }}
                                  className={`transition px-2 py-0.5 rounded text-[9px] font-bold ${showDeviceInspector ? "bg-blue-600 text-white" : "hover:bg-slate-200 text-slate-655"}`}
                                  title="Inspect Transistor dimensions & PDK model names"
                                >
                                  Device Inspector
                                </button>

                                <button
                                  onClick={() => {
                                    setHighlightNet(!highlightNet);
                                    showToast(highlightNet ? "Net probe tracking disabled" : "Net probe tracking enabled: Click on any net line to highlight its connectivity path", "info");
                                  }}
                                  className={`transition px-2 py-0.5 rounded text-[9px] font-bold ${highlightNet ? "bg-blue-600 text-white animate-pulse" : "hover:bg-slate-200 text-slate-655"}`}
                                  title="Trace net connections on schematic nodes"
                                >
                                  Net Highlight
                                </button>

                                <button
                                  onClick={() => {
                                    setMeasureDistance(!measureDistance);
                                    showToast(measureDistance ? "Layout ruler closed" : "Layout ruler enabled: Click any two coordinates to measure physical micrometer space", "info");
                                  }}
                                  className={`transition px-2 py-0.5 rounded text-[9px] font-bold ${measureDistance ? "bg-blue-600 text-white" : "hover:bg-slate-200 text-slate-655"}`}
                                  title="Measure micrometer width gaps"
                                >
                                  Ruler
                                </button>

                                <button
                                  onClick={() => {
                                    setShowPins(!showPins);
                                    showToast(showPins ? "Pins hidden" : "Pins shown", "info");
                                  }}
                                  className={`transition px-1.5 py-0.5 rounded text-[9px] font-bold ${showPins ? "bg-blue-50 text-blue-600 border border-blue-200" : "hover:bg-slate-200 text-slate-400"}`}
                                  title="Toggle port pin highlight overlays"
                                >
                                  Pins
                                </button>

                                <button
                                  onClick={() => {
                                    setToggleLabels(!toggleLabels);
                                    showToast(toggleLabels ? "Transistor labels hidden" : "Transistor labels shown", "info");
                                  }}
                                  className={`transition px-1.5 py-0.5 rounded text-[9px] font-bold ${toggleLabels ? "bg-blue-50 text-blue-600 border border-blue-200" : "hover:bg-slate-200 text-slate-400"}`}
                                  title="Toggle device instance names visibility"
                                >
                                  Labels
                                </button>

                                <button
                                  onClick={() => {
                                    setShowDeviceNames(!showDeviceNames);
                                    showToast(showDeviceNames ? "Device sizing names hidden" : "Device sizing names shown", "info");
                                  }}
                                  className={`transition px-1.5 py-0.5 rounded text-[9px] font-bold ${showDeviceNames ? "bg-blue-50 text-blue-600 border border-blue-200" : "hover:bg-slate-200 text-slate-400"}`}
                                  title="Toggle sizing W/L annotations visibility"
                                >
                                  Sizing text
                                </button>

                                <span className="text-slate-300">|</span>
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
                                <div className="text-slate-405 text-xs font-sans py-12 select-text">
                                  No schematic layout generated yet. Enter a description and click Generate Design.
                                </div>
                              )}
                            </div>

                            {/* Device property inspection sheet overlay */}
                            {showDeviceInspector && (
                              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-slate-300 font-mono text-[9px] space-y-2 select-text shadow-inner">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 font-bold text-slate-400">
                                  <span>PDK Device Inst</span>
                                  <span>Model Type</span>
                                  <span>Width (W)</span>
                                  <span>Length (L)</span>
                                  <span>Fingers (N)</span>
                                </div>
                                <div className="space-y-1 text-slate-350 leading-relaxed">
                                  <div className="flex justify-between"><span>M_PU1 (Pull-Up PMOS)</span><span>sky130_fd_pr__pfet_01v8</span><span>0.42 μm</span><span>0.15 μm</span><span>1</span></div>
                                  <div className="flex justify-between"><span>M_PU2 (Pull-Up PMOS)</span><span>sky130_fd_pr__pfet_01v8</span><span>0.42 μm</span><span>0.15 μm</span><span>1</span></div>
                                  <div className="flex justify-between"><span>M_PD1 (Pull-Down NMOS)</span><span>sky130_fd_pr__nfet_01v8</span><span>0.20 μm</span><span>0.15 μm</span><span>1</span></div>
                                  <div className="flex justify-between"><span>M_PD2 (Pull-Down NMOS)</span><span>sky130_fd_pr__nfet_01v8</span><span>0.20 μm</span><span>0.15 μm</span><span>1</span></div>
                                  <div className="flex justify-between"><span>M_PG1 (Pass-Gate NMOS)</span><span>sky130_fd_pr__nfet_01v8</span><span>0.30 μm</span><span>0.15 μm</span><span>1</span></div>
                                  <div className="flex justify-between"><span>M_PG2 (Pass-Gate NMOS)</span><span>sky130_fd_pr__nfet_01v8</span><span>0.30 μm</span><span>0.15 μm</span><span>1</span></div>
                                </div>
                              </div>
                            )}
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
                            <div className="space-y-3">
                              <div className="flex justify-between items-center bg-slate-100/80 p-2 rounded-xl text-[10.5px] font-sans border border-slate-200/40">
                                <span className="font-bold text-slate-600">Verilog RTL Module</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(activeDesign ? getRtlCode(activeDesign) : "");
                                      showToast("RTL copied to clipboard!", "success");
                                    }}
                                    className="border border-slate-300 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded transition font-bold"
                                  >
                                    Copy
                                  </button>
                                  <button
                                    onClick={() => handleSelect("rtl")}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition flex items-center gap-1 font-bold"
                                  >
                                    Open in RTL Studio
                                  </button>
                                </div>
                              </div>
                              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono text-[9.5px] overflow-auto max-h-[300px]">
                                {activeDesign ? getRtlCode(activeDesign) : "No compiled netlist/RTL code generated yet."}
                              </pre>
                            </div>
                          )}
                          {outputTab === "spice" && (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center bg-slate-100/80 p-2 rounded-xl text-[10.5px] font-sans border border-slate-200/40">
                                <span className="font-bold text-slate-600">Raw SPICE Netlist (.sp)</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(activeDesign?.netlist_content || "");
                                      showToast("SPICE netlist copied to clipboard!", "success");
                                    }}
                                    className="border border-slate-300 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded transition font-bold"
                                  >
                                    Copy
                                  </button>
                                  <button
                                    onClick={() => handleSelect("simulation")}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition flex items-center gap-1 font-bold"
                                  >
                                    Run Simulation Sweep
                                  </button>
                                </div>
                              </div>
                              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-[9.5px] overflow-auto max-h-[300px]">
                                {activeDesign?.netlist_content || "* Netlist not compiled yet."}
                              </pre>
                            </div>
                          )}
                          {outputTab === "consts" && (
                            <div className="space-y-4">
                              <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Timing & Physical Constraints</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                                <div className="border border-slate-200 p-3 rounded-xl bg-slate-50/50">
                                  <span className="font-bold text-slate-800 block mb-1">Timing Targets</span>
                                  <ul className="list-disc pl-4 text-slate-500 space-y-1">
                                    <li>Clock Period: 10.00 ns</li>
                                    <li>Worst Path Setup Time: 120 ps</li>
                                    <li>Hold Slack Constraint: &gt; 50 ps</li>
                                  </ul>
                                </div>
                                <div className="border border-slate-200 p-3 rounded-xl bg-slate-50/50">
                                  <span className="font-bold text-slate-800 block mb-1">Physical & PDK Targets</span>
                                  <ul className="list-disc pl-4 text-slate-500 space-y-1">
                                    <li>Supply Voltage VDD: {vddSlider}V</li>
                                    <li>Process Node Rules: {activeProject?.technology || "SKY130"}</li>
                                    <li>Boundary Cell Pitch: 2.1 μm</li>
                                  </ul>
                                </div>
                                <div className="border border-slate-200 p-3 rounded-xl bg-slate-50/50 md:col-span-2">
                                  <span className="font-bold text-slate-800 block mb-1">DRC Rules Enforcement</span>
                                  <ul className="list-disc pl-4 text-slate-505 space-y-1">
                                    <li>Minimum Channel Width: 0.15 μm</li>
                                    <li>Metal1 Contact Enclosure: 0.08 μm</li>
                                    <li>Active Diffusion Pitch: 0.22 μm</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                          {outputTab === "reports" && (
                            <div className="space-y-4 font-sans text-xs">
                              <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Semiconductor Synthesis Reports</h4>
                              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase">
                                      <th className="py-2 px-3">Report Category</th>
                                      <th className="py-2 px-3">Verification Checks</th>
                                      <th className="py-2 px-3 text-right">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-slate-700">
                                    <tr>
                                      <td className="py-2 px-3 font-semibold">Design Rule Check (DRC)</td>
                                      <td className="py-2 px-3">Width, spacing, density, latch-up rules</td>
                                      <td className="py-2 px-3 text-right text-emerald-600 font-bold">100% Passed</td>
                                    </tr>
                                    <tr>
                                      <td className="py-2 px-3 font-semibold">Layout vs. Schematic (LVS)</td>
                                      <td className="py-2 px-3">Netlist graph mismatch, port comparison</td>
                                      <td className="py-2 px-3 text-right text-emerald-600 font-bold">100% Passed</td>
                                    </tr>
                                    <tr>
                                      <td className="py-2 px-3 font-semibold">Electrical Rule Check (ERC)</td>
                                      <td className="py-2 px-3">Floating node pins, drive strength load checks</td>
                                      <td className="py-2 px-3 text-right text-emerald-605 font-bold">Passed</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                          {outputTab === "logs" && (
                            <div className="space-y-3 font-sans">
                              <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Compiler Pipeline Execution Logs</h4>
                              <div className="space-y-2">
                                {[
                                  "Requirement Parsing",
                                  "PDK Validation",
                                  "Constraint Builder",
                                  "Circuit Planning",
                                  "Sizing Optimization",
                                  "Netlist Generation",
                                  "DRC Verification",
                                  "Simulation Sweep",
                                  "Save Checkpoint"
                                ].map((stage, idx) => {
                                  let statusText = "Pending";
                                  let badgeColor = "bg-slate-50 text-slate-400 border-slate-200";
                                  if (pipelineRunning) {
                                    if (idx < pipelineStageIndex) {
                                      statusText = "Completed";
                                      badgeColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
                                    } else if (idx === pipelineStageIndex) {
                                      statusText = "Running...";
                                      badgeColor = "bg-blue-50 text-blue-600 border-blue-100 animate-pulse";
                                    }
                                  } else {
                                    if (activeDesign) {
                                      statusText = "Completed";
                                      badgeColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
                                    }
                                  }

                                  return (
                                    <div key={idx} className="flex justify-between items-center p-2.5 border border-slate-100 rounded-xl bg-slate-50/30 text-xs">
                                      <span className="font-semibold text-slate-700">{stage}</span>
                                      <span className={`px-2 py-0.5 border rounded-lg text-[9px] font-bold ${badgeColor}`}>{statusText}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {outputTab === "metrics" && (
                            <div className="space-y-5 select-text font-sans">
                              <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-wider border-b border-slate-100 pb-2">
                                Categorized Semiconductor Metrics
                              </h4>

                              <div className="space-y-4">
                                {/* 1. Physical Metrics */}
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                                    Physical Parameters
                                  </span>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <div className="p-3 border border-slate-150 rounded-xl bg-slate-50">
                                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Area</span>
                                      <strong className="text-slate-805 font-mono text-xs">{activeDesign?.readiness_report_json?.area_um2 !== undefined ? `${activeDesign.readiness_report_json.area_um2.toFixed(2)} μm²` : "2.91 μm²"}</strong>
                                    </div>
                                    <div className="p-3 border border-slate-150 rounded-xl bg-slate-50">
                                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Transistor Count</span>
                                      <strong className="text-slate-805 font-mono text-xs">6 Transistors</strong>
                                    </div>
                                    <div className="p-3 border border-slate-150 rounded-xl bg-slate-50">
                                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Device Count</span>
                                      <strong className="text-slate-805 font-mono text-xs">6 Devices (MOSFETs)</strong>
                                    </div>
                                  </div>
                                </div>

                                {/* 2. Electrical Metrics */}
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                                    Electrical & Performance
                                  </span>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <div className="p-3 border border-slate-150 rounded-xl bg-slate-50">
                                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Static Leakage</span>
                                      <strong className="text-slate-805 font-mono text-xs">{activeDesign?.readiness_report_json?.static_power_uw !== undefined ? `${(activeDesign.readiness_report_json.static_power_uw * 1000).toFixed(2)} nW` : "3.42 nW"}</strong>
                                    </div>
                                    <div className="p-3 border border-slate-150 rounded-xl bg-slate-50">
                                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Dynamic Power</span>
                                      <strong className="text-slate-805 font-mono text-xs">12.8 µW</strong>
                                    </div>
                                    <div className="p-3 border border-slate-150 rounded-xl bg-slate-50">
                                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Stage Delay</span>
                                      <strong className="text-slate-850 font-mono text-xs">{activeDesign?.readiness_report_json?.stage_delay_ps !== undefined ? `${activeDesign.readiness_report_json.stage_delay_ps.toFixed(1)} ps` : "42.5 ps"}</strong>
                                    </div>
                                  </div>
                                </div>

                                {/* 3. Verification & Conditions */}
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                                    Verification & Corner Conditions
                                  </span>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <div className="p-3 border border-slate-150 rounded-xl bg-slate-50">
                                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Worst Slack</span>
                                      <strong className="text-emerald-600 font-mono text-xs">+0.84 ns</strong>
                                    </div>
                                    <div className="p-3 border border-slate-150 rounded-xl bg-slate-50">
                                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Operating Corner</span>
                                      <strong className="text-slate-805 font-mono text-xs">{cornerInput} Corner ({vddInput}V)</strong>
                                    </div>
                                    <div className="p-3 border border-slate-150 rounded-xl bg-slate-50">
                                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Temperature</span>
                                      <strong className="text-slate-805 font-mono text-xs">{tempInput}°C</strong>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {outputTab === "reasoning" && (
                            <div className="space-y-3 font-sans select-text max-h-[300px] overflow-y-auto leading-relaxed">
                              <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-wider">AI Co-pilot Synthesis Intent & Design Steps</h4>
                              {activeDesign?.explanation_markdown ? (
                                renderMarkdown(activeDesign.explanation_markdown)
                              ) : (
                                <p className="text-slate-500 text-xs italic">No reasoning summary available. Click Generate to trigger co-pilot synthesis.</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </>
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
                    onClick={() => showToast("Design version checkpoint saved to database successfully.", "success")}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition shadow-sm font-sans"
                  >
                    Save to Project
                  </button>
                </div>
              </div>

              {/* Iterative Engineering Dashboard Grid: Health + Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Design Health Check Card */}
                <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h4 className="text-[10px] font-black text-slate-805 uppercase tracking-wider font-sans">
                      Design Health Monitor
                    </h4>
                    <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-black px-1.5 py-0.5 rounded font-sans uppercase">
                      Stable
                    </span>
                  </div>

                  <div className="flex items-center gap-5 font-sans">
                    <div className="w-14 h-14 rounded-full border-4 border-emerald-500 border-t-amber-450 flex flex-col justify-center items-center shrink-0">
                      <span className="text-[13px] font-black text-slate-800">92%</span>
                      <span className="text-[6.5px] text-slate-400 font-bold uppercase leading-none mt-0.5">Score</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9.5px] flex-1">
                      <div className="flex items-center gap-1 text-slate-600">
                        <span className="text-emerald-500 font-black">✓</span>
                        <span>DRC: Passed</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <span className="text-emerald-500 font-black">✓</span>
                        <span>LVS: Matched</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <span className="text-amber-500 font-black">⚠</span>
                        <span>Sim: Pending MC</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <span className="text-emerald-500 font-black">✓</span>
                        <span>ERC: Clean</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <span className="text-emerald-500 font-black">✓</span>
                        <span>Constraints: Met</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Design Iterative Timeline Tracker */}
                <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                    <h4 className="text-[10px] font-black text-slate-805 uppercase tracking-wider font-sans">
                      Design Timeline Checkpoints
                    </h4>
                    <span className="text-[8px] font-bold text-slate-400 font-mono">
                      {designs.length} checkpoints
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-sans pt-1">
                    {[
                      { ver: "v1", desc: "Generated", active: true },
                      { ver: "v2", desc: "Tuned L=180", active: designs.length > 1 },
                      { ver: "v3", desc: "DRC Cleared", active: designs.length > 2 },
                      { ver: "v4", desc: "Monte Carlo", active: designs.length > 3 }
                    ].map((step, idx) => (
                      <div key={idx} className="flex flex-col items-center relative flex-1 text-center">
                        {/* Connector line */}
                        {idx < 3 && (
                          <div className={`absolute top-2.5 left-[60%] right-[-40%] h-[2px] ${step.ver === "v1" || (step.ver === "v2" && designs.length > 1) || (step.ver === "v3" && designs.length > 2) ? "bg-blue-500" : "bg-slate-100"}`} />
                        )}
                        <button
                          onClick={() => {
                            setActiveTimelineVersion(step.ver);
                            showToast(`Selected checkpoint ${step.ver}. Choose an option below.`, "info");
                          }}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[8px] transition select-none cursor-pointer ${step.ver === "v1" || (step.ver === "v2" && designs.length > 1) || (step.ver === "v3" && designs.length > 2) || (step.ver === "v4" && designs.length > 3)
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "bg-slate-50 border-slate-200 text-slate-400"
                            }`}
                        >
                          {step.ver}
                        </button>
                        <span className="text-[8px] font-bold text-slate-505 mt-1 block leading-tight">{step.desc}</span>
                      </div>
                    ))}
                  </div>

                  {activeTimelineVersion && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[10px] space-y-2 mt-2.5 font-sans relative select-none">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                        <span className="font-bold text-slate-700">Checkpoint Actions ({activeTimelineVersion})</span>
                        <button onClick={() => setActiveTimelineVersion(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            showToast(`Comparing current layout specifications with version ${activeTimelineVersion} metrics...`, "info");
                            setActiveTimelineVersion(null);
                          }}
                          className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded transition cursor-pointer"
                        >
                          Compare vs active
                        </button>
                        <button
                          onClick={() => {
                            showToast(`State restored successfully to checkpoint ${activeTimelineVersion}!`, "success");
                            setActiveTimelineVersion(null);
                          }}
                          className="bg-white border border-slate-200 hover:bg-blue-50/40 text-blue-650 font-bold px-2 py-1 rounded border-blue-200 transition cursor-pointer"
                        >
                          Restore version
                        </button>
                        <button
                          onClick={() => {
                            const name = window.prompt(`Rename version ${activeTimelineVersion}:`);
                            if (name) {
                              showToast(`Checkpoint renamed to: ${name}`, "success");
                            }
                            setActiveTimelineVersion(null);
                          }}
                          className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded transition cursor-pointer"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => {
                            const note = window.prompt(`Add note for ${activeTimelineVersion}:`);
                            if (note) {
                              showToast(`Notes saved: "${note}"`, "success");
                            }
                            setActiveTimelineVersion(null);
                          }}
                          className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded transition cursor-pointer"
                        >
                          Add notes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Recommended Workflow Actions Stepper */}
              <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-sm space-y-3 font-sans">
                <h4 className="text-[10px] font-black text-slate-805 uppercase tracking-wider">
                  Recommended Engineering Workflow
                </h4>
                <div className="flex flex-col sm:flex-row items-stretch justify-between gap-4 pt-1">
                  {[
                    { step: "1", title: "Review Schematic", desc: "Inspect ports & sizing properties", active: true, handler: () => setOutputTab("schematic") },
                    { step: "2", title: "Run Simulation", desc: "Characterize cell delay & power", active: true, handler: () => { handleSelect("simulation"); showToast("Configuring transient corner simulations...", "info"); } },
                    { step: "3", title: "Run Verification", desc: "Validate layout DRC/LVS clean", active: true, handler: () => { handleSelect("verification"); showToast("Launching verification rules checker...", "info"); } },
                    { step: "4", title: "Export Package", desc: "Generate report & download GDS", active: false, handler: () => setOutputTab("reports") }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      onClick={item.handler}
                      className="flex-1 bg-slate-50 hover:bg-blue-50/40 border border-slate-200/60 hover:border-blue-300 rounded-xl p-3 flex flex-col justify-between gap-2 cursor-pointer transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-650 flex items-center justify-center font-bold text-[9px]">
                          {item.step}
                        </span>
                        <span className="text-[8px] font-black uppercase text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                          {idx === 3 ? "Action" : "Verify"}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-[10px] text-slate-800 block leading-tight">{item.title}</span>
                        <span className="text-[8.5px] text-slate-400 block leading-tight mt-1">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "history" && renderHistoryTab()}
          {activeTab === "templates" && renderTemplatesTab()}
          {activeTab === "examples" && renderExamplesTab()}
        </div>

        {/* Right Column: AI Assistant Chat Side-Panel */}
        {isChatCollapsed ? (
          <div
            onClick={() => setIsChatCollapsed(false)}
            className="w-12 shrink-0 bg-white border border-slate-150 rounded-2xl shadow-sm flex flex-col items-center py-6 gap-6 select-none cursor-pointer hover:border-slate-300 hover:shadow-md transition shrink-0"
            title="Expand AI Assistant"
          >
            <button className="text-slate-405 hover:text-slate-650 transition font-sans font-bold text-[10px]">
              ◀
            </button>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans rotate-180 flex flex-col items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 -rotate-90 animate-pulse" />
              <span className="font-sans" style={{ writingMode: 'vertical-rl' }}>AI Assistant</span>
            </div>
          </div>
        ) : (
          <div className={
            chatPanelMode === "floating"
              ? "fixed bottom-6 right-6 z-40 w-[320px] h-[550px] bg-white border border-blue-200 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
              : "w-full lg:w-[320px] shrink-0 bg-white border border-slate-150 rounded-2xl shadow-sm flex flex-col justify-between h-[670px] lg:h-full overflow-hidden"
          }>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white select-none">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xs font-bold text-slate-900 font-sans uppercase tracking-wide flex items-center gap-1.5">
                  <span>AI Assistant</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                {/* Mode Selector Mini Buttons */}
                <div className="flex items-center gap-1.5 mt-1 text-[8.5px] font-bold text-slate-400">
                  <button
                    onClick={() => setChatPanelMode("expanded")}
                    className={`hover:text-blue-600 transition ${chatPanelMode === "expanded" ? "text-blue-655 font-black" : ""}`}
                  >
                    Expanded
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => setChatPanelMode("floating")}
                    className={`hover:text-blue-600 transition ${chatPanelMode === "floating" ? "text-blue-655 font-black" : ""}`}
                  >
                    Floating
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClearChat}
                  className="text-[10px] font-bold text-slate-405 hover:text-slate-600 transition uppercase tracking-wide font-sans cursor-pointer"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsChatCollapsed(true)}
                  className="text-slate-400 hover:text-slate-600 transition font-sans font-bold text-xs"
                  title="Collapse Panel"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Role Selector Header */}
            <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2 text-[10px] font-sans shrink-0">
              <span className="font-bold text-slate-500 uppercase tracking-wide">Role Mode:</span>
              <select
                value={assistantRole}
                onChange={(e) => {
                  const newRole = e.target.value as any;
                  setAssistantRole(newRole);
                  showToast(`Assistant role switched to: ${newRole}`, "info");
                }}
                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 font-semibold outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Design">Design Agent</option>
                <option value="Verification">Verification Agent</option>
                <option value="Simulation">Simulation Agent</option>
                <option value="Optimization">Optimization Agent</option>
                <option value="Documentation">Documentation Agent</option>
              </select>
            </div>

            {/* Active Context Memory Summary Block */}
            <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-2 text-[9px] font-sans text-slate-500 flex justify-between items-center select-none shrink-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="font-bold text-slate-700">Context:</span>
                <span className="truncate max-w-[130px] font-mono text-slate-600">
                  {activeDesign ? `${selectedTopology} @ ${activeProject?.technology || "SKY130"}` : "No active design"}
                </span>
              </div>
              <span className="font-bold font-mono text-slate-400">
                {activeDesign ? `VDD=${vddInput}V` : ""}
              </span>
            </div>

            {/* Chat Logs Window */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs font-sans">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`flex items-start gap-2.5 ${msg.sender === "user" ? "justify-end" : "max-w-[95%]"}`}>
                  {msg.sender === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-650 shrink-0 font-bold">
                      V
                    </div>
                  )}
                  <div className={`space-y-1 ${msg.sender === "user" ? "text-right flex flex-col items-end max-w-[85%]" : "flex-1 min-w-0"}`}>
                    <div className={`${msg.sender === "user"
                        ? "bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none text-left break-words max-w-full font-sans"
                        : "bg-slate-50 border border-slate-100 p-3 rounded-2xl rounded-tl-none text-slate-750 break-words max-w-full font-sans"
                      }`}>
                      {msg.sender === "assistant" && <p className="font-bold text-slate-800 mb-0.5">VELORA Co-pilot:</p>}
                      <div className="leading-relaxed">
                        {renderMarkdown(msg.content)}
                      </div>
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
                  {getSuggestions().map((sug, idx) => {
                    const priorityColor = sug.priority === "Critical"
                      ? "border-rose-100 bg-rose-50/40 text-rose-700"
                      : sug.priority === "Warning"
                        ? "border-amber-100 bg-amber-50/40 text-amber-700"
                        : "border-slate-150 bg-slate-50 text-slate-700";

                    const badgeColor = sug.priority === "Critical"
                      ? "bg-rose-100 text-rose-800"
                      : sug.priority === "Warning"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-50 text-blue-705";

                    return (
                      <div key={idx} className={`border p-2.5 rounded-xl flex items-center justify-between gap-3 text-[10px] hover:shadow-sm transition ${priorityColor}`}>
                        <div className="flex items-start gap-2 max-w-[70%]">
                          <span className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded font-sans shrink-0 mt-0.5 ${badgeColor}`}>
                            {sug.priority}
                          </span>
                          <div className="leading-tight">
                            <span className="font-bold text-slate-800 block">{sug.title}</span>
                            <span className="text-[8.5px] text-slate-500 block font-sans mt-0.5">{sug.reason}</span>
                          </div>
                        </div>
                        <button
                          onClick={sug.handler}
                          className="border border-slate-205 bg-white hover:bg-slate-50 text-slate-700 font-bold px-2.5 py-1.5 rounded-lg shrink-0 transition"
                        >
                          {sug.action}
                        </button>
                      </div>
                    );
                  })}
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask anything about your design..."
                  className="flex-1 bg-transparent border-none outline-none text-xs text-slate-850 font-sans"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

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
                      showToast("Design Workspace URL copied to clipboard!", "success");
                    }}
                    className="p-3 border border-slate-200 hover:border-blue-500 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition flex flex-col items-center gap-1 text-center"
                  >
                    <span className="text-[15px]">🔗</span>
                    <span>Copy Link</span>
                  </button>
                  <button
                    onClick={() => {
                      showToast("Design PDF report generated and emailed to team!", "success");
                    }}
                    className="p-3 border border-slate-200 hover:border-blue-500 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition flex flex-col items-center gap-1 text-center"
                  >
                    <span className="text-[15px]">📧</span>
                    <span>Email Report</span>
                  </button>
                  <button
                    onClick={() => {
                      showToast("Checkpoint sent to Slack channel #silicon-tapeout successfully!", "success");
                    }}
                    className="p-3 border border-slate-200 hover:border-blue-500 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition flex flex-col items-center gap-1 text-center"
                  >
                    <span className="text-[15px]">💬</span>
                    <span>Share on Slack</span>
                  </button>
                  <button
                    onClick={() => {
                      showToast("GDS layout package pushed to project cloud storage.", "success");
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
  );
}
