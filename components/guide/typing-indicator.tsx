interface TypingIndicatorProps {
  label: string;
  showLabel?: boolean;
}

export function TypingIndicator({
  label,
  showLabel = false,
}: TypingIndicatorProps) {
  return (
    <div role="status" className="flex h-6 items-center gap-2">
      <span aria-hidden className="flex gap-1">
        {[0, 200, 400].map((delay) => (
          <span
            key={delay}
            className="size-2 animate-[typing-dot_1.2s_ease-in-out_infinite] rounded-full bg-muted-foreground"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
      <span
        className={showLabel ? "text-sm text-muted-foreground" : "sr-only"}
      >
        {label}
      </span>
    </div>
  );
}
