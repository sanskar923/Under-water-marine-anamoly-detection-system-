import os, io, json
from dotenv import load_dotenv
load_dotenv()
from PIL import Image
from google import genai
from google.genai import types

client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

PROMPT = """You are an expert marine acoustic and sonar imagery analyst.
Analyze the input image carefully:
1. If the input image is an everyday non-marine, terrestrial, outdoor, or indoor photograph (such as buildings, architecture, vehicles, cars, human selfies, rooms, or street scenes), it is NOT a sonar image. Return JSON:
{
  "is_sonar": false,
  "hazard_type": "Invalid Non-Sonar Image",
  "threat_level": "NONE",
  "confidence": 0.0,
  "diver_safety_action": "Please upload genuine side-scan sonar imagery.",
  "ecological_impact": "No marine context detected."
}

2. If the image is an acoustic side-scan sonar display, waterfall scan, seabed acoustic bathymetry, or underwater debris simulation (such as dark acoustic fields with high-backscatter highlights and acoustic shadows):
It IS a sonar scan (is_sonar: true). Analyze the acoustic features (highlight, shadow, texture) to identify the debris type (Ghost Net, Pipe, Wreck, or Natural Seabed) and return JSON:
{
  "is_sonar": true,
  "hazard_type": "Ghost Fishing Net (Polyamide Monofilament)",
  "threat_level": "CRITICAL",
  "confidence": 0.95,
  "diver_safety_action": "Do NOT cut manually underwater. Secure line with grapple hook and haul via crane.",
  "ecological_impact": "Severe entanglement risk to local cetacean and turtle populations."
}"""

p_bldg = types.Part.from_bytes(data=open('c:/Users/binja/OneDrive/Desktop/Ocean guard/backend/test_building.jpg', 'rb').read(), mime_type='image/jpeg')
res_bldg = client.models.generate_content(model='gemini-3.5-flash-lite', contents=[p_bldg, PROMPT], config=types.GenerateContentConfig(response_mime_type='application/json'))
print("BUILDING RESULT:", res_bldg.text.strip())

p_sonar = types.Part.from_bytes(data=open('c:/Users/binja/OneDrive/Desktop/Ocean guard/frontend/public/samples/ghost_net.png', 'rb').read(), mime_type='image/png')
res_sonar = client.models.generate_content(model='gemini-3.5-flash-lite', contents=[p_sonar, PROMPT], config=types.GenerateContentConfig(response_mime_type='application/json'))
print("SONAR RESULT:", res_sonar.text.strip())
