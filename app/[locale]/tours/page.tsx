import type { Metadata } from "next";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CategoryIcon, CATEGORIES } from "@/components/category-icon";
import { CatalogFilters, CatalogPage } from "@/components/catalog-tabs";
import { ChipRow } from "@/components/chip";
import { EmptyState } from "@/components/empty-state";
import { TourGridSkeleton } from "@/components/skeletons";
import { TourCard } from "@/components/tour-card";
import { routing } from "@/i18n/routing";
import { getTours } from "@/lib/api/server";
import {
  currentMonth,
  monthName,
  monthsFrom,
  nearestMonth,
} from "@/lib/format";
import { parseCategory, parseMonth } from "@/lib/search-params";
import type { Locale, TourCategory } from "@/lib/types";

interface ToursPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; month?: string }>;
}

type MonthKey = `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`;

export async function generateMetadata({
  params,
}: ToursPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Tours" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

function toursHref(category?: TourCategory, month?: number) {
  return {
    pathname: "/tours",
    query: {
      ...(category ? { category } : {}),
      ...(month ? { month } : {}),
    },
  };
}

interface FiltersProps {
  locale: Locale;
  category?: TourCategory;
  month?: number;
}

async function TourFilters({ locale, category, month }: FiltersProps) {
  const t = await getTranslations("Tours");
  const tCategories = await getTranslations("Categories");

  return (
    <CatalogFilters>
      <ChipRow
        showLabel
        label={t("categoryLabel")}
        items={[
          {
            key: "all",
            label: t("allCategories"),
            href: toursHref(undefined, month),
            active: !category,
          },
          ...CATEGORIES.map((item) => ({
            key: item,
            label: tCategories(item),
            href: toursHref(item, month),
            active: item === category,
            icon: <CategoryIcon category={item} className="size-4" />,
          })),
        ]}
      />
      <ChipRow
        showLabel
        label={t("monthLabel")}
        items={[
          {
            key: "any",
            label: t("anyMonth"),
            href: toursHref(category),
            active: !month,
          },
          ...monthsFrom(currentMonth()).map((item) => ({
            key: String(item),
            label: monthName(item, locale, "short"),
            href: toursHref(category, item),
            active: item === month,
            title: monthName(item, locale),
          })),
        ]}
      />
    </CatalogFilters>
  );
}

async function TourResults({ locale, category, month }: FiltersProps) {
  const t = await getTranslations("Tours");
  const tCategories = await getTranslations("Categories");
  const tMonths = await getTranslations("MonthsIn");

  const { items, total } = await getTours(locale, { category, month });

  if (items.length > 0) {
    return (
      <>
        <p role="status" className="mb-4 text-sm text-muted-foreground">
          {t("count", { count: total })}
        </p>
        <ul className="grid gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((tour, index) => (
            <li key={tour.slug}>
              <TourCard
                tour={tour}
                headingLevel="h2"
                preload={index === 0}
                compactOnPhone
              />
            </li>
          ))}
        </ul>
      </>
    );
  }

  if (!month) {
    return (
      <EmptyState
        title={t("empty")}
        actionLabel={t("emptyClear")}
        actionHref="/tours"
      />
    );
  }

  // Point to the nearest month that does have tours rather than a dead end.
  const others = await getTours(locale, { category });
  const next = nearestMonth(
    others.items.flatMap((tour) => tour.months),
    month,
  );
  const monthIn = tMonths(String(month) as MonthKey);

  return (
    <EmptyState
      title={
        category
          ? t("emptyForMonth", {
              category: tCategories(category),
              month: monthIn,
            })
          : t("emptyForMonthAny", { month: monthIn })
      }
      actionLabel={
        next
          ? t("emptySuggestion", { month: monthName(next, locale) })
          : t("emptyClear")
      }
      actionHref={next ? toursHref(category, next) : "/tours"}
    />
  );
}

export default async function ToursPage({
  params,
  searchParams,
}: ToursPageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("Tours");

  const raw = await searchParams;
  const category = parseCategory(raw.category);
  const month = parseMonth(raw.month);

  return (
    <CatalogPage active="tours" title={t("title")} lede={t("lede")}>
      <TourFilters locale={locale} category={category} month={month} />
      <div className="mt-6">
        <Suspense
          key={`${category ?? ""}-${month ?? ""}`}
          fallback={<TourGridSkeleton />}
        >
          <TourResults locale={locale} category={category} month={month} />
        </Suspense>
      </div>
    </CatalogPage>
  );
}
