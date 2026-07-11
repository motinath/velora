"use client";

import React from "react";
import { useAppContext } from "../../app/providers";
import { FileCode } from "lucide-react";

export function RTLView() {
  const {
    activeProject,
    activeDesign
  } = useAppContext();

  if (!activeProject || !activeDesign) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-sans">
        Select or compile a design to view the RTL workspace.
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-[#151515] h-full text-slate-300 font-mono select-text">
      {/* Left Side: Explorer */}
      <div className="w-[200px] border-r border-[#252525] bg-[#1e1e1e] p-4 flex flex-col justify-between shrink-0 select-none">
        <div className="space-y-4">
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block font-sans">RTL Files Explorer</span>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-white font-bold p-1 bg-[#2d2d2d] rounded cursor-pointer">
              <FileCode className="w-3.5 h-3.5 text-amber-500" />
              <span>{activeProject.name.toLowerCase().replace(/\s+/g, "_")}.v</span>
            </div>
            <div className="flex items-center gap-2 p-1 hover:bg-[#2d2d2d] rounded cursor-pointer text-slate-500">
              <FileCode className="w-3.5 h-3.5 text-blue-500" />
              <span>tb_sram.v</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Editor */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="bg-[#1e1e1e] border-b border-[#151515] px-4 py-2 flex items-center gap-2 text-[10px] text-white">
          <FileCode className="w-3.5 h-3.5 text-amber-500" />
          <span>{activeProject.name.toLowerCase().replace(/\s+/g, "_")}.v</span>
        </div>

        <div className="flex-1 p-6 overflow-y-auto text-xs bg-[#151515] leading-relaxed text-emerald-400">
          <pre className="font-mono whitespace-pre select-text">
{`// ===================================================================
// VELORA AI-Generated Hardware RTL description
// Technology PDK: SKY130
// Design: ${activeProject.name}
// ===================================================================

module ${activeProject.name.toLowerCase().replace(/\s+/g, "_")} (
    input  wire        WL,
    inout  wire        BL,
    inout  wire        BLB,
    output logic       Q,
    output logic       QB
);

    // Cross-coupled CMOS feedback storage latch cell
    wire inv1_out;
    wire inv2_out;

    assign inv1_out = ~inv2_out;
    assign inv2_out = ~inv1_out;

    // Pass gates
    assign Q  = WL ? BL  : inv1_out;
    assign QB = WL ? BLB : inv2_out;

endmodule
`}
          </pre>
        </div>

        {/* Terminal */}
        <div className="h-[180px] border-t border-[#252525] bg-[#111111] flex flex-col">
          <div className="bg-[#1a1a1a] px-4 py-2 flex gap-4 text-[10px] font-sans text-slate-400 border-b border-[#252525]">
            <span className="text-white border-b-2 border-primary pb-1 font-bold cursor-pointer">Problems (0)</span>
            <span className="hover:text-white cursor-pointer">Terminal Output</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto text-[10px] text-slate-400 select-text leading-relaxed font-mono">
            <p className="text-emerald-500 font-bold">[INFO] Verilog compiler lint checks completed. status: PASSED.</p>
            <p className="text-slate-550">[INFO] Model parameters verified successfully against PDK boundary limits.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
