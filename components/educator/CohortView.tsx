'use client'

/** Cohort workhorse — Overview · Students · Assignments · Subject fit. */

import { useMemo, useRef, useState } from 'react'
import {
  CAPABILITIES, CAPABILITY_SHORT, SUBJECT_TEMPLATES, ASSIGNABLE_SCENARIOS,
  overallScore, cohortAverageScores, completionFor, needsAttention, standouts,
  subjectFit, growthSince, makePlaceholderStudent, cohortCsv, downloadText, heatColor, heatTextLight,
  isForStudent, assignmentStateFor,
  type Cohort, type EdStudent, type EdAssignment, type SubjectProfile, type AssignmentState,
} from '@/lib/educator'
import { ED_NOW, type EdWorkspace, type EdScenario } from '@/components/educator/types'
import { CapabilityHeatmap, ProgressRing } from '@/components/educator/charts'
import { InsightsTab } from '@/components/educator/InsightsTab'
import { ModalShell, fmtDate, dueLabel } from '@/components/educator/ui'
import {
  ArrowLeft, Plus, X, Copy, Check, Search, Upload, Download, FileText,
  Users, ClipboardList, GraduationCap, LayoutGrid, AlertTriangle, Star, Link2,
} from 'lucide-react'

type Tab = 'overview' | 'students' | 'assignments' | 'subjects'

