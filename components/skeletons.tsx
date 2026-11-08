import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
      <Skeleton className="mt-3 h-5 w-4/5" />
      <Skeleton className="mt-2 h-4 w-3/5" />
      <Skeleton className="mt-2 h-4 w-4/5" />
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


export function TourGridSkeleton() {
  return (
    <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((key) => (
        <CardSkeleton key={key} />
      ))}
    </div>
  );
}

export function PlaceGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: count }, (_, key) => (
        <div key={key}>
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <Skeleton className="mt-2 h-5 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/2" />
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

export function DetailSkeleton() {
  return (
    <div className="lg:page-width lg:pt-6">
      <Skeleton className="aspect-[16/10] w-full rounded-none lg:aspect-[21/9] lg:rounded-2xl" />
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
