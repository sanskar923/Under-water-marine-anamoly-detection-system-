import React, { useRef, useState } from "react";
import { UploadCloud, FileImage, Sparkles, Anchor, Compass, Eye } from "lucide-react";

export default function ImageUploader({ onSelectFile, onSelectSample, isScanning }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onSelectFile(e.dataTransfer.files[0]);
    }
  };

  const sampleButtons = [
    { id: "ghost_net", name: "Ghost Net", desc: "Tangled polymer mesh", icon: Anchor, color: "hover:border-red-500/50" },
    { id: "sunken_pipe", name: "Sunken Pipe", desc: "Corroded steel pipeline", icon: Compass, color: "hover:border-amber-500/50" },
    { id: "seafloor", name: "Seafloor", desc: "Natural sandy ripple bed", icon: Eye, color: "hover:border-emerald-500/50" },
  ];

  return (
    <div className="bg-[#0a1322] border border-[#162844] rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <FileImage className="w-4 h-4 text-cyan-400" />
          Sonar Data Input
        </h2>
        <span className="text-[11px] text-slate-400">Side-Scan / Bathymetry</span>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
          isDragOver
            ? "border-cyan-400 bg-cyan-950/30 scale-[1.01]"
            : "border-slate-700/70 hover:border-cyan-500/60 bg-[#060c16]"
        }`}
      >
        <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-400">
          <UploadCloud className="w-6 h-6 animate-bounce" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-200">
            Drag & Drop Sonar Imagery
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            PNG, JPG, or TIFF sonar scans (up to 20MB)
          </p>
        </div>
        <button
          type="button"
          disabled={isScanning}
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          className="mt-1 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded text-xs font-semibold"
        >
          Browse Local File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onSelectFile(e.target.files[0]);
            }
          }}
        />
      </div>

      {/* Quick Load Preset Samples */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quick-Load Mission Scans:</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {sampleButtons.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                disabled={isScanning}
                onClick={() => onSelectSample(s.id)}
                className={`flex items-center justify-between p-2.5 rounded-lg bg-[#070e1a] border border-slate-800 text-left transition-all ${s.color} hover:bg-slate-900 group`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-slate-800 text-slate-300 group-hover:text-cyan-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-200 group-hover:text-white">
                      {s.name}
                    </div>
                    <div className="text-[10px] text-slate-500">{s.desc}</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-cyan-300 font-mono">
                  LOAD
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
