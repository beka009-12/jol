import { currentMonth, nearestMonth, todayInBishkek } from "@/lib/format";
import type {
  Availability,
  Departure,
  Difficulty,
  Locale,
  Page,
  PlaceDetail,
  PlaceFilters,
  PlaceRef,
  PlaceSummary,
  Quote,
  QuoteInput,
  Region,
  SeasonsNow,
  TourAvailabilityResponse,
  TourCategory,
  TourDetail,
  TourFilters,
  TourSummary,
} from "@/lib/types";
import { photo, type PhotoKey } from "./photos";

/*
  Fictional demo catalog with the same shape the API is expected to return.
  Places are real, operators and prices are not.
*/

export type L = { en: string; ru: string };

interface MockPhoto {
  key: PhotoKey;
  alt: L;
}

interface MockPlace {
  slug: string;
  name: L;
  region: keyof typeof REGIONS;
  photos: MockPhoto[];
  bestMonths: number[];
  description: L;
  transport: L;
  packing: L;
  lat: number;
  lng: number;
}

interface MockSeason {
  name: L;
  months: number[];
  /** Som per adult. */
  price: number;
}

interface MockTour {
  slug: string;
  category: TourCategory;
  place: string;
  title: L;
  description: L;
  photos: MockPhoto[];
  days: number;
  difficulty: Difficulty;
  group: [number, number];
  seasons: MockSeason[];
  included: L[];
  excluded: L[];
  operator: keyof typeof OPERATORS;
  soldOut?: boolean;
  /** Day of week departures leave on, 0 = Sunday. */
  weekday: number;
}

const REGIONS = {
  "issyk-kul": { en: "Issyk-Kul", ru: "Иссык-Куль" },
  naryn: { en: "Naryn", ru: "Нарын" },
  chuy: { en: "Chuy", ru: "Чуй" },
  osh: { en: "Osh", ru: "Ош" },
  "jalal-abad": { en: "Jalal-Abad", ru: "Джалал-Абад" },
} satisfies Record<string, L>;

export type RegionKey = keyof typeof REGIONS;

const OPERATORS = {
  snowline: {
    slug: "snowline-karakol",
    name: "Snowline Karakol",
    whatsapp: "996700000001",
  },
  jailoo: {
    slug: "jailoo-routes",
    name: "Jailoo Routes",
    whatsapp: "996700000002",
  },
  silk: {
    slug: "silk-road-guides",
    name: "Silk Road Guides",
    whatsapp: "996700000003",
  },
  south: {
    slug: "south-route",
    name: "South Route Travel",
    whatsapp: "996700000004",
  },
};

const SKI_SEASON: Record<"early" | "peak" | "spring", L> = {
  early: { en: "Early season", ru: "Начало сезона" },
  peak: { en: "Peak season", ru: "Пик сезона" },
  spring: { en: "Spring snow", ru: "Весенний снег" },
};
const SUMMER: L = { en: "Summer", ru: "Лето" };
const ALL_YEAR: L = { en: "All year", ru: "Круглый год" };
const WARM: L = { en: "Warm season", ru: "Тёплый сезон" };

const GUIDE: L = { en: "English-speaking guide", ru: "Гид со знанием языков" };
const TRANSFER: L = {
  en: "Transfer from Bishkek",
  ru: "Трансфер из Бишкека",
};
const MEALS: L = { en: "All meals", ru: "Всё питание" };
const YURT_STAY: L = { en: "Nights in a yurt", ru: "Ночи в юрте" };
const HORSE: L = { en: "Horse and saddle", ru: "Лошадь и седло" };
const FLIGHTS: L = { en: "International flights", ru: "Международные перелёты" };
const INSURANCE: L = { en: "Travel insurance", ru: "Страховка" };
const TIPS: L = { en: "Tips", ru: "Чаевые" };

