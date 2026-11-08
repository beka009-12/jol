import { ArrowUp, Camera, MessageCircle } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "cn";
import { Photo } from "@/components/photo";
import { PriceLine } from "@/components/price";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getCatalogIndex } from "@/lib/api/catalog-index";
import { formatSom } from "@/lib/format";
import type { Locale } from "@/lib/types";

const SAMPLE_PLACE = "karakol";

export async function GuideBand() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Home");
  const tGuide = await getTranslations("Guide");
  const tHotels = await getTranslations("Hotels");
  const tRestaurants = await getTranslations("Restaurants");
  const { hotels, restaurants } = await getCatalogIndex(locale);

  const hotel = hotels?.items.find((item) => item.place.slug === SAMPLE_PLACE);
  const restaurant = restaurants?.items.find(
    (item) => item.place.slug === SAMPLE_PLACE,
  );

  const suggestions = [
    tGuide("suggestion1"),
    tGuide("suggestion2"),
    tGuide("suggestion4"),
  ];

  return (
    <section
      aria-labelledby="guide-title"
      className="bg-deep py-12 text-on-deep [--ring:var(--on-deep)] lg:py-12"
    >
      <div className="page-width grid items-center gap-12 lg:grid-cols-2 lg:gap-12">
        <div>
          <h2
            id="guide-title"
            className="font-display text-display-lg font-extrabold text-balance"
          >
            {t("guideTitle")}
          </h2>
          <p className="mt-3 max-w-[32rem] leading-relaxed text-pretty text-on-deep-muted lg:text-lg lg:leading-relaxed">
            {t("guideBody")}
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {suggestions.map((question) => (
              <li key={question}>
                <Link
                  href={{ pathname: "/guide", query: { q: question } }}
                  prefetch={false}
                  className="inline-flex min-h-11 items-center rounded-xl border border-white/25 px-4 py-2 text-sm font-medium transition-colors duration-150 hover:bg-white/10"
                >
                  {question}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/guide"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-on-deep text-deep hover:bg-on-deep/85 active:bg-on-deep/85",
              )}
            >
              <MessageCircle aria-hidden />
              {t("guideCta")}
            </Link>
            <Link
              href={{ pathname: "/guide", query: { photo: 1 } }}
              prefetch={false}
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/25 px-6 font-semibold transition-[background-color,scale] duration-150 ease-out hover:bg-white/10 active:scale-[0.96]"
            >
              <Camera className="size-5" aria-hidden />
              {t("photoCta")}
            </Link>
          </div>
        </div>

        <figure
          aria-label={t("guideSampleLabel")}
          className="rounded-2xl bg-card p-4 text-foreground sm:p-6"
        >
          <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-foreground px-4 py-3 text-background">
            {t("guideSampleQuestion")}
          </p>
          <p className="mt-3 w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-secondary px-4 py-3 text-pretty">
            {t("guideSampleAnswer")}
          </p>

          {(hotel || restaurant) && (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {hotel && (
                <li>
                  <Link
                    href={`/hotels/${hotel.slug}`}
                    prefetch={false}
                    className="group flex items-center gap-3 rounded-xl border p-2 transition-colors duration-150 hover:border-foreground/40"
                  >
                    <Photo
                      photo={hotel.photo}
                      sizes="64px"
                      aspect="square"
                      interactive
                      className="w-14 shrink-0 rounded-lg"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {hotel.name}
                      </span>
                      <PriceLine
                        main={tHotels("priceFrom", {
                          som: formatSom(hotel.price_from, locale),
                        })}
                        className="text-xs"
                      />
                    </span>
                  </Link>
                </li>
              )}
              {restaurant && (
                <li>
                  <Link
                    href={`/restaurants/${restaurant.slug}`}
                    prefetch={false}
                    className="group flex items-center gap-3 rounded-xl border p-2 transition-colors duration-150 hover:border-foreground/40"
                  >
                    <Photo
                      photo={restaurant.photo}
                      sizes="64px"
                      aspect="square"
                      interactive
                      className="w-14 shrink-0 rounded-lg"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {restaurant.name}
                      </span>
                      <PriceLine
                        main={tRestaurants("checkValue", {
                          som: formatSom(restaurant.average_check, locale),
                        })}
                        className="text-xs"
                      />
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          )}

          <div
            aria-hidden
            className="mt-4 flex h-12 items-center justify-between rounded-xl border border-input pr-2 pl-4 text-muted-foreground"
          >
            {tGuide("inputPlaceholder")}
            <span className="grid size-9 place-items-center rounded-lg bg-secondary">
              <ArrowUp className="size-4" />
            </span>
          </div>
        </figure>
      </div>
    </section>
  );
}
