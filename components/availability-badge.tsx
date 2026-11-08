import { useLocale, useTranslations } from "next-intl";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { bishkekClock, formatDate, weekdayName } from "@/lib/format";
import { type OpeningHours, openStateAt } from "@/lib/opening-hours";
import type { Availability } from "@/lib/types";

const AVAILABILITY_TONES: Record<Availability, BadgeTone> = {
  open: "open",
  opens_soon: "soon",
  sold_out: "closed",
  closed: "closed",
};

interface AvailabilityBadgeProps {
  availability: Availability;
  opensOn?: string | null;
  /** Solid white, for sitting on top of a photo. */
  onPhoto?: boolean;
  className?: string;
}

export function AvailabilityBadge({
  availability,
  opensOn,
  onPhoto = false,
  className,
}: AvailabilityBadgeProps) {
  const t = useTranslations("Availability");
  const locale = useLocale();
  const date = opensOn ? formatDate(opensOn, locale) : null;

  const label = {
    open: t("open"),
    opens_soon: date ? t("opensOn", { date }) : t("opensSoon"),
    sold_out: t("soldOut"),
    closed: date ? t("closedUntil", { date }) : t("closed"),
  }[availability];

  return (
    <Badge
      tone={AVAILABILITY_TONES[availability]}
      onPhoto={onPhoto}
      className={className}
    >
      {label}
    </Badge>
  );
}

interface OpenNowBadgeProps {
  hours: OpeningHours;
  className?: string;
}

export function OpenNowBadge({ hours, className }: OpenNowBadgeProps) {
  const t = useTranslations("Hours");
  const locale = useLocale();
  const state = openStateAt(hours, bishkekClock());

  if (state.status === "open") {
    return (
      <Badge tone="open" className={className}>
        {t("openUntil", { time: state.until })}
      </Badge>
    );
  }

  const { next } = state;
  const label = !next
    ? t("closedNow")
    : next.inDays === 0
      ? t("opensToday", { time: next.time })
      : next.inDays === 1
        ? t("opensTomorrow", { time: next.time })
        : t("opensOnDay", {
            day: weekdayName(next.day, locale, "short"),
            time: next.time,
          });

  return (
    <Badge tone="closed" className={className}>
      {label}
    </Badge>
  );
}
