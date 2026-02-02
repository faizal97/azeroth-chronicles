import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-heading tracking-wide w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        runic:
          "border-[oklch(0.55_0.18_280/0.5)] bg-[oklch(0.20_0.08_280)] text-[oklch(0.85_0.08_280)] shadow-[0_0_8px_oklch(0.55_0.18_280/0.3)] [a&]:hover:shadow-[0_0_12px_oklch(0.55_0.18_280/0.5)]",
        frost:
          "border-[oklch(0.60_0.12_220/0.5)] bg-[oklch(0.15_0.06_220)] text-[oklch(0.88_0.06_220)] shadow-[0_0_8px_oklch(0.60_0.12_220/0.3)] [a&]:hover:shadow-[0_0_12px_oklch(0.60_0.12_220/0.5)]",
        nature:
          "border-[oklch(0.55_0.15_140/0.5)] bg-[oklch(0.18_0.08_140)] text-[oklch(0.85_0.08_140)] shadow-[0_0_8px_oklch(0.55_0.15_140/0.3)] [a&]:hover:shadow-[0_0_12px_oklch(0.55_0.15_140/0.5)]",
        fire:
          "border-[oklch(0.60_0.20_30/0.5)] bg-[oklch(0.20_0.10_30)] text-[oklch(0.90_0.08_40)] shadow-[0_0_8px_oklch(0.60_0.20_30/0.3)] [a&]:hover:shadow-[0_0_12px_oklch(0.60_0.20_30/0.5)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
