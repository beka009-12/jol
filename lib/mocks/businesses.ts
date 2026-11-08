import type {
  CompanyDetail,
  CompanyFilters,
  CompanyKind,
  CompanySummary,
  Cuisine,
  HotelAmenity,
  HotelDetail,
  HotelFilters,
  HotelSummary,
  HotelType,
  Locale,
  Page,
  Rating,
  RestaurantDetail,
  RestaurantFilters,
  RestaurantSummary,
  RestaurantType,
} from "@/lib/types";
import {
  type L,
  listTours,
  placeCrowd,
  placeRef,
  placeRegionKey,
  type RegionKey,
  regionOf,
  seasonStatus,
} from "./catalog";
import { photo, type PhotoKey } from "./photos";

/*
  Fictional demo businesses with the same shape the API is expected to return.
  The names, ratings, prices and contacts are invented; replace them with real
  businesses, with their consent, before this is shown publicly.
*/

const TYIYN_PER_SOM = 100;
const ALL_YEAR = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const WARM = [5, 6, 7, 8, 9, 10];
const SUMMER = [6, 7, 8, 9];

interface MockPhoto {
  key: PhotoKey;
  alt: L;
}

function ratingOf(value: [number, number] | null): Rating | null {
  return value ? { score: value[0], count: value[1] } : null;
}

function paginate<T>(items: T[], limit = 50, offset = 0): Page<T> {
  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
    limit,
    offset,
  };
}

/* ---------- Hotels ---------- */

interface MockHotel {
  slug: string;
  name: L;
  type: HotelType;
  place: string;
  rating: [number, number] | null;
  verified: boolean;
  months: number[];
  photos: MockPhoto[];
  description: L;
  address: L;
  whatsapp: string;
  amenities: HotelAmenity[];
  rooms: { name: L; guests: number; price: number }[];
}

/* Rules differ by kind of stay; a real listing would set its own. */
const STAY_TIMES: Record<
  HotelType,
  { checkIn: string; checkOut: string; frontDesk: [string, string] | null }
> = {
  hotel: { checkIn: "14:00", checkOut: "12:00", frontDesk: null },
  guesthouse: { checkIn: "13:00", checkOut: "11:00", frontDesk: ["08:00", "22:00"] },
  yurt_camp: { checkIn: "14:00", checkOut: "10:00", frontDesk: ["08:00", "21:00"] },
  hostel: { checkIn: "14:00", checkOut: "11:00", frontDesk: null },
  resort: { checkIn: "14:00", checkOut: "12:00", frontDesk: null },
};

const DOUBLE: L = { en: "Double room", ru: "Двухместный номер" };
const FAMILY: L = { en: "Family room", ru: "Семейный номер" };
const SUITE: L = { en: "Suite", ru: "Люкс" };
const DORM: L = { en: "Bed in a shared room", ru: "Место в общей комнате" };
const PRIVATE: L = { en: "Private room", ru: "Отдельная комната" };
const YURT: L = { en: "Bed in a shared yurt", ru: "Место в общей юрте" };
const WHOLE_YURT: L = { en: "Whole yurt", ru: "Юрта целиком" };

const YURT_INSIDE: MockPhoto = {
  key: "yurt-interior",
  alt: {
    en: "Inside a yurt: carpets, low table and felt cushions",
    ru: "Внутри юрты: ковры, низкий стол и войлочные подушки",
  },
};