const PLACES: MockPlace[] = [
  {
    slug: "song-kol",
    name: { en: "Song-Kol", ru: "Сон-Куль" },
    region: "naryn",
    photos: [
      {
        key: "yurt-horses",
        alt: {
          en: "Yurts and horses on a high pasture below rocky peaks",
          ru: "Юрты и лошади на высокогорном пастбище под скалистыми вершинами",
        },
      },
      {
        key: "hero-song-kol",
        alt: {
          en: "Yurts on the shore of Song-Kol under a mountain",
          ru: "Юрты на берегу Сон-Куля у подножия горы",
        },
      },
    ],
    bestMonths: [6, 7, 8, 9],
    description: {
      en: "An alpine lake at 3,000 metres, ringed by summer pastures. Herders bring their horses and yurts here from June to September.",
      ru: "Высокогорное озеро на 3000 метрах в кольце летних пастбищ. С июня по сентябрь сюда приходят пастухи с лошадьми и юртами.",
    },
    transport: {
      en: "About 6 hours from Bishkek by 4×4. The last pass closes with the first snow.",
      ru: "Около 6 часов от Бишкека на внедорожнике. Последний перевал закрывается с первым снегом.",
    },
    packing: {
      en: "Warm layers even in July: nights drop close to freezing. Bring sun cream and cash.",
      ru: "Тёплые вещи даже в июле: ночью бывает около нуля. Возьмите солнцезащитный крем и наличные.",
    },
    lat: 41.83,
    lng: 75.13,
  },
  {
    slug: "karakol",
    name: { en: "Karakol", ru: "Каракол" },
    region: "issyk-kul",
    photos: [
      {
        key: "ski-slope",
        alt: {
          en: "Wide snowy slope with mountains on the horizon",
          ru: "Широкий снежный склон и горы на горизонте",
        },
      },
    ],
    bestMonths: [1, 2, 3, 7, 8, 12],
    description: {
      en: "A mountain town at the east end of Issyk-Kul. Skiers come in winter, hikers in summer, and both end the day in the same guesthouses.",
      ru: "Горный город на восточном краю Иссык-Куля. Зимой сюда едут лыжники, летом треккеры, и вечером все встречаются в одних гостевых домах.",
    },
    transport: {
      en: "6–7 hours from Bishkek by shared taxi or minibus. The ski base is 20 minutes from town.",
      ru: "6–7 часов от Бишкека на маршрутке или такси. До лыжной базы 20 минут от города.",
    },
    packing: {
      en: "Ski gear can be rented on site. Bring goggles, gloves and a warm base layer.",
      ru: "Снаряжение можно взять в прокат на месте. Возьмите маску, перчатки и термобельё.",
    },
    lat: 42.49,
    lng: 78.39,
  },
  {
    slug: "issyk-kul",
    name: { en: "Issyk-Kul", ru: "Иссык-Куль" },
    region: "issyk-kul",
    photos: [
      {
        key: "issyk-kul-beach",
        alt: {
          en: "A person walks along a sandy beach on Issyk-Kul",
          ru: "Человек идёт по песчаному берегу Иссык-Куля",
        },
      },
    ],
    bestMonths: [6, 7, 8, 9],
    description: {
      en: "A vast mountain lake that never freezes, with sandy beaches on the north shore and quiet canyons on the south.",
      ru: "Огромное горное озеро, которое не замерзает. На северном берегу песчаные пляжи, на южном тихие каньоны.",
    },
    transport: {
      en: "4 hours from Bishkek to Cholpon-Ata by minibus or taxi.",
      ru: "4 часа от Бишкека до Чолпон-Аты на маршрутке или такси.",
    },
    packing: {
      en: "Swimwear and a light jacket: evenings are cool even in August.",
      ru: "Купальник и лёгкая куртка: вечера прохладные даже в августе.",
    },
    lat: 42.45,
    lng: 77.25,
  },
  {
    slug: "ala-archa",
    name: { en: "Ala-Archa", ru: "Ала-Арча" },
    region: "chuy",
    photos: [
      {
        key: "ala-archa",
        alt: {
          en: "Snow-capped peaks above dark spruce in Ala-Archa",
          ru: "Снежные вершины над тёмными елями в Ала-Арче",
        },
      },
    ],
    bestMonths: [5, 6, 7, 8, 9, 10],
    description: {
      en: "A national park one hour from Bishkek: spruce valleys, a fast river and trails up to glaciers.",
      ru: "Национальный парк в часе от Бишкека: еловые долины, быстрая река и тропы к ледникам.",
    },
    transport: {
      en: "About 1 hour by taxi from Bishkek. Pay the entry fee at the gate.",
      ru: "Около часа на такси от Бишкека. Вход платный, оплата на въезде.",
    },
    packing: {
      en: "Hiking shoes, water and a rain layer. Weather turns fast above the tree line.",
      ru: "Треккинговая обувь, вода и дождевик. Выше леса погода меняется быстро.",
    },
    lat: 42.56,
    lng: 74.48,
  },
  {
    slug: "jeti-oguz",
    name: { en: "Jeti-Oguz", ru: "Джети-Огуз" },
    region: "issyk-kul",
    photos: [
      {
        key: "jeti-oguz",
        alt: {
          en: "Red sandstone rocks among green spruce in Jeti-Oguz",
          ru: "Красные скалы среди зелёных елей в Джети-Огузе",
        },
      },
    ],
    bestMonths: [5, 6, 7, 8, 9],
    description: {
      en: "Red sandstone cliffs at the mouth of a green valley, a short drive from Karakol.",
      ru: "Красные скалы у входа в зелёную долину, недалеко от Каракола.",
    },
    transport: {
      en: "40 minutes by taxi from Karakol.",
      ru: "40 минут на такси от Каракола.",
    },
    packing: {
      en: "Comfortable shoes and a windproof layer.",
      ru: "Удобная обувь и ветровка.",
    },
    lat: 42.33,
    lng: 78.22,
  },
  {
    slug: "kol-suu",
    name: { en: "Kol-Suu", ru: "Кёль-Суу" },
    region: "naryn",
    photos: [
      {
        key: "kol-suu",
        alt: {
          en: "Turquoise Kol-Suu lake between sheer rock walls",
          ru: "Бирюзовое озеро Кёль-Суу между отвесными скалами",
        },
      },
    ],
    bestMonths: [7, 8, 9],
    description: {
      en: "A long turquoise lake locked between rock walls near the Chinese border. Remote, and worth the journey.",
      ru: "Длинное бирюзовое озеро между скальных стен у границы с Китаем. Далеко, но оно того стоит.",
    },
    transport: {
      en: "A full day by 4×4 from Naryn. A border-zone permit is required.",
      ru: "Целый день на внедорожнике от Нарына. Нужен пропуск в погранзону.",
    },
    packing: {
      en: "Passport copies for the permit, warm clothes, food for the day.",
      ru: "Копии паспорта для пропуска, тёплая одежда, еда на день.",
    },
    lat: 40.6,
    lng: 75.0,
  },
  {
    slug: "tash-rabat",
    name: { en: "Tash Rabat", ru: "Таш-Рабат" },
    region: "naryn",
    photos: [
      {
        key: "tash-rabat",
        alt: {
          en: "Stone walls and domes of the Tash Rabat caravanserai",
          ru: "Каменные стены и купола караван-сарая Таш-Рабат",
        },
      },
    ],
    bestMonths: [6, 7, 8, 9],
    description: {
      en: "A stone caravanserai from the Silk Road era, standing alone in a high valley with yurt camps nearby.",
      ru: "Каменный караван-сарай времён Шёлкового пути в высокогорной долине, рядом с ним юрточные лагеря.",
    },
    transport: {
      en: "About 2 hours by car from Naryn, the last part on a gravel road.",
      ru: "Около 2 часов на машине от Нарына, в конце грунтовая дорога.",
    },
    packing: {
      en: "Warm layers and a headlamp for nights at 3,200 metres.",
      ru: "Тёплая одежда и фонарик для ночёвки на 3200 метрах.",
    },
    lat: 40.82,
    lng: 75.29,
  },
  {
    slug: "altyn-arashan",
    name: { en: "Altyn Arashan", ru: "Алтын-Арашан" },
    region: "issyk-kul",
    photos: [
      {
        key: "altyn-arashan",
        alt: {
          en: "A river winds through a green valley in Altyn Arashan",
          ru: "Река петляет по зелёной долине Алтын-Арашана",
        },
      },
    ],
    bestMonths: [6, 7, 8, 9, 10],
    description: {
      en: "A mountain valley with natural hot springs, reached on foot, on horseback or in an old Soviet truck.",
      ru: "Горная долина с горячими источниками. Добраться можно пешком, верхом или на старом грузовике.",
    },
    transport: {
      en: "1 hour by car from Karakol to the trailhead, then a 4–5 hour walk.",
      ru: "Час на машине от Каракола до начала тропы, затем 4–5 часов пешком.",
    },
    packing: {
      en: "Swimwear for the springs and a warm jacket for after.",
      ru: "Купальник для источников и тёплая куртка на потом.",
    },
    lat: 42.38,
    lng: 78.61,
  },
  {
    slug: "burana",
    name: { en: "Burana Tower", ru: "Башня Бурана" },
    region: "chuy",
    photos: [
      {
        key: "burana",
        alt: {
          en: "Burana Tower behind a field of ancient stone markers",
          ru: "Башня Бурана за полем древних каменных балбалов",
        },
      },
    ],
    bestMonths: [3, 4, 5, 6, 9, 10, 11],
    description: {
      en: "A medieval minaret on the plain near Tokmok, with a field of ancient carved stone figures beside it.",
      ru: "Средневековый минарет на равнине у Токмока, а рядом поле древних каменных изваяний.",
    },
    transport: {
      en: "About 1.5 hours by car from Bishkek.",
      ru: "Около 1,5 часа на машине от Бишкека.",
    },
    packing: {
      en: "A hat in summer. There is little shade at the site.",
      ru: "Головной убор летом. Тени на месте почти нет.",
    },
    lat: 42.75,
    lng: 75.25,
  },
  {
    slug: "skazka",
    name: { en: "Skazka Canyon", ru: "Каньон Сказка" },
    region: "issyk-kul",
    photos: [
      {
        key: "skazka",
        alt: {
          en: "Eroded red ridges in Skazka Canyon",
          ru: "Красные выветренные гребни в каньоне Сказка",
        },
      },
    ],
    bestMonths: [5, 6, 7, 8, 9, 10],
    description: {
      en: "Wind-carved red ridges on the south shore of Issyk-Kul. Go near sunset, when the colour is deepest.",
      ru: "Выточенные ветром красные гребни на южном берегу Иссык-Куля. Лучше ехать к закату, когда цвет самый глубокий.",
    },
    transport: {
      en: "On the road between Balykchy and Karakol, then a short gravel track.",
      ru: "На трассе между Балыкчы и Караколом, затем короткая грунтовка.",
    },
    packing: {
      en: "Closed shoes and water. The ground is loose.",
      ru: "Закрытая обувь и вода. Грунт сыпучий.",
    },
    lat: 42.15,
    lng: 77.36,
  },
  {
    slug: "sary-chelek",
    name: { en: "Sary-Chelek", ru: "Сары-Челек" },
    region: "jalal-abad",
    photos: [
      {
        key: "sary-chelek",
        alt: {
          en: "Deep blue Sary-Chelek lake below forested ridges",
          ru: "Синее озеро Сары-Челек под лесистыми хребтами",
        },
      },
    ],
    bestMonths: [6, 7, 8, 9],
    description: {
      en: "A blue lake inside a nature reserve in the west of the country, surrounded by forest.",
      ru: "Синее озеро в заповеднике на западе страны, вокруг него лес.",
    },
    transport: {
      en: "About 7 hours by car from Osh or 9 from Bishkek.",
      ru: "Около 7 часов на машине от Оша или 9 от Бишкека.",
    },
    packing: {
      en: "Cash for the reserve fee and insect repellent.",
      ru: "Наличные на оплату заповедника и средство от насекомых.",
    },
    lat: 41.87,
    lng: 71.97,
  },
  {
    slug: "osh",
    name: { en: "Osh", ru: "Ош" },
    region: "osh",
    photos: [
      {
        key: "osh",
        alt: {
          en: "Sulaiman-Too mountain rising over the city of Osh",
          ru: "Гора Сулайман-Тоо над городом Ош",
        },
      },
    ],
    bestMonths: [3, 4, 5, 9, 10, 11],
    description: {
      en: "One of Central Asia's oldest cities, with a big bazaar and the sacred Sulaiman-Too mountain in its centre.",
      ru: "Один из древнейших городов Центральной Азии: большой базар и священная гора Сулайман-Тоо в самом центре.",
    },
    transport: {
      en: "A 1-hour flight from Bishkek, or a full day by road.",
      ru: "Час на самолёте из Бишкека или целый день на машине.",
    },
    packing: {
      en: "Modest clothes for the holy sites and shoes with grip for the climb.",
      ru: "Закрытая одежда для святых мест и нескользкая обувь для подъёма.",
    },
    lat: 40.53,
    lng: 72.8,
  },
  {
    slug: "bishkek",
    name: { en: "Bishkek", ru: "Бишкек" },
    region: "chuy",
    photos: [
      {
        key: "bishkek-square",
        alt: {
          en: "Fountains and the flag on Ala-Too Square in Bishkek",
          ru: "Фонтаны и флаг на площади Ала-Тоо в Бишкеке",
        },
      },
    ],
    bestMonths: [4, 5, 6, 9, 10],
    description: {
      en: "The capital and the usual way into the country: an international airport, leafy streets, bazaars, and roads out to every region.",
      ru: "Столица и обычная точка входа в страну: международный аэропорт, зелёные улицы, базары и дороги во все регионы.",
    },
    transport: {
      en: "Manas airport is 30 km away, about 40 minutes by taxi. Shared minibuses leave for the regions from the Western and Eastern bus stations.",
      ru: "Аэропорт Манас в 30 км, около 40 минут на такси. Маршрутки в регионы уходят с Западного и Восточного автовокзалов.",
    },
    packing: {
      en: "City clothes, a light jacket for the evenings and some cash for the bazaars.",
      ru: "Городская одежда, лёгкая куртка на вечер и немного наличных для базаров.",
    },
    lat: 42.87,
    lng: 74.59,
  },
];

