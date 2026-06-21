'use client'

import { RevealOnScroll } from '@/components/motion'

interface CTASectionProps {
  /** "Scenario" CTA — student/candidate play flow. */
  onPrimaryClick?: () => void
  /** "Partner access" CTA — corporate dashboard. */
  onPartnerClick?: () => void
  /** "Educator access" CTA — teacher dashboard. */
  onEducatorClick?: () => void
}

/**
 * Closing section — the page's quiet, confident sign-off.
 *
 * Deliberately stripped: no spinning ring, no breathing halo, no chrome.
 * Just a soft cinema-navy plate, a centred statement, a single lime hairline,
 * and the two CTAs the visitor came to find. Echoes the hero language so the
 * page feels like one breath, not five sections.
 */
export function CTASection({ onPrimaryClick, onPartnerClick, onEducatorClick }: CTASectionProps = {}) {
  return (
    <section
      id="beat-03"
      className="relative overflow-hidden border-t"
      style={{
        background: 'linear-gradient(180deg, #07091c 0%, #0a1126 100%)',
        color: 'var(--lq-cream)',
        padding: 'clamp(80px, 12vw, 180px) clamp(20px, 5vw, 56px)',
        borderColor: 'rgba(146, 184, 255, 0.10)',
      }}
    >
      <div className="relative max-w-3xl mx-auto text-center">
        <RevealOnScroll>
          {/* Single lime hairline — the only decoration */}
          <div
            aria-hidden
            style={{
              width: 56,
              height: 2,
              background: 'var(--launch-lime)',
              margin: '0 auto 36px',
              borderRadius: 2,
            }}
          />

          <h2
            className="mb-6"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 300,
              fontSize: 'clamp(34px, 4.6vw, 64px)',
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              color: 'var(--lq-cream)',
            }}
          >
            Hire on real capability.{' '}
            <em style={{ fontStyle: 'italic', color: '#92b8ff' }}>
              Launch
            </em>{' '}
            the future of work.
          </h2>

          <p
            className="mx-auto mb-12"
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 'clamp(16px, 1.5vw, 19px)',
              color: 'rgba(246, 242, 234, 0.72)',
              lineHeight: 1.55,
              maxWidth: '52ch',
            }}
          >
            Real job capabilities. Shorter time-to-hire. Signal that goes
            far beyond the résumé — for students and the companies who
            choose them.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
            {onPrimaryClick && (
              <button
                type="button"
                onClick={onPrimaryClick}
                className="cta-pill cta-pill-primary"
              >
                Scenario
              </button>
            )}
            {onPartnerClick && (
              <button
                type="button"
                onClick={onPartnerClick}
                className="cta-pill cta-pill-secondary"
              >
                Partner access
              </button>
            )}
            {onEducatorClick && (
              <button
                type="button"
                onClick={onEducatorClick}
                className="cta-pill cta-pill-secondary"
              >
                Educator access
              </button>
            )}
          </div>
        </RevealOnScroll>
      </div>

      <style>{`
        /* Closing CTAs — mirror the hero pill language */
        .cta-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 16px 32px;
          border-radius: 999px;
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 16px;
          letter-spacing: -0.005em;
          line-height: 1;
          border: 1.5px solid transparent;
          cursor: pointer;
          transition:
            transform 220ms cubic-bezier(0.2, 0.7, 0.2, 1),
            background 220ms ease,
            border-color 220ms ease,
            box-shadow 220ms ease;
        }
        .cta-pill:hover { transform: translateY(-1px); }
        .cta-pill:active { transform: translateY(1px); }
        .cta-pill-primary {
          background: var(--launch-lime);
          color: var(--lq-ink);
          border-color: var(--launch-lime-2);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.4) inset,
            0 8px 28px rgba(27, 158, 143, 0.42);
        }
        .cta-pill-primary:hover {
          background: var(--launch-lime-2);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.4) inset,
            0 12px 36px rgba(27, 158, 143, 0.55);
        }
        .cta-pill-secondary {
          background: rgba(246, 242, 234, 0.06);
          color: var(--lq-cream);
          border-color: rgba(146, 184, 255, 0.45);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .cta-pill-secondary:hover {
          background: rgba(246, 242, 234, 0.12);
          border-color: rgba(146, 184, 255, 0.85);
        }
      `}</style>
    </section>
  )
}
