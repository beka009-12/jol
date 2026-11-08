import { cn } from "cn";

interface LogoMarkProps {
  className?: string;
}

/* The tunduk, the crown of a yurt: a ring crossed by two sets of three bands. */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx="16" cy="16" r="13.5" />
      <path d="M6.5 6.5C12 12 12 20 6.5 25.5" />
      <path d="M11.5 3.5C18 11 18 21 11.5 28.5" />
      <path d="M17 2.6C23.5 10 23.5 22 17 29.4" />
      <path d="M25.5 6.5C20 12 20 20 25.5 25.5" />
      <path d="M20.5 3.5C14 11 14 21 20.5 28.5" />
      <path d="M15 2.6C8.5 10 8.5 22 15 29.4" />
    </svg>
  );
}

interface LogoProps {
  /** Red on a plain surface; keep it the text colour on a photo, where red would sink. */
  plainMark?: boolean;
  className?: string;
}

export function Logo({ plainMark = false, className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={cn("size-7", !plainMark && "text-primary")} />
      <span className="text-xl font-bold tracking-tight">Jol</span>
    </span>
  );
}
