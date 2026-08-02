"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, Trash2, Calendar, Clock, AlertCircle } from "lucide-react";
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

    try {
      await fetchWithAuth("/tasks/", {
        method: "POST",
        body: JSON.stringify({ title, priority }),
      });
      setTitle("");
      await loadTasks();
    } catch (err) {
      console.error(err);
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
    <div className="flex-1 overflow-y-auto p-8 bg-slate-950 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <CheckSquare className="w-7 h-7 text-emerald-400" />
          Productivity & Task Management
        </h2>
        <p className="text-slate-400 text-sm mt-1">Autonomous Task Scheduling & Priority Execution Engine</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task Creation Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-semibold text-slate-200 border-b border-slate-800 pb-3">New Task Item</h3>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Task Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Review Q3 Decision Strategy Matrix..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
            >
              Add Task
            </button>
          </form>
        </div>

        {/* Tasks List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-semibold text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
            Active Tasks
            <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/50">
              {tasks.length} Tasks Scheduled
            </span>
          </h3>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="glass-card p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.status === "completed"}
                    onChange={() => toggleStatus(task)}
                    className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                  />
                  <div>
                    <p className={`text-xs font-semibold ${task.status === "completed" ? "line-through text-slate-500" : "text-slate-200"}`}>
                      {task.title}
                    </p>
                    <span className="text-[10px] uppercase font-bold text-emerald-400">{task.priority} Priority</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
