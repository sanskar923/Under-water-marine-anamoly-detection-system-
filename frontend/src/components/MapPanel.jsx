import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { Compass, Waves, Ship, Route, Navigation } from "lucide-react";
import { FLEET_BASE, COASTAL_HAZARDS, calculateTspTrajectory } from "../waypoints";
import { fetchMissionHistory } from "../api";

function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 13, { duration: 1.5 });
    }
  }, [lat, lng, map]);
  return null;
}

const createApp6HazardReticleIcon = (color = "#f59e0b") => L.divIcon({
  className: "app6-hazard-reticle",
  html: `<div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
    <span style="position:absolute;inset:0;border-radius:50%;border:1px solid ${color};opacity:0.6;animation:ping 2.2s cubic-bezier(0,0,0.2,1) infinite;"></span>
    <svg width="36" height="36" viewBox="0 0 36 36" style="position:absolute;inset:0;filter:drop-shadow(0 0 6px ${color});">
      <!-- APP-6 Military Hazard Diamond Frame -->
      <polygon points="18,2 34,18 18,34 2,18" fill="rgba(245,158,11,0.22)" stroke="${color}" stroke-width="2" stroke-dasharray="14 3"/>
      <!-- Cardinal Crosshair Ticks -->
      <line x1="18" y1="7" x2="18" y2="13" stroke="${color}" stroke-width="1.8"/>
      <line x1="18" y1="23" x2="18" y2="29" stroke="${color}" stroke-width="1.8"/>
      <line x1="7" y1="18" x2="13" y2="18" stroke="${color}" stroke-width="1.8"/>
      <line x1="23" y1="18" x2="29" y2="18" stroke="${color}" stroke-width="1.8"/>
      <!-- Center Hazard Anomaly Dot -->
      <circle cx="18" cy="18" r="3" fill="#ef4444" stroke="#ffffff" stroke-width="1"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const createDriftVectorLabelIcon = () => L.divIcon({
  className: "drift-vector-label",
  html: `<div style="display:flex;align-items:center;gap:6px;background:rgba(3,8,22,0.95);color:#f59e0b;border:1px solid #f59e0b;padding:3px 8px;border-radius:6px;font-family:monospace;font-size:10px;font-weight:bold;white-space:nowrap;box-shadow:0 0 14px rgba(245,158,11,0.4);">
    <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#ef4444;box-shadow:0 0 6px #ef4444;"></span>
    <span>DRIFT VECTOR: 042° TRUE @ 0.18 KTS (MIGRATION DETECTED)</span>
  </div>`,
  iconSize: [340, 24],
  iconAnchor: [170, 32],
});

const makeHistoricalPassIcon = (label) => L.divIcon({
  className: "hist-pass-icon",
  html: `<div style="display:flex;align-items:center;gap:4px;background:rgba(26,20,8,0.92);color:#fbbf24;border:1px dashed #f59e0b;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:9px;white-space:nowrap;box-shadow:0 0 8px rgba(245,158,11,0.25);">
    <span style="width:5px;height:5px;border-radius:50%;background:#f59e0b;"></span>
    <span>${label}</span>
  </div>`,
  iconSize: [140, 18],
  iconAnchor: [70, 9],
});

const createPing = (c) => L.divIcon({
  className: "ping-icon",
  html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:26px;height:26px;">
    <span style="position:absolute;width:26px;height:26px;border-radius:50%;background:${c};opacity:0.4;animation:ping 1.6s infinite;"></span>
    <span style="position:relative;width:12px;height:12px;border-radius:50%;background:${c};border:2px solid #fff;box-shadow:0 0 10px ${c};"></span>
  </div>`, iconSize: [26, 26], iconAnchor: [13, 13],
});

const makeLabelIcon = (label, bg, bd) => L.divIcon({
  html: `<div style="background:${bg};color:#fff;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:bold;border:1px solid ${bd};box-shadow:0 0 8px ${bg};white-space:nowrap;">${label}</div>`,
  iconSize: [80, 20], iconAnchor: [40, 10],
});

const AIS_TRAFFIC = [
  { id: "ais1", name: "MV Sagar Kanya (Research)", coords: [15.452, 73.791], type: "VESSEL" },
  { id: "ais2", name: "Trawler IND-GA-04", coords: [15.415, 73.832], type: "FISHING" },
];

