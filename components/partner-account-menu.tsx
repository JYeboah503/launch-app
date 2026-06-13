'use client'

/**
 * PartnerAccountMenu — the partner's account control on the right side
 * of the CorporateTopBar. Initials + name + dropdown with:
 *   - Account settings  (routes to the full-page settings view)
 *   - Reset password    (small stub modal)
 *   - Notifications     (placeholder badge, coming soon)
 *   - Help & docs       (placeholder)
 *   - Sign out          (returns to Manage door)
 *
 * The button is intentionally LOGO-FREE — the partner's logo lives only
 * in the centre PartnerLogoTag so the two brand marks don't compete.
 */

import { useEffect, useRef, useState } from 'react'
import { Bell, HelpCircle, LogOut, Settings, X, KeyRound } from 'lucide-react'

const BRANDING_KEY = 'launch.partnerBranding.v1'

interface Branding { name: string; email: string }
const DEFAULT_BRANDING: Branding = { name: 'Savills', email: 'recruiting@savills.com.au' }

function readBranding(): Branding {
  if (typeof window === 'undefined') return DEFAULT_BRANDING
  try {
    const raw = window.localStorage.getItem(BRANDING_KEY)
    if (!raw) return DEFAULT_BRANDING
    const parsed = JSON.parse(raw) as Partial<Branding>
    return { ...DEFAULT_BRANDING, ...parsed }
  } catch { return DEFAULT_BRANDING }
}

interface Props {
  /** Called when the partner picks "Sign out". */
  onSignOut?: () => void
  /** Called when partner picks "Account settings" — host routes to the
   *  full-page settings view. */
  onOpenAccount?: () => void
}

