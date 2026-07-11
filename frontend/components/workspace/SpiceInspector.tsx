import React from 'react';

interface SpiceInspectorProps {
  netlist: string;
  onLineClick: (line: string) => void;
}

export function SpiceInspector({
  netlist,
  onLineClick
}: SpiceInspectorProps) {
  const lines = netlist.split('\n');

  return (
    <div className="flex-1 flex flex-col bg-card rounded-xl border border-border p-4 overflow-hidden h-full shadow-sm">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-border">
        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider font-sans">
          Compiled SPICE Subcircuit Netlist
        </span>
        <span className="text-[9px] bg-blue-50 text-primary font-bold px-2 py-0.5 rounded border border-blue-100 uppercase">
          SKY130 model mapping
        </span>
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-xs select-text leading-relaxed">
        {lines.map((line, idx) => {
          const isComment = line.trim().startsWith('*');
          const isPower = line.trim().startsWith('V');
          const isTransistor = line.trim().startsWith('X') || line.trim().startsWith('M');

          let textColor = "text-slate-700";
          if (isComment) textColor = "text-slate-400 italic";
          else if (isPower) textColor = "text-emerald-600";
          else if (isTransistor) textColor = "text-blue-600 font-bold";

          return (
            <div 
              key={idx}
              onClick={() => onLineClick(line)}
              className={`hover:bg-slate-50 px-2 py-0.5 rounded cursor-pointer transition-colors flex gap-4 ${textColor}`}
            >
              <span className="text-slate-400 text-[10px] w-6 text-right select-none">{idx + 1}</span>
              <span className="whitespace-pre">{line || ' '}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
