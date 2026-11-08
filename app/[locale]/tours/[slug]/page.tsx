import type { Metadata } from "next";
import { Suspense } from "react";
import {
  CalendarCheck,
  CalendarRange,
  Check,
  Clock,
  Gauge,
  MessageCircle,
  Users,
  X,
} from "lucide-react";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { AvailabilityBadge } from "@/components/availability-badge";
import { BackLink } from "@/components/back-link";
import { CategoryIcon } from "@/components/category-icon";
import { CrowdChart } from "@/components/crowd-chart";
import { DetailCard } from "@/components/detail-parts";
import { type Fact, FactGrid } from "@/components/fact-grid";
import { NearbyListings } from "@/components/nearby-listings";
import { Photo } from "@/components/photo";
import { Price } from "@/components/price";
import { StickyCta } from "@/components/sticky-cta";
import {
  DepartureButton,
  RequestButton,
  TourBookingProvider,
} from "@/components/tour/tour-booking";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { clientMessages } from "@/lib/client-messages";
import { getTour } from "@/lib/api/server";
import { formatDate, formatSeason } from "@/lib/format";
import type { TourDetail } from "@/lib/types";

export const revalidate = 60;

interface TourPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: TourPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const tour = await getTour(locale, slug);
  if (!tour) return {};
  return {
    title: tour.title,
    description: tour.description,
    openGraph: { images: [tour.photo.url] },
  };
}

interface ActionsProps {
  tour: TourDetail;
  whatsappHref: string;
  stacked?: boolean;
}

async function TourActions({ tour, whatsappHref, stacked }: ActionsProps) {
  const t = await getTranslations("Tour");
  const bookable =
    tour.availability === "open" || tour.availability === "opens_soon";

  const primaryClass = stacked ? "w-full" : "min-w-0 flex-1";
  const whatsappButton = buttonVariants({
    variant: "secondary",
    size: "lg",
  });

  return (
    <>
      {bookable ? (
        <RequestButton className={primaryClass} />
      ) : (
        <Link
          href={{
            pathname: "/tours",
            query:
              tour.availability === "sold_out"
                ? { category: tour.category }
                : {},
          }}
          className={`${buttonVariants({ size: "lg" })} ${primaryClass}`}
        >
          {tour.availability === "sold_out"
            ? t("soldOutCta")
            : t("closedCta")}
        </Link>
      )}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`${whatsappButton} ${stacked ? "w-full" : ""}`}
      >
        <MessageCircle aria-hidden />
        {t("whatsapp")}
      </a>
    </>
  );
}

