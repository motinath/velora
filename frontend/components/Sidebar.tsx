"use client";

import React, { useState } from "react";
import { Folder, FileText, MessageSquare, Plus, Trash2, LogOut, Upload, Settings } from "lucide-react";

interface Project {
  id: number;
  name: string;
}

interface ProjectFile {
  id: number;
  filename: string;
  type: string;
}

interface ChatSession {
  id: number;
  name: string;
}

interface SidebarProps {
  projects: Project[];
  selectedProjectId: number | null;
  files: ProjectFile[];
  chatSessions: ChatSession[];
  selectedSessionId: number | null;
  onSelectProject: (id: number) => void;
  onCreateProject: (name: string) => void;
  onDeleteProject: (id: number) => void;
  onFileUpload: (file: File) => void;
  onDeleteFile: (id: number) => void;
  onSelectSession: (id: number) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: number) => void;
  onLogout: () => void;
}

export default function Sidebar({
  projects,
  selectedProjectId,
  files,
  chatSessions,
  selectedSessionId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onFileUpload,
  onDeleteFile,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onLogout
}: SidebarProps) {
  const [newProjName, setNewProjName] = useState("");
  const [showProjInput, setShowProjInput] = useState(false);

  const handleCreateProj = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjName.trim()) {
      onCreateProject(newProjName.trim());
      setNewProjName("");
      setShowProjInput(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-80 border-r border-border h-screen flex flex-col bg-card select-none">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-black font-sans text-sm">
            V
          </div>
          <span className="font-bold text-lg text-white font-sans tracking-wide">VELORA</span>
          <span className="text-[9px] bg-slate-800 border border-border px-1.5 py-0.5 rounded text-primary uppercase font-mono">Phase 1</span>
        </div>
        <button
          onClick={onLogout}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Projects list */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          <span>Projects</span>
          <button 
            onClick={() => setShowProjInput(!showProjInput)}
            className="p-0.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {showProjInput && (
          <form onSubmit={handleCreateProj} className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Project name"
              value={newProjName}
              onChange={(e) => setNewProjName(e.target.value)}
              className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-primary"
            />
            <button type="submit" className="bg-primary text-black font-semibold rounded px-2 text-xs hover:bg-primary-hover">
              Add
            </button>
          </form>
        )}

        <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className={`flex items-center justify-between group rounded p-2 text-xs font-medium cursor-pointer transition ${
                selectedProjectId === proj.id 
                  ? "bg-slate-800/80 text-white border-l-2 border-primary" 
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
              }`}
              onClick={() => onSelectProject(proj.id)}
            >
              <div className="flex items-center gap-2 truncate">
                <Folder className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                <span className="truncate">{proj.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProject(proj.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-700 text-slate-500 hover:text-red-500 rounded transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {projects.length === 0 && (
            <p className="text-[10px] text-slate-600 text-center py-2">No projects created yet.</p>
          )}
        </div>
      </div>

      {/* Files Section */}
      <div className="flex-1 flex flex-col min-h-0 border-b border-border">
        <div className="p-3 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Files</span>
          {selectedProjectId && (
            <label className="p-0.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer" title="Upload File">
              <Upload className="w-3.5 h-3.5" />
              <input type="file" onChange={handleFileInput} className="hidden" />
            </label>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between group rounded p-1.5 text-xs text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-3.5 h-3.5 text-secondary/70 shrink-0" />
                <span className="truncate font-mono">{file.filename}</span>
              </div>
              <button
                onClick={() => onDeleteFile(file.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-700 text-slate-500 hover:text-red-500 rounded transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {(!selectedProjectId) ? (
            <p className="text-[10px] text-slate-600 text-center py-4">Select a project to upload files.</p>
          ) : files.length === 0 ? (
            <p className="text-[10px] text-slate-600 text-center py-4">No files uploaded.</p>
          ) : null}
        </div>
      </div>

      {/* Chat Sessions list */}
      <div className="h-64 flex flex-col min-h-0 bg-slate-950/20">
        <div className="p-3 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Chat History</span>
          {selectedProjectId && (
            <button
              onClick={onCreateSession}
              className="p-0.5 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
              title="New Chat Session"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {chatSessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center justify-between group rounded p-2 text-xs font-medium cursor-pointer transition ${
                selectedSessionId === session.id
                  ? "bg-slate-800/80 text-white"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
              }`}
              onClick={() => onSelectSession(session.id)}
            >
              <div className="flex items-center gap-2 truncate">
                <MessageSquare className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                <span className="truncate">{session.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-700 text-slate-500 hover:text-red-500 rounded transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {(!selectedProjectId) ? (
            <p className="text-[10px] text-slate-600 text-center py-4">Select a project to chat.</p>
          ) : chatSessions.length === 0 ? (
            <p className="text-[10px] text-slate-600 text-center py-4">No active chat sessions.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
