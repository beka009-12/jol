"use client";

import { useTransition } from "react";
import { CircleAlert, RotateCw, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "@/i18n/navigation";
import { useOnline } from "@/lib/use-online";

interface ErrorStateProps {
  title: string;
  /** What happened and what to do next. Replaced by the offline hint without a network. */
  body?: string;
  /** Defaults to re-fetching the server-rendered page. */
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title, body, onRetry, className }: ErrorStateProps) {
  const t = useTranslations("Common");
  const router = useRouter();
  const online = useOnline();
  const [pending, startTransition] = useTransition();

  const retry = () => {
    if (onRetry) {
      onRetry();
      return;
    }
    startTransition(() => router.refresh());
  };

  const Icon = online ? CircleAlert : WifiOff;
  const hint = online ? body : t("offlineRetry");

  return (
    <Card role="alert" surface="muted" padding="lg" className={className}>
      <div
        aria-hidden
        className="mb-4 grid size-11 place-items-center rounded-xl bg-card text-danger"
      >
        <Icon className="size-5" />
      </div>
      <p className="font-semibold text-balance">{title}</p>
      {hint && (
        <p className="mt-1 max-w-[60ch] text-sm text-pretty text-muted-foreground">
          {hint}
        </p>
      )}
      <Button variant="outline" className="mt-4" onClick={retry} loading={pending}>
        {!pending && <RotateCw aria-hidden />}
        {t("retry")}
      </Button>
    </Card>
  );
}