const HOTELS: MockHotel[] = [
  {
    slug: "topol-hotel",
    name: { en: "Topol", ru: "Тополь" },
    type: "hotel",
    place: "bishkek",
    rating: [4.6, 214],
    verified: true,
    months: ALL_YEAR,
    photos: [
      {
        key: "stay-hotel",
        alt: {
          en: "A hotel room with a wide bed and a lit bedside lamp",
          ru: "Гостиничный номер с широкой кроватью и лампой у изголовья",
        },
      },
      {
        key: "bishkek-square",
        alt: {
          en: "Ala-Too Square, a short walk from the hotel",
          ru: "Площадь Ала-Тоо, рядом с отелем",
        },
      },
    ],
    description: {
      en: "A city hotel in the centre, walking distance from Ala-Too Square and the main cafes. Airport transfer on request.",
      ru: "Городской отель в центре, пешком до площади Ала-Тоо и главных кафе. Трансфер из аэропорта по запросу.",
    },
    address: { en: "Bishkek, city centre", ru: "Бишкек, центр" },
    whatsapp: "996700000101",
    amenities: ["wifi", "breakfast", "parking", "heating", "transfer"],
    rooms: [
      { name: DOUBLE, guests: 2, price: 5400 },
      { name: SUITE, guests: 3, price: 8900 },
    ],
  },
  {
    slug: "crossroads-hostel",
    name: { en: "Crossroads", ru: "Перекрёсток" },
    type: "hostel",
    place: "bishkek",
    rating: [4.4, 388],
    verified: false,
    months: ALL_YEAR,
    photos: [
      {
        key: "stay-hostel",
        alt: {
          en: "Bunk beds in a wood-panelled hostel room",
          ru: "Двухъярусные кровати в хостеле с деревянной отделкой",
        },
      },
    ],
    description: {
      en: "A simple hostel near the Western bus station, handy for an early minibus. A shared kitchen and people to split a taxi with.",
      ru: "Простой хостел у Западного автовокзала, удобно перед ранней маршруткой. Общая кухня и попутчики, с которыми можно разделить такси.",
    },
    address: { en: "Bishkek, near the Western bus station", ru: "Бишкек, у Западного автовокзала" },
    whatsapp: "996700000102",
    amenities: ["wifi", "kitchen", "heating", "hot_water"],
    rooms: [
      { name: DORM, guests: 1, price: 800 },
      { name: PRIVATE, guests: 2, price: 2200 },
    ],
  },
  {
    slug: "three-spruces-guesthouse",
    name: { en: "Three Spruces", ru: "Три ели" },
    type: "guesthouse",
    place: "karakol",
    rating: [4.8, 156],
    verified: true,
    months: ALL_YEAR,
    photos: [
      {
        key: "stay-guesthouse",
        alt: {
          en: "A guesthouse dining room with the table set for breakfast",
          ru: "Столовая гостевого дома, стол накрыт к завтраку",
        },
      },
      {
        key: "ski-pines",
        alt: {
          en: "Snowy spruce trees in the mountains above Karakol",
          ru: "Заснеженные ели в горах над Караколом",
        },
      },
    ],
    description: {
      en: "A family guesthouse with a big breakfast and a boot room for skiers. The owners arrange transfers to the ski base.",
      ru: "Семейный гостевой дом с большим завтраком и сушилкой для лыжных ботинок. Хозяева помогут с трансфером на базу.",
    },
    address: { en: "Karakol, quiet street near the centre", ru: "Каракол, тихая улица рядом с центром" },
    whatsapp: "996700000103",
    amenities: ["wifi", "breakfast", "heating", "hot_water", "transfer"],
    rooms: [
      { name: DOUBLE, guests: 2, price: 2800 },
      { name: FAMILY, guests: 4, price: 4600 },
    ],
  },
  {
    slug: "blue-shutters-house",
    name: { en: "Blue Shutters", ru: "Синие ставни" },
    type: "guesthouse",
    place: "karakol",
    rating: [4.5, 92],
    verified: false,
    months: ALL_YEAR,
    photos: [
      {
        key: "stay-homestay",
        alt: {
          en: "A homestay room with carpets and a low sofa",
          ru: "Комната в гостевом доме с коврами и низким диваном",
        },
      },
    ],
    description: {
      en: "An old Russian-style house with carved shutters and a garden. Home cooking in the evenings if you ask in the morning.",
      ru: "Старый дом с резными ставнями и садом. Домашний ужин, если предупредить утром.",
    },
    address: { en: "Karakol, old town", ru: "Каракол, старый город" },
    whatsapp: "996700000104",
    amenities: ["wifi", "breakfast", "heating", "kitchen"],
    rooms: [
      { name: DOUBLE, guests: 2, price: 2200 },
      { name: FAMILY, guests: 4, price: 3800 },
    ],
  },
  {
    slug: "pereval-hotel",
    name: { en: "Pereval", ru: "Перевал" },
    type: "hotel",
    place: "karakol",
    rating: [4.3, 121],
    verified: true,
    months: ALL_YEAR,
    photos: [
      {
        key: "stay-hotel-2",
        alt: {
          en: "A hotel room with a queen-size bed",
          ru: "Гостиничный номер с большой кроватью",
        },
      },
    ],
    description: {
      en: "A small hotel on the road to the ski base, with a sauna and a place to store skis.",
      ru: "Небольшой отель на дороге к горнолыжной базе, с сауной и местом для лыж.",
    },
    address: { en: "Karakol, ski base road", ru: "Каракол, дорога на горнолыжную базу" },
    whatsapp: "996700000105",
    amenities: ["wifi", "breakfast", "parking", "heating", "sauna"],
    rooms: [
      { name: DOUBLE, guests: 2, price: 4200 },
      { name: SUITE, guests: 3, price: 6800 },
    ],
  },
  {
    slug: "quiet-shore-resort",
    name: { en: "Quiet Shore", ru: "Тихий берег" },
    type: "resort",
    place: "issyk-kul",
    rating: [4.4, 302],
    verified: true,
    months: SUMMER,
    photos: [
      {
        key: "stay-resort",
        alt: {
          en: "Wooden beach pavilions on Issyk-Kul with snowy mountains behind",
          ru: "Деревянные павильоны на пляже Иссык-Куля на фоне снежных гор",
        },
      },
    ],
    description: {
      en: "A summer resort on its own stretch of beach, with three meals a day and a playground for children.",
      ru: "Летний пансионат со своим пляжем, трёхразовым питанием и площадкой для детей.",
    },
    address: { en: "Issyk-Kul, north shore", ru: "Иссык-Куль, северный берег" },
    whatsapp: "996700000106",
    amenities: ["breakfast", "beach", "parking", "wifi"],
    rooms: [
      { name: DOUBLE, guests: 2, price: 5200 },
      { name: FAMILY, guests: 4, price: 8400 },
    ],
  },
  {
    slug: "tamga-garden-guesthouse",
    name: { en: "Tamga Garden", ru: "Сад в Тамге" },
    type: "guesthouse",
    place: "issyk-kul",
    rating: [4.9, 74],
    verified: true,
    months: ALL_YEAR,
    photos: [
      {
        key: "stay-garden",
        alt: {
          en: "A turquoise house behind a garden of yellow roses",
          ru: "Бирюзовый дом за садом с жёлтыми розами",
        },
      },
    ],
    description: {
      en: "A quiet house on the south shore in a garden full of roses. Ten minutes on foot to the lake.",
      ru: "Тихий дом на южном берегу в саду с розами. Десять минут пешком до озера.",
    },
    address: { en: "Tamga village, south shore of Issyk-Kul", ru: "Село Тамга, южный берег Иссык-Куля" },
    whatsapp: "996700000107",
    amenities: ["breakfast", "wifi", "kitchen", "parking"],
    rooms: [
      { name: DOUBLE, guests: 2, price: 2600 },
      { name: FAMILY, guests: 5, price: 4400 },
    ],
  },
  {
    slug: "jailoo-yurt-camp",
    name: { en: "Jailoo Camp", ru: "Жайлоо" },
    type: "yurt_camp",
    place: "song-kol",
    rating: [4.7, 233],
    verified: true,
    months: SUMMER,
    photos: [
      {
        key: "yurt-song-kol",
        alt: {
          en: "A yurt camp on the high pasture at Song-Kol",
          ru: "Юрточный лагерь на высокогорном пастбище у Сон-Куля",
        },
      },
      YURT_INSIDE,
    ],
    description: {
      en: "Herding family's camp on the lake shore. Felt yurts, home meals, horses by the hour. Nights are cold, so stoves and thick blankets are included.",
      ru: "Лагерь семьи пастухов на берегу озера. Войлочные юрты, домашняя еда, лошади на час. Ночи холодные, печка и толстые одеяла включены.",
    },
    address: { en: "Song-Kol, west shore", ru: "Сон-Куль, западный берег" },
    whatsapp: "996700000108",
    amenities: ["breakfast", "horses", "transfer"],
    rooms: [
      { name: YURT, guests: 1, price: 2400 },
      { name: WHOLE_YURT, guests: 4, price: 8000 },
    ],
  },
  {
    slug: "hot-springs-yurts",
    name: { en: "Hot Springs Yurts", ru: "Юрты у источников" },
    type: "yurt_camp",
    place: "altyn-arashan",
    rating: [4.6, 167],
    verified: false,
    months: WARM,
    photos: [
      {
        key: "yurt-altyn-arashan",
        alt: {
          en: "White yurts in the green Altyn Arashan valley",
          ru: "Белые юрты в зелёной долине Алтын-Арашан",
        },
      },
      YURT_INSIDE,
    ],
    description: {
      en: "Yurts in the valley, a short walk from the hot springs. Reached on foot, on horseback or in a 4×4 from Ak-Suu.",
      ru: "Юрты в долине, недалеко от горячих источников. Добраться можно пешком, верхом или на внедорожнике из Ак-Суу.",
    },
    address: { en: "Altyn Arashan valley", ru: "Долина Алтын-Арашан" },
    whatsapp: "996700000109",
    amenities: ["breakfast", "horses", "hot_water"],
    rooms: [
      { name: YURT, guests: 1, price: 1800 },
      { name: WHOLE_YURT, guests: 4, price: 6200 },
    ],
  },
  {
    slug: "red-rock-house",
    name: { en: "Red Rock House", ru: "Дом у красных скал" },
    type: "guesthouse",
    place: "jeti-oguz",
    rating: [4.5, 58],
    verified: false,
    months: WARM,
    photos: [
      {
        key: "jeti-oguz",
        alt: {
          en: "The red rocks of Jeti-Oguz among spruce trees",
          ru: "Красные скалы Джети-Огуза среди елей",
        },
      },
    ],
    description: {
      en: "A guesthouse at the mouth of the gorge, with the red rocks right outside. A good base for a day hike or a ride.",
      ru: "Гостевой дом у входа в ущелье, красные скалы прямо за окном. Удобная база для похода или конной прогулки.",
    },
    address: { en: "Jeti-Oguz gorge", ru: "Ущелье Джети-Огуз" },
    whatsapp: "996700000110",
    amenities: ["breakfast", "parking", "horses"],
    rooms: [
      { name: DOUBLE, guests: 2, price: 2000 },
      { name: FAMILY, guests: 4, price: 3400 },
    ],
  },
  {
    slug: "caravanserai-camp",
    name: { en: "Caravanserai Camp", ru: "Лагерь у караван-сарая" },
    type: "yurt_camp",
    place: "tash-rabat",
    rating: [4.6, 88],
    verified: true,
    months: SUMMER,
    photos: [
      {
        key: "tash-rabat",
        alt: {
          en: "The stone caravanserai of Tash Rabat with yurts nearby",
          ru: "Каменный караван-сарай Таш-Рабат, рядом стоят юрты",
        },
      },
      YURT_INSIDE,
    ],
    description: {
      en: "Yurts a few minutes' walk from the caravanserai. At 3,200 metres the nights are cold even in July.",
      ru: "Юрты в нескольких минутах от караван-сарая. На высоте 3200 метров ночи холодные даже в июле.",
    },
    address: { en: "Tash Rabat valley", ru: "Долина Таш-Рабат" },
    whatsapp: "996700000111",
    amenities: ["breakfast", "horses"],
    rooms: [
      { name: YURT, guests: 1, price: 2000 },
      { name: WHOLE_YURT, guests: 4, price: 7000 },
    ],
  },
  {
    slug: "old-osh-hotel",
    name: { en: "Old Osh", ru: "Старый Ош" },
    type: "hotel",
    place: "osh",
    rating: [4.2, 176],
    verified: true,
    months: ALL_YEAR,
    photos: [
      {
        key: "stay-hotel-3",
        alt: {
          en: "A twin hotel room with white bedding",
          ru: "Гостиничный номер с двумя кроватями и белым бельём",
        },
      },
      {
        key: "osh",
        alt: {
          en: "Sulayman Mountain rising above Osh",
          ru: "Гора Сулайман-Тоо над Ошем",
        },
      },
    ],
    description: {
      en: "A hotel in the city centre with a view of Sulayman Mountain from the upper floors.",
      ru: "Отель в центре города, с верхних этажей видна гора Сулайман-Тоо.",
    },
    address: { en: "Osh, city centre", ru: "Ош, центр" },
    whatsapp: "996700000112",
    amenities: ["wifi", "breakfast", "parking", "heating"],
    rooms: [
      { name: DOUBLE, guests: 2, price: 3600 },
      { name: SUITE, guests: 3, price: 5800 },
    ],
  },
  {
    slug: "bazaar-guesthouse",
    name: { en: "Bazaar Guesthouse", ru: "Дом у базара" },
    type: "guesthouse",
    place: "osh",
    rating: [4.6, 67],
    verified: false,
    months: ALL_YEAR,
    photos: [
      {
        key: "stay-garden-2",
        alt: {
          en: "A guesthouse garden path among flowers",
          ru: "Садовая дорожка гостевого дома среди цветов",
        },
      },
    ],
    description: {
      en: "A family house with a courtyard, five minutes from the bazaar. Tea and flatbread in the mornings.",
      ru: "Семейный дом с двором, пять минут до базара. По утрам чай и лепёшки.",
    },
    address: { en: "Osh, near Jayma bazaar", ru: "Ош, рядом с базаром Жайма" },
    whatsapp: "996700000113",
    amenities: ["breakfast", "wifi", "kitchen"],
    rooms: [
      { name: DOUBLE, guests: 2, price: 1900 },
      { name: FAMILY, guests: 4, price: 3200 },
    ],
  },
  {
    slug: "walnut-guesthouse",
    name: { en: "Walnut House", ru: "Ореховый" },
    type: "guesthouse",
    place: "sary-chelek",
    rating: [4.7, 41],
    verified: false,
    months: WARM,
    photos: [
      {
        key: "sary-chelek",
        alt: {
          en: "Sary-Chelek lake among wooded mountains",
          ru: "Озеро Сары-Челек среди лесистых гор",
        },
      },
    ],
    description: {
      en: "The last stop before the reserve. The hosts organise the ride up to the lake and pack lunches for the day.",
      ru: "Последняя остановка перед заповедником. Хозяева организуют подъём к озеру и соберут обед с собой.",
    },
    address: { en: "Arkyt village, by the reserve", ru: "Село Аркыт, у заповедника" },
    whatsapp: "996700000114",
    amenities: ["breakfast", "transfer", "parking"],
    rooms: [
      { name: DOUBLE, guests: 2, price: 2100 },
      { name: FAMILY, guests: 4, price: 3600 },
    ],
  },
  {
    slug: "gorge-shelter",
    name: { en: "Gorge Shelter", ru: "Приют в ущелье" },
    type: "hostel",
    place: "ala-archa",
    rating: [4.3, 134],
    verified: true,
    months: ALL_YEAR,
    photos: [
      {
        key: "ala-archa",
        alt: {
          en: "Snow-capped peaks above spruce forest in Ala-Archa",
          ru: "Снежные вершины над еловым лесом в Ала-Арче",
        },
      },
    ],
    description: {
      en: "A simple shelter inside the national park, used by hikers before an early start. Bring a warm layer.",
      ru: "Простой приют в национальном парке для тех, кто выходит на маршрут рано утром. Возьмите тёплую одежду.",
    },
    address: { en: "Ala-Archa National Park", ru: "Национальный парк Ала-Арча" },
    whatsapp: "996700000115",
    amenities: ["heating", "kitchen", "parking"],
    rooms: [
      { name: DORM, guests: 1, price: 900 },
      { name: PRIVATE, guests: 2, price: 2400 },
    ],
  },
  {
    slug: "canyon-camp",
    name: { en: "Canyon Camp", ru: "Лагерь у каньона" },
    type: "yurt_camp",
    place: "skazka",
    rating: [4.5, 96],
    verified: false,
    months: WARM,
    photos: [
      {
        key: "skazka",
        alt: {
          en: "The red rock formations of Skazka canyon",
          ru: "Красные скалы каньона Сказка",
        },
      },
      YURT_INSIDE,
    ],
    description: {
      en: "Yurts between the canyon and the lake. Walk the rock formations at sunset, swim in the morning.",
      ru: "Юрты между каньоном и озером. Вечером прогулка среди скал, утром можно искупаться.",
    },
    address: { en: "Tosor, south shore of Issyk-Kul", ru: "Тосор, южный берег Иссык-Куля" },
    whatsapp: "996700000116",
    amenities: ["breakfast", "beach", "parking"],
    rooms: [
      { name: YURT, guests: 1, price: 1500 },
      { name: WHOLE_YURT, guests: 4, price: 5400 },
    ],
  },
];