export default async function TourPage({ params }: TourPageProps) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const tour = await getTour(locale, slug);
  if (!tour) notFound();

  const t = await getTranslations("Tour");
  const tTours = await getTranslations("Tours");
  const tCategories = await getTranslations("Categories");
  const tDifficulty = await getTranslations("Difficulty");
  const tHours = await getTranslations("Hours");
  const format = await getFormatter();
  const messages = await clientMessages("Tour", "Request", "Price", "Auth");

  const bookable =
    tour.availability === "open" || tour.availability === "opens_soon";
  const whatsappHref = `https://wa.me/${tour.operator.whatsapp}?text=${encodeURIComponent(
    t("whatsappMessage", { title: tour.title }),
  )}`;
  const [cover, ...morePhotos] = tour.photos;
  const [nextDeparture] = tour.next_departures;

  const whenFacts: Fact[] = [
    {
      icon: CalendarRange,
      term: tHours("season"),
      value: formatSeason(tour.months, locale, tHours("allYear")),
    },
    ...(bookable && nextDeparture
      ? [
          {
            icon: CalendarCheck,
            term: t("nextDeparture"),
            value: formatDate(nextDeparture.date, locale),
          },
        ]
      : []),
  ];

  const facts = [
    { icon: Clock, label: tTours("days", { count: tour.duration_days }) },
    { icon: Gauge, label: tDifficulty(tour.difficulty) },
    {
      icon: Users,
      label: t("group", {
        min: format.number(tour.group_min),
        max: format.number(tour.group_max),
      }),
    },
  ];

  return (
    <NextIntlClientProvider messages={messages}>
      <TourBookingProvider
        tour={{
          slug: tour.slug,
          title: tour.title,
          groupMax: tour.group_max,
          operator: tour.operator,
          departures: tour.next_departures,
        }}
      >
        <article>
          <div className="relative lg:page-width lg:pt-6">
            <Photo
              photo={cover}
              sizes="(min-width: 1248px) 1152px, 100vw"
              aspect="header"
              preload
              className="lg:aspect-[21/9] lg:rounded-2xl"
            />
            <BackLink
              href="/tours"
              className="absolute top-[calc(env(safe-area-inset-top)+0.75rem)] left-4 lg:top-9 lg:left-9"
            />
          </div>

          <div className="page-width mt-4 pb-12 lg:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-12 lg:pb-12">
            <div className="min-w-0">
              <p className="mb-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <CategoryIcon category={tour.category} className="size-4" />
                {tCategories(tour.category)}
              </p>
              <h1 className="font-display text-display-md font-extrabold text-balance">
                {tour.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                <Link
                  href={`/places/${tour.place.slug}`}
                  className="underline underline-offset-4 transition-colors duration-150 hover:text-foreground"
                >
                  {tour.place.name}
                </Link>
                {`, ${tour.region.name}`}
              </p>

              <div className="mt-3 lg:hidden">
                <Price amount={tour.price_from} className="text-base" />
                <AvailabilityBadge
                  availability={tour.availability}
                  opensOn={tour.opens_on}
                  className="mt-2"
                />
              </div>

              <ul className="mt-4 flex flex-wrap gap-2">
                {facts.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-secondary px-3 text-sm"
                  >
                    <Icon className="size-4 text-muted-foreground" aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>

              {tour.availability === "sold_out" && (
                <p className="mt-4 rounded-xl bg-closed-soft p-4 text-sm text-closed">
                  {t("soldOutNote")}
                </p>
              )}
              {tour.availability === "closed" && tour.opens_on && (
                <p className="mt-4 rounded-xl bg-closed-soft p-4 text-sm text-closed">
                  {t("closedNote", { date: formatDate(tour.opens_on, locale) })}
                </p>
              )}

              <section aria-labelledby="seasons" className="mt-8">
                <h2 id="seasons" className="mb-3 text-lg font-bold">
                  {t("seasonsTitle")}
                </h2>
                <DetailCard>
                  <FactGrid facts={whenFacts} />
                  <CrowdChart
                    visitors={tour.crowd_by_month}
                    openMonths={tour.months}
                  />
                </DetailCard>
                <ul className="mt-3 divide-y">
                  {tour.seasons.map((season) => (
                    <li key={season.name} className="py-3">
                      <p className="flex items-baseline justify-between gap-4">
                        <span className="font-medium">{season.name}</span>
                        {season.months.length < 12 && (
                          <span className="text-xs text-muted-foreground first-letter:uppercase">
                            {formatSeason(
                              season.months,
                              locale,
                              tHours("allYear"),
                              "short",
                            )}
                          </span>
                        )}
                      </p>
                      <Price amount={season.price_from} className="mt-1" />
                    </li>
                  ))}
                </ul>
              </section>

              {bookable && (
                <section aria-labelledby="departures" className="mt-8">
                  <h2 id="departures" className="mb-3 text-lg font-bold">
                    {t("departuresTitle")}
                  </h2>
                  {tour.next_departures.length > 0 ? (
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {tour.next_departures.map((departure) => (
                        <li key={departure.date}>
                          <DepartureButton departure={departure} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded-xl bg-secondary p-4 text-sm text-muted-foreground">
                      {t("departuresEmpty")}
                    </p>
                  )}
                </section>
              )}

              <section aria-labelledby="about" className="mt-8">
                <h2 id="about" className="mb-2 text-lg font-bold">
                  {t("aboutTitle")}
                </h2>
                <p className="max-w-[65ch]">{tour.description}</p>
                {morePhotos.length > 0 && (
                  <ul
                    aria-label={t("photoGallery")}
                    className="no-scrollbar -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 lg:mx-0 lg:px-0"
                  >
                    {morePhotos.map((item) => (
                      <li key={item.url} className="w-[272px] shrink-0">
                        <Photo
                          photo={item}
                          sizes="272px"
                          className="rounded-2xl"
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                <section aria-labelledby="included">
                  <h2 id="included" className="mb-2 text-lg font-bold">
                    {t("includedTitle")}
                  </h2>
                  <ul className="space-y-2">
                    {tour.included.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check
                          className="mt-1 size-5 shrink-0 text-open"
                          aria-hidden
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
                <section aria-labelledby="excluded">
                  <h2 id="excluded" className="mb-2 text-lg font-bold">
                    {t("excludedTitle")}
                  </h2>
                  <ul className="space-y-2">
                    {tour.excluded.map((item) => (
                      <li key={item} className="flex gap-2">
                        <X
                          className="mt-1 size-5 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <section aria-labelledby="operator" className="mt-8">
                <h2 id="operator" className="mb-2 text-lg font-bold">
                  {t("operatorTitle")}
                </h2>
                <Link
                  href={`/companies/${tour.operator.slug}`}
                  className="font-medium underline underline-offset-4 transition-colors duration-150 hover:text-primary"
                >
                  {tour.operator.name}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("operatorHint")}
                </p>
              </section>
            </div>

            <aside className="sticky top-[calc(var(--header-height)+1.5rem)] hidden rounded-2xl border bg-card p-6 lg:block">
              <Price amount={tour.price_from} className="text-base" />
              <AvailabilityBadge
                availability={tour.availability}
                opensOn={tour.opens_on}
                className="mt-2"
              />
              <div className="mt-6 grid gap-2">
                <TourActions tour={tour} whatsappHref={whatsappHref} stacked />
              </div>
            </aside>
          </div>

          <Suspense>
            <NearbyListings
              locale={locale}
              place={tour.place}
              excludeSlug={tour.slug}
            />
          </Suspense>
        </article>

        <StickyCta>
          <TourActions tour={tour} whatsappHref={whatsappHref} />
        </StickyCta>
      </TourBookingProvider>
    </NextIntlClientProvider>
  );
}
