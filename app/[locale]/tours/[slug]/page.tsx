import type { Metadata } from "next";
import { Suspense } from "react";
import {
  CalendarCheck,
  CalendarClock,
  CalendarRange,
  Check,
  CircleAlert,
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
import { cn } from "cn";
import { AvailabilityBadge } from "@/components/availability-badge";
import { CategoryIcon } from "@/components/category-icon";
import { CrowdChart } from "@/components/crowd-chart";
import { DetailCard, DetailGallery, DetailSection } from "@/components/detail-parts";
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
import { formatDate, formatSeason, formatShortDate, monthName } from "@/lib/format";
import type { Departure, Locale, TourDetail } from "@/lib/types";

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

/* Enough dates to pick from on the page; the request sheet has the rest. */
const DEPARTURES_SHOWN = 6;

type MonthKey = `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`;

interface BookingState {
  /** First date that still has seats, in season or not. */
  firstDeparture: Departure | undefined;
  /**
   * request: dates are open, in season or ahead of it.
   * ask: out of season with no dates yet, so the operator is asked about the month.
   * similar: sold out. browse: closed, with nothing known about the next season.
   */
  mode: "request" | "ask" | "similar" | "browse";
  /** The main button's words. */
  label: string;
  whatsappHref: string;
}

async function bookingState(tour: TourDetail, locale: Locale): Promise<BookingState> {
  const t = await getTranslations({ locale, namespace: "Tour" });
  const tMonthsIn = await getTranslations({ locale, namespace: "MonthsIn" });
  const firstDeparture = tour.next_departures.find((departure) => departure.seats_left > 0);
  const inSeason = tour.availability === "open";
  const seasonMonth = Number(
    (firstDeparture?.date ?? tour.opens_on ?? "").slice(5, 7),
  );
  const month = seasonMonth ? monthName(seasonMonth, locale) : null;

  const whatsapp = (text: string) =>
    `https://wa.me/${tour.operator.whatsapp}?text=${encodeURIComponent(text)}`;
  const whatsappHref = whatsapp(t("whatsappMessage", { title: tour.title }));

  if (tour.availability === "sold_out") {
    return { firstDeparture, mode: "similar", label: t("soldOutCta"), whatsappHref };
  }
  // Out of season the button names the month, so planning ahead doesn't look like a dead end.
  if (inSeason || firstDeparture) {
    const label =
      !inSeason && month ? t("requestForMonth", { month }) : t("requestCta");
    return { firstDeparture, mode: "request", label, whatsappHref };
  }
  if (month) {
    return {
      firstDeparture,
      mode: "ask",
      label: t("askAboutMonth", { month }),
      whatsappHref: whatsapp(
        t("whatsappMonthMessage", {
          title: tour.title,
          monthIn: tMonthsIn(String(seasonMonth) as MonthKey),
        }),
      ),
    };
  }
  return { firstDeparture, mode: "browse", label: t("closedCta"), whatsappHref };
}

interface ActionsProps {
  tour: TourDetail;
  booking: BookingState;
  /** The phone's bottom bar: WhatsApp shrinks to an icon so a long label still fits. */
  compact?: boolean;
}

async function TourActions({ tour, booking, compact = false }: ActionsProps) {
  const t = await getTranslations("Tour");
  const primaryClass = compact ? "min-w-0 flex-1 px-4" : "w-full";
  const listHref = {
    pathname: "/tours",
    query: booking.mode === "similar" ? { category: tour.category } : {},
  };

  if (booking.mode === "ask") {
    // WhatsApp is the main action here; the catalog is the way out.
    return (
      <>
        <a
          href={booking.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ size: "lg" }), primaryClass)}
        >
          <MessageCircle aria-hidden />
          {booking.label}
        </a>
        {!compact && (
          <Link
            href={listHref}
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "w-full")}
          >
            {t("closedCta")}
          </Link>
        )}
      </>
    );
  }

  return (
    <>
      {booking.mode === "request" ? (
        <RequestButton label={booking.label} className={primaryClass} />
      ) : (
        <Link href={listHref} className={cn(buttonVariants({ size: "lg" }), primaryClass)}>
          {booking.label}
        </Link>
      )}
      <a
        href={booking.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={compact ? t("whatsapp") : undefined}
        className={cn(
          buttonVariants({ variant: "secondary", size: compact ? "icon" : "lg" }),
          compact ? "size-12 shrink-0" : "w-full",
        )}
      >
        <MessageCircle aria-hidden />
        {!compact && t("whatsapp")}
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
  const tRequest = await getTranslations("Request");
  const tTours = await getTranslations("Tours");
  const tCategories = await getTranslations("Categories");
  const tDifficulty = await getTranslations("Difficulty");
  const tHours = await getTranslations("Hours");
  const format = await getFormatter();
  const messages = await clientMessages("Tour", "Request", "Price", "Auth");

  const booking = await bookingState(tour, locale);
  const { firstDeparture } = booking;
  const requestable = booking.mode === "request";
  const inSeason = tour.availability === "open";
  // The gallery shows the second photo beside the cover on a large screen only.
  const [, ...morePhotos] = tour.photos;

  const whenFacts: Fact[] = [
    {
      icon: CalendarRange,
      term: tHours("season"),
      value: formatSeason(tour.months, locale, tHours("allYear")),
    },
    ...(requestable && firstDeparture
      ? [
          {
            icon: CalendarCheck,
            term: t("nextDeparture"),
            value: formatDate(firstDeparture.date, locale),
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

  const statusNote =
    tour.availability === "sold_out"
      ? { tone: "closed", icon: CircleAlert, text: t("soldOutNote") }
      : !inSeason && requestable && tour.opens_on
        ? {
            tone: "soon",
            icon: CalendarClock,
            text: t("plannedNote", { date: formatDate(tour.opens_on, locale) }),
          }
        : !inSeason && !requestable && tour.opens_on
          ? {
              tone: "closed",
              icon: CalendarClock,
              text: t("closedNote", { date: formatDate(tour.opens_on, locale) }),
            }
          : null;

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
          <DetailGallery photos={tour.photos} backHref="/tours" />

          <div className="page-width mt-6 pb-12 lg:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-12">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <CategoryIcon category={tour.category} className="size-4" />
                {tCategories(tour.category)}
              </p>
              <h1 className="mt-1 font-display text-display-lg font-extrabold text-balance">
                {tour.title}
              </h1>
              <p className="mt-1 text-muted-foreground">
                <Link
                  href={`/places/${tour.place.slug}`}
                  className="underline decoration-foreground/30 underline-offset-4 transition-colors duration-150 hover:text-foreground hover:decoration-foreground"
                >
                  {tour.place.name}
                </Link>
                {`, ${tour.region.name}`}
              </p>

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

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 lg:hidden">
                <Price amount={tour.price_from} className="text-base" />
                <AvailabilityBadge availability={tour.availability} opensOn={tour.opens_on} />
              </div>

              {statusNote && (
                <p
                  className={cn(
                    "mt-6 flex gap-3 rounded-xl p-4 text-sm text-pretty",
                    statusNote.tone === "soon"
                      ? "bg-soon-soft text-soon"
                      : "bg-closed-soft text-closed",
                  )}
                >
                  <statusNote.icon className="size-5 shrink-0" aria-hidden />
                  {statusNote.text}
                </p>
              )}

              {requestable && (
                <DetailSection
                  id="departures"
                  title={inSeason ? t("departuresTitle") : t("firstDeparturesTitle")}
                  className="mt-12"
                >
                  {tour.next_departures.length > 0 ? (
                    <>
                      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {tour.next_departures.slice(0, DEPARTURES_SHOWN).map((departure) => (
                          <li key={departure.date}>
                            <DepartureButton departure={departure} />
                          </li>
                        ))}
                      </ul>
                      {tour.next_departures.length > DEPARTURES_SHOWN && (
                        <RequestButton
                          label={t("allDates")}
                          variant="outline"
                          className="mt-3 w-full sm:w-auto"
                        />
                      )}
                    </>
                  ) : (
                    <p className="rounded-xl bg-secondary p-4 text-sm text-muted-foreground">
                      {t("departuresEmpty")}
                    </p>
                  )}
                </DetailSection>
              )}

              <DetailSection id="about" title={t("aboutTitle")} className="mt-12">
                <p className="max-w-[65ch] text-pretty">{tour.description}</p>
                {morePhotos.length > 0 && (
                  <ul
                    aria-label={t("photoGallery")}
                    className="no-scrollbar -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 lg:mx-0 lg:px-0"
                  >
                    {morePhotos.map((item, index) => (
                      <li
                        key={item.url}
                        className={cn("w-[272px] shrink-0", index === 0 && "lg:hidden")}
                      >
                        <Photo photo={item} sizes="272px" className="rounded-2xl" />
                      </li>
                    ))}
                  </ul>
                )}
              </DetailSection>

              <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-6">
                <section aria-labelledby="included">
                  <h2 id="included" className="mb-3 text-lg font-bold">
                    {t("includedTitle")}
                  </h2>
                  <ul className="space-y-2">
                    {tour.included.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check className="size-5 shrink-0 text-open" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
                <section aria-labelledby="excluded">
                  <h2 id="excluded" className="mb-3 text-lg font-bold">
                    {t("excludedTitle")}
                  </h2>
                  <ul className="space-y-2">
                    {tour.excluded.map((item) => (
                      <li key={item} className="flex gap-2">
                        <X className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <DetailSection id="seasons" title={t("seasonsTitle")} className="mt-12">
                <DetailCard>
                  <FactGrid facts={whenFacts} />
                  <CrowdChart visitors={tour.crowd_by_month} openMonths={tour.months} />
                </DetailCard>
                <ul className="mt-3 divide-y">
                  {tour.seasons.map((season) => (
                    <li key={season.name} className="py-3">
                      <p className="flex items-baseline justify-between gap-4">
                        <span className="font-medium">{season.name}</span>
                        {season.months.length < 12 && (
                          <span className="text-xs text-muted-foreground first-letter:uppercase">
                            {formatSeason(season.months, locale, tHours("allYear"), "short")}
                          </span>
                        )}
                      </p>
                      <Price amount={season.price_from} className="mt-1" />
                    </li>
                  ))}
                </ul>
              </DetailSection>

              <DetailSection id="operator" title={t("operatorTitle")} className="mt-12 lg:hidden">
                <Link
                  href={`/companies/${tour.operator.slug}`}
                  className="font-medium underline underline-offset-4 transition-colors duration-150 hover:text-primary"
                >
                  {tour.operator.name}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">{t("operatorHint")}</p>
              </DetailSection>
            </div>

            {/* Price, the next date and the request: the decision in one card that follows the scroll. */}
            <aside className="sticky top-[calc(var(--header-height)+--spacing(6))] hidden rounded-2xl border bg-card p-6 lg:block">
              <Price amount={tour.price_from} className="text-base" />
              <AvailabilityBadge
                availability={tour.availability}
                opensOn={tour.opens_on}
                className="mt-2"
              />
              {requestable && firstDeparture && (
                <dl className="mt-4 border-t pt-4">
                  <dt className="text-sm text-muted-foreground">{t("nextDeparture")}</dt>
                  <dd className="mt-1 flex items-baseline justify-between gap-3">
                    <span className="font-semibold first-letter:uppercase">
                      {formatShortDate(firstDeparture.date, locale)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {t("seatsLeft", { count: firstDeparture.seats_left })}
                    </span>
                  </dd>
                </dl>
              )}
              <div className="mt-6 grid gap-2">
                <TourActions tour={tour} booking={booking} />
              </div>
              {requestable && (
                <p className="mt-3 text-xs text-pretty text-muted-foreground">
                  {tRequest("description")}
                </p>
              )}
              <p className="mt-4 border-t pt-4 text-sm">
                <span className="text-muted-foreground">{t("operatorLine")}: </span>
                <Link
                  href={`/companies/${tour.operator.slug}`}
                  className="font-medium underline underline-offset-4 transition-colors duration-150 hover:text-primary"
                >
                  {tour.operator.name}
                </Link>
              </p>
            </aside>
          </div>

          <Suspense>
            <NearbyListings locale={locale} place={tour.place} excludeSlug={tour.slug} />
          </Suspense>
        </article>

        <StickyCta>
          <TourActions tour={tour} booking={booking} compact />
        </StickyCta>
      </TourBookingProvider>
    </NextIntlClientProvider>
  );
}
