import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Backpack,
  CalendarRange,
  Map as MapIcon,
  MessageCircle,
  Mountain,
  Route,
} from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  CompanyList,
  HotelCard,
  RestaurantCard,
} from "@/components/business-cards";
import { CrowdChart } from "@/components/crowd-chart";
import { DetailGallery, DetailSection } from "@/components/detail-parts";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { PlaceLocator } from "@/components/place-locator";
import {
  CompanyListSkeleton,
  TourGridSkeleton,
  TourListSkeleton,
} from "@/components/skeletons";
import { TourRow } from "@/components/tour-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { settle } from "@/lib/api/errors";
import {
  getCompanies,
  getHotels,
  getPlace,
  getRestaurants,
  getTours,
} from "@/lib/api/server";
import { currentMonth, formatSeason, nearestMonth } from "@/lib/format";
import type { Locale } from "@/lib/types";

export const revalidate = 60;

type MonthKey = `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`;

interface PlacePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: PlacePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const place = await getPlace(locale, slug);
  if (!place) return {};
  return {
    title: place.name,
    description: place.description,
    openGraph: { images: [place.photo.url] },
  };
}

interface PlaceToursProps {
  locale: Locale;
  slug: string;
}

async function PlaceTours({ locale, slug }: PlaceToursProps) {
  const t = await getTranslations("Place");
  const tNav = await getTranslations("Nav");
  const tErrors = await getTranslations("Errors");

  const tours = await settle(getTours(locale, { place: slug }));
  if (!tours) return <ErrorState title={tErrors("sectionBody")} />;

  if (tours.items.length === 0) {
    return (
      <EmptyState
        title={t("toursEmpty")}
        actionLabel={tNav("guide")}
        actionHref="/guide"
      />
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 sm:gap-x-6">
      {tours.items.map((tour) => (
        <li key={tour.slug}>
          <TourRow tour={tour} />
        </li>
      ))}
    </ul>
  );
}

/* Rows on a phone; two columns beside the trip card, three once there's room. */
const CARD_GRID =
  "grid gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 xl:grid-cols-3";
const CARD_SIZES = "(min-width: 1280px) 240px, (min-width: 640px) 50vw, 112px";

async function PlaceStays({ locale, slug }: PlaceToursProps) {
  const t = await getTranslations("Place");
  const hotels = await settle(getHotels(locale, { place: slug }));
  if (!hotels || hotels.items.length === 0) return null;

  return (
    <DetailSection id="place-stays" title={t("staysTitle")} className="mt-12">
      <ul className={CARD_GRID}>
        {hotels.items.map((hotel) => (
          <li key={hotel.slug}>
            <HotelCard hotel={hotel} sizes={CARD_SIZES} compactOnPhone />
          </li>
        ))}
      </ul>
    </DetailSection>
  );
}

async function PlaceFood({ locale, slug }: PlaceToursProps) {
  const t = await getTranslations("Place");
  const restaurants = await settle(getRestaurants(locale, { place: slug }));
  if (!restaurants || restaurants.items.length === 0) return null;

  return (
    <DetailSection id="place-food" title={t("foodTitle")} className="mt-12">
      <ul className={CARD_GRID}>
        {restaurants.items.map((restaurant) => (
          <li key={restaurant.slug}>
            <RestaurantCard restaurant={restaurant} sizes={CARD_SIZES} compactOnPhone />
          </li>
        ))}
      </ul>
    </DetailSection>
  );
}

interface PlaceCompaniesProps {
  locale: Locale;
  region: string;
}

async function PlaceCompanies({ locale, region }: PlaceCompaniesProps) {
  const t = await getTranslations("Place");
  const companies = await settle(getCompanies(locale, { region, limit: 3 }));
  if (!companies || companies.items.length === 0) return null;

  return (
    <DetailSection id="place-companies" title={t("companiesTitle")} className="mt-12">
      <CompanyList companies={companies.items} />
    </DetailSection>
  );
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const place = await getPlace(locale, slug);
  if (!place) notFound();

  const t = await getTranslations("Place");
  const tHours = await getTranslations("Hours");
  const tMonthsIn = await getTranslations("MonthsIn");

  const now = currentMonth();
  const nextMonth = nearestMonth(place.best_months, now);
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
  const hasCrowd = (place.crowd_by_month?.length ?? 0) > 0;

  return (
    <article className="pb-nav">
      <DetailGallery photos={place.photos} backHref="/places" />

      <div className="page-width mt-6 lg:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-x-12">
        <header className="min-w-0 lg:col-start-1">
          <h1 className="font-display text-display-lg font-extrabold text-balance">
            {place.name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            <Link
              href={{ pathname: "/places", query: { region: place.region.slug } }}
              className="underline decoration-foreground/30 underline-offset-4 transition-colors duration-150 hover:text-foreground hover:decoration-foreground"
            >
              {place.region.name}
            </Link>
          </p>
          <p className="mt-4 max-w-[60ch] text-lg text-pretty">{place.description}</p>
        </header>

        {/* After the intro on a phone; beside everything, and following the scroll, on a large screen. */}
        <aside
          aria-label={t("glanceLabel")}
          className="mt-6 rounded-2xl border bg-card p-4 lg:sticky lg:top-[calc(var(--header-height)+--spacing(6))] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:p-6"
        >
          <PlaceLocator
            name={place.name}
            latitude={place.latitude}
            longitude={place.longitude}
          />
          <dl className="mt-4 divide-y border-y">
            {place.best_months.length > 0 && (
              <div className="flex gap-3 py-3">
                <CalendarRange className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0">
                  <dt className="text-sm text-muted-foreground">{t("bestMonths")}</dt>
                  <dd className="font-medium text-pretty first-letter:uppercase">
                    {formatSeason(place.best_months, locale, tHours("allYear"))}
                  </dd>
                </div>
              </div>
            )}
            {nextMonth && (
              <div className="flex gap-3 py-3">
                <Mountain className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0">
                  <dt className="text-sm text-muted-foreground">{t("rightNow")}</dt>
                  <dd className="mt-1">
                    {nextMonth === now ? (
                      <Badge tone="open">{t("inSeason")}</Badge>
                    ) : (
                      <Badge tone="soon">
                        {t("seasonStarts", {
                          month: tMonthsIn(String(nextMonth) as MonthKey),
                        })}
                      </Badge>
                    )}
                  </dd>
                </div>
              </div>
            )}
          </dl>
          <div className="mt-4 grid gap-2">
            <Link
              href={{
                pathname: "/guide",
                query: { q: t("askGuideQuestion", { place: place.name }) },
              }}
              prefetch={false}
              className={buttonVariants({ size: "lg" })}
            >
              <MessageCircle aria-hidden />
              {t("askGuide", { place: place.name })}
            </Link>
            <a
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              <MapIcon aria-hidden />
              {t("openMap")}
            </a>
          </div>
        </aside>

        <div className="min-w-0 lg:col-start-1">
          {hasCrowd && (
            <DetailSection id="best-time" title={t("bestTime")} className="mt-12">
              <div className="rounded-2xl bg-surface p-4 lg:p-6">
                <CrowdChart visitors={place.crowd_by_month} />
              </div>
            </DetailSection>
          )}

          <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-6">
            <section aria-labelledby="getting-there">
              <h2 id="getting-there" className="flex items-center gap-2 text-lg font-bold">
                <Route className="size-5 text-muted-foreground" aria-hidden />
                {t("gettingThere")}
              </h2>
              <p className="mt-2 text-pretty">{place.transport_advice}</p>
            </section>
            <section aria-labelledby="packing">
              <h2 id="packing" className="flex items-center gap-2 text-lg font-bold">
                <Backpack className="size-5 text-muted-foreground" aria-hidden />
                {t("packing")}
              </h2>
              <p className="mt-2 text-pretty">{place.packing_advice}</p>
            </section>
          </div>

          <DetailSection id="place-tours" title={t("toursTitle")} className="mt-12">
            <Suspense fallback={<TourListSkeleton count={2} />}>
              <PlaceTours locale={locale} slug={place.slug} />
            </Suspense>
          </DetailSection>

          <Suspense fallback={<TourGridSkeleton />}>
            <PlaceStays locale={locale} slug={place.slug} />
          </Suspense>
          <Suspense fallback={<TourGridSkeleton />}>
            <PlaceFood locale={locale} slug={place.slug} />
          </Suspense>
          <Suspense fallback={<CompanyListSkeleton count={3} />}>
            <PlaceCompanies locale={locale} region={place.region.slug} />
          </Suspense>
        </div>
      </div>
    </article>
  );
}
