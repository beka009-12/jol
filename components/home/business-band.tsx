import { ArrowRight, BadgeCheck, MessageCircle, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LogoMark } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export async function BusinessBand() {
  const t = await getTranslations("Home");

  const points = [
    { icon: Search, label: t("businessPointSearch") },
    { icon: MessageCircle, label: t("businessPointGuide") },
    { icon: BadgeCheck, label: t("businessPointVerified") },
  ];

  return (
    <section
      aria-labelledby="business-title"
      className="relative overflow-hidden border-t py-12 lg:py-12"
    >
      <LogoMark className="pointer-events-none absolute -right-20 -bottom-28 size-[26rem] text-foreground/[0.04] lg:right-10 lg:-bottom-40 lg:size-[36rem]" />
      <div className="page-width relative">
        <h2
          id="business-title"
          className="max-w-[16em] font-display text-display-lg font-extrabold text-balance"
        >
          {t("businessTitle")}
        </h2>
        <ul className="mt-6 grid max-w-[46rem] gap-3 sm:grid-cols-3">
          {points.map(({ icon: Icon, label }) => (
            <li key={label} className="flex gap-3 text-pretty">
              <Icon className="mt-1 size-5 shrink-0" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
        <Link
          href="/business"
          className={`${buttonVariants({ size: "lg" })} mt-8`}
        >
          {t("businessCta")}
          <ArrowRight aria-hidden />
        </Link>
      </div>
    </section>
  );
}
