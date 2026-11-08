import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "cn";
import { formatSom, formatUsd } from "@/lib/format";

interface PriceLineProps {
  main: ReactNode;
  note?: ReactNode;
  className?: string;
}

/* The money in bold, then what it covers. Every listing card ends with one. */
export function PriceLine({ main, note, className }: PriceLineProps) {
  return (
    <p className={cn("text-sm", className)}>
      <span className="font-semibold">{main}</span>
      {note && <span className="ml-2 text-muted-foreground">{note}</span>}
    </p>
  );
}

interface PriceProps {
  /** Amount in tyiyn. */
  amount: number;
  /** Starting price: "from 12,000 KGS ~$137 / person". */
  from?: boolean;
  className?: string;
}

export function Price({ amount, from = true, className }: PriceProps) {
  const t = useTranslations("Price");
  const locale = useLocale();
  const som = formatSom(amount, locale);

  return (
    <PriceLine
      main={t(from ? "from" : "som", { som })}
      note={t("perPerson", { usd: formatUsd(amount, locale) })}
      className={className}
    />
  );
}
