import { useTranslations } from "next-intl";
import { cn } from "cn";
import {
  BISHKEK,
  distanceKm,
  MAP_HEIGHT,
  MAP_WIDTH,
  type MapPoint,
  project,
} from "@/lib/kyrgyzstan-map";
import { LOCATOR_PATHS } from "@/lib/kyrgyzstan-map-data";

/* Closer than this to Bishkek and the two dots would sit on top of each other. */
const CAPITAL_MIN_KM = 90;

/* A label under or over its dot, pulled inwards near the left and right edges. */
function labelPlacement(point: MapPoint): string {
  const vertical = point.top < 35 ? "top-3" : "bottom-3";
  const horizontal =
    point.left < 20
      ? "left-0 -translate-x-2"
      : point.left > 78
        ? "right-0 translate-x-2"
        : "left-0 -translate-x-1/2";
  return cn(vertical, horizontal);
}

interface PlaceLocatorProps {
  name: string;
  latitude: number;
  longitude: number;
  className?: string;
}

/* Where the place is in the country, with Bishkek for a sense of distance. */
export function PlaceLocator({ name, latitude, longitude, className }: PlaceLocatorProps) {
  const t = useTranslations("Place");
  const place = project(latitude, longitude);
  const capital = project(BISHKEK.latitude, BISHKEK.longitude);
  const showCapital = distanceKm({ latitude, longitude }, BISHKEK) > CAPITAL_MIN_KM;

  const labels = [
    ...(showCapital
      ? [{ key: "capital", point: capital, text: t("capital"), strong: false }]
      : []),
    { key: "place", point: place, text: name, strong: true },
  ];

  return (
    <div
      role="img"
      aria-label={t("locatorLabel", { place: name })}
      className={cn("relative", className)}
      style={{ aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}` }}
    >
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="absolute inset-0 size-full overflow-visible"
        aria-hidden
      >
        <path
          d={LOCATOR_PATHS.border}
          fill="var(--surface)"
          stroke="var(--foreground)"
          strokeOpacity={0.3}
          strokeWidth={1.5}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path d={LOCATOR_PATHS.lake} fill="var(--route-lake)" fillOpacity={0.5} />
        {showCapital && (
          <circle cx={capital.x} cy={capital.y} r={14} fill="var(--foreground)" />
        )}
        <circle cx={place.x} cy={place.y} r={64} fill="var(--primary)" fillOpacity={0.14} />
        <circle
          cx={place.x}
          cy={place.y}
          r={24}
          fill="var(--primary)"
          stroke="var(--card)"
          strokeWidth={10}
        />
      </svg>
      {labels.map(({ key, point, text, strong }) => (
        <span
          key={key}
          aria-hidden
          className="absolute"
          style={{ left: `${point.left}%`, top: `${point.top}%` }}
        >
          <span
            className={cn(
              "absolute whitespace-nowrap [text-shadow:0_0_3px_var(--card),0_0_6px_var(--card)]",
              strong ? "text-sm font-semibold" : "text-xs text-muted-foreground",
              labelPlacement(point),
            )}
          >
            {text}
          </span>
        </span>
      ))}
    </div>
  );
}
