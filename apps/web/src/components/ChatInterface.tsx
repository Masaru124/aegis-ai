"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Terminal, 
  Sparkles, 
  Zap, 
  Brain, 
  CheckCircle2, 
  ArrowUpRight, 
  ThumbsUp, 
  ThumbsDown,
  ChevronDown,
  Layers,
  CornerDownLeft,
  X
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { ModelType } from "@/app/page";
import { FormattedMessage } from "./FormattedMessage";

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  modelUsed?: string;
  used_memories?: string[];
  timestamp?: string;
}

interface ChatInterfaceProps {
  selectedModel: ModelType;
  onSelectModel: (model: ModelType) => void;
}

export function ChatInterface({ selectedModel, onSelectModel }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "AegisAI neural core initialized. Context memory and Multi-Criteria Decision Analysis (MCDA) engines are active.\n\nRunning on **Groq LPU (GPT-OSS-120B)** for sub-second objective reasoning, with **Gemini 2.0 Flash** available as secondary engine. Dispatch any decision problem, task, or research query.",
      modelUsed: "groq",
      timestamp: "00:00:01",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  
  // Inline feedback modal / drawer state
  const [activeFeedbackMsgId, setActiveFeedbackMsgId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackCorrection, setFeedbackCorrection] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent, presetText?: string) => {
    if (e) e.preventDefault();
    const textToSend = presetText || input;
    if (!textToSend.trim() || isLoading) return;

    if (!presetText) setInput("");
    
    const now = new Date();
    const timeString = now.toTimeString().split(" ")[0];

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: textToSend,
        timestamp: timeString,
      },
    ]);
    setIsLoading(true);

    try {
      const data = await fetchWithAuth("/chat/chat", {
        method: "POST",
        body: JSON.stringify({
          message: textToSend,
          provider: selectedModel,
          enable_memory: true,
        }),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: data.message.id,
          role: "assistant",
          content: data.message.content,
          modelUsed: selectedModel,
          used_memories: data.used_memories,
          timestamp: new Date().toTimeString().split(" ")[0],
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Notice: System fallback autonomous response generated. (${err.message})`,
          modelUsed: selectedModel,
          timestamp: new Date().toTimeString().split(" ")[0],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (!activeFeedbackMsgId || !feedbackCorrection.trim()) return;
    setIsSubmittingFeedback(true);

    try {
      await fetchWithAuth("/memory/feedback", {
        method: "POST",
        body: JSON.stringify({
          message_id: activeFeedbackMsgId,
          rating: feedbackRating,
          correction: feedbackCorrection,
          approve_as_memory: true,
        }),
      });
      setFeedbackSuccess("User-approved memory updated in vector store!");
      setActiveFeedbackMsgId(null);
      setFeedbackCorrection("");
      setTimeout(() => setFeedbackSuccess(null), 4000);
    } catch (err: any) {
      alert(`Feedback submission failed: ${err.message}`);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-void overflow-hidden">
      {/* Model Spec Bar */}
      <div className="px-6 py-2.5 bg-surface-card border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-steel-500 uppercase tracking-widest">
            ENGINE SELECTION:
          </span>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectModel("groq")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono border transition-all rounded-xs ${
                selectedModel === "groq" || selectedModel === "grok"
                  ? "bg-amber-dim text-amber border-amber/50 font-bold"
                  : "bg-surface text-steel-400 border-surface-border hover:border-steel-600"
              }`}
            >
              <Zap className="w-3 h-3 text-amber" />
              <span>GROQ LPU (120B)</span>
              <span className="text-[9px] text-steel-500 hidden sm:inline">• SUB-SECOND</span>
            </button>

            <button
              onClick={() => onSelectModel("gemini")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono border transition-all rounded-xs ${
                selectedModel === "gemini"
                  ? "bg-cyan-dim text-cyan border-cyan/50 font-bold"
                  : "bg-surface text-steel-400 border-surface-border hover:border-steel-600"
              }`}
            >
              <Sparkles className="w-3 h-3 text-cyan" />
              <span>GEMINI 2.0 FLASH</span>
              <span className="text-[9px] text-steel-500 hidden sm:inline">• 1M CTX</span>
            </button>
          </div>
        </div>

        {feedbackSuccess && (
          <div className="flex items-center gap-2 text-[11px] font-mono text-cyan bg-cyan-dim px-3 py-1 border border-cyan/40 animate-pulse rounded-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{feedbackSuccess}</span>
          </div>
        )}
      </div>

      {/* Quick Discovery Chips */}
      <div className="px-6 py-2 border-b border-surface-border bg-surface/50 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="font-mono text-[9px] text-steel-500 tracking-wider uppercase shrink-0">
          DISPATCH SHORTCUTS:
        </span>
        <button
          onClick={() => handleSend(undefined, "I have two job offers: Option A pays $140k with 3 days in office, while Option B pays $120k with 100% remote work. How should I evaluate this decision?")}
          className="shrink-0 px-2.5 py-1 bg-surface-card hover:bg-surface-raised border border-surface-border hover:border-cyan/40 text-steel-300 text-[11px] font-mono flex items-center gap-1.5 transition-colors rounded-xs"
        >
          <ArrowUpRight className="w-3 h-3 text-cyan" />
          <span>Job Offer MCDA Matrix</span>
        </button>

        <button
          onClick={() => handleSend(undefined, "Create task: Review Q3 Decision Strategy Matrix with urgent priority")}
          className="shrink-0 px-2.5 py-1 bg-surface-card hover:bg-surface-raised border border-surface-border hover:border-amber/40 text-steel-300 text-[11px] font-mono flex items-center gap-1.5 transition-colors rounded-xs"
        >
          <ArrowUpRight className="w-3 h-3 text-amber" />
          <span>Dispatch Urgent Task</span>
        </button>

        <button
          onClick={() => handleSend(undefined, "Please remember that I prefer concise, mathematically rigorous decision analysis without conversational filler.")}
          className="shrink-0 px-2.5 py-1 bg-surface-card hover:bg-surface-raised border border-surface-border hover:border-steel-500 text-steel-300 text-[11px] font-mono flex items-center gap-1.5 transition-colors rounded-xs"
        >
          <ArrowUpRight className="w-3 h-3 text-steel-400" />
          <span>Ingest Preference Memory</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col max-w-4xl ${msg.role === "user" ? "ml-auto items-end" : "items-start"}`}
          >
            {/* Message Origin Telemetry */}
            <div className="flex items-center gap-2 mb-1.5 px-1 font-mono text-[10px] text-steel-500">
              {msg.role === "user" ? (
                <>
                  <span className="text-slate-400 font-bold">[OPERATOR // DISPATCH]</span>
                  <span>{msg.timestamp}</span>
                </>
              ) : (
                <>
                  <span className={`font-bold flex items-center gap-1.5 ${msg.modelUsed === "groq" || msg.modelUsed === "grok" ? "text-amber" : "text-cyan"}`}>
                    {msg.modelUsed === "groq" || msg.modelUsed === "grok" ? (
                      <>
                        <Zap className="w-3 h-3 text-amber" />
                        [AEGIS // GROQ LPU]
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-cyan" />
                        [AEGIS // GEMINI 2.0]
                      </>
                    )}
                  </span>
                  <span>{msg.timestamp}</span>
                </>
              )}
            </div>

            {/* Message Body Card */}
            <div
              className={`p-5 rounded-xs border text-sm leading-relaxed transition-all max-w-3xl ${
                msg.role === "user"
                  ? "bg-surface-raised border-steel-700 text-slate-100 shadow-tactile"
                  : "bg-surface-card border-surface-border text-slate-200 shadow-sm"
              }`}
            >
              <FormattedMessage content={msg.content} isGrok={msg.modelUsed === "grok"} />

              {/* Memory Node Telemetry Readout */}
              {msg.used_memories && msg.used_memories.length > 0 && (
                <div className="mt-4 pt-3 border-t border-surface-border/60">
                  <div className="flex items-center gap-1.5 mb-2 font-mono text-[10px] text-cyan">
                    <Brain className="w-3 h-3 text-cyan" />
                    <span className="tracking-widest uppercase font-bold">[MEMORY_VECTORS_ACTIVATED]</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.used_memories.map((mem, mIdx) => (
                      <span
                        key={mIdx}
                        className="font-mono text-[10px] bg-void text-steel-300 px-2 py-1 border border-surface-border rounded-xs max-w-md truncate"
                      >
                        • {mem}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Self-Learning Action Bar */}
              {msg.role === "assistant" && idx > 0 && (
                <div className="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-steel-500 uppercase tracking-wider">
                    FEEDBACK_LOOP:
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveFeedbackMsgId(msg.id || `msg-${idx}`);
                        setFeedbackRating(5);
                        setFeedbackCorrection("");
                      }}
                      className="px-2 py-1 bg-surface hover:bg-surface-raised text-[10px] font-mono text-cyan border border-surface-border hover:border-cyan/40 transition-colors rounded-xs flex items-center gap-1"
                      title="Approve and ingest preference to vector memory"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>TEACH_PREFERENCE</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveFeedbackMsgId(msg.id || `msg-${idx}`);
                        setFeedbackRating(1);
                        setFeedbackCorrection("");
                      }}
                      className="px-2 py-1 bg-surface hover:bg-surface-raised text-[10px] font-mono text-crimson border border-surface-border hover:border-crimson/40 transition-colors rounded-xs flex items-center gap-1"
                      title="Provide correction or rule"
                    >
                      <ThumbsDown className="w-3 h-3" />
                      <span>LOG_CORRECTION</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-start max-w-4xl">
            <div className="flex items-center gap-2 mb-1.5 px-1 font-mono text-[10px] text-steel-500">
              <span className={`font-bold flex items-center gap-1.5 ${selectedModel === "groq" || selectedModel === "grok" ? "text-amber" : "text-cyan"}`}>
                <Zap className="w-3 h-3" />
                [AEGIS // {selectedModel === "groq" || selectedModel === "grok" ? "GROQ LPU" : "GEMINI 2.0"}]
              </span>
              <span>COMPUTING_TELEMETRY</span>
            </div>
            <div className="bg-surface-card p-4 border border-surface-border rounded-xs flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full animate-ping ${selectedModel === "groq" || selectedModel === "grok" ? "bg-amber" : "bg-cyan"}`} />
              <span className="font-mono text-xs text-steel-400">
                Processing multi-criteria matrix through {selectedModel === "groq" || selectedModel === "grok" ? "Groq LPU (GPT-OSS-120B)" : "Gemini Multimodal Core"}...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Inline Feedback Drawer (No ugly window.prompt!) */}
      {activeFeedbackMsgId && (
        <div className="px-6 py-4 bg-surface-raised border-t border-surface-border flex flex-col gap-3 animate-in fade-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan" />
              <span className="font-mono text-xs font-bold text-slate-200">
                [USER-APPROVED SELF-LEARNING] Ingest Preference to Long-Term Memory
              </span>
            </div>
            <button
              onClick={() => setActiveFeedbackMsgId(null)}
              className="text-steel-400 hover:text-slate-100 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={feedbackCorrection}
              onChange={(e) => setFeedbackCorrection(e.target.value)}
              placeholder="e.g. In decision queries, prioritize remote flexibility and calculate effective hourly wage..."
              className="flex-1 bg-void border border-surface-border rounded-xs px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan"
            />
            <button
              onClick={submitFeedback}
              disabled={isSubmittingFeedback || !feedbackCorrection.trim()}
              className="px-4 py-2 bg-cyan text-black font-mono text-xs font-bold hover:bg-cyan/90 disabled:opacity-50 transition-all rounded-xs"
            >
              {isSubmittingFeedback ? "INGESTING..." : "COMMIT TO MEMORY"}
            </button>
          </div>
        </div>
      )}

      {/* Command Input Deck */}
      <form onSubmit={(e) => handleSend(e)} className="p-4 bg-surface border-t border-surface-border">
        <div className="max-w-4xl mx-auto flex items-center gap-3 bg-surface-card p-2 border border-surface-border focus-within:border-cyan/50 transition-all rounded-xs">
          <span className="font-mono text-cyan text-sm pl-2 select-none font-bold">›_</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Instruct AegisAI (Dispatching via ${selectedModel === "groq" || selectedModel === "grok" ? "Groq LPU (GPT-OSS-120B)" : "Google Gemini 2.0"})...`}
            className="flex-1 bg-transparent px-2 text-xs font-mono text-slate-100 focus:outline-none placeholder:text-steel-500"
          />

          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-steel-500 px-2">
            <span>[ENTER ↵]</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`w-9 h-9 rounded-xs flex items-center justify-center transition-all shrink-0 font-bold ${
              selectedModel === "groq" || selectedModel === "grok"
                ? "bg-amber text-black hover:bg-amber/90 disabled:opacity-40"
                : "bg-cyan text-black hover:bg-cyan/90 disabled:opacity-40"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
