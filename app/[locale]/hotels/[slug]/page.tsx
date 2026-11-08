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
  MessageCircle,
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
  AddressLine,
  ContactActions,
  ContactCard,
  DetailCard,
  DetailGallery,
  DetailSection,
  DetailTitle,
  mapSearchHref,
} from "@/components/detail-parts";
import { type Fact, FactGrid } from "@/components/fact-grid";
import { NearbyListings } from "@/components/nearby-listings";
import { PriceLine } from "@/components/price";
import { StickyCta } from "@/components/sticky-cta";
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

  const whatsappTo = (text: string) =>
    `https://wa.me/${hotel.whatsapp}?text=${encodeURIComponent(text)}`;
  const whatsappHref = whatsappTo(t("whatsappMessage", { name: hotel.name }));
  const mapHref = mapSearchHref(hotel.name, hotel.address);

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
          <DetailTitle
            kind={tTypes(hotel.type)}
            title={hotel.name}
            place={hotel.place}
            region={hotel.region}
            rating={hotel.rating}
            verified={hotel.verified}
          />

          <div className="mt-4 lg:hidden">{summary}</div>

          <DetailSection id="about" title={t("aboutTitle")} className="mt-12">
            <p className="max-w-[65ch] text-pretty">{hotel.description}</p>
          </DetailSection>

          {/* Each room asks the hosts about itself, so the message already says which one. */}
          <DetailSection id="rooms" title={t("roomsTitle")} className="mt-12">
            <ul className="divide-y overflow-hidden rounded-2xl border">
              {hotel.rooms.map((room) => (
                <li key={room.name}>
                  <a
                    href={whatsappTo(t("roomMessage", { name: hotel.name, room: room.name }))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 p-4 transition-colors duration-150 hover:bg-surface focus-visible:-outline-offset-2"
                  >
                    <span className="min-w-0 flex-1">
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
                    <MessageCircle
                      className="size-5 shrink-0 text-muted-foreground transition-colors duration-150 group-hover:text-foreground"
                      aria-hidden
                    />
                    <span className="sr-only">{t("askRoom")}</span>
                  </a>
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection id="amenities" title={t("amenitiesTitle")} className="mt-12">
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

          <DetailSection id="hours" title={tHours("title")} className="mt-12">
            <DetailCard>
              <FactGrid facts={facts} />
              <CrowdChart visitors={hotel.crowd_by_month} openMonths={hotel.months} />
            </DetailCard>
          </DetailSection>

          <section aria-label={t("addressTitle")} className="mt-12 lg:hidden">
            <AddressLine address={hotel.address} mapHref={mapHref} />
            <p className="mt-3 text-sm text-pretty text-muted-foreground">{t("contactHint")}</p>
          </section>
        </div>

        <ContactCard
          summary={summary}
          whatsappHref={whatsappHref}
          phone={hotel.phone}
          hint={t("contactHint")}
          address={hotel.address}
          mapHref={mapHref}
        />
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
