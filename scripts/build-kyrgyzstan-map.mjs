/*
  Builds lib/kyrgyzstan-map-data.ts from Natural Earth 1:10m data (public
  domain, naturalearthdata.com).

  1. Download into one folder, from
     https://github.com/nvkelso/natural-earth-vector/tree/master/geojson :
     ne_10m_admin_0_countries, ne_10m_admin_1_states_provinces,
     ne_10m_lakes, ne_10m_roads (.geojson)
  2. node scripts/build-kyrgyzstan-map.mjs <that folder>

  The tourist routes are not drawn by hand: they are shortest paths along the
  real roads between the towns each route passes through.
*/
import fs from "node:fs";
import path from "node:path";

const [, , dataDir] = process.argv;
if (!dataDir) {
  console.error("Usage: node scripts/build-kyrgyzstan-map.mjs <natural-earth-folder>");
  process.exit(1);
}

const OUT = path.join(process.cwd(), "lib/kyrgyzstan-map-data.ts");
const WIDTH = 1200;
/* Room around the border, in px, so dots and roads at the edge are not cut. */
const PAD = 8;
/*
  Douglas-Peucker tolerance in px. The border and lakes stay below what the eye
  sees at full width; the faint oblast lines and roads can be coarser, which
  keeps the page light on a mountain connection.
*/
const TOLERANCE = { border: 0.45, oblast: 1.4, road: 0.9, route: 0.6, locator: 3 };

/* Each route is the shortest road path through these points, in order: [lng, lat]. */
const ROUTE_WAYPOINTS = {
  lake: [
    [[74.59, 42.87], [76.18, 42.46], [77.08, 42.65], [78.39, 42.49], [77.18, 42.13], [76.18, 42.46]],
  ],
  center: [[[76.18, 42.46], [75.75, 42.21], [75.99, 41.43], [75.8, 41.17]]],
  south: [
    [[74.59, 42.87], [73.85, 42.81], [73.85, 42.18], [72.94, 41.87], [72.68, 41.62], [73.0, 40.93], [72.8, 40.53]],
  ],
};

const load = (name) =>
  JSON.parse(fs.readFileSync(path.join(dataDir, `${name}.geojson`), "utf8"));

const country = load("ne_10m_admin_0_countries").features.find(
  (feature) => feature.properties.ADM0_A3 === "KGZ",
);
if (!country || country.geometry.type !== "Polygon") {
  throw new Error("Kyrgyzstan polygon not found");
}
const rings = country.geometry.coordinates;

let west = Infinity;
let east = -Infinity;
let south = Infinity;
let north = -Infinity;
for (const [lng, lat] of rings[0]) {
  west = Math.min(west, lng);
  east = Math.max(east, lng);
  south = Math.min(south, lat);
  north = Math.max(north, lat);
}

const cosLat = Math.cos((((north + south) / 2) * Math.PI) / 180);
const scale = (WIDTH - PAD * 2) / ((east - west) * cosLat);
const HEIGHT = Math.round((north - south) * scale + PAD * 2);

const project = ([lng, lat]) => [
  (lng - west) * cosLat * scale + PAD,
  (north - lat) * scale + PAD,
];

function perpendicular(point, start, end) {
  const [x, y] = point;
  const [x1, y1] = start;
  const [x2, y2] = end;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  if (length === 0) return Math.hypot(x - x1, y - y1);
  return Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / length;
}

function simplify(points, tolerance) {
  if (points.length < 3) return points;
  let index = 0;
  let max = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicular(points[i], points[0], points[points.length - 1]);
    if (distance > max) {
      max = distance;
      index = i;
    }
  }
  if (max <= tolerance) return [points[0], points[points.length - 1]];
  const left = simplify(points.slice(0, index + 1), tolerance);
  const right = simplify(points.slice(index), tolerance);
  return [...left.slice(0, -1), ...right];
}

const fmt = (n) => (Math.round(n * 10) / 10).toString();
const pairs = (points) => points.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(" ");

function ringPath(ring, tolerance = TOLERANCE.border) {
  const points = simplify(ring.map(project), tolerance);
  return `M${pairs(points)}Z`;
}

