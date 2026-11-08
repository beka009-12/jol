import type { ComponentProps, ReactNode } from "react";
import { cn } from "cn";
import { AvailabilityBadge } from "@/components/availability-badge";
import { Photo } from "@/components/photo";
import { RatingMark, VerifiedMark } from "@/components/rating";
import { Link } from "@/i18n/navigation";
import type { Availability, Photo as PhotoData, Rating } from "@/lib/types";

export interface ListingStatus {
  availability: Availability;
  opensOn: string | null;
}

interface ListingCardProps {
  href: ComponentProps<typeof Link>["href"];
  photo: PhotoData;
  sizes?: string;
  preload?: boolean;
  title: string;
  /** Where it is and what it is, in one short line. */
  meta: string;
  rating?: Rating | null;
  verified?: boolean;
  price?: ReactNode;
  /** Only for what the visitor must notice, like "closed": open needs no badge. */
  status?: ListingStatus;
  /** h2 when the card sits directly under the page's h1. */
  headingLevel?: "h2" | "h3";
  /**
   * A row with a small square photo on a phone, so a long list can be scanned
   * and prices compared without scrolling past one big photo at a time.
   */
  compactOnPhone?: boolean;
}

const STACKED_SIZES =
  "(min-width: 1280px) 300px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";
const COMPACT_SIZES =
  "(min-width: 1280px) 300px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 112px";

/* The same card for a tour, a hotel and a cafe, so the catalog reads as one thing. */
export function ListingCard({
  href,
  photo,
  sizes,
  preload = false,
  title,
  meta,
  rating,
  verified = false,
  price,
  status,
  headingLevel: Heading = "h3",
  compactOnPhone = false,
}: ListingCardProps) {
  const badge = status && status.availability !== "open" ? status : null;

  return (
    <article className="relative h-full">
      <Link
        href={href}
        className={cn(
          "group rounded-2xl",
          compactOnPhone
            ? "grid grid-cols-[7rem_minmax(0,1fr)] items-start gap-4 sm:block"
            : "block",
        )}
      >
        <div className="relative">
          <Photo
            photo={photo}
            sizes={sizes ?? (compactOnPhone ? COMPACT_SIZES : STACKED_SIZES)}
            preload={preload}
            interactive
            className={cn(
              "rounded-2xl",
              compactOnPhone && "max-sm:aspect-square max-sm:rounded-xl",
            )}
          />
          {badge && (
            <div className={cn("absolute top-3 left-3", compactOnPhone && "max-sm:hidden")}>
              <AvailabilityBadge
                availability={badge.availability}
                opensOn={badge.opensOn}
                onPhoto
              />
            </div>
          )}
        </div>
        <div className={compactOnPhone ? "sm:mt-3" : "mt-3"}>
          <div className="flex items-start justify-between gap-3">
            <Heading className="min-w-0 leading-snug font-semibold text-balance group-hover:underline group-hover:decoration-1 group-hover:underline-offset-2">
              {title}
              {verified && <VerifiedMark className="ml-2" />}
            </Heading>
            {rating && <RatingMark rating={rating} className="mt-1" />}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
          {price && <div className="mt-2">{price}</div>}
          {badge && compactOnPhone && (
            <AvailabilityBadge
              availability={badge.availability}
              opensOn={badge.opensOn}
              className="mt-2 sm:hidden"
            />
          )}
        </div>
      </Link>
    </article>
  );
}
