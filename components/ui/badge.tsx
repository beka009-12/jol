import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

/*
  A status, never decoration. The colour always comes with a dot and words, so
  it still reads in bright sun and for colour-blind people. The accent red is
  not one of the tones.
*/
const badgeVariants = cva(
  "inline-flex min-h-7 items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-secondary text-secondary-foreground",
        open: "bg-open-soft text-open",
        soon: "bg-soon-soft text-soon",
        closed: "bg-closed-soft text-closed",
        danger: "bg-danger-soft text-danger",
      },
      /* Solid white on a photo, where a tinted badge would disappear. */
      onPhoto: {
        true: "bg-card text-foreground",
        false: "",
      },
    },
    defaultVariants: {
      tone: "neutral",
      onPhoto: false,
    },
  },
);

type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

const DOT: Record<BadgeTone, string> = {
  neutral: "bg-muted-foreground",
  open: "bg-open",
  soon: "bg-soon",
  closed: "bg-closed",
  danger: "bg-danger",
};

interface BadgeProps
  extends ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({
  tone,
  onPhoto,
  dot = true,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ tone, onPhoto }), className)}
      {...props}
    >
      {dot && (
        <span
          aria-hidden
          className={cn("size-1.5 shrink-0 rounded-full", DOT[tone ?? "neutral"])}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
export type { BadgeProps, BadgeTone };
