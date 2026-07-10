'use client'

/**
 * EducatorDashboard — the careers-advisor surface. Notion-warm register:
 * an editable cover "art piece", school logo + accent (school-managed), a
 * greeting, today's snapshot, and cohorts as rich blocks. Routes into a
 * cohort view and a per-student guidance view.
 *
 * Everything is design-complete + wired at the UI level (create cohort,
 * enrol, assign, edit subjects, export, brand the space). The tech team
 * swaps the seeded workspace for real data.
 */

import { useEffect, useMemo, useState } from 'react'
import { LaunchWordmark } from '@/components/launch-wordmark'
import {
  buildEducatorSeed, overallScore, cohortAverageScores, completionFor,
  needsAttention, standouts, isForStudent, assignmentStateFor,
  generateClassCodeLike,
  type Cohort,
} from '@/lib/educator'
import { ED_NOW, ACCENT_PRESETS, type EdWorkspace, type EdBranding } from '@/components/educator/types'
import { ProgressRing } from '@/components/educator/charts'
import { ModalShell, fmtDate } from '@/components/educator/ui'
import { CohortView } from '@/components/educator/CohortView'
import { StudentView } from '@/components/educator/StudentView'
import { CohortCompare } from '@/components/educator/CohortCompare'
import { ScenarioLibrary } from '@/components/educator/ScenarioLibrary'
import { CommandPalette } from '@/components/educator/CommandPalette'
import { NewScenarioFlow } from '@/components/educator/NewScenarioFlow'
import { FreePlayCard } from '@/components/educator/FreePlayCard'
import { ScenarioBuilderV2 } from '@/components/scenario-builder-v2'
import { ScenarioPlay } from '@/components/play'
import { SCENARIOS } from '@/lib/play/sampleScenarios'
import { addCustomScenarioStub } from '@/lib/scenarioStore'
import { ASSIGNABLE_SCENARIOS, GENERAL_PACKS, type EdAssignment } from '@/lib/educator'
import { AnimatedCounter } from '@/components/motion'
import {
  Image as ImageIcon, Settings, Plus, ArrowLeft, Upload,
  AlertTriangle, Star, CalendarClock, GitCompare, Command,
} from 'lucide-react'
import type { EdScenario, BuilderLens, FreePlaySession } from '@/components/educator/types'

const KEY = 'launch.educator.v1'

const DEFAULT_BRANDING: EdBranding = {
  schoolName: 'Northbridge College',
  accent: '#1B9E8F',
  logoUrl: null,
  coverUrl: null,
}

type Route =
  | { view: 'home' }
  | { view: 'cohort'; cohortId: string }
  | { view: 'student'; cohortId: string; studentId: string }

