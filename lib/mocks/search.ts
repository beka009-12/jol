import { matchesQuery } from "@/lib/search-match";
import type {
  CompanyKind,
  Cuisine,
  HotelType,
  Locale,
  Page,
  RestaurantType,
  SearchFilters,
  SearchResults,
  TourCategory,
} from "@/lib/types";
import { listCompanies, listHotels, listRestaurants } from "./businesses";
import { listPlaces, listTours } from "./catalog";

/*
  The kinds of things people type, which the listing titles often don't contain:
  "ресторан", "hotel", "ski". Both languages always count, whichever one is on screen.
*/
const CATEGORY_WORDS: Record<TourCategory, string[]> = {
  ski: ["лыжи", "горнолыжный", "сноуборд", "ski", "snowboard"],
  horse: ["конный", "лошадь", "верхом", "horse", "riding"],
  yurt: ["юрта", "yurt"],
  trek: ["поход", "треккинг", "hike", "hiking", "trek"],
  culture: ["культура", "история", "culture", "history"],
};

const HOTEL_WORDS: Record<HotelType, string[]> = {
  hotel: ["отель", "гостиница", "жильё", "hotel", "stay"],
  guesthouse: ["гостевой", "жильё", "guesthouse", "homestay", "stay"],
  yurt_camp: ["юрта", "лагерь", "жильё", "yurt", "camp", "stay"],
  hostel: ["хостел", "жильё", "hostel", "stay"],
  resort: ["пансионат", "санаторий", "жильё", "resort", "stay"],
};

const RESTAURANT_WORDS: Record<RestaurantType, string[]> = {
  restaurant: ["ресторан", "еда", "поесть", "restaurant", "food", "eat"],
  cafe: ["кафе", "еда", "поесть", "cafe", "food", "eat"],
  chaikhana: ["чайхана", "чайная", "еда", "поесть", "chaikhana", "teahouse", "food", "eat"],
  coffee: ["кофе", "кофейня", "coffee", "cafe"],
  bakery: ["пекарня", "хлеб", "лепёшка", "bakery", "bread"],
};

const CUISINE_WORDS: Record<Cuisine, string[]> = {
  kyrgyz: ["кыргызская", "kyrgyz"],
  uzbek: ["узбекская", "плов", "uzbek", "plov"],
  dungan: ["дунганская", "ашлянфу", "dungan"],
  uyghur: ["уйгурская", "лагман", "uyghur", "lagman"],
  european: ["европейская", "european"],
  fish: ["рыба", "форель", "fish", "trout"],
};

const KIND_WORDS: Record<CompanyKind, string[]> = {
  tour_operator: ["турфирма", "туроператор", "компания", "operator", "company", "agency"],
  transfer: ["трансфер", "водитель", "такси", "transfer", "driver", "taxi"],
  guide: ["гид", "guide"],
};

function toPage<T>(items: T[], limit: number): Page<T> {
  return { items: items.slice(0, limit), total: items.length, limit, offset: 0 };
}

export function searchCatalog(
  lang: Locale,
  filters: SearchFilters = {},
): SearchResults {
  const { q = "", region, month, limit = 50 } = filters;

  const tours = listTours(lang, { region, month, limit: 500 }).items.filter(
    (tour) =>
      matchesQuery(q, [
        tour.title,
        tour.place.name,
        tour.region.name,
        ...CATEGORY_WORDS[tour.category],
      ]),
  );

  const hotels = listHotels(lang, { region, month, limit: 500 }).items.filter(
    (hotel) =>
      matchesQuery(q, [
        hotel.name,
        hotel.place.name,
        hotel.region.name,
        ...HOTEL_WORDS[hotel.type],
      ]),
  );

  const restaurants = listRestaurants(lang, { region, month, limit: 500 }).items.filter(
    (restaurant) =>
      matchesQuery(q, [
        restaurant.name,
        restaurant.place.name,
        restaurant.region.name,
        ...RESTAURANT_WORDS[restaurant.type],
        ...restaurant.cuisines.flatMap((cuisine) => CUISINE_WORDS[cuisine]),
      ]),
  );

  const companies = listCompanies(lang, { region, limit: 500 }).items.filter(
    (company) =>
      matchesQuery(q, [
        company.name,
        company.tagline,
        ...company.regions.map((item) => item.name),
        ...KIND_WORDS[company.kind],
      ]),
  );

  const places = listPlaces(lang, { region, limit: 500 }).items.filter(
    (place) =>
      (!month || place.best_months.includes(month)) &&
      matchesQuery(q, [place.name, place.region.name]),
  );

  return {
    tours: toPage(tours, limit),
    hotels: toPage(hotels, limit),
    restaurants: toPage(restaurants, limit),
    companies: toPage(companies, limit),
    places: toPage(places, limit),
  };
}
