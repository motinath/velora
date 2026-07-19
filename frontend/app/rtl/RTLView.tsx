"use client";

import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useAppContext } from "../../app/providers";
import { api } from "../../lib/api";
import {
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Plus,
  Folder,
  FileCode,
  Terminal as TerminalIcon,
  Sparkles,
  HelpCircle,
  MoreVertical,
  RefreshCw,
  FolderPlus,
  Settings,
  Trash2,
  Filter,
  CheckCircle,
  Columns,
  Maximize2,
  Save,
  Check,
  AlertTriangle,
  GitBranch,
  Play,
  RotateCcw,
  Sliders,
  HardDrive,
  Info,
  Layers,
  Sparkle,
  Files as FilesIcon,
  PlayCircle,
  Download,
  Pin
} from "lucide-react";

// Inline SVG Waveform component for digital logic simulation
interface WaveformSignal {
  name: string;
  wave: string;
  data?: string[];
}

const WaveformViewer = ({ signals }: { signals: WaveformSignal[] }) => {
  const stepWidth = 16;
  const stepHeight = 28;
  const cycleCount = 30;

  if (!signals || signals.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs py-6">
        <Info className="w-5 h-5 mb-1.5 text-slate-400 animate-pulse" />
        <span>Run simulation to generate timing waveforms.</span>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-slate-900 p-4 font-mono text-[11px] text-slate-350 rounded-xl border border-slate-800 shadow-inner select-none min-h-[140px]">
      {/* Grid Header */}
      <div className="flex items-center pb-2 border-b border-slate-800/60 mb-2">
        <div className="w-32 shrink-0 text-slate-500 font-extrabold tracking-wider">Signal</div>
        <div className="flex" style={{ width: cycleCount * stepWidth }}>
          {Array.from({ length: cycleCount }).map((_, idx) => (
            <div key={idx} className="text-center text-[10px] font-bold text-slate-600" style={{ width: stepWidth }}>
              {idx}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {signals.map((sig, sigIdx) => {
          let dataIdx = 0;
          return (
            <div key={sigIdx} className="flex items-center h-8">
              {/* Signal Label */}
              <div className="w-32 shrink-0 font-bold text-cyan-400 truncate pr-2 flex items-center gap-1.5" title={sig.name}>
                <span className="text-[8px] text-cyan-500/80">■</span>
                {sig.name}
              </div>

              {/* Waveform SVG */}
              <svg height={stepHeight} width={cycleCount * stepWidth} className="overflow-visible">
                {/* Background grid lines */}
                {Array.from({ length: cycleCount }).map((_, idx) => (
                  <line
                    key={idx}
                    x1={idx * stepWidth}
                    y1={0}
                    x2={idx * stepWidth}
                    y2={stepHeight}
                    stroke="#1e293b"
                    strokeDasharray="1,2"
                    strokeWidth={0.5}
                  />
                ))}

                {/* Draw the wave path */}
                {(() => {
                  let path = "";
                  let currentY = stepHeight - 4; // Low level default
                  let currentX = 0;

                  for (let i = 0; i < Math.min(sig.wave.length, cycleCount); i++) {
                    const char = sig.wave[i];
                    const nextX = (i + 1) * stepWidth;

                    if (char === '0') {
                      const targetY = stepHeight - 4;
                      if (currentY !== targetY) {
                        path += ` L ${currentX} ${targetY}`;
                      }
                      path += ` H ${nextX}`;
                      currentY = targetY;
                    } else if (char === '1') {
                      const targetY = 4;
                      if (currentY !== targetY) {
                        path += ` L ${currentX} ${targetY}`;
                      }
                      path += ` H ${nextX}`;
                      currentY = targetY;
                    } else if (char === '2' || char === '.') {
                      const topY = 4;
                      const botY = stepHeight - 4;

                      // Draw boundary transitions
                      if (i === 0 || sig.wave[i - 1] === '0' || sig.wave[i - 1] === '1') {
                        path += ` M ${currentX} ${(topY + botY) / 2} L ${currentX + 2} ${topY} H ${nextX - 2} L ${nextX} ${(topY + botY) / 2}`;
                        path += ` M ${currentX} ${(topY + botY) / 2} L ${currentX + 2} ${botY} H ${nextX - 2} L ${nextX} ${(topY + botY) / 2}`;
                      } else {
                        // Continuous bus
                        path += ` M ${currentX} ${topY} H ${nextX}`;
                        path += ` M ${currentX} ${botY} H ${nextX}`;
                      }
                      currentY = (topY + botY) / 2;
                    }
                    currentX = nextX;
                  }

                  // Render text labels inside bus/vector blocks
                  const busLabels: JSX.Element[] = [];
                  if (sig.data) {
                    let labelIdx = 0;
                    for (let i = 0; i < Math.min(sig.wave.length, cycleCount); i++) {
                      if (sig.wave[i] === '2') {
                        const val = sig.data[labelIdx++];
                        if (val) {
                          busLabels.push(
                            <text
                              key={i}
                              x={i * stepWidth + stepWidth / 2 + 2}
                              y={stepHeight / 2 + 3}
                              fill="#cbd5e1"
                              fontSize="7.5px"
                              fontWeight="black"
                              textAnchor="middle"
                            >
                              {val}
                            </text>
                          );
                        }
                      }
                    }
                  }

                  const isVector = sig.wave.includes("2") || sig.wave.includes(".");

                  return (
                    <>
                      <path
                        d={path}
                        fill="none"
                        stroke={isVector ? "#f59e0b" : "#10b981"}
                        strokeWidth={isVector ? 1.5 : 2}
                        strokeLinejoin="round"
                      />
                      {busLabels}
                    </>
                  );
                })()}
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export function RTLView() {
  const { activeProject } = useAppContext();
  const projectId = activeProject?.id;

  // VS Code Layout: Collapsible Sidebar + Activity Bar tabs
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeActivityBarTab, setActiveActivityBarTab] = useState<"explorer" | "git" | "ai" | "metrics">("explorer");
  const [rightPanelWidth, setRightPanelWidth] = useState(280);

  // Collapsible sub-sections inside the Explorer Sidebar
  const [explorerSections, setExplorerSections] = useState({
    files: true,
    editors: true,
    recent: false,
    favorites: false
  });

  // Resizable Panel States (left sidebar width & bottom panel height)
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(220);

  // State Management
  const [files, setFiles] = useState<any[]>([]);
  const [openTabs, setOpenTabs] = useState<string[]>([]); // Array of file names
  const [activeEditorTab, setActiveEditorTab] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [dirtyTabs, setDirtyTabs] = useState<Record<string, boolean>>({});
  const [editorRef, setEditorRef] = useState<any>(null);

  const activeFile = files.find(f => f.filename === activeEditorTab);

  // VS Code Style Open Editors, Pinned Files, and Recent Files tracking
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [pinnedFiles, setPinnedFiles] = useState<string[]>([]);

  // Right Panel Context Tabs
  const [rightPanelTab, setRightPanelTab] = useState<"outline" | "signals" | "hierarchy" | "dependencies" | "metrics" | "ai">("outline");
  const [activeLogTab, setActiveLogTab] = useState<"problems" | "output" | "terminal" | "waveform" | "coverage" | "git">("problems");

  // Floating AI Copilot Popup State
  const [showFloatingAI, setShowFloatingAI] = useState(false);
  const [floatingAiPos, setFloatingAiPos] = useState({ x: 0, y: 0 });

  // Sidebar Folder toggles
  const [isFolderOpen, setIsFolderOpen] = useState({
    project: true,
    rtl: true,
    tb: true,
    constraints: true,
    scripts: false,
    docs: false
  });

  // Inputs
  const [fileSearch, setFileSearch] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [gitMessage, setGitMessage] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  // Interactive terminal console history
  const [terminalHistory, setTerminalHistory] = useState<Array<{ type: "cmd" | "out"; text: string }>>([
    { type: "out", text: "Welcome to Velora Semiconductor Interactive Terminal Core.\nType commands (e.g. 'ls', 'git status', 'iverilog -v', 'python --version') and press Enter.\n" }
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Response outputs
  const [outline, setOutline] = useState<any>({ module: "", ports: [], parameters: [], signals: [] });
  const [buildLogs, setBuildLogs] = useState("");
  const [problems, setProblems] = useState<any[]>([]);
  const [waveformSignals, setWaveformSignals] = useState<WaveformSignal[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [gitStatus, setGitStatus] = useState<any>(null);

  // Dynamic hierarchy and dependencies returned by static analysis parser
  const [hierarchyTree, setHierarchyTree] = useState<any>({});
  const [dependencies, setDependencies] = useState<any>({});
  const [topModule, setTopModule] = useState<string>("TOP");

  // Simulated coverage stats returned by simulation trace
  const [coverageStats, setCoverageStats] = useState<any>({
    statements: 96,
    branches: 92,
    toggles: 89,
    fsm: 100
  });

  // Build Timeline steps tracking
  const [buildSteps, setBuildSteps] = useState([
    { name: "Generate RTL", status: "success" },
    { name: "Compile Check", status: "success" },
    { name: "Linter Scan", status: "success" },
    { name: "Stimulus Simulation", status: "pending" },
    { name: "Coverage Analysis", status: "pending" }
  ]);

  // Interactive AI studio responses
  const [aiResponseText, setAiResponseText] = useState("");
  const [aiResponseCode, setAiResponseCode] = useState("");

  // Loading flags
  const [loading, setLoading] = useState(false);
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Sync folders toggle
  const toggleFolder = (name: keyof typeof isFolderOpen) => {
    setIsFolderOpen(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Scroll terminal automatically
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalHistory]);

  // Resizing hooks
  const startResizeSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const doDrag = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(180, Math.min(480, startWidth + (moveEvent.clientX - startX)));
      setSidebarWidth(newWidth);
    };

    const stopDrag = () => {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const startResizeBottomPanel = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = bottomPanelHeight;

    const doDrag = (moveEvent: MouseEvent) => {
      const newHeight = Math.max(100, Math.min(600, startHeight - (moveEvent.clientY - startY)));
      setBottomPanelHeight(newHeight);
    };

    const stopDrag = () => {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const startResizeRightPanel = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightPanelWidth;

    const doDrag = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(180, Math.min(480, startWidth - (moveEvent.clientX - startX)));
      setRightPanelWidth(newWidth);
    };

    const stopDrag = () => {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  // Activity Bar Tab toggle handler
  const handleActivityBarClick = (tab: "explorer" | "git" | "ai" | "metrics") => {
    if (activeActivityBarTab === tab) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setActiveActivityBarTab(tab);
      setSidebarOpen(true);
    }
  };

  // 1. Initial Workspace Load
  useEffect(() => {
    if (projectId) {
      loadWorkspace();
    }
  }, [projectId]);

  const loadWorkspace = async () => {
    try {
      setLoading(true);
      const fileList = await api.listRtlFiles(projectId);
      setFiles(fileList);

      // Restore workspace session state
      const savedState = await api.getWorkspaceState(projectId);
      if (savedState && savedState.open_tabs && savedState.open_tabs.length > 0) {
        setOpenTabs(savedState.open_tabs);
        const tabExists = fileList.some((f: any) => f.filename === savedState.active_tab);
        if (tabExists) {
          await handleSelectTab(savedState.active_tab, fileList);
        } else {
          await handleSelectTab(fileList[0]?.filename || null, fileList);
        }
      } else {
        await handleSelectTab(fileList[0]?.filename || null, fileList);
      }

      // Load static data
      const stats = await api.getRtlMetrics(projectId);
      setMetrics(stats);
      const git = await api.getRtlGitStatus(projectId);
      setGitStatus(git);

      // Load hierarchy, dependencies, and coverage
      await refreshHierarchyAndCoverage();
    } catch (err) {
      console.error("Failed to load workspace", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to sync hierarchy & coverage
  const refreshHierarchyAndCoverage = async () => {
    if (!projectId) return;
    try {
      const data = await api.getRtlHierarchy(projectId);
      setHierarchyTree(data.hierarchy || {});
      setDependencies(data.dependencies || {});
      setTopModule(data.top_module || "TOP");

      const cov = await api.getRtlCoverage(projectId);
      setCoverageStats(cov);
    } catch (e) {
      console.error("Hierarchy sync failed", e);
    }
  };

  // 2. Select & Open Tab
  const handleSelectTab = async (filename: string | null, currentFiles = files) => {
    if (!filename) {
      setActiveEditorTab(null);
      setEditorContent("");
      setOutline({ module: "", ports: [], parameters: [], signals: [] });
      return;
    }

    setActiveEditorTab(filename);

    // Add to open tabs
    setOpenTabs(prev => {
      if (!prev.includes(filename)) {
        const updated = [...prev, filename];
        api.saveWorkspaceState(projectId!, updated, filename);
        return updated;
      }
      api.saveWorkspaceState(projectId!, prev, filename);
      return prev;
    });

    // Track recently opened files
    setRecentFiles(prev => {
      const filtered = prev.filter(f => f !== filename);
      return [filename, ...filtered].slice(0, 5);
    });

    const file = currentFiles.find(f => f.filename === filename);
    if (file) {
      setEditorContent(file.content || "");
      try {
        const outlineData = await api.getRtlOutline(file.id);
        setOutline(outlineData);
      } catch (err) {
        console.error("Failed to fetch module outline", err);
      }
    }
  };

  // 3. Tab Closing
  const handleCloseTab = (e: React.MouseEvent, filename: string) => {
    e.stopPropagation();
    const updatedTabs = openTabs.filter(t => t !== filename);
    setOpenTabs(updatedTabs);

    let nextActive = activeEditorTab;
    if (activeEditorTab === filename) {
      nextActive = updatedTabs[updatedTabs.length - 1] || null;
      handleSelectTab(nextActive);
    }

    api.saveWorkspaceState(projectId!, updatedTabs, nextActive);

    setDirtyTabs(prev => {
      const copy = { ...prev };
      delete copy[filename];
      return copy;
    });
  };

  // 4. File Creation
  const handleCreateFile = async () => {
    if (!newFileName.trim()) return;
    try {
      const created = await api.createRtlFile(projectId!, newFileName.trim(), "");
      setFiles(prev => [...prev, created]);
      setShowNewFileDialog(false);
      setNewFileName("");

      // Auto-open created file
      await handleSelectTab(created.filename, [...files, created]);

      const git = await api.getRtlGitStatus(projectId!);
      setGitStatus(git);

      const stats = await api.getRtlMetrics(projectId!);
      setMetrics(stats);

      await refreshHierarchyAndCoverage();
    } catch (err) {
      alert("Failed to create file: " + err);
    }
  };

  // 5. File Deletion
  const handleDeleteFile = async (fileId: number, filename: string) => {
    if (!confirm(`Are you sure you want to permanently delete file: ${filename}?`)) return;
    try {
      await api.deleteRtlFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));

      if (openTabs.includes(filename)) {
        const remaining = openTabs.filter(t => t !== filename);
        setOpenTabs(remaining);
        if (activeEditorTab === filename) {
          handleSelectTab(remaining[remaining.length - 1] || null);
        }
      }

      const git = await api.getRtlGitStatus(projectId!);
      setGitStatus(git);

      const stats = await api.getRtlMetrics(projectId!);
      setMetrics(stats);

      await refreshHierarchyAndCoverage();
    } catch (err) {
      alert("Failed to delete file: " + err);
    }
  };

  // 6. File Renaming
  const handleRenameFile = async (fileId: number, currentName: string) => {
    const newName = prompt("Enter new path or filename:", currentName);
    if (!newName || newName.trim() === currentName) return;
    try {
      await api.renameRtlFile(fileId, newName.trim());
      await loadWorkspace();
    } catch (err) {
      alert("Failed to rename file: " + err);
    }
  };

  // 7. Save Editor Changes
  const handleSaveFile = async () => {
    if (!activeEditorTab) return;
    const file = files.find(f => f.filename === activeEditorTab);
    if (!file) return;

    try {
      await api.saveRtlFile(file.id, editorContent);
      setDirtyTabs(prev => ({ ...prev, [activeEditorTab]: false }));
      setFiles(prev => prev.map(f => f.id === file.id ? { ...f, content: editorContent } : f));

      // Update outline
      const outlineData = await api.getRtlOutline(file.id);
      setOutline(outlineData);

      // Update stats
      const stats = await api.getRtlMetrics(projectId!);
      setMetrics(stats);

      const git = await api.getRtlGitStatus(projectId!);
      setGitStatus(git);

      await refreshHierarchyAndCoverage();
    } catch (err) {
      alert("Failed to save changes: " + err);
    }
  };

  // 8. Auto-Save Action Hook
  useEffect(() => {
    if (!activeEditorTab) return;
    const file = files.find(f => f.filename === activeEditorTab);
    if (!file) return;

    const autoSaveTimer = setTimeout(async () => {
      if (dirtyTabs[activeEditorTab]) {
        try {
          await api.saveRtlFile(file.id, editorContent);
          setDirtyTabs(prev => ({ ...prev, [activeEditorTab]: false }));
          setFiles(prev => prev.map(f => f.id === file.id ? { ...f, content: editorContent } : f));
          const outlineData = await api.getRtlOutline(file.id);
          setOutline(outlineData);
          const git = await api.getRtlGitStatus(projectId!);
          setGitStatus(git);
          await refreshHierarchyAndCoverage();
        } catch (e) {
          console.error("Auto-save failed", e);
        }
      }
    }, 4000); // Trigger auto-save 4 seconds after typing pauses

    return () => clearTimeout(autoSaveTimer);
  }, [editorContent, activeEditorTab]);

  // 9. Monaco Editor Content Change handler
  const handleEditorChange = (val: string | undefined) => {
    const updatedVal = val || "";
    setEditorContent(updatedVal);
    if (activeEditorTab) {
      setDirtyTabs(prev => ({ ...prev, [activeEditorTab]: true }));
    }
  };

  // 10. Run Build/Compile
  const handleCompile = async () => {
    if (isBuilding) return;
    try {
      setIsBuilding(true);
      setActiveLogTab("output");
      setBuildLogs("[VELORA COMPILER] Initiating code analysis check...");

      setBuildSteps(prev => prev.map((s, idx) => idx === 1 ? { ...s, status: "loading" } : s));

      const result = await api.buildRtlProject(projectId!);
      setBuildLogs(result.logs);
      setProblems(result.problems || []);

      if (result.status === "failed") {
        setActiveLogTab("problems");
        setBuildSteps(prev => prev.map((s, idx) => idx === 1 ? { ...s, status: "failed" } : s));
      } else {
        setBuildSteps(prev => prev.map((s, idx) => idx === 1 ? { ...s, status: "success" } : idx === 2 ? { ...s, status: "success" } : s));
        await refreshHierarchyAndCoverage();
      }
    } catch (err) {
      setBuildLogs("[VELORA COMPILER] Elaboration parser failed:\n" + err);
      setBuildSteps(prev => prev.map((s, idx) => idx === 1 ? { ...s, status: "failed" } : s));
    } finally {
      setIsBuilding(false);
    }
  };

  // 11. Run Lint Checks
  const handleLint = async () => {
    try {
      setActiveLogTab("problems");
      setBuildLogs("[VELORA LINTER] Initiating rule verification...");
      setBuildSteps(prev => prev.map((s, idx) => idx === 2 ? { ...s, status: "loading" } : s));

      const warnings = await api.lintRtlProject(projectId!);
      setProblems(warnings);

      setBuildSteps(prev => prev.map((s, idx) => idx === 2 ? { ...s, status: "success" } : s));
    } catch (err) {
      console.error("Linter failed", err);
      setBuildSteps(prev => prev.map((s, idx) => idx === 2 ? { ...s, status: "failed" } : s));
    }
  };

  // 12. Run Simulation Trace
  const handleSimulate = async () => {
    if (isSimulating) return;
    try {
      setIsSimulating(true);
      setActiveLogTab("output");
      setBuildLogs("[VELORA SIMULATOR] Compiling stimulus netlist...");
      setBuildSteps(prev => prev.map((s, idx) => idx === 3 ? { ...s, status: "loading" } : idx === 4 ? { ...s, status: "loading" } : s));

      const result = await api.simulateRtlProject(projectId!);
      setBuildLogs(result.logs);

      if (result.waveform && result.waveform.signals) {
        setWaveformSignals(result.waveform.signals);
        setActiveLogTab("waveform");
      }

      // Update build steps and reload coverage stats
      setBuildSteps(prev => prev.map((s, idx) => idx === 3 ? { ...s, status: "success" } : idx === 4 ? { ...s, status: "success" } : s));
      await refreshHierarchyAndCoverage();
    } catch (err) {
      setBuildLogs("[VELORA SIMULATOR] Run exception:\n" + err);
      setBuildSteps(prev => prev.map((s, idx) => idx === 3 ? { ...s, status: "failed" } : s));
    } finally {
      setIsSimulating(false);
    }
  };

  // 13. AI Assist Prompt execution
  const handleAiAction = async (actionType: string) => {
    if (isAiRunning) return;
    const activeFile = files.find(f => f.filename === activeEditorTab);
    const fileId = activeFile ? activeFile.id : null;

    let selection = "";
    if (editorRef) {
      const selectionModel = editorRef.getSelection();
      if (selectionModel) {
        selection = editorRef.getModel().getValueInRange(selectionModel);
      }
    }

    try {
      setIsAiRunning(true);
      setRightPanelTab("ai");
      setAiResponseText("Velora is thinking...");
      setAiResponseCode("");
      setShowFloatingAI(false);

      const result = await api.runRtlAiAction(
        projectId!,
        fileId,
        actionType,
        actionType === "convert" ? "SystemVerilog" : aiPrompt,
        selection
      );

      setAiResponseText(result.explanation || "Execution complete.");
      if (result.code) {
        setAiResponseCode(result.code);
      }
    } catch (err) {
      setAiResponseText("Assistant failed: " + err);
    } finally {
      setIsAiRunning(false);
    }
  };

  // 14. Inject AI Suggested Code into Editor
  const handleApplyCode = () => {
    if (!aiResponseCode) return;
    if (editorRef) {
      const selection = editorRef.getSelection();
      if (selection && !selection.isEmpty()) {
        const op = {
          range: selection,
          text: aiResponseCode,
          forceMoveMarkers: true
        };
        editorRef.executeEdits("ai-copilot", [op]);
      } else {
        setEditorContent(aiResponseCode);
        if (activeEditorTab) {
          setDirtyTabs(prev => ({ ...prev, [activeEditorTab]: true }));
        }
      }
    } else {
      setEditorContent(aiResponseCode);
      if (activeEditorTab) {
        setDirtyTabs(prev => ({ ...prev, [activeEditorTab]: true }));
      }
    }
  };

  // 15. Move cursor to problem line on click
  const handleFocusLine = (line: number) => {
    if (editorRef) {
      editorRef.revealLineInCenter(line);
      editorRef.setPosition({ lineNumber: line, column: 1 });
      editorRef.focus();
    }
  };

  // 16. Git Commit handler
  const handleGitCommit = async () => {
    if (!gitMessage.trim()) return;
    try {
      await api.commitRtlGitChanges(projectId!, gitMessage);
      setGitMessage("");
      const git = await api.getRtlGitStatus(projectId!);
      setGitStatus(git);
    } catch (err) {
      alert("Git commit failed: " + err);
    }
  };

  // 17. Submit interactive shell command
  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    setTerminalHistory(prev => [...prev, { type: "cmd", text: cmd }]);
    setTerminalInput("");

    try {
      const res = await api.runRtlTerminalCommand(projectId!, cmd);
      if (res.output) {
        setTerminalHistory(prev => [...prev, { type: "out", text: res.output }]);
      } else {
        setTerminalHistory(prev => [...prev, { type: "out", text: `Command completed with exit code: ${res.code}` }]);
      }

      // Reload workspace tree/git if commands affected files
      await loadWorkspace();
    } catch (err: any) {
      setTerminalHistory(prev => [...prev, { type: "out", text: `Command Error: ${err.message || err}` }]);
    }
  };

  // Toggle file pin state
  const togglePinFile = (filename: string) => {
    setPinnedFiles(prev => {
      if (prev.includes(filename)) {
        return prev.filter(f => f !== filename);
      }
      return [...prev, filename];
    });
  };

  // Recursive tree renderer for module hierarchies
  const renderHierarchyNode = (node: any) => {
    if (!node || !node.name) return null;
    return (
      <div key={node.name} className="pl-3.5 border-l border-slate-200 mt-1.5 select-none">
        <div
          onClick={() => {
            if (node.file) {
              handleSelectTab(node.file);
            } else {
              alert(`Module ${node.name} has no associated file on disk.`);
            }
          }}
          className="flex items-center gap-1.5 py-1 hover:text-[#007acc] cursor-pointer font-mono font-bold text-[11px]"
        >
          <span className="text-[#007acc]">◈</span>
          <span>{node.name}</span>
          {node.file && <span className="text-[9px] text-slate-400 font-sans font-normal ml-1">({node.file.split("/").pop()})</span>}
        </div>
        {node.children && node.children.map((child: any) => renderHierarchyNode(child))}
      </div>
    );
  };

  // Monaco editor selection listener hook for popup AI actions
  const handleEditorMount = (editor: any, monaco: any) => {
    setEditorRef(editor);

    // Track selections and calculate float widget positioning
    editor.onDidChangeCursorSelection((e: any) => {
      const selection = e.selection;
      if (selection && !selection.isEmpty()) {
        const position = editor.getScrolledVisiblePosition(selection.getEndPosition());
        const domNode = editor.getDomNode();
        if (position && domNode) {
          const editorRect = domNode.getBoundingClientRect();
          setFloatingAiPos({
            x: position.left + 15,
            y: position.top - 20
          });
          setShowFloatingAI(true);
        }
      } else {
        setShowFloatingAI(false);
      }
    });
  };

  // Dynamic grouping logic for sidebar tree
  const getFileTree = () => {
    const categories: Record<string, any[]> = {
      "rtl": [],
      "tb": [],
      "constraints": [],
      "scripts": [],
      "docs": [],
      "root": []
    };

    files.forEach(f => {
      const parts = f.filename.split("/");
      if (parts.length > 1) {
        const folder = parts[0];
        if (categories[folder]) {
          categories[folder].push(f);
        } else {
          categories[folder] = [f];
        }
      } else {
        const lowerName = f.filename.toLowerCase();
        if (lowerName.includes("tb_") || lowerName.endsWith("_tb.sv") || lowerName.endsWith("_tb.v") || lowerName.includes("testbench")) {
          categories["tb"].push(f);
        } else if (lowerName.endsWith(".sv") || lowerName.endsWith(".v") || lowerName.endsWith(".vhd") || lowerName.endsWith(".vhdl")) {
          categories["rtl"].push(f);
        } else if (lowerName.endsWith(".sdc") || lowerName.endsWith(".xdc")) {
          categories["constraints"].push(f);
        } else {
          categories["root"].push(f);
        }
      }
    });

    return categories;
  };

  const tree = getFileTree();
  const filteredFiles = files.filter(f => f.filename.toLowerCase().includes(fileSearch.toLowerCase()));

  if (!activeProject) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs font-sans bg-[#ffffff]">
        <Layers className="w-8 h-8 mb-2 text-slate-350 animate-bounce" />
        <span>Select or create a project to launch the RTL Studio workspace.</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#ffffff] font-sans text-[#333333] select-none h-full relative">

      {/* TOP SEMICONDUCTOR ACTION BAR (TOP TOOLBAR) */}
      <div className="bg-[#ececec] border-b border-[#e4e4e7] px-6 py-2 flex items-center justify-between gap-4 shrink-0 text-[11px] font-bold text-[#555555]">
        <div className="flex items-center gap-3">
          <span className="text-[#007acc] text-xs font-black">VELORA STUDIO</span>
          <div className="w-px h-4 bg-slate-300 mx-1" />

          <button onClick={loadWorkspace} title="Sync Files" className="flex items-center gap-1 hover:bg-slate-200 px-2.5 py-1.5 rounded transition">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Project</span>
          </button>

          <button onClick={handleCompile} disabled={isBuilding} className="flex items-center gap-1 hover:bg-slate-200 px-2.5 py-1.5 rounded transition disabled:opacity-50 text-[#007acc]">
            <RotateCcw className={`w-3.5 h-3.5 ${isBuilding ? "animate-spin" : ""}`} />
            <span>Build</span>
          </button>

          <button onClick={handleSimulate} disabled={isSimulating} className="flex items-center gap-1 hover:bg-slate-200 px-2.5 py-1.5 rounded transition disabled:opacity-50 text-emerald-700">
            <Play className={`w-3.5 h-3.5 ${isSimulating ? "animate-pulse" : ""}`} />
            <span>Simulation</span>
          </button>

          <button onClick={handleLint} className="flex items-center gap-1 hover:bg-slate-200 px-2.5 py-1.5 rounded transition">
            <Filter className="w-3.5 h-3.5" />
            <span>Lint Core</span>
          </button>

          <button onClick={() => handleAiAction("testbench")} className="flex items-center gap-1 hover:bg-slate-200 px-2.5 py-1.5 rounded transition">
            <PlayCircle className="w-3.5 h-3.5 text-purple-600" />
            <span>Gen Testbench</span>
          </button>

          <button onClick={() => handleAiAction("document")} className="flex items-center gap-1 hover:bg-slate-200 px-2.5 py-1.5 rounded transition">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>Documentation</span>
          </button>

          <button onClick={() => handleAiAction("generate")} className="flex items-center gap-1 bg-[#007acc] text-white hover:bg-[#006bb8] px-3 py-1.5 rounded transition shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Generate</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => alert("Downloading Zip netlist bundle...")} className="flex items-center gap-1 hover:bg-slate-200 px-2.5 py-1.5 rounded transition">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Drag split containers */}
      <div className="flex-1 flex flex-row overflow-hidden min-h-0 relative">

        {/* 1. VS CODE ACTIVITY BAR (Far Left, dark gray background #2c2c2c) */}
        <div className="w-12 bg-[#2c2c2c] flex flex-col justify-between items-center py-2 shrink-0 select-none z-10">
          <div className="flex flex-col gap-3 w-full items-center">

            {/* Explorer icon */}
            <button
              onClick={() => handleActivityBarClick("explorer")}
              className={`w-full py-3.5 relative flex items-center justify-center transition-all ${activeActivityBarTab === "explorer" && sidebarOpen
                  ? "text-white"
                  : "text-[#858585] hover:text-[#e1e1e1]"
                }`}
              title="Explorer"
            >
              {activeActivityBarTab === "explorer" && sidebarOpen && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#007acc]" />
              )}
              <FilesIcon className="w-[18px] h-[18px]" />
            </button>

            {/* Git icon */}
            <button
              onClick={() => handleActivityBarClick("git")}
              className={`w-full py-3.5 relative flex items-center justify-center transition-all ${activeActivityBarTab === "git" && sidebarOpen
                  ? "text-white"
                  : "text-[#858585] hover:text-[#e1e1e1]"
                }`}
              title="Source Control (Git)"
            >
              {activeActivityBarTab === "git" && sidebarOpen && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#007acc]" />
              )}
              <GitBranch className="w-[18px] h-[18px]" />
            </button>

            {/* AI Assistant icon */}
            <button
              onClick={() => handleActivityBarClick("ai")}
              className={`w-full py-3.5 relative flex items-center justify-center transition-all ${activeActivityBarTab === "ai" && sidebarOpen
                  ? "text-white"
                  : "text-[#858585] hover:text-[#e1e1e1]"
                }`}
              title="AI Assistant (Copilot)"
            >
              {activeActivityBarTab === "ai" && sidebarOpen && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#007acc]" />
              )}
              <Sparkles className="w-[18px] h-[18px]" />
            </button>

            {/* Metrics icon */}
            <button
              onClick={() => handleActivityBarClick("metrics")}
              className={`w-full py-3.5 relative flex items-center justify-center transition-all ${activeActivityBarTab === "metrics" && sidebarOpen
                  ? "text-white"
                  : "text-[#858585] hover:text-[#e1e1e1]"
                }`}
              title="Design Metrics"
            >
              {activeActivityBarTab === "metrics" && sidebarOpen && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#007acc]" />
              )}
              <HardDrive className="w-[18px] h-[18px]" />
            </button>
          </div>

          <div className="flex flex-col gap-3 w-full items-center mb-1">
            <button className="text-[#858585] hover:text-[#e1e1e1] py-3.5" title="Settings">
              <Settings className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* 2. VS CODE SIDEBAR (Left Sidebar, light gray background #f3f3f3) */}
        {sidebarOpen && (
          <div
            style={{ width: sidebarWidth }}
            className="bg-[#f3f3f3] border-r border-[#e4e4e7] flex flex-col h-full overflow-hidden shrink-0 select-none"
          >
            {/* Sidebar Title */}
            <div className="px-4 py-2.5 flex justify-between items-center text-[10.5px] font-bold text-[#6f6f6f] uppercase tracking-wider border-b border-[#e4e4e7] select-none">
              <span>
                {activeActivityBarTab === "explorer" && "Explorer"}
                {activeActivityBarTab === "git" && "Source Control"}
                {activeActivityBarTab === "ai" && "AI semiconductor Copilot"}
                {activeActivityBarTab === "metrics" && "Design Metrics"}
              </span>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto min-h-0 select-none">

              {/* Explorer Content */}
              {activeActivityBarTab === "explorer" && (
                <div className="space-y-0 text-xs text-[#333333]">

                  {/* EXPLORER SUBSECTION 1: OPEN EDITORS */}
                  <div>
                    <div
                      onClick={() => setExplorerSections(prev => ({ ...prev, editors: !prev.editors }))}
                      className="flex items-center gap-1 py-1.5 px-3 bg-[#e8e8e8]/50 hover:bg-[#e8e8e8] border-b border-[#e4e4e7] cursor-pointer font-bold text-[#4e4e4e] select-none"
                    >
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform text-[#5f5f5f] ${explorerSections.editors ? "rotate-90" : ""}`} />
                      <span className="uppercase text-[9.5px] tracking-wider">Open Editors</span>
                    </div>

                    {explorerSections.editors && (
                      <div className="py-1 font-semibold text-[#505050]">
                        {openTabs.map((filename) => (
                          <div
                            key={filename}
                            onClick={() => handleSelectTab(filename)}
                            className={`flex items-center justify-between py-1 px-4 cursor-pointer hover:bg-slate-200/50 ${activeEditorTab === filename ? "bg-[#d4e4f7] font-bold text-[#007acc]" : ""
                              }`}
                          >
                            <span className="truncate">{filename.split("/").pop()}</span>
                            <span onClick={(e) => handleCloseTab(e, filename)} className="text-[8px] text-slate-400 hover:text-slate-700 pl-2">✕</span>
                          </div>
                        ))}
                        {openTabs.length === 0 && (
                          <div className="px-4 py-2 text-slate-400 italic">No files open in editor.</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* EXPLORER SUBSECTION 2: WORKSPACE FILES TREE */}
                  <div className="border-t border-[#e4e4e7]">
                    <div
                      onClick={() => setExplorerSections(prev => ({ ...prev, files: !prev.files }))}
                      className="flex items-center gap-1 py-1.5 px-3 bg-[#e8e8e8]/50 hover:bg-[#e8e8e8] border-b border-[#e4e4e7] cursor-pointer font-bold text-[#4e4e4e] select-none"
                    >
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform text-[#5f5f5f] ${explorerSections.files ? "rotate-90" : ""}`} />
                      <span className="uppercase text-[9.5px] tracking-wider">Project Files</span>
                    </div>

                    {explorerSections.files && (
                      <div className="py-2.5 px-4 font-semibold text-[#505050] space-y-2">
                        <div>
                          <div
                            onClick={() => toggleFolder("project")}
                            className="flex items-center gap-1.5 py-1 hover:text-slate-800 cursor-pointer"
                          >
                            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isFolderOpen.project ? "" : "-rotate-90"}`} />
                            <Folder className="w-4 h-4 text-blue-500 fill-blue-50" />
                            <span className="text-blue-600 font-bold">{activeProject.name.toLowerCase().replace(/ /g, "_")}_proj</span>
                          </div>

                          {isFolderOpen.project && (
                            <div className="pl-4.5 space-y-1.5 mt-1 border-l border-[#e4e4e7] ml-2">

                              {/* RTL Folder */}
                              <div>
                                <div
                                  onClick={() => toggleFolder("rtl")}
                                  className="flex items-center gap-1.5 py-1 hover:text-slate-800 cursor-pointer"
                                >
                                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isFolderOpen.rtl ? "" : "-rotate-90"}`} />
                                  <Folder className="w-3.5 h-3.5 text-slate-450 fill-slate-50" />
                                  <span>rtl</span>
                                </div>

                                {isFolderOpen.rtl && (
                                  <div className="pl-4 mt-0.5 space-y-0.5 text-[11px] font-medium text-slate-500">
                                    {tree.rtl.map((f: any) => {
                                      const isActive = activeEditorTab === f.filename;
                                      const isDirty = dirtyTabs[f.filename];
                                      const isPinned = pinnedFiles.includes(f.filename);
                                      return (
                                        <div
                                          key={f.id}
                                          className={`group flex items-center justify-between py-1 px-2 rounded cursor-pointer transition ${isActive ? "bg-[#d4e4f7] text-[#007acc] font-bold" : "hover:bg-[#e4e4e7] text-[#555555] hover:text-[#222222]"
                                            }`}
                                          onClick={() => handleSelectTab(f.filename)}
                                        >
                                          <div className="flex items-center gap-2 truncate">
                                            <FileCode className={`w-3.5 h-3.5 ${isActive ? "text-[#007acc]" : "text-slate-400"}`} />
                                            <span>{f.filename.replace("rtl/", "")}</span>
                                            {isDirty && <span className="text-orange-500 font-black">*</span>}
                                            {isPinned && <Pin className="w-2.5 h-2.5 text-blue-500 transform rotate-45 shrink-0" />}
                                          </div>
                                          <div className="hidden group-hover:flex items-center gap-1.5 text-slate-450 shrink-0">
                                            <button onClick={(e) => { e.stopPropagation(); togglePinFile(f.filename); }} title="Pin File"><Pin className="w-3 h-3" /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleRenameFile(f.id, f.filename); }} title="Rename">✎</button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteFile(f.id, f.filename); }} title="Delete" className="hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* TB Folder */}
                              <div>
                                <div
                                  onClick={() => toggleFolder("tb")}
                                  className="flex items-center gap-1.5 py-1 hover:text-slate-800 cursor-pointer"
                                >
                                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isFolderOpen.tb ? "" : "-rotate-90"}`} />
                                  <Folder className="w-3.5 h-3.5 text-slate-455 fill-slate-50" />
                                  <span>tb</span>
                                </div>

                                {isFolderOpen.tb && (
                                  <div className="pl-4 mt-0.5 space-y-0.5 text-[11px] font-medium text-slate-500">
                                    {tree.tb.map((f: any) => {
                                      const isActive = activeEditorTab === f.filename;
                                      const isDirty = dirtyTabs[f.filename];
                                      const isPinned = pinnedFiles.includes(f.filename);
                                      return (
                                        <div
                                          key={f.id}
                                          className={`group flex items-center justify-between py-1 px-2 rounded cursor-pointer transition ${isActive ? "bg-[#d4e4f7] text-[#007acc] font-bold" : "hover:bg-[#e4e4e7] text-[#555555] hover:text-[#222222]"
                                            }`}
                                          onClick={() => handleSelectTab(f.filename)}
                                        >
                                          <div className="flex items-center gap-2 truncate">
                                            <FileCode className={`w-3.5 h-3.5 ${isActive ? "text-[#007acc]" : "text-slate-400"}`} />
                                            <span>{f.filename.replace("tb/", "")}</span>
                                            {isDirty && <span className="text-orange-500 font-black">*</span>}
                                            {isPinned && <Pin className="w-2.5 h-2.5 text-blue-500 transform rotate-45 shrink-0" />}
                                          </div>
                                          <div className="hidden group-hover:flex items-center gap-1.5 text-slate-450 shrink-0">
                                            <button onClick={(e) => { e.stopPropagation(); togglePinFile(f.filename); }} title="Pin File"><Pin className="w-3 h-3" /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleRenameFile(f.id, f.filename); }} title="Rename">✎</button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteFile(f.id, f.filename); }} title="Delete" className="hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Constraints Folder */}
                              <div>
                                <div
                                  onClick={() => toggleFolder("constraints")}
                                  className="flex items-center gap-1.5 py-1 hover:text-slate-800 cursor-pointer"
                                >
                                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isFolderOpen.constraints ? "" : "-rotate-90"}`} />
                                  <Folder className="w-3.5 h-3.5 text-slate-455 fill-slate-50" />
                                  <span>constraints</span>
                                </div>

                                {isFolderOpen.constraints && (
                                  <div className="pl-4 mt-0.5 space-y-0.5 text-[11px] font-medium text-slate-500">
                                    {tree.constraints.map((f: any) => {
                                      const isActive = activeEditorTab === f.filename;
                                      const isDirty = dirtyTabs[f.filename];
                                      const isPinned = pinnedFiles.includes(f.filename);
                                      return (
                                        <div
                                          key={f.id}
                                          className={`group flex items-center justify-between py-1 px-2 rounded cursor-pointer transition ${isActive ? "bg-[#d4e4f7] text-[#007acc] font-bold" : "hover:bg-[#e4e4e7] text-[#555555] hover:text-[#222222]"
                                            }`}
                                          onClick={() => handleSelectTab(f.filename)}
                                        >
                                          <div className="flex items-center gap-2 truncate">
                                            <FileCode className={`w-3.5 h-3.5 ${isActive ? "text-[#007acc]" : "text-slate-400"}`} />
                                            <span>{f.filename.replace("constraints/", "")}</span>
                                            {isDirty && <span className="text-orange-505 font-black">*</span>}
                                            {isPinned && <Pin className="w-2.5 h-2.5 text-blue-500 transform rotate-45 shrink-0" />}
                                          </div>
                                          <div className="hidden group-hover:flex items-center gap-1.5 text-slate-450 shrink-0">
                                            <button onClick={(e) => { e.stopPropagation(); togglePinFile(f.filename); }} title="Pin File"><Pin className="w-3 h-3" /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleRenameFile(f.id, f.filename); }} title="Rename">✎</button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteFile(f.id, f.filename); }} title="Delete" className="hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* EXPLORER SUBSECTION 3: RECENT FILES */}
                  <div className="border-t border-[#e4e4e7]">
                    <div
                      onClick={() => setExplorerSections(prev => ({ ...prev, recent: !prev.recent }))}
                      className="flex items-center gap-1 py-1.5 px-3 bg-[#e8e8e8]/50 hover:bg-[#e8e8e8] border-b border-[#e4e4e7] cursor-pointer font-bold text-[#4e4e4e] select-none"
                    >
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform text-[#5f5f5f] ${explorerSections.recent ? "rotate-90" : ""}`} />
                      <span className="uppercase text-[9.5px] tracking-wider">Recent Files</span>
                    </div>

                    {explorerSections.recent && (
                      <div className="py-1 font-semibold text-slate-500 space-y-0.5">
                        {recentFiles.map(rf => (
                          <div
                            key={rf}
                            onClick={() => handleSelectTab(rf)}
                            className="px-4 py-1.5 cursor-pointer hover:bg-slate-200/50 truncate flex items-center gap-2"
                          >
                            <FileCode className="w-3.5 h-3.5 text-slate-400" />
                            <span>{rf.split("/").pop()}</span>
                          </div>
                        ))}
                        {recentFiles.length === 0 && (
                          <div className="px-4 py-2 text-slate-400 italic">No recent history.</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* EXPLORER SUBSECTION 4: PINNED/FAVORITE FILES */}
                  <div className="border-t border-[#e4e4e7]">
                    <div
                      onClick={() => setExplorerSections(prev => ({ ...prev, favorites: !prev.favorites }))}
                      className="flex items-center gap-1 py-1.5 px-3 bg-[#e8e8e8]/50 hover:bg-[#e8e8e8] border-b border-[#e4e4e7] cursor-pointer font-bold text-[#4e4e4e] select-none"
                    >
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform text-[#5f5f5f] ${explorerSections.favorites ? "rotate-90" : ""}`} />
                      <span className="uppercase text-[9.5px] tracking-wider">Pinned Editors</span>
                    </div>

                    {explorerSections.favorites && (
                      <div className="py-1 font-semibold text-slate-500 space-y-0.5">
                        {pinnedFiles.map(pf => (
                          <div
                            key={pf}
                            onClick={() => handleSelectTab(pf)}
                            className="px-4 py-1.5 cursor-pointer hover:bg-slate-200/50 truncate flex justify-between items-center"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileCode className="w-3.5 h-3.5 text-blue-500" />
                              <span>{pf.split("/").pop()}</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); togglePinFile(pf); }} className="text-slate-400 hover:text-slate-700">✕</button>
                          </div>
                        ))}
                        {pinnedFiles.length === 0 && (
                          <div className="px-4 py-2 text-slate-400 italic">No pinned files.</div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Git Sidebar Content */}
              {activeActivityBarTab === "git" && (
                <div className="p-4 space-y-4 text-xs font-semibold text-slate-655 animate-fade-in">
                  <div className="space-y-2 bg-[#ffffff] p-3 rounded-lg border border-[#e4e4e7] shadow-sm">
                    <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      <span>Git branch status</span>
                      <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="flex justify-between font-bold text-[10.5px]">
                      <span className="text-slate-500">Branch</span>
                      <span className="text-slate-800 font-mono">main</span>
                    </div>
                    <div className="flex justify-between font-bold text-[10.5px] border-b border-slate-100 pb-2">
                      <span className="text-slate-505">Status</span>
                      <span className={`font-mono font-black ${gitStatus?.status === "dirty" ? "text-amber-600" : "text-emerald-600"}`}>
                        {gitStatus?.status || "clean"}
                      </span>
                    </div>

                    {gitStatus?.modified_files && gitStatus.modified_files.length > 0 && (
                      <div className="text-[9.5px] max-h-[80px] overflow-y-auto space-y-1 font-mono text-slate-500 py-1.5 border-b border-slate-100">
                        {gitStatus.modified_files.map((gf: any, i: number) => (
                          <div key={i} className="truncate">
                            * {gf.path} ({gf.status})
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2 pt-2">
                      <input
                        type="text"
                        placeholder="Commit message..."
                        value={gitMessage}
                        onChange={(e) => setGitMessage(e.target.value)}
                        className="w-full bg-white border border-[#e4e4e7] text-xs p-2 rounded outline-none font-sans focus:border-blue-500"
                      />
                      <button
                        onClick={handleGitCommit}
                        disabled={!gitMessage.trim()}
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded text-xs transition disabled:opacity-50 shadow-sm"
                      >
                        Commit Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Assistant Sidebar Content */}
              {activeActivityBarTab === "ai" && (
                <div className="p-4 space-y-4 text-xs font-semibold animate-fade-in">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-wider">RTL AI Assistant (Copilot)</span>
                      <textarea
                        placeholder="e.g. Generate 8-bit multiplier or explain sequential block..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="w-full bg-white border border-[#e4e4e7] text-xs p-2.5 rounded-lg h-24 outline-none resize-none font-sans focus:border-blue-500 transition shadow-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAiAction("generate")}
                        disabled={isAiRunning}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 rounded text-[10px] shadow-sm transition disabled:opacity-50"
                      >
                        Generate RTL
                      </button>
                      <button
                        onClick={() => handleAiAction("optimize")}
                        disabled={isAiRunning}
                        className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold py-1.5 rounded text-[10px] transition disabled:opacity-50 shadow-sm"
                      >
                        Optimize Code
                      </button>
                      <button
                        onClick={() => handleAiAction("explain")}
                        disabled={isAiRunning}
                        className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold py-1.5 rounded text-[10px] transition disabled:opacity-50 shadow-sm"
                      >
                        Explain Code
                      </button>
                      <button
                        onClick={() => handleAiAction("testbench")}
                        disabled={isAiRunning}
                        className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold py-1.5 rounded text-[10px] transition disabled:opacity-50 shadow-sm"
                      >
                        Gen Testbench
                      </button>
                    </div>
                  </div>

                  {aiResponseText && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 animate-fade-in">
                      <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">AI Response Output</span>
                      <div className="bg-[#ffffff] border border-[#e4e4e7] p-3 rounded-lg text-[10.5px] leading-relaxed max-h-[180px] overflow-y-auto whitespace-pre-wrap select-text font-sans font-medium text-slate-750 shadow-inner">
                        {aiResponseText}
                      </div>

                      {aiResponseCode && (
                        <div className="flex gap-2">
                          <button
                            onClick={handleApplyCode}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-2 rounded transition shadow-sm"
                          >
                            Apply to Editor
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(aiResponseCode);
                              alert("Copied code block!");
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-755 font-bold text-[10px] px-3.5 py-2 rounded transition border border-[#e4e4e7]"
                          >
                            Copy
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Metrics Sidebar Content */}
              {activeActivityBarTab === "metrics" && metrics && (
                <div className="p-4 space-y-3 text-xs font-semibold animate-fade-in">
                  <div className="space-y-2 bg-[#ffffff] p-3.5 rounded-lg border border-[#e4e4e7] shadow-sm text-[11px]">
                    <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">
                      <span>RTL Cells Count</span>
                      <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-505">Modules</span>
                      <span className="text-slate-800 font-mono font-bold">{metrics.modules}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-505">Registers</span>
                      <span className="text-slate-800 font-mono font-bold">{metrics.registers}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-505">Flip-Flops</span>
                      <span className="text-slate-800 font-mono font-bold">{metrics.flip_flops}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-505">Comb. Gates</span>
                      <span className="text-slate-800 font-mono font-bold">{metrics.combinational_cells}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-505">State Machines</span>
                      <span className="text-slate-800 font-mono font-bold">{metrics.fsm}</span>
                    </div>
                    <div className="flex justify-between pt-1 font-bold text-[11.5px]">
                      <span className="text-[#007acc] font-black">Lines of Code</span>
                      <span className="text-[#007acc] font-mono font-black">{metrics.lines_of_code}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* LEFT DRAGGABLE SPLITTER */}
        {sidebarOpen && (
          <div
            onMouseDown={startResizeSidebar}
            className="w-1.5 bg-[#e4e4e7] hover:bg-[#007acc] cursor-col-resize transition-colors shrink-0 h-full self-stretch"
          />
        )}

        {/* 3. EDITOR COLUMN & BOTTOM PANEL (Center area) */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-white relative">

          {/* Top Editor Tab Bar (Quiet Light, `#ececec` backgrounds) */}
          <div className="bg-[#ececec] border-b border-[#e4e4e7] px-2 flex items-center justify-between shrink-0 select-none text-[11px] font-sans font-bold text-[#6f6f6f] h-9">
            <div className="flex items-center gap-0 overflow-x-auto max-w-[85%] scrollbar-none h-full align-bottom pt-1.5">
              {openTabs.map((filename) => {
                const isActive = activeEditorTab === filename;
                const isDirty = dirtyTabs[filename];
                return (
                  <div
                    key={filename}
                    onClick={() => handleSelectTab(filename)}
                    style={{
                      borderTop: isActive ? "2px solid #007acc" : "2px solid transparent",
                      borderRight: "1px solid #d4d4d8",
                      borderLeft: "1px solid transparent"
                    }}
                    className={`px-3.5 h-full cursor-pointer flex items-center gap-2 transition shrink-0 select-none ${isActive
                        ? "bg-[#ffffff] text-[#333333] font-bold"
                        : "bg-[#ececec] text-[#6f6f6f] hover:bg-[#e4e4e7] hover:text-[#333333]"
                      }`}
                  >
                    <FileCode className={`w-3.5 h-3.5 ${isActive ? "text-[#007acc]" : "text-slate-400"}`} />
                    <span>{filename.split("/").pop()}</span>
                    {isDirty && <span className="text-orange-500 ml-0.5">*</span>}
                    <span
                      onClick={(e) => handleCloseTab(e, filename)}
                      className="text-slate-400 hover:text-slate-800 text-[8px] pl-1.5 h-3 flex items-center"
                    >
                      ✕
                    </span>
                  </div>
                );
              })}
              <button
                onClick={() => setShowNewFileDialog(true)}
                className="p-1 text-slate-500 hover:bg-slate-300 rounded ml-1 transition"
                title="New File"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-3 text-slate-500 pr-3">
              <button onClick={handleSaveFile} title="Save File" className="hover:text-slate-800 transition">
                <Save className="w-3.5 h-3.5" />
              </button>
              <button className="hover:text-slate-800 transition"><Columns className="w-3.5 h-3.5" /></button>
              <button className="hover:text-slate-800 transition"><Maximize2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Monaco Editor canvas wrapper */}
          <div className="flex-1 bg-[#ffffff] relative flex flex-col min-h-0">
            {activeEditorTab ? (
              <div className="w-full h-full select-text relative">
                <Editor
                  height="100%"
                  language={activeEditorTab.endsWith(".vhd") || activeEditorTab.endsWith(".vhdl") ? "vhdl" : "systemverilog"}
                  theme="vs-light"
                  value={editorContent}
                  onChange={handleEditorChange}
                  onMount={handleEditorMount}
                  options={{
                    minimap: { enabled: true },
                    fontSize: 12,
                    lineHeight: 19,
                    fontFamily: "Consolas, 'Courier New', monospace",
                    lineNumbers: "on",
                    automaticLayout: true,
                    tabSize: 4,
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                    bracketPairColorization: { enabled: true },
                    cursorBlinking: "blink",
                    renderLineHighlight: "all"
                  }}
                />

                {/* Floating AI Actions Popup (GitHub Copilot style) */}
                {showFloatingAI && (
                  <div
                    style={{ left: floatingAiPos.x, top: floatingAiPos.y }}
                    className="absolute z-40 bg-white border border-[#e4e4e7] rounded-lg shadow-lg flex items-center gap-1.5 p-1 text-[9.5px] font-bold text-slate-655 animate-fade-in select-none"
                  >
                    <button onClick={() => handleAiAction("explain")} className="hover:bg-blue-50 hover:text-blue-600 px-2 py-0.5 rounded transition">Explain</button>
                    <button onClick={() => handleAiAction("optimize")} className="hover:bg-blue-50 hover:text-blue-600 px-2 py-0.5 rounded transition">Optimize</button>
                    <button onClick={() => handleAiAction("testbench")} className="hover:bg-blue-50 hover:text-blue-600 px-2 py-0.5 rounded transition">TB</button>
                    <button onClick={() => handleAiAction("document")} className="hover:bg-blue-50 hover:text-blue-600 px-2 py-0.5 rounded transition">Doc</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
                <FileCode className="w-9 h-9 mb-2 text-slate-300" />
                <span>Open a file from the explorer tree to begin coding.</span>
              </div>
            )}
          </div>

          {/* BOTTOM PANEL DRAGGABLE RESIZER */}
          <div
            onMouseDown={startResizeBottomPanel}
            className="h-1 bg-[#e4e4e7] hover:bg-[#007acc] cursor-row-resize transition-colors shrink-0 w-full"
          />

          {/* VS Code Bottom Panel (#f3f3f3 light gray) */}
          <div
            style={{ height: bottomPanelHeight }}
            className="bg-[#f3f3f3] p-4.5 shrink-0 flex flex-col justify-between overflow-hidden border-t border-[#e4e4e7] min-h-[100px]"
          >
            {/* Bottom Tabs header */}
            <div className="flex items-center justify-between border-b border-[#e4e4e7] pb-1 text-[10px] font-bold text-[#6f6f6f] uppercase tracking-wider shrink-0 select-none">
              <div className="flex gap-6">
                {[
                  { id: "problems", label: `Problems (${problems.length})` },
                  { id: "output", label: "Build Output" },
                  { id: "terminal", label: "Terminal" },
                  { id: "waveform", label: "Waveforms" },
                  { id: "coverage", label: "Coverage" },
                  { id: "git", label: "Git Client" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveLogTab(tab.id as any)}
                    className={`pb-1.5 transition-all relative font-bold ${activeLogTab === tab.id
                        ? "text-[#007acc] border-b-2 border-[#007acc] font-black"
                        : "hover:text-slate-800 text-slate-505"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (activeLogTab === "problems") setProblems([]);
                    else if (activeLogTab === "terminal") setTerminalHistory([]);
                    else setBuildLogs("");
                  }}
                  className="p-1 hover:bg-[#e4e4e7] rounded text-[#858585] transition"
                  title="Clear Log Contents"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Diagnostic content view */}
            <div className="flex-1 overflow-y-auto mt-2 text-xs font-sans select-none">

              {activeLogTab === "problems" && (
                <div className="space-y-1 max-h-[160px] overflow-y-auto select-none">
                  {problems.length > 0 ? (
                    problems.map((prob, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleFocusLine(prob.line)}
                        className="flex items-start gap-2.5 py-1 px-2.5 rounded hover:bg-[#ffffff] hover:shadow-sm cursor-pointer transition border border-transparent hover:border-[#e4e4e7]"
                      >
                        {prob.severity === "Error" ? (
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="leading-tight text-[#4e4e4e] select-none">
                          <span className="font-bold text-slate-800 mr-2">Line {prob.line}:</span>
                          <span className="font-semibold">{prob.message}</span>
                          <span className="text-[10px] text-slate-400 font-mono ml-2">[{prob.check}]</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-600 font-bold p-2.5">
                      <Check className="w-5 h-5 text-emerald-500" />
                      <span>Zero syntax violations detected. Code compiles cleanly.</span>
                    </div>
                  )}
                </div>
              )}

              {activeLogTab === "output" && (
                <pre className="font-mono text-[10px] text-slate-700 leading-normal whitespace-pre-wrap select-text max-h-[160px] overflow-y-auto p-2 bg-[#ffffff] border border-[#e4e4e7] rounded shadow-inner">
                  {buildLogs || "No compiler run outputs. Run Build/Compile to elaborate Verilog designs."}
                </pre>
              )}

              {/* Fully interactive terminal panel */}
              {activeLogTab === "terminal" && (
                <div className="flex flex-col h-full bg-[#1e1e1e] font-mono text-[#cccccc] p-3.5 rounded-lg border border-slate-850 text-[10.5px] select-text shadow-lg">
                  <div className="flex-1 overflow-y-auto space-y-1 max-h-[140px] pr-1">
                    {terminalHistory.map((item, idx) => (
                      <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                        {item.type === "cmd" ? (
                          <div className="text-slate-400 flex items-center gap-1.5">
                            <span className="text-cyan-400 font-bold">velora@Semiconductor-IDE:~/project$</span>
                            <span className="text-slate-100 font-bold">{item.text}</span>
                          </div>
                        ) : (
                          <div className="text-[#e2e2e2] pl-2 border-l border-slate-800/80">{item.text}</div>
                        )}
                      </div>
                    ))}
                    <div ref={terminalEndRef} />
                  </div>
                  <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 border-t border-[#2d2d2d] pt-2 shrink-0 select-none">
                    <span className="text-cyan-400 font-bold shrink-0">velora@Semiconductor-IDE:~/project$</span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      placeholder="Type command and hit Enter..."
                      className="flex-1 bg-transparent border-none text-slate-100 focus:outline-none placeholder-slate-600 font-mono font-bold"
                    />
                  </form>
                </div>
              )}

              {activeLogTab === "waveform" && (
                <WaveformViewer signals={waveformSignals} />
              )}

              {activeLogTab === "coverage" && (
                <div className="space-y-3 p-4 bg-[#ffffff] border border-[#e4e4e7] rounded-xl shadow-sm max-w-xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2.5">Code Coverage Telemetry</span>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between font-bold text-[10.5px] mb-1">
                        <span>Statement Coverage</span>
                        <span className="text-[#007acc]">{coverageStats.statements}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${coverageStats.statements}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-[10.5px] mb-1">
                        <span>Branch Coverage</span>
                        <span className="text-[#007acc]">{coverageStats.branches}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${coverageStats.branches}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-[10.5px] mb-1">
                        <span>Toggle Coverage</span>
                        <span className="text-[#007acc]">{coverageStats.toggles}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${coverageStats.toggles}%` }} />
                      </div>
                    </div>

                    {coverageStats.fsm > 0 && (
                      <div>
                        <div className="flex justify-between font-bold text-[10.5px] mb-1">
                          <span>FSM State Coverage</span>
                          <span className="text-[#007acc]">{coverageStats.fsm}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${coverageStats.fsm}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeLogTab === "git" && gitStatus && (
                <div className="space-y-2 p-3 bg-white border border-slate-200 rounded-lg max-w-md">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <span>Working Tree Modifications</span>
                    <span className="bg-amber-100 border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded text-[8px]">{gitStatus.status}</span>
                  </div>
                  <div className="text-[11px] space-y-1">
                    {gitStatus.modified_files && gitStatus.modified_files.length > 0 ? (
                      gitStatus.modified_files.map((gf: any, i: number) => (
                        <div key={i} className="flex justify-between items-center bg-slate-50 p-1.5 rounded border border-slate-100">
                          <span className="font-mono text-slate-700">{gf.path}</span>
                          <span className="text-[9px] uppercase font-bold text-amber-600">{gf.status}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-450 italic p-1">No unstaged changes in project workspace.</div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: Outline, Ports, Signals, Metrics, Hierarchy, AI Context Panel (Resizable right border in VS Code style) */}
        <div
          style={{ width: rightPanelWidth }}
          className="bg-white p-5 border-l border-[#e4e4e7] flex flex-col justify-between h-full overflow-hidden shrink-0 select-none"
        >

          <div className="flex-1 flex flex-col min-h-0 select-none">

            {/* Design status Card */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3.5 shadow-sm mb-4 shrink-0">
              <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2.5">
                <span>Design Overview</span>
                <span className="bg-blue-100 text-blue-800 text-[8.5px] px-1.5 py-0.5 rounded font-black uppercase">SKY130</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10.5px] font-semibold text-slate-550 leading-tight">
                <div>
                  <span className="block text-[8px] uppercase text-slate-400">Circuit Family</span>
                  <span className="text-slate-800 font-bold">{activeProject.design_type}</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase text-slate-400">Top Module</span>
                  <span className="text-slate-800 font-mono font-bold">{topModule}</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase text-slate-400">Sim Check</span>
                  <span className="text-emerald-600 font-bold">PASSED</span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase text-slate-400">Workspace</span>
                  <span className="text-slate-800 font-bold">Synchronized</span>
                </div>
              </div>
            </div>

            {/* Build timeline card */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3 shadow-sm mb-4 shrink-0">
              <span className="text-[9px] uppercase font-black text-slate-400 block mb-2 tracking-wider">Build Timeline</span>
              <div className="flex flex-col gap-1.5 text-[10px] font-bold text-slate-550">
                {buildSteps.map((step, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span>{step.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${step.status === "success" ? "text-emerald-700 bg-emerald-50" :
                        step.status === "loading" ? "text-blue-700 bg-blue-50 animate-pulse" :
                          step.status === "failed" ? "text-red-700 bg-red-50" : "text-slate-400 bg-slate-100"
                      }`}>
                      {step.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Context Sidebar Tabs */}
            <div className="flex border-b border-slate-100 text-xs font-semibold text-slate-500 select-none shrink-0 mb-3 pb-1 overflow-x-auto scrollbar-none">
              {[
                { id: "outline", label: "Outline" },
                { id: "signals", label: "Signals" },
                { id: "hierarchy", label: "Hierarchy" },
                { id: "dependencies", label: "Deps" }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setRightPanelTab(t.id as any)}
                  className={`px-2.5 font-bold pb-1.5 border-b-2 transition shrink-0 ${rightPanelTab === t.id
                      ? "text-[#007acc] border-[#007acc] font-black"
                      : "border-transparent hover:text-slate-800"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content wrapper */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1 text-xs select-none">

              {/* Outline Tab */}
              {rightPanelTab === "outline" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Module Core</span>
                    <div className="pl-1 flex items-center gap-1.5 text-slate-800 font-extrabold font-mono text-[11px]">
                      <span className="text-blue-500">◆</span>
                      <span>{outline.module || "No Module"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Ports</span>
                    <div className="pl-1.5 space-y-2 text-[10.5px]">
                      {outline.ports && outline.ports.length > 0 ? (
                        outline.ports.map((p: any) => (
                          <div key={p.name} className="flex justify-between items-center font-bold">
                            <span className="text-slate-655 truncate pr-1">
                              <span className={p.type.includes("input") ? "text-emerald-500 mr-1" : "text-blue-500 mr-1"}>■</span>
                              {p.name}
                            </span>
                            <span className="text-slate-400 font-mono text-[9px] bg-slate-50 border border-slate-100 px-1 rounded shrink-0">{p.type}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-400 italic">No ports parsed.</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5 border-t border-slate-100 pt-3">
                    <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Parameters</span>
                    <div className="pl-1 space-y-1.5 font-mono text-[10px]">
                      {outline.parameters && outline.parameters.length > 0 ? (
                        outline.parameters.map((p: any) => (
                          <div key={p.name} className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            <span className="text-slate-700 font-bold">{p.name}</span>
                            <span className="text-blue-600 font-black">{p.val}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-400 italic">No parameters declared.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Signals Tab */}
              {rightPanelTab === "signals" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Nets / Declared Wires</span>
                    <div className="pl-1.5 space-y-2 text-[10.5px]">
                      {outline.signals && outline.signals.length > 0 ? (
                        outline.signals.map((sig: any) => (
                          <div key={sig.name} className="flex justify-between items-center font-semibold">
                            <span className="text-slate-655 truncate pr-1">
                              <span className="text-slate-400 mr-1.5">▪</span>
                              {sig.name}
                            </span>
                            <span className="text-slate-400 font-mono text-[9px] bg-slate-50 border border-slate-100 px-1 rounded shrink-0">{sig.type}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-400 italic">No internal nets declared.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Hierarchy Tab (Dynamic recursive module tree viewer) */}
              {rightPanelTab === "hierarchy" && (
                <div className="space-y-3.5">
                  <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Module Instantiations</span>
                  <div className="border border-slate-200 bg-slate-50 rounded-xl p-3.5 shadow-inner">
                    {hierarchyTree && hierarchyTree.name ? (
                      renderHierarchyNode(hierarchyTree)
                    ) : (
                      <div className="text-slate-400 italic">Empty hierarchy tree. Make sure modules compile successfully.</div>
                    )}
                  </div>
                </div>
              )}

              {/* Dependencies Tab */}
              {rightPanelTab === "dependencies" && (
                <div className="space-y-3">
                  <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Imports & Include packages</span>
                  <div className="space-y-2">
                    {dependencies && Object.keys(dependencies).length > 0 ? (
                      Object.keys(dependencies).map(fn => (
                        <div key={fn} className="space-y-1 p-2 bg-[#f8fafc] border border-slate-200 rounded-lg">
                          <span className="font-bold text-[10px] text-slate-700 block truncate">{fn.split("/").pop()}</span>
                          <div className="pl-2 space-y-0.5 font-mono text-[9.5px] text-[#007acc]">
                            {dependencies[fn] && dependencies[fn].length > 0 ? (
                              dependencies[fn].map((dep: string) => (
                                <div key={dep} className="truncate">→ {dep}</div>
                              ))
                            ) : (
                              <div className="text-slate-400 italic font-sans text-[9px]">0 imports/includes</div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 italic">No dependency relationships parsed.</div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Active File info */}
          {activeFile && (
            <div className="mt-4 pt-4 border-t border-slate-100 shrink-0 font-sans text-[10.5px] leading-relaxed text-slate-500 font-semibold select-none">
              <div className="flex justify-between">
                <span>Active Target</span>
                <span className="text-slate-805 font-bold font-mono truncate max-w-[60%]">{activeFile.filename}</span>
              </div>
              <div className="flex justify-between">
                <span>Code Size</span>
                <span className="text-slate-805 font-bold font-mono">{activeFile.size} Bytes</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 4. VS CODE BLUE STATUS BAR (Very Bottom, `#007acc` background) */}
      <div className="h-6.5 bg-[#007acc] text-white flex items-center justify-between px-3 text-[11px] select-none shrink-0 font-sans z-10 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1 hover:bg-[#ffffff]/10 px-1.5 py-0.5 rounded cursor-pointer transition">
            <GitBranch className="w-3.5 h-3.5" />
            <span className="font-bold">main</span>
            {gitStatus?.status === "dirty" && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse ml-0.5" />}
          </div>

          <div className="flex items-center gap-1 text-[#ffffff]/90">
            <Check className="w-3 h-3 text-[#10b981]" />
            <span>Pre-compile: Ready</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[#f3f3f3]/90">
          <span className="hover:bg-[#ffffff]/10 px-1.5 py-0.5 rounded cursor-pointer">Ln 1, Col 1</span>
          <span>Spaces: 4</span>
          <span>UTF-8</span>
          <span>LF</span>
          <span className="hover:bg-[#ffffff]/10 px-1.5 py-0.5 rounded cursor-pointer font-bold">SystemVerilog</span>
          <span className="text-[#10b981] font-bold">✓ Live</span>
        </div>
      </div>

      {/* 5. Create New File Dialog overlay Modal */}
      {showNewFileDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-96 border border-slate-200 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Create New Module</h3>
              <p className="text-[10.5px] text-slate-505 mt-1 font-medium leading-relaxed">
                Enter name with prefix directory (e.g. <span className="font-mono text-blue-600">rtl/controller.sv</span> or <span className="font-mono text-emerald-600">tb/tb_alu.sv</span>).
              </p>
            </div>

            <input
              type="text"
              placeholder="rtl/my_module.sv"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 text-xs p-2.5 rounded-lg outline-none font-mono focus:border-blue-500 focus:bg-white transition"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFile();
                if (e.key === "Escape") setShowNewFileDialog(false);
              }}
            />

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => { setShowNewFileDialog(false); setNewFileName(""); }}
                className="border border-slate-200 hover:bg-slate-50 text-slate-755 font-bold px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                disabled={!newFileName.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition disabled:opacity-50 shadow-sm"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
