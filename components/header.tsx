'use client'

interface HeaderProps {
  isPartnerLoggedIn: boolean
  onEnter: () => void
  onPartnerEnter?: () => void
}

export function Header({ isPartnerLoggedIn, onEnter, onPartnerEnter }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--lq-cream)]/85 backdrop-blur-md border-b border-[var(--lq-line)]">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 gap-3 sm:gap-4">
        {/* Brand mark — pulsing lime dot + LAUNCH wordmark in mono */}
        <div className="flex items-center gap-3 select-none">
          <span className="brand-mark" aria-hidden />
          <span
            className="text-[12px] sm:text-[13px] tracking-[0.22em] uppercase font-semibold"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--lq-ink)',
            }}
          >
            LAUNCH
          </span>
          <span
            className="hidden sm:inline editorial-mono"
            style={{ color: 'var(--lq-ink-3)' }}
          >
            · employer + student
          </span>
        </div>

        {/* CTAs — Partner (ink pill) + Enter (lime pill) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onPartnerEnter}
            className="editorial-pill editorial-pill-secondary text-xs sm:text-sm"
          >
            Partner
          </button>
          <button
            type="button"
            onClick={onEnter}
            className="editorial-pill editorial-pill-primary text-xs sm:text-sm"
          >
            Enter
          </button>
        </div>
      </div>
    </header>
  )
}
