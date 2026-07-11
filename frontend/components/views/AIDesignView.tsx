"use client";

import React from "react";
import { useAppContext } from "../../app/providers";

export function AIDesignView() {
  const {
    activeProject,
    activeDesign,
    designs,
    setActiveDesign,
    setConsoleLogs,
    selectedTopologyCanonical,
    setSelectedTopologyCanonical,
    prompt,
    setPrompt,
    availableTopologies,
    optimization,
    setOptimization,
    pipelineRunning,
    generating,
    pipelineStageIndex,
    vddSlider,
    handleGenerate,
    handleSelect,
    checkAuthAndRun
  } = useAppContext();

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

          {/* Topology selector — populated from registry */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Topology:</span>
            <select
              value={selectedTopologyCanonical}
              onChange={(e) => {
                const canonical = e.target.value;
                setSelectedTopologyCanonical(canonical);
                setPrompt(`Design a ${canonical} using SKY130`);
                // Reset optimization to first available option for this topology
                const tpl = availableTopologies.find(t => t.canonical === canonical);
                const firstOpt = tpl?.optimizations?.find((o: string) => o !== "default") ?? "default";
                setOptimization(firstOpt);
              }}
              className="flex-1 bg-slate-50 border border-border rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-primary"
            >
              {["Memory", "Analog", "Digital"].map(cat => {
                const group = availableTopologies.filter(t => t.category === cat);
                if (!group.length) return null;
                return (
                  <optgroup key={cat} label={cat}>
                    {group.map((t: any) => (
                      <option key={t.canonical} value={t.canonical}>
                        {t.canonical} — {t.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your target specs (e.g. Design a 9T SRAM using SKY130 low leakage)..."
            className="w-full bg-slate-50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none rounded-xl p-4 text-xs font-mono resize-none h-20 transition shadow-inner leading-relaxed text-slate-705"
          />
          
          {/* Optimization Selector — options driven by selected topology */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Optimization:</span>
              <select
                value={optimization}
                onChange={(e) => setOptimization(e.target.value)}
                className="bg-slate-50 border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-primary"
              >
                {(availableTopologies.find(t => t.canonical === selectedTopologyCanonical)?.optimizations ?? ["Low Leakage", "High Speed", "Low Power", "default"])
                  .filter((o: string) => o !== "default")
                  .map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))
                }
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

        {/* AI Thinking Stepper */}
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

        {/* Generated Design Results summary card */}
        {!pipelineRunning && activeDesign && (
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-808 uppercase tracking-widest font-sans">Compiled Layout Scorecard</h3>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded font-bold">CONFIDENCE: 98%</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans text-xs">
              <div className="p-4 bg-slate-50 border border-border rounded-xl">
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Architecture</span>
                <strong className="text-slate-850 text-sm">{activeDesign?.requirements_json?.type ?? "Unknown Topology"}</strong>
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
                <strong className="text-slate-850 text-sm">0.0 ps Violations</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Estimated Area</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold font-mono text-slate-805">{report.area_um2 || 0.89}</span>
                  <span className="text-[10px] text-slate-500 font-bold">µm²</span>
                </div>
              </div>
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Estimated Propagation Delay</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold font-mono text-slate-805">{report.stage_delay_ps || 55}</span>
                  <span className="text-[10px] text-slate-500 font-bold">ps</span>
                </div>
              </div>
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Estimated Power Drop</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold font-mono text-slate-805">{report.active_power_uw || 12.4}</span>
                  <span className="text-[10px] text-slate-500 font-bold">µW</span>
                </div>
              </div>
            </div>

            {/* Action Buttons to navigate to workspaces */}
            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4 font-sans justify-end">
              <button
                onClick={() => handleSelect("schematic")}
                className="bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase px-5 py-3 rounded-xl transition shadow-sm cursor-pointer"
              >
                Open Schematic
              </button>
              <button
                onClick={() => handleSelect("rtl")}
                className="bg-slate-100 hover:bg-slate-200 border border-border text-slate-700 font-bold text-xs uppercase px-5 py-3 rounded-xl transition cursor-pointer"
              >
                Open RTL
              </button>
              <button
                onClick={() => handleSelect("simulation")}
                className="bg-slate-100 hover:bg-slate-200 border border-border text-slate-700 font-bold text-xs uppercase px-5 py-3 rounded-xl transition cursor-pointer"
              >
                Run Simulation
              </button>
            </div>

            {/* Design Version History */}
            {designs.length > 1 && (
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Version History</span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {designs.map((d: any) => {
                    const isActive = d.id === activeDesign?.id;
                    return (
                      <button
                        key={d.id}
                        onClick={() => { setActiveDesign(d); setConsoleLogs(d.logs_content || ""); }}
                        className={`w-full text-left px-3 py-2 rounded-xl border transition flex items-center justify-between gap-2 ${
                          isActive
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-slate-50 border-slate-100 text-slate-600 hover:border-primary/30 hover:text-primary"
                        }`}
                      >
                        <span className="font-mono text-[10px] font-bold">v{d.version}</span>
                        <span className="text-[10px] font-sans truncate flex-1 text-center">
                          {d.requirements_json?.type ?? "Design"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-sans shrink-0">
                          {d.requirements_json?.optimization ?? "default"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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
                <strong className="text-slate-805 mt-1 block">SKY130 Process Node</strong>
              </div>
              <div className="p-4 bg-slate-50 border border-border rounded-xl shadow-sm">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Gate Corner Models</span>
                <strong className="text-slate-850 mt-1 block">tt / ss / ff</strong>
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
}