function toHotelSummary(hotel: MockHotel, lang: Locale): HotelSummary {
  const cover = hotel.photos[0];
  const { availability, opensOn } = seasonStatus(hotel.months);
  return {
    slug: hotel.slug,
    name: hotel.name[lang],
    type: hotel.type,
    photo: photo(cover.key, cover.alt[lang]),
    place: placeRef(hotel.place, lang),
    region: regionOf(placeRegionKey(hotel.place), lang),
    price_from:
      Math.min(...hotel.rooms.map((room) => room.price)) * TYIYN_PER_SOM,
    rating: ratingOf(hotel.rating),
    verified: hotel.verified,
    months: hotel.months,
    availability,
    opens_on: opensOn,
  };
}

const AVAILABILITY_RANK: Record<HotelSummary["availability"], number> = {
  open: 0,
  opens_soon: 1,
  closed: 2,
  sold_out: 3,
};

export function listHotels(
  lang: Locale,
  filters: HotelFilters = {},
): Page<HotelSummary> {
  const items = HOTELS.filter(
    (hotel) =>
      (!filters.type || hotel.type === filters.type) &&
      (!filters.place || hotel.place === filters.place) &&
      (!filters.region || placeRegionKey(hotel.place) === filters.region) &&
      (!filters.month || hotel.months.includes(filters.month)),
  )
    .map((hotel) => toHotelSummary(hotel, lang))
    .filter(
      (hotel) =>
        !filters.availability || hotel.availability === filters.availability,
    )
    .sort(
      (a, b) =>
        AVAILABILITY_RANK[a.availability] - AVAILABILITY_RANK[b.availability],
    );
  return paginate(items, filters.limit, filters.offset);
}

