import { jsPDF } from "jspdf";

export function exportDiverBriefPdf({ detection, assessment, filename }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const ts = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST";
  const threat = assessment?.threat_level || "MODERATE";
  const hazard = assessment?.hazard_type || "Marine Hazard / Obstacle";
  const lat = detection?.gps_coordinates?.latitude || "15.4291° N";
  const lon = detection?.gps_coordinates?.longitude || "73.8123° E";
  const depth = assessment?.seabed_depth || (detection?.swath_depth_m ? `${detection.swath_depth_m} meters` : "28.4 meters");
  const directive = assessment?.diver_safety_action || assessment?.diver_action || "Deploy ROV for visual acoustic survey before diver approach.";
  const ecoRisk = assessment?.ecological_impact || "Ongoing entanglement risk to local cetacean and turtle populations.";

  // Dark Navy Header Banner
  doc.setFillColor(7, 13, 24);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(0, 242, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("INDIAN COASTAL RECOVERY & DIVER ACTION SHEET", 14, 13);
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "normal");
  doc.text(`AquaScan AI Marine Engineering & Recovery Protocol  |  Govt of India / SIH 2026`, 14, 20);
  doc.text(`Generated: ${ts}  |  Operational Datum: WGS 84`, 14, 25);

  // Mission Metadata Grid
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 35, 182, 32, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("MISSION METADATA & TELEMETRY:", 18, 42);
  doc.setFont("helvetica", "normal");
  doc.text(`• Target Coordinates: ${lat}, ${lon} (Goa Coast / Arabian Sea)`, 18, 49);
  doc.text(`• Acoustic Frequency: CHIRP 455 kHz Side-Scan`, 18, 56);
  doc.text(`• Seabed Depth: ${depth}`, 115, 49);
  doc.text(`• Source Scan File: ${filename || "sonar_stream.png"}`, 115, 56);
  doc.text(`• Target Relief Height: ${detection?.acoustic_shadow?.estimated_relief_m || "1.85"} meters`, 18, 62);
  doc.text(`• Backscatter Reflection: ${detection?.acoustic_intensity_db ?? "-18.4"} dB`, 115, 62);

  // Threat Level & Classification Strip
  const isCrit = threat === "CRITICAL";
  doc.setFillColor(isCrit ? 220 : 15, isCrit ? 38 : 118, isCrit ? 38 : 110);
  doc.rect(14, 71, 182, 11, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`HAZARD CLASSIFICATION: ${hazard.toUpperCase()}  [THREAT LEVEL: ${threat}]`, 18, 78);

  // Operational Safety Directives
  doc.setFillColor(254, 243, 199);
  doc.rect(14, 86, 182, 28, "F");
  doc.setTextColor(180, 83, 9);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("OPERATIONAL SAFETY DIRECTIVES FOR RECOVERY DIVERS:", 18, 92);
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "normal");
  const splitDir = doc.splitTextToSize(directive, 174);
  doc.text(splitDir, 18, 98);

  // Diver Safety Checklist
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 118, 182, 58, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text("OPERATIONAL SAFETY CHECKLIST FOR RECOVERY DIVERS:", 18, 125);
  doc.setFont("helvetica", "normal");
  const checklist = [
    "[  ] Maintain mandatory 5-meter standoff buffer zone before ROV tag.",
    "[  ] Arm pneumatic/hydraulic double-shear line cutters for monofilament entanglement.",
    "[  ] Inspect umbilical lines & diver harness; confirm zero tether snags on seabed debris.",
    "[  ] Deploy sub-surface acoustic emergency pinger beacon on target datum.",
    "[  ] Standby rescue safety boat on surface with acoustic recall transmitter.",
  ];
  checklist.forEach((item, idx) => {
    doc.text(item, 18, 133 + (idx * 8));
  });

  // Benthic Ecological Risk Summary
  doc.setFillColor(236, 253, 245);
  doc.rect(14, 180, 182, 24, "F");
  doc.setTextColor(4, 120, 87);
  doc.setFont("helvetica", "bold");
  doc.text("BENTHIC ECOLOGICAL RISK SUMMARY:", 18, 186);
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "normal");
  const splitEco = doc.splitTextToSize(ecoRisk, 174);
  doc.text(splitEco, 18, 192);

  // Footer
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text("AQUASCAN AI - INDIAN COASTAL OCEAN RECOVERY DIVISION  |  STRICTLY CONFIDENTIAL", 14, 285);

  const safeTs = new Date().toISOString().replace(/[:.]/g, "-");
  doc.save(`AquaScan_Diver_Brief_${safeTs}.pdf`);
}
