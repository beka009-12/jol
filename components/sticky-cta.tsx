import type { ReactNode } from "react";

interface StickyCtaProps {
  children: ReactNode;
}

export function StickyCta({ children }: StickyCtaProps) {
  return (
    <div
      data-sticky-cta
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="page-width flex items-center gap-2 py-3">{children}</div>
    </div>
  );
}
