"use client";

import { WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useOnline } from "@/lib/use-online";

export function OfflineNotice() {
  const t = useTranslations("Common");

  return (
    <p className="pointer-events-auto flex max-w-md items-start gap-3 rounded-xl bg-foreground px-4 py-3 text-sm text-background shadow-floating motion-safe:animate-[fade-in_200ms_ease-out]">
      <WifiOff className="size-5 shrink-0" aria-hidden />
      <span>
        <strong className="font-semibold">{t("offlineTitle")}</strong>{" "}
        {t("offlineBody")}
      </span>
    </p>
  );
}

/*
  In the mountains the signal comes and goes. The live region is always in the
  page, so screen readers announce the message when it appears.
*/
export function OfflineBanner() {
  const online = useOnline();

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--nav-height)+env(safe-area-inset-bottom)+--spacing(4))] z-40 flex justify-center px-4 lg:bottom-6"
    >
      {!online && <OfflineNotice />}
    </div>
  );
}