export function EducatorDashboard({ onBack }: { onBack: () => void }) {
  const [ws, setWs] = useState<EdWorkspace>(() => ({ branding: DEFAULT_BRANDING, ...seedWorkspace() }))
  const [route, setRoute] = useState<Route>({ view: 'home' })
  const [showSettings, setShowSettings] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const [flowOpen, setFlowOpen] = useState(false)
  const [builderLens, setBuilderLens] = useState<BuilderLens | null>(null)
  const [previewPlay, setPreviewPlay] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate / persist the whole workspace.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && Array.isArray(parsed.cohorts)) {
          // Older saves may predate newer workspace fields — default them in.
          setWs({ customScenarios: [], freePlaySessions: [], ...parsed })
        }
      }
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  // ⌘K / Ctrl+K opens the command palette from anywhere in the workspace.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setShowPalette((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(KEY, JSON.stringify(ws)) } catch { /* ignore */ }
  }, [ws, hydrated])

  const patch = (p: Partial<EdWorkspace>) => setWs((w) => ({ ...w, ...p }))
  const setBranding = (b: Partial<EdBranding>) => setWs((w) => ({ ...w, branding: { ...w.branding, ...b } }))

  /** "General practice" — assign every scenario in a pack to the cohort. */
  const assignPack = (cohortId: string, packId: string, dueIso?: string): number => {
    const cohort = ws.cohorts.find((c) => c.id === cohortId)
    const pack = GENERAL_PACKS.find((p) => p.id === packId)
    if (!cohort || !pack) return 0
    const fresh: EdAssignment[] = pack.scenarioIds.flatMap((sid, i) => {
      const scen = ASSIGNABLE_SCENARIOS.find((s) => s.id === sid)
      if (!scen) return []
      return [{
        id: `as-${Date.now().toString(36)}-${i}`,
        cohortId,
        title: scen.title,
        capabilities: scen.capabilities,
        assignedTo: 'cohort' as const,
        dueAt: dueIso,
        createdAt: new Date(ED_NOW).toISOString(),
        progress: cohort.studentIds.map((id) => ({ studentId: id, state: 'not-started' as const })),
      }]
    })
    patch({ assignments: [...fresh, ...ws.assignments] })
    return fresh.length
  }

  /** "Free play" — start a timed open session; the card lands on home. */
  const startFreePlay = (cohortId: string, durationMins: number): FreePlaySession => {
    const session: FreePlaySession = {
      id: `fp-${Date.now().toString(36)}`,
      cohortId,
      durationMins,
      // Real wall-clock (not ED_NOW) — this drives a live countdown.
      startedAt: new Date().toISOString(),
      code: generateClassCodeLike().replace('CLASS-', 'PLAY-'),
    }
    patch({ freePlaySessions: [session, ...ws.freePlaySessions] })
    return session
  }

  const activeCohort = route.view !== 'home' ? ws.cohorts.find((c) => c.id === route.cohortId) || null : null
  const activeStudent = route.view === 'student' ? ws.students.find((s) => s.id === route.studentId) || null : null

  // Scroll to top on route change.
  useEffect(() => { if (typeof window !== 'undefined') window.scrollTo({ top: 0 }) }, [route.view, (route as any).cohortId, (route as any).studentId])

  const rootStyle = { ['--ed-accent' as string]: ws.branding.accent } as React.CSSProperties

  return (
    <main className="ed-root" style={rootStyle}>
      {/* Top bar */}
      <header className="ed-topbar">
        <div className="ed-topbar-in">
          <div className="ed-brand">
            {ws.branding.logoUrl
              ? <img src={ws.branding.logoUrl} alt={ws.branding.schoolName} className="ed-logo" />
              : <LaunchWordmark height={30} tone="dark" ariaLabel="LAUNCH" />}
            <span className="ed-brand-sep" />
            <span className="ed-brand-name">{ws.branding.schoolName}</span>
            <span className="ed-brand-tag">Careers</span>
          </div>
          <div className="ed-topbar-actions">
            <button type="button" className="ed-kbd-hint" onClick={() => setShowPalette(true)} title="Command palette">
              <Command className="w-3.5 h-3.5" /> K
            </button>
            <button type="button" className="ed-btn ed-btn-ghost" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4" /> School settings
            </button>
            <button type="button" className="ed-btn ed-btn-ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" /> Exit
            </button>
          </div>
        </div>
      </header>

      {route.view === 'home' && (
        <HomeView
          ws={ws}
          onOpenCohort={(cohortId) => setRoute({ view: 'cohort', cohortId })}
          onCreate={() => setShowCreate(true)}
          onCompare={() => setShowCompare(true)}
          onReplaceCover={(url) => setBranding({ coverUrl: url })}
          onRegenerateCover={() => setBranding({ coverUrl: null })}
          onAssign={(a) => patch({ assignments: [a, ...ws.assignments] })}
          onNewScenario={() => setFlowOpen(true)}
          onEndSession={(id) => patch({ freePlaySessions: ws.freePlaySessions.filter((s) => s.id !== id) })}
          onPreviewPlay={() => setPreviewPlay(true)}
        />
      )}

      {route.view === 'cohort' && activeCohort && (
        <CohortView
          ws={ws}
          cohort={activeCohort}
          onBack={() => setRoute({ view: 'home' })}
          onOpenStudent={(studentId) => setRoute({ view: 'student', cohortId: activeCohort.id, studentId })}
          onPatch={patch}
        />
      )}

      {route.view === 'student' && activeCohort && activeStudent && (
        <StudentView
          ws={ws}
          cohort={activeCohort}
          student={activeStudent}
          onBack={() => setRoute({ view: 'cohort', cohortId: activeCohort.id })}
        />
      )}

      {showSettings && (
        <SchoolSettings
          branding={ws.branding}
          onClose={() => setShowSettings(false)}
          onChange={setBranding}
        />
      )}

      {showCompare && ws.cohorts.length > 0 && (
        <CohortCompare ws={ws} onClose={() => setShowCompare(false)} />
      )}

      {showPalette && (
        <CommandPalette
          ws={ws}
          onClose={() => setShowPalette(false)}
          onOpenCohort={(cohortId) => setRoute({ view: 'cohort', cohortId })}
          onOpenStudent={(cohortId, studentId) => setRoute({ view: 'student', cohortId, studentId })}
          onNewCohort={() => setShowCreate(true)}
          onCompare={() => setShowCompare(true)}
          onSettings={() => setShowSettings(true)}
          onBuild={() => setFlowOpen(true)}
        />
      )}

      {/* Purpose-first creation flow — THE entry for making/assigning. */}
      {flowOpen && (
        <NewScenarioFlow
          ws={ws}
          onClose={() => setFlowOpen(false)}
          onOpenBuilder={(lens) => { setFlowOpen(false); setBuilderLens(lens) }}
          onAssignPack={assignPack}
          onStartFreePlay={startFreePlay}
        />
      )}

      {/* "See what students see" — the ACTUAL student play experience,
          overlaid full-screen. Exiting returns to the educator workspace. */}
      {previewPlay && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#0e1833' }}>
          <ScenarioPlay
            scenario={SCENARIOS[0]}
            profile={{ name: 'Preview' }}
            onComplete={() => setPreviewPlay(false)}
            onExit={() => setPreviewPlay(false)}
          />
        </div>
      )}

      {/* Teacher scenario builder — the same authoring power the corporates
          get, teacher register (playful, early-career). Entered through the
          library's classroom-lens dialog or ⌘K. */}
      <ScenarioBuilderV2
        externalOpen={builderLens !== null}
        creatorType="teacher"
        lockLevel="early"
        onClose={() => setBuilderLens(null)}
        onRoleCreated={(role) => {
          // Persist the play-side stub so students can resolve the code…
          addCustomScenarioStub({
            id: role.id,
            code: role.accessCode,
            title: role.name,
            skills: role.skills,
            questionsCount: role.questionsCount,
            creatorType: 'teacher',
            variant: 'playful',
            createdAt: new Date(role.createdAt).toISOString(),
            genericQuestions: role.genericQuestions,
          })
          // …surface it in the educator's library, marked "Yours"…
          const scen: EdScenario = {
            id: role.id,
            title: role.name,
            emoji: '🧑‍🏫',
            capabilities: role.skills,
            blurb: builderLens?.brief || 'Authored for your classroom.',
            decisions: role.questionsCount,
            mins: Math.max(6, role.questionsCount * 2),
            isCustom: true,
            subjectName: builderLens?.subjectName,
          }
          // …and if the flow targeted a cohort, assign it there immediately.
          const targetCohort = builderLens?.cohortId ? ws.cohorts.find((c) => c.id === builderLens.cohortId) : undefined
          const autoAssign: EdAssignment[] = targetCohort ? [{
            id: `as-${Date.now().toString(36)}`,
            cohortId: targetCohort.id,
            title: scen.title,
            capabilities: scen.capabilities,
            assignedTo: 'cohort' as const,
            createdAt: new Date(ED_NOW).toISOString(),
            progress: targetCohort.studentIds.map((id) => ({ studentId: id, state: 'not-started' as const })),
          }] : []
          patch({
            customScenarios: [scen, ...ws.customScenarios],
            ...(autoAssign.length ? { assignments: [...autoAssign, ...ws.assignments] } : {}),
          })
        }}
      />

      {showCreate && (
        <CreateCohortModal
          onClose={() => setShowCreate(false)}
          onCreate={(name, term) => {
            const c: Cohort = {
              id: `co-${Date.now().toString(36)}`,
              name,
              term: term || 'New term',
              code: generateClassCodeLike(),
              studentIds: [],
              createdAt: new Date(ED_NOW).toISOString(),
            }
            patch({ cohorts: [c, ...ws.cohorts] })
            setShowCreate(false)
            setRoute({ view: 'cohort', cohortId: c.id })
          }}
        />
      )}

      <style>{edStyles}</style>
    </main>
  )
}

