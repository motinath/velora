"use client";

import React from "react";

export function VerificationView() {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50/30 font-sans animate-in fade-in duration-200">
      <div className="px-8 pt-6 pb-4 flex justify-between items-center bg-white border-b border-border shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Verification</h1>
          <p className="text-xs text-slate-500 mt-1">Run verification checks and ensure design correctness before tapeout.</p>
        </div>
        <button onClick={() => alert("Verification check started...")} className="bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase px-5 py-3 rounded-xl transition shadow-sm cursor-pointer">Run Verification</button>
      </div>

      <div className="px-8 bg-white border-b border-border flex gap-6 text-xs text-slate-505 font-sans font-medium shrink-0">
        {["Overview", "DRC", "LVS", "ERC", "Lint", "Formal", "Assertions", "Coverage"].map((tab, idx) => (
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

      <div className="px-8 py-4 bg-white border-b border-border flex flex-wrap gap-4 items-center justify-between text-[10px] shrink-0 font-sans font-semibold text-slate-700">
        <div className="flex flex-wrap gap-3.5">
          <div>
            <label className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Project</label>
            <select className="bg-slate-50 border border-border px-2.5 py-1.5 rounded-lg outline-none"><option>alu_32bit</option></select>
          </div>
          <div>
            <label className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Top Module</label>
            <select className="bg-slate-50 border border-border px-2.5 py-1.5 rounded-lg outline-none"><option>alu_32bit</option></select>
          </div>
          <div>
            <label className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Technology</label>
            <select className="bg-slate-50 border border-border px-2.5 py-1.5 rounded-lg outline-none"><option>SKY130</option></select>
          </div>
          <div>
            <label className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Rule Deck</label>
            <select className="bg-slate-50 border border-border px-2.5 py-1.5 rounded-lg outline-none"><option>sky130A</option></select>
          </div>
          <div>
            <label className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Last Run</label>
            <select className="bg-slate-50 border border-border px-2.5 py-1.5 rounded-lg outline-none"><option>May 30, 2025 02:45 PM</option></select>
          </div>
          <div>
            <label className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Run By</label>
            <select className="bg-slate-50 border border-border px-2.5 py-1.5 rounded-lg outline-none"><option>Motinath</option></select>
          </div>
          <div>
            <label className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Status</label>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-2.5 py-1 rounded-lg mt-0.5 font-sans uppercase">● Completed</span>
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs font-sans">
            <div className="bg-white border border-border p-4.5 rounded-2xl shadow-sm space-y-1">
              <span className="text-slate-400 block uppercase font-bold text-[8.5px]">DRC Status</span>
              <strong className="text-slate-800 text-lg font-mono font-black block">0 <span className="text-xs text-amber-500 font-bold">/ 145</span></strong>
              <span className="text-amber-500 font-bold text-[8.5px]">Warnings</span>
            </div>
            <div className="bg-white border border-border p-4.5 rounded-2xl shadow-sm space-y-1">
              <span className="text-slate-400 block uppercase font-bold text-[8.5px]">LVS Status</span>
              <strong className="text-slate-800 text-lg font-mono font-black block">0 <span className="text-xs text-amber-500 font-bold">/ 12</span></strong>
              <span className="text-amber-500 font-bold text-[8.5px]">Warnings</span>
            </div>
            <div className="bg-white border border-border p-4.5 rounded-2xl shadow-sm space-y-1">
              <span className="text-slate-400 block uppercase font-bold text-[8.5px]">ERC Status</span>
              <strong className="text-slate-800 text-lg font-mono font-black block">0 <span className="text-xs text-amber-500 font-bold">/ 8</span></strong>
              <span className="text-amber-500 font-bold text-[8.5px]">Warnings</span>
            </div>
            <div className="bg-white border border-border p-4.5 rounded-2xl shadow-sm space-y-1">
              <span className="text-slate-400 block uppercase font-bold text-[8.5px]">Lint Status</span>
              <strong className="text-slate-800 text-lg font-mono font-black block">0 <span className="text-xs text-amber-500 font-bold">/ 23</span></strong>
              <span className="text-amber-500 font-bold text-[8.5px]">Warnings</span>
            </div>
            <div className="bg-white border border-border p-4.5 rounded-2xl shadow-sm space-y-1">
              <span className="text-emerald-500 block uppercase font-bold text-[8.5px]">Formal Status</span>
              <strong className="text-emerald-600 text-lg font-mono font-black block">12</strong>
              <span className="text-emerald-500 font-bold text-[8.5px]">Passed</span>
            </div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase border-b border-slate-100 pb-2 tracking-wide">Verification Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[9px] uppercase font-bold">
                    <th className="p-3">Check</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Errors</th>
                    <th className="p-3">Warnings</th>
                    <th className="p-3">Run Time</th>
                    <th className="p-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                  {[
                    { name: "DRC", status: "Passed", err: "0", warn: "145", time: "00:01:24" },
                    { name: "LVS", status: "Passed", err: "0", warn: "12", time: "00:00:48" },
                    { name: "ERC", status: "Passed", err: "0", warn: "8", time: "00:00:36" },
                    { name: "Lint", status: "Passed", err: "0", warn: "23", time: "00:00:52" },
                    { name: "Formal Verification", status: "Passed", err: "0", warn: "0", time: "00:02:18" },
                    { name: "Assertions", status: "Passed", err: "0", warn: "2", time: "00:00:22" },
                    { name: "Coverage", status: "Passed", err: "0", warn: "0", time: "00:01:05" }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 font-bold text-slate-800">{row.name}</td>
                      <td className="p-3"><span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-2 py-0.5 rounded text-[8.5px] uppercase">Passed</span></td>
                      <td className="p-3 font-mono">{row.err}</td>
                      <td className="p-3 font-mono text-amber-600 font-bold">{row.warn}</td>
                      <td className="p-3 font-mono text-slate-500">{row.time}</td>
                      <td className="p-3 text-right"><span onClick={() => alert(`${row.name} report details...`)} className="text-primary hover:underline cursor-pointer font-bold text-[9px] uppercase">View Report</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Issues</h3>
              <span className="text-slate-400 font-bold text-[10px]">Filter by type</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[9px] uppercase font-bold">
                    <th className="p-3">Type</th>
                    <th className="p-3">Check</th>
                    <th className="p-3">Message</th>
                    <th className="p-3">Location</th>
                    <th className="p-3 text-right">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    { type: "DRC", check: "MinWidth", msg: "Metal1 width 0.12/um is less than minimum 0.15/um", loc: "alu_32bit/layout/alu_top.gds:3421", badge: "bg-amber-50 text-amber-600 border-amber-100" },
                    { type: "DRC", check: "MinSpacing", msg: "Metal1 spacing 0.11/um is less than minimum 0.14/um", loc: "alu_32bit/layout/alu_top.gds:3456", badge: "bg-amber-50 text-amber-600 border-amber-100" },
                    { type: "ERC", check: "UnconnectedPin", msg: "Pin VDD of instance U12 is unconnected", loc: "alu_32bit/schematic/alu_top.sch:178", badge: "bg-amber-50 text-amber-600 border-amber-100" },
                    { type: "Lint", check: "UnusedSignal", msg: "Signal 'temp_reg' is declared but never used", loc: "alu_32bit/rtl/alu_control.sv:215", badge: "bg-amber-50 text-amber-600 border-amber-100" },
                    { type: "Lint", check: "AlwaysBlockLatch", msg: "Latch inferred in always block", loc: "alu_32bit/rtl/alu_datapath.sv:98", badge: "bg-amber-50 text-amber-600 border-amber-100" }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition text-[10.5px]">
                      <td className="p-3 font-bold text-primary">{row.type}</td>
                      <td className="p-3 text-slate-500 font-semibold">{row.check}</td>
                      <td className="p-3 text-slate-600">{row.msg}</td>
                      <td className="p-3 font-mono font-semibold text-slate-500 truncate max-w-[150px]" title={row.loc}>{row.loc}</td>
                      <td className="p-3 text-right"><span className={`px-2 py-0.5 rounded border text-[8px] font-bold uppercase tracking-wider ${row.badge}`}>Warning</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm flex flex-col items-center justify-between text-center space-y-4">
            <div className="text-left w-full">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Overall Quality</h3>
            </div>
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="10" fill="transparent" strokeDasharray="251.2" strokeDashoffset="0" strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black font-mono text-emerald-600">100%</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Passed</span>
              </div>
            </div>
            <div className="space-y-1.5 text-[9.5px] font-sans font-bold text-slate-600 w-full text-left">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Passed checks</span>
                <span className="font-mono text-slate-800">7</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Warnings</span>
                <span className="font-mono text-slate-800">190</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />Failed checks</span>
                <span className="font-mono text-slate-800">0</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Quality Metrics</h3>
            <div className="space-y-3.5 text-[10px] text-slate-600 font-sans font-medium">
              <div className="flex justify-between border-b border-slate-50 pb-2.5">
                <span>Total Checks</span>
                <strong className="text-slate-800">7</strong>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2.5">
                <span>Total Errors</span>
                <strong className="text-slate-800">0</strong>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2.5">
                <span>Total Warnings</span>
                <strong className="text-slate-800">190</strong>
              </div>
              <div className="flex justify-between">
                <span>Run Time</span>
                <strong className="text-slate-850 font-mono">00:06:25</strong>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Recent Runs</h3>
            <div className="space-y-3.5 text-[10px] text-slate-700 font-sans font-medium">
              {[
                { date: "May 30, 2025 02:45 PM", status: "Completed" },
                { date: "May 30, 2025 11:32 AM", status: "Completed" },
                { date: "May 28, 2025 10:15 PM", status: "Completed" }
              ].map((run, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="font-mono text-slate-500 text-[9px]">{run.date}</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider">{run.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-805 uppercase tracking-wider border-b border-slate-100 pb-2">Reports</h3>
            <div className="space-y-3.5 text-[10px] text-slate-700 font-sans font-medium">
              {[
                { name: "drc_report.html", time: "186 KB" },
                { name: "lvs_report.html", time: "142 KB" },
                { name: "erc_report.html", time: "98 KB" },
                { name: "lint_report.html", time: "121 KB" },
                { name: "formal_report.html", time: "210 KB" }
              ].map((r, idx) => (
                <div key={idx} className="flex justify-between items-center cursor-pointer hover:text-primary transition">
                  <span>{r.name}</span>
                  <span className="text-slate-400 font-mono text-[9px]">{r.time} 📥</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
