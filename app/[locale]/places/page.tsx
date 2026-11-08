import type { Metadata } from "next";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CatalogFilters, CatalogPage } from "@/components/catalog-tabs";
import { ChipRow } from "@/components/chip";
import { EmptyState } from "@/components/empty-state";
import { PlaceCard } from "@/components/place-card";
import { PlaceGridSkeleton } from "@/components/skeletons";
import { routing } from "@/i18n/routing";
import { getPlaces } from "@/lib/api/server";
import type { Locale, Region } from "@/lib/types";

interface PlacesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ region?: string }>;
}

export async function generateMetadata({
  params,
}: PlacesPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Places" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

interface RegionFilterProps {
  locale: Locale;
  active?: string;
}

async function RegionFilter({ locale, active }: RegionFilterProps) {
  const t = await getTranslations("Places");
  const { items } = await getPlaces(locale);
  const regions = new Map<string, Region>(
    items.map((place) => [place.region.slug, place.region]),
  );

  return (
    <ChipRow
      showLabel
      label={t("regionLabel")}
      items={[
        {
          key: "all",
          label: t("allRegions"),
          href: "/places",
          active: !active,
        },
        ...[...regions.values()].map((region) => ({
          key: region.slug,
          label: region.name,
          href: { pathname: "/places", query: { region: region.slug } },
          active: region.slug === active,
        })),
      ]}
    />
  );
}

async function PlaceResults({ locale, active }: RegionFilterProps) {
  const t = await getTranslations("Places");
  const { items } = await getPlaces(locale, { region: active });

  if (items.length === 0) {
    return (
      <EmptyState
        title={t("empty")}
        actionLabel={t("emptyClear")}
        actionHref="/places"
      />
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
      {items.map((place, index) => (
        <li key={place.slug}>
          <PlaceCard place={place} headingLevel="h2" preload={index < 2} />
        </li>
      ))}
    </ul>
  );
}

export default async function PlacesPage({
  params,
  searchParams,
}: PlacesPageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("Places");
  const { region } = await searchParams;

  return (
    <CatalogPage active="places" title={t("title")} lede={t("lede")}>
      <CatalogFilters>
        <RegionFilter locale={locale} active={region} />
      </CatalogFilters>
      <div className="mt-6">
        <Suspense key={region ?? ""} fallback={<PlaceGridSkeleton count={8} />}>
          <PlaceResults locale={locale} active={region} />
        </Suspense>
      </div>
    </CatalogPage>
  );
}
