import type { ComponentProps } from "react";
import { cn } from "cn";
import { Link } from "@/i18n/navigation";

interface ChipLinkProps extends ComponentProps<typeof Link> {
  active?: boolean;
}

export function ChipLink({ active = false, className, ...props }: ChipLinkProps) {
  return (
    <Link
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-medium whitespace-nowrap transition-colors duration-150",
        active
          ? "bg-foreground text-background"
          : "bg-secondary text-secondary-foreground hover:bg-accent active:bg-accent",
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
}

/* One filter: a labelled row of links, so every state has its own address. */
export function ChipRow({ label, items }: ChipRowProps) {
  return (
    <nav aria-label={label}>
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
