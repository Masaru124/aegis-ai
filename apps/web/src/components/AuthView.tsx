"use client";

import React, { useState } from "react";
import { Shield, Lock, Mail, User as UserIcon, ArrowRight, Activity, Terminal } from "lucide-react";
import { setAuthToken } from "@/lib/api";

interface AuthViewProps {
  onLoginSuccess: (user: any) => void;
}

export function AuthView({ onLoginSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const body = new URLSearchParams();
        body.append("username", email);
        body.append("password", password);

        const res = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ detail: "Login failed" }));
          throw new Error(errData.detail || "Authentication handshake rejected.");
        }

        const tokenData = await res.json();
        setAuthToken(tokenData.access_token);

        const meRes = await fetch("http://127.0.0.1:8000/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userData = await meRes.json();
        onLoginSuccess(userData);
      } else {
        const regRes = await fetch("http://127.0.0.1:8000/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        if (!regRes.ok) {
          const errData = await regRes.json().catch(() => ({ detail: "Registration failed" }));
          throw new Error(errData.detail || "Operator profile generation failed.");
        }

        const body = new URLSearchParams();
        body.append("username", email);
        body.append("password", password);

        const loginRes = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });

        const tokenData = await loginRes.json();
        setAuthToken(tokenData.access_token);

        const meRes = await fetch("http://127.0.0.1:8000/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userData = await meRes.json();
        onLoginSuccess(userData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-void flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background Reticle Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="w-full max-w-md panel-frame p-8 rounded-xs relative z-10 space-y-6 shadow-2xl">
        {/* Monolith Header */}
        <div className="border-b border-surface-border pb-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-surface-card border border-cyan/40 flex items-center justify-center">
                <span className="font-mono text-cyan text-xs font-bold">Æ</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-base text-slate-100 tracking-wider">
                  AEGIS // GATE
                </h1>
                <p className="font-mono text-[9px] text-steel-400 uppercase tracking-widest">
                  DECISION_INTELLIGENCE_SYSTEM
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[9px] text-cyan bg-cyan-dim px-2 py-0.5 border border-cyan/30">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse-subtle" />
              <span>SEC_CLEARANCE</span>
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 bg-surface p-1 border border-surface-border rounded-xs">
          <button
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`py-2 font-mono text-xs font-semibold tracking-wider transition-all rounded-xs ${
              isLogin
                ? "bg-surface-raised text-cyan border border-cyan/30 shadow-sm"
                : "text-steel-400 hover:text-slate-200"
            }`}
          >
            [01 // SIGN_IN]
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`py-2 font-mono text-xs font-semibold tracking-wider transition-all rounded-xs ${
              !isLogin
                ? "bg-surface-raised text-cyan border border-cyan/30 shadow-sm"
                : "text-steel-400 hover:text-slate-200"
            }`}
          >
            [02 // REGISTER]
          </button>
        </div>

        {/* Demo Credentials Quick-Fill Banner */}
        <div className="flex items-center justify-between p-2 bg-surface-raised border border-cyan/20 rounded-xs text-[10px] font-mono">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-cyan font-bold">DEMO:</span>
            <span className="text-steel-300 truncate">operator@aegis.ai</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setEmail("operator@aegis.ai");
              setPassword("aegispassword123");
              setError(null);
            }}
            className="px-2 py-0.5 bg-cyan text-black font-bold uppercase tracking-wider hover:bg-cyan/90 transition-colors shrink-0"
          >
            Autofill
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-crimson-dim border border-crimson/40 font-mono text-xs text-crimson text-center rounded-xs">
            {error}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono">
          {!isLogin && (
            <div>
              <label className="text-[10px] text-steel-400 uppercase tracking-wider block mb-1">
                Operator Identity
              </label>
              <div className="relative">
                <UserIcon className="w-3.5 h-3.5 text-steel-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Commander Mercer"
                  className="w-full bg-void border border-surface-border rounded-xs pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] text-steel-400 uppercase tracking-wider block mb-1">
              Operator Email
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-steel-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@aegis.ai"
                className="w-full bg-void border border-surface-border rounded-xs pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-steel-400 uppercase tracking-wider block mb-1">
              Passkey
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-steel-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-void border border-surface-border rounded-xs pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan text-black hover:bg-cyan/90 font-mono font-bold text-xs uppercase tracking-wider rounded-xs transition-all flex items-center justify-center gap-2 shadow-cyan-glow disabled:opacity-50"
          >
            {loading ? (
              <Activity className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>{isLogin ? "AUTHORIZE_SESSION" : "INITIALIZE_PROFILE"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-surface-border/60 text-center">
          <p className="font-mono text-[9px] text-steel-500 uppercase tracking-widest">
            AES-256 MEMORY ENCRYPTION // JWT ROLE-BASED ACCESS CONTROL
          </p>
        </div>
      </div>
    </div>
  );
}
