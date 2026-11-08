"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

/* Loading is client state, so its preview lives in a client component. */
export function LoadingButtons() {
  const t = useTranslations("Request");
  const tCommon = useTranslations("Common");

  return (
    <>
      <Button loading>{t("submitting")}</Button>
      <Button variant="outline" loading>
        {tCommon("retry")}
      </Button>
    </>
  );
}
