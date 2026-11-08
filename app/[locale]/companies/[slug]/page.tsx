import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarCheck, Languages, MapPin } from "lucide-react";
import { hasLocale } from "next-intl";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { CompanyMonogram } from "@/components/business-cards";
import {
  ContactActions,
  DetailAside,
  DetailCard,
  DetailSection,
} from "@/components/detail-parts";
import { type Fact, FactGrid } from "@/components/fact-grid";
import { RatingMark, VerifiedMark } from "@/components/rating";
import { TourGridSkeleton } from "@/components/skeletons";
import { StickyCta } from "@/components/sticky-cta";
import { TourCard } from "@/components/tour-card";
import { routing } from "@/i18n/routing";
import { getCompany, getTours } from "@/lib/api/server";
import type { Locale } from "@/lib/types";

export const revalidate = 60;

interface CompanyPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: CompanyPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const company = await getCompany(locale, slug);
  if (!company) return {};
  return { title: company.name, description: company.tagline };
}

interface CompanyToursProps {
  locale: Locale;
  slug: string;
}

async function CompanyTours({ locale, slug }: CompanyToursProps) {
  const t = await getTranslations("Company");
  const tours = await getTours(locale, { operator: slug });
  if (tours.items.length === 0) return null;

  return (
    <DetailSection id="company-tours" title={t("toursTitle")}>
      <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
        {tours.items.map((tour) => (
          <li key={tour.slug}>
            <TourCard
              tour={tour}
              sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            />
          </li>
        ))}
      </ul>
    </DetailSection>
  );
}

function languageName(code: string, locale: string): string {
  const name = new Intl.DisplayNames(locale, { type: "language" }).of(code);
  return name ?? code;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const company = await getCompany(locale, slug);
  if (!company) notFound();

  const t = await getTranslations("Company");
  const tKinds = await getTranslations("CompanyKinds");
  const format = await getFormatter();

  const whatsappHref = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(
    t("whatsappMessage"),
  )}`;

  const facts: Fact[] = [
    {
      icon: MapPin,
      term: t("regionsTitle"),
      value: format.list(company.regions.map((region) => region.name)),
    },
    {
      icon: Languages,
      term: t("languagesTitle"),
      value: format.list(
        company.languages.map((code) => languageName(code, locale)),
      ),
    },
    {
      icon: CalendarCheck,
      term: t("foundedTitle"),
      value: String(company.founded_year),
    },
  ];

  return (
    <article className="pb-12 lg:pb-12">
      <div className="page-width pt-[calc(env(safe-area-inset-top)+0.75rem)] lg:pt-8">
        <BackLink href="/companies" className="bg-secondary shadow-none" />
      </div>

      <div className="page-width mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-12">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <CompanyMonogram name={company.name} large />
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{tKinds(company.kind)}</p>
              <h1 className="mt-1 font-display text-display-md font-extrabold text-balance">
                {company.name}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                {company.rating && <RatingMark rating={company.rating} showCount />}
                {company.verified && <VerifiedMark withLabel />}
              </p>
            </div>
          </div>

          <DetailSection id="about" title={t("aboutTitle")}>
            <p className="max-w-[65ch] text-pretty">{company.description}</p>
          </DetailSection>

          <DetailCard className="mt-6">
            <FactGrid facts={facts} />
          </DetailCard>

          <Suspense fallback={<TourGridSkeleton compactOnPhone={false} />}>
            <CompanyTours locale={locale} slug={company.slug} />
          </Suspense>
        </div>

        <DetailAside>
          <p className="font-semibold">{t("contactTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("contactHint")}</p>
          <div className="mt-6 grid gap-2">
            <ContactActions
              whatsappHref={whatsappHref}
              phone={company.phone}
              stacked
            />
          </div>
        </DetailAside>
      </div>

      <StickyCta>
        <ContactActions whatsappHref={whatsappHref} phone={company.phone} />
      </StickyCta>
    </article>
  );
}