/* Invented for the demo: visitors per month, January first. */
const CROWD: Record<string, number[]> = {
  "song-kol": [0, 0, 0, 0, 0, 40, 95, 100, 35, 0, 0, 0],
  karakol: [70, 65, 30, 10, 15, 40, 75, 80, 40, 15, 10, 60],
  "issyk-kul": [10, 10, 10, 10, 20, 60, 100, 95, 40, 15, 5, 10],
  "ala-archa": [25, 25, 30, 45, 70, 85, 100, 95, 80, 55, 30, 25],
  "jeti-oguz": [5, 5, 5, 15, 35, 60, 100, 90, 55, 20, 5, 5],
  "kol-suu": [0, 0, 0, 0, 0, 10, 70, 100, 50, 5, 0, 0],
  "tash-rabat": [2, 2, 2, 5, 15, 55, 95, 100, 55, 15, 2, 2],
  "altyn-arashan": [10, 10, 10, 15, 35, 65, 100, 95, 60, 25, 10, 10],
  burana: [10, 10, 20, 45, 60, 65, 100, 90, 70, 50, 20, 10],
  skazka: [2, 2, 5, 15, 35, 65, 100, 95, 55, 25, 5, 2],
  "sary-chelek": [0, 0, 0, 10, 35, 65, 100, 95, 70, 30, 0, 0],
  osh: [20, 20, 40, 60, 65, 50, 45, 50, 65, 60, 35, 20],
  bishkek: [45, 45, 55, 70, 85, 95, 100, 95, 90, 75, 50, 50],
};

