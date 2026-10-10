import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage({ onAdminLoginSuccess, onBackToConsole }) {
  const [callsign, setCallsign] = useState("");
  const [cipher, setCipher] = useState("");
  const [showCipher, setShowCipher] = useState(false);
  const [rememberClearance, setRememberClearance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const bgVideoRef = useRef(null);

  useEffect(() => {
    if (bgVideoRef.current) {
      bgVideoRef.current.playbackRate = 0.85;
      bgVideoRef.current.defaultMuted = true;
      bgVideoRef.current.muted = true;
      bgVideoRef.current.play().catch((err) => {
        console.warn("Autoplay interaction catch:", err);
      });
    }
  }, []);

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      localStorage.setItem("aquascan_admin_auth", "true");
      localStorage.setItem(
        "aquascan_admin_session",
        JSON.stringify({
          callsign: callsign || "CDR. ROOT",
          tier: "ROOT_TIER_5",
          issuedAt: new Date().toISOString(),
        })
      );
      setLoading(false);
      if (onAdminLoginSuccess) {
        onAdminLoginSuccess();
      } else {
        window.location.href = "/admin";
      }
    }, 450);
  };

  const handleAdminBypass = () => {
    setLoading(true);
    setErrorMsg("");
    setTimeout(() => {
      localStorage.setItem("aquascan_admin_auth", "true");
      localStorage.setItem(
        "aquascan_admin_session",
        JSON.stringify({
          callsign: "CDR. K. VERMA",
          tier: "FLEET_COMMANDER_ROOT",
          issuedAt: new Date().toISOString(),
        })
      );
      setLoading(false);
      if (onAdminLoginSuccess) {
        onAdminLoginSuccess();
      } else {
        window.location.href = "/admin";
      }
    }, 300);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-6 overflow-hidden bg-[#020713] text-slate-100 font-sans select-none">
      {/* Autoplaying Subsea Video Background Layer */}
      <video
        ref={bgVideoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none z-0"
      >
        <source src="/admin_ambient_loop.mp4" type="video/mp4" />
        <source src="/auv_scroll_cinematic.mp4" type="video/mp4" />
        <source src="/auv_loop.mp4" type="video/mp4" />
      </video>

      {/* Subtle Oceanic Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020a1a]/60 via-[#010816]/40 to-[#020a1a]/80 z-[1] pointer-events-none" />

      {/* Floating Ultra-Frosted Glass Chassis (Image 2 Card Aesthetic) */}
      <div className="relative z-10 w-full max-w-[440px] rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/15 p-10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col items-center text-center">
        {/* Top Circular Emblem: Thin concentric ring / radar node icon */}
        <div className="w-12 h-12 rounded-full border border-cyan-400/40 flex items-center justify-center mb-5 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <div className="w-4 h-4 rounded-full border border-dashed border-cyan-300 animate-spin" />
        </div>

        {/* Titles */}
        <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
          Fleet Command
        </h1>
        <p className="text-xs text-slate-300/80 font-normal leading-relaxed mb-7 max-w-[320px]">
          Sign in to access acoustic telemetry, ML weights, and root enclave.
        </p>

        {errorMsg && (
          <div className="w-full mb-4 p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdminSubmit} className="w-full flex flex-col items-center">
          {/* Input 1: Admin ID / Callsign */}
          <input
            type="text"
            required
            value={callsign}
            onChange={(e) => setCallsign(e.target.value)}
            placeholder="Commander Call Sign / Admin ID"
            className="w-full bg-slate-950/40 border border-white/15 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400/80 transition-all mb-4 text-left shadow-inner"
          />

          {/* Input 2: Root Cipher Key */}
          <div className="w-full relative mb-4">
            <input
              type={showCipher ? "text" : "password"}
              required
              value={cipher}
              onChange={(e) => setCipher(e.target.value)}
              placeholder="Cryptographic Security Cipher"
              className="w-full bg-slate-950/40 border border-white/15 rounded-xl px-4 py-3.5 pr-11 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400/80 transition-all text-left shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowCipher(!showCipher)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
            >
              {showCipher ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Meta Row */}
          <div className="flex items-center justify-between w-full text-xs text-slate-300/80 mb-6 font-normal px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberClearance}
                onChange={(e) => setRememberClearance(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-950/50 border-white/20 accent-cyan-400 cursor-pointer"
              />
              <span>Remember clearance</span>
            </label>
            <button
              type="button"
              onClick={() => alert("Cryptographic key rotation initiated via Western Naval Command hardware enclave.")}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Reset Cipher?
            </button>
          </div>

          {/* Primary Login Button (Image 2 Pill Style) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-semibold text-sm transition-all shadow-lg active:scale-[0.99] mb-4 cursor-pointer"
          >
            {loading ? "Authenticating..." : "Log In"}
          </button>

          {/* 1-Click Hackathon Evaluator Bypass */}
          <button
            type="button"
            onClick={handleAdminBypass}
            disabled={loading}
            className="w-full rounded-full py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>⚡ Auto-Authenticate as Fleet Commander (Demo)</span>
          </button>
        </form>

        {/* Return Navigation */}
        <button
          type="button"
          onClick={onBackToConsole || (() => { window.location.href = "/"; })}
          className="text-xs text-slate-400 hover:text-slate-200 mt-6 transition-colors cursor-pointer"
        >
          ← Return to Operator Login
        </button>
      </div>
    </div>
  );
}