export function getHotel(lang: Locale, slug: string): HotelDetail | null {
  const hotel = HOTELS.find((candidate) => candidate.slug === slug);
  if (!hotel) return null;
  const times = STAY_TIMES[hotel.type];
  return {
    ...toHotelSummary(hotel, lang),
    crowd_by_month: placeCrowd(hotel.place),
    check_in: times.checkIn,
    check_out: times.checkOut,
    front_desk: times.frontDesk
      ? { opens_at: times.frontDesk[0], closes_at: times.frontDesk[1] }
      : null,
    description: hotel.description[lang],
    photos: hotel.photos.map((item) => photo(item.key, item.alt[lang])),
    address: hotel.address[lang],
    phone: `+${hotel.whatsapp}`,
    whatsapp: hotel.whatsapp,
    amenities: hotel.amenities,
    rooms: hotel.rooms.map((room) => ({
      name: room.name[lang],
      guests: room.guests,
      price: room.price * TYIYN_PER_SOM,
    })),
  };
}

/* ---------- Restaurants ---------- */

interface MockRestaurant {
  slug: string;
  name: L;
  type: RestaurantType;
  place: string;
  cuisines: Cuisine[];
  /** Som per person. */
  check: number;
  rating: [number, number] | null;
  verified: boolean;
  hours: [string, string];
  /** All year when left out. */
  months?: number[];
  /** Open every day when left out. 0 = Sunday. */
  closedDays?: number[];
  photos: MockPhoto[];
  description: L;
  address: L;
  whatsapp: string;
  dishes: L[];
}

