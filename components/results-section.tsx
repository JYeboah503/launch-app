'use client'

import { AnimatedCounter, RevealOnScroll } from '@/components/motion'

interface Result {
  numericValue: number
  decimals?: number
  prefix?: string
  suffix?: string
  label: string
  description: string
}

const RESULTS: Result[] = [
  {
    numericValue: 3.5,
    decimals: 1,
    suffix: '×',
    label: 'Faster hiring decisions',
    description:
      'Companies access real capability data. Candidates surface on what they actually do, not what they claim.',
  },
  {
    numericValue: 92,
    suffix: '%',
    label: 'Better fit outcomes',
    description:
      'People matched to roles they excel in — not just roles they qualify for.',
  },
  {
    numericValue: 10,
    suffix: '+',
    label: 'Capabilities measured',
    description:
      'A comprehensive view of human potential, for employers and students alike.',
  },
  {
    numericValue: 500,
    suffix: '+',
    label: 'Students empowered',
    description:
      'Direct access to opportunity. No gatekeepers, no hidden algorithms.',
  },
]

export function ResultsSection() {
  return (
    <section
      id="outcomes"
      className="relative overflow-hidden border-t section-light"
      style={{ padding: 'clamp(64px, 10vw, 140px) clamp(20px, 5vw, 56px)' }}
    >
      {/* Soft navy glow on the right */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: '20%',
          right: '-12%',
          width: 520,
          height: 520,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(10, 42, 107, 0.12) 0%, transparent 70%)',
          filter: 'blur(16px)',
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Section header — single statement, no mono labels */}
        <RevealOnScroll className="mb-14 sm:mb-20 max-w-4xl">
          <h2 className="editorial-display-sm max-w-[28ch] mb-5">
            Outcomes for the people on both sides of the table.
          </h2>
          <p className="editorial-lede max-w-[60ch]">
            Companies move faster with real signal. Students get to be seen
            for what they bring, not just where they went. The numbers below
            are the early shape of that work.
          </p>
        </RevealOnScroll>

        {/* Big editorial stat moments — full magazine treatment.
            One per row on mobile, 2x2 on tablet, 4-up on wide desktop. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 sm:gap-y-16">
          {RESULTS.map((r, i) => (
            <RevealOnScroll key={r.label} delay={i * 90} y={24}>
              <div className="space-y-4 group">
                <div className="editorial-stat result-stat transition-colors duration-300">
                  <AnimatedCounter
                    value={r.numericValue}
                    decimals={r.decimals || 0}
                    prefix={r.prefix}
                    suffix={r.suffix}
                    duration={1600}
                  />
                </div>
                <hr className="editorial-divider result-divider" />
                <div className="editorial-mono result-label">{r.label}</div>
                <p className="text-sm leading-relaxed max-w-[34ch] result-desc">
                  {r.description}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>

      <style>{`
        .result-stat { color: var(--launch-navy); }
        .group:hover .result-stat { color: var(--launch-lime-3); }
        html.dark .result-stat { color: var(--lq-cream); }
        html.dark .group:hover .result-stat { color: var(--launch-lime); }
        .result-divider { border: 0; height: 1px; background: var(--lq-line); }
        html.dark .result-divider { background: rgba(246, 242, 234, 0.12); }
        .result-label { color: var(--lq-ink-3); }
        html.dark .result-label { color: rgba(246, 242, 234, 0.55); }
        .result-desc { color: var(--lq-ink-2); }
        html.dark .result-desc { color: rgba(246, 242, 234, 0.72); }
      `}</style>
    </section>
  )
}
