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
  AddressLine,
  ContactActions,
  ContactCard,
  DetailCard,
  DetailGallery,
  DetailSection,
  DetailTitle,
  mapSearchHref,
} from "@/components/detail-parts";
import { type Fact, FactGrid } from "@/components/fact-grid";
import { NearbyListings } from "@/components/nearby-listings";
import { PriceLine } from "@/components/price";
import { StickyCta } from "@/components/sticky-cta";
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
  const mapHref = mapSearchHref(restaurant.name, restaurant.address);

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
          <DetailTitle
            kind={tTypes(restaurant.type)}
            title={restaurant.name}
            place={restaurant.place}
            region={restaurant.region}
            rating={restaurant.rating}
            verified={restaurant.verified}
          />

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

          <div className="mt-4 lg:hidden">{summary}</div>

          <DetailSection id="about" title={t("aboutTitle")} className="mt-12">
            <p className="max-w-[65ch] text-pretty">{restaurant.description}</p>
          </DetailSection>

          {/* A short menu card: the dishes are the reason to come, so they get room. */}
          <DetailSection id="dishes" title={t("dishesTitle")} className="mt-12">
            <ul className="grid gap-x-6 border-t sm:grid-cols-2">
              {restaurant.dishes.map((dish) => (
                <li key={dish} className="border-b py-3 font-medium">
                  {dish}
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection id="hours" title={tHours("title")} className="mt-12">
            <DetailCard>
              <FactGrid facts={facts} />
              <CrowdChart visitors={restaurant.crowd_by_month} openMonths={restaurant.months} />
            </DetailCard>
          </DetailSection>

          <section aria-label={t("addressTitle")} className="mt-12 lg:hidden">
            <AddressLine address={restaurant.address} mapHref={mapHref} />
            <p className="mt-3 text-sm text-pretty text-muted-foreground">{t("contactHint")}</p>
          </section>
        </div>

        <ContactCard
          summary={summary}
          whatsappHref={whatsappHref}
          phone={restaurant.phone}
          hint={t("contactHint")}
          address={restaurant.address}
          mapHref={mapHref}
        />
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
