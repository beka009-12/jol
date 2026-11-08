import { getTranslations } from "next-intl/server";
import { cn } from "cn";
import {
  CountryMapStations,
  type MapStation,
  type StationData,
} from "@/components/home/country-map-stations";
import { Link } from "@/i18n/navigation";
import { getCatalogIndex } from "@/lib/api/catalog-index";
import {
  DEFAULT_STATION_STYLE,
  kmToPercent,
  LABEL_POSITION,
  MAP_HEIGHT,
  MAP_TOWNS,
  MAP_WIDTH,
  project,
  ROUTE_COLOR,
  ROUTE_STOPS,
  type RouteId,
  STATION_STYLES,
  type TownId,
} from "@/lib/kyrgyzstan-map";
import {
  COUNTRY_PATH,
  LAKE_PATHS,
  OBLAST_PATH,
  ROAD_PATH,
  ROUTE_PATHS,
} from "@/lib/kyrgyzstan-map-data";
import type { Locale } from "@/lib/types";

/* Later routes sit on top where they meet. */
const DRAW_ORDER: RouteId[] = ["south", "center", "lake"];
const LEGEND_ORDER: RouteId[] = ["lake", "center", "south"];
const SCALE_KM = 100;

function countBy<T>(items: T[], slugOf: (item: T) => string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const slug = slugOf(item);
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return counts;
}

