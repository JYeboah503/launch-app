'use client'

/**
 * FloatingShapes
 * Soft, slowly-floating decorative orbs and a thin orbit ring. Designed
 * to live behind hero/section content for atmospheric depth.
 *
 * Reacts to mouse movement with a light parallax. Pure React + CSS.
 */

import { CSSProperties, useEffect, useRef } from 'react'

interface FloatingShapesProps {
  className?: string
  style?: CSSProperties
  /** "lime" leans on the LAUNCH brand colour, "navy" leans on the LQ play accent */
  tone?: 'lime' | 'navy' | 'mixed'
  /** parallax strength 0–1 */
  parallax?: number
}

export function FloatingShapes({
  className,
  style,
  tone = 'mixed',
  parallax = 0.6,
}: FloatingShapesProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (parallax <= 0) return
    const node = ref.current
    if (!node) return

    function onMove(e: MouseEvent) {
      if (!node) return
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      node.style.setProperty('--mx', String(x * parallax))
      node.style.setProperty('--my', String(y * parallax))
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [parallax])

  const orbA =
    tone === 'lime'
      ? 'radial-gradient(circle at 30% 30%, rgba(27, 158, 143,0.55) 0%, rgba(27, 158, 143,0.18) 40%, transparent 75%)'
      : tone === 'navy'
      ? 'radial-gradient(circle at 30% 30%, rgba(10,42,107,0.45) 0%, rgba(10,42,107,0.15) 40%, transparent 75%)'
      : 'radial-gradient(circle at 30% 30%, rgba(27, 158, 143,0.45) 0%, rgba(10,42,107,0.18) 50%, transparent 75%)'

  const orbB =
    tone === 'lime'
      ? 'radial-gradient(circle at 65% 65%, rgba(146,184,255,0.25) 0%, transparent 70%)'
      : tone === 'navy'
      ? 'radial-gradient(circle at 65% 65%, rgba(146,184,255,0.45) 0%, transparent 70%)'
      : 'radial-gradient(circle at 65% 65%, rgba(146,184,255,0.32) 0%, transparent 70%)'

  return (
    <div
      ref={ref}
      aria-hidden
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        ...style,
      }}
    >
      <div
        className="lq-shape-orb-a"
        style={{
          position: 'absolute',
          top: '8%',
          right: '-6%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: orbA,
          filter: 'blur(8px)',
          animation: 'lqShapesFloat 14s ease-in-out infinite alternate',
          transform: 'translate3d(calc(var(--mx, 0) * -16px), calc(var(--my, 0) * -12px), 0)',
        }}
      />
      <div
        className="lq-shape-orb-b"
        style={{
          position: 'absolute',
          bottom: '4%',
          left: '-8%',
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: orbB,
          filter: 'blur(6px)',
          animation: 'lqShapesFloat 18s ease-in-out infinite alternate-reverse',
          transform: 'translate3d(calc(var(--mx, 0) * 14px), calc(var(--my, 0) * 10px), 0)',
        }}
      />
      <div
        className="lq-shape-ring"
        style={{
          position: 'absolute',
          top: '38%',
          left: '52%',
          width: 560,
          height: 560,
          borderRadius: '50%',
          border: '1px solid rgba(14, 24, 51, 0.06)',
          animation: 'lqShapesSpin 60s linear infinite',
          transform: 'translate(-50%, -50%) translate3d(calc(var(--mx, 0) * 6px), calc(var(--my, 0) * 4px), 0)',
        }}
      />
      <style>{`
        @keyframes lqShapesFloat {
          0%   { transform: translate3d(calc(var(--mx, 0) * -16px), calc(var(--my, 0) * -12px), 0) scale(1); }
          100% { transform: translate3d(calc(var(--mx, 0) * -16px - 12px), calc((var(--my, 0) * -12px) - 18px), 0) scale(1.06); }
        }
        @keyframes lqShapesSpin {
          to { transform: translate(-50%, -50%) rotate(360deg) translate3d(calc(var(--mx, 0) * 6px), calc(var(--my, 0) * 4px), 0); }
        }
      `}</style>
    </div>
  )
}
