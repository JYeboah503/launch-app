'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { HeroSection } from '@/components/hero-section'
import { StudentAuthView } from '@/components/student-auth-view'
import { StudentDashboard } from '@/components/student-dashboard'
import { PartnerAuthView } from '@/components/partner-auth-view'
import { TeacherDashboard } from '@/components/teacher-dashboard'
import { LaunchWordmark } from '@/components/launch-wordmark'
import { CorporateTopBar } from '@/components/corporate-top-bar'
import { PartnerLogoTag } from '@/components/partner-logo-tag'
import { PartnerAccountPage } from '@/components/partner-account-page'
import { RoleApplicantFilters, applyApplicantFilters, DEFAULT_FILTERS, type ApplicantFilters } from '@/components/role-applicant-filters'
import type { AppMode } from '@/lib/roles'
import { addCustomScenarioStub, setScenarioStatus, deleteCustomScenario } from '@/lib/scenarioStore'
import { listSubmissions, type Submission } from '@/lib/submissionStore'
import { seedIfNeeded, loadActiveRoles, submissionsToStudents } from '@/lib/seedData'
import { listSubmissionsForCode } from '@/lib/submissionStore'
import { Header } from '@/components/header'
import { CapabilitiesSection } from '@/components/capabilities-section'
import { ResultsSection } from '@/components/results-section'
import { CTASection } from '@/components/cta-section'
import { DashboardHero } from '@/components/dashboard-hero'
import { DashboardFilter } from '@/components/dashboard-filter'
import { LaunchStandouts } from '@/components/launch-standouts'
import { CandidateName } from '@/components/candidate-name'
import { PartnerTools } from '@/components/partner-tools'
import { ScenarioBuilder } from '@/components/scenario-builder'
import { ScenarioBuilderV2 } from '@/components/scenario-builder-v2'
import { SubmissionsView } from '@/components/submissions-view'
import { StudentProfileView } from '@/components/student-profile-view'
import { CapabilityDetailView } from '@/components/capability-detail-view'
import { ChallengesView } from '@/components/challenges-view'
import { ApplicantCurator } from '@/components/applicant-curator'
import { CreateChallenge } from '@/components/create-challenge'
import { ApplicantPerformance } from '@/components/applicant-performance'
import { MOCK_STUDENTS, STUDENT_PROFILES, CHALLENGES } from '@/lib/mock-data'
import { Plus, MoreHorizontal, Lock, Unlock, Trash2, X } from 'lucide-react'
import type { Student } from '@/components/student-list'
import { AnimatedCounter, Sparkline } from '@/components/motion'

