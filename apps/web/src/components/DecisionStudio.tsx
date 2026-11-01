"use client";

import React, { useState } from "react";
import { 
  Cpu, 
  Award, 
  CheckCircle, 
  ShieldAlert, 
  BarChart3, 
  Sliders, 
  Sparkles, 
  Zap, 
  RefreshCw,
  Layers,
  ChevronRight
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { ModelType } from "@/app/page";

interface DecisionResult {
  title: string;
  category: string;
  recommended_option: string;
  confidence_score: number;
  explanation: string;
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

interface DecisionStudioProps {
  selectedModel: ModelType;
}

export function DecisionStudio({ selectedModel }: DecisionStudioProps) {
  const [title, setTitle] = useState("Software Engineering Offer: Hybrid vs Remote");
  const [category, setCategory] = useState("career");
  
  // Decision candidates
  const [options, setOptions] = useState([
    { name: "Option A (High-Growth Startup, $140k)", salary: 9.0, balance: 5.5, growth: 8.5 },
    { name: "Option B (Enterprise Tech Corp, $120k Remote)", salary: 7.5, balance: 9.5, growth: 7.0 },
  ]);

  // Criteria Weights
  const [weights, setWeights] = useState({
    salary: 0.35,
    balance: 0.40,
    growth: 0.25,
  });

  const [result, setResult] = useState<DecisionResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Preset scenarios
  const loadPreset = (presetName: string) => {
    if (presetName === "job") {
      setTitle("Software Engineering Offer: Hybrid vs Remote");
      setCategory("career");
      setOptions([
        { name: "Option A (High-Growth Startup, $140k)", salary: 9.0, balance: 5.5, growth: 8.5 },
        { name: "Option B (Enterprise Tech Corp, $120k Remote)", salary: 7.5, balance: 9.5, growth: 7.0 },
      ]);
      setWeights({ salary: 0.35, balance: 0.40, growth: 0.25 });
    } else if (presetName === "tech") {
      setTitle("Backend Architecture: Rust Microservices vs Go Monolith");
      setCategory("engineering");
      setOptions([
        { name: "Option A (Rust Microservices Architecture)", salary: 9.5, balance: 4.0, growth: 9.0 },
        { name: "Option B (Go Pragmatic Monolith)", salary: 7.0, balance: 8.5, growth: 8.0 },
      ]);
      setWeights({ salary: 0.40, balance: 0.30, growth: 0.30 });
    } else if (presetName === "startup") {
      setTitle("Capital Strategy: Aggressive Expansion vs 24mo Runway");
      setCategory("business");
      setOptions([
        { name: "Strategy A (Accelerate GTM Hiring)", salary: 8.5, balance: 4.5, growth: 9.5 },
        { name: "Strategy B (Preserve 24-Month Cash Buffer)", salary: 6.5, balance: 9.0, growth: 7.5 },
      ]);
      setWeights({ salary: 0.30, balance: 0.45, growth: 0.25 });
    }
  };

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const payload = {
        title,
        category,
        criteria_weights: {
          financial_compensation: weights.salary,
          work_life_balance: weights.balance,
          growth_potential: weights.growth,
        },
        options: options.map((opt) => ({
          name: opt.name,
          metrics: {
            financial_compensation: opt.salary,
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
      alert(`Decision Engine execution error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-void space-y-8 select-none">
      {/* Studio Header & Telemetry */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-amber tracking-widest uppercase">
              [ANALYTICAL_ENGINE // MCDA]
            </span>
            <span className="text-steel-600 font-mono text-xs">•</span>
            <span className="font-mono text-[10px] text-steel-400">
              DISPATCHING VIA {selectedModel === "groq" || selectedModel === "grok" ? "GROQ LPU (120B)" : "GEMINI 2.0"}
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-100 tracking-tight">
            Decision Intelligence Studio
          </h2>
          <p className="text-steel-400 text-xs font-mono mt-0.5">
            Multi-Criteria Decision Analysis • Weighted Sum & TOPSIS Scoring Matrix
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-steel-500 uppercase">PRESETS:</span>
          <button
            onClick={() => loadPreset("job")}
            className="px-2.5 py-1 bg-surface-card hover:bg-surface-raised border border-surface-border text-steel-300 font-mono text-[10px] transition-colors rounded-xs"
          >
            Hybrid vs Remote
          </button>
          <button
            onClick={() => loadPreset("tech")}
            className="px-2.5 py-1 bg-surface-card hover:bg-surface-raised border border-surface-border text-steel-300 font-mono text-[10px] transition-colors rounded-xs"
          >
            Rust vs Go
          </button>
          <button
            onClick={() => loadPreset("startup")}
            className="px-2.5 py-1 bg-surface-card hover:bg-surface-raised border border-surface-border text-steel-300 font-mono text-[10px] transition-colors rounded-xs"
          >
            Runway vs Scale
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="panel-frame p-6 rounded-xs space-y-6">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <span className="font-mono text-xs font-bold text-slate-200 tracking-wider uppercase">
                [01 // CANDIDATE_METRICS]
              </span>
              <Sliders className="w-4 h-4 text-amber" />
            </div>

            {/* Title & Category Input */}
            <div className="space-y-3">
              <div>
                <label className="font-mono text-[10px] text-steel-400 uppercase tracking-wider block mb-1">
                  Objective Definition
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-void border border-surface-border rounded-xs px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber transition-colors"
                />
              </div>
            </div>

            {/* Candidate Options Configuration */}
            <div className="space-y-4">
              <span className="font-mono text-[10px] text-steel-400 uppercase tracking-wider block">
                Candidate Options Evaluation
              </span>

              {options.map((opt, idx) => (
                <div key={idx} className="card-frame p-4 rounded-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={opt.name}
                      onChange={(e) => {
                        const updated = [...options];
                        updated[idx].name = e.target.value;
                        setOptions(updated);
                      }}
                      className="w-full bg-transparent border-b border-surface-border focus:border-amber pb-1 font-mono text-xs text-amber font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div>
                      <div className="flex justify-between font-mono text-[10px] text-steel-400 mb-1">
                        <span>Financial Impact / Pay</span>
                        <span className="text-slate-200 font-bold">{opt.salary} / 10</span>
                      </div>
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
                        className="accent-amber"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-[10px] text-steel-400 mb-1">
                        <span>Autonomy & Balance</span>
                        <span className="text-slate-200 font-bold">{opt.balance} / 10</span>
                      </div>
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
                        className="accent-cyan"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-[10px] text-steel-400 mb-1">
                        <span>Long-Term Growth</span>
                        <span className="text-slate-200 font-bold">{opt.growth} / 10</span>
                      </div>
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
                        className="accent-amber"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Run Button */}
            <button
              onClick={handleEvaluate}
              disabled={loading}
              className="w-full py-3 bg-amber text-black hover:bg-amber/90 font-mono font-bold text-xs uppercase tracking-wider rounded-xs transition-all flex items-center justify-center gap-2 shadow-amber-glow"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>COMPUTING_MCDA_MATRIX...</span>
                </>
              ) : (
                <>
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>EXECUTE_DECISION_ENGINE</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output & Explainable Recommendation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="panel-frame p-6 rounded-xs space-y-6">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <span className="font-mono text-xs font-bold text-slate-200 tracking-wider uppercase">
                [02 // MCDA_OUTPUT_TELEMETRY]
              </span>
              {result && (
                <div className="flex items-center gap-2 font-mono text-xs text-amber bg-amber-dim px-2.5 py-0.5 border border-amber/40 rounded-xs">
                  <Award className="w-3.5 h-3.5" />
                  <span>CONFIDENCE: {Math.round(result.confidence_score * 100)}%</span>
                </div>
              )}
            </div>

            {result ? (
              <div className="space-y-6">
                {/* Winner Card */}
                <div className="p-5 bg-surface-card border border-amber/40 rounded-xs space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-dim blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase text-amber tracking-widest font-bold">
                      ★ TOP_RANKED_RECOMMENDATION
                    </span>
                    <span className="font-mono text-[10px] text-steel-400">
                      SOLVED VIA {selectedModel === "groq" || selectedModel === "grok" ? "GROQ LPU" : "GEMINI 2.0"}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-display text-slate-100">
                    {result.recommended_option}
                  </h3>

                  <p className="text-xs font-mono text-steel-300 leading-relaxed pt-1">
                    {result.explanation}
                  </p>
                </div>

                {/* Ranked Comparison Breakdown */}
                <div className="space-y-3">
                  <span className="font-mono text-[10px] text-steel-400 uppercase tracking-wider block">
                    Comparative Ranking & Risk Profiles
                  </span>

                  {result.ranked_options.map((opt) => (
                    <div key={opt.rank} className="card-frame p-4 rounded-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-surface text-amber border border-surface-border">
                            #{opt.rank}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-200">
                            {opt.name}
                          </span>
                        </div>

                        <span className="font-mono text-xs text-cyan bg-cyan-dim px-2 py-0.5 border border-cyan/30">
                          SCORE: {opt.score} / 10
                        </span>
                      </div>

                      {/* Pros & Risk Factors Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 font-mono text-[11px]">
                        <div className="space-y-1 bg-void p-2.5 border border-surface-border/60">
                          <span className="text-cyan font-bold flex items-center gap-1.5 uppercase tracking-tight text-[10px]">
                            <CheckCircle className="w-3 h-3" /> Favorable Drivers
                          </span>
                          {opt.pros.map((p, pIdx) => (
                            <p key={pIdx} className="text-steel-300 leading-tight">
                              • {p}
                            </p>
                          ))}
                        </div>

                        <div className="space-y-1 bg-void p-2.5 border border-surface-border/60">
                          <span className="text-crimson font-bold flex items-center gap-1.5 uppercase tracking-tight text-[10px]">
                            <ShieldAlert className="w-3 h-3" /> Risk Factors
                          </span>
                          {opt.risk_factors.map((r, rIdx) => (
                            <p key={rIdx} className="text-steel-400 leading-tight">
                              • {r}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-center p-6 space-y-3 border border-dashed border-surface-border">
                <Cpu className="w-8 h-8 text-steel-600 stroke-1" />
                <div className="space-y-1">
                  <p className="font-mono text-xs text-steel-400 uppercase tracking-wider">
                    AWAITING PARAMETER EXECUTION
                  </p>
                  <p className="font-mono text-[11px] text-steel-600 max-w-sm">
                    Configure weights and candidate options on the left, then click [EXECUTE_DECISION_ENGINE].
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