const BESHBARMAK: L = { en: "Beshbarmak", ru: "Бешбармак" };
const LAGMAN: L = { en: "Lagman", ru: "Лагман" };
const PLOV: L = { en: "Plov", ru: "Плов" };
const MANTY: L = { en: "Manty", ru: "Манты" };
const SAMSA: L = { en: "Samsa", ru: "Самса" };
const ASHLAN_FU: L = { en: "Ashlan-fu", ru: "Ашлянфу" };
const KUURDAK: L = { en: "Kuurdak", ru: "Куурдак" };
const SHASHLIK: L = { en: "Shashlik", ru: "Шашлык" };
const GREEN_TEA: L = { en: "Green tea", ru: "Зелёный чай" };

const RESTAURANTS: MockRestaurant[] = [
  {
    slug: "five-spices-chaikhana",
    name: { en: "Five Spices", ru: "Пять специй" },
    type: "chaikhana",
    place: "bishkek",
    cuisines: ["uzbek", "kyrgyz"],
    check: 650,
    rating: [4.7, 512],
    verified: true,
    hours: ["10:00", "23:00"],
    photos: [
      {
        key: "food-plov",
        alt: {
          en: "A large dish of plov with meat and carrots",
          ru: "Большое блюдо плова с мясом и морковью",
        },
      },
    ],
    description: {
      en: "Plov from the big cauldron at lunchtime, low tables and pots of green tea. Busiest around one o'clock.",
      ru: "Плов из большого казана к обеду, низкие столики и чайники зелёного чая. Больше всего гостей около часа дня.",
    },
    address: { en: "Bishkek, city centre", ru: "Бишкек, центр" },
    whatsapp: "996700000201",
    dishes: [PLOV, LAGMAN, SAMSA, GREEN_TEA],
  },
  {
    slug: "brick-coffee",
    name: { en: "Brick Coffee", ru: "Кирпич" },
    type: "coffee",
    place: "bishkek",
    cuisines: ["european"],
    check: 450,
    rating: [4.8, 268],
    verified: true,
    hours: ["08:00", "22:00"],
    photos: [
      {
        key: "cafe-coffee",
        alt: {
          en: "A coffee shop with a brick wall and a long wooden table",
          ru: "Кофейня с кирпичной стеной и длинным деревянным столом",
        },
      },
    ],
    description: {
      en: "Good coffee, breakfast until noon and a long table to work at. The Wi-Fi holds up on video calls.",
      ru: "Хороший кофе, завтраки до полудня и длинный стол для работы. Wi-Fi выдерживает видеозвонки.",
    },
    address: { en: "Bishkek, city centre", ru: "Бишкек, центр" },
    whatsapp: "996700000202",
    dishes: [
      { en: "Filter coffee", ru: "Фильтр-кофе" },
      { en: "Breakfast plate", ru: "Завтрак на тарелке" },
    ],
  },
  {
    slug: "tunduk-restaurant",
    name: { en: "Tunduk", ru: "Тундук" },
    type: "restaurant",
    place: "bishkek",
    cuisines: ["kyrgyz"],
    check: 1100,
    rating: [4.6, 341],
    verified: true,
    hours: ["12:00", "23:30"],
    photos: [
      {
        key: "food-beshbarmak",
        alt: {
          en: "Beshbarmak with potatoes, beef and herbs on a patterned dish",
          ru: "Бешбармак с картофелем, говядиной и зеленью на узорном блюде",
        },
      },
    ],
    description: {
      en: "Kyrgyz dishes for a proper sit-down dinner, including the ones you rarely see outside a family home.",
      ru: "Кыргызская кухня для настоящего ужина, в том числе блюда, которые редко встретишь вне семейного стола.",
    },
    address: { en: "Bishkek, city centre", ru: "Бишкек, центр" },
    whatsapp: "996700000203",
    dishes: [BESHBARMAK, KUURDAK, MANTY],
  },
  {
    slug: "market-ashlan-fu",
    closedDays: [0],
    name: { en: "Market Ashlan-Fu", ru: "Ашлянфу у рынка" },
    type: "cafe",
    place: "karakol",
    cuisines: ["dungan", "uyghur"],
    check: 300,
    rating: [4.9, 624],
    verified: true,
    hours: ["09:00", "19:00"],
    photos: [
      {
        key: "food-lagman",
        alt: {
          en: "A plate of fried lagman with vegetables and herbs",
          ru: "Тарелка жареного лагмана с овощами и зеленью",
        },
      },
    ],
    description: {
      en: "Karakol's cold noodle soup and fried lagman, served fast at plain tables by the market. Closes when the food runs out.",
      ru: "Каракольский холодный суп с лапшой и жареный лагман, быстро и за простыми столами у рынка. Закрывается, когда заканчивается еда.",
    },
    address: { en: "Karakol, by the central market", ru: "Каракол, у центрального рынка" },
    whatsapp: "996700000204",
    dishes: [ASHLAN_FU, LAGMAN, SAMSA],
  },
  {
    slug: "pereval-grill",
    name: { en: "Pereval Grill", ru: "Гриль Перевал" },
    type: "restaurant",
    place: "karakol",
    cuisines: ["european", "kyrgyz"],
    check: 900,
    rating: [4.4, 187],
    verified: false,
    hours: ["12:00", "23:00"],
    photos: [
      {
        key: "food-langet",
        alt: {
          en: "A grilled steak with onions and vegetables",
          ru: "Стейк на гриле с луком и овощами",
        },
      },
    ],
    description: {
      en: "Meat from the grill and a warm room after a day on the slopes.",
      ru: "Мясо на гриле и тёплый зал после дня на склоне.",
    },
    address: { en: "Karakol, ski base road", ru: "Каракол, дорога на горнолыжную базу" },
    whatsapp: "996700000205",
    dishes: [SHASHLIK, KUURDAK],
  },
  {
    slug: "balyk-fish-house",
    name: { en: "Balyk", ru: "Балык" },
    type: "restaurant",
    place: "issyk-kul",
    cuisines: ["fish"],
    check: 1000,
    rating: [4.5, 203],
    verified: true,
    hours: ["11:00", "22:00"],
    photos: [
      {
        key: "food-fish",
        alt: {
          en: "A whole baked fish with lemon and vegetables",
          ru: "Запечённая целиком рыба с лимоном и овощами",
        },
      },
    ],
    description: {
      en: "Issyk-Kul trout baked whole or smoked, on the road along the north shore.",
      ru: "Иссык-кульская форель, запечённая целиком или копчёная, на дороге вдоль северного берега.",
    },
    address: { en: "Issyk-Kul, north shore road", ru: "Иссык-Куль, трасса вдоль северного берега" },
    whatsapp: "996700000206",
    dishes: [
      { en: "Baked trout", ru: "Запечённая форель" },
      { en: "Smoked fish", ru: "Копчёная рыба" },
    ],
  },
  {
    slug: "beach-kitchen",
    months: SUMMER,
    name: { en: "Beach Kitchen", ru: "Пляжная кухня" },
    type: "cafe",
    place: "issyk-kul",
    cuisines: ["european"],
    check: 600,
    rating: [4.2, 149],
    verified: false,
    hours: ["09:00", "21:00"],
    photos: [
      {
        key: "beach-umbrellas",
        alt: {
          en: "Striped umbrellas on a sandy beach of Issyk-Kul",
          ru: "Полосатые зонты на песчаном пляже Иссык-Куля",
        },
      },
    ],
    description: {
      en: "Salads, cold drinks and shade right on the sand, in the summer season.",
      ru: "Салаты, холодные напитки и тень прямо на песке, в летний сезон.",
    },
    address: { en: "Issyk-Kul, north shore", ru: "Иссык-Куль, северный берег" },
    whatsapp: "996700000207",
    dishes: [
      { en: "Summer salad", ru: "Летний салат" },
      { en: "Grilled corn", ru: "Кукуруза на гриле" },
    ],
  },
  {
    slug: "jailoo-kitchen",
    months: SUMMER,
    name: { en: "Jailoo Kitchen", ru: "Кухня Жайлоо" },
    type: "cafe",
    place: "song-kol",
    cuisines: ["kyrgyz"],
    check: 500,
    rating: [4.6, 77],
    verified: false,
    hours: ["08:00", "21:00"],
    photos: [
      {
        key: "food-kulchotai",
        alt: {
          en: "Kulchotai, flat noodles with meat, in a wide bowl",
          ru: "Кулчётай, плоская лапша с мясом, в широкой миске",
        },
      },
    ],
    description: {
      en: "Herders' home cooking in a yurt by the lake. Try fresh kymyz if you are here in summer.",
      ru: "Домашняя еда пастухов в юрте у озера. Летом попробуйте свежий кымыз.",
    },
    address: { en: "Song-Kol, west shore", ru: "Сон-Куль, западный берег" },
    whatsapp: "996700000208",
    dishes: [BESHBARMAK, { en: "Kymyz", ru: "Кымыз" }],
  },
  {
    slug: "bazaar-plov",
    closedDays: [1],
    name: { en: "Bazaar Plov", ru: "Плов на базаре" },
    type: "chaikhana",
    place: "osh",
    cuisines: ["uzbek"],
    check: 350,
    rating: [4.8, 433],
    verified: true,
    hours: ["09:00", "17:00"],
    photos: [
      {
        key: "bazaar-spices",
        alt: {
          en: "Sacks of spices and dried fruit at a bazaar stall",
          ru: "Мешки со специями и сухофруктами на базарном прилавке",
        },
      },
    ],
    description: {
      en: "Osh-style plov with yellow carrots, in the middle of the bazaar. Go at lunchtime before it sells out.",
      ru: "Ошский плов с жёлтой морковью прямо на базаре. Приходите к обеду, пока не закончился.",
    },
    address: { en: "Osh, Jayma bazaar", ru: "Ош, базар Жайма" },
    whatsapp: "996700000209",
    dishes: [PLOV, GREEN_TEA],
  },
  {
    slug: "tandyr-bakery",
    closedDays: [0],
    name: { en: "Tandyr Bakery", ru: "Тандыр" },
    type: "bakery",
    place: "osh",
    cuisines: ["uzbek"],
    check: 150,
    rating: [4.9, 215],
    verified: false,
    hours: ["07:00", "16:00"],
    photos: [
      {
        key: "bazaar-bread",
        alt: {
          en: "Stacks of round flatbread at a bazaar stall",
          ru: "Стопки круглых лепёшек на базарном прилавке",
        },
      },
    ],
    description: {
      en: "Flatbread and samsa straight from the clay oven. Hot from seven in the morning.",
      ru: "Лепёшки и самса прямо из глиняной печи. Горячие с семи утра.",
    },
    address: { en: "Osh, near Jayma bazaar", ru: "Ош, рядом с базаром Жайма" },
    whatsapp: "996700000210",
    dishes: [SAMSA, { en: "Flatbread", ru: "Лепёшка" }],
  },
  {
    slug: "gorge-teahouse",
    months: WARM,
    name: { en: "Gorge Teahouse", ru: "Чайная в ущелье" },
    type: "chaikhana",
    place: "jeti-oguz",
    cuisines: ["kyrgyz"],
    check: 400,
    rating: [4.3, 64],
    verified: false,
    hours: ["09:00", "20:00"],
    photos: [
      {
        key: "food-salad",
        alt: {
          en: "A big bowl of cucumber and carrot salad",
          ru: "Большая миска салата из огурцов и моркови",
        },
      },
    ],
    description: {
      en: "A stop on the way into the gorge: soup, salad and a pot of tea.",
      ru: "Остановка по дороге в ущелье: суп, салат и чайник чая.",
    },
    address: { en: "Jeti-Oguz gorge", ru: "Ущелье Джети-Огуз" },
    whatsapp: "996700000211",
    dishes: [LAGMAN, GREEN_TEA],
  },
  {
    slug: "tower-cafe",
    closedDays: [1],
    name: { en: "Tower Cafe", ru: "Кафе у башни" },
    type: "cafe",
    place: "burana",
    cuisines: ["kyrgyz"],
    check: 450,
    rating: [4.1, 98],
    verified: false,
    hours: ["10:00", "19:00"],
    photos: [
      {
        key: "burana",
        alt: {
          en: "Burana Tower seen across the old stones",
          ru: "Башня Бурана за рядами старых камней",
        },
      },
    ],
    description: {
      en: "Lunch next to the tower, useful on a day trip from Bishkek. Nothing else is close by.",
      ru: "Обед рядом с башней, удобно в поездке на день из Бишкека. Больше поблизости ничего нет.",
    },
    address: { en: "Burana, by the site entrance", ru: "Бурана, у входа на территорию" },
    whatsapp: "996700000212",
    dishes: [LAGMAN, MANTY],
  },
];

