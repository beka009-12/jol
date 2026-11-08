import "server-only";

import type {
  CompanyDetail,
  CompanyFilters,
  CompanySummary,
  HotelDetail,
  HotelFilters,
  HotelSummary,
  Locale,
  Page,
  PlaceDetail,
  PlaceFilters,
  PlaceSummary,
  RestaurantDetail,
  RestaurantFilters,
  RestaurantSummary,
  SearchFilters,
  SearchResults,
  SeasonsNow,
  TourDetail,
  TourFilters,
  TourSummary,
} from "@/lib/types";
import { API_PREFIX, toQuery, USE_MOCKS } from "./config";
import { ApiError, isNotFound, toApiError } from "./errors";

const REVALIDATE_SECONDS = 60;
const TIMEOUT_MS = 8000;

async function backendGet<T>(path: string): Promise<T> {
  const base = process.env.BACKEND_URL?.replace(/\/+$/, "");
  if (!base) throw new ApiError(500, "config", "BACKEND_URL is not set");

  const response = await fetch(`${base}${API_PREFIX}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw await toApiError(response);
  return (await response.json()) as T;
}

async function orNull<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export async function getSeasonsNow(lang: Locale): Promise<SeasonsNow> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/catalog");
    return mocks.seasonsNow();
  }
  return backendGet<SeasonsNow>(`/seasons/now${toQuery({ lang })}`);
}

export async function getTours(
  lang: Locale,
  filters: TourFilters = {},
): Promise<Page<TourSummary>> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/catalog");
    return mocks.listTours(lang, filters);
  }
  return backendGet<Page<TourSummary>>(
    `/tours${toQuery({ ...filters, lang })}`,
  );
}

export async function getTour(
  lang: Locale,
  slug: string,
): Promise<TourDetail | null> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/catalog");
    return mocks.getTour(lang, slug);
  }
  return orNull(
    backendGet<TourDetail>(
      `/tours/${encodeURIComponent(slug)}${toQuery({ lang })}`,
    ),
  );
}

export async function getPlaces(
  lang: Locale,
  filters: PlaceFilters = {},
): Promise<Page<PlaceSummary>> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/catalog");
    return mocks.listPlaces(lang, filters);
  }
  return backendGet<Page<PlaceSummary>>(
    `/places${toQuery({ ...filters, lang })}`,
  );
}

export async function getPlace(
  lang: Locale,
  slug: string,
): Promise<PlaceDetail | null> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/catalog");
    return mocks.getPlace(lang, slug);
  }
  return orNull(
    backendGet<PlaceDetail>(
      `/places/${encodeURIComponent(slug)}${toQuery({ lang })}`,
    ),
  );
}

export async function getHotels(
  lang: Locale,
  filters: HotelFilters = {},
): Promise<Page<HotelSummary>> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/businesses");
    return mocks.listHotels(lang, filters);
  }
  return backendGet<Page<HotelSummary>>(
    `/hotels${toQuery({ ...filters, lang })}`,
  );
}

export async function getHotel(
  lang: Locale,
  slug: string,
): Promise<HotelDetail | null> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/businesses");
    return mocks.getHotel(lang, slug);
  }
  return orNull(
    backendGet<HotelDetail>(
      `/hotels/${encodeURIComponent(slug)}${toQuery({ lang })}`,
    ),
  );
}

export async function getRestaurants(
  lang: Locale,
  filters: RestaurantFilters = {},
): Promise<Page<RestaurantSummary>> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/businesses");
    return mocks.listRestaurants(lang, filters);
  }
  return backendGet<Page<RestaurantSummary>>(
    `/restaurants${toQuery({ ...filters, lang })}`,
  );
}

export async function getRestaurant(
  lang: Locale,
  slug: string,
): Promise<RestaurantDetail | null> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/businesses");
    return mocks.getRestaurant(lang, slug);
  }
  return orNull(
    backendGet<RestaurantDetail>(
      `/restaurants/${encodeURIComponent(slug)}${toQuery({ lang })}`,
    ),
  );
}

export async function getCompanies(
  lang: Locale,
  filters: CompanyFilters = {},
): Promise<Page<CompanySummary>> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/businesses");
    return mocks.listCompanies(lang, filters);
  }
  return backendGet<Page<CompanySummary>>(
    `/companies${toQuery({ ...filters, lang })}`,
  );
}

export async function getCompany(
  lang: Locale,
  slug: string,
): Promise<CompanyDetail | null> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/businesses");
    return mocks.getCompany(lang, slug);
  }
  return orNull(
    backendGet<CompanyDetail>(
      `/companies/${encodeURIComponent(slug)}${toQuery({ lang })}`,
    ),
  );
}

export async function searchCatalog(
  lang: Locale,
  filters: SearchFilters = {},
): Promise<SearchResults> {
  if (USE_MOCKS) {
    const mocks = await import("@/lib/mocks/search");
    return mocks.searchCatalog(lang, filters);
  }
  return backendGet<SearchResults>(`/search${toQuery({ ...filters, lang })}`);
}
