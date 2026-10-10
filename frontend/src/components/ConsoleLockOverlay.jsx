import React from "react";
import { ShieldAlert, KeyRound } from "lucide-react";

export default function ConsoleLockOverlay({ onUnlock }) {
  return (
    <div className="absolute inset-0 z-30 backdrop-blur-md bg-[#040810]/80 flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200">
      <div className="max-w-md p-8 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-[0_0_50px_rgba(0,242,255,0.25)] flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,242,255,0.3)]">
          <ShieldAlert className="w-7 h-7 animate-pulse" />
        </div>
        <div className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-700/60 text-cyan-300 tracking-wider">
          MIL-SPEC CLEARANCE LEVEL-4
        </div>
        <h3 className="text-base font-bold text-white tracking-wide uppercase">
          Tactical Console Locked
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          CLEARANCE REQUIRED: Authenticate via Operator Portal to transmit active sonar telemetry.
        </p>
        <button
          type="button"
          onClick={onUnlock}
          className="mt-2 flex items-center gap-2 py-2.5 px-6 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(0,242,255,0.4)] cursor-pointer active:scale-95"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>UNLOCK CONSOLE</span>
        </button>
      </div>
    </div>
  );
}
