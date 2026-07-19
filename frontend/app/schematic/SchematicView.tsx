"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../../app/providers";
import { api } from "../../lib/api";
import { 
  Sliders, 
  CheckCircle, 
  Undo2, 
  Share2, 
  MoreVertical, 
  CircleDot, 
  Save, 
  Plus
} from "lucide-react";

import { SchematicNode, Connection, Wire, PositionMap, ConsoleTabType, PropertyTabType } from "./types";
import { SchematicCanvas } from "./components/SchematicCanvas";
import { PropertiesInspector } from "./components/PropertiesInspector";
import { ConsoleTabs } from "./components/ConsoleTabs";
import { WirePromptDialog, SizingDialog } from "./components/Dialogs";

export function SchematicView() {
  const {
    activeProject,
    activeDesign,
    setActiveDesign,
    designs,
    setDesigns,
    selectedComponentId,
    setSelectedComponentId,
    vddSlider,
    optimization,
  } = useAppContext();

  // --- Interactive CAD Editor State ---
  const [localNodes, setLocalNodes] = useState<SchematicNode[]>([]);
  const [localConnections, setLocalConnections] = useState<Connection[]>([]);
  const [localPositions, setLocalPositions] = useState<PositionMap>({});
  const [localWires, setLocalWires] = useState<Wire[]>([]);
  
  // Selection / Interaction modes
  const [interactionMode, setInteractionMode] = useState<"pointer" | "wire" | "place">("pointer");
  const [placingDeviceType, setPlacingDeviceType] = useState<string | null>(null);
  
  // Wire creation state
  const [wireStart, setWireStart] = useState<{ comp: string; pin: string } | null>(null);
  const [wirePromptOpen, setWirePromptOpen] = useState(false);
  const [selectedWireNet, setSelectedWireNet] = useState("net_new");
  
  // UI Tabs & Sidebar Sections
  const [activePropertyTab, setActivePropertyTab] = useState<PropertyTabType>("properties");
  const [activeConsoleTab, setActiveConsoleTab] = useState<ConsoleTabType>("compiler");
  const [currentLayer, setCurrentLayer] = useState<string>("All Layers");
  
  // Infinite canvas pan & zoom
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  // Grid / Snapping
  const [snapToGrid, setSnapToGrid] = useState(true);
  const GRID_SIZE = 20;

  // Temp drag state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

  // Dialog & Menu Popups
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [aiDialog, setAiDialog] = useState<{
    open: boolean;
    nodeId: string;
    suggestion: string;
    actionType: string;
    targetWidth: number;
  } | null>(null);

  const [savingCheckpoint, setSavingCheckpoint] = useState(false);
  const [highlightedNet, setHighlightedNet] = useState<string | null>(null);

  // Load state when design changes
  useEffect(() => {
    if (activeDesign) {
      const nodes = activeDesign.circuit_graph_json?.nodes || [];
      const edges = activeDesign.circuit_graph_json?.edges || [];
      
      setLocalNodes(nodes);
      
      const conns = edges.map((e: any) => ({
        comp: e.from_node,
        pin: e.from_pin,
        net: e.to_net
      }));
      setLocalConnections(conns);

      const posMap: PositionMap = {};
      if (activeDesign.schematic_json?.nodes) {
        activeDesign.schematic_json.nodes.forEach((n: any) => {
          posMap[n.id] = { x: n.x, y: n.y };
        });
      } else {
        nodes.forEach((n: any, i: number) => {
          posMap[n.id] = { x: 100 + (i % 3) * 150, y: 120 + Math.floor(i / 3) * 120 };
        });
      }
      setLocalPositions(posMap);
      setLocalWires(activeDesign.schematic_json?.wires || []);
    }
  }, [activeDesign]);

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" || 
        target.tagName === "TEXTAREA" || 
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "w") {
        setInteractionMode("wire");
      } else if (key === "escape") {
        setInteractionMode("pointer");
        setSelectedComponentId(null);
        setContextMenu(null);
      } else if (key === "r") {
        if (selectedComponentId) rotateSelectedNode();
      } else if (key === "m" || key === "f") {
        if (selectedComponentId) mirrorSelectedNode();
      } else if (key === "d") {
        if (selectedComponentId) duplicateSelectedNode();
      } else if (key === "delete" || key === "backspace") {
        if (selectedComponentId) deleteSelectedNode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedComponentId, interactionMode]);

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-xs bg-[#f8fafc] font-sans font-bold">
        Select or create a project to load the Schematic Editor.
      </div>
    );
  }

  // Drag handlers
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (interactionMode !== "pointer") return;
    e.stopPropagation();
    setDraggedNodeId(nodeId);
    setSelectedComponentId(nodeId);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setCanvasOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      panStart.current = { x: e.clientX, y: e.clientY };
    } else if (draggedNodeId) {
      const dx = (e.clientX - dragStartPos.x) / canvasZoom;
      const dy = (e.clientY - dragStartPos.y) / canvasZoom;
      
      setLocalPositions(prev => {
        const current = prev[draggedNodeId] || { x: 400, y: 250 };
        let newX = current.x + dx;
        let newY = current.y + dy;
        
        if (snapToGrid) {
          newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
          newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
        }

        return {
          ...prev,
          [draggedNodeId]: { x: newX, y: newY }
        };
      });
      setDragStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.shiftKey) {
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
      return;
    }
    
    const target = e.target as HTMLElement;
    if (target.classList.contains("grid-background") || target.tagName === "svg") {
      setSelectedComponentId(null);
      setContextMenu(null);
      
      if (interactionMode === "place" && placingDeviceType) {
        const rect = target.getBoundingClientRect();
        let x = (e.clientX - rect.left - canvasOffset.x) / canvasZoom;
        let y = (e.clientY - rect.top - canvasOffset.y) / canvasZoom;
        
        if (snapToGrid) {
          x = Math.round(x / GRID_SIZE) * GRID_SIZE;
          y = Math.round(y / GRID_SIZE) * GRID_SIZE;
        }

        const newId = `M_NEW_${Date.now().toString().slice(-4)}`;
        const modelName = placingDeviceType === "PMOS" ? "sky130_fd_pr__pfet_01v8" : placingDeviceType === "NMOS" ? "sky130_fd_pr__nfet_01v8" : "sky130_fd_pr__res";
        
        const newNode: SchematicNode = {
          id: newId,
          type: placingDeviceType,
          category: placingDeviceType,
          rotation: 0,
          flipped: false,
          properties: {
            model: modelName,
            parameters: placingDeviceType === "RES" ? { R: 1000 } : { W: 0.36, L: 0.15 },
            pins: placingDeviceType === "RES" ? ["1", "2"] : ["G", "S", "D"]
          }
        };

        setLocalNodes(prev => [...prev, newNode]);
        setLocalPositions(prev => ({ ...prev, [newId]: { x, y } }));
        setInteractionMode("pointer");
        setPlacingDeviceType(null);
      }
    }
  };

  const handlePinClick = (e: React.MouseEvent, nodeId: string, pin: string) => {
    e.stopPropagation();
    if (interactionMode !== "wire") return;

    if (!wireStart) {
      setWireStart({ comp: nodeId, pin });
      setSelectedComponentId(nodeId);
    } else {
      if (wireStart.comp === nodeId) {
        setWireStart(null);
        return;
      }
      setWirePromptOpen(true);
    }
  };

  const confirmWireConnection = () => {
    if (!wireStart) return;
    
    const newEdges = [
      { comp: wireStart.comp, pin: wireStart.pin, net: selectedWireNet },
      { comp: selectedComponentId!, pin: localNodes.find(n => n.id === selectedComponentId)?.properties?.pins?.[0] || "D", net: selectedWireNet }
    ];

    setLocalConnections(prev => [...prev, ...newEdges]);
    setWireStart(null);
    setWirePromptOpen(false);
    setInteractionMode("pointer");
  };

  const deleteSelectedNode = () => {
    if (!selectedComponentId) return;
    setLocalNodes(prev => prev.filter(n => n.id !== selectedComponentId));
    setLocalConnections(prev => prev.filter(c => c.comp !== selectedComponentId));
    setLocalPositions(prev => {
      const copy = { ...prev };
      delete copy[selectedComponentId];
      return copy;
    });
    setSelectedComponentId(null);
  };

  const rotateSelectedNode = () => {
    if (!selectedComponentId) return;
    setLocalNodes(prev => prev.map(n => {
      if (n.id === selectedComponentId) {
        return { ...n, rotation: ((n.rotation || 0) + 90) % 360 };
      }
      return n;
    }));
  };

  const mirrorSelectedNode = () => {
    if (!selectedComponentId) return;
    setLocalNodes(prev => prev.map(n => {
      if (n.id === selectedComponentId) {
        return { ...n, flipped: !n.flipped };
      }
      return n;
    }));
  };

  const duplicateSelectedNode = () => {
    if (!selectedComponentId) return;
    const current = localNodes.find(n => n.id === selectedComponentId);
    if (!current) return;
    
    const newId = `${current.id}_DUP`;
    const currentPos = localPositions[selectedComponentId] || { x: 300, y: 200 };
    
    const duplicate = {
      ...current,
      id: newId,
      rotation: current.rotation || 0
    };

    setLocalNodes(prev => [...prev, duplicate]);
    setLocalPositions(prev => ({
      ...prev,
      [newId]: { x: currentPos.x + 40, y: currentPos.y + 40 }
    }));
    setSelectedComponentId(newId);
  };

  const handleSaveWorkspace = async () => {
    if (!activeDesign) return;
    setSavingCheckpoint(true);
    setActiveConsoleTab("compiler");

    try {
      const reqComponents = localNodes.map(n => ({
        id: n.id,
        type: n.category || n.type || "NMOS",
        parameters: n.properties?.parameters || {}
      }));

      const reqConnections = localConnections.map(c => ({
        comp: c.comp,
        pin: c.pin,
        net: c.net
      }));

      const nodesLayoutList = localNodes.map(n => ({
        id: n.id,
        label: n.id,
        type: n.category || n.type || "NMOS",
        x: localPositions[n.id]?.x || 300,
        y: localPositions[n.id]?.y || 200,
        properties: n.properties || {}
      }));

      const reqLayout = {
        width: 800,
        height: 520,
        nodes: nodesLayoutList,
        wires: localWires
      };

      const result = await api.saveDesign(
        activeDesign.id,
        reqComponents,
        reqConnections,
        reqLayout,
        vddSlider,
        optimization
      );

      setActiveDesign(result);
      setDesigns([result, ...designs]);
      alert(`Checkpoint saved successfully! Created design checkpoint v${result.version}`);
    } catch (err: any) {
      alert(`Save compilation failed: ${err.message}`);
    } finally {
      setSavingCheckpoint(false);
    }
  };

  const handleInspectorParamChange = (paramName: string, value: number) => {
    if (!selectedComponentId) return;
    setLocalNodes(prev => prev.map(n => {
      if (n.id === selectedComponentId) {
        const params = { ...(n.properties?.parameters || {}) };
        params[paramName] = value;
        return {
          ...n,
          properties: {
            ...(n.properties || {}),
            parameters: params
          }
        };
      }
      return n;
    }));
  };

  const handleContextMenu = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedComponentId(nodeId);
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
  };

  const triggerAiAction = (actionType: string) => {
    setContextMenu(null);
    if (!selectedComponentId) return;
    
    let suggestion = "";
    let targetWidth = 1.2;
    if (actionType === "leakage") {
      suggestion = "Leakage high on this node. Increase channel length L from 0.15u to 0.25u. Estimated standby leakage reduction: -14%.";
      targetWidth = 0.6;
    } else if (actionType === "speed") {
      suggestion = "Improve Rise Time. Increase pull-up PMOS Width W from 0.36u to 1.2u. Estimated rise time delay improvement: +12%.";
      targetWidth = 1.2;
    }

    setAiDialog({
      open: true,
      nodeId: selectedComponentId,
      suggestion,
      actionType,
      targetWidth
    });
  };

  const applyAiAction = () => {
    if (!aiDialog) return;
    const { nodeId, actionType, targetWidth } = aiDialog;
    
    setLocalNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        const params = { ...(n.properties?.parameters || {}) };
        if (actionType === "speed") {
          params["W"] = targetWidth || 1.2;
        } else if (actionType === "leakage") {
          params["L"] = 0.25;
        }
        return {
          ...n,
          properties: {
            ...(n.properties || {}),
            parameters: params
          }
        };
      }
      return n;
    }));

    setAiDialog(null);
  };

  const renderWaveformChart = () => {
    const simResults = activeDesign?.simulation_results_json;
    if (!simResults || !simResults.waveforms) {
      return (
        <div className="flex-1 flex items-center justify-center text-slate-400 italic text-[10.5px]">
          No simulation runs detected. Complete a compilation to execute transient runs.
        </div>
      );
    }

    const { time, WL, Q, QB } = simResults.waveforms;
    const width = 500;
    const height = 120;
    const padding = 35;

    const xScale = (t: number) => padding + (t / 100) * (width - 2 * padding);
    const yScale = (v: number) => height - padding - (v / 1.8) * (height - 2 * padding);

    const getLinePath = (yData: number[]) => {
      if (!yData || yData.length === 0) return "";
      return yData.map((v, i) => {
        const x = xScale(time[i]);
        const y = yScale(v);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      }).join(" ");
    };

    return (
      <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between border-b pb-1.5 mb-2 shrink-0">
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Transient Analysis Oscilloscope Plot</div>
          <div className="flex gap-3 text-[9px] font-bold">
            <span className="text-purple-600 flex items-center gap-1"><CircleDot className="w-2.5 h-2.5 fill-purple-200" />Q (Output)</span>
            <span className="text-pink-600 flex items-center gap-1"><CircleDot className="w-2.5 h-2.5 fill-pink-200" />QB (Complement)</span>
            <span className="text-yellow-600 flex items-center gap-1"><CircleDot className="w-2.5 h-2.5" />WL (Wordline)</span>
          </div>
        </div>

        <div className="flex-1 h-36 relative select-none">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
            {Array.from({ length: 5 }).map((_, i) => {
              const yVal = (i * 1.8) / 4;
              return (
                <g key={i}>
                  <line 
                    x1={padding} 
                    y1={yScale(yVal)} 
                    x2={width - padding} 
                    y2={yScale(yVal)} 
                    stroke="#e2e8f0" 
                    strokeWidth="0.5" 
                  />
                  <text x={padding - 10} y={yScale(yVal) + 3} fill="#64748b" textAnchor="end" className="font-mono text-[8px]">{yVal.toFixed(2)}V</text>
                </g>
              );
            })}
            {Q && <path d={getLinePath(Q)} fill="none" stroke="#a855f7" strokeWidth="2" />}
            {QB && <path d={getLinePath(QB)} fill="none" stroke="#ec4899" strokeWidth="2" />}
            {WL && <path d={getLinePath(WL)} fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3,3" />}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 font-sans select-none h-full relative">
      
      {/* Top Header Panel */}
      <div className="flex justify-between items-center px-8 py-3.5 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold tracking-tight text-slate-800">Schematic Editor</h1>
            
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span>Health: 96%</span>
            </div>
            
            {savingCheckpoint && (
              <span className="text-[10px] text-blue-500 font-bold animate-pulse">Compiling changes...</span>
            )}
          </div>
          <p className="text-[10.5px] text-slate-450 font-semibold leading-none">Interactive schematic sheet composer</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold px-3.5 py-2 rounded-xl transition text-xs shadow-sm"
            onClick={() => {
              setInteractionMode("place");
              setPlacingDeviceType("PMOS");
            }}
          >
            <Plus className="w-4 h-4 text-slate-500" />
            Add PMOS
          </button>
          <button 
            className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold px-3.5 py-2 rounded-xl transition text-xs shadow-sm"
            onClick={() => {
              setInteractionMode("place");
              setPlacingDeviceType("NMOS");
            }}
          >
            <Plus className="w-4 h-4 text-slate-500" />
            Add NMOS
          </button>

          <span className="w-px h-6 bg-slate-200 mx-1" />

          <button 
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl transition text-xs shadow-sm"
            onClick={handleSaveWorkspace}
            disabled={savingCheckpoint}
          >
            <Save className="w-3.5 h-3.5" />
            Save Checkpoint
          </button>
        </div>
      </div>

      {/* Main Workspace split columns */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden min-h-0">
        
        {/* Schematic drawing canvas */}
        <div className="col-span-9 flex flex-col h-full overflow-hidden relative">
          <SchematicCanvas
            localNodes={localNodes}
            localConnections={localConnections}
            localPositions={localPositions}
            localWires={localWires}
            highlightedNet={highlightedNet}
            setHighlightedNet={setHighlightedNet}
            selectedComponentId={selectedComponentId}
            setSelectedComponentId={setSelectedComponentId}
            interactionMode={interactionMode}
            setInteractionMode={setInteractionMode}
            placingDeviceType={placingDeviceType}
            wireStart={wireStart}
            canvasOffset={canvasOffset}
            setCanvasOffset={setCanvasOffset}
            canvasZoom={canvasZoom}
            setCanvasZoom={setCanvasZoom}
            isPanning={isPanning}
            snapToGrid={snapToGrid}
            setSnapToGrid={setSnapToGrid}
            currentLayer={currentLayer}
            setCurrentLayer={setCurrentLayer}
            handleNodeMouseDown={handleNodeMouseDown}
            handleContextMenu={handleContextMenu}
            handleCanvasMouseMove={handleCanvasMouseMove}
            handleCanvasMouseUp={handleCanvasMouseUp}
            handleCanvasMouseDown={handleCanvasMouseDown}
            handlePinClick={handlePinClick}
            handleInspectorParamChange={handleInspectorParamChange}
            dragStartPos={dragStartPos}
          />

          <ConsoleTabs
            activeConsoleTab={activeConsoleTab}
            setActiveConsoleTab={setActiveConsoleTab}
            vddSlider={vddSlider}
            optimization={optimization}
            activeDesign={activeDesign}
            renderWaveformChart={renderWaveformChart}
            localNodes={localNodes}
            setSelectedComponentId={setSelectedComponentId}
            setAiDialog={setAiDialog}
          />
        </div>

        {/* Component properties inspector */}
        <PropertiesInspector
          activePropertyTab={activePropertyTab}
          setActivePropertyTab={setActivePropertyTab}
          selectedComponentId={selectedComponentId}
          localNodes={localNodes}
          localConnections={localConnections}
          setLocalConnections={setLocalConnections}
          handleInspectorParamChange={handleInspectorParamChange}
          triggerAiAction={triggerAiAction}
          designs={designs}
          setActiveDesign={setActiveDesign}
        />
      </div>

      {/* Context Menu right click */}
      {contextMenu && (
        <div 
          className="absolute z-40 bg-white border border-slate-200/80 rounded-2xl shadow-xl py-2.5 w-44 font-sans text-xs text-slate-600 font-bold select-none"
          style={{ top: contextMenu.y - 120, left: contextMenu.x - 30 }}
        >
          <div className="px-3 pb-1 border-b text-[9px] uppercase text-slate-400 font-black tracking-wider">Device Options</div>
          <button className="w-full text-left px-4 py-1.5 hover:bg-slate-50 transition" onClick={rotateSelectedNode}>Rotate (90°)</button>
          <button className="w-full text-left px-4 py-1.5 hover:bg-slate-50 transition" onClick={mirrorSelectedNode}>Mirror/Flip</button>
          <button className="w-full text-left px-4 py-1.5 hover:bg-slate-50 transition" onClick={duplicateSelectedNode}>Duplicate</button>
          <button className="w-full text-left px-4 py-1.5 hover:bg-slate-50 transition" onClick={deleteSelectedNode}>Delete</button>
          
          <div className="h-px bg-slate-100 my-1.5" />
          <div className="px-3 pb-1 text-[9px] uppercase text-slate-400 font-black tracking-wider">Sizing Advisor</div>
          <button className="w-full text-left px-4 py-1.5 hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5" onClick={() => triggerAiAction("leakage")}>
            <Sliders className="w-3 h-3 text-slate-400" />
            <span>Optimize Leakage</span>
          </button>
          <button className="w-full text-left px-4 py-1.5 hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5" onClick={() => triggerAiAction("speed")}>
            <Sliders className="w-3 h-3 text-slate-400" />
            <span>Optimize Delay</span>
          </button>
        </div>
      )}

      {/* Connection Net prompt modal dialog */}
      <WirePromptDialog
        isOpen={wirePromptOpen}
        netName={selectedWireNet}
        onChangeNetName={setSelectedWireNet}
        onClose={() => setWirePromptOpen(false)}
        onConfirm={confirmWireConnection}
        wireStart={wireStart}
        selectedComponentId={selectedComponentId}
      />

      {/* Sizing Optimization Modal popup */}
      <SizingDialog
        isOpen={!!aiDialog?.open}
        suggestion={aiDialog?.suggestion || ""}
        onClose={() => setAiDialog(null)}
        onApply={applyAiAction}
      />

    </div>
  );
}
