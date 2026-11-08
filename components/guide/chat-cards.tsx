"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { Photo } from "@/components/photo";
import { TourRow } from "@/components/tour-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { getPlaceForCard, getTourForCard } from "@/lib/api/client";
import type { ChatRef } from "@/lib/chat-refs";
import type { Locale } from "@/lib/types";

function CardSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="size-20 shrink-0 rounded-2xl" />
      <div className="flex-1 pt-1">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="mt-2 h-4 w-3/5" />
      </div>
    </div>
  );
}

function TourRef({ slug }: { slug: string }) {
  const locale = useLocale() as Locale;
  const { data, isPending } = useQuery({
    queryKey: ["tour-card", locale, slug],
    queryFn: () => getTourForCard(locale, slug),
  });

  if (isPending) return <CardSkeleton />;
  // A slug the catalog doesn't know is noise in the answer, not an error.
  return data ? <TourRow tour={data} /> : null;
}

function PlaceRef({ slug }: { slug: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations("Place");
  const { data, isPending } = useQuery({
    queryKey: ["place-card", locale, slug],
    queryFn: () => getPlaceForCard(locale, slug),
  });

  if (isPending) return <CardSkeleton />;
  if (!data) return null;

  return (
    <Link
      href={`/places/${data.slug}`}
      className="group flex items-center gap-3 rounded-2xl"
    >
      <Photo
        photo={data.photo}
        sizes="80px"
        aspect="square"
        interactive
        className="w-20 shrink-0 rounded-2xl"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{data.name}</span>
        <span className="block text-sm text-muted-foreground">
          {data.region.name}
        </span>
        <span className="sr-only">{t("toursTitle")}</span>
      </span>
    </Link>
  );
}

interface ChatCardsProps {
  refs: ChatRef[];
}

export function ChatCards({ refs }: ChatCardsProps) {
  if (refs.length === 0) return null;

  return (
    <ul className="mt-3 space-y-3">
      {refs.map((ref) => (
        <li key={`${ref.type}:${ref.slug}`}>
          {ref.type === "tour" ? (
            <TourRef slug={ref.slug} />
          ) : (
            <PlaceRef slug={ref.slug} />
          )}
        </li>
      ))}
    </ul>
  );
}
