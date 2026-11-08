import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-xl border border-input bg-card px-4 py-3 text-base transition-colors duration-150 placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-foreground disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
