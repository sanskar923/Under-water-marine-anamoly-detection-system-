import io
from fastapi.testclient import TestClient
from PIL import Image
from main import app
from detector import analyze_sonar
from gemini_service import assess_hazard

client = TestClient(app)

def make_test_image_bytes():
    img = Image.new("RGB", (200, 200), (20, 30, 40))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def test_detector():
    img_bytes = make_test_image_bytes()
    data = analyze_sonar(img_bytes)
    assert "acoustic_highlight" in data
    assert "gps_coordinates" in data
    assert "swath_depth_m" in data
    assert abs(data["gps_coordinates"]["lat_raw"] - 15.4291) < 0.005
    assert abs(data["gps_coordinates"]["lon_raw"] - 73.8123) < 0.005
    print("[PASS] test_detector")

def test_gemini_fallback():
    img_bytes = make_test_image_bytes()
    res = assess_hazard(img_bytes, filename="ghost_net.png")
    assert "hazard_type" in res
    assert res["threat_level"] in ["CRITICAL", "MODERATE", "LOW"]
    assert "diver_safety_action" in res
    assert "ecological_impact" in res
    print("[PASS] test_gemini_fallback")

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    print("[PASS] test_api_health")

def test_api_scan():
    img_bytes = make_test_image_bytes()
    files = {"file": ("test_sonar.png", img_bytes, "image/png")}
    res = client.post("/api/scan", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "detection" in data
    assert "assessment" in data
    print("[PASS] test_api_scan")

if __name__ == "__main__":
    test_detector()
    test_gemini_fallback()
    test_api_health()
    test_api_scan()
    print("ALL BACKEND TESTS PASSED SUCCESSFULLY!")
