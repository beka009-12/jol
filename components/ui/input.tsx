import * as React from "react"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-xl border border-input bg-card px-4 text-base transition-colors duration-150 placeholder:text-muted-foreground disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:border-foreground focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-foreground",
        "aria-invalid:border-destructive aria-invalid:outline-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
