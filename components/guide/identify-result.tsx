import { useLocale, useTranslations } from "next-intl";
import { cn } from "cn";
import { ChipLink } from "@/components/chip";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { IdentificationResult, IdentifiedPlace } from "@/lib/types";

interface IdentifyResultProps {
  result: IdentificationResult;
}

export function IdentifyResult({ result }: IdentifyResultProps) {
  const t = useTranslations("Guide");
  const locale = useLocale();
  const nameOf = (place: IdentifiedPlace) =>
    locale === "ru" ? place.name_ru : place.name_en;

  return (
    <div className="rounded-2xl bg-secondary p-4">
      {result.place ? (
        <>
          <p className="font-semibold">
            {t("identifiedTitle", { place: nameOf(result.place) })}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("confidence", { percent: Math.round(result.confidence * 100) })}
          </p>
        </>
      ) : (
        <p className="font-semibold">{t("notIdentified")}</p>
      )}

      {result.reason && <p className="mt-2 text-sm">{result.reason}</p>}

      {result.place && (
        <Link
          href={`/places/${result.place.slug}`}
          className={cn(buttonVariants({ variant: "outline" }), "mt-3")}
        >
          {t("openPlace")}
        </Link>
      )}

      {result.alternatives.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">{t("alternatives")}</p>
          <ul className="flex flex-wrap gap-2">
            {result.alternatives.map((place) => (
              <li key={place.id}>
                <ChipLink
                  href={`/places/${place.slug}`}
                  className="bg-card hover:bg-accent"
                >
                  {nameOf(place)}
                </ChipLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
