import type { Metadata } from "next";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CompanyCard } from "@/components/business-cards";
import { CatalogPage } from "@/components/catalog-tabs";
import { ChipRow } from "@/components/chip";
import { EmptyState } from "@/components/empty-state";
import { TourGridSkeleton } from "@/components/skeletons";
import { routing } from "@/i18n/routing";
import { getRegions } from "@/lib/api/catalog-index";
import { getCompanies } from "@/lib/api/server";
import { COMPANY_KINDS, parseCompanyKind, parseSlug } from "@/lib/search-params";
import type { CompanyKind, Locale } from "@/lib/types";

interface CompaniesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ kind?: string; region?: string }>;
}

export async function generateMetadata({
  params,
}: CompaniesPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Companies" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

function companiesHref(kind?: CompanyKind, region?: string) {
  return {
    pathname: "/companies",
    query: { ...(kind ? { kind } : {}), ...(region ? { region } : {}) },
  };
}

interface ResultsProps {
  locale: Locale;
  kind?: CompanyKind;
  region?: string;
}

async function CompanyResults({ locale, kind, region }: ResultsProps) {
  const t = await getTranslations("Companies");
  const { items, total } = await getCompanies(locale, { kind, region });

  if (items.length === 0) {
    return (
      <EmptyState
        title={t("empty")}
        actionLabel={t("emptyClear")}
        actionHref="/companies"
      />
    );
  }

  return (
    <>
      <p role="status" className="mb-4 text-sm text-muted-foreground">
        {t("count", { count: total })}
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((company) => (
          <li key={company.slug}>
            <CompanyCard company={company} headingLevel="h2" />
          </li>
        ))}
      </ul>
    </>
  );
}

export default async function CompaniesPage({
  params,
  searchParams,
}: CompaniesPageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Companies");
  const tKinds = await getTranslations("CompanyKinds");
  const regions = await getRegions(locale);

  const raw = await searchParams;
  const kind = parseCompanyKind(raw.kind);
  const region = parseSlug(raw.region);

  return (
    <CatalogPage active="companies" title={t("title")}>
      <div className="space-y-2">
        <ChipRow
          label={t("kindLabel")}
          items={[
            {
              key: "all",
              label: t("allKinds"),
              href: companiesHref(undefined, region),
              active: !kind,
            },
            ...COMPANY_KINDS.map((item) => ({
              key: item,
              label: tKinds(item),
              href: companiesHref(item, region),
              active: item === kind,
            })),
          ]}
        />
        <ChipRow
          label={t("regionLabel")}
          items={[
            {
              key: "all",
              label: t("allRegions"),
              href: companiesHref(kind),
              active: !region,
            },
            ...regions.map((item) => ({
              key: item.slug,
              label: item.name,
              href: companiesHref(kind, item.slug),
              active: item.slug === region,
            })),
          ]}
        />
      </div>
      <div className="mt-6">
        <Suspense
          key={`${kind ?? ""}-${region ?? ""}`}
          fallback={<TourGridSkeleton />}
        >
          <CompanyResults locale={locale} kind={kind} region={region} />
        </Suspense>
      </div>
    </CatalogPage>
  );
}
