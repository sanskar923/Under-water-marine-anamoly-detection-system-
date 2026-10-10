import React from "react";
import { Compass, Activity, Thermometer, Gauge } from "lucide-react";

export default function TowfishSensorStrip({ detection }) {
  const lat = detection?.gps_coordinates?.latitude || "15.4291° N";
  const lon = detection?.gps_coordinates?.longitude || "73.8123° E";

  return (
    <div className="bg-[#060b17] border-y border-cyan-900/40 text-[11px] text-cyan-400/80 font-mono tracking-wider py-1 px-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 select-none">
      <div className="flex items-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-slate-400">LAT:</span> <span className="text-cyan-300 font-semibold">{lat}</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">LON:</span> <span className="text-cyan-300 font-semibold">{lon}</span>
      </div>
      <div className="hidden sm:flex items-center gap-3">
        <span><span className="text-slate-400">HDG:</span> <span className="text-cyan-300">184.2°</span></span>
        <span className="text-slate-600">|</span>
        <span><span className="text-slate-400">TOW SPEED:</span> <span className="text-cyan-300">3.4 KTS</span></span>
        <span className="text-slate-600">|</span>
        <span><span className="text-slate-400">ALTITUDE (AGL):</span> <span className="text-cyan-300">8.5M</span></span>
      </div>
      <div className="flex items-center gap-3">
        <span><span className="text-slate-400">WATER TEMP:</span> <span className="text-cyan-300">24.2°C</span></span>
        <span className="text-slate-600">|</span>
        <span><span className="text-slate-400">SOUND VELOCITY:</span> <span className="text-emerald-400 font-semibold">1528 m/s</span></span>
      </div>
    </div>
  );
}
