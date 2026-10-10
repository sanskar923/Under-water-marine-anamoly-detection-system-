import React from "react";
import { CheckCircle2, Award, FileCheck2 } from "lucide-react";

export default function EditorialNarrativeBlock() {
  return (
    <section id="section-narrative" className="relative w-full py-28 border-t border-slate-800/60 bg-[#020612]/60 backdrop-blur-sm select-none">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-16">
        {/* Top Micro Eyebrow */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2ff]" />
          <span className="font-mono text-xs text-cyan-400 tracking-widest uppercase">
            HYDROGRAPHIC SURVEY DEFICIT // OPERATIONAL REALITY
          </span>
        </div>

        {/* Expansive 2-Column Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: 48px bold heading */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] text-slate-100 leading-[1.1]">
              Over 80% of our coastal waters remain unverified to modern hydrographic orders.
            </h2>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="rounded-full px-3.5 py-1 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                IHO S-44 ORDER 1A COMPLIANT
              </span>
              <span className="rounded-full px-3.5 py-1 text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                WGS-84 BATHYMETRIC DATUM
              </span>
            </div>
          </div>

          {/* Right Column: Narrative paragraphs & delays explanation */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-slate-400 font-normal leading-relaxed text-base sm:text-lg">
            <p>
              Traditional hydrographic sweeps rely on tethered surface vessels operating at 3 knots, followed by weeks of onshore manual acoustic parsing. In high-traffic littoral waterways, critical hazards—abandoned ghost gear, unexploded ordnance, and dredge pipelines—shift with seasonal monsoons and tidal flows faster than hydrographic offices can publish updated raster charts.
            </p>
            <p>
              AquaScan bridges this latency gap by shifting classification from shore-side GIS suites directly to the towfish edge. By coupling real-time acoustic shadow trigonometry with neural backscatter validation, subsea anomalies are confirmed, depth-corrected, and converted into official maritime safety broadcasts within seconds of sensor acquisition.
            </p>

            {/* Verification & Accreditation Lockup */}
            <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>VALIDATED AGAINST IHO S-44 ORDER 1A</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-lg">
                <Award className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>WGS-84 BATHYMETRIC DATUM</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-lg">
                <FileCheck2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>IMO/NAVTEX COMPLIANT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
