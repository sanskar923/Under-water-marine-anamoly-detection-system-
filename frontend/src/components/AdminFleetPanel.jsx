import React, { useState, useEffect } from "react";
import {
  Users,
  Database,
  Radio,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Download,
  Trash2,
  RefreshCw,
  ArrowLeft,
  Plus,
  X,
  Zap,
  RotateCcw,
  Clock,
  Eye,
  Check,
  Waves,
  Dna,
  Fish,
  Anchor,
  Activity,
  FileText,
  Sliders,
  Sparkles,
  Compass,
  ArrowRight
} from "lucide-react";
import { fetchMissionHistory, purgeMissionHistory } from "../api";

export default function AdminFleetPanel({ onClose, currentUserRole = "ADMIN", onRoleChange, onTerminateSession }) {
  useEffect(() => {
    const isAdmin = localStorage.getItem("aquascan_admin_auth");
    if (!isAdmin || isAdmin !== "true") {
      if (onTerminateSession) {
        onTerminateSession();
      }
    }
  }, [onTerminateSession]);

  // Active Tab State (6 Clean Tabs)
  const [activeTab, setActiveTab] = useState("operators");

  // Section 1: User / Officer Accounts State
  const [officers, setOfficers] = useState([
    {
      id: "OFF-01",
      name: "Cdr. K. Verma",
      role: "Chief Hydrographer",
      email: "k.verma@navy.mil",
      status: "Active",
    },
    {
      id: "OFF-02",
      name: "Lt. S. Nair",
      role: "Duty Hydrographer",
      email: "s.nair@navy.mil",
      status: "Active",
    },
    {
      id: "OFF-03",
      name: "Demo Guest",
      role: "Evaluator",
      email: "eval@hackathon.ai",
      status: "Active",
    },
  ]);

  // Add Officer Modal
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Duty Hydrographer");

  // Section 2: Sonar Survey History State (MongoDB Atlas live sync)
  const [missions, setMissions] = useState([]);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [purgeConfirmOpen, setPurgeConfirmOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Section 3: Coastal Stations Telemetry State (5 Stations)
  const [stations, setStations] = useState([
    {
      id: "st-01",
      name: "Station 01: Goa (Marmagao)",
      status: "Online",
      temp: "28.4°C",
      salinity: "34.8 PSU",
      soundSpeed: 1532,
      lastPing: "18ms (0% loss)",
      calibrated: true,
    },
    {
      id: "st-02",
      name: "Station 02: Mumbai High",
      status: "Online",
      temp: "27.9°C",
      salinity: "35.1 PSU",
      soundSpeed: 1536,
      lastPing: "22ms (0% loss)",
      calibrated: true,
    },
    {
      id: "st-03",
      name: "Station 03: Cochin Port",
      status: "Online",
      temp: "28.2°C",
      salinity: "34.2 PSU",
      soundSpeed: 1528,
      lastPing: "25ms (0% loss)",
      calibrated: true,
    },
    {
      id: "st-04",
      name: "Station 04: Chennai Bay",
      status: "Online",
      temp: "29.1°C",
      salinity: "34.6 PSU",
      soundSpeed: 1538,
      lastPing: "21ms (0% loss)",
      calibrated: true,
    },
    {
      id: "st-05",
      name: "Station 05: Visakhapatnam",
      status: "Online",
      temp: "28.7°C",
      salinity: "34.5 PSU",
      soundSpeed: 1533,
      lastPing: "19ms (0% loss)",
      calibrated: true,
    },
  ]);

  // Section 4: eDNA & Endangered Wildlife Escalations State
  const [bioAlerts, setBioAlerts] = useState([
    {
      id: "BIO-901",
      species: "Rhincodon typus (Whale Shark)",
      title: "Rhincodon typus (Whale Shark) eDNA verified in Sector 5 (98.4% Confidence)",
      confidence: "98.4%",
      sector: "Sector 5 (Goa Sanctuary Outer Shelf)",
      iucn: "ENDANGERED",
      timestamp: "Live Telemetry • 12 mins ago",
      status: "Pending Action",
      details: "Water sample sequence matches 16S mitochondrial marker for Whale Shark. High plankton aggregation zone detected.",
    },
    {
      id: "BIO-902",
      species: "Lepidochelys olivacea (Olive Ridley Turtle)",
      title: "Lepidochelys olivacea (Olive Ridley) nesting trace detected in Sector 2",
      confidence: "94.2%",
      sector: "Sector 2 (Coastal Estuary Corridor)",
      iucn: "VULNERABLE",
      timestamp: "Today, 11:45",
      status: "Notice Active",
      details: "Automated sanctuary buoy flagged nocturnal migration cluster.",
    },
  ]);

  // Section 5: Dataset Catalog Manager State
  const [publicDownloadsAllowed, setPublicDownloadsAllowed] = useState(true);
  const [datasets, setDatasets] = useState([
    {
      id: "ds-1",
      name: "Physical Oceanography (SST & Current Vectors)",
      format: "NetCDF / CSV",
      size: "1.2 GB",
      syncFrequency: "Daily Sync",
      downloadsToday: 19,
      category: "Telemetry",
      status: "Published",
    },
    {
      id: "ds-2",
      name: "Seafloor Sonar Scans (455 kHz Benthic Raw Runs)",
      format: "GeoTIFF / SSS",
      size: "4.8 GB",
      syncFrequency: "Live Feed",
      downloadsToday: 14,
      category: "Acoustic",
      status: "Published",
    },
    {
      id: "ds-3",
      name: "Marine DNA & Species Records (FASTA Assays)",
      format: "FASTA / JSON",
      size: "420 MB",
      syncFrequency: "Weekly Sync",
      downloadsToday: 9,
      category: "Biology",
      status: "Published",
    },
    {
      id: "ds-4",
      name: "Commercial Fishing Catch Logs (MSY Limits)",
      format: "Parquet / CSV",
      size: "850 MB",
      syncFrequency: "Monthly Sync",
      downloadsToday: 6,
      category: "Fisheries",
      status: "Published",
    },
  ]);
  const [isUploadBatchOpen, setIsUploadBatchOpen] = useState(false);
  const [newDatasetTitle, setNewDatasetTitle] = useState("");
  const [newDatasetFormat, setNewDatasetFormat] = useState("NetCDF");

  // Section 6: Danger Warnings & Alerts (Maritime Dispatch Queue)
  const [alerts, setAlerts] = useState([
    {
      id: "ALT-101",
      title: "Ghost Net detected near Mumbai Port channel",
      details: "Depth: 14.2 meters • Threat level: High entanglement hazard to commercial vessels",
      location: "Lat 18.9220° N, Lon 72.8340° E",
      timestamp: "Today, 14:30",
      status: "Pending Approval",
    },
    {
      id: "ALT-102",
      title: "Unmarked Submerged Dredge Pipeline Section",
      details: "Depth: 8.5 meters • Threat level: Shallow water collision risk",
      location: "Lat 15.4290° N, Lon 73.8120° E",
      timestamp: "Yesterday, 19:15",
      status: "Broadcasted to Ships",
    },
  ]);

  // AI & Sensor Calibration Settings
  const [aiNoiseFilter, setAiNoiseFilter] = useState(true);
  const [sonarRange, setSonarRange] = useState(50);
  const [settingsNotice, setSettingsNotice] = useState(null);

  // Load mission history from MongoDB Atlas
  const loadMissions = async () => {
    setLoadingMissions(true);
    try {
      const data = await fetchMissionHistory(50);
      setMissions(data.missions || []);
    } catch (err) {
      console.warn("Could not fetch scans from backend:", err);
    } finally {
      setLoadingMissions(false);
    }
  };

  useEffect(() => {
    loadMissions();
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // 1-Click Toggle User Status (Block / Unblock)
  const handleToggleOfficerStatus = (id) => {
    setOfficers((prev) =>
      prev.map((off) => {
        if (off.id === id) {
          const nextStatus = off.status === "Active" ? "Blocked" : "Active";
          showNotification(`${off.name} is now ${nextStatus.toUpperCase()}.`);
          return { ...off, status: nextStatus };
        }
        return off;
      })
    );
  };

  // Add New Officer
  const handleAddOfficer = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newOfficer = {
      id: `OFF-0${officers.length + 1}`,
      name: newName.trim(),
      email: newEmail.trim() || `${newName.trim().toLowerCase().replace(/\s+/g, ".")}@ocean.org`,
      role: newRole,
      status: "Active",
    };
    setOfficers((prev) => [...prev, newOfficer]);
    showNotification(`Added new officer: ${newOfficer.name}`);
    setNewName("");
    setNewEmail("");
    setIsAddUserOpen(false);
  };

  // Purge Old Test Data
  const handlePurgeLogs = async () => {
    try {
      const res = await purgeMissionHistory();
      showNotification(`Cleared ${res.deleted_count ?? 0} test scan record(s) from database.`);
      setPurgeConfirmOpen(false);
      loadMissions();
    } catch (err) {
      showNotification("Could not clear test logs: " + err.message);
    }
  };

  // Export as CSV/Excel
  const handleExportCsv = () => {
    if (!missions.length) {
      alert("No sonar scans recorded yet to export.");
      return;
    }
    const headers = "Scan ID,Date & Time,What Was Found,Confidence,Depth (Meters),Latitude,Longitude,Safety Status";
    const rows = missions.map((m, idx) => {
      const id = m._id || `SCAN-${idx + 1}`;
      const ts = m.timestamp ? new Date(m.timestamp).toLocaleString() : "Recent";
      const target = (m.target_type || "Seabed Feature").replace(/,/g, " ");
      const conf = Math.round((m.confidence || 0.92) * 100) + "%";
      const depth = (m.telemetry?.depth_m ?? m.depth_m ?? 31.9) + "m";
      const lat = m.coordinates?.lat ?? 15.429;
      const lng = m.coordinates?.lng ?? 73.8122;
      const st = m.threat_severity || m.status || "Verified";
      return `"${id}","${ts}","${target}","${conf}","${depth}","${lat}","${lng}","${st}"`;
    });
    const csvContent = `${headers}\n${rows.join("\n")}\n`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Sonar_Scans_Export_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification("Sonar scans exported to CSV successfully.");
  };

  // Station Actions
  const handleRecalibrateStation = (stId, stName) => {
    setStations((prev) =>
      prev.map((s) => (s.id === stId ? { ...s, soundSpeed: 1533, calibrated: true } : s))
    );
    showNotification(`Recalibrated ${stName}: Sound Speed reset to standard 1,533 m/s.`);
  };

  const handleDiagnosticPing = (stId, stName) => {
    const lat = Math.floor(Math.random() * 10 + 14);
    setStations((prev) =>
      prev.map((s) => (s.id === stId ? { ...s, lastPing: `${lat}ms (0% loss)` } : s))
    );
    showNotification(`Diagnostic ping to ${stName} successful! Latency: ${lat}ms, 0% packet loss.`);
  };

  // Bio-Alert Actions
  const handleBroadcastTrawlerExclusion = (alertId) => {
    setBioAlerts((prev) =>
      prev.map((b) => (b.id === alertId ? { ...b, status: "Broadcasted (10-Knot Speed Cap Enforced)" } : b))
    );
    showNotification("NAVTEX Radio Broadcast Sent! Trawler 10-knot speed restriction active in Sector 5.");
  };

  const handleDismissBioAlert = (alertId) => {
    setBioAlerts((prev) => prev.filter((b) => b.id !== alertId));
    showNotification("Bio-alert dismissed as background environmental trace.");
  };

  // Dataset Actions
  const handleUploadBatch = (e) => {
    e.preventDefault();
    if (!newDatasetTitle.trim()) return;
    const newDs = {
      id: `ds-${datasets.length + 1}`,
      name: newDatasetTitle.trim(),
      format: newDatasetFormat,
      size: "620 MB",
      syncFrequency: "Weekly Sync",
      downloadsToday: 0,
      category: "Hydrographic",
      status: "Published",
    };
    setDatasets((prev) => [newDs, ...prev]);
    showNotification(`New dataset batch "${newDs.name}" uploaded and indexed!`);
    setNewDatasetTitle("");
    setIsUploadBatchOpen(false);
  };

  // Approve Danger Warning
  const handleApproveWarning = (alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: "Broadcasted to Ships" } : a))
    );
    showNotification(`Warning ${alertId} approved and sent to ships via maritime radio!`);
  };

  // Dismiss Danger Warning
  const handleDismissWarning = (alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    showNotification(`Alert ${alertId} dismissed as false alarm.`);
  };

  // Reset Calibration
  const handleResetCalibration = () => {
    setAiNoiseFilter(true);
    setSonarRange(50);
    setSettingsNotice("Settings restored to factory defaults (AI Noise Filter: ON, Range: 50m).");
    setTimeout(() => setSettingsNotice(null), 4000);
  };

  const activeOfficersCount = officers.filter((o) => o.status === "Active").length;
  const pendingAlertsCount = alerts.filter((a) => a.status === "Pending Approval").length;
  const pendingBioCount = bioAlerts.filter((b) => b.status === "Pending Action").length;

  const TABS = [
    { id: "operators", label: "User Accounts", icon: <Users className="w-4 h-4" />, count: officers.length },
    { id: "audit", label: "Survey History", icon: <Database className="w-4 h-4" />, count: missions.length },
    { id: "coastal", label: "5 Coastal Stations", icon: <Waves className="w-4 h-4" />, count: "5 Online" },
    { id: "wildlife", label: "Wildlife Protection", icon: <Dna className="w-4 h-4" />, count: pendingBioCount > 0 ? `${pendingBioCount} Alert` : "Clean", alert: pendingBioCount > 0 },
    { id: "datasets", label: "Public Data Hub", icon: <FileText className="w-4 h-4" />, count: "4 Repos" },
    { id: "dispatch", label: "Maritime Dispatch", icon: <Radio className="w-4 h-4" />, count: pendingAlertsCount > 0 ? `${pendingAlertsCount} Pending` : "Normal", alert: pendingAlertsCount > 0 },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A0F1D] font-sans antialiased selection:bg-[#A7F3D0] selection:text-[#065F46]">
      {/* MINIMALIST STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-[#F8F9FA]/95 backdrop-blur-md border-b border-[#E5E7EB] px-6 lg:px-12 py-3.5 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-sans font-black tracking-tight text-[#0A0F1D] text-base md:text-lg">
              AQUASCAN <span className="text-[#9CA3AF] font-light mx-0.5">//</span> ADMIN COMMAND WORKSTATION
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#0A0F1D] hover:bg-black text-white text-xs md:text-sm px-5 py-2.5 rounded-full font-medium transition-all shadow-sm cursor-pointer flex items-center gap-2 active:scale-95"
            title="Return to the live sonar scanner screen"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>[← Back to Main Workstation]</span>
          </button>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("aquascan_admin_auth");
              localStorage.removeItem("aquascan_admin_session");
              if (onTerminateSession) {
                onTerminateSession();
              } else {
                window.location.href = "/admin/login";
              }
            }}
            className="text-xs font-semibold text-[#6B7280] hover:text-[#DC2626] transition-colors px-2 py-1 cursor-pointer hidden sm:inline"
            title="Log out from admin session"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Global Notification Banner */}
      {notification && (
        <div className="fixed top-18 right-6 z-50 p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 md:py-12 flex flex-col gap-10">
        {/* HEADER TITLE */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 self-start bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] rounded-full px-3.5 py-1 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>FLEET COMMAND &amp; MARINE INTELLIGENCE ENCLAVE</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#0A0F1D]">
            System Overview &amp; Management
          </h1>
          <p className="text-[#4B5563] text-sm md:text-base max-w-3xl">
            Complete administration of operator clearance, MongoDB Atlas mission audit logs, coastal sensor arrays, marine wildlife escalations, and public dataset distribution.
          </p>
        </div>

        {/* 6-TAB CLEAN ADMIN WORKSTATION STRIP */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-2 shadow-sm">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  activeTab === tab.id
                    ? "bg-[#0A0F1D] text-white shadow-sm"
                    : "text-[#4B5563] hover:text-[#0A0F1D] hover:bg-[#F3F4F6]"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={activeTab === tab.id ? "text-[#10B981]" : "text-[#6B7280]"}>{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                    tab.alert
                      ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                      : activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-[#F3F4F6] text-[#6B7280]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: OPERATORS & ACCESS */}
        {/* ======================================================== */}
        {activeTab === "operators" && (
          <section className="flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E7EB] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#0A0F1D]">Operators &amp; Access Clearance</h2>
                <p className="text-[#4B5563] text-xs md:text-sm mt-0.5">
                  Manage naval officers, hydrographers, and evaluators permitted to trigger acoustic scans.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(true)}
                className="bg-[#0A0F1D] hover:bg-black text-white text-xs px-4 py-2.5 rounded-full font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>[+ Add New Officer]</span>
              </button>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      <th className="py-3.5 px-6">Officer Name &amp; Role</th>
                      <th className="py-3.5 px-6">Email Address</th>
                      <th className="py-3.5 px-6">Clearance Status</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {officers.map((off) => (
                      <tr key={off.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-[#0A0F1D]">{off.name}</div>
                          <div className="text-xs text-[#6B7280]">{off.role}</div>
                        </td>
                        <td className="py-4 px-6 text-[#4B5563] font-mono text-xs">{off.email}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              off.status === "Active"
                                ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                                : "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${off.status === "Active" ? "bg-[#10B981]" : "bg-[#EF4444]"}`} />
                            {off.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleOfficerStatus(off.id)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                              off.status === "Active"
                                ? "bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]"
                                : "bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]"
                            }`}
                          >
                            {off.status === "Active" ? "[Block User]" : "[Unblock User]"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MISSION AUDIT LOGS & RESOLUTION FLOWCHART */}
        {/* ======================================================== */}
        {activeTab === "audit" && (
          <section className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* RESOLUTION FLOWCHART IN AUDIT LOGS */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-pulse" />
                  <h3 className="text-sm font-bold text-[#0A0F1D] uppercase tracking-wider">
                    Operational Resolution Flowchart (Atlas Audit Trail)
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#059669] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0] font-semibold">
                  Closed-Loop Lifecycle
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
                {/* Step 1 */}
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[#2563EB]">PHASE 1</span>
                    <Waves className="w-4 h-4 text-[#2563EB]" />
                  </div>
                  <div className="text-xs font-bold text-[#0A0F1D]">[Sonar Anomaly Flagged]</div>
                  <p className="text-[11px] text-[#4B5563] leading-relaxed">
                    Side-scan CHIRP swath acoustic backscatter triggers target shadow detection.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[#7C3AED]">PHASE 2</span>
                    <Zap className="w-4 h-4 text-[#7C3AED]" />
                  </div>
                  <div className="text-xs font-bold text-[#0A0F1D]">[AI Classified]</div>
                  <p className="text-[11px] text-[#4B5563] leading-relaxed">
                    MobileNetV4 neural inference (14ms) matches geometry against Knowledge Base.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[#D97706]">PHASE 3</span>
                    <Radio className="w-4 h-4 text-[#D97706]" />
                  </div>
                  <div className="text-xs font-bold text-[#0A0F1D]">[Admin Approved NAVTEX]</div>
                  <p className="text-[11px] text-[#4B5563] leading-relaxed">
                    Fleet commander verifies hazard severity and authorizes coastal 518 kHz maritime broadcast.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-[#059669]">PHASE 4</span>
                    <Database className="w-4 h-4 text-[#059669]" />
                  </div>
                  <div className="text-xs font-bold text-[#0A0F1D]">[Mission Logged to Atlas DB]</div>
                  <p className="text-[11px] text-[#4B5563] leading-relaxed">
                    Immutable survey coordinates, telemetry, and time-stamped decisions saved to MongoDB Atlas.
                  </p>
                </div>
              </div>
            </div>

            {/* Audit Logs Table Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5E7EB] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#0A0F1D]">Mission Audit Logs</h2>
                <p className="text-[#4B5563] text-xs md:text-sm mt-0.5">
                  Live survey recordings from MongoDB Atlas cloud database.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={loadMissions}
                  disabled={loadingMissions}
                  className="bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-[#0A0F1D] text-xs px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingMissions ? "animate-spin text-[#059669]" : ""}`} />
                  <span>Refresh List</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="bg-[#0A0F1D] hover:bg-black text-white text-xs px-5 py-2 rounded-full font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>[Download as Excel/CSV]</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPurgeConfirmOpen(true)}
                  className="bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-xs px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>[Clear Old Test Data]</span>
                </button>
              </div>
            </div>

            {/* Scans Table */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      <th className="py-3.5 px-6">Timestamp</th>
                      <th className="py-3.5 px-6">Target Identified</th>
                      <th className="py-3.5 px-6">Depth &amp; GPS</th>
                      <th className="py-3.5 px-6">AI Confidence</th>
                      <th className="py-3.5 px-6 text-right">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {missions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-[#9CA3AF] italic text-xs">
                          {loadingMissions ? "Fetching latest scans from database..." : "No sonar scans logged yet. Perform a scan in the Main Workstation to see it appear here!"}
                        </td>
                      </tr>
                    ) : (
                      missions.map((m, idx) => {
                        const ts = m.timestamp
                          ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                            " (" +
                            new Date(m.timestamp).toLocaleDateString([], { month: "short", day: "numeric" }) +
                            ")"
                          : "Today, 14:30";
                        const target = m.target_type || "Acoustic Target";
                        const depth = (m.telemetry?.depth_m ?? m.depth_m ?? 31.9) + " meters depth";
                        const lat = (m.coordinates?.lat ?? 15.429).toFixed(2);
                        const lng = (m.coordinates?.lng ?? 73.8122).toFixed(2);
                        const conf = Math.round((m.confidence || 0.92) * 100);
                        const isHazard = m.threat_severity === "CRITICAL" || m.threat_severity === "HIGH" || target.toLowerCase().includes("net");

                        return (
                          <tr key={m._id || idx} className="hover:bg-[#F9FAFB] transition-colors">
                            <td className="py-4 px-6 text-[#4B5563] text-xs font-mono">{ts}</td>
                            <td className="py-4 px-6 font-bold text-[#0A0F1D]">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isHazard ? "bg-[#EF4444]" : "bg-[#10B981]"}`} />
                                <span>{target}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-xs text-[#4B5563]">
                              <div>{depth}</div>
                              <div className="text-[11px] text-[#9CA3AF]">Lat {lat}° N, Lon {lng}° E</div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                                {conf}% Match
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  isHazard
                                    ? "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"
                                    : "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                                }`}
                              >
                                {isHazard ? "Needs Review" : "Verified"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* TAB 3: COASTAL SENSORS & STATIONS CONTROLLER */}
        {/* ======================================================== */}
        {activeTab === "coastal" && (
          <section className="flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E7EB] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#0A0F1D]">Coastal Sensors &amp; Stations Controller</h2>
                <p className="text-[#4B5563] text-xs md:text-sm mt-0.5">
                  Remote sensor health monitoring, acoustic sound speed recalibration, and telemetry diagnostic testing.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#059669] bg-[#ECFDF5] px-3 py-1.5 rounded-full border border-[#A7F3D0]">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>5 / 5 Ocean Telemetry Stations Live</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {stations.map((st) => (
                <div
                  key={st.id}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[#D1D5DB]"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center font-bold">
                        <Waves className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-[#0A0F1D]">{st.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                        ● {st.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#4B5563] pt-1">
                      <span>Water Temp: <strong className="text-[#0A0F1D] font-mono">{st.temp}</strong></span>
                      <span>•</span>
                      <span>Salinity: <strong className="text-[#0A0F1D] font-mono">{st.salinity}</strong></span>
                      <span>•</span>
                      <span>Sound Speed: <strong className="text-[#2563EB] font-mono">{st.soundSpeed} m/s</strong></span>
                      <span>•</span>
                      <span className="text-[#9CA3AF] font-mono text-[11px]">Last Ping: {st.lastPing}</span>
                    </div>
                  </div>

                  {/* Station Admin Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-[#F3F4F6]">
                    <button
                      type="button"
                      onClick={() => handleRecalibrateStation(st.id, st.name)}
                      className="bg-white hover:bg-[#F9FAFB] border border-[#D1D5DB] hover:border-[#0A0F1D] text-[#0A0F1D] text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>[Recalibrate Sound Speed (1533 m/s)]</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDiagnosticPing(st.id, st.name)}
                      className="bg-[#0A0F1D] hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <Activity className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>[Trigger Diagnostic Ping]</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* TAB 4: eDNA & ENDANGERED WILDLIFE ESCALATIONS */}
        {/* ======================================================== */}
        {activeTab === "wildlife" && (
          <section className="flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E7EB] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#0A0F1D]">eDNA &amp; Endangered Wildlife Escalations</h2>
                <p className="text-[#4B5563] text-xs md:text-sm mt-0.5">
                  Real-time review queue of high-priority bio-alerts flagged by water metagenomic assays.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#D97706] bg-[#FFFBEB] px-3 py-1.5 rounded-full border border-[#FDE68A]">
                <AlertTriangle className="w-4 h-4" />
                <span>Sanctuary Protection Protocol Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {bioAlerts.map((bio) => {
                const isPending = bio.status === "Pending Action";
                return (
                  <div
                    key={bio.id}
                    className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-5 transition-all ${
                      isPending ? "border-[#FDE68A]" : "border-[#E5E7EB]"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                              bio.iucn === "ENDANGERED"
                                ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                                : "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
                            }`}
                          >
                            🚨 IUCN RED LIST: {bio.iucn}
                          </span>
                          <span className="text-xs font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                            {bio.confidence} Match
                          </span>
                        </div>
                        <span className="text-xs text-[#9CA3AF] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {bio.timestamp}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-[#0A0F1D] leading-snug">
                          {bio.title}
                        </h3>
                        <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                          {bio.details}
                        </p>
                      </div>

                      <div className="text-xs font-mono text-[#6B7280] bg-[#F9FAFB] p-3 rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                        <span>Marine Zone: <strong>{bio.sector}</strong></span>
                        <span className="text-[#059669] font-bold">● Protected Sanctuary Corridor</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {isPending ? (
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-[#F3F4F6]">
                        <button
                          type="button"
                          onClick={() => handleBroadcastTrawlerExclusion(bio.id)}
                          className="w-full sm:flex-1 bg-[#059669] hover:bg-[#047857] text-white text-xs md:text-sm py-2.5 px-5 rounded-full font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                          <Radio className="w-4 h-4" />
                          <span>[Broadcast Trawler Exclusion Zone Notice]</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDismissBioAlert(bio.id)}
                          className="w-full sm:w-auto text-[#6B7280] hover:text-[#DC2626] text-xs py-2.5 px-4 rounded-full font-medium transition-colors cursor-pointer border border-[#E5E7EB] hover:bg-[#FEF2F2]"
                        >
                          [Dismiss as Environmental Trace]
                        </button>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-[#F3F4F6] text-xs text-[#059669] font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                        <span>NAVTEX Trawler speed restriction actively broadcasting across coastal radar channels.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* TAB 5: DATASET CATALOG MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === "datasets" && (
          <section className="flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E7EB] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#0A0F1D]">Dataset Catalog Management</h2>
                <p className="text-[#4B5563] text-xs md:text-sm mt-0.5">
                  Overview of public repositories, automated format conversion, and access permissions.
                </p>
              </div>

              {/* Admin Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Stat Pill */}
                <span className="font-mono text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] px-3.5 py-2 rounded-full shadow-sm">
                  Total Downloads Today: 48 Files (6.2 GB)
                </span>

                {/* Toggle: Allow Public Guest Downloads */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !publicDownloadsAllowed;
                    setPublicDownloadsAllowed(next);
                    showNotification(`Public Guest Downloads are now ${next ? "ENABLED" : "MUTED"}.`);
                  }}
                  className={`text-xs font-bold px-4 py-2 rounded-full border transition-all cursor-pointer flex items-center gap-2 ${
                    publicDownloadsAllowed
                      ? "bg-[#0A0F1D] text-white border-[#0A0F1D]"
                      : "bg-white text-[#6B7280] border-[#D1D5DB]"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>[Allow Public Guest Downloads: {publicDownloadsAllowed ? "ON" : "OFF"}]</span>
                </button>

                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => setIsUploadBatchOpen(true)}
                  className="bg-[#059669] hover:bg-[#047857] text-white text-xs px-4 py-2 rounded-full font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>[+ Upload New Marine Dataset Batch]</span>
                </button>
              </div>
            </div>

            {/* Repositories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {datasets.map((ds) => (
                <div
                  key={ds.id}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 transition-all hover:border-[#D1D5DB]"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280] bg-[#F9FAFB] px-2.5 py-0.5 rounded border border-[#E5E7EB]">
                        {ds.category} • {ds.format}
                      </span>
                      <span className="text-xs font-semibold text-[#059669] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                        ● {ds.syncFrequency}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#0A0F1D] leading-snug">
                      {ds.name}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-[#4B5563] pt-1">
                      <span>Repository Size: <strong className="text-[#0A0F1D] font-mono">{ds.size}</strong></span>
                      <span>Downloaded Today: <strong className="text-[#2563EB] font-mono">{ds.downloadsToday} files</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#F3F4F6] text-xs">
                    <span className="text-[#9CA3AF] text-[11px] font-mono">IHO S-44 Standard Provenance</span>
                    <button
                      type="button"
                      onClick={() => showNotification(`Triggered instant manual sync for ${ds.name}.`)}
                      className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold text-xs cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Sync Ledger</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* TAB 6: MARITIME DISPATCH QUEUE */}
        {/* ======================================================== */}
        {activeTab === "dispatch" && (
          <section className="flex flex-col gap-6 animate-in fade-in duration-200">
            <div className="border-b border-[#E5E7EB] pb-4">
              <h2 className="text-xl font-bold text-[#0A0F1D]">Maritime Dispatch Queue</h2>
              <p className="text-[#4B5563] text-xs md:text-sm mt-0.5">
                Emergency seafloor warnings detected by operators awaiting clearance before dispatching to ships via coastal radio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {alerts.map((al) => {
                const isPending = al.status === "Pending Approval";
                return (
                  <div
                    key={al.id}
                    className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-5 transition-all ${
                      isPending ? "border-[#FDE68A]" : "border-[#E5E7EB]"
                    }`}
                  >
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            isPending
                              ? "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"
                              : "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                          }`}
                        >
                          {al.status}
                        </span>
                        <span className="text-xs text-[#9CA3AF] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {al.timestamp}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#0A0F1D] leading-snug">
                        {al.title}
                      </h3>

                      <p className="text-xs text-[#4B5563] leading-relaxed">
                        {al.details}
                      </p>

                      <div className="text-xs font-mono text-[#6B7280] bg-[#F9FAFB] p-2.5 rounded-xl border border-[#E5E7EB]">
                        Location: {al.location}
                      </div>
                    </div>

                    {isPending ? (
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#F3F4F6]">
                        <button
                          type="button"
                          onClick={() => handleApproveWarning(al.id)}
                          className="w-full sm:flex-1 bg-[#059669] hover:bg-[#047857] text-white text-xs md:text-sm py-2.5 px-4 rounded-full font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Radio className="w-4 h-4" />
                          <span>[Approve &amp; Send Warning to Ships]</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDismissWarning(al.id)}
                          className="w-full sm:w-auto text-[#6B7280] hover:text-[#DC2626] text-xs py-2.5 px-4 rounded-full font-medium transition-colors cursor-pointer border border-[#E5E7EB] hover:bg-[#FEF2F2]"
                        >
                          [Dismiss Warning]
                        </button>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-[#F3F4F6] text-xs text-[#059669] font-semibold flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        <span>Warning actively transmitted across regional coastal frequencies (518 kHz).</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* AI & Sensor Calibration Panel */}
            <div className="mt-6 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#F3F4F6] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[#0A0F1D]">Sonar Calibration &amp; Noise Filter</h3>
                  <p className="text-xs text-[#4B5563] mt-0.5">
                    Adjust acoustic ping distance and background wake noise filtering.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetCalibration}
                  className="bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-[#4B5563] hover:text-[#0A0F1D] text-xs px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>[Reset to Factory Default]</span>
                </button>
              </div>

              {settingsNotice && (
                <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  <span>{settingsNotice}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0A0F1D]">AI Bubble &amp; Wake Noise Filter</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !aiNoiseFilter;
                        setAiNoiseFilter(next);
                        showNotification(`AI Noise Filter is now ${next ? "ENABLED" : "DISABLED"}.`);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                        aiNoiseFilter ? "bg-[#0A0F1D] text-white border-[#0A0F1D]" : "bg-white text-[#6B7280] border-[#D1D5DB]"
                      }`}
                    >
                      {aiNoiseFilter ? "ACTIVE: ON" : "MUTED: OFF"}
                    </button>
                  </div>
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    Automatically subtracts marine surface wake and small fish schools from target classification.
                  </p>
                </div>

                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0A0F1D]">Acoustic Range Calibration</span>
                    <span className="font-mono text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] px-2.5 py-0.5 rounded-full">
                      {sonarRange} Meters
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={sonarRange}
                    onChange={(e) => setSonarRange(parseInt(e.target.value))}
                    className="w-full accent-[#0A0F1D] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#9CA3AF]">
                    <span>10m (Harbor)</span>
                    <span>100m (Deep Ocean)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* BOTTOM RETURN TO CONSOLE FOOTER */}
        <div className="p-8 rounded-3xl bg-white border border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-[#0A0F1D]">Ready to return to the survey screen?</h4>
            <p className="text-xs text-[#4B5563]">Switch back to the Operator Workstation to upload sonar images or inspect real-time maps.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#0A0F1D] hover:bg-black text-white text-xs md:text-sm px-6 py-3 rounded-full font-medium transition-all shadow-md cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>[← Back to Main Workstation]</span>
          </button>
        </div>
      </main>

      {/* POPUP: ADD NEW OFFICER */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
              <h3 className="text-base font-bold text-[#0A0F1D] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#059669]" />
                <span>Add New Officer</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="text-[#9CA3AF] hover:text-[#0A0F1D] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOfficer} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="text-[#374151] block mb-1 font-bold">Officer Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Lt. A. Sharma"
                  className="w-full bg-[#F9FAFB] border border-[#D1D5DB] focus:border-[#0A0F1D] rounded-xl px-3.5 py-2.5 text-[#0A0F1D] outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-[#374151] block mb-1 font-bold">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. a.sharma@navy.mil"
                  className="w-full bg-[#F9FAFB] border border-[#D1D5DB] focus:border-[#0A0F1D] rounded-xl px-3.5 py-2.5 text-[#0A0F1D] outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-[#374151] block mb-1 font-bold">Role Assignment</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#D1D5DB] focus:border-[#0A0F1D] rounded-xl px-3.5 py-2.5 text-[#0A0F1D] outline-none text-sm cursor-pointer"
                >
                  <option value="Duty Hydrographer">Duty Hydrographer</option>
                  <option value="Chief Hydrographer">Chief Hydrographer</option>
                  <option value="Evaluator">Evaluator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F3F4F6]">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#D1D5DB] text-[#4B5563] hover:bg-[#F9FAFB] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#0A0F1D] hover:bg-black text-white font-medium shadow-md cursor-pointer"
                >
                  Create Officer Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP: UPLOAD NEW MARINE DATASET BATCH */}
      {isUploadBatchOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
              <h3 className="text-base font-bold text-[#0A0F1D] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#059669]" />
                <span>Upload Marine Dataset Batch</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadBatchOpen(false)}
                className="text-[#9CA3AF] hover:text-[#0A0F1D] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadBatch} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="text-[#374151] block mb-1 font-bold">Dataset Batch Title</label>
                <input
                  type="text"
                  required
                  value={newDatasetTitle}
                  onChange={(e) => setNewDatasetTitle(e.target.value)}
                  placeholder="e.g. Malabar Coast Hydrographic Soundings"
                  className="w-full bg-[#F9FAFB] border border-[#D1D5DB] focus:border-[#0A0F1D] rounded-xl px-3.5 py-2.5 text-[#0A0F1D] outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-[#374151] block mb-1 font-bold">Data Format / Standard</label>
                <select
                  value={newDatasetFormat}
                  onChange={(e) => setNewDatasetFormat(e.target.value)}
                  className="w-full bg-[#F9FAFB] border border-[#D1D5DB] focus:border-[#0A0F1D] rounded-xl px-3.5 py-2.5 text-[#0A0F1D] outline-none text-sm cursor-pointer"
                >
                  <option value="NetCDF / CSV">NetCDF / CSV</option>
                  <option value="GeoTIFF / SSS">GeoTIFF / SSS</option>
                  <option value="FASTA / JSON">FASTA / JSON</option>
                  <option value="Parquet / CSV">Parquet / CSV</option>
                </select>
              </div>

              <div className="p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] text-[#4B5563] text-[11px] leading-relaxed">
                Datasets uploaded through Fleet Command are verified against IHO S-44 standards and immediately synced to the public Marine Data Catalog.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F3F4F6]">
                <button
                  type="button"
                  onClick={() => setIsUploadBatchOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#D1D5DB] text-[#4B5563] hover:bg-[#F9FAFB] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-semibold shadow-md cursor-pointer"
                >
                  Index &amp; Publish Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP: CLEAR TEST DATA CONFIRMATION */}
      {purgeConfirmOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-[#FECACA] rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-[#DC2626] font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Clearing Test Data</span>
            </div>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              This will remove dummy and test scan records from the database so your survey log stays tidy. Genuine scans can always be created again in the workstation.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F3F4F6]">
              <button
                type="button"
                onClick={() => setPurgeConfirmOpen(false)}
                className="px-5 py-2.5 rounded-full border border-[#D1D5DB] text-[#4B5563] hover:bg-[#F9FAFB] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurgeLogs}
                className="px-6 py-2.5 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium text-xs shadow-md cursor-pointer"
              >
                Yes, Clear Test Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
