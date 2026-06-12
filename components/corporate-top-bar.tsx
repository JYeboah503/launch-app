'use client'

import { ReactNode } from 'react'
import { LaunchWordmark } from '@/components/launch-wordmark'

/**
 * CorporateTopBar — the shared sticky header that lives on every
 * corporate-side surface.
 *
 * Why a component, not inline markup: previously only the partner-dashboard
 * top route had this header, so any time the partner drilled into a
 * sub-view (role detail, applicant performance, applicant curator, create
 * challenge) the LAUNCH brand mark disappeared. That inconsistency is the
 * thing this exists to fix.
 *
 * Layout: left = LAUNCH wordmark in `--launch-navy` + "· corporate" eyebrow.
 * Right = `actions` slot (Back, Build a scenario, etc — each route decides
 * what belongs there). Body slides under it; height ~64px.
 *
 * Contrast: navy wordmark on a frosted-white bar over the cream `--corp-canvas`
 * floor — the highest-contrast pairing in the LAUNCH palette on light surfaces.
 */
interface CorporateTopBarProps {
  /** Right-hand actions slot — buttons, kebab menu, etc. */
  actions?: ReactNode
  /** Optional eyebrow override (defaults to "· corporate"). Use for sub-routes
   *  to add a "· role · applicants" trail if you want — kept simple for now. */
  eyebrow?: string
}

export function CorporateTopBar({ actions, eyebrow = '· corporate' }: CorporateTopBarProps) {
  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: 'rgba(255,255,255,0.82)',
        borderBottom: '1px solid var(--lq-line)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LaunchWordmark height={26} tone="dark" ariaLabel="LAUNCH" />
          {eyebrow && (
            <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
              {eyebrow}
            </span>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
