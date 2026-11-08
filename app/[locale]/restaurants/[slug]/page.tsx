import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarOff, CalendarRange, Clock } from "lucide-react";
import { hasLocale } from "next-intl";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { AvailabilityBadge, OpenNowBadge } from "@/components/availability-badge";
import { CrowdChart } from "@/components/crowd-chart";
import {
  ContactActions,
  DetailAside,
  DetailCard,
  DetailGallery,
  DetailSection,
} from "@/components/detail-parts";
import { type Fact, FactGrid } from "@/components/fact-grid";
import { NearbyListings } from "@/components/nearby-listings";
import { PriceLine } from "@/components/price";
import { RatingMark, VerifiedMark } from "@/components/rating";
import { StickyCta } from "@/components/sticky-cta";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getRestaurant } from "@/lib/api/server";
import { formatSeason, formatSom, weekdayName } from "@/lib/format";

export const revalidate = 60;

interface RestaurantPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: RestaurantPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const restaurant = await getRestaurant(locale, slug);
  if (!restaurant) return {};
  return {
    title: restaurant.name,
    description: restaurant.description,
    openGraph: { images: [restaurant.photo.url] },
  };
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const restaurant = await getRestaurant(locale, slug);
  if (!restaurant) notFound();

  const t = await getTranslations("Restaurant");
  const tRestaurants = await getTranslations("Restaurants");
  const tTypes = await getTranslations("RestaurantTypes");
  const tCuisines = await getTranslations("Cuisines");
  const tHours = await getTranslations("Hours");
  const format = await getFormatter();

  const whatsappHref = `https://wa.me/${restaurant.whatsapp}?text=${encodeURIComponent(
    t("whatsappMessage", { name: restaurant.name }),
  )}`;

  const facts: Fact[] = [
    {
      icon: Clock,
      term: tHours("hours"),
      value: `${restaurant.opens_at}–${restaurant.closes_at}`,
    },
    {
      icon: CalendarOff,
      term: tHours("daysOff"),
      value:
        restaurant.closed_days.length > 0
          ? format.list(
              restaurant.closed_days.map((day) => weekdayName(day, locale)),
            )
          : tHours("noDaysOff"),
    },
    {
      icon: CalendarRange,
      term: tHours("season"),
      value: formatSeason(restaurant.months, locale, tHours("allYear")),
    },
  ];

  const summary = (
    <>
      <PriceLine
        main={tRestaurants("checkValue", {
          som: formatSom(restaurant.average_check, locale),
        })}
        note={tRestaurants("checkNote")}
        className="text-base"
      />
      {restaurant.availability === "open" ? (
        <OpenNowBadge hours={restaurant} className="mt-2" />
      ) : (
        <AvailabilityBadge
          availability={restaurant.availability}
          opensOn={restaurant.opens_on}
          className="mt-2"
        />
      )}
    </>
  );

  return (
    <article>
      <DetailGallery photos={restaurant.photos} backHref="/restaurants" />

      <div className="page-width mt-6 pb-12 lg:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-12 lg:pb-12">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{tTypes(restaurant.type)}</p>
          <h1 className="mt-1 font-display text-display-md font-extrabold text-balance">
            {restaurant.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <Link
              href={`/places/${restaurant.place.slug}`}
              className="underline underline-offset-4 transition-colors duration-150 hover:text-foreground"
            >
              {restaurant.place.name}
            </Link>
            {`, ${restaurant.region.name}`}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {restaurant.rating && <RatingMark rating={restaurant.rating} showCount />}
            {restaurant.verified && <VerifiedMark withLabel />}
          </p>

          <div className="mt-4 lg:hidden">{summary}</div>

          <ul className="mt-4 flex flex-wrap gap-2">
            {restaurant.cuisines.map((cuisine) => (
              <li
                key={cuisine}
                className="inline-flex h-9 items-center rounded-xl bg-secondary px-3 text-sm"
              >
                {tCuisines(cuisine)}
              </li>
            ))}
          </ul>

          <DetailSection id="about" title={t("aboutTitle")}>
            <p className="max-w-[65ch] text-pretty">{restaurant.description}</p>
          </DetailSection>

          <DetailSection id="dishes" title={t("dishesTitle")}>
            <ul className="flex flex-wrap gap-2">
              {restaurant.dishes.map((dish) => (
                <li
                  key={dish}
                  className="inline-flex h-9 items-center rounded-xl border px-3 text-sm"
                >
                  {dish}
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection id="hours" title={tHours("title")}>
            <DetailCard>
              <FactGrid facts={facts} />
              <CrowdChart
                visitors={restaurant.crowd_by_month}
                openMonths={restaurant.months}
              />
            </DetailCard>
          </DetailSection>

          <DetailSection id="address" title={t("addressTitle")}>
            <p>{restaurant.address}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("contactHint")}</p>
          </DetailSection>
        </div>

        <DetailAside>
          {summary}
          <div className="mt-6 grid gap-2">
            <ContactActions
              whatsappHref={whatsappHref}
              phone={restaurant.phone}
              stacked
            />
          </div>
        </DetailAside>
      </div>

      <Suspense>
        <NearbyListings
          locale={locale}
          place={restaurant.place}
          excludeSlug={restaurant.slug}
        />
      </Suspense>

      <StickyCta>
        <ContactActions whatsappHref={whatsappHref} phone={restaurant.phone} />
      </StickyCta>
    </article>
  );
}
