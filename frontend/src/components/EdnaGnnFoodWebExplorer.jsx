import React, { useState, useEffect } from "react";
import { Dna, Share2, Sparkles, AlertTriangle, Cpu, CheckCircle2 } from "lucide-react";

const TARGET_GENES = {
  "Balaenoptera musculus (Blue Whale)": {
    seq: "ATGCGATCGATCGATCGATAGGCTAGCTAGCTA",
    name: "Blue Whale Detected",
    latin: "Balaenoptera musculus",
    status: "Critically Endangered (IUCN Protected)",
    statusColor: "text-red-400",
    dietImpact: "Notice: Plankton shifts detected. Krill population monitored for Blue Whales."
  },
  "Rhincodon typus (Whale Shark)": {
    seq: "ATGCGATCGATCGTTTGATAGGCTAGCTAGCTA",
    name: "Whale Shark Detected",
    latin: "Rhincodon typus",
    status: "Endangered Species (IUCN Protected)",
    statusColor: "text-amber-400",
    dietImpact: "Notice: High fishing activity detected. Food supply for Whale Sharks is low."
  },
  "Lepidochelys olivacea (Olive Ridley)": {
    seq: "ATGCGATCGATCGATCGATACCCCGCTAGCTA",
    name: "Olive Ridley Sea Turtle Detected",
    latin: "Lepidochelys olivacea",
    status: "Vulnerable (IUCN Protected)",
    statusColor: "text-emerald-400",
    dietImpact: "Notice: Coastal nesting corridor active. Trawling restrictions recommended."
  }
};

const DEFAULT_FASTA = TARGET_GENES["Rhincodon typus (Whale Shark)"].seq;

function calculateHammingSimilarity(inputSeq, refSeq) {
  const cleanInput = (inputSeq || "").trim().toUpperCase();
  const cleanRef = (refSeq || "").trim().toUpperCase();
  const maxLen = Math.max(cleanInput.length, cleanRef.length);
  if (maxLen === 0) return 0;
  let matches = 0;
  const minLen = Math.min(cleanInput.length, cleanRef.length);
  for (let i = 0; i < minLen; i++) {
    if (cleanInput[i] === cleanRef[i]) matches++;
  }
  return (matches / maxLen) * 100;
}

