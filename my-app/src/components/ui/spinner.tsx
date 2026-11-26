import { cn } from "cn"
import { Loader2Icon } from "lucide-react"

import { text } from "@/content/text"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon data-slot="spinner" role="status" aria-label={text.loading} className={cn("size-4 animate-spin", className)} {...props} />
  )
}

export { Spinner }
