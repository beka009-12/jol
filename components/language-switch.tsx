"use client";

import type { MouseEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "cn";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABELS = { en: "English", ru: "Русский" } as const;
const SHORT = { en: "EN", ru: "RU" } as const;

interface LanguageSwitchProps {
  variant?: "compact" | "full";
  className?: string;
}

export function LanguageSwitch({
  variant = "compact",
  className,
}: LanguageSwitchProps) {
  const t = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  // Filters live in the query string; carry them over to the other language.
  const keepQuery =
    (target: (typeof routing.locales)[number]) =>
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (window.location.search) {
        event.preventDefault();
        router.replace(`${pathname}${window.location.search}`, {
          locale: target,
        });
      }
    };

  return (
    <nav
      aria-label={t("language")}
      className={cn(
        "inline-flex gap-1",
        variant === "full" && "w-full rounded-xl bg-secondary p-1",
        className,
      )}
    >
      {routing.locales.map((target) => {
        const active = target === locale;
        return (
          <Link
            key={target}
            href={pathname}
            locale={target}
            hrefLang={target}
            lang={target}
            aria-current={active ? "true" : undefined}
            onClick={keepQuery(target)}
            className={cn(
              "inline-flex h-11 items-center justify-center text-sm font-semibold transition-colors duration-150",
              variant === "full" ? "flex-1 rounded-xl" : "min-w-11 rounded-xl px-2",
              active
                ? variant === "full"
                  ? "bg-card"
                  : "underline decoration-2 underline-offset-4"
                : "font-medium hover:bg-current/10",
            )}
          >
            {variant === "full" ? LABELS[target] : SHORT[target]}
          </Link>
        );
      })}
    </nav>
  );
}