function linePath(line, tolerance) {
  const points = simplify(line.map(project), tolerance);
  return points.length < 2 ? "" : `M${pairs(points)}`;
}

function insideRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

const insideCountry = (lng, lat) =>
  insideRing(lng, lat, rings[0]) && !rings.slice(1).some((hole) => insideRing(lng, lat, hole));

function nearBorder(lng, lat, limit) {
  for (const ring of rings) {
    for (const [x, y] of ring) {
      if (Math.abs(x - lng) < limit && Math.abs(y - lat) < limit) return true;
    }
  }
  return false;
}

/*
  At 1:10m a road that hugs the border (Osh to Jalal-Abad) can stray a few
  kilometres over it, so the road graph keeps points this close to the border.
*/
const BORDER_SLACK = 0.1;
const inKyrgyzstan = (lng, lat) =>
  insideCountry(lng, lat) || nearBorder(lng, lat, BORDER_SLACK);

function linesOf(geometry) {
  if (geometry.type === "LineString") return [geometry.coordinates];
  if (geometry.type === "MultiLineString") return geometry.coordinates;
  return [];
}

function polygonsOf(geometry) {
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  return [];
}

/* ---- Country, oblasts, lakes ---- */

const COUNTRY_PATH = rings.map(ringPath).join("");

const oblasts = load("ne_10m_admin_1_states_provinces").features.filter(
  (feature) =>
    feature.properties.adm0_a3 === "KGZ" && feature.properties.iso_3166_2 !== "KG-GB",
);
const OBLAST_PATH = oblasts
  .flatMap((feature) =>
    polygonsOf(feature.geometry).map((polygon) => ringPath(polygon[0], TOLERANCE.oblast)),
  )
  .join("");

const LAKE_NAMES = { "Issyk-Kul": "issykKul", "Toktogul Suu Saktagychy": "toktogul" };
const lakes = {};
const lakePolygons = {};
for (const feature of load("ne_10m_lakes").features) {
  const key = LAKE_NAMES[feature.properties.name];
  if (!key) continue;
  lakePolygons[key] = polygonsOf(feature.geometry);
  lakes[key] = lakePolygons[key]
    .map((polygon) => polygon.map((ring) => ringPath(ring)).join(""))
    .join("");
}
for (const key of Object.values(LAKE_NAMES)) {
  if (!lakes[key]) throw new Error(`Lake ${key} not found`);
}

/* A coarse outline for the small "where is it" map on a place page. */
const LOCATOR_BORDER = ringPath(rings[0], TOLERANCE.locator);
const LOCATOR_LAKE = lakePolygons.issykKul
  .map((polygon) => ringPath(polygon[0], TOLERANCE.locator))
  .join("");

/* ---- Roads ---- */

const roadLines = load("ne_10m_roads")
  .features.flatMap((feature) => linesOf(feature.geometry))
  .filter((line) => line.some(([lng, lat]) => inKyrgyzstan(lng, lat)));

const ROAD_PATH = roadLines
  .map((line) => linePath(line, TOLERANCE.road))
  .filter(Boolean)
  .join("");

/* ---- Routes: Dijkstra over the road graph inside Kyrgyzstan ---- */

const keyOf = ([lng, lat]) => `${lng.toFixed(4)},${lat.toFixed(4)}`;
const nodes = new Map();
const edges = new Map();

function km([lng1, lat1], [lng2, lat2]) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

function link(a, b) {
  const ka = keyOf(a);
  const kb = keyOf(b);
  if (ka === kb) return;
  nodes.set(ka, a);
  nodes.set(kb, b);
  const distance = km(a, b);
  if (!edges.has(ka)) edges.set(ka, new Map());
  if (!edges.has(kb)) edges.set(kb, new Map());
  edges.get(ka).set(kb, distance);
  edges.get(kb).set(ka, distance);
}

for (const line of roadLines) {
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1];
    const b = line[i];
    if (inKyrgyzstan(...a) && inKyrgyzstan(...b)) link(a, b);
  }
}

