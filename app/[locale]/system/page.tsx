import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SearchX, Snowflake } from "lucide-react";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AvailabilityBadge } from "@/components/availability-badge";
import { ChipLink } from "@/components/chip";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { OfflineNotice } from "@/components/offline-banner";
import { Price } from "@/components/price";
import { LoadingButtons } from "@/components/system/loading-demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { routing } from "@/i18n/routing";
import { clientMessages } from "@/lib/client-messages";

/*
  The design system on one page, for designers and developers. Never shipped:
  production returns 404. Section names are token names, so this page is the
  one place with copy outside messages/.
*/

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

interface SystemPageProps {
  params: Promise<{ locale: string }>;
}

const COLORS = [
  { token: "background", hex: "#FFFFFF", role: "Основа страницы" },
  { token: "foreground", hex: "#15181E", role: "Текст, выбранный чип и дата" },
  { token: "muted-foreground", hex: "#5B616D", role: "Вторичный текст, 6.2:1" },
  { token: "secondary", hex: "#F0F1F3", role: "Чипы, заметки, пустые состояния" },
  { token: "border", hex: "#E2E4E8", role: "Разделители, рамки групп" },
  { token: "deep", hex: "#0F2A26", role: "Тёмные полосы: схема дорог, AI-гид" },
  { token: "primary", hex: "#C8261B", role: "Одно главное действие, «вы здесь». ≤10% экрана" },
  { token: "danger", hex: "#A8170E", role: "Ошибки: только текст с иконкой или рамка" },
  { token: "open", hex: "#14632F", role: "Статус: открыто" },
  { token: "soon", hex: "#8A3C06", role: "Статус: скоро" },
  { token: "closed", hex: "#4B5260", role: "Статус: закрыто" },
  { token: "sun", hex: "#F5B81F", role: "Рейтинг, выбор на тёмной полосе" },
] as const;

const TYPE = [
  { name: "display-xl", className: "font-display text-display-xl font-extrabold", note: "Hero, 56–116 / 1.1" },
  { name: "display-lg", className: "font-display text-display-lg font-extrabold", note: "Заголовок раздела, 44–72 / 1.1" },
  { name: "display-md", className: "font-display text-display-md font-extrabold", note: "H1 страницы, 36–52 / 1.1" },
  { name: "xl", className: "text-xl font-bold", note: "Onest 24 / 30" },
  { name: "lg", className: "text-lg font-semibold", note: "Onest 20 / 26" },
  { name: "base", className: "text-base", note: "Onest 16 / 24, основной текст" },
  { name: "sm", className: "text-sm", note: "Onest 15 / 22, подписи и мета" },
  { name: "xs", className: "text-xs", note: "Onest 13 / 20, бейджи. Меньше не бывает" },
] as const;

const SPACING = [
  { step: "1", px: 4, className: "w-1" },
  { step: "2", px: 8, className: "w-2" },
  { step: "3", px: 12, className: "w-3" },
  { step: "4", px: 16, className: "w-4" },
  { step: "6", px: 24, className: "w-6" },
  { step: "8", px: 32, className: "w-8" },
  { step: "12", px: 48, className: "w-12" },
] as const;

interface BlockProps {
  title: string;
  note: string;
  children: ReactNode;
}

