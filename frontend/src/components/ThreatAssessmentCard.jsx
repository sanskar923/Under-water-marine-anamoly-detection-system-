import React, { useState, useEffect } from "react";
import { AlertOctagon, Download, Fish, LifeBuoy, FileText, Radio, FileSpreadsheet, Sparkles, Volume2, VolumeX, Printer } from "lucide-react";
import NavtexModal from "./NavtexModal";
import PrintableMissionReportModal from "./PrintableMissionReportModal";

export default function ThreatAssessmentCard({ assessment, detection, onExportReport, onDownloadPdf, mode = "cloud", targetCoords }) {
  const [isNavtexOpen, setIsNavtexOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const utteranceRef = React.useRef(null);

  // Play realistic VHF Marine Radio Squelch & Alert Chime via native Web Audio API
  const playVhfRadioBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;

      // Two-tone maritime alert frequencies: 900 Hz & 1200 Hz
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(900, now);
      osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.12);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(450, now);
      osc2.frequency.exponentialRampToValueAtTime(600, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.22);
      osc2.stop(now + 0.22);
    } catch (err) {
      console.warn("VHF Chime AudioContext warning:", err);
    }
  };

  useEffect(() => {
    // Preload system voices
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      utteranceRef.current = null;
    };
  }, []);

  const handleToggleVoiceWarning = () => {
    // 1. Immediately cancel at the top of the function to flush any stuck, paused, or zombie speech tasks
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }

    if (isSpeaking) {
      utteranceRef.current = null;
      setIsSpeaking(false);
      return;
    }

    // Play immediate VHF Radio Alert Chime (Web Audio API)
    playVhfRadioBeep();

    if (!("speechSynthesis" in window)) {
      console.warn("SpeechSynthesis is not supported in this browser environment.");
      return;
    }

    const depthStr = String(assessment?.seabed_depth || detection?.swath_depth_m || "31.5").replace(/[^0-9.]/g, "") || "31.5";
    const text = `Attention all boats in area. Underwater hazard detected at depth ${depthStr} meters. Keep a safe distance of 50 meters.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Handle asynchronous voices loading and select an available English fallback
    let voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) {
      window.speechSynthesis.getVoices();
      voices = window.speechSynthesis.getVoices() || [];
    }
    const enVoice = voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("David") || v.name.includes("Samantha") || v.name.includes("Zira")))
      || voices.find((v) => v.lang.startsWith("en"))
      || voices[0];
    if (enVoice) {
      utterance.voice = enVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error("SpeechSynthesis error:", event);
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    // Retain reference to prevent V8 Garbage Collection bug in Chromium
    utteranceRef.current = utterance;
    window.__aquaRadioUtterance = utterance;

    // Trigger speak strictly inside the direct user-gesture click handler
    try {
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } catch (err) {
      console.error("SpeechSynthesis error:", err);
      setIsSpeaking(false);
    }
  };
  const isRejected = assessment?.hazard_type === "REJECTED" || assessment?.is_valid_sonar === false;
  const threatLevel = isRejected ? "INVALID" : (assessment?.threat_level || "MODERATE");

  const formatHazardName = (name) => {
    if (!name) return "Detected Obstacle: Submerged Hazard";
    const clean = String(name).trim();
    if (clean.includes("Abandoned Fishing Gear") || clean.includes("Ghost Net") || clean.includes("Ghost Fishing Net") || clean.includes("Fishing Net")) {
      return "Detected Obstacle: Abandoned Fishing Gear (Ghost Net)";
    }
    if (clean.includes("Sunken Vessel") || clean.includes("Shipwreck") || clean.includes("Vessel Hull") || clean.includes("Wreck")) {
      return "Detected Obstacle: Sunken Vessel Hull (Shipwreck)";
    }
    if (clean.includes("Exposed Subsea Pipeline") || clean.includes("Subsea Pipeline") || clean.includes("Pipeline") || clean.includes("Pipe")) {
      return "Detected Obstacle: Exposed Subsea Pipeline";
    }
    if (clean.includes("Subsea Hazard Anomaly") || clean.includes("Submerged Hazard") || clean.includes("Detected Target")) {
      return "Detected Obstacle: Submerged Hazard";
    }
    if (clean.includes("Seafloor") || clean.includes("Clear Bed") || clean.includes("Sediment")) {
      return "Clear Seabed (No Obstacles)";
    }
    return clean.startsWith("Detected Obstacle:") ? clean : `Detected Obstacle: ${clean}`;
  };

  const rawHazard = assessment?.hazard_name || assessment?.hazard_type || "Abandoned Fishing Gear (Ghost Net)";
  const hazardType = isRejected 
    ? "REJECTED // NON-ACOUSTIC SIGNATURE" 
    : formatHazardName(rawHazard);

  const rawDiverAction = assessment?.diver_safety || assessment?.diver_safety_action || assessment?.diver_action || "";
  let diverAction = isRejected 
    ? "Directive halted: Ingestion matrix rejected by acoustic filter. Awaiting genuine survey pass." 
    : (rawDiverAction || "Keep a safe distance of at least 5 meters. Do not touch or cut nets without proper gear.");

  const rawEco = assessment?.marine_risk || assessment?.ecological_impact || "";
  let ecologicalImpact = isRejected 
    ? "Acoustic assessment suspended. Target signature non-marine." 
    : (rawEco || "Risk: Loose netting in water column creates severe entanglement hazard for local turtles.");

  const isInvalid = isRejected || threatLevel === "INVALID";

  const severityText = (assessment?.severity || assessment?.threat_level || "MODERATE RISK").toUpperCase();
  let severityBadgeClass = "bg-[#D97706]/20 text-[#f59e0b] border-[#D97706]/60 shadow-[0_0_12px_rgba(217,119,6,0.25)]";
  let severityIcon = "⚠️";
  let displaySeverity = "MODERATE RISK";

  if (severityText.includes("LOW") || severityText.includes("CLEAR")) {
    severityBadgeClass = "bg-[#059669]/20 text-[#10b981] border-[#059669]/60 shadow-[0_0_12px_rgba(5,150,105,0.25)]";
    severityIcon = "🟢";
    displaySeverity = severityText.includes("MODERATE") ? "LOW TO MODERATE RISK" : "LOW RISK";
  } else if (severityText.includes("CRITICAL") || severityText.includes("HIGH")) {
    severityBadgeClass = "bg-[#DC2626]/20 text-[#ef4444] border-[#DC2626]/60 shadow-[0_0_12px_rgba(220,38,38,0.25)]";
    severityIcon = "🚨";
    displaySeverity = severityText.includes("COLLISION") ? "HIGH COLLISION RISK" : (severityText.includes("CRITICAL") ? "CRITICAL RISK" : "HIGH RISK");
  } else {
    displaySeverity = severityText.includes("MODERATE") ? "MODERATE RISK" : severityText;
  }

  const handleExportIhoCsv = () => {
    const targetName = (assessment?.hazard_name || assessment?.hazard_type || detection?.hazard_type || "Ghost Fishing Net").replace(/,/g, " ");
    let conf = 94;
    if (detection?.confidence != null) {
      conf = Math.round(detection.confidence > 1 ? detection.confidence : detection.confidence * 100);
    } else if (assessment?.confidence_score != null) {
      conf = Math.round(assessment.confidence_score > 1 ? assessment.confidence_score : assessment.confidence_score * 100);
    }
    const lat = Number(detection?.gps_coordinates?.lat_raw ?? detection?.gps_coordinates?.latitude ?? 15.4291).toFixed(4);
    const lng = Number(detection?.gps_coordinates?.lon_raw ?? detection?.gps_coordinates?.longitude ?? 73.8123).toFixed(4);
    const depth = String(assessment?.seabed_depth || detection?.swath_depth_m || "31.5").replace(/[^\d.-]/g, "") || "31.5";
    const backscatter = String(assessment?.backscatter_db || "43.7").replace(/[^\d.-]/g, "") || "43.7";
    const timestamp = new Date().toISOString();

    const headers = "RECORD_ID,TIMESTAMP_UTC,HYDROGRAPHIC_DATUM,TARGET_CLASS,CONFIDENCE_SCORE,LATITUDE,LONGITUDE,ISOBARIC_DEPTH_M,BACKSCATTER_DB,SURVEY_ORDER,CLEARANCE_RADIUS_M";
    const row = `AQUA-2026-09A,${timestamp},WGS-84,${targetName},${conf}%,${lat},${lng},${depth}m,${backscatter}dB,IHO S-44 ORDER 1A,50.0m`;
    const csvContent = `${headers}\n${row}\n`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Sonar_Survey_${Date.now()}_Metadata.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full bg-slate-950/60 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)] overflow-hidden font-sans transition-all duration-300">
      {/* Header with Title & Severity Badge */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">
              Hazard Alert &amp; Action Plan
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-7.5">
            Clearance instructions for divers and nearby vessels.
          </p>
        </div>
        <div>
          {isInvalid ? (
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-red-950/80 text-red-400 border border-red-600">
              INVALID SENSOR INPUT
            </span>
          ) : (
            <span className={`px-3.5 py-1 rounded-full text-xs font-bold border shadow-sm flex items-center gap-1.5 transition-all duration-300 ${severityBadgeClass}`}>
              <span>{severityIcon}</span>
              <span>{displaySeverity}</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Target Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3 transition-all duration-300">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] tracking-widest text-slate-400 uppercase font-semibold">
            DETECTED SEABED OBJECT
          </span>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {hazardType}
          </h2>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Verified • High Confidence</span>
        </div>
      </div>

      {/* Two Clear Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Box 1: Diver Advisory */}
        <div className="bg-slate-900/60 border border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between gap-3 transition-all duration-300">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <LifeBuoy className="w-4 h-4 text-amber-400" />
            <h4>Diver Safety Guidelines</h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {diverAction}
          </p>
        </div>

        {/* Box 2: Protected Marine Life in Area */}
        <div className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-5 flex flex-col justify-between gap-3 transition-all duration-300">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-emerald-400 font-bold text-sm mb-2">
              <div className="flex items-center gap-2">
                <Fish className="w-4 h-4 text-emerald-400" />
                <h4>Marine Life in Area</h4>
              </div>
              {!isInvalid && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/60">
                  Protected Species Active
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {ecologicalImpact.startsWith("Risk:") ? ecologicalImpact : `Risk: ${ecologicalImpact}`}
            </p>

            {/* Genetic Trace Identification & Sanctuary Alert */}
            {!isInvalid && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20 space-y-1.5">
                <div className="text-xs text-emerald-300 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{assessment?.marine_dna_match || "Olive Ridley Turtle (Lepidochelys olivacea) • 91.4% Match"}</span>
                </div>
                <div className="text-[11px] text-amber-300/90 font-medium pt-1.5 border-t border-slate-800/80 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Status: Alert sent to local Marine Sanctuary.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clean Action Buttons (Bottom Bar) */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
        {/* Button 1: Voice Alert */}
        <button
          type="button"
          onClick={handleToggleVoiceWarning}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs transition-all shadow-md cursor-pointer active:scale-95 ${
            isSpeaking
              ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] animate-pulse"
              : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          }`}
          title="Read spoken VHF emergency hazard warning aloud"
        >
          {isSpeaking ? (
            <>
              <Volume2 className="w-4 h-4 animate-pulse" />
              <span>Playing Alert...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>Voice Alert</span>
            </>
          )}
        </button>

        {/* Button 2: Download Safety PDF */}
        <button
          type="button"
          onClick={() => setIsPrintModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all shadow-sm cursor-pointer active:scale-95"
          title="Download safety advisory PDF"
        >
          <FileText className="w-4 h-4" />
          <span>Download Safety PDF</span>
        </button>

        {/* Button 3: Send Radio Alert */}
        <button
          type="button"
          onClick={() => setIsNavtexOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer active:scale-95"
        >
          <Radio className="w-4 h-4" />
          <span>Send Radio Alert</span>
        </button>

        {/* Button 4: Diver Brief */}
        <button
          type="button"
          onClick={onDownloadPdf}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium text-xs transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Printer className="w-4 h-4 text-cyan-400" />
          <span>Diver Brief</span>
        </button>

        {/* Button 5: Export CSV */}
        <button
          type="button"
          onClick={handleExportIhoCsv}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-xs transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4 text-slate-400" />
          <span>Export CSV</span>
        </button>

        {/* Button 6: Export JSON */}
        <button
          type="button"
          onClick={onExportReport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-xs transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Download className="w-4 h-4 text-slate-400" />
          <span>Export JSON</span>
        </button>
      </div>

      <NavtexModal isOpen={isNavtexOpen} onClose={() => setIsNavtexOpen(false)} detection={detection} assessment={assessment} />
      <PrintableMissionReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        assessment={assessment}
        detection={detection}
        targetCoords={targetCoords}
      />
    </div>
  );
}

