import { getTranslations } from "next-intl/server";
import { CATALOG_SECTIONS } from "@/components/catalog-tabs";
import { LanguageSwitch } from "@/components/language-switch";
import { Logo } from "@/components/logo";
import { Link } from "@/i18n/navigation";
import { USE_MOCKS } from "@/lib/api/config";

const LINK =
  "inline-flex min-h-10 items-center rounded-lg text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground";

const REGION_LINKS = ["chuy", "issyk-kul", "naryn", "osh", "jalal-abad"] as const;

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const tNav = await getTranslations("Nav");
  const tCommon = await getTranslations("Common");

  return (
    <footer className="border-t bg-surface pb-nav lg:pb-0 [body:has([data-no-footer])_&]:hidden">
      <div className="page-width grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:py-12">
        <div>
          <Link
            href="/"
            aria-label={tCommon("appName")}
            className="inline-flex h-11 items-center rounded-xl"
          >
            <Logo />
          </Link>
          <p className="mt-2 max-w-[22rem] text-sm text-pretty text-muted-foreground">
            {t("about")}
          </p>
          <LanguageSwitch className="mt-3 -ml-2" />
        </div>

        <nav aria-labelledby="footer-catalog">
          <h2 id="footer-catalog" className="mb-1 font-semibold">
            {t("catalog")}
          </h2>
          <ul>
            {CATALOG_SECTIONS.map(({ key, href, label }) => (
              <li key={key}>
                <Link href={href} className={LINK}>
                  {tNav(label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-regions">
          <h2 id="footer-regions" className="mb-1 font-semibold">
            {t("regions")}
          </h2>
          <ul>
            {REGION_LINKS.map((region) => (
              <li key={region}>
                <Link
                  href={{ pathname: "/search", query: { region } }}
                  prefetch={false}
                  className={LINK}
                >
                  {t(`regionNames.${region}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-more">
          <h2 id="footer-more" className="mb-1 font-semibold">
            {t("more")}
          </h2>
          <ul>
            <li>
              <Link href="/guide" className={LINK}>
                {tNav("guide")}
              </Link>
            </li>
            <li>
              <Link href="/business" className={LINK}>
                {t("business")}
              </Link>
            </li>
            <li>
              <Link href="/profile" className={LINK}>
                {tNav("profile")}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="page-width">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t py-3">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {tCommon("appName")}
            {USE_MOCKS && <span className="ml-2">{t("demoNotice")}</span>}
          </p>
          <a
            href="/photos/CREDITS.md"
            target="_blank"
            rel="noopener"
            className={LINK}
          >
            {t("credits")}
          </a>
        </div>
      </div>
    </footer>
  );
}