/*
  The real country: border, oblasts, lakes and main roads from Natural Earth,
  every place at its own coordinates. Drawn on the server; only the hover
  preview runs in the browser.
*/
export async function CountryMap({ locale }: { locale: Locale }) {
  const t = await getTranslations("Home");
  const { tours, hotels, restaurants, places } = await getCatalogIndex(locale);
  if (!places) return null;

  const toursByPlace = countBy(tours?.items ?? [], (item) => item.place.slug);
  const staysByPlace = countBy(hotels?.items ?? [], (item) => item.place.slug);
  const foodByPlace = countBy(restaurants?.items ?? [], (item) => item.place.slug);

  const stationData = new Map<string, StationData>();
  const stations: MapStation[] = places.items.map((place) => {
    const counts = {
      tours: toursByPlace.get(place.slug) ?? 0,
      stays: staysByPlace.get(place.slug) ?? 0,
      food: foodByPlace.get(place.slug) ?? 0,
    };
    const summary = [
      counts.tours > 0 && t("countTours", { count: counts.tours }),
      counts.stays > 0 && t("countStays", { count: counts.stays }),
      counts.food > 0 && t("countFood", { count: counts.food }),
    ]
      .filter((part): part is string => Boolean(part))
      .join(", ");
    const data: StationData = {
      name: place.name,
      region: place.region.name,
      photo: place.photo,
      ...counts,
      summary,
    };
    stationData.set(place.slug, data);

    const style = STATION_STYLES[place.slug] ?? DEFAULT_STATION_STYLE;
    const point = project(place.latitude, place.longitude);
    return {
      slug: place.slug,
      left: point.left,
      top: point.top,
      labelClass: cn(
        LABEL_POSITION[style.side],
        style.hub && style.side === "top" && "bottom-4",
      ),
      color: style.route ? ROUTE_COLOR[style.route] : "var(--on-deep-muted)",
      hub: Boolean(style.hub),
      data,
    };
  });

  const routeNames: Record<RouteId, string> = {
    lake: t("schemeRoutes.lake"),
    center: t("schemeRoutes.center"),
    south: t("schemeRoutes.south"),
  };
  const townNames: Record<TownId, string> = {
    balykchy: t("schemeTowns.balykchy"),
    kochkor: t("schemeTowns.kochkor"),
    naryn: t("schemeTowns.naryn"),
    toktogul: t("schemeTowns.toktogul"),
    jalalabad: t("schemeTowns.jalalabad"),
  };

  return (
    <section
      aria-labelledby="map-title"
      className="bg-deep py-12 text-on-deep [--ring:var(--on-deep)]"
    >
      <div className="page-width">
        <h2
          id="map-title"
          className="font-display text-display-lg font-extrabold text-balance"
        >
          {t("schemeTitle")}
        </h2>
        <p className="mt-2 max-w-[56ch] text-pretty text-on-deep-muted">
          {t("schemeBody")}
        </p>

        <div
          className="route-scheme relative mt-8"
          style={{ aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}` }}
        >
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="absolute inset-0 size-full"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {/* The border is the heaviest path: written once, reused three times. */}
            <defs>
              <path id="kyrgyzstan-border" d={COUNTRY_PATH} />
              <clipPath id="kyrgyzstan">
                <use href="#kyrgyzstan-border" clipRule="evenodd" />
              </clipPath>
            </defs>
            <use href="#kyrgyzstan-border" fill="var(--deep-raised)" fillRule="evenodd" />
            <g clipPath="url(#kyrgyzstan)">
              <path
                d={OBLAST_PATH}
                stroke="var(--on-deep)"
                strokeOpacity={0.16}
                strokeDasharray="4 5"
                className="max-lg:hidden [stroke-width:1]"
              />
              <path
                d={ROAD_PATH}
                stroke="var(--on-deep)"
                strokeOpacity={0.3}
                className="[stroke-width:3] lg:[stroke-width:1.25]"
              />
            </g>
            <use
              href="#kyrgyzstan-border"
              fillRule="evenodd"
              stroke="var(--on-deep-muted)"
              className="[stroke-width:3.5] lg:[stroke-width:1.5]"
            />
            <path
              d={`${LAKE_PATHS.issykKul}${LAKE_PATHS.toktogul}`}
              fill="var(--route-lake)"
              fillOpacity={0.32}
            />
            {DRAW_ORDER.map((route) => (
              <path
                key={route}
                d={ROUTE_PATHS[route]}
                pathLength={1}
                stroke={ROUTE_COLOR[route]}
                className="route-draw [stroke-width:10] lg:[stroke-width:4]"
              />
            ))}
            {/* Phones get plain dots; the list under the map is what they tap. */}
            <g className="lg:hidden">
              {stations.map((station) => (
                <circle
                  key={station.slug}
                  cx={(station.left / 100) * MAP_WIDTH}
                  cy={(station.top / 100) * MAP_HEIGHT}
                  r={station.hub ? 14 : 11}
                  fill="var(--on-deep)"
                  stroke={station.color}
                  strokeWidth={6}
                />
              ))}
            </g>
          </svg>

          <div
            aria-hidden
            className="absolute top-0 left-0 hidden text-xs text-on-deep-muted lg:block"
            style={{ width: `${kmToPercent(SCALE_KM)}%` }}
          >
            {t("schemeScale", { km: SCALE_KM })}
            <span className="mt-1 block h-2 border-x-2 border-b-2 border-on-deep-muted" />
          </div>

          {MAP_TOWNS.map((town) => {
            const point = project(town.latitude, town.longitude);
            return (
              <span
                key={town.id}
                className="absolute hidden lg:block"
                style={{ left: `${point.left}%`, top: `${point.top}%` }}
              >
                <span
                  aria-hidden
                  className="absolute size-2 -translate-1/2 rounded-full bg-on-deep"
                />
                <span
                  className={cn(
                    "absolute text-xs whitespace-nowrap text-on-deep-muted [text-shadow:0_0_4px_var(--deep),0_0_8px_var(--deep)]",
                    LABEL_POSITION[town.side],
                  )}
                >
                  {townNames[town.id]}
                </span>
              </span>
            );
          })}

          <CountryMapStations
            stations={stations}
            statLabels={{
              tours: t("schemeStatTours"),
              stays: t("schemeStatStays"),
              food: t("schemeStatFood"),
            }}
            defaultStation={stationData.has("karakol") ? "karakol" : stations[0]?.slug ?? ""}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-on-deep-muted">
            {LEGEND_ORDER.map((route) => (
              <li key={route} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="h-1 w-6 rounded-full"
                  style={{ background: ROUTE_COLOR[route] }}
                />
                {routeNames[route]}
              </li>
            ))}
          </ul>
          <p className="text-xs text-on-deep-muted">{t("schemeNote")}</p>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:hidden">
          {LEGEND_ORDER.map((route) => {
            const stops = ROUTE_STOPS[route].filter((slug) => stationData.has(slug));
            return (
              <section key={route} aria-label={routeNames[route]}>
                <h3 className="mb-2 font-semibold">{routeNames[route]}</h3>
                <ol className="relative">
                  <span
                    aria-hidden
                    className="absolute top-6 bottom-6 left-[0.4375rem] w-1 rounded-full"
                    style={{ background: ROUTE_COLOR[route] }}
                  />
                  {stops.map((slug) => {
                    const data = stationData.get(slug);
                    if (!data) return null;
                    return (
                      <li key={slug}>
                        <Link
                          href={`/places/${slug}`}
                          prefetch={false}
                          className="relative flex min-h-13 items-center gap-4 rounded-xl py-2"
                        >
                          <span
                            aria-hidden
                            className="size-4.5 shrink-0 rounded-full border-[3px] bg-on-deep"
                            style={{ borderColor: ROUTE_COLOR[route] }}
                          />
                          <span className="min-w-0">
                            <span className="block font-semibold">{data.name}</span>
                            {data.summary && (
                              <span className="block text-sm text-on-deep-muted">
                                {data.summary}
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
