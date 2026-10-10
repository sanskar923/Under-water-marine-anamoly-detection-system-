import React from "react";
import { Database, Globe, Bot, Fish, Dna, Activity, ArrowRight } from "lucide-react";

export default function SystemPillarsSection() {
  const pillars = [
    {
      num: "01",
      icon: Database,
      title: "📂 Central Sea Data Library",
      desc: "Safe storage for all underwater scan files, satellite maps, and water quality reports. Easy to filter and download.",
      badge: "Easy Data Sharing",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    },
    {
      num: "02",
      icon: Globe,
      title: "🗺️ Live 3D Ocean Map",
      desc: "Real-time view of sea depths, water flow directions, and live migration routes of whales and sea turtles.",
      badge: "Live Tracker",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    },
    {
      num: "03",
      icon: Bot,
      title: "🤖 Aqua-Agent (Smart Assistant)",
      desc: "Your friendly AI partner. Ask questions in simple Hindi or English, run sonar scans, or speak radio warnings with 1 click.",
      badge: "Voice & Chat Ready",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    {
      num: "04",
      icon: Fish,
      title: "🐟 Fish Stock & Catch Monitor",
      desc: "Monitors daily fishing boat catches to make sure fish species are not overfished and marine life stays protected.",
      badge: "Prevents Overfishing",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    },
    {
      num: "05",
      icon: Dna,
      title: "🧬 Water DNA Scanner",
      desc: "Scans ocean water samples to detect invisible traces of rare and endangered creatures like Whale Sharks.",
      badge: "Protects Rare Species",
      badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    },
    {
      num: "06",
      icon: Activity,
      title: "🌊 5 Coastal Sea Stations",
      desc: "Live temperature, salt levels, and oxygen checks from Goa, Mumbai, Cochin, Chennai, and Vizag ports.",
      badge: "Real-time Updates",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
  ];

  return (
    <section id="section-pillars" className="relative w-full py-28 border-t border-slate-800/60 bg-[#01040a]/80 select-none">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="font-mono text-xs text-emerald-400 tracking-widest uppercase">
                CORE ARCHITECTURE PILLARS
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.04em] text-slate-100 leading-none">
              What sets AquaScan apart.
            </h2>
          </div>
          <p className="text-slate-400 font-mono text-xs max-w-sm">
            End-to-end autonomous pipeline engineered to replace weeks of shore processing with instantaneous littoral clearance.
          </p>
        </div>

        {/* 6-Item Clean Typographic Narrative Grid (3x2 on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.num}
                className="bg-slate-950/60 backdrop-blur-md border border-slate-800/80 hover:border-cyan-500/40 rounded-xl p-8 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-2xl font-black text-slate-700 group-hover:text-cyan-400 transition-colors">
                      {p.num}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mb-4 group-hover:border-cyan-500/40 group-hover:bg-cyan-950/30 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 mb-2.5 leading-snug">
                    {p.title}
                  </h3>

                  <p className="text-slate-300 text-sm leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900 flex items-center text-xs font-medium text-emerald-400">
                  <span>● Ready & Active</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