function seedWorkspace() {
  const s = buildEducatorSeed()
  return {
    students: s.students, cohorts: s.cohorts, assignments: s.assignments, subjects: s.subjects,
    customScenarios: [] as EdScenario[], freePlaySessions: [] as FreePlaySession[],
  }
}

/* ══════════════════════════════════════════════════════════════════
   HOME
   ══════════════════════════════════════════════════════════════════ */

function HomeView({
  ws, onOpenCohort, onCreate, onCompare, onReplaceCover, onRegenerateCover, onAssign, onNewScenario, onEndSession, onPreviewPlay,
}: {
  ws: EdWorkspace
  onOpenCohort: (id: string) => void
  onCreate: () => void
  onCompare: () => void
  onReplaceCover: (url: string) => void
  onRegenerateCover: () => void
  onAssign: (a: EdAssignment) => void
  onNewScenario: () => void
  onEndSession: (id: string) => void
  onPreviewPlay: () => void
}) {
  const totalStudents = ws.students.length
  const attention = needsAttention(ws.students, ws.assignments, ED_NOW)
  const shining = standouts(ws.students, 4)

  // Overall completion across every assignment.
  const completion = useMemo(() => {
    let done = 0, total = 0
    for (const a of ws.assignments) {
      const cohort = ws.cohorts.find((c) => c.id === a.cohortId)
      if (!cohort) continue
      const st = completionFor(a, cohort)
      done += st.completed + st.reviewed
      total += st.total
    }
    return total ? Math.round((done / total) * 100) : 0
  }, [ws])

  const dueSoon = useMemo(() => {
    const now = Date.parse(ED_NOW)
    return ws.assignments
      .filter((a) => a.dueAt && Date.parse(a.dueAt) >= now && Date.parse(a.dueAt) < now + 7 * 864e5)
      .sort((a, b) => Date.parse(a.dueAt!) - Date.parse(b.dueAt!))
  }, [ws])

  return (
    <>
      <Cover branding={ws.branding} onReplace={onReplaceCover} onRegenerate={onRegenerateCover} />

      <div className="ed-page">
        {/* Greeting */}
        <div className="ed-greeting">
          <div className="ed-eyebrow">Your careers workspace</div>
          <h1 className="ed-h1">Good morning. Let&rsquo;s move some students forward.</h1>
          <p className="ed-lede">
            {totalStudents} students across {ws.cohorts.length} cohorts.
            {attention.length > 0 ? ` ${attention.length} need a nudge today.` : ' Everyone is on track today.'}
          </p>
        </div>

        {/* Live free-play sessions — front and centre while running */}
        {ws.freePlaySessions.map((s) => (
          <FreePlayCard key={s.id} ws={ws} session={s} onEnd={() => onEndSession(s.id)} onPreview={onPreviewPlay} />
        ))}

        {/* Snapshot row */}
        <div className="ed-snapshot">
          <div className="ed-snap-card ed-snap-ring">
            <ProgressRing pct={completion} label="Completed" />
            <div>
              <div className="ed-snap-num"><AnimatedCounter value={completion} suffix="%" duration={900} /></div>
              <div className="ed-snap-lbl">of assigned scenarios done</div>
            </div>
          </div>

          <div className="ed-snap-card">
            <div className="ed-snap-head"><AlertTriangle className="w-4 h-4" style={{ color: 'var(--launch-danger)' }} /> Needs attention</div>
            {attention.length === 0
              ? <div className="ed-snap-empty">Nobody flagged. Nice.</div>
              : <ul className="ed-snap-list">
                  {attention.slice(0, 4).map((f) => (
                    <li key={f.student.id}><span className="ed-snap-name">{f.student.name}</span><span className="ed-snap-reason">{f.reason}</span></li>
                  ))}
                  {attention.length > 4 && <li className="ed-snap-more">+{attention.length - 4} more</li>}
                </ul>}
          </div>

          <div className="ed-snap-card">
            <div className="ed-snap-head"><Star className="w-4 h-4" style={{ color: 'var(--ed-accent)' }} /> Shining this week</div>
            <ul className="ed-snap-list">
              {shining.map((f) => (
                <li key={f.student.id}><span className="ed-snap-name">{f.student.name}</span><span className="ed-snap-reason">{f.reason}</span></li>
              ))}
            </ul>
          </div>

          <div className="ed-snap-card">
            <div className="ed-snap-head"><CalendarClock className="w-4 h-4" style={{ color: 'var(--lq-ink-3)' }} /> Due this week</div>
            {dueSoon.length === 0
              ? <div className="ed-snap-empty">Nothing due soon.</div>
              : <ul className="ed-snap-list">
                  {dueSoon.slice(0, 4).map((a) => {
                    const cohort = ws.cohorts.find((c) => c.id === a.cohortId)
                    return <li key={a.id}><span className="ed-snap-name">{a.title}</span><span className="ed-snap-reason">{cohort?.name} · {fmtDate(a.dueAt!)}</span></li>
                  })}
                </ul>}
          </div>
        </div>

        {/* Cohorts */}
        <div className="ed-section-head">
          <h2 className="ed-h2">Your cohorts</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {ws.cohorts.length >= 2 && (
              <button type="button" className="ed-btn ed-btn-ghost" onClick={onCompare}>
                <GitCompare className="w-4 h-4" /> Compare
              </button>
            )}
            <button type="button" className="ed-btn ed-btn-primary" onClick={onCreate}>
              <Plus className="w-4 h-4" /> New cohort
            </button>
          </div>
        </div>

        {ws.cohorts.length === 0 ? (
          <div className="ed-empty">
            <p>No cohorts yet — create your first one.</p>
            <button type="button" className="ed-btn ed-btn-primary" onClick={onCreate}><Plus className="w-4 h-4" /> New cohort</button>
          </div>
        ) : (
          <div className="ed-cohort-grid">
            {ws.cohorts.map((c) => (
              <CohortBlock key={c.id} ws={ws} cohort={c} onOpen={() => onOpenCohort(c.id)} />
            ))}
          </div>
        )}

        {/* Scenario library — the educator's window into what students play,
            plus the "author for your classroom" entry to the builder. */}
        <ScenarioLibrary ws={ws} onAssign={onAssign} onNewScenario={onNewScenario} />
      </div>
    </>
  )
}

