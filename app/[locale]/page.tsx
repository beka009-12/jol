import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BusinessBand } from "@/components/home/business-band";
import { CatalogTiles } from "@/components/home/catalog-tiles";
import { GuideBand } from "@/components/home/guide-band";
import { Hero } from "@/components/home/hero";
import {
  HomeCompanies,
  HomeFood,
  HomeStays,
  HomeTours,
} from "@/components/home/listing-sections";
import { CountryMap } from "@/components/home/country-map";
import { Section } from "@/components/section";
import { TourRowSkeleton } from "@/components/skeletons";
import { routing } from "@/i18n/routing";
import { currentMonth } from "@/lib/format";

export const revalidate = 60;

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

type MonthKey = `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`;

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const tMonths = await getTranslations("MonthsIn");

  const month = currentMonth();

  return (
    <>
      <Hero />
      <CatalogTiles locale={locale} />

      <div className="mt-12 lg:mt-12">
        <Suspense fallback={<div aria-hidden className="min-h-[40rem] bg-deep" />}>
          <CountryMap locale={locale} />
        </Suspense>
      </div>

      <Section
        id="home-tours"
        title={t("toursTitle", { month: tMonths(String(month) as MonthKey) })}
        seeAllHref={{ pathname: "/tours", query: { month } }}
        seeAllLabel={t("allTours")}
      >
        <Suspense fallback={<TourRowSkeleton />}>
          <HomeTours />
        </Suspense>
      </Section>

      <Section
        id="home-stays"
        title={t("staysTitle")}
        description={t("staysBody")}
        seeAllHref="/hotels"
        seeAllLabel={t("allStays")}
        className="bg-surface"
      >
        <Suspense fallback={<TourRowSkeleton />}>
          <HomeStays />
        </Suspense>
      </Section>

      <Section
        id="home-food"
        title={t("foodTitle")}
        description={t("foodBody")}
        seeAllHref="/restaurants"
        seeAllLabel={t("allFood")}
      >
        <Suspense fallback={<TourRowSkeleton />}>
          <HomeFood />
        </Suspense>
      </Section>

      <Section
        id="home-companies"
        title={t("companiesTitle")}
        description={t("companiesBody")}
        seeAllHref="/companies"
        seeAllLabel={t("allCompanies")}
        className="bg-surface"
      >
        <Suspense fallback={<TourRowSkeleton />}>
          <HomeCompanies />
        </Suspense>
      </Section>

      <GuideBand />
      <BusinessBand />
    </>
  );
}
