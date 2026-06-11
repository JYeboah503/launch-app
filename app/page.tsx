'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { HeroSection } from '@/components/hero-section'
import { StudentAuthView } from '@/components/student-auth-view'
import { StudentDashboard } from '@/components/student-dashboard'
import { PartnerAuthView } from '@/components/partner-auth-view'
import { TeacherDashboard } from '@/components/teacher-dashboard'
import { LaunchLogo } from '@/components/launch-logo'
import type { AppMode } from '@/lib/roles'
import { addCustomScenarioStub } from '@/lib/scenarioStore'
import { Header } from '@/components/header'
import { CapabilitiesSection } from '@/components/capabilities-section'
import { ResultsSection } from '@/components/results-section'
import { CTASection } from '@/components/cta-section'
import { DashboardHero } from '@/components/dashboard-hero'
import { DashboardFilter } from '@/components/dashboard-filter'
import { LaunchStandouts } from '@/components/launch-standouts'
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
import { Plus } from 'lucide-react'
import type { Student } from '@/components/student-list'
import { AnimatedCounter, Sparkline } from '@/components/motion'

export default function Page() {
  const router = useRouter()
  // Two-door entry: 'landing' shows Play/Manage; 'manage-select' splits
  // Teacher vs Corporate. The legacy isStudent/isPartner flags still gate the
  // existing dashboards — appMode is a thin layer on top (see plan Section A).
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
  const [corporateNav, setCorporateNav] = useState<'overview' | 'chart' | 'roles' | 'standouts' | 'tools' | 'builder' | 'submissions'>('overview')
  const [showBuilderV2, setShowBuilderV2] = useState(false)
  const [curatedList, setCuratedList] = useState<{ students: Student[], name: string } | null>(null)
  const [createdChallenges, setCreatedChallenges] = useState<any[]>([])
  const [selectedTool, setSelectedTool] = useState<{ tool: string; option: string } | null>(null)
  const [activeRoles, setActiveRoles] = useState<any[]>([])
  const [selectedRoleView, setSelectedRoleView] = useState<string | null>(null)
  const [roleSkillFilters, setRoleSkillFilters] = useState<Record<string, boolean>>({})
  const [selectedRoleSkill, setSelectedRoleSkill] = useState<string | null>(null)
  const [selectedRoleSkillTop, setSelectedRoleSkillTop] = useState<number>(10)

  // Filter students based on selections
  const filteredStudents: Student[] = useMemo(() => {
    let students = [...MOCK_STUDENTS]

    // Apply tool-based filtering
    if (selectedTool) {
      const { tool, option } = selectedTool
      
      if (tool === 'topCandidates') {
        // Extract number from option like "Top 10" -> 10
        const count = parseInt(option.match(/\d+/)?.[0] || '10')
        students = students.slice(0, count)
      } else if (tool === 'topByCapability') {
        // Filter by capability
        students = students.filter((student) =>
          student.topCapabilities.some((cap) => cap.name === option)
        ).sort((a, b) => {
          const capA = a.topCapabilities.find((c) => c.name === option)?.score || 0
          const capB = b.topCapabilities.find((c) => c.name === option)?.score || 0
          return capB - capA
        })
      } else if (tool === 'topByIndustry') {
        // Filter by industry (would need to check mock data for industry field)
        students = students.filter((student) =>
          student.interests?.includes(option) || student.industry === option
        )
      }
    }

    return students
  }, [selectedTool])

  // Get selected student profile
  const selectedStudent = selectedStudentId
    ? STUDENT_PROFILES[selectedStudentId]
    : null

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

  // Manage door — pick Teacher vs Corporate (no real auth)
  if (appMode === 'manage-select') {
    return (
      <ManageSelect
        onTeacher={() => setAppMode('teacher')}
        onCorporate={() => {
          setIsPartnerLoggedIn(true)
          setAppMode('corporate')
        }}
        onBack={() => setAppMode('landing')}
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
      <main className="min-h-screen bg-background">
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-8">
          <button
            onClick={() => setSelectedCapability(null)}
            className="editorial-mono inline-flex items-center gap-2 mb-8 transition-colors hover:text-[var(--lq-ink)]" style={{ color: "var(--lq-ink-2)" }}
          >
            ← Back to dashboard
          </button>

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
      <main className="min-h-screen bg-background">
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-8">
          <button
            onClick={() => setShowChallenges(false)}
            className="editorial-mono inline-flex items-center gap-2 mb-8 transition-colors hover:text-[var(--lq-ink)]" style={{ color: "var(--lq-ink-2)" }}
          >
            ← Back to profile
          </button>
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
      <main className="min-h-screen bg-background">
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-8">
          <button
            onClick={() => setSelectedStudentId(null)}
            className="editorial-mono inline-flex items-center gap-2 mb-8 transition-colors hover:text-[var(--lq-ink)]" style={{ color: "var(--lq-ink-2)" }}
          >
            ← Back to dashboard
          </button>

          <StudentProfileView
            student={selectedStudent}
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
    // Show role candidates view
    if (selectedRoleView) {
      const selectedRole = activeRoles.find(r => r.id === selectedRoleView)
      // Filter students who would match this role (for demo, showing all students)
      const roleApplicants = MOCK_STUDENTS
      
      // Initialize role skill filters on first load
      if (selectedRole?.skills && Object.keys(roleSkillFilters).length === 0) {
        setRoleSkillFilters(selectedRole.skills.reduce((acc: Record<string, boolean>, skill: string) => ({
          ...acc,
          [skill]: true
        }), {}))
      }
      
      return (
        <main className="min-h-screen" style={{ background: 'var(--corp-canvas)' }}>
          <div className="w-full max-w-6xl mx-auto">
            {/* Back button */}
            <div className="px-3 sm:px-4 pt-6 pb-2">
              <button
                onClick={() => {
                  setSelectedRoleView(null)
                  setRoleSkillFilters({})
                }}
                className="editorial-mono inline-flex items-center gap-2 transition-colors hover:text-[var(--lq-ink)]" style={{ color: "var(--lq-ink-2)" }}
              >
                ← Back to roles
              </button>
            </div>

            {/* Role Info Header */}
            <div className="px-3 sm:px-4 py-8 border-b border-[var(--lq-line)]">
              <h1 className="text-4xl mb-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--lq-ink)' }}>{selectedRole?.name}</h1>
              <p style={{ color: 'var(--lq-ink-2)' }}>
                {selectedRole?.questionsCount} questions × 3 levels | {selectedRole?.skills?.length} skills assessed
              </p>
              <p className="text-xs font-mono mt-2" style={{ color: 'var(--launch-navy)' }}>Access Code: {selectedRole?.accessCode}</p>
            </div>

            {/* Role Standouts Section with Skill Filters */}
            <section className="py-12 px-4">
              <div className="w-full max-w-6xl mx-auto">
                {/* Skill Filters with Top N Dropdowns */}
                {selectedRole?.skills && selectedRole.skills.length > 0 && (
                  <div className="corp-card mb-8 p-6">
                    <p className="editorial-mono mb-4" style={{ color: 'var(--lq-ink-3)' }}>Assess skill</p>
                    <div className="space-y-3">
                      {selectedRole.skills.map((skill: string) => (
                        <div key={skill} className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              setSelectedRoleSkill(selectedRoleSkill === skill ? null : skill)
                              setSelectedRoleSkillTop(10)
                            }}
                            className="px-4 py-2 rounded-lg font-medium transition-all text-sm flex-1 text-left"
                            style={
                              selectedRoleSkill === skill
                                ? { background: 'var(--launch-navy)', color: 'var(--lq-cream)', border: '1px solid var(--launch-navy)' }
                                : { background: '#fff', color: 'var(--lq-ink-2)', border: '1px solid var(--lq-line-2)' }
                            }
                          >
                            {skill}
                          </button>
                          {selectedRoleSkill === skill && (
                            <select
                              value={selectedRoleSkillTop}
                              onChange={(e) => setSelectedRoleSkillTop(parseInt(e.target.value))}
                              className="px-3 py-2 rounded-lg text-sm font-medium"
                              style={{ border: '1px solid var(--lq-line-2)', background: '#fff', color: 'var(--lq-ink)' }}
                            >
                              <option value={10}>Top 10</option>
                              <option value={20}>Top 20</option>
                              <option value={30}>Top 30</option>
                              <option value={50}>Top 50</option>
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Role Standouts Grid - filtered by skill and top N */}
                {selectedRoleSkill && selectedRole?.skills ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--lq-ink)' }}>Top Performers</h3>
                      <button
                        onClick={() => router.push(`/role-applicants/${selectedRoleView}`)}
                        className="corp-btn corp-btn-ghost"
                      >
                        View All →
                      </button>
                    </div>
                    <LaunchStandouts
                      students={MOCK_STUDENTS.slice(0, selectedRoleSkillTop)}
                      onSelectStudent={setSelectedStudentId}
                    />
                  </div>
                ) : (
                  <div className="corp-card p-12 text-center">
                    <p style={{ color: 'var(--lq-ink-3)' }}>Select a skill to view top performers for this role.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      )
    }

    // Show applicant performance view
    if (partnerView === 'performance') {
      return (
        <ApplicantPerformance
          students={MOCK_STUDENTS}
          onBack={() => setPartnerView('dashboard')}
        />
      )
    }

    // Show applicant curator
    if (partnerView === 'curator') {
      return (
        <ApplicantCurator
          students={MOCK_STUDENTS}
          onBack={() => setPartnerView('dashboard')}
          onCuratedListCreated={(students, name) => {
            setCuratedList({ students, name })
            setPartnerView('createChallenge')
          }}
        />
      )
    }

    // Show create challenge wizard
    if (partnerView === 'createChallenge' && curatedList) {
      return (
        <CreateChallenge
          curatedList={curatedList}
          onBack={() => {
            setPartnerView('dashboard')
            setCuratedList(null)
          }}
          onChallengeCreated={(challenge) => {
            setCreatedChallenges([...createdChallenges, challenge])
            setPartnerView('dashboard')
            setCuratedList(null)
          }}
        />
      )
    }

    // Show partner dashboard
    return (
      <main className="min-h-screen" style={{ background: 'var(--corp-canvas)' }}>
        <div className="w-full">
          {/* Corporate top bar — light, hairline border, navy brand */}
          <header
            className="sticky top-0 z-40"
            style={{
              background: 'rgba(255,255,255,0.82)',
              borderBottom: '1px solid var(--lq-line)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LaunchLogo height={22} color="var(--launch-navy)" ariaLabel="LAUNCH" />
                <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
                  · corporate
                </span>
              </div>
              <div className="flex items-center gap-2">
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
              </div>
            </div>
          </header>

          {/* Sidebar shell — left rail + centre work area */}
          <div className="corp-body">
            <aside className="corp-rail">
              <nav className="corp-rail-nav" aria-label="Corporate sections">
                {([
                  { key: 'overview',    label: 'Overview' },
                  { key: 'chart',       label: 'Capability chart' },
                  { key: 'roles',       label: 'Active roles' },
                  { key: 'standouts',   label: 'Standouts' },
                  { key: 'tools',       label: 'Discovery tools' },
                  { key: 'builder',     label: 'Scenario builder' },
                  { key: 'submissions', label: 'Submissions' },
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
                <div className="corp-rail-sep" />
                <button
                  type="button"
                  onClick={() => setPartnerView('curator')}
                  className="corp-rail-item corp-rail-item-jump"
                >
                  Curate applicants <span aria-hidden>→</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPartnerView('performance')}
                  className="corp-rail-item corp-rail-item-jump"
                >
                  Performance <span aria-hidden>→</span>
                </button>
              </nav>
            </aside>
            <div className="corp-work">

          {/* Overview — clean light header */}
          {corporateNav === 'overview' && (<>
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 sm:pt-16 pb-2">
            <div className="editorial-mono mb-3" style={{ color: 'var(--lq-ink-3)' }}>
              Overview
            </div>
            <h1
              className="mb-4 max-w-[18ch]"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: 'clamp(32px, 4.6vw, 56px)',
                letterSpacing: '-0.026em',
                lineHeight: 1.04,
                color: 'var(--lq-ink)',
              }}
            >
              The shape of how people <em style={{ fontStyle: 'italic', color: 'var(--launch-navy)' }}>actually</em> decide.
            </h1>
            <p
              className="max-w-[60ch] text-base sm:text-lg mb-8"
              style={{ color: 'var(--lq-ink-2)', lineHeight: 1.55 }}
            >
              Build scenarios, measure capability under pressure, and surface the
              candidates whose decision-making fits your team.
            </p>

            {/* Secondary actions — quiet, navy/neutral */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {[
                { label: 'Curate applicants', onClick: () => setPartnerView('curator') },
                { label: 'Performance', onClick: () => setPartnerView('performance') },
                { label: 'View standouts', onClick: () => { document.getElementById('standouts-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) } },
              ].map((a) => (
                <button key={a.label} onClick={a.onClick} className="corp-btn corp-btn-ghost">
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* KPI overview — light cards, navy numbers, neutral deltas */}
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Capability score', value: 74, suffix: '', delta: '+10', spark: [62, 64, 66, 68, 71, 73, 74] },
                { label: 'Decision quality lift', value: 1.0, decimals: 1, suffix: 'σ', delta: '+0.2', spark: [0.4, 0.55, 0.6, 0.72, 0.84, 0.92, 1.0] },
                { label: 'Top capability · trending', value: 92, suffix: '', delta: 'Empathy', spark: [70, 74, 76, 80, 85, 89, 92], stringDelta: true },
                { label: 'Active roles', value: activeRoles.length || 0, suffix: '', delta: 'today', spark: [1, 2, 2, 3, 3, 4, activeRoles.length || 0], stringDelta: true },
              ].map((s) => (
                <div key={s.label} className="corp-card p-5">
                  <div className="editorial-mono mb-3" style={{ color: 'var(--lq-ink-3)' }}>{s.label}</div>
                  <div className="flex items-end justify-between">
                    <div
                      className="editorial-stat"
                      style={{ fontSize: 'clamp(28px, 3vw, 44px)', color: 'var(--launch-navy)', lineHeight: 1 }}
                    >
                      <AnimatedCounter value={s.value} decimals={s.decimals || 0} suffix={s.suffix} duration={1400} />
                    </div>
                    <Sparkline data={s.spark} width={86} height={28} stroke="var(--launch-navy)" fill="rgba(10, 42, 107, 0.10)" />
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--lq-line)]">
                    <span
                      className="editorial-mono px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(10, 42, 107, 0.06)', color: 'var(--launch-navy)' }}
                    >
                      {s.delta}
                    </span>
                    <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>7d</span>
                  </div>
                </div>
              ))}
          </div>
          </>)}

          {/* Active Roles */}
          {corporateNav === 'roles' && activeRoles.length > 0 && (
            <div className="border-b border-[var(--lq-line)]">
              <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
                <div className="flex items-baseline justify-between mb-6">
                  <h2 className="editorial-display-sm" style={{ fontSize: 'clamp(22px, 2.6vw, 32px)', color: 'var(--lq-ink)' }}>
                    Active roles
                  </h2>
                  <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>{activeRoles.length} live</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeRoles.map((role) => (
                    <article
                      key={role.id}
                      onClick={() => setSelectedRoleView(role.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') setSelectedRoleView(role.id) }}
                      className="corp-card p-6 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>Role</span>
                        <span aria-hidden className="inline-block rounded-full opacity-40 group-hover:opacity-100 transition-opacity" style={{ width: 8, height: 8, background: 'var(--launch-navy)' }} />
                      </div>
                      <h3
                        className="text-xl mb-3"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.015em' }}
                      >
                        {role.name}
                      </h3>
                      <div className="space-y-1 text-sm" style={{ color: 'var(--lq-ink-2)' }}>
                        <p>{role.questionsCount} questions × 3 levels</p>
                        <p>{role.skills?.length || (role as any).skillsCount} skills assessed</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[var(--lq-line)] flex items-center justify-between">
                        <span className="editorial-mono">{role.accessCode}</span>
                        <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
                          {new Date(role.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Anchor for "View standouts" action button */}
          <span id="standouts-anchor" aria-hidden />

          {/* Partner Tools Section - Top Candidates Discovery */}
          {corporateNav === 'tools' && (
          <PartnerTools
            selectedTool={selectedTool}
            students={filteredStudents}
            onSelectStudent={setSelectedStudentId}
            onToolSelect={(tool, option) => {
              setSelectedTool({ tool, option })
              console.log(`[v0] Filtering by ${tool}: ${option}`)
            }}
          />
          )}

          {/* Filter Summary */}
          {selectedTool && (
            <div className="px-3 sm:px-6 py-4 bg-[var(--launch-lime-soft)] border-b border-[var(--launch-lime-2)]">
              <p className="text-sm" style={{ color: 'var(--lq-ink)' }}>
                <span className="editorial-mono mr-3">Showing</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16 }}>
                  {filteredStudents.length} candidates
                </span>
                <span className="ml-2" style={{ color: 'var(--lq-ink-2)' }}>
                  {selectedTool.tool === 'topCandidates' && ` matching top ${selectedTool.option.match(/\d+/)?.[0]}`}
                  {selectedTool.tool === 'topByCapability' && ` with ${selectedTool.option}`}
                  {selectedTool.tool === 'topByIndustry' && ` in ${selectedTool.option}`}
                </span>
              </p>
            </div>
          )}

          {/* Standouts Section */}
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
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
            <h2 className="editorial-display-sm mb-3" style={{ fontSize: 'clamp(22px, 2.6vw, 32px)', color: 'var(--lq-ink)' }}>
              Build a scenario.
            </h2>
            <p style={{ color: 'var(--lq-ink-2)', maxWidth: '60ch', lineHeight: 1.55, marginBottom: 18 }}>
              Author a role-specific scenario with generic intake questions and
              live decisions. Each question shows what it&rsquo;s testing so you
              know exactly what you&rsquo;re measuring.
            </p>
            <button
              type="button"
              onClick={() => setShowBuilderV2(true)}
              className="corp-btn corp-btn-primary"
            >
              Open builder
            </button>
          </div>
          <ScenarioBuilderV2
            externalOpen={showBuilderV2}
            onClose={() => setShowBuilderV2(false)}
            creatorType="corporate"
            showGenericQuestions={false}
            onRoleCreated={(roleData) => {
              setActiveRoles([...activeRoles, roleData])
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
            }}
          />
          </>)}

          {corporateNav === 'submissions' && <SubmissionsView />}

          {/* Hero Section - Human Capability Measurement */}
          {corporateNav === 'chart' && (
          <DashboardHero
            onCapabilityClick={(key, name) => setSelectedCapability({ key, name })}
          />
          )}

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
        </div>
      </main>
    )
  }

  // Landing page view — single editorial scroll. Two doors:
  //   Play  → student/candidate flow
  //   Manage → Teacher vs Corporate selector
  const enterPlay = () => {
    setStudentName('Student')
    setIsStudentLoggedIn(true)
    setAppMode('play')
  }
  const enterManage = () => setAppMode('manage-select')

  return (
    <main className="min-h-screen bg-background">
      <HeroSection
        onStudentClick={enterPlay}
        onPartnerClick={enterManage}
      />
      <ResultsSection />
      <CapabilitiesSection />
      <CTASection
        onPrimaryClick={enterPlay}
        onPartnerClick={enterManage}
      />
    </main>
  )
}

/**
 * Manage door — lightweight Teacher vs Corporate selector. No real auth;
 * this just routes to the right management surface. (Section A foundation.)
 */
function ManageSelect({
  onTeacher,
  onCorporate,
  onBack,
}: {
  onTeacher: () => void
  onCorporate: () => void
  onBack: () => void
}) {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        background: 'linear-gradient(180deg, #07091c 0%, #0e1737 50%, #182046 100%)',
        color: 'var(--lq-cream)',
      }}
    >
      <div className="w-full max-w-3xl text-center">
        <div className="editorial-mono mb-4" style={{ color: 'rgba(146, 184, 255, 0.7)' }}>
          Manage
        </div>
        <h1
          className="mb-3"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 300,
            fontSize: 'clamp(32px, 5vw, 56px)',
            letterSpacing: '-0.028em',
            lineHeight: 1.05,
            color: 'var(--lq-cream)',
          }}
        >
          How will you be using Launch?
        </h1>
        <p
          className="mb-12 mx-auto"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(16px, 1.6vw, 20px)',
            color: 'rgba(246, 242, 234, 0.7)',
            maxWidth: '46ch',
          }}
        >
          Pick the space that fits — we&rsquo;ll tailor the dashboard and the
          experience your people see.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <button type="button" onClick={onTeacher} className="manage-card group">
            <div className="manage-card-kicker">For schools</div>
            <div className="manage-card-title">Teacher</div>
            <div className="manage-card-body">
              Create a classroom, set scenarios, and follow only your
              students&rsquo; progress.
            </div>
            <span className="manage-card-arrow" aria-hidden>→</span>
          </button>

          <button type="button" onClick={onCorporate} className="manage-card group">
            <div className="manage-card-kicker">For companies</div>
            <div className="manage-card-title">Corporate</div>
            <div className="manage-card-body">
              Build role scenarios, surface real capability, and shortlist
              candidates faster.
            </div>
            <span className="manage-card-arrow" aria-hidden>→</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="editorial-mono mt-10 inline-flex items-center gap-2 transition-colors"
          style={{ color: 'rgba(246, 242, 234, 0.55)' }}
        >
          ← Back to home
        </button>
      </div>

      <style>{`
        .manage-card {
          position: relative;
          text-align: left;
          padding: 28px 28px 30px;
          border-radius: 20px;
          background: rgba(246, 242, 234, 0.05);
          border: 1px solid rgba(146, 184, 255, 0.18);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          cursor: pointer;
          transition: transform 220ms cubic-bezier(0.2,0.7,0.2,1), background 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
        }
        .manage-card:hover {
          transform: translateY(-2px);
          background: rgba(246, 242, 234, 0.09);
          border-color: rgba(146, 184, 255, 0.5);
          box-shadow: 0 16px 40px rgba(10, 42, 107, 0.35);
        }
        .manage-card-kicker {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(146, 184, 255, 0.7);
          margin-bottom: 10px;
        }
        .manage-card-title {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: clamp(26px, 3vw, 34px);
          letter-spacing: -0.02em;
          color: var(--lq-cream);
          margin-bottom: 10px;
        }
        .manage-card-body {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 15px;
          line-height: 1.5;
          color: rgba(246, 242, 234, 0.66);
          max-width: 32ch;
        }
        .manage-card-arrow {
          position: absolute;
          top: 26px;
          right: 26px;
          font-size: 20px;
          color: rgba(146, 184, 255, 0.7);
          transition: transform 220ms cubic-bezier(0.2,0.7,0.2,1);
        }
        .manage-card:hover .manage-card-arrow { transform: translateX(4px); }
      `}</style>
    </main>
  )
}
