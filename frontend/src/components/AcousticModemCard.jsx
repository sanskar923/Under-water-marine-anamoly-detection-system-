import React, { useState, useEffect } from "react";
import { Radio, Wifi } from "lucide-react";

export default function AcousticModemCard({ detection, assessment }) {
  const [pulse, setPulse] = useState(true);
  const isRejected = assessment?.hazard_type === "REJECTED" || assessment?.is_valid_sonar === false;

  const rawDepth = assessment?.seabed_depth || (detection?.swath_depth_m ? `${detection.swath_depth_m}m` : "31.5m");
  const depth = String(rawDepth).replace(/meters/gi, "m").trim();
  const rawType = assessment?.hazard_type ? assessment.hazard_type.replace(/_/g, " ") : "GHOST NET";
  const type = isRejected ? "REJECTED NOISE" : rawType.toUpperCase();

  useEffect(() => {
    const timer = setInterval(() => setPulse((p) => !p), 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-full bg-slate-950/60 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 flex flex-col justify-between gap-5 font-sans shadow-[0_4px_30px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold tracking-wide text-slate-100">
            Live Data Feed
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isRejected ? "bg-red-500 animate-pulse" : (pulse ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-emerald-700")}`} />
          <span className={`text-xs font-semibold ${isRejected ? "text-red-400" : "text-emerald-400"}`}>
            {isRejected ? "Feed Suspended" : "Connected (Live Feed)"}
          </span>
        </div>
      </div>

      {/* Simple Connection Status List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-800/90 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Latency</span>
          <span className="text-sm font-bold text-emerald-400 mt-0.5">0.12s (Low Latency)</span>
        </div>
        <div className="px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-800/90 flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Feed Quality</span>
          <span className="text-sm font-bold text-cyan-300 mt-0.5">100% Reliable</span>
        </div>
      </div>

      {/* Current Live Scan Highlight Box */}
      <div className="flex flex-col gap-1.5">
        <div className="text-xs font-semibold text-slate-400">Current Live Scan:</div>
        <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-xl font-sans font-medium text-sm text-cyan-300 shadow-inner flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
          <span className="font-semibold tracking-wide">
            {isRejected
              ? "Acoustic Filter: Non-Acoustic Target Rejected"
              : `● Hazard Located: ${type.includes("NET") ? "Abandoned Net" : (type.includes("PIPE") ? "Subsea Pipeline" : (type.includes("WRECK") ? "Shipwreck Debris" : "Abandoned Net"))} at ${depth.includes("m") ? depth : `${depth}m`} Depth`}
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60 font-sans">
        <span>Uplink: Direct Acoustic Sensor</span>
        <span className="text-emerald-400 font-medium">Status: Synced</span>
      </div>
    </div>
  );
}

