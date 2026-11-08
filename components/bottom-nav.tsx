"use client";

import { House, LayoutGrid, MessageCircle, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { Link, usePathname } from "@/i18n/navigation";

const CATALOG_PATHS = [
  "/search",
  "/tours",
  "/hotels",
  "/restaurants",
  "/companies",
  "/places",
];

const ITEMS = [
  { href: "/", key: "home", icon: House },
  { href: "/search", key: "catalog", icon: LayoutGrid },
  { href: "/guide", key: "guide", icon: MessageCircle },
  { href: "/profile", key: "profile", icon: User },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/search") {
    return CATALOG_PATHS.some((path) => pathname.startsWith(path));
  }
  return pathname.startsWith(href);
}

export function BottomNav() {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("mainLabel")}
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-card pb-[env(safe-area-inset-bottom)] lg:hidden [body:has([data-sticky-cta])_&]:hidden"
    >
      <ul className="grid h-[var(--nav-height)] grid-cols-4">
        {ITEMS.map(({ href, key, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={key}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-150",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-6" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