function CohortBlock({ ws, cohort, onOpen }: { ws: EdWorkspace; cohort: Cohort; onOpen: () => void }) {
  const students = ws.students.filter((s) => cohort.studentIds.includes(s.id))
  const assigns = ws.assignments.filter((a) => a.cohortId === cohort.id)
  const completion = useMemo(() => {
    let done = 0, total = 0
    for (const a of assigns) { const st = completionFor(a, cohort); done += st.completed + st.reviewed; total += st.total }
    return total ? Math.round((done / total) * 100) : 0
  }, [assigns, cohort])
  const avg = students.length ? Math.round(students.reduce((n, s) => n + overallScore(s.scores), 0) / students.length) : 0

  return (
    <article className="ed-cblock" role="button" tabIndex={0} onClick={onOpen} onKeyDown={(e) => { if (e.key === 'Enter') onOpen() }}>
      <div className="ed-cblock-top">
        <div>
          <div className="ed-cblock-term">{cohort.term}</div>
          <h3 className="ed-cblock-name">{cohort.name}</h3>
        </div>
        <span className="ed-cblock-code">{cohort.code}</span>
      </div>
      <div className="ed-cblock-avatars">
        {students.slice(0, 6).map((s) => <span key={s.id} className="ed-cblock-ava">{s.initials}</span>)}
        {students.length > 6 && <span className="ed-cblock-ava ed-cblock-ava-more">+{students.length - 6}</span>}
        {students.length === 0 && <span className="ed-cblock-empty">No students yet</span>}
      </div>
      <div className="ed-cblock-foot">
        <span><strong>{students.length}</strong> students</span>
        <span><strong>{assigns.length}</strong> scenarios</span>
        <span><strong>{completion}%</strong> done</span>
        <span><strong>{avg || '—'}</strong> avg</span>
      </div>
    </article>
  )
}

