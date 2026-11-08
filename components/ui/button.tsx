import type { ComponentProps, MouseEvent } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn } from "cn";

/*
  States: default, hover, pressed (darker + 97% scale), focus (2px ring),
  disabled (grey, so a pale red never reads as "still pressable"), loading
  (spinner, keeps its colour and focus, ignores presses).
*/
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-base font-semibold whitespace-nowrap transition-[color,background-color,border-color,scale] duration-150 ease-out active:scale-[0.97] aria-busy:cursor-progress aria-busy:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-pressed aria-busy:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent active:bg-accent disabled:text-muted-foreground",
        outline:
          "border border-input bg-card text-foreground hover:bg-secondary active:bg-accent disabled:border-border disabled:text-muted-foreground",
        ghost:
          "text-foreground hover:bg-secondary active:bg-accent disabled:text-muted-foreground",
        link: "text-foreground underline underline-offset-4 hover:no-underline",
      },
      size: {
        default: "h-11 px-4",
        lg: "h-12 px-6",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  /**
   * A request is in flight. Stays focusable (a disabled button drops focus
   * for screen readers) but swallows presses and Enter-to-submit.
   */
  loading?: boolean;
}

/* Module-level, so a Server Component can still render a Button with no handler. */
function swallowPress(event: MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
}

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  onClick,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={loading ? swallowPress : onClick}
      {...props}
    >
      {loading && <LoaderCircle className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
