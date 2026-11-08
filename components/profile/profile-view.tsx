"use client";

import { useQuery } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "cn";
import { useAuth } from "@/components/auth-provider";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LanguageSwitch } from "@/components/language-switch";
import { Photo } from "@/components/photo";
import { SignInPanel } from "@/components/sign-in-panel";
import { RequestListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { getMyRequests } from "@/lib/api/client";
import { isUnauthorized } from "@/lib/api/errors";
import { formatDate, formatSom } from "@/lib/format";
import type { Locale, TourRequestStatus, User } from "@/lib/types";

const STATUS_STYLE: Record<TourRequestStatus, string> = {
  new: "bg-soon-soft text-soon",
  confirmed: "bg-open-soft text-open",
  declined: "bg-closed-soft text-closed",
};

function MyRequests() {
  const t = useTranslations("Profile");
  const tPrice = useTranslations("Price");
  const locale = useLocale() as Locale;
  const { signOut } = useAuth();

  const requests = useQuery({
    queryKey: ["my-requests", locale],
    queryFn: async () => {
      try {
        return await getMyRequests(locale);
      } catch (error) {
        if (isUnauthorized(error)) signOut();
        throw error;
      }
    },
  });

  if (requests.isPending) return <RequestListSkeleton />;
  if (requests.isError) {
    return (
      <ErrorState
        title={t("requestsError")}
        onRetry={() => requests.refetch()}
      />
    );
  }
  if (requests.data.length === 0) {
    return (
      <EmptyState
        title={t("requestsEmpty")}
        actionLabel={t("requestsEmptyAction")}
        actionHref="/tours"
      />
    );
  }

  const statusLabel: Record<TourRequestStatus, string> = {
    new: t("statusNew"),
    confirmed: t("statusConfirmed"),
    declined: t("statusDeclined"),
  };

  return (
    <ul className="grid gap-3 lg:grid-cols-2 lg:gap-x-6">
      {requests.data.map((request) => (
        <li key={request.id}>
          <Link
            href={`/tours/${request.tour.slug}`}
            className="group flex items-center gap-3 rounded-2xl"
          >
            <Photo
              photo={request.tour.photo}
              sizes="80px"
              aspect="square"
              interactive
              className="w-20 shrink-0 rounded-2xl"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">
                {request.tour.title}
              </span>
              <span className="block text-sm text-muted-foreground">
                {formatDate(request.date, locale)}
                {" · "}
                {t("requestPeople", {
                  count: request.adults + request.children,
                })}
                {" · "}
                {tPrice("som", { som: formatSom(request.total, locale) })}
              </span>
              <span
                className={cn(
                  "mt-1 inline-flex h-7 items-center rounded-full px-3 text-xs font-medium",
                  STATUS_STYLE[request.status],
                )}
              >
                {statusLabel[request.status]}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Avatar({ user }: { user: User }) {
  if (user.avatar_url) {
    return (
      <Image
        src={user.avatar_url}
        alt=""
        width={56}
        height={56}
        className="size-14 rounded-full"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="grid size-14 place-items-center rounded-full bg-secondary text-lg font-bold"
    >
      {user.name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function ProfileView() {
  const t = useTranslations("Profile");
  const { user, isSignedIn, isReady, signOut } = useAuth();

  return (
    <div className="page-width pt-4 pb-nav lg:max-w-[880px] lg:pt-8">
      <h1 className="mb-4 font-display text-display-md font-extrabold">{t("title")}</h1>

      {!isReady ? (
        <div className="flex items-center gap-3" aria-hidden>
          <Skeleton className="size-14 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="mt-2 h-4 w-3/5" />
          </div>
        </div>
      ) : isSignedIn && user ? (
        <div className="flex items-center gap-3">
          <Avatar user={user} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-secondary p-6">
          <h2 className="font-semibold">{t("signInTitle")}</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            {t("signInBody")}
          </p>
          <SignInPanel />
        </div>
      )}

      {isReady && isSignedIn && (
        <section aria-labelledby="my-requests" className="mt-8">
          <h2 id="my-requests" className="mb-3 text-lg font-bold">
            {t("requestsTitle")}
          </h2>
          <MyRequests />
        </section>
      )}

      <section aria-labelledby="language" className="mt-8">
        <h2 id="language" className="mb-3 text-lg font-bold">
          {t("languageLabel")}
        </h2>
        <LanguageSwitch variant="full" className="lg:max-w-[320px]" />
      </section>

      {isReady && isSignedIn && (
        <Button
          variant="secondary"
          size="lg"
          className="mt-8 w-full lg:w-auto"
          onClick={signOut}
        >
          <LogOut aria-hidden />
          {t("signOut")}
        </Button>
      )}
    </div>
  );
}
