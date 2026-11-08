import { BadgeCheck, Star } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from "cn";
import type { Rating } from "@/lib/types";

interface RatingMarkProps {
  rating: Rating;
  /** Show how many reviews next to the score. */
  showCount?: boolean;
  className?: string;
}

export function RatingMark({ rating, showCount = false, className }: RatingMarkProps) {
  const t = useTranslations("Common");
  const format = useFormatter();
  const score = format.number(rating.score, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-sm font-semibold",
        className,
      )}
    >
      <Star className="size-3.5 fill-sun text-sun" aria-hidden />
      <span aria-hidden>{score}</span>
      {showCount && (
        <span aria-hidden className="font-normal text-muted-foreground">
          ({format.number(rating.count)})
        </span>
      )}
      <span className="sr-only">
        {t("ratingLabel", { score, count: rating.count })}
      </span>
    </span>
  );
}

interface VerifiedMarkProps {
  /** Icon only for cards; with the word on a company or hotel page. */
  withLabel?: boolean;
  className?: string;
}

export function VerifiedMark({ withLabel = false, className }: VerifiedMarkProps) {
  const t = useTranslations("Common");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 align-[-0.15em] text-sm font-medium text-verified",
        className,
      )}
    >
      <BadgeCheck className="size-4 shrink-0" aria-hidden />
      <span className={withLabel ? undefined : "sr-only"}>{t("verified")}</span>
    </span>
  );
}
