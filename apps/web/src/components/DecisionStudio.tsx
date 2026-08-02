"use client";

import React, { useState } from "react";
import { Cpu, Award, AlertTriangle, CheckCircle, ArrowRight, ShieldAlert, BarChart3 } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

interface DecisionResult {
  title: string;
  category: string;
  recommended_option: string;
  confidence_score: number;
  explanation: str;
  ranked_options: Array<{
    rank: number;
    name: string;
    score: number;
    pros: string[];
    cons: string[];
    risk_factors: string[];
  }>;
  predicted_outcomes: Record<string, any>;
}

export function DecisionStudio() {
  const [title, setTitle] = useState("Software Engineer Offer Evaluation");
  const [category, setCategory] = useState("career");
  
  // Default sample options
  const [options, setOptions] = useState([
    { name: "Option A (High-Growth Startup)", salary: 9, balance: 5, growth: 9 },
    { name: "Option B (Enterprise Tech Corp)", salary: 7.5, balance: 9, growth: 6 },
  ]);

  const [result, setResult] = useState<DecisionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const payload = {
        title,
        category,
        criteria_weights: { salary: 0.35, balance: 0.35, growth: 0.30 },
        options: options.map((opt) => ({
          name: opt.name,
          metrics: {
            salary: opt.salary,
            work_life_balance: opt.balance,
            growth_potential: opt.growth,
          },
        })),
      };

      const data = await fetchWithAuth("/decision/evaluate", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setResult(data);
    } catch (err: any) {
      console.error(err);
      alert(`Decision Engine error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-950 space-y-8">
      {/* Studio Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Cpu className="w-7 h-7 text-blue-400" />
          Decision Intelligence Studio
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Multi-Criteria Decision Analysis (MCDA) Engine & Risk Scoring Framework
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Configuration Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-base font-semibold text-slate-200 border-b border-slate-800 pb-3">
            Decision Parameters & Options
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Decision Goal Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs text-slate-400 font-medium block">Configure Candidate Options</label>
              {options.map((opt, idx) => (
                <div key={idx} className="glass-card p-4 rounded-xl space-y-3">
                  <input
                    type="text"
                    value={opt.name}
                    onChange={(e) => {
                      const updated = [...options];
                      updated[idx].name = e.target.value;
                      setOptions(updated);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-blue-300 font-medium focus:outline-none"
                  />
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-1">Salary ({opt.salary})</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={opt.salary}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[idx].salary = parseFloat(e.target.value);
                          setOptions(updated);
                        }}
                        className="w-full accent-blue-500"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Balance ({opt.balance})</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={opt.balance}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[idx].balance = parseFloat(e.target.value);
                          setOptions(updated);
                        }}
                        className="w-full accent-purple-500"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Growth ({opt.growth})</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={opt.growth}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[idx].growth = parseFloat(e.target.value);
                          setOptions(updated);
                        }}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleEvaluate}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              {loading ? "Computing Decision Matrix..." : "Run Decision Intelligence Pipeline"}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-base font-semibold text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
            Decision Output & Analysis
            {result && (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Confidence: {Math.round(result.confidence_score * 100)}%
              </span>
            )}
          </h3>

          {result ? (
            <div className="space-y-6">
              {/* Winner Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider">Top Recommendation</span>
                  <h4 className="text-lg font-bold text-white">{result.recommended_option}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{result.explanation}</p>
                </div>
              </div>

              {/* Ranked Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ranked Alternatives</h4>
                {result.ranked_options.map((opt) => (
                  <div key={opt.rank} className="glass-card p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-blue-400 text-xs flex items-center justify-center font-bold">
                          #{opt.rank}
                        </span>
                        {opt.name}
                      </span>
                      <span className="text-xs font-bold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-md border border-purple-800/50">
                        Score: {opt.score}/10
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                      <div className="space-y-1">
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Pros
                        </span>
                        {opt.pros.map((p, pIdx) => (
                          <p key={pIdx} className="text-slate-300 text-[11px]">• {p}</p>
                        ))}
                      </div>
                      <div className="space-y-1">
                        <span className="text-amber-400 font-medium flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Risk Factors
                        </span>
                        {opt.risk_factors.map((r, rIdx) => (
                          <p key={rIdx} className="text-slate-400 text-[11px]">• {r}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
              <Cpu className="w-12 h-12 stroke-1 text-slate-700" />
              <p className="text-sm">Configure parameters and click Evaluate to generate intelligent recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
