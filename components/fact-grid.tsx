import type { LucideIcon } from "lucide-react";
import { cn } from "cn";

export interface Fact {
  icon: LucideIcon;
  term: string;
  value: string;
}

const COLUMNS_ON_LARGE: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

interface FactGridProps {
  facts: Fact[];
  className?: string;
}

/* Short answers at a glance: when it's open, when to check in, who works there. */
export function FactGrid({ facts, className }: FactGridProps) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-4",
        COLUMNS_ON_LARGE[facts.length],
        className,
      )}
    >
      {facts.map(({ icon: Icon, term, value }) => (
        <div key={term} className="min-w-0 max-lg:last:odd:col-span-2">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="size-4 shrink-0" aria-hidden />
            {term}
          </dt>
          <dd className="mt-1 font-medium text-pretty first-letter:uppercase">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
