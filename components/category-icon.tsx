import {
  Footprints,
  Landmark,
  type LucideIcon,
  Route,
  Snowflake,
  Tent,
} from "lucide-react";
import type { TourCategory } from "@/lib/types";

export const CATEGORIES: TourCategory[] = [
  "ski",
  "horse",
  "yurt",
  "trek",
  "culture",
];

const ICONS: Record<TourCategory, LucideIcon> = {
  ski: Snowflake,
  horse: Route,
  yurt: Tent,
  trek: Footprints,
  culture: Landmark,
};

interface CategoryIconProps {
  category: TourCategory;
  className?: string;
}

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const Icon = ICONS[category];
  return <Icon className={className} aria-hidden />;
}
