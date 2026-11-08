import Form from "next/form";
import type { ReactNode } from "react";
import { CalendarDays, ChevronDown, Search } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { currentMonth, monthName, monthsFrom } from "@/lib/format";
import type { Locale } from "@/lib/types";

interface FieldProps {
  label: string;
  icon: ReactNode;
  className?: string;
  children: ReactNode;
}

/* A visible box with a border, so it reads as "type here" even in bright sun. */
function Field({ label, icon, className, children }: FieldProps) {
  return (
    <label
      className={cn(
        "relative flex h-12 min-w-0 items-center gap-3 rounded-xl border border-input bg-card px-4 text-foreground transition-colors duration-150 hover:border-foreground has-[:focus-visible]:border-foreground has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-0 has-[:focus-visible]:outline-foreground",
        className,
      )}
    >
      <span aria-hidden className="shrink-0 text-muted-foreground">
        {icon}
      </span>
      <span className="sr-only">{label}</span>
      {children}
    </label>
  );
}

const CONTROL =
  "h-full w-full min-w-0 bg-transparent text-base text-foreground outline-none";

function capitalize(text: string, locale: string): string {
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}

interface SearchFormProps {
  defaults?: { q?: string; month?: number };
  /** Inside a white floating card (on a photo), or bare fields (on a plain page). */
  framed?: boolean;
  className?: string;
}

/*
  One search across tours, stays, food, companies and places. A region is just
  a word in the box ("Каракол", "Иссык-Куль"), so it needs no field of its own.
*/
export async function SearchForm({
  defaults,
  framed = true,
  className,
}: SearchFormProps) {
  const t = await getTranslations("Search");
  const locale = (await getLocale()) as Locale;

  return (
    <Form
      action={`/${locale}/search`}
      role="search"
      aria-label={t("formLabel")}
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] gap-2 lg:grid-cols-[minmax(0,1fr)_14rem_auto]",
        framed &&
          "rounded-[calc(var(--radius-xl)+--spacing(2))] bg-card p-2 shadow-floating",
        className,
      )}
    >
      <Field
        label={t("whatLabel")}
        icon={<Search className="size-5" />}
        className="col-span-2 lg:col-span-1"
      >
        <input
          type="search"
          name="q"
          defaultValue={defaults?.q}
          placeholder={t("whatPlaceholder")}
          autoComplete="off"
          enterKeyHint="search"
          maxLength={100}
          className={cn(CONTROL, "truncate placeholder:text-muted-foreground")}
        />
      </Field>

      <Field label={t("whenLabel")} icon={<CalendarDays className="size-5" />}>
        <select
          name="month"
          defaultValue={defaults?.month ?? ""}
          className={cn(CONTROL, "cursor-pointer appearance-none truncate pr-6")}
        >
          <option value="">{t("anyMonth")}</option>
          {monthsFrom(currentMonth()).map((month) => (
            <option key={month} value={month}>
              {capitalize(monthName(month, locale), locale)}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-4 size-4 text-muted-foreground"
          aria-hidden
        />
      </Field>

      <button
        type="submit"
        className={cn(buttonVariants(), "h-12 px-6 lg:px-8")}
      >
        {t("submit")}
      </button>
    </Form>
  );
}
