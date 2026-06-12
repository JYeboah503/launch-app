'use client'

import Image from 'next/image'

/**
 * LaunchWordmark — the official LAUNCH wordmark (custom letterforms with
 * the rocket A and star burst).
 *
 * Recoloured into the LAUNCH palette — no metallic chrome. Two tones:
 *
 *   tone="light"  → cream tinted gradient. Use on dark surfaces
 *                   (cinema navy hero, student dashboard top bar,
 *                   Manage door).
 *   tone="dark"   → navy tinted gradient. Use on cream / white surfaces
 *                   (teacher dashboard, corporate top bar).
 *
 * Both are real transparent PNGs (luminance-to-alpha cuts of the source
 * artwork), tinted in PIL to a brand-colour gradient that preserves the
 * 3D feel of the original letterforms and keeps the star burst readable.
 *
 * Native aspect: 456 × 142 (≈ 3.21 : 1).
 */
const NATIVE_W = 456
const NATIVE_H = 142
const ASPECT = NATIVE_W / NATIVE_H

interface LaunchWordmarkProps {
  /** Rendered height in CSS pixels. Width derives from native aspect. */
  height?: number
  /** Which tinted variant. */
  tone?: 'light' | 'dark'
  ariaLabel?: string
  className?: string
}

export function LaunchWordmark({
  height = 48,
  tone = 'light',
  ariaLabel = 'LAUNCH',
  className,
}: LaunchWordmarkProps) {
  const width = Math.round(height * ASPECT)
  const src =
    tone === 'dark'
      ? '/images/launch-wordmark-dark.png'
      : '/images/launch-wordmark-light.png'
  return (
    <Image
      src={src}
      alt={ariaLabel}
      width={width}
      height={height}
      priority
      unoptimized
      className={className}
      style={{ height, width: 'auto', display: 'block' }}
    />
  )
}
