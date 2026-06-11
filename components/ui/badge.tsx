import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/* Editorial badge — uppercase mono labels with subtle backgrounds. */

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--launch-lime)] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--launch-lime-soft)] text-[var(--lq-ink)] hover:bg-[var(--launch-lime-soft)]',
        lime:
          'bg-[var(--launch-lime)] text-[var(--lq-ink)] hover:bg-[var(--launch-lime-2)]',
        secondary:
          'bg-[rgba(14,24,51,0.06)] text-[var(--lq-ink-2)] hover:bg-[rgba(14,24,51,0.1)] dark:bg-[rgba(255,255,255,0.06)] dark:text-[rgba(246,242,234,0.8)]',
        ink:
          'bg-[var(--lq-ink)] text-[var(--lq-cream)]',
        destructive:
          'bg-[rgba(220,20,60,0.12)] text-[#7a0e2a] dark:text-[#ff8a8a] dark:bg-[rgba(255,138,138,0.12)]',
        outline:
          'border border-[var(--lq-line-2)] bg-transparent text-[var(--lq-ink-2)] dark:text-[rgba(246,242,234,0.8)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      style={{ fontFamily: 'var(--font-mono)' }}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