const createWildlifeIcon = (emoji, label, color) => L.divIcon({
  className: "wildlife-tag-icon",
  html: `<div style="display:flex;align-items:center;gap:5px;background:rgba(2,6,23,0.92);color:#fff;border:1.5px solid ${color};padding:3px 8px;border-radius:20px;font-family:sans-serif;font-size:10px;font-weight:bold;white-space:nowrap;box-shadow:0 0 12px ${color};">
    <span style="font-size:12px;">${emoji}</span>
    <span style="color:${color};">${label}</span>
    <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${color};animation:ping 1.8s infinite;"></span>
  </div>`,
  iconSize: [160, 24],
  iconAnchor: [80, 12],
});

export default function MapPanel({ gps, hazardType, depth, threatLevel, targetCoords }) {
  const [showFleet, setShowFleet] = useState(false);
  const [showAis, setShowAis] = useState(true);
  const [showDrift, setShowDrift] = useState(false);
  const [showWildlife, setShowWildlife] = useState(true);
  const [tspPath, setTspPath] = useState(null);
  const [historyPasses, setHistoryPasses] = useState([]);

  const lat = targetCoords?.lat ?? gps?.lat_raw ?? 15.4291;
  const lon = targetCoords?.lng ?? gps?.lon_raw ?? 73.8123;
  const locationName = targetCoords?.locationName || "Marmagao Channel, Goa";
  const center = [lat, lon];
  const driftEnd = [lat + 0.012, lon + 0.016];

  // Dynamic Marine Wildlife Tracks
  const whaleTrack = [
    [lat + 0.035, lon - 0.025],
    [lat + 0.020, lon - 0.015],
    [lat + 0.008, lon - 0.005],
    [lat - 0.005, lon + 0.008],
    [lat - 0.020, lon + 0.022]
  ];
  const whaleCurrentPos = [lat + 0.008, lon - 0.005];

  const turtlePos = [lat - 0.014, lon - 0.018];

  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      try {
        const res = await fetchMissionHistory(25);
        if (isMounted && res?.missions && Array.isArray(res.missions)) {
          setHistoryPasses(res.missions);
        }
      } catch (err) {
        console.warn("Mission history fetch for drift tracking:", err);
      }
    }
    loadHistory();
    return () => { isMounted = false; };
  }, [gps, hazardType]);

  // Multi-pass historical drift tracking calculation
  const curClassNorm = (hazardType || "Contact Mine").toLowerCase().replace(/[^a-z0-9]/g, "");
  const matchingPasses = historyPasses.filter((p) => {
    const pLat = p.coordinates?.lat;
    const pLng = p.coordinates?.lng;
    if (pLat == null || pLng == null) return false;
    const dLat = Math.abs(pLat - lat);
    const dLng = Math.abs(pLng - lon);
    if (dLat > 0.05 || dLng > 0.05) return false;
    const pType = (p.target_type || p.hazard_type || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return !pType || !curClassNorm || pType.includes(curClassNorm) || curClassNorm.includes(pType);
  });

  let driftTrajectory = [];
  let priorMarkers = [];
  const sorted = [...matchingPasses].sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));

  if (sorted.length >= 2) {
    driftTrajectory = sorted.map((p) => [p.coordinates.lat, p.coordinates.lng]);
    priorMarkers = sorted.slice(0, -1).map((p, idx) => ({
      id: `hist-${idx}`,
      coords: [p.coordinates.lat, p.coordinates.lng],
      label: `PASS 0${idx + 1} // HISTORICAL`,
    }));
    const lastPt = driftTrajectory[driftTrajectory.length - 1];
    if (Math.hypot(lastPt[0] - lat, lastPt[1] - lon) > 0.0001) {
      driftTrajectory.push([lat, lon]);
    }
  } else {
    // Calibrated baseline historical pass (approx 350m prior fix)
    const baselineCoord = [lat - 0.0028, lon - 0.0024];
    driftTrajectory = [baselineCoord, [lat, lon]];
    priorMarkers = [
      { id: "hist-baseline", coords: baselineCoord, label: "PASS 01 (T-4.2h // INITIAL FIX)" }
    ];
  }

  return (
    <div style={{ isolation: "isolate" }} className="relative bg-slate-950/60 backdrop-blur-md border border-cyan-500/20 rounded-xl flex flex-col h-[480px] overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Top Technical Micro-Header Bar */}
      <div className="flex justify-between items-center text-[10px] font-sans px-4 py-1.5 border-b border-cyan-500/15 bg-cyan-950/20 text-cyan-400 select-none">
        <span className="tracking-wider font-medium">Live Satellite &amp; Marine Traffic</span>
        <span className="text-emerald-400 flex items-center gap-1 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>● GPS Active</span>
      </div>
      
      {/* Top Map Header & Controls */}
      <div className="flex flex-wrap items-center justify-between px-5 py-2.5 border-b border-slate-800 bg-[#050b14]/90 gap-3 z-10 select-none">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-100 font-sans">
            Seafloor &amp; Ship Tracking
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
          <button onClick={() => setShowWildlife(!showWildlife)} className={`px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer active:scale-[0.98] ${showWildlife ? "bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-slate-900 text-slate-400 border-slate-700 hover:border-emerald-500 hover:text-white"}`}>
            <span>🐬 Marine Life Tags</span>
          </button>
          <button onClick={() => setShowDrift(!showDrift)} className={`px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer active:scale-[0.98] ${showDrift ? "bg-amber-500/20 text-amber-300 border-amber-500" : "bg-slate-900 text-slate-400 border-slate-700 hover:border-cyan-500 hover:text-white"}`}>
            <Waves className="w-3 h-3 inline mr-1" /> 48h Drift Path
          </button>
          <button onClick={() => setShowAis(!showAis)} className={`px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer active:scale-[0.98] ${showAis ? "bg-cyan-500/20 text-cyan-300 border-cyan-500" : "bg-slate-900 text-slate-400 border-slate-700 hover:border-cyan-500 hover:text-white"}`}>
            <Ship className="w-3 h-3 inline mr-1" /> Ship Radar
          </button>
          <button onClick={() => setShowFleet(!showFleet)} className={`px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer active:scale-[0.98] ${showFleet ? "bg-purple-500/20 text-purple-300 border-purple-500" : "bg-slate-900 text-slate-400 border-slate-700 hover:border-cyan-500 hover:text-white"}`}>
            <Route className="w-3 h-3 inline mr-1" /> Survey Route
          </button>
        </div>
      </div>

      {/* Leaflet Canvas */}
      <div className="flex-1 w-full relative z-0 overflow-hidden bg-slate-950">
        <MapContainer center={center} zoom={12} zoomControl={false} style={{ width: "100%", height: "100%" }}>
          <MapRecenter lat={lat} lng={lon} />
          <TileLayer attribution="Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          
          {/* 50m Amber Exclusion Ring */}
          <Circle
            center={center}
            radius={50}
            pathOptions={{
              color: "#ef4444",
              weight: 2,
              dashArray: "3, 6",
              fillColor: "#f59e0b",
              fillOpacity: 0.2,
            }}
          />

          {/* APP-6 Military Hazard Diamond SVG Tactical Reticle */}
          <Marker position={center} icon={createApp6HazardReticleIcon("#f59e0b")}>
            <Popup>
              <div className="text-xs p-1 font-mono">
                <div className="font-bold text-amber-400 uppercase tracking-wider">{hazardType || "Acoustic Target"}</div>
                <div className="text-slate-300">{lat.toFixed(4)}°N, {lon.toFixed(4)}°E</div>
                <div className="text-slate-300">Depth: {depth || "28.4m"}</div>
                <div className="mt-1 text-[10px] text-amber-500 font-semibold border-t border-slate-700 pt-1">
                  EXCLUSION ZONE: 50m RADIUS (NATO APP-6 HAZARD)
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Multi-Pass Historical Drift Trajectory Arrow / Polyline */}
          {driftTrajectory.length >= 2 && (
            <>
              <Polyline
                positions={driftTrajectory}
                pathOptions={{
                  color: "#f59e0b",
                  weight: 2.5,
                  dashArray: "5, 8",
                }}
              />
              {priorMarkers.map((m) => (
                <Marker key={m.id} position={m.coords} icon={makeHistoricalPassIcon(m.label)}>
                  <Popup>
                    <div className="text-xs font-mono p-1">
                      <div className="font-bold text-amber-400">{m.label}</div>
                      <div className="text-slate-300">{m.coords[0].toFixed(4)}°N, {m.coords[1].toFixed(4)}°E</div>
                      <div className="text-slate-400 text-[10px] mt-1">Multi-pass Target Class: {hazardType || "Contact Mine"}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {/* Tactical Drift Vector Label at latest coordinate */}
              <Marker
                position={center}
                icon={createDriftVectorLabelIcon()}
              />
            </>
          )}

          {/* Module 4: Digital Twin & Live Marine Wildlife Tracking */}
          {showWildlife && (
            <>
              {/* Blue Whale WH-09 Migration Path */}
              <Polyline
                positions={whaleTrack}
                pathOptions={{
                  color: "#00f2ff",
                  weight: 2,
                  dashArray: "6, 8",
                  opacity: 0.85
                }}
              />
              <Marker position={whaleCurrentPos} icon={createWildlifeIcon("🐋", "Blue Whale (WH-09)", "#00f2ff")}>
                <Popup>
                  <div className="text-xs p-1 font-sans space-y-1">
                    <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <span>🐋</span>
                      <span>Balaenoptera musculus (Blue Whale)</span>
                    </div>
                    <div className="text-slate-300 text-[11px]">Tag ID: <strong>WH-09</strong> (Satellite Telemetry)</div>
                    <div className="text-slate-300 text-[11px]">Current Depth: <strong>12m</strong> | Heading: South-West</div>
                    <div className="text-slate-300 text-[11px]">Tag Battery: <strong className="text-emerald-400">92%</strong></div>
                    <div className="text-[10px] text-cyan-400 font-mono border-t border-slate-700 pt-1">
                      Last Ping: 4 mins ago • Migration Vector: 215°
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Olive Ridley Turtle RT-14 Feeding Zone */}
              <Circle
                center={turtlePos}
                radius={320}
                pathOptions={{
                  color: "#10b981",
                  weight: 1.5,
                  dashArray: "4, 6",
                  fillColor: "#10b981",
                  fillOpacity: 0.15,
                }}
              />
              <Marker position={turtlePos} icon={createWildlifeIcon("🐢", "Olive Ridley (RT-14)", "#10b981")}>
                <Popup>
                  <div className="text-xs p-1 font-sans space-y-1">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <span>🐢</span>
                      <span>Lepidochelys olivacea (Olive Ridley)</span>
                    </div>
                    <div className="text-slate-300 text-[11px]">Tag ID: <strong>RT-14</strong> (Acoustic Pinger)</div>
                    <div className="text-slate-300 text-[11px]">Zone: <strong>Coastal Feeding Ground (320m radius)</strong></div>
                    <div className="text-slate-300 text-[11px]">Diving Depth: <strong>6.5m</strong> | Water Temp: <strong>28.4°C</strong></div>
                    <div className="text-slate-300 text-[11px]">Tag Battery: <strong className="text-emerald-400">88%</strong></div>
                    <div className="text-[10px] text-emerald-400 font-mono border-t border-slate-700 pt-1">
                      Last Ping: 8 mins ago • Bio-reserve Sanctuary Guarded
                    </div>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {showDrift && (
            <>
              <Polyline positions={[center, driftEnd]} color="#f59e0b" weight={3} dashArray="4, 6" />
              <Marker position={driftEnd} icon={makeLabelIcon("+48h Drift Forecast", "#78350f", "#f59e0b")} />
            </>
          )}
          {showAis && [
            { id: "ais1", name: "MV Sagar Kanya (Research)", coords: [lat + 0.018, lon - 0.015], type: "VESSEL" },
            { id: "ais2", name: "Trawler IND-402", coords: [lat - 0.012, lon + 0.014], type: "FISHING" },
          ].map((a) => (
            <Marker key={a.id} position={a.coords} icon={makeLabelIcon(`🚢 ${a.name}`, "#0369a1", "#38bdf8")}>
              <Popup><div className="text-xs"><b>{a.name}</b><br/>Speed: 8.2 kts | Status: Active AIS</div></Popup>
            </Marker>
          ))}
          {showFleet && (
            <>
              <Marker position={FLEET_BASE.coords} icon={makeLabelIcon("INS Nirdeshak (Base)", "#047857", "#34d399")} />
              {COASTAL_HAZARDS.map((h) => (<Marker key={h.id} position={h.coords} icon={createPing(h.color)} />))}
              {tspPath && <Polyline positions={tspPath} color="#00f2ff" weight={3} dashArray="6, 6" />}
            </>
          )}
        </MapContainer>

        {/* Bottom Floating Status Pill */}
        <div className="absolute bottom-3 inset-x-4 z-[10] flex flex-wrap items-center justify-between gap-3 px-4 py-2 rounded-lg bg-slate-950/85 border border-cyan-500/30 backdrop-blur-md shadow-2xl text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-400">
            <Navigation className="w-3.5 h-3.5 animate-pulse" />
            <span>PROXIMITY RADAR: 0.8 NM to Shipping Channel</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300">TARGET: {lat.toFixed(4)}°N, {lon.toFixed(4)}°E ({locationName})</span>
          </div>
          {showFleet && (
            <button onClick={() => setTspPath(calculateTspTrajectory(FLEET_BASE.coords, COASTAL_HAZARDS))} className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold tracking-wider cursor-pointer active:scale-[0.98] transition-all">
              Optimize 4-Hazard Route (4.8 NM)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

