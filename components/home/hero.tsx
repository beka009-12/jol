import type { ComponentProps } from "react";
import { getTranslations } from "next-intl/server";
import { cn } from "cn";
import { LanguageSwitch } from "@/components/language-switch";
import { Logo } from "@/components/logo";
import { Photo } from "@/components/photo";
import { SearchForm } from "@/components/search-form";
import { Link } from "@/i18n/navigation";
import { currentMonth } from "@/lib/format";
import { photo, type PhotoKey } from "@/lib/mocks/photos";

type SeasonKey = "spring" | "summer" | "autumn" | "winter";

const SEASON_COVERS: Record<SeasonKey, PhotoKey> = {
  spring: "arslanbob",
  summer: "hero-song-kol",
  autumn: "horse-golden",
  winter: "ala-archa",
};

function seasonOf(month: number): SeasonKey {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 9) return "summer";
  if (month >= 10 && month <= 11) return "autumn";
  return "winter";
}

export async function Hero() {
  const t = await getTranslations("Home");
  const tCommon = await getTranslations("Common");

  const season = seasonOf(currentMonth());
  const cover = photo(SEASON_COVERS[season], t(`heroPhotos.${season}`));

  const quickLinks: {
    label: string;
    href: ComponentProps<typeof Link>["href"];
  }[] = [
    {
      label: t("quickSki"),
      href: { pathname: "/tours", query: { category: "ski" } },
    },
    {
      label: t("quickYurts"),
      href: { pathname: "/hotels", query: { type: "yurt_camp" } },
    },
    {
      label: t("quickGuesthouses"),
      href: { pathname: "/hotels", query: { type: "guesthouse", region: "issyk-kul" } },
    },
    {
      label: t("quickOsh"),
      href: { pathname: "/restaurants", query: { region: "osh" } },
    },
  ];

  return (
    <section aria-labelledby="hero-title" className="[--hero-overlap:3rem] lg:[--hero-overlap:2rem]">
      <div className="relative isolate flex min-h-[32rem] flex-col justify-end overflow-hidden bg-deep text-white [--ring:#ffffff] lg:min-h-[max(34rem,calc(100svh-var(--header-height)-9rem))]">
        <div className="absolute inset-0 -z-10">
          <Photo
            photo={cover}
            sizes="max(100vw, 130vh)"
            aspect="none"
            preload
            className="h-full"
          />
          {/* The winter photo has snow behind the headline, so it needs a darker scrim. */}
          <div
            className={cn(
              "absolute inset-0 bg-linear-to-t from-black/80 via-55% to-black/10",
              season === "winter"
                ? "via-black/60"
                : "via-black/45 lg:via-black/40",
            )}
          />
          <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/70 to-transparent lg:hidden" />
        </div>

        <div className="page-width absolute inset-x-0 top-[env(safe-area-inset-top)] flex items-center justify-between pt-2 lg:hidden">
          <Link
            href="/"
            aria-label={tCommon("appName")}
            className="inline-flex h-11 items-center rounded-xl"
          >
            <Logo plainMark />
          </Link>
          <LanguageSwitch className="-mr-2" />
        </div>

        <div className="page-width pt-[calc(env(safe-area-inset-top)+var(--tap)+--spacing(12))] pb-[calc(var(--hero-overlap)+--spacing(6))] lg:pt-12 lg:pb-[calc(var(--hero-overlap)+--spacing(12))]">
          <h1
            id="hero-title"
            className="max-w-[13em] font-display text-display-xl font-extrabold text-balance [text-shadow:0_1px_28px_rgb(0_0_0/0.35)]"
          >
            {t("heroTitle")}
          </h1>
          <p className="mt-3 max-w-[38rem] leading-relaxed text-pretty text-white/95 lg:mt-6 lg:text-lg lg:leading-relaxed">
            {t("heroLead")}
          </p>
        </div>
      </div>

      <div className="page-width relative z-10 -mt-(--hero-overlap)">
        <SearchForm />
      </div>

      <div className="page-width mt-4">
        <p className="sr-only">{t("quickLabel")}</p>
        <ul className="no-scrollbar -mx-4 flex gap-x-6 overflow-x-auto px-4 text-sm lg:mx-0 lg:px-4">
          {quickLinks.map(({ label, href }) => (
            <li key={label} className="shrink-0">
              <Link
                href={href}
                prefetch={false}
                className="inline-flex h-11 items-center rounded-lg font-medium whitespace-nowrap underline decoration-foreground/25 underline-offset-4 transition-colors duration-150 hover:decoration-foreground"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
