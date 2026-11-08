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
        <Skeleton className="mb-6 h-12 w-48 lg:mb-8" />
        <div className="space-y-2">
          {Array.from({ length: filterRows }, (_, row) => (
            <SeasonChipsSkeleton key={row} />
          ))}
        </div>
        <div className="mt-6">{children ?? <TourGridSkeleton />}</div>
      </div>
    </>
  );
}
