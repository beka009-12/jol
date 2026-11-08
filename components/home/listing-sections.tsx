import { ChevronRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { CompanyCard, HotelCard, RestaurantCard } from "@/components/business-cards";
import { CategoryIcon } from "@/components/category-icon";
import { EmptyState } from "@/components/empty-state";
import { SectionError } from "@/components/home/section-error";
import { TourCard } from "@/components/tour-card";
import { Link } from "@/i18n/navigation";
import { settle } from "@/lib/api/errors";
import {
  getCompanies,
  getHotels,
  getRestaurants,
  getTours,
} from "@/lib/api/server";
import { daysUntil, formatDate, formatRelativeDays } from "@/lib/format";
import type { Locale } from "@/lib/types";

const RAIL =
  "no-scrollbar relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-x-6 lg:overflow-visible lg:px-0 lg:pb-0";
const RAIL_ITEM = "w-[72vw] max-w-[19rem] shrink-0 snap-start lg:w-auto lg:max-w-none";
const CARD_SIZES = "(min-width: 1024px) 300px, 72vw";

async function OpeningSoonNote({ locale }: { locale: Locale }) {
  const t = await getTranslations("Home");
  const tCategories = await getTranslations("Categories");
  const tTours = await getTranslations("Tours");

  const tours = await settle(
    getTours(locale, { availability: "opens_soon", limit: 20 }),
  );
  const soonest = tours?.items
    .map((tour) => tour.opens_on)
    .filter((date): date is string => Boolean(date))
    .sort()[0];
  if (!tours || !soonest) return null;

  const group = tours.items.filter((tour) => tour.opens_on === soonest);
  const { category } = group[0];

  return (
    <Link
      href={{ pathname: "/tours", query: { category } }}
      prefetch={false}
      className="group mt-8 flex items-center gap-4 rounded-2xl bg-soon-soft p-4 text-soon transition-colors duration-150 lg:mt-12 lg:px-6"
    >
      <CategoryIcon category={category} className="size-6 shrink-0" />
      <span className="min-w-0 flex-1 font-medium text-pretty">
        {t("soonNote", {
          category: tCategories(category),
          date: formatDate(soonest, locale),
          relative: formatRelativeDays(daysUntil(soonest), locale),
        })}
      </span>
      <span className="hidden shrink-0 text-sm font-semibold sm:inline">
        {tTours("count", { count: group.length })}
      </span>
      <ChevronRight
        className="size-5 shrink-0 transition-[translate] duration-150 ease-out group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}

export async function HomeTours() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Home");
  const tours = await settle(getTours(locale, { availability: "open", limit: 4 }));
  if (!tours) return <SectionError />;

  return (
    <>
      {tours.items.length > 0 ? (
        <ul className={RAIL}>
          {tours.items.map((tour) => (
            <li key={tour.slug} className={RAIL_ITEM}>
              <TourCard tour={tour} sizes={CARD_SIZES} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title={t("popularEmpty")}
          actionLabel={t("popularEmptyAction")}
          actionHref="/guide"
        />
      )}
      <OpeningSoonNote locale={locale} />
    </>
  );
}

export async function HomeStays() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Home");
  const hotels = await settle(getHotels(locale, { availability: "open", limit: 4 }));
  if (!hotels) return <SectionError />;

  if (hotels.items.length === 0) {
    return <EmptyState title={t("staysEmpty")} actionLabel={t("allStays")} actionHref="/hotels" />;
  }

  return (
    <ul className={RAIL}>
      {hotels.items.map((hotel) => (
        <li key={hotel.slug} className={RAIL_ITEM}>
          <HotelCard hotel={hotel} sizes={CARD_SIZES} />
        </li>
      ))}
    </ul>
  );
}

export async function HomeFood() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Home");
  const restaurants = await settle(getRestaurants(locale, { limit: 4 }));
  if (!restaurants) return <SectionError />;

  if (restaurants.items.length === 0) {
    return <EmptyState title={t("foodEmpty")} actionLabel={t("popularEmptyAction")} actionHref="/guide" />;
  }

  return (
    <ul className={RAIL}>
      {restaurants.items.map((restaurant) => (
        <li key={restaurant.slug} className={RAIL_ITEM}>
          <RestaurantCard restaurant={restaurant} sizes={CARD_SIZES} />
        </li>
      ))}
    </ul>
  );
}

export async function HomeCompanies() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Home");
  const companies = await settle(getCompanies(locale, { limit: 6 }));
  if (!companies) return <SectionError />;

  if (companies.items.length === 0) {
    return <EmptyState title={t("companiesEmpty")} actionLabel={t("businessCta")} actionHref="/business" />;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {companies.items.map((company) => (
        <li key={company.slug}>
          <CompanyCard company={company} />
        </li>
      ))}
    </ul>
  );
}