/* ══════════════════════════════════════════════════════════════════
   COVER — Notion-style, generative default + school replace
   ══════════════════════════════════════════════════════════════════ */

function Cover({ branding, onReplace, onRegenerate }: { branding: EdBranding; onReplace: (url: string) => void; onRegenerate: () => void }) {
  // The permanent default is the Launch rocket artwork at
  // public/educator-cover.png. If the file isn't in the build yet, we fall
  // back to the generative mesh so the cover is never broken.
  const [defaultMissing, setDefaultMissing] = useState(false)
  const onFile = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onReplace(String(reader.result || ''))
    reader.readAsDataURL(file)
  }
  return (
    <div className="ed-cover">
      {branding.coverUrl
        ? <img src={branding.coverUrl} alt="" className="ed-cover-img" />
        : defaultMissing
          ? <GenerativeCover accent={branding.accent} />
          : <img src="/educator-cover.png" alt="" className="ed-cover-img" onError={() => setDefaultMissing(true)} />}
      <div className="ed-cover-tools">
        <label className="ed-cover-btn">
          <Upload className="w-3.5 h-3.5" /> Replace cover
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files?.[0] || null)} />
        </label>
        {branding.coverUrl && (
          <button type="button" className="ed-cover-btn" onClick={onRegenerate}>
            <ImageIcon className="w-3.5 h-3.5" /> Use default
          </button>
        )}
      </div>
    </div>
  )
}

