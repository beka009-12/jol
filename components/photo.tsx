import Image from "next/image";
import { cn } from "cn";
import type { Photo as PhotoData } from "@/lib/types";

const FALLBACK_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjMiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjMiIGZpbGw9IiNlOGU0ZGQiLz48L3N2Zz4=";

const ASPECT = {
  card: "aspect-[4/3]",
  header: "aspect-[16/10]",
  square: "aspect-square",
  none: "",
} as const;

interface PhotoProps {
  photo: PhotoData;
  sizes: string;
  aspect?: keyof typeof ASPECT;
  preload?: boolean;
  /** Dims on hover and press; needs a `group` ancestor. No zoom: the photo stays still. */
  interactive?: boolean;
  className?: string;
}

export function Photo({
  photo,
  sizes,
  aspect = "card",
  preload = false,
  interactive = false,
  className,
}: PhotoProps) {
  return (
    <div className={cn("relative overflow-hidden bg-muted", ASPECT[aspect], className)}>
      <Image
        src={photo.url}
        alt={photo.alt}
        fill
        sizes={sizes}
        preload={preload}
        fetchPriority={preload ? "high" : undefined}
        quality={60}
        placeholder="blur"
        blurDataURL={photo.blur_data_url ?? FALLBACK_BLUR}
        className="object-cover"
      />
      {aspect !== "none" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] outline-1 -outline-offset-1 outline-black/10"
        />
      )}
      {interactive && (
        <span
          aria-hidden
          className="absolute inset-0 bg-black/0 transition-colors duration-150 group-hover:bg-black/10 group-active:bg-black/20"
        />
      )}
    </div>
  );
}
