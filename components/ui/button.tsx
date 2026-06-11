import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/* Editorial pill button — lime accent for primary, navy outline for secondary,
   ghost for tertiary, dark for emphasis. Designed to feel of a piece with the
   LQ scenario flow without abandoning shadcn's API surface. */

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold leading-none ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--launch-lime)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-[1px]',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--launch-lime)] text-[var(--lq-ink)] shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_6px_18px_var(--launch-lime-soft)] hover:-translate-y-[1px] hover:bg-[var(--launch-lime-2)] hover:shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_8px_24px_var(--launch-lime-glow)]',
        primary:
          'bg-[var(--launch-lime)] text-[var(--lq-ink)] shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_6px_18px_var(--launch-lime-soft)] hover:-translate-y-[1px] hover:bg-[var(--launch-lime-2)] hover:shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_8px_24px_var(--launch-lime-glow)]',
        ink:
          'bg-[var(--lq-ink)] text-[var(--lq-cream)] hover:-translate-y-[1px] hover:bg-[var(--launch-navy-2)]',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-[var(--lq-line-2)] bg-transparent text-[var(--lq-ink)] hover:-translate-y-[1px] hover:border-[var(--lq-ink)] hover:bg-[rgba(14,24,51,0.04)] dark:text-[var(--lq-cream)] dark:border-[rgba(246,242,234,0.2)] dark:hover:bg-[rgba(246,242,234,0.06)]',
        secondary:
          'bg-secondary text-secondary-foreground hover:-translate-y-[1px] hover:bg-secondary/80',
        ghost:
          'bg-transparent text-[var(--lq-ink-2)] hover:bg-[rgba(14,24,51,0.05)] hover:text-[var(--lq-ink)] dark:text-[rgba(246,242,234,0.7)] dark:hover:bg-[rgba(246,242,234,0.06)] dark:hover:text-[var(--lq-cream)]',
        link: 'text-[var(--launch-navy)] underline-offset-4 hover:underline rounded-none px-0',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-7 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
