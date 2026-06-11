import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-full border border-[var(--lq-line-2)] bg-[rgba(255,255,255,0.5)] px-5 text-base text-[var(--lq-ink)] ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[var(--lq-ink-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--launch-lime)] focus-visible:ring-offset-2 focus-visible:border-[var(--lq-ink-2)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-[rgba(255,255,255,0.04)] dark:text-[var(--lq-cream)] dark:border-[rgba(246,242,234,0.18)] dark:placeholder:text-[rgba(246,242,234,0.4)]',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
