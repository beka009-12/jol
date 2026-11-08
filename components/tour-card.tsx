import { useTranslations } from "next-intl";
import { cn } from "cn";
import { AvailabilityBadge } from "@/components/availability-badge";
import { ListingCard } from "@/components/listing-card";
import { Photo } from "@/components/photo";
import { Price } from "@/components/price";
import { Link } from "@/i18n/navigation";
import type { TourSummary } from "@/lib/types";

interface TourCardProps {
  tour: TourSummary;
  sizes?: string;
  /** h2 when the card sits directly under the page's h1. */
  headingLevel?: "h2" | "h3";
  /** For the first card on a list page, where it is the largest paint. */
  preload?: boolean;
  compactOnPhone?: boolean;
}

export function TourCard({
  tour,
  sizes,
  headingLevel,
  preload,
  compactOnPhone,
}: TourCardProps) {
  const t = useTranslations("Tours");

  return (
    <ListingCard
      href={`/tours/${tour.slug}`}
      photo={tour.photo}
      sizes={sizes}
      preload={preload}
      headingLevel={headingLevel}
      compactOnPhone={compactOnPhone}
      title={tour.title}
      meta={`${tour.place.name}, ${t("days", { count: tour.duration_days })}`}
      price={<Price amount={tour.price_from} />}
      status={{ availability: tour.availability, opensOn: tour.opens_on }}
    />
  );
}

interface TourRowProps {
  tour: TourSummary;
  /** Leave the badge out where the list already says when these open. */
  showAvailability?: boolean;
  className?: string;
}

/* Compact row: for lists where the date matters more than the photo. */
export function TourRow({ tour, showAvailability = true, className }: TourRowProps) {
  return (
    <article className={cn(className)}>
      <Link
        href={`/tours/${tour.slug}`}
        className="group flex items-center gap-3 rounded-2xl"
      >
        <Photo
          photo={tour.photo}
          sizes="80px"
          aspect="square"
          interactive
          className="w-20 shrink-0 rounded-2xl"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{tour.title}</h3>
          <Price amount={tour.price_from} className="truncate" />
          {showAvailability && (
            <AvailabilityBadge
              availability={tour.availability}
              opensOn={tour.opens_on}
              className="mt-1"
            />
          )}
        </div>
      </Link>
    </article>
  );
}
