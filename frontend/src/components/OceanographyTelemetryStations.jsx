import React, { useState } from "react";
import { Waves, Thermometer, Compass, Droplet, Wind, Fish, ShieldCheck, AlertTriangle, Eye, FlaskConical, ArrowRight, Cpu, Radio, ShieldAlert } from "lucide-react";
import DynamicSolutionFlowchart from "./DynamicSolutionFlowchart";

export const STATIONS = [
  {
    id: "goa",
    name: "Station 01: Goa (Marmagao)",
    coords: [15.429, 73.812],
    sst: 28.4,
    salinity: 34.8,
    soundSpeed: 1532,
    currentKts: 0.42,
    currentHeading: "042° True",
    oxygen: 6.8,
    ph: 8.1,
    turbidity: 1.2,
    fisheriesCatch: 3420,
    fisheriesMsy: 4400,
    fisheriesSpecies: "Indian Mackerel & Ribbonfish",
    stockStatus: "Sustainable Catch Rate",
    trend24h: [28.1, 28.2, 28.2, 28.3, 28.5, 28.6, 28.4, 28.4, 28.3, 28.4, 28.5, 28.4],
    currentTrend24h: [0.38, 0.40, 0.45, 0.44, 0.41, 0.39, 0.42, 0.43, 0.42, 0.40, 0.41, 0.42]
  },
  {
    id: "mumbai",
    name: "Station 02: Mumbai High",
    coords: [18.922, 72.834],
    sst: 29.1,
    salinity: 35.4,
    soundSpeed: 1536,
    currentKts: 0.58,
    currentHeading: "185° True",
    oxygen: 6.2,
    ph: 8.0,
    turbidity: 1.8,
    fisheriesCatch: 5120,
    fisheriesMsy: 6000,
    fisheriesSpecies: "Bombay Duck & Silver Pomfret",
    stockStatus: "Sustainable Catch Rate (Watch Quota)",
    trend24h: [28.8, 28.9, 29.0, 29.2, 29.3, 29.2, 29.1, 29.0, 29.1, 29.2, 29.1, 29.1],
    currentTrend24h: [0.52, 0.55, 0.60, 0.59, 0.56, 0.58, 0.57, 0.60, 0.58, 0.56, 0.57, 0.58]
  },
  {
    id: "cochin",
    name: "Station 03: Cochin Port",
    coords: [9.965, 76.242],
    sst: 27.9,
    salinity: 34.2,
    soundSpeed: 1528,
    currentKts: 0.35,
    currentHeading: "220° True",
    oxygen: 7.1,
    ph: 8.2,
    turbidity: 1.0,
    fisheriesCatch: 2890,
    fisheriesMsy: 4100,
    fisheriesSpecies: "Oil Sardine & Karikkadi Shrimp",
    stockStatus: "Healthy Spawning Stock",
    trend24h: [27.6, 27.7, 27.8, 28.0, 28.1, 28.0, 27.9, 27.8, 27.9, 28.0, 27.9, 27.9],
    currentTrend24h: [0.32, 0.34, 0.36, 0.38, 0.35, 0.34, 0.35, 0.36, 0.35, 0.34, 0.33, 0.35]
  },
  {
    id: "chennai",
    name: "Station 04: Chennai Bay",
    coords: [13.0827, 80.2707],
    sst: 29.5,
    salinity: 34.9,
    soundSpeed: 1538,
    currentKts: 0.49,
    currentHeading: "015° True",
    oxygen: 6.5,
    ph: 8.1,
    turbidity: 1.4,
    fisheriesCatch: 3100,
    fisheriesMsy: 4200,
    fisheriesSpecies: "Tuna & King Seerfish",
    stockStatus: "Sustainable Catch Rate",
    trend24h: [29.1, 29.3, 29.4, 29.6, 29.7, 29.6, 29.5, 29.4, 29.5, 29.6, 29.5, 29.5],
    currentTrend24h: [0.44, 0.47, 0.51, 0.50, 0.48, 0.49, 0.49, 0.50, 0.49, 0.47, 0.48, 0.49]
  },
  {
    id: "vizag",
    name: "Station 05: Visakhapatnam",
    coords: [17.6868, 83.2184],
    sst: 28.7,
    salinity: 34.5,
    soundSpeed: 1533,
    currentKts: 0.44,
    currentHeading: "080° True",
    oxygen: 6.9,
    ph: 8.1,
    turbidity: 1.1,
    fisheriesCatch: 2650,
    fisheriesMsy: 3800,
    fisheriesSpecies: "Anchovies & Coastal Catfish",
    stockStatus: "Sustainable Catch Rate",
    trend24h: [28.4, 28.5, 28.6, 28.8, 28.9, 28.8, 28.7, 28.6, 28.7, 28.8, 28.7, 28.7],
    currentTrend24h: [0.41, 0.42, 0.46, 0.45, 0.43, 0.44, 0.44, 0.45, 0.44, 0.42, 0.43, 0.44]
  }
];

