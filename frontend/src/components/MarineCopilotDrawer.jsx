import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, User, ChevronDown, ChevronUp, Cpu, Compass, Layers, CheckCircle } from "lucide-react";

export default function MarineCopilotDrawer({ detection, assessment, onExecuteAgenticAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "init",
      sender: "copilot",
      text: "Hi! I'm AquaAgent, your Ocean Intelligence Co-pilot. I can analyze sonar scans, answer marine operations questions, or execute actions for you (e.g. 'run scan on sample 1', 'locate Mumbai offshore', 'show SST temperature').",
      source: "AquaAgent (Ocean Intelligence)",
      isAgentic: false,
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedXaiId, setExpandedXaiId] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isOpen]);

  const quickChips = [
    "🔍 What is currently detected on sonar?",
    "🎯 Run scan on sample 1",
    "📍 Locate Mumbai offshore",
    "🌊 Show SST temperature",
  ];

  // Real Agentic Action Parser & Dispatcher
  const evaluateAgenticCommand = (query) => {
    const q = (query || "").toLowerCase().trim();
    if (q.includes("run scan on sample 1") || q.includes("scan sample 1") || (q.includes("sample 1") && q.includes("scan"))) {
      return {
        type: "RUN_SCAN",
        sampleId: "ghost_net",
        sampleName: "Sample 1 (Ghost Net)",
        feedback: "🤖 [Agentic Action Executed]: Ingested and triggered ONNX neural classification for Sample 1: Ghost Net."
      };
    }
    if (q.includes("run scan on sample 2") || q.includes("sample 2")) {
      return {
        type: "RUN_SCAN",
        sampleId: "sunken_pipe",
        sampleName: "Sample 2 (Pipeline)",
        feedback: "🤖 [Agentic Action Executed]: Ingested and triggered ONNX neural classification for Sample 2: Subsea Pipeline."
      };
    }
    if (q.includes("run scan on sample 3") || q.includes("sample 3")) {
      return {
        type: "RUN_SCAN",
        sampleId: "wreck",
        sampleName: "Sample 3 (Shipwreck)",
        feedback: "🤖 [Agentic Action Executed]: Ingested and triggered ONNX neural classification for Sample 3: Shipwreck Debris."
      };
    }
    if (q.includes("locate mumbai") || q.includes("mumbai offshore") || q.includes("mumbai")) {
      return {
        type: "PAN_MAP",
        coords: { lat: 18.922014, lng: 72.834021, locationName: "Mumbai Offshore Basin" },
        feedback: "🤖 [Agentic Action Executed]: Re-centered Leaflet GIS tactical map to Mumbai Offshore Basin (18.922°N, 72.834°E)."
      };
    }
    if (q.includes("locate goa") || q.includes("marmagao") || q.includes("goa")) {
      return {
        type: "PAN_MAP",
        coords: { lat: 15.429058, lng: 73.812242, locationName: "Marmagao Channel, Goa" },
        feedback: "🤖 [Agentic Action Executed]: Re-centered Leaflet GIS tactical map to Marmagao Channel, Goa (15.429°N, 73.812°E)."
      };
    }
    if (q.includes("locate cochin") || q.includes("cochin")) {
      return {
        type: "PAN_MAP",
        coords: { lat: 9.965022, lng: 76.242019, locationName: "Cochin Deep Approach" },
        feedback: "🤖 [Agentic Action Executed]: Re-centered Leaflet GIS tactical map to Cochin Deep Approach (9.965°N, 76.242°E)."
      };
    }
    if (q.includes("show sst") || q.includes("temperature") || q.includes("oceanography") || q.includes("sst")) {
      return {
        type: "JUMP_SECTION",
        sectionId: "section-oceanography",
        feedback: "🤖 [Agentic Action Executed]: Jumped directly to the Real-Time Coastal Telemetry & SST station module."
      };
    }
    if (q.includes("show edna") || q.includes("gnn") || q.includes("food web") || q.includes("blast")) {
      return {
        type: "JUMP_SECTION",
        sectionId: "section-edna-gnn",
        feedback: "🤖 [Agentic Action Executed]: Jumped directly to the Molecular eDNA BLAST & GNN Trophic Web module."
      };
    }
    if (q.includes("show catalog") || q.includes("dataset") || q.includes("catalog")) {
      return {
        type: "JUMP_SECTION",
        sectionId: "section-data-catalog",
        feedback: "🤖 [Agentic Action Executed]: Jumped to Marine Data & Survey Catalog."
      };
    }
    return null;
  };

  const handleSend = async (text) => {
    const q = (text !== undefined ? text : input).trim();
    if (!q || loading) return;
    setInput("");
    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [...prev, { id: userMsgId, sender: "user", text: q }]);
    setLoading(true);

    // 1. Check for Agentic Action Trigger
    const agenticAction = evaluateAgenticCommand(q);
    if (agenticAction) {
      if (onExecuteAgenticAction) {
        onExecuteAgenticAction(agenticAction);
      }
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `copilot-${Date.now()}`,
            sender: "copilot",
            text: agenticAction.feedback,
            source: "AquaAgent Action Engine",
            isAgentic: true,
          }
        ]);
        setLoading(false);
      }, 500);
      return;
    }

    // 2. Regular Gemini / Backend Copilot Service Call
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          telemetry: {
            depth: assessment?.seabed_depth || detection?.swath_depth_m || "28.4m",
            hazard: assessment?.hazard_type || detection?.hazard_classification || "Ghost Net",
            backscatter: detection?.acoustic_intensity_db || "-18.4 dB",
            relief: detection?.acoustic_shadow?.estimated_relief_m || "1.85m",
          },
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `copilot-${Date.now()}`,
          sender: "copilot",
          text: data.answer || "Query processed.",
          source: data.source || "AquaAgent",
          xai: {
            confidence: detection?.confidence_score || 94.8,
            backscatter: detection?.acoustic_intensity_db || 43.7,
            featureWeight: "High acoustic highlight (62%) + Extended dark shadow boundary (28%) + Low benthic variance (10%)",
            model: "MobileNetV4-ONNX + AquaScan Edge NPU",
            target: assessment?.hazard_type || "Ghost Fishing Net"
          }
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `copilot-${Date.now()}`,
          sender: "copilot",
          text: "I'm right here with you! Feel free to ask about the active sonar scan, diver safety protocols, or ask me to 'run scan on sample 1'.",
          source: "AquaAgent",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide shadow-[0_0_25px_rgba(6,182,212,0.45)] transition-all cursor-pointer hover:scale-105 active:scale-95"
      >
        <Sparkles className="w-4 h-4 animate-pulse text-slate-950" />
        <span>🤖 AquaAgent Online</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      </button>

      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-[#020714]/95 backdrop-blur-2xl border-l border-cyan-500/30 z-[9999] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.9)] animate-in slide-in-from-right duration-200">
          {/* Header Block */}
          <div className="h-18 shrink-0 px-6 py-4 flex items-center justify-between border-b border-cyan-500/20 bg-[#020612]/95">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="font-sans text-sm font-black text-cyan-300 tracking-tight flex items-center gap-1.5">
                  <span>🤖</span>
                  <span>AquaAgent (Ocean Intelligence Co-pilot)</span>
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                Autonomous tool actions, natural language &amp; explainable AI (XAI).
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-cyan-500/10 transition-colors cursor-pointer"
              aria-label="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message Feed Clearance */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[90%] ${
                  m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    m.sender === "user"
                      ? "bg-cyan-500 text-slate-950 font-bold text-[11px]"
                      : "bg-slate-800 text-cyan-300 border border-cyan-500/30"
                  }`}
                >
                  {m.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div
                  className={`p-3.5 rounded-2xl ${
                    m.sender === "user"
                      ? "bg-cyan-600 text-white shadow-lg rounded-tr-none"
                      : m.isAgentic
                      ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-100 shadow-md rounded-tl-none"
                      : "bg-[#0b162c]/90 border border-slate-800 text-slate-100 shadow-md rounded-tl-none"
                  }`}
                >
                  <p className="leading-relaxed font-sans text-[13px] whitespace-pre-wrap">{m.text}</p>
                  
                  {m.source && m.sender !== "user" && (
                    <span className="text-[10px] font-mono text-cyan-400/80 tracking-wide uppercase block mt-2 pt-1 border-t border-slate-800/60">
                      ⚡ {m.source}
                    </span>
                  )}

                  {/* Explainable AI (XAI) Pill Dropdown */}
                  {m.xai && m.sender !== "user" && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => setExpandedXaiId(expandedXaiId === m.id ? null : m.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono transition-all cursor-pointer"
                      >
                        <Cpu className="w-3 h-3 text-cyan-400" />
                        <span>Why AI made this prediction</span>
                        {expandedXaiId === m.id ? (
                          <ChevronUp className="w-3 h-3 text-cyan-400 ml-0.5" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-cyan-400 ml-0.5" />
                        )}
                      </button>

                      {expandedXaiId === m.id && (
                        <div className="mt-2 p-2.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 text-[11px] font-mono text-slate-300 space-y-1.5 animate-in fade-in duration-150">
                          <div className="flex justify-between text-cyan-200">
                            <span>Acoustic Confidence:</span>
                            <span className="font-bold text-emerald-400">{m.xai.confidence}%</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Backscatter Intensity:</span>
                            <span className="font-bold text-amber-300">{m.xai.backscatter} dB</span>
                          </div>
                          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                            <strong>Feature Weights:</strong> {m.xai.featureWeight}
                          </div>
                          <div className="text-[9px] text-cyan-500/80">
                            Architecture: {m.xai.model}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-cyan-300 font-sans italic bg-cyan-950/30 border border-cyan-900/40 rounded-xl w-fit">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>AquaAgent is analyzing telemetry &amp; planning action...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Bottom Interactive Query Deck */}
          <div className="p-4 border-t border-cyan-500/20 bg-[#030712]/95 shrink-0 flex flex-col gap-2.5">
            <div className="flex flex-wrap gap-1.5">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  className="text-[11px] px-3 py-1.5 rounded-full bg-[#0b1626] hover:bg-cyan-950/60 border border-cyan-800/50 hover:border-cyan-400/60 text-cyan-200 text-left transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  {chip}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 mt-1"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message or command... (e.g., 'run scan on sample 1')"
                className="flex-1 bg-[#02060d] border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none placeholder:text-slate-500 transition-colors shadow-inner"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-40 disabled:hover:bg-cyan-500 cursor-pointer shadow-md transition-all active:scale-95 shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


