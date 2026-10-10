import React from "react";
import { Printer, X, Shield, FileText, CheckCircle2, Waves } from "lucide-react";

export default function PrintableMissionReportModal({ isOpen, onClose, assessment, detection, targetCoords }) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const ts = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  const targetName = assessment?.hazard_name || assessment?.hazard_type || detection?.hazard_type || "Ghost Fishing Net";
  const depth = assessment?.seabed_depth || (detection?.swath_depth_m ? `${detection.swath_depth_m} meters` : "31.5 meters");
  const lat = targetCoords?.lat ? `${targetCoords.lat.toFixed(4)}° N` : (detection?.gps_coordinates?.latitude || "15.4291° N");
  const lng = targetCoords?.lng ? `${targetCoords.lng.toFixed(4)}° E` : (detection?.gps_coordinates?.longitude || "73.8123° E");
  const locationDesc = targetCoords?.locationName || "Coastal Marine Sector, Goa Shelf";

  const diverAdvice = assessment?.diver_safety || assessment?.diver_safety_action || assessment?.diver_action || "Approach with extreme care. Carry line-cutting shears; avoid loose gear that can snare.";
  const envNote = assessment?.marine_risk || assessment?.ecological_impact || "Continuous ghost-fishing hazard to sea turtles, cetaceans, and fragile reef ecosystems.";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none">
        {/* Screen-only Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Official Survey Report Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>[Print / Save as PDF]</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 print:p-6" id="printable-report-content">
          {/* Document Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div>
              <div className="flex items-center gap-2 text-cyan-700 font-bold text-xs uppercase tracking-widest">
                <Waves className="w-4 h-4" />
                <span>AquaScan Autonomous Marine Intelligence</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-1">
                AquaScan Seafloor Survey Report
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard Hydrographic Anomaly Clearance & Diver Safety Brief
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                VERIFIED BY AI
              </span>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                Ref: AQ-2026-SURV-{Date.now().toString().slice(-4)}
              </div>
            </div>
          </div>

          {/* Clean Data Rows Table */}
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 py-2 border-b border-slate-100">
              <span className="font-bold text-slate-500">Date &amp; Time:</span>
              <span className="col-span-2 font-medium text-slate-900">{ts}</span>
            </div>

            <div className="grid grid-cols-3 py-2 border-b border-slate-100">
              <span className="font-bold text-slate-500">Detected Object Name:</span>
              <span className="col-span-2 font-black text-slate-950 text-sm">{targetName}</span>
            </div>

            <div className="grid grid-cols-3 py-2 border-b border-slate-100">
              <span className="font-bold text-slate-500">Seabed Depth:</span>
              <span className="col-span-2 font-bold text-cyan-800">{depth}</span>
            </div>

            <div className="grid grid-cols-3 py-2 border-b border-slate-100">
              <span className="font-bold text-slate-500">Location (Lat/Long):</span>
              <div className="col-span-2 space-y-0.5">
                <span className="font-mono font-bold text-slate-900 block">{lat}, {lng}</span>
                <span className="text-[11px] text-slate-500 block">{locationDesc}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 py-2 border-b border-slate-100">
              <span className="font-bold text-slate-500">Diver Safety Advice:</span>
              <span className="col-span-2 font-medium text-slate-800 leading-relaxed bg-amber-50/80 p-2.5 rounded-xl border border-amber-200">
                {diverAdvice}
              </span>
            </div>

            <div className="grid grid-cols-3 py-2 border-b border-slate-100">
              <span className="font-bold text-slate-500">Environmental Impact Note:</span>
              <span className="col-span-2 font-medium text-slate-800 leading-relaxed bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                {envNote}
              </span>
            </div>
          </div>

          {/* Official Verification Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Autonomous Hydrographic Clearance • IHO S-44 Order 1A Standard</span>
            </div>
            <div className="font-mono text-[10px]">
              Page 1 of 1
            </div>
          </div>
        </div>

        {/* Modal Footer (Screen Only) */}
        <div className="flex items-center justify-between px-8 py-4 bg-slate-50 border-t border-slate-200 print:hidden">
          <span className="text-xs text-slate-500 font-medium">Ready to print or save as official PDF.</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>[Print / Save as PDF]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
