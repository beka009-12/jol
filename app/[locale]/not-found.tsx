import { MapPinOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/empty-state";

export default function NotFound() {
  const t = useTranslations("Errors");
  const tCommon = useTranslations("Common");

  return (
    <div className="page-width pt-8 pb-nav lg:pt-12">
      <h1 className="sr-only">{t("notFoundTitle")}</h1>
      <EmptyState
        icon={<MapPinOff className="size-8" aria-hidden />}
        title={t("notFoundTitle")}
        body={t("notFoundBody")}
        actionLabel={tCommon("toHome")}
        actionHref="/"
      />
    </div>
  );
}
