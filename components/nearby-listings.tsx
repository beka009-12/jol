import { getTranslations } from "next-intl/server";
import { HotelCard, RestaurantCard } from "@/components/business-cards";
import { TourCard } from "@/components/tour-card";
import { settle } from "@/lib/api/errors";
import { getHotels, getRestaurants, getTours } from "@/lib/api/server";
import type { Locale } from "@/lib/types";

const GRID = "grid gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-4";
const SIZES = "(min-width: 1024px) 300px, (min-width: 640px) 50vw, 112px";

interface NearbyListingsProps {
  locale: Locale;
  place: { slug: string; name: string };
  /** The listing this page is about, so it doesn't recommend itself. */
  excludeSlug?: string;
}

/* What else is at this place: the reason to keep all of it in one system. */
export async function NearbyListings({
  locale,
  place,
  excludeSlug,
}: NearbyListingsProps) {
  const t = await getTranslations("Common");
  const tNav = await getTranslations("Nav");

  const [tours, hotels, restaurants] = await Promise.all([
    settle(getTours(locale, { place: place.slug, limit: 5 })),
    settle(getHotels(locale, { place: place.slug, limit: 5 })),
    settle(getRestaurants(locale, { place: place.slug, limit: 5 })),
  ]);

  const nearbyTours = (tours?.items ?? []).filter((item) => item.slug !== excludeSlug);
  const nearbyHotels = (hotels?.items ?? []).filter((item) => item.slug !== excludeSlug);
  const nearbyFood = (restaurants?.items ?? []).filter((item) => item.slug !== excludeSlug);

  if (nearbyTours.length + nearbyHotels.length + nearbyFood.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="nearby" className="border-t bg-surface py-12 lg:py-12">
      <div className="page-width">
        <h2 id="nearby" className="font-display text-display-md font-extrabold">
          {t("nearby", { place: place.name })}
        </h2>

        {nearbyTours.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 font-semibold">{tNav("tours")}</h3>
            <ul className={GRID}>
              {nearbyTours.slice(0, 4).map((tour) => (
                <li key={tour.slug}>
                  <TourCard tour={tour} sizes={SIZES} compactOnPhone />
                </li>
              ))}
            </ul>
          </div>
        )}

        {nearbyHotels.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 font-semibold">{tNav("stays")}</h3>
            <ul className={GRID}>
              {nearbyHotels.slice(0, 4).map((hotel) => (
                <li key={hotel.slug}>
                  <HotelCard hotel={hotel} sizes={SIZES} compactOnPhone />
                </li>
              ))}
            </ul>
          </div>
        )}

        {nearbyFood.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 font-semibold">{tNav("food")}</h3>
            <ul className={GRID}>
              {nearbyFood.slice(0, 4).map((restaurant) => (
                <li key={restaurant.slug}>
                  <RestaurantCard restaurant={restaurant} sizes={SIZES} compactOnPhone />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
