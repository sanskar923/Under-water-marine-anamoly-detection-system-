import React, { useRef, useEffect } from "react";
import auvScrollCinematic from "../assets/auv_scroll_cinematic.mp4";

export default function FixedVideoBackdrop() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch((err) => {
        console.warn("[AQUASCAN]: Fixed backdrop autoplay prevented:", err);
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover opacity-35 filter brightness-90 contrast-125"
      >
        <source src="/auv_scroll_cinematic.mp4" type="video/mp4" />
        <source src="/auv_loop.mp4" type="video/mp4" />
        <source src={auvScrollCinematic} type="video/mp4" />
      </video>
      {/* High-tech tactical scanline & ambient navy gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020611]/85 via-[#030b1c]/45 to-[#020611]/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#020611_80%)]" />
    </div>
  );
}
