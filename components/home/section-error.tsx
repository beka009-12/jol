import { getTranslations } from "next-intl/server";
import { ErrorState } from "@/components/error-state";

export async function SectionError() {
  const t = await getTranslations("Errors");
  return <ErrorState title={t("sectionBody")} />;
}
