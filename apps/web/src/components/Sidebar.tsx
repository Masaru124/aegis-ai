"use client";

import React from "react";
import { 
  MessageSquare, 
  Cpu, 
  Brain, 
  CheckSquare, 
  FileText, 
  LogOut, 
  Radio, 
  Sparkles, 
  Zap, 
  Fingerprint 
} from "lucide-react";
import { removeAuthToken } from "@/lib/api";
import { ModelType } from "@/app/page";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  selectedModel: ModelType;
  onSelectModel: (model: ModelType) => void;
  onLogout: () => void;
}

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  user, 
  selectedModel, 
  onSelectModel, 
  onLogout 
}: SidebarProps) {
  const navItems = [
    { id: "chat", num: "01", label: "Agent Chat", sub: "Neural Pipeline", icon: MessageSquare, key: "⌘1" },
    { id: "decision", num: "02", label: "Decision Studio", sub: "MCDA Matrix", icon: Cpu, key: "⌘2" },
    { id: "memory", num: "03", label: "Memory Vault", sub: "Vector Embeddings", icon: Brain, key: "⌘3" },
    { id: "tasks", num: "04", label: "Task Dispatcher", sub: "Productivity", icon: CheckSquare, key: "⌘4" },
    { id: "documents", num: "05", label: "Document Vault", sub: "RAG Ingestion", icon: FileText, key: "⌘5" },
  ];

  const handleLogoutClick = () => {
    removeAuthToken();
    onLogout();
  };

  return (
    <aside className="w-72 bg-surface panel-frame h-screen flex flex-col justify-between p-4 border-r border-surface-border select-none z-10 shrink-0">
      <div>
        {/* Monolith Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-surface-border pb-4">
          <div className="w-9 h-9 bg-void border border-cyan/40 flex items-center justify-center shrink-0 shadow-sm relative">
            <span className="font-mono text-cyan text-sm font-bold tracking-tighter">Æ</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-1 h-1 bg-cyan" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <h1 className="font-display font-bold text-sm tracking-wide text-slate-100">
                AEGIS // AI
              </h1>
              <span className="font-mono text-[9px] text-cyan bg-cyan-dim px-1.5 py-0.5 border border-cyan/30 rounded-xs">
                ONLINE
              </span>
            </div>
            <p className="font-mono text-[10px] text-steel-400 tracking-wider">
              DECISION_INTELLIGENCE
            </p>
          </div>
        </div>

        {/* Navigation Deck */}
        <div className="mb-2 px-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-steel-500 font-semibold">
            [SYS_ROUTING // SECTORS]
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full group flex items-center justify-between px-3 py-2.5 transition-all text-left border rounded-xs ${
                  isActive
                    ? "bg-surface-raised text-slate-100 border-cyan/40 shadow-tactile"
                    : "text-steel-400 hover:text-slate-200 hover:bg-surface-card border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className={`font-mono text-[10px] ${isActive ? "text-cyan font-bold" : "text-steel-600"}`}>
                    {item.num}
                  </span>
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-cyan" : "text-steel-400 group-hover:text-slate-200"}`} />
                  <div className="truncate">
                    <p className="text-xs font-medium tracking-wide leading-tight">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-steel-500 font-mono tracking-tight leading-none mt-0.5">
                      {item.sub}
                    </p>
                  </div>
                </div>

                <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-xs transition-colors ${
                  isActive ? "bg-surface-card text-cyan border border-cyan/20" : "text-steel-600 group-hover:text-steel-400"
                }`}>
                  {item.key}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Active Model Telemetry Card */}
        <div className="mt-6 p-3 bg-surface-card border border-surface-border rounded-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-steel-400">
              [ACTIVE_NEURAL_CORE]
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse-subtle" />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              {selectedModel === "gemini" ? (
                <Sparkles className="w-3.5 h-3.5 text-cyan shrink-0" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-amber shrink-0" />
              )}
              <span className="font-mono text-xs font-bold text-slate-200 truncate">
                {selectedModel === "gemini" ? "Google Gemini 2.0" : "xAI Grok-2 Vision"}
              </span>
            </div>

            <button
              onClick={() => onSelectModel(selectedModel === "gemini" ? "grok" : "gemini")}
              className="font-mono text-[9px] text-steel-300 hover:text-cyan underline underline-offset-2 shrink-0"
              title="Click to toggle model"
            >
              SWAP
            </button>
          </div>

          <p className="text-[10px] font-mono text-steel-500 leading-tight">
            {selectedModel === "gemini"
              ? "1M Token Context // DeepMind RAG"
              : "Real-time Telemetry // Deep Mathematical Logic"}
          </p>
        </div>
      </div>

      {/* Operator Deck & Signout */}
      <div className="pt-3 border-t border-surface-border space-y-2">
        <div className="p-2.5 bg-surface-card border border-surface-border rounded-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 bg-surface-raised border border-steel-700 flex items-center justify-center font-mono font-bold text-xs text-cyan shrink-0">
              <Fingerprint className="w-4 h-4 text-cyan" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate font-mono">
                {user?.name || "OPERATOR"}
              </p>
              <p className="text-[10px] text-steel-400 truncate font-mono">
                {user?.email || "ENCRYPTED_SESSION"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-mono text-crimson hover:bg-crimson-dim rounded-xs transition-colors border border-crimson/20"
        >
          <LogOut className="w-3 h-3" />
          <span>TERMINATE_SESSION</span>
        </button>
      </div>
    </aside>
  );
}
