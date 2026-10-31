"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, Trash2, Calendar, Clock, AlertTriangle, Check, Layers } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  deadline?: string;
  created_at: string;
}

export function TaskManager() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);

  const loadTasks = async () => {
    try {
      const data = await fetchWithAuth("/tasks/");
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks", err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await fetchWithAuth("/tasks/", {
        method: "POST",
        body: JSON.stringify({ title, priority }),
      });
      setTitle("");
      await loadTasks();
    } catch (err: any) {
      alert(`Task dispatch failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (task: TaskItem) => {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await fetchWithAuth(`/tasks/${task.id}/status?status_str=${nextStatus}`, {
        method: "PATCH",
      });
      await loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchWithAuth(`/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-void space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-cyan tracking-widest uppercase">
              [AUTONOMOUS_EXECUTION // DISPATCHER]
            </span>
            <span className="text-steel-600 font-mono text-xs">•</span>
            <span className="font-mono text-[10px] text-steel-400">
              TASK QUEUE & CALENDAR SYNCHRONIZATION
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-100 tracking-tight">
            Task Dispatcher & Execution Engine
          </h2>
          <p className="text-steel-400 text-xs font-mono mt-0.5">
            Synchronized with LangGraph Agent Core for Automated Decision Follow-Through
          </p>
        </div>

        {/* Status Count */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-surface-card border border-surface-border text-xs font-mono text-steel-300 rounded-xs flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan" />
            <span>QUEUED TASKS: {tasks.filter(t => t.status !== "completed").length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Create Task (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="panel-frame p-6 rounded-xs space-y-5">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <span className="font-mono text-xs font-bold text-slate-200 tracking-wider uppercase">
                [DISPATCH // NEW_TASK]
              </span>
              <Plus className="w-4 h-4 text-cyan" />
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="font-mono text-[10px] text-steel-400 uppercase tracking-wider block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule offer review sync..."
                  className="w-full bg-void border border-surface-border rounded-xs px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] text-steel-400 uppercase tracking-wider block mb-1">
                  Priority Stratum
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-void border border-surface-border rounded-xs px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan"
                >
                  <option value="low">Low Priority [P3]</option>
                  <option value="medium">Medium Priority [P2]</option>
                  <option value="high">High Priority [P1]</option>
                  <option value="urgent">Urgent / Critical [P0]</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="w-full py-2.5 bg-cyan text-black hover:bg-cyan/90 font-mono font-bold text-xs uppercase tracking-wider rounded-xs transition-all shadow-cyan-glow disabled:opacity-40"
              >
                {loading ? "DISPATCHING..." : "COMMIT_TASK_TO_QUEUE"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Task Queue (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="panel-frame p-6 rounded-xs space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <span className="font-mono text-xs font-bold text-slate-200 tracking-wider uppercase">
                [EXECUTION_QUEUE // LIVE_DISPATCH]
              </span>
              <span className="font-mono text-[10px] text-steel-500">
                TOTAL: {tasks.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {tasks.map((task) => {
                const isDone = task.status === "completed";
                const isUrgent = task.priority === "urgent";
                const isHigh = task.priority === "high";

                return (
                  <div 
                    key={task.id} 
                    className={`card-frame p-3.5 rounded-xs flex items-center justify-between gap-4 transition-all ${
                      isDone ? "opacity-45 bg-void" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <button
                        onClick={() => toggleStatus(task)}
                        className={`w-5 h-5 rounded-xs border flex items-center justify-center transition-colors shrink-0 ${
                          isDone 
                            ? "bg-cyan text-black border-cyan font-bold" 
                            : "border-steel-600 hover:border-cyan bg-void"
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="truncate">
                        <p className={`text-xs font-mono font-medium truncate ${isDone ? "line-through text-steel-500" : "text-slate-200"}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`font-mono text-[9px] uppercase px-1.5 py-0.2 border ${
                            isUrgent 
                              ? "text-crimson bg-crimson-dim border-crimson/40 font-bold" 
                              : isHigh 
                              ? "text-amber bg-amber-dim border-amber/40" 
                              : "text-steel-400 bg-surface border-surface-border"
                          }`}>
                            {task.priority}
                          </span>
                          <span className="font-mono text-[9px] text-steel-600">
                            ID: {task.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-steel-600 hover:text-crimson p-1.5 transition-colors shrink-0"
                      title="Delete task item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              {tasks.length === 0 && (
                <div className="p-12 text-center text-steel-500 font-mono text-xs border border-dashed border-surface-border">
                  Queue is clear. Dispatch tasks from chat ("create task ...") or add directly above.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
