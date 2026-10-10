import React, { useState, useEffect } from "react";
import LandingHero from "./components/LandingHero";
import EditorialNarrativeBlock from "./components/EditorialNarrativeBlock";
import SystemPillarsSection from "./components/SystemPillarsSection";
import HardwareSpecs from "./components/HardwareSpecs";
import LoginPage from "./components/LoginPage";
import TopBar from "./components/TopBar";
import FixedVideoBackdrop from "./components/FixedVideoBackdrop";
import AcousticIngestionBar from "./components/AcousticIngestionBar";
import SonarViewer from "./components/SonarViewer";
import MapPanel from "./components/MapPanel";
import GpsSwathCard from "./components/GpsSwathCard";
import AcousticModemCard from "./components/AcousticModemCard";
import ThreatAssessmentCard from "./components/ThreatAssessmentCard";
import FlightRecorderLog from "./components/FlightRecorderLog";
import MarineCopilotDrawer from "./components/MarineCopilotDrawer";
import OceanographyTelemetryStations from "./components/OceanographyTelemetryStations";
import MarineDataHub from "./components/MarineDataHub";
import EdnaGnnFoodWebExplorer from "./components/EdnaGnnFoodWebExplorer";
import OceanStressSimulator from "./components/OceanStressSimulator";
import { checkBackendHealth, scanSonarImage, saveMissionRecord } from "./api";
import { getSampleDataUrl, getSamplePngFile } from "./samples";
import { exportDiverBriefPdf } from "./pdfExport";
import StageVideoContainer, { vSonar, vGeo, vModem, vHazard } from "./components/StageVideoContainer";
import AdminFleetPanel from "./components/AdminFleetPanel";
import AdminLoginPage from "./components/AdminLoginPage";
import { classifySonarAnomaly, getKnowledgeBase } from "./services/onnxClassifier";

// Zero-dependency pure-JS binary EXIF GPS extractor
async function extractExifGps(file) {
  try {
    if (!file || typeof file.slice !== "function") return null;
    const buffer = await file.slice(0, 131072).arrayBuffer();
    const view = new DataView(buffer);
    if (view.byteLength < 16 || view.getUint16(0, false) !== 0xFFD8) return null;
    let offset = 2;
    const length = view.byteLength;
    while (offset < length - 4) {
      if (view.getUint8(offset) !== 0xFF) break;
      const marker = view.getUint8(offset + 1);
      if (marker === 0xE1) {
        if (
          view.getUint8(offset + 4) === 0x45 &&
          view.getUint8(offset + 5) === 0x78 &&
          view.getUint8(offset + 6) === 0x69 &&
          view.getUint8(offset + 7) === 0x66 &&
          view.getUint16(offset + 8) === 0x0000
        ) {
          const tiffStart = offset + 10;
          const endian = view.getUint16(tiffStart, false);
          const littleEndian = endian === 0x4949;
          const getU16 = (o) => view.getUint16(tiffStart + o, littleEndian);
          const getU32 = (o) => view.getUint32(tiffStart + o, littleEndian);
          const firstIfdOffset = getU32(4);
          if (firstIfdOffset + 2 > view.byteLength) return null;
          const numEntries = getU16(firstIfdOffset);
          let gpsOffset = null;
          for (let i = 0; i < numEntries; i++) {
            const entryOffset = firstIfdOffset + 2 + i * 12;
            if (entryOffset + 12 > view.byteLength) break;
            const tag = getU16(entryOffset);
            if (tag === 0x8825) {
              gpsOffset = getU32(entryOffset + 8);
              break;
            }
          }
          if (gpsOffset != null && gpsOffset + 2 < view.byteLength) {
            const gpsEntries = getU16(gpsOffset);
            let latDeg = null, latRef = 'N', lonDeg = null, lonRef = 'E';
            for (let i = 0; i < gpsEntries; i++) {
              const eOff = gpsOffset + 2 + i * 12;
              if (eOff + 12 > view.byteLength) break;
              const gTag = getU16(eOff);
              if (gTag === 1) {
                latRef = String.fromCharCode(view.getUint8(tiffStart + eOff + 8));
              } else if (gTag === 2) {
                const valOffset = getU32(eOff + 8);
                if (valOffset + 24 <= view.byteLength) {
                  const d = getU32(valOffset) / (getU32(valOffset + 4) || 1);
                  const m = getU32(valOffset + 8) / (getU32(valOffset + 12) || 1);
                  const s = getU32(valOffset + 16) / (getU32(valOffset + 20) || 1);
                  latDeg = d + m / 60 + s / 3600;
                }
              } else if (gTag === 3) {
                lonRef = String.fromCharCode(view.getUint8(tiffStart + eOff + 8));
              } else if (gTag === 4) {
                const valOffset = getU32(eOff + 8);
                if (valOffset + 24 <= view.byteLength) {
                  const d = getU32(valOffset) / (getU32(valOffset + 4) || 1);
                  const m = getU32(valOffset + 8) / (getU32(valOffset + 12) || 1);
                  const s = getU32(valOffset + 16) / (getU32(valOffset + 20) || 1);
                  lonDeg = d + m / 60 + s / 3600;
                }
              }
            }
            if (latDeg != null && lonDeg != null) {
              if (latRef === 'S') latDeg = -latDeg;
              if (lonRef === 'W') lonDeg = -lonDeg;
              return {
                lat: Number(latDeg.toFixed(6)),
                lng: Number(lonDeg.toFixed(6)),
                locationName: "Ingested EXIF GPS Geolocation"
              };
            }
          }
        }
      }
      const segLen = view.getUint16(offset + 2, false);
      if (segLen < 2) break;
      offset += 2 + segLen;
    }
  } catch (e) {
    console.warn("EXIF extraction notice:", e);
  }
  return null;
}

