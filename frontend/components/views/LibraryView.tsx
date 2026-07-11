"use client";

import React from "react";
import { useAppContext } from "../../app/providers";

interface ComponentSymbolProps {
  name: string;
  category: string;
  symbolSvg: string;
}

export const ComponentSymbol = ({ name, category, symbolSvg }: ComponentSymbolProps) => {
  const normalizedName = name.toUpperCase();

  if (normalizedName === "NMOS") {
    return (
      <svg className="w-12 h-12 stroke-slate-800 fill-none" viewBox="0 0 40 40">
        <line x1="8" y1="20" x2="20" y2="20" strokeWidth="2" />
        <line x1="20" y1="10" x2="20" y2="30" strokeWidth="3" />
        <line x1="26" y1="10" x2="26" y2="30" strokeWidth="3" />
        <line x1="26" y1="13" x2="34" y2="13" strokeWidth="2" />
        <line x1="26" y1="27" x2="34" y2="27" strokeWidth="2" />
        <polygon points="27,27 33,23 33,31" className="fill-slate-800 stroke-none" />
      </svg>
    );
  }

  if (normalizedName === "PMOS") {
    return (
      <svg className="w-12 h-12 stroke-slate-800 fill-none" viewBox="0 0 40 40">
        <line x1="8" y1="20" x2="16" y2="20" strokeWidth="2" />
        <line x1="16" y1="10" x2="16" y2="30" strokeWidth="3" />
        <circle cx="19.5" cy="20" r="3" strokeWidth="2" fill="white" className="fill-white" />
        <line x1="23" y1="10" x2="23" y2="30" strokeWidth="3" />
        <line x1="23" y1="13" x2="32" y2="13" strokeWidth="2" />
        <line x1="23" y1="27" x2="32" y2="27" strokeWidth="2" />
      </svg>
    );
  }

  if (normalizedName === "RESISTOR") {
    return (
      <svg className="w-14 h-12 stroke-slate-800 fill-none" viewBox="0 0 60 30">
        <path d="M 5,15 L 15,15 L 18,7 L 24,23 L 30,7 L 36,23 L 42,7 L 45,15 L 55,15" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (normalizedName === "CAPACITOR") {
    return (
      <svg className="w-12 h-12 stroke-slate-800 fill-none" viewBox="0 0 40 40">
        <line x1="8" y1="20" x2="17" y2="20" strokeWidth="2" />
        <line x1="17" y1="10" x2="17" y2="30" strokeWidth="3" />
        <line x1="23" y1="10" x2="23" y2="30" strokeWidth="3" />
        <line x1="23" y1="20" x2="32" y2="20" strokeWidth="2" />
      </svg>
    );
  }

  if (normalizedName === "INDUCTOR") {
    return (
      <svg className="w-16 h-12 stroke-slate-800 fill-none" viewBox="0 0 60 30">
        <path d="M 5,15 C 12,5 17,5 17,15 C 24,5 29,5 29,15 C 36,5 41,5 41,15 C 48,5 53,5 53,15" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (normalizedName === "DIODE" || normalizedName === "SCHOTTKY_DIODE" || normalizedName === "ZENER_DIODE") {
    return (
      <svg className="w-12 h-12 stroke-slate-800 fill-none" viewBox="0 0 40 40">
        <line x1="8" y1="20" x2="32" y2="20" strokeWidth="2" />
        <polygon points="17,12 17,28 27,20" className="fill-slate-800 stroke-none" />
        {normalizedName === "DIODE" && <line x1="27" y1="12" x2="27" y2="28" strokeWidth="2.5" />}
        {normalizedName === "SCHOTTKY_DIODE" && (
          <path d="M 25,12 L 27,12 L 27,28 L 29,28" strokeWidth="2.5" />
        )}
        {normalizedName === "ZENER_DIODE" && (
          <path d="M 25,14 L 27,12 L 27,28 L 29,26" strokeWidth="2.5" />
        )}
      </svg>
    );
  }

  if (normalizedName === "PIN") {
    return (
      <svg className="w-12 h-12 stroke-amber-500 fill-amber-100" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="8" strokeWidth="2" />
        <circle cx="20" cy="20" r="3.5" className="fill-amber-500 stroke-none" />
      </svg>
    );
  }

  if (normalizedName.startsWith("AND")) {
    return (
      <svg className="w-14 h-12 stroke-slate-800 fill-none" viewBox="0 0 50 30">
        <line x1="5" y1="10" x2="15" y2="10" strokeWidth="2" />
        <line x1="5" y1="20" x2="15" y2="20" strokeWidth="2" />
        <path d="M 15,5 L 22,5 C 32,5 37,15 37,15 C 37,15 32,25 22,25 L 15,25 Z" strokeWidth="2" strokeLinejoin="round" />
        <line x1="37" y1="15" x2="45" y2="15" strokeWidth="2" />
      </svg>
    );
  }

  if (normalizedName.startsWith("NAND")) {
    return (
      <svg className="w-14 h-12 stroke-slate-800 fill-none" viewBox="0 0 50 30">
        <line x1="5" y1="10" x2="15" y2="10" strokeWidth="2" />
        <line x1="5" y1="20" x2="15" y2="20" strokeWidth="2" />
        <path d="M 15,5 L 22,5 C 30,5 34,15 34,15 C 34,15 30,25 22,25 L 15,25 Z" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="37" cy="15" r="2.5" strokeWidth="2" fill="white" className="fill-white" />
        <line x1="39.5" y1="15" x2="45" y2="15" strokeWidth="2" />
      </svg>
    );
  }

  if (normalizedName.startsWith("OR")) {
    return (
      <svg className="w-14 h-12 stroke-slate-800 fill-none" viewBox="0 0 50 30">
        <line x1="5" y1="10" x2="13" y2="10" strokeWidth="2" />
        <line x1="5" y1="20" x2="13" y2="20" strokeWidth="2" />
        <path d="M 10,5 C 16,10 16,20 10,25 C 18,25 28,21 35,15 C 28,9 18,5 10,5 Z" strokeWidth="2" strokeLinejoin="round" />
        <line x1="35" y1="15" x2="45" y2="15" strokeWidth="2" />
      </svg>
    );
  }

  if (normalizedName.startsWith("NOR")) {
    return (
      <svg className="w-14 h-12 stroke-slate-800 fill-none" viewBox="0 0 50 30">
        <line x1="5" y1="10" x2="13" y2="10" strokeWidth="2" />
        <line x1="5" y1="20" x2="13" y2="20" strokeWidth="2" />
        <path d="M 10,5 C 15,10 15,20 10,25 C 17,25 25,21 32,15 C 25,9 17,5 10,5 Z" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="35" cy="15" r="2.5" strokeWidth="2" fill="white" className="fill-white" />
        <line x1="37.5" y1="15" x2="45" y2="15" strokeWidth="2" />
      </svg>
    );
  }

  if (normalizedName.startsWith("XOR")) {
    return (
      <svg className="w-14 h-12 stroke-slate-800 fill-none" viewBox="0 0 50 30">
        <line x1="5" y1="10" x2="10" y2="10" strokeWidth="2" />
        <line x1="5" y1="20" x2="10" y2="20" strokeWidth="2" />
        <path d="M 8,5 C 13,10 13,20 8,25" strokeWidth="2" />
        <path d="M 12,5 C 17,10 17,20 12,25 C 19,25 28,21 35,15 C 28,9 19,5 12,5 Z" strokeWidth="2" strokeLinejoin="round" />
        <line x1="35" y1="15" x2="45" y2="15" strokeWidth="2" />
      </svg>
    );
  }

  if (normalizedName === "NOT" || normalizedName === "BUF") {
    return (
      <svg className="w-12 h-12 stroke-slate-800 fill-none" viewBox="0 0 40 40">
        <line x1="5" y1="20" x2="15" y2="20" strokeWidth="2" />
        {normalizedName === "NOT" ? (
          <>
            <polygon points="15,12 15,28 27,20" strokeWidth="2" />
            <circle cx="30" cy="20" r="2.5" strokeWidth="2" fill="white" className="fill-white" />
            <line x1="32.5" y1="20" x2="37" y2="20" strokeWidth="2" />
          </>
        ) : (
          <>
            <polygon points="15,12 15,28 29,20" strokeWidth="2" />
            <line x1="29" y1="20" x2="35" y2="20" strokeWidth="2" />
          </>
        )}
      </svg>
    );
  }

  if (symbolSvg) {
    return (
      <svg
        className="w-12 h-12 stroke-slate-700 fill-none [&>rect]:fill-slate-50 [&>circle]:fill-slate-50 [&>polygon]:fill-slate-50"
        viewBox="0 0 40 40"
        dangerouslySetInnerHTML={{ __html: symbolSvg }}
      />
    );
  }

  return (
    <svg className="w-12 h-12 stroke-slate-400 fill-none" viewBox="0 0 40 40">
      <rect x="8" y="8" width="24" height="24" rx="3" strokeWidth="2" />
      <path d="M 8,20 L 14,20 M 26,20 L 32,20" strokeWidth="2" />
      <text x="14" y="24" className="stroke-none fill-slate-400 font-mono text-[9px] font-bold">DEV</text>
    </svg>
  );
};

export function LibraryView() {
  const {
    libComponents,
    pdkStatuses,
    librarySearch,
    setLibrarySearch,
    selectedLibraryCategory,
    setSelectedLibraryCategory,
    selectedLibraryComponent,
    setSelectedLibraryComponent,
    handleTogglePdk
  } = useAppContext();

  const categoriesList = [
    "All",
    "Basic Devices",
    "Passives",
    "Digital",
    "Analog",
    "Memory",
    "RF/Mixed Signal",
    "Clock/Power",
    "Interconnect",
    "Complex IP",
    "Quantum/AI"
  ];

  const filteredComps = libComponents.filter((c: any) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
      c.category.toLowerCase().includes(librarySearch.toLowerCase()) ||
      c.model.toLowerCase().includes(librarySearch.toLowerCase());
    
    if (selectedLibraryCategory === "All") return matchesSearch;
    if (selectedLibraryCategory === "Basic Devices") return matchesSearch && c.category === "Basic Components";
    if (selectedLibraryCategory === "Passives") return matchesSearch && c.category === "Passive Components";
    if (selectedLibraryCategory === "Digital") return matchesSearch && (c.category === "Digital Logic" || c.category === "Sequential Logic" || c.category === "Standard Cells");
    if (selectedLibraryCategory === "Analog") return matchesSearch && c.category === "Analog";
    if (selectedLibraryCategory === "Memory") return matchesSearch && c.category === "Memory Components";
    if (selectedLibraryCategory === "RF/Mixed Signal") return matchesSearch && (c.category === "RF" || c.category === "Mixed Signal");
    if (selectedLibraryCategory === "Clock/Power") return matchesSearch && (c.category === "Clock Tree" || c.category === "Power" || c.category === "IO Cells");
    if (selectedLibraryCategory === "Interconnect") return matchesSearch && c.category === "Interconnect";
    if (selectedLibraryCategory === "Complex IP") return matchesSearch && c.category === "Complex IP";
    if (selectedLibraryCategory === "Quantum/AI") return matchesSearch && (c.category === "AI Components" || c.category === "Quantum");
    
    return matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-6 bg-background text-slate-800 font-sans">
      <div className="border-b border-border pb-5 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Intelligent Component Library</h1>
          <p className="text-xs text-slate-500 mt-1">
            VELORA Multi-PDK engineering primitive devices & intellectual property (IP) library manager.
          </p>
        </div>
        {selectedLibraryComponent && (
          <button
            onClick={() => setSelectedLibraryComponent(null)}
            className="text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-border px-3 py-1.5 rounded-lg transition"
          >
            Clear Inspector Selection
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-border pb-2">
              PDK & IP Manager
            </h2>
            <div className="space-y-3 pt-1">
              {[
                { id: "SKY130", label: "SKY130 Open PDK", desc: "SkyWater 130nm process node" },
                { id: "GF180", label: "GF180 MCU Node", desc: "GlobalFoundries 180nm CMOS" },
                { id: "IHP130", label: "IHP130 SG13G2 RF", desc: "IHP 130nm SiGe BiCMOS" },
                { id: "TSMC65", label: "TSMC65 Advanced", desc: "TSMC 65nm design node pack" },
                { id: "Generic CMOS", label: "Generic PDK", desc: "Virtual process device primitives" }
              ].map((pdk) => {
                const isEnabled = pdkStatuses[pdk.id] ?? false;
                return (
                  <div key={pdk.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/50 border border-border/80">
                    <div>
                      <p className="text-xs font-bold text-slate-700">{pdk.label}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{pdk.desc}</p>
                    </div>
                    <button
                      onClick={() => handleTogglePdk(pdk.id, isEnabled)}
                      className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-all duration-300 ${
                        isEnabled ? "bg-emerald-500 justify-end" : "bg-slate-200 justify-start"
                      }`}
                    >
                      <span className="w-4 h-4 bg-white rounded-full shadow-md" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-border pb-2">
              Categories
            </h2>
            <div className="space-y-1">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedLibraryCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    selectedLibraryCategory === cat
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                      : "text-slate-650 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`space-y-5 ${selectedLibraryComponent ? "lg:col-span-6" : "lg:col-span-9"}`}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search components by name, PDK model, or description..."
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              className="w-full bg-card border border-border rounded-2xl px-5 py-3.5 text-xs text-slate-805 placeholder-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-mono"
            />
            <span className="absolute right-4 top-3.5 text-slate-550 text-xs font-mono">
              {filteredComps.length} active items
            </span>
          </div>

          {filteredComps.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
              <p className="text-sm font-bold text-slate-600">No components match your query</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try enabling additional PDK packages from the manager panel or adjustments to your search queries.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredComps.map((c: any) => {
                const isSelected = selectedLibraryComponent?.name === c.name;
                return (
                  <div
                    key={c.name}
                    onClick={() => setSelectedLibraryComponent(c)}
                    className={`bg-card border rounded-2xl p-5 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm cursor-pointer ${
                      isSelected ? "border-primary ring-1 ring-primary/20" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-800 font-mono">{c.name}</span>
                        <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2 py-0.5 rounded font-mono">
                          {c.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono tracking-tight break-all">
                        {c.model || "sky130_pr_model_generic"}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed min-h-[36px] line-clamp-2">
                      {c.desc}
                    </p>

                    <div className="h-20 bg-slate-50 border border-border/80 rounded-xl flex items-center justify-center relative overflow-hidden">
                      <span className="absolute top-1.5 left-2 text-[8px] text-slate-400 font-mono">CAD Symbol</span>
                      <ComponentSymbol name={c.name} category={c.category} symbolSvg={c.symbol_svg} />
                    </div>

                    <div className="flex justify-between items-center text-[9.5px] font-mono text-slate-500 border-t border-slate-100 pt-2.5">
                      <span>PINS: <strong>{c.pins.length}</strong></span>
                      <span>TECH: <strong className="text-primary">{c.technology || "Generic"}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedLibraryComponent && (
          <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-5 h-fit overflow-y-auto max-h-[75vh] animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-start border-b border-border pb-3">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider font-sans">VUCL Inspector</h3>
                <p className="text-[10px] text-slate-550 mt-0.5 font-sans leading-relaxed">
                  Engineering Primitive Object
                </p>
              </div>
              <button
                onClick={() => setSelectedLibraryComponent(null)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 transition text-[10px]"
                title="Close Inspector"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Device Spec Name</span>
              <h4 className="text-sm font-bold text-slate-850 font-mono tracking-tight break-all">{selectedLibraryComponent.name}</h4>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase font-mono">
                  {selectedLibraryComponent.technology || "Generic"} Compatible
                </span>
                {selectedLibraryComponent.model && (
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-border px-2 py-0.5 rounded font-mono">
                    {selectedLibraryComponent.model}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">CAD Visual Symbol</span>
              <div className="h-28 bg-slate-50 border border-border/80 rounded-xl flex items-center justify-center relative overflow-hidden">
                <span className="absolute top-1.5 left-2 text-[8px] text-slate-400 font-mono">Schematic Entity</span>
                <ComponentSymbol
                  name={selectedLibraryComponent.name}
                  category={selectedLibraryComponent.category}
                  symbolSvg={selectedLibraryComponent.symbol_svg}
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">AI Functional Description</span>
              <p className="text-xs text-slate-650 leading-relaxed font-sans">
                {selectedLibraryComponent.desc}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Pins Connection Ports</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedLibraryComponent.pins.map((pin: string) => (
                  <span key={pin} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] rounded-lg border border-border/80 uppercase font-bold transition">
                    {pin}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Default Properties</span>
              <div className="space-y-1.5 bg-slate-50 border border-border/80 p-3 rounded-xl font-mono text-[10px] text-slate-600">
                {Object.keys(selectedLibraryComponent.parameters || {}).length === 0 ? (
                  <div className="text-slate-400 text-center py-1 font-sans text-[9.5px]">No properties parameters.</div>
                ) : (
                  Object.entries(selectedLibraryComponent.parameters || {}).map(([k, v]: any) => (
                    <div key={k} className="flex justify-between border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
                      <span className="text-slate-450 uppercase">{k}:</span>
                      <span className="text-slate-800 font-bold">{v} {k === 'W' || k === 'L' ? 'um' : ''}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {selectedLibraryComponent.spice_model && (
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">SPICE Subcircuit Netlist</span>
                <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[9px] rounded-xl overflow-x-auto max-h-36 border border-slate-955 leading-normal select-text">
                  {selectedLibraryComponent.spice_model}
                </pre>
              </div>
            )}

            {selectedLibraryComponent.design_constraints && (
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Verification Constraints</span>
                <div className="p-2.5 bg-slate-50 border border-border/80 rounded-xl space-y-1.5 text-[9px] font-mono text-slate-600">
                  <div className="flex justify-between">
                    <span>Max VDD:</span>
                    <span className="text-slate-800 font-bold">{selectedLibraryComponent.design_constraints.supply_voltage_max_v ?? 1.8} V</span>
                  </div>
                  {selectedLibraryComponent.design_constraints.width_min_um !== undefined && (
                    <div className="flex justify-between">
                      <span>Min Width (W):</span>
                      <span className="text-slate-800 font-bold">{selectedLibraryComponent.design_constraints.width_min_um} um</span>
                    </div>
                  )}
                  {selectedLibraryComponent.design_constraints.length_min_um !== undefined && (
                    <div className="flex justify-between">
                      <span>Min Length (L):</span>
                      <span className="text-slate-800 font-bold">{selectedLibraryComponent.design_constraints.length_min_um} um</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedLibraryComponent.ai_metadata && (
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">AI Optimizations</span>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-[10px] leading-relaxed text-slate-700">
                  <div>
                    <span className="font-bold text-amber-800 uppercase text-[9px] block">Critical Parameter</span>
                    <span className="font-mono text-amber-700 font-bold">{selectedLibraryComponent.ai_metadata.critical_parameter || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-amber-800 uppercase text-[9px] block font-sans">Strategy Guidelines</span>
                    <p className="font-sans text-slate-650">{selectedLibraryComponent.ai_metadata.optimization_guideline}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
