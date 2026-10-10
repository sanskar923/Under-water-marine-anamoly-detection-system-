import React, { useState, useEffect } from "react";
import { Waves, Cpu, AlertTriangle, Radio, ShieldCheck, Dna, ArrowRight, CheckCircle2, ShieldAlert, Anchor } from "lucide-react";

export const WORKFLOW_SCENARIOS = {
  ghost_net: {
    id: "ghost_net",
    name: "Ghost Net",
    emoji: "🕸️",
    badgeColor: "text-red-400 bg-red-950/80 border-red-700",
    step1: {
      tag: "Step 1",
      subhead: "1. Sonar Sweep",
      title: "Seabed Acoustic Scan",
      desc: "High-frequency side-scan sonar continuously scans the seafloor for unusual objects and shadows.",
      icon: Waves,
      color: "border-cyan-500/40 bg-cyan-950/20"
    },
    step2: {
      tag: "Step 2",
      subhead: "2. AI Recognition",
      title: "Obstacle Detected",
      desc: "Computer vision model analyzes the acoustic shadow to classify the structure as an abandoned net.",
      icon: Cpu,
      color: "border-purple-500/40 bg-purple-950/20"
    },
    step3: {
      tag: "Step 3",
      subhead: "3. Risk Assessment",
      title: "Entanglement Hazard",
      desc: "Flagged as a danger zone to prevent diver accidents and protect nearby marine life.",
      icon: AlertTriangle,
      color: "border-amber-500/40 bg-amber-950/20"
    },
    step4: {
      tag: "Step 4",
      subhead: "4. Automated Action",
      title: "Safety Alerts Dispatched",
      desc: "Audio warning sounds, safety zone is mapped, and navigation advisories are sent to passing vessels.",
      icon: ShieldAlert,
      color: "border-emerald-500/40 bg-emerald-950/20"
    }
  },
  pipeline: {
    id: "pipeline",
    name: "Subsea Pipeline",
    emoji: "🛢️",
    badgeColor: "text-amber-400 bg-amber-950/80 border-amber-700",
    step1: {
      tag: "Step 1",
      subhead: "1. Sonar Sweep",
      title: "Seabed Bathymetry Scan",
      desc: "Acoustic pinging aligned with underwater magnetic anomaly detection along pipeline route.",
      icon: Waves,
      color: "border-cyan-500/40 bg-cyan-950/20"
    },
    step2: {
      tag: "Step 2",
      subhead: "2. AI Recognition",
      title: "Pipeline Structure Located",
      desc: "Linear geometry classification flags exposed unburied segment and potential seabed scours.",
      icon: Cpu,
      color: "border-purple-500/40 bg-purple-950/20"
    },
    step3: {
      tag: "Step 3",
      subhead: "3. Risk Assessment",
      title: "Anchor Snag Risk",
      desc: "Flagged as a commercial shipping hazard to prevent rupture and anchor entanglement.",
      icon: AlertTriangle,
      color: "border-amber-500/40 bg-amber-950/20"
    },
    step4: {
      tag: "Step 4",
      subhead: "4. Automated Action",
      title: "Safety Zone Enforced",
      desc: "Dynamic AIS perimeter transmitted to incoming vessels; port engineering inspection scheduled.",
      icon: Anchor,
      color: "border-emerald-500/40 bg-emerald-950/20"
    }
  },
  whale_shark: {
    id: "whale_shark",
    name: "Whale Shark eDNA",
    emoji: "🐋",
    badgeColor: "text-emerald-400 bg-emerald-950/80 border-emerald-700",
    step1: {
      tag: "Step 1",
      subhead: "1. Water Sampling",
      title: "eDNA Sensor Sweep",
      desc: "Coastal telemetry station captures environmental DNA molecules and water turbidity.",
      icon: Dna,
      color: "border-cyan-500/40 bg-cyan-950/20"
    },
    step2: {
      tag: "Step 2",
      subhead: "2. AI Recognition",
      title: "Species DNA Match",
      desc: "98.4% genetic alignment confirms active presence of Rhincodon typus (Whale Shark).",
      icon: Cpu,
      color: "border-purple-500/40 bg-purple-950/20"
    },
    step3: {
      tag: "Step 3",
      subhead: "3. Risk Assessment",
      title: "Endangered Feeding Ground",
      desc: "Critical feeding corridor with high risk of trawler collision and plankton depletion.",
      icon: AlertTriangle,
      color: "border-amber-500/40 bg-amber-950/20"
    },
    step4: {
      tag: "Step 4",
      subhead: "4. Automated Action",
      title: "Sanctuary Alert Sent",
      desc: "10-knot speed cap enforced; automated sanctuary safety notice sent to Coast Guard.",
      icon: ShieldCheck,
      color: "border-emerald-500/40 bg-emerald-950/20"
    }
  }
};