/* Natural Earth lines don't always share an exact vertex at a junction. */
const SNAP = 0.03;
for (const [key, point] of nodes) {
  if (edges.get(key)?.size !== 1) continue;
  let best = null;
  let bestDistance = Infinity;
  for (const [otherKey, other] of nodes) {
    if (otherKey === key || edges.get(key).has(otherKey)) continue;
    const d = Math.hypot(other[0] - point[0], other[1] - point[1]);
    if (d < SNAP && d < bestDistance) {
      best = other;
      bestDistance = d;
    }
  }
  if (best) link(point, best);
}

function nearestNode([lng, lat]) {
  let best = null;
  let bestDistance = Infinity;
  for (const [key, [x, y]] of nodes) {
    const d = Math.hypot(x - lng, y - lat);
    if (d < bestDistance) {
      best = key;
      bestDistance = d;
    }
  }
  if (bestDistance > 0.15) {
    throw new Error(`No road near ${lng}, ${lat} (closest ${bestDistance.toFixed(3)} deg)`);
  }
  return best;
}

function shortestPath(from, to) {
  const distance = new Map([[from, 0]]);
  const previous = new Map();
  const done = new Set();
  const queue = [[0, from]];
  while (queue.length) {
    queue.sort((a, b) => a[0] - b[0]);
    const [d, key] = queue.shift();
    if (done.has(key)) continue;
    done.add(key);
    if (key === to) break;
    for (const [next, weight] of edges.get(key) ?? []) {
      const candidate = d + weight;
      if (candidate < (distance.get(next) ?? Infinity)) {
        distance.set(next, candidate);
        previous.set(next, key);
        queue.push([candidate, next]);
      }
    }
  }
  if (!distance.has(to)) throw new Error(`No road path from ${from} to ${to}`);
  const keys = [to];
  while (keys[0] !== from) keys.unshift(previous.get(keys[0]));
  return { points: keys.map((key) => nodes.get(key)), km: distance.get(to) };
}

const ROUTE_PATHS = {};
for (const [id, legsList] of Object.entries(ROUTE_WAYPOINTS)) {
  ROUTE_PATHS[id] = legsList
    .map((waypoints) => {
      let points = [];
      let total = 0;
      for (let i = 1; i < waypoints.length; i++) {
        const leg = shortestPath(nearestNode(waypoints[i - 1]), nearestNode(waypoints[i]));
        total += leg.km;
        points = points.length ? [...points, ...leg.points.slice(1)] : leg.points;
      }
      console.log(`${id}: ${Math.round(total)} km, ${points.length} points`);
      return linePath(points, TOLERANCE.route);
    })
    .join("");
}

/* ---- Output ---- */

const output = `/*
  Generated by scripts/build-kyrgyzstan-map.mjs from Natural Earth 1:10m data
  (public domain). Do not edit by hand: rerun the script.

  Equirectangular projection, scaled so the country fills ${WIDTH} px across.
*/

export const MAP_WIDTH = ${WIDTH};
export const MAP_HEIGHT = ${HEIGHT};

export const MAP_PROJECTION = {
  west: ${west},
  north: ${north},
  cosLat: ${cosLat},
  scale: ${scale},
  pad: ${PAD},
} as const;

/** The border, with the enclaves cut out: fill it with fill-rule="evenodd". */
export const COUNTRY_PATH =
  "${COUNTRY_PATH}";

/** Oblast outlines, drawn as thin lines inside the border. */
export const OBLAST_PATH =
  "${OBLAST_PATH}";

export const LAKE_PATHS = {
  issykKul: "${lakes.issykKul}",
  toktogul: "${lakes.toktogul}",
} as const;

/** Every major road, to be clipped to the border. */
export const ROAD_PATH =
  "${ROAD_PATH}";

export const ROUTE_PATHS = {
  lake: "${ROUTE_PATHS.lake}",
  center: "${ROUTE_PATHS.center}",
  south: "${ROUTE_PATHS.south}",
} as const;

/** Coarse border and Issyk-Kul for small locator maps, same projection. */
export const LOCATOR_PATHS = {
  border: "${LOCATOR_BORDER}",
  lake: "${LOCATOR_LAKE}",
} as const;
`;

fs.writeFileSync(OUT, output);
console.log(`Wrote ${OUT}: ${WIDTH} x ${HEIGHT}, ${(output.length / 1024).toFixed(1)} KB`);