export function CohortView({
  ws, cohort, onBack, onOpenStudent, onPatch,
}: {
  ws: EdWorkspace
  cohort: Cohort
  onBack: () => void
  onOpenStudent: (id: string) => void
  onPatch: (p: Partial<EdWorkspace>) => void
}) {
  const [tab, setTab] = useState<Tab>('overview')
  const students = useMemo(() => ws.students.filter((s) => cohort.studentIds.includes(s.id)), [ws.students, cohort.studentIds])
  const assignments = useMemo(() => ws.assignments.filter((a) => a.cohortId === cohort.id), [ws.assignments, cohort.id])
  const average = useMemo(() => cohortAverageScores(students), [students])

  const [enrolOpen, setEnrolOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)

  const completion = useMemo(() => {
    let done = 0, total = 0
    for (const a of assignments) { const st = completionFor(a, cohort); done += st.completed + st.reviewed; total += st.total }
    return total ? Math.round((done / total) * 100) : 0
  }, [assignments, cohort])
  const avgScore = students.length ? Math.round(students.reduce((n, s) => n + overallScore(s.scores), 0) / students.length) : 0
  const attention = useMemo(() => needsAttention(students, assignments, ED_NOW), [students, assignments])
  const shining = useMemo(() => standouts(students, 4), [students])

  /* ── mutations ─────────────────────────────────────────────────── */
  const enrolExisting = (ids: string[]) => {
    onPatch({ cohorts: ws.cohorts.map((c) => c.id === cohort.id ? { ...c, studentIds: Array.from(new Set([...c.studentIds, ...ids])) } : c) })
  }
  const enrolImported = (rows: { name: string; email: string }[]) => {
    const fresh = rows.map((r, i) => makePlaceholderStudent(r.name, r.email, ws.students.length + i))
    onPatch({
      students: [...ws.students, ...fresh],
      cohorts: ws.cohorts.map((c) => c.id === cohort.id ? { ...c, studentIds: [...c.studentIds, ...fresh.map((s) => s.id)] } : c),
    })
  }
  const removeStudent = (id: string) => {
    onPatch({ cohorts: ws.cohorts.map((c) => c.id === cohort.id ? { ...c, studentIds: c.studentIds.filter((x) => x !== id) } : c) })
  }
  const addAssignment = (a: EdAssignment) => onPatch({ assignments: [a, ...ws.assignments] })
  const setSubjects = (subjects: SubjectProfile[]) => onPatch({ subjects })

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <LayoutGrid className="w-4 h-4" /> },
    { key: 'students', label: `Students · ${students.length}`, icon: <Users className="w-4 h-4" /> },
    { key: 'assignments', label: `Assignments · ${assignments.length}`, icon: <ClipboardList className="w-4 h-4" /> },
    { key: 'subjects', label: 'Subject fit', icon: <GraduationCap className="w-4 h-4" /> },
  ]

  return (
    <div className="ed-page">
      <button type="button" className="ed-back" onClick={onBack}><ArrowLeft className="w-4 h-4" /> All cohorts</button>

      {/* Header */}
      <div className="ed-cohead">
        <div>
          <div className="ed-eyebrow">{cohort.term}</div>
          <h1 className="ed-h1" style={{ marginBottom: 10 }}>{cohort.name}</h1>
          <div className="ed-cohead-meta">
            <CodePill code={cohort.code} />
            <span className="ed-dim">{students.length} students · {assignments.length} scenarios</span>
          </div>
        </div>
        <div className="ed-cohead-actions">
          <ExportMenu
            onCsv={() => downloadText(`${cohort.code.toLowerCase()}-gradebook.csv`, cohortCsv(cohort, students))}
            onPdf={() => window.print()}
          />
          <button type="button" className="ed-btn ed-btn-primary" onClick={() => setEnrolOpen(true)}>
            <Plus className="w-4 h-4" /> Enrol
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="ed-tabs">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={`ed-tab ${tab === t.key ? 'is-on' : ''}`} onClick={() => setTab(t.key)}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <>
          {students.length === 0 ? (
            <EmptyState title="No students yet" body="Enrol students to bring this page to life." cta="Enrol students" onCta={() => setEnrolOpen(true)} />
          ) : (
            <>
              <div className="ed-kpis">
                <div className="ed-kpi ed-kpi-ring"><ProgressRing pct={completion} label="Completed" /><div><div className="ed-kpi-sub">Across all assignments</div></div></div>
                <div className="ed-kpi"><div className="ed-kpi-num">{avgScore}</div><div className="ed-kpi-lbl">Average overall</div></div>
                <div className="ed-kpi"><div className="ed-kpi-num" style={{ color: 'var(--launch-danger)' }}>{attention.length}</div><div className="ed-kpi-lbl">Need attention</div></div>
                <div className="ed-kpi"><div className="ed-kpi-num" style={{ color: 'var(--ed-accent)' }}>{shining.length}</div><div className="ed-kpi-lbl">Shining this week</div></div>
              </div>

              <div className="ed-attn-grid">
                <AttnCard icon={<AlertTriangle className="w-4 h-4" style={{ color: 'var(--launch-danger)' }} />} title="Needs attention" empty="Everyone's on track.">
                  {attention.slice(0, 6).map((f) => (
                    <button key={f.student.id} className="ed-attn-row" onClick={() => onOpenStudent(f.student.id)}>
                      <span className="ed-attn-ini">{f.student.initials}</span>
                      <span className="ed-attn-body"><span className="ed-attn-name">{f.student.name}</span><span className="ed-attn-reason">{f.reason}</span></span>
                    </button>
                  ))}
                </AttnCard>
                <AttnCard icon={<Star className="w-4 h-4" style={{ color: 'var(--ed-accent)' }} />} title="Shining this week" empty="—">
                  {shining.map((f) => (
                    <button key={f.student.id} className="ed-attn-row" onClick={() => onOpenStudent(f.student.id)}>
                      <span className="ed-attn-ini" style={{ background: 'var(--ed-accent-soft)', color: 'var(--ed-accent)' }}>{f.student.initials}</span>
                      <span className="ed-attn-body"><span className="ed-attn-name">{f.student.name}</span><span className="ed-attn-reason">{f.reason}</span></span>
                    </button>
                  ))}
                </AttnCard>
              </div>

              <div className="ed-block-head"><h3 className="ed-h3">Capability heatmap</h3><span className="ed-dim">Tap a student to open their guidance</span></div>
              <CapabilityHeatmap students={students} average={average} onSelectStudent={onOpenStudent} />

              {/* Trends + distributions live here too — one confident page,
                  no guessing which tab holds which chart. */}
              <div style={{ marginTop: 38 }}>
                <InsightsTab students={students} onOpenStudent={onOpenStudent} />
              </div>
            </>
          )}
        </>
      )}

      {/* ── STUDENTS ── */}
      {tab === 'students' && (
        students.length === 0
          ? <EmptyState title="No students yet" body="Share the code or import a list." cta="Enrol students" onCta={() => setEnrolOpen(true)} />
          : <div className="ed-roster">
              {students.map((s) => (
                <button key={s.id} className="ed-rcard" onClick={() => onOpenStudent(s.id)}>
                  <div className="ed-rcard-top">
                    <span className="ed-rcard-ini">{s.initials}</span>
                    <span aria-label="Remove from cohort" className="ed-rcard-x" onClick={(e) => { e.stopPropagation(); removeStudent(s.id) }}><X className="w-3.5 h-3.5" /></span>
                  </div>
                  <div className="ed-rcard-name">{s.name}</div>
                  <div className="ed-rcard-email">{s.email}</div>
                  <div className="ed-rcard-foot">
                    <span><strong>{overallScore(s.scores)}</strong> overall</span>
                    <span className="ed-rcard-growth">▲ {growthSince(s)}</span>
                  </div>
                </button>
              ))}
            </div>
      )}

      {/* ── ASSIGNMENTS ── */}
      {tab === 'assignments' && (
        <>
          <div className="ed-block-head">
            <h3 className="ed-h3">Assignments</h3>
            <button type="button" className="ed-btn ed-btn-primary" onClick={() => setAssignOpen(true)}><Plus className="w-4 h-4" /> Assign scenario</button>
          </div>
          {assignments.length === 0
            ? <EmptyState title="Nothing assigned yet" body="Give this cohort its first scenario." cta="Assign scenario" onCta={() => setAssignOpen(true)} />
            : <div className="ed-assign-list">
                {assignments.map((a) => <AssignmentRow key={a.id} a={a} cohort={cohort} students={students} onOpenStudent={onOpenStudent} />)}
              </div>}
        </>
      )}

      {/* ── SUBJECT FIT ── */}
      {tab === 'subjects' && (
        <SubjectFitTab students={students} subjects={ws.subjects} setSubjects={setSubjects} onOpenStudent={onOpenStudent} />
      )}

      {enrolOpen && (
        <EnrolModal
          cohort={cohort}
          poolStudents={ws.students.filter((s) => !cohort.studentIds.includes(s.id))}
          onClose={() => setEnrolOpen(false)}
          onEnrolExisting={(ids) => { enrolExisting(ids); setEnrolOpen(false) }}
          onImport={(rows) => { enrolImported(rows); setEnrolOpen(false) }}
        />
      )}
      {assignOpen && (
        <AssignModal
          cohort={cohort}
          students={students}
          /* Teacher-authored scenarios lead the list, then the pre-built library. */
          scenarios={[...ws.customScenarios, ...ASSIGNABLE_SCENARIOS]}
          onClose={() => setAssignOpen(false)}
          onAssign={(a) => { addAssignment(a); setAssignOpen(false); setTab('assignments') }}
        />
      )}
      <style>{cohortStyles}</style>
    </div>
  )
}

