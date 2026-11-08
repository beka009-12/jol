import type { Metadata } from "next";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CompanyList } from "@/components/business-cards";
import { CatalogFilters, CatalogPage } from "@/components/catalog-tabs";
import { ChipRow } from "@/components/chip";
import { EmptyState } from "@/components/empty-state";
import { CompanyListSkeleton } from "@/components/skeletons";
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
      <CompanyList companies={items} headingLevel="h2" />
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
    <CatalogPage active="companies" title={t("title")} lede={t("lede")}>
      <CatalogFilters>
        <ChipRow
          showLabel
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
          showLabel
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
      </CatalogFilters>
      <div className="mt-6">
        <Suspense
          key={`${kind ?? ""}-${region ?? ""}`}
          fallback={<CompanyListSkeleton />}
        >
          <CompanyResults locale={locale} kind={kind} region={region} />
        </Suspense>
      </div>
    </CatalogPage>
  );
}
