import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profile/profile-view";
import { routing } from "@/i18n/routing";
import { clientMessages } from "@/lib/client-messages";

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Profile" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await clientMessages("Profile", "Auth", "Price");

  return (
    <NextIntlClientProvider messages={messages}>
      <ProfileView />
    </NextIntlClientProvider>
  );
}
