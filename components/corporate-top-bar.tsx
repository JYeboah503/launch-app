'use client'

import { ReactNode } from 'react'
import { LaunchWordmark } from '@/components/launch-wordmark'
import { PartnerAccountMenu } from '@/components/partner-account-menu'

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
  /** Called when the partner picks "Sign out" from the account menu. */
  onSignOut?: () => void
  /** Called when the partner picks "Account settings" from the menu. */
  onOpenAccount?: () => void
  /** No longer rendered — kept on the type for back-compat with existing
   *  callers passing eyebrow strings; the contextual trail words have
   *  been dropped in favour of a cleaner just-the-logo top bar. */
  eyebrow?: string
}

export function CorporateTopBar({ actions, onSignOut, onOpenAccount }: CorporateTopBarProps) {
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
      {/* Full-width bar: brand mark flush-left (lining up with the sidebar's
          left edge below it), account controls flush-right. No max-width
          centering — that's what was making the page feel "floating" on
          larger laptops. */}
      <div className="w-full pl-4 sm:pl-6 lg:pl-7 pr-4 sm:pr-8 h-32 flex items-center justify-between">
        <div className="flex items-center">
          <LaunchWordmark height={72} tone="dark" ariaLabel="LAUNCH" />
        </div>
        <div className="flex items-center gap-3">
          {actions}
          <PartnerAccountMenu onSignOut={onSignOut} onOpenAccount={onOpenAccount} />
        </div>
      </div>
    </header>
  )
}
