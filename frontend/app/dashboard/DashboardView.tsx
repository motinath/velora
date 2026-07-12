"use client";

import React, { useState, useEffect } from "react";
import { useAppContext } from "../../app/providers";
import { api } from "../../lib/api";
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
  MoreVertical,
  Loader2
} from "lucide-react";

const getProjectIcon = (type: string) => {
  const t = type ? type.toLowerCase() : "";
  if (t.includes("sram") || t.includes("memory")) {
    return { 
      icon: Folder, 
      iconColor: "text-blue-600 bg-blue-50", 
      typeStr: "Memory", 
      typeColor: "bg-blue-50 text-blue-600 border-blue-100" 
    };
  }
  if (t.includes("rtl") || t.includes("controller") || t.includes("alu") || t.includes("gate") || t.includes("inverter") || t.includes("flip-flop") || t.includes("oscillator")) {
    return { 
      icon: FileCode, 
      iconColor: "text-emerald-600 bg-emerald-50", 
      typeStr: "RTL", 
      typeColor: "bg-emerald-50 text-emerald-650 border-emerald-100" 
    };
  }
  if (t.includes("analog") || t.includes("mirror") || t.includes("comparator") || t.includes("ota") || t.includes("reference")) {
    return { 
      icon: Cpu, 
      iconColor: "text-purple-655 bg-purple-50", 
      typeStr: "Analog", 
      typeColor: "bg-purple-50 text-purple-655 border-purple-100" 
    };
  }
  return { 
    icon: Shield, 
    iconColor: "text-orange-600 bg-orange-50", 
    typeStr: "Mixed-Signal", 
    typeColor: "bg-orange-50 text-orange-600 border-orange-100" 
  };
};

const getStatusColor = (status: string) => {
  if (status === "Completed") return "bg-emerald-50 text-emerald-650";
  if (status === "Review") return "bg-orange-50 text-orange-655";
  return "bg-blue-50 text-blue-600";
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case "project":
      return { icon: Folder, color: "text-blue-600 bg-blue-50" };
    case "simulation":
      return { icon: Activity, color: "text-purple-650 bg-purple-50" };
    case "verification":
      return { icon: Shield, color: "text-orange-600 bg-orange-50" };
    case "file":
      return { icon: FileText, color: "text-slate-600 bg-slate-50" };
    default:
      return { icon: FileCode, color: "text-emerald-650 bg-emerald-50" };
  }
};

