import type { ReactNode } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
import { BackLink } from "@/components/back-link";
import { Photo } from "@/components/photo";
import { buttonVariants } from "@/components/ui/button";
import type { Photo as PhotoData } from "@/lib/types";

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
          className={cn(
            "lg:rounded-2xl",
            second ? "lg:aspect-auto lg:h-[26rem]" : "lg:aspect-[21/9]",
          )}
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
    <aside className="sticky top-[calc(var(--header-height)+1.5rem)] hidden rounded-2xl border bg-card p-6 lg:block">
      {children}
    </aside>
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
