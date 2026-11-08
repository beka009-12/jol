import "server-only";

import { cache } from "react";
import { settle } from "@/lib/api/errors";
import {
  getCompanies,
  getHotels,
  getPlaces,
  getRestaurants,
  getTours,
} from "@/lib/api/server";
import type { Locale, PlaceSummary, Region } from "@/lib/types";

const CATALOG_LIMIT = 100;

/*
  Home reads the whole catalog once for its counts and the road scheme. A section
  whose request fails gets null and handles that itself, so one missing endpoint
  doesn't take the page down.
*/
export const getCatalogIndex = cache(async (locale: Locale) => {
  const [tours, hotels, restaurants, companies, places] = await Promise.all([
    settle(getTours(locale, { limit: CATALOG_LIMIT })),
    settle(getHotels(locale, { limit: CATALOG_LIMIT })),
    settle(getRestaurants(locale, { limit: CATALOG_LIMIT })),
    settle(getCompanies(locale, { limit: CATALOG_LIMIT })),
    settle(getPlaces(locale, { limit: CATALOG_LIMIT })),
  ]);
  return { tours, hotels, restaurants, companies, places };
});

export function regionsOf(places: PlaceSummary[]): Region[] {
  const regions = new Map<string, Region>(
    places.map((place) => [place.region.slug, place.region]),
  );
  return [...regions.values()];
}

export const getRegions = cache(async (locale: Locale): Promise<Region[]> => {
  const places = await settle(getPlaces(locale, { limit: CATALOG_LIMIT }));
  return regionsOf(places?.items ?? []);
});
