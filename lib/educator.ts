/**
 * Educator dashboard — data model, deterministic seed, and guidance logic.
 *
 * This is the careers-advisor surface. The design brief (for the tech team
 * who wire the real backend):
 *
 *  · Persona: university / careers advisor — data-forward but warm.
 *  · Core job: track completion + how students did.
 *  · Org: flat COHORTS. Students enrol via join code / hand-pick / CSV /
 *    invite link. Full names shown; performance appears once completed.
 *  · Assignments: to a whole cohort or individuals; due dates + scheduled
 *    release; states not-started → in-progress → completed → reviewed.
 *  · Signature analytics: a capability heatmap (students × 10 capabilities),
 *    compared vs the student's own past, the cohort average, and an
 *    advisor-set target. Auto-surfaced "needs attention" + "standouts".
 *  · Grading: FORMATIVE — no marks. Launch's own scoring does the talking.
 *  · Guidance (the differentiator): each student gets career highlights +
 *    suggested subjects, auto-derived from their capability profile and
 *    advisor-overridable. Advisors define SUBJECTS → the key attributes
 *    (capabilities) they demand, then track each student's fit over time.
 *  · Delight: milestone badges + growth streaks.
 *
 * Everything here is pure + deterministic (seeded PRNG) so the prototype is
 * stable across reloads and SSR. The tech team replaces the seed with real
 * data; the guidance functions are the product logic worth keeping.
 */

/* ────────────────────────────────────────────────────────────────────
   Capabilities — the 10 Launch axes (canonical, matches the rest of app)
   ──────────────────────────────────────────────────────────────────── */

export const CAPABILITIES = [
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
] as const

export type Capability = (typeof CAPABILITIES)[number]

/** Short labels for tight UI (heatmap column heads, chips). */
export const CAPABILITY_SHORT: Record<string, string> = {
  'Judgement & Decision-Making': 'Judgement',
  'Reasoning & Critical Thinking': 'Reasoning',
  'Problem Solving': 'Problem Solving',
  'Leadership & Influence': 'Leadership',
  'Adaptability & Cognitive Flexibility': 'Adaptability',
  'Emotional Intelligence': 'EQ',
  'Execution & Ownership': 'Execution',
  'Integrity & Ethics': 'Integrity',
  'Collaboration': 'Collaboration',
  'Situational Awareness & Systems Thinking': 'Systems',
}

export type CapabilityScores = Record<string, number> // capability → 0..100

/* ────────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────────── */

export interface GrowthSnapshot {
  date: string // ISO
  scores: CapabilityScores
}

export interface EdStudent {
  id: string
  name: string
  email: string
  initials: string
  /** Current capability scores (0..100). */
  scores: CapabilityScores
  /** Time-ordered snapshots (oldest → newest); last === current. */
  history: GrowthSnapshot[]
  /** Consecutive weeks with activity. */
  streakWeeks: number
  /** Earned badge ids (see BADGES). */
  badges: string[]
  lastActive: string // ISO
}

export type AssignmentState = 'not-started' | 'in-progress' | 'completed' | 'reviewed'

export interface AssignmentProgress {
  studentId: string
  state: AssignmentState
  score?: number // 0..100, once completed
  completedAt?: string
}

export interface EdAssignment {
  id: string
  cohortId: string
  title: string
  /** Capabilities the scenario measures. */
  capabilities: string[]
  /** 'cohort' = everyone; otherwise explicit studentIds. */
  assignedTo: 'cohort' | string[]
  dueAt?: string
  opensAt?: string // scheduled release
  createdAt: string
  progress: AssignmentProgress[]
}

export interface SubjectProfile {
  id: string
  name: string
  emoji: string
  /** Capabilities this subject leans on most. */
  attributes: string[]
  isTemplate?: boolean
}

export interface Cohort {
  id: string
  name: string
  code: string
  term: string
  /** Optional school-uploaded cover (data URL). Falls back to generative. */
  coverUrl?: string
  studentIds: string[]
  createdAt: string
}

export interface Badge {
  id: string
  label: string
  emoji: string
  blurb: string
}

/* ────────────────────────────────────────────────────────────────────
   Badges + career + subject reference data
   ──────────────────────────────────────────────────────────────────── */

