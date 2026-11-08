import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { GuideChat } from "@/components/guide/guide-chat";
import { routing } from "@/i18n/routing";
import { clientMessages } from "@/lib/client-messages";

interface GuidePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; photo?: string }>;
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Guide" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function GuidePage({
  params,
  searchParams,
}: GuidePageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const { q, photo } = await searchParams;
  const messages = await clientMessages(
    "Guide",
    "Auth",
    "Price",
    "Availability",
    "Tours",
    "Difficulty",
    "Place",
  );

  return (
    <NextIntlClientProvider messages={messages}>
      {/* The chat fills the screen, so the page has no footer. */}
      <span data-no-footer hidden />
      <GuideChat
        initialQuestion={q?.trim() || undefined}
        photoPrompt={photo === "1"}
      />
    </NextIntlClientProvider>
  );
}
