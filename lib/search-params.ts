import { CATEGORIES } from "@/components/category-icon";
import type {
  CompanyKind,
  HotelType,
  RestaurantType,
  TourCategory,
} from "@/lib/types";

export const HOTEL_TYPES: HotelType[] = [
  "hotel",
  "guesthouse",
  "yurt_camp",
  "hostel",
  "resort",
];

export const RESTAURANT_TYPES: RestaurantType[] = [
  "restaurant",
  "cafe",
  "chaikhana",
  "coffee",
  "bakery",
];

export const COMPANY_KINDS: CompanyKind[] = [
  "tour_operator",
  "transfer",
  "guide",
];

export function parseCategory(value: unknown): TourCategory | undefined {
  return CATEGORIES.find((category) => category === value);
}

export function parseHotelType(value: unknown): HotelType | undefined {
  return HOTEL_TYPES.find((type) => type === value);
}

export function parseRestaurantType(value: unknown): RestaurantType | undefined {
  return RESTAURANT_TYPES.find((type) => type === value);
}

export function parseCompanyKind(value: unknown): CompanyKind | undefined {
  return COMPANY_KINDS.find((kind) => kind === value);
}

export function parseMonth(value: unknown): number | undefined {
  const month = Number(value);
  return Number.isInteger(month) && month >= 1 && month <= 12
    ? month
    : undefined;
}

/** Slugs go into the API query as they are, so only accept the plain slug shape. */
export function parseSlug(value: unknown): string | undefined {
  return typeof value === "string" && /^[a-z0-9-]{1,60}$/.test(value)
    ? value
    : undefined;
}

export function parseQuery(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 100) : "";
}
