"use client";

import React, { useState } from "react";
import { FileText, Upload, Search, CheckCircle, File, Database, Terminal } from "lucide-react";
import { getAuthToken } from "@/lib/api";

export function DocumentVault() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ filename: string; snippet: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = getAuthToken();
      const res = await fetch("http://127.0.0.1:8000/api/v1/documents/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      setUploadStatus(data.message || "Document successfully ingested into RAG store!");
      setFile(null);
    } catch (err: any) {
      alert(`Document indexing failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const token = getAuthToken();
      const res = await fetch(
        `http://127.0.0.1:8000/api/v1/documents/search?query=${encodeURIComponent(query)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-void space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-cyan tracking-widest uppercase">
              [RAG_STORAGE // EMBEDDING_INDEX]
            </span>
            <span className="text-steel-600 font-mono text-xs">•</span>
            <span className="font-mono text-[10px] text-steel-400">
              PDF / DOCX / TXT INGESTION ENGINE
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-100 tracking-tight">
            Document Vault & Knowledge Index
          </h2>
          <p className="text-steel-400 text-xs font-mono mt-0.5">
            Semantic Vector Retrieval-Augmented Generation for Grounded Decision Support
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-surface-card border border-surface-border text-xs font-mono text-steel-300 rounded-xs flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-cyan" />
            <span>STORAGE: ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload Ingestion (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="panel-frame p-6 rounded-xs space-y-5">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <span className="font-mono text-xs font-bold text-slate-200 tracking-wider uppercase">
                [INGEST // FILE_PAYLOAD]
              </span>
              <Upload className="w-4 h-4 text-cyan" />
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border border-dashed border-steel-700 hover:border-cyan/50 p-6 text-center transition-colors rounded-xs bg-void">
                <Upload className="w-6 h-6 text-steel-500 mx-auto mb-2" />
                <p className="font-mono text-xs text-slate-200 font-medium">Select PDF, DOCX or TXT File</p>
                <p className="font-mono text-[10px] text-steel-500 mt-1">Chunked and vector embedded automatically</p>

                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-4 text-xs font-mono text-steel-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xs file:border file:border-surface-border file:text-[10px] file:font-mono file:bg-surface file:text-cyan hover:file:border-cyan"
                />
              </div>

              {uploadStatus && (
                <div className="p-3 bg-cyan-dim border border-cyan/40 text-xs font-mono text-cyan flex items-center gap-2 rounded-xs">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadStatus}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!file || isUploading}
                className="w-full py-2.5 bg-cyan text-black hover:bg-cyan/90 font-mono font-bold text-xs uppercase tracking-wider rounded-xs transition-all shadow-cyan-glow disabled:opacity-40"
              >
                {isUploading ? "INGESTING_CHUNKS..." : "EXTRACT_AND_INDEX_FILE"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Semantic Search (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="panel-frame p-6 rounded-xs space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <span className="font-mono text-xs font-bold text-slate-200 tracking-wider uppercase">
                [SEMANTIC_RETRIEVAL // CONTEXT_LOOKUP]
              </span>
              <Search className="w-4 h-4 text-cyan" />
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Query ingested document index..."
                className="flex-1 bg-void border border-surface-border rounded-xs px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 bg-surface-raised hover:bg-surface-card border border-surface-border hover:border-cyan/40 text-cyan text-xs font-mono font-bold rounded-xs transition-colors"
              >
                {isSearching ? "SCANNING..." : "SEARCH"}
              </button>
            </form>

            <div className="space-y-3 pt-2">
              {searchResults.map((res, idx) => (
                <div key={idx} className="card-frame p-4 rounded-xs space-y-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan">
                    <File className="w-3.5 h-3.5" />
                    <span>{res.filename}</span>
                  </div>
                  <p className="text-xs font-mono text-steel-300 leading-relaxed bg-void p-3 border border-surface-border">
                    {res.snippet}
                  </p>
                </div>
              ))}

              {searchResults.length === 0 && (
                <div className="p-12 text-center text-steel-500 font-mono text-xs border border-dashed border-surface-border">
                  No query dispatched. Enter a search phrase above to test RAG retrieval.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