export function placeCrowd(slug: string): number[] | null {
  return CROWD[slug] ?? null;
}

const TOURS: MockTour[] = [
  {
    slug: "karakol-ski-weekend",
    category: "ski",
    place: "karakol",
    title: { en: "Karakol ski weekend", ru: "Выходные на лыжах в Караколе" },
    description: {
      en: "Three days on the longest pistes in the country. Lift passes and transfers are arranged, so you only have to show up and ski.",
      ru: "Три дня на самых длинных трассах страны. Ски-пассы и трансферы уже организованы, остаётся только приехать и кататься.",
    },
    photos: [
      {
        key: "ski-slope",
        alt: {
          en: "Wide snowy ski slope with mountains on the horizon",
          ru: "Широкий снежный склон и горы на горизонте",
        },
      },
      {
        key: "ski-pines",
        alt: {
          en: "Snow and pine trees below high peaks",
          ru: "Снег и сосны под высокими вершинами",
        },
      },
    ],
    days: 3,
    difficulty: "easy",
    group: [2, 12],
    seasons: [
      { name: SKI_SEASON.early, months: [12], price: 28000 },
      { name: SKI_SEASON.peak, months: [1, 2], price: 34000 },
      { name: SKI_SEASON.spring, months: [3], price: 26000 },
    ],
    included: [
      { en: "2-day lift pass", ru: "Ски-пасс на 2 дня" },
      { en: "2 nights in a Karakol guesthouse", ru: "2 ночи в гостевом доме в Караколе" },
      { en: "Transfers to the ski base", ru: "Трансферы до лыжной базы" },
      { en: "Breakfasts", ru: "Завтраки" },
    ],
    excluded: [
      { en: "Ski rental", ru: "Прокат снаряжения" },
      { en: "Lunches and dinners", ru: "Обеды и ужины" },
      INSURANCE,
    ],
    operator: "snowline",
    weekday: 5,
  },
  {
    slug: "karakol-ski-week",
    category: "ski",
    place: "karakol",
    title: { en: "Full ski week in Karakol", ru: "Неделя на лыжах в Караколе" },
    description: {
      en: "Six days on piste and in the trees with an instructor for the first two mornings. Suits intermediates who want to push further.",
      ru: "Шесть дней на трассах и в лесу, первые два утра с инструктором. Подойдёт тем, кто уже катается и хочет прогрессировать.",
    },
    photos: [
      {
        key: "ski-valley",
        alt: {
          en: "Ski runs in a wide snowy mountain valley",
          ru: "Трассы в широкой снежной горной долине",
        },
      },
      {
        key: "ski-slope",
        alt: {
          en: "Wide snowy ski slope with mountains on the horizon",
          ru: "Широкий снежный склон и горы на горизонте",
        },
      },
    ],
    days: 6,
    difficulty: "moderate",
    group: [2, 8],
    seasons: [
      { name: SKI_SEASON.early, months: [12], price: 62000 },
      { name: SKI_SEASON.peak, months: [1, 2], price: 74000 },
      { name: SKI_SEASON.spring, months: [3], price: 58000 },
    ],
    included: [
      { en: "5-day lift pass", ru: "Ски-пасс на 5 дней" },
      { en: "5 nights in a hotel near the base", ru: "5 ночей в отеле рядом с базой" },
      { en: "Instructor for two mornings", ru: "Инструктор на два утра" },
      { en: "Breakfasts and dinners", ru: "Завтраки и ужины" },
    ],
    excluded: [{ en: "Ski rental", ru: "Прокат снаряжения" }, INSURANCE],
    operator: "snowline",
    weekday: 0,
  },
  {
    slug: "bishkek-ski-day",
    category: "ski",
    place: "ala-archa",
    title: { en: "Ski day from Bishkek", ru: "Лыжный день из Бишкека" },
    description: {
      en: "Leave Bishkek in the morning, ski the slopes above the city and be back for dinner. Good for a first try or a free day.",
      ru: "Утром из Бишкека на склоны над городом, к ужину обратно. Подойдёт для первого раза или свободного дня.",
    },
    photos: [
      {
        key: "ski-pines",
        alt: {
          en: "Snow and pine trees below high peaks",
          ru: "Снег и сосны под высокими вершинами",
        },
      },
    ],
    days: 1,
    difficulty: "easy",
    group: [1, 6],
    seasons: [
      { name: { en: "Winter", ru: "Зима" }, months: [12, 1, 2, 3], price: 6500 },
    ],
    included: [
      TRANSFER,
      { en: "Day lift pass", ru: "Ски-пасс на день" },
      { en: "Ski or snowboard rental", ru: "Прокат лыж или сноуборда" },
    ],
    excluded: [{ en: "Lunch", ru: "Обед" }, { en: "Instructor", ru: "Инструктор" }],
    operator: "snowline",
    weekday: 6,
  },
  {
    slug: "song-kol-horse-trek",
    category: "horse",
    place: "song-kol",
    title: { en: "Horse trek to Song-Kol", ru: "Конный тур на Сон-Куль" },
    description: {
      en: "Ride over a high pass to the lake and sleep in herders' yurts. A local horseman stays with the group the whole way.",
      ru: "Верхом через перевал к озеру, ночёвки в юртах пастухов. Местный конюх идёт с группой весь маршрут.",
    },
    photos: [
      {
        key: "horse-valley",
        alt: {
          en: "Riders cross a stream in a green mountain valley",
          ru: "Всадники переходят ручей в зелёной горной долине",
        },
      },
      {
        key: "yurt-horses",
        alt: {
          en: "Yurts and horses on a high pasture",
          ru: "Юрты и лошади на высокогорном пастбище",
        },
      },
    ],
    days: 4,
    difficulty: "moderate",
    group: [2, 8],
    seasons: [
      { name: SUMMER, months: [6, 7, 8, 9], price: 38000 },
    ],
    included: [HORSE, GUIDE, YURT_STAY, MEALS, TRANSFER],
    excluded: [INSURANCE, TIPS],
    operator: "jailoo",
    weekday: 1,
  },
  {
    slug: "kol-suu-expedition",
    category: "horse",
    place: "kol-suu",
    title: { en: "Kol-Suu horse expedition", ru: "Конная экспедиция на Кёль-Суу" },
    description: {
      en: "Five remote days on horseback to one of the country's most striking lakes. Permits are handled for you.",
      ru: "Пять дней верхом в отдалённых местах к одному из самых красивых озёр страны. Пропуска оформляем сами.",
    },
    photos: [
      {
        key: "kol-suu",
        alt: {
          en: "Turquoise Kol-Suu lake between sheer rock walls",
          ru: "Бирюзовое озеро Кёль-Суу между отвесными скалами",
        },
      },
    ],
    days: 5,
    difficulty: "hard",
    group: [4, 6],
    seasons: [{ name: SUMMER, months: [7, 8, 9], price: 72000 }],
    included: [
      HORSE,
      GUIDE,
      { en: "Border-zone permit", ru: "Пропуск в погранзону" },
      { en: "Tents and camp kitchen", ru: "Палатки и походная кухня" },
      MEALS,
    ],
    excluded: [INSURANCE, FLIGHTS],
    operator: "jailoo",
    soldOut: true,
    weekday: 2,
  },
  {
    slug: "jeti-oguz-ride",
    category: "horse",
    place: "jeti-oguz",
    title: { en: "Day ride in Jeti-Oguz", ru: "Конная прогулка в Джети-Огузе" },
    description: {
      en: "A gentle ride from the red rocks up into the Valley of Flowers. No riding experience needed.",
      ru: "Спокойная прогулка от красных скал в Долину цветов. Опыт езды верхом не нужен.",
    },
    photos: [
      {
        key: "jeti-oguz",
        alt: {
          en: "Red sandstone rocks among green spruce",
          ru: "Красные скалы среди зелёных елей",
        },
      },
    ],
    days: 1,
    difficulty: "easy",
    group: [1, 6],
    seasons: [{ name: WARM, months: [5, 6, 7, 8, 9, 10], price: 5500 }],
    included: [HORSE, { en: "Local horseman", ru: "Местный конюх" }, { en: "Picnic lunch", ru: "Обед-пикник" }],
    excluded: [{ en: "Transfer from Karakol", ru: "Трансфер из Каракола" }],
    operator: "jailoo",
    weekday: 3,
  },
  {
    slug: "song-kol-yurt-stay",
    category: "yurt",
    place: "song-kol",
    title: { en: "Two days in a Song-Kol yurt", ru: "Два дня в юрте на Сон-Куле" },
    description: {
      en: "Sleep in a felt yurt by the lake, eat with a herder family and watch the sky go dark. The easiest way to feel the high pastures.",
      ru: "Ночёвка в войлочной юрте у озера, ужин с семьёй пастухов и звёздное небо. Самый простой способ побывать на джайлоо.",
    },
    photos: [
      {
        key: "hero-song-kol",
        alt: {
          en: "Yurts on the shore of Song-Kol under a mountain",
          ru: "Юрты на берегу Сон-Куля у подножия горы",
        },
      },
      {
        key: "yurt-song-kol",
        alt: {
          en: "White yurts in a green valley",
          ru: "Белые юрты в зелёной долине",
        },
      },
    ],
    days: 2,
    difficulty: "easy",
    group: [2, 10],
    seasons: [{ name: SUMMER, months: [6, 7, 8, 9], price: 12000 }],
    included: [TRANSFER, YURT_STAY, MEALS],
    excluded: [{ en: "Horse riding", ru: "Катание на лошадях" }, INSURANCE],
    operator: "jailoo",
    weekday: 4,
  },
  {
    slug: "tash-rabat-yurt-camp",
    category: "yurt",
    place: "tash-rabat",
    title: { en: "Silk Road yurt camp at Tash Rabat", ru: "Юрточный лагерь у Таш-Рабата" },
    description: {
      en: "Three days around a stone caravanserai, with nights in a family-run yurt camp and a walk to a high viewpoint.",
      ru: "Три дня у каменного караван-сарая: ночи в семейном юрточном лагере и прогулка к смотровой точке.",
    },
    photos: [
      {
        key: "tash-rabat",
        alt: {
          en: "Stone walls and domes of the Tash Rabat caravanserai",
          ru: "Каменные стены и купола караван-сарая Таш-Рабат",
        },
      },
    ],
    days: 3,
    difficulty: "easy",
    group: [2, 8],
    seasons: [{ name: SUMMER, months: [6, 7, 8, 9], price: 19000 }],
    included: [TRANSFER, YURT_STAY, MEALS, GUIDE],
    excluded: [INSURANCE, TIPS],
    operator: "silk",
    weekday: 2,
  },
  {
    slug: "altyn-arashan-springs",
    category: "trek",
    place: "altyn-arashan",
    title: { en: "Altyn Arashan hot springs", ru: "Горячие источники Алтын-Арашана" },
    description: {
      en: "A truck ride up the valley and two nights by the hot springs. In winter the valley is quiet and the water feels even better.",
      ru: "На грузовике вверх по долине и две ночи у горячих источников. Зимой в долине тихо, а вода кажется ещё теплее.",
    },
    photos: [
      {
        key: "yurt-altyn-arashan",
        alt: {
          en: "White yurts in the green valley of Altyn Arashan",
          ru: "Белые юрты в зелёной долине Алтын-Арашана",
        },
      },
      {
        key: "altyn-arashan",
        alt: {
          en: "A river winds through a green valley",
          ru: "Река петляет по зелёной долине",
        },
      },
    ],
    days: 3,
    difficulty: "moderate",
    group: [2, 10],
    seasons: [{ name: ALL_YEAR, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], price: 15000 }],
    included: [
      { en: "4×4 truck transfer", ru: "Трансфер на грузовике 4×4" },
      { en: "2 nights in a guesthouse", ru: "2 ночи в гостевом доме" },
      { en: "Hot spring entry", ru: "Вход на источники" },
      MEALS,
    ],
    excluded: [{ en: "Transfer to Karakol", ru: "Дорога до Каракола" }, INSURANCE],
    operator: "jailoo",
    weekday: 6,
  },
  {
    slug: "ala-archa-day-hike",
    category: "trek",
    place: "ala-archa",
    title: { en: "Ala-Archa day hike", ru: "Поход выходного дня в Ала-Арчу" },
    description: {
      en: "A guided walk up the valley with mountain views from the first hour. Back in Bishkek by evening.",
      ru: "Прогулка с гидом вверх по долине, виды на горы с первого часа. Вечером уже в Бишкеке.",
    },
    photos: [
      {
        key: "ala-archa",
        alt: {
          en: "Snow-capped peaks above dark spruce",
          ru: "Снежные вершины над тёмными елями",
        },
      },
    ],
    days: 1,
    difficulty: "moderate",
    group: [1, 10],
    seasons: [{ name: WARM, months: [4, 5, 6, 7, 8, 9, 10, 11], price: 3800 }],
    included: [TRANSFER, GUIDE, { en: "Park entry", ru: "Вход в парк" }],
    excluded: [{ en: "Lunch", ru: "Обед" }],
    operator: "silk",
    weekday: 0,
  },
  {
    slug: "burana-silk-road-day",
    category: "culture",
    place: "burana",
    title: { en: "Burana and the Silk Road", ru: "Бурана и Шёлковый путь" },
    description: {
      en: "A half-day from Bishkek to a medieval minaret and its field of carved stones, with a guide who tells the story behind them.",
      ru: "Полдня из Бишкека к средневековому минарету и полю каменных изваяний вместе с гидом, который расскажет их историю.",
    },
    photos: [
      {
        key: "burana",
        alt: {
          en: "Burana Tower behind a field of ancient stone markers",
          ru: "Башня Бурана за полем древних каменных балбалов",
        },
      },
    ],
    days: 1,
    difficulty: "easy",
    group: [1, 12],
    seasons: [{ name: ALL_YEAR, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], price: 4200 }],
    included: [TRANSFER, GUIDE, { en: "Site entry", ru: "Вход на объект" }],
    excluded: [{ en: "Lunch", ru: "Обед" }],
    operator: "silk",
    weekday: 3,
  },
  {
    slug: "osh-two-days",
    category: "culture",
    place: "osh",
    title: { en: "Two days in old Osh", ru: "Два дня в старом Оше" },
    description: {
      en: "Climb Sulaiman-Too, walk the bazaar with a local and eat the best plov you can find.",
      ru: "Подъём на Сулайман-Тоо, базар с местным жителем и лучший плов, который удастся найти.",
    },
    photos: [
      {
        key: "osh",
        alt: {
          en: "Sulaiman-Too mountain rising over Osh",
          ru: "Гора Сулайман-Тоо над Ошем",
        },
      },
    ],
    days: 2,
    difficulty: "easy",
    group: [1, 8],
    seasons: [{ name: ALL_YEAR, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], price: 16500 }],
    included: [GUIDE, { en: "1 night in a hotel", ru: "1 ночь в отеле" }, { en: "Food tasting at the bazaar", ru: "Дегустация на базаре" }],
    excluded: [{ en: "Flights to Osh", ru: "Перелёт до Оша" }],
    operator: "south",
    weekday: 4,
  },
  {
    slug: "issyk-kul-south-shore",
    category: "culture",
    place: "skazka",
    title: { en: "Issyk-Kul south shore", ru: "Южный берег Иссык-Куля" },
    description: {
      en: "Three unhurried days along the quiet shore: Skazka Canyon, an eagle hunter's village and a beach of your own.",
      ru: "Три неспешных дня вдоль тихого берега: каньон Сказка, деревня беркутчи и почти пустой пляж.",
    },
    photos: [
      {
        key: "skazka",
        alt: {
          en: "Eroded red ridges in Skazka Canyon",
          ru: "Красные выветренные гребни в каньоне Сказка",
        },
      },
      {
        key: "issyk-kul-poplars",
        alt: {
          en: "Poplars above the blue water of Issyk-Kul",
          ru: "Тополя над синей водой Иссык-Куля",
        },
      },
    ],
    days: 3,
    difficulty: "easy",
    group: [2, 8],
    seasons: [{ name: WARM, months: [5, 6, 7, 8, 9, 10], price: 24000 }],
    included: [TRANSFER, GUIDE, { en: "2 nights in guesthouses", ru: "2 ночи в гостевых домах" }, { en: "Breakfasts", ru: "Завтраки" }],
    excluded: [{ en: "Lunches and dinners", ru: "Обеды и ужины" }, TIPS],
    operator: "silk",
    weekday: 5,
  },
];

