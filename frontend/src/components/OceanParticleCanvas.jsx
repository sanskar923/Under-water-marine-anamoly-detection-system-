import React, { useRef, useEffect } from "react";

export default function OceanParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Bioluminescent floating caustics particles
    const caustics = Array.from({ length: 45 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2.2 + 0.8,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    let t = 0;
    const render = () => {
      t += 0.025;
      const w = canvas.width, h = canvas.height;
      ctx.fillStyle = "#070e1b";
      ctx.fillRect(0, 0, w, h);

      // Radial sonar pulse rings radiating outwards
      for (let r = 1; r <= 3; r++) {
        const rad = ((t * 80 + r * 140) % (Math.min(w, h) * 0.65));
        const alpha = Math.max(0, 0.25 - rad / (Math.min(w, h) * 0.65));
        ctx.beginPath();
        ctx.arc(w * 0.35, h * 0.55, rad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 242, 255, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 3D Undulating oceanic particle waves
      const cols = 36, rows = 22;
      const fov = 400;
      const originX = w * 0.38, originY = h * 0.58;

      for (let iz = 0; iz < rows; iz++) {
        for (let ix = 0; ix < cols; ix++) {
          const x3 = (ix - cols / 2) * 42;
          const z3 = (iz + 4) * 36;
          const y3 = Math.sin(t * 1.8 + ix * 0.25) * 26 + Math.cos(t * 1.4 + iz * 0.3) * 20;

          const scale = fov / (fov + z3);
          const px = originX + x3 * scale;
          const py = originY + (y3 + 120) * scale;
          const pSize = Math.max(1, (2.8 - (z3 / 800) * 1.8));

          const bright = Math.sin(t * 3 + ix * 0.2 + iz * 0.3) * 0.25 + 0.6;
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 242, 255, ${Math.max(0.1, bright * (1 - z3 / 900))})`;
          ctx.fill();
        }
      }

      // Drift floating caustics
      for (const p of caustics) {
        p.x = (p.x + p.vx + w) % w;
        p.y = (p.y + p.vy + h) % h;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(103, 232, 249, ${p.alpha * (0.6 + Math.sin(t * 2 + p.x) * 0.4)})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />;
}
