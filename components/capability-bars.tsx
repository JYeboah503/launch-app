'use client'

import { useState } from 'react'
import { TrendingUp, Minus } from 'lucide-react'

interface CapabilityBarsProps {
  capabilities: Array<{ name: string; level: number; insight?: string; change?: number }>
}

export function CapabilityBars({ capabilities }: CapabilityBarsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const maxLevel = Math.max(...capabilities.map((c) => c.level), 100)

  return (
    <div className="w-full flex items-end justify-between gap-2 h-40 sm:h-48 md:h-56 overflow-x-auto pb-4">
      {capabilities.map((capability, index) => {
        const heightPercent = (capability.level / maxLevel) * 100
        const isHovered = hoveredIndex === index
        const change = capability.change || 0

        return (
          <button
            key={capability.name}
            className="flex flex-col items-center flex-1 min-w-12 group cursor-pointer transition-opacity"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="relative w-full h-32 sm:h-40 flex flex-col items-center justify-end">
              <div
                className="w-3/4 rounded-t-[8px] transition-all duration-300 flex items-center justify-center"
                style={{
                  height: `${heightPercent * 1.6}px`,
                  background: isHovered
                    ? 'linear-gradient(180deg, var(--launch-lime), var(--launch-lime-3))'
                    : 'rgba(14, 24, 51, 0.12)',
                }}
              >
                {isHovered && (
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 500,
                      fontSize: 18,
                      letterSpacing: '-0.015em',
                      color: 'var(--lq-ink)',
                    }}
                  >
                    {capability.level}
                  </div>
                )}
              </div>
            </div>

            <div className="text-center w-full mt-2">
              <p
                className="text-[10px] leading-tight h-8 sm:h-10 flex items-center justify-center px-1 line-clamp-2"
                style={{
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isHovered ? 'var(--lq-ink)' : 'var(--lq-ink-3)',
                }}
              >
                {capability.name}
              </p>
              <div
                className="flex items-center justify-center gap-0.5 mt-1 text-[10px]"
                style={{
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                  color:
                    change > 0
                      ? 'var(--launch-navy)'
                      : change < 0
                      ? '#7a0e2a'
                      : 'var(--lq-ink-3)',
                }}
              >
                {change > 0 ? (
                  <>
                    <TrendingUp size={10} />+{change}
                  </>
                ) : change < 0 ? (
                  <>
                    <TrendingUp size={10} style={{ transform: 'rotate(180deg)' }} />
                    {Math.abs(change)}
                  </>
                ) : (
                  <>
                    <Minus size={10} />
                    flat
                  </>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