const OPENS_SOON_WINDOW_DAYS = 45;
/* Dates are published this far ahead: the same window the request sheet asks for. */
const DEPARTURE_WINDOW_DAYS = 240;
const CHILD_PRICE_SHARE = 0.7;
const TYIYN_PER_SOM = 100;

function tourMonths(tour: MockTour): number[] {
  return tour.seasons.flatMap((season) => season.months).sort((a, b) => a - b);
}

function seasonPrice(tour: MockTour, month: number): number {
  const season = tour.seasons.find((s) => s.months.includes(month));
  return (season?.price ?? lowestPrice(tour)) * TYIYN_PER_SOM;
}

function lowestPrice(tour: MockTour): number {
  return Math.min(...tour.seasons.map((season) => season.price));
}

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function firstDayOfNextRun(months: number[], today: string): string | null {
  const month = Number(today.slice(5, 7));
  const next = nearestMonth(months, month);
  if (next === null) return null;
  const thisYear = Number(today.slice(0, 4));
  const year = next < month ? thisYear + 1 : thisYear;
  return `${year}-${String(next).padStart(2, "0")}-01`;
}

/** Open, opening soon or closed for anything that runs in certain months. */
export function seasonStatus(months: number[]): {
  availability: Availability;
  opensOn: string | null;
} {
  const today = todayInBishkek();

  if (months.includes(currentMonth())) {
    return { availability: "open", opensOn: null };
  }
  const opensOn = firstDayOfNextRun(months, today);
  const daysAway = opensOn
    ? (Date.parse(opensOn) - Date.parse(today)) / 86_400_000
    : Infinity;
  return {
    availability: daysAway <= OPENS_SOON_WINDOW_DAYS ? "opens_soon" : "closed",
    opensOn,
  };
}

