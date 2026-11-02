'use client'

/**
 * EducatorDashboard — the careers-advisor surface, CORPORATE register.
 * One product, two audiences: this shell mirrors the corporate dashboard
 * (cream canvas, frosted top bar, left rail, white navy-accented cards,
 * drill-ins that drop the rail behind a ghost back button) with the
 * school's functions: classes, groups, assignments, guidance, library.
 *
 * Everything is design-complete + wired at the UI level. The tech team
 * swaps the seeded workspace for real data.
 */

import { useEffect, useMemo, useState } from 'react'
import {
  overallScore, completionFor, needsAttention, standouts,
  generateClassCodeLike,
  ASSIGNABLE_SCENARIOS, GENERAL_PACKS,
  UNI_ASSIGNABLE_SCENARIOS, UNI_GENERAL_PACKS,
  type Cohort, type EdAssignment,
} from '@/lib/educator'
import { loadEducatorWorkspace, saveEducatorWorkspace, freshWorkspace, loadInstitution, saveInstitution } from '@/lib/educatorStore'
import { ED_NOW, type EdWorkspace, type EdBranding, type Institution } from '@/components/educator/types'
import { edShared } from '@/components/educator/edStyles'
import { EducatorTopBar } from '@/components/educator/EducatorTopBar'
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
import { AnimatedCounter } from '@/components/motion'
import {
  Image as ImageIcon, Plus, Upload, AlertTriangle, Star, CalendarClock, GitCompare,
  LayoutDashboard, Users, Library, Hammer, Eye, ArrowLeft, GraduationCap, Archive, ArchiveRestore,
} from 'lucide-react'
import { StudentsDirectory } from '@/components/educator/StudentsDirectory'
import type { EdScenario, BuilderLens, FreePlaySession } from '@/components/educator/types'

type Route =
  | { view: 'overview' }
  | { view: 'students' }
  | { view: 'classes' }
  | { view: 'library' }
  | { view: 'cohort'; cohortId: string }
  /** cohortId null = opened from the whole-school Students directory. */
  | { view: 'student'; cohortId: string | null; studentId: string }

const RAIL_VIEWS = ['overview', 'students', 'classes', 'library'] as const

