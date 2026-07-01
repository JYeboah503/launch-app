'use client'

/**
 * PlayPartnerBanner — hangs from the top-right of the play screen, showing
 * the partner's logo (and name as accessible fallback). Only rendered when
 * the scenario came from a corporate partner (variant === 'professional')
 * so Quick-Play / teacher scenarios stay clean.
 *
 * Read-only: unlike the dashboard's PartnerLogoTag, this component doesn't
 * let the visitor swap the logo — they're a candidate, not the partner.
 *
 * Data source: reads the partner's logo + branding from the same
 * localStorage keys the partner dashboard writes to (launch.partnerLogo.v1
 * + launch.partnerBranding.v1). Falls back to nothing at all if neither
 * is set, so it never renders a broken banner.
 */

import { useEffect, useState } from 'react'

const LOGO_KEY = 'launch.partnerLogo.v1'
const BRANDING_KEY = 'launch.partnerBranding.v1'

interface Branding { name: string }

function readLogo(): string | null {
  if (typeof window === 'undefined') return null
  try { return window.localStorage.getItem(LOGO_KEY) } catch { return null }
}
function readBrandingName(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(BRANDING_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Branding>
    return parsed?.name?.trim() || null
  } catch { return null }
}

export function PlayPartnerBanner() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    setLogoUrl(readLogo())
    setName(readBrandingName())
    const handler = (e: StorageEvent) => {
      if (e.key === LOGO_KEY || e.key === null) setLogoUrl(readLogo())
      if (e.key === BRANDING_KEY || e.key === null) setName(readBrandingName())
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  // If neither the logo nor the partner name is available, render nothing.
  if (!logoUrl && !name) return null

  return (
    <div className="ppb-root" aria-label={name ? `Scenario by ${name}` : 'Partner scenario'}>
      <div className="ppb-tag">
        {logoUrl ? (
          <img src={logoUrl} alt={name || 'Partner logo'} className="ppb-img" draggable={false} />
        ) : (
          <span className="ppb-fallback mono">{name}</span>
        )}
      </div>

      <style>{`
        /* Pinned to the TOP-CENTRE of the play screen, hanging down like a
           price tag from the very top edge — matches the dashboard's
           PartnerLogoTag treatment. Full-size (not shrunk) so the brand
           reads properly, but sits above any body text or input area,
           so it never crowds the "writing" surfaces (reasoning textarea,
           write-in field, etc.). pointer-events off so clicks pass
           through to whatever's underneath. */
        .ppb-root {
          position: fixed;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          z-index: 60;
          pointer-events: none;
        }
        .ppb-tag {
          background: #fff;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-top: none;
          /* Rounded only at BOTTOM corners so it reads as hanging down. */
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
          padding: 0;
          width: 140px;
          height: 118px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 12px 24px -14px rgba(0, 0, 0, 0.45);
        }
        .ppb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center bottom;
          display: block;
        }
        .ppb-fallback {
          padding: 14px 18px;
          font-size: 13px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--launch-navy, #0a2a6b);
          text-align: center;
          line-height: 1.15;
        }
        /* Trim on narrow screens so it doesn't dominate. */
        @media (max-width: 720px) {
          .ppb-tag { width: 108px; height: 92px; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; }
          .ppb-fallback { padding: 10px 12px; font-size: 11px; }
        }
      `}</style>
    </div>
  )
}
