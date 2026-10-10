import React from "react";
import { Waves, ArrowDown, LogOut } from "lucide-react";

export default function LandingNav({ onLogout, onScrollToConsole }) {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#040812]/90 backdrop-blur-md border-b border-cyan-900/40 px-6 py-3 flex items-center justify-between select-none">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,242,255,0.2)]">
          <Waves className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black tracking-widest text-slate-100">AQUASCAN</span>
          <span className="text-xs font-semibold tracking-wider text-cyan-400">HYDROGRAPHIC</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-800/60 font-mono hidden sm:inline">MIL-SPEC</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-300">
        <button onClick={() => scrollTo("acoustic-payload")} className="hover:text-cyan-400 transition-colors cursor-pointer">
          [Acoustic Payload]
        </button>
        <button onClick={() => scrollTo("hardware-specs")} className="hover:text-cyan-400 transition-colors cursor-pointer">
          [Hardware Specs]
        </button>
        <button onClick={() => scrollTo("live-console")} className="hover:text-cyan-400 transition-colors cursor-pointer">
          [Live Console]
        </button>
      </div>

      <div className="flex items-center gap-2.5">
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title="Lock Console / Logout"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-rose-600 bg-[#0e1b30] hover:bg-rose-950/70 text-slate-300 hover:text-rose-200 text-xs font-mono transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-cyan-400 hover:text-rose-300" />
            <span>LOGOUT</span>
          </button>
        )}
        <button
          onClick={onScrollToConsole || (() => scrollTo("live-console"))}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)] cursor-pointer active:scale-95"
        >
          <span>LAUNCH CONSOLE</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </nav>
  );
}
