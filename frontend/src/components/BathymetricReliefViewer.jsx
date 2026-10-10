import React, { useRef, useEffect, useState } from "react";
import { Layers, RotateCw } from "lucide-react";

export default function BathymetricReliefViewer({ imageSrc, detection }) {
  const canvasRef = useRef(null);
  const [elevation, setElevation] = useState(45);
  const [rotation, setRotation] = useState(25);
  const dragRef = useRef({ dragging: false, startX: 0, startRot: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const cols = 26, rows = 18;
    const heights = Array.from({ length: rows }, () => new Float32Array(cols));

    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const off = document.createElement("canvas");
        off.width = cols; off.height = rows;
        const oCtx = off.getContext("2d");
        oCtx.drawImage(img, 0, 0, cols, rows);
        const data = oCtx.getImageData(0, 0, cols, rows).data;
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const idx = (y * cols + x) * 4;
            const b = data[idx] * 0.3 + data[idx + 1] * 0.59 + data[idx + 2] * 0.11;
            heights[y][x] = ((b - 45) / 210) * elevation;
          }
        }
      };
      img.src = imageSrc;
    }

    let t = 0;
    const render = () => {
      t += 0.035;
      canvas.width = 720; canvas.height = 460;
      ctx.fillStyle = "#030712"; ctx.fillRect(0, 0, canvas.width, canvas.height);

      const rad = (rotation * Math.PI) / 180;
      const cosR = Math.cos(rad), sinR = Math.sin(rad);
      const originX = canvas.width / 2, originY = canvas.height * 0.72;
      const scanX = ((Math.sin(t * 1.5) + 1) / 2) * cols;
      const pts = [];

      for (let y = 0; y < rows; y++) {
        pts[y] = [];
        for (let x = 0; x < cols; x++) {
          const ripple = Math.sin(t * 2 + x * 0.35 + y * 0.45) * 4;
          const z = heights[y][x] + ripple;
          const cx = (x - cols / 2) * 15, cy = (y - rows / 2) * 12;
          const rx = cx * cosR - cy * sinR;
          const ry = (cx * sinR + cy * cosR) * 0.55;
          pts[y][x] = { px: originX + rx, py: originY + ry - z, z, isScan: Math.abs(x - scanX) < 1.4 };
        }
      }

      for (let y = 0; y < rows - 1; y++) {
        for (let x = 0; x < cols - 1; x++) {
          const p1 = pts[y][x], p2 = pts[y][x + 1], p3 = pts[y + 1][x + 1], p4 = pts[y + 1][x];
          const avgZ = (p1.z + p2.z + p3.z + p4.z) / 4;
          const isScanned = p1.isScan || p2.isScan;

          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py); ctx.lineTo(p3.px, p3.py); ctx.lineTo(p4.px, p4.py);
          ctx.closePath();

          if (isScanned) {
            ctx.fillStyle = "rgba(0, 242, 255, 0.4)"; ctx.strokeStyle = "#a5f3fc"; ctx.lineWidth = 2;
          } else if (avgZ > 14) {
            ctx.fillStyle = `rgba(0, 242, 255, ${0.18 + Math.sin(t * 4) * 0.08})`;
            ctx.strokeStyle = "#00f2ff"; ctx.lineWidth = 1.6;
          } else if (avgZ < -2) {
            ctx.fillStyle = "rgba(99, 102, 241, 0.2)"; ctx.strokeStyle = "#6366f1"; ctx.lineWidth = 1;
          } else {
            ctx.fillStyle = "rgba(13, 148, 136, 0.12)"; ctx.strokeStyle = "#0d9488"; ctx.lineWidth = 0.8;
          }
          ctx.fill(); ctx.stroke();
        }
      }

      ctx.fillStyle = "#67e8f9"; ctx.font = "bold 10px monospace";
      ctx.fillText(`REAL-TIME 3D SONAR LASER SWEEP [CHIRP 455kHz]  |  ROTATION: ${rotation}°  |  DRAG TO ROTATE`, 16, 22);
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [imageSrc, elevation, rotation]);

  const onDown = (e) => { dragRef.current = { dragging: true, startX: e.clientX, startRot: rotation }; };
  const onMove = (e) => {
    if (!dragRef.current.dragging) return;
    const delta = (e.clientX - dragRef.current.startX) * 0.4;
    setRotation(Math.max(-75, Math.min(75, Math.round(dragRef.current.startRot + delta))));
  };
  const onUp = () => { dragRef.current.dragging = false; };

  return (
    <div className="w-full h-full flex flex-col relative select-none">
      <div className="flex-1 flex items-center justify-center p-2 relative cursor-grab active:cursor-grabbing" onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}>
        <canvas ref={canvasRef} className="w-full h-full max-h-[460px] object-contain rounded border border-cyan-900/40 shadow-2xl" />
      </div>
      <div className="px-4 py-2 bg-[#060e1a] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-cyan-300">
          <Layers className="w-3.5 h-3.5" />
          <span className="font-semibold">Relief Elevation:</span>
          <input type="range" min="15" max="85" value={elevation} onChange={(e) => setElevation(Number(e.target.value))} className="w-24 accent-cyan-400 cursor-pointer" />
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold">Azimuth:</span>
          <input type="range" min="-70" max="70" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-24 accent-cyan-400 cursor-pointer" />
        </div>
        <span className="text-[10px] font-mono text-cyan-400">Peak Relief: {detection?.acoustic_shadow?.estimated_relief_m || "1.85"}m</span>
      </div>
    </div>
  );
}