function availabilityOf(tour: MockTour): {
  availability: Availability;
  opensOn: string | null;
} {
  if (tour.soldOut) return { availability: "sold_out", opensOn: null };
  return seasonStatus(tourMonths(tour));
}

function seatsLeft(tour: MockTour, date: string): number {
  if (tour.soldOut) return 0;
  let hash = 0;
  for (const char of `${tour.slug}${date}`) {
    hash = (hash * 31 + char.charCodeAt(0)) % 997;
  }
  return 2 + (hash % Math.max(1, tour.group[1] - 1));
}

function departuresOf(tour: MockTour, from: string, to: string): Departure[] {
  const months = tourMonths(tour);
  const departures: Departure[] = [];
  for (let date = from; date <= to; date = addDays(date, 1)) {
    const day = new Date(`${date}T00:00:00Z`).getUTCDay();
    const month = Number(date.slice(5, 7));
    if (day === tour.weekday && months.includes(month)) {
      departures.push({
        date,
        seats_left: seatsLeft(tour, date),
        price: seasonPrice(tour, month),
      });
    }
  }
  return departures;
}

export function regionOf(key: RegionKey, lang: Locale): Region {
  return { slug: key, name: REGIONS[key][lang] };
}

export function placeRegionKey(slug: string): RegionKey {
  return findPlace(slug).region;
}

