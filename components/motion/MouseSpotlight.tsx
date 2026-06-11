'use client'

/**
 * MouseSpotlight
 * Soft glow that follows the cursor inside its parent. Renders absolutely
 * positioned inside the nearest relative container, so wrap it like:
 *   <div className="relative ..."> <MouseSpotlight /> ... </div>
 *
 * Pure React + CSS. No external libs.
 */

import { useEffect, useRef } from 'react'

interface MouseSpotlightProps {
  size?: number
  /** rgba colour of the glow */
  colour?: string
  /** opacity of the glow (0–1) */
  intensity?: number
  /** if true, shows even when no mouse has moved (centred) */
  defaultVisible?: boolean
}

export function MouseSpotlight({
  size = 420,
  colour = 'rgba(27, 158, 143, 0.35)',
  intensity = 1,
  defaultVisible = true,
}: MouseSpotlightProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const parent = node.parentElement
    if (!parent) return

    function handle(e: MouseEvent) {
      if (!parent || !node) return
      const rect = parent.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      node.style.opacity = String(intensity)
      node.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`
    }
    function leave() {
      if (!node) return
      node.style.opacity = '0'
    }

    parent.addEventListener('mousemove', handle)
    parent.addEventListener('mouseleave', leave)
    return () => {
      parent.removeEventListener('mousemove', handle)
      parent.removeEventListener('mouseleave', leave)
    }
  }, [size, intensity])

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colour} 0%, transparent 65%)`,
        pointerEvents: 'none',
        opacity: defaultVisible ? intensity * 0.35 : 0,
        filter: 'blur(20px)',
        transition: 'opacity 220ms ease-out',
        zIndex: 1,
        mixBlendMode: 'normal',
      }}
    />
  )
}
