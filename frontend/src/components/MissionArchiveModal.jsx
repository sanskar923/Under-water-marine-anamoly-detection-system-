import React, { useState, useEffect } from "react";
import { Database, X, RefreshCw, Layers, MapPin, AlertTriangle, ShieldCheck } from "lucide-react";
import { fetchMissionHistory } from "../api";

export default function MissionArchiveModal({ isOpen, onClose }) {
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMissionHistory(20);
      setMissions(data.missions || []);
    } catch (err) {
      setError(err.message || "Failed to query Atlas cluster.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const severityBadge = (sev) => {
    const s = String(sev).toUpperCase();
    if (s === "CRITICAL") return "bg-red-500/20 text-red-400 border-red-500/60";
    if (s === "HIGH") return "bg-orange-500/20 text-orange-400 border-orange-500/60";
    if (s === "MODERATE") return "bg-amber-500/20 text-amber-400 border-amber-500/60";
    return "bg-emerald-500/20 text-emerald-400 border-emerald-500/60";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#030712]/95 border border-cyan-500/30 shadow-[0_0_60px_rgba(0,0,0,0.95)] rounded-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-100 font-mono">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-[#050b18]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <span>MONGODB ATLAS CLUSTER</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-normal">[aquascan_defense_db]</span>
              </div>
              <h3 className="text-base font-extrabold text-white tracking-wide uppercase">
                Hydrographic Mission Archive Ledger
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadHistory}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>SYNC LEDGER</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {error && (
            <div className="p-3 mb-4 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs">
              [ATLAS ERROR]: {error}
            </div>
          )}

          {isLoading && missions.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs uppercase tracking-wider">Querying Atlas Cluster Replica Set...</p>
            </div>
          ) : missions.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Database className="w-10 h-10 text-slate-700" />
              <p className="text-xs uppercase tracking-wider">No mission passes recorded yet.</p>
              <p className="text-[11px] text-slate-600">Run a scan or select a preset pass to persist acoustic telemetries.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#050d20] border-b border-cyan-500/20 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">TIMESTAMP</th>
                    <th className="py-3 px-4">TARGET CLASSIFICATION</th>
                    <th className="py-3 px-4">COORDINATES (WGS 84)</th>
                    <th className="py-3 px-4">DEPTH / dB</th>
                    <th className="py-3 px-4">SEVERITY</th>
                    <th className="py-3 px-4 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-[#020610]">
                  {missions.map((m, idx) => {
                    const lat = m.coordinates?.lat !== undefined ? `${m.coordinates.lat.toFixed(4)}° N` : "--";
                    const lng = m.coordinates?.lng !== undefined ? `${m.coordinates.lng.toFixed(4)}° E` : "--";
                    const depth = m.telemetry?.depth_m !== undefined ? `${m.telemetry.depth_m}m` : "--";
                    const db = m.telemetry?.backscatter_db !== undefined ? `${m.telemetry.backscatter_db} dB` : "--";
                    const timeStr = m.timestamp ? m.timestamp.replace("T", " ").replace("Z", "").slice(0, 19) + " UTC" : "--";

                    return (
                      <tr key={idx} className="hover:bg-cyan-950/20 transition-colors">
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{timeStr}</td>
                        <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                          {m.target_type || "UNKNOWN_ANOMALY"}
                          {m.confidence !== undefined && (
                            <span className="ml-2 text-[10px] font-normal text-cyan-400">
                              ({(m.confidence * 100).toFixed(0)}%)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-cyan-300 font-mono whitespace-nowrap">
                          {lat}, {lng}
                        </td>
                        <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                          <span className="text-emerald-400 font-bold">{depth}</span>
                          <span className="text-slate-600 mx-1.5">|</span>
                          <span className="text-amber-400">{db}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${severityBadge(m.threat_severity)}`}>
                            {m.threat_severity || "MODERATE"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                            <ShieldCheck className="w-3 h-3" />
                            <span>LOGGED</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="px-6 py-3 bg-[#050b18] border-t border-slate-800 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>Connected: MongoDB Atlas Replica Set (Cluster0)</span>
          <span>Protocol: TLS 1.3 // Wire: v4.18 // Storage Engine: WiredTiger</span>
        </div>
      </div>
    </div>
  );
}