export function DashboardView() {
  const {
    projects,
    handleSelectProject,
    checkAuthAndRun,
    setShowNewModal,
    handleSelect,
    loadProjects
  } = useAppContext();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error("Failed to load dashboard stats from backend:", err);
      setError(err.message || "Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-[#f8fafc] h-full gap-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-sm font-bold text-slate-800 font-sans">
            Loading semiconductor dashboard...
          </span>
        </div>
        <p className="text-xs text-slate-400 font-sans">
          Querying compiler node, database stats, and live execution history.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-[#f8fafc] h-full gap-4 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
          <Info className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 font-sans">Connection Offline</h3>
          <p className="text-xs text-slate-500 font-sans max-w-md">
            We couldn't connect to the backend engineering node. Make sure the FastAPI service is running.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Chart configuration
  const labels = stats?.overview_chart?.labels || ["Jun 23", "Jun 24", "Jun 25", "Jun 26", "Jun 27", "Jun 28", "Jun 29"];
  const simData = stats?.overview_chart?.simulations || [12, 18, 15, 22, 19, 24, 23];
  const verData = stats?.overview_chart?.verifications || [6, 10, 8, 12, 11, 14, 13];
  const desData = stats?.overview_chart?.designs || [3, 5, 4, 7, 6, 8, 8];

  const maxVal = Math.max(25, ...simData, ...verData, ...desData);
  const roundedMax = Math.ceil(maxVal / 5) * 5;

  const getY = (val: number) => {
    return 220 - (val / roundedMax) * 200;
  };

  const getPath = (data: number[]) => {
    const coords = data.map((val, idx) => {
      const x = 30 + idx * 75;
      const y = getY(val);
      return { x, y };
    });
    return coords.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x},${curr.y}`;
      return `${acc} L ${curr.x},${curr.y}`;
    }, "");
  };

  const getPoints = (data: number[]) => {
    return data.map((val, idx) => {
      const x = 30 + idx * 75;
      const y = getY(val);
      return { x, y, val };
    });
  };

  const yLabels = Array.from({ length: 6 }, (_, i) => Math.round((roundedMax / 5) * (5 - i)));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Custom Header Bar inside Dashboard */}
      <div className="flex justify-between items-center bg-white border-b border-slate-100 px-8 py-4 shrink-0">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
            Welcome to Velora Semiconductor Studio 👋
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
          <button className="relative p-2 text-slate-500 hover:text-slate-800 transition" onClick={fetchStats} title="Refresh dashboard data">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 border border-white" />
          </button>
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
              <div className="text-2xl font-bold text-slate-950 font-sans tracking-tight">
                {stats?.projects_count ?? 0}
              </div>
              <div className="text-xs text-slate-500 font-semibold font-sans mt-0.5">Total Projects</div>
              <div className="text-[10px] text-emerald-600 font-bold font-sans mt-1.5 flex items-center gap-1">
                <span>↑ Live from database</span>
              </div>
            </div>
          </div>

          {/* Card 2: Designs Created */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 transition hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Cpu className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-950 font-sans tracking-tight">
                {stats?.designs_count ?? 0}
              </div>
              <div className="text-xs text-slate-500 font-semibold font-sans mt-0.5">Designs Created</div>
              <div className="text-[10px] text-emerald-600 font-bold font-sans mt-1.5 flex items-center gap-1">
                <span>↑ Synthesized modules</span>
              </div>
            </div>
          </div>

          {/* Card 3: Simulations Run */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 transition hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-650 shrink-0">
              <Activity className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-950 font-sans tracking-tight">
                {stats?.simulations_count ?? 0}
              </div>
              <div className="text-xs text-slate-500 font-semibold font-sans mt-0.5">Simulations Run</div>
              <div className="text-[10px] text-emerald-600 font-bold font-sans mt-1.5 flex items-center gap-1">
                <span>↑ Transient analysis runs</span>
              </div>
            </div>
          </div>

          {/* Card 4: Verifications */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 transition hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
              <Shield className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-950 font-sans tracking-tight">
                {stats?.verifications_count ?? 0}
              </div>
              <div className="text-xs text-slate-500 font-semibold font-sans mt-0.5">Verifications</div>
              <div className="text-[10px] text-emerald-600 font-bold font-sans mt-1.5 flex items-center gap-1">
                <span>↑ DRC & LVS checks</span>
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
                    {(!stats?.recent_projects || stats.recent_projects.length === 0) ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-sans text-xs">
                          No projects created yet. Click "New Project" under Quick Actions to begin.
                        </td>
                      </tr>
                    ) : (
                      stats.recent_projects.map((p: any) => {
                        const meta = getProjectIcon(p.design_type);
                        return (
                          <tr 
                            key={p.id} 
                            className="border-b border-slate-50 hover:bg-slate-50/50 transition cursor-pointer"
                            onClick={async () => {
                              let existingProj = projects.find(proj => proj.id === p.id);
                              if (!existingProj) {
                                await loadProjects();
                                existingProj = projects.find(proj => proj.id === p.id);
                              }
                              if (existingProj) {
                                handleSelectProject(existingProj);
                                handleSelect("proj-" + existingProj.id);
                              } else {
                                handleSelect("projects");
                              }
                            }}
                          >
                            <td className="py-4 pl-2 font-bold text-slate-800 flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg ${meta.iconColor} flex items-center justify-center shrink-0`}>
                                <meta.icon className="w-4 h-4" />
                              </div>
                              <span>{p.name}</span>
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${meta.typeColor}`}>
                                {meta.typeStr}
                              </span>
                            </td>
                            <td className="py-4 text-slate-500 font-semibold">{p.technology}</td>
                            <td className="py-4 text-slate-500 font-semibold">{p.last_opened}</td>
                            <td className="py-4">
                              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${getStatusColor(p.status)}`}>
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
                        );
                      })
                    )}
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
                  onClick={fetchStats}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                >
                  Refresh
                </button>
              </div>

              <div className="space-y-5">
                {(!stats?.recent_activity || stats.recent_activity.length === 0) ? (
                  <p className="text-xs text-slate-400 font-sans text-center py-8">
                    No recent activities recorded.
                  </p>
                ) : (
                  stats.recent_activity.map((act: any, idx: number) => {
                    const meta = getActivityIcon(act.type);
                    return (
                      <div key={idx} className="flex gap-4 items-start hover:bg-slate-50/50 p-1.5 rounded-lg transition cursor-pointer">
                        <div className={`w-8 h-8 rounded-lg ${meta.color} flex items-center justify-center shrink-0`}>
                          <meta.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 leading-tight truncate">{act.title}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-semibold font-sans">{act.time}</p>
                        </div>
                      </div>
                    );
                  })
                )}
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
                    Last 7 Days
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
                  {yLabels.map((val: number, idx: number) => (
                    <text key={idx} x="12" y={24 + idx * 40} className="text-[10px] fill-slate-400 font-semibold font-sans">{val}</text>
                  ))}

                  {/* X-Axis Labels */}
                  {labels.map((lbl: string, idx: number) => (
                    <text key={idx} x={20 + idx * 75} y="245" className="text-[10px] fill-slate-400 font-semibold font-sans">{lbl}</text>
                  ))}

                  {/* Lines */}
                  <path d={getPath(simData)} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={getPath(verData)} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={getPath(desData)} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Markers */}
                  {getPoints(simData).map((pt, idx) => (
                    <circle key={idx} cx={pt.x} cy={pt.y} r="3.5" fill="#3b82f6" stroke="white" strokeWidth="1">
                      <title>{`Simulations: ${pt.val}`}</title>
                    </circle>
                  ))}
                  {getPoints(verData).map((pt, idx) => (
                    <circle key={idx} cx={pt.x} cy={pt.y} r="3.5" fill="#10b981" stroke="white" strokeWidth="1">
                      <title>{`Verifications: ${pt.val}`}</title>
                    </circle>
                  ))}
                  {getPoints(desData).map((pt, idx) => (
                    <circle key={idx} cx={pt.x} cy={pt.y} r="3.5" fill="#8b5cf6" stroke="white" strokeWidth="1">
                      <title>{`Designs: ${pt.val}`}</title>
                    </circle>
                  ))}
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
                    {stats?.system_status?.local_services || "Healthy"}
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
                    {stats?.system_status?.simulation_engine || "Healthy"}
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
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">{stats?.system_status?.license}</p>
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
                        <span className="text-slate-500">{stats?.system_status?.storage_used_pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${stats?.system_status?.storage_used_pct}%` }} />
                      </div>
                      <p className="text-[9px] text-slate-400 font-semibold font-sans mt-1.5">
                        {stats?.system_status?.storage_used_gb} GB / {stats?.system_status?.storage_total_gb} GB
                      </p>
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
