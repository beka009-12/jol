import type { Metadata } from "next";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { HotelCard } from "@/components/business-cards";
import { CatalogPage } from "@/components/catalog-tabs";
import { ChipRow } from "@/components/chip";
import { EmptyState } from "@/components/empty-state";
import { TourGridSkeleton } from "@/components/skeletons";
import { routing } from "@/i18n/routing";
import { getRegions } from "@/lib/api/catalog-index";
import { getHotels } from "@/lib/api/server";
import { HOTEL_TYPES, parseHotelType, parseSlug } from "@/lib/search-params";
import type { HotelType, Locale } from "@/lib/types";

interface HotelsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; region?: string }>;
}

export async function generateMetadata({
  params,
}: HotelsPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Hotels" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

function hotelsHref(type?: HotelType, region?: string) {
  return {
    pathname: "/hotels",
    query: { ...(type ? { type } : {}), ...(region ? { region } : {}) },
  };
}

interface ResultsProps {
  locale: Locale;
  type?: HotelType;
  region?: string;
}

async function HotelResults({ locale, type, region }: ResultsProps) {
  const t = await getTranslations("Hotels");
  const { items, total } = await getHotels(locale, { type, region });

  if (items.length === 0) {
    return (
      <EmptyState
        title={t("empty")}
        actionLabel={t("emptyClear")}
        actionHref="/hotels"
      />
    );
  }

  return (
    <>
      <p role="status" className="mb-4 text-sm text-muted-foreground">
        {t("count", { count: total })}
      </p>
      <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((hotel, index) => (
          <li key={hotel.slug}>
            <HotelCard hotel={hotel} headingLevel="h2" preload={index === 0} />
          </li>
        ))}
      </ul>
    </>
  );
}

export default async function HotelsPage({
  params,
  searchParams,
}: HotelsPageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Hotels");
  const tTypes = await getTranslations("HotelTypes");
  const regions = await getRegions(locale);

  const raw = await searchParams;
  const type = parseHotelType(raw.type);
  const region = parseSlug(raw.region);

  return (
    <CatalogPage active="hotels" title={t("title")}>
      <div className="space-y-2">
        <ChipRow
          label={t("typeLabel")}
          items={[
            {
              key: "all",
              label: t("allTypes"),
              href: hotelsHref(undefined, region),
              active: !type,
            },
            ...HOTEL_TYPES.map((item) => ({
              key: item,
              label: tTypes(item),
              href: hotelsHref(item, region),
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
              href: hotelsHref(type),
              active: !region,
            },
            ...regions.map((item) => ({
              key: item.slug,
              label: item.name,
              href: hotelsHref(type, item.slug),
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
          <HotelResults locale={locale} type={type} region={region} />
        </Suspense>
      </div>
    </CatalogPage>
  );
}
