"use client";

import React from "react";
import { useAppContext } from "../../app/providers";
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Folder, 
  Cpu, 
  Activity, 
  Shield, 
  FileCode, 
  FileText, 
  Plus, 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  Globe, 
  Info, 
  Database,
  MoreVertical
} from "lucide-react";

export function DashboardView() {
  const {
    projects,
    handleSelectProject,
    checkAuthAndRun,
    setShowNewModal,
    handleSelect
  } = useAppContext();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Custom Header Bar inside Dashboard */}
      <div className="flex justify-between items-center bg-white border-b border-slate-100 px-8 py-4 shrink-0">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
            Welcome back, Motinath 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Here's what's happening with your designs today.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Search input pill */}
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects, designs, files..."
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 pl-10 pr-16 py-2.5 rounded-full outline-none font-sans focus:border-blue-500 focus:bg-white transition"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">
              Ctrl + K
            </kbd>
          </div>

          {/* Notification Bell */}
          <button className="relative p-2 text-slate-500 hover:text-slate-800 transition">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 border border-white" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-600 text-sm font-sans shadow-sm">
              M
            </div>
            <span className="text-xs font-semibold text-slate-800 group-hover:text-slate-900 transition">
              Motinath
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Scrollable Dashboard Body */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#f8fafc]">
        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Projects */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 transition hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Folder className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-950 font-sans tracking-tight">12</div>
              <div className="text-xs text-slate-500 font-semibold font-sans mt-0.5">Total Projects</div>
              <div className="text-[10px] text-emerald-600 font-bold font-sans mt-1.5 flex items-center gap-1">
                <span>↑ 2 this week</span>
              </div>
            </div>
          </div>

          {/* Card 2: Designs Created */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 transition hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Cpu className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-950 font-sans tracking-tight">8</div>
              <div className="text-xs text-slate-500 font-semibold font-sans mt-0.5">Designs Created</div>
              <div className="text-[10px] text-emerald-600 font-bold font-sans mt-1.5 flex items-center gap-1">
                <span>↑ 3 this week</span>
              </div>
            </div>
          </div>

          {/* Card 3: Simulations Run */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 transition hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-650 shrink-0">
              <Activity className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-950 font-sans tracking-tight">23</div>
              <div className="text-xs text-slate-500 font-semibold font-sans mt-0.5">Simulations Run</div>
              <div className="text-[10px] text-emerald-600 font-bold font-sans mt-1.5 flex items-center gap-1">
                <span>↑ 5 this week</span>
              </div>
            </div>
          </div>

          {/* Card 4: Verifications */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 transition hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
              <Shield className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-950 font-sans tracking-tight">6</div>
              <div className="text-xs text-slate-500 font-semibold font-sans mt-0.5">Verifications</div>
              <div className="text-[10px] text-emerald-600 font-bold font-sans mt-1.5 flex items-center gap-1">
                <span>↑ 1 this week</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Recent Projects & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects Table */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-slate-900 font-sans">Recent Projects</h2>
                <button 
                  onClick={() => handleSelect("projects")}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 text-xs font-semibold rounded-lg transition"
                >
                  View all
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-sans">
                      <th className="pb-3 pl-2">Project Name</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Technology</th>
                      <th className="pb-3">Last Opened</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right pr-2"></th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-sans text-slate-705 font-medium">
                    {[
                      { name: "6T_SRAM_SKY130", icon: Folder, iconColor: "text-blue-600 bg-blue-50", type: "Schematic", typeColor: "bg-blue-50 text-blue-600 border-blue-100", tech: "Sky130", time: "2 hours ago", status: "In Progress", statusColor: "bg-blue-50 text-blue-600" },
                      { name: "I2C_Controller", icon: FileCode, iconColor: "text-emerald-600 bg-emerald-50", type: "RTL", typeColor: "bg-emerald-50 text-emerald-650 border-emerald-100", tech: "TSMC 65nm", time: "1 day ago", status: "In Progress", statusColor: "bg-blue-50 text-blue-600" },
                      { name: "PLL_Design", icon: Cpu, iconColor: "text-purple-650 bg-purple-50", type: "Analog", typeColor: "bg-purple-50 text-purple-655 border-purple-100", tech: "GF 180nm", time: "2 days ago", status: "Review", statusColor: "bg-orange-50 text-orange-655" },
                      { name: "ALU_32bit", icon: FileCode, iconColor: "text-emerald-655 bg-emerald-50", type: "RTL", typeColor: "bg-emerald-50 text-emerald-650 border-emerald-100", tech: "Sky130", time: "3 days ago", status: "Completed", statusColor: "bg-emerald-50 text-emerald-650" },
                      { name: "SPI_FLASH_Controller", icon: Shield, iconColor: "text-orange-600 bg-orange-50", type: "Mixed-Signal", typeColor: "bg-orange-50 text-orange-600 border-orange-100", tech: "TSMC 65nm", time: "4 days ago", status: "In Progress", statusColor: "bg-blue-50 text-blue-600" }
                    ].map((p, idx) => (
                      <tr 
                        key={idx} 
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition cursor-pointer"
                        onClick={() => {
                          const existingProj = projects.find(proj => proj.name.toUpperCase() === p.name.toUpperCase() || proj.name.replace(/ /g, '_').toUpperCase() === p.name.toUpperCase());
                          if (existingProj) {
                            handleSelectProject(existingProj);
                            handleSelect("proj-" + existingProj.id);
                          } else {
                            handleSelect("projects");
                          }
                        }}
                      >
                        <td className="py-4 pl-2 font-bold text-slate-800 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${p.iconColor} flex items-center justify-center shrink-0`}>
                            <p.icon className="w-4 h-4" />
                          </div>
                          <span>{p.name}</span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${p.typeColor}`}>
                            {p.type}
                          </span>
                        </td>
                        <td className="py-4 text-slate-500 font-semibold">{p.tech}</td>
                        <td className="py-4 text-slate-500 font-semibold">{p.time}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${p.statusColor}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-2">
                          <button 
                            className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-655 transition"
                            onClick={(e) => { e.stopPropagation(); alert(`Options for ${p.name}`); }}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-slate-900 font-sans">Recent Activity</h2>
                <button 
                  onClick={() => alert("Activity log details loaded.")}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 text-xs font-semibold rounded-lg transition"
                >
                  View all
                </button>
              </div>

              <div className="space-y-5">
                {[
                  { title: "6T_SRAM_SKY130: Schematic saved", time: "2 hours ago", icon: Folder, iconColor: "text-blue-600 bg-blue-50" },
                  { title: "Simulation completed for 6T_SRAM_SKY130", time: "3 hours ago", icon: Activity, iconColor: "text-purple-650 bg-purple-50" },
                  { title: "I2C_Controller: RTL code updated", time: "1 day ago", icon: FileCode, iconColor: "text-emerald-650 bg-emerald-50" },
                  { title: "Verification passed: ALU_32bit", time: "2 days ago", icon: Shield, iconColor: "text-orange-600 bg-orange-50" },
                  { title: "Report generated: PLL_Design", time: "2 days ago", icon: FileText, iconColor: "text-blue-600 bg-blue-50" }
                ].map((act, idx) => (
                  <div key={idx} className="flex gap-4 items-start hover:bg-slate-55/50 p-1.5 rounded-lg transition cursor-pointer">
                    <div className={`w-8 h-8 rounded-lg ${act.iconColor} flex items-center justify-center shrink-0`}>
                      <act.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 leading-tight truncate">{act.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold font-sans">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Overview (Chart), Quick Actions, System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Project Overview Card (SVG Chart) */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-slate-900 font-sans">Project Overview</h2>
                <div className="flex items-center gap-2">
                  <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-2 py-1 text-[10px] font-bold rounded-lg transition flex items-center gap-1">
                    This Week <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Legends */}
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 font-sans my-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Simulations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Verifications</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>Designs</span>
                </div>
              </div>

              {/* SVG Line Chart */}
              <div className="h-60 mt-4 relative">
                <svg viewBox="0 0 500 230" className="w-full h-full select-none" preserveAspectRatio="none">
                  {/* Horizontal Grid Lines */}
                  <line x1="30" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="30" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="30" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="30" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="30" y1="180" x2="480" y2="180" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="30" y1="220" x2="480" y2="220" stroke="#cbd5e1" strokeWidth="1" />

                  {/* Y-Axis Labels */}
                  <text x="12" y="24" className="text-[10px] fill-slate-400 font-semibold font-sans">25</text>
                  <text x="12" y="64" className="text-[10px] fill-slate-400 font-semibold font-sans">20</text>
                  <text x="12" y="104" className="text-[10px] fill-slate-400 font-semibold font-sans">15</text>
                  <text x="12" y="144" className="text-[10px] fill-slate-400 font-semibold font-sans">10</text>
                  <text x="18" y="184" className="text-[10px] fill-slate-400 font-semibold font-sans">5</text>
                  <text x="18" y="224" className="text-[10px] fill-slate-400 font-semibold font-sans">0</text>

                  {/* X-Axis Labels */}
                  <text x="20" y="245" className="text-[10px] fill-slate-400 font-semibold font-sans">Jun 23</text>
                  <text x="95" y="245" className="text-[10px] fill-slate-400 font-semibold font-sans">Jun 24</text>
                  <text x="170" y="245" className="text-[10px] fill-slate-400 font-semibold font-sans">Jun 25</text>
                  <text x="245" y="245" className="text-[10px] fill-slate-400 font-semibold font-sans">Jun 26</text>
                  <text x="320" y="245" className="text-[10px] fill-slate-400 font-semibold font-sans">Jun 27</text>
                  <text x="395" y="245" className="text-[10px] fill-slate-400 font-semibold font-sans">Jun 28</text>
                  <text x="470" y="245" className="text-[10px] fill-slate-400 font-semibold font-sans">Jun 29</text>

                  {/* Lines */}
                  <path d="M 30,96 L 105,64 L 180,88 L 255,44 L 330,68 L 405,40 L 480,44" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 30,148 L 105,116 L 180,136 L 255,112 L 330,128 L 405,100 L 480,116" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 30,184 L 105,160 L 180,184 L 255,156 L 330,172 L 405,136 L 480,152" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Markers */}
                  <circle cx="30" cy="96" r="3.5" fill="#3b82f6" stroke="white" strokeWidth="1" />
                  <circle cx="105" cy="64" r="3.5" fill="#3b82f6" stroke="white" strokeWidth="1" />
                  <circle cx="180" cy="88" r="3.5" fill="#3b82f6" stroke="white" strokeWidth="1" />
                  <circle cx="255" cy="44" r="3.5" fill="#3b82f6" stroke="white" strokeWidth="1" />
                  <circle cx="330" cy="68" r="3.5" fill="#3b82f6" stroke="white" strokeWidth="1" />
                  <circle cx="405" cy="40" r="3.5" fill="#3b82f6" stroke="white" strokeWidth="1" />
                  <circle cx="480" cy="44" r="3.5" fill="#3b82f6" stroke="white" strokeWidth="1" />

                  <circle cx="30" cy="148" r="3.5" fill="#10b981" stroke="white" strokeWidth="1" />
                  <circle cx="105" cy="116" r="3.5" fill="#10b981" stroke="white" strokeWidth="1" />
                  <circle cx="180" cy="136" r="3.5" fill="#10b981" stroke="white" strokeWidth="1" />
                  <circle cx="255" cy="112" r="3.5" fill="#10b981" stroke="white" strokeWidth="1" />
                  <circle cx="330" cy="128" r="3.5" fill="#10b981" stroke="white" strokeWidth="1" />
                  <circle cx="405" cy="100" r="3.5" fill="#10b981" stroke="white" strokeWidth="1" />
                  <circle cx="480" cy="116" r="3.5" fill="#10b981" stroke="white" strokeWidth="1" />

                  <circle cx="30" cy="184" r="3.5" fill="#8b5cf6" stroke="white" strokeWidth="1" />
                  <circle cx="105" cy="160" r="3.5" fill="#8b5cf6" stroke="white" strokeWidth="1" />
                  <circle cx="180" cy="184" r="3.5" fill="#8b5cf6" stroke="white" strokeWidth="1" />
                  <circle cx="255" cy="156" r="3.5" fill="#8b5cf6" stroke="white" strokeWidth="1" />
                  <circle cx="330" cy="172" r="3.5" fill="#8b5cf6" stroke="white" strokeWidth="1" />
                  <circle cx="405" cy="136" r="3.5" fill="#8b5cf6" stroke="white" strokeWidth="1" />
                  <circle cx="480" cy="152" r="3.5" fill="#8b5cf6" stroke="white" strokeWidth="1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-sans mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "New Project", icon: Plus, action: () => checkAuthAndRun(() => setShowNewModal(true)) },
                  { label: "AI Design Assistant", icon: Sparkles, action: () => handleSelect("ai-design") },
                  { label: "Create Schematic", icon: Cpu, action: () => handleSelect("schematic") },
                  { label: "Write RTL Code", icon: Terminal, action: () => handleSelect("rtl") },
                  { label: "Run Simulation", icon: Activity, action: () => handleSelect("simulation") },
                  { label: "Run Verification", icon: ShieldCheck, action: () => handleSelect("verification") }
                ].map((act, idx) => (
                  <button 
                    key={idx}
                    onClick={act.action}
                    className="bg-white hover:bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-3 transition hover:shadow-sm"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <act.icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 font-sans leading-tight">
                      {act.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* System Status Card */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-sans mb-6">System Status</h2>
              <div className="space-y-4">
                {/* Status Item 1 */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-none">Local Services</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">All systems operational</p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-650 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    Healthy
                  </span>
                </div>

                {/* Status Item 2 */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-none">Simulation Engine</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">Ready</p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-650 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    Healthy
                  </span>
                </div>

                {/* Status Item 3 */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-none">License</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">Valid until Dec 31, 2025</p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-650 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    Active
                  </span>
                </div>

                {/* Storage Usage progress bar */}
                <div className="pt-2">
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                      <Database className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-700 font-sans mb-1.5">
                        <span className="text-slate-800 text-xs font-bold">Storage Usage</span>
                        <span className="text-slate-500">21%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: "21%" }} />
                      </div>
                      <p className="text-[9px] text-slate-400 font-semibold font-sans mt-1.5">42.6 GB / 200 GB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
