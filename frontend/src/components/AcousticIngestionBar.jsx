import React, { useRef, useState } from "react";
import { UploadCloud, Anchor, Compass, Eye, Sparkles, Ship } from "lucide-react";

export default function AcousticIngestionBar({ onSelectFile, onSelectSample, isScanning, activeSampleId }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedId, setSelectedId] = useState(activeSampleId || null);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (activeSampleId !== undefined) {
      setSelectedId(activeSampleId);
    }
  }, [activeSampleId]);

  const sampleButtons = [
    { id: "ghost_net", demo: "Demo 1", icon: "🕸️", name: "Ghost Net" },
    { id: "sunken_pipe", demo: "Demo 2", icon: "🛢️", name: "Subsea Pipeline" },
    { id: "wreck", demo: "Demo 3", icon: "🚢", name: "Shipwreck Debris" },
    { id: "seafloor", demo: "Demo 4", icon: "🌊", name: "Clear Seabed" },
  ];

  const handleSelect = (id) => {
    setSelectedId(id);
    onSelectSample(id);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedId(null);
      onSelectFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`relative w-full bg-slate-950/60 backdrop-blur-md border border-cyan-500/20 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all flex flex-col select-none overflow-hidden p-5 gap-4 ${
        isDragOver ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_30px_rgba(0,242,255,0.2)]" : ""
      }`}
    >
      {/* Clean Header: STEP 1: SELECT OR UPLOAD SONAR SCAN */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
            <span>STEP 1: SELECT OR UPLOAD SONAR SCAN</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pick a pre-loaded sample scan or upload your own seabed image.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-md">
            Supports PNG, JPG, TIFF
          </span>
        </div>
      </div>

      {/* Action Row: Preset Buttons + High-Contrast Upload Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {sampleButtons.map((s) => {
            const isActive = selectedId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                disabled={isScanning}
                onClick={() => handleSelect(s.id)}
                className={`py-2 px-3.5 rounded-lg flex items-center gap-2 text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-[0.98] border ${
                  isActive
                    ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.4)] font-bold"
                    : "bg-slate-900/80 border-slate-700 hover:border-cyan-500/60 hover:bg-cyan-950/30 text-slate-200"
                }`}
              >
                <span className="text-sm">{s.icon}</span>
                <span>{s.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isActive ? "bg-slate-950/30 text-slate-900" : "bg-slate-800 text-slate-400"}`}>
                  {s.demo}
                </span>
              </button>
            );
          })}
        </div>

        {/* High-Contrast Upload Action */}
        <div className="flex items-center gap-3">
          {isScanning ? (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-950/70 border border-cyan-400 text-cyan-300 font-mono text-xs font-bold animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Analyzing Acoustic Backscatter...</span>
            </div>
          ) : (
            <button
              type="button"
              disabled={isScanning}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <span className="text-sm">📁</span>
              <span>[Upload Custom Sonar Image]</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedId(null);
                onSelectFile(e.target.files[0]);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

