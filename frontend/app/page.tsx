"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { Cpu, Lock, Mail, Loader, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("engineer@velora.ai");
  const [password, setPassword] = useState("password123");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If already logged in, skip to dashboard
    if (localStorage.getItem("velora_token")) {
      router.push("/dashboard");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        // Register first, then login
        await api.register(email, password);
        await api.login(email, password);
        alert("Registration and login successful!");
      } else {
        await api.login(email, password);
      }
      router.push("/dashboard");
    } catch (err: any) {
      // If user register failed or login failed, check if we can auto-register as shortcut to test MVP
      if (!isRegistering && err.message.includes("Incorrect email")) {
        // Try auto registering to make first run incredibly smooth!
        try {
          await api.register(email, password);
          await api.login(email, password);
          router.push("/dashboard");
          return;
        } catch (regErr) {
          setError(err.message || "Failed to authenticate");
        }
      } else {
        setError(err.message || "Authentication error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-card/60 backdrop-blur-xl border border-border/80 p-8 rounded-2xl shadow-xl relative z-10">
        {/* Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-black text-xl mb-3 shadow-md">
            V
          </div>
          <h1 className="text-2xl font-bold text-white font-sans tracking-wide">VELORA</h1>
          <p className="text-xs text-slate-400 mt-1 text-center font-mono uppercase tracking-wider">
            AI Semiconductor Engineering Copilot
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-950/30 border border-red-900/60 p-3 rounded-lg text-xs text-red-400 text-center font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1.5 uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@velora.ai"
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 outline-none focus:border-primary placeholder-slate-600 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1.5 uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 outline-none focus:border-primary placeholder-slate-600 font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-black font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md mt-6"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isRegistering ? "Create Account" : "Access Workspace"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-primary hover:underline font-mono"
          >
            {isRegistering ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 text-[10px] text-slate-600 font-mono text-center">
        VELORA Semiconductor Copilot Platform • Phase 1 Core Scaffold
      </div>
    </div>
  );
}
