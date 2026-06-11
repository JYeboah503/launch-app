'use client'

import { useState, useEffect } from 'react'
import { LaunchLogo } from '@/components/launch-logo'
import { ClassroomDetail } from '@/components/classroom-detail'
import { ScenarioBuilderV2 } from '@/components/scenario-builder-v2'
import { type Classroom, generateClassCode } from '@/lib/roles'
import { addCustomScenarioStub } from '@/lib/scenarioStore'

interface TeacherDashboardProps {
  onBack: () => void
}

const STORAGE_KEY = 'launch.teacher.classrooms'

const SEED_CLASSROOMS: Classroom[] = [
  {
    id: '1',
    code: 'CLASS-RV4PB7',
    name: 'Year 11 Business',
    subject: 'Period 3 · Tuesdays + Thursdays',
    studentIds: ['1', '2', '3', '4', '5', '6'],
    scenarioIds: ['lakers-coach', 'sephora-lead'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: '2',
    code: 'CLASS-MK29HT',
    name: 'Year 12 Leadership',
    subject: 'Tuesdays · 10:00',
    studentIds: ['7', '8', '9'],
    scenarioIds: ['startup-founder'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
]

/**
 * Teacher dashboard — warm, school-friendly register.
 * Light cream canvas + lime accent + softer typography, distinct from the
 * cooler enterprise corporate dashboard.
 *
 * Section C1: home view (classrooms list + create flow).
 * Detail view (students/scenarios/performance) lands in C2.
 */
export function TeacherDashboard({ onBack }: TeacherDashboardProps) {
  const [classrooms, setClassrooms] = useState<Classroom[]>(SEED_CLASSROOMS)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null)

  const selectedClassroom = selectedClassroomId
    ? classrooms.find((c) => c.id === selectedClassroomId) || null
    : null

  const updateClassroom = (id: string, patch: Partial<Classroom>) => {
    setClassrooms((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }
  const deleteClassroom = (id: string) => {
    setClassrooms((prev) => prev.filter((c) => c.id !== id))
    if (selectedClassroomId === id) setSelectedClassroomId(null)
  }

  // Teacher scenario builder — mounted at dashboard level so it can overlay
  // the detail view. Opening targets a specific classroom for auto-assignment.
  const [builderForClassroom, setBuilderForClassroom] = useState<string | null>(null)

  // Hydrate from localStorage on mount (front-end persistence).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Classroom[]
        if (Array.isArray(parsed) && parsed.length > 0) setClassrooms(parsed)
      }
    } catch {
      /* ignore */
    }
  }, [])

  // Persist on change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(classrooms))
    } catch {
      /* ignore */
    }
  }, [classrooms])

  const handleCreate = () => {
    const name = newName.trim()
    if (!name) return
    const fresh: Classroom = {
      id: Date.now().toString(36),
      code: generateClassCode(),
      name,
      subject: newSubject.trim() || undefined,
      studentIds: [],
      scenarioIds: [],
      createdAt: new Date().toISOString(),
    }
    setClassrooms([fresh, ...classrooms])
    setNewName('')
    setNewSubject('')
    setShowCreate(false)
  }

  const totalStudents = classrooms.reduce((n, c) => n + c.studentIds.length, 0)
  const totalScenarios = classrooms.reduce((n, c) => n + c.scenarioIds.length, 0)

  return (
    <main className="teacher-root min-h-screen">
      {/* Top bar */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: 'rgba(252, 248, 240, 0.85)',
          borderBottom: '1px solid var(--lq-line)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LaunchLogo height={22} color="var(--launch-navy)" ariaLabel="LAUNCH" />
            <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
              · teacher
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="teacher-btn teacher-btn-primary"
            >
              + Create classroom
            </button>
            <button
              type="button"
              onClick={onBack}
              className="teacher-btn teacher-btn-ghost"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      {selectedClassroom ? (
        <ClassroomDetail
          classroom={selectedClassroom}
          onBack={() => setSelectedClassroomId(null)}
          onUpdate={(patch) => updateClassroom(selectedClassroom.id, patch)}
          onDelete={() => deleteClassroom(selectedClassroom.id)}
          onBuildScenario={() => setBuilderForClassroom(selectedClassroom.id)}
        />
      ) : (<>

      {/* Welcome */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 sm:pt-16 pb-6">
        <div className="editorial-mono mb-3" style={{ color: 'var(--launch-lime-3)' }}>
          Your staffroom
        </div>
        <h1
          className="mb-3 max-w-[20ch]"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 300,
            fontSize: 'clamp(32px, 4.6vw, 56px)',
            letterSpacing: '-0.026em',
            lineHeight: 1.04,
            color: 'var(--lq-ink)',
          }}
        >
          Welcome back. <em style={{ fontStyle: 'italic', color: 'var(--launch-lime-3)' }}>Let&rsquo;s teach.</em>
        </h1>
        <p
          className="max-w-[58ch] text-base sm:text-lg mb-8"
          style={{ color: 'var(--lq-ink-2)', lineHeight: 1.55 }}
        >
          Make a classroom, hand out the code, set the scenarios you want them
          to play. We&rsquo;ll keep track of the rest.
        </p>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl">
          {[
            { label: 'Classrooms', value: classrooms.length },
            { label: 'Students enrolled', value: totalStudents },
            { label: 'Scenarios live', value: totalScenarios },
          ].map((stat) => (
            <div key={stat.label} className="teacher-stat">
              <div
                className="text-3xl sm:text-4xl"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  color: 'var(--lq-ink)',
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div className="editorial-mono mt-2" style={{ color: 'var(--lq-ink-3)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Classrooms list */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex items-baseline justify-between mb-6">
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: 'clamp(22px, 2.6vw, 32px)',
              letterSpacing: '-0.02em',
              color: 'var(--lq-ink)',
            }}
          >
            Your classrooms
          </h2>
          {classrooms.length > 0 && (
            <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
              {classrooms.length} class{classrooms.length === 1 ? '' : 'es'}
            </span>
          )}
        </div>

        {classrooms.length === 0 ? (
          <div className="teacher-card teacher-empty">
            <div className="editorial-mono mb-2" style={{ color: 'var(--launch-lime-3)' }}>
              No classrooms yet
            </div>
            <p
              className="mb-6 max-w-[40ch] mx-auto"
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                color: 'var(--lq-ink-2)',
                fontSize: 18,
                lineHeight: 1.5,
              }}
            >
              Make your first one. Takes about ten seconds.
            </p>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="teacher-btn teacher-btn-primary"
            >
              + Create classroom
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((c) => (
              <article
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedClassroomId(c.id)}
                onKeyDown={(e) => { if (e.key === 'Enter') setSelectedClassroomId(c.id) }}
                className="teacher-card teacher-card-classroom group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
                    {c.subject || 'Classroom'}
                  </div>
                  <span aria-hidden className="teacher-dot" />
                </div>
                <h3
                  className="mb-3"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    fontSize: 22,
                    letterSpacing: '-0.015em',
                    color: 'var(--lq-ink)',
                    lineHeight: 1.15,
                  }}
                >
                  {c.name}
                </h3>
                <div className="space-y-1 text-sm" style={{ color: 'var(--lq-ink-2)' }}>
                  <p>{c.studentIds.length} students enrolled</p>
                  <p>{c.scenarioIds.length} scenarios assigned</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--lq-line)] flex items-center justify-between">
                  <span
                    className="editorial-mono"
                    style={{ color: 'var(--launch-lime-3)' }}
                  >
                    {c.code}
                  </span>
                  <span className="editorial-mono" style={{ color: 'var(--lq-ink-3)' }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      </>)}

      {/* Create classroom modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(14, 24, 51, 0.45)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowCreate(false)}
        >
          <div
            className="teacher-card w-full max-w-md p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="editorial-mono mb-2" style={{ color: 'var(--launch-lime-3)' }}>
              New classroom
            </div>
            <h2
              className="mb-6"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                fontSize: 26,
                letterSpacing: '-0.018em',
                color: 'var(--lq-ink)',
              }}
            >
              Name your class.
            </h2>
            <div className="space-y-4">
              <div>
                <label className="editorial-mono block mb-2" style={{ color: 'var(--lq-ink-3)' }}>
                  Classroom name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Year 11 Business"
                  autoFocus
                  className="teacher-input w-full"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
                />
              </div>
              <div>
                <label className="editorial-mono block mb-2" style={{ color: 'var(--lq-ink-3)' }}>
                  Subject / meeting time <span style={{ color: 'var(--lq-ink-3)' }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Tuesdays · 10:00"
                  className="teacher-input w-full"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
                />
              </div>
            </div>
            <div className="mt-7 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="teacher-btn teacher-btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="teacher-btn teacher-btn-primary"
              >
                Create classroom
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher-flavoured styles — warm, lime-back, soft. */}
      <style>{`
        .teacher-root {
          background: #f6f2ea;
          color: var(--lq-ink);
        }
        .teacher-card {
          background: #ffffff;
          border: 1px solid var(--lq-line);
          border-radius: 20px;
          padding: 22px 24px 24px;
          transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;
        }
        .teacher-card-classroom {
          cursor: pointer;
        }
        .teacher-card-classroom:hover {
          border-color: rgba(109, 182, 26, 0.42);
          box-shadow: 0 12px 32px rgba(60, 90, 14, 0.10);
          transform: translateY(-2px);
        }
        .teacher-empty {
          text-align: center;
          padding: 56px 32px;
          background:
            linear-gradient(180deg, rgba(27, 158, 143, 0.10) 0%, rgba(27, 158, 143, 0.03) 60%, transparent 100%),
            #ffffff;
          border: 1px dashed rgba(109, 182, 26, 0.32);
        }
        .teacher-stat {
          background: #ffffff;
          border: 1px solid var(--lq-line);
          border-radius: 16px;
          padding: 18px 18px 16px;
        }
        .teacher-dot {
          display: inline-block;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--launch-lime);
          box-shadow: 0 0 0 3px rgba(27, 158, 143, 0.18);
        }
        .teacher-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 999px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 14px;
          letter-spacing: -0.005em;
          line-height: 1;
          border: 1px solid transparent;
          cursor: pointer;
          transition: background 200ms ease, border-color 200ms ease, transform 200ms ease, color 200ms ease, box-shadow 200ms ease;
        }
        .teacher-btn-primary {
          background: var(--launch-lime);
          color: var(--lq-ink);
          border-color: var(--launch-lime-2);
          box-shadow: 0 6px 18px rgba(27, 158, 143, 0.32);
        }
        .teacher-btn-primary:hover:not(:disabled) {
          background: var(--launch-lime-2);
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(27, 158, 143, 0.45);
        }
        .teacher-btn-primary:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .teacher-btn-ghost {
          background: #ffffff;
          color: var(--lq-ink-2);
          border-color: var(--lq-line-2);
        }
        .teacher-btn-ghost:hover {
          color: var(--lq-ink);
          border-color: var(--launch-lime-2);
        }
        .teacher-input {
          padding: 11px 14px;
          border-radius: 12px;
          border: 1px solid var(--lq-line-2);
          background: #ffffff;
          color: var(--lq-ink);
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.3;
          outline: none;
          transition: border-color 160ms ease;
        }
        .teacher-input:focus {
          border-color: var(--launch-lime-2);
          box-shadow: 0 0 0 4px rgba(27, 158, 143, 0.18);
        }
        .teacher-input::placeholder {
          color: var(--lq-ink-3);
        }
      `}</style>

      {/* Teacher-flavoured Scenario Builder v2 — locked to early register,
          emits a teacher scenario, auto-assigns it to the target classroom. */}
      <ScenarioBuilderV2
        externalOpen={builderForClassroom !== null}
        creatorType="teacher"
        lockLevel="early"
        onClose={() => setBuilderForClassroom(null)}
        onRoleCreated={(role) => {
          // Persist the stub for later code/play resolution
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
          // Attach to the targeted classroom
          if (builderForClassroom) {
            const target = classrooms.find((c) => c.id === builderForClassroom)
            if (target && !target.scenarioIds.includes(role.id)) {
              updateClassroom(builderForClassroom, {
                scenarioIds: [...target.scenarioIds, role.id],
              })
            }
          }
        }}
      />
    </main>
  )
}
