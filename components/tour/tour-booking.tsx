"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "cn";
import { Button, type ButtonProps } from "@/components/ui/button";
import { formatShortDate, formatSom } from "@/lib/format";
import type { Departure, TourOperator } from "@/lib/types";

// Loaded on first tap: most visitors read a tour without requesting a place.
const RequestSheet = dynamic(
  async () => (await import("./request-sheet")).RequestSheet,
  { ssr: false },
);

export interface BookableTour {
  slug: string;
  title: string;
  groupMax: number;
  operator: TourOperator;
  departures: Departure[];
}

interface TourBookingValue {
  openRequest: (date?: string) => void;
}

const TourBookingContext = createContext<TourBookingValue | null>(null);

interface TourBookingProviderProps {
  tour: BookableTour;
  children: ReactNode;
}

export function TourBookingProvider({
  tour,
  children,
}: TourBookingProviderProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [date, setDate] = useState<string | undefined>();
  const [session, setSession] = useState(0);

  const openRequest = useCallback((nextDate?: string) => {
    setDate(nextDate);
    setSession((value) => value + 1);
    setMounted(true);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openRequest }), [openRequest]);

  return (
    <TourBookingContext.Provider value={value}>
      {children}
      {mounted && (
        <RequestSheet
          key={session}
          tour={tour}
          initialDate={date}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </TourBookingContext.Provider>
  );
}

function useTourBooking(): TourBookingValue {
  const context = useContext(TourBookingContext);
  if (!context) {
    throw new Error("useTourBooking must be used inside TourBookingProvider");
  }
  return context;
}

interface RequestButtonProps {
  /** Says what the tap leads to: "Request a place", or "Request a June date" out of season. */
  label: string;
  variant?: ButtonProps["variant"];
  className?: string;
}

export function RequestButton({ label, variant, className }: RequestButtonProps) {
  const { openRequest } = useTourBooking();

  return (
    <Button size="lg" variant={variant} className={className} onClick={() => openRequest()}>
      {label}
    </Button>
  );
}

/* At or below this, the seat count is worth a second look. */
const FEW_SEATS = 3;

interface DepartureButtonProps {
  departure: Departure;
}

/* One date: tapping it opens the request with that date already chosen. */
export function DepartureButton({ departure }: DepartureButtonProps) {
  const t = useTranslations("Tour");
  const tPrice = useTranslations("Price");
  const locale = useLocale();
  const { openRequest } = useTourBooking();
  const soldOut = departure.seats_left <= 0;
  const fewSeats = !soldOut && departure.seats_left <= FEW_SEATS;

  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => openRequest(departure.date)}
      className="flex min-h-16 w-full items-center justify-between gap-3 rounded-xl border bg-card px-4 py-2 text-left transition-colors duration-150 hover:border-foreground/40 active:bg-secondary disabled:cursor-not-allowed disabled:border-transparent disabled:bg-muted disabled:text-muted-foreground"
    >
      <span>
        <span className="block font-semibold first-letter:uppercase">
          {formatShortDate(departure.date, locale)}
        </span>
        <span
          className={cn(
            "block text-xs",
            fewSeats ? "font-medium text-soon" : "text-muted-foreground",
          )}
        >
          {soldOut
            ? t("noSeats")
            : t("seatsLeft", { count: departure.seats_left })}
        </span>
      </span>
      <span className="text-sm font-semibold whitespace-nowrap">
        {tPrice("som", { som: formatSom(departure.price, locale) })}
      </span>
    </button>
  );
}