function Block({ title, note, children }: BlockProps) {
  return (
    <section className="border-t py-8 lg:py-12">
      <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
        <div className="mb-6 lg:mb-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 max-w-[40ch] text-sm text-muted-foreground">{note}</p>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

export default async function SystemPage({ params }: SystemPageProps) {
  if (process.env.NODE_ENV === "production") notFound();
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const tRequest = await getTranslations("Request");
  const tTours = await getTranslations("Tours");
  const tCategories = await getTranslations("Categories");
  const tSearch = await getTranslations("Search");
  const tErrors = await getTranslations("Errors");
  const messages = await clientMessages("Request");

  return (
    <div className="page-width pt-8 pb-nav lg:pt-12">
      <h1 className="font-display text-display-md font-extrabold">Jol design system</h1>
      <p className="mt-2 mb-8 max-w-[60ch] text-pretty text-muted-foreground">
        Направление «Дорожная схема»: белая основа, чернильный текст, тёмно-еловые
        полосы и один красный акцент. Только для разработки, в продакшене 404.
      </p>

      <Block title="Цвет" note="Нейтральная основа и один акцент. Статусы не берут красный, выбор не берёт красный.">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {COLORS.map((color) => (
            <li key={color.token}>
              <div
                className="h-16 rounded-xl border"
                style={{ background: `var(--${color.token})` }}
              />
              <p className="mt-2 text-sm font-semibold">{color.token}</p>
              <p className="text-xs text-muted-foreground">
                {color.hex}. {color.role}
              </p>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Типографика" note="Sofia Sans Extra Condensed для заголовков, Onest для всего остального. Два начертания на экран.">
        <ul className="space-y-4">
          {TYPE.map((style) => (
            <li key={style.name} className="flex flex-col gap-1 lg:flex-row lg:items-baseline lg:gap-6">
              <span className="w-28 shrink-0 text-xs text-muted-foreground">
                {style.name}
              </span>
              <span className={`${style.className} min-w-0 text-balance`}>
                Конный тур на Сон-Куль, жильё и ёмкий ужин
              </span>
              <span className="text-xs text-muted-foreground lg:ml-auto">{style.note}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Отступы" note="Только 4, 8, 12, 16, 24, 32, 48. lib/design-scale.test.ts не пропустит другое.">
        <ul className="space-y-2">
          {SPACING.map((space) => (
            <li key={space.step} className="flex items-center gap-4 text-sm">
              <span className="w-16 shrink-0 text-muted-foreground">
                {space.px}px
              </span>
              <span className={`h-4 rounded-sm bg-foreground ${space.className}`} />
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Button" note="Глагол в тексте. Наведите и нажмите, чтобы увидеть hover и pressed. Disabled серый, loading сохраняет цвет и фокус.">
        <div className="flex flex-wrap gap-3">
          <Button size="lg">{tRequest("submit")}</Button>
          <Button variant="secondary">{tSearch("submit")}</Button>
          <Button variant="outline">{tTours("emptyClear")}</Button>
          <Button variant="ghost">{tSearch("emptyAction")}</Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button disabled>{tRequest("submit")}</Button>
          <Button variant="outline" disabled>
            {tTours("emptyClear")}
          </Button>
          <NextIntlClientProvider messages={messages}>
            <LoadingButtons />
          </NextIntlClientProvider>
        </div>
      </Block>

      <Block title="Chip" note="Фильтр-ссылка: у каждого состояния свой адрес. Выбранный чип чернильный, не красный.">
        <div className="flex flex-wrap gap-2">
          <ChipLink href="/system" active>
            {tTours("allCategories")}
          </ChipLink>
          <ChipLink href="/system">
            <Snowflake className="size-4" aria-hidden />
            {tCategories("ski")}
          </ChipLink>
          <ChipLink href="/system">{tCategories("horse")}</ChipLink>
          <ChipLink href="/system">{tCategories("yurt")}</ChipLink>
        </div>
      </Block>

      <Block title="Badge" note="Только статус: точка, цвет и слово вместе. На фото — белый.">
        <div className="flex flex-wrap items-center gap-2">
          <AvailabilityBadge availability="open" />
          <AvailabilityBadge availability="opens_soon" opensOn="2026-12-01" />
          <AvailabilityBadge availability="closed" opensOn="2027-06-01" />
          <AvailabilityBadge availability="sold_out" />
          <Badge tone="danger">{tRequest("datesError")}</Badge>
          <span className="rounded-xl bg-deep p-2">
            <AvailabilityBadge availability="closed" opensOn="2027-06-01" onPhoto />
          </span>
        </div>
      </Block>

      <Block title="Card" note="Поверхность по задаче: outline для группы фактов, muted для заметки и состояний, floating — единственная с тенью.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card surface="outline">
            <p className="font-semibold">outline</p>
            <Price amount={3_800_000} className="mt-1" />
          </Card>
          <Card surface="muted">
            <p className="font-semibold">muted</p>
            <p className="mt-1 text-sm text-muted-foreground">{tRequest("description")}</p>
          </Card>
          <Card surface="floating">
            <p className="font-semibold">floating</p>
            <p className="mt-1 text-sm text-muted-foreground">{tSearch("whatPlaceholder")}</p>
          </Card>
        </div>
      </Block>

      <Block title="Input" note="Высота 48, рамка 3.4:1. Ошибка: красная рамка и текст под полем, что исправить.">
        <div className="grid max-w-md gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium">{tRequest("nameLabel")}</span>
            <Input placeholder="Айгуль" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">{tRequest("phoneLabel")}</span>
            <Input aria-invalid defaultValue="900 12" aria-describedby="phone-error" />
            <span id="phone-error" className="text-sm text-danger">
              {tRequest("phoneError")}
            </span>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">{tSearch("whatLabel")}</span>
            <Input disabled placeholder={tSearch("whatPlaceholder")} />
          </label>
        </div>
      </Block>

      <Block title="Skeleton" note="Повторяет форму того, что загрузится, чтобы страница не прыгала.">
        <div className="grid max-w-md grid-cols-2 gap-4">
          {[0, 1].map((key) => (
            <div key={key}>
              <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
              <Skeleton className="mt-3 h-5 w-4/5" />
              <Skeleton className="mt-2 h-4 w-3/5" />
            </div>
          ))}
        </div>
      </Block>

      <Block title="Состояния" note="Empty предлагает, что сделать вместо. Error говорит, что случилось и что нажать. Offline появляется сам, когда пропадает сеть.">
        <div className="grid gap-4 lg:grid-cols-2">
          <EmptyState
            icon={<SearchX aria-hidden />}
            title={tTours("empty")}
            body={tSearch("emptyBody")}
            actionLabel={tTours("emptyClear")}
            actionHref="/tours"
          />
          <ErrorState title={tErrors("pageTitle")} body={tErrors("pageBody")} />
        </div>
        <div className="mt-4">
          <OfflineNotice />
        </div>
      </Block>
    </div>
  );
}
