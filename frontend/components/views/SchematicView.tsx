"use client";

import React from "react";
import { useAppContext } from "../../app/providers";
import { SchematicCanvas } from "../workspace/SchematicCanvas";
import { PropertiesInspector } from "../workspace/PropertiesInspector";

export function SchematicView() {
  const {
    activeProject,
    activeDesign,
    selectedComponentId,
    setSelectedComponentId,
    handleComponentParameterChange
  } = useAppContext();

  if (!activeProject || !activeDesign) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-sans">
        Select or compile a design to view the Schematic.
      </div>
    );
  }

  const activeComponentObj = activeDesign?.circuit_graph_json?.nodes?.find(
    (n: any) => n.id === selectedComponentId
  );

  return (
    <div className="flex-1 flex overflow-hidden bg-background h-full font-sans">
      {/* Left Side: Toolbar and Schematic Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Toolbar */}
        <div className="border-b border-border bg-card p-3 flex justify-between items-center z-10 select-none">
          <div className="flex items-center gap-2">
            <button onClick={() => alert("Zoom In")} className="p-2 hover:bg-slate-50 border border-border rounded-lg text-[10px] font-bold uppercase text-slate-700">Zoom In</button>
            <button onClick={() => alert("Zoom Out")} className="p-2 hover:bg-slate-50 border border-border rounded-lg text-[10px] font-bold uppercase text-slate-700">Zoom Out</button>
            <button onClick={() => alert("Toggle Grid Grid")} className="p-2 hover:bg-slate-50 border border-border rounded-lg text-[10px] font-bold uppercase text-slate-700">Grid: On</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => alert("Undo sizing change")} className="p-2 hover:bg-slate-50 border border-border rounded-lg text-[10px] font-bold uppercase text-slate-700">Undo</button>
            <button onClick={() => alert("Redo sizing change")} className="p-2 hover:bg-slate-50 border border-border rounded-lg text-[10px] font-bold uppercase text-slate-700">Redo</button>
            <button onClick={() => alert("AI sizing optimizer initiated")} className="bg-primary/10 text-primary border border-primary/20 p-2 hover:bg-primary/20 rounded-lg text-[10px] font-bold uppercase">AI Optimize</button>
          </div>
        </div>

        {/* Schematic Canvas */}
        <div className="flex-1 relative overflow-hidden bg-slate-50 flex items-center justify-center">
          <SchematicCanvas
            activeDesign={activeDesign}
            selectedComponentId={selectedComponentId}
            onSelectComponent={setSelectedComponentId}
          />
        </div>
      </div>

      {/* Right Side: Properties Inspector */}
      <PropertiesInspector
        activeProject={activeProject}
        activeComponentObj={activeComponentObj}
        activeDesign={activeDesign}
        onParameterChange={handleComponentParameterChange}
      />
    </div>
  );
}
