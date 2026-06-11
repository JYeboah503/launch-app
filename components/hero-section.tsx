'use client'

import { useEffect, useState } from 'react'
import { ScrollIndicator } from '@/components/motion'
import { LaunchLogo } from '@/components/launch-logo'

interface HeroSectionProps {
  onStudentClick: () => void
  onPartnerClick: () => void
}

/**
 * Hero — cinema-dark navy spread.
 *
 * The marketing landing page is intentionally bookended in deep navy:
 * this hero and Beat 03 are the same family, with Beat 01 and Beat 02
 * (cream / warm cream) sandwiched between them. The hero stays navy
 * in both themes — it is the brand identity, not a surface that flips.
 *
 * Atmosphere:
 *   - subtle moon-disc on the right (no photograph, just a soft luminance)
 *   - three drifting blue-violet aurora passes
 *   - centered lime/blue glow halo behind the type
 *   - thin slow-rotating ring like a planetary orbit
 *
 * Type:
 *   - LAUNCH wordmark (custom letterforms) in cream
 *   - Display headline "Launch talent. See how someone actually thinks."
 *   - Italic Newsreader lede about reading the texture of decisions
 *   - Two bold pills — Student (lime) + Partner (cream-edged glass)
 */
export function HeroSection({ onStudentClick, onPartnerClick }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false)
  const [logoH, setLogoH] = useState(52)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    const updateLogoH = () => {
      const w = window.innerWidth
      if (w < 480) setLogoH(30)
      else if (w < 768) setLogoH(38)
      else if (w < 1280) setLogoH(48)
      else setLogoH(58)
    }
    updateLogoH()
    window.addEventListener('resize', updateLogoH)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', updateLogoH)
    }
  }, [])

  // Word reveal — pure opacity + filter, words wrap inline naturally.
  const reveal = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    filter: mounted ? 'blur(0)' : 'blur(8px)',
    transition: `opacity 900ms cubic-bezier(0.2,0.7,0.2,1) ${delay}ms, filter 900ms ease ${delay}ms`,
  })

  return (
    <section
      className="hero-cinema relative w-full overflow-hidden"
      style={{ minHeight: '100svh' }}
    >
      {/* Moon photograph — full-bleed, fixed, behind everything */}
      <div className="hero-moon-photo" aria-hidden />
      {/* Cinema navy wash — keeps type legible while letting the moon read */}
      <div className="hero-wash" aria-hidden />

      {/* Editorial spread — left-aligned reading flow */}
      <div
        className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-center"
        style={{ minHeight: '100svh' }}
      >
        {/* Brand wordmark — cream on cinema bg */}
        <div
          className="mb-10 sm:mb-12"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 700ms ease-out, transform 700ms cubic-bezier(0.2,0.7,0.2,1)',
            transitionDelay: '120ms',
          }}
        >
          <LaunchLogo
            height={logoH}
            color="var(--lq-cream)"
            ariaLabel="LAUNCH"
          />
        </div>

        {/* Display headline — left-aligned, words wrap inline naturally */}
        <h1
          className="mb-7 sm:mb-9"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 300,
            fontSize: 'clamp(38px, 6vw, 80px)',
            lineHeight: 1.04,
            letterSpacing: '-0.028em',
            color: '#92b8ff',
            maxWidth: '22ch',
          }}
        >
          <span style={reveal(220)}>Uncover talent, connect with the </span>
          <em style={{ ...reveal(420), fontStyle: 'italic' }}>future</em>
          <span style={reveal(560)}>.</span>
        </h1>

        {/* Italic Newsreader lede — punchy, problem-direct */}
        <p
          className="mb-10 sm:mb-12"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(17px, 1.6vw, 21px)',
            color: 'rgba(246, 242, 234, 0.82)',
            lineHeight: 1.55,
            maxWidth: '60ch',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 700ms ease-out, transform 700ms cubic-bezier(0.2,0.7,0.2,1)',
            transitionDelay: '1000ms',
          }}
        >
          We&rsquo;re revolutionising how talent reaches the workplace —
          delivering what actually matters: real job capabilities,
          shorter time-to-hire, and signal that goes far beyond the
          résumé.
        </p>

        {/* Pill row — left-aligned, bold */}
        <div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 700ms ease-out, transform 700ms cubic-bezier(0.2,0.7,0.2,1)',
            transitionDelay: '1080ms',
          }}
        >
          <button
            type="button"
            onClick={onStudentClick}
            className="hero-pill hero-pill-primary self-start"
          >
            Play
          </button>
          <button
            type="button"
            onClick={onPartnerClick}
            className="hero-pill hero-pill-secondary self-start"
          >
            Manage
          </button>
        </div>
      </div>

      {/* Scroll affordance */}
      <ScrollIndicator
        label="Scroll"
        tone="cream"
        onClick={() => {
          const el = document.getElementById('hero-end')
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
      />
      <span id="hero-end" style={{ position: 'absolute', bottom: 0 }} aria-hidden />

      <style>{`
        /* Cinema gradient — same family as Beat 03 so the page bookends */
        .hero-cinema {
          background: linear-gradient(180deg, #07091c 0%, #0e1737 50%, #182046 100%);
          color: var(--lq-cream);
          border-bottom: 1px solid rgba(146, 184, 255, 0.10);
        }

        /* Moon photograph — full-bleed, behind everything, softly blurred */
        .hero-moon-photo {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image: url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Moon%20final-K7dIJI6GEA4qMkAGyHWOt2WR0Q2XDM.jpg);
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          opacity: 0.55;
          filter: blur(2px);
        }

        /* Cinema wash — knocks the moon back so type stays legible */
        .hero-wash {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(180deg,
            rgba(7, 9, 28, 0.55) 0%,
            rgba(7, 9, 28, 0.5)  35%,
            rgba(14, 23, 55, 0.65) 70%,
            rgba(24, 32, 70, 0.85) 100%);
          pointer-events: none;
        }


        /* Bold pills — heavier weight, larger, more substantial */
        .hero-pill {
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
        .hero-pill:hover { transform: translateY(-1px); }
        .hero-pill:active { transform: translateY(1px); }

        /* Student pill — clear glass, mirrors Partner */
        .hero-pill-primary {
          background: rgba(246, 242, 234, 0.06);
          color: var(--lq-cream);
          border-color: rgba(246, 242, 234, 0.45);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .hero-pill-primary:hover {
          background: rgba(246, 242, 234, 0.12);
          border-color: var(--lq-cream);
        }

        .hero-pill-secondary {
          background: rgba(246, 242, 234, 0.06);
          color: var(--lq-cream);
          border-color: rgba(146, 184, 255, 0.45);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .hero-pill-secondary:hover {
          background: rgba(246, 242, 234, 0.12);
          border-color: rgba(146, 184, 255, 0.85);
        }
      `}</style>
    </section>
  )
}
