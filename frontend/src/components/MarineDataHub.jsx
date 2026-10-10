import React, { useState } from "react";
import { Database, Download, FileText, Activity, Dna, Fish, Filter, CheckCircle2 } from "lucide-react";

const DATASETS = [
  {
    id: "ds1",
    category: "Telemetry",
    title: "Ocean Temperature & Currents Data",
    description: "Multi-mission CTD profiles, sea surface temperature grids, and hydrodynamic ADCP flow velocities.",
    format: "NetCDF / CSV",
    size: "1.2 GB",
    status: "Daily Updates",
    badgeColor: "text-cyan-400 bg-cyan-950/60 border-cyan-800/60",
    icon: Activity,
    sampleFile: "oceanography_sst_adcp_sample.csv",
    sampleContent: `TIMESTAMP_UTC,LATITUDE,LONGITUDE,SST_CELSIUS,SALINITY_PSU,CURRENT_KNOTS,HEADING_DEG,DISSOLVED_O2_MGL\n2026-09-11T12:00:00Z,15.4290,73.8122,28.4,34.8,0.42,042,6.8\n2026-09-11T13:00:00Z,15.4295,73.8128,28.5,34.8,0.44,040,6.7\n2026-09-11T14:00:00Z,15.4300,73.8135,28.3,34.9,0.41,045,6.9\n`
  },
  {
    id: "ds2",
    category: "Acoustic",
    title: "Seafloor Sonar Scans (455 kHz)",
    description: "Raw dual-channel acoustic waterfall recordings, radiometric backscatter GeoTIFFs, and target shadow logs.",
    format: "GeoTIFF / SSS",
    size: "4.8 GB",
    status: "Live Feed",
    badgeColor: "text-amber-400 bg-amber-950/60 border-amber-800/60",
    icon: FileText,
    sampleFile: "sidescan_sonar_455khz_metadata.json",
    sampleContent: JSON.stringify({
      survey_id: "SSS-2026-GOA-455",
      sensor: "EdgeTech 4200 Dual-Frequency CHIRP",
      frequency_khz: 455,
      horizontal_beamwidth_deg: 0.26,
      swath_range_m: 75,
      records: 1420,
      targets_logged: ["Ghost Net filament", "Pipeline crossing", "Wreck keel section"]
    }, null, 2)
  },
  {
    id: "ds3",
    category: "Biology",
    title: "Marine DNA & Species Records",
    description: "Next-generation environmental DNA 16S/18S ribosomal assays matched against regional marine sanctuaries.",
    format: "FASTA / JSON",
    size: "420 MB",
    status: "Weekly Updates",
    badgeColor: "text-emerald-400 bg-emerald-950/60 border-emerald-800/60",
    icon: Dna,
    sampleFile: "benthic_edna_metabarcoding.fasta",
    sampleContent: `>EDNA_TRACE_001 | Balaenoptera musculus (Blue Whale) | Confidence: 94.2%\nATGACCAACATTCGAAAATCCCACCCACTAATAAAAATTATCAATCACTCATTCACTGA\n>EDNA_TRACE_002 | Lepidochelys olivacea (Olive Ridley Turtle) | Confidence: 91.8%\nATGTTTATTAACCGATGACTATTCTCAACTAACCACAAAGACATTGGTACCCTCTATTT\n`
  },
  {
    id: "ds4",
    category: "Fisheries",
    title: "Commercial Fishing Catch Logs",
    description: "Regional fisheries landing ledger, automated AIS fleet geofence tracking, and MSY quota logs.",
    format: "Parquet",
    size: "850 MB",
    status: "Monthly Updates",
    badgeColor: "text-purple-400 bg-purple-950/60 border-purple-800/60",
    icon: Fish,
    sampleFile: "fisheries_catch_stock_msy.csv",
    sampleContent: `ZONE_ID,PORT,PRIMARY_SPECIES,SEASONAL_CATCH_TONS,MSY_LIMIT_TONS,CAPACITY_UTILIZATION_PCT,STATUS\nIN-GA-01,Marmagao,Indian Mackerel,3420,4400,77.7%,SUSTAINABLE\nIN-MH-02,Mumbai High,Bombay Duck,5120,6000,85.3%,WARNING_THRESHOLD\nIN-KL-03,Cochin Port,Oil Sardine,2890,4100,70.5%,HEALTHY\n`
  }
];

export default function MarineDataHub() {
  const [filter, setFilter] = useState("All");
  const [downloadedId, setDownloadedId] = useState(null);

  const filtered = filter === "All" ? DATASETS : DATASETS.filter((d) => d.category === filter);

  const handleDownload = (ds) => {
    const blob = new Blob([ds.sampleContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ds.sampleFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadedId(ds.id);
    setTimeout(() => setDownloadedId(null), 3000);
  };

  return (
    <section id="section-data-catalog" className="w-full py-4 space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Marine Data Catalog
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Free open ocean datasets for researchers, port authorities, and coast guards.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
          {["All", "Acoustic", "Biology", "Telemetry", "Fisheries"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === tab
                  ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Dataset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filtered.map((ds) => {
          const IconComponent = ds.icon;
          const isJustDownloaded = downloadedId === ds.id;
          return (
            <div
              key={ds.id}
              className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-cyan-400 group-hover:text-cyan-300 transition-colors">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${ds.badgeColor}`}>
                    ● {ds.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                    {ds.category} • {ds.format}
                  </span>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-2 mt-0.5">
                    {ds.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {ds.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Size: <strong className="text-slate-200">{ds.size}</strong></span>
                  <span className="text-slate-500">IHO S-44 Standard</span>
                </div>

                <button
                  onClick={() => handleDownload(ds)}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                    isJustDownloaded
                      ? "bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                      : "bg-slate-800/90 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/20"
                  }`}
                >
                  {isJustDownloaded ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Downloaded Sample</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>[Download Sample Data]</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
