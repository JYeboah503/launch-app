'use client'

/**
 * RevealOnScroll
 * Fades + lifts a child block into view the first time it enters the viewport.
 * Pure React — uses IntersectionObserver, no external animation library.
 *
 * Usage:
 *   <RevealOnScroll>
 *     <YourSection />
 *   </RevealOnScroll>
 *
 *   <RevealOnScroll delay={120} y={32}>
 *     <h2>...</h2>
 *   </RevealOnScroll>
 */

import { ReactNode, useEffect, useRef, useState, CSSProperties } from 'react'

interface RevealOnScrollProps {
  children: ReactNode
  /** ms to wait after enter before animating */
  delay?: number
  /** distance in px to lift from */
  y?: number
  /** total animation duration in ms */
  duration?: number
  /** optional className passthrough */
  className?: string
  /** optional inline style passthrough (merged before motion styles) */
  style?: CSSProperties
  /** if true, animates again whenever scrolled out and back in */
  repeat?: boolean
  /** intersection threshold 0–1 */
  threshold?: number
  /** rootMargin for the observer (e.g. "-10% 0px") */
  rootMargin?: string
  /** as which element to render */
  as?: keyof JSX.IntrinsicElements
}

export function RevealOnScroll({
  children,
  delay = 0,
  y = 24,
  duration = 700,
  className,
  style,
  repeat = false,
  threshold = 0.12,
  rootMargin = '0px 0px -8% 0px',
  as = 'div',
}: RevealOnScrollProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (!repeat) observer.unobserve(node)
        } else if (repeat) {
          setVisible(false)
        }
      },
      { threshold, rootMargin }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [repeat, threshold, rootMargin])

  const motionStyle: CSSProperties = {
    transform: visible ? 'translate3d(0, 0, 0)' : `translate3d(0, ${y}px, 0)`,
    opacity: visible ? 1 : 0,
    transition: `transform ${duration}ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms, opacity ${duration}ms ease-out ${delay}ms`,
    willChange: 'transform, opacity',
  }

  const Tag = as as any
  return (
    <Tag ref={ref as any} className={className} style={{ ...style, ...motionStyle }}>
      {children}
    </Tag>
  )
}
