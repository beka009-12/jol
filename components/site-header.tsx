"use client";

import { MessageCircle, Search, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { LanguageSwitch } from "@/components/language-switch";
import { Logo } from "@/components/logo";
import { Link, usePathname } from "@/i18n/navigation";

const ITEMS = [
  { href: "/tours", key: "tours" },
  { href: "/hotels", key: "stays" },
  { href: "/restaurants", key: "food" },
  { href: "/companies", key: "companies" },
  { href: "/places", key: "places" },
] as const;

/* Desktop only: phones use the bottom nav. */
export function SiteHeader() {
  const t = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 hidden h-[var(--header-height)] border-b bg-card lg:block">
      <div className="page-width flex h-full items-center gap-6">
        <Link
          href="/"
          aria-label={tCommon("appName")}
          className="inline-flex h-11 items-center rounded-xl"
        >
          <Logo />
        </Link>

        <nav aria-label={t("mainLabel")} className="flex-1 pl-4">
          <ul className="flex gap-1">
            {ITEMS.map(({ href, key }) => {
              const active = pathname.startsWith(href);
              return (
                <li key={key}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex h-[var(--header-height)] items-center px-3 font-medium transition-colors duration-150 hover:text-primary",
                      active &&
                        "text-primary after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary",
                    )}
                  >
                    {t(key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/search"
            aria-label={t("search")}
            aria-current={pathname.startsWith("/search") ? "page" : undefined}
            className={cn(
              "grid size-11 place-items-center rounded-xl transition-colors duration-150 hover:bg-secondary",
              pathname.startsWith("/search") && "text-primary",
            )}
          >
            <Search className="size-5" aria-hidden />
          </Link>
          <Link
            href="/guide"
            aria-current={pathname.startsWith("/guide") ? "page" : undefined}
            className={cn(
              "mx-1 inline-flex h-11 items-center gap-2 rounded-xl border border-foreground/20 px-4 font-medium transition-colors duration-150 hover:bg-secondary",
              pathname.startsWith("/guide") && "border-primary text-primary",
            )}
          >
            <MessageCircle className="size-5" aria-hidden />
            {t("guide")}
          </Link>
          <LanguageSwitch />
          <Link
            href="/profile"
            aria-label={t("profile")}
            aria-current={pathname.startsWith("/profile") ? "page" : undefined}
            className={cn(
              "grid size-11 place-items-center rounded-xl transition-colors duration-150 hover:bg-secondary",
              pathname.startsWith("/profile") && "text-primary",
            )}
          >
            <User className="size-5" aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}
