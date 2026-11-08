import { MAP_HEIGHT, MAP_PROJECTION, MAP_WIDTH } from "@/lib/kyrgyzstan-map-data";

export { MAP_HEIGHT, MAP_WIDTH };

export type RouteId = "lake" | "center" | "south";
export type LabelSide = "top" | "bottom" | "left" | "right";

export interface MapPoint {
  /** Percent of the map's width and height, for absolutely placed HTML. */
  left: number;
  top: number;
  /** In the SVG's own units. */
  x: number;
  y: number;
}

/* The same projection the generator used, so a place lands where its road is. */
export function project(latitude: number, longitude: number): MapPoint {
  const { west, north, cosLat, scale, pad } = MAP_PROJECTION;
  const x = (longitude - west) * cosLat * scale + pad;
  const y = (north - latitude) * scale + pad;
  return { x, y, left: (x / MAP_WIDTH) * 100, top: (y / MAP_HEIGHT) * 100 };
}

const KM_PER_DEGREE = 111.32;

/** Width of a distance on the map, as a percent of its width. */
export function kmToPercent(km: number): number {
  return ((km / KM_PER_DEGREE) * MAP_PROJECTION.scale * 100) / MAP_WIDTH;
}

export interface StationStyle {
  /** Where the name sits, so neighbours in the Karakol cluster don't collide. */
  side: LabelSide;
  route?: RouteId;
  hub?: boolean;
}

/* Places with no entry still appear: label on the right, no route colour. */
export const STATION_STYLES: Record<string, StationStyle> = {
  bishkek: { side: "top", route: "lake", hub: true },
  "ala-archa": { side: "bottom", route: "south" },
  burana: { side: "right", route: "lake" },
  "issyk-kul": { side: "top", route: "lake" },
  karakol: { side: "top", route: "lake" },
  "altyn-arashan": { side: "right", route: "lake" },
  "jeti-oguz": { side: "bottom", route: "lake" },
  skazka: { side: "bottom", route: "lake" },
  "song-kol": { side: "left", route: "center" },
  "tash-rabat": { side: "right", route: "center" },
  "kol-suu": { side: "bottom", route: "center" },
  "sary-chelek": { side: "left", route: "south" },
  osh: { side: "right", route: "south", hub: true },
};

export const DEFAULT_STATION_STYLE: StationStyle = { side: "right" };

export type TownId = "balykchy" | "kochkor" | "naryn" | "toktogul" | "jalalabad";

export interface MapTown {
  id: TownId;
  latitude: number;
  longitude: number;
  side: LabelSide;
}

/* Towns on the way: they orient the map but have no page of their own yet. */
export const MAP_TOWNS: MapTown[] = [
  { id: "balykchy", latitude: 42.46, longitude: 76.18, side: "left" },
  { id: "kochkor", latitude: 42.21, longitude: 75.75, side: "left" },
  { id: "naryn", latitude: 41.43, longitude: 75.99, side: "right" },
  { id: "toktogul", latitude: 41.87, longitude: 72.94, side: "top" },
  { id: "jalalabad", latitude: 40.93, longitude: 73.0, side: "right" },
];

/** Stops in road order, for the list that replaces the map on a phone. */
export const ROUTE_STOPS: Record<RouteId, string[]> = {
  lake: ["bishkek", "burana", "issyk-kul", "karakol", "altyn-arashan", "jeti-oguz", "skazka"],
  center: ["song-kol", "tash-rabat", "kol-suu"],
  south: ["ala-archa", "sary-chelek", "osh"],
};

/* Classes for a label around a zero-size anchor at the point. */
export const LABEL_POSITION: Record<LabelSide, string> = {
  top: "bottom-3 left-0 -translate-x-1/2",
  bottom: "top-3 left-0 -translate-x-1/2",
  left: "right-3 top-0 -translate-y-1/2",
  right: "left-3 top-0 -translate-y-1/2",
};

export const ROUTE_COLOR: Record<RouteId, string> = {
  lake: "var(--route-lake)",
  center: "var(--route-center)",
  south: "var(--route-south)",
};
