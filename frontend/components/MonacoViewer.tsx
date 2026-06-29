"use client";

import React from "react";
import Editor from "@monaco-editor/react";
import { Copy, Download, Code } from "lucide-react";

interface MonacoViewerProps {
  code: string;
  filename: string;
  onCodeChange?: (newVal: string) => void;
  readOnly?: boolean;
}

export default function MonacoViewer({ code, filename, onCodeChange, readOnly = true }: MonacoViewerProps) {
  const fileExt = filename.split(".").pop() || "";
  
  // Resolve monaco editor language configurations
  let language = "plaintext";
  if (["v", "sv", "vhdl"].includes(fileExt.toLowerCase())) {
    language = "verilog";
  } else if (["json"].includes(fileExt.toLowerCase())) {
    language = "json";
  } else if (["md"].includes(fileExt.toLowerCase())) {
    language = "markdown";
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    alert("Copied code to clipboard!");
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0e17] rounded-lg border border-border overflow-hidden">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-primary" />
          <span className="font-mono text-sm text-slate-300 font-medium">{filename}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            title="Copy Code"
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            title="Download File"
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(val) => onCodeChange && onCodeChange(val || "")}
          options={{
            readOnly,
            fontSize: 13,
            fontFamily: "JetBrains Mono, monospace",
            minimap: { enabled: true },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true
          }}
        />
      </div>
    </div>
  );
}
