import type { Metadata } from "next";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { RestaurantCard } from "@/components/business-cards";
import { CatalogPage } from "@/components/catalog-tabs";
import { ChipRow } from "@/components/chip";
import { EmptyState } from "@/components/empty-state";
import { TourGridSkeleton } from "@/components/skeletons";
import { routing } from "@/i18n/routing";
import { getRegions } from "@/lib/api/catalog-index";
import { getRestaurants } from "@/lib/api/server";
import {
  parseRestaurantType,
  parseSlug,
  RESTAURANT_TYPES,
} from "@/lib/search-params";
import type { Locale, RestaurantType } from "@/lib/types";

interface RestaurantsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; region?: string }>;
}

export async function generateMetadata({
  params,
}: RestaurantsPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Restaurants" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

function restaurantsHref(type?: RestaurantType, region?: string) {
  return {
    pathname: "/restaurants",
    query: { ...(type ? { type } : {}), ...(region ? { region } : {}) },
  };
}

interface ResultsProps {
  locale: Locale;
  type?: RestaurantType;
  region?: string;
}

async function RestaurantResults({ locale, type, region }: ResultsProps) {
  const t = await getTranslations("Restaurants");
  const { items, total } = await getRestaurants(locale, { type, region });

  if (items.length === 0) {
    return (
      <EmptyState
        title={t("empty")}
        actionLabel={t("emptyClear")}
        actionHref="/restaurants"
      />
    );
  }

  return (
    <>
      <p role="status" className="mb-4 text-sm text-muted-foreground">
        {t("count", { count: total })}
      </p>
      <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((restaurant, index) => (
          <li key={restaurant.slug}>
            <RestaurantCard
              restaurant={restaurant}
              headingLevel="h2"
              preload={index === 0}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

export default async function RestaurantsPage({
  params,
  searchParams,
}: RestaurantsPageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Restaurants");
  const tTypes = await getTranslations("RestaurantTypes");
  const regions = await getRegions(locale);

  const raw = await searchParams;
  const type = parseRestaurantType(raw.type);
  const region = parseSlug(raw.region);

  return (
    <CatalogPage active="restaurants" title={t("title")}>
      <div className="space-y-2">
        <ChipRow
          label={t("typeLabel")}
          items={[
            {
              key: "all",
              label: t("allTypes"),
              href: restaurantsHref(undefined, region),
              active: !type,
            },
            ...RESTAURANT_TYPES.map((item) => ({
              key: item,
              label: tTypes(item),
              href: restaurantsHref(item, region),
              active: item === type,
            })),
          ]}
        />
        <ChipRow
          label={t("regionLabel")}
          items={[
            {
              key: "all",
              label: t("allRegions"),
              href: restaurantsHref(type),
              active: !region,
            },
            ...regions.map((item) => ({
              key: item.slug,
              label: item.name,
              href: restaurantsHref(type, item.slug),
              active: item.slug === region,
            })),
          ]}
        />
      </div>
      <div className="mt-6">
        <Suspense
          key={`${type ?? ""}-${region ?? ""}`}
          fallback={<TourGridSkeleton />}
        >
          <RestaurantResults locale={locale} type={type} region={region} />
        </Suspense>
      </div>
    </CatalogPage>
  );
}