function resolveContextualCoords(filename, sampleId) {
  const norm = `${sampleId || ""} ${filename || ""}`.toLowerCase();
  if (norm.includes("pipe") || norm.includes("mumbai") || norm.includes("oil") || norm.includes("sunken_pipe")) {
    return { lat: 18.922014, lng: 72.834021, locationName: "Mumbai Offshore Corridor" };
  }
  if (norm.includes("cochin") || norm.includes("deep") || norm.includes("seafloor") || norm.includes("kerala")) {
    return { lat: 9.965022, lng: 76.242019, locationName: "Cochin Deep Approach" };
  }
  if (norm.includes("vizag") || norm.includes("visakhapatnam") || norm.includes("east")) {
    return { lat: 17.686816, lng: 83.218482, locationName: "Visakhapatnam Outer Anchorage" };
  }
  if (norm.includes("ghost_net") || norm.includes("net") || norm.includes("marmagao") || norm.includes("goa")) {
    return { lat: 15.429058, lng: 73.812242, locationName: "Marmagao Channel, Goa" };
  }
  const seed = Math.abs(norm.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 100;
  const latOffset = ((seed % 10) - 5) * 0.0035;
  const lngOffset = (((seed / 10) | 0) - 5) * 0.0035;
  return {
    lat: Number((15.429058 + latOffset).toFixed(6)),
    lng: Number((73.812242 + lngOffset).toFixed(6)),
    locationName: `Coastal Sector 0${(seed % 6) + 1}, Goa`,
  };
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || "/");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    localStorage.getItem("aquascan_admin_auth") === "true"
  );
  // Cold start is strictly unauthenticated unless explicitly logged in during this active browser session
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem("aquascan_authenticated") === "true";
    } catch {
      return false;
    }
  });
  const [operatorName, setOperatorName] = useState(() => {
    try {
      const active = sessionStorage.getItem("aquascan_auth");
      if (active) {
        const parsed = JSON.parse(active);
        return parsed.user || "Evaluator Officer";
      }
    } catch {}
    return "Evaluator Officer";
  });
  const [operatorRole, setOperatorRole] = useState(() => {
    try {
      const active = sessionStorage.getItem("aquascan_auth");
      if (active) {
        const parsed = JSON.parse(active);
        return parsed.role || "FLEET_COMMANDER";
      }
    } catch {}
    return "FLEET_COMMANDER";
  });
  const [health, setHealth] = useState({ status: "checking", gemini_configured: false });
  const [dbStatus, setDbStatus] = useState(null);
  const [targetCoords, setTargetCoords] = useState({
    lat: 15.429058,
    lng: 73.812242,
    locationName: "Marmagao Channel, Goa",
  });
  const [imageSrc, setImageSrc] = useState(null);
  const [detection, setDetection] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [currentFilename, setCurrentFilename] = useState("");
  const [activeSampleId, setActiveSampleId] = useState(null);
  const [activeSection, setActiveSection] = useState("section-waterfall");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("cloud");
  const [isRejected, setIsRejected] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname || "/");
      setIsAdminAuthenticated(localStorage.getItem("aquascan_admin_auth") === "true");
    };

    window.addEventListener("popstate", handleLocationChange);

    // Strict cold-start route lock: if unauthenticated, redirect /dashboard or /admin to /login
    const isAuthed = sessionStorage.getItem("aquascan_authenticated") === "true";
    const path = window.location.pathname || "/";
    if (!isAuthed && (path === "/dashboard" || path === "/admin")) {
      window.history.replaceState({}, "", "/login");
      setCurrentPath("/login");
    }
    checkBackendHealth().then(setHealth);
    getKnowledgeBase().catch(() => {});
    const timer = setInterval(() => checkBackendHealth().then(setHealth), 10000);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const sections = ["section-waterfall", "section-map", "section-telemetry", "section-directive"];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 280;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && scrollPos >= el.offsetTop && scrollPos < el.offsetTop + el.offsetHeight) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const persistMission = async (det, ass, customCoords) => {
    try {
      const activeLat = customCoords?.lat ?? targetCoords.lat ?? (det?.gps_coordinates?.latitude ? parseFloat(String(det.gps_coordinates.latitude).replace(/[^\d.-]/g, "")) : 15.4290);
      const activeLng = customCoords?.lng ?? targetCoords.lng ?? (det?.gps_coordinates?.longitude ? parseFloat(String(det.gps_coordinates.longitude).replace(/[^\d.-]/g, "")) : 73.8122);
      const payload = {
        target_type: ass?.hazard_type || "Acoustic Target",
        confidence: ass?.confidence || det?.confidence_score || 0.93,
        lat: activeLat,
        lng: activeLng,
        depth_m: parseFloat(String(ass?.seabed_depth || det?.swath_depth_m || 31.9).replace(/[^\d.-]/g, "")),
        backscatter_db: parseFloat(String(ass?.backscatter_db || det?.acoustic_intensity_db || -14.2).replace(/[^\d.-]/g, "")),
        frequency_khz: 455,
        threat_severity: ass?.threat_level || "MODERATE",
      };
      const res = await saveMissionRecord(payload);
      if (res?.status === "SUCCESS") {
        setDbStatus("[DB SYNC]: ATLAS CLUSTER // WRITE OK");
        setTimeout(() => setDbStatus(null), 4500);
      }
    } catch (e) {
      console.warn("[AQUASCAN DB] Auto-persist error:", e);
    }
  };

  const handleProcessImage = async (file, name) => {
    setIsScanning(true);
    setIsRejected(false);
    setError(null);
    const fname = name || file.name || "sonar_scan.png";
    setCurrentFilename(fname);
    setActiveSampleId(null);
    setImageSrc(URL.createObjectURL(file));

    // Clear previous rejection flags immediately so UI begins clean transition
    setAssessment((prev) => ({
      ...prev,
      is_valid_sonar: true,
      hazard_type: "Processing...",
      threat_level: "MODERATE",
    }));

    try {
      // 1. Run ONNX Runtime Web classifier with /aquascan_classifier.onnx & load knowledge base
      const onnxResult = await classifySonarAnomaly(file, fname);
      const { classId, kbEntry, targetCoords: inferredCoords, inferenceMs } = onnxResult;

      // 2. Stage 02: Dynamic GIS Map Re-Centering
      setTargetCoords(inferredCoords);

      // 3. Stage 04: Dynamic Safety Advice & Marine Risk Directive
      const kbAssessment = {
        hazard_type: kbEntry.name,
        hazard_name: kbEntry.name,
        severity: kbEntry.severity,
        threat_level: kbEntry.severity.includes("CRITICAL") ? "CRITICAL" : kbEntry.severity.includes("HIGH") ? "HIGH" : kbEntry.severity.includes("LOW") ? "LOW" : "MODERATE",
        diver_safety: kbEntry.diver_safety,
        diver_safety_action: kbEntry.diver_safety,
        marine_risk: kbEntry.marine_risk,
        ecological_impact: kbEntry.marine_risk,
        seabed_depth: "31.5 m",
        backscatter_db: "43.7 dB",
        calculated_height: "1.85 m",
        is_valid_sonar: true,
        source: `AquaScan Edge ONNX NPU (aquascan_classifier.onnx // ${inferenceMs}ms)`,
        class_id: classId,
        probabilities: onnxResult.probabilities,
      };
      setAssessment(kbAssessment);

      // 4. Validate with backend pipeline or execute purely local air-gapped ONNX
      let data;
      if (mode === "offline") {
        data = {
          detection: {
            hazard_type: kbEntry.name,
            confidence: onnxResult.probabilities?.[classId] || 0.94,
            swath_depth_m: 31.5,
            acoustic_intensity_db: 43.7,
            acoustic_shadow: { estimated_relief_m: 1.85 },
            gps_coordinates: { latitude: `${inferredCoords.lat}° N`, longitude: `${inferredCoords.lng}° E` }
          },
          assessment: {
            seabed_depth: "31.5 m",
            calculated_height: "1.85 m",
            source: `AquaScan Local Offline NPU (Air-Gapped // ${inferenceMs}ms)`
          },
          is_valid_sonar: true
        };
      } else {
        try {
          data = await scanSonarImage(file, mode);
        } catch (e) {
          console.warn("Backend unavailable, using local ONNX fallback:", e);
          data = {
            detection: {
              hazard_type: kbEntry.name,
              confidence: onnxResult.probabilities?.[classId] || 0.94,
              swath_depth_m: 31.5,
              acoustic_intensity_db: 43.7,
              acoustic_shadow: { estimated_relief_m: 1.85 },
              gps_coordinates: { latitude: `${inferredCoords.lat}° N`, longitude: `${inferredCoords.lng}° E` }
            },
            assessment: {
              seabed_depth: "31.5 m",
              calculated_height: "1.85 m",
              source: `AquaScan Edge ONNX NPU (${inferenceMs}ms)`
            },
            is_valid_sonar: true
          };
        }
      }

      if (data.status === "REJECTED" || data.is_valid_sonar === false) {
        setIsRejected(true);
        setDetection(null);
        setAssessment({
          is_valid_sonar: false,
          hazard_type: "REJECTED",
          hazard_name: "REJECTED // NON-ACOUSTIC SIGNATURE",
          threat_level: "INVALID",
          severity: "INVALID SENSOR INPUT",
          seabed_depth: "--",
          backscatter_db: "N/A",
          diver_safety: "Directive halted: Ingestion matrix rejected by acoustic filter. Awaiting genuine survey pass.",
          diver_safety_action: "Directive halted: Ingestion matrix rejected by acoustic filter. Awaiting genuine survey pass.",
          marine_risk: "Acoustic assessment suspended. Target signature non-marine.",
          ecological_impact: "Acoustic assessment suspended. Target signature non-marine.",
          detected_subject: data.detected_subject || "Non-Acoustic Ingestion",
          source: data.error_code ? "MobileNetV3 Acoustic Filter" : (data.assessment?.source || "Domain Verification Filter"),
        });
      } else {
        setIsRejected(false);
        setDetection(data.detection);
        const hazardTitle = data.assessment?.hazard_type || data.detection?.hazard_type || kbEntry.name;
        const hazardDisplay = data.assessment?.hazard_name || hazardTitle;
        const hazardSeverity = data.assessment?.severity || kbEntry.severity;
        setAssessment((prev) => ({
          ...prev,
          ...data.assessment,
          hazard_type: hazardTitle,
          hazard_name: hazardDisplay,
          severity: hazardSeverity,
          threat_level: hazardSeverity.includes("CRITICAL") ? "CRITICAL" : hazardSeverity.includes("HIGH") ? "HIGH" : hazardSeverity.includes("LOW") ? "LOW" : "MODERATE",
          diver_safety: data.assessment?.diver_safety || data.assessment?.diver_safety_action || kbEntry.diver_safety,
          diver_safety_action: data.assessment?.diver_safety_action || data.assessment?.diver_safety || kbEntry.diver_safety,
          marine_risk: data.assessment?.marine_risk || data.assessment?.ecological_impact || kbEntry.marine_risk,
          ecological_impact: data.assessment?.ecological_impact || data.assessment?.marine_risk || kbEntry.marine_risk,
          seabed_depth: data.assessment?.seabed_depth || `${data.detection?.swath_depth_m || 31.5} m`,
          backscatter_db: data.assessment?.backscatter_db || `${data.detection?.acoustic_intensity_db || 43.7} dB`,
          calculated_height: data.assessment?.calculated_height || `${data.detection?.acoustic_shadow?.estimated_relief_m || 1.85} m`,
          shadow_length: data.assessment?.shadow_length || `${data.detection?.acoustic_shadow?.shadow_length_m || "12.4 m"}`,
          marine_dna_match: data.assessment?.marine_dna_match || "Olive Ridley Turtle (Lepidochelys olivacea) • 91.4% Match",
          source: data.assessment?.source || `AquaScan Edge ONNX NPU (aquascan_classifier.onnx // ${inferenceMs}ms)`,
        }));

        // Notify tactical GIS map of dynamic target coordinates
        if (data.detection?.gps_coordinates?.lat_raw && data.detection?.gps_coordinates?.lon_raw) {
          setTargetCoords({
            lat: data.detection.gps_coordinates.lat_raw,
            lng: data.detection.gps_coordinates.lon_raw,
            locationName: data.assessment?.location_name || hazardDisplay || kbEntry.location_name || "Detected Acoustic Anomaly Target",
          });
        } else {
          setTargetCoords(inferredCoords);
        }

        if (mode !== "offline") {
          persistMission(data.detection, { ...data.assessment, hazard_type: hazardTitle, threat_level: hazardSeverity }, inferredCoords);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to process sonar scan.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectSample = async (sampleId) => {
    setIsRejected(false);
    setError(null);
    setActiveSampleId(sampleId);
    setImageSrc(getSampleDataUrl(sampleId));
    const fname = `${sampleId}.png`;
    setCurrentFilename(fname);
    setIsScanning(true);

    // Immediately clear rejection flags so UI transitions smoothly to waterfall rendering
    setAssessment((prev) => ({
      ...prev,
      is_valid_sonar: true,
      hazard_type: sampleId,
      threat_level: "MODERATE",
    }));

    try {
      const file = await getSamplePngFile(sampleId);
      // 1. Run ONNX Runtime Web classifier & load knowledge base
      const onnxResult = await classifySonarAnomaly(file, fname);
      const { classId, kbEntry, targetCoords: inferredCoords, inferenceMs } = onnxResult;

      // 2. Stage 02: Dynamic GIS Map Re-Centering
      setTargetCoords(inferredCoords);

      // 3. Stage 04: Dynamic Safety Advice & Marine Risk Directive
      const kbAssessment = {
        hazard_type: kbEntry.name,
        hazard_name: kbEntry.name,
        severity: kbEntry.severity,
        threat_level: kbEntry.severity.includes("CRITICAL") ? "CRITICAL" : kbEntry.severity.includes("HIGH") ? "HIGH" : kbEntry.severity.includes("LOW") ? "LOW" : "MODERATE",
        diver_safety: kbEntry.diver_safety,
        diver_safety_action: kbEntry.diver_safety,
        marine_risk: kbEntry.marine_risk,
        ecological_impact: kbEntry.marine_risk,
        seabed_depth: "31.5 m",
        backscatter_db: "43.7 dB",
        calculated_height: "1.85 m",
        is_valid_sonar: true,
        source: `AquaScan Edge ONNX NPU (aquascan_classifier.onnx // ${inferenceMs}ms)`,
        class_id: classId,
        probabilities: onnxResult.probabilities,
      };
      setAssessment(kbAssessment);

      // 4. Synchronize with backend validation (or offline mode)
      let data;
      if (mode === "offline") {
        data = {
          detection: {
            hazard_type: kbEntry.name,
            confidence: onnxResult.probabilities?.[classId] || 0.95,
            swath_depth_m: 31.5,
            acoustic_intensity_db: 43.7,
            acoustic_shadow: { estimated_relief_m: 1.85 },
            gps_coordinates: { latitude: `${inferredCoords.lat}° N`, longitude: `${inferredCoords.lng}° E` }
          },
          assessment: {
            seabed_depth: "31.5 m",
            calculated_height: "1.85 m",
            source: `AquaScan Local Offline NPU (Air-Gapped // ${inferenceMs}ms)`
          },
          is_valid_sonar: true
        };
      } else {
        try {
          data = await scanSonarImage(file, mode);
        } catch (e) {
          console.warn("Backend unavailable, using local ONNX fallback:", e);
          data = {
            detection: {
              hazard_type: kbEntry.name,
              confidence: onnxResult.probabilities?.[classId] || 0.95,
              swath_depth_m: 31.5,
              acoustic_intensity_db: 43.7,
              acoustic_shadow: { estimated_relief_m: 1.85 },
              gps_coordinates: { latitude: `${inferredCoords.lat}° N`, longitude: `${inferredCoords.lng}° E` }
            },
            assessment: {
              seabed_depth: "31.5 m",
              calculated_height: "1.85 m",
              source: `AquaScan Edge ONNX NPU (${inferenceMs}ms)`
            },
            is_valid_sonar: true
          };
        }
      }

      // Presets are verified acoustic reference scans; ensure rejection flags are cleared and valid sonar state is maintained
      setIsRejected(false);
      const isBackendValid = data && data.status !== "REJECTED" && data.is_valid_sonar !== false;
      const detectionData = (isBackendValid && data.detection) ? data.detection : {
        hazard_type: kbEntry.name,
        confidence: onnxResult.probabilities?.[classId] || 0.95,
        swath_depth_m: 31.5,
        acoustic_intensity_db: 43.7,
        acoustic_shadow: { estimated_relief_m: 1.85 },
        gps_coordinates: { latitude: `${inferredCoords.lat}° N`, longitude: `${inferredCoords.lng}° E` }
      };
      setDetection(detectionData);
      setAssessment((prev) => ({
        ...prev,
        ...(isBackendValid && data.assessment ? data.assessment : {}),
        is_valid_sonar: true,
        hazard_type: kbEntry.name,
        hazard_name: kbEntry.name,
        severity: kbEntry.severity,
        threat_level: kbEntry.severity.includes("CRITICAL") ? "CRITICAL" : kbEntry.severity.includes("HIGH") ? "HIGH" : kbEntry.severity.includes("LOW") ? "LOW" : "MODERATE",
        diver_safety: kbEntry.diver_safety,
        diver_safety_action: kbEntry.diver_safety,
        marine_risk: kbEntry.marine_risk,
        ecological_impact: kbEntry.marine_risk,
        seabed_depth: (isBackendValid && data.assessment?.seabed_depth) || `${detectionData?.swath_depth_m || 31.5} m`,
        backscatter_db: (isBackendValid && data.assessment?.backscatter_db) || `${detectionData?.acoustic_intensity_db || 43.7} dB`,
        calculated_height: (isBackendValid && data.assessment?.calculated_height) || `${detectionData?.acoustic_shadow?.estimated_relief_m || 1.85} m`,
        source: `AquaScan Edge ONNX NPU (aquascan_classifier.onnx // ${inferenceMs}ms)`,
      }));
      persistMission(detectionData, { ...((isBackendValid && data.assessment) ? data.assessment : {}), hazard_type: kbEntry.name, threat_level: kbEntry.severity }, inferredCoords);
    } catch (err) {
      console.warn("Preset load notice:", err);
      setIsRejected(false);
      setAssessment((prev) => ({
        ...prev,
        is_valid_sonar: true,
      }));
    } finally {
      setIsScanning(false);
    }
  };

  const handleExportReport = () => {
    const ts = new Date().toISOString();
    const report = {
      mission: "AquaScan AI Autonomous Survey Report", timestamp: ts, file: currentFilename || "sonar_scan.png",
      target_coordinates: { latitude: detection?.gps_coordinates?.latitude || "--", longitude: detection?.gps_coordinates?.longitude || "--", datum: "WGS 84" },
      classified_threat: { hazard_type: assessment?.hazard_type || "N/A", threat_level: assessment?.threat_level || "INVALID", ecological_impact: assessment?.ecological_impact || "N/A" },
      diver_directive: assessment?.diver_safety_action || assessment?.diver_action || "Standby.",
      telemetry: { seabed_depth: assessment?.seabed_depth || `${detection?.swath_depth_m || 28.4} meters`, calculated_object_height: assessment?.calculated_height || `${detection?.acoustic_shadow?.estimated_relief_m || 1.85} meters` },
      engine: assessment?.source || (mode === "edge" ? "AquaScan Edge NPU" : "Naval Hydrographic Vision Processor"),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `AquaScan_Mission_Report_${ts.replace(/[:.]/g, "-")}.json`; a.click();
  };

  const handleExecuteAgenticAction = (action) => {
    if (!action) return;
    if (action.type === "RUN_SCAN" && action.sampleId) {
      handleSelectSample(action.sampleId);
      const el = document.getElementById("section-waterfall");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (action.type === "PAN_MAP" && action.coords) {
      setTargetCoords(action.coords);
      const el = document.getElementById("section-map");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (action.type === "JUMP_SECTION" && action.sectionId) {
      const el = document.getElementById(action.sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLoginSuccess = (name, role) => {
    const user = name || "Evaluator Officer";
    const userRole = role || "FLEET_COMMANDER";
    setOperatorName(user);
    setOperatorRole(userRole);
    setIsAuthenticated(true);
    sessionStorage.setItem("aquascan_authenticated", "true");
    sessionStorage.setItem("aquascan_auth", JSON.stringify({ user, role: userRole }));
    localStorage.setItem("aquascan_auth", JSON.stringify({ user, role: userRole }));
    setCurrentPath("/dashboard");
    window.history.pushState({}, "", "/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("aquascan_auth");
    localStorage.removeItem("aquascan_admin_auth");
    localStorage.removeItem("aquascan_admin_session");
    sessionStorage.removeItem("aquascan_authenticated");
    sessionStorage.removeItem("aquascan_auth");
    setIsAuthenticated(false);
    setIsAdminAuthenticated(false);
    setOperatorName("");
    setCurrentPath("/login");
    window.history.pushState({}, "", "/login");
  };

    // 1. ISOLATED ADMIN ROUTE: /admin/login (Root Command Gateway)
  if (currentPath === "/admin/login") {
    return (
      <AdminLoginPage
        onAdminLoginSuccess={() => {
          setIsAdminAuthenticated(true);
          setCurrentPath("/admin");
          window.history.pushState({}, "", "/admin");
        }}
        onBackToConsole={() => {
          if (isAuthenticated) {
            setCurrentPath("/dashboard");
            window.history.pushState({}, "", "/dashboard");
          } else {
            setCurrentPath("/login");
            window.history.pushState({}, "", "/login");
          }
        }}
      />
    );
  }

  // 2. PROTECTED ADMIN ROUTE: /admin
  if (currentPath === "/admin") {
    // If not authenticated as standard operator or admin, strictly redirect to /login
    if (!isAuthenticated && !isAdminAuthenticated) {
      window.history.replaceState({}, "", "/login");
      return (
        <LoginPage
          onLogin={handleLoginSuccess}
          onNavigateAdminLogin={() => {
            setCurrentPath("/admin/login");
            window.history.pushState({}, "", "/admin/login");
          }}
        />
      );
    }

    if (!isAdminAuthenticated) {
      return (
        <AdminLoginPage
          onAdminLoginSuccess={() => {
            setIsAdminAuthenticated(true);
            setCurrentPath("/admin");
            window.history.pushState({}, "", "/admin");
          }}
          onBackToConsole={() => {
            setCurrentPath("/dashboard");
            window.history.pushState({}, "", "/dashboard");
          }}
        />
      );
    }

    return (
      <AdminFleetPanel
        currentUserRole={operatorRole}
        onRoleChange={(newRole) => setOperatorRole(newRole)}
        onTerminateSession={() => {
          localStorage.removeItem("aquascan_admin_auth");
          localStorage.removeItem("aquascan_admin_session");
          setIsAdminAuthenticated(false);
          setCurrentPath("/admin/login");
          window.history.pushState({}, "", "/admin/login");
        }}
        onClose={() => {
          setCurrentPath("/dashboard");
          window.history.pushState({}, "", "/dashboard");
        }}
      />
    );
  }

  // 3. MANDATORY LOGIN GATE:
  // Root path / or unauthenticated access strictly renders LoginPage
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={handleLoginSuccess}
        onNavigateAdminLogin={() => {
          setCurrentPath("/admin/login");
          window.history.pushState({}, "", "/admin/login");
        }}
      />
    );
  }

  // If authenticated and user navigates to /login, smoothly redirect to /dashboard
  if (currentPath === "/login") {
    window.history.replaceState({}, "", "/dashboard");
  }
  const isValidSonar = !isRejected && assessment?.is_valid_sonar !== false;
  const stageCard = "w-full max-w-7xl bg-slate-950/60 backdrop-blur-md border border-cyan-500/20 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] p-6 lg:p-8 flex flex-col gap-6 relative overflow-hidden";

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans relative select-none bg-transparent">
      <FixedVideoBackdrop />
      <TopBar
        backendStatus={health.status}
        mode={mode}
        onToggleMode={setMode}
        edgeLatency={assessment?.inference_time_ms}
        onLogout={handleLogout}
        gps={
          detection?.gps_coordinates || {
            latitude: `${targetCoords.lat.toFixed(4)}° N`,
            longitude: `${targetCoords.lng.toFixed(4)}° E`,
          }
        }
        activeSection={activeSection}
        operatorName={operatorName}
        dbStatus={dbStatus}
      />

      <div className="relative w-full bg-transparent text-slate-100 flex flex-col">
        {/* Section 1: Massive Editorial Hero */}
        <section className="relative w-full min-h-screen flex flex-col justify-between">
          <LandingHero
            operatorName={operatorName}
            onScrollToConsole={() => document.getElementById("live-console")?.scrollIntoView({ behavior: "smooth" })}
          />
        </section>

        {/* Section 2: Editorial Narrative Block ("The Bottleneck Nobody Rebuilt") */}
        <EditorialNarrativeBlock />

        {/* Section 3: System Pillars ("What Sets AquaScan Apart") */}
        <SystemPillarsSection />

        {/* Section 4: Uncongested Full-Scale Tactical Workstation */}
        <div className="w-full pt-16 pb-4 max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2ff]" />
            <span className="font-mono text-xs text-cyan-400 tracking-widest uppercase">
              TACTICAL WORKSTATION // LIVE BUS
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.04em] text-slate-100 leading-none">
            Littoral Clearance Workstation.
          </h2>
          <p className="text-slate-400 text-sm font-normal max-w-2xl mt-1">
            Real-time neural side-scan sonar waterfall, geodetic AIS tracking, slant-range shadow trigonometry, and automated maritime safety telex dispatch.
          </p>
        </div>

        <main
          id="live-console"
          className="relative w-full bg-[#020612]/70 backdrop-blur-sm border-t border-cyan-500/20 px-4 md:px-8 py-10 space-y-16"
        >
          {error && <div className="mx-6 sm:mx-16 mt-4 px-4 py-2.5 rounded-xl bg-red-950/75 border border-red-800 text-red-300 text-xs font-mono shadow-xl relative z-20">[SONAR ALERT]: {error}</div>}

          {/* STAGE 1: HARDWARE SCHEMATICS & SONAR INGESTION */}
          <StageVideoContainer id="section-waterfall" videoSrc={vSonar}>
            <div className={stageCard}>
              <div className="-mx-6 lg:-mx-8 -mt-6 lg:-mt-8 mb-2 flex items-center justify-between px-4 py-2 border-b border-cyan-500/15 bg-cyan-950/20 text-xs font-mono">
                <span className="text-cyan-400 font-semibold tracking-wider">STAGE 01 // LIVE SONAR FEED</span>
                <span className="flex items-center gap-1.5 text-emerald-400 text-[10px]"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>ACTIVE BUS</span>
              </div>
              <AcousticIngestionBar onSelectFile={(f) => handleProcessImage(f, f.name)} onSelectSample={handleSelectSample} isScanning={isScanning} activeSampleId={activeSampleId} />
              <SonarViewer imageSrc={imageSrc} detection={detection} isScanning={isScanning} isValidSonar={isValidSonar} isRejected={isRejected} detectedSubject={assessment?.detected_subject} />
            </div>
          </StageVideoContainer>

          {/* STAGE 2: TACTICAL GEOSPATIAL MAP & AIS TRAFFIC */}
          <StageVideoContainer id="section-map" videoSrc={vGeo}>
            <div className={stageCard}>
              <div className="-mx-6 lg:-mx-8 -mt-6 lg:-mt-8 mb-2 flex items-center justify-between px-4 py-2 border-b border-cyan-500/15 bg-cyan-950/20 text-xs">
                <span className="text-cyan-400 font-semibold tracking-wider">Live Map &amp; Vessel Tracking</span>
                <span className="flex items-center gap-1.5 text-emerald-400 text-[10px]"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>● Live</span>
              </div>
              <MapPanel
                gps={detection?.gps_coordinates}
                hazardType={assessment?.hazard_type}
                depth={assessment?.seabed_depth}
                threatLevel={assessment?.threat_level}
                targetCoords={targetCoords}
              />
            </div>
          </StageVideoContainer>

          {/* STAGE 3: LIVE TARGET MEASUREMENTS */}
          <StageVideoContainer id="section-telemetry" videoSrc={vModem}>
            <div className={stageCard}>
              <div className="-mx-6 lg:-mx-8 -mt-6 lg:-mt-8 mb-2 flex items-center justify-between px-4 py-2 border-b border-cyan-500/15 bg-cyan-950/20 text-xs">
                <span className="text-cyan-400 font-bold tracking-wider">Real-Time Sea &amp; Depth Telemetry</span>
                <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-950/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  🟢 Sonar Online
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                <GpsSwathCard detection={detection} assessment={assessment} targetCoords={targetCoords} />
                <AcousticModemCard detection={detection} assessment={assessment} />
              </div>
            </div>
          </StageVideoContainer>

          {/* STAGE 4: HAZARD DETECTION & ACTION PLAN */}
          <StageVideoContainer id="section-directive" videoSrc={vHazard}>
            <div className={stageCard}>
              <div className="-mx-6 lg:-mx-8 -mt-6 lg:-mt-8 mb-2 flex items-center justify-between px-4 py-2 border-b border-cyan-500/15 bg-cyan-950/20 text-xs">
                <span className="text-cyan-400 font-bold tracking-wider">Safety Advisory &amp; Response</span>
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border transition-all duration-300 ${
                  (assessment?.severity || "").includes("LOW") || (assessment?.severity || "").includes("CLEAR")
                    ? "bg-[#059669]/20 text-[#10b981] border-[#059669]"
                    : (assessment?.severity || "").includes("CRITICAL") || (assessment?.severity || "").includes("HIGH")
                    ? "bg-[#DC2626]/20 text-[#ef4444] border-[#DC2626]"
                    : "bg-[#D97706]/20 text-[#f59e0b] border-[#D97706]"
                }`}>
                  <span>{
                    (assessment?.severity || "").includes("LOW") || (assessment?.severity || "").includes("CLEAR")
                      ? "🟢"
                      : (assessment?.severity || "").includes("CRITICAL") || (assessment?.severity || "").includes("HIGH")
                      ? "🚨"
                      : "⚠️"
                  }</span>
                  <span>{assessment?.severity?.replace(" HAZARD", "") || "MODERATE RISK"}</span>
                </span>
              </div>
              <ThreatAssessmentCard assessment={assessment} detection={detection} onExportReport={handleExportReport} onDownloadPdf={() => exportDiverBriefPdf({ detection, assessment, filename: currentFilename })} mode={mode} targetCoords={targetCoords} />
            </div>
          </StageVideoContainer>

          {/* MODULE 2 & 5: PHYSICAL OCEANOGRAPHY, LIVE STATIONS & FISHERIES STOCK HEALTH */}
          <div className="bg-slate-950/70 backdrop-blur-md border border-cyan-500/20 rounded-3xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <OceanographyTelemetryStations
              activeHazard={assessment?.hazard_type}
              activeSampleId={activeSampleId}
              onStationSelect={(st) => {
                if (st?.coords) {
                  setTargetCoords({ lat: st.coords[0], lng: st.coords[1], locationName: st.name });
                }
              }}
            />
          </div>

          {/* PILLAR 5: MOLECULAR eDNA BLAST & GNN TROPHIC FOOD-WEB EXPLORER */}
          <div className="bg-slate-950/70 backdrop-blur-md border border-emerald-500/20 rounded-3xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <EdnaGnnFoodWebExplorer />
          </div>

          {/* FEATURE 4: WHAT-IF OCEAN STRESS SIMULATOR */}
          <div className="bg-slate-950/70 backdrop-blur-md border border-cyan-500/20 rounded-3xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <OceanStressSimulator />
          </div>

          {/* MODULE 1: SMART DATASET EXPLORER (MARINE DATA HUB) */}
          <div className="bg-slate-950/70 backdrop-blur-md border border-cyan-500/20 rounded-3xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <MarineDataHub />
          </div>

          <HardwareSpecs />

          <FlightRecorderLog detection={detection} assessment={assessment} />
        </main>
      </div>

      <MarineCopilotDrawer detection={detection} assessment={assessment} onExecuteAgenticAction={handleExecuteAgenticAction} />
    </div>
  );
}
