import { CarFront, ChevronRight, Compass, type LucideIcon, UserRound } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { ListingCard } from "@/components/listing-card";
import { PriceLine } from "@/components/price";
import { RatingMark, VerifiedMark } from "@/components/rating";
import { Link } from "@/i18n/navigation";
import { formatSom } from "@/lib/format";
import type {
  CompanyKind,
  CompanySummary,
  HotelSummary,
  RestaurantSummary,
} from "@/lib/types";

interface HotelCardProps {
  compactOnPhone?: boolean;
  hotel: HotelSummary;
  sizes?: string;
  headingLevel?: "h2" | "h3";
  preload?: boolean;
}

export function HotelCard({
  hotel,
  sizes,
  headingLevel,
  preload,
  compactOnPhone,
}: HotelCardProps) {
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
      status={{ availability: hotel.availability, opensOn: hotel.opens_on }}
      compactOnPhone={compactOnPhone}
    />
  );
}

interface RestaurantCardProps {
  compactOnPhone?: boolean;
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
  compactOnPhone,
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
      status={{
        availability: restaurant.availability,
        opensOn: restaurant.opens_on,
      }}
      compactOnPhone={compactOnPhone}
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
  /** Light mark for the dark band at the top of a company page. */
  onDark?: boolean;
}

/* Classes joined by hand: tailwind-merge takes text-display-sm and a text colour for one group. */
export function CompanyMonogram({ name, large = false, onDark = false }: CompanyMonogramProps) {
  return (
    <span
      aria-hidden
      className={[
        "grid shrink-0 place-items-center font-display font-extrabold",
        large ? "size-20 rounded-2xl text-display-sm" : "size-14 rounded-xl text-xl",
        onDark ? "bg-on-deep text-deep" : "bg-deep text-on-deep",
      ].join(" ")}
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

export const KIND_ICONS: Record<CompanyKind, LucideIcon> = {
  tour_operator: Compass,
  transfer: CarFront,
  guide: UserRound,
};

interface CompanyListProps {
  companies: CompanySummary[];
  headingLevel?: "h2" | "h3";
}

/*
  A directory, not a wall of boxes: one line per company once the list is wide
  enough (a container query, so it also fits beside the trip card on a place
  page), so what they do, where and how many tours compare down the columns.
*/
export function CompanyList({ companies, headingLevel: Heading = "h3" }: CompanyListProps) {
  const t = useTranslations("Companies");
  const tKinds = useTranslations("CompanyKinds");
  const format = useFormatter();

  return (
    <ul className="@container divide-y border-y">
      {companies.map((company) => {
        const KindIcon = KIND_ICONS[company.kind];
        return (
          <li key={company.slug}>
            <article>
              <Link
                href={`/companies/${company.slug}`}
                className="group grid grid-cols-[3.5rem_minmax(0,1fr)_1.25rem] gap-x-4 gap-y-3 py-4 @4xl:grid-cols-[3.5rem_minmax(0,17rem)_minmax(0,1fr)_minmax(0,12rem)_1.25rem] @4xl:items-center @4xl:gap-x-6 @4xl:py-6"
              >
                <CompanyMonogram name={company.name} />
                <span className="min-w-0 self-center">
                  <Heading className="leading-snug font-semibold text-balance group-hover:underline group-hover:decoration-1 group-hover:underline-offset-2">
                    {company.name}
                    {company.verified && <VerifiedMark className="ml-2" />}
                  </Heading>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <KindIcon className="size-4 shrink-0" aria-hidden />
                      {tKinds(company.kind)}
                    </span>
                    {company.rating && <RatingMark rating={company.rating} showCount />}
                  </span>
                </span>
                <span className="col-start-2 col-span-2 text-sm text-pretty @4xl:col-span-1 @4xl:col-start-3 @4xl:row-start-1 @4xl:text-base">
                  {company.tagline}
                </span>
                <span className="col-start-2 col-span-2 text-sm text-muted-foreground @4xl:col-span-1 @4xl:col-start-4 @4xl:row-start-1">
                  <span className="block">
                    {format.list(company.regions.map((region) => region.name))}
                  </span>
                  {company.tours_count > 0 && (
                    <span className="block font-medium text-foreground">
                      {t("toursCount", { count: company.tours_count })}
                    </span>
                  )}
                </span>
                <ChevronRight
                  className="col-start-3 row-start-1 size-5 self-center text-muted-foreground transition-[translate,color] duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-foreground @4xl:col-start-5"
                  aria-hidden
                />
              </Link>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
