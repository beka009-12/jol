import type { ReactNode } from "react";
import { Map as MapIcon, MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { BackLink } from "@/components/back-link";
import { Photo } from "@/components/photo";
import { RatingMark, VerifiedMark } from "@/components/rating";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { PlaceRef, Photo as PhotoData, Rating, Region } from "@/lib/types";

interface DetailGalleryProps {
  photos: PhotoData[];
  backHref: string;
}

/* One wide photo, or a main photo and a second one beside it on a large screen. */
export function DetailGallery({ photos, backHref }: DetailGalleryProps) {
  const [cover, second] = photos;

  return (
    <div className="relative lg:page-width lg:pt-6">
      <div className={cn(second && "lg:grid lg:grid-cols-[2fr_1fr] lg:gap-3")}>
        <Photo
          photo={cover}
          sizes={second ? "(min-width: 1024px) 860px, 100vw" : "(min-width: 1248px) 1280px, 100vw"}
          aspect="header"
          preload
          className="lg:aspect-auto lg:h-[26rem] lg:rounded-2xl"
        />
        {second && (
          <Photo
            photo={second}
            sizes="430px"
            aspect="none"
            className="hidden h-[26rem] rounded-2xl lg:block"
          />
        )}
      </div>
      <BackLink
        href={backHref}
        className="absolute top-[calc(env(safe-area-inset-top)+0.75rem)] left-4 lg:top-9 lg:left-9"
      />
    </div>
  );
}

interface ContactActionsProps {
  whatsappHref: string;
  phone: string;
  /** Full width in the sidebar; side by side in the phone's bottom bar. */
  stacked?: boolean;
}

export function ContactActions({ whatsappHref, phone, stacked }: ContactActionsProps) {
  const t = useTranslations("Common");

  return (
    <>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonVariants({ size: "lg" }),
          stacked ? "w-full" : "min-w-0 flex-1",
        )}
      >
        <MessageCircle aria-hidden />
        {t("whatsapp")}
      </a>
      <a
        href={`tel:${phone}`}
        className={cn(
          buttonVariants({ variant: "secondary", size: "lg" }),
          stacked && "w-full",
        )}
      >
        <Phone aria-hidden />
        {t("call")}
      </a>
    </>
  );
}

interface DetailAsideProps {
  children: ReactNode;
}

export function DetailAside({ children }: DetailAsideProps) {
  return (
    <aside className="sticky top-[calc(var(--header-height)+--spacing(6))] hidden rounded-2xl border bg-card p-6 lg:block">
      {children}
    </aside>
  );
}

/* A search link: hotels and cafes come with an address, not coordinates. */
export function mapSearchHref(name: string, address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${address}`)}`;
}

interface ContactCardProps {
  /** Price and open state, above the buttons. */
  summary?: ReactNode;
  whatsappHref: string;
  phone: string;
  /** Who you deal with and what to ask them. */
  hint: string;
  address?: string;
  mapHref?: string;
}

/* The side card on a large screen: what it costs, how to reach them, where it is. */
export function ContactCard({ summary, whatsappHref, phone, hint, address, mapHref }: ContactCardProps) {
  return (
    <DetailAside>
      {summary}
      <div className={cn("grid gap-2", summary && "mt-6")}>
        <ContactActions whatsappHref={whatsappHref} phone={phone} stacked />
      </div>
      <p className="mt-3 text-xs text-pretty text-muted-foreground">{hint}</p>
      {address && <AddressLine address={address} mapHref={mapHref} className="mt-4 border-t pt-4" />}
    </DetailAside>
  );
}

interface AddressLineProps {
  address: string;
  mapHref?: string;
  className?: string;
}

export function AddressLine({ address, mapHref, className }: AddressLineProps) {
  const t = useTranslations("Common");

  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{t("address")}</p>
      <p className="mt-1 text-pretty">{address}</p>
      {mapHref && (
        <a
          href={mapHref}
          target="_blank"
          rel="noopener noreferrer"
          className="-my-2 inline-flex min-h-11 items-center gap-2 text-sm font-medium underline decoration-foreground/30 underline-offset-4 transition-colors duration-150 hover:decoration-foreground"
        >
          <MapIcon className="size-4" aria-hidden />
          {t("openMap")}
        </a>
      )}
    </div>
  );
}

/* Blocks of one section sharing a frame: facts on top, then the chart. */
export function DetailCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("divide-y rounded-2xl border *:p-4 lg:*:p-6", className)}>
      {children}
    </div>
  );
}

interface DetailSectionProps {
  id: string;
  title: string;
  className?: string;
  children: ReactNode;
}

export function DetailSection({ id, title, className, children }: DetailSectionProps) {
  return (
    <section aria-labelledby={id} className={cn("mt-8", className)}>
      <h2 id={id} className="mb-3 text-lg font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}

interface DetailTitleProps {
  /** What it is: "Guesthouse", "Teahouse". */
  kind: string;
  title: string;
  place: PlaceRef;
  region: Region;
  rating?: Rating | null;
  verified?: boolean;
}

/* The same head on every listing page, so a hotel, a cafe and a tour read alike. */
export function DetailTitle({ kind, title, place, region, rating, verified }: DetailTitleProps) {
  return (
    <>
      <p className="text-sm text-muted-foreground">{kind}</p>
      <h1 className="mt-1 font-display text-display-lg font-extrabold text-balance">{title}</h1>
      <p className="mt-1 text-muted-foreground">
        <Link
          href={`/places/${place.slug}`}
          className="underline decoration-foreground/30 underline-offset-4 transition-colors duration-150 hover:text-foreground hover:decoration-foreground"
        >
          {place.name}
        </Link>
        {`, ${region.name}`}
      </p>
      {(rating || verified) && (
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          {rating && <RatingMark rating={rating} showCount />}
          {verified && <VerifiedMark withLabel />}
        </p>
      )}
    </>
  );
}
