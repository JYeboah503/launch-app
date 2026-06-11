'use client'

/**
 * Sparkline
 * Tiny inline chart for stat tiles. Pure SVG React component — no
 * dependencies. Animates the line drawing in once it scrolls into view.
 *
 * Usage:
 *   <Sparkline data={[12, 14, 11, 16, 19, 22, 24]} stroke="var(--launch-lime)" />
 */

import { useEffect, useId, useRef, useState } from 'react'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  strokeWidth?: number
  /** Filled area gradient under the line */
  fill?: string
  /** Show the last point as a dot */
  dot?: boolean
  /** Animate the line draw on mount/visibility */
  animate?: boolean
  className?: string
}

export function Sparkline({
  data,
  width = 120,
  height = 36,
  stroke = 'var(--launch-lime-3)',
  strokeWidth = 1.6,
  fill = 'rgba(27, 158, 143, 0.18)',
  dot = true,
  animate = true,
  className,
}: SparklineProps) {
  const ref = useRef<SVGSVGElement | null>(null)
  const [visible, setVisible] = useState(!animate)

  useEffect(() => {
    if (!animate) return
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          obs.unobserve(node)
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [animate])

  if (!data || data.length === 0) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padX = strokeWidth + 1
  const padY = strokeWidth + 1

  const points = data.map((v, i) => {
    const x = padX + (i / (data.length - 1)) * (width - 2 * padX)
    const y = height - padY - ((v - min) / range) * (height - 2 * padY)
    return [x, y] as [number, number]
  })

  const linePath = points.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ')
  const areaPath =
    `M ${points[0][0]} ${height - padY} ` +
    points.map(([x, y]) => `L ${x} ${y}`).join(' ') +
    ` L ${points[points.length - 1][0]} ${height - padY} Z`

  const last = points[points.length - 1]
  // Stable, render-deterministic ID — React's useId guarantees server/client
  // parity, avoiding hydration mismatches.
  const reactId = useId()
  const id = `spark-grad-${reactId.replace(/[:]/g, '')}`

  return (
    <svg
      ref={ref}
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.9" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${id})`} stroke="none" opacity={visible ? 1 : 0} style={{ transition: 'opacity 600ms ease 200ms' }} />
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={visible ? 0 : 1}
        style={{ transition: 'stroke-dashoffset 1200ms cubic-bezier(0.2, 0.7, 0.2, 1)' }}
      />
      {dot && (
        <circle
          cx={last[0]}
          cy={last[1]}
          r={2.4}
          fill={stroke}
          opacity={visible ? 1 : 0}
          style={{ transition: 'opacity 400ms ease 1100ms' }}
        />
      )}
    </svg>
  )
}
