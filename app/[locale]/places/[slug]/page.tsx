import type { Metadata } from "next";
import { Suspense } from "react";
import {
  CalendarRange,
  Map as MapIcon,
  MessageCircle,
  Mountain,
} from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { CrowdChart } from "@/components/crowd-chart";
import { DetailCard } from "@/components/detail-parts";
import { type Fact, FactGrid } from "@/components/fact-grid";
import {
  CompanyCard,
  HotelCard,
  RestaurantCard,
} from "@/components/business-cards";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { Photo } from "@/components/photo";
import { TourListSkeleton } from "@/components/skeletons";
import { TourRow } from "@/components/tour-card";
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
    <ul className="grid gap-3 lg:grid-cols-2 lg:gap-x-6">
      {tours.items.map((tour) => (
        <li key={tour.slug}>
          <TourRow tour={tour} />
        </li>
      ))}
    </ul>
  );
}

const CARD_GRID = "grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4";
const CARD_SIZES = "(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw";

async function PlaceStays({ locale, slug }: PlaceToursProps) {
  const t = await getTranslations("Place");
  const hotels = await settle(getHotels(locale, { place: slug }));
  if (!hotels || hotels.items.length === 0) return null;

  return (
    <section aria-labelledby="place-stays" className="mt-8">
      <h2 id="place-stays" className="mb-3 text-lg font-bold">
        {t("staysTitle")}
      </h2>
      <ul className={CARD_GRID}>
        {hotels.items.map((hotel) => (
          <li key={hotel.slug}>
            <HotelCard hotel={hotel} sizes={CARD_SIZES} />
          </li>
        ))}
      </ul>
    </section>
  );
}

async function PlaceFood({ locale, slug }: PlaceToursProps) {
  const t = await getTranslations("Place");
  const restaurants = await settle(getRestaurants(locale, { place: slug }));
  if (!restaurants || restaurants.items.length === 0) return null;

  return (
    <section aria-labelledby="place-food" className="mt-8">
      <h2 id="place-food" className="mb-3 text-lg font-bold">
        {t("foodTitle")}
      </h2>
      <ul className={CARD_GRID}>
        {restaurants.items.map((restaurant) => (
          <li key={restaurant.slug}>
            <RestaurantCard restaurant={restaurant} sizes={CARD_SIZES} />
          </li>
        ))}
      </ul>
    </section>
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
    <section aria-labelledby="place-companies" className="mt-8">
      <h2 id="place-companies" className="mb-3 text-lg font-bold">
        {t("companiesTitle")}
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.items.map((company) => (
          <li key={company.slug}>
            <CompanyCard company={company} />
          </li>
        ))}
      </ul>
    </section>
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
  const [cover] = place.photos;

  const nextMonth = nearestMonth(place.best_months, currentMonth());
  const seasonFacts: Fact[] = [
    {
      icon: CalendarRange,
      term: t("bestMonths"),
      value: formatSeason(place.best_months, locale, tHours("allYear")),
    },
    ...(nextMonth
      ? [
          {
            icon: Mountain,
            term: t("rightNow"),
            value:
              nextMonth === currentMonth()
                ? t("inSeason")
                : t("seasonStarts", {
                    month: tMonthsIn(String(nextMonth) as MonthKey),
                  }),
          },
        ]
      : []),
  ];
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;

  return (
    <article className="pb-nav">
      <div className="relative lg:page-width lg:pt-6">
        <Photo
          photo={cover}
          sizes="(min-width: 1248px) 1152px, 100vw"
          aspect="header"
          preload
          className="lg:aspect-[21/9] lg:rounded-2xl"
        />
        <BackLink
          href="/places"
          className="absolute top-[calc(env(safe-area-inset-top)+0.75rem)] left-4 lg:top-9 lg:left-9"
        />
      </div>

      <div className="page-width mt-4 lg:mt-8">
        <h1 className="font-display text-display-md font-extrabold">{place.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {place.region.name}
        </p>
        <p className="mt-3 max-w-[65ch]">{place.description}</p>

        <div className="mt-4 grid gap-2 sm:flex">
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

        {place.best_months.length > 0 && (
          <section aria-labelledby="best-time" className="mt-8 max-w-[56rem]">
            <h2 id="best-time" className="mb-3 text-lg font-bold">
              {t("bestTime")}
            </h2>
            <DetailCard>
              <FactGrid facts={seasonFacts} />
              <CrowdChart visitors={place.crowd_by_month} />
            </DetailCard>
          </section>
        )}

        <section aria-labelledby="place-tours" className="mt-8">
          <h2 id="place-tours" className="mb-3 text-lg font-bold">
            {t("toursTitle")}
          </h2>
          <Suspense fallback={<TourListSkeleton count={2} />}>
            <PlaceTours locale={locale} slug={place.slug} />
          </Suspense>
        </section>

        <Suspense fallback={<TourListSkeleton count={2} />}>
          <PlaceStays locale={locale} slug={place.slug} />
        </Suspense>
        <Suspense fallback={<TourListSkeleton count={2} />}>
          <PlaceFood locale={locale} slug={place.slug} />
        </Suspense>
        <Suspense fallback={<TourListSkeleton count={2} />}>
          <PlaceCompanies locale={locale} region={place.region.slug} />
        </Suspense>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <section aria-labelledby="getting-there">
            <h2 id="getting-there" className="mb-2 text-lg font-bold">
              {t("gettingThere")}
            </h2>
            <p className="max-w-[65ch]">{place.transport_advice}</p>
          </section>
          <section aria-labelledby="packing">
            <h2 id="packing" className="mb-2 text-lg font-bold">
              {t("packing")}
            </h2>
            <p className="max-w-[65ch]">{place.packing_advice}</p>
          </section>
        </div>
      </div>
    </article>
  );
}
