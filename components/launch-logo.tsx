'use client'

import { CSSProperties } from 'react'

interface LaunchLogoProps {
  /** target rendered height in CSS pixels */
  height?: number
  /** colour token or hex */
  color?: string
  className?: string
  style?: CSSProperties
  ariaLabel?: string
}

/**
 * LaunchLogo — custom-drawn LAUNCH wordmark.
 *
 * Letterform notes:
 *   L = standard
 *   A = solid filled triangle (no crossbar, no negative space)
 *   U = solid "tombstone" — flat top, vertical sides, rounded bottom (no inner cutout)
 *   N = standard (two verticals + diagonal)
 *   C = standard (open on the right)
 *   H = solid filled rectangle — every gap (top *and* bottom) filled in.
 *
 * The whole thing is one inline SVG so it scales sharply at any size and
 * recolours via the `color` prop.
 */
export function LaunchLogo({
  height = 96,
  color = 'var(--launch-navy)',
  className,
  style,
  ariaLabel = 'LAUNCH',
}: LaunchLogoProps) {
  // Each letter is normalised to height 100. Widths chosen for visual
  // even-ness given the silhouette of each shape.
  const STROKE = 18 // bar thickness for L, U, N, C, H
  const LETTER_H = 100
  const GAP = 18 // space between letters

  // --- L ---
  const L_W = 70
  const Lpath = `M 0 0 L ${STROKE} 0 L ${STROKE} ${LETTER_H - STROKE} L ${L_W} ${LETTER_H - STROKE} L ${L_W} ${LETTER_H} L 0 ${LETTER_H} Z`

  // --- A (solid triangle) ---
  const A_W = 100
  const Apath = `M ${A_W / 2} 0 L ${A_W} ${LETTER_H} L 0 ${LETTER_H} Z`

  // --- U (solid tombstone) ---
  const U_W = 90
  // Top is flat. Sides go straight down to y = LETTER_H - radius, then sweep
  // inward to a single point at the bottom centre (rounded bottom).
  const U_R = U_W / 2
  const Upath =
    `M 0 0 ` +
    `L ${U_W} 0 ` +
    `L ${U_W} ${LETTER_H - U_R} ` +
    `Q ${U_W} ${LETTER_H}, ${U_W / 2} ${LETTER_H} ` +
    `Q 0 ${LETTER_H}, 0 ${LETTER_H - U_R} ` +
    `Z`

  // --- N ---
  const N_W = 95
  const Npath =
    `M 0 0 ` +
    `L ${STROKE} 0 ` +
    `L ${N_W - STROKE} ${LETTER_H * 0.72} ` +
    `L ${N_W - STROKE} 0 ` +
    `L ${N_W} 0 ` +
    `L ${N_W} ${LETTER_H} ` +
    `L ${N_W - STROKE} ${LETTER_H} ` +
    `L ${STROKE} ${LETTER_H * 0.28} ` +
    `L ${STROKE} ${LETTER_H} ` +
    `L 0 ${LETTER_H} ` +
    `Z`

  // --- C (open on the right) ---
  const C_W = 90
  const C_CX = C_W / 2
  const C_CY = LETTER_H / 2
  const C_OUTER = LETTER_H / 2
  const C_INNER = C_OUTER - STROKE
  // mouth opening at ±30° from horizontal (so opening spans 60°)
  const COS30 = Math.cos((Math.PI * 30) / 180)
  const SIN30 = Math.sin((Math.PI * 30) / 180)
  const Cpath =
    `M ${(C_CX + C_OUTER * COS30).toFixed(2)} ${(C_CY - C_OUTER * SIN30).toFixed(2)} ` +
    `A ${C_OUTER} ${C_OUTER} 0 1 0 ${(C_CX + C_OUTER * COS30).toFixed(2)} ${(C_CY + C_OUTER * SIN30).toFixed(2)} ` +
    `L ${(C_CX + C_INNER * COS30).toFixed(2)} ${(C_CY + C_INNER * SIN30).toFixed(2)} ` +
    `A ${C_INNER} ${C_INNER} 0 1 1 ${(C_CX + C_INNER * COS30).toFixed(2)} ${(C_CY - C_INNER * SIN30).toFixed(2)} ` +
    `Z`

  // --- H (fully solid — every gap filled in) ---
  const H_W = 88
  const Hpath =
    `M 0 0 ` +
    `L ${H_W} 0 ` +
    `L ${H_W} ${LETTER_H} ` +
    `L 0 ${LETTER_H} ` +
    `Z`

  // Layout — accumulate x offsets for each letter
  const widths = [L_W, A_W, U_W, N_W, C_W, H_W]
  const totalWidth =
    widths.reduce((a, b) => a + b, 0) + GAP * (widths.length - 1)

  let cursor = 0
  const offsets: number[] = []
  for (let i = 0; i < widths.length; i++) {
    offsets.push(cursor)
    cursor += widths[i] + GAP
  }

  const letters = [
    { d: Lpath, x: offsets[0] },
    { d: Apath, x: offsets[1] },
    { d: Upath, x: offsets[2] },
    { d: Npath, x: offsets[3] },
    { d: Cpath, x: offsets[4] },
    { d: Hpath, x: offsets[5] },
  ]

  // Render at the requested CSS height; SVG itself preserves aspect ratio.
  const aspect = totalWidth / LETTER_H
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${totalWidth} ${LETTER_H}`}
      width={height * aspect}
      height={height}
      className={className}
      style={{ display: 'block', flexShrink: 0, ...style }}
      fill={color}
    >
      {letters.map((l, i) => (
        <path
          key={i}
          d={l.d}
          transform={`translate(${l.x}, 0)`}
          fill={l.fill ?? color}
        />
      ))}
    </svg>
  )
}
