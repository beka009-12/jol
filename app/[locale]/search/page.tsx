import type { Metadata } from "next";
import { ComponentProps, Suspense } from "react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  CompanyCard,
  HotelCard,
  RestaurantCard,
} from "@/components/business-cards";
import { CatalogTiles } from "@/components/home/catalog-tiles";
import { ChipRow } from "@/components/chip";
import { EmptyState } from "@/components/empty-state";
import { PlaceCard } from "@/components/place-card";
import { SearchForm } from "@/components/search-form";
import { TourGridSkeleton } from "@/components/skeletons";
import { TourCard } from "@/components/tour-card";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getRegions } from "@/lib/api/catalog-index";
import { searchCatalog } from "@/lib/api/server";
import { parseMonth, parseQuery } from "@/lib/search-params";
import type { Locale, SearchResults } from "@/lib/types";

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    month?: string;
    type?: string;
  }>;
}

const GROUPS = ["tours", "hotels", "restaurants", "companies", "places"] as const;
type Group = (typeof GROUPS)[number];

const GROUP_LABELS: Record<Group, "tours" | "stays" | "food" | "companies" | "places"> = {
  tours: "tours",
  hotels: "stays",
  restaurants: "food",
  companies: "companies",
  places: "places",
};

const PREVIEW_COUNT = 4;

function parseGroup(value: unknown): Group | undefined {
  return GROUPS.find((group) => group === value);
}

export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Search" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

interface Filters {
  q: string;
  month?: number;
}

function searchHref(filters: Filters, type?: Group): ComponentProps<typeof Link>["href"] {
  return {
    pathname: "/search",
    query: {
      ...(filters.q ? { q: filters.q } : {}),
      ...(filters.month ? { month: filters.month } : {}),
      ...(type ? { type } : {}),
    },
  };
}

const GRID = "grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

function GroupItems({
  group,
  results,
  limit,
}: {
  group: Group;
  results: SearchResults;
  limit: number;
}) {
  switch (group) {
    case "tours":
      return (
        <ul className={GRID}>
          {results.tours.items.slice(0, limit).map((tour) => (
            <li key={tour.slug}>
              <TourCard tour={tour} />
            </li>
          ))}
        </ul>
      );
    case "hotels":
      return (
        <ul className={GRID}>
          {results.hotels.items.slice(0, limit).map((hotel) => (
            <li key={hotel.slug}>
              <HotelCard hotel={hotel} />
            </li>
          ))}
        </ul>
      );
    case "restaurants":
      return (
        <ul className={GRID}>
          {results.restaurants.items.slice(0, limit).map((restaurant) => (
            <li key={restaurant.slug}>
              <RestaurantCard restaurant={restaurant} />
            </li>
          ))}
        </ul>
      );
    case "companies":
      return (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.companies.items.slice(0, limit).map((company) => (
            <li key={company.slug}>
              <CompanyCard company={company} />
            </li>
          ))}
        </ul>
      );
    case "places":
      return (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-6 lg:grid-cols-4 lg:gap-6">
          {results.places.items.slice(0, limit).map((place) => (
            <li key={place.slug}>
              <PlaceCard place={place} />
            </li>
          ))}
        </ul>
      );
  }
}

interface ResultsProps {
  locale: Locale;
  filters: Filters;
  only?: Group;
}

async function Results({ locale, filters, only }: ResultsProps) {
  const t = await getTranslations("Search");
  const tNav = await getTranslations("Nav");

  const results = await searchCatalog(locale, {
    q: filters.q,
    month: filters.month,
  });

  const total = GROUPS.reduce((sum, group) => sum + results[group].total, 0);

  if (total === 0) {
    return (
      <EmptyState
        title={t("emptyTitle")}
        body={t("emptyBody")}
        actionLabel={t("emptyAction")}
        actionHref={
          filters.q
            ? { pathname: "/guide", query: { q: filters.q } }
            : "/guide"
        }
      />
    );
  }

  const shown = GROUPS.filter(
    (group) => results[group].total > 0 && (!only || group === only),
  );

  return (
    <>
      <p role="status" className="mb-3 text-sm text-muted-foreground">
        {t("total", { count: total })}
      </p>
      <ChipRow
        label={t("groupsLabel")}
        items={[
          {
            key: "all",
            label: t("allGroups"),
            href: searchHref(filters),
            active: !only,
          },
          ...GROUPS.filter((group) => results[group].total > 0).map((group) => ({
            key: group,
            label: `${tNav(GROUP_LABELS[group])} ${results[group].total}`,
            href: searchHref(filters, group),
            active: group === only,
          })),
        ]}
      />

      <div className="mt-8 space-y-12">
        {shown.map((group) => {
          const count = results[group].total;
          const limit = only ? count : PREVIEW_COUNT;
          return (
            <section key={group} aria-labelledby={`results-${group}`}>
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2
                  id={`results-${group}`}
                  className="font-display text-display-sm font-extrabold"
                >
                  {tNav(GROUP_LABELS[group])}
                </h2>
                {!only && count > PREVIEW_COUNT && (
                  <Link
                    href={searchHref(filters, group)}
                    prefetch={false}
                    scroll={false}
                    className="inline-flex h-11 items-center text-sm font-semibold underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
                  >
                    {t("showAll", { count })}
                  </Link>
                )}
              </div>
              <GroupItems group={group} results={results} limit={limit} />
            </section>
          );
        })}
      </div>
    </>
  );
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Search");
  const regions = await getRegions(locale);
  const raw = await searchParams;

  const filters: Filters = {
    q: parseQuery(raw.q),
    month: parseMonth(raw.month),
  };
  const only = parseGroup(raw.type);
  const hasFilters = Boolean(filters.q || filters.month);

  return (
    <div className="pb-nav">
      <div className="bg-surface pt-[calc(env(safe-area-inset-top)+--spacing(6))] pb-6 lg:pt-12 lg:pb-8">
        <div className="page-width">
          <h1 className="mb-6 font-display text-display-md font-extrabold">
            {filters.q ? t("resultsFor", { q: filters.q }) : t("title")}
          </h1>
          <SearchForm defaults={filters} framed={false} />
        </div>
      </div>

      {hasFilters ? (
        <div className="page-width mt-6 lg:mt-8">
          <Suspense
            key={`${filters.q}-${filters.month ?? ""}-${only ?? ""}`}
            fallback={<TourGridSkeleton />}
          >
            <Results locale={locale} filters={filters} only={only} />
          </Suspense>
        </div>
      ) : (
        <>
          <CatalogTiles locale={locale} />
          {regions.length > 0 && (
            <div className="page-width mt-8">
              <h2 className="mb-3 font-semibold">{t("regionsTitle")}</h2>
              <ChipRow
                label={t("regionsTitle")}
                items={regions.map((region) => ({
                  key: region.slug,
                  label: region.name,
                  href: { pathname: "/search", query: { q: region.name } },
                  active: false,
                }))}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
