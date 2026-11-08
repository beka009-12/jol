import type { ComponentProps } from "react";
import { getTranslations } from "next-intl/server";
import { cn } from "cn";
import { initials } from "@/components/business-cards";
import { Photo } from "@/components/photo";
import { Link } from "@/i18n/navigation";
import { getCatalogIndex } from "@/lib/api/catalog-index";
import { photo, type PhotoKey } from "@/lib/mocks/photos";
import type { Locale } from "@/lib/types";

type PhotoSection = "tours" | "hotels" | "restaurants" | "places";

interface PhotoTile {
  key: PhotoSection;
  href: ComponentProps<typeof Link>["href"];
  label: "tours" | "stays" | "food" | "places";
  cover: PhotoKey;
  sizes: string;
}

/*
  A real photo of what each section holds. The photos are decorative (empty
  alt): the words on the tile already say where the link goes.
*/
const PHOTO_TILES: PhotoTile[] = [
  { key: "tours", href: "/tours", label: "tours", cover: "horse-valley", sizes: "(min-width: 1024px) 50vw, 100vw" },
  { key: "hotels", href: "/hotels", label: "stays", cover: "yurt-interior", sizes: "(min-width: 1024px) 25vw, 50vw" },
  { key: "restaurants", href: "/restaurants", label: "food", cover: "bazaar-bread", sizes: "(min-width: 1024px) 25vw, 50vw" },
  { key: "places", href: "/places", label: "places", cover: "kol-suu", sizes: "(min-width: 1024px) 25vw, 50vw" },
];

const TILE =
  "group relative isolate flex h-full flex-col overflow-hidden rounded-2xl p-4 lg:p-6";

/*
  The index of the system. Tours, the main job, get the big tile; companies are
  people rather than places, so they get the dark band and their own marks.
*/
export async function CatalogTiles({ locale }: { locale: Locale }) {
  const t = await getTranslations("Home");
  const tNav = await getTranslations("Nav");
  const tHotels = await getTranslations("Hotels");
  const { tours, hotels, restaurants, companies, places } =
    await getCatalogIndex(locale);

  const captions: Record<PhotoSection | "companies", string | null> = {
    tours: tours && t("countTours", { count: tours.total }),
    hotels: hotels && tHotels("count", { count: hotels.total }),
    restaurants: restaurants && t("countFood", { count: restaurants.total }),
    companies: companies && t("countCompanies", { count: companies.total }),
    places: places && t("countPlaces", { count: places.total }),
  };

  return (
    <nav aria-label={tNav("catalogLabel")} className="page-width mt-6 lg:mt-8">
      <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:grid-rows-[repeat(2,11rem)] lg:gap-4">
        {PHOTO_TILES.map((tile) => {
          const main = tile.key === "tours";
          return (
            <li
              key={tile.key}
              className={main ? "col-span-2 h-44 lg:row-span-2 lg:h-auto" : "h-32 lg:h-auto"}
            >
              <Link href={tile.href} className={cn(TILE, "justify-end bg-deep text-white")}>
                <div className="absolute inset-0 -z-10">
                  <Photo
                    photo={photo(tile.cover, "")}
                    sizes={tile.sizes}
                    aspect="none"
                    interactive
                    className="h-full"
                  />
                </div>
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-linear-to-t from-black/75 via-black/25 via-55% to-transparent"
                />
                <span
                  className={cn(
                    "font-display font-extrabold",
                    main ? "text-display-md" : "text-display-sm",
                  )}
                >
                  {tNav(tile.label)}
                </span>
                {captions[tile.key] && (
                  <span className="text-sm text-white/90">{captions[tile.key]}</span>
                )}
              </Link>
            </li>
          );
        })}

        <li className="h-32 lg:h-auto">
          <Link
            href="/companies"
            className={cn(
              TILE,
              "justify-between bg-deep text-on-deep transition-colors duration-150 hover:bg-deep-raised active:bg-deep-raised",
            )}
          >
            {companies && companies.items.length > 0 && (
              <span aria-hidden className="flex gap-1">
                {companies.items.slice(0, 3).map((company) => (
                  <span
                    key={company.slug}
                    className="grid size-8 place-items-center rounded-lg bg-on-deep font-display text-base font-extrabold text-deep lg:size-11 lg:rounded-xl lg:text-lg"
                  >
                    {initials(company.name)}
                  </span>
                ))}
              </span>
            )}
            <span className="mt-auto">
              <span className="block font-display text-display-sm font-extrabold">
                {tNav("companies")}
              </span>
              {captions.companies && (
                <span className="block text-sm text-on-deep-muted">
                  {captions.companies}
                </span>
              )}
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
