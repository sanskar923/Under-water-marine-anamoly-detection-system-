import React from "react";
import { Waves, Zap, Cloud, LogOut, ShieldCheck, ShieldAlert } from "lucide-react";

export default function TopBar({ backendStatus, mode, onToggleMode, edgeLatency, onLogout, gps, activeSection = "section-waterfall", operatorName = "CDR. MAYANK", dbStatus, onOpenAdmin }) {
  const isConnected = backendStatus === "healthy";
  const lat = gps?.latitude ? gps.latitude.replace(/°/g, "°") : "15.4290° N";
  const lon = gps?.longitude ? gps.longitude.replace(/°/g, "°") : "73.8122° E";

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const getLinkClass = (secId) =>
    activeSection === secId
      ? "text-cyan-300 font-bold border-b-2 border-cyan-400 pb-0.5 drop-shadow-[0_0_10px_#00f2ff] bg-cyan-950/40 px-2.5 py-0.5 rounded"
      : "text-slate-400 hover:text-cyan-300 transition-colors px-2 py-0.5";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/60 border-b border-slate-800/80 shadow-2xl select-none flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 md:px-12 py-3 w-full max-w-7xl mx-auto">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Waves className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-[-0.03em] text-slate-100 font-sans">AQUASCAN</span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-cyan-500/40" />
            <span className="hidden sm:inline text-xs font-medium text-cyan-300">Ocean Intelligence</span>
            {dbStatus && (
              <span className="hidden md:inline rounded-full px-2.5 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {dbStatus}
              </span>
            )}
          </div>
        </div>

        {/* Center Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button onClick={() => scrollTo("section-overview")} className="hover:text-slate-100 transition-colors cursor-pointer">
            Overview
          </button>
          <button onClick={() => scrollTo("section-waterfall")} className="hover:text-slate-100 transition-colors cursor-pointer">
            Sonar Scan
          </button>
          <button onClick={() => scrollTo("section-map")} className="hover:text-slate-100 transition-colors cursor-pointer">
            Live Map
          </button>
          <button onClick={() => scrollTo("section-oceanography")} className="hover:text-cyan-300 transition-colors cursor-pointer text-cyan-400 font-semibold">
            Sea Conditions
          </button>
          <button onClick={() => scrollTo("section-edna-gnn")} className="hover:text-emerald-300 transition-colors cursor-pointer text-emerald-400 font-semibold">
            Wildlife &amp; DNA
          </button>
          <button onClick={() => scrollTo("section-data-catalog")} className="hover:text-cyan-300 transition-colors cursor-pointer text-cyan-400 font-semibold">
            Data Hub
          </button>
          <button onClick={() => scrollTo("section-narrative")} className="hover:text-slate-100 transition-colors cursor-pointer">
            Standards
          </button>
          <button onClick={() => scrollTo("section-pillars")} className="hover:text-slate-100 transition-colors cursor-pointer">
            Features
          </button>
          <button onClick={() => scrollTo("hardware-specs")} className="hover:text-slate-100 transition-colors cursor-pointer">
            Past Surveys
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick status pill */}
          <div className="hidden sm:flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>● Sonar Ready</span>
          </div>

          {/* Two-state rounded pill switch: Online vs Offline Mode */}
          <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-full p-1 shadow-sm">
            <button
              type="button"
              onClick={() => onToggleMode("cloud")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                mode !== "offline"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🌐</span>
              <span>Online</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleMode("offline")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                mode === "offline"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🛡️</span>
              <span>Offline Mode</span>
            </button>
          </div>

          {/* Clean rounded Workstation CTA */}
          <button
            onClick={() => scrollTo("live-console")}
            className="hidden sm:inline-block rounded-full px-4 py-2 bg-slate-100 hover:bg-white text-slate-950 font-semibold text-xs transition-all shadow-md hover:shadow-cyan-500/10 cursor-pointer active:scale-[0.98]"
          >
            [Open Workstation]
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Sign Out of Session"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-950/50 hover:bg-rose-900/70 border border-rose-500/40 hover:border-rose-400 text-rose-300 hover:text-white transition-all text-xs font-semibold cursor-pointer shadow-sm active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Feature 1: Friendly Offline / Air-Gapped Mode Status Banner */}
      {mode === "offline" && (
        <div className="w-full bg-emerald-950/90 border-t border-emerald-500/40 text-emerald-200 py-2 px-6 text-center text-xs font-medium flex items-center justify-center gap-2 shadow-md animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-base">🛡️</span>
          <span className="font-semibold">
            System working 100% locally on device. No internet or satellite connection needed.
          </span>
          <span className="text-[10px] font-mono bg-emerald-900/90 border border-emerald-500/60 px-2 py-0.5 rounded-full text-emerald-100 font-bold ml-1.5 shadow-sm">
            AIR-GAPPED READY
          </span>
        </div>
      )}
    </header>
  );
}