export const BADGES: Badge[] = [
  { id: 'first-steps', label: 'First Steps', emoji: '🌱', blurb: 'Completed their first scenario.' },
  { id: 'rising-star', label: 'Rising Star', emoji: '⭐', blurb: 'Grew a capability by 10+ points.' },
  { id: 'consistent', label: 'Consistent', emoji: '🔥', blurb: 'Practised three weeks running.' },
  { id: 'all-rounder', label: 'All-Rounder', emoji: '🌀', blurb: 'Every capability above 60.' },
  { id: 'deep-thinker', label: 'Deep Thinker', emoji: '🧠', blurb: 'Reasoning above 85.' },
  { id: 'team-player', label: 'Team Player', emoji: '🤝', blurb: 'Collaboration above 85.' },
  { id: 'principled', label: 'Principled', emoji: '⚖️', blurb: 'Integrity above 85.' },
  { id: 'finisher', label: 'Finisher', emoji: '🏁', blurb: 'Completed five scenarios.' },
]

export const BADGE_BY_ID: Record<string, Badge> = Object.fromEntries(BADGES.map((b) => [b.id, b]))

/** Careers → the capabilities they lean on. Fit = mean of those scores. */
export const CAREER_PROFILES: { name: string; emoji: string; key: string[] }[] = [
  { name: 'Management Consulting', emoji: '📊', key: ['Reasoning & Critical Thinking', 'Problem Solving', 'Judgement & Decision-Making'] },
  { name: 'Investment & Finance', emoji: '📈', key: ['Judgement & Decision-Making', 'Reasoning & Critical Thinking', 'Execution & Ownership'] },
  { name: 'Product Management', emoji: '🧩', key: ['Problem Solving', 'Leadership & Influence', 'Collaboration'] },
  { name: 'Entrepreneurship', emoji: '🚀', key: ['Adaptability & Cognitive Flexibility', 'Execution & Ownership', 'Leadership & Influence'] },
  { name: 'Law', emoji: '⚖️', key: ['Reasoning & Critical Thinking', 'Integrity & Ethics', 'Situational Awareness & Systems Thinking'] },
  { name: 'Medicine & Health', emoji: '🩺', key: ['Emotional Intelligence', 'Integrity & Ethics', 'Execution & Ownership'] },
  { name: 'Engineering', emoji: '⚙️', key: ['Problem Solving', 'Situational Awareness & Systems Thinking', 'Execution & Ownership'] },
  { name: 'Marketing & Brand', emoji: '✨', key: ['Adaptability & Cognitive Flexibility', 'Collaboration', 'Emotional Intelligence'] },
  { name: 'Public Policy', emoji: '🏛️', key: ['Situational Awareness & Systems Thinking', 'Integrity & Ethics', 'Reasoning & Critical Thinking'] },
  { name: 'People & Teaching', emoji: '📣', key: ['Emotional Intelligence', 'Collaboration', 'Leadership & Influence'] },
  { name: 'Design', emoji: '🎨', key: ['Adaptability & Cognitive Flexibility', 'Problem Solving', 'Emotional Intelligence'] },
  { name: 'Operations', emoji: '🗂️', key: ['Execution & Ownership', 'Judgement & Decision-Making', 'Collaboration'] },
]

/** Subject templates → key attributes. Advisors edit or add their own. */
export const SUBJECT_TEMPLATES: SubjectProfile[] = [
  { id: 'sub-business', name: 'Business Studies', emoji: '💼', attributes: ['Judgement & Decision-Making', 'Leadership & Influence', 'Execution & Ownership', 'Collaboration'], isTemplate: true },
  { id: 'sub-economics', name: 'Economics', emoji: '📉', attributes: ['Reasoning & Critical Thinking', 'Problem Solving', 'Situational Awareness & Systems Thinking'], isTemplate: true },
  { id: 'sub-stem', name: 'STEM & Sciences', emoji: '🔬', attributes: ['Problem Solving', 'Reasoning & Critical Thinking', 'Execution & Ownership'], isTemplate: true },
  { id: 'sub-humanities', name: 'Humanities & English', emoji: '📚', attributes: ['Reasoning & Critical Thinking', 'Emotional Intelligence', 'Integrity & Ethics'], isTemplate: true },
  { id: 'sub-health', name: 'Health & Psychology', emoji: '🧠', attributes: ['Emotional Intelligence', 'Integrity & Ethics', 'Collaboration'], isTemplate: true },
  { id: 'sub-design', name: 'Design & Technology', emoji: '🛠️', attributes: ['Adaptability & Cognitive Flexibility', 'Problem Solving', 'Execution & Ownership'], isTemplate: true },
  { id: 'sub-legal', name: 'Legal Studies', emoji: '⚖️', attributes: ['Reasoning & Critical Thinking', 'Integrity & Ethics', 'Situational Awareness & Systems Thinking'], isTemplate: true },
  { id: 'sub-leadership', name: 'Leadership & PDHPE', emoji: '🧭', attributes: ['Leadership & Influence', 'Collaboration', 'Adaptability & Cognitive Flexibility'], isTemplate: true },
]

