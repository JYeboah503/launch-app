'use client'

/**
 * PartnerAccountPage — full-page settings surface for the partner.
 *
 * Replaces the old account modal (which had overlap issues + limited space).
 * Left sub-nav lists 8 sections; the right pane renders the active section.
 *
 * Sections:
 *   1. Company profile        — org name, logo, tagline, industry, website, HQ, size
 *   2. Contact & security     — email, phone, password, 2FA, recent logins
 *   3. Team & permissions     — invite, roles, revoke
 *   4. Notifications          — per-event email + in-app preferences
 *   5. Integrations           — Slack, ATS, Calendar (mock OAuth for demo)
 *   6. Billing & plan         — current plan, usage, invoices, payment method
 *   7. Data & privacy         — retention, CSV export, GDPR deletion
 *   8. Workspace defaults     — default difficulty / register / capabilities
 *
 * Logo upload here writes to launch.partnerLogo.v1 — the centre PartnerLogoTag
 * + the top-right account menu both listen for that storage event and update
 * live with no refresh.
 */

import { useEffect, useState } from 'react'
import {
  Building2, Mail, Users, Bell, Settings as SettingsIcon,
  Upload, Trash2, Check, Plus, KeyRound, X,
} from 'lucide-react'

const LOGO_KEY = 'launch.partnerLogo.v1'
const BRANDING_KEY = 'launch.partnerBranding.v1'
const PROFILE_KEY = 'launch.partnerProfile.v1'
const PREFS_KEY = 'launch.partnerPrefs.v1'

interface ExtendedProfile {
  tagline: string
  industry: string
  website: string
  headquarters: string
  companySize: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+' | ''
}
const DEFAULT_PROFILE: ExtendedProfile = {
  tagline: 'Property, finance, and real-estate expertise.',
  industry: 'Property / Real Estate',
  website: 'https://www.savills.com.au',
  headquarters: 'Sydney, NSW',
  companySize: '1000+',
}

interface Branding { name: string; email: string; phone?: string }
const DEFAULT_BRANDING: Branding = { name: 'Savills', email: 'recruiting@savills.com.au', phone: '02 8215 8888' }

interface Prefs {
  notifyNewApplicant: boolean
  notifyDailyDigest: boolean
  notifyWeeklyFunnel: boolean
  notifyBelowBenchmark: boolean
  defaultDifficulty: 'easy' | 'medium' | 'hard'
  defaultRegister: 'early' | 'advanced'
  defaultPrequal: boolean
  retentionMonths: 12 | 24 | 36 | 60
}
const DEFAULT_PREFS: Prefs = {
  notifyNewApplicant: true,
  notifyDailyDigest: true,
  notifyWeeklyFunnel: true,
  notifyBelowBenchmark: false,
  defaultDifficulty: 'medium',
  defaultRegister: 'advanced',
  defaultPrequal: true,
  retentionMonths: 24,
}

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...JSON.parse(raw) }
  } catch { return fallback }
}
function writeJSON<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(val))
    window.dispatchEvent(new StorageEvent('storage', { key }))
  } catch { /* ignore */ }
}

type SectionKey =
  | 'profile' | 'security' | 'team' | 'notifications' | 'defaults'

const SECTIONS: Array<{ key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: 'profile',       label: 'Company profile',     icon: Building2 },
  { key: 'security',      label: 'Contact & security',  icon: Mail },
  { key: 'team',          label: 'Team & permissions',  icon: Users },
  { key: 'notifications', label: 'Notifications',       icon: Bell },
  { key: 'defaults',      label: 'Workspace defaults',  icon: SettingsIcon },
]

