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
import { CompanyMonogram, KIND_ICONS } from "@/components/business-cards";
import { ContactActions, ContactCard, DetailSection } from "@/components/detail-parts";
import type { Fact } from "@/components/fact-grid";
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
    <DetailSection id="company-tours" title={t("toursTitle")} className="mt-12">
      <ul className="grid gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 xl:grid-cols-3">
        {tours.items.map((tour) => (
          <li key={tour.slug}>
            <TourCard
              tour={tour}
              sizes="(min-width: 1280px) 240px, (min-width: 640px) 50vw, 112px"
              compactOnPhone
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

  const KindIcon = KIND_ICONS[company.kind];

  return (
    <article className="pb-12">
      {/* A company has people, not a photo: it gets the dark band and its mark instead. */}
      <header className="bg-deep text-on-deep [--muted-foreground:var(--on-deep-muted)] [--ring:var(--on-deep)] [--verified:var(--on-deep-verified)]">
        <div className="page-width pt-[calc(env(safe-area-inset-top)+--spacing(3))] pb-8 lg:pt-8 lg:pb-12">
          <BackLink href="/companies" />
          <div className="mt-6 flex items-start gap-4 lg:gap-6">
            <CompanyMonogram name={company.name} large onDark />
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <KindIcon className="size-4" aria-hidden />
                {tKinds(company.kind)}
              </p>
              <h1 className="mt-1 font-display text-display-lg font-extrabold text-balance">
                {company.name}
              </h1>
              {(company.rating || company.verified) && (
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {company.rating && <RatingMark rating={company.rating} showCount />}
                  {company.verified && <VerifiedMark withLabel />}
                </p>
              )}
            </div>
          </div>
          <p className="mt-6 max-w-[56ch] text-lg text-pretty">{company.tagline}</p>
          <dl className="mt-8 grid gap-4 border-t border-white/15 pt-6 sm:grid-cols-3 sm:gap-6">
            {facts.map(({ icon: Icon, term, value }) => (
              <div key={term} className="min-w-0">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {term}
                </dt>
                <dd className="mt-1 font-medium text-pretty first-letter:uppercase">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="page-width mt-12 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-12">
        <div className="min-w-0">
          <DetailSection id="about" title={t("aboutTitle")} className="mt-0">
            <p className="max-w-[65ch] text-pretty">{company.description}</p>
            <p className="mt-3 text-sm text-pretty text-muted-foreground lg:hidden">
              {t("contactHint")}
            </p>
          </DetailSection>

          <Suspense fallback={<TourGridSkeleton />}>
            <CompanyTours locale={locale} slug={company.slug} />
          </Suspense>
        </div>

        <ContactCard
          summary={<p className="font-semibold">{t("contactTitle")}</p>}
          whatsappHref={whatsappHref}
          phone={company.phone}
          hint={t("contactHint")}
        />
      </div>

      <StickyCta>
        <ContactActions whatsappHref={whatsappHref} phone={company.phone} />
      </StickyCta>
    </article>
  );
}
