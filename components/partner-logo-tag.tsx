'use client'

/**
 * PartnerLogoTag — small logo-only square that hangs from the top of the
 * page like a price tag. Rounded bottom corners, no name, no tagline,
 * no full-width band. Just the partner's mark.
 *
 * Click the square to swap in a different logo (any image file).
 * Persists via data: URL in localStorage so reloads keep it.
 */

import { useEffect, useRef, useState } from 'react'
import { ImageIcon } from 'lucide-react'

const STORAGE_KEY = 'launch.partnerLogo.v1'

function readLogo(): string | null {
  if (typeof window === 'undefined') return null
  try { return window.localStorage.getItem(STORAGE_KEY) } catch { return null }
}
function writeLogo(url: string | null): void {
  if (typeof window === 'undefined') return
  try {
    if (url) window.localStorage.setItem(STORAGE_KEY, url)
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
}

export function PartnerLogoTag() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  // Hydrate from localStorage + listen for the storage event so when the
  // partner uploads a logo via Account settings (top-right menu), the
  // centre tag updates live without a refresh.
  useEffect(() => {
    setLogoUrl(readLogo())
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) setLogoUrl(readLogo())
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const handleFile = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = String(reader.result || '')
      setLogoUrl(url)
      writeLogo(url)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="plt-root">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="plt-tag"
        aria-label={logoUrl ? 'Change partner logo' : 'Add your logo'}
        title={logoUrl ? 'Click to swap the logo' : 'Click to add your logo'}
      >
        {logoUrl ? (
          <img src={logoUrl} alt="Partner logo" className="plt-img" draggable={false} />
        ) : (
          <div className="plt-placeholder">
            <ImageIcon className="w-4 h-4" aria-hidden />
            <span className="plt-placeholder-text">Logo</span>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
          style={{ display: 'none' }}
        />
      </button>

      <style>{`
        /* Pinned to the TOP-CENTRE of the page, hanging from the very top
           edge. Floats above the layout — never pushes content down. */
        .plt-root {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          z-index: 60;
        }
        .plt-tag {
          appearance: none;
          background: #fff;
          border: 1px solid var(--lq-line);
          border-top: none;
          /* Rounded only at the BOTTOM corners so it reads as hanging
             down from the top edge of the page. */
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
          /* No padding — the image fills the whole tag, edge to edge.
             overflow:hidden clips the image to the rounded bottom. */
          padding: 0;
          width: 150px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 6px 14px -10px rgba(10, 42, 107, 0.20);
          transition: transform 160ms ease, box-shadow 160ms ease;
        }
        .plt-tag:hover {
          transform: translateY(2px);
          box-shadow: 0 10px 20px -12px rgba(10, 42, 107, 0.30);
        }
        /* Image fills the entire tag — no gaps on the sides. cover so
           the picture meets every edge. object-position anchored to the
           BOTTOM so logos that sit low in their canvas (e.g. Savills)
           are preserved when cropping happens at the top. */
        .plt-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center bottom;
          display: block;
        }
        /* Placeholder stays padded + centred so the small icon doesn't
           swim in the larger tag. */
        .plt-placeholder {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--lq-ink-3);
          padding: 14px 18px;
        }
        .plt-placeholder-text {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
