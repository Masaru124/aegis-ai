"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy } from "lucide-react";

interface FormattedMessageProps {
  content: string;
  isGrok?: boolean;
}

export function FormattedMessage({ content, isGrok = false }: FormattedMessageProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-3 font-body text-[13.5px] leading-relaxed text-slate-200 selection:bg-cyan selection:text-black">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-display font-bold text-slate-100 tracking-tight mt-3 mb-2 pb-1 border-b border-surface-border">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-display font-bold text-slate-100 tracking-tight mt-3 mb-1.5 pb-1 border-b border-surface-border flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isGrok ? "bg-amber" : "bg-cyan"}`} />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-xs font-mono font-bold tracking-wider uppercase mt-3 mb-2 px-3 py-1.5 bg-surface-raised border rounded-xs flex items-center gap-2 text-slate-100 ${
              isGrok ? "border-amber/40 text-amber" : "border-cyan/40 text-cyan"
            }`}>
              <span className={`w-1.5 h-1.5 ${isGrok ? "bg-amber" : "bg-cyan"}`} />
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2 leading-relaxed text-slate-200 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1.5 my-2 pl-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`list-decimal list-outside space-y-2.5 my-3 pl-5 ${
              isGrok ? "marker:text-amber" : "marker:text-cyan"
            } marker:font-mono marker:font-bold`}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-200 leading-relaxed pl-1">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-100 tracking-tight">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-steel-300 not-italic border-b border-steel-600/60 pb-0.5">
              {children}
            </em>
          ),
          blockquote: ({ children }) => (
            <blockquote className={`my-3 pl-3.5 border-l-2 py-2 pr-3 bg-surface-raised/40 text-steel-300 italic font-mono text-xs ${
              isGrok ? "border-amber" : "border-cyan"
            }`}>
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="font-mono text-xs bg-void text-cyan px-1.5 py-0.5 border border-surface-border rounded-xs">
                  {children}
                </code>
              );
            }
            return (
              <div className="my-3 bg-void border border-surface-border rounded-xs overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 bg-surface-card border-b border-surface-border text-[10px] font-mono text-steel-400">
                  <span>TERMINAL_OUTPUT</span>
                  <button
                    onClick={() => handleCopy(String(children), 999)}
                    className="flex items-center gap-1 hover:text-slate-100 transition-colors"
                  >
                    {copiedIndex === 999 ? <Check className="w-3 h-3 text-cyan" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === 999 ? "COPIED" : "COPY"}</span>
                  </button>
                </div>
                <pre className="p-3 font-mono text-xs text-steel-200 overflow-x-auto">
                  <code>{children}</code>
                </pre>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
