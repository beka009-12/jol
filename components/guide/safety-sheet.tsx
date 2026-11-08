"use client";

import { type FormEvent, useId, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { BottomSheet } from "@/components/bottom-sheet";
import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getSafetyDetails, saveSafetyDetails } from "@/lib/api/client";
import type { SafetyDetails, SafetyDetailsInput } from "@/lib/types";

const EMPTY: Record<keyof SafetyDetailsInput, string> = {
  event_date: "",
  route: "",
  driver_name: "",
  phone: "",
  vehicle_model: "",
  plate_number: "",
};

function toForm(details: SafetyDetails | null | undefined) {
  if (!details) return EMPTY;
  return {
    event_date: details.event_date ?? "",
    route: details.route ?? "",
    driver_name: details.driver_name ?? "",
    phone: details.phone ?? "",
    vehicle_model: details.vehicle_model ?? "",
    plate_number: details.plate_number ?? "",
  };
}

interface SafetyFormProps {
  conversationId: string;
  initial: SafetyDetails | null;
}

function SafetyForm({ conversationId, initial }: SafetyFormProps) {
  const t = useTranslations("Guide");
  const tCommon = useTranslations("Common");
  const queryClient = useQueryClient();
  const id = useId();
  const [form, setForm] = useState(() => toForm(initial));

  const save = useMutation({
    mutationFn: (input: SafetyDetailsInput) =>
      saveSafetyDetails(conversationId, input),
    onSuccess: (saved) => {
      queryClient.setQueryData(["safety", conversationId], saved);
    },
  });

  const set = (key: keyof SafetyDetailsInput, value: string) => {
    save.reset();
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate({
      event_date: form.event_date || null,
      route: form.route.trim() || null,
      driver_name: form.driver_name.trim() || null,
      phone: form.phone.trim() || null,
      vehicle_model: form.vehicle_model.trim() || null,
      plate_number: form.plate_number.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${id}-date`}>{t("safetyDate")}</Label>
        <Input
          id={`${id}-date`}
          type="date"
          value={form.event_date}
          onChange={(event) => set("event_date", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-route`}>{t("safetyRoute")}</Label>
        <Textarea
          id={`${id}-route`}
          value={form.route}
          maxLength={4000}
          placeholder={t("safetyRoutePlaceholder")}
          onChange={(event) => set("route", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-driver`}>{t("safetyDriver")}</Label>
        <Input
          id={`${id}-driver`}
          value={form.driver_name}
          maxLength={255}
          onChange={(event) => set("driver_name", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-phone`}>{t("safetyPhone")}</Label>
        <Input
          id={`${id}-phone`}
          type="tel"
          inputMode="tel"
          value={form.phone}
          maxLength={100}
          onChange={(event) => set("phone", event.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={`${id}-vehicle`}>{t("safetyVehicle")}</Label>
          <Input
            id={`${id}-vehicle`}
            value={form.vehicle_model}
            maxLength={255}
            onChange={(event) => set("vehicle_model", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-plate`}>{t("safetyPlate")}</Label>
          <Input
            id={`${id}-plate`}
            value={form.plate_number}
            maxLength={100}
            onChange={(event) => set("plate_number", event.target.value)}
          />
        </div>
      </div>

      {save.isError && (
        <p role="alert" className="text-sm text-destructive">
          {t("safetyError")}
        </p>
      )}
      {save.isSuccess && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm font-medium text-open"
        >
          <CircleCheck className="size-5" aria-hidden />
          {t("safetySaved")}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={save.isPending}
      >
        {tCommon("save")}
      </Button>
    </form>
  );
}

interface SafetySheetProps {
  conversationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SafetySheet({
  conversationId,
  open,
  onOpenChange,
}: SafetySheetProps) {
  const t = useTranslations("Guide");

  const details = useQuery({
    queryKey: ["safety", conversationId],
    queryFn: () => getSafetyDetails(conversationId as string),
    enabled: open && Boolean(conversationId),
  });

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("safetyTitle")}
      description={t("safetyBody")}
    >
      {details.isError ? (
        <ErrorState
          title={t("safetyLoadError")}
          onRetry={() => details.refetch()}
        />
      ) : details.isPending || !conversationId ? (
        <div className="space-y-4" aria-hidden>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <SafetyForm conversationId={conversationId} initial={details.data} />
      )}
    </BottomSheet>
  );
}
