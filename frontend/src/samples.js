// Realistic side-scan sonar SVG mock image generators
const createSonarSvg = (type) => {
  const bgRipples = Array.from({ length: 12 }, (_, i) => 
    `<path d="M 0 ${30 + i * 28} Q 130 ${20 + i * 28} 256 ${30 + i * 28} T 512 ${30 + i * 28}" stroke="#0b1e36" stroke-width="2" fill="none" opacity="0.6"/>`
  ).join("");

  let content = "";
  if (type === "ghost_net") {
    content = `
      <!-- Acoustic Shadow -->
      <path d="M 180 170 Q 240 180 320 185 L 340 260 Q 230 250 170 240 Z" fill="#020408" opacity="0.95" />
      <text x="210" y="225" fill="#3a516e" font-size="10" font-family="monospace">ACOUSTIC SHADOW ZONE</text>
      <!-- Ghost Net Filament Acoustic Highlights -->
      <g stroke="#00f2ff" stroke-width="1.8" opacity="0.9">
        <path d="M 160 140 Q 200 120 230 150 T 280 160" fill="none"/>
        <path d="M 150 160 Q 190 180 240 140 T 270 175" fill="none"/>
        <path d="M 180 130 L 220 190 M 210 135 L 260 170 M 170 165 L 245 155" />
        <circle cx="210" cy="155" r="18" fill="#ffeeaa" opacity="0.8" filter="drop-shadow(0 0 8px #00f2ff)"/>
      </g>`;
  } else if (type === "sunken_pipe") {
    content = `
      <!-- Acoustic Shadow -->
      <polygon points="190,175 380,225 365,275 180,215" fill="#010306" opacity="0.96"/>
      <text x="220" y="240" fill="#3a516e" font-size="10" font-family="monospace">SHADOW RELIEF: 3.4m</text>
      <!-- Specular Cylindrical Pipe Reflection -->
      <line x1="160" y1="150" x2="350" y2="200" stroke="#00ff88" stroke-width="7" stroke-linecap="round"/>
      <line x1="162" y1="149" x2="348" y2="199" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>`;
  } else if (type === "wreck") {
    content = `
      <!-- Acoustic Shadow -->
      <polygon points="140,165 370,195 400,270 120,240" fill="#010306" opacity="0.96"/>
      <text x="210" y="235" fill="#3a516e" font-size="10" font-family="monospace">HULL COLLAPSE SHADOW: 4.8m</text>
      <!-- Sunken Vessel Hull & Keel Highlights -->
      <polygon points="135,140 280,130 360,170 310,190 145,175" fill="none" stroke="#00f2ff" stroke-width="2.5"/>
      <line x1="160" y1="145" x2="310" y2="165" stroke="#ffffff" stroke-width="2"/>
      <line x1="220" y1="135" x2="220" y2="180" stroke="#f59e0b" stroke-width="2"/>
      <circle cx="280" cy="155" r="12" fill="#ef4444" opacity="0.6" filter="drop-shadow(0 0 6px #ef4444)"/>`;
  } else {
    content = `
      <g stroke="#00f2ff" stroke-width="0.8" opacity="0.25">
        ${Array.from({ length: 8 }, (_, i) => `<path d="M 0 ${70 + i * 36} Q 200 ${90 + i * 36} 512 ${70 + i * 36}" fill="none"/>`).join("")}
      </g>
      <text x="175" y="195" fill="#00f2ff" font-size="11" font-family="monospace" opacity="0.5">[NATURAL SEABED BATHYMETRY]</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 384" width="512" height="384">
    <rect width="512" height="384" fill="#040914"/>
    ${bgRipples}
    <line x1="256" y1="0" x2="256" y2="384" stroke="#08182b" stroke-width="12"/>
    ${content}
    <text x="15" y="25" fill="#00f2ff" font-size="11" font-family="sans-serif" font-weight="bold" opacity="0.85">● Live Sonar Feed | Left / Right Scan</text>
  </svg>`;
};

export const SAMPLE_PRESETS = {
  ghost_net: { name: "Ghost Net", svg: createSonarSvg("ghost_net") },
  sunken_pipe: { name: "Sunken Pipe", svg: createSonarSvg("sunken_pipe") },
  wreck: { name: "Shipwreck Debris", svg: createSonarSvg("wreck") },
  seafloor: { name: "Clear Bed", svg: createSonarSvg("seafloor") },
};

export function getSampleDataUrl(id) {
  const preset = SAMPLE_PRESETS[id] || SAMPLE_PRESETS.ghost_net;
  return `data:image/svg+xml;utf8,${encodeURIComponent(preset.svg)}`;
}

export function getSamplePngFile(id) {
  return new Promise((resolve) => {
    const dataUrl = getSampleDataUrl(id);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 384;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        resolve(new File([blob], `${id}.png`, { type: "image/png" }));
      }, "image/png");
    };
    img.onerror = () => {
      fetch(`/samples/${id}.png`)
        .then((r) => r.blob())
        .then((b) => resolve(new File([b], `${id}.png`, { type: "image/png" })))
        .catch(() => resolve(null));
    };
    img.src = dataUrl;
  });
}
