import type { ComponentProps, ReactNode } from "react";
import { Photo } from "@/components/photo";
import { RatingMark, VerifiedMark } from "@/components/rating";
import { Link } from "@/i18n/navigation";
import type { Photo as PhotoData, Rating } from "@/lib/types";

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
  /** Sits on the photo: only for what the visitor must notice, like "closed". */
  badge?: ReactNode;
  /** h2 when the card sits directly under the page's h1. */
  headingLevel?: "h2" | "h3";
}

/* The same card for a tour, a hotel and a cafe, so the catalog reads as one thing. */
export function ListingCard({
  href,
  photo,
  sizes = "(min-width: 1280px) 300px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  preload = false,
  title,
  meta,
  rating,
  verified = false,
  price,
  badge,
  headingLevel: Heading = "h3",
}: ListingCardProps) {
  return (
    <article className="relative h-full">
      <Link href={href} className="group block rounded-2xl">
        <div className="relative">
          <Photo
            photo={photo}
            sizes={sizes}
            preload={preload}
            interactive
            className="rounded-2xl"
          />
          {badge && <div className="absolute top-3 left-3">{badge}</div>}
        </div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <Heading className="min-w-0 leading-snug font-semibold text-balance group-hover:underline group-hover:decoration-1 group-hover:underline-offset-2">
            {title}
            {verified && <VerifiedMark className="ml-2" />}
          </Heading>
          {rating && <RatingMark rating={rating} className="mt-1" />}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
        {price && <div className="mt-2">{price}</div>}
      </Link>
    </article>
  );
}
