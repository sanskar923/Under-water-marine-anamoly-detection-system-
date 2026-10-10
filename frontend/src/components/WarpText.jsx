import React, { useRef, useEffect } from "react";
import { Renderer, Program, Mesh, Triangle, Texture, Vec2 } from "ogl";
import "./WarpText.css";

const VERTEX_SHADER = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uPointerActive;
uniform float uPointerInfluence;
uniform float uPointerStrength;
uniform float uWarpScale;
uniform float uWarpStrength;
uniform float uRefraction;
uniform float uSpeed;
uniform float uRipple;

varying vec2 vUv;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);

  vec2 delta = (uv - uMouse) * aspect;
  float dist = length(delta);

  vec2 mouseDisp = vec2(0.0);
  if (dist < uPointerInfluence && uPointerActive > 0.001) {
    float influence = smoothstep(uPointerInfluence, 0.0, dist);
    mouseDisp = normalize(delta + vec2(0.0001)) * influence * uPointerStrength * uPointerActive;
  }

  if (uRipple > 0.5 && uPointerActive > 0.001) {
    float wave = sin(dist * 30.0 - uTime * 4.0) * exp(-dist * 5.0);
    mouseDisp += normalize(delta + vec2(0.0001)) * wave * 0.015 * uPointerActive;
  }

  vec2 noiseCoord = uv * uWarpScale + vec2(uTime * uSpeed * 0.1, uTime * uSpeed * 0.15);
  float n1 = snoise(noiseCoord);
  float n2 = snoise(noiseCoord + vec2(4.3, 2.8));
  vec2 ambientWarp = vec2(n1, n2) * uWarpStrength;

  vec2 finalUv = uv + ambientWarp - mouseDisp;

  vec2 rOffset = (ambientWarp - mouseDisp) * (uRefraction * 4.0);
  float r = texture2D(uTexture, finalUv + rOffset).r;
  float g = texture2D(uTexture, finalUv).g;
  float b = texture2D(uTexture, finalUv - rOffset).b;
  float a = texture2D(uTexture, finalUv).a;

  gl_FragColor = vec4(r, g, b, a);
}
`;

export default function WarpText({
  text = "PRECISION SEABED ACOUSTICS\nFOR SUBSEA CLEARANCE",
  color = "#ffffff",
  fontFamily = "system-ui, -apple-system, sans-serif",
  fontSize = "clamp(2.5rem, 5.5vw, 5.5rem)",
  fontWeight = 800,
  letterSpacing = "-0.03em",
  lineHeight = 1.05,
  pointerInfluence = 0.35,
  pointerStrength = 0.32,
  refraction = 0.015,
  ripple = true,
  speed = 0.4,
  warpScale = 1.5,
  warpStrength = 0.06,
  style = {},
  className = "",
}) {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, active: 0, targetActive: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        premultipliedAlpha: true,
      });
    } catch (e) {
      console.warn("WebGL not supported for WarpText:", e);
      return;
    }

    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvas.className = "warp-text-canvas";
    container.appendChild(canvas);

    // Text texture setup
    const textCanvas = document.createElement("canvas");
    const texture = new Texture(gl, { generateMipmaps: false });

    // Fullscreen triangle
    const geometry = new Triangle(gl);

    const resolution = new Vec2();
    const mouse = new Vec2(0.5, 0.5);

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uResolution: { value: resolution },
        uMouse: { value: mouse },
        uPointerActive: { value: 0 },
        uPointerInfluence: { value: pointerInfluence },
        uPointerStrength: { value: pointerStrength },
        uWarpScale: { value: warpScale },
        uWarpStrength: { value: warpStrength },
        uRefraction: { value: refraction },
        uSpeed: { value: speed },
        uRipple: { value: ripple ? 1.0 : 0.0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new Mesh(gl, { geometry, program });

    const getComputedFontSize = (sizeStr, containerWidth) => {
      if (typeof sizeStr === "number") return sizeStr;
      const temp = document.createElement("div");
      temp.style.position = "absolute";
      temp.style.visibility = "hidden";
      temp.style.fontSize = sizeStr;
      temp.style.width = `${containerWidth}px`;
      document.body.appendChild(temp);
      const computed = parseFloat(window.getComputedStyle(temp).fontSize) || 56;
      document.body.removeChild(temp);
      return computed;
    };

    const updateTextTexture = (width, height) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      textCanvas.width = Math.max(1, Math.floor(width * dpr));
      textCanvas.height = Math.max(1, Math.floor(height * dpr));

      const ctx = textCanvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const pxSize = getComputedFontSize(fontSize, width);
      ctx.font = `${fontWeight} ${pxSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      if (letterSpacing && "letterSpacing" in ctx) {
        ctx.letterSpacing = letterSpacing;
      }

      const lines = String(text).split("\n");
      const lineH = pxSize * lineHeight;
      const totalH = lines.length * lineH;
      const startY = Math.max(8, (height - totalH) / 2);

      lines.forEach((line, index) => {
        ctx.fillText(line.trim(), 4, startY + index * lineH);
      });

      texture.image = textCanvas;
      texture.needsUpdate = true;
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.floor(rect.width) || 600;
      const height = Math.floor(rect.height) || 280;

      renderer.setSize(width, height);
      resolution.set(width, height);
      updateTextTexture(width, height);
    };

    resize();

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
    } else {
      window.addEventListener("resize", resize);
    }

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      mouseRef.current.x = Math.max(0, Math.min(1, x));
      mouseRef.current.y = Math.max(0, Math.min(1, y));
      mouseRef.current.targetActive = 1.0;
    };

    const handlePointerEnter = () => {
      mouseRef.current.targetActive = 1.0;
    };

    const handlePointerLeave = () => {
      mouseRef.current.targetActive = 0.0;
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerenter", handlePointerEnter);
    container.addEventListener("pointerleave", handlePointerLeave);

    let animId;
    let lastTime = performance.now();

    const update = (now) => {
      animId = requestAnimationFrame(update);
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Smooth pointer active lerp
      const m = mouseRef.current;
      m.active += (m.targetActive - m.active) * 0.1;

      mouse.x += (m.x - mouse.x) * 0.15;
      mouse.y += (m.y - mouse.y) * 0.15;

      program.uniforms.uTime.value += delta;
      program.uniforms.uPointerActive.value = m.active;
      program.uniforms.uMouse.value = mouse;

      renderer.render({ scene: mesh });
    };

    animId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", resize);
      }
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerenter", handlePointerEnter);
      container.removeEventListener("pointerleave", handlePointerLeave);
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    };
  }, [
    text,
    color,
    fontFamily,
    fontSize,
    fontWeight,
    letterSpacing,
    lineHeight,
    pointerInfluence,
    pointerStrength,
    refraction,
    ripple,
    speed,
    warpScale,
    warpStrength,
  ]);

  return (
    <div
      ref={containerRef}
      className={`warp-text-container ${className}`}
      style={style}
    >
      <span className="sr-only">{text}</span>
    </div>
  );
}
