"use client";

import React, { useState, useEffect } from "react";
import { Brain, Plus, Trash2, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

interface MemoryItem {
  id: string;
  memory_type: string;
  content: string;
  importance: number;
  is_approved: bool;
  created_at: string;
}

export function MemoryManager() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [newContent, setNewContent] = useState("");
  const [memoryType, setMemoryType] = useState("preference");
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
      alert(`Memory creation failed: ${err.message}`);
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

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-950 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Brain className="w-7 h-7 text-purple-400" />
          Long-Term Memory & Self-Learning Vault
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Explicit User-Approved Learning Engine: Controls persistent preferences and semantic context
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Memory Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-semibold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-purple-400" />
            Add Custom Preference / Guideline
          </h3>

          <form onSubmit={handleAddMemory} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Memory Category</label>
              <select
                value={memoryType}
                onChange={(e) => setMemoryType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="preference">User Preference</option>
                <option value="semantic">Domain Knowledge</option>
                <option value="episodic">Project Event</option>
                <option value="rule">Assistant Rule</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Memory Content</label>
              <textarea
                rows={4}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="e.g. Always prioritize Python code examples with clean type hints..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Explicit user approval active</span>
            </div>

            <button
              type="submit"
              disabled={loading || !newContent.trim()}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-purple-600/20 transition-colors"
            >
              {loading ? "Storing Memory..." : "Save Memory Vector"}
            </button>
          </form>
        </div>

        {/* Memories List Panel */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-semibold text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
            Active Learned Memories
            <span className="text-xs text-purple-400 font-mono bg-purple-950/60 px-2.5 py-1 rounded-md border border-purple-800/50">
              {memories.length} Items Indexed
            </span>
          </h3>

          <div className="space-y-3">
            {memories.map((mem) => (
              <div key={mem.id} className="glass-card p-4 rounded-xl flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-700/50">
                      {mem.memory_type}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(mem.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed pt-1">{mem.content}</p>
                </div>

                <button
                  onClick={() => handleDelete(mem.id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors"
                  title="Delete memory entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {memories.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">
                No custom memories found. Submit user feedback or add preferences above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
