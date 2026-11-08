import { useTranslations } from "next-intl";
import { Photo } from "@/components/photo";
import { Link } from "@/i18n/navigation";
import type { PlaceSummary } from "@/lib/types";

interface PlaceCardProps {
  place: PlaceSummary;
  sizes?: string;
  /** h2 when the card sits directly under the page's h1. */
  headingLevel?: "h2" | "h3";
  /** For the first cards on a list page, where they are the largest paint. */
  preload?: boolean;
}

export function PlaceCard({
  place,
  sizes = "(min-width: 1024px) 280px, 50vw",
  headingLevel: Heading = "h3",
  preload = false,
}: PlaceCardProps) {
  const t = useTranslations("Places");

  return (
    <article>
      <Link href={`/places/${place.slug}`} className="group block rounded-2xl">
        <Photo
          photo={place.photo}
          sizes={sizes}
          preload={preload}
          interactive
          className="rounded-2xl"
        />
        <Heading className="mt-3 font-semibold group-hover:underline group-hover:decoration-1 group-hover:underline-offset-2">
          {place.name}
        </Heading>
        <p className="mt-1 text-sm text-muted-foreground">
          {place.region.name}
          {place.open_tours > 0 && (
            <>
              <br />
              {t("openTours", { count: place.open_tours })}
            </>
          )}
        </p>
      </Link>
    </article>
  );
}
