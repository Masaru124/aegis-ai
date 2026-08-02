"use client";

import React from "react";
import { MessageSquare, Cpu, Brain, CheckSquare, FileText, Shield, LogOut } from "lucide-react";
import { removeAuthToken } from "@/lib/api";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

export function Sidebar({ activeTab, setActiveTab, user, onLogout }: SidebarProps) {
  const navItems = [
    { id: "chat", label: "Agent Chat", icon: MessageSquare },
    { id: "decision", label: "Decision Studio", icon: Cpu },
    { id: "memory", label: "Memory & Profile", icon: Brain },
    { id: "tasks", label: "Tasks & Schedule", icon: CheckSquare },
    { id: "documents", label: "Document Vault", icon: FileText },
  ];

  const handleLogoutClick = () => {
    removeAuthToken();
    onLogout();
  };

  return (
    <aside className="w-64 glass-panel h-screen flex flex-col justify-between p-4 border-r border-slate-800">
      <div>
        <div className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight gradient-text">AegisAI</h1>
            <p className="text-xs text-slate-400 font-medium">Decision Intelligence</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800/60 space-y-3">
        <div className="glass-card p-3 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white uppercase">
            {user?.name?.[0] || "U"}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || "Aegis User"}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || "Authenticated"}</p>
          </div>
        </div>

        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-rose-500/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
