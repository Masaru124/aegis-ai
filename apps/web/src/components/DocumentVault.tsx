"use client";

import React, { useState } from "react";
import { FileText, Upload, Search, CheckCircle, File } from "lucide-react";
import { getAuthToken } from "@/lib/api";

export function DocumentVault() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ filename: string; snippet: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

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
      setUploadStatus(data.message || "Document successfully ingested!");
      setFile(null);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
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
    <div className="flex-1 overflow-y-auto p-8 bg-slate-950 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <FileText className="w-7 h-7 text-blue-400" />
          Document Intelligence & RAG Vault
        </h2>
        <p className="text-slate-400 text-sm mt-1">Ingest PDF/DOCX files and perform semantic context search</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-semibold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-400" />
            Ingest Document (PDF / DOCX / TXT)
          </h3>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl p-8 text-center transition-colors">
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium">Select file to parse and index</p>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-3 text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30"
              />
            </div>

            {uploadStatus && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {uploadStatus}
              </div>
            )}

            <button
              type="submit"
              disabled={!file}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-colors"
            >
              Upload & Process RAG Chunks
            </button>
          </form>
        </div>

        {/* Semantic Search */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-semibold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-400" />
            Semantic Document Retrieval
          </h3>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query indexed document text..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-xl transition-colors"
            >
              Search
            </button>
          </form>

          <div className="space-y-3 pt-2">
            {searchResults.map((res, idx) => (
              <div key={idx} className="glass-card p-3 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                  <File className="w-3.5 h-3.5" />
                  {res.filename}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{res.snippet}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
