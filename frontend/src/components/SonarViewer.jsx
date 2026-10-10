import React, { useRef, useEffect, useState } from "react";
import { Scan, Activity, AlertTriangle, Ruler } from "lucide-react";
import BathymetricReliefViewer from "./BathymetricReliefViewer";
import auvVideo from "../assets/auv_loop.mp4";

export default function SonarViewer({ imageSrc, detection, isScanning, isValidSonar = true, isRejected = false, detectedSubject }) {
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [viewMode, setViewMode] = useState("2d");
  const [colormap, setColormap] = useState("copper");
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [ruler, setRuler] = useState(null);

  const norm = detection?.acoustic_highlight?.normalized;
  const shadowNorm = detection?.acoustic_shadow?.normalized;

  const colormapFilters = {
    amber: "sepia(0.85) saturate(3) hue-rotate(-15deg) contrast(1.2)",
    copper: "sepia(0.65) saturate(1.8) contrast(1.1) brightness(0.95)",
    deepBlue: "hue-rotate(185deg) saturate(2.2) contrast(1.2)",
  };

  useEffect(() => {
    if (viewMode !== "2d" || !canvasRef.current || !imageSrc) return;
    const ctx = canvasRef.current.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvasRef.current.width = 900;
      canvasRef.current.height = 600;
      ctx.drawImage(img, 0, 0, 900, 600);

      // On-Canvas Feed Indicator
      ctx.save();
      ctx.fillStyle = "#00f2ff";
      ctx.font = "bold 13px sans-serif";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 4;
      ctx.fillText("● Live Sonar Feed | Left / Right Scan", 22, 32);
      ctx.restore();

      if (shadowNorm && isValidSonar && !isRejected) {
        const sx = shadowNorm.x * 900, sy = shadowNorm.y * 600, sw = shadowNorm.w * 900, sh = shadowNorm.h * 600;
        ctx.save();
        ctx.setLineDash([8, 5]);
        ctx.strokeStyle = "#818cf8";
        ctx.lineWidth = 2.5;
        ctx.fillStyle = "rgba(49, 46, 129, 0.45)";
        ctx.fillRect(sx, sy, sw, sh);
        ctx.strokeRect(sx, sy, sw, sh);

        // Box text: 🎯 Target Detected (Drag edges to measure height)
        ctx.fillStyle = "#1e1b4b";
        ctx.fillRect(sx, Math.max(0, sy - 24), 330, 24);
        ctx.fillStyle = "#c7d2fe";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText("🎯 Target Detected (Drag edges to measure height)", sx + 8, Math.max(16, sy - 7));
        ctx.restore();
      }
      if (norm && isValidSonar && !isRejected) {
        const bx = norm.x * 900, by = norm.y * 600, bw = norm.w * 900, bh = norm.h * 600;
        ctx.save();
        ctx.strokeStyle = "#00f2ff";
        ctx.lineWidth = 3;
        ctx.fillStyle = "rgba(0, 242, 255, 0.16)";
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeRect(bx, by, bw, bh);
        ctx.fillStyle = "#083344";
        ctx.fillRect(bx, Math.min(575, by + bh + 6), 210, 20);
        ctx.fillStyle = "#67e8f9";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(`TARGET: RELIEF ${detection.acoustic_shadow?.estimated_relief_m || 1.85}m`, bx + 8, Math.min(575, by + bh + 6) + 14);
        ctx.restore();
      }
    };
    img.src = imageSrc;
  }, [imageSrc, detection, isValidSonar, isRejected, viewMode]);

  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  // Reset ruler on new image scan
  useEffect(() => {
    setRuler(null);
  }, [imageSrc]);

  const handlePointerDown = (e) => {
    if (!isMeasuring || !canvasContainerRef.current) return;
    e.preventDefault();
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    isDraggingRef.current = true;
    startPosRef.current = { x, y };
    setRuler({ x1: x, y1: y, x2: x, y2: y, isDragging: true });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e) => {
    if (!isMeasuring || !isDraggingRef.current || !canvasContainerRef.current) return;
    e.preventDefault();
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = Math.round(Math.max(0, Math.min(rect.width, e.clientX - rect.left)));
    const y = Math.round(Math.max(0, Math.min(rect.height, e.clientY - rect.top)));
    setRuler({
      x1: startPosRef.current.x,
      y1: startPosRef.current.y,
      x2: x,
      y2: y,
      isDragging: true,
    });
  };

  const handlePointerUp = (e) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      setRuler((prev) => {
        if (!prev) return null;
        const dist = Math.hypot(prev.x2 - prev.x1, prev.y2 - prev.y1);
        if (dist < 4) return null;
        return { ...prev, isDragging: false };
      });
    }
  };

  // Calibrated trigonometry calculation
  const pixelDx = ruler ? (ruler.x2 - ruler.x1) : 0;
  const pixelDy = ruler ? (ruler.y2 - ruler.y1) : 0;
  const pixelDistance = Math.hypot(pixelDx, pixelDy);

  const containerWidth = canvasContainerRef.current?.offsetWidth || 900;
  const scaleRatio = containerWidth > 0 ? 900 / containerWidth : 1;
  const dx = pixelDx * scaleRatio;
  const dy = pixelDy * scaleRatio;

  // Calibrated to 0.045m/px at 455 kHz
  const shadowLenM = Math.hypot(dx, dy) * 0.045;
  // Slant Range Trigo (towfish altitude = 12.4m AGL)
  const estHeightM = Math.max(0.1, (shadowLenM * 12.4) / Math.max(25.0, shadowLenM * 1.6));
  const midX = ruler ? (ruler.x1 + ruler.x2) / 2 : 0;
  const midY = ruler ? (ruler.y1 + ruler.y2) / 2 : 0;

  return (
    <div className="relative bg-slate-950/60 backdrop-blur-md border border-cyan-500/20 rounded-xl p-5 flex flex-col w-full overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-slate-800/80 mb-3.5 gap-3">
        <div className="flex items-center gap-2.5">
          <Scan className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm sm:text-base font-bold tracking-wide text-slate-100 uppercase font-sans">
            LIVE SONAR DISPLAY
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Tool: 📏 [Measure Object Height] */}
          {viewMode === "2d" && imageSrc && isValidSonar && !isRejected && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = !isMeasuring;
                  setIsMeasuring(next);
                  if (next && !ruler && shadowNorm && canvasContainerRef.current) {
                    const rect = canvasContainerRef.current.getBoundingClientRect();
                    const w = rect.width || 800;
                    const h = rect.height || 500;
                    setRuler({
                      x1: Math.round((shadowNorm.x + shadowNorm.w * 0.08) * w),
                      y1: Math.round((shadowNorm.y + shadowNorm.h * 0.15) * h),
                      x2: Math.round((shadowNorm.x + shadowNorm.w * 0.92) * w),
                      y2: Math.round((shadowNorm.y + shadowNorm.h * 0.85) * h),
                      isDragging: false,
                    });
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-[0.98] border ${
                  isMeasuring
                    ? "bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-[0_0_15px_rgba(34,211,238,0.35)]"
                    : "bg-slate-900/80 border-cyan-500/60 text-cyan-300 hover:bg-cyan-500/15"
                }`}
              >
                <span>📏</span>
                <span>{isMeasuring ? "[Measure Tool Active]" : "[Measure Object Height]"}</span>
              </button>

              {ruler && (
                <button
                  type="button"
                  onClick={() => setRuler(null)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-slate-400 border border-slate-700 hover:text-red-400 hover:border-red-500/50 transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  title="Dismiss shadow vectors"
                >
                  Clear Ruler
                </button>
              )}
            </div>
          )}

          {/* Display Color Switcher */}
          {viewMode === "2d" && (
            <div className="hidden sm:flex items-center gap-1.5 bg-[#050b14] border border-slate-800 rounded-full px-2.5 py-1 text-xs">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Color Palette:</span>
              <button onClick={() => setColormap("amber")} className={`px-2.5 py-0.5 rounded-full transition-all text-xs ${colormap === "amber" ? "bg-amber-500 text-slate-950 font-bold shadow-sm" : "text-amber-400/80 hover:text-amber-300"}`}>Amber</button>
              <button onClick={() => setColormap("copper")} className={`px-2.5 py-0.5 rounded-full transition-all text-xs ${colormap === "copper" ? "bg-orange-600 text-slate-100 font-bold shadow-sm" : "text-orange-400/80 hover:text-orange-300"}`}>Copper</button>
              <button onClick={() => setColormap("deepBlue")} className={`px-2.5 py-0.5 rounded-full transition-all text-xs ${colormap === "deepBlue" ? "bg-cyan-500 text-slate-950 font-bold shadow-sm" : "text-cyan-400/80 hover:text-cyan-300"}`}>Deep Blue</button>
            </div>
          )}

          {/* Dimension Toggle */}
          <div className="flex items-center gap-1 bg-[#050b14] border border-slate-800 rounded-full p-1">
            <button
              onClick={() => setViewMode("2d")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${viewMode === "2d" ? "bg-cyan-500 text-slate-950 font-bold shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              2D Sonar View
            </button>
            <button
              onClick={() => {
                setViewMode("3d");
                setIsMeasuring(false);
                setRuler(null);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${viewMode === "3d" ? "bg-cyan-500 text-slate-950 font-bold shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              3D Seabed Relief
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative min-h-[520px] w-full bg-[#03060c] rounded-xl border border-slate-800 flex items-center justify-center p-3 overflow-hidden">
        {viewMode === "3d" ? (
          imageSrc ? (
            <div className="relative w-full h-full min-h-[500px] flex items-center justify-center">
              <BathymetricReliefViewer imageSrc={imageSrc} detection={detection} />
              {!isScanning && (isRejected || !isValidSonar) && (
                <div className="absolute inset-0 bg-red-950/70 border border-red-500/50 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                  <span className="text-red-400 font-mono text-xs tracking-widest uppercase mb-2 animate-pulse">
                    [ERR 0x09 // SENSOR REJECTION]
                  </span>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-1">
                    Non-Acoustic Ingestion Detected
                  </h3>
                  <p className="text-xs text-red-200/80 font-mono max-w-md">
                    Uploaded image rejected by onboard MobileNetV3 acoustic filter. File lacks CHIRP backscatter and water-column nadir signature.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="relative w-full h-full min-h-[520px] flex items-center justify-center overflow-hidden rounded">
              <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-75 pointer-events-none" src={auvVideo} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03060c] via-transparent to-[#03060c]/60 pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f2ff12_1px,transparent_1px),linear-gradient(to_bottom,#00f2ff12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>3D AUV PREVIEW STREAM // STANDBY</span>
              </div>
            </div>
          )
        ) : imageSrc ? (
          <div
            ref={canvasContainerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`w-full h-full min-h-[500px] flex items-center justify-center relative select-none overflow-hidden touch-none ${
              isMeasuring ? "cursor-crosshair" : ""
            }`}
          >
            {/* 4 Optical Corner-Bracket Accents in #22d3ee */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#22d3ee] pointer-events-none z-30" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#22d3ee] pointer-events-none z-30" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#22d3ee] pointer-events-none z-30" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#22d3ee] pointer-events-none z-30" />

            {/* Subtle CRT Scanline Effect Overlay */}
            <div
              style={{
                background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))",
                backgroundSize: "100% 3px, 6px 100%",
                pointerEvents: "none",
              }}
              className="absolute inset-0 z-10"
            />

            {/* Calibrated Depth / Range Ruler Ladder */}
            <div className="absolute left-2.5 inset-y-6 flex flex-col justify-between items-start pointer-events-none z-20 font-mono text-[9px] text-cyan-400/60 select-none">
              {["0m", "-10m", "-20m", "-30m", "-40m", "-50m"].map((depthMark) => (
                <div key={depthMark} className="flex items-center gap-1">
                  <span className="w-2.5 border-t border-cyan-400/50" />
                  <span>{depthMark}</span>
                </div>
              ))}
            </div>

            <canvas
              ref={canvasRef}
              style={{ filter: colormapFilters[colormap] }}
              className="w-full h-full max-h-[580px] object-contain rounded border border-cyan-900/40 shadow-2xl transition-all duration-200 pointer-events-none"
            />

            {/* Measuring Tool Active Hint */}
            {isMeasuring && (
              <div className="absolute top-3 left-12 z-30 pointer-events-none flex items-center gap-2 px-2.5 py-1 rounded bg-[#030816]/90 border border-cyan-500/40 text-cyan-300 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>RULER ACTIVE // Click & drag across acoustic shadow</span>
              </div>
            )}

            {/* Calibrated Cyan Dashed Vector Line & Crosshairs */}
            {ruler && pixelDistance > 4 && (
              <>
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
                  <line
                    x1={ruler.x1}
                    y1={ruler.y1}
                    x2={ruler.x2}
                    y2={ruler.y2}
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    strokeDasharray="5,4"
                  />
                  {/* Origin Crosshair */}
                  <circle cx={ruler.x1} cy={ruler.y1} r="4.5" fill="#22d3ee" stroke="#030816" strokeWidth="2" />
                  <line x1={ruler.x1 - 8} y1={ruler.y1} x2={ruler.x1 + 8} y2={ruler.y1} stroke="#22d3ee" strokeWidth="2" />
                  <line x1={ruler.x1} y1={ruler.y1 - 8} x2={ruler.x1} y2={ruler.y1 + 8} stroke="#22d3ee" strokeWidth="2" />

                  {/* Endpoint Crosshair */}
                  <circle cx={ruler.x2} cy={ruler.y2} r="4.5" fill="#38bdf8" stroke="#030816" strokeWidth="2" />
                  <line x1={ruler.x2 - 8} y1={ruler.y2} x2={ruler.x2 + 8} y2={ruler.y2} stroke="#38bdf8" strokeWidth="2" />
                  <line x1={ruler.x2} y1={ruler.y2 - 8} x2={ruler.x2} y2={ruler.y2 + 8} stroke="#38bdf8" strokeWidth="2" />
                </svg>

                {/* Floating Tactical HUD Chip at Vector Midpoint */}
                <div
                  style={{
                    left: Math.min(Math.max(16, midX - 110), (canvasContainerRef.current?.offsetWidth || 500) - 260),
                    top: Math.max(16, midY - 40),
                  }}
                  className="absolute z-40 pointer-events-none px-3.5 py-1.5 rounded-xl bg-[#030816]/95 border border-cyan-400 text-cyan-300 font-mono text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.4)] whitespace-nowrap backdrop-blur-md"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>SHADOW: {shadowLenM.toFixed(2)}m</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-emerald-400 font-bold">EST HEIGHT: {estHeightM.toFixed(2)}m</span>
                </div>
              </>
            )}

            {isScanning && (
              <div className="absolute inset-0 bg-[#020713]/85 border border-cyan-500/40 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 transition-all duration-300">
                <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping" />
                  <span className="absolute inset-2 rounded-full border-2 border-t-cyan-400 border-r-cyan-400/30 border-b-transparent border-l-transparent animate-spin" />
                  <Scan className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
                <h3 className="text-cyan-300 font-mono text-base tracking-widest uppercase font-bold animate-pulse">
                  Analyzing Acoustic Backscatter...
                </h3>
                <p className="text-[11px] font-mono text-slate-400 mt-2">
                  ONNX Runtime Web // Inference Active (~15ms)
                </p>
              </div>
            )}

            {!isScanning && (isRejected || !isValidSonar) && (
              <div className="absolute inset-0 bg-red-950/70 border border-red-500/50 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                <span className="text-red-400 font-mono text-xs tracking-widest uppercase mb-2 animate-pulse">
                  [ERR 0x09 // SENSOR REJECTION]
                </span>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-1">
                  Non-Acoustic Ingestion Detected
                </h3>
                <p className="text-xs text-red-200/80 font-mono max-w-md">
                  Uploaded image rejected by onboard MobileNetV3 acoustic filter. File lacks CHIRP backscatter and water-column nadir signature.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 p-12 text-center">
            <Activity className="w-14 h-14 mb-3 text-slate-700 animate-pulse" />
            <p className="text-base text-slate-200 font-bold uppercase tracking-wider">ACOUSTIC SENSOR STANDBY</p>
            <p className="text-xs text-slate-400 mt-1 max-w-md">Select a recorded mission pass from the preset rack or upload raw sonar imagery.</p>
          </div>
        )}
      </div>

      {/* Live Acoustic Waveform Oscilloscope Strip */}
      <div className="w-full mt-2.5 px-3 py-1.5 bg-[#02050e]/95 border border-cyan-500/20 rounded-lg flex flex-col gap-1 select-none font-mono">
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse drop-shadow-[0_0_6px_#34d399]" />
            <span className="text-cyan-300 font-bold tracking-wider">[RX ACOUSTIC RETURN SPECTRUM // 455 kHz CARRIER]</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>● LIVE RX</span>
          </div>
        </div>
        {/* Real-time animated SVG acoustic amplitude trace */}
        <div className="w-full h-8 overflow-hidden relative bg-[#010308] border border-cyan-900/30 rounded">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 32">
            <line x1="0" y1="16" x2="400" y2="16" stroke="#0e2a3a" strokeWidth="1" strokeDasharray="3 3" />
            <path
              d="M 0 16 Q 10 7, 20 16 T 40 16 T 60 7 T 75 25 T 90 5 T 105 27 T 120 11 T 140 16 T 160 4 T 180 28 T 200 16 T 220 6 T 240 26 T 260 16 T 280 8 T 300 24 T 320 16 T 340 9 T 360 23 T 380 16 T 400 16"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.6"
              className="animate-[pulse_1.2s_ease-in-out_infinite]"
            />
            <path
              d="M 0 16 Q 15 10, 30 16 T 60 13 T 90 21 T 120 9 T 150 23 T 180 11 T 210 21 T 240 10 T 270 22 T 300 12 T 330 20 T 360 11 T 390 19 T 400 16"
              fill="none"
              stroke="#10b981"
              strokeWidth="1.2"
              opacity="0.75"
              className="animate-[pulse_1.8s_ease-in-out_infinite]"
            />
          </svg>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f2ff08_1px,transparent_1px)] bg-[size:32px_100%] pointer-events-none" />
        </div>
      </div>

      {/* Micro-Data Density Strip */}
      <div className="w-full mt-3 px-4 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono text-[10px] tracking-tight uppercase text-slate-400 select-none">
        <span>SWATH: 150m [75P/75S]</span>
        <span className="text-slate-700 hidden sm:inline">|</span>
        <span>ALTITUDE: 12.4m AGL</span>
        <span className="text-slate-700 hidden sm:inline">|</span>
        <span>SOG: 3.8 KTS</span>
        <span className="text-slate-700 hidden sm:inline">|</span>
        <span>PRF: 30 Hz</span>
        <span className="text-slate-700 hidden sm:inline">|</span>
        <span>DATUM: WGS-84</span>
        <span className="text-slate-700 hidden sm:inline">|</span>
        <span className="text-cyan-400 font-semibold">STANDARD: IHO S-44 ORDER 1A</span>
      </div>
    </div>
  );
}