function toRestaurantSummary(
  restaurant: MockRestaurant,
  lang: Locale,
): RestaurantSummary {
  const cover = restaurant.photos[0];
  const months = restaurant.months ?? ALL_YEAR;
  const { availability, opensOn } = seasonStatus(months);
  return {
    slug: restaurant.slug,
    name: restaurant.name[lang],
    type: restaurant.type,
    photo: photo(cover.key, cover.alt[lang]),
    place: placeRef(restaurant.place, lang),
    region: regionOf(placeRegionKey(restaurant.place), lang),
    cuisines: restaurant.cuisines,
    average_check: restaurant.check * TYIYN_PER_SOM,
    rating: ratingOf(restaurant.rating),
    verified: restaurant.verified,
    opens_at: restaurant.hours[0],
    closes_at: restaurant.hours[1],
    months,
    availability,
    opens_on: opensOn,
  };
}

export function listRestaurants(
  lang: Locale,
  filters: RestaurantFilters = {},
): Page<RestaurantSummary> {
  const items = RESTAURANTS.filter(
    (restaurant) =>
      (!filters.type || restaurant.type === filters.type) &&
      (!filters.cuisine || restaurant.cuisines.includes(filters.cuisine)) &&
      (!filters.place || restaurant.place === filters.place) &&
      (!filters.region || placeRegionKey(restaurant.place) === filters.region) &&
      (!filters.month ||
        (restaurant.months ?? ALL_YEAR).includes(filters.month)),
  )
    .map((restaurant) => toRestaurantSummary(restaurant, lang))
    .sort(
      (a, b) =>
        AVAILABILITY_RANK[a.availability] - AVAILABILITY_RANK[b.availability],
    );
  return paginate(items, filters.limit, filters.offset);
}

