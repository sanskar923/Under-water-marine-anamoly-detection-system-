import React, { useRef, useEffect, useState, useId } from "react";

/**
 * InteractiveGlitchText
 * 
 * Pure HTML5 Canvas2D implementation of cursor-reactive glitch typography.
 * Features:
 * - High-DPI / Retina display support via devicePixelRatio
 * - Offscreen rasterization buffer for 60fps throughput
 * - Smooth lerp mouse tracking & <120px proximity detection
 * - Red/Cyan chromatic aberration (RGB channel split)
 * - Horizontal scanline slice displacement with magnetic attraction & spring damping
 * - Idle acoustic telemetry ping flicker every ~4 seconds
 */
export default function InteractiveGlitchText({
  text = "ACOUSTIC BATHYMETRY",
  subtitle = "& SUBSEA HAZARD SURVEY",
  className = "",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const uniqueId = useId();

  // Mouse & physics state in refs for 60fps render loop
  const physicsRef = useRef({
    mouseX: -9999,
    mouseY: -9999,
    lerpX: -9999,
    lerpY: -9999,
    isNearby: false,
    frameCount: 0,
    slices: [],
  });

  const [dims, setDims] = useState({ width: 680, height: 130 });

  // Update container dimensions on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(Math.floor(rect.width), 280);
      // Determine appropriate height based on subtitle and aspect ratio
      const h = subtitle ? Math.max(Math.floor(w * 0.22), 110) : Math.max(Math.floor(w * 0.15), 70);
      setDims({ width: w, height: h });
    };

    updateDimensions();

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(container);
    } else {
      window.addEventListener("resize", updateDimensions);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, [subtitle]);

  // Main Canvas Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dims.width <= 0 || dims.height <= 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = dims.width;
    const h = dims.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    // 1. Prepare Offscreen Text Buffers
    const offscreen = document.createElement("canvas");
    offscreen.width = w * dpr;
    offscreen.height = h * dpr;
    const octx = offscreen.getContext("2d");
    octx.scale(dpr, dpr);

    const paddingX = 2;
    const availableWidth = w - paddingX * 2;

    // Calculate font sizes
    let fontSize1 = Math.min(Math.floor(availableWidth / (text.length * 0.56)), 52);
    fontSize1 = Math.max(fontSize1, 19);
    octx.font = `900 ${fontSize1}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
    while (octx.measureText(text.toUpperCase()).width > availableWidth && fontSize1 > 16) {
      fontSize1 -= 1;
      octx.font = `900 ${fontSize1}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
    }

    let fontSize2 = subtitle ? Math.min(Math.floor(fontSize1 * 0.88), 44) : 0;
    if (subtitle) {
      octx.font = `900 ${fontSize2}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
      while (octx.measureText(subtitle.toUpperCase()).width > availableWidth && fontSize2 > 14) {
        fontSize2 -= 1;
        octx.font = `900 ${fontSize2}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
      }
    }

    const lineHeight1 = fontSize1 * 1.12;
    const lineHeight2 = fontSize2 * 1.12;
    const totalContentHeight = lineHeight1 + (subtitle ? lineHeight2 + 4 : 0);
    const startY = Math.max((h - totalContentHeight) / 2 + fontSize1 * 0.82, fontSize1 * 0.88);

    // Rasterize Title Line (White to Cyan Gradient)
    octx.font = `900 ${fontSize1}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
    octx.textBaseline = "alphabetic";
    octx.textAlign = "left";

    const grad1 = octx.createLinearGradient(0, startY - fontSize1, availableWidth, startY);
    grad1.addColorStop(0, "#ffffff");
    grad1.addColorStop(0.5, "#f0f9ff");
    grad1.addColorStop(1, "#38bdf8");
    octx.fillStyle = grad1;
    octx.shadowColor = "rgba(0, 242, 255, 0.45)";
    octx.shadowBlur = 18;
    octx.fillText(text.toUpperCase(), paddingX, startY);
    octx.shadowBlur = 0;

    // Rasterize Subtitle Line (Cyan to Teal Gradient)
    if (subtitle) {
      const subY = startY + lineHeight2 + 4;
      octx.font = `900 ${fontSize2}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
      const grad2 = octx.createLinearGradient(0, subY - fontSize2, availableWidth, subY);
      grad2.addColorStop(0, "#38bdf8");
      grad2.addColorStop(0.5, "#22d3ee");
      grad2.addColorStop(1, "#5eead4");
      octx.fillStyle = grad2;
      octx.shadowColor = "rgba(34, 211, 238, 0.35)";
      octx.shadowBlur = 14;
      octx.fillText(subtitle.toUpperCase(), paddingX, subY);
      octx.shadowBlur = 0;
    }

    // Create Red Channel Chromatic Buffer
    const redCanvas = document.createElement("canvas");
    redCanvas.width = offscreen.width;
    redCanvas.height = offscreen.height;
    const rctx = redCanvas.getContext("2d");
    rctx.drawImage(offscreen, 0, 0);
    rctx.globalCompositeOperation = "source-in";
    rctx.fillStyle = "#f43f5e";
    rctx.fillRect(0, 0, redCanvas.width, redCanvas.height);

    // Create Cyan Channel Chromatic Buffer
    const cyanCanvas = document.createElement("canvas");
    cyanCanvas.width = offscreen.width;
    cyanCanvas.height = offscreen.height;
    const cctx = cyanCanvas.getContext("2d");
    cctx.drawImage(offscreen, 0, 0);
    cctx.globalCompositeOperation = "source-in";
    cctx.fillStyle = "#00f2ff";
    cctx.fillRect(0, 0, cyanCanvas.width, cyanCanvas.height);

    // Initialize Horizontal Slices
    const NUM_SLICES = 16;
    const sliceHeight = h / NUM_SLICES;
    physicsRef.current.slices = Array.from({ length: NUM_SLICES }, () => ({
      currentOffset: 0,
      targetOffset: 0,
    }));

    // Mouse Tracking Event Handlers
    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      physicsRef.current.mouseX = mx;
      physicsRef.current.mouseY = my;

      // Proximity threshold check (< 120px outside canvas edges)
      const insideBox = mx >= -120 && mx <= w + 120 && my >= -120 && my <= h + 120;
      physicsRef.current.isNearby = insideBox;
    };

    const handlePointerLeave = () => {
      physicsRef.current.isNearby = false;
      physicsRef.current.mouseX = -9999;
      physicsRef.current.mouseY = -9999;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    // Animation Render Loop (60 FPS)
    const render = () => {
      const phys = physicsRef.current;
      phys.frameCount += 1;

      // Smooth lerp interpolation for cursor coordinates
      if (phys.isNearby && phys.mouseX !== -9999) {
        if (phys.lerpX === -9999) {
          phys.lerpX = phys.mouseX;
          phys.lerpY = phys.mouseY;
        } else {
          phys.lerpX += (phys.mouseX - phys.lerpX) * 0.1;
          phys.lerpY += (phys.mouseY - phys.lerpY) * 0.1;
        }
      } else {
        phys.lerpX += (-9999 - phys.lerpX) * 0.1;
        phys.lerpY += (-9999 - phys.lerpY) * 0.1;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Acoustic ping: 1 frame every 4 seconds (approx 240 frames @ 60fps)
      const isPeriodicAcousticPing = phys.frameCount % 240 === 0;

      // Render each horizontal slice
      for (let i = 0; i < NUM_SLICES; i++) {
        const slice = phys.slices[i];
        const sliceY = i * sliceHeight;
        const sliceCenterY = sliceY + sliceHeight / 2;

        let proximity = 0;
        if (phys.isNearby && phys.lerpX !== -9999) {
          const dy = Math.abs(phys.lerpY - sliceCenterY);
          const dx = Math.abs(phys.lerpX - w / 2);
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            proximity = (120 - dist) / 120;
          }
        }

        // Behavior when cursor enters proximity (< 120px)
        if (proximity > 0) {
          // Sticky magnetic attraction towards cursor X with subtle spring dampening
          const pullTowardsCursor = (phys.lerpX - w / 2) * 0.08 * proximity;
          const scanlineJitter = Math.sin(phys.frameCount * 0.4 + i * 1.5) * 3 * proximity;
          const randomJitter = Math.random() < 0.25 * proximity ? (Math.random() - 0.5) * 8 * proximity : 0;
          slice.targetOffset = pullTowardsCursor + scanlineJitter + randomJitter;
        } else if (isPeriodicAcousticPing) {
          // Subtle acoustic pulse flicker along Y axis
          const pingWave = Math.sin(i * 0.8) * 4;
          slice.targetOffset = pingWave;
        } else {
          // Idle state: clean return to 0
          slice.targetOffset = 0;
        }

        // Spring dampening physics: target interpolation + friction
        slice.currentOffset += (slice.targetOffset - slice.currentOffset) * 0.18;
        slice.currentOffset *= 0.92;

        // Chromatic aberration split (3-6px offset in proximity)
        let chromaOffset = 0;
        if (proximity > 0) {
          chromaOffset = 3 + proximity * 3 + (Math.random() < 0.2 ? (Math.random() - 0.5) * 2 : 0);
        } else if (isPeriodicAcousticPing) {
          chromaOffset = 2.5;
        }

        const sy = i * sliceHeight * dpr;
        const sh = sliceHeight * dpr;
        const dy = i * sliceHeight * dpr;
        const dh = sliceHeight * dpr;
        const offsetX = slice.currentOffset * dpr;
        const shift = chromaOffset * dpr;

        if (chromaOffset > 0.5) {
          // RGB split: Red shifted left, Cyan shifted right
          ctx.globalCompositeOperation = "screen";

          ctx.drawImage(
            redCanvas,
            0, sy, offscreen.width, sh,
            offsetX - shift, dy, offscreen.width, dh
          );

          ctx.drawImage(
            cyanCanvas,
            0, sy, offscreen.width, sh,
            offsetX + shift, dy, offscreen.width, dh
          );

          ctx.drawImage(
            offscreen,
            0, sy, offscreen.width, sh,
            offsetX, dy, offscreen.width, dh
          );

          ctx.globalCompositeOperation = "source-over";
        } else {
          // Clean crystal-sharp typography
          ctx.drawImage(
            offscreen,
            0, sy, offscreen.width, sh,
            offsetX, dy, offscreen.width, dh
          );
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [dims, text, subtitle]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-visible select-none cursor-default ${className}`}
      style={{ minHeight: dims.height }}
    >
      {/* Hidden semantic element for accessibility and screen readers */}
      <h1 className="sr-only">
        {text} {subtitle}
      </h1>

      {/* Reactive Canvas */}
      <canvas
        ref={canvasRef}
        className="block pointer-events-auto"
        aria-hidden="true"
      />
    </div>
  );
}
