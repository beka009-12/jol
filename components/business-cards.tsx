import { ChevronRight } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { AvailabilityBadge } from "@/components/availability-badge";
import { ListingCard } from "@/components/listing-card";
import { PriceLine } from "@/components/price";
import { RatingMark, VerifiedMark } from "@/components/rating";
import { Link } from "@/i18n/navigation";
import { formatSom } from "@/lib/format";
import type {
  CompanySummary,
  HotelSummary,
  RestaurantSummary,
} from "@/lib/types";

interface HotelCardProps {
  hotel: HotelSummary;
  sizes?: string;
  headingLevel?: "h2" | "h3";
  preload?: boolean;
}

export function HotelCard({ hotel, sizes, headingLevel, preload }: HotelCardProps) {
  const t = useTranslations("Hotels");
  const tTypes = useTranslations("HotelTypes");
  const locale = useLocale();

  return (
    <ListingCard
      href={`/hotels/${hotel.slug}`}
      photo={hotel.photo}
      sizes={sizes}
      preload={preload}
      headingLevel={headingLevel}
      title={hotel.name}
      meta={`${tTypes(hotel.type)}, ${hotel.place.name}`}
      rating={hotel.rating}
      verified={hotel.verified}
      price={
        <PriceLine
          main={t("priceFrom", { som: formatSom(hotel.price_from, locale) })}
          note={t("perNight")}
        />
      }
      badge={
        hotel.availability === "open" ? undefined : (
          <AvailabilityBadge
            availability={hotel.availability}
            opensOn={hotel.opens_on}
            onPhoto
          />
        )
      }
    />
  );
}

interface RestaurantCardProps {
  restaurant: RestaurantSummary;
  sizes?: string;
  headingLevel?: "h2" | "h3";
  preload?: boolean;
}

export function RestaurantCard({
  restaurant,
  sizes,
  headingLevel,
  preload,
}: RestaurantCardProps) {
  const t = useTranslations("Restaurants");
  const tCuisines = useTranslations("Cuisines");
  const locale = useLocale();

  return (
    <ListingCard
      href={`/restaurants/${restaurant.slug}`}
      photo={restaurant.photo}
      sizes={sizes}
      preload={preload}
      headingLevel={headingLevel}
      title={restaurant.name}
      meta={`${tCuisines(restaurant.cuisines[0])}, ${restaurant.place.name}`}
      rating={restaurant.rating}
      verified={restaurant.verified}
      price={
        <PriceLine
          main={t("checkValue", {
            som: formatSom(restaurant.average_check, locale),
          })}
          note={t("checkNote")}
        />
      }
      badge={
        restaurant.availability === "open" ? undefined : (
          <AvailabilityBadge
            availability={restaurant.availability}
            opensOn={restaurant.opens_on}
            onPhoto
          />
        )
      }
    />
  );
}

/* Letters instead of a logo until companies upload their own. */
export function initials(name: string): string {
  const letters = name.match(/[\p{L}\p{N}]+/gu) ?? [];
  return letters
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

interface CompanyMonogramProps {
  name: string;
  large?: boolean;
}

export function CompanyMonogram({ name, large = false }: CompanyMonogramProps) {
  return (
    <span
      aria-hidden
      className={
        large
          ? "grid size-20 shrink-0 place-items-center rounded-2xl bg-deep font-display text-display-sm font-extrabold text-on-deep"
          : "grid size-14 shrink-0 place-items-center rounded-xl bg-deep font-display text-xl font-extrabold text-on-deep"
      }
    >
      {initials(name)}
    </span>
  );
}

interface CompanyCardProps {
  company: CompanySummary;
  headingLevel?: "h2" | "h3";
}

export function CompanyCard({
  company,
  headingLevel: Heading = "h3",
}: CompanyCardProps) {
  const t = useTranslations("Companies");
  const tKinds = useTranslations("CompanyKinds");
  const format = useFormatter();

  return (
    <article className="relative h-full">
      <Link
        href={`/companies/${company.slug}`}
        className="group flex h-full flex-col rounded-2xl border bg-card p-6 transition-colors duration-150 hover:border-foreground/40"
      >
        <span className="flex items-start gap-4">
          <CompanyMonogram name={company.name} />
          <span className="min-w-0 flex-1">
            <Heading className="leading-snug font-semibold text-balance">
              {company.name}
              {company.verified && <VerifiedMark className="ml-2" />}
            </Heading>
            <span className="mt-1 block text-sm text-muted-foreground">
              {tKinds(company.kind)}
            </span>
            {company.rating && (
              <RatingMark rating={company.rating} showCount className="mt-1" />
            )}
          </span>
        </span>
        <span className="mt-4 block text-sm text-pretty">{company.tagline}</span>
        <span className="mt-auto flex items-end justify-between gap-3 pt-4 text-sm text-muted-foreground">
          <span className="min-w-0">
            {format.list(company.regions.map((region) => region.name))}
            {company.tours_count > 0 && (
              <>
                <br />
                {t("toursCount", { count: company.tours_count })}
              </>
            )}
          </span>
          <ChevronRight
            className="size-5 shrink-0 text-foreground transition-[translate] duration-150 ease-out group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </Link>
    </article>
  );
}