/* ── small pieces ─────────────────────────────────────────────────── */

function ExportMenu({ onCsv, onPdf }: { onCsv: () => void; onPdf: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" className="ed-btn ed-btn-ghost" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <Download className="w-4 h-4" /> Export
      </button>
      {open && (
        <div className="ed-exp-menu" role="menu">
          <button type="button" className="ed-exp-item" onClick={() => { onCsv(); setOpen(false) }}>
            <Download className="w-4 h-4" /> Gradebook CSV
          </button>
          <button type="button" className="ed-exp-item" onClick={() => { onPdf(); setOpen(false) }}>
            <FileText className="w-4 h-4" /> Summary PDF
          </button>
        </div>
      )}
    </div>
  )
}

function CodePill({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button type="button" className="ed-codepill" onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1400) }}>
      <span className="ed-codepill-lbl">Join code</span>
      <span className="ed-codepill-code">{code}</span>
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

function EmptyState({ title, body, cta, onCta }: { title: string; body: string; cta: string; onCta: () => void }) {
  return (
    <div className="ed-empty">
      <div className="ed-eyebrow" style={{ color: 'var(--ed-accent)', marginBottom: 8 }}>{title}</div>
      <p>{body}</p>
      <button type="button" className="ed-btn ed-btn-primary" onClick={onCta}><Plus className="w-4 h-4" /> {cta}</button>
    </div>
  )
}

function AttnCard({ icon, title, empty, children }: { icon: React.ReactNode; title: string; empty: string; children: React.ReactNode }) {
  const has = Array.isArray(children) ? children.length > 0 : !!children
  return (
    <div className="ed-attn-card">
      <div className="ed-snap-head">{icon} {title}</div>
      {has ? <div className="ed-attn-rows">{children}</div> : <div className="ed-snap-empty">{empty}</div>}
    </div>
  )
}

const STATE_META: Record<AssignmentState, { label: string; cls: string }> = {
  'not-started': { label: 'Not started', cls: 'st-ns' },
  'in-progress': { label: 'In progress', cls: 'st-ip' },
  'completed': { label: 'Completed', cls: 'st-cp' },
  'reviewed': { label: 'Reviewed', cls: 'st-rv' },
}

