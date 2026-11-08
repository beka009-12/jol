import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface BackLinkProps {
  href: string;
  className?: string;
}

export function BackLink({ href, className }: BackLinkProps) {
  const t = useTranslations("Common");
  return (
    <Link
      href={href}
      aria-label={t("back")}
      className={`inline-grid size-11 place-items-center rounded-full bg-card text-foreground shadow-sm transition-colors duration-150 hover:bg-secondary ${className ?? ""}`}
    >
      <ChevronLeft className="size-6" aria-hidden />
    </Link>
  );
}
