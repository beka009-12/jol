"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

/* Bottom sheet on phones, floating panel on desktop. */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: BottomSheetProps) {
  const t = useTranslations("Common");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        closeLabel={t("close")}
        className="max-h-[90dvh] gap-0 overflow-y-auto rounded-t-2xl border-0 bg-background lg:inset-x-0 lg:bottom-8 lg:mx-auto lg:max-w-[480px] lg:rounded-2xl"
      >
        <SheetHeader className="gap-1 px-4 pt-6 pb-3 pr-[calc(var(--tap)+--spacing(6))]">
          <SheetTitle className="text-lg font-bold">{title}</SheetTitle>
          <SheetDescription className={description ? "" : "sr-only"}>
            {description ?? title}
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-[calc(--spacing(4)+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
