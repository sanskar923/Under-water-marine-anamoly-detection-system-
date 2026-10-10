export const FLEET_BASE = {
  name: "INS Nirdeshak (Surface Vessel Base)",
  coords: [15.4120, 73.8240],
};

export const COASTAL_HAZARDS = [
  { id: "h1", name: "1. Ghost Net (Current Target)", coords: [15.4291, 73.8123], color: "#ef4444", threat: "CRITICAL", depth: "28.4m" },
  { id: "h2", name: "2. Corroded Steel Pipe", coords: [15.4385, 73.8210], color: "#f97316", threat: "MODERATE", depth: "32.1m" },
  { id: "h3", name: "3. Abandoned Trawl Wire", coords: [15.4210, 73.8055], color: "#f59e0b", threat: "HIGH", depth: "26.8m" },
  { id: "h4", name: "4. Sunken Hull Fragment", coords: [15.4450, 73.7990], color: "#dc2626", threat: "CRITICAL", depth: "35.2m" },
];

export function calculateTspTrajectory(startCoords = FLEET_BASE.coords, hazards = COASTAL_HAZARDS) {
  let unvisited = [...hazards];
  let current = startCoords;
  const path = [startCoords];

  while (unvisited.length > 0) {
    unvisited.sort((a, b) => {
      const d1 = Math.hypot(a.coords[0] - current[0], a.coords[1] - current[1]);
      const d2 = Math.hypot(b.coords[0] - current[0], b.coords[1] - current[1]);
      return d1 - d2;
    });
    const next = unvisited.shift();
    path.push(next.coords);
    current = next.coords;
  }
  path.push(startCoords);
  return path;
}
