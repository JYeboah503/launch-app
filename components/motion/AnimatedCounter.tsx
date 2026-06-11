'use client'

/**
 * AnimatedCounter
 * Counts a number from 0 (or `from`) up to `value` once it scrolls into view.
 * Respects prefers-reduced-motion.
 */

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  from?: number
  duration?: number
  /** characters appended after the number, e.g. "+", "%", "x" */
  suffix?: string
  /** characters prepended (e.g. "$") */
  prefix?: string
  /** decimal places */
  decimals?: number
  /** optional className passthrough on the wrapping <span> */
  className?: string
}

export function AnimatedCounter({
  value,
  from = 0,
  duration = 1400,
  suffix = '',
  prefix = '',
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [displayed, setDisplayed] = useState(from)
  const triggered = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      setDisplayed(value)
      triggered.current = true
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true
          const start = performance.now()
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration)
            // ease-out cubic
            const eased = 1 - Math.pow(1 - t, 3)
            setDisplayed(from + (value - from) * eased)
            if (t < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          observer.unobserve(node)
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [value, from, duration])

  const text = displayed.toFixed(decimals)
  return (
    <span ref={ref} className={className}>
      {prefix}
      {text}
      {suffix}
    </span>
  )
}
