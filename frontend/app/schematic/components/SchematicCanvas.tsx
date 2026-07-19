import React, { useRef } from "react";
import { MousePointer, ZoomIn, ZoomOut, RotateCcw, Sparkles, Sliders, AlertTriangle } from "lucide-react";
import { SchematicNode, Connection, Wire, PositionMap } from "../types";

interface SchematicCanvasProps {
  localNodes: SchematicNode[];
  localConnections: Connection[];
  localPositions: PositionMap;
  localWires: Wire[];
  highlightedNet: string | null;
  setHighlightedNet: (net: string | null) => void;
  selectedComponentId: string | null;
  setSelectedComponentId: (id: string | null) => void;
  interactionMode: "pointer" | "wire" | "place";
  setInteractionMode: (mode: "pointer" | "wire" | "place") => void;
  placingDeviceType: string | null;
  wireStart: { comp: string; pin: string } | null;
  canvasOffset: { x: number; y: number };
  setCanvasOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  canvasZoom: number;
  setCanvasZoom: React.Dispatch<React.SetStateAction<number>>;
  isPanning: boolean;
  snapToGrid: boolean;
  setSnapToGrid: (val: boolean) => void;
  currentLayer: string;
  setCurrentLayer: (layer: string) => void;
  handleNodeMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  handleContextMenu: (e: React.MouseEvent, nodeId: string) => void;
  handleCanvasMouseMove: (e: React.MouseEvent) => void;
  handleCanvasMouseUp: () => void;
  handleCanvasMouseDown: (e: React.MouseEvent) => void;
  handlePinClick: (e: React.MouseEvent, nodeId: string, pin: string) => void;
  handleInspectorParamChange: (name: string, val: number) => void;
  dragStartPos: { x: number; y: number };
}

