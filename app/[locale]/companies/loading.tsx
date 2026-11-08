import { CatalogLoading } from "@/components/catalog-loading";
import { CompanyListSkeleton } from "@/components/skeletons";

export default function CompaniesLoading() {
  return (
    <CatalogLoading active="companies">
      <CompanyListSkeleton />
    </CatalogLoading>
  );
}
