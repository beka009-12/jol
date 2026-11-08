"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cn } from "cn";
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
  /** Stays in view under the scrolling body: the action the sheet is for. */
  footer?: ReactNode;
  children: ReactNode;
}

/* Bottom sheet on phones, floating panel on desktop. Title and footer stay put; the middle scrolls. */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
}: BottomSheetProps) {
  const t = useTranslations("Common");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        closeLabel={t("close")}
        className="max-h-[90dvh] gap-0 rounded-t-2xl border-0 bg-background lg:inset-x-0 lg:bottom-8 lg:mx-auto lg:max-w-[480px] lg:rounded-2xl"
      >
        <SheetHeader className="shrink-0 gap-1 px-4 pt-6 pb-3 pr-[calc(var(--tap)+--spacing(6))]">
          <SheetTitle className="text-lg font-bold">{title}</SheetTitle>
          <SheetDescription className={description ? "" : "sr-only"}>
            {description ?? title}
          </SheetDescription>
        </SheetHeader>
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto px-4",
            footer ? "pb-6" : "pb-[calc(--spacing(4)+env(safe-area-inset-bottom))]",
          )}
        >
          {children}
        </div>
        {footer && (
          <div className="shrink-0 border-t bg-card px-4 pt-3 pb-[calc(--spacing(3)+env(safe-area-inset-bottom))] lg:rounded-b-2xl">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