/** Soft generative gradient-mesh cover in the school accent. Pure CSS/SVG. */
export function GenerativeCover({ accent }: { accent: string }) {
  return (
    <div className="ed-gencover" aria-hidden>
      <svg viewBox="0 0 1200 260" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
        <defs>
          <radialGradient id="edg1" cx="20%" cy="30%" r="60%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="edg2" cx="80%" cy="70%" r="55%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1200" height="260" fill="#f4f0e6" />
        <rect width="1200" height="260" fill="url(#edg1)" />
        <rect width="1200" height="260" fill="url(#edg2)" />
        {[...Array(7)].map((_, i) => (
          <circle key={i} cx={120 + i * 165} cy={40 + (i % 3) * 70} r={30 + (i % 4) * 16}
            fill="none" stroke={accent} strokeOpacity={0.12} strokeWidth="1.5" />
        ))}
      </svg>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   School settings + create-cohort modal
   ══════════════════════════════════════════════════════════════════ */

function SchoolSettings({ branding, onClose, onChange }: { branding: EdBranding; onClose: () => void; onChange: (b: Partial<EdBranding>) => void }) {
  const onLogo = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange({ logoUrl: String(reader.result || '') })
    reader.readAsDataURL(file)
  }
  return (
    <ModalShell title="School settings" onClose={onClose}>
      <div className="ed-field">
        <label className="ed-label">School name</label>
        <input className="ed-input" value={branding.schoolName} onChange={(e) => onChange({ schoolName: e.target.value })} />
      </div>
      <div className="ed-field">
        <label className="ed-label">School logo</label>
        <div className="ed-logo-row">
          <span className="ed-logo-prev">
            {branding.logoUrl ? <img src={branding.logoUrl} alt="Logo" /> : <ImageIcon className="w-5 h-5" style={{ color: 'var(--lq-ink-3)' }} />}
          </span>
          <label className="ed-btn ed-btn-ghost"><Upload className="w-4 h-4" /> Upload logo<input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onLogo(e.target.files?.[0] || null)} /></label>
          {branding.logoUrl && <button type="button" className="ed-btn ed-btn-ghost" onClick={() => onChange({ logoUrl: null })}>Remove</button>}
        </div>
      </div>
      <div className="ed-field">
        <label className="ed-label">Accent colour</label>
        <div className="ed-accent-row">
          {ACCENT_PRESETS.map((a) => (
            <button
              key={a.hex}
              type="button"
              className={`ed-accent-dot ${branding.accent === a.hex ? 'is-on' : ''}`}
              style={{ background: a.hex }}
              title={a.name}
              aria-label={a.name}
              onClick={() => onChange({ accent: a.hex })}
            />
          ))}
        </div>
      </div>
    </ModalShell>
  )
}

function CreateCohortModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, term: string) => void }) {
  const [name, setName] = useState('')
  const [term, setTerm] = useState('')
  return (
    <ModalShell title="New cohort" onClose={onClose}>
      <div className="ed-field">
        <label className="ed-label">Cohort name</label>
        <input className="ed-input" autoFocus value={name} placeholder="2026 Graduates" onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onCreate(name.trim(), term.trim()) }} />
      </div>
      <div className="ed-field">
        <label className="ed-label">Term / intake <span style={{ color: 'var(--lq-ink-3)' }}>(optional)</span></label>
        <input className="ed-input" value={term} placeholder="Semester 2 · 2026" onChange={(e) => setTerm(e.target.value)} />
      </div>
      <div className="ed-modal-foot">
        <button type="button" className="ed-btn ed-btn-ghost" onClick={onClose}>Cancel</button>
        <button type="button" className="ed-btn ed-btn-primary" disabled={!name.trim()} onClick={() => onCreate(name.trim(), term.trim())}>Create cohort</button>
      </div>
    </ModalShell>
  )
}

/* ── styles ───────────────────────────────────────────────────────── */

