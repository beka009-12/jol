import { TourRowSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="pb-nav">
      <div className="min-h-[32rem] bg-deep lg:min-h-[max(34rem,calc(100svh-var(--header-height)-9rem))]" />
      <div className="page-width py-12 lg:py-12">
        <Skeleton className="mb-8 h-12 w-64" />
        <TourRowSkeleton />
      </div>
    </div>
  );
}
