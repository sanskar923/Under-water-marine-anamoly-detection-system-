import React, { useRef, useEffect } from "react";
import auvScrollCinematic from "../assets/auv_scroll_cinematic.mp4";

export default function LandingHero({ onScrollToConsole, operatorName }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch((err) => {
        console.warn("[AQUASCAN]: Autoplay prevented by browser:", err);
      });
    }
  }, []);

  return (
    <div id="section-overview" className="relative w-full min-h-screen overflow-hidden bg-black flex flex-col justify-between px-6 md:px-12 lg:px-20 py-12 select-none">
      {/* Background Video Layer - looping subsea video at opacity-40 */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-40 filter brightness-90 contrast-105"
      >
        <source src="/auv_scroll_cinematic.mp4" type="video/mp4" />
        <source src="/auv_loop.mp4" type="video/mp4" />
        <source src={auvScrollCinematic} type="video/mp4" />
      </video>

      {/* High-Contrast Gradient Scrim (Z-1) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020612]/70 via-transparent to-[#020612]/95 z-[1] pointer-events-none" />

      {/* Foreground Content (Z-10) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col justify-between h-full flex-1">
        {/* Section 1: Massive Editorial Hero Canvas */}
        <div className="my-auto py-10 lg:py-16 flex flex-col gap-10">
          {/* Top Title: Giant display title spanning across the canvas */}
          <div className="w-full">
            <h1 className="font-sans font-black tracking-[-0.04em] text-slate-100 text-5xl md:text-7xl lg:text-8xl leading-none uppercase">
              AQUASCAN
            </h1>
          </div>

          {/* Editorial Hero Content */}
          <div className="flex flex-col gap-6 max-w-3xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              The littoral zone's first autonomous acoustic hydrographer.
            </h2>

            <p className="text-slate-400 font-normal leading-relaxed text-base sm:text-lg max-w-2xl">
              Replacing slow, high-risk vessel survey sweeps with edge-deployed neural side-scan sonar—processing backscatter textures and clearing coastal hazards in real time.
            </p>

            {/* Action Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (onScrollToConsole) {
                    onScrollToConsole();
                  } else {
                    document.getElementById("live-console")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="rounded-full px-8 py-3.5 bg-slate-100 hover:bg-white text-slate-950 font-semibold text-sm transition-all shadow-lg hover:shadow-cyan-500/10 cursor-pointer active:scale-[0.98]"
              >
                LAUNCH WORKSTATION ↓
              </button>
              <a
                href="#section-narrative"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("section-narrative")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-slate-400 hover:text-cyan-300 font-mono text-xs tracking-wider transition-colors inline-flex items-center gap-1.5 py-2 cursor-pointer"
              >
                EXPLORE IHO S-44 COMPLIANCE →
              </a>
            </div>
          </div>
        </div>

        {/* Subtle Bottom Scroll Indicator */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs font-mono text-slate-500">
          <span>AQUASCAN HYDROGRAPHIC PLATFORM v2.4</span>
          <span className="animate-bounce text-cyan-400">SCROLL TO EXPLORE ARCHITECTURE ↓</span>
          <span>DATUM: WGS-84 LAT-LON</span>
        </div>
      </div>
    </div>
  );
}