export function placeRef(slug: string, lang: Locale): PlaceRef {
  return { slug, name: findPlace(slug).name[lang] };
}

function findPlace(slug: string): MockPlace {
  const place = PLACES.find((candidate) => candidate.slug === slug);
  if (!place) throw new Error(`Unknown place in mock tour: ${slug}`);
  return place;
}

function toTourSummary(tour: MockTour, lang: Locale): TourSummary {
  const place = findPlace(tour.place);
  const { availability, opensOn } = availabilityOf(tour);
  const cover = tour.photos[0];
  return {
    slug: tour.slug,
    title: tour.title[lang],
    category: tour.category,
    photo: photo(cover.key, cover.alt[lang]),
    place: { slug: place.slug, name: place.name[lang] },
    region: regionOf(place.region, lang),
    price_from: lowestPrice(tour) * TYIYN_PER_SOM,
    availability,
    opens_on: opensOn,
    duration_days: tour.days,
    difficulty: tour.difficulty,
    months: tourMonths(tour),
  };
}

function paginate<T>(items: T[], limit = 50, offset = 0): Page<T> {
  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
    limit,
    offset,
  };
}

export function listTours(lang: Locale, filters: TourFilters = {}): Page<TourSummary> {
  const items = TOURS.filter(
    (tour) =>
      (!filters.category || tour.category === filters.category) &&
      (!filters.place || tour.place === filters.place) &&
      (!filters.region || findPlace(tour.place).region === filters.region) &&
      (!filters.operator || OPERATORS[tour.operator].slug === filters.operator) &&
      (!filters.month || tourMonths(tour).includes(filters.month)),
  ).map((tour) => toTourSummary(tour, lang));

  const filtered = filters.availability
    ? items.filter((tour) => tour.availability === filters.availability)
    : items;

  // Open tours lead the default order: a closed tour is the wrong first result.
  const rank: Record<Availability, number> = {
    open: 0,
    opens_soon: 1,
    closed: 2,
    sold_out: 3,
  };
  const sorted = [...filtered].sort((a, b) => {
    if (filters.sort === "price_asc") return a.price_from - b.price_from;
    if (filters.sort === "price_desc") return b.price_from - a.price_from;
    return rank[a.availability] - rank[b.availability];
  });

  return paginate(sorted, filters.limit, filters.offset);
}