export function EducatorDashboard({ onBack }: { onBack: () => void }) {
  const [ws, setWs] = useState<EdWorkspace>(() => freshWorkspace())
  const [route, setRoute] = useState<Route>({ view: 'overview' })
  const uni = ws.branding.institution === 'university'
  const [showSettings, setShowSettings] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const [flowOpen, setFlowOpen] = useState(false)
  const [builderLens, setBuilderLens] = useState<BuilderLens | null>(null)
  const [previewPlay, setPreviewPlay] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate / persist the whole workspace (shape-checked, old saves backfilled).
  useEffect(() => {
    setWs(loadEducatorWorkspace(loadInstitution()))
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    saveEducatorWorkspace(ws)
  }, [ws, hydrated])

  /** The top-bar persona toggle — save the current world, load the other. */
  const switchInstitution = (inst: Institution) => {
    if (inst === ws.branding.institution) return
    saveEducatorWorkspace(ws)
    saveInstitution(inst)
    setWs(loadEducatorWorkspace(inst))
    setRoute({ view: 'overview' })
  }

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

  const patch = (p: Partial<EdWorkspace>) => setWs((w) => ({ ...w, ...p }))
  const setBranding = (b: Partial<EdBranding>) => setWs((w) => ({ ...w, branding: { ...w.branding, ...b } }))

  /** "General practice" — assign every scenario in a pack to the cohort. */
  const assignPack = (cohortId: string, packId: string, dueIso?: string): number => {
    const isUni = ws.branding.institution === 'university'
    const cohort = ws.cohorts.find((c) => c.id === cohortId)
    const pack = (isUni ? UNI_GENERAL_PACKS : GENERAL_PACKS).find((p) => p.id === packId)
    if (!cohort || !pack) return 0
    const fresh: EdAssignment[] = pack.scenarioIds.flatMap((sid, i) => {
      const scen = (isUni ? UNI_ASSIGNABLE_SCENARIOS : ASSIGNABLE_SCENARIOS).find((s) => s.id === sid)
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

  /** "Free play" — start a timed open session; the card lands on Overview. */
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

  const activeCohort = (route.view === 'cohort' || route.view === 'student') && route.cohortId ? ws.cohorts.find((c) => c.id === route.cohortId) || null : null
  const activeStudent = route.view === 'student' ? ws.students.find((s) => s.id === route.studentId) || null : null
  const onRail = (RAIL_VIEWS as readonly string[]).includes(route.view)
  const activeCohorts = ws.cohorts.filter((c) => !c.archivedAt)

  // Scroll to top on route change.
  useEffect(() => { if (typeof window !== 'undefined') window.scrollTo({ top: 0 }) }, [route.view, (route as any).cohortId, (route as any).studentId])

  // Drill-ins get a ghost back in the top bar; rail views get the build CTA.
  const topActions =
    route.view === 'cohort' ? (
      <button type="button" className="ed-btn ed-btn-ghost" onClick={() => setRoute({ view: 'classes' })}>
        <ArrowLeft className="w-4 h-4" /> All {uni ? 'units' : 'classes'}
      </button>
    ) : route.view === 'student' ? (
      <button
        type="button"
        className="ed-btn ed-btn-ghost"
        onClick={() => activeCohort ? setRoute({ view: 'cohort', cohortId: activeCohort.id }) : setRoute({ view: 'students' })}
      >
        <ArrowLeft className="w-4 h-4" /> {activeCohort?.name ?? 'Students'}
      </button>
    ) : (
      <button type="button" className="ed-btn ed-btn-primary" onClick={() => setFlowOpen(true)}>
        <Plus className="w-4 h-4" /> Create scenario
      </button>
    )

  // The missed-reference safety net: anything still reading --ed-accent
  // renders navy, never the old teal.
  const rootStyle = {
    background: 'var(--corp-canvas)',
    minHeight: '100vh',
    ['--ed-accent' as string]: 'var(--launch-navy)',
    ['--ed-accent-soft' as string]: 'rgba(10,42,107,0.08)',
  } as React.CSSProperties

  const railItem = (view: Route['view'] & string, label: string, Icon: any) => (
    <button
      type="button"
      className={`corp-rail-item ${route.view === view ? 'corp-rail-item-active' : ''}`}
      onClick={() => setRoute({ view } as Route)}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  )

  return (
    <main style={rootStyle}>
      <EducatorTopBar
        branding={ws.branding}
        actions={topActions}
        onOpenSettings={() => setShowSettings(true)}
        onExit={onBack}
        onPalette={() => setShowPalette(true)}
        onInstitution={switchInstitution}
      />

      <div className={onRail ? 'corp-body' : undefined}>
        {onRail && (
          <aside className="corp-rail">
            <nav className="corp-rail-nav" aria-label="Workspace">
              <div className="corp-rail-group">{uni ? 'Your university' : 'Your school'}</div>
              {railItem('overview', 'Overview', LayoutDashboard)}
              {railItem('students', 'Students', Users)}
              {railItem('classes', uni ? 'Units' : 'Classes', GraduationCap)}
              {railItem('library', 'Library', Library)}
              <button type="button" className="corp-rail-item" onClick={() => setFlowOpen(true)}>
                <Hammer className="w-4 h-4" /> Create scenario
              </button>
              <div className="corp-rail-group corp-rail-group-2">Launch tools</div>
              <button type="button" className="corp-rail-item" onClick={() => setShowCompare(true)}>
                <GitCompare className="w-4 h-4" /> {uni ? 'Compare units' : 'Compare classes'}
              </button>
              <button type="button" className="corp-rail-item" onClick={() => setPreviewPlay(true)}>
                <Eye className="w-4 h-4" /> Student view
              </button>
            </nav>
          </aside>
        )}

        <div className={onRail ? 'corp-work' : undefined}>
          {route.view === 'overview' && (
            <OverviewView
              ws={ws}
              onOpenCohort={(cohortId) => setRoute({ view: 'cohort', cohortId })}
              onOpenStudent={(cohortId, studentId) => setRoute({ view: 'student', cohortId, studentId })}
              onAllClasses={() => setRoute({ view: 'classes' })}
              onEndSession={(id) => patch({ freePlaySessions: ws.freePlaySessions.filter((s) => s.id !== id) })}
              onPreviewPlay={() => setPreviewPlay(true)}
            />
          )}

          {route.view === 'students' && (
            <StudentsDirectory
              ws={ws}
              onOpenStudent={(studentId) => setRoute({ view: 'student', cohortId: null, studentId })}
            />
          )}

          {route.view === 'classes' && (
            <ClassesView
              ws={ws}
              onOpenCohort={(cohortId) => setRoute({ view: 'cohort', cohortId })}
              onCreate={() => setShowCreate(true)}
              onCompare={() => setShowCompare(true)}
              onRestore={(cohortId) => patch({ cohorts: ws.cohorts.map((c) => c.id === cohortId ? { ...c, archivedAt: undefined } : c) })}
            />
          )}

          {route.view === 'library' && (
            <div className="ed-page" style={{ paddingTop: 34 }}>
              <ScenarioLibrary ws={ws} onAssign={(a) => patch({ assignments: [a, ...ws.assignments] })} onNewScenario={() => setFlowOpen(true)} />
            </div>
          )}

          {route.view === 'cohort' && activeCohort && (
            <CohortView
              ws={ws}
              cohort={activeCohort}
              onBack={() => setRoute({ view: 'classes' })}
              onOpenStudent={(studentId) => setRoute({ view: 'student', cohortId: activeCohort.id, studentId })}
              onPatch={patch}
              onArchive={() => {
                patch({ cohorts: ws.cohorts.map((c) => c.id === activeCohort.id ? { ...c, archivedAt: new Date(ED_NOW).toISOString() } : c) })
                setRoute({ view: 'classes' })
              }}
            />
          )}

          {route.view === 'student' && activeStudent && (
            <StudentView
              ws={ws}
              cohort={activeCohort}
              student={activeStudent}
              onBack={() => activeCohort ? setRoute({ view: 'cohort', cohortId: activeCohort.id }) : setRoute({ view: 'students' })}
              onPatch={patch}
            />
          )}
        </div>
      </div>

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
          onOverview={() => setRoute({ view: 'overview' })}
          onStudents={() => setRoute({ view: 'students' })}
          onClasses={() => setRoute({ view: 'classes' })}
          onOpenCohort={(cohortId) => setRoute({ view: 'cohort', cohortId })}
          onOpenStudent={(cohortId, studentId) => setRoute({ view: 'student', cohortId, studentId })}
          onNewCohort={() => setShowCreate(true)}
          onCompare={() => setShowCompare(true)}
          onSettings={() => setShowSettings(true)}
          onBuild={() => setFlowOpen(true)}
          onLibrary={() => setRoute({ view: 'library' })}
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
          uni={uni}
          onClose={() => setShowCreate(false)}
          onCreate={(name, term) => {
            const c: Cohort = {
              id: `co-${Date.now().toString(36)}`,
              name,
              term: term || 'New term',
              code: generateClassCodeLike(),
              studentIds: [],
              groups: [],
              createdAt: new Date(ED_NOW).toISOString(),
            }
            patch({ cohorts: [c, ...ws.cohorts] })
            setShowCreate(false)
            setRoute({ view: 'cohort', cohortId: c.id })
          }}
        />
      )}

      <style>{edShared}</style>
      <style>{shellStyles}</style>
    </main>
  )
}

/* ══════════════════════════════════════════════════════════════════
   OVERVIEW — corporate "at a glance" page
   ══════════════════════════════════════════════════════════════════ */

function OverviewView({
  ws, onOpenCohort, onOpenStudent, onAllClasses, onEndSession, onPreviewPlay,
}: {
  ws: EdWorkspace
  onOpenCohort: (id: string) => void
  onOpenStudent: (cohortId: string, studentId: string) => void
  onAllClasses: () => void
  onEndSession: (id: string) => void
  onPreviewPlay: () => void
}) {
  const uni = ws.branding.institution === 'university'
  const cohorts = useMemo(() => ws.cohorts.filter((c) => !c.archivedAt), [ws.cohorts])
  const totalStudents = ws.students.length
  // Scope attention per class — a student is only measured against their
  // own class's assignments, not every cohort's overdue list.
  const attention = useMemo(() => {
    const seen = new Set<string>()
    return cohorts.flatMap((c) => {
      const students = ws.students.filter((s) => c.studentIds.includes(s.id))
      const assignments = ws.assignments.filter((a) => a.cohortId === c.id)
      return needsAttention(students, assignments, ED_NOW).filter((f) => {
        if (seen.has(f.student.id)) return false
        seen.add(f.student.id)
        return true
      })
    })
  }, [ws, cohorts])
  const shining = standouts(ws.students, 4)

  // Overall completion across every active class's assignments.
  const completion = useMemo(() => {
    let done = 0, total = 0
    for (const a of ws.assignments) {
      const cohort = cohorts.find((c) => c.id === a.cohortId)
      if (!cohort) continue
      const st = completionFor(a, cohort)
      done += st.completed + st.reviewed
      total += st.total
    }
    return total ? Math.round((done / total) * 100) : 0
  }, [ws, cohorts])

  const dueSoon = useMemo(() => {
    const now = Date.parse(ED_NOW)
    return ws.assignments
      .filter((a) => cohorts.some((c) => c.id === a.cohortId))
      .filter((a) => a.dueAt && Date.parse(a.dueAt) >= now && Date.parse(a.dueAt) < now + 7 * 864e5)
      .sort((a, b) => Date.parse(a.dueAt!) - Date.parse(b.dueAt!))
  }, [ws, cohorts])

  const cohortOf = (studentId: string) => cohorts.find((c) => c.studentIds.includes(studentId))

  return (
    <div className="ed-page">
      {/* Page header — corporate recipe, headline ends in a full stop */}
      <div className="pt-10 sm:pt-12 pb-2">
        <div className="ed-eyebrow">Your careers workspace</div>
        <h1 className="ed-h1">Good morning.</h1>
        <p className="ed-lede">
          {totalStudents.toLocaleString()} students across {uni ? '1st–3rd year and Honours' : 'Years 10–12'} · {cohorts.length} active {uni ? 'units' : 'classes'}.
          {attention.length > 0 ? ` ${attention.length} need a nudge.` : ' All on track.'}
        </p>
      </div>

      {/* Live free-play sessions — front and centre while running */}
      <div className="mt-6">
        {ws.freePlaySessions.map((s) => (
          <FreePlayCard key={s.id} ws={ws} session={s} onEnd={() => onEndSession(s.id)} onPreview={onPreviewPlay} />
        ))}
      </div>

      {/* KPI band — completion floats boxless as the row's stylistic lead;
          the donut IS the number, label underneath. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="ed-kpi-free">
          <ProgressRing pct={completion} size={104} label="Completed" />
          <div className="ed-eyebrow" style={{ margin: '12px 0 0' }}>Completion</div>
          <div className="ed-kpi-foot" style={{ marginTop: 4 }}>across every assignment</div>
        </div>
        <div className="ed-kpi">
          <div className="ed-kpi-top"><span className="ed-eyebrow" style={{ margin: 0 }}>Students</span></div>
          {/* key: AnimatedCounter animates once per mount — remount on mode switch */}
          <div className="ed-kpi-stat"><AnimatedCounter key={`st-${ws.branding.institution}`} value={totalStudents} duration={1100} group /></div>
          <div className="ed-kpi-foot">{uni ? `1st–3rd yr + honours · ${cohorts.length} units` : `years 10–12 · ${cohorts.length} classes`}</div>
        </div>
        <div className="ed-kpi">
          <div className="ed-kpi-top"><span className="ed-eyebrow" style={{ margin: 0 }}>Need attention</span></div>
          <div className="ed-kpi-stat" style={{ color: attention.length ? 'var(--launch-danger)' : undefined }}>
            <AnimatedCounter key={`att-${ws.branding.institution}`} value={attention.length} duration={1100} />
          </div>
          <div className="ed-kpi-foot">overdue · stalled · below the bar</div>
        </div>
        <div className="ed-kpi">
          <div className="ed-kpi-top"><span className="ed-eyebrow" style={{ margin: 0 }}>Shining</span></div>
          <div className="ed-kpi-stat" style={{ color: 'var(--launch-teal)' }}>
            <AnimatedCounter key={`sh-${ws.branding.institution}`} value={shining.length} duration={1100} />
          </div>
          <div className="ed-kpi-foot">standouts this week</div>
        </div>
      </div>

      {/* Attention + shining panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="ed-scard">
          <div className="ed-scard-head">
            <span className="ed-eyebrow" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--launch-danger)' }} /> Needs attention
            </span>
          </div>
          {attention.length === 0
            ? <div className="ed-dim" style={{ fontStyle: 'italic' }}>Nobody flagged. Nice.</div>
            : <ul className="ed-rowlist">
                {attention.slice(0, 5).map((f) => {
                  const co = cohortOf(f.student.id)
                  return (
                    <li key={f.student.id}>
                      <button type="button" className="ed-rowbtn" onClick={() => co && onOpenStudent(co.id, f.student.id)}>
                        <span className="ed-row-name">{f.student.name}</span>
                        <span className="ed-row-meta" style={{ color: 'var(--launch-danger)' }}>{f.reason}</span>
                      </button>
                    </li>
                  )
                })}
                {attention.length > 5 && <li className="ed-dim" style={{ padding: '8px 0 0' }}>+{attention.length - 5} more</li>}
              </ul>}
        </div>
        <div className="ed-scard">
          <div className="ed-scard-head">
            <span className="ed-eyebrow" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <Star className="w-3.5 h-3.5" style={{ color: 'var(--launch-teal)' }} /> Shining this week
            </span>
          </div>
          <ul className="ed-rowlist">
            {shining.map((f) => {
              const co = cohortOf(f.student.id)
              return (
                <li key={f.student.id}>
                  <button type="button" className="ed-rowbtn" onClick={() => co && onOpenStudent(co.id, f.student.id)}>
                    <span className="ed-row-name">{f.student.name}</span>
                    <span className="ed-row-meta">{f.reason}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Due this week */}
      <div className="ed-scard mt-4">
        <div className="ed-scard-head">
          <span className="ed-eyebrow" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <CalendarClock className="w-3.5 h-3.5" /> Due this week
          </span>
        </div>
        {dueSoon.length === 0
          ? <div className="ed-dim" style={{ fontStyle: 'italic' }}>Nothing due soon.</div>
          : <ul className="ed-rowlist">
              {dueSoon.slice(0, 5).map((a) => {
                const cohort = ws.cohorts.find((c) => c.id === a.cohortId)
                return (
                  <li key={a.id}>
                    <button type="button" className="ed-rowbtn" onClick={() => cohort && onOpenCohort(cohort.id)}>
                      <span className="ed-row-name">{a.title}</span>
                      <span className="ed-row-meta">{cohort?.name} · {fmtDate(a.dueAt!)}</span>
                    </button>
                  </li>
                )
              })}
            </ul>}
      </div>

      {/* Classes mini-grid */}
      <div className="flex items-center justify-between mt-10 mb-4">
        <h2 className="ed-h2">{uni ? 'Your units.' : 'Your classes.'}</h2>
        <button type="button" className="ed-seeall" onClick={onAllClasses}>See all →</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cohorts.slice(0, 3).map((c) => (
          <CohortBlock key={c.id} ws={ws} cohort={c} onOpen={() => onOpenCohort(c.id)} />
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   CLASSES
   ══════════════════════════════════════════════════════════════════ */

function ClassesView({
  ws, onOpenCohort, onCreate, onCompare, onRestore,
}: {
  ws: EdWorkspace
  onOpenCohort: (id: string) => void
  onCreate: () => void
  onCompare: () => void
  onRestore: (id: string) => void
}) {
  const uni = ws.branding.institution === 'university'
  const noun = uni ? 'unit' : 'class'
  const nounPlural = uni ? 'units' : 'classes'
  const active = ws.cohorts.filter((c) => !c.archivedAt)
  const archived = ws.cohorts.filter((c) => !!c.archivedAt)
  const [showArchive, setShowArchive] = useState(false)

  return (
    <div className="ed-page">
      <div className="pt-10 sm:pt-12 pb-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="ed-eyebrow">{uni ? 'Units' : 'Classes'}</div>
          <h1 className="ed-h1">Every {noun}, one view.</h1>
          <p className="ed-lede">Open a {noun} for its heatmap, groups, assignments and {uni ? 'course' : 'subject'} fit.</p>
        </div>
        <div className="flex gap-2 pb-1">
          {active.length >= 2 && (
            <button type="button" className="ed-btn ed-btn-ghost" onClick={onCompare}>
              <GitCompare className="w-4 h-4" /> Compare
            </button>
          )}
          <button type="button" className="ed-btn ed-btn-primary" onClick={onCreate}>
            <Plus className="w-4 h-4" /> New {noun}
          </button>
        </div>
      </div>

      {active.length === 0 ? (
        <div className="ed-empty mt-6">
          <p>No active {nounPlural} — create one, or restore from the archive below.</p>
          <button type="button" className="ed-btn ed-btn-primary" onClick={onCreate}><Plus className="w-4 h-4" /> New {noun}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {active.map((c) => (
            <CohortBlock key={c.id} ws={ws} cohort={c} onOpen={() => onOpenCohort(c.id)} />
          ))}
        </div>
      )}

      {/* Archive — past classes stay queryable, never deleted */}
      {archived.length > 0 && (
        <div className="mt-10">
          <button type="button" className="ed-arch-toggle" onClick={() => setShowArchive((v) => !v)} aria-expanded={showArchive}>
            <Archive className="w-3.5 h-3.5" /> Archive · {archived.length} {showArchive ? '▴' : '▾'}
          </button>
          {showArchive && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {archived.map((c) => {
                const n = ws.students.filter((s) => c.studentIds.includes(s.id)).length
                return (
                  <article key={c.id} className="ed-arch-card corp-card">
                    <div className="ed-eyebrow" style={{ marginBottom: 5 }}>{c.term} · archived</div>
                    <h3 className="ed-cblock-name">{c.name}</h3>
                    <div className="ed-dim" style={{ margin: '8px 0 14px' }}>{n} students · {c.code}</div>
                    <div className="flex gap-2">
                      <button type="button" className="ed-btn ed-btn-ghost" onClick={() => onRestore(c.id)}>
                        <ArchiveRestore className="w-4 h-4" /> Restore
                      </button>
                      <button type="button" className="ed-btn ed-btn-ghost" onClick={() => onOpenCohort(c.id)}>
                        Open
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
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
    <article className="ed-cblock corp-card" role="button" tabIndex={0} onClick={onOpen} onKeyDown={(e) => { if (e.key === 'Enter') onOpen() }}>
      <div className="ed-cblock-top">
        <div>
          <div className="ed-eyebrow" style={{ marginBottom: 5 }}>{cohort.term}</div>
          <h3 className="ed-cblock-name">{cohort.name}</h3>
        </div>
        <span className="corp-chip">{cohort.code}</span>
      </div>
      <div className="ed-cblock-avatars">
        {students.slice(0, 6).map((s) => <span key={s.id} className="ed-cblock-ava">{s.initials}</span>)}
        {students.length > 6 && <span className="ed-cblock-ava ed-cblock-ava-more">+{students.length - 6}</span>}
        {students.length === 0 && <span className="ed-dim" style={{ fontStyle: 'italic' }}>No students yet</span>}
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
   School settings + create-class modal
   ══════════════════════════════════════════════════════════════════ */

function SchoolSettings({ branding, onClose, onChange }: { branding: EdBranding; onClose: () => void; onChange: (b: Partial<EdBranding>) => void }) {
  const inst = branding.institution === 'university' ? 'University' : 'School'
  const onLogo = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange({ logoUrl: String(reader.result || '') })
    reader.readAsDataURL(file)
  }
  return (
    <ModalShell title={`${inst} settings`} onClose={onClose}>
      <div className="ed-field">
        <label className="ed-label">{inst} name</label>
        <input className="ed-input" value={branding.schoolName} onChange={(e) => onChange({ schoolName: e.target.value })} />
      </div>
      <div className="ed-field">
        <label className="ed-label">{inst} logo</label>
        <div className="ed-logo-row">
          <span className="ed-logo-prev">
            {branding.logoUrl ? <img src={branding.logoUrl} alt="Logo" /> : <ImageIcon className="w-5 h-5" style={{ color: 'var(--lq-ink-3)' }} />}
          </span>
          <label className="ed-btn ed-btn-ghost"><Upload className="w-4 h-4" /> Upload logo<input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onLogo(e.target.files?.[0] || null)} /></label>
          {branding.logoUrl && <button type="button" className="ed-btn ed-btn-ghost" onClick={() => onChange({ logoUrl: null })}>Remove</button>}
        </div>
      </div>
    </ModalShell>
  )
}

function CreateCohortModal({ uni, onClose, onCreate }: { uni: boolean; onClose: () => void; onCreate: (name: string, term: string) => void }) {
  const [name, setName] = useState('')
  const [term, setTerm] = useState('')
  const noun = uni ? 'unit' : 'class'
  return (
    <ModalShell title={`New ${noun}`} onClose={onClose}>
      <div className="ed-field">
        <label className="ed-label">{uni ? 'Unit name' : 'Class name'}</label>
        <input className="ed-input" autoFocus value={name} placeholder={uni ? 'PROP301 Property Development' : '2026 Graduates'} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onCreate(name.trim(), term.trim()) }} />
      </div>
      <div className="ed-field">
        <label className="ed-label">{uni ? 'Session' : 'Term / intake'} <span style={{ color: 'var(--lq-ink-3)' }}>(optional)</span></label>
        <input className="ed-input" value={term} placeholder={uni ? 'Spring session · 2026' : 'Semester 2 · 2026'} onChange={(e) => setTerm(e.target.value)} />
      </div>
      <div className="ed-modal-foot">
        <button type="button" className="ed-btn ed-btn-ghost" onClick={onClose}>Cancel</button>
        <button type="button" className="ed-btn ed-btn-primary" disabled={!name.trim()} onClick={() => onCreate(name.trim(), term.trim())}>Create {noun}</button>
      </div>
    </ModalShell>
  )
}

/* ── shell-local styles ──────────────────────────────────────────── */

const shellStyles = `
  /* Boxless completion donut — a stylistic value, not a card */
  .ed-kpi-free { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 8px 0; animation: ed-rise 440ms cubic-bezier(0.2,0.7,0.2,1) both; }

  /* KPI cards — the corporate Overview recipe */
  .ed-kpi { background: #fff; border: 1px solid var(--lq-line); border-radius: 16px; padding: 20px; transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease; animation: ed-rise 440ms cubic-bezier(0.2,0.7,0.2,1) both; }
  .ed-kpi:hover { border-color: var(--lq-line-2); box-shadow: 0 10px 30px rgba(14,24,51,0.06); transform: translateY(-2px); }
  .ed-kpi:nth-child(2) { animation-delay: 60ms; }
  .ed-kpi:nth-child(3) { animation-delay: 120ms; }
  .ed-kpi:nth-child(4) { animation-delay: 180ms; }
  .ed-kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; min-height: 28px; }
  .ed-kpi-stat { font-family: var(--font-display); font-weight: 500; font-size: clamp(28px, 3vw, 44px); letter-spacing: -0.03em; line-height: 1; color: var(--launch-navy); }
  .ed-kpi-foot { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lq-ink-3); margin-top: 10px; }

  /* Divided row lists inside panels */
  .ed-rowlist { list-style: none; margin: 0; padding: 0; }
  .ed-rowlist > li { border-top: 1px solid var(--lq-line); }
  .ed-rowlist > li:first-child { border-top: none; }
  .ed-rowbtn { display: flex; width: 100%; align-items: baseline; justify-content: space-between; gap: 12px; padding: 10px 2px; background: none; border: none; text-align: left; cursor: pointer; border-radius: 8px; transition: background 140ms ease; }
  .ed-rowbtn:hover { background: rgba(10,42,107,0.04); }
  .ed-row-name { font-size: 13.5px; font-weight: 600; color: var(--lq-ink); }
  .ed-row-meta { font-size: 11.5px; color: var(--lq-ink-3); text-align: right; }

  .ed-seeall { background: none; border: none; cursor: pointer; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 600; color: var(--launch-navy); padding: 6px 2px; }
  .ed-seeall:hover { text-decoration: underline; }

  /* Class cards */
  .ed-cblock { padding: 24px; cursor: pointer; animation: ed-rise 440ms cubic-bezier(0.2,0.7,0.2,1) both; }
  .ed-cblock:hover { border-color: var(--launch-navy); }
  .ed-cblock:nth-child(2) { animation-delay: 60ms; }
  .ed-cblock:nth-child(3) { animation-delay: 120ms; }
  .ed-cblock-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
  .ed-cblock-name { font-family: var(--font-display); font-weight: 500; font-size: 21px; letter-spacing: -0.015em; color: var(--lq-ink); line-height: 1.15; }
  .ed-cblock-avatars { display: flex; align-items: center; margin-bottom: 16px; min-height: 30px; }
  .ed-cblock-ava { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 999px; background: rgba(10,42,107,0.08); color: var(--launch-navy); font-family: var(--font-mono); font-size: 10px; font-weight: 700; border: 2px solid #fff; margin-left: -6px; }
  .ed-cblock-ava:first-child { margin-left: 0; }
  .ed-cblock-ava-more { background: var(--lq-line); color: var(--lq-ink-2); }
  .ed-cblock-foot { display: flex; flex-wrap: wrap; gap: 14px; padding-top: 14px; border-top: 1px solid var(--lq-line); font-size: 12px; color: var(--lq-ink-3); }
  .ed-cblock-foot strong { color: var(--launch-navy); font-family: var(--font-mono); }

  /* Classes archive */
  .ed-arch-toggle { display: inline-flex; align-items: center; gap: 7px; background: none; border: none; cursor: pointer; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 700; color: var(--lq-ink-3); padding: 6px 0; }
  .ed-arch-toggle:hover { color: var(--launch-navy); }
  .ed-arch-card { padding: 22px; opacity: 0.82; }
  .ed-arch-card:hover { opacity: 1; }

  .ed-logo-row { display: flex; align-items: center; gap: 12px; }
  .ed-logo-prev { width: 52px; height: 52px; border-radius: 12px; border: 1px solid var(--lq-line); display: inline-flex; align-items: center; justify-content: center; overflow: hidden; background: #fbf8f1; flex-shrink: 0; }
  .ed-logo-prev img { width: 100%; height: 100%; object-fit: contain; }
`
