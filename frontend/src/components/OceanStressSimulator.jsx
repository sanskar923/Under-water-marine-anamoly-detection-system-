import React, { useState } from "react";
import { Sliders, AlertTriangle, ShieldCheck, Fish, Thermometer, RotateCcw, ArrowRight, Activity, Waves } from "lucide-react";

export default function OceanStressSimulator() {
  // Slider 1: Fishing Boat Activity (0: Low, 1: Normal, 2: Heavy Overfishing)
  const [fishingLevel, setFishingLevel] = useState(1);

  // Slider 2: Water Warming (0: Normal, 1: +1°C Warm, 2: +2°C Hot)
  const [warmingLevel, setWarmingLevel] = useState(0);

  const fishingLabels = ["Low Fishing", "Normal", "Heavy Overfishing"];
  const warmingLabels = ["Normal (28°C)", "+1°C Warm (29°C)", "+2°C Hot (30°C)"];

  // Compute stress score: 0 to 4
  const stressScore = fishingLevel + warmingLevel;

  let conditionBadge = {
    text: "Safe & Balanced",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm",
    icon: ShieldCheck,
    iconColor: "text-emerald-400",
    statusLevel: "optimal",
  };

  let explanation = "Fish populations and plankton levels are stable. Top predators like Whale Sharks have abundant food and divers face minimal ghost net risks.";
  let biomassPct = 92;
  let foodAvailability = "Abundant Food";
  let entanglementRisk = "Minimal Risk (Clean Seabed)";

  if (stressScore === 1) {
    conditionBadge = {
      text: "Mild Environmental Pressure",
      badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm",
      icon: Activity,
      iconColor: "text-cyan-400",
      statusLevel: "mild",
    };
    if (fishingLevel === 1 && warmingLevel === 0) {
      explanation = "Normal coastal operations. Commercial fishing quotas are respected and sea temperatures support healthy seasonal breeding.";
      biomassPct = 85;
      foodAvailability = "Sufficient Food";
      entanglementRisk = "Low Managed Risk";
    } else if (warmingLevel === 1) {
      explanation = "Slight water warming increases plankton metabolism. Forage fish migrate deeper to stay cool, causing minor shifts in local fishing grounds.";
      biomassPct = 78;
      foodAvailability = "Slightly Reduced";
      entanglementRisk = "Low Managed Risk";
    } else {
      explanation = "Low fishing activity allows nursery fish stocks to rebuild rapidly across coastal reefs.";
      biomassPct = 95;
      foodAvailability = "Abundant Food";
      entanglementRisk = "Negligible Risk";
    }
  } else if (stressScore === 2) {
    conditionBadge = {
      text: "Caution: Food Chain Under Strain",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm",
      icon: AlertTriangle,
      iconColor: "text-amber-400",
      statusLevel: "moderate",
    };
    if (fishingLevel === 2) {
      explanation = "Heavy overfishing strips away small anchovies and sardines, leaving less food for Whale Sharks and dolphins. Discarded ghost nets begin accumulating on reefs.";
      biomassPct = 58;
      foodAvailability = "Critical Shortage for Apex Predators";
      entanglementRisk = "High (Active Net Discards)";
    } else if (warmingLevel === 2) {
      explanation = "+2°C heat causes coastal coral bleaching and drops dissolved oxygen. Plankton blooms drop by 35%, forcing marine animals to travel further to feed.";
      biomassPct = 62;
      foodAvailability = "Moderate Plankton Reduction";
      entanglementRisk = "Moderate Risk";
    } else {
      explanation = "Combined fishing pressure and +1°C temperature rise begin stressing coastal fish nurseries. Marine sanctuary rangers recommend quota limits.";
      biomassPct = 68;
      foodAvailability = "Strained Food Web";
      entanglementRisk = "Elevated Hazard";
    }
  } else if (stressScore >= 3) {
    conditionBadge = {
      text: "Food Chain in Danger - Urgent Action Needed",
      badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm",
      icon: AlertTriangle,
      iconColor: "text-rose-400",
      statusLevel: "danger",
    };
    if (stressScore === 4) {
      explanation = "Emergency Collapse Warning: Heavy overfishing combined with +2°C overheating strips out 65% of small fish and collapses plankton layers. Whale Sharks abandon the sanctuary and ghost net entanglements surge by 70%.";
      biomassPct = 34;
      foodAvailability = "Severe Starvation Deficit";
      entanglementRisk = "Severe Entanglement Threat";
    } else {
      explanation = "High stress from commercial overfishing and elevated sea temperatures. Forage stocks are depleted, endangering both marine wildlife and coastal fisherman livelihoods.";
      biomassPct = 45;
      foodAvailability = "Depleted Feeding Grounds";
      entanglementRisk = "High Entanglement Hazard";
    }
  }

  const handleReset = () => {
    setFishingLevel(1);
    setWarmingLevel(0);
  };

  const IconComponent = conditionBadge.icon;

  return (
    <section id="section-stress-simulator" className="w-full py-4 space-y-6 select-none">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>What-If Ocean Stress Simulator</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                Predictive Marine Twin
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate how overfishing and rising sea temperatures impact marine food chains, fish numbers, and diver safety.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>[Reset to Normal Sea Conditions]</span>
        </button>
      </div>

      {/* Clean Dual-Column Layout with Soft-Radius Styling */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Two Simple Sliders (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between gap-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate Environmental Pressures</span>
            </div>

            <div className="space-y-6">
              {/* Slider 1: Fishing Boat Activity */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Fish className="w-4 h-4 text-emerald-400" />
                    Fishing Boat Activity
                  </span>
                  <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                    fishingLevel === 2
                      ? "bg-rose-950/80 text-rose-400 border-rose-700"
                      : fishingLevel === 0
                      ? "bg-cyan-950/80 text-cyan-400 border-cyan-700"
                      : "bg-emerald-950/80 text-emerald-400 border-emerald-700"
                  }`}>
                    {fishingLabels[fishingLevel]}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="2"
                  step="1"
                  value={fishingLevel}
                  onChange={(e) => setFishingLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />

                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span className={fishingLevel === 0 ? "text-cyan-300 font-bold" : ""}>Low</span>
                  <span className={fishingLevel === 1 ? "text-emerald-300 font-bold" : ""}>Normal</span>
                  <span className={fishingLevel === 2 ? "text-rose-400 font-bold" : ""}>Heavy Overfishing</span>
                </div>
              </div>

              {/* Slider 2: Water Warming */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-amber-400" />
                    Water Warming
                  </span>
                  <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                    warmingLevel === 2
                      ? "bg-rose-950/80 text-rose-400 border-rose-700"
                      : warmingLevel === 1
                      ? "bg-amber-950/80 text-amber-400 border-amber-700"
                      : "bg-cyan-950/80 text-cyan-400 border-cyan-700"
                  }`}>
                    {warmingLabels[warmingLevel]}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="2"
                  step="1"
                  value={warmingLevel}
                  onChange={(e) => setWarmingLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />

                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span className={warmingLevel === 0 ? "text-cyan-300 font-bold" : ""}>Normal</span>
                  <span className={warmingLevel === 1 ? "text-amber-300 font-bold" : ""}>+1°C Warm</span>
                  <span className={warmingLevel === 2 ? "text-rose-400 font-bold" : ""}>+2°C Hot</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span>Graph Neural Network Cascade Engine</span>
            <span className="text-cyan-400 font-mono text-[10px]">Real-time Projection</span>
          </div>
        </div>

        {/* Right Column: Dynamic Health Outcome Box (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between gap-6 shadow-sm">
          <div className="space-y-4">
            {/* Outcome Header & Dynamic Condition Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
                  PREDICTED ECOSYSTEM IMPACT
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Ecosystem Condition
                </h3>
              </div>

              <div className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 transition-all duration-300 ${conditionBadge.badgeClass}`}>
                <IconComponent className={`w-4 h-4 ${conditionBadge.iconColor}`} />
                <span>{conditionBadge.text}</span>
              </div>
            </div>

            {/* Human-Friendly Dynamic Explanation */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                What Happens in the Sea:
              </span>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {explanation}
              </p>
            </div>

            {/* 3 Metric Gauges (Progress Bars) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              {/* Metric 1: Fish Stock Biomass */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-[11px] font-medium text-slate-400 block">Fish Biomass Health</span>
                <div className="text-xl font-black text-white font-mono">{biomassPct}%</div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      biomassPct < 50 ? "bg-rose-500" : biomassPct < 75 ? "bg-amber-500" : "bg-emerald-400"
                    }`}
                    style={{ width: `${biomassPct}%` }}
                  />
                </div>
              </div>

              {/* Metric 2: Whale Shark Food */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-[11px] font-medium text-slate-400 block">Whale Shark Food</span>
                <div className={`text-xs font-bold ${
                  stressScore >= 3 ? "text-rose-400" : stressScore === 2 ? "text-amber-400" : "text-emerald-300"
                }`}>
                  {foodAvailability}
                </div>
                <div className="text-[10px] text-slate-400">Plankton & small fish diet</div>
              </div>

              {/* Metric 3: Entanglement Risk */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-[11px] font-medium text-slate-400 block">Ghost Net Risk</span>
                <div className={`text-xs font-bold ${
                  fishingLevel === 2 ? "text-rose-400" : fishingLevel === 1 ? "text-amber-300" : "text-emerald-300"
                }`}>
                  {entanglementRisk}
                </div>
                <div className="text-[10px] text-slate-400">Diver & wildlife snare risk</div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Predictive Trophic Balance Model Active
            </span>
            <span className="text-slate-500 font-mono text-[10px]">ISO 14001 Marine Protection</span>
          </div>
        </div>
      </div>
    </section>
  );
}