export function getRestaurant(
  lang: Locale,
  slug: string,
): RestaurantDetail | null {
  const restaurant = RESTAURANTS.find((candidate) => candidate.slug === slug);
  if (!restaurant) return null;
  return {
    ...toRestaurantSummary(restaurant, lang),
    crowd_by_month: placeCrowd(restaurant.place),
    closed_days: restaurant.closedDays ?? [],
    description: restaurant.description[lang],
    photos: restaurant.photos.map((item) => photo(item.key, item.alt[lang])),
    address: restaurant.address[lang],
    phone: `+${restaurant.whatsapp}`,
    whatsapp: restaurant.whatsapp,
    dishes: restaurant.dishes.map((dish) => dish[lang]),
  };
}

/* ---------- Companies ---------- */

interface MockCompany {
  slug: string;
  name: L;
  kind: CompanyKind;
  tagline: L;
  description: L;
  regions: RegionKey[];
  rating: [number, number] | null;
  verified: boolean;
  whatsapp: string;
  languages: string[];
  founded: number;
}

const COMPANIES: MockCompany[] = [
  {
    slug: "snowline-karakol",
    name: { en: "Snowline Karakol", ru: "Snowline Karakol" },
    kind: "tour_operator",
    tagline: {
      en: "Ski weekends and weeks on the Karakol slopes",
      ru: "Лыжные выходные и недели на склонах Каракола",
    },
    description: {
      en: "A small ski-focused team in Karakol. They run transfers, instructors and ski hire as one package from December to March.",
      ru: "Небольшая команда в Караколе, которая занимается лыжами. С декабря по март собирает трансфер, инструктора и прокат в один пакет.",
    },
    regions: ["issyk-kul", "chuy"],
    rating: [4.8, 142],
    verified: true,
    whatsapp: "996700000001",
    languages: ["ru", "en", "ky"],
    founded: 2016,
  },
  {
    slug: "jailoo-routes",
    name: { en: "Jailoo Routes", ru: "Jailoo Routes" },
    kind: "tour_operator",
    tagline: {
      en: "Horse treks and yurt stays on high pastures",
      ru: "Конные маршруты и юрты на высокогорных пастбищах",
    },
    description: {
      en: "Works with herding families around Song-Kol and Naryn. Summer horse treks, yurt stays and expeditions to Kol-Suu.",
      ru: "Работает с семьями пастухов вокруг Сон-Куля и Нарына. Летние конные маршруты, юрты и экспедиции к Кёль-Суу.",
    },
    regions: ["naryn", "issyk-kul"],
    rating: [4.7, 208],
    verified: true,
    whatsapp: "996700000002",
    languages: ["ru", "en", "ky"],
    founded: 2013,
  },
  {
    slug: "silk-road-guides",
    name: { en: "Silk Road Guides", ru: "Silk Road Guides" },
    kind: "tour_operator",
    tagline: {
      en: "Day trips and history tours from Bishkek",
      ru: "Поездки на день и исторические туры из Бишкека",
    },
    description: {
      en: "City guides who run day trips to Burana and Ala-Archa, and short tours around the south shore of Issyk-Kul.",
      ru: "Городские гиды, которые возят на день в Бурану и Ала-Арчу и проводят короткие туры вокруг южного берега Иссык-Куля.",
    },
    regions: ["chuy", "issyk-kul"],
    rating: [4.6, 174],
    verified: true,
    whatsapp: "996700000003",
    languages: ["ru", "en", "de"],
    founded: 2011,
  },
  {
    slug: "south-route",
    name: { en: "South Route Travel", ru: "South Route Travel" },
    kind: "tour_operator",
    tagline: {
      en: "Osh, Sary-Chelek and the Fergana side",
      ru: "Ош, Сары-Челек и ферганская сторона",
    },
    description: {
      en: "Based in Osh. Runs city tours, trips to the walnut forests and overland routes between north and south.",
      ru: "Работает из Оша. Городские туры, поездки в ореховые леса и маршруты между севером и югом страны.",
    },
    regions: ["osh", "jalal-abad"],
    rating: [4.5, 96],
    verified: false,
    whatsapp: "996700000004",
    languages: ["ru", "en", "uz"],
    founded: 2018,
  },
  {
    slug: "pereval-transfers",
    name: { en: "Pereval Transfers", ru: "Перевал Трансфер" },
    kind: "transfer",
    tagline: {
      en: "Airport pick-ups and drivers between regions",
      ru: "Встречи в аэропорту и водители между регионами",
    },
    description: {
      en: "Cars and minivans with drivers: from Manas airport to any region, with stops on request.",
      ru: "Машины и минивэны с водителем: из аэропорта Манас в любой регион, с остановками по просьбе.",
    },
    regions: ["chuy", "issyk-kul", "naryn"],
    rating: [4.6, 311],
    verified: true,
    whatsapp: "996700000301",
    languages: ["ru", "en"],
    founded: 2015,
  },
  {
    slug: "nomad-4x4",
    name: { en: "Nomad 4×4", ru: "Кочевник 4×4" },
    kind: "transfer",
    tagline: {
      en: "4×4 with a driver for mountain passes",
      ru: "Внедорожник с водителем для горных перевалов",
    },
    description: {
      en: "For the roads a normal car can't manage: Song-Kol, Kol-Suu and Tash Rabat, with drivers who know the passes.",
      ru: "Для дорог, где не проедет обычная машина: Сон-Куль, Кёль-Суу и Таш-Рабат, с водителями, которые знают перевалы.",
    },
    regions: ["naryn"],
    rating: [4.8, 83],
    verified: true,
    whatsapp: "996700000302",
    languages: ["ru", "ky"],
    founded: 2017,
  },
  {
    slug: "ala-too-guides",
    name: { en: "Ala-Too Guides", ru: "Гиды Ала-Тоо" },
    kind: "guide",
    tagline: {
      en: "Mountain guides for hikes around Bishkek",
      ru: "Горные гиды для походов вокруг Бишкека",
    },
    description: {
      en: "Certified mountain guides for Ala-Archa and nearby gorges, from an easy day to a glacier route.",
      ru: "Сертифицированные горные гиды для Ала-Арчи и ближних ущелий, от лёгкого дня до маршрута к леднику.",
    },
    regions: ["chuy"],
    rating: [4.9, 57],
    verified: true,
    whatsapp: "996700000303",
    languages: ["ru", "en"],
    founded: 2014,
  },
  {
    slug: "lakeside-bike",
    name: { en: "Lakeside Bike", ru: "Вело вокруг озера" },
    kind: "guide",
    tagline: {
      en: "Bike hire and guided rides around Issyk-Kul",
      ru: "Прокат велосипедов и поездки с гидом вокруг Иссык-Куля",
    },
    description: {
      en: "Bikes, a support car and guided stages along the lake. Choose a day or the whole loop.",
      ru: "Велосипеды, машина сопровождения и этапы с гидом вдоль озера. Можно на день или на весь круг.",
    },
    regions: ["issyk-kul"],
    rating: [4.4, 39],
    verified: false,
    whatsapp: "996700000304",
    languages: ["ru", "en"],
    founded: 2020,
  },
];

function toCompanySummary(company: MockCompany, lang: Locale): CompanySummary {
  return {
    slug: company.slug,
    name: company.name[lang],
    kind: company.kind,
    tagline: company.tagline[lang],
    regions: company.regions.map((region) => regionOf(region, lang)),
    rating: ratingOf(company.rating),
    verified: company.verified,
    tours_count: listTours(lang, { operator: company.slug }).total,
  };
}

export function listCompanies(
  lang: Locale,
  filters: CompanyFilters = {},
): Page<CompanySummary> {
  const items = COMPANIES.filter(
    (company) =>
      (!filters.kind || company.kind === filters.kind) &&
      (!filters.region ||
        (company.regions as string[]).includes(filters.region)),
  ).map((company) => toCompanySummary(company, lang));
  return paginate(items, filters.limit, filters.offset);
}

export function getCompany(lang: Locale, slug: string): CompanyDetail | null {
  const company = COMPANIES.find((candidate) => candidate.slug === slug);
  if (!company) return null;
  return {
    ...toCompanySummary(company, lang),
    description: company.description[lang],
    phone: `+${company.whatsapp}`,
    whatsapp: company.whatsapp,
    languages: company.languages,
    founded_year: company.founded,
  };
}
