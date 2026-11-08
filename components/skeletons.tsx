import { cn } from "cn";
import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton({
  className,
  compactOnPhone = false,
}: {
  className?: string;
  compactOnPhone?: boolean;
}) {
  return (
    <div
      className={cn(
        compactOnPhone && "grid grid-cols-[7rem_minmax(0,1fr)] items-start gap-4 sm:block",
        className,
      )}
    >
      <Skeleton
        className={cn(
          "aspect-[4/3] w-full rounded-2xl",
          compactOnPhone && "max-sm:aspect-square max-sm:rounded-xl",
        )}
      />
      <div className={compactOnPhone ? "sm:mt-3" : "mt-3"}>
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="mt-2 h-4 w-3/5" />
        <Skeleton className="mt-2 h-4 w-4/5" />
      </div>
    </div>
  );
}

export function SeasonChipsSkeleton() {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-hidden px-4 lg:mx-0 lg:px-0">
      {[148, 172, 124].map((width) => (
        <Skeleton
          key={width}
          className="h-11 shrink-0 rounded-xl"
          style={{ width }}
        />
      ))}
    </div>
  );
}

export function TourRowSkeleton() {
  return (
    <div className="-mx-4 flex gap-4 overflow-hidden px-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:px-0">
      {[0, 1, 2, 3].map((key) => (
        <CardSkeleton key={key} className="w-[272px] shrink-0 lg:w-auto" />
      ))}
    </div>
  );
}


/* Matches the list pages: rows on a phone, a grid from a tablet up. */
export function TourGridSkeleton({ compactOnPhone = true }: { compactOnPhone?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((key) => (
        <CardSkeleton key={key} compactOnPhone={compactOnPhone} />
      ))}
    </div>
  );
}

export function CompanyListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="@container divide-y border-y">
      {Array.from({ length: count }, (_, key) => (
        <div
          key={key}
          className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 py-4 @4xl:grid-cols-[3.5rem_minmax(0,17rem)_minmax(0,1fr)_minmax(0,12rem)] @4xl:items-center @4xl:gap-x-6 @4xl:py-6"
        >
          <Skeleton className="size-14 rounded-xl" />
          <div className="self-center">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </div>
          <Skeleton className="col-start-2 h-4 w-full @4xl:col-start-3 @4xl:row-start-1" />
          <Skeleton className="col-start-2 h-4 w-2/3 @4xl:col-start-4 @4xl:row-start-1" />
        </div>
      ))}
    </div>
  );
}

export function PlaceGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
      {Array.from({ length: count }, (_, key) => (
        <div key={key}>
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <Skeleton className="mt-3 h-5 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/2" />
          <Skeleton className="mt-2 h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}

export function TourListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2 lg:gap-x-6">
      {Array.from({ length: count }, (_, key) => (
        <div key={key} className="flex gap-3">
          <Skeleton className="size-20 shrink-0 rounded-2xl" />
          <div className="flex-1 pt-1">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="mt-2 h-4 w-3/5" />
            <Skeleton className="mt-2 h-4 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Photo, then the text column and the trip card beside it. */
export function PlaceDetailSkeleton() {
  return (
    <div>
      <div className="lg:page-width lg:pt-6">
        <Skeleton className="aspect-[16/10] w-full rounded-none lg:aspect-auto lg:h-[26rem] lg:rounded-2xl" />
      </div>
      <div className="page-width mt-6 lg:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
        <div>
          <Skeleton className="h-12 w-3/5" />
          <Skeleton className="mt-2 h-5 w-1/4" />
          <Skeleton className="mt-4 h-6 w-full" />
          <Skeleton className="mt-2 h-6 w-4/5" />
          <Skeleton className="mt-12 h-6 w-2/5" />
          <Skeleton className="mt-3 h-48 w-full rounded-2xl" />
        </div>
        <Skeleton className="mt-6 h-96 w-full rounded-2xl lg:mt-0" />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="lg:page-width lg:pt-6">
      <Skeleton className="aspect-[16/10] w-full rounded-none lg:aspect-auto lg:h-[26rem] lg:rounded-2xl" />
      <div className="page-width mt-4 lg:px-0">
        <Skeleton className="h-8 w-4/5" />
        <Skeleton className="mt-3 h-5 w-3/5" />
        <Skeleton className="mt-3 h-7 w-28 rounded-full" />
        <div className="mt-6 flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="mt-8 h-6 w-2/5" />
        <Skeleton className="mt-3 h-14 w-full" />
        <Skeleton className="mt-8 h-6 w-2/5" />
        <Skeleton className="mt-3 h-24 w-full" />
      </div>
    </div>
  );
}

export function RequestListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {[0, 1].map((key) => (
        <div key={key} className="flex gap-3">
          <Skeleton className="size-20 shrink-0 rounded-2xl" />
          <div className="flex-1 pt-1">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="mt-2 h-4 w-3/5" />
            <Skeleton className="mt-2 h-4 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