export default function DynamicSolutionFlowchart({ activeHazard, activeSampleId }) {
  const [selectedScenario, setSelectedScenario] = useState("ghost_net");

  useEffect(() => {
    const raw = `${activeHazard || ""} ${activeSampleId || ""}`.toLowerCase();
    if (raw.includes("pipe")) {
      setSelectedScenario("pipeline");
    } else if (raw.includes("whale") || raw.includes("dna") || raw.includes("edna")) {
      setSelectedScenario("whale_shark");
    } else if (raw.includes("net") || raw.includes("ghost") || raw.includes("sample-1")) {
      setSelectedScenario("ghost_net");
    }
  }, [activeHazard, activeSampleId]);

  const current = WORKFLOW_SCENARIOS[selectedScenario] || WORKFLOW_SCENARIOS.ghost_net;

  const steps = [
    { num: "01", data: current.step1 },
    { num: "02", data: current.step2 },
    { num: "03", data: current.step3 },
    { num: "04", data: current.step4 }
  ];

  return (
    <div className="bg-slate-900/70 backdrop-blur-md border border-cyan-500/25 rounded-2xl p-6 space-y-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] font-sans">
      {/* Header & Scenario Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <span>System Workflow</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs border font-medium ${current.badgeColor}`}>
                {current.name} Selected
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            How AquaScan automatically detects, verifies, and resolves marine hazards.
          </p>
        </div>

        {/* Scenario Selectors */}
        <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
          {Object.values(WORKFLOW_SCENARIOS).map((sc) => (
            <button
              key={sc.id}
              onClick={() => setSelectedScenario(sc.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedScenario === sc.id
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span>{sc.emoji}</span>
              <span>{sc.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4 Connected Flow Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 relative">
        {steps.map((step, idx) => {
          const IconComp = step.data.icon;
          return (
            <div key={idx} className="relative flex flex-col justify-between">
              <div
                className={`h-full bg-slate-950/85 border rounded-2xl p-5 space-y-3 transition-all duration-300 hover:scale-[1.02] shadow-lg group ${step.data.color}`}
              >
                {/* Step Pill & Icon */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-cyan-300">
                    {step.data.tag}
                  </span>
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-white group-hover:scale-110 transition-transform">
                    <IconComp className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>

                {/* Step Header */}
                <div>
                  <div className="text-[11px] font-medium text-slate-400">
                    {step.data.subhead}
                  </div>
                  <div className="text-sm font-bold text-white mt-1 leading-snug">
                    {step.data.title}
                  </div>
                </div>

                {/* Step Description */}
                <p className="text-xs text-slate-300/90 leading-relaxed font-normal pt-1">
                  {step.data.desc}
                </p>

                {/* Bottom Status Marker */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{idx < steps.length - 1 ? "✓ Complete" : "✓ Active"}</span>
                  </span>
                </div>
              </div>

              {/* Arrow divider for larger screens */}
              {idx < steps.length - 1 && (
                <div className="hidden xl:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-slate-900 border border-cyan-500/40 items-center justify-center text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
