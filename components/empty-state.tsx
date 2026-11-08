import type { ComponentProps, ReactNode } from "react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

interface EmptyStateProps {
  title: string;
  /** What to do instead: a wider filter, another month, another section. */
  body?: string;
  icon?: ReactNode;
  actionLabel?: string;
  actionHref?: ComponentProps<typeof Link>["href"];
  className?: string;
}

export function EmptyState({
  title,
  body,
  icon,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <Card surface="muted" padding="lg" className={className}>
      {icon && (
        <div
          aria-hidden
          className="mb-4 grid size-11 place-items-center rounded-xl bg-card text-muted-foreground [&_svg]:size-5"
        >
          {icon}
        </div>
      )}
      <p className="font-semibold text-balance">{title}</p>
      {body && (
        <p className="mt-1 max-w-[60ch] text-sm text-pretty text-muted-foreground">
          {body}
        </p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
        >
          {actionLabel}
        </Link>
      )}
    </Card>
  );
}
