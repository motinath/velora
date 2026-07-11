"use client";

import React from "react";
import { FileText } from "lucide-react";

export function ReportsView() {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50/30 font-sans animate-in fade-in duration-200">
      <div className="px-8 pt-6 pb-4 flex justify-between items-center bg-white border-b border-border shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Reports</h1>
          <p className="text-xs text-slate-500 mt-1">View, analyze and export detailed reports for your designs.</p>
        </div>
      </div>

      <div className="px-8 bg-white border-b border-border flex gap-6 text-xs text-slate-505 font-sans font-medium shrink-0">
        {["All Reports", "Simulation", "Verification", "Synthesis", "Power", "Timing", "DRC/LVS", "Custom"].map((tab, idx) => (
          <span
            key={tab}
            className={`py-3.5 cursor-pointer border-b-2 font-bold ${
              idx === 0 ? "border-primary text-primary font-black" : "border-transparent hover:text-slate-800"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="px-8 py-4 bg-white border-b border-border flex flex-wrap gap-4 items-center justify-between text-[10px] shrink-0">
        <div className="flex flex-wrap gap-3.5 font-sans font-semibold text-slate-700">
          <div>
            <label className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Project</label>
            <select className="bg-slate-50 border border-border px-2.5 py-1.5 rounded-lg outline-none"><option>alu_32bit</option></select>
          </div>
          <div>
            <label className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Report Type</label>
            <select className="bg-slate-50 border border-border px-2.5 py-1.5 rounded-lg outline-none"><option>All Types</option></select>
          </div>
          <div>
            <label className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Module</label>
            <select className="bg-slate-50 border border-border px-2.5 py-1.5 rounded-lg outline-none"><option>All Modules</option></select>
          </div>
          <div>
            <label className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Date Range</label>
            <select className="bg-slate-50 border border-border px-2.5 py-1.5 rounded-lg outline-none"><option>May 23, 2025 - May 30, 2025</option></select>
          </div>
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="Search reports..." className="bg-slate-50 border border-border px-3 py-1.5 rounded-lg text-[10px] outline-none" />
          <button className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold uppercase px-3 py-1.5 rounded-lg transition">Clear</button>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-805 border-b border-slate-100 pb-2 uppercase tracking-wide">Reports (15)</h3>
          <div className="space-y-3 text-[10.5px]">
            {[
              { name: "synthesis_report.html", type: "SYNTHESIS", size: "245 KB", badge: "bg-blue-50 text-primary border-blue-100" },
              { name: "timing_report.html", type: "TIMING", size: "186 KB", badge: "bg-indigo-50 text-indigo-650 border-indigo-100" },
              { name: "power_report.html", type: "POWER", size: "172 KB", badge: "bg-amber-50 text-amber-650 border-amber-100" },
              { name: "drc_report.html", type: "DRC", size: "98 KB", badge: "bg-emerald-50 text-emerald-650 border-emerald-100" },
              { name: "lvs_report.html", type: "LVS", size: "142 KB", badge: "bg-purple-50 text-purple-650 border-purple-100" },
              { name: "simulation_report.html", type: "SIMULATION", size: "210 KB", badge: "bg-rose-50 text-rose-650 border-rose-100" }
            ].map((rep, idx) => (
              <div key={idx} className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition ${idx === 0 ? 'bg-primary/5 border-primary text-primary font-bold shadow-sm' : 'border-slate-100 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-2 max-w-[140px] truncate font-sans">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{rep.name}</span>
                </div>
                <div className="flex gap-2 items-center text-[8.5px] shrink-0 font-mono">
                  <span className={`px-1.5 py-0.5 rounded border font-bold uppercase ${rep.badge}`}>{rep.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-805 uppercase tracking-wide">Report Preview</h3>
            <div className="flex gap-2">
              <button className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-[9.5px] font-bold uppercase px-3 py-1 rounded transition">Download</button>
              <button className="bg-primary hover:bg-primary/95 text-white text-[9.5px] font-bold uppercase px-3 py-1 rounded transition">Open in New Tab</button>
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-8 rounded-2xl shadow-inner space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded text-white flex items-center justify-center font-bold">V</div>
                <div>
                  <h2 className="text-sm font-black tracking-tight text-slate-805 leading-none">VELORA</h2>
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-1">AI Chip Copilot</span>
                </div>
              </div>
              <div className="text-right text-[9px] text-slate-455 font-mono leading-relaxed">
                <p>Generated on: May 30, 2025 02:45 PM</p>
                <p>Tool: Yosys 0.34+abc</p>
                <p>Technology: SKY130A</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Synthesis Report</h3>
              <p className="text-[11px] text-slate-500 font-mono mt-1">Design Unit: alu_32bit</p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-[10px] border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-505 font-bold">
                    <th className="p-2.5">Metrics</th>
                    <th className="p-2.5">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                  <tr><td className="p-2.5 font-sans font-semibold text-slate-500">Design Top Module</td><td className="p-2.5 text-slate-800 font-bold">alu_32bit</td></tr>
                  <tr><td className="p-2.5 font-sans font-semibold text-slate-500">Total Cells</td><td className="p-2.5 text-slate-800 font-bold">1,248</td></tr>
                  <tr><td className="p-2.5 font-sans font-semibold text-slate-500">Combinational Cells</td><td className="p-2.5 text-slate-800 font-bold">987</td></tr>
                  <tr><td className="p-2.5 font-sans font-semibold text-slate-500">Total Area</td><td className="p-2.5 text-slate-800 font-bold">87,654.21 μm²</td></tr>
                  <tr><td className="p-2.5 font-sans font-semibold text-slate-500">Total Power</td><td className="p-2.5 text-slate-800 font-bold">1.283 mW</td></tr>
                  <tr><td className="p-2.5 font-sans font-semibold text-slate-500">Worst Slack (WNS)</td><td className="p-2.5 text-emerald-600 font-bold">+0.842 ns</td></tr>
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 pt-4 flex items-center justify-between gap-6 text-[10px] font-sans">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-4 border-primary relative flex items-center justify-center shrink-0">
                  <span className="text-[8px] font-bold font-mono">68.2%</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Area Utilization</h4>
                  <p className="text-[8.5px] text-slate-500 mt-0.5">Combinational logic occupies majority footprint.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-500 relative flex items-center justify-center shrink-0">
                  <span className="text-[8px] font-bold font-mono">15.6%</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">I/O Utilization</h4>
                  <p className="text-[8.5px] text-slate-500 mt-0.5">Pad rings match technology limits.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Report Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-center font-sans text-xs">
              <div className="p-4 bg-slate-55 border border-slate-100 rounded-xl">
                <span className="text-slate-400 block uppercase font-bold text-[8.5px] mb-1">Total Reports</span>
                <strong className="text-slate-800 text-lg font-black font-mono">15</strong>
              </div>
              <div className="p-4 bg-slate-55 border border-slate-100 rounded-xl">
                <span className="text-emerald-500 block uppercase font-bold text-[8.5px] mb-1">Successful</span>
                <strong className="text-emerald-605 text-lg font-black font-mono">15</strong>
              </div>
              <div className="p-4 bg-slate-55 border border-slate-100 rounded-xl">
                <span className="text-amber-500 block uppercase font-bold text-[8.5px] mb-1">Warnings</span>
                <strong className="text-amber-600 text-lg font-black font-mono">0</strong>
              </div>
              <div className="p-4 bg-slate-55 border border-slate-100 rounded-xl">
                <span className="text-rose-500 block uppercase font-bold text-[8.5px] mb-1">Failed</span>
                <strong className="text-rose-600 text-lg font-black font-mono">0</strong>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Quick Downloads</h3>
            <div className="space-y-3.5 text-[10px] text-slate-700 font-sans font-medium">
              {["All Reports (ZIP)", "Synthesis Reports", "Timing Reports", "Power Reports", "Verification Reports"].map((d, idx) => (
                <div key={idx} className="flex justify-between items-center cursor-pointer hover:text-primary transition">
                  <span>{d}</span>
                  <span className="text-slate-400 text-[8.5px] font-mono">{idx === 0 ? "2.45 MB" : "186 KB"} 📥</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Recent Reports</h3>
            <div className="space-y-3.5 text-[10px] text-slate-700 font-sans font-medium">
              {[
                { name: "synthesis_report.html", time: "May 30, 2025 02:45 PM" },
                { name: "timing_report.html", time: "May 30, 2025 02:45 PM" },
                { name: "power_report.html", time: "May 30, 2025 02:45 PM" }
              ].map((r, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="font-bold text-slate-800 block">{r.name}</span>
                  <span className="text-slate-400 font-mono text-[8.5px] block">{r.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
