import React, { useState } from 'react';
import { Sliders, Settings } from 'lucide-react';

interface PropertiesInspectorProps {
  activeProject: any;
  activeComponentObj: any;
  activeDesign: any;
  onParameterChange: (param: string, val: number) => void;
}

export function PropertiesInspector({
  activeProject,
  activeComponentObj,
  activeDesign,
  onParameterChange
}: PropertiesInspectorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getDeviceLeakage = (w: number) => {
    return `${(w * 0.12).toFixed(3)} nA`;
  };

  const getDeviceDelay = (w: number, l: number) => {
    return `${((l * l * 35) / (w || 1)).toFixed(1)} ps`;
  };

  return (
    <div className="w-[280px] border-l border-border bg-card p-4 flex flex-col justify-between h-full shrink-0 z-10 font-sans">
      <div className="space-y-6 overflow-y-auto">
        <div className="border-b border-border pb-3">
          <h3 className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5 font-sans">
            <Sliders className="w-3.5 h-3.5 text-primary" />
            Properties Inspector
          </h3>
        </div>

        {activeComponentObj ? (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <span className="text-[9px] uppercase font-sans text-primary font-extrabold block">Selected Device</span>
              <span className="text-xs font-bold text-slate-800 font-sans">{activeComponentObj.id}</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded ml-2 uppercase font-bold font-sans">{activeComponentObj.type}</span>
            </div>

            <div className="space-y-3 font-sans">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">PDK Model Mapping</span>
              <div className="p-2 bg-slate-50 rounded border border-border font-mono text-primary">
                <span className="text-[10px] block truncate">{activeComponentObj.properties?.model || "Supply Net Tie"}</span>
              </div>

              {activeComponentObj.properties?.parameters && Object.keys(activeComponentObj.properties.parameters).length > 0 && (
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Dimensions</span>
                  
                  {/* Width slider */}
                  {"W" in activeComponentObj.properties.parameters && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500 font-bold">Width (W):</span>
                        <span className="text-primary font-bold">{activeComponentObj.properties.parameters.W.toFixed(2)} um</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.15" 
                        max="10.0" 
                        step="0.05" 
                        value={activeComponentObj.properties.parameters.W} 
                        onChange={(e) => onParameterChange("W", parseFloat(e.target.value))} 
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                      />
                    </div>
                  )}

                  {/* Length slider */}
                  {"L" in activeComponentObj.properties.parameters && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500 font-bold">Length (L):</span>
                        <span className="text-primary font-bold">{activeComponentObj.properties.parameters.L.toFixed(2)} um</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.15" 
                        max="5.0" 
                        step="0.05" 
                        value={activeComponentObj.properties.parameters.L} 
                        onChange={(e) => onParameterChange("L", parseFloat(e.target.value))} 
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                      />
                    </div>
                  )}

                  {/* Threshold default slider */}
                  {["NMOS", "PMOS"].includes(activeComponentObj.type) && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500 font-bold">Threshold (Vth):</span>
                        <span className="text-primary font-bold">{(activeComponentObj.properties.parameters.Vth || 0.38).toFixed(2)} V</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.1" 
                        max="0.8" 
                        step="0.01" 
                        value={activeComponentObj.properties.parameters.Vth || 0.38} 
                        onChange={(e) => onParameterChange("Vth", parseFloat(e.target.value))} 
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                      />
                    </div>
                  )}

                  {/* Resistor slider */}
                  {"R" in activeComponentObj.properties.parameters && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500 font-bold">Resistance (R):</span>
                        <span className="text-primary font-bold">{activeComponentObj.properties.parameters.R.toFixed(0)} Ohm</span>
                      </div>
                      <input 
                        type="range" 
                        min="100" 
                        max="50000" 
                        step="100" 
                        value={activeComponentObj.properties.parameters.R} 
                        onChange={(e) => onParameterChange("R", parseFloat(e.target.value))} 
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                      />
                    </div>
                  )}

                  {/* Capacitor slider */}
                  {"C" in activeComponentObj.properties.parameters && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500 font-bold">Capacitance (C):</span>
                        <span className="text-primary font-bold">{(activeComponentObj.properties.parameters.C * 1e12).toFixed(1)} pF</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.1e-12" 
                        max="20e-12" 
                        step="0.1e-12" 
                        value={activeComponentObj.properties.parameters.C} 
                        onChange={(e) => onParameterChange("C", parseFloat(e.target.value))} 
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                      />
                    </div>
                  )}

                  {/* Progressive Disclosure Toggle */}
                  {["NMOS", "PMOS"].includes(activeComponentObj.type) && (
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="w-full text-center text-[9px] uppercase font-bold text-slate-500 hover:text-primary hover:border-primary border border-slate-200 py-1.5 rounded-lg transition"
                    >
                      {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
                    </button>
                  )}

                  {/* Advanced Options (Progressive Disclosure) */}
                  {showAdvanced && ["NMOS", "PMOS"].includes(activeComponentObj.type) && (
                    <div className="space-y-4 pt-2 border-t border-dashed border-slate-200 font-sans">
                      {/* Body Bias */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500 font-bold">Body Bias (Vsb):</span>
                          <span className="text-slate-750 font-mono font-bold">{(activeComponentObj.properties.parameters.Vsb || 0.0).toFixed(1)} V</span>
                        </div>
                        <input 
                          type="range" 
                          min="-1.0" 
                          max="1.8" 
                          step="0.1" 
                          value={activeComponentObj.properties.parameters.Vsb || 0.0} 
                          onChange={(e) => onParameterChange("Vsb", parseFloat(e.target.value))} 
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary" 
                        />
                      </div>

                      {/* Finger Count */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500 font-bold">Finger Count (NF):</span>
                          <span className="text-slate-750 font-mono font-bold">{activeComponentObj.properties.parameters.NF || 1}</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="8" 
                          step="1" 
                          value={activeComponentObj.properties.parameters.NF || 1} 
                          onChange={(e) => onParameterChange("NF", parseInt(e.target.value))} 
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary" 
                        />
                      </div>

                      {/* Capacitance (Advanced Input) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500 font-bold">Capacitance (Cgd):</span>
                          <span className="text-slate-750 font-mono font-bold">{(activeComponentObj.properties.parameters.Cgd || 0.45).toFixed(2)} fF</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.1" 
                          max="5.0" 
                          step="0.05" 
                          value={activeComponentObj.properties.parameters.Cgd || 0.45} 
                          onChange={(e) => onParameterChange("Cgd", parseFloat(e.target.value))} 
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary" 
                        />
                      </div>

                      {/* Read-only Parasitics list */}
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Parasitics</span>
                        <div className="p-2 bg-slate-50 rounded border border-border font-mono text-[9px] text-slate-600 space-y-1">
                          <div className="flex justify-between"><span>Cgs:</span><span>1.12 fF</span></div>
                          <div className="flex justify-between"><span>Cgb:</span><span>0.18 fF</span></div>
                          <div className="flex justify-between"><span>Rgate:</span><span>4.5 Ohm</span></div>
                        </div>
                      </div>

                      {/* Leakage */}
                      <div className="flex justify-between text-[10px] border-b border-slate-100 pb-1">
                        <span className="text-slate-500 font-bold">Subthreshold Leakage:</span>
                        <span className="text-slate-700 font-mono font-bold">{getDeviceLeakage(activeComponentObj.properties.parameters.W)}</span>
                      </div>

                      {/* Delay */}
                      <div className="flex justify-between text-[10px] border-b border-slate-100 pb-1">
                        <span className="text-slate-500 font-bold">Intrinsic Gate Delay:</span>
                        <span className="text-slate-700 font-mono font-bold">{getDeviceDelay(activeComponentObj.properties.parameters.W, activeComponentObj.properties.parameters.L)}</span>
                      </div>
                    </div>
                  )}

                </div>
              )}

              <span className="text-[10px] uppercase font-bold text-slate-500 block">Pin Net Connections</span>
              <div className="space-y-1 bg-slate-50 p-2.5 rounded border border-border text-[10px] font-mono">
                {activeDesign?.circuit_graph_json?.edges?.filter((e: any) => e.from_node === activeComponentObj.id)?.map((e: any) => (
                  <div key={e.from_pin} className="flex justify-between">
                    <span className="text-slate-500">{e.from_pin} pin:</span>
                    <span className="text-primary font-bold">{e.to_net}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 font-sans text-xs">
            {activeProject && (
              <div className="p-3 bg-slate-55 border border-border rounded-xl">
                <span className="text-[9px] uppercase font-sans text-slate-400 block font-bold">Active Repository</span>
                <span className="text-xs font-bold text-slate-700">{activeProject.name}</span>
              </div>
            )}

            {activeDesign?.readiness_report_json?.overall !== undefined ? (
              <div className="space-y-4">
                {/* Readiness Score Circular Card */}
                <div className="p-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl border border-indigo-900/50 shadow-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[8px] uppercase tracking-wider text-indigo-300 font-bold">Tapeout Readiness</p>
                      <p className="text-3xl font-black font-mono mt-1 text-cyan-400">
                        {activeDesign.readiness_report_json.overall}%
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                        activeDesign.readiness_report_json.risk === 'Low' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {activeDesign.readiness_report_json.risk} Risk
                      </span>
                    </div>
                  </div>

                  {/* Micro physical parameters summary */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-indigo-900/50 text-[9px] font-mono text-indigo-200">
                    <div>Area: <strong className="text-white">{activeDesign.readiness_report_json.area_um2 ?? 0.89} um²</strong></div>
                    <div>Delay: <strong className="text-white">{activeDesign.readiness_report_json.stage_delay_ps ?? 55} ps</strong></div>
                    <div className="col-span-2">Leakage: <strong className="text-white">{activeDesign.readiness_report_json.static_power_uw ?? 0.004} uW</strong></div>
                  </div>
                </div>

                {/* Sub-readiness levels breakdown */}
                <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-border">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block border-b border-slate-200 pb-1.5 mb-2">Readiness Breakdown</span>
                  
                  {[
                    { label: "RTL Quality", val: activeDesign.readiness_report_json.rtl },
                    { label: "Verification", val: activeDesign.readiness_report_json.verification },
                    { label: "Timing Margin", val: activeDesign.readiness_report_json.timing },
                    { label: "Power Grid", val: activeDesign.readiness_report_json.power },
                    { label: "DRC Rules", val: activeDesign.readiness_report_json.drc },
                    { label: "LVS Match", val: activeDesign.readiness_report_json.lvs }
                  ].map(item => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span>{item.label}</span>
                        <span className="font-bold text-slate-800 font-mono">{item.val}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${item.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[9px] text-slate-400 text-center leading-relaxed">
                  Select any component on the canvas to tune its dimensions directly.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1 bg-slate-50 p-2.5 rounded border border-border font-mono text-slate-500 text-[10px]">
                  <div className="flex justify-between"><span>Max Current:</span><span className="text-slate-700">10.0 mA</span></div>
                  <div className="flex justify-between"><span>Min Width:</span><span className="text-slate-700">0.15 um</span></div>
                  <div className="flex justify-between"><span>Min Length:</span><span className="text-slate-700">0.15 um</span></div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">Click any device node on the schematic drawing canvas to tune its dimensions dynamically.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 border border-border rounded-lg text-[9px] text-slate-500 space-y-1 mt-4">
        <div className="flex items-center gap-1.5 font-bold uppercase text-slate-600">
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          Cadence Mode
        </div>
        <p className="font-sans leading-relaxed text-slate-400">Tuning dimensions updates the subcircuit netlist content and solver graphs instantly.</p>
      </div>
    </div>
  );
}
