"use client";

import React, { useState } from "react";
import { Send, Bot, User, ThumbsUp, ThumbsDown, Sparkles, Brain, CheckCircle2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  used_memories?: string[];
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I am AegisAI, your adaptive assistant equipped with Decision Intelligence. How can I assist your goals today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackFeedback, setFeedbackFeedback] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsLoading(true);

    try {
      const data = await fetchWithAuth("/chat/chat", {
        method: "POST",
        body: JSON.stringify({
          message: userText,
          provider: "gemini",
          enable_memory: true,
        }),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: data.message.id,
          role: "assistant",
          content: data.message.content,
          used_memories: data.used_memories,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Notice: Operating in local autonomous mode. (${err.message})`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelfLearningFeedback = async (messageId: string, rating: number) => {
    const correction = prompt("Teach AegisAI: What preference or correction should be remembered for future responses?");
    if (!correction) return;

    try {
      await fetchWithAuth("/memory/feedback", {
        method: "POST",
        body: JSON.stringify({
          message_id: messageId,
          rating,
          correction,
          approve_as_memory: true,
        }),
      });
      setFeedbackFeedback("Feedback approved! AegisAI long-term memory updated.");
      setTimeout(() => setFeedbackFeedback(null), 4000);
    } catch (err) {
      console.error("Feedback submission error", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-950">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-800 glass-panel flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            Adaptive Agent Studio
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
              LangGraph RAG
            </span>
          </h2>
          <p className="text-xs text-slate-400">Context-Aware Realtime Orchestration</p>
        </div>
        {feedbackFeedback && (
          <div className="flex items-center gap-2 text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/30 animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            {feedbackFeedback}
          </div>
        )}
      </header>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-4 max-w-4xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gradient-to-tr from-purple-600 to-blue-600 text-white"
              }`}
            >
              {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>

            <div className="space-y-2 max-w-2xl">
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "glass-card text-slate-200 border border-slate-800 rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Used Memory Indicators */}
                {msg.used_memories && msg.used_memories.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-wrap items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[11px] text-purple-300 font-medium">Refined with Memory:</span>
                    {msg.used_memories.map((mem, mIdx) => (
                      <span
                        key={mIdx}
                        className="text-[10px] bg-purple-950/60 text-purple-200 px-2 py-0.5 rounded border border-purple-800/50 truncate max-w-xs"
                      >
                        {mem}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Feedback Actions for Self-Learning */}
              {msg.role === "assistant" && idx > 0 && (
                <div className="flex items-center gap-3 px-1">
                  <span className="text-[11px] text-slate-500">Self-Learning Feedback:</span>
                  <button
                    onClick={() => handleSelfLearningFeedback(msg.id || "msg", 5)}
                    className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Approve & Teach Assistant"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleSelfLearningFeedback(msg.id || "msg", 1)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Provide Correction"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 max-w-4xl">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 flex items-center justify-center animate-pulse">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div className="glass-card p-4 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
              AegisAI analyzing context, memories & evaluating decision matrix...
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-800 glass-panel">
        <div className="max-w-4xl mx-auto flex items-center gap-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 focus-within:border-blue-500/50 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AegisAI anything or submit options to evaluate..."
            className="flex-1 bg-transparent px-3 text-sm text-slate-100 focus:outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center justify-center transition-colors shrink-0 shadow-lg shadow-blue-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