const edStyles = `
  .ed-root { min-height: 100vh; background: #f6f2ea; color: var(--lq-ink); --ed-accent-soft: color-mix(in oklab, var(--ed-accent), transparent 86%); }
  .ed-topbar { position: sticky; top: 0; z-index: 40; background: rgba(246, 242, 234, 0.82); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--lq-line); }
  .ed-topbar-in { max-width: 1180px; margin: 0 auto; padding: 0 24px; height: 62px; display: flex; align-items: center; justify-content: space-between; }
  .ed-brand { display: flex; align-items: center; gap: 12px; }
  .ed-logo { height: 30px; max-width: 130px; object-fit: contain; }
  .ed-brand-sep { width: 1px; height: 20px; background: var(--lq-line-2); }
  .ed-brand-name { font-family: var(--font-display); font-weight: 500; font-size: 15px; color: var(--lq-ink); }
  .ed-brand-tag { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ed-accent); border: 1px solid var(--ed-accent); border-radius: 999px; padding: 2px 8px; }
  .ed-topbar-actions { display: flex; gap: 8px; align-items: center; }
  .ed-kbd-hint { display: inline-flex; align-items: center; gap: 4px; padding: 6px 10px; border-radius: 8px; border: 1px solid var(--lq-line-2); background: #fff; font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--lq-ink-3); cursor: pointer; transition: border-color 140ms ease, color 140ms ease; }
  .ed-kbd-hint:hover { border-color: var(--ed-accent); color: var(--ed-accent); }

  /* Light motion — gentle rise on the main blocks, staggered a touch. */
  @keyframes ed-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .ed-snap-card, .ed-cblock, .ed-lib-card, .ed-lib-build { animation: ed-rise 440ms cubic-bezier(0.2, 0.7, 0.2, 1) both; }
  .ed-snapshot .ed-snap-card:nth-child(2) { animation-delay: 60ms; }
  .ed-snapshot .ed-snap-card:nth-child(3) { animation-delay: 120ms; }
  .ed-snapshot .ed-snap-card:nth-child(4) { animation-delay: 180ms; }
  .ed-cohort-grid .ed-cblock:nth-child(2) { animation-delay: 60ms; }
  .ed-cohort-grid .ed-cblock:nth-child(3) { animation-delay: 120ms; }
  .ed-cohort-grid .ed-cblock:nth-child(4) { animation-delay: 180ms; }

  .ed-btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 17px; border-radius: 999px; font-family: var(--font-body); font-weight: 600; font-size: 13px; border: 1px solid transparent; cursor: pointer; transition: background 160ms ease, border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease; }
  .ed-btn-primary { background: var(--ed-accent); color: #fff; box-shadow: 0 6px 16px -6px var(--ed-accent); }
  .ed-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 22px -8px var(--ed-accent); }
  .ed-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
  .ed-btn-ghost { background: #fff; color: var(--lq-ink-2); border-color: transparent; box-shadow: 0 1px 2px rgba(14,24,51,0.04), 0 0 0 1px rgba(14,24,51,0.05); }
  .ed-btn-ghost:hover { color: var(--lq-ink); box-shadow: 0 1px 2px rgba(14,24,51,0.04), 0 0 0 1.5px var(--ed-accent); }

  .ed-cover { position: relative; height: 248px; overflow: hidden; }
  .ed-cover-img, .ed-gencover { width: 100%; height: 100%; object-fit: cover; }
  .ed-gencover { display: block; }
  .ed-cover-tools { position: absolute; right: 20px; bottom: 14px; display: flex; gap: 8px; opacity: 0; transition: opacity 180ms ease; }
  .ed-cover:hover .ed-cover-tools { opacity: 1; }
  .ed-cover-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,0.92); border: 1px solid var(--lq-line); font-family: var(--font-body); font-size: 12px; font-weight: 600; color: var(--lq-ink); cursor: pointer; }
  .ed-cover-btn:hover { border-color: var(--ed-accent); }

  .ed-page { max-width: 1180px; margin: 0 auto; padding: 0 28px 110px; }
  .ed-greeting { padding: 46px 0 36px; }
  .ed-eyebrow { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ed-accent); font-weight: 600; margin-bottom: 12px; }
  .ed-h1 { font-family: var(--font-display); font-weight: 400; font-size: clamp(28px, 3.6vw, 42px); letter-spacing: -0.024em; line-height: 1.08; color: var(--lq-ink); max-width: 22ch; margin: 0 0 12px; }
  .ed-lede { font-size: 16px; color: var(--lq-ink-2); line-height: 1.55; max-width: 60ch; }

  .ed-snapshot { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 56px; }
  @media (max-width: 940px) { .ed-snapshot { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 560px) { .ed-snapshot { grid-template-columns: 1fr; } }
  .ed-snap-card { background: #fff; border: 1px solid rgba(14, 24, 51, 0.06); border-radius: 20px; padding: 22px; min-height: 158px; box-shadow: 0 1px 2px rgba(14,24,51,0.02), 0 10px 30px -22px rgba(14,24,51,0.12); }
  .ed-snap-ring { display: flex; align-items: center; gap: 16px; }
  .ed-snap-num { font-family: var(--font-mono); font-weight: 700; font-size: 26px; color: var(--lq-ink); line-height: 1; }
  .ed-snap-lbl { font-size: 12px; color: var(--lq-ink-3); margin-top: 4px; max-width: 14ch; }
  .ed-snap-head { display: flex; align-items: center; gap: 7px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; color: var(--lq-ink-3); margin-bottom: 12px; }
  .ed-snap-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
  .ed-snap-list li { display: flex; flex-direction: column; gap: 1px; }
  .ed-snap-name { font-size: 13px; font-weight: 600; color: var(--lq-ink); line-height: 1.2; }
  .ed-snap-reason { font-size: 11px; color: var(--lq-ink-3); }
  .ed-snap-more { font-family: var(--font-mono); font-size: 10px; color: var(--lq-ink-3); }
  .ed-snap-empty { font-size: 13px; color: var(--lq-ink-3); font-style: italic; }

  .ed-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; gap: 16px; }
  .ed-h2 { font-family: var(--font-display); font-weight: 500; font-size: clamp(20px, 2.4vw, 28px); letter-spacing: -0.02em; color: var(--lq-ink); }

  .ed-cohort-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 18px; }
  .ed-cblock { background: #fff; border: 1px solid rgba(14, 24, 51, 0.06); border-radius: 20px; padding: 26px; cursor: pointer; box-shadow: 0 1px 2px rgba(14,24,51,0.02), 0 10px 30px -22px rgba(14,24,51,0.12); transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease; }
  .ed-cblock:hover { border-color: var(--ed-accent); box-shadow: 0 14px 34px -18px var(--ed-accent); transform: translateY(-3px); }
  .ed-cblock-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
  .ed-cblock-term { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lq-ink-3); margin-bottom: 5px; }
  .ed-cblock-name { font-family: var(--font-display); font-weight: 500; font-size: 21px; letter-spacing: -0.015em; color: var(--lq-ink); line-height: 1.15; }
  .ed-cblock-code { font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: 0.06em; color: var(--ed-accent); background: var(--ed-accent-soft); border-radius: 999px; padding: 4px 9px; white-space: nowrap; }
  .ed-cblock-avatars { display: flex; align-items: center; gap: -6px; margin-bottom: 16px; min-height: 30px; }
  .ed-cblock-ava { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 999px; background: var(--ed-accent-soft); color: var(--ed-accent); font-family: var(--font-mono); font-size: 10px; font-weight: 700; border: 2px solid #fff; margin-left: -6px; }
  .ed-cblock-ava:first-child { margin-left: 0; }
  .ed-cblock-ava-more { background: var(--lq-line); color: var(--lq-ink-2); }
  .ed-cblock-empty { font-size: 12px; color: var(--lq-ink-3); font-style: italic; }
  .ed-cblock-foot { display: flex; flex-wrap: wrap; gap: 14px; padding-top: 14px; border-top: 1px solid var(--lq-line); font-size: 12px; color: var(--lq-ink-3); }
  .ed-cblock-foot strong { color: var(--lq-ink); font-family: var(--font-mono); }

  .ed-empty { text-align: center; padding: 48px; background: #fff; border: 1px dashed var(--lq-line-2); border-radius: 20px; }
  .ed-empty p { color: var(--lq-ink-2); margin-bottom: 16px; font-style: italic; font-family: var(--font-display); font-size: 17px; }

  /* Shared content cards — used by cohort Insights + student view */
  .ed-scard { background: #fff; border: 1px solid rgba(14, 24, 51, 0.06); border-radius: 20px; padding: 24px; box-shadow: 0 1px 2px rgba(14,24,51,0.02), 0 10px 30px -22px rgba(14,24,51,0.12); }
  .ed-scard-accent { border-color: var(--ed-accent); box-shadow: 0 0 0 3px var(--ed-accent-soft); }
  .ed-scard-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
  .ed-guide-note { font-size: 12.5px; color: var(--lq-ink-2); line-height: 1.55; margin-bottom: 14px; }

  /* Modals + fields (shared across educator views) */
  .ed-modal-root { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .ed-modal-backdrop { position: absolute; inset: 0; background: rgba(14, 24, 51, 0.42); backdrop-filter: blur(4px); }
  .ed-modal-card { position: relative; background: #fff; border-radius: 20px; width: 100%; max-width: 460px; max-height: 86vh; overflow-y: auto; padding: 22px 24px 24px; box-shadow: 0 30px 70px -24px rgba(14,24,51,0.4); }
  .ed-modal-wide { max-width: 760px; }
  .ed-modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  .ed-modal-title { font-family: var(--font-display); font-weight: 500; font-size: 21px; letter-spacing: -0.015em; color: var(--lq-ink); }
  .ed-modal-foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  .ed-x { appearance: none; background: transparent; border: 1px solid var(--lq-line-2); border-radius: 999px; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; color: var(--lq-ink-2); cursor: pointer; }
  .ed-x:hover { color: var(--lq-ink); border-color: var(--ed-accent); }
  .ed-field { margin-bottom: 16px; }
  .ed-label { display: block; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--lq-ink-3); font-weight: 600; margin-bottom: 7px; }
  .ed-input { width: 100%; border: 1px solid var(--lq-line-2); border-radius: 11px; padding: 11px 14px; font-family: var(--font-body); font-size: 14px; color: var(--lq-ink); background: #fff; }
  .ed-input:focus { outline: none; border-color: var(--ed-accent); box-shadow: 0 0 0 4px var(--ed-accent-soft); }
  .ed-logo-row { display: flex; align-items: center; gap: 12px; }
  .ed-logo-prev { width: 52px; height: 52px; border-radius: 12px; border: 1px solid var(--lq-line); display: inline-flex; align-items: center; justify-content: center; overflow: hidden; background: #fbfaf7; flex-shrink: 0; }
  .ed-logo-prev img { width: 100%; height: 100%; object-fit: contain; }
  .ed-accent-row { display: flex; gap: 10px; }
  .ed-accent-dot { width: 30px; height: 30px; border-radius: 999px; border: 2px solid #fff; box-shadow: 0 0 0 1px var(--lq-line); cursor: pointer; transition: transform 140ms ease, box-shadow 140ms ease; }
  .ed-accent-dot:hover { transform: scale(1.08); }
  .ed-accent-dot.is-on { box-shadow: 0 0 0 2px var(--lq-ink); }
`
