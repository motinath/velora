"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Cpu, Terminal, FileText, Sparkles, Loader, MessageSquare } from "lucide-react";
import CircuitDiagram from "./CircuitDiagram";

interface Message {
  id: number;
  role: string;
  content: string;
  context_metadata?: {
    agent_type?: string;
    model_used?: string;
    retrieved_documents?: string[];
  };
}

interface ChatAreaProps {
  messages: Message[];
  loading: boolean;
  onSendMessage: (text: string) => void;
  selectedSessionId: number | null;
}

export default function ChatArea({
  messages,
  loading,
  onSendMessage,
  selectedSessionId
}: ChatAreaProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterPrompts = [
    {
      title: "ALU Schematic",
      description: "Draw the circuit diagram for an 8-bit ALU",
      prompt: "Draw the circuit diagram for an 8-bit ALU subsystem"
    },
    {
      title: "Register Design",
      description: "Show sequential logic setup & hold flip-flop schema",
      prompt: "Show the circuit diagram for a sequential register stage with setup and hold paths"
    },
    {
      title: "Timing Analysis",
      description: "Understand setup and hold critical timing slack constraints",
      prompt: "Explain setup and hold time constraints in timing reports"
    },
    {
      title: "Clock Tree (CTS)",
      description: "Analyze metrics, skew, latency, and tree topologies",
      prompt: "What is Clock Tree Synthesis (CTS) and what are its key topologies?"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleStarterClick = (prompt: string) => {
    if (!loading) {
      onSendMessage(prompt);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const renderMessageContent = (content: string) => {
    const regex = /\[CIRCUIT_DIAGRAM\]([\s\S]*?)\[\/CIRCUIT_DIAGRAM\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.substring(lastIndex, match.index)
        });
      }

      try {
        const diagramData = JSON.parse(match[1].trim());
        parts.push({
          type: "diagram",
          data: diagramData
        });
      } catch (e) {
        console.error("Failed to parse circuit diagram JSON", e);
        parts.push({
          type: "text",
          content: match[0]
        });
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex)
      });
    }

    return parts.length > 0 ? parts : [{ type: "text", content }];
  };

  const getAgentBadge = (agentType?: string) => {
    if (!agentType) return null;
    const colors: Record<string, string> = {
      rtl: "bg-cyan-950/40 text-cyan-400 border-cyan-800/60",
      report: "bg-amber-950/40 text-amber-400 border-amber-800/60",
      log: "bg-red-950/40 text-red-400 border-red-800/60",
      doc: "bg-indigo-950/40 text-indigo-400 border-indigo-800/60",
      chat: "bg-slate-800/60 text-slate-300 border-slate-700/60"
    };

    const icons: Record<string, React.ReactNode> = {
      rtl: <Cpu className="w-3 h-3" />,
      report: <Terminal className="w-3 h-3" />,
      log: <Terminal className="w-3 h-3" />,
      doc: <FileText className="w-3 h-3" />,
      chat: <Sparkles className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] uppercase font-mono tracking-wider font-semibold ${
        colors[agentType] || colors.chat
      }`}>
        {icons[agentType] || icons.chat}
        {agentType} Agent
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      {/* Workspace Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {!selectedSessionId ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <MessageSquare className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-400">No Chat Session Active</h3>
            <p className="text-xs text-slate-600 max-w-xs mt-1 leading-relaxed">
              Select a session or create a new one in the sidebar to start designing circuits and diagnosing timing delays.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto px-4 py-8 space-y-8">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center font-bold text-black text-2xl mx-auto shadow-lg shadow-cyan-500/10">
                V
              </div>
              <h2 className="text-xl font-bold text-slate-200 mt-4 font-sans tracking-wide">How can I help you design today?</h2>
              <p className="text-xs text-slate-400 max-w-sm font-sans">
                Ask about logic circuits, clock networks, timing margins, or write synthesizable Verilog modules.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {starterPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleStarterClick(p.prompt)}
                  className="text-left bg-slate-900/30 hover:bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 p-4 rounded-xl transition duration-200 group flex flex-col justify-between h-28 cursor-pointer"
                >
                  <span className="font-semibold text-slate-300 group-hover:text-cyan-400 transition text-xs font-sans">
                    {p.title}
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-sans">
                    {p.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[90%] ${
                  msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                {/* Agent badge for assistant replies */}
                {msg.role === "assistant" && msg.context_metadata?.agent_type && (
                  <div className="mb-1.5">{getAgentBadge(msg.context_metadata.agent_type)}</div>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 text-sm shadow-sm transition-all duration-200 border leading-relaxed ${
                    msg.role === "user"
                      ? "bg-slate-800/80 border-slate-700/50 text-slate-100"
                      : "bg-card border-border/80 text-slate-200 w-full"
                  }`}
                >
                  {/* Interpret message content for circuit diagram payloads */}
                  {renderMessageContent(msg.content).map((part, idx) => {
                    if (part.type === "diagram" && part.data) {
                      return (
                        <CircuitDiagram
                          key={idx}
                          title={part.data.title}
                          nodes={part.data.nodes}
                          connections={part.data.connections}
                        />
                      );
                    }
                    return (
                      <div key={idx} className="whitespace-pre-wrap font-sans">
                        {part.content}
                      </div>
                    );
                  })}
                </div>
                
                {/* Timestamp or model tag */}
                {msg.role === "assistant" && msg.context_metadata?.model_used && (
                  <span className="text-[10px] text-slate-500 font-mono mt-1 px-1">
                    Model: {msg.context_metadata.model_used}
                  </span>
                )}
              </div>
            ))}
          </>
        )}

        {loading && (
          <div className="flex items-center gap-3 text-slate-400 bg-card border border-border rounded-xl px-4 py-3 max-w-[200px]">
            <Loader className="w-4 h-4 animate-spin text-cyan-400" />
            <span className="text-xs font-mono">Velora is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input container */}
      <div className="p-4 bg-card/60 border-t border-border/60">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder={
              selectedSessionId 
                ? "Ask about logic circuits, CTS, STA slack reports, or design modules..." 
                : "Select or create a chat session to begin..."
            }
            disabled={!selectedSessionId || loading}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm text-slate-200 outline-none placeholder-slate-500 focus:border-cyan-500/80 disabled:opacity-50 font-sans"
          />
          <button
            type="submit"
            disabled={!selectedSessionId || loading || !input.trim()}
            className="bg-cyan-500 text-black font-semibold p-3 rounded-xl hover:bg-cyan-400 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
