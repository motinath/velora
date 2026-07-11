"use client";

import React from "react";
import { useAppContext } from "../../app/providers";
import { SimulationScope } from "../workspace/SimulationScope";
import { Info, CheckCircle } from "lucide-react";

export function SimulationView() {
  const {
    activeProject,
    activeDesign,
    probedSignals,
    handleSignalProbeToggle,
    isOptimized,
    runSizingOptimization
  } = useAppContext();

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
          <h1 className="text-xl font-bold tracking-tight text-slate-805 font-sans">Simulation Workspace</h1>
          <p className="text-xs text-slate-500 mt-1">Configure parameters and plot transient/DC response curves.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-border">
          <button className="bg-white text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">Transient</button>
          <button className="text-slate-550 px-3 py-1.5 text-xs font-bold">DC Sweep</button>
          <button className="text-slate-550 px-3 py-1.5 text-xs font-bold">AC Analysis</button>
        </div>
      </div>

      {/* Oscilloscope Canvas */}
      <div className="flex-1 min-h-[350px]">
        {/* Signal probe toggles — derived from actual waveform data */}
        {activeDesign?.simulation_results_json?.waveforms && (
          <div className="flex flex-wrap gap-2 px-2 pb-3">
            <span className="text-[9px] font-bold text-slate-400 uppercase self-center">Probes:</span>
            {Object.keys(activeDesign.simulation_results_json.waveforms)
              .filter((k: string) => k !== "x")
              .map((sig: string) => {
                const label = sig.replace(/^y_/, "");
                const active = probedSignals.includes(sig);
                return (
                  <button
                    key={sig}
                    onClick={() => handleSignalProbeToggle(sig)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border transition ${
                      active
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-slate-100 text-slate-550 border-slate-200 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
          </div>
        )}
        <SimulationScope
          activeDesign={activeDesign}
          probedSignals={probedSignals}
          onToggleProbe={handleSignalProbeToggle}
        />
      </div>

      {/* AI Suggestions & Sizing Optimization Comparison */}
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
}
