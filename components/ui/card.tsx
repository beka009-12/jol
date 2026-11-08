import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

/*
  A surface is picked by its job, not by habit:
  - outline: facts or a list that belong together; white with a hairline
  - muted: a note, or a state the page is in (empty, error, hint)
  - floating: sits above other content; the only surface with a shadow
  Photos and listing cards need none of these: the photo is the surface.
*/
const cardVariants = cva("rounded-2xl", {
  variants: {
    surface: {
      outline: "border bg-card",
      muted: "bg-secondary",
      floating: "bg-card shadow-floating",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-4 lg:p-6",
      lg: "p-6 lg:p-8",
    },
  },
  defaultVariants: {
    surface: "outline",
    padding: "md",
  },
});

interface CardProps
  extends ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

function Card({ surface, padding, className, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ surface, padding }), className)}
      {...props}
    />
  );
}

export { Card, cardVariants };
export type { CardProps };
