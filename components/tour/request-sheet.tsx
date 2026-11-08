"use client";

import { type FormEvent, useId, useRef, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { CircleCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "cn";
import { useAuth } from "@/components/auth-provider";
import { BottomSheet } from "@/components/bottom-sheet";
import { SignInPanel } from "@/components/sign-in-panel";
import { Stepper } from "@/components/stepper";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import {
  createTourRequest,
  getQuote,
  getTourDepartures,
} from "@/lib/api/client";
import {
  formatDate,
  formatShortDate,
  formatSom,
  formatUsd,
  todayInBishkek,
} from "@/lib/format";
import type { Locale, TourRequestInput } from "@/lib/types";
import type { BookableTour } from "./tour-booking";

const BOOKING_WINDOW_DAYS = 240;
const MIN_PHONE_DIGITS = 7;

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

interface FieldErrors {
  date?: string;
  name?: string;
  phone?: string;
}

interface RequestSheetProps {
  tour: BookableTour;
  initialDate?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestSheet({
  tour,
  initialDate,
  open,
  onOpenChange,
}: RequestSheetProps) {
  const t = useTranslations("Request");
  const tPrice = useTranslations("Price");
  const locale = useLocale() as Locale;
  const queryClient = useQueryClient();
  const { user, isSignedIn } = useAuth();

  const formId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const [pickedDate, setPickedDate] = useState(initialDate);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [needsSignIn, setNeedsSignIn] = useState(false);

  const today = todayInBishkek();
  const departures = useQuery({
    queryKey: ["tour-departures", tour.slug],
    queryFn: () =>
      getTourDepartures(
        tour.slug,
        addDays(today, 1),
        addDays(today, BOOKING_WINDOW_DAYS),
      ),
    placeholderData: tour.departures,
  });

  const options = departures.data ?? [];
  const firstOpen = options.find((option) => option.seats_left > 0);
  const date = pickedDate ?? firstOpen?.date;
  const selected = options.find((option) => option.date === date);
  const seatLimit = Math.min(
    tour.groupMax,
    selected?.seats_left ?? tour.groupMax,
  );

  const quote = useQuery({
    queryKey: ["tour-quote", tour.slug, date, adults, children],
    queryFn: () =>
      getQuote(tour.slug, { date: date as string, adults, children }),
    enabled: Boolean(date),
    placeholderData: keepPreviousData,
  });

  const submission = useMutation({
    mutationFn: (input: TourRequestInput) =>
      createTourRequest(locale, tour.slug, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-requests"] });
    },
  });

  const buildInput = (): TourRequestInput => ({
    date: date as string,
    adults,
    children,
    contact_name: name.trim(),
    contact_phone: phone.trim(),
    ...(note.trim() ? { note: note.trim() } : {}),
  });

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!date) next.date = t("dateError");
    if (!name.trim()) next.name = t("nameError");
    if (phone.replace(/\D/g, "").length < MIN_PHONE_DIGITS) {
      next.phone = t("phoneError");
    }
    setErrors(next);
    if (next.name) nameRef.current?.focus();
    else if (next.phone) phoneRef.current?.focus();
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    if (!isSignedIn) {
      setNeedsSignIn(true);
      return;
    }
    submission.mutate(buildInput());
  };

  if (submission.isSuccess) {
    const people = adults + children;
    return (
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title={t("successTitle")}
      >
        <div role="status">
          <CircleCheck className="size-10 text-open" aria-hidden />
          <p className="mt-3">
            {t("successBody", {
              operator: tour.operator.name,
              phone: phone.trim(),
              date: formatDate(date as string, locale),
              people: t("people", { count: people }),
            })}
          </p>
        </div>
        <div className="mt-6 grid gap-2">
          <Link
            href="/profile"
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            {t("successRequests")}
          </Link>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {t("successDone")}
          </Button>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      description={tour.title}
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-6">
        <p className="text-sm text-muted-foreground">{t("description")}</p>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">{t("dateLabel")}</legend>
          {departures.isError && !options.length ? (
            <p role="alert" className="text-sm text-destructive">
              {t("datesError")}
            </p>
          ) : departures.isPending ? (
            <div className="flex gap-2" aria-label={t("datesLoading")}>
              <Skeleton className="h-16 w-32 shrink-0" />
              <Skeleton className="h-16 w-32 shrink-0" />
              <Skeleton className="h-16 w-32 shrink-0" />
            </div>
          ) : options.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("datesEmpty")}</p>
          ) : (
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
              {options.map((option) => {
                const disabled = option.seats_left <= 0;
                const checked = option.date === date;
                return (
                  <label
                    key={option.date}
                    className={cn(
                      "flex min-h-16 w-32 shrink-0 cursor-pointer flex-col justify-center rounded-xl px-3 py-2 transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                      checked
                        ? "bg-foreground text-background"
                        : "bg-secondary hover:bg-accent",
                      disabled && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <input
                      type="radio"
                      name="date"
                      value={option.date}
                      checked={checked}
                      disabled={disabled}
                      onChange={() => {
                        setPickedDate(option.date);
                        setAdults((value) =>
                          Math.min(value, Math.max(1, option.seats_left)),
                        );
                        setChildren(0);
                      }}
                      className="sr-only"
                    />
                    <span className="text-sm font-semibold first-letter:uppercase">
                      {formatShortDate(option.date, locale)}
                    </span>
                    <span
                      className={cn(
                        "text-xs",
                        !checked && "text-muted-foreground",
                      )}
                    >
                      {t("seats", { count: option.seats_left })}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          {errors.date && (
            <p role="alert" className="mt-1 text-sm text-destructive">
              {errors.date}
            </p>
          )}
        </fieldset>

        <div className="space-y-3">
          <Stepper
            label={t("adults")}
            value={adults}
            min={1}
            max={Math.max(1, seatLimit - children)}
            decreaseLabel={t("decrease", { label: t("adults") })}
            increaseLabel={t("increase", { label: t("adults") })}
            onChange={setAdults}
          />
          <Stepper
            label={t("children")}
            hint={t("childrenHint")}
            value={children}
            min={0}
            max={Math.max(0, seatLimit - adults)}
            decreaseLabel={t("decrease", { label: t("children") })}
            increaseLabel={t("increase", { label: t("children") })}
            onChange={setChildren}
          />
        </div>

        <div
          aria-live="polite"
          className="flex min-h-14 items-center justify-between gap-3 rounded-xl bg-secondary px-4 py-2"
        >
          {quote.isError ? (
            <p className="text-sm text-muted-foreground">{t("quoteError")}</p>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                {t("totalLabel")}
              </span>
              {quote.data ? (
                <span className="text-right">
                  <span className="block font-bold">
                    {tPrice("som", { som: formatSom(quote.data.total, locale) })}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {tPrice("approxUsd", {
                      usd: formatUsd(quote.data.total, locale),
                    })}
                  </span>
                </span>
              ) : (
                <Skeleton className="h-6 w-24" />
              )}
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-name`}>{t("nameLabel")}</Label>
          <Input
            id={`${formId}-name`}
            ref={nameRef}
            value={name}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${formId}-name-error` : undefined}
            onChange={(event) => setName(event.target.value)}
          />
          {errors.name && (
            <p id={`${formId}-name-error`} className="text-sm text-destructive">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-phone`}>{t("phoneLabel")}</Label>
          <Input
            id={`${formId}-phone`}
            ref={phoneRef}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={`${formId}-phone-hint`}
            onChange={(event) => setPhone(event.target.value)}
          />
          <p
            id={`${formId}-phone-hint`}
            className={cn(
              "text-xs",
              errors.phone ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {errors.phone ?? t("phoneHint")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-note`}>{t("noteLabel")}</Label>
          <Textarea
            id={`${formId}-note`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>

        {submission.isError && (
          <p role="alert" className="text-sm text-destructive">
            {t("submitError")}
          </p>
        )}

        {needsSignIn && !isSignedIn ? (
          <div
            ref={(panel) => panel?.scrollIntoView({ block: "nearest" })}
            className="rounded-xl bg-secondary p-4"
          >
            <p className="mb-3 text-sm">{t("signInHint")}</p>
            <SignInPanel onSignedIn={() => submission.mutate(buildInput())} />
          </div>
        ) : (
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={options.length === 0}
            loading={submission.isPending}
          >
            {submission.isPending ? t("submitting") : t("submit")}
          </Button>
        )}
      </form>
    </BottomSheet>
  );
}
