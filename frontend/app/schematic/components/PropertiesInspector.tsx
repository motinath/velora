import React from "react";
import { Sliders, AlertTriangle } from "lucide-react";
import { PropertyTabType, SchematicNode, Connection } from "../types";

interface PropertiesInspectorProps {
  activePropertyTab: PropertyTabType;
  setActivePropertyTab: (tab: PropertyTabType) => void;
  selectedComponentId: string | null;
  localNodes: SchematicNode[];
  localConnections: Connection[];
  setLocalConnections: React.Dispatch<React.SetStateAction<Connection[]>>;
  handleInspectorParamChange: (name: string, val: number) => void;
  triggerAiAction: (action: string) => void;
  designs: any[];
  setActiveDesign: (design: any) => void;
}

export function PropertiesInspector({
  activePropertyTab,
  setActivePropertyTab,
  selectedComponentId,
  localNodes,
  localConnections,
  setLocalConnections,
  handleInspectorParamChange,
  triggerAiAction,
  designs,
  setActiveDesign,
}: PropertiesInspectorProps) {
  const activeComponentObj = localNodes.find((n) => n.id === selectedComponentId);

  return (
    <div className="col-span-3 border-l border-slate-200 bg-white p-5 flex flex-col justify-between h-full overflow-y-auto shrink-0 select-text font-sans">
      <div className="space-y-4">
        {/* Header tabs */}
        <div className="flex border-b border-slate-100 text-[10.5px] font-bold text-slate-400 pb-2 flex-wrap gap-2.5">
          {[
            { id: "properties" as const, label: "Properties" },
            { id: "connections" as const, label: "Connections" },
            { id: "history" as const, label: "History" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePropertyTab(tab.id)}
              className={`pb-1 transition ${
                activePropertyTab === tab.id
                  ? "text-blue-600 font-black border-b-2 border-blue-600"
                  : "hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Properties tab */}
        {activePropertyTab === "properties" && (
          <div className="space-y-3.5 text-slate-600 text-xs">
            {selectedComponentId && activeComponentObj ? (
              <>
                <div className="bg-slate-55 bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl space-y-2">
                  <div className="flex justify-between border-b pb-1.5 text-[11px] font-bold">
                    <span>Device ID</span>
                    <span className="text-slate-800 font-mono font-extrabold">{selectedComponentId}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5 text-[11px] font-bold">
                    <span>Category</span>
                    <span className="text-slate-800 uppercase">{activeComponentObj.category || "Basic"}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>Model PDK</span>
                    <span className="text-slate-800 font-mono">{activeComponentObj.properties?.model || "sky130_fd_pr"}</span>
                  </div>
                </div>

                {/* Parameters inputs */}
                {Object.entries(activeComponentObj.properties?.parameters || {}).map(([paramName, val]: [string, any]) => {
                  const warning = paramName === "W" && val < 0.36
                    ? "Width is below Sky130 PDK min limit (0.36 µm)"
                    : paramName === "L" && val < 0.15
                    ? "Length is below Sky130 PDK min limit (0.15 µm)"
                    : "";

                  return (
                    <div key={paramName} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {paramName === "W" ? "Channel Width (W)" : paramName === "L" ? "Channel Length (L)" : paramName}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={val}
                          onChange={(e) => handleInspectorParamChange(paramName, parseFloat(e.target.value) || 0)}
                          className={`w-full bg-white border ${warning ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"} text-slate-850 px-3.5 py-2.5 pr-10 rounded-xl outline-none font-bold font-mono transition shadow-sm`}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold uppercase">um</span>
                      </div>
                      {warning && (
                        <div className="text-[9.5px] text-red-500 font-bold mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{warning}</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Parametric Optimization panel */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Parametric Optimization</div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <button 
                      className="bg-slate-50 border border-slate-200 py-2.5 rounded-xl hover:bg-slate-100 transition text-slate-700 flex items-center justify-center gap-1.5 font-bold"
                      onClick={() => triggerAiAction("leakage")}
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-500" />
                      Reduce Leakage
                    </button>
                    <button 
                      className="bg-slate-50 border border-slate-200 py-2.5 rounded-xl hover:bg-slate-100 transition text-slate-700 flex items-center justify-center gap-1.5 font-bold"
                      onClick={() => triggerAiAction("speed")}
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-500" />
                      Optimize Delay
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center italic text-slate-400 p-8">
                Select a device node on the canvas to inspect its custom PDK properties.
              </div>
            )}
          </div>
        )}

        {/* Connections tab */}
        {activePropertyTab === "connections" && (
          <div className="space-y-3 text-slate-600 text-xs font-semibold">
            {selectedComponentId ? (
              <>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">Pins Connectivity Map</h4>
                {localConnections.filter(c => c.comp === selectedComponentId).map(conn => (
                  <div key={conn.pin} className="flex justify-between items-center bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold font-mono">
                    <span className="text-slate-500">Pin {conn.pin}</span>
                    <input
                      type="text"
                      value={conn.net}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLocalConnections(prev => prev.map(c => {
                          if (c.comp === selectedComponentId && c.pin === conn.pin) {
                            return { ...c, net: val };
                          }
                          return c;
                        }));
                      }}
                      className="bg-white border border-slate-200 text-slate-880 text-slate-800 px-2 py-0.5 rounded outline-none text-right font-bold w-24 text-[10.5px]"
                    />
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center italic text-slate-400 p-8">
                Select a component to trace its terminal pins and networks.
              </div>
            )}
          </div>
        )}

        {/* History tab */}
        {activePropertyTab === "history" && (
          <div className="space-y-2.5 text-xs text-slate-600 font-semibold font-sans">
            {designs.map(design => (
              <div key={design.id} className="border border-slate-200/80 hover:bg-slate-50 p-3 rounded-2xl shadow-sm transition space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-extrabold font-mono">v{design.version}</span>
                  <span className="text-[9.5px] text-slate-400 font-mono">{new Date(design.created_at).toLocaleString().split(",")[0]}</span>
                </div>
                <p className="text-[10.5px] text-slate-500 font-bold leading-normal">{design.prompt}</p>
                <button 
                  onClick={async () => {
                    if (confirm("Restore checkpoint values?")) {
                      setActiveDesign(design);
                    }
                  }}
                  className="w-full text-center py-1.5 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 rounded-xl transition text-[10px] font-bold text-slate-500"
                >
                  Restore v{design.version}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
