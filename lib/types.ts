export type Locale = "en" | "ru";

/*
  Existing backend endpoints: fields match its OpenAPI schema.
*/

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type?: string;
  user: User;
}

export interface ConversationListItem {
  id: string;
  title: string;
  identified_place_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  status: string;
  created_at: string;
}

export interface ConversationDetail extends ConversationListItem {
  messages: ChatMessage[];
}

export interface Attachment {
  id: string;
  object_key: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
}

export interface IdentifiedPlace {
  id: string;
  slug: string;
  name_en: string;
  name_ru: string;
  description_en: string;
  description_ru: string;
  latitude: number;
  longitude: number;
  best_season: string;
  transport_advice: string;
  packing_advice: string;
}

export interface IdentificationResult {
  status: string;
  confidence: number;
  reason: string;
  place: IdentifiedPlace | null;
  alternatives: IdentifiedPlace[];
}

export interface SafetyDetailsInput {
  event_date: string | null;
  route: string | null;
  driver_name: string | null;
  phone: string | null;
  vehicle_model: string | null;
  plate_number: string | null;
}

export interface SafetyDetails extends SafetyDetailsInput {
  id: string;
  created_at: string;
  updated_at: string;
}

/*
  Catalog endpoints are not live yet. These types are the proposed contract:
  lib/mocks returns exactly this shape, and the backend should match it.
  Money is always in tyiyn (1 som = 100). Text fields are localized by ?lang.
*/

export type Availability = "open" | "opens_soon" | "sold_out" | "closed";
export type TourCategory = "ski" | "horse" | "yurt" | "trek" | "culture";
export type Difficulty = "easy" | "moderate" | "hard";
export type TourSort = "popular" | "price_asc" | "price_desc";

export interface Photo {
  url: string;
  alt: string;
  blur_data_url?: string | null;
}

export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface Region {
  slug: string;
  name: string;
}

export interface TourSummary {
  slug: string;
  title: string;
  category: TourCategory;
  photo: Photo;
  place: { slug: string; name: string };
  region: Region;
  /** Lowest adult price, tyiyn. */
  price_from: number;
  availability: Availability;
  /** ISO date; set for opens_soon and closed. */
  opens_on: string | null;
  duration_days: number;
  difficulty: Difficulty;
  /** Months the tour runs, 1-12. */
  months: number[];
}

export interface TourSeason {
  name: string;
  months: number[];
  price_from: number;
}

export interface Departure {
  date: string;
  seats_left: number;
  price: number;
}

export interface TourOperator {
  /** Company page: /companies/{slug}. */
  slug: string;
  name: string;
  /** Digits only, with country code. */
  whatsapp: string;
}

export interface TourDetail extends TourSummary {
  /** Visitors per month, January first, on any scale. Missing until there's data. */
  crowd_by_month?: number[] | null;
  description: string;
  photos: Photo[];
  group_min: number;
  group_max: number;
  seasons: TourSeason[];
  next_departures: Departure[];
  included: string[];
  excluded: string[];
  operator: TourOperator;
}

export interface TourFilters {
  category?: TourCategory;
  place?: string;
  region?: string;
  /** Company slug. */
  operator?: string;
  availability?: Availability;
  month?: number;
  sort?: TourSort;
  limit?: number;
  offset?: number;
}

export interface TourAvailabilityResponse {
  departures: Departure[];
}

export interface QuoteInput {
  date: string;
  adults: number;
  children: number;
}

export interface Quote extends QuoteInput {
  price_adult: number;
  price_child: number;
  total: number;
}

export interface TourRequestInput extends QuoteInput {
  contact_name: string;
  contact_phone: string;
  note?: string;
}

export type TourRequestStatus = "new" | "confirmed" | "declined";

export interface TourRequest {
  id: string;
  tour: { slug: string; title: string; photo: Photo };
  date: string;
  adults: number;
  children: number;
  total: number;
  status: TourRequestStatus;
  created_at: string;
}

export interface PlaceSummary {
  slug: string;
  name: string;
  region: Region;
  photo: Photo;
  /** Months worth visiting, 1-12. */
  best_months: number[];
  open_tours: number;
  /** Where it sits on the country map. */
  latitude: number;
  longitude: number;
}

export interface PlaceDetail extends PlaceSummary {
  /** Visitors per month, January first, on any scale. Missing until there's data. */
  crowd_by_month?: number[] | null;
  description: string;
  photos: Photo[];
  transport_advice: string;
  packing_advice: string;
}

export interface PlaceFilters {
  region?: string;
  limit?: number;
  offset?: number;
}

export interface SeasonsNow {
  month: number;
  open: { category: TourCategory; tour_count: number }[];
  opening_soon: { category: TourCategory; opens_on: string }[];
}

