import { CatalogLoading } from "@/components/catalog-loading";
import { PlaceGridSkeleton } from "@/components/skeletons";

export default function PlacesLoading() {
  return (
    <CatalogLoading active="places" filterRows={1}>
      <PlaceGridSkeleton count={8} />
    </CatalogLoading>
  );
}
