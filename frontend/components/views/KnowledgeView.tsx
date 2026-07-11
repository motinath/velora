"use client";

import React from "react";
import { Search, Cpu, FileText, ChevronRight } from "lucide-react";

export function KnowledgeView() {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50/30 font-sans animate-in fade-in duration-200 select-text">
      <div className="px-8 pt-6 pb-4 flex justify-between items-center bg-white border-b border-border shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-805">Knowledge Hub</h1>
          <p className="text-xs text-slate-505 mt-1">Your central hub for learning, documentation, and semiconductor design knowledge.</p>
        </div>
      </div>

      <div className="px-8 bg-white border-b border-border flex gap-6 text-xs text-slate-505 font-sans font-medium shrink-0">
        {["Explore", "My Library", "Bookmarks", "Recently Viewed", "Collections"].map((tab, idx) => (
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

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border p-4 rounded-2xl shadow-sm space-y-3.5">
            <div className="w-full bg-slate-50 border border-border rounded-xl flex items-center px-3 py-1 shadow-inner">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input type="text" placeholder="Search documents, guides, topics, or ask a question..." className="flex-1 bg-transparent text-xs text-slate-800 outline-none py-2.5" />
              <button className="bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg transition">Search</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-[10px]">
              <select className="bg-slate-50 border border-border p-2 rounded-lg text-slate-700 outline-none">
                <option>All Content</option>
              </select>
              <select className="bg-slate-50 border border-border p-2 rounded-lg text-slate-700 outline-none">
                <option>All Topics</option>
              </select>
              <select className="bg-slate-50 border border-border p-2 rounded-lg text-slate-700 outline-none">
                <option>All Technologies</option>
              </select>
              <select className="bg-slate-50 border border-border p-2 rounded-lg text-slate-700 outline-none">
                <option>All Types</option>
              </select>
              <button className="border border-slate-200 hover:bg-slate-50 text-slate-750 font-bold p-2 rounded-lg transition uppercase">Filters</button>
            </div>
          </div>

          <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 p-8 rounded-3xl text-white relative shadow-sm overflow-hidden flex flex-col justify-between h-[200px] border border-slate-800">
            <div className="space-y-2 max-w-sm z-10 font-sans">
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block">Featured Guide</span>
              <h3 className="text-lg font-black tracking-tight leading-snug">Getting Started with VELORA</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans font-medium">A step-by-step guide to design your first chip using VELORA AI Copilot.</p>
            </div>
            <div className="flex justify-between items-center z-10 pt-4">
              <button className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-[10px] uppercase px-5 py-2.5 rounded-lg transition">Read Guide</button>
              <span className="text-[10px] text-slate-400 font-mono">1 / 5</span>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
              <Cpu className="w-56 h-56" />
            </div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-808 uppercase tracking-wider">Recent Documents</h3>
              <span className="text-primary font-bold text-[10px] cursor-pointer hover:underline uppercase font-sans">View All</span>
            </div>
            <div className="space-y-3.5 text-xs text-slate-700">
              {[
                { name: "SkyWater SKY130 Design Rules", tech: "SKY130", type: "PDF", ver: "v2.1", date: "May 28, 2025", size: "2.4 MB", badge: "bg-blue-50 text-primary border-blue-100" },
                { name: "Verilog HDL Reference Guide", tech: "RTL", type: "Verilog", ver: "Guide", date: "May 26, 2025", size: "1.8 MB", badge: "bg-slate-100 text-slate-650 border-slate-200" },
                { name: "Timing Analysis with PrimeTime", tech: "STA", type: "Synopsys", ver: "Tutorial", date: "May 24, 2025", size: "3.2 MB", badge: "bg-indigo-50 text-indigo-600 border-indigo-100" },
                { name: "UVM Testbench Architecture", tech: "Verification", type: "UVM", ver: "PDF", date: "May 23, 2025", size: "1.6 MB", badge: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                { name: "Low Power Design Techniques", tech: "Low Power", type: "Design", ver: "Guide", date: "May 22, 2025", size: "2.1 MB", badge: "bg-amber-50 text-amber-600 border-amber-100" }
              ].map((doc, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 hover:bg-slate-50/50 rounded-xl border border-slate-100 gap-3 transition">
                  <div className="flex items-center gap-3 font-sans">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-800">{doc.name}</h4>
                      <div className="flex gap-2 mt-1.5 font-mono text-[9px]">
                        <span className={`px-1.5 py-0.5 rounded border font-bold uppercase ${doc.badge}`}>{doc.tech}</span>
                        <span className="text-slate-400 uppercase">{doc.type}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-400">{doc.ver}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 text-[10px] text-slate-400 font-mono shrink-0">
                    <span>{doc.date}</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-805 uppercase tracking-wider border-b border-slate-100 pb-2">Browse by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center font-sans text-xs">
              {[
                { title: "Documentation", count: "1,234 docs", icon: "📁", badge: "bg-blue-50 text-primary border-blue-100" },
                { title: "Tutorials", count: "532 docs", icon: "🎓", badge: "bg-emerald-50 text-emerald-650 border-emerald-100" },
                { title: "Application Notes", count: "324 docs", icon: "📖", badge: "bg-amber-50 text-amber-655 border-amber-100" },
                { title: "Datasheets", count: "876 docs", icon: "⚙", badge: "bg-purple-50 text-purple-650 border-purple-100" },
                { title: "Whitepapers", count: "412 docs", icon: "📄", badge: "bg-slate-100 text-slate-600 border-slate-200" },
                { title: "Videos", count: "198 docs", icon: "🎥", badge: "bg-rose-50 text-rose-655 border-rose-100" }
              ].map((cat, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-105 rounded-xl hover:border-primary/30 transition cursor-pointer flex flex-col items-center space-y-2">
                  <span className="text-xl">{cat.icon}</span>
                  <strong className="text-slate-808 block leading-tight text-[10px] font-bold">{cat.title}</strong>
                  <span className="text-[9px] text-slate-400 block">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-805 uppercase tracking-wider">Ask VELORA AI</h3>
              <p className="text-[10px] text-slate-500">Get instant answers from your AI assistant about EDA, circuits, and semiconductor design.</p>
            </div>
            <div className="w-full bg-slate-50 border border-slate-150 rounded-xl p-3 shadow-inner space-y-2">
              <textarea 
                placeholder="Ask anything about chip design... e.g. What is setup time?" 
                className="w-full bg-transparent border-0 outline-none text-xs text-slate-700 resize-none h-16 font-sans leading-relaxed"
              />
              <div className="flex justify-end pt-1">
                <button onClick={() => alert("AI Agent thinking...")} className="bg-primary hover:bg-primary/95 text-white p-1.5 rounded-lg transition text-xs">➔</button>
              </div>
            </div>
            <div className="space-y-2 text-[10px] text-slate-655 font-sans font-medium">
              <p className="text-slate-455 font-bold uppercase text-[8px] tracking-wide">Try these examples</p>
              {["Explain hold time in STA", "How does a 6T SRAM cell work?", "What are design rules in SKY130?"].map((ex) => (
                <div key={ex} className="p-2 bg-slate-50 border border-slate-100 hover:border-primary/20 rounded-lg cursor-pointer flex justify-between items-center transition">
                  <span>{ex}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-805 uppercase tracking-wider">Popular Topics</h3>
              <span className="text-primary font-bold text-[10px] cursor-pointer hover:underline uppercase">View All</span>
            </div>
            <div className="space-y-3.5 text-[10px] text-slate-700 font-sans font-medium">
              {[
                { name: "SKY130 PDK", docs: "128 docs" },
                { name: "Digital Design (RTL)", docs: "214 docs" },
                { name: "Analog Design", docs: "96 docs" },
                { name: "Physical Design", docs: "163 docs" },
                { name: "Verification (UVM)", docs: "108 docs" },
                { name: "Timing & STA", docs: "78 docs" }
              ].map((topic) => (
                <div key={topic.name} className="flex justify-between items-center cursor-pointer hover:text-primary transition">
                  <span>{topic.name}</span>
                  <span className="text-slate-400 font-mono text-[9px]">{topic.docs}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-805 uppercase tracking-wider">My Collections</h3>
              <span className="text-primary font-bold text-[10px] cursor-pointer hover:underline uppercase">View All</span>
            </div>
            <div className="space-y-3.5 text-[10px] text-slate-700 font-sans font-medium">
              {[
                { name: "VLSI Fundamentals", items: "24 items" },
                { name: "Interview Prep", items: "18 items" },
                { name: "Analog Design Notes", items: "31 items" },
                { name: "Verification Resources", items: "27 items" }
              ].map((col) => (
                <div key={col.name} className="flex justify-between items-center cursor-pointer hover:text-primary transition">
                  <span>{col.name}</span>
                  <span className="text-slate-400 font-mono text-[9px]">{col.items}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-805 uppercase tracking-wider">Recently Viewed</h3>
              <span className="text-primary font-bold text-[10px] cursor-pointer hover:underline uppercase font-sans">View All</span>
            </div>
            <div className="space-y-3.5 text-[10px] text-slate-755 font-sans font-medium">
              {[
                { name: "DRC Rules - SKY130", time: "2h ago" },
                { name: "alu_32bit Timing Report", time: "Yesterday" },
                { name: "Floorplan Best Practices", time: "2 days ago" },
                { name: "CDC Verification Guide", time: "3 days ago" },
                { name: "Power Gating Explained", time: "4 days ago" }
              ].map((rv) => (
                <div key={rv.name} className="flex justify-between items-center cursor-pointer hover:text-primary transition">
                  <span>{rv.name}</span>
                  <span className="text-slate-400 font-mono text-[9px]">{rv.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
