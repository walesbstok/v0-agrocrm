import { cn } from "@/lib/utils"
import type { ClientStatus } from "@/lib/types"

const statusStyles: Record<ClientStatus, string> = {
  Aktywny: "bg-emerald-100 text-emerald-800",
  Prospekt: "bg-amber-100 text-amber-800",
  Utracony: "bg-red-100 text-red-800",
}

export function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        statusStyles[status]
      )}
    >
      {status}
    </span>
  )
}
