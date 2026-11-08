import type { ReactNode } from "react";
import { type CatalogSection, CatalogTabs } from "@/components/catalog-tabs";
import { SeasonChipsSkeleton, TourGridSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

interface CatalogLoadingProps {
  active: CatalogSection;
  filterRows?: number;
  children?: ReactNode;
}

export function CatalogLoading({
  active,
  filterRows = 2,
  children,
}: CatalogLoadingProps) {
  return (
    <>
      <CatalogTabs active={active} />
      <div className="page-width pt-6 pb-nav lg:pt-12">
        <div className="mb-6 lg:mb-8">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="mt-2 h-5 w-full max-w-[36rem]" />
        </div>
        <div className="space-y-4 border-b pb-6 lg:space-y-3">
          {Array.from({ length: filterRows }, (_, row) => (
            <div
              key={row}
              className="lg:grid lg:grid-cols-[10rem_minmax(0,1fr)] lg:items-center lg:gap-4"
            >
              <Skeleton className="mb-2 h-4 w-24 lg:mb-0" />
              <SeasonChipsSkeleton />
            </div>
          ))}
        </div>
        <div className="mt-6">{children ?? <TourGridSkeleton />}</div>
      </div>
    </>
  );
}
