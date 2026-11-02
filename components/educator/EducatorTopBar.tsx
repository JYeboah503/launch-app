'use client'

/**
 * EducatorTopBar — the corporate top bar's twin for the school side.
 * Same recipe as components/corporate-top-bar.tsx (sticky h-32, frosted
 * white, wordmark at 72, right-hand actions slot), but carrying the
 * school's identity instead of a partner account menu.
 */

import type { ReactNode } from 'react'
import { LaunchWordmark } from '@/components/launch-wordmark'
import { Command, Settings, ArrowLeft } from 'lucide-react'
import type { EdBranding, Institution } from '@/components/educator/types'

export function EducatorTopBar({
  branding, actions, onOpenSettings, onExit, onPalette, onInstitution,
}: {
  branding: EdBranding
  /** Per-route slot — ghost back button on drill-ins, primary CTA on rail views. */
  actions?: ReactNode
  onOpenSettings: () => void
  onExit: () => void
  onPalette: () => void
  /** Flips the whole workspace between the school and university personas. */
  onInstitution: (inst: Institution) => void
}) {
  const inst = branding.institution
  return (
    <header
      className="sticky top-0 z-40 h-32 flex items-center justify-between pl-4 sm:pl-6 lg:pl-7 pr-4 sm:pr-8"
      style={{
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--lq-line)',
      }}
    >
      <div className="flex items-center gap-4 min-w-0">
        <LaunchWordmark height={72} tone="dark" ariaLabel="LAUNCH" />
        <span aria-hidden style={{ width: 1, height: 26, background: 'var(--lq-line-2)' }} />
        {branding.logoUrl && (
          // University side: the logo owns the bar — full top-to-bottom bleed.
          inst === 'university'
            ? <img src={branding.logoUrl} alt="" style={{ height: 128, width: 'auto', maxWidth: 300, objectFit: 'contain', flexShrink: 0 }} />
            : <img src={branding.logoUrl} alt="" style={{ height: 28, maxWidth: 120, objectFit: 'contain' }} />
        )}
        <span className="truncate" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15, color: 'var(--lq-ink)' }}>
          {branding.schoolName}
        </span>
        <span className="corp-chip hidden sm:inline-flex">Careers</span>
        {/* Persona toggle — the demo's party trick: flip the whole
            workspace between school and university live. */}
        <span className="etb-seg hidden md:inline-flex" role="group" aria-label="Advisor type">
          <button type="button" className={inst === 'school' ? 'is-on' : ''} onClick={() => onInstitution('school')}>School</button>
          <button type="button" className={inst === 'university' ? 'is-on' : ''} onClick={() => onInstitution('university')}>University</button>
        </span>
        <style>{`
          .etb-seg { background: rgba(10,42,107,0.04); border: 1px solid var(--lq-line-2); border-radius: 999px; padding: 3px; margin-left: 6px; }
          .etb-seg button { padding: 5px 12px; border-radius: 999px; border: none; background: none; cursor: pointer; font-family: var(--font-body); font-size: 12px; font-weight: 600; color: var(--lq-ink-3); white-space: nowrap; min-height: 0 !important; min-width: 0 !important; }
          .etb-seg button.is-on { background: var(--launch-navy); color: var(--lq-cream); }
        `}</style>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPalette}
          title="Command palette (⌘K)"
          className="hidden md:inline-flex items-center gap-1.5 px-3 rounded-full"
          style={{
            border: '1px solid var(--lq-line-2)', background: '#fff',
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--lq-ink-3)',
          }}
        >
          <Command className="w-3.5 h-3.5" /> K
        </button>
        {actions}
        <button type="button" className="ed-btn ed-btn-ghost" onClick={onOpenSettings}>
          <Settings className="w-4 h-4" /> <span className="hidden sm:inline">{inst === 'university' ? 'University settings' : 'School settings'}</span>
        </button>
        <button type="button" className="ed-btn ed-btn-ghost" onClick={onExit}>
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
      </div>
    </header>
  )
}