export default function OceanographyTelemetryStations({ onStationSelect, activeHazard, activeSampleId }) {
  const [activeStationId, setActiveStationId] = useState("goa");

  const activeStation = STATIONS.find((s) => s.id === activeStationId) || STATIONS[0];
  const stockPct = Math.round((activeStation.fisheriesCatch / activeStation.fisheriesMsy) * 100);

  // SVG Trend Chart Generator
  const renderSparkline = (data, minVal, maxVal, strokeColor = "#00f2ff", fillColor = "rgba(0, 242, 255, 0.15)") => {
    const width = 360;
    const height = 90;
    const padding = 12;
    const pts = data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((val - minVal) / (maxVal - minVal || 1)) * (height - 2 * padding);
      return `${x},${y}`;
    });
    const pathD = `M ${pts.join(" L ")}`;
    const areaD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
        <defs>
          <linearGradient id={`grad-${activeStationId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${activeStationId})`} />
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((val, idx) => {
          const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
          const y = height - padding - ((val - minVal) / (maxVal - minVal || 1)) * (height - 2 * padding);
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r={idx === data.length - 1 ? 4 : 2}
              fill={idx === data.length - 1 ? strokeColor : "#ffffff"}
              stroke={strokeColor}
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    );
  };

  const handleSelect = (s) => {
    setActiveStationId(s.id);
    if (onStationSelect) {
      onStationSelect(s);
    }
  };

  return (
    <section id="section-oceanography" className="w-full py-6 space-y-6">
      {/* Header & Station Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Live Sea &amp; Weather Conditions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time water quality, currents, and fish stock monitoring across 5 coastal ports.
            </p>
          </div>
        </div>

        {/* 5 Selectable Station Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl">
          {STATIONS.map((st) => (
            <button
              key={st.id}
              onClick={() => handleSelect(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeStationId === st.id
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {st.name}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Live Metric Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 font-sans">
        {/* Gauge 1: Water Temperature */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              Water Temperature
            </span>
            <span className="text-[9px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded-full border border-emerald-800/60 font-semibold">
              Live
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-cyan-300">
              {activeStation.sst || 28.4}°C
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
              Normal
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800">
            Sea Temperature
          </div>
        </div>

        {/* Gauge 2: Salinity */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-emerald-400" />
              Salinity (Salt Level)
            </span>
            <span className="text-[9px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded-full border border-cyan-800/60 font-semibold">
              Optimal
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400">
              {activeStation.salinity || 34.8} <span className="text-xs text-slate-400 font-medium">PSU</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
              Normal Salt Level
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800">
            Safe for Marine Life
          </div>
        </div>

        {/* Gauge 3: Water Current */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              Water Current
            </span>
            <span className="text-[9px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded-full border border-amber-800/60 font-semibold">
              Active
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-300">
              {activeStation.currentKts || 0.42} <span className="text-xs text-slate-400 font-medium">knots</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              Gentle Current
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800">
            Gentle Current
          </div>
        </div>

        {/* Gauge 4: Oxygen Level */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-purple-400" />
              Oxygen Level
            </span>
            <span className="text-[9px] text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded-full border border-emerald-800/60 font-semibold">
              Safe for Fish
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-purple-300">
              {activeStation.oxygen || 6.8} <span className="text-xs text-slate-400 font-medium">mg/L</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
              Healthy for Fish
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800">
            Healthy for Fish
          </div>
        </div>

        {/* Gauge 5: Water pH */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <FlaskConical className="w-3.5 h-3.5 text-pink-400" />
              Water pH
            </span>
            <span className="text-[9px] text-pink-400 bg-pink-950/60 px-1.5 py-0.5 rounded-full border border-pink-800/60 font-semibold">
              Balanced
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-pink-300">
              {activeStation.ph || 8.1} <span className="text-xs text-slate-400 font-medium">pH</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              Balanced Alkaline
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800">
            Balanced Alkaline
          </div>
        </div>

        {/* Gauge 6: Underwater Visibility */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              Underwater Visibility
            </span>
            <span className="text-[9px] text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded-full border border-blue-800/60 font-semibold">
              High
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-blue-300">
              14.5 meters
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              Clear Water
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800">
            Clear Water
          </div>
        </div>
      </div>

      {/* Visual Chart & Fisheries Stock Duo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 font-sans">
        {/* Left 2 Cols: 24-Hour Temperature Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                24-Hour Sea Temperature Trend
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Station: {activeStation.name.replace(/^Station \d+:\s*/, "")}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
                <span className="w-2.5 h-0.5 bg-cyan-400" /> Temperature (°C)
              </span>
              <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                <span className="w-2.5 h-0.5 bg-amber-400" /> Current (knots)
              </span>
            </div>
          </div>

          <div className="py-2">
            {renderSparkline(activeStation.trend24h, 27.0, 30.0, "#00f2ff", "rgba(0, 242, 255, 0.2)")}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
            <span>24h ago</span>
            <span>12h ago</span>
            <span>6h ago</span>
            <span className="text-cyan-400 font-bold">Now</span>
          </div>
        </div>

        {/* Right Col: Fisheries Stock Health */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Fish className="w-4 h-4 text-emerald-400" />
              Fish Population &amp; Fishing Quota
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              stockPct > 85 ? "bg-amber-950/80 text-amber-400 border-amber-600" : "bg-emerald-950/80 text-emerald-400 border-emerald-600"
            }`}>
              {stockPct > 85 ? "QUOTA WARNING" : "SUSTAINABLE"}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-sm font-bold text-slate-100">Target Fish: {activeStation.fisheriesSpecies}</div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-medium">
                <span>Fishing Limit Used: {stockPct}%</span>
                <span className="font-bold text-cyan-300">{stockPct}% used</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    stockPct > 85
                      ? "bg-gradient-to-r from-amber-500 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                      : "bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  }`}
                  style={{ width: `${Math.min(stockPct, 100)}%` }}
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <div className="font-semibold text-emerald-300">
                Status: Sustainable • Within Safe Limits
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex justify-between font-medium">
                <span>Caught: {activeStation.fisheriesCatch.toLocaleString()} Tons</span>
                <span>Allowed Limit: {activeStation.fisheriesMsy.toLocaleString()} Tons</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300">
            {stockPct > 85 ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{activeStation.stockStatus}</span>
          </div>
        </div>
      </div>

      {/* DYNAMIC PROBLEM-SOLVING FLOWCHART */}
      <DynamicSolutionFlowchart activeHazard={activeHazard} activeSampleId={activeSampleId} />
    </section>
  );
}