export function PartnerAccountMenu({ onSignOut, onOpenAccount }: Props) {
  const [open, setOpen] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING)

  // Hydrate + listen for live updates (so renaming the org in Account
  // settings updates this button without a refresh).
  useEffect(() => {
    setBranding(readBranding())
    const handler = (e: StorageEvent) => {
      if (e.key === BRANDING_KEY || e.key === null) setBranding(readBranding())
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  // Close on outside click
  const wrapRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [open])

  const initials = branding.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <>
      <div ref={wrapRef} className="pam-root">
        <button
          type="button"
          className="pam-trigger"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Account menu"
        >
          <span className="pam-initials">{initials || 'P'}</span>
          <span className="pam-name">{branding.name}</span>
          <span className="pam-caret">▾</span>
        </button>

        {open && (
          <div className="pam-menu" role="menu">
            <div className="pam-menu-head">
              <div className="pam-menu-head-name">{branding.name}</div>
              <div className="pam-menu-head-email">{branding.email}</div>
            </div>
            <div className="pam-menu-sep" />
            <button
              type="button"
              className="pam-menu-item"
              onClick={() => { setOpen(false); onOpenAccount?.() }}
            >
              <Settings className="w-4 h-4" /> Account settings
            </button>
            <button
              type="button"
              className="pam-menu-item"
              onClick={() => { setOpen(false); setShowForgot(true) }}
            >
              <KeyRound className="w-4 h-4" /> Reset password
            </button>
            <button type="button" className="pam-menu-item pam-menu-item-disabled" aria-disabled>
              <Bell className="w-4 h-4" /> Notifications
              <span className="pam-badge">3</span>
            </button>
            <button type="button" className="pam-menu-item pam-menu-item-disabled" aria-disabled>
              <HelpCircle className="w-4 h-4" /> Help &amp; docs
            </button>
            <div className="pam-menu-sep" />
            <button
              type="button"
              className="pam-menu-item pam-menu-item-danger"
              onClick={() => { setOpen(false); onSignOut?.() }}
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        )}
      </div>

      {showForgot && <ResetPasswordModal email={branding.email} onClose={() => setShowForgot(false)} />}

      <style>{`
        .pam-root { position: relative; }
        .pam-trigger {
          appearance: none;
          background: #fff;
          border: 1px solid var(--lq-line-2);
          border-radius: 999px;
          padding: 4px 14px 4px 4px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: border-color 140ms ease, box-shadow 140ms ease;
        }
        .pam-trigger:hover {
          border-color: var(--launch-navy);
          box-shadow: 0 6px 14px -10px rgba(10, 42, 107, 0.20);
        }
        .pam-initials {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background: var(--launch-navy);
          color: var(--lq-cream);
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
        }
        .pam-name {
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 13px;
          color: var(--lq-ink);
          letter-spacing: -0.005em;
        }
        .pam-caret {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--lq-ink-3);
        }

        .pam-menu {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          width: 260px;
          background: #fff;
          border: 1px solid var(--lq-line);
          border-radius: 14px;
          padding: 6px;
          box-shadow: 0 18px 36px -16px rgba(10, 42, 107, 0.24);
          z-index: 50;
        }
        .pam-menu-head { padding: 10px 12px 12px; }
        .pam-menu-head-name {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 15px;
          color: var(--lq-ink);
          margin-bottom: 2px;
        }
        .pam-menu-head-email {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.10em;
          color: var(--lq-ink-3);
        }
        .pam-menu-sep {
          height: 1px;
          background: var(--lq-line);
          margin: 4px 8px;
        }
        .pam-menu-item {
          appearance: none;
          background: transparent;
          border: none;
          width: 100%;
          padding: 9px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--lq-ink);
          text-align: left;
          border-radius: 8px;
          transition: background 120ms ease;
        }
        .pam-menu-item:hover { background: rgba(10, 42, 107, 0.05); }
        .pam-menu-item-disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .pam-menu-item-disabled:hover { background: transparent; }
        .pam-menu-item-danger { color: #7a0e2a; }
        .pam-menu-item-danger:hover { background: rgba(122, 14, 42, 0.06); }
        .pam-badge {
          margin-left: auto;
          background: var(--launch-navy);
          color: var(--lq-cream);
          border-radius: 999px;
          padding: 1px 7px;
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.06em;
        }
      `}</style>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Reset Password Modal (stub — devs wire to real auth flow)
   ───────────────────────────────────────────────────────────────── */
function ResetPasswordModal({ email, onClose }: { email: string; onClose: () => void }) {
  const [sent, setSent] = useState(false)
  return (
    <div className="pam-modal-root" role="dialog" aria-modal="true" aria-label="Reset password">
      <div className="pam-modal-backdrop" onClick={onClose} />
      <div className="pam-modal-card">
        <div className="pam-modal-head">
          <div>
            <div className="pam-modal-eyebrow">Account</div>
            <h2 className="pam-modal-title">Reset password</h2>
          </div>
          <button type="button" onClick={onClose} className="pam-modal-close" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="pam-modal-body">
          {sent ? (
            <p style={{ color: 'var(--lq-ink)', fontSize: 14, lineHeight: 1.55 }}>
              ✓ We&rsquo;ve sent a reset link to <strong>{email}</strong>. Check your
              inbox in the next minute or two.
            </p>
          ) : (
            <>
              <p style={{ color: 'var(--lq-ink-2)', fontSize: 14, lineHeight: 1.55, marginBottom: 14 }}>
                We&rsquo;ll send a password reset link to the contact email on
                your account: <strong>{email}</strong>.
              </p>
              <p style={{ color: 'var(--lq-ink-3)', fontSize: 12 }}>
                Wrong email? Update it in Account settings first.
              </p>
            </>
          )}
        </div>
        <div className="pam-modal-foot">
          {!sent ? (
            <>
              <button type="button" onClick={onClose} className="corp-btn corp-btn-ghost">Cancel</button>
              <button type="button" onClick={() => setSent(true)} className="corp-btn corp-btn-primary">Send reset link</button>
            </>
          ) : (
            <button type="button" onClick={onClose} className="corp-btn corp-btn-primary">Done</button>
          )}
        </div>
        <style>{`
          .pam-modal-root {
            position: fixed;
            inset: 0;
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .pam-modal-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(10, 42, 107, 0.40);
            backdrop-filter: blur(4px);
          }
          .pam-modal-card {
            position: relative;
            background: #fff;
            border-radius: 18px;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 24px 60px -18px rgba(10, 42, 107, 0.32);
          }
          .pam-modal-head {
            padding: 22px 26px 18px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 14px;
            border-bottom: 1px solid var(--lq-line);
          }
          .pam-modal-eyebrow {
            font-family: var(--font-mono);
            font-size: 10px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--lq-ink-3);
            font-weight: 600;
            margin-bottom: 4px;
          }
          .pam-modal-title {
            margin: 0;
            font-family: var(--font-display);
            font-weight: 500;
            font-size: 22px;
            letter-spacing: -0.02em;
            color: var(--lq-ink);
          }
          .pam-modal-close {
            appearance: none;
            background: transparent;
            border: 1px solid var(--lq-line-2);
            border-radius: 999px;
            width: 30px; height: 30px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--lq-ink-2);
            cursor: pointer;
            transition: color 140ms ease, border-color 140ms ease;
          }
          .pam-modal-close:hover {
            color: var(--lq-ink);
            border-color: var(--launch-navy);
          }
          .pam-modal-body { padding: 22px 26px; }
          .pam-modal-foot {
            padding: 16px 26px 22px;
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            border-top: 1px solid var(--lq-line);
          }
        `}</style>
      </div>
    </div>
  )
}
