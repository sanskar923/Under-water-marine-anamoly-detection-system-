import React, { useRef, useEffect, useState } from "react";
import vSonar from "../assets/stage1_sonar.mp4";
import vGeo from "../assets/stage2_geospatial.mp4";
import vModem from "../assets/stage3_modem.mp4";
import vHazard from "../assets/stage4_hazard.mp4";

export { vSonar, vGeo, vModem, vHazard };

const STAGE_VIDEOS = {
  1: vSonar,
  2: vGeo,
  3: vModem,
  4: vHazard,
  "section-waterfall": vSonar,
  "section-map": vGeo,
  "section-telemetry": vModem,
  "section-directive": vHazard,
  waterfall: vSonar,
  map: vGeo,
  telemetry: vModem,
  directive: vHazard,
};

export default function StageVideoContainer({
  id,
  videoSrc,
  fallbackSrc,
  children,
  className = "",
  opacity = 0.45,
}) {
  const videoRef = useRef(null);
  const activeVideoSrc = videoSrc || (id ? STAGE_VIDEOS[id] : null) || fallbackSrc || vSonar;
  const [hasError, setHasError] = useState(false);

  // Force video playback across all browsers and viewport contexts
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    vid.muted = true;
    vid.defaultMuted = true;

    const playVideo = () => {
      if (vid.paused) {
        const p = vid.play();
        if (p && typeof p.catch === "function") {
          p.catch((err) => {
            console.warn(`[StageVideoContainer] Autoplay pending interaction for stage '${id}':`, err);
          });
        }
      }
    };

    playVideo();

    const handleInteraction = () => {
      if (vid && vid.paused) {
        playVideo();
      }
    };

    window.addEventListener("scroll", handleInteraction, { passive: true });
    window.addEventListener("click", handleInteraction, { passive: true });
    window.addEventListener("touchstart", handleInteraction, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, [activeVideoSrc, id]);

  return (
    <section
      id={id}
      className={`min-h-screen relative overflow-hidden flex items-center justify-center p-6 lg:p-12 transition-all duration-700 ${className}`}
    >
      {/* Viewport Ambient Stage Video */}
      {!hasError && activeVideoSrc ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => {
            e.currentTarget.muted = true;
            e.currentTarget.play().catch(() => {});
          }}
          onCanPlay={(e) => {
            e.currentTarget.muted = true;
            e.currentTarget.play().catch(() => {});
          }}
          onError={() => setHasError(true)}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 will-change-transform filter brightness-95 contrast-110"
          style={{ opacity }}
          src={activeVideoSrc}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15),transparent_70%)] pointer-events-none z-0" />
      )}

      {/* High-Contrast Tactical Vignette Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020611]/85 via-[#020611]/45 to-[#020611]/90 pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,#020611_85%)] pointer-events-none z-[1]" />

      {/* Interactive UI Stage Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center">
        {children}
      </div>
    </section>
  );
}
