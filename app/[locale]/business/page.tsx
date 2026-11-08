import type { Metadata } from "next";
import { BadgeCheck, MessageCircle, Search } from "lucide-react";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BusinessForm } from "@/components/business-form";
import { routing } from "@/i18n/routing";
import { getRegions } from "@/lib/api/catalog-index";
import { clientMessages } from "@/lib/client-messages";

interface BusinessPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: BusinessPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Business" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Business");
  const tHome = await getTranslations("Home");
  const regions = await getRegions(locale);
  const messages = await clientMessages("Business");

  const points = [
    { icon: Search, label: tHome("businessPointSearch") },
    { icon: MessageCircle, label: tHome("businessPointGuide") },
    { icon: BadgeCheck, label: tHome("businessPointVerified") },
  ];

  return (
    <div className="page-width pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-nav lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12 lg:pt-12">
      <div>
        <h1 className="font-display text-display-lg font-extrabold text-balance">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-[34rem] leading-relaxed text-pretty lg:text-lg lg:leading-relaxed">
          {t("lead")}
        </p>
        <ul className="mt-6 space-y-3">
          {points.map(({ icon: Icon, label }) => (
            <li key={label} className="flex gap-3 text-pretty">
              <Icon className="mt-1 size-5 shrink-0" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8 lg:mt-0">
        <NextIntlClientProvider messages={messages}>
          <BusinessForm regions={regions} />
        </NextIntlClientProvider>
      </div>
    </div>
  );
}
