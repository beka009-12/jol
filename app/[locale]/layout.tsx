import type { Metadata, Viewport } from "next";
import { Onest, Sofia_Sans_Extra_Condensed } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BottomNav } from "@/components/bottom-nav";
import { OfflineBanner } from "@/components/offline-banner";
import { SiteFooter } from "@/components/site-footer";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";
import { clientMessages } from "@/lib/client-messages";
import "../globals.css";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
});

const sofia = Sofia_Sans_Extra_Condensed({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sofia",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

function siteUrl(): URL {
  const host =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");
  return new URL(host);
}

interface LocaleParams {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Common" });
  const tHome = await getTranslations({ locale, namespace: "Home" });

  return {
    metadataBase: siteUrl(),
    title: {
      default: `${t("appName")}: ${t("tagline")}`,
      template: `%s | ${t("appName")}`,
    },
    description: tHome("metaDescription"),
    appleWebApp: { capable: true, title: t("appName") },
    alternates: { languages: { en: "/en", ru: "/ru" } },
  };
}

interface RootLayoutProps extends LocaleParams {
  children: ReactNode;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Common" });
  const messages = await clientMessages();

  return (
    <html
      lang={locale}
      className={`${onest.variable} ${sofia.variable}`}
    >
      <body className="min-h-dvh">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <a
              href="#main"
              className="sr-only z-50 rounded-xl bg-card px-4 py-3 font-semibold focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
            >
              {t("skipToContent")}
            </a>
            <SiteHeader />
            <main id="main">{children}</main>
            <SiteFooter />
            <BottomNav />
            <OfflineBanner />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
