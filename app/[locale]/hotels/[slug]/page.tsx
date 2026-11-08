import type { Metadata } from "next";
import { Suspense } from "react";
import {
  CalendarRange,
  CarFront,
  Coffee,
  ConciergeBell,
  Droplets,
  Flame,
  Footprints,
  Heater,
  LogIn,
  LogOut,
  type LucideIcon,
  SquareParking,
  Soup,
  Users,
  Waves,
  Wifi,
} from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AvailabilityBadge } from "@/components/availability-badge";
import { CrowdChart } from "@/components/crowd-chart";
import {
  ContactActions,
  DetailAside,
  DetailCard,
  DetailGallery,
  DetailSection,
} from "@/components/detail-parts";
import { type Fact, FactGrid } from "@/components/fact-grid";
import { NearbyListings } from "@/components/nearby-listings";
import { PriceLine } from "@/components/price";
import { RatingMark, VerifiedMark } from "@/components/rating";
import { StickyCta } from "@/components/sticky-cta";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getHotel } from "@/lib/api/server";
import { formatSeason, formatSom } from "@/lib/format";
import type { HotelAmenity } from "@/lib/types";

export const revalidate = 60;

interface HotelPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

const AMENITY_ICONS: Record<HotelAmenity, LucideIcon> = {
  wifi: Wifi,
  breakfast: Coffee,
  parking: SquareParking,
  heating: Heater,
  hot_water: Droplets,
  kitchen: Soup,
  transfer: CarFront,
  beach: Waves,
  horses: Footprints,
  sauna: Flame,
};

export async function generateMetadata({
  params,
}: HotelPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const hotel = await getHotel(locale, slug);
  if (!hotel) return {};
  return {
    title: hotel.name,
    description: hotel.description,
    openGraph: { images: [hotel.photo.url] },
  };
}

export default async function HotelPage({ params }: HotelPageProps) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const hotel = await getHotel(locale, slug);
  if (!hotel) notFound();

  const t = await getTranslations("Hotel");
  const tHotels = await getTranslations("Hotels");
  const tTypes = await getTranslations("HotelTypes");
  const tAmenities = await getTranslations("Amenities");
  const tHours = await getTranslations("Hours");

  const whatsappHref = `https://wa.me/${hotel.whatsapp}?text=${encodeURIComponent(
    t("whatsappMessage", { name: hotel.name }),
  )}`;

  // A guesthouse or a camp has hosts rather than a front desk.
  const hasHosts = hotel.type === "guesthouse" || hotel.type === "yurt_camp";
  const facts: Fact[] = [
    {
      icon: CalendarRange,
      term: tHours("season"),
      value: formatSeason(hotel.months, locale, tHours("allYear")),
    },
    {
      icon: LogIn,
      term: tHours("checkIn"),
      value: tHours("checkInValue", { time: hotel.check_in }),
    },
    {
      icon: LogOut,
      term: tHours("checkOut"),
      value: tHours("checkOutValue", { time: hotel.check_out }),
    },
    {
      icon: hasHosts ? Users : ConciergeBell,
      term: hasHosts ? tHours("hosts") : tHours("frontDesk"),
      value: hotel.front_desk
        ? `${hotel.front_desk.opens_at}–${hotel.front_desk.closes_at}`
        : tHours("roundTheClock"),
    },
  ];

  const summary = (
    <>
      <PriceLine
        main={tHotels("priceFrom", { som: formatSom(hotel.price_from, locale) })}
        note={tHotels("perNight")}
        className="text-base"
      />
      <AvailabilityBadge
        availability={hotel.availability}
        opensOn={hotel.opens_on}
        className="mt-2"
      />
    </>
  );

  return (
    <article>
      <DetailGallery photos={hotel.photos} backHref="/hotels" />

      <div className="page-width mt-6 pb-12 lg:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-12 lg:pb-12">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{tTypes(hotel.type)}</p>
          <h1 className="mt-1 font-display text-display-md font-extrabold text-balance">
            {hotel.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <Link
              href={`/places/${hotel.place.slug}`}
              className="underline underline-offset-4 transition-colors duration-150 hover:text-foreground"
            >
              {hotel.place.name}
            </Link>
            {`, ${hotel.region.name}`}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {hotel.rating && <RatingMark rating={hotel.rating} showCount />}
            {hotel.verified && <VerifiedMark withLabel />}
          </p>

          <div className="mt-4 lg:hidden">{summary}</div>

          <DetailSection id="about" title={t("aboutTitle")}>
            <p className="max-w-[65ch] text-pretty">{hotel.description}</p>
          </DetailSection>

          <DetailSection id="amenities" title={t("amenitiesTitle")}>
            <ul className="flex flex-wrap gap-2">
              {hotel.amenities.map((amenity) => {
                const Icon = AMENITY_ICONS[amenity];
                return (
                  <li
                    key={amenity}
                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-secondary px-3 text-sm"
                  >
                    <Icon className="size-4 text-muted-foreground" aria-hidden />
                    {tAmenities(amenity)}
                  </li>
                );
              })}
            </ul>
          </DetailSection>

          <DetailSection id="rooms" title={t("roomsTitle")}>
            <ul className="divide-y rounded-2xl border">
              {hotel.rooms.map((room) => (
                <li
                  key={room.name}
                  className="flex items-baseline justify-between gap-4 p-4"
                >
                  <span className="min-w-0">
                    <span className="block font-medium">{room.name}</span>
                    <span className="block text-sm text-muted-foreground">
                      {t("guests", { count: room.guests })}
                    </span>
                  </span>
                  <PriceLine
                    main={t("roomPrice", { som: formatSom(room.price, locale) })}
                    note={tHotels("perNight")}
                    className="shrink-0 text-right"
                  />
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection id="hours" title={tHours("title")}>
            <DetailCard>
              <FactGrid facts={facts} />
              <CrowdChart
                visitors={hotel.crowd_by_month}
                openMonths={hotel.months}
              />
            </DetailCard>
          </DetailSection>

          <DetailSection id="address" title={t("addressTitle")}>
            <p>{hotel.address}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("contactHint")}</p>
          </DetailSection>
        </div>

        <DetailAside>
          {summary}
          <div className="mt-6 grid gap-2">
            <ContactActions
              whatsappHref={whatsappHref}
              phone={hotel.phone}
              stacked
            />
          </div>
        </DetailAside>
      </div>

      <Suspense>
        <NearbyListings
          locale={locale}
          place={hotel.place}
          excludeSlug={hotel.slug}
        />
      </Suspense>

      <StickyCta>
        <ContactActions whatsappHref={whatsappHref} phone={hotel.phone} />
      </StickyCta>
    </article>
  );
}