function AssignmentRow({ a, cohort, students, onOpenStudent }: { a: EdAssignment; cohort: Cohort; students: EdStudent[]; onOpenStudent: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const stats = completionFor(a, cohort)
  const due = dueLabel(a.dueAt, ED_NOW)
  const roster = a.assignedTo === 'cohort' ? students : students.filter((s) => isForStudent(a, s.id))
  return (
    <div className="ed-assign">
      <button type="button" className="ed-assign-head" onClick={() => setOpen((v) => !v)}>
        <div className="ed-assign-title">
          <span className="ed-assign-name">{a.title}</span>
          <span className="ed-assign-caps">{a.capabilities.map((c) => CAPABILITY_SHORT[c]).join(' · ')}</span>
        </div>
        <div className="ed-assign-meta">
          <span className={`ed-due ${due.overdue ? 'is-overdue' : ''}`}>{due.text}</span>
          <span className="ed-assign-bar"><span className="ed-assign-bar-fill" style={{ width: `${stats.pct}%` }} /></span>
          <span className="ed-assign-pct">{stats.pct}%</span>
        </div>
      </button>
      {open && (
        <div className="ed-assign-body">
          <div className="ed-assign-legend">
            <span><b>{stats.notStarted}</b> not started</span>
            <span><b>{stats.inProgress}</b> in progress</span>
            <span><b>{stats.completed}</b> completed</span>
            <span><b>{stats.reviewed}</b> reviewed</span>
            {stats.avgScore > 0 && <span><b>{stats.avgScore}</b> avg score</span>}
          </div>
          <div className="ed-assign-students">
            {roster.map((s) => {
              const st = assignmentStateFor(a, s.id)
              const p = a.progress.find((x) => x.studentId === s.id)
              return (
                <button key={s.id} className="ed-assign-srow" onClick={() => onOpenStudent(s.id)}>
                  <span className="ed-attn-ini">{s.initials}</span>
                  <span className="ed-assign-sname">{s.name}</span>
                  {p?.score != null && <span className="ed-assign-sscore">{p.score}</span>}
                  <span className={`ed-state ${STATE_META[st].cls}`}>{STATE_META[st].label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Subject fit tab ──────────────────────────────────────────────── */

function SubjectFitTab({ students, subjects, setSubjects, onOpenStudent }: { students: EdStudent[]; subjects: SubjectProfile[]; setSubjects: (s: SubjectProfile[]) => void; onOpenStudent: (id: string) => void }) {
  const [editing, setEditing] = useState<SubjectProfile | null>(null)
  const [creating, setCreating] = useState(false)

  const cohortFit = (subj: SubjectProfile) => students.length
    ? Math.round(students.reduce((n, s) => n + subjectFit(s.scores, subj), 0) / students.length) : 0

  const templatesToAdd = SUBJECT_TEMPLATES.filter((t) => !subjects.some((s) => s.name === t.name))

  return (
    <>
      <div className="ed-subj-intro">
        <p>Define the capabilities each subject leans on. Launch then shows how every student measures against those attributes — so you can steer them toward subjects (and away from mismatches) with evidence.</p>
      </div>

      <div className="ed-block-head">
        <h3 className="ed-h3">Subjects</h3>
        <button type="button" className="ed-btn ed-btn-ghost" onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> Add subject</button>
      </div>
      <div className="ed-subj-chips">
        {subjects.map((s) => (
          <button key={s.id} type="button" className="ed-subj-chip" onClick={() => setEditing(s)}>
            <span className="ed-subj-emoji">{s.emoji}</span>
            <span className="ed-subj-name">{s.name}</span>
            <span className="ed-subj-attrs">{s.attributes.length} attributes · cohort fit {cohortFit(s)}</span>
          </button>
        ))}
        {templatesToAdd.length > 0 && (
          <div className="ed-subj-templates">
            <span className="ed-dim">Add a template:</span>
            {templatesToAdd.slice(0, 5).map((t) => (
              <button key={t.id} type="button" className="ed-subj-tpl" onClick={() => setSubjects([...subjects, { ...t, id: `sub-${Date.now().toString(36)}`, isTemplate: false }])}>
                {t.emoji} {t.name} <Plus className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}
      </div>

      {students.length > 0 && subjects.length > 0 && (
        <>
          <div className="ed-block-head" style={{ marginTop: 28 }}><h3 className="ed-h3">Who fits what</h3><span className="ed-dim">Fit = mean of a student&rsquo;s scores on the subject&rsquo;s attributes</span></div>
          <div className="ed-heat-wrap">
            <table className="ed-heat">
              <thead>
                <tr>
                  <th className="ed-heat-name-h">Student</th>
                  {subjects.map((s) => <th key={s.id} title={s.name}><span>{s.emoji}</span></th>)}
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id} className="ed-heat-row" onClick={() => onOpenStudent(st.id)}>
                    <td className="ed-heat-name"><span className="ed-heat-ini">{st.initials}</span><span className="ed-heat-nm">{st.name}</span></td>
                    {subjects.map((s) => {
                      const v = subjectFit(st.scores, s)
                      return <td key={s.id}><span className="ed-heat-cell" style={{ background: heatColor(v), color: heatTextLight(v) ? '#fff' : 'var(--lq-ink)' }} title={`${st.name} · ${s.name}: ${v}`}>{v}</span></td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {(editing || creating) && (
        <SubjectEditor
          subject={editing}
          onClose={() => { setEditing(null); setCreating(false) }}
          onSave={(subj) => {
            if (editing) setSubjects(subjects.map((s) => s.id === subj.id ? subj : s))
            else setSubjects([...subjects, subj])
            setEditing(null); setCreating(false)
          }}
          onDelete={editing ? () => { setSubjects(subjects.filter((s) => s.id !== editing.id)); setEditing(null) } : undefined}
        />
      )}
    </>
  )
}

const EMOJI_CHOICES = ['💼', '📉', '🔬', '📚', '🧠', '🛠️', '⚖️', '🧭', '🎨', '💻', '🌏', '🎭']

function SubjectEditor({ subject, onClose, onSave, onDelete }: { subject: SubjectProfile | null; onClose: () => void; onSave: (s: SubjectProfile) => void; onDelete?: () => void }) {
  const [name, setName] = useState(subject?.name || '')
  const [emoji, setEmoji] = useState(subject?.emoji || '📘')
  const [attrs, setAttrs] = useState<string[]>(subject?.attributes || [])
  const toggle = (c: string) => setAttrs((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])
  return (
    <ModalShell title={subject ? 'Edit subject' : 'New subject'} onClose={onClose} wide>
      <div className="ed-field">
        <label className="ed-label">Subject name</label>
        <input className="ed-input" autoFocus value={name} placeholder="Business Studies" onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="ed-field">
        <label className="ed-label">Icon</label>
        <div className="ed-emoji-row">{EMOJI_CHOICES.map((e) => <button key={e} type="button" className={`ed-emoji ${emoji === e ? 'is-on' : ''}`} onClick={() => setEmoji(e)}>{e}</button>)}</div>
      </div>
      <div className="ed-field">
        <label className="ed-label">Key attributes — the capabilities this subject demands</label>
        <div className="ed-attr-grid">
          {CAPABILITIES.map((c) => (
            <button key={c} type="button" className={`ed-attr ${attrs.includes(c) ? 'is-on' : ''}`} onClick={() => toggle(c)}>
              {attrs.includes(c) && <Check className="w-3 h-3" />}{CAPABILITY_SHORT[c]}
            </button>
          ))}
        </div>
      </div>
      <div className="ed-modal-foot">
        {onDelete && <button type="button" className="ed-btn ed-btn-ghost" style={{ color: 'var(--launch-danger)', marginRight: 'auto' }} onClick={onDelete}>Delete</button>}
        <button type="button" className="ed-btn ed-btn-ghost" onClick={onClose}>Cancel</button>
        <button type="button" className="ed-btn ed-btn-primary" disabled={!name.trim() || attrs.length === 0}
          onClick={() => onSave({ id: subject?.id || `sub-${Date.now().toString(36)}`, name: name.trim(), emoji, attributes: attrs })}>
          Save subject
        </button>
      </div>
    </ModalShell>
  )
}

/* ── Enrol modal (4 paths) ────────────────────────────────────────── */

function EnrolModal({ cohort, poolStudents, onClose, onEnrolExisting, onImport }: {
  cohort: Cohort
  poolStudents: EdStudent[]
  onClose: () => void
  onEnrolExisting: (ids: string[]) => void
  onImport: (rows: { name: string; email: string }[]) => void
}) {
  const [tab, setTab] = useState<'code' | 'pick' | 'import' | 'link'>('code')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pasted, setPasted] = useState('')
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const filtered = poolStudents.filter((s) => !search.trim() || s.name.toLowerCase().includes(search.toLowerCase())).slice(0, 80)
  const imported = pasted.split(/\n+/).map((line) => {
    const parts = line.split(/[,;\t]/).map((x) => x.trim()).filter(Boolean)
    if (parts.length === 0) return null
    const emailPart = parts.find((p) => /@/.test(p)) || ''
    const namePart = parts.find((p) => !/@/.test(p)) || emailPart.split('@')[0]
    return { name: namePart, email: emailPart }
  }).filter(Boolean) as { name: string; email: string }[]

  const inviteUrl = `https://launchapp.au/join/${cohort.code.replace('CLASS-', '').toLowerCase()}`

  return (
    <ModalShell title={`Enrol into ${cohort.name}`} onClose={onClose} wide>
      <div className="ed-etabs">
        {([['code', 'Join code'], ['link', 'Invite link'], ['pick', 'Hand-pick'], ['import', 'Import list']] as const).map(([k, l]) => (
          <button key={k} type="button" className={`ed-etab ${tab === k ? 'is-on' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'code' && (
        <div className="ed-enrol-center">
          <p className="ed-enrol-hint">Give students this code. They enter it on their Launch dashboard to join.</p>
          <div className="ed-code-big">{cohort.code}
            <button type="button" className="ed-btn ed-btn-ghost" onClick={() => { navigator.clipboard?.writeText(cohort.code); setCopied(true); setTimeout(() => setCopied(false), 1400) }}>{copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}</button>
          </div>
        </div>
      )}
      {tab === 'link' && (
        <div className="ed-enrol-center">
          <p className="ed-enrol-hint">Share this link anywhere — email, LMS, a slide. Anyone who opens it joins this cohort.</p>
          <div className="ed-link-box"><Link2 className="w-4 h-4" style={{ color: 'var(--ed-accent)' }} /><span>{inviteUrl}</span>
            <button type="button" className="ed-btn ed-btn-ghost" onClick={() => { navigator.clipboard?.writeText(inviteUrl); setCopied(true); setTimeout(() => setCopied(false), 1400) }}>{copied ? 'Copied' : 'Copy'}</button>
          </div>
        </div>
      )}
      {tab === 'pick' && (
        <div>
          <div className="ed-search"><Search className="w-4 h-4" /><input className="ed-input" placeholder="Search students…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <div className="ed-pick-grid">
            {filtered.length === 0 && <p className="ed-dim" style={{ padding: 16 }}>No unenrolled students match.</p>}
            {filtered.map((s) => {
              const on = selected.has(s.id)
              return (
                <button key={s.id} type="button" className={`ed-pick ${on ? 'is-on' : ''}`} onClick={() => setSelected((prev) => { const n = new Set(prev); n.has(s.id) ? n.delete(s.id) : n.add(s.id); return n })}>
                  <span className={`ed-pick-check ${on ? 'is-on' : ''}`}>{on && <Check className="w-3 h-3" />}</span>
                  <span><span className="ed-pick-name">{s.name}</span><span className="ed-pick-email">{s.email}</span></span>
                </button>
              )
            })}
          </div>
          <div className="ed-modal-foot">
            <span className="ed-dim" style={{ marginRight: 'auto' }}>{selected.size} selected</span>
            <button type="button" className="ed-btn ed-btn-primary" disabled={selected.size === 0} onClick={() => onEnrolExisting([...selected])}>Enrol {selected.size || ''}</button>
          </div>
        </div>
      )}
      {tab === 'import' && (
        <div>
          <p className="ed-enrol-hint">Paste one student per line — <code>Name, email</code>. Or upload a CSV.</p>
          <textarea className="ed-input" style={{ minHeight: 120, fontFamily: 'var(--font-mono)', fontSize: 12 }} value={pasted} placeholder={'Ava Nguyen, ava@student.edu\nNoah Okafor, noah@student.edu'} onChange={(e) => setPasted(e.target.value)} />
          <div className="ed-modal-foot">
            <button type="button" className="ed-btn ed-btn-ghost" style={{ marginRight: 'auto' }} onClick={() => fileRef.current?.click()}><Upload className="w-4 h-4" /> Upload CSV</button>
            <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setPasted((p) => (p ? p + '\n' : '') + String(r.result || '')); r.readAsText(f) }} />
            <span className="ed-dim">{imported.length} to enrol</span>
            <button type="button" className="ed-btn ed-btn-primary" disabled={imported.length === 0} onClick={() => onImport(imported)}>Enrol {imported.length || ''}</button>
          </div>
        </div>
      )}
    </ModalShell>
  )
}

/* ── Assign modal ─────────────────────────────────────────────────── */

function AssignModal({ cohort, students, scenarios, onClose, onAssign }: { cohort: Cohort; students: EdStudent[]; scenarios: EdScenario[]; onClose: () => void; onAssign: (a: EdAssignment) => void }) {
  const [scenId, setScenId] = useState(scenarios[0].id)
  const [to, setTo] = useState<'cohort' | 'pick'>('cohort')
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [due, setDue] = useState('')
  const [opens, setOpens] = useState('')
  const scen = scenarios.find((s) => s.id === scenId)!

  const create = () => {
    const ids = to === 'cohort' ? cohort.studentIds : [...picked]
    const a: EdAssignment = {
      id: `as-${Date.now().toString(36)}`,
      cohortId: cohort.id,
      title: scen.title,
      capabilities: scen.capabilities,
      assignedTo: to === 'cohort' ? 'cohort' : ids,
      dueAt: due ? new Date(due).toISOString() : undefined,
      opensAt: opens ? new Date(opens).toISOString() : undefined,
      createdAt: new Date(ED_NOW).toISOString(),
      progress: ids.map((id) => ({ studentId: id, state: 'not-started' as AssignmentState })),
    }
    onAssign(a)
  }

  return (
    <ModalShell title="Assign a scenario" onClose={onClose} wide>
      <label className="ed-label">Scenario</label>
      <div className="ed-scen-grid">
        {scenarios.map((s) => (
          <button key={s.id} type="button" className={`ed-scen ${scenId === s.id ? 'is-on' : ''}`} onClick={() => setScenId(s.id)}>
            <div className="ed-scen-top"><span className="ed-scen-emoji">{s.emoji}</span><span className="ed-scen-name">{s.title}</span>{s.isCustom && <span className="ed-lib-yours" style={{ marginLeft: 'auto' }}>Yours</span>}</div>
            <p className="ed-scen-blurb">{s.blurb}</p>
            <div className="ed-scen-meta">{s.decisions} decisions · ~{s.mins} min · {s.capabilities.map((c) => CAPABILITY_SHORT[c] || c).join(', ')}</div>
          </button>
        ))}
      </div>

      <div className="ed-assign-config">
        <div className="ed-field">
          <label className="ed-label">Assign to</label>
          <div className="ed-seg">
            <button type="button" className={to === 'cohort' ? 'is-on' : ''} onClick={() => setTo('cohort')}>Whole cohort ({cohort.studentIds.length})</button>
            <button type="button" className={to === 'pick' ? 'is-on' : ''} onClick={() => setTo('pick')}>Specific students</button>
          </div>
        </div>
        <div className="ed-field">
          <label className="ed-label">Opens (optional)</label>
          <input type="date" className="ed-input" value={opens} onChange={(e) => setOpens(e.target.value)} />
        </div>
        <div className="ed-field">
          <label className="ed-label">Due date</label>
          <input type="date" className="ed-input" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
      </div>

      {to === 'pick' && (
        <div className="ed-pick-grid" style={{ maxHeight: 200 }}>
          {students.map((s) => {
            const on = picked.has(s.id)
            return (
              <button key={s.id} type="button" className={`ed-pick ${on ? 'is-on' : ''}`} onClick={() => setPicked((prev) => { const n = new Set(prev); n.has(s.id) ? n.delete(s.id) : n.add(s.id); return n })}>
                <span className={`ed-pick-check ${on ? 'is-on' : ''}`}>{on && <Check className="w-3 h-3" />}</span>
                <span className="ed-pick-name">{s.name}</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="ed-modal-foot">
        <button type="button" className="ed-btn ed-btn-ghost" onClick={onClose}>Cancel</button>
        <button type="button" className="ed-btn ed-btn-primary" disabled={to === 'pick' && picked.size === 0} onClick={create}>
          Assign to {to === 'cohort' ? `${cohort.studentIds.length} students` : `${picked.size} students`}
        </button>
      </div>
    </ModalShell>
  )
}

/* ── styles ───────────────────────────────────────────────────────── */

const cohortStyles = `
  .ed-back { display: inline-flex; align-items: center; gap: 7px; margin: 36px 0 22px; background: none; border: none; cursor: pointer; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lq-ink-2); }
  .ed-back:hover { color: var(--ed-accent); }
  .ed-cohead { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; flex-wrap: wrap; margin-bottom: 30px; }
  .ed-cohead-meta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .ed-cohead-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .ed-dim { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.04em; color: var(--lq-ink-3); }
  .ed-h3 { font-family: var(--font-display); font-weight: 500; font-size: 19px; letter-spacing: -0.015em; color: var(--lq-ink); }
  .ed-exp-menu { position: absolute; top: calc(100% + 6px); right: 0; z-index: 50; width: 210px; background: #fff; border: 1px solid var(--lq-line); border-radius: 14px; padding: 6px; box-shadow: 0 18px 40px -16px rgba(14, 24, 51, 0.28); }
  .ed-exp-item { width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 9px; border: none; background: none; cursor: pointer; font-family: var(--font-body); font-size: 13px; font-weight: 600; color: var(--lq-ink); text-align: left; }
  .ed-exp-item:hover { background: var(--ed-accent-soft); color: var(--ed-accent); }
  .ed-codepill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; background: #fff; border: 1px solid var(--lq-line-2); cursor: pointer; color: var(--lq-ink-3); }
  .ed-codepill:hover { border-color: var(--ed-accent); }
  .ed-codepill-lbl { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; }
  .ed-codepill-code { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: var(--ed-accent); }

  .ed-tabs { display: flex; gap: 6px; border-bottom: 1px solid var(--lq-line); margin-bottom: 32px; overflow-x: auto; }
  .ed-tab { display: inline-flex; align-items: center; gap: 7px; padding: 12px 16px; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-family: var(--font-body); font-size: 13px; font-weight: 600; color: var(--lq-ink-3); white-space: nowrap; }
  .ed-tab:hover { color: var(--lq-ink); }
  .ed-tab.is-on { color: var(--lq-ink); border-bottom-color: var(--lq-ink); }

  .ed-kpis { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 0; margin-bottom: 36px; background: #fff; border: 1px solid var(--lq-line); border-radius: 20px; overflow: hidden; }
  @media (max-width: 820px) { .ed-kpis { grid-template-columns: 1fr 1fr; } }
  .ed-kpi { background: transparent; border: none; border-left: 1px solid var(--lq-line); border-radius: 0; padding: 26px 24px; box-shadow: none; }
  .ed-kpi:first-child { border-left: none; }
  .ed-kpi-ring { display: flex; align-items: center; gap: 16px; }
  .ed-kpi-num { font-family: var(--font-display); font-weight: 550; font-size: 42px; letter-spacing: -0.03em; color: var(--lq-ink); line-height: 1; }
  .ed-kpi-lbl { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lq-ink-3); margin-top: 8px; }
  .ed-kpi-sub { font-size: 12px; color: var(--lq-ink-3); max-width: 20ch; }

  .ed-attn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 38px; }
  @media (max-width: 720px) { .ed-attn-grid { grid-template-columns: 1fr; } }
  .ed-attn-card { background: #fff; border: 1px solid var(--lq-line); border-radius: 20px; padding: 22px 24px; }
  .ed-attn-rows { display: flex; flex-direction: column; gap: 2px; }
  .ed-attn-row { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 10px; background: none; border: none; cursor: pointer; text-align: left; transition: background 120ms ease; }
  .ed-attn-row:hover { background: rgba(27,158,143,0.05); }
  .ed-attn-ini { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 999px; background: var(--lq-line); color: var(--lq-ink-2); font-family: var(--font-mono); font-size: 10px; font-weight: 700; flex-shrink: 0; }
  .ed-attn-body { display: flex; flex-direction: column; }
  .ed-attn-name { font-size: 13px; font-weight: 600; color: var(--lq-ink); }
  .ed-attn-reason { font-size: 11px; color: var(--lq-ink-3); }

  .ed-block-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }

  .ed-roster { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
  .ed-rcard { text-align: left; background: #fff; border: 1px solid var(--lq-line); border-radius: 18px; padding: 20px; cursor: pointer; transition: border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease; }
  .ed-rcard:hover { border-color: var(--ed-accent); transform: translateY(-2px); box-shadow: 0 12px 26px -16px var(--ed-accent); }
  .ed-rcard-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .ed-rcard-ini { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 999px; background: var(--ed-accent-soft); color: var(--ed-accent); font-family: var(--font-mono); font-size: 12px; font-weight: 700; }
  .ed-rcard-x { color: var(--lq-ink-3); padding: 4px; border-radius: 6px; }
  .ed-rcard-x:hover { color: var(--launch-danger); background: var(--launch-danger-soft); }
  .ed-rcard-name { font-family: var(--font-display); font-weight: 500; font-size: 16px; color: var(--lq-ink); }
  .ed-rcard-email { font-size: 11px; color: var(--lq-ink-3); margin-top: 2px; margin-bottom: 12px; }
  .ed-rcard-foot { display: flex; justify-content: space-between; align-items: baseline; padding-top: 10px; border-top: 1px solid var(--lq-line); font-size: 12px; color: var(--lq-ink-3); }
  .ed-rcard-foot strong { font-family: var(--font-mono); color: var(--lq-ink); }
  .ed-rcard-growth { color: var(--ed-accent); font-family: var(--font-mono); font-size: 11px; }

  .ed-assign-list { display: flex; flex-direction: column; gap: 10px; }
  .ed-assign { background: #fff; border: 1px solid var(--lq-line); border-radius: 14px; overflow: hidden; }
  .ed-assign-head { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 18px; background: none; border: none; cursor: pointer; text-align: left; }
  .ed-assign-title { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .ed-assign-name { font-family: var(--font-display); font-weight: 500; font-size: 16px; color: var(--lq-ink); }
  .ed-assign-caps { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.06em; color: var(--lq-ink-3); }
  .ed-assign-meta { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .ed-due { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--lq-ink-3); }
  .ed-due.is-overdue { color: var(--launch-danger); }
  .ed-assign-bar { width: 90px; height: 7px; border-radius: 999px; background: var(--lq-line); overflow: hidden; }
  .ed-assign-bar-fill { height: 100%; background: var(--ed-accent); border-radius: 999px; }
  .ed-assign-pct { font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: var(--lq-ink-2); width: 34px; text-align: right; }
  .ed-assign-body { padding: 0 18px 16px; border-top: 1px solid var(--lq-line); }
  .ed-assign-legend { display: flex; flex-wrap: wrap; gap: 14px; padding: 12px 0; font-size: 12px; color: var(--lq-ink-3); }
  .ed-assign-legend b { color: var(--lq-ink); font-family: var(--font-mono); }
  .ed-assign-students { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 6px; }
  .ed-assign-srow { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border-radius: 10px; background: #fbfaf7; border: 1px solid var(--lq-line); cursor: pointer; }
  .ed-assign-srow:hover { border-color: var(--ed-accent); }
  .ed-assign-sname { font-size: 12px; color: var(--lq-ink); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ed-assign-sscore { font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--lq-ink-2); }
  .ed-state { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.06em; text-transform: uppercase; padding: 2px 7px; border-radius: 999px; white-space: nowrap; }
  .st-ns { background: var(--lq-line); color: var(--lq-ink-3); }
  .st-ip { background: rgba(201,130,46,0.14); color: #a8641f; }
  .st-cp { background: var(--ed-accent-soft); color: var(--ed-accent); }
  .st-rv { background: rgba(10,42,107,0.10); color: var(--launch-navy); }

  .ed-subj-intro p { font-size: 14px; color: var(--lq-ink-2); line-height: 1.6; max-width: 72ch; margin-bottom: 24px; }
  .ed-subj-chips { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
  .ed-subj-chip { text-align: left; display: flex; flex-direction: column; gap: 2px; padding: 12px 16px; background: #fff; border: 1px solid var(--lq-line); border-radius: 14px; cursor: pointer; transition: border-color 160ms ease; }
  .ed-subj-chip:hover { border-color: var(--ed-accent); }
  .ed-subj-emoji { font-size: 18px; }
  .ed-subj-name { font-family: var(--font-display); font-weight: 500; font-size: 15px; color: var(--lq-ink); }
  .ed-subj-attrs { font-family: var(--font-mono); font-size: 10px; color: var(--lq-ink-3); }
  .ed-subj-templates { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; width: 100%; margin-top: 8px; }
  .ed-subj-tpl { display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 999px; background: #fbfaf7; border: 1px dashed var(--lq-line-2); font-size: 12px; color: var(--lq-ink-2); cursor: pointer; }
  .ed-subj-tpl:hover { border-color: var(--ed-accent); color: var(--ed-accent); }

  .ed-etabs { display: flex; gap: 4px; border-bottom: 1px solid var(--lq-line); margin-bottom: 18px; }
  .ed-etab { padding: 9px 14px; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lq-ink-3); }
  .ed-etab.is-on { color: var(--ed-accent); border-bottom-color: var(--ed-accent); }
  .ed-enrol-center { text-align: center; padding: 20px 0; }
  .ed-enrol-hint { font-size: 14px; color: var(--lq-ink-2); line-height: 1.55; max-width: 46ch; margin: 0 auto 18px; }
  .ed-enrol-hint code { font-family: var(--font-mono); font-size: 12px; background: #f2efe8; padding: 1px 5px; border-radius: 4px; }
  .ed-code-big { display: inline-flex; align-items: center; gap: 14px; font-family: var(--font-mono); font-weight: 700; font-size: 30px; letter-spacing: 0.08em; color: var(--ed-accent); background: var(--ed-accent-soft); border-radius: 16px; padding: 14px 22px; }
  .ed-link-box { display: inline-flex; align-items: center; gap: 10px; background: #fbfaf7; border: 1px solid var(--lq-line); border-radius: 12px; padding: 10px 14px; font-size: 13px; color: var(--lq-ink); max-width: 100%; }
  .ed-link-box span { font-family: var(--font-mono); font-size: 12px; overflow: hidden; text-overflow: ellipsis; }
  .ed-search { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: var(--lq-ink-3); }
  .ed-search .ed-input { flex: 1; }
  .ed-pick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; max-height: 320px; overflow-y: auto; }
  @media (max-width: 560px) { .ed-pick-grid { grid-template-columns: 1fr; } }
  .ed-pick { display: flex; align-items: center; gap: 10px; padding: 9px 11px; border-radius: 11px; background: #fff; border: 1px solid var(--lq-line); cursor: pointer; text-align: left; }
  .ed-pick.is-on { border-color: var(--ed-accent); background: var(--ed-accent-soft); }
  .ed-pick-check { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 6px; border: 1.5px solid var(--lq-line-2); background: #fff; flex-shrink: 0; }
  .ed-pick-check.is-on { background: var(--ed-accent); border-color: var(--ed-accent); color: #fff; }
  .ed-pick-name { display: block; font-size: 13px; font-weight: 600; color: var(--lq-ink); }
  .ed-pick-email { display: block; font-size: 11px; color: var(--lq-ink-3); }

  .ed-lib-yours { font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ed-accent); background: var(--ed-accent-soft); border-radius: 999px; padding: 3px 9px; }
  .ed-scen-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  @media (max-width: 620px) { .ed-scen-grid { grid-template-columns: 1fr; } }
  .ed-scen { text-align: left; padding: 14px 16px; border-radius: 14px; background: #fff; border: 1.5px solid var(--lq-line); cursor: pointer; transition: border-color 160ms ease; }
  .ed-scen.is-on { border-color: var(--ed-accent); background: var(--ed-accent-soft); }
  .ed-scen-top { display: flex; align-items: center; gap: 9px; margin-bottom: 6px; }
  .ed-scen-emoji { font-size: 18px; }
  .ed-scen-name { font-family: var(--font-display); font-weight: 500; font-size: 15px; color: var(--lq-ink); }
  .ed-scen-blurb { font-size: 12px; color: var(--lq-ink-2); line-height: 1.5; margin-bottom: 8px; }
  .ed-scen-meta { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.04em; color: var(--lq-ink-3); }
  .ed-assign-config { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 12px; margin-bottom: 14px; }
  @media (max-width: 620px) { .ed-assign-config { grid-template-columns: 1fr; } }
  .ed-seg { display: inline-flex; background: #f2efe8; border-radius: 999px; padding: 3px; }
  .ed-seg button { padding: 7px 12px; border-radius: 999px; border: none; background: none; cursor: pointer; font-family: var(--font-body); font-size: 12px; font-weight: 600; color: var(--lq-ink-3); white-space: nowrap; }
  .ed-seg button.is-on { background: #fff; color: var(--ed-accent); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

  .ed-emoji-row { display: flex; flex-wrap: wrap; gap: 6px; }
  .ed-emoji { width: 38px; height: 38px; border-radius: 10px; border: 1.5px solid var(--lq-line); background: #fff; font-size: 18px; cursor: pointer; }
  .ed-emoji.is-on { border-color: var(--ed-accent); background: var(--ed-accent-soft); }
  .ed-attr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  @media (max-width: 560px) { .ed-attr-grid { grid-template-columns: 1fr; } }
  .ed-attr { display: inline-flex; align-items: center; gap: 7px; padding: 9px 12px; border-radius: 10px; border: 1px solid var(--lq-line); background: #fff; cursor: pointer; font-size: 13px; color: var(--lq-ink-2); text-align: left; }
  .ed-attr.is-on { border-color: var(--ed-accent); background: var(--ed-accent-soft); color: var(--ed-accent); font-weight: 600; }
`