export function getTour(lang: Locale, slug: string): TourDetail | null {
  const tour = TOURS.find((candidate) => candidate.slug === slug);
  if (!tour) return null;

  const today = todayInBishkek();
  return {
    ...toTourSummary(tour, lang),
    crowd_by_month: placeCrowd(tour.place),
    description: tour.description[lang],
    photos: tour.photos.map((item) => photo(item.key, item.alt[lang])),
    group_min: tour.group[0],
    group_max: tour.group[1],
    seasons: tour.seasons.map((season) => ({
      name: season.name[lang],
      months: season.months,
      price_from: season.price * TYIYN_PER_SOM,
    })),
    next_departures: departuresOf(
      tour,
      addDays(today, 1),
      addDays(today, DEPARTURE_WINDOW_DAYS),
    ).slice(0, 5),
    included: tour.included.map((item) => item[lang]),
    excluded: tour.excluded.map((item) => item[lang]),
    operator: OPERATORS[tour.operator],
  };
}

export function tourAvailability(
  slug: string,
  dateFrom: string,
  dateTo: string,
): TourAvailabilityResponse {
  const tour = TOURS.find((candidate) => candidate.slug === slug);
  return { departures: tour ? departuresOf(tour, dateFrom, dateTo) : [] };
}

export function quote(slug: string, input: QuoteInput): Quote {
  const tour = TOURS.find((candidate) => candidate.slug === slug);
  if (!tour) throw new Error(`Unknown tour: ${slug}`);

  const priceAdult = seasonPrice(tour, Number(input.date.slice(5, 7)));
  const priceChild = Math.round(priceAdult * CHILD_PRICE_SHARE);
  return {
    ...input,
    price_adult: priceAdult,
    price_child: priceChild,
    total: priceAdult * input.adults + priceChild * input.children,
  };
}

function toPlaceSummary(place: MockPlace, lang: Locale): PlaceSummary {
  const cover = place.photos[0];
  return {
    slug: place.slug,
    name: place.name[lang],
    region: regionOf(place.region, lang),
    photo: photo(cover.key, cover.alt[lang]),
    best_months: place.bestMonths,
    open_tours: TOURS.filter(
      (tour) =>
        tour.place === place.slug && availabilityOf(tour).availability === "open",
    ).length,
    latitude: place.lat,
    longitude: place.lng,
  };
}

export function listPlaces(lang: Locale, filters: PlaceFilters = {}): Page<PlaceSummary> {
  const items = PLACES.filter(
    (place) => !filters.region || place.region === filters.region,
  ).map((place) => toPlaceSummary(place, lang));
  return paginate(items, filters.limit, filters.offset);
}

export function getPlace(lang: Locale, slug: string): PlaceDetail | null {
  const place = PLACES.find((candidate) => candidate.slug === slug);
  if (!place) return null;
  return {
    ...toPlaceSummary(place, lang),
    crowd_by_month: placeCrowd(place.slug),
    description: place.description[lang],
    photos: place.photos.map((item) => photo(item.key, item.alt[lang])),
    transport_advice: place.transport[lang],
    packing_advice: place.packing[lang],
  };
}

export function seasonsNow(): SeasonsNow {
  const open = new Map<TourCategory, number>();
  const soon = new Map<TourCategory, string>();

  for (const tour of TOURS) {
    const { availability, opensOn } = availabilityOf(tour);
    if (availability === "open") {
      open.set(tour.category, (open.get(tour.category) ?? 0) + 1);
    } else if (availability === "opens_soon" && opensOn) {
      const known = soon.get(tour.category);
      if (!known || opensOn < known) soon.set(tour.category, opensOn);
    }
  }

  return {
    month: currentMonth(),
    open: [...open].map(([category, tour_count]) => ({ category, tour_count })),
    opening_soon: [...soon]
      .filter(([category]) => !open.has(category))
      .map(([category, opens_on]) => ({ category, opens_on })),
  };
}
