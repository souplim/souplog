import * as React from "react"
import { cn } from "cn"

// `bg-border` rather than `bg-muted`: on a 99.2% background the muted surface
// (97.3%) is too faint to read as a placeholder. `motion-safe` keeps the pulse
// off for anyone who asked for reduced motion.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("shrink-0 rounded-sm bg-border motion-safe:animate-pulse", className)}
      {...props}
    />
  )
}

export { Skeleton }