export function SchematicCanvas({
  localNodes,
  localConnections,
  localPositions,
  localWires,
  highlightedNet,
  setHighlightedNet,
  selectedComponentId,
  setSelectedComponentId,
  interactionMode,
  setInteractionMode,
  placingDeviceType,
  wireStart,
  canvasOffset,
  setCanvasOffset,
  canvasZoom,
  setCanvasZoom,
  isPanning,
  snapToGrid,
  setSnapToGrid,
  currentLayer,
  setCurrentLayer,
  handleNodeMouseDown,
  handleContextMenu,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  handleCanvasMouseDown,
  handlePinClick,
  handleInspectorParamChange,
  dragStartPos,
}: SchematicCanvasProps) {
  
  // Calculate pin coordinate
  const getPinCoord = (nodeId: string, pin: string) => {
    const pos = localPositions[nodeId] || { x: 400, y: 250 };
    const node = localNodes.find(n => n.id === nodeId);
    const type = node?.category || node?.type || "NMOS";
    let dx = 0, dy = 0;

    if (type === "PMOS" || type === "NMOS") {
      if (pin === "D") { dx = 20; dy = 15; }
      else if (pin === "S") { dx = 20; dy = -15; }
      else if (pin === "G") { dx = -20; dy = 0; }
      else if (pin === "B") { dx = 10; dy = 0; }
    } else if (type === "VDD") {
      dx = 0; dy = 20;
    } else if (type === "GND") {
      dx = 0; dy = -10;
    } else if (type === "PIN") {
      dx = 0; dy = 0;
    } else { // RES, CAP
      if (pin === "1") { dx = 0; dy = -20; }
      else if (pin === "2") { dx = 0; dy = 20; }
    }

    const rot = node?.rotation || 0;
    const rad = (rot * Math.PI) / 180;
    const rx = Math.round(dx * Math.cos(rad) - dy * Math.sin(rad));
    const ry = Math.round(dx * Math.sin(rad) + dy * Math.cos(rad));
    return { x: pos.x + rx, y: pos.y + ry };
  };

  // Render nets
  const renderInteractiveConnections = () => {
    const netGroups: Record<string, typeof localConnections> = {};
    localConnections.forEach(conn => {
      if (!conn.net) return;
      netGroups[conn.net] = netGroups[conn.net] || [];
      netGroups[conn.net].push(conn);
    });

    return Object.entries(netGroups).map(([netName, conns]) => {
      const isHighlighted = highlightedNet === netName;
      const color = netName === "VDD" ? "#ef4444" : netName === "GND" ? "#10b981" : netName === "WL" ? "#eab308" : "#3b82f6";
      const pts = conns.map(c => getPinCoord(c.comp, c.pin));
      if (pts.length < 2) return null;

      return (
        <g key={netName} className="cursor-pointer" onClick={() => setHighlightedNet(netName)}>
          {pts.map((pt, idx) => {
            if (idx === 0) return null;
            const prev = pts[idx - 1];
            return (
              <g key={idx}>
                <line
                  x1={prev.x}
                  y1={prev.y}
                  x2={pt.x}
                  y2={pt.y}
                  stroke={isHighlighted ? "#2563eb" : color}
                  strokeWidth={isHighlighted ? "4.5" : "2.5"}
                  strokeLinecap="round"
                  className="transition-all duration-150"
                />
                {isHighlighted && (
                  <line
                    x1={prev.x}
                    y1={prev.y}
                    x2={pt.x}
                    y2={pt.y}
                    stroke="#3b82f6"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className="opacity-20 animate-pulse"
                  />
                )}
              </g>
            );
          })}
        </g>
      );
    });
  };

  // Render components symbols
  const renderInteractiveNodes = () => {
    return localNodes.map(node => {
      const pos = localPositions[node.id] || { x: 300, y: 200 };
      const isSelected = selectedComponentId === node.id;
      const type = node.category || node.type || "NMOS";
      const rotation = node.rotation || 0;
      const flipScale = node.flipped ? -1 : 1;
      const isNetHighlighted = highlightedNet && localConnections.some(c => c.comp === node.id && c.net === highlightedNet);

      return (
        <g 
          key={node.id}
          transform={`translate(${pos.x}, ${pos.y}) rotate(${rotation}) scale(${flipScale}, 1)`}
          onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
          onContextMenu={(e) => handleContextMenu(e, node.id)}
          className={`cursor-grab select-none active:cursor-grabbing ${isSelected ? "text-blue-600 drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]" : "text-slate-900"} ${isNetHighlighted ? "drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]" : ""}`}
        >
          {isSelected && (
            <rect 
              x="-28" 
              y="-28" 
              width="56" 
              height="56" 
              fill="none" 
              stroke="#2563eb" 
              strokeWidth="1.5" 
              strokeDasharray="2,2" 
              className="animate-pulse"
            />
          )}

          {/* PMOS */}
          {type === "PMOS" && (
            <>
              <line x1="-20" y1="0" x2="-10" y2="0" stroke="currentColor" strokeWidth="2" />
              <line x1="-10" y1="-20" x2="-10" y2="20" stroke="currentColor" strokeWidth="3" />
              <circle cx="-5" cy="0" r="3.5" fill="white" stroke="currentColor" strokeWidth="2" />
              <line x1="0" y1="-20" x2="0" y2="20" stroke="currentColor" strokeWidth="3" />
              <line x1="0" y1="-15" x2="20" y2="-15" stroke="currentColor" strokeWidth="2" />
              <line x1="0" y1="15" x2="20" y2="15" stroke="currentColor" strokeWidth="2" />
              <line x1="0" y1="0" x2="10" y2="0" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="-20" cy="0" r="4.5" fill="#ef4444" className="opacity-0 hover:opacity-100 cursor-pointer transition-opacity" onClick={(e) => handlePinClick(e, node.id, "G")} />
              <circle cx="20" cy="-15" r="4.5" fill="#ef4444" className="opacity-0 hover:opacity-100 cursor-pointer transition-opacity" onClick={(e) => handlePinClick(e, node.id, "S")} />
              <circle cx="20" cy="15" r="4.5" fill="#ef4444" className="opacity-0 hover:opacity-100 cursor-pointer transition-opacity" onClick={(e) => handlePinClick(e, node.id, "D")} />
            </>
          )}

          {/* NMOS */}
          {type === "NMOS" && (
            <>
              <line x1="-20" y1="0" x2="-10" y2="0" stroke="currentColor" strokeWidth="2" />
              <line x1="-10" y1="-20" x2="-10" y2="20" stroke="currentColor" strokeWidth="3" />
              <line x1="0" y1="-20" x2="0" y2="20" stroke="currentColor" strokeWidth="3" />
              <line x1="0" y1="-15" x2="20" y2="-15" stroke="currentColor" strokeWidth="2" />
              <line x1="0" y1="15" x2="20" y2="15" stroke="currentColor" strokeWidth="2" />
              <line x1="0" y1="0" x2="10" y2="0" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="-20" cy="0" r="4.5" fill="#ef4444" className="opacity-0 hover:opacity-100 cursor-pointer transition-opacity" onClick={(e) => handlePinClick(e, node.id, "G")} />
              <circle cx="20" cy="-15" r="4.5" fill="#ef4444" className="opacity-0 hover:opacity-100 cursor-pointer transition-opacity" onClick={(e) => handlePinClick(e, node.id, "S")} />
              <circle cx="20" cy="15" r="4.5" fill="#ef4444" className="opacity-0 hover:opacity-100 cursor-pointer transition-opacity" onClick={(e) => handlePinClick(e, node.id, "D")} />
            </>
          )}

          {/* Resistor */}
          {type === "RES" && (
            <>
              <line x1="0" y1="-25" x2="0" y2="-15" stroke="currentColor" strokeWidth="2" />
              <rect x="-6" y="-15" width="12" height="30" fill="white" stroke="currentColor" strokeWidth="2" />
              <line x1="0" y1="15" x2="0" y2="25" stroke="currentColor" strokeWidth="2" />
              <circle cx="0" cy="-25" r="4.5" fill="#ef4444" className="opacity-0 hover:opacity-100 cursor-pointer transition-opacity" onClick={(e) => handlePinClick(e, node.id, "1")} />
              <circle cx="0" cy="25" r="4.5" fill="#ef4444" className="opacity-0 hover:opacity-100 cursor-pointer transition-opacity" onClick={(e) => handlePinClick(e, node.id, "2")} />
            </>
          )}

          {/* VDD */}
          {type === "VDD" && (
            <>
              <line x1="0" y1="0" x2="0" y2="20" stroke="currentColor" strokeWidth="2" />
              <polygon points="0,0 -8,12 8,12" fill="currentColor" />
            </>
          )}

          {/* GND */}
          {type === "GND" && (
            <>
              <line x1="0" y1="0" x2="0" y2="-10" stroke="currentColor" strokeWidth="2" />
              <line x1="-12" y1="-10" x2="12" y2="-10" stroke="currentColor" strokeWidth="2" />
              <line x1="-8" y1="-14" x2="8" y2="-14" stroke="currentColor" strokeWidth="2" />
              <line x1="-4" y1="-18" x2="4" y2="-18" stroke="currentColor" strokeWidth="2" />
            </>
          )}

          {/* PIN */}
          {type === "PIN" && (
            <>
              <circle cx="0" cy="0" r="5" fill="#3b82f6" />
              <circle cx="0" cy="0" r="1.5" fill="white" />
            </>
          )}

          {/* Label text */}
          <text 
            x="0" 
            y={type === "VDD" ? "26" : type === "GND" ? "-24" : "32"} 
            className="text-[9.5px] font-mono font-black fill-slate-500 uppercase text-center" 
            textAnchor="middle"
            transform={rotation !== 0 ? `rotate(${-rotation})` : ""}
          >
            {node.id}
          </text>
        </g>
      );
    });
  };

  const activeComponentObj = localNodes.find(n => n.id === selectedComponentId);

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-50 relative">
      {/* Top panel layer selector */}
      <div className="flex justify-between items-center px-6 py-2.5 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <button
            className={`text-[10px] font-bold px-2 py-1 border rounded-lg transition-all ${
              snapToGrid ? "bg-blue-50 border-blue-200 text-blue-600" : "border-slate-200 hover:bg-slate-100 text-slate-400"
            }`}
            onClick={() => setSnapToGrid(!snapToGrid)}
          >
            Snap to Grid
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] uppercase font-bold text-slate-400 mr-1.5">Layer:</span>
          <select
            value={currentLayer}
            onChange={(e) => setCurrentLayer(e.target.value)}
            className="bg-slate-55 bg-slate-50 border border-slate-200 font-bold outline-none text-slate-700 cursor-pointer text-[10.5px] px-2 py-1 rounded-lg"
          >
            <option>All Layers</option>
            <option>Metal1</option>
            <option>Metal2</option>
            <option>Poly</option>
            <option>Pins</option>
            <option>Labels</option>
            <option>Power</option>
          </select>
        </div>
      </div>

      {/* Grid Canvas Workspace */}
      <div 
        className="flex-1 relative overflow-hidden bg-white select-none border-b border-slate-200 min-h-0"
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseDown={handleCanvasMouseDown}
      >
        {/* Dot background */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none grid-background" style={{
          backgroundImage: "radial-gradient(#1e293b 1.2px, transparent 1.2px)",
          backgroundSize: "20px 20px",
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${canvasZoom})`,
          transformOrigin: "0 0"
        }} />

        {/* Ruler */}
        <div className="absolute top-0 left-0 w-full h-4 bg-slate-100/90 border-b border-slate-200 text-[8px] font-bold text-slate-400 font-mono z-10 flex items-center pl-6">
          {Array.from({ length: 15 }).map((_, i) => (
            <span key={i} style={{ width: 100 }}>{i * 100}</span>
          ))}
        </div>

        {/* SVG Drawing Canvas */}
        <svg 
          className="w-full h-full overflow-visible"
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${canvasZoom})`,
            transformOrigin: "0 0",
            transition: isPanning ? "none" : "transform 0.1s ease-out"
          }}
        >
          <g>
            {renderInteractiveConnections()}
            
            {wireStart && (
              <line
                x1={getPinCoord(wireStart.comp, wireStart.pin).x}
                y1={getPinCoord(wireStart.comp, wireStart.pin).y}
                x2={(dragStartPos.x - canvasOffset.x) / canvasZoom}
                y2={(dragStartPos.y - canvasOffset.y) / canvasZoom}
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
            )}

            {renderInteractiveNodes()}
          </g>
        </svg>

        {/* Canvas Toolbar zoom controls */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-400 text-xs flex items-center gap-3 shadow-lg select-none z-10 font-bold">
          <button 
            className={`hover:text-white transition ${interactionMode === "pointer" ? "text-blue-500" : ""}`}
            onClick={() => setInteractionMode("pointer")}
          >
            <MousePointer className="w-3.5 h-3.5" />
          </button>
          <button 
            className={`hover:text-white transition ${interactionMode === "wire" ? "text-blue-500" : ""}`}
            onClick={() => setInteractionMode("wire")}
          >
            Wire
          </button>
          <span className="text-slate-850">|</span>
          <button className="hover:text-white transition" onClick={() => setCanvasZoom(prev => Math.min(2.5, prev + 0.15))}><ZoomIn className="w-3.5 h-3.5" /></button>
          <button className="hover:text-white transition" onClick={() => setCanvasZoom(prev => Math.max(0.4, prev - 0.15))}><ZoomOut className="w-3.5 h-3.5" /></button>
          <button className="hover:text-white transition" onClick={() => { setCanvasZoom(1); setCanvasOffset({ x: 0, y: 0 }); }}><RotateCcw className="w-3.5 h-3.5" /></button>
        </div>

        {/* Placing overlay Instruction banner */}
        {interactionMode === "place" && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-full shadow-lg z-20 uppercase tracking-widest animate-pulse flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Place Mode Active: Click on canvas to drop {placingDeviceType}</span>
          </div>
        )}

        {/* Canvas-level Floating Quick Specs Overlay */}
        {selectedComponentId && activeComponentObj && (
          <div className="absolute bottom-4 right-4 bg-slate-900/95 backdrop-blur border border-slate-800 text-white p-4 rounded-2xl w-60 shadow-2xl z-20 font-sans space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black text-slate-100">{selectedComponentId} ({activeComponentObj.type})</span>
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Spec</span>
            </div>

            {/* Parameters input range sliders */}
            <div className="space-y-2">
              {Object.entries(activeComponentObj.properties?.parameters || {}).map(([paramName, val]: [string, any]) => {
                const warning = paramName === "W" && val < 0.36
                  ? "Under PDK Limit"
                  : paramName === "L" && val < 0.15
                  ? "Under PDK Limit"
                  : "";

                return (
                  <div key={paramName} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>{paramName === "W" ? "Width (W)" : "Length (L)"}</span>
                      <span className={warning ? "text-red-400 font-extrabold" : "text-emerald-400 font-extrabold font-mono"}>{val} um</span>
                    </div>
                    <input
                      type="range"
                      min={paramName === "W" ? 0.2 : 0.1}
                      max={paramName === "W" ? 3.0 : 1.5}
                      step="0.01"
                      value={val}
                      onChange={(e) => handleInspectorParamChange(paramName, parseFloat(e.target.value) || 0)}
                      className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                    {warning && (
                      <span className="text-[8.5px] text-red-400 font-bold block">{warning} (Min: {paramName === "W" ? "0.36" : "0.15"}µm)</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mini Waveform Chart */}
            <div className="space-y-1 pt-1.5 border-t border-slate-800">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Transient Voltage Sweep</span>
              <div className="h-12 bg-slate-950/80 rounded-lg flex items-center justify-center relative overflow-hidden border border-slate-800/50">
                <svg className="w-full h-full p-1" viewBox="0 0 100 30">
                  <path 
                    d="M 5,25 Q 15,5 95,5" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="1.5" 
                  />
                </svg>
                <span className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-500 font-extrabold">OUT vs time</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
