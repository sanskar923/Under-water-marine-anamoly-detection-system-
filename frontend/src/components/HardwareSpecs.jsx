import React from "react";
import { Cpu, Layers, Radio, ArrowRight } from "lucide-react";

export default function HardwareSpecs() {
  const scrollToConsole = () => {
    document.getElementById("live-console")?.scrollIntoView({ behavior: "smooth" });
  };

  const cards = [
    {
      icon: Cpu,
      title: "Local Edge Engine (Embedded ONNX)",
      subtitle: "NVIDIA Jetson Onboard Inference",
      desc: "NVIDIA Jetson onboard inference — Subsea real-time shadow geometry without satellite link.",
      specs: ["LATENCY: < 15ms", "ACCELERATOR: TensorRT FP16", "BANDWIDTH: 0 kbps Air-Gap"],
      color: "border-emerald-500/40 text-emerald-400 bg-emerald-950/20",
    },
    {
      icon: Layers,
      title: "Slant-Range Correction",
      subtitle: "Dynamic SVP Calibration",
      desc: "Dynamic water-column nadir correction calibrated via Sound Velocity Profile (SVP).",
      specs: ["SOUND SPEED: 1528 m/s", "NADIR ZONE: Corrected", "ACCURACY: ±1.2cm RMS"],
      color: "border-cyan-500/40 text-cyan-400 bg-cyan-950/20",
    },
    {
      icon: Radio,
      title: "Maritime Safety Broadcast (IMO)",
      subtitle: "NAVAREA VIII Coastal Broadcasts",
      desc: "Automated coastal hazard warning generation over standard NAVTEX 518 kHz channels.",
      specs: ["FREQUENCY: 518 kHz", "CHECKSUM: CRC-16", "PROTOCOL: S2C 12kHz Modem"],
      color: "border-amber-500/40 text-amber-400 bg-amber-950/20",
    },
  ];

  return (
    <section id="hardware-specs" className="relative min-h-[75vh] py-20 px-6 lg:px-16 bg-transparent border-t border-cyan-950/60 select-none flex flex-col justify-center">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2ff]" />
              Engineering Specifications
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Survey Platform <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">Architecture</span>
            </h2>
          </div>
          <button
            onClick={scrollToConsole}
            className="self-start md:self-auto inline-flex items-center gap-2 text-xs font-mono font-semibold text-slate-950 bg-slate-100 hover:bg-white px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/10 active:scale-[0.98]"
          >
            <span>OPEN LIVE WORKSTATION -&gt;</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                className="relative backdrop-blur-xl bg-gradient-to-b from-[#0b162c]/80 to-[#060c1a]/90 border border-cyan-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_12px_40px_rgba(0,0,0,0.6)] p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 hover:border-cyan-400/50"
              >
                {/* Micro Mechanical Corner Ticks */}
                <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-cyan-400/40 pointer-events-none" />
                <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-cyan-400/40 pointer-events-none" />

                <div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${c.color} shadow-lg`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-wide">{c.title}</h3>
                  <div className="text-[11px] font-mono text-slate-400 mb-3">{c.subtitle}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{c.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col gap-1.5 font-mono text-[10px] text-slate-400">
                  {c.specs.map((s, si) => (
                    <div key={si} className="flex items-center justify-between text-slate-300">
                      <span>{s.split(":")[0]}:</span>
                      <span className="text-cyan-300 font-semibold">{s.split(":")[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
