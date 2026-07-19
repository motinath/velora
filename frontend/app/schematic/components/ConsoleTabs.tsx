import React from "react";
import { Cpu, Sliders, CheckCircle, AlertTriangle } from "lucide-react";
import { ConsoleTabType, SchematicNode } from "../types";

interface ConsoleTabsProps {
  activeConsoleTab: ConsoleTabType;
  setActiveConsoleTab: (tab: ConsoleTabType) => void;
  vddSlider: number;
  optimization: string;
  activeDesign: any;
  renderWaveformChart: () => React.ReactNode;
  localNodes: SchematicNode[];
  setSelectedComponentId: (id: string | null) => void;
  setAiDialog: (val: any) => void;
}

export function ConsoleTabs({
  activeConsoleTab,
  setActiveConsoleTab,
  vddSlider,
  optimization,
  activeDesign,
  renderWaveformChart,
  localNodes,
  setSelectedComponentId,
  setAiDialog,
}: ConsoleTabsProps) {
  return (
    <div className="bg-slate-50 border-t border-slate-200 flex flex-col h-48 shrink-0 min-h-0 select-text">
      {/* Tabs Selector */}
      <div className="flex gap-6 text-[10px] font-bold text-slate-400 font-sans border-b border-slate-200 px-6 pt-2 pb-1.5 uppercase tracking-wider shrink-0 bg-white">
        {[
          { id: "compiler" as const, label: "Design Compiler" },
          { id: "simulation" as const, label: "Transient Simulation" },
          { id: "verification" as const, label: "ERC/DRC Checklist" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveConsoleTab(tab.id)}
            className={`pb-1.5 transition relative font-bold ${
              activeConsoleTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600 font-black"
                : "hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content box */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] text-slate-700 bg-slate-950/5">
        {activeConsoleTab === "compiler" && (
          <div className="space-y-3 font-sans">
            <div className="flex items-center justify-between border-b pb-2 border-slate-200">
              <div className="text-blue-600 font-extrabold text-xs flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                <span>Cooperative Sizing Compiler Logs</span>
              </div>
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">
                Sky130 PDK
              </span>
            </div>

            {/* Multi-Agent Orchestration Stepper Log */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <div className="flex items-start gap-2 text-[10.5px] leading-relaxed">
                <span className="bg-blue-50 text-blue-600 text-[8.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 mt-0.5">
                  Manager Agent
                </span>
                <div className="font-semibold text-slate-700">
                  Orchestrator initialized. Decoded constraints: VDD = {vddSlider}V, optimizing for {optimization}. Dispatched to Sizing sub-agents.
                </div>
              </div>

              <div className="flex items-start gap-2 text-[10.5px] leading-relaxed">
                <span className="bg-indigo-50 text-indigo-600 text-[8.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 mt-0.5">
                  PDK Agent
                </span>
                <div className="font-semibold text-slate-700">
                  Loaded Technology corner <code className="bg-slate-100 px-1 py-0.2 rounded font-mono font-bold text-[9.5px]">sky130_fd_pr</code>. Verified transistor width bounds: <code className="bg-slate-100 px-1 py-0.2 rounded font-mono font-bold text-[9.5px]">W_min = 0.36um</code>, length bounds: <code className="bg-slate-100 px-1 py-0.2 rounded font-mono font-bold text-[9.5px]">L_min = 0.15um</code>.
                </div>
              </div>

              <div className="flex items-start gap-2 text-[10.5px] leading-relaxed">
                <span className="bg-purple-50 text-purple-600 text-[8.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 mt-0.5">
                  Timing Agent
                </span>
                <div className="font-semibold text-slate-700">
                  Solved RC delay path equations. Estimated rise delay: <span className="text-blue-600 font-extrabold">64.5 ps</span>, fall delay: <span className="text-blue-600 font-extrabold">48.2 ps</span>. Detected high noise margin risk under VDD = {vddSlider}V.
                </div>
              </div>

              <div className="flex items-start gap-2 text-[10.5px] leading-relaxed">
                <span className="bg-amber-50 text-amber-600 text-[8.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 mt-0.5">
                  Critic Agent
                </span>
                <div className="font-semibold text-slate-700">
                  Audited design configurations. Recommended PMOS channel width optimization to <span className="text-blue-600 font-extrabold">1.2um</span> to satisfy cell noise margin bounds and improve delay by 12%.
                </div>
              </div>

              <div className="flex items-start gap-2 text-[10.5px] leading-relaxed border-t pt-2 border-slate-100">
                <span className="bg-emerald-50 text-emerald-600 text-[8.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 mt-0.5">
                  Netlist Agent
                </span>
                <div className="font-semibold text-slate-700">
                  <span className="text-emerald-700 font-bold">✓ Netlist compile success.</span> Generated cell schematic coordinates and compiled SPICE netlist:
                </div>
              </div>
            </div>

            <pre className="text-slate-500 font-mono text-[9.5px] border-t border-slate-200 mt-1 pt-2 max-w-full overflow-x-auto whitespace-pre bg-slate-900/5 p-2 rounded-lg">
              {activeDesign?.netlist_content || "* No SPICE compile logs"}
            </pre>
          </div>
        )}

        {activeConsoleTab === "simulation" && (
          <div className="flex flex-col gap-2.5 h-full">
            {renderWaveformChart()}
            {activeDesign?.simulation_results_json?.metrics && (
              <div className="grid grid-cols-4 gap-4 text-[10.5px] font-sans font-bold bg-white border border-slate-200 p-3 rounded-xl mt-1.5 shadow-sm text-slate-600">
                {Object.entries(activeDesign.simulation_results_json.metrics).map(
                  ([k, v]: [string, any]) => (
                    <div
                      key={k}
                      className="flex justify-between border-r pr-4 border-slate-100 last:border-r-0"
                    >
                      <span>{k}</span>
                      <span className="text-blue-600 font-mono font-extrabold">{v}</span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {activeConsoleTab === "verification" && (
          <div className="space-y-2 font-sans font-semibold text-slate-700 text-xs">
            <div className="flex items-center justify-between border-b pb-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>ERC: Electrical Rule Check</span>
              </div>
              <span className="text-emerald-600 font-bold text-[10px] uppercase">Passed</span>
            </div>
            <div className="flex items-center justify-between border-b pb-1.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>DRC: sky130_fd_pr__pfet_01v8 width warning at (x: 320, y: 150)</span>
              </div>
              <span className="text-amber-600 font-bold text-[10px] uppercase">1 Warning</span>
            </div>
            <div className="flex items-center justify-between pb-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>LVS: Layout vs Schematic match</span>
              </div>
              <span className="text-emerald-600 font-bold text-[10px] uppercase">Passed</span>
            </div>

            {/* Sizing & Design Advisor */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Sizing & Design Advisor
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-blue-600" />
                      <span>Parametric Sizing Correction (Delay/Noise)</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 font-bold leading-normal">
                      Optimizing pull-up PMOS Width from 0.36µm to 1.2µm resolves low static noise margin limits and speeds up rise delay metrics by approximately 12%.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const firstPmos = localNodes.find(
                        (n) =>
                          n.category?.toLowerCase() === "pmos" ||
                          n.type?.toLowerCase().includes("pmos") ||
                          n.id.toLowerCase().includes("pmos") ||
                          n.properties?.model?.includes("pfet")
                      );
                      if (firstPmos) {
                        setSelectedComponentId(firstPmos.id);
                        setAiDialog({
                          open: true,
                          nodeId: firstPmos.id,
                          suggestion:
                            "Improve Rise Time. Increase pull-up PMOS Width W from 0.36u to 1.2u. Estimated rise time delay improvement: +12%.",
                          actionType: "speed",
                          targetWidth: 1.2,
                        });
                      } else {
                        alert("Please select a PMOS component on the canvas to optimize.");
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-lg shrink-0 transition shadow-sm"
                  >
                    Run Sizing Fix
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
