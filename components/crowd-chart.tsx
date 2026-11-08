import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "cn";
import { summarizeCrowd } from "@/lib/crowd";
import { currentMonth, formatSeason, monthName } from "@/lib/format";

type MonthKey = `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`;

const TITLE_ID = "crowd-title";

interface CrowdChartProps {
  /** Visitors per month, January first. */
  visitors?: number[] | null;
  /** Months it's open. Leave out for a place you can visit any time. */
  openMonths?: number[];
  className?: string;
}

/*
  Twelve native radios drawn as columns, so tapping a column and the arrow keys
  work with no client code. Which readout shows is decided in globals.css.
*/
export function CrowdChart({ visitors, openMonths, className }: CrowdChartProps) {
  const t = useTranslations("Crowd");
  const tHours = useTranslations("Hours");
  const tMonthsIn = useTranslations("MonthsIn");
  const locale = useLocale();

  const summary = summarizeCrowd(visitors, openMonths);
  if (!summary) return null;

  const now = currentMonth();
  const hasOffSeason = summary.bars.some((bar) => bar.level === "off_season");
  const season = (months: number[]) =>
    formatSeason(months, locale, tHours("allYear"));

  return (
    <figure aria-labelledby={TITLE_ID} className={className}>
      <h3 id={TITLE_ID} className="font-semibold">
        {t("title")}
      </h3>
      <p className="mt-1 text-sm text-pretty text-muted-foreground">
        {t("busiest", { months: season(summary.busiest) })}
        {summary.quietest.length > 0 &&
          ` ${t("quietest", { months: season(summary.quietest) })}`}
      </p>

      <div className="mt-4 @container">
        <fieldset
          aria-labelledby={TITLE_ID}
          className="crowd-chart relative min-w-0 pt-12"
        >
          <div className="grid grid-cols-12">
            {summary.bars.map((bar) => {
            const fullName = monthName(bar.month, locale);
            const shortName = monthName(bar.month, locale, "short");
            const level = t(`levels.${bar.level}`);
            const isNow = bar.month === now;
            const offSeason = bar.level === "off_season";

            return (
              <label
                key={bar.month}
                className="crowd-bar group/bar flex cursor-pointer flex-col rounded-md has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-ring"
              >
                <input
                  type="radio"
                  name="crowd-month"
                  defaultChecked={isNow}
                  className="sr-only"
                />
                <span className="sr-only">{`${fullName}: ${level}`}</span>

                <span
                  aria-hidden
                  className="crowd-readout absolute inset-x-0 top-0 truncate text-sm font-medium first-letter:uppercase"
                >
                  {isNow
                    ? t("readoutNow", {
                        month: tMonthsIn(String(bar.month) as MonthKey),
                        level,
                      })
                    : `${fullName}: ${level}`}
                </span>

                <span
                  aria-hidden
                  className="flex h-36 items-end justify-center border-b border-foreground/25 lg:h-44"
                >
                  <span
                    data-off={offSeason || undefined}
                    className={cn(
                      "crowd-mark relative block w-[68%] max-w-6",
                      offSeason ? "h-[3px]" : "rounded-t-[4px]",
                    )}
                    style={offSeason ? undefined : { height: `${bar.height}%` }}
                  >
                    {bar.peak && (
                      <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 text-xs font-semibold whitespace-nowrap">
                        {t("peak")}
                      </span>
                    )}
                  </span>
                </span>

                <span
                  aria-hidden
                  className={cn(
                    "mt-2 flex justify-center text-xs",
                    isNow ? "font-semibold" : "text-muted-foreground",
                  )}
                >
                  <span className="min-w-5 rounded-md px-1 text-center transition-colors duration-150 group-has-[:checked]/bar:bg-foreground group-has-[:checked]/bar:text-background">
                    <span className="@max-[26rem]:hidden">
                      {shortName.slice(0, 3)}
                    </span>
                    <span className="hidden @max-[26rem]:inline">
                      {shortName.slice(0, 1).toLocaleUpperCase(locale)}
                    </span>
                  </span>
                </span>
              </label>
            );
            })}
          </div>
        </fieldset>
      </div>

      {hasOffSeason && (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <span aria-hidden className="h-[3px] w-5 bg-chart-off" />
          {t("offSeasonKey")}
        </p>
      )}

      <details className="group mt-1">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <ChevronDown
            className="size-4 transition-transform duration-150 ease-out group-open:rotate-180"
            aria-hidden
          />
          {t("tableToggle")}
        </summary>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th scope="col" className="py-2 font-medium">
                {t("tableMonth")}
              </th>
              <th scope="col" className="py-2 font-medium">
                {t("tablePeople")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {summary.bars.map((bar) => (
              <tr key={bar.month}>
                <th
                  scope="row"
                  className="py-2 text-left font-normal first-letter:uppercase"
                >
                  {monthName(bar.month, locale)}
                </th>
                <td className="py-2 first-letter:uppercase">
                  {t(`levels.${bar.level}`)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
