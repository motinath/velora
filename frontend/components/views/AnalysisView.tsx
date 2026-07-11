"use client";

import React from "react";
import { Cpu } from "lucide-react";

export function AnalysisView() {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50/30 font-sans animate-in fade-in duration-200">
      <div className="px-8 pt-6 pb-4 flex justify-between items-center bg-white border-b border-border shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-805">Analysis</h1>
          <p className="text-xs text-slate-500 mt-1">Deep insights and advanced analysis of your design performance.</p>
        </div>
      </div>

      <div className="px-8 bg-white border-b border-border flex gap-6 text-xs text-slate-505 font-sans font-medium shrink-0">
        {["Overview", "Performance", "Power", "Timing", "Area", "Reliability", "Design Health"].map((tab, idx) => (
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

      <div className="px-8 py-4 bg-white border-b border-border flex flex-wrap gap-4 items-center justify-between text-[10px] shrink-0 font-sans font-semibold text-slate-705">
        <div className="flex flex-wrap gap-3.5">
          <div>
            <label className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Project</label>
            <select className="bg-slate-50 border border-border px-2.5 py-1.5 rounded-lg outline-none"><option>alu_32bit</option></select>
          </div>
          <div>
            <label className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Analysis Type</label>
            <select className="bg-slate-50 border border-border px-2.5 py-1.5 rounded-lg outline-none"><option>Post-Synthesis</option></select>
          </div>
          <div>
            <label className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Technology</label>
            <select className="bg-slate-50 border border-border px-2.5 py-1.5 rounded-lg outline-none"><option>SKY130A</option></select>
          </div>
          <div>
            <label className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Corner</label>
            <select className="bg-slate-50 border border-border px-2.5 py-1.5 rounded-lg outline-none"><option>TT (1.8V, 25°C)</option></select>
          </div>
          <div>
            <label className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Date/Run</label>
            <select className="bg-slate-50 border border-border px-2.5 py-1.5 rounded-lg outline-none"><option>May 30, 2025 02:45 PM</option></select>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold uppercase px-3 py-2 rounded-lg transition">Export Report</button>
          <button className="bg-primary hover:bg-primary/95 text-white font-bold uppercase px-4 py-2 rounded-lg transition shadow-sm">Share</button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-sans">
            <div className="bg-white border border-border p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-slate-400 block uppercase font-bold text-[9px]">Total Area</span>
              <strong className="text-slate-800 text-lg block font-mono">87,654.21 μm²</strong>
              <span className="text-emerald-500 font-bold text-[9px] block">▼ 3.21% vs last run</span>
            </div>
            <div className="bg-white border border-border p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-slate-400 block uppercase font-bold text-[9px]">Cell Area</span>
              <strong className="text-slate-800 text-lg block font-mono">82,112.45 μm²</strong>
              <span className="text-emerald-500 font-bold text-[9px] block">▼ 2.87% vs last run</span>
            </div>
            <div className="bg-white border border-border p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-slate-400 block uppercase font-bold text-[9px]">Total Power</span>
              <strong className="text-slate-800 text-lg block font-mono">1.283 mW</strong>
              <span className="text-rose-500 font-bold text-[9px] block">▲ 1.45% vs last run</span>
            </div>
            <div className="bg-white border border-border p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-slate-400 block uppercase font-bold text-[9px]">Performance</span>
              <strong className="text-slate-800 text-lg block font-mono">3.24 ns</strong>
              <span className="text-emerald-500 font-bold text-[9px] block">▼ 4.12% vs last run</span>
            </div>
            <div className="bg-white border border-border p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-slate-400 block uppercase font-bold text-[9px]">Power Efficiency</span>
              <strong className="text-slate-800 text-lg block font-mono">0.397 pJ/op</strong>
              <span className="text-emerald-500 font-bold text-[9px] block">▼ 2.96% vs last run</span>
            </div>
            <div className="bg-white border border-border p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-slate-400 block uppercase font-bold text-[9px]">Design Health</span>
              <strong className="text-slate-800 text-lg block font-mono">96 / 100</strong>
              <span className="text-emerald-600 font-bold text-[9px] block">Excellent</span>
            </div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm flex flex-col items-center justify-between text-center space-y-4">
            <div className="text-left w-full">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Overall Design Score</h3>
            </div>
            
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                <circle cx="50" cy="50" r="40" stroke="#2563eb" strokeWidth="10" fill="transparent" strokeDasharray="251.2" strokeDashoffset="10.05" strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black font-mono text-slate-800">96</span>
                <span className="text-[9px] text-slate-400 font-bold">/ 100</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase px-2 py-0.5 rounded font-sans">Excellent</span>
              <p className="text-[9.5px] text-slate-400 leading-relaxed font-sans font-medium pt-1">Your design quality is excellent. Minor optimizations possible for better efficiency.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Power Breakdown</h3>
            </div>
            <div className="flex items-center gap-6 py-2">
              <div className="w-24 h-24 rounded-full border-[10px] border-blue-600 relative flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-slate-800 font-mono">1.283 mW</span>
              </div>
              <div className="space-y-1.5 text-[9px] font-sans font-bold text-slate-500 flex-1">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-600" />Internal Power</span>
                  <span className="font-mono">50.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />Switching Power</span>
                  <span className="font-mono">32.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Leakage Power</span>
                  <span className="font-mono">15.4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />Clock Power</span>
                  <span className="font-mono">2.4%</span>
                </div>
              </div>
            </div>
            <button className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-205 text-slate-650 font-bold text-[9px] uppercase py-2 rounded-lg transition font-sans">View Power Report</button>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-805 uppercase tracking-wider">Timing Summary</h3>
            </div>
            <div className="space-y-3.5 py-1 text-[9px] font-sans font-bold text-slate-505">
              <div className="space-y-1">
                <div className="flex justify-between"><span>Worst Negative Slack (WNS)</span><span className="text-emerald-600 font-mono">+0.842 ns</span></div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative"><div className="bg-emerald-500 h-full rounded-full" style={{ width: "80%" }} /></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between"><span>Total Negative Slack (TNS)</span><span className="text-emerald-600 font-mono">0.000 ns</span></div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative"><div className="bg-emerald-500 h-full rounded-full" style={{ width: "100%" }} /></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between"><span>Worst Slack</span><span className="text-emerald-600 font-mono">+0.842 ns</span></div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative"><div className="bg-emerald-500 h-full rounded-full" style={{ width: "80%" }} /></div>
              </div>
            </div>
            <button className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-205 text-slate-655 font-bold text-[9px] uppercase py-2 rounded-lg transition font-sans">View Timing Report</button>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-805 uppercase tracking-wider">Area Utilization</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 text-[9px] font-sans font-bold text-white leading-none">
              <div className="col-span-2 p-3 bg-blue-600 rounded-lg flex flex-col justify-between h-[80px]">
                <span>Standard Cells</span>
                <span className="font-mono text-xs">68.2%</span>
              </div>
              <div className="p-3 bg-indigo-500 rounded-lg flex flex-col justify-between h-[80px]">
                <span>I/O Cells</span>
                <span className="font-mono text-xs">15.6%</span>
              </div>
              <div className="p-2.5 bg-amber-500 rounded-lg flex flex-col justify-between h-[60px] text-slate-900">
                <span>Memory</span>
                <span className="font-mono text-xs">8.7%</span>
              </div>
              <div className="p-2.5 bg-rose-500 rounded-lg flex flex-col justify-between h-[60px]">
                <span>Clock</span>
                <span className="font-mono text-xs">4.5%</span>
              </div>
              <div className="p-2.5 bg-emerald-500 rounded-lg flex flex-col justify-between h-[60px]">
                <span>Others</span>
                <span className="font-mono text-xs">3.0%</span>
              </div>
            </div>
            <button className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-205 text-slate-655 font-bold text-[9px] uppercase py-2 rounded-lg transition font-sans">View Area Report</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Design Hotspots</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[9px] uppercase font-bold">
                    <th className="p-3">Type</th>
                    <th className="p-3">Instance / Net</th>
                    <th className="p-3">Metric</th>
                    <th className="p-3">Value</th>
                    <th className="p-3">% of Total</th>
                    <th className="p-3">Impact</th>
                    <th className="p-3">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    { type: "Timing", net: "alu_top/U32/UADDER/CARRY[31]", metric: "Delay", val: "1.246 ns", pct: "13.6%", impact: "High", impBadge: "bg-rose-50 text-rose-600 border-rose-100", rec: "Optimize logic / Buffering" },
                    { type: "Power", net: "alu_top/U32/REG_FILE", metric: "Power", val: "0.358 mW", pct: "27.8%", impact: "High", impBadge: "bg-rose-50 text-rose-600 border-rose-100", rec: "Clock gating / Operand isolation" },
                    { type: "Leakage", net: "alu_top/U32/UADDER", metric: "Leakage", val: "0.142 mW", pct: "71.7%", impact: "Medium", impBadge: "bg-amber-50 text-amber-650 border-amber-100", rec: "Multi-Vt / Cell resizing" },
                    { type: "Area", net: "alu_top/U32/SHIFTER", metric: "Area", val: "12,452.11 μm²", pct: "14.2%", impact: "Medium", impBadge: "bg-amber-50 text-amber-650 border-amber-100", rec: "Logic optimization" },
                    { type: "Routing", net: "alu_top/net_24567", metric: "Congestion", val: "78.4%", pct: "N/A", impact: "Low", impBadge: "bg-slate-100 text-slate-550 border-slate-200", rec: "Re-route / Layer adjustment" }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition text-[10.5px]">
                      <td className="p-3 font-semibold text-slate-500">{row.type}</td>
                      <td className="p-3 font-mono font-semibold text-slate-805 truncate max-w-[140px]" title={row.net}>{row.net}</td>
                      <td className="p-3 text-slate-400">{row.metric}</td>
                      <td className="p-3 font-mono text-slate-700 font-bold">{row.val}</td>
                      <td className="p-3 font-mono text-slate-500">{row.pct}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded border text-[8.5px] font-bold uppercase tracking-wider ${row.impBadge}`}>{row.impact}</span></td>
                      <td className="p-3 font-semibold text-slate-650 font-sans">{row.rec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-808 uppercase tracking-wider border-b border-slate-100 pb-2">Optimization Suggestions</h3>
            <div className="space-y-3.5 text-[10px] font-sans font-bold text-slate-755">
              {[
                { title: "Reduce leakage power by resizing high leakage cells", level: "High", badge: "bg-rose-50 text-rose-600 border-rose-100" },
                { title: "Optimize critical path in alu_top.gds:3412", level: "Medium", badge: "bg-amber-50 text-amber-650 border-amber-100" },
                { title: "Consider upsizing drivers on long nets", level: "Medium", badge: "bg-amber-50 text-amber-650 border-amber-100" },
                { title: "Clock gating can save ~12% total power", level: "Low", badge: "bg-slate-100 text-slate-550 border-slate-200" }
              ].map((s, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-primary/20 transition flex justify-between items-start gap-3">
                  <span className="font-sans leading-relaxed text-slate-655 flex-1">{s.title}</span>
                  <span className={`px-1.5 py-0.5 rounded border text-[8px] tracking-wider uppercase font-bold shrink-0 mt-0.5 ${s.badge}`}>{s.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
