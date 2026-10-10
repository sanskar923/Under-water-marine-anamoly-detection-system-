import os
from pymongo import MongoClient
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

try:
    if not MONGO_URI:
        raise ValueError("MONGO_URI environment variable is not set")
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client["aquascan_defense_db"]
    missions_col = db["mission_records"]
    client.admin.command('ping')
    print("[AQUASCAN DB]: MongoDB Atlas Connected Successfully.")
except Exception as err:
    print(f"[AQUASCAN DB ERROR]: Connection Failed: {err}")
    client = None
    missions_col = None

def record_mission_scan(data: dict):
    if missions_col is None:
        return None
    try:
        coords = data.get("coordinates") or {}
        telem = data.get("telemetry") or {}
        
        # Safely parse lat/lng from top level or nested coordinates
        lat_val = data.get("lat") or coords.get("lat") or coords.get("latitude") or 15.4290
        lng_val = data.get("lng") or coords.get("lng") or coords.get("longitude") or 73.8122
        try:
            lat = float(str(lat_val).replace("°", "").replace("N", "").replace("S", "").strip())
        except (ValueError, TypeError):
            lat = 15.4290
        try:
            lng = float(str(lng_val).replace("°", "").replace("E", "").replace("W", "").strip())
        except (ValueError, TypeError):
            lng = 73.8122

        # Safely parse telemetry
        depth_val = data.get("depth_m") or telem.get("depth_m") or data.get("depth") or 31.9
        try:
            depth_m = float(str(depth_val).replace("meters", "").replace("m", "").strip())
        except (ValueError, TypeError):
            depth_m = 31.9

        db_val = data.get("backscatter_db") or telem.get("backscatter_db") or data.get("intensity") or -14.2
        try:
            backscatter_db = float(str(db_val).replace("dB", "").strip())
        except (ValueError, TypeError):
            backscatter_db = -14.2

        try:
            confidence = float(data.get("confidence", 0.92))
        except (ValueError, TypeError):
            confidence = 0.92

        try:
            freq = int(data.get("frequency_khz", 455))
        except (ValueError, TypeError):
            freq = 455

        doc = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "target_type": data.get("target_type") or data.get("hazard_type") or "UNKNOWN_ANOMALY",
            "confidence": confidence,
            "coordinates": {
                "lat": lat,
                "lng": lng,
                "datum": "WGS-84"
            },
            "telemetry": {
                "depth_m": depth_m,
                "backscatter_db": backscatter_db,
                "frequency_khz": freq
            },
            "threat_severity": data.get("threat_severity") or data.get("threat_level") or "MODERATE",
            "status": "LOGGED"
        }
        res = missions_col.insert_one(doc)
        return str(res.inserted_id)
    except Exception as e:
        print(f"[AQUASCAN DB ERROR] Insert failed: {e}")
        return None

def fetch_mission_archive(limit=50):
    if missions_col is None:
        return []
    try:
        docs = list(missions_col.find({}).sort("timestamp", -1).limit(limit))
        for d in docs:
            if "_id" in d:
                d["_id"] = str(d["_id"])
        return docs
    except Exception as e:
        print(f"[AQUASCAN DB ERROR] Fetch failed: {e}")
        return []

def purge_mission_archive(filter_query=None):
    if missions_col is None:
        return 0
    try:
        q = filter_query if filter_query is not None else {}
        res = missions_col.delete_many(q)
        return res.deleted_count
    except Exception as e:
        print(f"[AQUASCAN DB ERROR] Purge failed: {e}")
        return 0