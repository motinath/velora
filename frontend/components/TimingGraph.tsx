"use client";

import React from "react";
import { AlertCircle, CheckCircle, Zap } from "lucide-react";

interface TimingNode {
  point: string;
  cell: string;
  incr: number;
  arrival: number;
}

interface TimingGraphProps {
  slack: number;
  startpoint: string;
  endpoint: string;
  pathGroup: string;
  pathType: string;
  nodes: TimingNode[];
}

export default function TimingGraph({
  slack,
  startpoint,
  endpoint,
  pathGroup,
  pathType,
  nodes = []
}: TimingGraphProps) {
  const isViolated = slack < 0;

  return (
    <div className="bg-card rounded-lg border border-border p-4 flex flex-col h-full overflow-hidden">
      {/* Timing Stats Bar */}
      <div className={`flex items-center justify-between p-3 rounded-lg border mb-4 transition-all duration-300 ${
        isViolated 
          ? "bg-red-950/20 border-red-900/50 glow-red" 
          : "bg-emerald-950/20 border-emerald-900/50 glow-green"
      }`}>
        <div className="flex items-center gap-3">
          {isViolated ? (
            <AlertCircle className="w-6 h-6 text-red-500 animate-pulse" />
          ) : (
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          )}
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Static Timing Slack</h4>
            <p className="text-xs text-slate-400">Path Group: <span className="font-mono">{pathGroup}</span> | Type: {pathType}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-mono font-bold ${isViolated ? "text-red-500" : "text-emerald-500"}`}>
            {slack > 0 ? `+${slack.toFixed(3)}` : slack.toFixed(3)} ns
          </span>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{isViolated ? "Violated" : "Met"}</p>
        </div>
      </div>

      {/* Path Endpoints */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-4 border-b border-border/50 pb-3">
        <div className="bg-slate-900/40 p-2 rounded border border-border/30">
          <span className="text-slate-500 block mb-1 text-[10px] uppercase">Launch Pin (Start)</span>
          <span className="text-slate-300 truncate block" title={startpoint}>{startpoint}</span>
        </div>
        <div className="bg-slate-900/40 p-2 rounded border border-border/30">
          <span className="text-slate-500 block mb-1 text-[10px] uppercase">Capture Pin (End)</span>
          <span className="text-slate-300 truncate block" title={endpoint}>{endpoint}</span>
        </div>
      </div>

      {/* Path Delay Graph Flow */}
      <div className="flex-1 overflow-y-auto pr-1">
        <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Data Path Gate Sequence</h5>
        
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 border border-dashed border-border rounded text-slate-500 text-xs gap-2">
            <Zap className="w-5 h-5 text-slate-600" />
            No path segments parsed from report file.
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-slate-800 space-y-4 my-2">
            {nodes.map((node, idx) => (
              <div key={idx} className="relative group">
                {/* Node marker point on time line */}
                <div className={`absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full border-2 transition-all group-hover:scale-125 ${
                  isViolated ? "bg-red-500 border-red-950" : "bg-emerald-500 border-emerald-950"
                }`} />
                
                {/* Node Details Card */}
                <div className="bg-slate-950/60 p-2 rounded border border-border/40 hover:border-slate-700 transition flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono text-slate-300 block font-medium truncate max-w-[200px]" title={node.point}>
                      {node.point.split('/').pop()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Cell: {node.cell}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-primary block font-medium">+{node.incr.toFixed(3)} ns</span>
                    <span className="text-[10px] text-slate-400">Total: {node.arrival.toFixed(3)} ns</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
