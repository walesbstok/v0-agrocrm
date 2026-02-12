import { cn } from "@/lib/utils"
import type { Segment } from "@/lib/types"

const segmentStyles: Record<Segment, string> = {
  A: "bg-emerald-100 text-emerald-800 border-emerald-300",
  B: "bg-blue-100 text-blue-800 border-blue-300",
  C: "bg-amber-100 text-amber-800 border-amber-300",
}

export function SegmentBadge({ segment, size = "sm" }: { segment: Segment; size?: "sm" | "lg" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border font-bold",
        segmentStyles[segment],
        size === "lg" ? "h-8 w-8 text-sm" : "h-6 w-6 text-xs"
      )}
    >
      {segment}
    </span>
  )
}
