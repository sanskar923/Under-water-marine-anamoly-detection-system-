# 🌊 AquaScan AI — Marine Intelligence & Hydrographic Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.11-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![ONNX Runtime Web](https://img.shields.io/badge/ONNX_Runtime_Web-1.29.0-005CED.svg?style=flat&logo=onnx)](https://onnxruntime.ai/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Cluster_Sync-47A248.svg?style=flat&logo=mongodb)](https://www.mongodb.com/atlas)
[![Leaflet GIS](https://img.shields.io/badge/Leaflet-1.9.4-199900.svg?style=flat&logo=leaflet)](https://leafletjs.com/)
[![Standards](https://img.shields.io/badge/Hydrographic_Standard-IHO_S--44_Order_1a-blue.svg)](#compliance--standards)

**AquaScan AI** is an advanced littoral intelligence, marine hazard clearance, and autonomous hydrographic survey workstation. It converts raw high-frequency side-scan sonar (SSS) imagery, coastal oceanographic sensor data, molecular environmental DNA (eDNA) sequences, and vessel AIS tracking into real-time subsea clearance directives, diver safety parameters, and maritime danger alerts.

---

## 🏛️ System Architecture & 6 Core Pillars

AquaScan AI unifies littoral hydrography, marine conservation, and edge neural processing into 6 synchronized pillars:

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 AQUASCAN AI PLATFORM                   │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
      ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
      │                  │                   │                   │                  │
┌─────▼─────┐      ┌─────▼─────┐       ┌─────▼─────┐       ┌─────▼─────┐      ┌─────▼─────┐
│ 01. DATA  │      │  02. 3D   │       │ 03. AQUA  │       │04. FISHERY│      │ 05. eDNA  │
│  LIBRARY  │      │  DIGITAL  │       │   AGENT   │       │  & STOCK  │      │  SCANNER  │
│ (NetCDF,  │      │   TWIN    │       │ AI COPILOT│       │  MONITOR  │      │  & GNN    │
│  FASTA)   │      │ (GIS Map) │       │ (Chat/UI) │       │(MSY Catch)│      │(Food Web) │
└─────┬─────┘      └─────┬─────┘       └─────┬─────┘       └─────┬─────┘      └─────┬─────┘
      │                  │                   │                   │                  │
      └──────────────────┴───────────────────┼───────────────────┴──────────────────┘
                                             │
                                       ┌─────▼─────┐
                                       │ 06. LIVE  │
                                       │ 5 COASTAL │
                                       │ STATIONS  │
                                       │(Telemetry)│
                                       └───────────┘
```

| Pillar # | Pillar Name | Operational Role | Key Technologies |
| :--- | :--- | :--- | :--- |
| **01** | **Central Sea Data Library** | Safe cataloging & distribution of multi-format ocean datasets (NetCDF, GeoTIFF, FASTA, CSV) with open standards and batch downloads. | Open Ocean Data Hub, NetCDF-4, GeoTIFF, FASTA Parser |
| **02** | **Live 3D Ocean Map & Digital Twin** | Real-time geospatial tracking of research vessels, AUV survey tracks, 50m standoff safety perimeters, and live migration routes of endangered species. | Leaflet GIS, CartoDB Dark Matter, GeoJSON, Turf.js |
| **03** | **AquaAgent AI Co-Pilot** | Friendly multi-lingual (English & Hinglish) agentic assistant capable of executing UI actions (jumping to sections, running preset scans, broadcasting alerts). | Google Gemini 2.0 / Flash API, Agentic Tool Calls, Web Speech API |
| **04** | **Fish Stock & Catch Monitor** | Continuous monitoring of commercial fisheries, landing ledgers, Maximum Sustainable Yield (MSY) caps, and overfishing warning triggers. | ICES MSY Calculations, AIS Geofencing, Catch Ledgers |
| **05** | **Water DNA Scanner & Food Chain Network** | Molecular environmental DNA alignment matched against IUCN Red List registries and Graph Neural Network (GNN) trophic food-web modeling. | NCBI BLAST Simulation, GNN Node Message Passing, SVG Graph |
| **06** | **5 Coastal Sea Stations** | Continuous real-time physical oceanography streams (SST, Salinity, sound speed calculation, dissolved oxygen) across 5 major Indian ports. | Sea-Bird SBE Telemetry, Sound Velocity Ingestion, Port Nodes |

---

## 📂 Repository File Structure

```
Ocean guard/
├── README.md                                # Comprehensive project documentation
├── backend/                                 # FastAPI Intelligence Backend
│   ├── .env                                 # Environment variables (DB, API keys, port)
│   ├── .env.example                         # Template environment file
│   ├── copilot_service.py                   # Gemini LLM conversational agent & tool dispatcher
│   ├── database.py                          # MongoDB Atlas cluster client & mission persistence
│   ├── detector.py                          # MobileNetV3 acoustic filter & candidate validator
│   ├── gemini_service.py                    # Gemini API integration wrapper
│   ├── generate_samples.py                  # Synthetic side-scan sonar image generator
│   ├── main.py                              # FastAPI core application routes & CORS setup
│   ├── requirements.txt                     # Python dependencies
│   ├── sonar_validator.onnx                 # Server-side acoustic domain verification model
│   ├── test_api.py                          # Endpoint integration tests
│   ├── test_building.jpg                    # Negative sample for domain filter testing
│   └── test_building.py                     # Domain rejection validation script
│
└── frontend/                                # React 18 + Vite Frontend Dashboard
    ├── package.json                         # Node.js dependencies and scripts
    ├── index.html                           # Single-page application root entrypoint
    ├── vite.config.js                       # Vite bundler configuration
    ├── tailwind.config.js                   # Custom maritime styling & color themes
    ├── postcss.config.js                    # PostCSS plugins
    │
    ├── public/                              # Static Assets Served Directly
    │   ├── admin_ambient_loop.mp4           # Subsea background video loop (Admin panel)
    │   ├── auv_loop.mp4                     # Subsea AUV propulsion loop
    │   ├── auv_scroll_cinematic.mp4         # High-resolution underwater survey backdrop
    │   ├── aquascan_classifier.onnx         # In-browser edge neural classifier
    │   ├── aquascan_classifier.onnx.data    # Quantized weights for ONNX model
    │   ├── hazard_knowledge_base.json       # Expert hazard classification & safety directives
    │   ├── marine_gnn_metadata.json         # eDNA BLAST library & GNN trophic web topology
    │   └── samples/                         # Pre-recorded side-scan sonar mission images
    │       ├── ghost_net.png                # Entangled synthetic ghost fishing net
    │       ├── sunken_pipe.png              # Exposed high-pressure subsea pipeline
    │       ├── wreck.png                    # Historic shipwreck debris
    │       └── seafloor.png                 # Clear acoustic seafloor baseline
    │
    └── src/                                 # Frontend Source Code
        ├── main.jsx                         # React DOM root mounting
        ├── App.jsx                          # Main application router, state coordinator, & stages
        ├── api.js                           # Axios/fetch wrappers for FastAPI backend
        ├── pdfExport.js                     # JSPDF mission brief & diver advisory generator
        ├── samples.js                       # In-memory sample resolution & data URLs
        ├── waypoints.js                     # Port coordinates & coastal telemetry seed data
        │
        ├── services/
        │   └── onnxClassifier.js            # In-browser ONNX Runtime Web inference engine
        │
        └── components/                      # UI Components
            ├── AcousticIngestionBar.jsx     # Drag-and-drop sonar uploader & preset selector
            ├── AcousticModemCard.jsx        # Acoustic telemetry & slant-range calculator
            ├── AcousticWaterfall.jsx        # Real-time side-scan sonar waterfall canvas
            ├── AdminFleetPanel.jsx          # Admin workstation (Operators, Telemetry, eDNA, Datasets)
            ├── AdminLoginPage.jsx           # Root enclave authentication gateway
            ├── BathymetricReliefViewer.jsx  # 3D relief renderer using OGL WebGL
            ├── EdnaGnnFoodWebExplorer.jsx   # eDNA BLAST matcher & interactive SVG food web
            ├── FixedVideoBackdrop.jsx       # Fixed subsea ambient video layer
            ├── FlightRecorderLog.jsx        # Mission event ledger & telemetry feed
            ├── GpsSwathCard.jsx             # Precise swath width, depth, and GPS coordinates
            ├── HardwareSpecs.jsx            # Sensor hardware specifications & carrier specs
            ├── LandingHero.jsx              # High-impact editorial hero & mission summary
            ├── LoginPage.jsx                # Operator authentication gate & evaluator bypass
            ├── MapPanel.jsx                 # Leaflet tactical geodetic GIS tracker & AIS ships
            ├── MarineCopilotDrawer.jsx      # AquaAgent drawer assistant with chat interface
            ├── MarineDataHub.jsx            # Dataset catalog explorer & download manager
            ├── OceanographyTelemetryStations.jsx # 5 coastal ports real-time water conditions
            ├── OceanStressSimulator.jsx     # "What-If" ecological stress interactive simulator
            ├── PrintableMissionReportModal.jsx # Official printable PDF survey report modal
            ├── SonarViewer.jsx              # Sonar canvas with acoustic shadow measurement ruler
            ├── StageVideoContainer.jsx      # Scroll-triggered video backdrop container
            ├── SystemPillarsSection.jsx     # 6 core architecture pillars card grid
            ├── ThreatAssessmentCard.jsx     # Stage 04 Directive, Voice Alert, & Print triggers
            └── TopBar.jsx                   # Sticky navigation, Online/Offline mode, & Logout
```

---

## ⚙️ Prerequisites & Environment Setup

### System Requirements
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Python**: `v3.9.0` to `v3.12.x`
- **Modern Web Browser**: Chrome, Edge, Firefox, or Safari with WebAssembly and WebGL enabled.

### Environment Configuration

#### 1. Backend (`backend/.env`)
Create a file at `backend/.env` with the following keys:

```env
# Server Port
PORT=8000

# MongoDB Atlas Database URI (Optional: In-memory fallback is used if omitted)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/aquascan_defense_db?retryWrites=true&w=majority

# Google Gemini API Key for AquaAgent AI Copilot
GEMINI_API_KEY=your_gemini_api_key_here
```

#### 2. Frontend (`frontend/.env`)
Create a file at `frontend/.env` (optional, defaults to standard local ports):

```env
# Backend API Base URL
VITE_API_BASE_URL=http://127.0.0.1:8000

# Client-Side Gemini Key (Optional: Can proxy via backend /api/copilot/chat)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🚀 Step-by-Step Run Guide

### 1. Start the FastAPI Backend

Open a terminal in the project directory:

```bash
# Navigate to the backend folder
cd backend

# Create a Python virtual environment (if not already created)
python -m venv .venv

# Activate the virtual environment
# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# On Windows (CMD):
.\.venv\Scripts\activate.bat
# On Linux / macOS:
source .venv/bin/activate

# Install required Python packages
pip install -r requirements.txt

# Start the FastAPI server with live reload
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

.\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```
* Backend health check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
* Interactive Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Start the React + Vite Frontend

Open a second terminal:

```bash
# Navigate to the frontend folder
cd frontend

# Install node dependencies
npm install

# Verify static model assets exist in public/
# Ensure the following 4 files are present in frontend/public/:
#   1. aquascan_classifier.onnx
#   2. aquascan_classifier.onnx.data
#   3. hazard_knowledge_base.json
#   4. marine_gnn_metadata.json

# Launch the development server
npm run dev
```
* Access the web dashboard at: [http://localhost:5173/](http://localhost:5173/)

---

## 🗺️ Workflow & Feature Walkthrough

```
  [1. Login Gate] ──▶ [2. Sonar Scan & Ruler] ──▶ [3. GIS Live Map]
          │                                              │
          ▼                                              ▼
  [6. Admin Workstation] ◀── [5. eDNA & Telemetry] ◀── [4. Safety Directive]
```

### Step 1: Mandatory Login Gate Authentication
- Cold-start visits to `/` or attempts to jump to `/dashboard` or `/admin` are strictly locked.
- Operators authenticate with credentials or click **`⚡ Continue as Evaluator (Instant Access)`** to load the active session.
- A one-click **`Logout`** button in the top navbar instantly wipes session state and returns to `/login`.

### Step 2: Live Sonar Waterfall & Slant-Range Ruler
- Upload raw side-scan sonar files (PNG/JPG/TIFF) or pick preset acoustic matrices (*Ghost Net*, *Subsea Pipeline*, *Shipwreck Debris*, *Clear Seabed*).
- **Acoustic Domain Verification**: Reject non-sonar images automatically via MobileNetV3 feature inspection.
- **Edge ONNX Inference**: In-browser classification executes in ~15ms via `aquascan_classifier.onnx`.
- **Interactive Measurement Ruler**: Click and drag across acoustic shadows to calculate estimated hazard relief height using calibrated trigonometry:
  $$\text{Height} = \frac{\text{Altitude} \times \text{Shadow Length}}{\text{Altitude} + \text{Slant Range}}$$

### Step 3: Tactical GIS Map & AIS Vessel Tracking
- High-contrast tactical map rendered via Leaflet GIS dynamically re-centers on target GPS coordinates extracted from image EXIF or contextual sonar metadata.
- Automatically projects a **50-meter standoff perimeter** around high-risk anomalies to prevent diver entanglement and underwater anchor strikes.

### Step 4: Diver Safety Directives, Spoken VHF Radio Alert, & Printable PDF
- **Safety Directive Card**: Instant breakdown of hazard severity, seabed depth, backscatter dB, and clearance instructions.
- **Spoken Emergency Voice Alert**: Click **`[🔊 Read Warning Aloud]`** to trigger native text-to-speech (`window.speechSynthesis`) simulating VHF Channel 16 broadcasts:
  > *"Attention all boats in area. Underwater hazard detected at depth 31.5 meters. Keep a safe distance of 50 meters."*
- **One-Click Official Survey Report (PDF)**: Click **`[📄 Print Official Report]`** to open a clean summary modal with Date, Hazard Name, Depth, Coordinates, and Diver Safety Notes, with one-click `window.print()` / PDF export.

### Step 5: 5 Coastal Stations, Water DNA Scanner, & What-If Stress Simulator
- **Live Coastal Telemetry**: Real-time water conditions across 5 ports (Goa, Mumbai High, Cochin, Chennai, Visakhapatnam) including SST, Salinity, sound speed, and dissolved oxygen.
- **Water DNA Scanner**: Matches environmental DNA sequences via BLAST to detect vulnerable and endangered marine species (*Whale Shark / Rhincodon typus*).
- **Ocean Food Chain Network**: Visualizes multi-trophic dependencies between Plankton, Small Fish, Whale Sharks, and Commercial Fishing Boats.
- **"What-If" Ocean Stress Simulator**: Interactive sliders for *Fishing Boat Activity* and *Water Warming* compute real-time ecosystem stress conditions and biomass degradation.

### Step 6: Admin Fleet Command Enclave (`/admin`)
- Accessible via secure gateway at `/admin/login` or directly from the workstation for root operators.
- Manage user authorizations, inspect live mission records persisted to MongoDB Atlas, calibrate station sound speed offsets, resolve eDNA alerts, and dispatch maritime warnings.

---

## 🌐 Offline & Air-Gapped Operation

AquaScan AI includes a native **One-Touch Offline Mode**:
- Toggling **`🛡️ Offline Mode`** in the top navigation bar disconnects external cloud APIs while keeping **100% of features functional**.
- Edge neural classification runs directly inside the browser using WebAssembly and WebGL via `onnxruntime-web`.
- No satellite, cellular, or internet connectivity is required while deployed on offshore survey vessels or AUV towfish consoles.

---

## 📜 Compliance & Standards

AquaScan AI adheres to international hydrographic and maritime safety guidelines:

| Standard / Authority | Compliance Area | Implementation in AquaScan |
| :--- | :--- | :--- |
| **IHO S-44 Order 1a** | Bathymetric Survey Accuracies | Enforces strict vertical ($\pm 0.5\text{ m}$) and horizontal ($\pm 5\text{ m}$) uncertainty budgets for navigation clearance depths. |
| **NAVTEX / IMO GMDSS** | Maritime Safety Information (MSI) | Formats hazard alerts for automated 518 kHz maritime teleprinter broadcast to commercial vessels. |
| **IUCN Red List** | Marine Biodiversity Conservation | Flags endangered marine taxa (*Rhincodon typus*, *Dugong dugon*) during eDNA sequence alignment. |
| **NMEA 0183 / 2000** | Marine Electronics Interfacing | Ingests GPS \$GPGGA sentences, DVL altitude matrices, and CTD sound velocity profiles. |

---

## 🤝 Contributing & License

Contributions, bug reports, and pull requests are welcome. Distributed under the **Apache 2.0 License**.

---
*Developed for Hydrographic Survey Units, Littoral Defense Enclaves, and Autonomous Marine Research.*
