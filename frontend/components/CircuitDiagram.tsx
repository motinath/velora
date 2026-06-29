"use client";

import React, { useState } from "react";
import { Info, Play, Pause, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface CircuitNode {
  id: string;
  label: string;
  type: "input" | "output" | "gate" | "block" | "mux" | "register";
  x: number;
  y: number;
  width?: number;
  height?: number;
  inputs?: string[];
  outputs?: string[];
  description?: string;
}

interface CircuitConnection {
  from: string; // e.g. "nodeId" or "nodeId:portName"
  to: string;   // e.g. "nodeId" or "nodeId:portName"
  label?: string;
  color?: string;
}

interface CircuitDiagramProps {
  title?: string;
  nodes: CircuitNode[];
  connections: CircuitConnection[];
}

export default function CircuitDiagram({
  title = "Circuit Schematic",
  nodes = [],
  connections = []
}: CircuitDiagramProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<CircuitNode | null>(null);
  const [isAnimated, setIsAnimated] = useState(true);
  const [zoom, setZoom] = useState(1);

  // Standard dimensions
  const defaultWidth = 140;
  const defaultHeight = 80;

  // Find port coordinates for drawing wires
  const getPortCoordinates = (nodeIdWithPort: string, isOutput: boolean) => {
    const parts = nodeIdWithPort.split(":");
    const nodeId = parts[0];
    const portName = parts[1];

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };

    const w = node.width || defaultWidth;
    const h = node.height || defaultHeight;

    // Node center-based default
    if (!portName) {
      return {
        x: isOutput ? node.x + w : node.x,
        y: node.y + h / 2
      };
    }

    if (isOutput) {
      const outList = node.outputs || [];
      const index = outList.indexOf(portName);
      if (index === -1) return { x: node.x + w, y: node.y + h / 2 };
      
      const step = h / (outList.length + 1);
      return {
        x: node.x + w,
        y: node.y + step * (index + 1)
      };
    } else {
      const inList = node.inputs || [];
      const index = inList.indexOf(portName);
      if (index === -1) return { x: node.x, y: node.y + h / 2 };
      
      const step = h / (inList.length + 1);
      return {
        x: node.x,
        y: node.y + step * (index + 1)
      };
    }
  };

  // Node type styling helpers
  const getNodeBorderColor = (type: string, isHovered: boolean) => {
    if (isHovered) return "border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] bg-slate-900";
    switch (type) {
      case "input":
        return "border-cyan-500/40 text-cyan-400 bg-cyan-950/20";
      case "output":
        return "border-emerald-500/40 text-emerald-400 bg-emerald-950/20";
      case "register":
        return "border-blue-500/40 text-blue-400 bg-blue-950/20";
      case "mux":
        return "border-amber-500/40 text-amber-400 bg-amber-950/20";
      case "gate":
      case "block":
      default:
        return "border-purple-500/40 text-purple-400 bg-purple-950/20";
    }
  };

  const getNodeBadge = (type: string) => {
    switch (type) {
      case "input": return "IN";
      case "output": return "OUT";
      case "register": return "REG";
      case "mux": return "MUX";
      default: return "LOGIC";
    }
  };

  // Calculate dynamic canvas size
  const maxX = nodes.length > 0 ? Math.max(...nodes.map(n => n.x + (n.width || defaultWidth)), 800) : 800;
  const maxY = nodes.length > 0 ? Math.max(...nodes.map(n => n.y + (n.height || defaultHeight)), 350) : 350;

  return (
    <div className="w-full bg-[#070b12] border border-border/85 rounded-xl overflow-hidden shadow-2xl flex flex-col font-mono text-xs my-4 select-none">
      {/* Schematic Control bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/60 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-slate-200 tracking-wide text-[11px] uppercase">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAnimated(!isAnimated)}
            title={isAnimated ? "Pause Data Flows" : "Start Data Flows"}
            className="p-1 hover:text-cyan-400 text-slate-400 transition"
          >
            {isAnimated ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))}
            title="Zoom In"
            className="p-1 hover:text-cyan-400 text-slate-400 transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(z - 0.1, 0.7))}
            title="Zoom Out"
            className="p-1 hover:text-cyan-400 text-slate-400 transition"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => { setZoom(1); setSelectedNode(null); setHoveredNode(null); }}
            title="Reset View"
            className="p-1 hover:text-cyan-400 text-slate-400 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row relative flex-1 min-h-[350px]">
        {/* SVG Canvas Area */}
        <div className="flex-1 overflow-auto relative p-4 bg-[#05080f] min-h-[300px]">
          {/* Subtle grid background */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.03]" 
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }}
          />

          <div 
            className="transition-transform duration-200 origin-top-left"
            style={{ transform: `scale(${zoom})` }}
          >
            <svg 
              width={maxX + 50} 
              height={maxY + 50} 
              className="relative overflow-visible"
            >
              {/* Definitions for Glow Filter */}
              <defs>
                <filter id="wire-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Connections (Wires) */}
              {connections.map((conn, idx) => {
                const start = getPortCoordinates(conn.from, true);
                const end = getPortCoordinates(conn.to, false);
                
                // Extract node ids to detect hover state
                const fromNodeId = conn.from.split(":")[0];
                const toNodeId = conn.to.split(":")[0];
                
                const isConnectionHighlighted = 
                  hoveredNode === fromNodeId || hoveredNode === toNodeId;
                
                const wireColor = conn.color || "#475569";
                const activeColor = conn.color || "#06b6d4";

                // Generate bezier curve coordinates
                const midX = (start.x + end.x) / 2;
                const pathD = `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;

                return (
                  <g key={idx} className="transition-all duration-300">
                    {/* Shadow / Glow line */}
                    {isConnectionHighlighted && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke={activeColor}
                        strokeWidth="5"
                        strokeOpacity="0.4"
                        filter="url(#wire-glow)"
                      />
                    )}

                    {/* Main Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isConnectionHighlighted ? activeColor : wireColor}
                      strokeWidth={isConnectionHighlighted ? "2" : "1.5"}
                      strokeOpacity={isConnectionHighlighted ? "0.9" : "0.5"}
                      className="transition-all duration-300"
                    />

                    {/* Animated Flow Dots */}
                    {isAnimated && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isConnectionHighlighted ? activeColor : wireColor}
                        strokeWidth="1.5"
                        strokeDasharray="6, 12"
                        strokeDashoffset={isConnectionHighlighted ? "18" : "12"}
                        strokeOpacity={isConnectionHighlighted ? "1" : "0.3"}
                        style={{
                          animation: "wireFlow 1.2s linear infinite"
                        }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Node bodies (SVG container with HTML/Tailwind standard cards overlayed via foreignObject) */}
              {nodes.map((node) => {
                const w = node.width || defaultWidth;
                const h = node.height || defaultHeight;
                const isHovered = hoveredNode === node.id;
                const isSelected = selectedNode?.id === node.id;

                return (
                  <foreignObject
                    key={node.id}
                    x={node.x}
                    y={node.y}
                    width={w}
                    height={h}
                    className="overflow-visible"
                  >
                    <div
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={() => setSelectedNode(node)}
                      className={`h-full w-full rounded-xl border flex flex-col p-2.5 cursor-pointer backdrop-blur-md transition-all duration-300 ${
                        getNodeBorderColor(node.type, isHovered || isSelected)
                      }`}
                    >
                      {/* Node Header */}
                      <div className="flex items-center justify-between mb-1.5 border-b border-slate-800 pb-1">
                        <span className="font-semibold text-slate-100 text-[10px] truncate max-w-[80px]">
                          {node.label}
                        </span>
                        <span className="text-[7px] px-1 py-0.2 bg-slate-950 text-slate-400 border border-slate-800 rounded font-bold">
                          {getNodeBadge(node.type)}
                        </span>
                      </div>

                      {/* Ports visual labels */}
                      <div className="flex-1 flex justify-between items-center text-[8px] font-mono text-slate-500">
                        {/* Inputs list */}
                        <div className="flex flex-col gap-0.5 items-start">
                          {node.inputs?.map((p, idx) => (
                            <span key={idx} className="flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-slate-600" />
                              {p}
                            </span>
                          ))}
                        </div>
                        
                        {/* Outputs list */}
                        <div className="flex flex-col gap-0.5 items-end ml-auto">
                          {node.outputs?.map((p, idx) => (
                            <span key={idx} className="flex items-center gap-1">
                              {p}
                              <span className="w-1 h-1 rounded-full bg-cyan-500" />
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </foreignObject>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Info panel on side for selected node */}
        <div className="w-full md:w-56 bg-slate-950/20 border-t md:border-t-0 md:border-l border-border/60 p-4 flex flex-col justify-between max-h-[300px] md:max-h-none overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-slate-100 text-[11px] uppercase tracking-wide">Component Details</h4>
                <p className="text-slate-400 text-[10px] mt-0.5">{selectedNode.label}</p>
              </div>

              <div className="bg-slate-950/40 border border-border/40 p-2 rounded-lg space-y-1">
                <span className="text-slate-500 text-[8px] block uppercase font-semibold">Type</span>
                <span className="text-cyan-400 text-[10px] uppercase font-bold">{selectedNode.type}</span>
              </div>

              {selectedNode.description && (
                <div className="space-y-1">
                  <span className="text-slate-500 text-[8px] block uppercase font-semibold">Description</span>
                  <p className="text-slate-300 text-[10px] leading-relaxed font-sans">{selectedNode.description}</p>
                </div>
              )}

              {(selectedNode.inputs || selectedNode.outputs) && (
                <div className="grid grid-cols-2 gap-2 text-[9px] pt-1">
                  {selectedNode.inputs && (
                    <div>
                      <span className="text-slate-500 font-bold block mb-1">INPUTS</span>
                      <ul className="list-disc pl-3 text-slate-300 space-y-0.5">
                        {selectedNode.inputs.map(i => <li key={i}>{i}</li>)}
                      </ul>
                    </div>
                  )}
                  {selectedNode.outputs && (
                    <div>
                      <span className="text-slate-500 font-bold block mb-1">OUTPUTS</span>
                      <ul className="list-disc pl-3 text-slate-300 space-y-0.5">
                        {selectedNode.outputs.map(o => <li key={o}>{o}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-2">
              <Info className="w-6 h-6 text-slate-700 mb-2 animate-pulse" />
              <p className="text-[10px] leading-relaxed">
                Click any component block in the diagram to inspect its ports and functionality.
              </p>
            </div>
          )}

          {/* Quick status message */}
          {selectedNode && (
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="mt-4 text-[9px] text-center text-slate-400 hover:text-white bg-slate-800/40 border border-slate-700/50 py-1.5 rounded-lg transition"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      {/* Embedded CSS for wire animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wireFlow {
          from {
            stroke-dashoffset: 24;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}} />
    </div>
  );
}
