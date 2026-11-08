import {
  BedDouble,
  Building2,
  Compass,
  MapPin,
  UtensilsCrossed,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { Link } from "@/i18n/navigation";

export type CatalogSection =
  | "tours"
  | "hotels"
  | "restaurants"
  | "companies"
  | "places";

export const CATALOG_SECTIONS = [
  { key: "tours", href: "/tours", label: "tours", icon: Compass },
  { key: "hotels", href: "/hotels", label: "stays", icon: BedDouble },
  { key: "restaurants", href: "/restaurants", label: "food", icon: UtensilsCrossed },
  { key: "companies", href: "/companies", label: "companies", icon: Building2 },
  { key: "places", href: "/places", label: "places", icon: MapPin },
] as const;

interface CatalogTabsProps {
  active: CatalogSection;
}

/* The same five sections on every catalog page. The desktop header already lists them. */
export function CatalogTabs({ active }: CatalogTabsProps) {
  const t = useTranslations("Nav");

  return (
    <nav
      aria-label={t("catalogLabel")}
      className="border-b pt-[env(safe-area-inset-top)] lg:hidden"
    >
      <ul className="page-width no-scrollbar flex gap-1 overflow-x-auto lg:gap-3">
        {CATALOG_SECTIONS.map(({ key, href, label, icon: Icon }) => {
          const selected = key === active;
          return (
            <li key={key} className="shrink-0">
              <Link
                href={href}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-13 items-center gap-2 px-2 text-sm font-medium whitespace-nowrap transition-colors duration-150",
                  selected
                    ? "text-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4.5" aria-hidden />
                {t(label)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

interface CatalogPageProps {
  active: CatalogSection;
  title: string;
  /** One sentence on what every item here tells you. */
  lede?: string;
  children: React.ReactNode;
}

export function CatalogPage({ active, title, lede, children }: CatalogPageProps) {
  return (
    <>
      <CatalogTabs active={active} />
      <div className="page-width pt-6 pb-nav lg:pt-12">
        <header className="mb-6 lg:mb-8">
          <h1 className="font-display text-display-md font-extrabold">{title}</h1>
          {lede && (
            <p className="mt-2 max-w-[60ch] text-pretty text-muted-foreground">{lede}</p>
          )}
        </header>
        {children}
      </div>
    </>
  );
}

/* The filters as one block, set off from the results by a rule. */
export function CatalogFilters({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4 border-b pb-6 lg:space-y-3">{children}</div>;
}