export function PartnerAccountPage() {
  const [section, setSection] = useState<SectionKey>('profile')
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING)
  const [profile, setProfile] = useState<ExtendedProfile>(DEFAULT_PROFILE)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  // Hydrate on mount
  useEffect(() => {
    setBranding(readJSON(BRANDING_KEY, DEFAULT_BRANDING))
    setProfile(readJSON(PROFILE_KEY, DEFAULT_PROFILE))
    setPrefs(readJSON(PREFS_KEY, DEFAULT_PREFS))
    if (typeof window !== 'undefined') {
      try { setLogoUrl(window.localStorage.getItem(LOGO_KEY)) } catch { /* ignore */ }
    }
  }, [])

  const persistBranding = (b: Branding) => { setBranding(b); writeJSON(BRANDING_KEY, b) }
  const persistProfile  = (p: ExtendedProfile) => { setProfile(p); writeJSON(PROFILE_KEY, p) }
  const persistPrefs    = (p: Prefs) => { setPrefs(p); writeJSON(PREFS_KEY, p) }
  const persistLogo     = (url: string | null) => {
    setLogoUrl(url)
    if (typeof window !== 'undefined') {
      try {
        if (url) window.localStorage.setItem(LOGO_KEY, url)
        else window.localStorage.removeItem(LOGO_KEY)
        window.dispatchEvent(new StorageEvent('storage', { key: LOGO_KEY, newValue: url }))
      } catch { /* ignore */ }
    }
  }

  return (
    <div className="ap-root">
      <aside className="ap-nav">
        <div className="ap-nav-eyebrow">Account</div>
        <h2 className="ap-nav-title">Settings</h2>
        <p className="ap-nav-sub">{branding.name}</p>
        <div className="ap-nav-sep" />
        {SECTIONS.map((s) => {
          const Icon = s.icon
          const active = section === s.key
          return (
            <button
              key={s.key}
              type="button"
              className={`ap-nav-item ${active ? 'is-active' : ''}`}
              onClick={() => setSection(s.key)}
            >
              <Icon className="w-4 h-4" />
              <span>{s.label}</span>
            </button>
          )
        })}
      </aside>

      <main className="ap-body">
        {section === 'profile' && (
          <CompanyProfileSection
            branding={branding}
            profile={profile}
            logoUrl={logoUrl}
            onChangeBranding={persistBranding}
            onChangeProfile={persistProfile}
            onChangeLogo={persistLogo}
          />
        )}
        {section === 'security' && (
          <SecuritySection branding={branding} onChangeBranding={persistBranding} />
        )}
        {section === 'team' && <TeamSection />}
        {section === 'notifications' && <NotificationsSection prefs={prefs} onChange={persistPrefs} />}
        {section === 'defaults' && <WorkspaceDefaultsSection prefs={prefs} onChange={persistPrefs} />}
      </main>

      <style>{accountPageStyles}</style>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────
   SECTION 1 — Company profile
   ─────────────────────────────────────────────────────────────────── */
function CompanyProfileSection({
  branding, profile, logoUrl, onChangeBranding, onChangeProfile, onChangeLogo,
}: {
  branding: Branding; profile: ExtendedProfile; logoUrl: string | null;
  onChangeBranding: (b: Branding) => void;
  onChangeProfile: (p: ExtendedProfile) => void;
  onChangeLogo: (url: string | null) => void;
}) {
  const fileRef = useState<HTMLInputElement | null>(null)
  const handleFile = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChangeLogo(String(reader.result || ''))
    reader.readAsDataURL(file)
  }
  return (
    <SectionShell title="Company profile" subtitle="How candidates see you, and what the centre banner shows.">
      <Field label="Company logo" helper="Becomes the banner that hangs at the top of every page. Square or near-square images crop best.">
        <div className="ap-logo-row">
          <span className="ap-logo-preview">
            {logoUrl
              ? <img src={logoUrl} alt="Current logo" />
              : <span className="ap-logo-empty">Logo</span>}
          </span>
          <div className="ap-logo-buttons">
            <label className="corp-btn corp-btn-primary" style={{ cursor: 'pointer' }}>
              <Upload className="w-4 h-4" /> {logoUrl ? 'Swap logo' : 'Upload logo'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
                style={{ display: 'none' }}
              />
            </label>
            {logoUrl && (
              <button type="button" className="corp-btn corp-btn-ghost" onClick={() => onChangeLogo(null)}>
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            )}
          </div>
        </div>
      </Field>

      <Field label="Company name">
        <input className="ap-input" value={branding.name}
          onChange={(e) => onChangeBranding({ ...branding, name: e.target.value })}
          placeholder="Savills" />
      </Field>

      <Field label="Tagline" helper="One short line. Shown to candidates above your access codes.">
        <input className="ap-input" value={profile.tagline}
          onChange={(e) => onChangeProfile({ ...profile, tagline: e.target.value })}
          placeholder="Property, finance, and real-estate expertise." />
      </Field>

      <div className="ap-row-2">
        <Field label="Industry">
          <select className="ap-input" value={profile.industry}
            onChange={(e) => onChangeProfile({ ...profile, industry: e.target.value })}>
            {['Property / Real Estate', 'Finance / Banking', 'Consulting / Strategy', 'Technology', 'Engineering',
              'Marketing', 'Legal', 'Healthcare', 'Government', 'Other'].map((i) => (<option key={i} value={i}>{i}</option>))}
          </select>
        </Field>
        <Field label="Company size">
          <select className="ap-input" value={profile.companySize}
            onChange={(e) => onChangeProfile({ ...profile, companySize: e.target.value as ExtendedProfile['companySize'] })}>
            <option value="">—</option>
            {['1-10','11-50','51-200','201-1000','1000+'].map((s) => (<option key={s} value={s}>{s} employees</option>))}
          </select>
        </Field>
      </div>

      <div className="ap-row-2">
        <Field label="Website">
          <input className="ap-input" value={profile.website}
            onChange={(e) => onChangeProfile({ ...profile, website: e.target.value })}
            placeholder="https://www.savills.com.au" />
        </Field>
        <Field label="Headquarters">
          <input className="ap-input" value={profile.headquarters}
            onChange={(e) => onChangeProfile({ ...profile, headquarters: e.target.value })}
            placeholder="Sydney, NSW" />
        </Field>
      </div>
    </SectionShell>
  )
}

/* ──────────────────────────────────────────────────────────────────
   SECTION 2 — Contact & security
   ─────────────────────────────────────────────────────────────────── */
function SecuritySection({ branding, onChangeBranding }: { branding: Branding; onChangeBranding: (b: Branding) => void }) {
  const [pw1, setPw1] = useState(''); const [pw2, setPw2] = useState('')
  const [twoFA, setTwoFA] = useState(false)
  return (
    <SectionShell title="Contact & security" subtitle="How we reach you, and how you stay signed in safely.">
      <Field label="Contact email" helper="Where applicant alerts + system mail land.">
        <input type="email" className="ap-input" value={branding.email}
          onChange={(e) => onChangeBranding({ ...branding, email: e.target.value })} />
      </Field>
      <Field label="Phone (optional)">
        <input type="tel" className="ap-input" value={branding.phone || ''}
          onChange={(e) => onChangeBranding({ ...branding, phone: e.target.value })} />
      </Field>

      <div className="ap-divider" />
      <h3 className="ap-h3">Change password</h3>
      <div className="ap-row-2">
        <Field label="New password">
          <input type="password" className="ap-input" value={pw1} onChange={(e) => setPw1(e.target.value)} placeholder="••••••••" />
        </Field>
        <Field label="Confirm new password">
          <input type="password" className="ap-input" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="••••••••" />
        </Field>
      </div>
      <button type="button" className="corp-btn corp-btn-primary" style={{ marginTop: 8 }} disabled={!pw1 || pw1 !== pw2}>
        <KeyRound className="w-4 h-4" /> Update password
      </button>

      <div className="ap-divider" />
      <h3 className="ap-h3">Two-factor authentication</h3>
      <Toggle label="Require 2FA on sign-in" sub="We'll send a 6-digit code to your contact email each time you sign in from a new device." value={twoFA} onChange={setTwoFA} />

      <div className="ap-divider" />
      <h3 className="ap-h3">Recent sign-ins</h3>
      <div className="ap-table">
        {[
          { dev: 'Chrome · macOS', loc: 'Sydney, NSW', when: 'Now · this session' },
          { dev: 'Safari · iPhone', loc: 'Sydney, NSW', when: 'Yesterday, 18:42' },
          { dev: 'Chrome · macOS', loc: 'Melbourne, VIC', when: '3 days ago' },
        ].map((r, i) => (
          <div key={i} className="ap-table-row">
            <div><div className="ap-table-cell-bold">{r.dev}</div><div className="ap-table-cell-sub">{r.loc}</div></div>
            <div className="ap-table-cell-meta">{r.when}</div>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}

/* ──────────────────────────────────────────────────────────────────
   SECTION 3 — Team & permissions
   ─────────────────────────────────────────────────────────────────── */
function TeamSection() {
  // Empty-state team: just the owner (read from saved branding so the row
  // matches whatever name/email the partner saved in Company profile), plus
  // a clean "invite teammates" empty-state card below. No mock teammates.
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING)
  const [profile, setProfile] = useState<ExtendedProfile>(DEFAULT_PROFILE)
  useEffect(() => {
    setBranding(readJSON(BRANDING_KEY, DEFAULT_BRANDING))
    setProfile(readJSON(PROFILE_KEY, DEFAULT_PROFILE))
  }, [])
  const ownerName = profile.primaryContactName?.trim() || branding.name
  const ownerEmail = branding.email
  const initials = ownerName.split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0,2).join('').toUpperCase()

  return (
    <SectionShell title="Team & permissions" subtitle="Bring your recruiters in. Roles control what they can see + change.">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>1 member · 0 pending</span>
        <button type="button" className="corp-btn corp-btn-primary">
          <Plus className="w-4 h-4" /> Invite teammate
        </button>
      </div>

      {/* Owner row — only real member */}
      <div className="ap-table">
        <div className="ap-table-row">
          <div className="flex items-center gap-3">
            <span className="ap-avatar-sm">{initials || 'P'}</span>
            <div>
              <div className="ap-table-cell-bold">{ownerName}</div>
              <div className="ap-table-cell-sub">{ownerEmail}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="ap-role-pill ap-role-admin">Admin</span>
            <span className="ap-table-cell-sub" style={{ color: 'var(--lq-ink-3)' }}>Owner</span>
          </div>
        </div>
      </div>

      {/* Empty-state card — communicates "this is where teammates appear" */}
      <div className="ap-empty-card" style={{
        marginTop: 18,
        padding: '22px 22px',
        border: '1px dashed var(--lq-line-2)',
        borderRadius: 14,
        background: 'rgba(10, 42, 107, 0.02)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <span className="ap-empty-icon" style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40, height: 40,
          borderRadius: 999,
          background: 'rgba(10, 42, 107, 0.08)',
          color: 'var(--launch-navy)',
          flexShrink: 0,
        }}>
          <Users className="w-5 h-5" />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15, color: 'var(--lq-ink)', marginBottom: 3 }}>
            Bring your recruiters in
          </div>
          <div style={{ fontSize: 13, color: 'var(--lq-ink-2)', lineHeight: 1.55 }}>
            Invite teammates so they can build scenarios, review applicants, and share shortlists. They'll appear here once they accept.
          </div>
        </div>
        <button type="button" className="corp-btn corp-btn-ghost" style={{ flexShrink: 0 }}>
          <Plus className="w-4 h-4" /> Invite teammate
        </button>
      </div>

      <div className="ap-helper-block">
        <strong>Roles:</strong> Admin (everything) · Recruiter (build scenarios, review applicants) · Viewer (read-only).
      </div>
    </SectionShell>
  )
}

/* ──────────────────────────────────────────────────────────────────
   SECTION 4 — Notifications
   ─────────────────────────────────────────────────────────────────── */
function NotificationsSection({ prefs, onChange }: { prefs: Prefs; onChange: (p: Prefs) => void }) {
  const t = (patch: Partial<Prefs>) => onChange({ ...prefs, ...patch })
  return (
    <SectionShell title="Notifications" subtitle="Decide when we'll email + ping you. Defaults are deliberately quiet.">
      <h3 className="ap-h3">Email</h3>
      <Toggle label="New applicant" sub="As soon as a candidate completes a scenario." value={prefs.notifyNewApplicant} onChange={(v) => t({ notifyNewApplicant: v })} />
      <Toggle label="Daily applicants digest" sub="One email at 8am with the previous day's applicants — a single inbox glance." value={prefs.notifyDailyDigest} onChange={(v) => t({ notifyDailyDigest: v })} />
      <Toggle label="Weekly funnel summary" sub="Every Monday: applicants this week, pass rate, top capabilities, standouts." value={prefs.notifyWeeklyFunnel} onChange={(v) => t({ notifyWeeklyFunnel: v })} />
      <Toggle label="Below-benchmark flagged" sub="Each candidate who fails a pre-qualifier benchmark. Verbose — off by default." value={prefs.notifyBelowBenchmark} onChange={(v) => t({ notifyBelowBenchmark: v })} />
    </SectionShell>
  )
}


/* ──────────────────────────────────────────────────────────────────
   SECTION 8 — Workspace defaults
   ─────────────────────────────────────────────────────────────────── */
function WorkspaceDefaultsSection({ prefs, onChange }: { prefs: Prefs; onChange: (p: Prefs) => void }) {
  const t = (patch: Partial<Prefs>) => onChange({ ...prefs, ...patch })
  return (
    <SectionShell title="Workspace defaults" subtitle="Pre-set the values every new scenario starts from — saves the partner from re-picking each time.">
      <Field label="Default difficulty">
        <SegPicker
          options={[
            { value: 'easy',   label: 'Easy' },
            { value: 'medium', label: 'Medium' },
            { value: 'hard',   label: 'Hard' },
          ]}
          value={prefs.defaultDifficulty}
          onChange={(v) => t({ defaultDifficulty: v as Prefs['defaultDifficulty'] })}
        />
      </Field>
      <Field label="Default register">
        <SegPicker
          options={[
            { value: 'early',    label: 'Early career' },
            { value: 'advanced', label: 'Advanced career' },
          ]}
          value={prefs.defaultRegister}
          onChange={(v) => t({ defaultRegister: v as Prefs['defaultRegister'] })}
        />
      </Field>
      <Toggle label="Default to pre-qualifier ON" sub="When you build a new scenario, the pre-qualifier section opens by default." value={prefs.defaultPrequal} onChange={(v) => t({ defaultPrequal: v })} />
    </SectionShell>
  )
}

/* ──────────────────────────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────────────────────────── */
function SectionShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="ap-section">
      <div className="ap-section-head">
        <h1 className="ap-section-title">{title}</h1>
        <p className="ap-section-sub">{subtitle}</p>
      </div>
      <div className="ap-section-body">{children}</div>
    </div>
  )
}
function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <div className="ap-field">
      <label className="ap-label">{label}</label>
      {helper && <p className="ap-field-helper">{helper}</p>}
      {children}
    </div>
  )
}
function Toggle({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" className="ap-toggle" onClick={() => onChange(!value)} aria-pressed={value}>
      <div className="ap-toggle-meta">
        <div className="ap-toggle-label">{label}</div>
        {sub && <div className="ap-toggle-sub">{sub}</div>}
      </div>
      <span className={`ap-toggle-switch ${value ? 'is-on' : ''}`}><span className="ap-toggle-switch-knob" /></span>
    </button>
  )
}
function SegPicker({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="ap-seg">
      {options.map((o) => (
        <button key={o.value} type="button" className={`ap-seg-btn ${value === o.value ? 'is-on' : ''}`} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────
   Styles
   ─────────────────────────────────────────────────────────────────── */
const accountPageStyles = `
  .ap-root {
    display: grid;
    grid-template-columns: 240px 1fr;
    min-height: calc(100vh - 96px);
    background: var(--corp-canvas);
  }
  @media (max-width: 880px) { .ap-root { grid-template-columns: 1fr; } }

  /* Sub-nav (left) */
  .ap-nav {
    background: #fff;
    border-right: 1px solid var(--lq-line);
    padding: 28px 16px;
    position: sticky;
    top: 96px;
    align-self: start;
    max-height: calc(100vh - 96px);
    overflow-y: auto;
  }
  @media (max-width: 880px) {
    .ap-nav { position: static; max-height: none; border-right: none; border-bottom: 1px solid var(--lq-line); }
  }
  .ap-nav-eyebrow {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--lq-ink-3);
    font-weight: 600;
    margin-bottom: 4px;
  }
  .ap-nav-title {
    margin: 0 0 4px;
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 22px;
    letter-spacing: -0.02em;
    color: var(--lq-ink);
  }
  .ap-nav-sub {
    margin: 0;
    font-size: 12px;
    color: var(--lq-ink-3);
  }
  .ap-nav-sep { height: 1px; background: var(--lq-line); margin: 18px 0 12px; }
  .ap-nav-item {
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
    font-weight: 500;
    color: var(--lq-ink-2);
    border-radius: 8px;
    text-align: left;
    transition: background 140ms ease, color 140ms ease;
  }
  .ap-nav-item:hover { background: rgba(10, 42, 107, 0.04); color: var(--lq-ink); }
  .ap-nav-item.is-active {
    background: rgba(10, 42, 107, 0.10);
    color: var(--launch-navy);
    font-weight: 600;
  }

  /* Body (right) */
  .ap-body {
    padding: 36px 40px 60px;
    max-width: 760px;
  }
  @media (max-width: 880px) { .ap-body { padding: 28px 22px 50px; } }
  .ap-section { }
  .ap-section-head { margin-bottom: 28px; }
  .ap-section-title {
    margin: 0 0 6px;
    font-family: var(--font-display);
    font-weight: 500;
    font-size: clamp(24px, 2.6vw, 32px);
    letter-spacing: -0.022em;
    color: var(--lq-ink);
  }
  .ap-section-sub {
    margin: 0;
    color: var(--lq-ink-2);
    font-size: 14px;
    line-height: 1.55;
    max-width: 60ch;
  }
  .ap-section-body { display: flex; flex-direction: column; gap: 24px; }

  .ap-field { display: flex; flex-direction: column; gap: 6px; }
  .ap-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--lq-ink-3);
    font-weight: 600;
  }
  .ap-field-helper {
    margin: 0 0 4px;
    font-size: 12px;
    color: var(--lq-ink-3);
    line-height: 1.5;
  }
  .ap-input {
    width: 100%;
    background: #fff;
    border: 1px solid var(--lq-line-2);
    border-radius: 10px;
    padding: 11px 14px;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--lq-ink);
    outline: none;
    transition: border-color 140ms ease, box-shadow 140ms ease;
  }
  .ap-input:focus { border-color: var(--launch-navy); box-shadow: 0 0 0 3px rgba(10, 42, 107, 0.10); }
  .ap-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  @media (max-width: 540px) { .ap-row-2 { grid-template-columns: 1fr; } }
  .ap-divider { height: 1px; background: var(--lq-line); margin: 8px 0; }
  .ap-h3 {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 16px;
    color: var(--lq-ink);
    margin: 0;
  }
  .ap-helper-block {
    background: rgba(10, 42, 107, 0.04);
    border: 1px solid rgba(10, 42, 107, 0.10);
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 13px;
    color: var(--lq-ink-2);
    line-height: 1.55;
  }

  /* Logo upload row */
  .ap-logo-row { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
  .ap-logo-preview {
    width: 96px;
    height: 96px;
    border-radius: 14px;
    border: 1px solid var(--lq-line-2);
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #fbf8f1;
  }
  .ap-logo-preview img {
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center bottom;
  }
  .ap-logo-empty {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--lq-ink-3);
    font-weight: 600;
  }
  .ap-logo-buttons { display: flex; gap: 8px; flex-wrap: wrap; }

  /* Toggle */
  .ap-toggle {
    appearance: none;
    background: transparent;
    border: 1px solid var(--lq-line-2);
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition: border-color 140ms ease;
  }
  .ap-toggle:hover { border-color: var(--launch-navy); }
  .ap-toggle-meta { flex: 1; }
  .ap-toggle-label { font-family: var(--font-body); font-weight: 600; font-size: 14px; color: var(--lq-ink); margin-bottom: 3px; }
  .ap-toggle-sub { font-size: 12px; color: var(--lq-ink-3); line-height: 1.5; }
  .ap-toggle-switch {
    flex-shrink: 0;
    width: 38px;
    height: 22px;
    border-radius: 999px;
    background: var(--lq-line);
    position: relative;
    transition: background 200ms ease;
  }
  .ap-toggle-switch.is-on { background: var(--launch-navy); }
  .ap-toggle-switch-knob {
    position: absolute;
    top: 2px; left: 2px;
    width: 18px; height: 18px;
    border-radius: 999px;
    background: #fff;
    transition: transform 200ms ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  }
  .ap-toggle-switch.is-on .ap-toggle-switch-knob { transform: translateX(16px); }

  /* Segmented picker */
  .ap-seg {
    display: inline-flex;
    background: rgba(10, 42, 107, 0.04);
    border: 1px solid var(--lq-line-2);
    border-radius: 999px;
    padding: 3px;
  }
  .ap-seg-btn {
    appearance: none;
    background: transparent;
    border: none;
    padding: 7px 14px;
    border-radius: 999px;
    font-family: var(--font-body);
    font-weight: 500;
    font-size: 13px;
    color: var(--lq-ink-2);
    cursor: pointer;
    transition: background 140ms ease, color 140ms ease;
  }
  .ap-seg-btn:hover:not(.is-on) { color: var(--lq-ink); }
  .ap-seg-btn.is-on { background: var(--launch-navy); color: var(--lq-cream); font-weight: 600; }

  /* Tables (sign-ins / team / invoices) */
  .ap-table { display: flex; flex-direction: column; border: 1px solid var(--lq-line); border-radius: 12px; overflow: hidden; }
  .ap-table-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    border-top: 1px solid var(--lq-line);
    flex-wrap: wrap;
    gap: 10px;
  }
  .ap-table-row:first-child { border-top: none; }
  .ap-table-cell-bold { font-weight: 600; color: var(--lq-ink); font-size: 14px; }
  .ap-table-cell-sub { font-size: 12px; color: var(--lq-ink-3); }
  .ap-table-cell-meta { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; color: var(--lq-ink-3); }
  .ap-table-action {
    appearance: none;
    background: transparent;
    border: none;
    color: var(--launch-navy);
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.10em;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .ap-table-action:hover { text-decoration: underline; }

  /* Mini-modal — used for Invite teammate + Edit member */
  .ap-mini-modal-root {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .ap-mini-modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(10, 42, 107, 0.40);
    backdrop-filter: blur(4px);
  }
  .ap-mini-modal-card {
    position: relative;
    background: #fff;
    border-radius: 18px;
    width: 100%;
    max-width: 460px;
    box-shadow: 0 24px 60px -18px rgba(10, 42, 107, 0.32);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .ap-mini-modal-head {
    padding: 20px 24px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--lq-line);
  }
  .ap-mini-modal-title {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 18px;
    color: var(--lq-ink);
  }
  .ap-mini-modal-close {
    appearance: none;
    background: transparent;
    border: 1px solid var(--lq-line-2);
    border-radius: 999px;
    width: 28px; height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--lq-ink-2);
    cursor: pointer;
    transition: color 140ms ease, border-color 140ms ease;
  }
  .ap-mini-modal-close:hover { color: var(--lq-ink); border-color: var(--launch-navy); }
  .ap-mini-modal-body {
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .ap-mini-modal-foot {
    padding: 14px 24px 20px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    border-top: 1px solid var(--lq-line);
  }

  /* Team avatars + role pills */
  .ap-avatar-sm {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px; height: 32px;
    border-radius: 999px;
    background: var(--launch-navy);
    color: var(--lq-cream);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }
  .ap-role-pill {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 999px;
  }
  .ap-role-admin     { background: var(--launch-navy); color: var(--lq-cream); }
  .ap-role-recruiter { background: rgba(10, 42, 107, 0.10); color: var(--launch-navy); }
  .ap-role-viewer    { background: rgba(10, 42, 107, 0.04); color: var(--lq-ink-2); }
  .ap-status-pending {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    color: var(--lq-ink-3);
    text-transform: uppercase;
  }
  .ap-status-paid {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--launch-teal-3);
    background: var(--launch-teal-soft);
    padding: 3px 9px;
    border-radius: 999px;
  }

  /* Integrations */
  .ap-integration-card {
    background: #fff;
    border: 1px solid var(--lq-line);
    border-radius: 12px;
    padding: 16px 18px;
  }
  .ap-integration-head { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .ap-integration-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    background: rgba(10, 42, 107, 0.06);
    color: var(--launch-navy);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ap-integration-meta { flex: 1; min-width: 200px; }
  .ap-integration-title { font-weight: 600; color: var(--lq-ink); font-size: 14px; margin-bottom: 2px; }
  .ap-integration-sub { font-size: 12px; color: var(--lq-ink-3); line-height: 1.5; }

  /* Billing */
  .ap-plan-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    padding: 20px 22px;
    background: rgba(10, 42, 107, 0.04);
    border: 1px solid rgba(10, 42, 107, 0.14);
    border-radius: 14px;
    flex-wrap: wrap;
  }
  .ap-plan-name {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 26px;
    letter-spacing: -0.02em;
    color: var(--launch-navy);
    line-height: 1;
    margin: 2px 0 4px;
  }
  .ap-plan-price { font-size: 12px; color: var(--lq-ink-3); }
  .ap-usage { margin-bottom: 14px; }
  .ap-usage-head { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .ap-usage-label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--lq-ink-3); font-weight: 600; }
  .ap-usage-val { font-family: var(--font-mono); font-size: 12px; color: var(--launch-navy); font-weight: 700; }
  .ap-usage-max { color: var(--lq-ink-3); font-weight: 500; }
  .ap-usage-bar { height: 6px; background: rgba(10, 42, 107, 0.08); border-radius: 999px; overflow: hidden; }
  .ap-usage-bar-fill { height: 100%; background: var(--launch-navy); border-radius: 999px; transition: width 280ms ease; }

  /* Data & privacy */
  .ap-helper { color: var(--lq-ink-2); font-size: 13px; line-height: 1.55; margin: 0 0 10px; }
  .ap-compliance-card {
    display: flex;
    gap: 12px;
    padding: 14px 16px;
    background: rgba(27, 158, 143, 0.06);
    border: 1px solid rgba(27, 158, 143, 0.22);
    border-radius: 12px;
  }
  .ap-danger-card {
    display: flex;
    gap: 12px;
    padding: 16px 18px;
    background: rgba(122, 14, 42, 0.04);
    border: 1px solid rgba(122, 14, 42, 0.20);
    border-radius: 12px;
  }
`
