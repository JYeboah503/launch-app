'use client'

/**
 * ScrollIndicator
 * Animated "scroll for more" affordance. A small mono label above a
 * gently bouncing chevron. Anchors itself absolutely to the bottom-centre
 * of its parent, so place inside a relative container.
 */

import { CSSProperties } from 'react'

interface ScrollIndicatorProps {
  label?: string
  href?: string
  onClick?: () => void
  className?: string
  style?: CSSProperties
  /** how far below the parent's bottom edge to sit, in px */
  offsetY?: number
  /** colour token */
  tone?: 'ink' | 'cream'
}

export function ScrollIndicator({
  label = 'Scroll',
  href,
  onClick,
  className,
  style,
  offsetY = 28,
  tone = 'ink',
}: ScrollIndicatorProps) {
  const colour = tone === 'cream' ? 'rgba(246,242,234,0.78)' : 'var(--lq-ink-2)'

  const inner = (
    <span
      className={className}
      style={{
        position: 'absolute',
        left: '50%',
        bottom: offsetY,
        transform: 'translateX(-50%)',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        cursor: href || onClick ? 'pointer' : 'default',
        textDecoration: 'none',
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: colour,
        }}
      >
        {label}
      </span>
      <span
        aria-hidden
        style={{
          width: 1,
          height: 28,
          background: `linear-gradient(180deg, transparent, ${colour})`,
          animation: 'lqScrollLine 1.8s cubic-bezier(.55,.1,.4,1) infinite',
          transformOrigin: 'top',
        }}
      />
      <svg
        aria-hidden
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke={colour}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          animation: 'lqScrollChevron 1.8s cubic-bezier(.55,.1,.4,1) infinite',
        }}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
      <style>{`
        @keyframes lqScrollLine {
          0%   { transform: scaleY(0); transform-origin: top; opacity: 0.2; }
          50%  { transform: scaleY(1); transform-origin: top; opacity: 1; }
          51%  { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
          100% { transform: scaleY(0); transform-origin: bottom; opacity: 0.2; }
        }
        @keyframes lqScrollChevron {
          0%, 100% { transform: translateY(0); opacity: 0.55; }
          50%      { transform: translateY(4px); opacity: 1; }
        }
      `}</style>
    </span>
  )

  if (href) {
    return (
      <a href={href} aria-label={label} onClick={onClick}>
        {inner}
      </a>
    )
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        style={{ background: 'transparent', border: 'none', padding: 0, position: 'static' }}
      >
        {inner}
      </button>
    )
  }
  return inner
}