/*
  Businesses: the rest of the system next to tours. Not on the backend yet, so
  like the catalog above these are the proposed contract for
  /hotels, /restaurants, /companies and /search.
*/

export interface PlaceRef {
  slug: string;
  name: string;
}

export interface Rating {
  /** 1 to 5. */
  score: number;
  count: number;
}

export type HotelType =
  | "hotel"
  | "guesthouse"
  | "yurt_camp"
  | "hostel"
  | "resort";

export type HotelAmenity =
  | "wifi"
  | "breakfast"
  | "parking"
  | "heating"
  | "hot_water"
  | "kitchen"
  | "transfer"
  | "beach"
  | "horses"
  | "sauna";

export interface HotelSummary {
  slug: string;
  name: string;
  type: HotelType;
  photo: Photo;
  place: PlaceRef;
  region: Region;
  /** Cheapest room per night, tyiyn. */
  price_from: number;
  rating: Rating | null;
  verified: boolean;
  /** Months it is open, 1-12. */
  months: number[];
  availability: Availability;
  /** ISO date; set for opens_soon and closed. */
  opens_on: string | null;
}

export interface HotelRoom {
  name: string;
  guests: number;
  /** Per night, tyiyn. */
  price: number;
}

export interface HotelDetail extends HotelSummary {
  /** Visitors per month, January first, on any scale. Missing until there's data. */
  crowd_by_month?: number[] | null;
  /** "HH:MM" in Bishkek time. */
  check_in: string;
  check_out: string;
  /** When someone answers at the front desk. Null means around the clock. */
  front_desk: { opens_at: string; closes_at: string } | null;
  description: string;
  photos: Photo[];
  address: string;
  phone: string;
  /** Digits only, with country code. */
  whatsapp: string;
  amenities: HotelAmenity[];
  rooms: HotelRoom[];
}

export interface HotelFilters {
  type?: HotelType;
  region?: string;
  place?: string;
  month?: number;
  availability?: Availability;
  limit?: number;
  offset?: number;
}

export type RestaurantType = "restaurant" | "cafe" | "chaikhana" | "coffee" | "bakery";

export type Cuisine =
  | "kyrgyz"
  | "uzbek"
  | "dungan"
  | "uyghur"
  | "european"
  | "fish";

export interface RestaurantSummary {
  slug: string;
  name: string;
  type: RestaurantType;
  photo: Photo;
  place: PlaceRef;
  region: Region;
  cuisines: Cuisine[];
  /** Typical bill for one person, tyiyn. */
  average_check: number;
  rating: Rating | null;
  verified: boolean;
  /** Opening hours as "HH:MM", in Bishkek time. */
  opens_at: string;
  closes_at: string;
  /** Months it is open, 1-12. */
  months: number[];
  availability: Availability;
  /** ISO date; set for opens_soon and closed. */
  opens_on: string | null;
}

export interface RestaurantDetail extends RestaurantSummary {
  /** Visitors per month, January first, on any scale. Missing until there's data. */
  crowd_by_month?: number[] | null;
  /** Weekdays it stays closed, 0 = Sunday. */
  closed_days: number[];
  description: string;
  photos: Photo[];
  address: string;
  phone: string;
  /** Digits only, with country code. */
  whatsapp: string;
  dishes: string[];
}

export interface RestaurantFilters {
  type?: RestaurantType;
  cuisine?: Cuisine;
  region?: string;
  place?: string;
  month?: number;
  limit?: number;
  offset?: number;
}

export type CompanyKind = "tour_operator" | "transfer" | "guide";

export interface CompanySummary {
  slug: string;
  name: string;
  kind: CompanyKind;
  /** One line on what the company does. */
  tagline: string;
  regions: Region[];
  rating: Rating | null;
  verified: boolean;
  tours_count: number;
}

export interface CompanyDetail extends CompanySummary {
  description: string;
  phone: string;
  /** Digits only, with country code. */
  whatsapp: string;
  /** ISO language codes the company works in. */
  languages: string[];
  founded_year: number;
}

export interface CompanyFilters {
  kind?: CompanyKind;
  region?: string;
  limit?: number;
  offset?: number;
}

export interface SearchFilters {
  q?: string;
  region?: string;
  month?: number;
  limit?: number;
}

export interface SearchResults {
  tours: Page<TourSummary>;
  hotels: Page<HotelSummary>;
  restaurants: Page<RestaurantSummary>;
  companies: Page<CompanySummary>;
  places: Page<PlaceSummary>;
}

export type BusinessKind = "tour_company" | "hotel" | "restaurant" | "other";

export interface BusinessApplicationInput {
  company_name: string;
  kind: BusinessKind;
  region: string;
  contact_name: string;
  contact_phone: string;
  note?: string;
}
