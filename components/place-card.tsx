import { useLocale, useTranslations } from "next-intl";
import { Photo } from "@/components/photo";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { currentMonth, formatSeason } from "@/lib/format";
import type { PlaceSummary } from "@/lib/types";

interface PlaceCardProps {
  place: PlaceSummary;
  sizes?: string;
  /** h2 when the card sits directly under the page's h1. */
  headingLevel?: "h2" | "h3";
  /** For the first cards on a list page, where they are the largest paint. */
  preload?: boolean;
}

/* A place is chosen by when to go as much as by the photo, so the season is on the card. */
export function PlaceCard({
  place,
  sizes = "(min-width: 1024px) 280px, 50vw",
  headingLevel: Heading = "h3",
  preload = false,
}: PlaceCardProps) {
  const t = useTranslations("Places");
  const tHours = useTranslations("Hours");
  const locale = useLocale();
  const inSeason = place.best_months.includes(currentMonth());

  return (
    <article>
      <Link href={`/places/${place.slug}`} className="group block rounded-2xl">
        <div className="relative">
          <Photo
            photo={place.photo}
            sizes={sizes}
            preload={preload}
            interactive
            className="rounded-2xl"
          />
          {inSeason && (
            <Badge tone="open" onPhoto className="absolute top-3 left-3">
              {t("inSeasonNow")}
            </Badge>
          )}
        </div>
        <Heading className="mt-3 font-semibold group-hover:underline group-hover:decoration-1 group-hover:underline-offset-2">
          {place.name}
        </Heading>
        <p className="mt-1 text-sm text-muted-foreground">{place.region.name}</p>
        {place.best_months.length > 0 && (
          <p className="mt-2 text-sm text-pretty first-letter:uppercase">
            {t("season", {
              months: formatSeason(place.best_months, locale, tHours("allYear")),
            })}
          </p>
        )}
        {place.open_tours > 0 && (
          <p className="mt-1 text-sm font-semibold">
            {t("openTours", { count: place.open_tours })}
          </p>
        )}
      </Link>
    </article>
  );
}
