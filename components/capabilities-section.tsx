'use client'

import { RevealOnScroll } from '@/components/motion'

const CAPABILITIES = [
  { mono: '01', title: 'Judgement', description: 'How they evaluate complex, ambiguous situations.' },
  { mono: '02', title: 'Reasoning', description: 'Analytical depth and logical structure.' },
  { mono: '03', title: 'Problem Solving', description: 'How they break down and approach challenges.' },
  { mono: '04', title: 'Leadership', description: 'Natural influence and alignment under pressure.' },
  { mono: '05', title: 'Adaptability', description: 'How they hold a line, and when to bend it.' },
  { mono: '06', title: 'Emotional Intelligence', description: 'Reading rooms, people, and asymmetric stakes.' },
  { mono: '07', title: 'Execution', description: 'Follow-through, momentum, finishing well.' },
  { mono: '08', title: 'Integrity', description: 'Decisions when no one is watching.' },
  { mono: '09', title: 'Collaboration', description: 'How they raise the team around them.' },
  { mono: '10', title: 'Situational Awareness', description: 'Reading context, not just content.' },
]

export function CapabilitiesSection() {
  return (
    <section
      id="capabilities"
      className="relative overflow-hidden border-t-2 section-mid"
      style={{ padding: 'clamp(64px, 10vw, 140px) clamp(20px, 5vw, 56px)' }}
    >
      {/* Mosaic background — heavily faded behind a cream wash for legibility */}
      <div className="capabilities-mosaic" aria-hidden />
      <div className="capabilities-wash" aria-hidden />

      <div className="relative max-w-7xl mx-auto" style={{ zIndex: 2 }}>
        {/* Section header — serif statement, no mono labels */}
        <RevealOnScroll className="mb-14 sm:mb-20 max-w-4xl">
          <h2 className="editorial-display-sm max-w-[28ch] mb-5">
            Ten capabilities. Measured by how someone <em>actually</em> moves under pressure.
          </h2>
          <p className="editorial-lede max-w-[60ch]">
            Not self-reported. Not abstract. Each capability surfaces from
            the shape of a real decision — the pause, the framing, the
            trade-off taken.
          </p>
        </RevealOnScroll>

        {/* Capability spread — clean factor-style cards, no decorative dots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {CAPABILITIES.map((cap, i) => (
            <RevealOnScroll key={cap.title} delay={i * 50} y={16}>
              <article className="capability-card group h-full" style={{ padding: '20px 22px' }}>
                <div className="capability-mono mb-4">{cap.mono}</div>
                <h3 className="capability-title">{cap.title}</h3>
                <p className="capability-desc">{cap.description}</p>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>

      <style>{`
        /* Classical mosaic — visible parchment underlay. Sepia + saturated
           warmth keep the editorial, antique feel; the cream wash sits on
           top to keep type and tile cards legible without burying the art. */
        .capabilities-mosaic {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image: url('/images/capabilities-mosaic.png');
          background-size: cover;
          background-position: center;
          opacity: 0.55;
          filter: sepia(0.25) saturate(0.95);
          pointer-events: none;
        }
        .capabilities-wash {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(180deg,
            rgba(226, 218, 200, 0.55) 0%,
            rgba(226, 218, 200, 0.40) 30%,
            rgba(226, 218, 200, 0.50) 70%,
            rgba(226, 218, 200, 0.70) 100%);
          pointer-events: none;
        }
        html.dark .capabilities-mosaic {
          opacity: 0.30;
          filter: sepia(0.4) saturate(0.85);
        }
        html.dark .capabilities-wash {
          background: linear-gradient(180deg,
            rgba(14, 23, 55, 0.70) 0%,
            rgba(14, 23, 55, 0.62) 30%,
            rgba(14, 23, 55, 0.68) 70%,
            rgba(14, 23, 55, 0.85) 100%);
        }

        /* Cream tile cards — solid parchment plaques over the mosaic */
        .capability-card {
          border-radius: var(--card-r);
          background: #f4ede0;
          border: 1px solid rgba(126, 96, 64, 0.18);
          transition: border-color 200ms ease, background 200ms ease, box-shadow 200ms ease;
        }
        .capability-card:hover {
          background: #faf3e6;
          border-color: rgba(126, 96, 64, 0.32);
          box-shadow: 0 6px 20px rgba(60, 42, 20, 0.08);
        }
        html.dark .capability-card {
          background: rgba(246, 242, 234, 0.10);
          border-color: rgba(246, 242, 234, 0.18);
        }
        html.dark .capability-card:hover {
          background: rgba(246, 242, 234, 0.16);
          border-color: rgba(246, 242, 234, 0.32);
        }
        .capability-mono {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--lq-ink-3);
        }
        html.dark .capability-mono { color: rgba(246, 242, 234, 0.5); }
        .capability-title {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 18px;
          letter-spacing: -0.014em;
          color: var(--lq-ink);
          line-height: 1.2;
          margin-bottom: 8px;
        }
        html.dark .capability-title { color: var(--lq-cream); }
        .capability-desc {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 14px;
          color: var(--lq-ink-2);
          line-height: 1.5;
        }
        html.dark .capability-desc { color: rgba(246, 242, 234, 0.7); }
      `}</style>
    </section>
  )
}