export default function Page() {
  const router = useRouter()
  // Three-door entry: 'landing' shows Scenario / Partner access / Educator
  // access. Each door routes directly to its surface — there is no
  // intermediate selector. The legacy isStudent/isPartner flags still gate
  // the existing dashboards; appMode is a thin layer on top.
  const [appMode, setAppMode] = useState<AppMode>('landing')
  const [authView, setAuthView] = useState<'none' | 'student' | 'partner'>('none')
  const [isPartnerLoggedIn, setIsPartnerLoggedIn] = useState(false)
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [selectedCapability, setSelectedCapability] = useState<{ key: string; name: string } | null>(null)
  const [showChallenges, setShowChallenges] = useState(false)
  const [partnerView, setPartnerView] = useState<'dashboard' | 'curator' | 'createChallenge' | 'performance'>('dashboard')
  // Left-rail nav for the corporate dashboard. Each item swaps the
  // centre work area; persisted in localStorage so refresh keeps your view.
  const [corporateNav, setCorporateNav] = useState<'overview' | 'roles' | 'standouts' | 'builder'>('overview')
  const [showBuilderV2, setShowBuilderV2] = useState(false)
  const [curatedList, setCuratedList] = useState<{ students: Student[], name: string } | null>(null)
  const [createdChallenges, setCreatedChallenges] = useState<any[]>([])
  // Standouts filter — Top-N and capability work INDEPENDENTLY and COMPOSE.
  // Partner can pick "Top 10" alone, "Problem Solving" alone, or combine
  // them as "Top 10 by Problem Solving". Each chip toggles its own state;
  // the filter pipeline below applies whichever are set. (Named with the
  // "Standout" prefix to avoid colliding with the capability-detail-view
  // `selectedCapability` state higher up in this component.)
  const [selectedTopN, setSelectedTopN] = useState<number | null>(null)
  const [selectedStandoutCap, setSelectedStandoutCap] = useState<string | null>(null)
  const [activeRoles, setActiveRoles] = useState<any[]>([])
  const [selectedRoleView, setSelectedRoleView] = useState<string | null>(null)
  /** Which role is currently being asked "delete this?" Used to gate the
   *  destructive action behind an explicit confirm modal — never one click. */
  const [roleToDelete, setRoleToDelete] = useState<{ id: string; name: string } | null>(null)

  /** Toggle a scenario's open/closed status in the store + locally. Closing
   *  stops new candidates from entering the access code (gated in
   *  student-dashboard); existing submissions stay viewable. */
  const handleToggleRoleStatus = (id: string, next: 'open' | 'closed') => {
    setScenarioStatus(id, next)
    setActiveRoles((prev) => prev.map((r) => r.id === id
      ? { ...r, status: next, closedAt: next === 'closed' ? new Date().toISOString() : undefined }
      : r,
    ))
  }
  /** Confirmed delete — removes the scenario from the store and from the
   *  in-memory list. Candidate submissions for the role's code stay in
   *  submissionStore (independent), so a partner who deletes a role can still
   *  resurface its applicant data if they want it. */
  const handleConfirmDeleteRole = () => {
    if (!roleToDelete) return
    deleteCustomScenario(roleToDelete.id)
    setActiveRoles((prev) => prev.filter((r) => r.id !== roleToDelete.id))
    setRoleToDelete(null)
  }
  // Per-skill picker + top-N selector state removed — those controls
  // moved into the RoleApplicantFilters strip as the Capabilities tab.
  /** Filter state for the role-detail applicant pipeline. Reset to defaults
   *  whenever the partner enters a different role. */
  const [applicantFilters, setApplicantFilters] = useState<ApplicantFilters>(DEFAULT_FILTERS)
  // Reset on role switch so each role starts with a clean filter state.
  useEffect(() => {
    if (selectedRoleView) setApplicantFilters(DEFAULT_FILTERS)
  }, [selectedRoleView])
  /** ID of the scenario the partner just created — used to flash a
   *  "just created" highlight on its card in the Scenarios section so
   *  they see exactly where their work landed. Cleared on a timer. */
  const [justCreatedRoleId, setJustCreatedRoleId] = useState<string | null>(null)
  /** When true, the Account settings page takes over the corporate work area. */
  const [showAccountPage, setShowAccountPage] = useState<boolean>(false)
  useEffect(() => {
    if (!justCreatedRoleId) return
    const t = setTimeout(() => setJustCreatedRoleId(null), 6000)
    return () => clearTimeout(t)
  }, [justCreatedRoleId])

  // Seed + load corporate state on partner login. seedIfNeeded() is idempotent
  // (writes a flag), so reloads don't re-seed. activeRoles hydrates from the
  // scenarioStore so the partner's earlier builds survive a refresh.
  useEffect(() => {
    if (!isPartnerLoggedIn) return
    seedIfNeeded()
    setActiveRoles(loadActiveRoles())
  }, [isPartnerLoggedIn])

  // Submissions from localStorage — hydrate after mount to avoid SSR mismatch.
  const [submissions, setSubmissions] = useState<Submission[]>([])
  useEffect(() => {
    setSubmissions(listSubmissions())
  }, [corporateNav, isPartnerLoggedIn])

  // Scroll to top on every meaningful navigation change. Without this, the
  // partner clicks "Active roles" from mid-Overview and lands halfway down
  // the new section because the window kept its previous scroll position.
  // Covers sidebar nav, drill-in to a role detail, drill-in to a candidate,
  // and capability-detail surfaces. Uses 'auto' (instant) rather than
  // 'smooth' — a dashboard nav should feel like a page change, not a slide.
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [corporateNav, selectedRoleView, selectedStudentId, selectedCapability])

  // Scenario builder: ready-to-go entry. Every entry point (sidebar, CTAs,
  // "+ New scenario") opens the takeover directly via `openBuilder`. No
  // useEffect indirection — that was racing with onClose + the conditional
  // builder mount, and the result was the sidebar button silently failing
  // on the second navigation in. Direct setters = predictable behaviour.
  const openBuilder = () => {
    setCorporateNav('builder')
    setShowBuilderV2(true)
  }
  /** Derived stats for the corporate overview funnel — actionable numbers,
   *  not marketing metrics. Recomputes when submissions or roles change. */
  const corpStats = useMemo(() => {
    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    const thisWeek = submissions.filter(s => new Date(s.submittedAt).getTime() >= weekAgo)
    const qualified = submissions.filter(s => !s.notQualified)
    const flagged = submissions.filter(s => s.notQualified)
    return {
      activeScenarios: activeRoles.length,
      submissionsTotal: submissions.length,
      thisWeek: thisWeek.length,
      qualifiedCount: qualified.length,
      qualifiedPct: submissions.length === 0 ? 0 : Math.round((qualified.length / submissions.length) * 100),
      flaggedCount: flagged.length,
    }
  }, [submissions, activeRoles])
  /** Latest 3 submissions for the "Recent activity" panel on overview. */
  const recentSubmissions = useMemo(() => {
    return [...submissions]
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 3)
  }, [submissions])
  /** Top 3 candidates by overall score — for "Standouts to look at" on overview. */
  const topStandouts = useMemo(() => {
    return [...MOCK_STUDENTS]
      .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))
      .slice(0, 3)
  }, [])

  // Filter students based on selections
  const filteredStudents: Student[] = useMemo(() => {
    let students = [...MOCK_STUDENTS]
    // 1. Capability filter — narrow to candidates who have this capability,
    //    sorted by their level on it (desc).
    if (selectedStandoutCap) {
      students = students
        .filter((s) => s.topCapabilities.some((c) => c.name === selectedStandoutCap))
        .sort((a, b) => {
          const aL = a.topCapabilities.find((c) => c.name === selectedStandoutCap)?.level || 0
          const bL = b.topCapabilities.find((c) => c.name === selectedStandoutCap)?.level || 0
          return bL - aL
        })
    }
    // 2. Top-N — slice the (possibly capability-ranked) list to the chosen
    //    count. Composes naturally: "Top 10 by Problem Solving" = capability
    //    filter + sort, then take the first 10.
    if (selectedTopN !== null) students = students.slice(0, selectedTopN)
    return students
  }, [selectedTopN, selectedStandoutCap])

  // Get selected student profile.
  //   1) Static catalogue (MOCK_STUDENTS top-3 — Sarah / James / Maya)
  //   2) If miss, try the submissionStore: seeded + real submissions both
  //      carry the full CandidateProfile, which we adapt into the same
  //      StudentProfileView shape so partner can drill in to ANY applicant.
  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null
    const fromStatic = STUDENT_PROFILES[selectedStudentId]
    if (fromStatic) return fromStatic
    // Shared deterministic-hash → capability levels so each candidate
    // ALWAYS lands with the same numbers across re-renders.
    const ALL_CAPS = [
      'Judgement & Decision-Making', 'Reasoning & Critical Thinking',
      'Problem Solving', 'Leadership & Influence',
      'Adaptability & Cognitive Flexibility', 'Emotional Intelligence',
      'Execution & Ownership', 'Integrity & Ethics',
      'Collaboration', 'Situational Awareness & Systems Thinking',
    ]
    const seededCaps = (seedId: string) => {
      let h = 0
      for (let i = 0; i < seedId.length; i++) h = ((h << 5) - h) + seedId.charCodeAt(i) | 0
      return ALL_CAPS.map((name, i) => ({ name, level: 60 + (Math.abs(h + i * 7) % 36) }))
    }

    // Fallback 2 — Submission-derived profile (seeded role applicants + real plays).
    const subs = listSubmissions()
    const sub = subs.find((s) => s.id === selectedStudentId)
    if (sub && sub.profile) {
      const p = sub.profile
      return {
        id: sub.id,
        name: p.name,
        interests: p.industries || [],
        capabilities: seededCaps(sub.id),
        bio: p.whyLooking
          ? `${p.name} — ${p.whyLooking}`
          : `${p.name} applied for ${sub.scenarioTitle}. Profile collected at intake.`,
        degree: p.degree,
        atar: p.atar,
        school: p.university || '—',
      } as any
    }

    // Fallback 3 — MOCK_STUDENTS catalogue (the 1,200-strong pool used by
    // Overview Standouts, Discovery tools etc.). Without this fallback,
    // clicking any candidate beyond the hardcoded 3 returns null → blank
    // page. AI summary, Contact via LAUNCH, capabilities all hidden.
    const mock = MOCK_STUDENTS.find((m) => m.id === selectedStudentId)
    if (mock) {
      // The candidate's "top capabilities" come from generateStudents (3
      // capabilities, level 75–95). Spread those plus the unseen others
      // out across the full 10-capability shape so the StudentCapability-
      // Scores chart has every axis to plot.
      const topMap = new Map(mock.topCapabilities.map((c) => [c.name, c.level]))
      const caps = ALL_CAPS.map((name) => ({
        name,
        level: topMap.get(name) ?? 60 + ((mock.overallScore + name.length) % 30),
      }))
      return {
        id: mock.id,
        name: mock.name,
        interests: mock.interests,
        capabilities: caps,
        bio: `${mock.name.split(' ')[0]} is a strong all-rounder with standout signals in ${mock.topCapabilities.slice(0, 2).map(c => c.name).join(' and ')}. ATAR ${mock.atar?.toFixed(1) || '—'} · ${mock.degree || '—'}.`,
        degree: mock.degree,
        atar: mock.atar,
        school: mock.university || '—',
      } as any
    }

    return null
  }, [selectedStudentId])

  const studentChallenges = selectedStudentId ? CHALLENGES[selectedStudentId] || [] : []

  // If student auth view is open
  if (authView === 'student') {
    return (
      <main className="min-h-screen bg-background">
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-12 sm:py-16">
          <StudentAuthView
            onSignup={(data) => {
              setAuthView('none')
              setStudentName(data.name)
              setIsStudentLoggedIn(true)
            }}
            onBack={() => setAuthView('none')}
          />
        </div>
      </main>
    )
  }

  // If student is logged in, show their dashboard
  if (isStudentLoggedIn) {
    return (
      <StudentDashboard
        studentName={studentName}
        onLogout={() => {
          setIsStudentLoggedIn(false)
          setStudentName('')
          setAppMode('landing')
        }}
      />
    )
  }

  // Teacher dashboard (stub for now — real classrooms land in Section C)
  if (appMode === 'teacher') {
    return <TeacherDashboard onBack={() => setAppMode('landing')} />
  }

  // If partner auth view is open
  if (authView === 'partner') {
    return (
      <main className="min-h-screen bg-background">
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-12 sm:py-16">
          <PartnerAuthView
            onSignup={() => {
              setAuthView('none')
              setIsPartnerLoggedIn(true)
            }}
            onBack={() => setAuthView('none')}
          />
        </div>
      </main>
    )
  }

  // If capability selected, show capability detail view
  if (selectedCapability) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--corp-canvas)' }}>
        <PartnerLogoTag />
        <CorporateTopBar
          eyebrow={`· corporate · capability`}
          actions={
            <button
              onClick={() => setSelectedCapability(null)}
              className="corp-btn corp-btn-ghost"
            >
              ← Back to dashboard
            </button>
          }
        />
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-8">
          <CapabilityDetailView
            capabilityName={selectedCapability.name}
            capabilityKey={selectedCapability.key}
            students={filteredStudents}
            onSelectStudent={(studentId) => {
              setSelectedStudentId(studentId)
              setSelectedCapability(null)
            }}
          />
        </div>
      </main>
    )
  }

  // If showing challenges, display challenges view
  if (showChallenges && selectedStudent) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--corp-canvas)' }}>
        <PartnerLogoTag />
        <CorporateTopBar
          eyebrow={`· corporate · ${selectedStudent.name} · challenges`}
          actions={
            <button
              onClick={() => setShowChallenges(false)}
              className="corp-btn corp-btn-ghost"
            >
              ← Back to profile
            </button>
          }
        />
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-8">
          <ChallengesView
            challenges={studentChallenges}
            onBack={() => setShowChallenges(false)}
          />
        </div>
      </main>
    )
  }

  // If student selected, show profile view
  if (selectedStudent) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--corp-canvas)' }}>
        <PartnerLogoTag />
        <CorporateTopBar
          eyebrow={`· corporate · candidate`}
          actions={
            <button
              onClick={() => setSelectedStudentId(null)}
              className="corp-btn corp-btn-ghost"
            >
              ← Back to dashboard
            </button>
          }
        />
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-8">

          <StudentProfileView
            student={selectedStudent}
            /* When the candidate landed via a real (or seeded) submission,
               pass it through so the profile shows their raw pre-qualifier
               answers + AI verdict per question. */
            submission={(() => {
              if (!selectedStudentId) return null
              return listSubmissions().find((s) => s.id === selectedStudentId) || null
            })()}
            onChallengesClick={() => setShowChallenges(true)}
            onContactClick={() => {
              alert(`Contact request for ${selectedStudent.name} submitted through LAUNCH platform`)
            }}
            roleSkills={selectedRoleView ? activeRoles.find(r => r.id === selectedRoleView)?.skills : undefined}
            allStudentsData={selectedRoleView ? MOCK_STUDENTS.map(s => ({
              id: s.id,
              name: s.name,
              capabilities: STUDENT_PROFILES[s.id]?.capabilities || []
            })) : undefined}
          />
        </div>
      </main>
    )
  }

  // Dashboard view - only for partners
  if (isPartnerLoggedIn) {
    // Account settings page — takes over the work area, has its own internal sub-nav
    if (showAccountPage) {
      return (
        <main className="min-h-screen" style={{ background: 'var(--corp-canvas)' }}>
          <PartnerLogoTag />
          <CorporateTopBar
            onSignOut={() => {
              setIsPartnerLoggedIn(false)
              setShowAccountPage(false)
              setAppMode('landing')
            }}
            actions={
              <button onClick={() => setShowAccountPage(false)} className="corp-btn corp-btn-ghost">
                ← Back to dashboard
              </button>
            }
          />
          <PartnerAccountPage />
        </main>
      )
    }

    // Show role candidates view
    if (selectedRoleView) {
      const selectedRole = activeRoles.find(r => r.id === selectedRoleView)
      // Role's actual applicant pool — read from submissionStore so the
      // filter UI operates on candidates who ACTUALLY applied to this
      // scenario (not the global mock pool).
      const roleSubmissions = selectedRole
        ? listSubmissionsForCode(selectedRole.accessCode)
        : []
      const roleApplicants = roleSubmissions.length > 0
        ? submissionsToStudents(roleSubmissions, selectedRole?.skills)
        : MOCK_STUDENTS  // fallback for sample data / quick-play scenarios

      return (
        <main className="min-h-screen" style={{ background: 'var(--corp-canvas)' }}>
          <PartnerLogoTag />
          <CorporateTopBar
            eyebrow="· corporate · role"
            actions={
              <button
                onClick={() => setSelectedRoleView(null)}
                className="corp-btn corp-btn-ghost"
              >
                ← Back to roles
              </button>
            }
          />
          <div className="w-full max-w-6xl mx-auto">

            {/* Role Info Header — matches Overview / Scenarios pattern */}
            <div className="px-3 sm:px-4 pt-10 sm:pt-12 pb-8 border-b border-[var(--lq-line)]">
              <div className="editorial-mono mb-3" style={{ color: 'var(--lq-ink-3)' }}>
                Scenario · live
              </div>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1
                    className="mb-2"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 500,
                      fontSize: 'clamp(28px, 3.4vw, 40px)',
                      letterSpacing: '-0.022em',
                      lineHeight: 1.08,
                      color: 'var(--lq-ink)',
                    }}
                  >
                    {selectedRole?.name}
                  </h1>
                  <p className="text-base" style={{ color: 'var(--lq-ink-2)' }}>
                    {selectedRole?.questionsCount} questions · {selectedRole?.skills?.length} skills assessed
                  </p>
                </div>
                {/* Access code — prominent so partner can copy-paste quickly */}
                <div
                  className="rounded-md px-4 py-3 flex flex-col"
                  style={{
                    background: 'rgba(10, 42, 107, 0.06)',
                    border: '1px solid rgba(10, 42, 107, 0.18)',
                  }}
                >
                  <span className="editorial-mono mb-1" style={{ color: 'var(--lq-ink-3)', fontSize: 10 }}>Access code</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--launch-navy)', fontSize: 18, letterSpacing: '0.06em' }}>
                    {selectedRole?.accessCode}
                  </span>
                </div>
              </div>
              <p className="text-sm mt-4 max-w-[60ch]" style={{ color: 'var(--lq-ink-2)' }}>
                Use the filters below to narrow your applicant pool. Capability
                scoring sits underneath — both stack live.
              </p>
            </div>

            {/* Applicant filter pipeline — profile + eligibility + looking-for
                filters at the top of the role detail page. */}
            <section className="px-3 sm:px-4 py-8">
              <RoleApplicantFilters
                students={roleApplicants}
                filters={applicantFilters}
                setFilters={setApplicantFilters}
                scenarioCapabilities={selectedRole?.skills}
              />
            </section>

            {/* Filtered applicant cards — the main candidate list under the
                filter strip. Partner clicks through to the student profile. */}
            <section className="px-3 sm:px-4 pb-8">
              {(() => {
                const filtered = applyApplicantFilters(roleApplicants, applicantFilters)
                if (filtered.length === 0) {
                  return (
                    <div className="corp-card p-10 text-center">
                      <p style={{ color: 'var(--lq-ink-2)' }}>
                        No candidates match these filters. Loosen a benchmark or
                        clear filters to see the full pool.
                      </p>
                    </div>
                  )
                }
                return (
                  <div>
                    <div className="flex items-baseline justify-between mb-4">
                      <h3 className="editorial-display-sm" style={{ fontSize: 18, color: 'var(--lq-ink)' }}>
                        Applicants
                      </h3>
                      <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
                        Showing {Math.min(24, filtered.length)} of {filtered.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filtered.slice(0, 24).map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setSelectedStudentId(a.id)}
                          className="corp-card p-4 text-left transition-colors hover:border-[var(--launch-navy)]"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="min-w-0">
                              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15, color: 'var(--lq-ink)' }}>
                                <CandidateName name={a.name} />
                              </div>
                              <div className="text-xs truncate" style={{ color: 'var(--lq-ink-3)' }}>
                                {a.degree || '—'} · {a.university || '—'}
                              </div>
                            </div>
                            {a.prequalStatus === 'flagged' && (
                              <span
                                className="editorial-mono px-1.5 py-0.5 rounded-full"
                                style={{ background: 'rgba(122, 14, 42, 0.10)', color: '#7a0e2a', fontSize: 9, letterSpacing: '0.12em' }}
                              >
                                Flagged
                              </span>
                            )}
                          </div>
                          <div className="mt-3 pt-3 border-t border-[var(--lq-line)] flex items-center justify-between">
                            <div className="flex items-baseline gap-1">
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 16, color: 'var(--launch-navy)' }}>{a.overallScore}</span>
                              <span style={{ fontSize: 10, color: 'var(--lq-ink-3)' }}>overall</span>
                            </div>
                            <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)', fontSize: 10 }}>
                              {a.atar !== undefined ? `ATAR ${a.atar}` : '—'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {filtered.length > 24 && (
                      <div className="text-center mt-6">
                        <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
                          + {filtered.length - 24} more · narrow with capability picker below
                        </span>
                      </div>
                    )}
                  </div>
                )
              })()}
            </section>

          </div>
        </main>
      )
    }

    // (Performance + Curate + CreateChallenge views removed — the role-detail
    //  filter pipeline does both jobs once a partner has active scenarios.)

    // Show partner dashboard
    return (
      <main className="min-h-screen" style={{ background: 'var(--corp-canvas)' }}>
        <div className="w-full">
          <PartnerLogoTag />
          {/* Corporate top bar — shared component, used across every corporate sub-view */}
          <CorporateTopBar
            onOpenAccount={() => setShowAccountPage(true)}
            onSignOut={() => {
              setIsPartnerLoggedIn(false)
              setSelectedCapabilities([])
              setSelectedInterests([])
              setSelectedStudentId(null)
              setSelectedCapability(null)
              setAppMode('landing')
            }}
            actions={
              <>
                <button
                  onClick={() => { document.getElementById('scenario-builder-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                  className="corp-btn corp-btn-primary"
                >
                  Build a scenario
                </button>
                <button
                  onClick={() => {
                    setIsPartnerLoggedIn(false)
                    setSelectedCapabilities([])
                    setSelectedInterests([])
                    setSelectedStudentId(null)
                    setSelectedCapability(null)
                    setAppMode('landing')
                  }}
                  className="corp-btn corp-btn-ghost"
                >
                  ← Back
                </button>
              </>
            }
          />

          {/* Sidebar shell — left rail + centre work area */}
          <div className="corp-body">
            <aside className="corp-rail">
              <nav className="corp-rail-nav" aria-label="Corporate sections">
                {/* Group 1: Your company — things the partner directly controls
                    (their dashboard, their roles, the builder they author scenarios with) */}
                <div className="corp-rail-group">Your company</div>
                {([
                  { key: 'overview',    label: 'Overview' },
                  { key: 'roles',       label: 'Active roles' },
                  { key: 'builder',     label: 'Scenario builder' },
                ] as const).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      // Builder is special: clicking it opens the takeover.
                      // Everything else is plain navigation.
                      if (item.key === 'builder') openBuilder()
                      else setCorporateNav(item.key)
                    }}
                    className={`corp-rail-item${corporateNav === item.key ? ' corp-rail-item-active' : ''}`}
                  >
                    {item.label}
                  </button>
                ))}

                {/* Group 2: Launch tools — generic platform features that work
                    across all corporates, not tied to a specific role. */}
                <div className="corp-rail-group corp-rail-group-2">Launch tools</div>
                {([
                  { key: 'standouts',   label: 'Standouts' },
                ] as const).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setCorporateNav(item.key)}
                    className={`corp-rail-item${corporateNav === item.key ? ' corp-rail-item-active' : ''}`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </aside>
            <div className="corp-work">

          {/* ────────────────────────────────────────────────────────────
              OVERVIEW — partner command centre.
              Three stacked bands:
                1. Page header  (eyebrow + title + helper line + primary CTA)
                2. Funnel KPIs  (real actionable numbers, not marketing metrics)
                3. "Right now"  (Recent submissions + Standouts to review)
                4. Active scenarios mini-grid (cross-link to roles section)
              ──────────────────────────────────────────────────────────── */}
          {corporateNav === 'overview' && (<>
          {/* 1. Page header — workspace tone, not marketing */}
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 sm:pt-12 pb-2">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <div className="editorial-mono mb-3" style={{ color: 'var(--lq-ink-3)' }}>
                  Overview
                </div>
                <h1
                  className="mb-3"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 400,
                    fontSize: 'clamp(28px, 3.4vw, 40px)',
                    letterSpacing: '-0.022em',
                    lineHeight: 1.08,
                    color: 'var(--lq-ink)',
                  }}
                >
                  Your hiring, at a glance.
                </h1>
                <p
                  className="max-w-[56ch] text-base"
                  style={{ color: 'var(--lq-ink-2)', lineHeight: 1.55 }}
                >
                  Who&rsquo;s applied, who&rsquo;s qualified, who&rsquo;s
                  standing out — and what to act on next.
                </p>
              </div>
              {/* Primary CTA — anchored to header, not floating */}
              <button
                type="button"
                onClick={() => { openBuilder() }}
                className="corp-btn corp-btn-primary"
                style={{ flexShrink: 0 }}
              >
                + Build a scenario
              </button>
            </div>
          </div>

          {/* 2. Funnel KPIs — four cards, actionable counts */}
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Active scenarios',
                value: corpStats.activeScenarios,
                helper: corpStats.activeScenarios === 0 ? 'None yet — build one' : 'live',
                onClick: () => setCorporateNav('roles'),
              },
              {
                label: 'Submissions',
                value: corpStats.submissionsTotal,
                helper: corpStats.thisWeek > 0 ? `+${corpStats.thisWeek} this week` : 'this week',
                onClick: () => setCorporateNav('roles'),
              },
              {
                label: 'Qualified',
                value: corpStats.qualifiedCount,
                helper: corpStats.submissionsTotal === 0 ? '—' : `${corpStats.qualifiedPct}% pass rate`,
                onClick: () => setCorporateNav('roles'),
              },
              {
                label: 'Flagged',
                value: corpStats.flaggedCount,
                helper: corpStats.submissionsTotal === 0 ? '—' : 'below benchmark',
                onClick: () => setCorporateNav('roles'),
              },
            ].map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={s.onClick}
                className="corp-card p-5 text-left transition-colors hover:border-[var(--launch-navy)]"
              >
                <div className="editorial-mono mb-3" style={{ color: 'var(--lq-ink-3)' }}>{s.label}</div>
                <div
                  className="editorial-stat"
                  style={{ fontSize: 'clamp(28px, 3vw, 44px)', color: 'var(--launch-navy)', lineHeight: 1 }}
                >
                  <AnimatedCounter value={s.value} duration={1100} />
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--lq-line)] editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
                  {s.helper}
                </div>
              </button>
            ))}
          </div>

          {/* 3. "Right now" — two panels side-by-side: recent submissions + standouts */}
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent submissions — empty-state aware */}
            <section className="corp-card p-5">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="editorial-display-sm" style={{ fontSize: 18, color: 'var(--lq-ink)' }}>
                  Recent submissions
                </h2>
                <button
                  type="button"
                  onClick={() => setCorporateNav('roles')}
                  className="editorial-mono transition-colors"
                  style={{ color: 'var(--launch-navy)' }}
                >
                  See all →
                </button>
              </div>
              {recentSubmissions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm mb-3" style={{ color: 'var(--lq-ink-3)' }}>
                    {corpStats.activeScenarios === 0
                      ? 'No submissions yet. Build a scenario first.'
                      : 'No submissions yet. Share your access code with candidates.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (corpStats.activeScenarios === 0) {
                        openBuilder()
                      } else {
                        setCorporateNav('roles')
                      }
                    }}
                    className="corp-btn corp-btn-ghost"
                  >
                    {corpStats.activeScenarios === 0 ? 'Build a scenario →' : 'View access codes →'}
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--lq-line)]">
                  {recentSubmissions.map((sub) => (
                    <li key={sub.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--lq-ink)' }}>
                            <CandidateName name={sub.candidateName} />
                          </span>
                          {sub.notQualified && (
                            <span
                              className="editorial-mono px-1.5 py-0.5 rounded-full"
                              style={{ background: 'rgba(122, 14, 42, 0.10)', color: '#7a0e2a', fontSize: 10 }}
                            >
                              Not qualified
                            </span>
                          )}
                        </div>
                        <div className="text-xs truncate" style={{ color: 'var(--lq-ink-3)' }}>
                          {sub.scenarioTitle} · {new Date(sub.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCorporateNav('roles')}
                        className="editorial-mono text-xs"
                        style={{ color: 'var(--launch-navy)', flexShrink: 0 }}
                      >
                        Review →
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Standouts to look at */}
            <section className="corp-card p-5">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="editorial-display-sm" style={{ fontSize: 18, color: 'var(--lq-ink)' }}>
                  Standouts to look at
                </h2>
                <button
                  type="button"
                  onClick={() => setCorporateNav('standouts')}
                  className="editorial-mono transition-colors"
                  style={{ color: 'var(--launch-navy)' }}
                >
                  See all →
                </button>
              </div>
              <ul className="divide-y divide-[var(--lq-line)]">
                {topStandouts.map((s) => (
                  <li key={s.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--lq-ink)' }}>
                        <CandidateName name={s.name} />
                      </div>
                      <div className="text-xs truncate" style={{ color: 'var(--lq-ink-3)' }}>
                        {s.topCapabilities.slice(0, 2).map(c => c.name).join(' · ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className="editorial-mono"
                        style={{ color: 'var(--launch-navy)', fontSize: 18, fontWeight: 600 }}
                      >
                        {s.overallScore}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedStudentId(s.id)}
                        className="editorial-mono text-xs"
                        style={{ color: 'var(--launch-navy)' }}
                      >
                        Open →
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* 4. Active scenarios — mini grid so partner sees their pipeline.
                Only renders if they actually have scenarios. */}
          {activeRoles.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="editorial-display-sm" style={{ fontSize: 20, color: 'var(--lq-ink)' }}>
                  Active scenarios
                </h2>
                <button
                  type="button"
                  onClick={() => setCorporateNav('roles')}
                  className="editorial-mono"
                  style={{ color: 'var(--launch-navy)' }}
                >
                  Open library →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeRoles.slice(0, 3).map((role) => {
                  // Glanceable per-role funnel — partner sees applicant count
                  // + flagged count + qualified % at a glance without drilling in.
                  const roleSubs = submissions.filter(s => s.scenarioCode === role.accessCode)
                  const roleFlagged = roleSubs.filter(s => s.notQualified).length
                  return (
                  <article
                    key={role.id}
                    onClick={() => setSelectedRoleView(role.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') setSelectedRoleView(role.id) }}
                    className="corp-card p-4 cursor-pointer transition-colors hover:border-[var(--launch-navy)]"
                  >
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16, color: 'var(--lq-ink)' }}>
                      {role.name}
                    </div>
                    <div className="mt-2 text-xs" style={{ color: 'var(--lq-ink-3)' }}>
                      {role.questionsCount} questions · {role.skills?.length || 0} capabilities
                    </div>
                    {/* Funnel bar — qualified vs flagged split */}
                    <div className="mt-3 flex items-baseline gap-3">
                      <div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 22, color: 'var(--launch-navy)', lineHeight: 1 }}>
                          {roleSubs.length}
                        </span>
                        <span className="editorial-mono ml-1" style={{ color: 'var(--lq-ink-3)', fontSize: 10 }}>
                          {roleSubs.length === 1 ? 'applicant' : 'applicants'}
                        </span>
                      </div>
                      {roleFlagged > 0 && (
                        <span className="editorial-mono" style={{ color: '#7a0e2a', fontSize: 10, letterSpacing: '0.14em' }}>
                          {roleFlagged} flagged
                        </span>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-[var(--lq-line)] flex items-center justify-between">
                      <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)', fontSize: 10 }}>
                        {role.accessCode}
                      </span>
                      <span className="editorial-mono" style={{ color: 'var(--launch-navy)', fontSize: 10 }}>
                        Open →
                      </span>
                    </div>
                  </article>
                )})}
              </div>
            </div>
          )}
          </>)}

          {/* Active Roles — active scenarios (top) + capability chart (bottom).
              Order matters: partners come here primarily to manage their live
              scenarios, so those lead. The capability chart at the bottom
              answers "what are my scenarios measuring across the portfolio?"
              — a portfolio-level reflection, not a navigation surface. */}
          {corporateNav === 'roles' && (
            <div>
              <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8 pb-2">
                <div className="flex items-start justify-between gap-6 flex-wrap mb-2">
                  <div>
                    <div className="editorial-mono mb-3" style={{ color: 'var(--lq-ink-3)' }}>Scenarios</div>
                    <h1
                      className="mb-3"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 400,
                        fontSize: 'clamp(28px, 3.4vw, 40px)',
                        letterSpacing: '-0.022em',
                        lineHeight: 1.08,
                        color: 'var(--lq-ink)',
                      }}
                    >
                      Active scenarios
                    </h1>
                    <p className="max-w-[56ch] text-base" style={{ color: 'var(--lq-ink-2)', lineHeight: 1.55 }}>
                      Each scenario has an access code candidates use to play.
                      Click a card to see who&rsquo;s applied and their performance.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { openBuilder() }}
                    className="corp-btn corp-btn-primary"
                    style={{ flexShrink: 0 }}
                  >
                    + Build a scenario
                  </button>
                </div>
              </div>
              {activeRoles.length === 0 ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
                  <div className="corp-card p-10 text-center">
                    <p className="mb-3" style={{ color: 'var(--lq-ink-2)' }}>
                      No scenarios yet — your first one takes about a minute.
                    </p>
                    <button
                      type="button"
                      onClick={() => { openBuilder() }}
                      className="corp-btn corp-btn-primary"
                    >
                      Start the builder
                    </button>
                  </div>
                </div>
              ) : (
              <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
                {/* Success banner when a partner just shipped a new scenario.
                    Auto-clears via the justCreatedRoleId timer. */}
                {justCreatedRoleId && (() => {
                  const justRole = activeRoles.find(r => r.id === justCreatedRoleId)
                  if (!justRole) return null
                  return (
                    <div
                      className="rounded-md px-4 py-3 mb-6 flex items-center justify-between flex-wrap gap-3"
                      style={{
                        background: 'rgba(27, 158, 143, 0.10)',
                        border: '1px solid rgba(27, 158, 143, 0.30)',
                      }}
                    >
                      <div>
                        <div className="editorial-mono mb-0.5" style={{ color: 'var(--launch-teal-3)' }}>
                          Scenario shipped
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--lq-ink)' }}>
                          {justRole.name} is live · candidates can use code <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--launch-navy)', fontWeight: 600 }}>{justRole.accessCode}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { navigator.clipboard?.writeText(justRole.accessCode); }}
                        className="corp-btn corp-btn-ghost"
                      >
                        Copy access code
                      </button>
                    </div>
                  )
                })()}
                <div className="flex items-baseline justify-between mb-4">
                  <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>{activeRoles.length} live</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeRoles.map((role) => {
                    const isClosed = role.status === 'closed'
                    return (
                    <article
                      key={role.id}
                      onClick={() => setSelectedRoleView(role.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') setSelectedRoleView(role.id) }}
                      className="corp-card p-6 cursor-pointer group relative"
                      style={
                        role.id === justCreatedRoleId
                          ? { borderColor: 'var(--launch-teal)', boxShadow: '0 0 0 3px rgba(27, 158, 143, 0.18)' }
                          // Closed cards fade so the partner can tell at a glance which
                          // scenarios are still pulling candidates. Body content stays
                          // legible (review of existing applicants still matters).
                          : isClosed
                            ? { opacity: 0.72, background: 'rgba(10, 42, 107, 0.02)' }
                            : undefined
                      }
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>Role</span>
                          {isClosed && (
                            <span
                              className="editorial-mono"
                              style={{
                                background: 'rgba(122, 14, 42, 0.08)',
                                color: '#7a0e2a',
                                padding: '2px 8px',
                                borderRadius: 999,
                                fontSize: 9,
                                letterSpacing: '0.14em',
                                fontWeight: 700,
                              }}
                            >
                              CLOSED
                            </span>
                          )}
                        </div>
                        <RoleActionsMenu
                          role={role}
                          isClosed={isClosed}
                          onToggleStatus={(next) => handleToggleRoleStatus(role.id, next)}
                          onRequestDelete={() => setRoleToDelete({ id: role.id, name: role.name })}
                        />
                      </div>
                      <h3
                        className="text-xl mb-2"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.015em' }}
                      >
                        {role.name}
                      </h3>
                      <div className="text-xs mb-3" style={{ color: 'var(--lq-ink-3)' }}>
                        {role.questionsCount} questions · {role.skills?.length || (role as any).skillsCount} capabilities
                      </div>
                      {/* Funnel summary — applicants + flagged at a glance */}
                      {(() => {
                        const roleSubs = submissions.filter(s => s.scenarioCode === role.accessCode)
                        const roleFlagged = roleSubs.filter(s => s.notQualified).length
                        const passRate = roleSubs.length === 0 ? 0 : Math.round(((roleSubs.length - roleFlagged) / roleSubs.length) * 100)
                        return (
                          <div className="py-3 my-3 border-y border-[var(--lq-line)]">
                            <div className="flex items-baseline justify-between mb-2">
                              <div>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 28, color: 'var(--launch-navy)', lineHeight: 1 }}>
                                  {roleSubs.length}
                                </span>
                                <span className="editorial-mono ml-1.5" style={{ color: 'var(--lq-ink-3)', fontSize: 10 }}>
                                  {roleSubs.length === 1 ? 'applicant' : 'applicants'}
                                </span>
                              </div>
                              {roleSubs.length > 0 && (
                                <span className="editorial-mono" style={{ color: 'var(--launch-teal-3)', fontSize: 10 }}>
                                  {passRate}% pass
                                </span>
                              )}
                            </div>
                            {/* Pass/flag bar */}
                            {roleSubs.length > 0 && (
                              <div className="flex h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(122, 14, 42, 0.10)' }}>
                                <div style={{ width: `${passRate}%`, background: 'var(--launch-teal)' }} />
                              </div>
                            )}
                          </div>
                        )
                      })()}
                      <div className="flex items-center justify-between">
                        <span className="editorial-mono" style={{ color: 'var(--launch-navy)', fontSize: 11, letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{role.accessCode}</span>
                        <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)', fontSize: 10 }}>
                          {isClosed && role.closedAt
                            ? `closed ${new Date(role.closedAt).toLocaleDateString()}`
                            : `shipped ${new Date(role.createdAt).toLocaleDateString()}`}
                        </span>
                      </div>
                    </article>
                    )
                  })}
                </div>
              </div>
              )}

              {/* Capability chart — what the partner's scenarios actually
                  measure. Sits at the bottom because it's reflective, not
                  navigational. Bars are weighted by THIS partner's active
                  scenarios + applicants per role, so the picture reflects
                  their pipeline, not the global pool. */}
              {activeRoles.length > 0 && (() => {
                const tally: Record<string, number> = {}
                let total = 0
                for (const role of activeRoles) {
                  const subs = submissions.filter(s => s.scenarioCode === role.accessCode).length || 1
                  for (const skill of (role.skills || [])) {
                    tally[skill] = (tally[skill] || 0) + subs
                    total += subs
                  }
                }
                const roleWeights = total === 0 ? [] :
                  Object.entries(tally).map(([capability, w]) => ({ capability, weight: w / total }))
                return (
                  <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-2 pb-12">
                    <div className="editorial-mono mb-3" style={{ color: 'var(--lq-ink-3)' }}>
                      What your scenarios are measuring
                    </div>
                    <DashboardHero
                      onCapabilityClick={(key, name) => setSelectedCapability({ key, name })}
                      roleWeights={roleWeights}
                    />
                  </section>
                )
              })()}
            </div>
          )}

          {/* Anchor for "View standouts" action button */}
          <span id="standouts-anchor" aria-hidden />

          {/* Discovery tools removed from sidebar — its "Top by capability /
              industry" mechanism is now folded into the Standouts surface
              as a chip strip above the standouts grid. */}

          {/* Filter chip strip — sits above Standouts. Old Discovery tools
              filter mechanism, now inline + scoped to the Standouts page. */}
          {corporateNav === 'standouts' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-2">
              <div className="editorial-mono mb-3" style={{ color: 'var(--lq-ink-3)' }}>Narrow standouts by</div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Top-N chips — independent toggle, composes with capability */}
                {[10, 25, 50, 100].map((n) => {
                  const active = selectedTopN === n
                  return (
                    <button
                      key={`top-${n}`}
                      type="button"
                      onClick={() => setSelectedTopN(active ? null : n)}
                      className={`sd-chip ${active ? 'is-on' : ''}`}
                    >
                      Top {n}
                    </button>
                  )
                })}
                <span className="sd-sep" />
                {/* Capabilities dropdown — independent toggle, composes with Top-N */}
                <CapabilityDropdown
                  selected={selectedStandoutCap}
                  onSelect={setSelectedStandoutCap}
                />
                {(selectedTopN !== null || selectedStandoutCap) && (
                  <button
                    type="button"
                    onClick={() => { setSelectedTopN(null); setSelectedStandoutCap(null) }}
                    className="sd-clear"
                  >
                    Clear ×
                  </button>
                )}
              </div>
              <style>{`
                .sd-chip {
                  appearance: none;
                  background: #fff;
                  border: 1px solid var(--lq-line-2);
                  border-radius: 999px;
                  padding: 6px 14px;
                  font-family: var(--font-body);
                  font-size: 12px;
                  font-weight: 500;
                  color: var(--lq-ink-2);
                  cursor: pointer;
                  transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
                }
                .sd-chip:hover { border-color: var(--launch-navy); color: var(--lq-ink); }
                .sd-chip.is-on {
                  background: var(--launch-navy);
                  color: var(--lq-cream);
                  border-color: var(--launch-navy);
                  font-weight: 600;
                }
                .sd-sep {
                  width: 1px; height: 18px;
                  background: var(--lq-line);
                  margin: 0 6px;
                }
                .sd-clear {
                  appearance: none;
                  background: rgba(122, 14, 42, 0.08);
                  color: #7a0e2a;
                  border: 1px solid rgba(122, 14, 42, 0.20);
                  border-radius: 999px;
                  padding: 5px 12px;
                  font-family: var(--font-mono);
                  font-size: 10px;
                  letter-spacing: 0.14em;
                  text-transform: uppercase;
                  cursor: pointer;
                  font-weight: 700;
                  margin-left: 4px;
                }
                .sd-clear:hover { background: rgba(122, 14, 42, 0.14); }
              `}</style>
            </div>
          )}

          {/* Filter summary banner — reflects whichever of Top-N / Capability
              is active. Both can be set at once ("Top 10 by Problem Solving"). */}
          {(selectedTopN !== null || selectedStandoutCap) && corporateNav === 'standouts' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
              <div
                className="rounded-md px-4 py-3 mb-4 flex items-center justify-between flex-wrap gap-2"
                style={{
                  background: 'rgba(10, 42, 107, 0.06)',
                  border: '1px solid rgba(10, 42, 107, 0.18)',
                }}
              >
                <p className="text-sm" style={{ color: 'var(--lq-ink)' }}>
                  <span className="editorial-mono mr-2" style={{ color: 'var(--lq-ink-3)' }}>Showing</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15 }}>
                    {filteredStudents.length} candidates
                  </span>
                  <span className="ml-2" style={{ color: 'var(--lq-ink-2)' }}>
                    {selectedTopN !== null && selectedStandoutCap && ` — top ${selectedTopN} by ${selectedStandoutCap}`}
                    {selectedTopN !== null && !selectedStandoutCap && ` — top ${selectedTopN}`}
                    {selectedTopN === null && selectedStandoutCap && ` — ranked by ${selectedStandoutCap}`}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => { setSelectedTopN(null); setSelectedStandoutCap(null) }}
                  className="editorial-mono"
                  style={{ color: 'var(--launch-navy)' }}
                >
                  Clear ×
                </button>
              </div>
            </div>
          )}

          {/* Standouts — component owns its own header. */}
          {corporateNav === 'standouts' && (
            <LaunchStandouts
              students={filteredStudents}
              onSelectStudent={setSelectedStudentId}
            />
          )}

          {/* Anchor for "Build a scenario" action button */}
          <span id="scenario-builder-anchor" aria-hidden />

          {corporateNav === 'builder' && (<>

          {/* Scenario Builder v2 — simplified 3-step, light + teal */}
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 sm:pt-12 pb-2">
            <div className="flex items-start justify-between gap-6 flex-wrap mb-6">
              <div>
                <div className="editorial-mono mb-3" style={{ color: 'var(--lq-ink-3)' }}>Builder</div>
                <h1
                  className="mb-3"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 400,
                    fontSize: 'clamp(28px, 3.4vw, 40px)',
                    letterSpacing: '-0.022em',
                    lineHeight: 1.08,
                    color: 'var(--lq-ink)',
                  }}
                >
                  Build a scenario.
                </h1>
                <p className="max-w-[56ch] text-base" style={{ color: 'var(--lq-ink-2)', lineHeight: 1.55 }}>
                  Author a role-specific scenario with intake questions and
                  live decisions. Each question shows what it&rsquo;s testing
                  so you know exactly what you&rsquo;re measuring.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openBuilder()}
                className="corp-btn corp-btn-primary"
                style={{ flexShrink: 0 }}
              >
                + New scenario
              </button>
            </div>
            {/* Workspace hint card — clear next step when nothing exists */}
            {activeRoles.length === 0 && createdChallenges.length === 0 && (
              <div className="corp-card p-6">
                <div className="editorial-mono mb-2" style={{ color: 'var(--lq-ink-3)' }}>3-step flow</div>
                <ol className="space-y-2 text-sm" style={{ color: 'var(--lq-ink-2)', lineHeight: 1.6 }}>
                  <li><span style={{ color: 'var(--launch-navy)', fontWeight: 600 }}>1.</span> Setup — name the role, set the register (early or advanced career), how many questions.</li>
                  <li><span style={{ color: 'var(--launch-navy)', fontWeight: 600 }}>2.</span> Author — describe the role, pick capabilities to test. AI drafts the questions; you edit, pin, regenerate.</li>
                  <li><span style={{ color: 'var(--launch-navy)', fontWeight: 600 }}>3.</span> Ship — review the access code, copy the link, send to candidates.</li>
                </ol>
              </div>
            )}
          </div>
          <ScenarioBuilderV2
            externalOpen={showBuilderV2}
            onClose={() => {
              // Just close the modal. Leave the partner on the Builder
              // landing page (intro + "+ New scenario" button) so they can
              // re-open without a round-trip through the sidebar. If they
              // shipped a scenario, onRoleCreated has already routed to
              // Active scenarios first — this branch is the bail-out path.
              setShowBuilderV2(false)
            }}
            creatorType="corporate"
            onRoleCreated={(roleData) => {
              // Newest scenario first so the partner sees their fresh work
              // at the top of Active Scenarios (above the seeded ones).
              setActiveRoles([roleData, ...activeRoles])
              addCustomScenarioStub({
                id: roleData.id,
                code: roleData.accessCode,
                title: roleData.name,
                skills: roleData.skills,
                questionsCount: roleData.questionsCount,
                creatorType: roleData.creatorType,
                variant: roleData.variant,
                createdAt: new Date(roleData.createdAt).toISOString(),
                genericQuestions: roleData.genericQuestions,
              })
              // Flag the new role for the highlight strip; also pre-route to
              // Scenarios so the moment the partner closes the builder modal
              // they land on their work — not back on an empty Builder shell.
              setJustCreatedRoleId(roleData.id)
              setCorporateNav('roles')
            }}
          />
          </>)}

          {/* Submissions sidebar removed — overlapped with the role-detail
              filter pipeline. Cross-scenario "what's new" still lives on
              the Overview's Recent submissions panel. */}

          {/* Capability chart removed from sidebar — now mounts at the top
              of Active roles so it serves as the overview of what's being
              measured before the role cards. */}

          {/* Created Challenges */}
          {corporateNav === 'builder' && createdChallenges.length > 0 && (
            <div className="border-t border-[var(--lq-line)]">
              <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
                <div className="flex items-baseline justify-between mb-6">
                <h2 className="editorial-display-sm" style={{ fontSize: 'clamp(22px, 2.6vw, 32px)' }}>
                  Active challenges
                </h2>
                <span className="editorial-mono">{createdChallenges.length} running</span>
              </div>
              <div className="space-y-4">
                {createdChallenges.map((challenge, idx) => (
                  <article key={idx} className="editorial-card p-6 transition-colors hover:border-[var(--launch-navy)]">
                    <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
                      <div>
                        <div className="editorial-mono mb-2">Challenge</div>
                        <h3
                          className="text-2xl"
                          style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.015em' }}
                        >
                          {challenge.title}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: 'var(--lq-ink-2)' }}>
                          {challenge.applicantList}
                        </p>
                      </div>
                      <span className="editorial-chip editorial-chip-lime">
                        {challenge.applicantCount} applicants
                      </span>
                    </div>
                    <p className="text-sm mb-5 max-w-[68ch]" style={{ color: 'var(--lq-ink-2)' }}>
                      {challenge.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-3 pt-4 border-t border-[var(--lq-line)]">
                      {[
                        ['Industry', challenge.industry],
                        ['Difficulty', challenge.difficulty],
                        ['Time', `${challenge.timeLimit} min`],
                        ['Questions', challenge.questionCount],
                        ['Access code', challenge.accessCode],
                      ].map(([label, value]) => (
                        <div key={label as string}>
                          <div className="editorial-mono">{label as string}</div>
                          <div
                            className="text-base mt-1"
                            style={{
                              fontFamily: label === 'Access code' ? 'var(--font-mono)' : 'var(--font-display)',
                              fontWeight: label === 'Access code' ? 600 : 500,
                              color: label === 'Access code' ? 'var(--launch-navy)' : 'var(--lq-ink)',
                              letterSpacing: label === 'Access code' ? '0.05em' : '-0.01em',
                            }}
                          >
                            {value as React.ReactNode}
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
              </div>
            </div>
          )}
            </div>{/* /corp-work */}
          </div>{/* /corp-body */}

          {/* Delete-scenario confirm modal — mounts only when a row's kebab
              triggers it. The destructive button is the *secondary* one so
              the partner has to read before they click. */}
          {roleToDelete && (
            <DeleteScenarioModal
              roleName={roleToDelete.name}
              onCancel={() => setRoleToDelete(null)}
              onConfirm={handleConfirmDeleteRole}
            />
          )}
        </div>
      </main>
    )
  }

  // Landing page view — single editorial scroll. Three direct doors:
  //   Scenario        → student/candidate play flow
  //   Partner access  → corporate dashboard (no real auth in this front-end build)
  //   Educator access → teacher dashboard stub
  const enterScenario = () => {
    setStudentName('Student')
    setIsStudentLoggedIn(true)
    setAppMode('play')
  }
  const enterPartner = () => {
    setIsPartnerLoggedIn(true)
    setAppMode('corporate')
  }
  const enterEducator = () => setAppMode('teacher')

  return (
    <main className="min-h-screen bg-background">
      <HeroSection
        onScenarioClick={enterScenario}
        onPartnerClick={enterPartner}
        onEducatorClick={enterEducator}
      />
      <ResultsSection />
      <CapabilitiesSection />
      <CTASection
        onPrimaryClick={enterScenario}
        onPartnerClick={enterPartner}
        onEducatorClick={enterEducator}
      />
    </main>
  )
}

/* ──────────────────────────────────────────────────────────────────
   RoleActionsMenu — kebab menu that hangs off each Active Scenario card.
   Two actions:
     · Close / Reopen  (toggles the scenario's accept-new-candidates state)
     · Delete          (opens the confirm modal; never deletes inline)

   The trigger uses stopPropagation on every interaction so clicking the menu
   doesn't also navigate the partner into the role's detail view (the parent
   card has its own onClick).
   ─────────────────────────────────────────────────────────────────── */
function RoleActionsMenu({
  role,
  isClosed,
  onToggleStatus,
  onRequestDelete,
}: {
  role: { id: string; name: string }
  isClosed: boolean
  onToggleStatus: (next: 'open' | 'closed') => void
  onRequestDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div
      ref={wrapRef}
      className="ram-root"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="ram-trigger"
        aria-label={`Manage ${role.name}`}
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="ram-menu" role="menu">
          <button
            type="button"
            className="ram-item"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
              onToggleStatus(isClosed ? 'open' : 'closed')
            }}
          >
            {isClosed
              ? <><Unlock className="w-4 h-4" /> Reopen scenario</>
              : <><Lock className="w-4 h-4" /> Close scenario</>}
          </button>
          <div className="ram-sep" />
          <button
            type="button"
            className="ram-item ram-item-danger"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onRequestDelete() }}
          >
            <Trash2 className="w-4 h-4" /> Delete scenario
          </button>
        </div>
      )}
      <style>{`
        .ram-root { position: relative; }
        .ram-trigger {
          appearance: none;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--lq-ink-3);
          cursor: pointer;
          transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
        }
        .ram-trigger:hover {
          background: rgba(10, 42, 107, 0.06);
          color: var(--launch-navy);
          border-color: var(--lq-line);
        }
        .ram-menu {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          width: 200px;
          background: #fff;
          border: 1px solid var(--lq-line);
          border-radius: 12px;
          padding: 6px;
          box-shadow: 0 18px 36px -16px rgba(10, 42, 107, 0.24);
          z-index: 30;
        }
        .ram-item {
          appearance: none;
          background: transparent;
          border: none;
          width: 100%;
          padding: 8px 10px;
          display: flex;
          align-items: center;
          gap: 9px;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--lq-ink);
          text-align: left;
          border-radius: 6px;
        }
        .ram-item:hover { background: rgba(10, 42, 107, 0.05); }
        .ram-item-danger { color: #7a0e2a; }
        .ram-item-danger:hover { background: rgba(122, 14, 42, 0.06); }
        .ram-sep { height: 1px; background: var(--lq-line); margin: 4px 6px; }
      `}</style>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────
   DeleteScenarioModal — confirm gate for the destructive delete action.
   Layered as a backdrop + card so the partner can never delete on a misclick.
   ─────────────────────────────────────────────────────────────────── */
