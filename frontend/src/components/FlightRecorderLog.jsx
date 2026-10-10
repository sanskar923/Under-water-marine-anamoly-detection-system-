import React, { useState } from "react";
import { Terminal, ChevronUp, ChevronDown } from "lucide-react";

export default function FlightRecorderLog({ detection, assessment }) {
  const [isOpen, setIsOpen] = useState(false);
  const lat = detection?.gps_coordinates?.latitude || "15.4291°N";
  const lon = detection?.gps_coordinates?.longitude || "73.8123°E";
  const conf = detection?.confidence_score || 98.4;

  const logs = [
    { time: "22:11:30 UTC", tag: "SYS", msg: "Towfish Link Synchronized (12kHz S2C). Altitude lock at 8.5m AGL." },
    { time: "22:11:15 UTC", tag: "NAV", msg: `Target Acquired at ${lat}, ${lon} | Swath Depth: ${detection?.swath_depth_m || 31.7}m.` },
    { time: "22:10:48 UTC", tag: "NPU", msg: `Dual-model verification complete (MobileNetV4-ONNX + TAC-ADV Hydro). Confidence: ${conf}%.` },
    { time: "22:09:02 UTC", tag: "IMO", msg: "Mission Report signed & compiled. Ready for NAVTEX 518kHz telex broadcast." },
  ];

  return (
    <footer className="border-t border-[#162844] bg-[#050b14] select-none text-[11px] font-mono z-30">
        <div className="w-full px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-slate-300">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 truncate text-left hover:text-white transition-all cursor-pointer flex-1 min-w-[280px]"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-cyan-400 font-semibold">[SYSTEM LOG - LIVE]:</span>
            <span className="text-slate-300 truncate">
              22:11:30 UTC | Towfish Link Active | Target Acquired: {lat}, {lon} | Confidence: {conf}% | Ready for IMO Export
            </span>
          </button>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                window.location.href = "/admin/login";
              }}
              title="Restricted Fleet Administrator Gateway"
              className="text-[10px] font-mono text-slate-500 hover:text-red-400/90 transition-colors cursor-pointer border-r border-slate-800 pr-3"
            >
              [FLEET ROOT GATEWAY ↗]
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 cursor-pointer pl-1"
            >
              <span className="text-[10px] hidden sm:inline">{isOpen ? "COLLAPSE" : "AUDIT FLIGHT RECORDER"}</span>
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      {isOpen && (
        <div className="px-4 py-2.5 bg-[#030710] border-t border-slate-800/80 flex flex-col gap-1.5 text-[11px] animate-in slide-in-from-bottom-2 duration-150">
          {logs.map((l, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-400">
              <span className="text-slate-500">{l.time}</span>
              <span className="px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-[10px] font-bold">
                [{l.tag}]
              </span>
              <span className="text-slate-300">{l.msg}</span>
            </div>
          ))}
        </div>
      )}
    </footer>
  );
}
