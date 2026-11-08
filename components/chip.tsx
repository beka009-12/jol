import type { ComponentProps } from "react";
import { cn } from "cn";
import { Link } from "@/i18n/navigation";

interface ChipLinkProps extends ComponentProps<typeof Link> {
  active?: boolean;
}

/* Outlined until chosen, so the one or two filters that are on stand out. */
export function ChipLink({ active = false, className, ...props }: ChipLinkProps) {
  return (
    <Link
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-medium whitespace-nowrap transition-colors duration-150",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-foreground hover:border-foreground/40 active:bg-secondary",
        className,
      )}
      {...props}
    />
  );
}

export interface ChipRowItem {
  key: string;
  label: string;
  href: ComponentProps<typeof Link>["href"];
  active: boolean;
  icon?: React.ReactNode;
  title?: string;
}

interface ChipRowProps {
  label: string;
  items: ChipRowItem[];
  /** Show the label: above the row on a phone, in a column on its left on a large screen. */
  showLabel?: boolean;
}

/* One filter: a labelled row of links, so every state has its own address. */
export function ChipRow({ label, items, showLabel = false }: ChipRowProps) {
  return (
    <nav
      aria-label={label}
      className={cn(
        showLabel && "lg:grid lg:grid-cols-[10rem_minmax(0,1fr)] lg:items-start lg:gap-4",
      )}
    >
      {showLabel && (
        <p
          aria-hidden
          className="mb-2 text-sm text-muted-foreground lg:mb-0 lg:flex lg:h-11 lg:items-center"
        >
          {label}
        </p>
      )}
      <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
        {items.map((item) => (
          <li key={item.key} className="shrink-0">
            <ChipLink
              href={item.href}
              active={item.active}
              title={item.title}
              scroll={false}
              prefetch={false}
            >
              {item.icon}
              {item.label}
            </ChipLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
