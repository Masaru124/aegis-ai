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
import { Shield } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("chat");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center animate-pulse shadow-lg shadow-blue-500/25">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <p className="text-xs text-slate-400 font-medium">Validating AegisAI Session...</p>
      </div>
    );
  }

  // Enforce Authentication: Show AuthView if not logged in
  if (!user) {
    return <AuthView onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={() => setUser(null)}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {activeTab === "chat" && <ChatInterface />}
        {activeTab === "decision" && <DecisionStudio />}
        {activeTab === "memory" && <MemoryManager />}
        {activeTab === "tasks" && <TaskManager />}
        {activeTab === "documents" && <DocumentVault />}
      </main>
    </div>
  );
}