/* ────────────────────────────────────────────────────────────────────
   Guidance logic — pure functions (the product IP worth keeping)
   ──────────────────────────────────────────────────────────────────── */

function mean(scores: CapabilityScores, keys: string[]): number {
  if (keys.length === 0) return 0
  return Math.round(keys.reduce((n, k) => n + (scores[k] ?? 0), 0) / keys.length)
}

export function overallScore(scores: CapabilityScores): number {
  return mean(scores, CAPABILITIES as unknown as string[])
}

export interface CapabilityRank { name: string; score: number }

export function topStrengths(scores: CapabilityScores, n = 3): CapabilityRank[] {
  return [...CAPABILITIES]
    .map((name) => ({ name, score: scores[name] ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
}

export function growthAreas(scores: CapabilityScores, n = 2): CapabilityRank[] {
  return [...CAPABILITIES]
    .map((name) => ({ name, score: scores[name] ?? 0 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, n)
}

export interface CareerFit { name: string; emoji: string; fit: number }

/** Rank careers by how well the student's key-capability scores match. */
export function careerHighlights(scores: CapabilityScores, n = 3): CareerFit[] {
  return CAREER_PROFILES
    .map((c) => ({ name: c.name, emoji: c.emoji, fit: mean(scores, c.key) }))
    .sort((a, b) => b.fit - a.fit)
    .slice(0, n)
}

export interface SubjectFit { id: string; name: string; emoji: string; fit: number }

/** Fit for one subject = mean of the student's scores on its attributes. */
export function subjectFit(scores: CapabilityScores, subject: SubjectProfile): number {
  return mean(scores, subject.attributes)
}

export function suggestedSubjects(scores: CapabilityScores, subjects: SubjectProfile[], n = 3): SubjectFit[] {
  return subjects
    .map((s) => ({ id: s.id, name: s.name, emoji: s.emoji, fit: subjectFit(scores, s) }))
    .sort((a, b) => b.fit - a.fit)
    .slice(0, n)
}

/** Total growth (sum of positive deltas) since the first snapshot. */
export function growthSince(student: EdStudent): number {
  if (student.history.length < 2) return 0
  const first = student.history[0].scores
  const last = student.history[student.history.length - 1].scores
  let delta = 0
  for (const c of CAPABILITIES) delta += Math.max(0, (last[c] ?? 0) - (first[c] ?? 0))
  return Math.round(delta / CAPABILITIES.length)
}

/** Cohort capability averages per weekly snapshot, aligned from the most
 *  recent (so mixed-length histories still line up). Drives trend lines. */
export function cohortTrend(students: EdStudent[]): GrowthSnapshot[] {
  const withHist = students.filter((s) => s.history.length >= 2)
  if (withHist.length === 0) return []
  const len = Math.min(...withHist.map((s) => s.history.length))
  const out: GrowthSnapshot[] = []
  for (let i = 0; i < len; i++) {
    const scores: CapabilityScores = {}
    for (const c of CAPABILITIES) {
      let sum = 0
      for (const s of withHist) sum += s.history[s.history.length - len + i].scores[c] ?? 0
      scores[c] = Math.round(sum / withHist.length)
    }
    const ref = withHist[0].history[withHist[0].history.length - len + i]
    out.push({ date: ref.date, scores })
  }
  return out
}

export const SCORE_BANDS: { label: string; min: number; max: number }[] = [
  { label: '<40', min: 0, max: 40 },
  { label: '40–55', min: 40, max: 55 },
  { label: '55–70', min: 55, max: 70 },
  { label: '70–85', min: 70, max: 85 },
  { label: '85+', min: 85, max: 101 },
]

/** Count of students falling in each score band, for a capability or overall. */
export function distribution(students: EdStudent[], capability?: string): number[] {
  const counts = SCORE_BANDS.map(() => 0)
  for (const s of students) {
    const v = capability ? (s.scores[capability] ?? 0) : overallScore(s.scores)
    const idx = SCORE_BANDS.findIndex((b) => v >= b.min && v < b.max)
    if (idx >= 0) counts[idx]++
  }
  return counts
}

export function biggestMovers(students: EdStudent[], n = 5): { student: EdStudent; growth: number }[] {
  return students
    .map((s) => ({ student: s, growth: growthSince(s) }))
    .sort((a, b) => b.growth - a.growth)
    .slice(0, n)
}

/** The cohort's weakest capabilities — where to point the next assignment. */
export function weakestCapabilities(average: CapabilityScores, n = 3): CapabilityRank[] {
  return [...CAPABILITIES]
    .map((name) => ({ name, score: average[name] ?? 0 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, n)
}

export function cohortAverageScores(students: EdStudent[]): CapabilityScores {
  const out: CapabilityScores = {}
  for (const c of CAPABILITIES) {
    out[c] = students.length
      ? Math.round(students.reduce((n, s) => n + (s.scores[c] ?? 0), 0) / students.length)
      : 0
  }
  return out
}

/* ── Completion + attention logic ─────────────────────────────────── */

export function assignmentStateFor(a: EdAssignment, studentId: string): AssignmentState {
  return a.progress.find((p) => p.studentId === studentId)?.state ?? 'not-started'
}

export function isForStudent(a: EdAssignment, studentId: string): boolean {
  return a.assignedTo === 'cohort' || a.assignedTo.includes(studentId)
}

export interface CompletionStats {
  total: number
  completed: number
  inProgress: number
  notStarted: number
  reviewed: number
  pct: number // completed+reviewed / total
  avgScore: number
}

export function completionFor(a: EdAssignment, cohort: Cohort): CompletionStats {
  const ids = a.assignedTo === 'cohort' ? cohort.studentIds : a.assignedTo
  let completed = 0, inProgress = 0, notStarted = 0, reviewed = 0, scoreSum = 0, scoreN = 0
  for (const id of ids) {
    const p = a.progress.find((x) => x.studentId === id)
    const st = p?.state ?? 'not-started'
    if (st === 'completed') completed++
    else if (st === 'reviewed') reviewed++
    else if (st === 'in-progress') inProgress++
    else notStarted++
    if (p?.score != null) { scoreSum += p.score; scoreN++ }
  }
  const total = ids.length
  const done = completed + reviewed
  return {
    total, completed, inProgress, notStarted, reviewed,
    pct: total ? Math.round((done / total) * 100) : 0,
    avgScore: scoreN ? Math.round(scoreSum / scoreN) : 0,
  }
}

export interface AttentionFlag {
  student: EdStudent
  reason: string
  tone: 'overdue' | 'stalled' | 'low' | 'declining'
}

/** Students who need a nudge, across all of a cohort's assignments. */
export function needsAttention(students: EdStudent[], assignments: EdAssignment[], nowIso: string): AttentionFlag[] {
  const now = Date.parse(nowIso)
  const flags: AttentionFlag[] = []
  for (const s of students) {
    // Overdue: an assignment due in the past, not completed.
    const overdue = assignments.find((a) =>
      isForStudent(a, s.id) && a.dueAt && Date.parse(a.dueAt) < now &&
      ['not-started', 'in-progress'].includes(assignmentStateFor(a, s.id)))
    if (overdue) { flags.push({ student: s, reason: `Overdue · ${overdue.title}`, tone: 'overdue' }); continue }
    // Stalled: in-progress but no activity in 7+ days.
    if (Date.parse(s.lastActive) < now - 7 * 864e5) {
      flags.push({ student: s, reason: 'No activity in over a week', tone: 'stalled' }); continue
    }
    // Low: overall below 50.
    if (overallScore(s.scores) < 50) {
      flags.push({ student: s, reason: `Overall ${overallScore(s.scores)} — below the bar`, tone: 'low' }); continue
    }
  }
  return flags
}

export interface StandoutFlag { student: EdStudent; reason: string }

export function standouts(students: EdStudent[], n = 4): StandoutFlag[] {
  return [...students]
    .map((s) => ({ s, growth: growthSince(s), overall: overallScore(s.scores) }))
    .sort((a, b) => (b.growth * 2 + b.overall) - (a.growth * 2 + a.overall))
    .slice(0, n)
    .map(({ s, growth, overall }) => ({
      student: s,
      reason: growth >= 6 ? `Up ${growth} pts this term` : `Strong all-round · ${overall}`,
    }))
}

/* ────────────────────────────────────────────────────────────────────
   Deterministic seed (mulberry32 PRNG — stable across reloads + SSR)
   ──────────────────────────────────────────────────────────────────── */

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST = ['Ava', 'Noah', 'Mia', 'Leo', 'Zara', 'Kai', 'Ruby', 'Finn', 'Isla', 'Omar', 'Chloe', 'Ravi', 'Freya', 'Ethan', 'Amara', 'Jack', 'Priya', 'Luca', 'Sena', 'Hana', 'Marcus', 'Tara', 'Eli', 'Nadia', 'Cody', 'Bella', 'Arjun', 'Grace']
const LAST = ['Nguyen', 'Okafor', 'Singh', 'Rossi', 'Haddad', 'Chen', 'Murphy', 'Kaur', 'Silva', 'Ahmed', 'Walsh', 'Patel', 'Kim', 'Novak', 'Diallo', 'Costa', 'Reyes', 'Fischer', 'Yılmaz', 'Brooks']

function makeStudent(rand: () => number, seq: number): EdStudent {
  const first = FIRST[Math.floor(rand() * FIRST.length)]
  const last = LAST[Math.floor(rand() * LAST.length)]
  const name = `${first} ${last}`
  // Give each student a "shape": a couple of strong capabilities, a couple weak.
  const base = 46 + rand() * 22
  const scores: CapabilityScores = {}
  const now: CapabilityScores = {}
  for (const c of CAPABILITIES) {
    const spike = rand() < 0.28 ? 16 + rand() * 22 : rand() < 0.24 ? -(10 + rand() * 20) : (rand() - 0.5) * 14
    now[c] = Math.max(28, Math.min(98, Math.round(base + spike)))
  }
  Object.assign(scores, now)
  // History: 4 snapshots trending upward toward `now`.
  const weeks = 4
  const history: GrowthSnapshot[] = []
  for (let w = weeks - 1; w >= 0; w--) {
    const snap: CapabilityScores = {}
    for (const c of CAPABILITIES) {
      const drop = w * (2 + rand() * 3) // earlier = lower
      snap[c] = Math.max(20, Math.round(now[c] - drop))
    }
    history.push({ date: new Date(Date.UTC(2026, 4, 1) + (weeks - 1 - w) * 7 * 864e5).toISOString(), scores: snap })
  }
  history[history.length - 1].scores = now // last snapshot === current

  // Badges from the profile.
  const badges: string[] = ['first-steps']
  if (growthOf(history) >= 8) badges.push('rising-star')
  if (CAPABILITIES.every((c) => now[c] > 60)) badges.push('all-rounder')
  if ((now['Reasoning & Critical Thinking'] ?? 0) > 85) badges.push('deep-thinker')
  if ((now['Collaboration'] ?? 0) > 85) badges.push('team-player')
  if ((now['Integrity & Ethics'] ?? 0) > 85) badges.push('principled')
  const streak = Math.floor(rand() * 5)
  if (streak >= 3) badges.push('consistent')

  const daysAgo = Math.floor(rand() * rand() * 16) // weighted recent, some stale
  return {
    id: `ed${seq}`,
    name,
    email: `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, '')}@student.edu`,
    initials: (first[0] + last[0]).toUpperCase(),
    scores,
    history,
    streakWeeks: streak,
    badges,
    lastActive: new Date(Date.UTC(2026, 6, 10) - daysAgo * 864e5).toISOString(),
  }
}

function growthOf(history: GrowthSnapshot[]): number {
  if (history.length < 2) return 0
  const f = history[0].scores, l = history[history.length - 1].scores
  let d = 0
  for (const c of CAPABILITIES) d += Math.max(0, (l[c] ?? 0) - (f[c] ?? 0))
  return Math.round(d / CAPABILITIES.length)
}

/** Shareable cohort join code, e.g. "CLASS-K7P2QX" (no ambiguous chars). */
export function generateClassCodeLike(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return `CLASS-${out}`
}

/** Scenarios an advisor can assign. Preview-able (mins + decisions shown). */
export const ASSIGNABLE_SCENARIOS: { id: string; title: string; emoji: string; capabilities: string[]; blurb: string; decisions: number; mins: number }[] = [
  { id: 'sc-startup', title: 'Startup Founder', emoji: '🚀', capabilities: ['Adaptability & Cognitive Flexibility', 'Execution & Ownership', 'Leadership & Influence'], blurb: 'Runway is short and the team disagrees. Where do you place your bets?', decisions: 6, mins: 12 },
  { id: 'sc-newsroom', title: 'Newsroom Editor', emoji: '📰', capabilities: ['Judgement & Decision-Making', 'Integrity & Ethics', 'Situational Awareness & Systems Thinking'], blurb: 'A story could break big — or burn a source. Publish or hold?', decisions: 6, mins: 12 },
  { id: 'sc-er', title: 'ER Resident', emoji: '🩺', capabilities: ['Emotional Intelligence', 'Execution & Ownership', 'Judgement & Decision-Making'], blurb: 'Two patients, one you. Triage under pressure.', decisions: 7, mins: 14 },
  { id: 'sc-retail', title: 'Store Lead', emoji: '🛍️', capabilities: ['Collaboration', 'Leadership & Influence', 'Problem Solving'], blurb: 'A no-show, a queue, and a angry regular. Hold the floor.', decisions: 5, mins: 10 },
  { id: 'sc-coach', title: 'Team Coach', emoji: '🏀', capabilities: ['Leadership & Influence', 'Emotional Intelligence', 'Judgement & Decision-Making'], blurb: 'Down by two, star player rattled. Call the play.', decisions: 6, mins: 11 },
  { id: 'sc-policy', title: 'Policy Advisor', emoji: '🏛️', capabilities: ['Situational Awareness & Systems Thinking', 'Integrity & Ethics', 'Reasoning & Critical Thinking'], blurb: 'The popular option isn’t the right one. Advise the minister.', decisions: 6, mins: 13 },
]

/** Create a lightweight student from a name/email (CSV/paste import). Neutral
 *  starting profile so the heatmap has something to show; the real platform
 *  populates scores from actual plays. */
export function makePlaceholderStudent(name: string, email: string, idSeq: number): EdStudent {
  const parts = name.trim().split(/\s+/)
  const initials = ((parts[0]?.[0] || '') + (parts[1]?.[0] || parts[0]?.[1] || '')).toUpperCase()
  const scores: CapabilityScores = {}
  for (const c of CAPABILITIES) scores[c] = 50
  return {
    id: `edn${idSeq}-${Date.now().toString(36)}`,
    name: name.trim(),
    email: email.trim() || `${(parts[0] || 'student').toLowerCase()}@student.edu`,
    initials: initials || 'ST',
    scores,
    history: [{ date: new Date().toISOString(), scores: { ...scores } }],
    streakWeeks: 0,
    badges: [],
    lastActive: new Date().toISOString(),
  }
}

export interface EducatorSeed {
  students: EdStudent[]
  cohorts: Cohort[]
  assignments: EdAssignment[]
  subjects: SubjectProfile[]
}

const COHORT_DEFS = [
  { id: 'co-2026grads', name: '2026 Graduates', term: 'Semester 2 · 2026', code: 'GRAD26', size: 24 },
  { id: 'co-yr12biz', name: 'Year 12 Business', term: 'Term 3', code: 'BIZ12A', size: 22 },
  { id: 'co-employability', name: 'Employability Program', term: 'Rolling intake', code: 'EMPLOY', size: 18 },
]

const SCEN_LIB = [
  { id: 'sc-startup', title: 'Startup Founder', caps: ['Adaptability & Cognitive Flexibility', 'Execution & Ownership', 'Leadership & Influence'] },
  { id: 'sc-newsroom', title: 'Newsroom Editor', caps: ['Judgement & Decision-Making', 'Integrity & Ethics', 'Situational Awareness & Systems Thinking'] },
  { id: 'sc-er', title: 'ER Resident', caps: ['Emotional Intelligence', 'Execution & Ownership', 'Judgement & Decision-Making'] },
  { id: 'sc-retail', title: 'Store Lead', caps: ['Collaboration', 'Leadership & Influence', 'Problem Solving'] },
]

export function buildEducatorSeed(): EducatorSeed {
  const rand = mulberry32(20260710)
  const students: EdStudent[] = []
  const cohorts: Cohort[] = []
  const assignments: EdAssignment[] = []
  let seq = 1

  COHORT_DEFS.forEach((def, ci) => {
    const ids: string[] = []
    for (let i = 0; i < def.size; i++) {
      const s = makeStudent(rand, seq++)
      students.push(s)
      ids.push(s.id)
    }
    cohorts.push({
      id: def.id,
      name: def.name,
      code: `CLASS-${def.code}`,
      term: def.term,
      studentIds: ids,
      createdAt: new Date(Date.UTC(2026, 4, 5 + ci)).toISOString(),
    })

    // 2–3 assignments per cohort with mixed progress + one overdue.
    const nAssign = 2 + (ci % 2)
    for (let a = 0; a < nAssign; a++) {
      const scen = SCEN_LIB[(ci + a) % SCEN_LIB.length]
      const dueOffset = a === 0 ? -3 : 6 + a * 4 // first is overdue
      const progress: AssignmentProgress[] = ids.map((id) => {
        const r = rand()
        let state: AssignmentState = 'not-started'
        if (r > 0.82) state = 'reviewed'
        else if (r > 0.5) state = 'completed'
        else if (r > 0.3) state = 'in-progress'
        const done = state === 'completed' || state === 'reviewed'
        return {
          studentId: id,
          state,
          score: done ? 52 + Math.floor(rand() * 44) : undefined,
          completedAt: done ? new Date(Date.UTC(2026, 6, 1 + Math.floor(rand() * 8))).toISOString() : undefined,
        }
      })
      assignments.push({
        id: `as-${def.id}-${a}`,
        cohortId: def.id,
        title: scen.title,
        capabilities: scen.caps,
        assignedTo: 'cohort',
        dueAt: new Date(Date.UTC(2026, 6, 10) + dueOffset * 864e5).toISOString(),
        opensAt: new Date(Date.UTC(2026, 5, 20 + a)).toISOString(),
        createdAt: new Date(Date.UTC(2026, 5, 18 + a)).toISOString(),
        progress,
      })
    }
  })

  // Subjects start from the templates (deep-copied, no longer flagged template).
  const subjects: SubjectProfile[] = SUBJECT_TEMPLATES.slice(0, 4).map((t) => ({ ...t, isTemplate: false }))

  return { students, cohorts, assignments, subjects }
}

/* ────────────────────────────────────────────────────────────────────
   CSV export (cohort gradebook)
   ──────────────────────────────────────────────────────────────────── */

function csvCell(v: string | number | undefined): string {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function cohortCsv(cohort: Cohort, students: EdStudent[]): string {
  const header = ['Student', 'Email', 'Overall', 'Growth', 'Streak (wks)', ...CAPABILITIES.map((c) => CAPABILITY_SHORT[c])]
  const rows = students.map((s) => [
    s.name, s.email, overallScore(s.scores), growthSince(s), s.streakWeeks,
    ...CAPABILITIES.map((c) => s.scores[c] ?? 0),
  ])
  const meta = [
    ['Cohort', cohort.name],
    ['Term', cohort.term],
    ['Join code', cohort.code],
    ['Exported', new Date().toLocaleString()],
    ['Students', String(students.length)],
  ]
  return [
    ...meta.map((r) => r.map(csvCell).join(',')),
    '',
    header.map(csvCell).join(','),
    ...rows.map((r) => r.map(csvCell).join(',')),
    '',
  ].join('\n')
}

export function downloadText(filename: string, text: string, mime = 'text/csv;charset=utf-8'): void {
  if (typeof window === 'undefined') return
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Score → warm heat colour (teal ramp). Used by the heatmap + bars. */
export function heatColor(score: number): string {
  // 28..98 mapped onto a cream→teal ramp.
  const t = Math.max(0, Math.min(1, (score - 30) / 60))
  // interpolate between soft cream and deep teal
  const from = [244, 240, 230] // #f4f0e6
  const to = [18, 107, 96]     // #126b60
  const c = from.map((f, i) => Math.round(f + (to[i] - f) * t))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

/** Whether heat cell text should be light (dark bg) or dark. */
export function heatTextLight(score: number): boolean {
  return score >= 62
}
