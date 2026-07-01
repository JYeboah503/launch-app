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
        /* Pinned to the TOP-RIGHT of the play screen, hanging down from the
           very top edge. Small + translucent so it never crowds the
           scenario content (typing area, HUD chrome, headers). Floats
           above the layout with pointer-events off — decorative only. */
        .ppb-root {
          position: fixed;
          top: 0;
          right: 20px;
          z-index: 60;
          pointer-events: none;
          opacity: 0.92;
        }
        .ppb-tag {
          background: #fff;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-top: none;
          /* Rounded only at BOTTOM corners so it reads as hanging down. */
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
          padding: 0;
          width: 68px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 8px 16px -12px rgba(0, 0, 0, 0.40);
        }
        .ppb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center bottom;
          display: block;
        }
        .ppb-fallback {
          padding: 8px 10px;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--launch-navy, #0a2a6b);
          text-align: center;
          line-height: 1.15;
        }
        /* Even tighter on narrow screens. */
        @media (max-width: 720px) {
          .ppb-root { right: 10px; }
          .ppb-tag { width: 54px; height: 46px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }
        }
      `}</style>
    </div>
  )
}
