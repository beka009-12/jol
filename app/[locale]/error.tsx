"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/error-state";

interface PageErrorProps {
  error: unknown;
  retry: () => void;
}

export default function PageError({ error, retry }: PageErrorProps) {
  const t = useTranslations("Errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page-width pt-8 pb-nav lg:pt-12">
      <ErrorState title={t("pageTitle")} body={t("pageBody")} onRetry={retry} />
    </div>
  );
}
