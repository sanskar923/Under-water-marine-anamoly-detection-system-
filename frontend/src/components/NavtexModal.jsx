import React, { useState } from "react";
import { Radio, X, Copy, Check } from "lucide-react";

export default function NavtexModal({ isOpen, onClose, detection, assessment }) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = React.useRef(null);

  const playVhfChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  };

  const handleSpeakTelex = () => {
    if (isSpeaking) {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
      return;
    }
    playVhfChime();
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const text = `Navigational warning. Classification: ${hazard}. Position: ${lat}, ${lon}. Estimated depth: ${depth}. Ships and trawlers in vicinity, exercise extreme caution.`;
    const ut = new SpeechSynthesisUtterance(text);
    ut.rate = 0.92;
    const voices = window.speechSynthesis.getVoices() || [];
    const en = voices.find(v => v.lang.startsWith("en"));
    if (en) ut.voice = en;
    ut.onstart = () => setIsSpeaking(true);
    ut.onend = () => { setIsSpeaking(false); utteranceRef.current = null; };
    ut.onerror = () => { setIsSpeaking(false); utteranceRef.current = null; };
    utteranceRef.current = ut;
    window.__navtexUtterance = ut;
    setTimeout(() => {
      try {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        window.speechSynthesis.speak(ut);
        setIsSpeaking(true);
      } catch {}
    }, 80);
  };
  if (!isOpen) return null;

  const lat = detection?.gps_coordinates?.latitude || "15.4291° N";
  const lon = detection?.gps_coordinates?.longitude || "73.8123° E";
  const depth = assessment?.seabed_depth || (detection?.swath_depth_m ? `${detection.swath_depth_m}M` : "28.4M");
  const hazard = (assessment?.hazard_type || "GHOST FISHING NET / SUBMERGED OBSTACLE").toUpperCase();

  const telexContent = `ZCZC QA88
021430 UTC SEP 26
ARABIAN SEA - OFF GOA COAST
NAVIGATIONAL WARNING: HAZARD TO UNDERWATER & SURFACE TRANSIT
CLASSIFICATION: ${hazard}
POSITION: ${lat} ${lon} | ESTIMATED DEPTH: ${depth}
SHIPS & TRAWLERS TRANSITING VICINITY EXERCISE EXTREME CAUTION.
NNNN`;

  const handleCopy = () => {
    navigator.clipboard.writeText(telexContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-[10000] bg-[#050b14] border border-amber-500/50 rounded-xl w-full max-w-lg shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col overflow-hidden font-mono"
      >
        <div className="flex items-center justify-between px-4 py-3 bg-[#081220] border-b border-amber-500/30">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>IMO NAVTEX BROADCAST (518 kHz)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[10px] text-amber-300/80 bg-amber-950/30 border border-amber-900/50 px-2.5 py-1 rounded">
            <span>STATION: MUMBAI RADIO (VWB)</span>
            <span>NAVAREA VIII (INDIAN OCEAN)</span>
          </div>

          <pre className="bg-[#02050a] border border-amber-500/40 rounded-lg p-3 text-xs leading-relaxed text-amber-400 select-all overflow-x-auto whitespace-pre-wrap font-mono shadow-inner">
            {telexContent}
          </pre>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleSpeakTelex}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-sans font-semibold transition-all cursor-pointer ${
                isSpeaking
                  ? "bg-rose-500 text-white border-rose-400 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
              }`}
            >
              <span>{isSpeaking ? "🔊 Broadcasting..." : "🔊 Broadcast Audio"}</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0f233d] hover:bg-[#16355d] border border-cyan-500/40 text-cyan-300 text-xs font-sans font-semibold transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Telex" : "Copy Telex"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-sans font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
