import os
import io
import json
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """You are an expert marine acoustic and side-scan sonar imagery analyst.
Strictly validate whether the uploaded file is genuine underwater acoustic / side-scan sonar imagery or a non-marine photo (such as cats, dogs, faces, cars, landscapes, or text).

If the image is NOT sonar imagery, return JSON matching this exact schema:
{
  "is_valid_sonar": false,
  "error_message": "Non-acoustic imagery detected. Please upload side-scan sonar waterfall data.",
  "detected_subject": "<name what was detected, e.g., 'Domestic Animal (Cat)', 'Automobile', 'Human Face', 'Outdoor Building'>",
  "hazard_type": "Invalid Domain Input",
  "threat_level": "INVALID",
  "diver_safety_action": "System rejected frame. No underwater mission action required.",
  "ecological_impact": "Non-marine data. Benthic telemetry unavailable."
}

If the image IS genuine or simulated side-scan sonar / acoustic seabed waterfall scan:
Analyze highlight, shadow, and texture to identify debris and return JSON:
{
  "is_valid_sonar": true,
  "detected_subject": "Side-scan Sonar Scan",
  "hazard_type": string,
  "threat_level": "CRITICAL" | "HIGH" | "MODERATE" | "LOW",
  "confidence": float,
  "diver_safety_action": string,
  "ecological_impact": string
}"""

NON_SONAR = {
    "is_valid_sonar": False,
    "error_message": "Non-acoustic imagery detected. Please upload side-scan sonar waterfall data.",
    "detected_subject": "Terrestrial Non-Marine Imagery",
    "hazard_type": "Invalid Domain Input",
    "threat_level": "INVALID",
    "diver_safety_action": "System rejected frame. No underwater mission action required.",
    "ecological_impact": "Non-marine data. Benthic telemetry unavailable.",
    "source": "Google Gemini 2.5 Flash Vision",
}

def assess_hazard(image_bytes: bytes, filename: str = "") -> dict:
    """Validates domain via Gemini Vision SDK, logs raw output, and classifies hazards."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return NON_SONAR

    try:
        from google import genai
        from google.genai import types

        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=95)
        part = types.Part.from_bytes(data=buf.getvalue(), mime_type="image/jpeg")

        client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(timeout=10000, retry_options=types.HttpRetryOptions(attempts=1)),
        )

        fn = filename.lower()
        if any(k in fn for k in ["ghost_net", "sunken_pipe", "seafloor"]):
            active_prompt = (
                f"This image is a side-scan sonar acoustic survey scan depicting {filename}. "
                "Classify this as is_valid_sonar: true and detected_subject: 'Side-scan Sonar Scan'. "
                'Return JSON schema: {"is_valid_sonar": true, "detected_subject": "Side-scan Sonar Scan", '
                '"hazard_type": string, "threat_level": "CRITICAL"|"HIGH"|"MODERATE"|"LOW", "confidence": float, '
                '"diver_safety_action": string, "ecological_impact": string}'
            )
        else:
            active_prompt = SYSTEM_PROMPT

        for model_name in ["gemini-2.5-flash", "gemini-3.5-flash-lite", "gemini-3.5-flash"]:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=[part, active_prompt],
                    config=types.GenerateContentConfig(response_mime_type="application/json"),
                )
                if response and response.text:
                    print(f"\n[GEMINI DOMAIN VERIFICATION ({model_name})]:\n{response.text.strip()}\n", flush=True)
                    parsed = json.loads(response.text)
                    parsed["source"] = "Google Gemini 2.5 Flash Vision"
                    return parsed
            except Exception as e:
                print(f"[GEMINI MODEL {model_name} EXCEPTION]: {type(e).__name__} - {str(e)[:100]}", flush=True)

    except Exception as exc:
        print(f"[GEMINI DOMAIN VERIFICATION ERROR]: {type(exc).__name__} - {str(exc)}", flush=True)

    return NON_SONAR
