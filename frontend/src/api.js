const API_BASE = "http://127.0.0.1:8000";

export async function checkBackendHealth() {
  try {
    const res = await fetch("/api/health");
    if (res.ok) return await res.json();
  } catch {}
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (res.ok) return await res.json();
  } catch {}
  return { status: "disconnected" };
}

export async function scanSonarImage(file, mode = "cloud") {
  const formData = new FormData();
  formData.append("file", file);

  let res;
  try {
    res = await fetch(`/api/scan?mode=${mode}`, { method: "POST", body: formData });
  } catch {
    res = await fetch(`${API_BASE}/api/scan?mode=${mode}`, { method: "POST", body: formData });
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Server status ${res.status}`);
  }
  return await res.json();
}

export async function saveMissionRecord(payload) {
  let res;
  try {
    res = await fetch("/api/mission/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    res = await fetch(`${API_BASE}/api/mission/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
  if (!res.ok) throw new Error("Failed to persist mission record");
  return await res.json();
}

export async function fetchMissionHistory(limit = 50) {
  let res;
  try {
    res = await fetch(`/api/mission/history?limit=${limit}`);
  } catch {
    res = await fetch(`${API_BASE}/api/mission/history?limit=${limit}`);
  }
  if (!res.ok) throw new Error("Failed to fetch mission history");
  return await res.json();
}

export async function purgeMissionHistory() {
  let res;
  try {
    res = await fetch("/api/mission/purge", { method: "POST" });
  } catch {
    res = await fetch(`${API_BASE}/api/mission/purge`, { method: "POST" });
  }
  if (!res.ok) throw new Error("Failed to purge mission records");
  return await res.json();
}


