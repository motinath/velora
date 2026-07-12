"use client";

import React from "react";

export function SettingsView() {
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
}
