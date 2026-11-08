import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "cn";
import { Link } from "@/i18n/navigation";

interface SectionProps {
  title: string;
  id: string;
  /** One sentence under the title, when the title alone doesn't say why it's here. */
  description?: string;
  seeAllHref?: ComponentProps<typeof Link>["href"];
  seeAllLabel?: string;
  className?: string;
  children: ReactNode;
}

export function Section({
  title,
  id,
  description,
  seeAllHref,
  seeAllLabel,
  className,
  children,
}: SectionProps) {
  return (
    <section aria-labelledby={id} className={cn("py-12 lg:py-12", className)}>
      <div className="page-width">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-2 lg:mb-8">
          <div className="min-w-0">
            <h2
              id={id}
              className="font-display text-display-lg font-extrabold text-balance"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-2 max-w-[60ch] text-pretty text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {seeAllHref && seeAllLabel && (
            <Link
              href={seeAllHref}
              className="group -my-1 inline-flex h-11 items-center gap-2 rounded-lg font-semibold"
            >
              <span className="underline decoration-foreground/30 underline-offset-4 transition-colors duration-150 group-hover:decoration-foreground">
                {seeAllLabel}
              </span>
              <ArrowRight
                className="size-4 transition-[translate] duration-150 ease-out group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