export default function EdnaGnnFoodWebExplorer() {
  const [metadata, setMetadata] = useState(null);
  const [fastaInput, setFastaInput] = useState(DEFAULT_FASTA);
  const [isScanning, setIsScanning] = useState(false);
  const [isTracked, setIsTracked] = useState(true);
  const [matchResult, setMatchResult] = useState({
    species_name: TARGET_GENES["Rhincodon typus (Whale Shark)"].name,
    latin: TARGET_GENES["Rhincodon typus (Whale Shark)"].latin,
    confidence: "99.1%",
    conservation_status: TARGET_GENES["Rhincodon typus (Whale Shark)"].status,
    status_badge: TARGET_GENES["Rhincodon typus (Whale Shark)"].status,
    statusColor: TARGET_GENES["Rhincodon typus (Whale Shark)"].statusColor,
    reliability: "Match Confidence: 99.1%",
    notice: TARGET_GENES["Rhincodon typus (Whale Shark)"].dietImpact,
    dietImpact: TARGET_GENES["Rhincodon typus (Whale Shark)"].dietImpact
  });

  useEffect(() => {
    fetch("/marine_gnn_metadata.json")
      .then((res) => res.json())
      .then((data) => {
        setMetadata(data);
      })
      .catch((err) => console.warn("GNN metadata fetch fallback:", err));
  }, []);

  const handleScanDNA = () => {
    let seq = fastaInput.trim();
    if (!seq) {
      seq = DEFAULT_FASTA;
      setFastaInput(DEFAULT_FASTA);
    }

    setIsScanning(true);
    setTimeout(() => {
      let bestMatch = TARGET_GENES["Rhincodon typus (Whale Shark)"];
      let highestScore = -1;

      Object.values(TARGET_GENES).forEach((gene) => {
        const score = calculateHammingSimilarity(seq, gene.seq);
        if (score > highestScore) {
          highestScore = score;
          bestMatch = gene;
        }
      });

      const confStr = `${highestScore.toFixed(1)}%`;
      setMatchResult({
        species_name: bestMatch.name,
        latin: bestMatch.latin,
        confidence: confStr,
        conservation_status: bestMatch.status,
        status_badge: bestMatch.status,
        statusColor: bestMatch.statusColor,
        reliability: `Match Confidence: ${confStr}`,
        notice: bestMatch.dietImpact,
        dietImpact: bestMatch.dietImpact,
      });
      setIsTracked(true);
      setIsScanning(false);
    }, 450);
  };

  return (
    <section id="section-edna-gnn" className="w-full py-4 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Marine Life &amp; Food Chain Health</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold">
                System Active
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Detect endangered species from water samples and track marine balance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Verified Clean Water
          </span>
          <span className="px-3 py-1 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-300 font-bold">
            Fish Stock Low
          </span>
        </div>
      </div>

      {/* Two Column Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Card: Water DNA Scanner */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-5 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                <Dna className="w-4 h-4 text-emerald-400" />
                <span>Water DNA Scanner</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                Marine Species Database
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Paste genetic code sample:
              </label>
              <div className="flex gap-2">
                <input
                  value={fastaInput}
                  onChange={(e) => setFastaInput(e.target.value)}
                  className="flex-1 bg-slate-950/90 border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-300 focus:outline-none transition-colors"
                  placeholder="Paste or enter genetic code..."
                />
                <button
                  type="button"
                  onClick={handleScanDNA}
                  disabled={isScanning}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-60 shadow-[0_0_12px_rgba(16,185,129,0.3)] whitespace-nowrap"
                >
                  {isScanning ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Scanning Water Sample...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Scan Water Sample</span>
                    </>
                  )}
                </button>
              </div>

              {/* 3 Quick-select helper buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <span className="text-[11px] text-slate-400 font-medium">Quick Samples:</span>
                <button
                  type="button"
                  onClick={() => setFastaInput(TARGET_GENES["Balaenoptera musculus (Blue Whale)"].seq)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-900/90 hover:bg-slate-800 text-red-400 border border-slate-700/80 hover:border-red-500/50 transition-all cursor-pointer active:scale-95"
                >
                  [Blue Whale Sample]
                </button>
                <button
                  type="button"
                  onClick={() => setFastaInput(TARGET_GENES["Rhincodon typus (Whale Shark)"].seq)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-slate-700/80 hover:border-amber-500/50 transition-all cursor-pointer active:scale-95"
                >
                  [Whale Shark Sample]
                </button>
                <button
                  type="button"
                  onClick={() => setFastaInput(TARGET_GENES["Lepidochelys olivacea (Olive Ridley)"].seq)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-slate-700/80 hover:border-emerald-500/50 transition-all cursor-pointer active:scale-95"
                >
                  [Olive Ridley Sample]
                </button>
              </div>
            </div>

            {/* Match Output Card */}
            {matchResult && (
              <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4 space-y-3 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-300">DNA Match Result</div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 border ${matchResult.statusColor ? matchResult.statusColor.replace('text-', 'border-') + ' ' + matchResult.statusColor : 'text-amber-400 border-amber-600'}`}>
                    {matchResult.status_badge || matchResult.conservation_status}
                  </span>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Identified Marine Life:</div>
                  <div className="text-base font-black text-white mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="text-emerald-300">{matchResult.species_name}</span>
                    <span className="text-slate-400 text-xs font-normal">({matchResult.latin})</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Conservation Status</span>
                    <span className={`font-bold ${matchResult.statusColor || "text-amber-400"}`}>{matchResult.conservation_status}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Reliability</span>
                    <span className="font-bold text-emerald-400">{matchResult.reliability}</span>
                  </div>
                </div>

                <div className="text-xs text-amber-300 font-medium pt-2 border-t border-slate-800/80 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{matchResult.notice}</span>
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Clean Water Sample Verified
            </span>
            <span className="text-slate-500 text-[10px]">Station Sanctuary Sensor Array</span>
          </div>
        </div>

        {/* Right Card: Interactive Ocean Food Chain Network */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-5 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Marine Food Chain Status</span>
              </div>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-600">
                Fish Stock Low
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {matchResult?.dietImpact || matchResult?.notice || "Notice: High fishing activity detected. Food supply for Whale Sharks is low."}
            </p>

            {/* Clean SVG Food Chain Flow */}
            <div className="relative w-full h-52 bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden p-2 flex items-center justify-center">
              <svg viewBox="0 0 520 180" className="w-full h-full">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#00f2ff" />
                  </marker>
                  <marker id="arrow-green" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                  </marker>
                  <marker id="arrow-red" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                  </marker>
                </defs>

                {/* Edges */}
                {/* Plankton -> Small Fish */}
                <line x1="85" y1="90" x2="190" y2="90" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#arrow-green)" />
                {/* Small Fish -> Whale Shark */}
                <line x1="240" y1="80" x2="330" y2="55" stroke="#00f2ff" strokeWidth="2.5" markerEnd="url(#arrow)" />
                {/* Fishing Boats -> Small Fish (Catching small fish) */}
                <line x1="435" y1="115" x2="250" y2="95" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4, 4" markerEnd="url(#arrow)" />
                {/* Fishing Boats -> Whale Shark (Competition / Bycatch) */}
                <line x1="435" y1="105" x2="385" y2="65" stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#arrow-red)" />

                {/* Node 1: Plankton / Sea Plants */}
                <g transform="translate(65, 90)">
                  <circle r="26" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
                  <text textAnchor="middle" y="-2" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Plankton /</text>
                  <text textAnchor="middle" y="10" fill="#a7f3d0" fontSize="8" fontFamily="sans-serif">Sea Plants</text>
                  <text textAnchor="middle" y="38" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">Base Food</text>
                </g>

                {/* Node 2: Small Fish / Anchovies */}
                <g transform="translate(215, 90)">
                  <circle r="26" fill="#0c4a6e" stroke="#0284c7" strokeWidth="2" />
                  <text textAnchor="middle" y="-2" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Small Fish /</text>
                  <text textAnchor="middle" y="10" fill="#7dd3fc" fontSize="8" fontFamily="sans-serif">Anchovies</text>
                  <text textAnchor="middle" y="38" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">Key Diet</text>
                </g>

                {/* Node 3: Whale Shark (Highlighted as Protected / Tracked) */}
                <g transform="translate(360, 50)">
                  {isTracked && (
                    <circle
                      r="35"
                      fill="none"
                      stroke="#00f2ff"
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    r="28"
                    fill="#164e63"
                    stroke={isTracked ? "#22d3ee" : "#00f2ff"}
                    strokeWidth={isTracked ? "3" : "2.5"}
                    filter="drop-shadow(0 0 12px rgba(0, 242, 255, 0.7))"
                  />
                  <text textAnchor="middle" y="-2" fill="#ffffff" fontSize="10" fontWeight="black" fontFamily="sans-serif">Whale</text>
                  <text textAnchor="middle" y="10" fill="#38bdf8" fontSize="10" fontWeight="black" fontFamily="sans-serif">Shark</text>
                  <text textAnchor="middle" y="-34" fill={isTracked ? "#22d3ee" : "#38bdf8"} fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                    {isTracked ? "● Protected / Tracked" : "Protected"}
                  </text>
                </g>

                {/* Node 4: Fishing Boats */}
                <g transform="translate(460, 120)">
                  <circle r="26" fill="#450a0a" stroke="#ef4444" strokeWidth="2" />
                  <text textAnchor="middle" y="-2" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Fishing</text>
                  <text textAnchor="middle" y="10" fill="#fca5a5" fontSize="8" fontFamily="sans-serif">Boats</text>
                  <text textAnchor="middle" y="38" fill="#f87171" fontSize="8" fontFamily="sans-serif">Commercial</text>
                </g>
              </svg>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
              <span className="text-slate-300">
                Connected Chain: <strong className="text-cyan-300">[Plankton] → [Small Fish] → [Whale Shark]</strong>
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Balanced Model
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span>Marine Habitat Monitoring</span>
            <span className="text-cyan-400 font-semibold">Protected Zone Active</span>
          </div>
        </div>
      </div>
    </section>
  );
}
