import { TourGridSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="pb-nav">
      <div className="bg-surface pt-[calc(env(safe-area-inset-top)+--spacing(6))] pb-6 lg:pt-12 lg:pb-8">
        <div className="page-width">
          <Skeleton className="mb-6 h-12 w-72" />
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 lg:grid-cols-[minmax(0,1fr)_14rem_auto]">
            <Skeleton className="col-span-2 h-12 lg:col-span-1" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12 w-24 lg:w-28" />
          </div>
        </div>
      </div>
      <div className="page-width mt-6 lg:mt-8">
        <TourGridSkeleton />
      </div>
    </div>
  );
}