function DeleteScenarioModal({
  roleName,
  onCancel,
  onConfirm,
}: {
  roleName: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="dsm-root" role="dialog" aria-modal="true" aria-labelledby="dsm-title">
      <div className="dsm-backdrop" onClick={onCancel} />
      <div className="dsm-card">
        <div className="dsm-head">
          <div>
            <div className="dsm-eyebrow">Delete scenario</div>
            <h2 id="dsm-title" className="dsm-title">Permanently delete <em>{roleName}</em>?</h2>
          </div>
          <button type="button" onClick={onCancel} className="dsm-close" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="dsm-body">
          <p>
            This removes the scenario and its access code. Candidates who already
            submitted will stay visible — their data lives independently.
          </p>
          <p style={{ color: 'var(--lq-ink-3)', marginTop: 8 }}>
            If you only want to stop new candidates, <strong>close</strong> it
            instead. Closing is reversible; deleting is not.
          </p>
        </div>
        <div className="dsm-foot">
          <button type="button" onClick={onCancel} className="corp-btn corp-btn-ghost">Cancel</button>
          <button type="button" onClick={onConfirm} className="dsm-confirm">
            <Trash2 className="w-4 h-4" /> Delete scenario
          </button>
        </div>
        <style>{`
          .dsm-root {
            position: fixed; inset: 0; z-index: 100;
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
          }
          .dsm-backdrop {
            position: absolute; inset: 0;
            background: rgba(10, 42, 107, 0.42);
            backdrop-filter: blur(4px);
          }
          .dsm-card {
            position: relative; background: #fff; border-radius: 18px;
            width: 100%; max-width: 460px;
            box-shadow: 0 24px 60px -18px rgba(10, 42, 107, 0.32);
          }
          .dsm-head {
            padding: 22px 26px 16px;
            display: flex; justify-content: space-between; align-items: flex-start;
            gap: 14px;
            border-bottom: 1px solid var(--lq-line);
          }
          .dsm-eyebrow {
            font-family: var(--font-mono); font-size: 10px;
            letter-spacing: 0.18em; text-transform: uppercase;
            color: #7a0e2a; font-weight: 700; margin-bottom: 4px;
          }
          .dsm-title {
            margin: 0; font-family: var(--font-display); font-weight: 500;
            font-size: 20px; letter-spacing: -0.018em; color: var(--lq-ink);
          }
          .dsm-title em { font-style: italic; color: var(--launch-navy); }
          .dsm-close {
            appearance: none; background: transparent;
            border: 1px solid var(--lq-line-2); border-radius: 999px;
            width: 30px; height: 30px;
            display: inline-flex; align-items: center; justify-content: center;
            color: var(--lq-ink-2); cursor: pointer;
            transition: color 140ms ease, border-color 140ms ease;
          }
          .dsm-close:hover { color: var(--lq-ink); border-color: var(--launch-navy); }
          .dsm-body {
            padding: 20px 26px;
            font-size: 14px; line-height: 1.55; color: var(--lq-ink-2);
          }
          .dsm-foot {
            padding: 14px 26px 22px;
            display: flex; gap: 10px; justify-content: flex-end;
            border-top: 1px solid var(--lq-line);
          }
          .dsm-confirm {
            appearance: none; cursor: pointer;
            display: inline-flex; align-items: center; gap: 8px;
            padding: 8px 16px; border-radius: 999px;
            background: #7a0e2a; color: var(--lq-cream);
            border: 1px solid #7a0e2a;
            font-family: var(--font-body); font-weight: 600; font-size: 13px;
            transition: background 140ms ease, border-color 140ms ease;
          }
          .dsm-confirm:hover { background: #5d0a20; border-color: #5d0a20; }
        `}</style>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────
   CapabilityDropdown — pill button + popover menu of the 10 Launch
   capabilities. Lives on the Standouts chip strip in place of the
   inline capability chips. One selection at a time; clicking the
   active row again clears it. The selection is owned by the parent
   (selectedTool state), so this component is purely presentational.
   ─────────────────────────────────────────────────────────────────── */
const LAUNCH_CAPABILITIES_10 = [
  'Judgement & Decision-Making',
  'Reasoning & Critical Thinking',
  'Problem Solving',
  'Leadership & Influence',
  'Adaptability & Cognitive Flexibility',
  'Emotional Intelligence',
  'Execution & Ownership',
  'Integrity & Ethics',
  'Collaboration',
  'Situational Awareness & Systems Thinking',
]

function CapabilityDropdown({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (cap: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [open])

  const label = selected ? `Capability · ${shortenCap(selected)}` : 'Capabilities'
  const active = !!selected

  return (
    <div ref={ref} className="cap-dd">
      <button
        type="button"
        className={`sd-chip ${active ? 'is-on' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {label} <span className="cap-dd-caret">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="cap-dd-menu" role="listbox">
          {LAUNCH_CAPABILITIES_10.map((cap) => {
            const isSelected = cap === selected
            return (
              <button
                key={cap}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`cap-dd-item ${isSelected ? 'is-selected' : ''}`}
                onClick={() => {
                  // Picking the current row clears it; otherwise replace.
                  onSelect(isSelected ? null : cap)
                  setOpen(false)
                }}
              >
                <span className="cap-dd-item-dot" aria-hidden />
                <span>{cap}</span>
              </button>
            )
          })}
        </div>
      )}
      <style>{`
        .cap-dd { position: relative; display: inline-block; }
        .cap-dd-caret {
          font-family: var(--font-mono);
          font-size: 10px;
          margin-left: 4px;
          opacity: 0.6;
        }
        .cap-dd-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          z-index: 30;
          min-width: 280px;
          background: #fff;
          border: 1px solid var(--lq-line);
          border-radius: 12px;
          box-shadow: 0 18px 36px -16px rgba(10, 42, 107, 0.24);
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .cap-dd-item {
          appearance: none;
          background: transparent;
          border: none;
          text-align: left;
          padding: 9px 12px;
          border-radius: 8px;
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--lq-ink);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background 120ms ease;
        }
        .cap-dd-item:hover { background: rgba(10, 42, 107, 0.05); }
        .cap-dd-item.is-selected {
          background: rgba(10, 42, 107, 0.10);
          color: var(--launch-navy);
          font-weight: 600;
        }
        .cap-dd-item-dot {
          width: 6px; height: 6px;
          border-radius: 999px;
          background: var(--lq-line-2);
          flex-shrink: 0;
        }
        .cap-dd-item.is-selected .cap-dd-item-dot { background: var(--launch-navy); }
      `}</style>
    </div>
  )
}

/** Shorten a capability label for the button face — drops the
 *  ampersand-suffix so it fits on a single line. */
function shortenCap(name: string): string {
  const cut = name.indexOf(' & ')
  return cut > 0 ? name.slice(0, cut) : name
}
