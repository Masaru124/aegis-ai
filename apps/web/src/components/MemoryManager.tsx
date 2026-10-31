"use client";

import React, { useState, useEffect } from "react";
import { Brain, Plus, Trash2, ShieldCheck, Database, Search, HardDrive, KeyRound } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

interface MemoryItem {
  id: string;
  memory_type: string;
  content: string;
  importance: number;
  is_approved: boolean;
  created_at: string;
}

export function MemoryManager() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [newContent, setNewContent] = useState("");
  const [memoryType, setMemoryType] = useState("preference");
  const [filterQuery, setFilterQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const loadMemories = async () => {
    try {
      const data = await fetchWithAuth("/memory/");
      setMemories(data);
    } catch (err) {
      console.error("Failed to load memories", err);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setLoading(true);
    try {
      await fetchWithAuth("/memory/", {
        method: "POST",
        body: JSON.stringify({
          content: newContent,
          memory_type: memoryType,
          importance: 1.2,
          is_approved: true,
        }),
      });
      setNewContent("");
      await loadMemories();
    } catch (err: any) {
      alert(`Memory vector ingestion failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchWithAuth(`/memory/${id}`, { method: "DELETE" });
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMemories = memories.filter((m) =>
    m.content.toLowerCase().includes(filterQuery.toLowerCase()) ||
    m.memory_type.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-void space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-cyan tracking-widest uppercase">
              [LONG_TERM_CONTEXT // VECTOR_SPACE]
            </span>
            <span className="text-steel-600 font-mono text-xs">•</span>
            <span className="font-mono text-[10px] text-steel-400">
              MINILM-L6-V2 EMBEDDING ENGINE
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-100 tracking-tight">
            Memory Vault & Adaptive Learning
          </h2>
          <p className="text-steel-400 text-xs font-mono mt-0.5">
            Explicit User-Approved Learning Engine • Persistent Context Without Unauthorized Base Weight Fine-Tuning
          </p>
        </div>

        {/* Telemetry Indicator */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-surface-card border border-surface-border text-xs font-mono text-steel-300 rounded-xs flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-cyan" />
            <span>INDEXED NODES: {memories.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Create Memory Vector (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="panel-frame p-6 rounded-xs space-y-5">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <span className="font-mono text-xs font-bold text-slate-200 tracking-wider uppercase">
                [INGEST // NEW_PREFERENCE]
              </span>
              <Plus className="w-4 h-4 text-cyan" />
            </div>

            <form onSubmit={handleAddMemory} className="space-y-4">
              <div>
                <label className="font-mono text-[10px] text-steel-400 uppercase tracking-wider block mb-1">
                  Vector Category
                </label>
                <select
                  value={memoryType}
                  onChange={(e) => setMemoryType(e.target.value)}
                  className="w-full bg-void border border-surface-border rounded-xs px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan"
                >
                  <option value="preference">User Preference (Coding style, tone, format)</option>
                  <option value="semantic">Domain Knowledge (Project rules, context)</option>
                  <option value="episodic">Episodic Event (Past outcomes, decisions)</option>
                  <option value="rule">Strict Invariant (Never exceed budget, etc.)</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[10px] text-steel-400 uppercase tracking-wider block mb-1">
                  Memory Guideline Text
                </label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="e.g. Always evaluate architectural choices using operational simplicity over trendy distributed microservices..."
                  className="w-full bg-void border border-surface-border rounded-xs p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-steel-400 bg-surface-card p-2 border border-surface-border">
                <ShieldCheck className="w-4 h-4 text-cyan shrink-0" />
                <span className="text-[11px]">User approval protocol active: only explicitly committed items persist.</span>
              </div>

              <button
                type="submit"
                disabled={loading || !newContent.trim()}
                className="w-full py-2.5 bg-cyan text-black hover:bg-cyan/90 font-mono font-bold text-xs uppercase tracking-wider rounded-xs transition-all shadow-cyan-glow disabled:opacity-40"
              >
                {loading ? "ENCODING_VECTOR..." : "COMMIT_TO_VECTOR_VAULT"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Indexed Memories List (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="panel-frame p-6 rounded-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3">
              <span className="font-mono text-xs font-bold text-slate-200 tracking-wider uppercase">
                [ACTIVE_VECTORS // RETRIEVAL_POOL]
              </span>

              {/* Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-steel-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter vectors..."
                  className="bg-void border border-surface-border rounded-xs pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredMemories.map((mem) => (
                <div key={mem.id} className="card-frame p-4 rounded-xs flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 border ${
                        mem.memory_type === "rule"
                          ? "bg-crimson-dim text-crimson border-crimson/40"
                          : mem.memory_type === "preference"
                          ? "bg-cyan-dim text-cyan border-cyan/40"
                          : "bg-amber-dim text-amber border-amber/40"
                      }`}>
                        {mem.memory_type}
                      </span>
                      <span className="font-mono text-[10px] text-steel-500">
                        {new Date(mem.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-slate-200 leading-relaxed">
                      {mem.content}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(mem.id)}
                    className="text-steel-600 hover:text-crimson p-1 transition-colors shrink-0"
                    title="Purge vector from memory vault"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {filteredMemories.length === 0 && (
                <div className="p-12 text-center text-steel-500 font-mono text-xs border border-dashed border-surface-border">
                  No vectors found matching query. Add a new guideline or dispatch self-learning feedback in chat.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
