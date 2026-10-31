"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { DecisionStudio } from "@/components/DecisionStudio";
import { MemoryManager } from "@/components/MemoryManager";
import { TaskManager } from "@/components/TaskManager";
import { DocumentVault } from "@/components/DocumentVault";
import { AuthView } from "@/components/AuthView";
import { getAuthToken, fetchWithAuth, removeAuthToken } from "@/lib/api";
import { Shield, Sparkles, Zap, Activity } from "lucide-react";

export type ModelType = "gemini" | "grok";

export default function Home() {
  const [activeTab, setActiveTab] = useState("chat");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelType>("gemini");

  useEffect(() => {
    // Restore preferred model from localStorage
    if (typeof window !== "undefined") {
      const savedModel = localStorage.getItem("aegis_model") as ModelType;
      if (savedModel === "gemini" || savedModel === "grok") {
        setSelectedModel(savedModel);
      }
    }

    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    // Verify token validity with backend
    fetchWithAuth("/auth/me")
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        removeAuthToken();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleModelChange = (model: ModelType) => {
    setSelectedModel(model);
    if (typeof window !== "undefined") {
      localStorage.setItem("aegis_model", model);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-void flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-14 h-14 border border-surface-border bg-surface-card flex items-center justify-center">
            <span className="font-mono text-xs text-cyan tracking-widest font-bold">AEGIS</span>
          </div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan animate-ping" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
            [SYS_INIT] Synchronizing Neural Gateway
          </p>
          <p className="font-mono text-[9px] text-slate-600">
            LOCATING MEMORY VECTORS // CRYPTOGRAPHIC HANDSHAKE
          </p>
        </div>
      </div>
    );
  }

  // Enforce Authentication
  if (!user) {
    return <AuthView onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-void text-slate-100 font-body">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        selectedModel={selectedModel}
        onSelectModel={handleModelChange}
        onLogout={() => setUser(null)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-void">
        {/* Top Tactical Command Strip */}
        <header className="h-14 border-b border-surface-border bg-surface flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan animate-pulse-subtle" />
              <span className="font-mono text-xs font-semibold tracking-wider text-slate-200 uppercase">
                {activeTab === "chat" && "Neural Command // Agent Chat"}
                {activeTab === "decision" && "MCDA Matrix // Decision Studio"}
                {activeTab === "memory" && "Vector Vault // Long-Term Memory"}
                {activeTab === "tasks" && "Dispatcher // Task Execution"}
                {activeTab === "documents" && "RAG Index // Document Vault"}
              </span>
            </div>
            <span className="text-steel-600 font-mono text-xs">/</span>
            <span className="font-mono text-[11px] text-steel-400 tracking-wider hidden md:inline">
              SYS_REV: 2.4.0
            </span>
          </div>

          {/* Tactical Model Switcher in Header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-surface-card p-1 border border-surface-border rounded-sm">
              <button
                onClick={() => handleModelChange("gemini")}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-wider transition-all rounded-sm ${
                  selectedModel === "gemini"
                    ? "bg-cyan-dim text-cyan border border-cyan/40 font-bold shadow-sm"
                    : "text-steel-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan" />
                <span>GEMINI 2.0</span>
                <span className="text-[9px] text-slate-500 font-normal hidden lg:inline">FLASH</span>
              </button>
              
              <button
                onClick={() => handleModelChange("grok")}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-wider transition-all rounded-sm ${
                  selectedModel === "grok"
                    ? "bg-amber-dim text-amber border border-amber/40 font-bold shadow-sm"
                    : "text-steel-400 hover:text-slate-200"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber" />
                <span>xAI GROK-2</span>
                <span className="text-[9px] text-slate-500 font-normal hidden lg:inline">VISION</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-surface-raised border border-surface-border text-[10px] font-mono text-steel-400 rounded-sm">
              <Activity className="w-3 h-3 text-cyan" />
              <span>LATENCY: 42ms</span>
            </div>
          </div>
        </header>

        {/* Main Content Surface */}
        <main className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
          {activeTab === "chat" && (
            <ChatInterface selectedModel={selectedModel} onSelectModel={handleModelChange} />
          )}
          {activeTab === "decision" && (
            <DecisionStudio selectedModel={selectedModel} />
          )}
          {activeTab === "memory" && <MemoryManager />}
          {activeTab === "tasks" && <TaskManager />}
          {activeTab === "documents" && <DocumentVault />}
        </main>
      </div>
    </div>
  );
}
