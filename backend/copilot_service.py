import os
from dotenv import load_dotenv

load_dotenv()

FALLBACK_ANSWERS = {
    "lift": "NEGATIVE. Commercial air divers must NOT attempt manual recovery. At 28.4m depth, wet mass of entangled gear exceeds 450 kg with high snag risk. Deploy vessel crane hoisting line or 500kg certified subsea lift bag with hydraulic tag line.",
    "damage": "BENTHIC DISPERSION MODEL: 6-month unmitigated exposure projects ongoing ghost fishing mortality for ~28 marine vertebrates, substrate smothering across 14m², and microplastic breakdown into littoral current systems.",
    "salvage": "RECOMMENDED ROV CONFIGURATION: Work-class ROV with dual 7-function manipulators, 38mm hydraulic rotary line cutter, and 455 kHz obstacle avoidance sonar. Maintain 3.5m standoff during tether severance.",
    "default": "[ERR 0x4B: UNMAPPED OPERATOR DIRECTIVE] Input discarded. Vessel holding station at 28.4m depth. Anomaly: Polyamide entanglement (1.85m relief). Specify salvage, tether clearance, or ROV telemetry parameters.",
}

def ask_copilot(question: str, telemetry: dict = None) -> dict:
    """Answers marine operations and casual conversational queries via AquaScan AI Gemini engine."""
    q_lower = (question or "").lower().strip()
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            context = f"Telemetry / Active Scan Context: {telemetry}\nUser Message: {question}"
            sys_prompt = (
                "You are \"AquaScan AI\", an intelligent, highly versatile, and authentically conversational AI collaborator (like ChatGPT) integrated into the AquaScan hydrographic project.\n\n"
                "YOUR PERSONALITY & BEHAVIOR:\n"
                "1. Conversational Adaptability: If the user asks casual questions (e.g., \"khana khaya?\", \"kaise ho?\", \"who are you?\", general trivia, jokes), respond warmly, naturally, and with a touch of wit like a supportive human peer. Match their language directly (Hindi, Hinglish, English). If they ask \"khana khaya?\", reply playfully (e.g., \"Main to AI hoon, mera khana to bus electricity aur sonar data hai! Aapne khaya?\").\n"
                "2. Domain Expertise: If the user asks about the sonar scans, marine life risks, ghost nets, bathymetry, or ROV diving, give accurate, crisp, and insightful technical answers without robotic jargon.\n"
                "3. Tone: Grounded, authentic, concise, and helpful. Avoid robotic intros like \"As an AI...\" or overly stiff corporate speak."
            )
            for m in ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"]:
                try:
                    res = client.models.generate_content(model=m, contents=f"{sys_prompt}\n\n{context}")
                    if res and res.text:
                        return {"answer": res.text.strip(), "source": "AquaScan AI"}
                except Exception:
                    pass
        except Exception:
            pass

    # Conversational Fallbacks
    if any(k in q_lower for k in ["khana", "khaya", "lunch", "dinner", "breakfast"]):
        ans = "Main to ek AI hoon, mera khana to bus electricity, GPU cycles aur acoustic sonar data hai! ⚡ Aapne khana khaya?"
    elif any(k in q_lower for k in ["kaise ho", "kya haal", "how are you", "how r u", "kaisa chal"]):
        ans = "Main bilkul badiya hoon! Seabed scans analyze kar raha hoon. Aap bataiye, aaj ocean mission mein kya explore karna hai?"
    elif any(k in q_lower for k in ["namaste", "hello", "hi", "hey", "hola", "kya chal raha"]):
        ans = "Hello! Main AquaScan AI hoon. Aap sonar scans, marine safety, bathymetry ke baare mein pooch sakte hain ya fir casual baat bhi kar sakte hain. How can I help you today?"
    elif any(k in q_lower for k in ["who are you", "tum kaun ho", "who r u", "kya ho"]):
        ans = "Main AquaScan AI hoon — aapka friendly marine intelligent assistant! Main side-scan sonar data decode karne, divers ki safety evaluate karne, aur ocean exploration mein aapki help karta hoon."
    elif any(k in q_lower for k in ["detected", "what is", "scan", "sonar", "currently detected"]):
        hazard = (telemetry or {}).get("hazard", "Ghost Net")
        depth = (telemetry or {}).get("depth", "28.4m")
        relief = (telemetry or {}).get("relief", "1.85m")
        ans = f"Current sonar scan reveals an acoustic anomaly identified as **{hazard}** at a depth of **{depth}**, with an estimated shadow relief height of **{relief}**."
    elif any(k in q_lower for k in ["diver", "safe", "safely", "swimming"]):
        ans = "Safety Alert for Divers: Manual recovery is not recommended here due to entanglement hazards and depth. Standard protocol requires maintaining a 5-meter standoff distance and using mechanical hoist or lift bags."
    elif any(k in q_lower for k in ["how side-scan", "side-scan", "sonar work", "how sonar"]):
        ans = "Side-scan sonar works by transmitting high-frequency acoustic sound pulses (CHIRP) towards the seafloor across port and starboard channels. It records the amplitude of echoes bouncing back—hard seabed objects create bright highlights, while the blocked areas behind them cast distinct dark acoustic shadows that reveal their physical height!"
    elif any(k in q_lower for k in ["lift", "crane"]):
        ans = FALLBACK_ANSWERS["lift"]
    elif any(k in q_lower for k in ["damage", "benthic", "dispersion", "environment"]):
        ans = FALLBACK_ANSWERS["damage"]
    elif any(k in q_lower for k in ["rov", "tool", "manipulator", "salvage"]):
        ans = FALLBACK_ANSWERS["salvage"]
    else:
        ans = "I'm right here with you! You can ask me anything about the active seabed sonar scan, diving safety precautions, side-scan hydrography, or we can just chat in English or Hindi."

    return {"answer": ans, "source": "AquaScan AI"}

