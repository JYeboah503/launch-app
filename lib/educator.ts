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

/** SAM = the student access section's three entry modes: a pre-existing
 *  journey, a guided start, or a create-your-own adventure. */
export type SamOrigin = 'journey' | 'guided' | 'own'

export const SAM_LABEL: Record<SamOrigin, string> = {
  journey: 'Journey',
  guided: 'Guided start',
  own: 'Own adventure',
}

/** One decision inside a completed scenario — drives the decision-path view. */
export interface DecisionStep {
  prompt: string
  options: { id: string; label: string; picked: boolean }[]
  /** Capability this step tested. */
  skill?: string
}

/** A scenario/journey a student has completed, with how they got in (SAM
 *  origin) and the path they took through it. */
export interface ScenarioRun {
  id: string
  title: string
  emoji?: string
  origin: SamOrigin
  completedAt: string // ISO
  score?: number
  capabilities: string[]
  decisions: DecisionStep[]
}

/** A small group inside a cohort — for targeted practice. */
export interface StudentGroup {
  id: string
  name: string
  studentIds: string[]
  createdAt: string
}

export const YEAR_GROUPS = [12, 11, 10] as const

/** University years of study — 4 = Honours. */
export const UNI_YEARS = [1, 2, 3, 4] as const
export const UNI_YEAR_LABEL: Record<number, string> = { 1: '1st year', 2: '2nd year', 3: '3rd year', 4: 'Honours' }

export interface EdStudent {
  id: string
  name: string
  email: string
  initials: string
  /** School: year group (10/11/12). University: year of study (1/2/3, 4 = Honours). */
  yearGroup: number
  /** University only — the degree, e.g. "B. Commerce (Property)". */
  course?: string
  /** University only — stated career interest, e.g. "Project Management". */
  careerInterest?: string
  /** Total time on Launch, in hours (one decimal). */
  totalUseHours: number
  parentName: string
  parentEmail: string
  /** Current capability scores (0..100). */
  scores: CapabilityScores
  /** Time-ordered snapshots (oldest → newest); last === current. */
  history: GrowthSnapshot[]
  /** Consecutive weeks with activity. */
  streakWeeks: number
  /** Earned badge ids (see BADGES). */
  badges: string[]
  lastActive: string // ISO
  /** Completed scenarios with SAM origin + decision path. NOT persisted —
   *  regenerated deterministically on load (keeps localStorage small). */
  scenarioHistory?: ScenarioRun[]
  /** True for the real same-browser student who joined via class code —
   *  their drill-in reads live localStorage data instead of seeded numbers. */
  isLive?: boolean
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
  /** Display tag when the assignment was created via a group. */
  groupName?: string
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
  /** Small groups inside the class, for targeted practice. */
  groups?: StudentGroup[]
  /** Set when the advisor archives the class — hidden from active views,
   *  restorable from the Classes page's archive. */
  archivedAt?: string
  createdAt: string
}

/** Advisor-set target score — shared by the heatmap outline + radar ring. */
export const ADVISOR_TARGET = 70

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

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST = ['Ava', 'Noah', 'Mia', 'Leo', 'Zara', 'Kai', 'Ruby', 'Finn', 'Isla', 'Omar', 'Chloe', 'Ravi', 'Freya', 'Ethan', 'Amara', 'Jack', 'Priya', 'Luca', 'Sena', 'Hana', 'Marcus', 'Tara', 'Eli', 'Nadia', 'Cody', 'Bella', 'Arjun', 'Grace', 'Theo', 'Willow', 'Hugo', 'Matilda', 'Oscar', 'Evie', 'Felix', 'Harper']
const LAST = ['Nguyen', 'Okafor', 'Singh', 'Rossi', 'Haddad', 'Chen', 'Murphy', 'Kaur', 'Silva', 'Ahmed', 'Walsh', 'Patel', 'Kim', 'Novak', 'Diallo', 'Costa', 'Reyes', 'Fischer', 'Yılmaz', 'Brooks', 'Tran', 'Papadopoulos', 'Ricci', 'Dubois', 'Mensah', 'Olsen', 'Barnes', 'Khan']
const PARENT_FIRST = ['Sam', 'Jess', 'Michael', 'Linh', 'Amira', 'David', 'Maria', 'Tom', 'Grace', 'Peter', 'Anita', 'Rob', 'Helen', 'Daniel', 'Yuki', 'Claire']

/** University degrees + the career interests students declare. */
export const UNI_COURSES = [
  'B. Commerce (Property)', 'B. Commerce (Finance)', 'B. Business (Management)',
  'B. Engineering (Civil)', 'B. Construction Management', 'B. Laws',
  'B. Communications (Marketing)', 'B. Computer Science', 'B. Economics', 'B. Nursing',
]
export const UNI_INTERESTS = [
  'Property & Funds Management', 'Project Management', 'Consulting', 'Investment Banking',
  'Marketing & Brand', 'Software Engineering', 'Construction', 'Public Policy',
  'Health Management', 'Entrepreneurship',
]

function makeStudent(rand: () => number, seq: number, yearGroup: number, uni = false): EdStudent {
  const first = FIRST[Math.floor(rand() * FIRST.length)]
  const last = LAST[Math.floor(rand() * LAST.length)]
  const name = `${first} ${last}`
  const parentFirst = PARENT_FIRST[Math.floor(rand() * PARENT_FIRST.length)]
  // Course and interest correlate (same index band) — property students
  // want property careers more often than not.
  const courseIdx = Math.floor(rand() * UNI_COURSES.length)
  const interestIdx = rand() < 0.6 ? courseIdx : Math.floor(rand() * UNI_INTERESTS.length)
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
  // scenarioHistory is generated lazily when a profile opens (deterministic
  // per id) — keeps a 2,500-student university roster instant to build.

  const lastClean = last.toLowerCase().replace(/[^a-z]/g, '')
  return {
    id: `${uni ? 'uni' : 'ed'}${seq}`,
    name,
    email: `${first.toLowerCase()}.${lastClean}${seq}@${uni ? 'uni.edu' : 'student.edu'}`,
    initials: (first[0] + last[0]).toUpperCase(),
    yearGroup,
    ...(uni ? { course: UNI_COURSES[courseIdx], careerInterest: UNI_INTERESTS[interestIdx] } : {}),
    // Skewed towards a few hours; the keen ones rack up 30+.
    totalUseHours: Math.round((2 + rand() * rand() * 38) * 10) / 10,
    parentName: uni ? '' : `${parentFirst} ${last}`,
    parentEmail: uni ? '' : `${parentFirst.toLowerCase()}.${lastClean}@familymail.com`,
    scores,
    history,
    streakWeeks: streak,
    badges,
    lastActive: new Date(Date.UTC(2026, 6, 10) - daysAgo * 864e5).toISOString(),
  }
}

/** 1–3 completed scenarios with a SAM origin and a decision path. Strong
 *  students pick the strongest option (index 0) more often — plausible
 *  paths. Shared by the seed and the old-save backfill (PRNG-driven so
 *  both stay deterministic). */
export function generateScenarioHistory(
  rand: () => number,
  scores: CapabilityScores,
  seqKey: string,
  bank: typeof DECISION_BANK = DECISION_BANK,
  scenarios: typeof ASSIGNABLE_SCENARIOS = ASSIGNABLE_SCENARIOS,
): ScenarioRun[] {
  const scenIds = Object.keys(bank)
  const nRuns = 1 + Math.floor(rand() * 3)
  const out: ScenarioRun[] = []
  const used = new Set<number>()
  for (let r = 0; r < nRuns; r++) {
    let si = Math.floor(rand() * scenIds.length)
    if (used.has(si)) si = (si + 1 + Math.floor(rand() * (scenIds.length - 1))) % scenIds.length
    used.add(si)
    const scen = scenarios.find((s) => s.id === scenIds[si])!
    const o = rand()
    const origin: SamOrigin = o < 0.5 ? 'journey' : o < 0.8 ? 'guided' : 'own'
    const decisions: DecisionStep[] = bank[scen.id].map((step, di) => {
      const skillScore = scores[step.skill] ?? 55
      const pickedIdx = rand() * 100 < skillScore ? 0 : rand() < 0.6 ? 1 : 2
      return {
        prompt: step.prompt,
        skill: step.skill,
        options: step.options.map((label, oi) => ({ id: `${scen.id}-${di}-${oi}`, label, picked: oi === pickedIdx })),
      }
    })
    const pickedStrong = decisions.filter((d) => d.options[0].picked).length
    out.push({
      id: `run-${seqKey}-${r}`,
      title: scen.title,
      emoji: scen.emoji,
      origin,
      completedAt: new Date(Date.UTC(2026, 4, 3) + Math.floor(rand() * 60) * 864e5).toISOString(),
      score: Math.min(98, 40 + Math.round((pickedStrong / decisions.length) * 45 + rand() * 12)),
      capabilities: scen.capabilities,
      decisions,
    })
  }
  out.sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt))
  return out
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

/** Decision steps per assignable scenario — powers each seeded student's
 *  "decision path". Option [0] is the strongest call by convention; the
 *  seed picks it more often for students who score high on that skill. */
export const DECISION_BANK: Record<string, { prompt: string; options: [string, string, string]; skill: string }[]> = {
  'sc-startup': [
    { prompt: 'Runway is four months. The team wants to build; the board wants revenue.', options: ['Cut one bet, double the one with paying users', 'Split effort evenly and extend runway with a bridge', 'Build the big vision — revenue follows product'], skill: 'Judgement & Decision-Making' },
    { prompt: 'Your best engineer threatens to quit over the pivot.', options: ['Hear them out, then give them the hardest problem in the new direction', 'Promise the old project returns next quarter', 'Accept the resignation — the pivot matters more'], skill: 'Leadership & Influence' },
    { prompt: 'A competitor ships your exact roadmap, two months early.', options: ['Narrow to the niche they can’t serve and own it', 'Race them feature-for-feature', 'Pivot again before anyone notices'], skill: 'Adaptability & Cognitive Flexibility' },
    { prompt: 'Demo day is Friday. The product has a known bug in one flow.', options: ['Demo the honest build and name the bug before they find it', 'Script the demo around the bug', 'Pull an all-nighter team-wide to patch it'], skill: 'Execution & Ownership' },
  ],
  'sc-newsroom': [
    { prompt: 'The leak is explosive — and burning the source is a real risk.', options: ['Hold 24 hours to verify twice and protect the source', 'Publish now — first matters', 'Pass it to a bigger outlet and keep your hands clean'], skill: 'Integrity & Ethics' },
    { prompt: 'A second source confirms, but only off the record.', options: ['Publish with documents, keep both sources unnamed', 'Push the second source to go on record', 'Wait for an on-record confirmation'], skill: 'Judgement & Decision-Making' },
    { prompt: 'The subject’s lawyers call an hour before you go live.', options: ['Give them a fair right of reply and a hard deadline', 'Go live first, add their statement after', 'Delay the story for legal review'], skill: 'Situational Awareness & Systems Thinking' },
  ],
  'sc-er': [
    { prompt: 'Two patients arrive together — chest pain and a pale, quiet teenager.', options: ['Triage the quiet one first — silence can be the louder symptom', 'Chest pain takes priority, always', 'Split yourself between both beds'], skill: 'Judgement & Decision-Making' },
    { prompt: 'The chest-pain patient’s family is shouting for attention.', options: ['Send a nurse with a clear update and a named time you’ll return', 'Stop and manage the family yourself', 'Have security move them to the waiting room'], skill: 'Emotional Intelligence' },
    { prompt: 'Test results are delayed and the ward is stacking up.', options: ['Treat on clinical signs and document your reasoning', 'Wait — results are results', 'Escalate to the consultant and keep moving'], skill: 'Execution & Ownership' },
  ],
  'sc-retail': [
    { prompt: 'A no-show leaves you two staff short on the busiest morning.', options: ['Re-plan the floor around the queue, drop everything non-urgent', 'Call the area manager for cover', 'Run it as rostered and absorb the wait times'], skill: 'Problem Solving' },
    { prompt: 'An angry regular wants a refund outside policy, loudly.', options: ['Take it off the floor, listen, and find the inside-policy fix', 'Refund it — the queue matters more than the policy', 'Hold the policy line at the counter'], skill: 'Leadership & Influence' },
    { prompt: 'Your newest hire freezes mid-rush.', options: ['Pair them with your calmest senior and shrink their job to one task', 'Send them to the stockroom till it quietens', 'Talk them through it between customers'], skill: 'Collaboration' },
  ],
  'sc-coach': [
    { prompt: 'Down two with ninety seconds left. Your star wants the ball; she’s rattled.', options: ['Run the play through her as a decoy — touch without pressure', 'Give her the ball — stars are stars', 'Bench her for the closer head'], skill: 'Judgement & Decision-Making' },
    { prompt: 'The bench is flat and the huddle can feel it.', options: ['Name the next play and one job each — certainty beats speeches', 'Fire them up with everything you’ve got', 'Let the captain run the huddle'], skill: 'Leadership & Influence' },
    { prompt: 'The ref misses a clear call against you.', options: ['Play on — the next possession is the only one you control', 'Burn a timeout to contest it', 'Let the crowd and bench voice it'], skill: 'Emotional Intelligence' },
  ],
  'sc-policy': [
    { prompt: 'The popular option polls at 70% — and the modelling says it fails in two years.', options: ['Brief the minister on both, lead with the evidence', 'Recommend the popular option with mitigations', 'Soften the modelling’s language to keep options open'], skill: 'Integrity & Ethics' },
    { prompt: 'A lobby group offers "supporting research" that matches their interests.', options: ['Accept it, disclose the source, and weight it accordingly', 'Decline it to stay clean', 'Use it — evidence is evidence'], skill: 'Reasoning & Critical Thinking' },
    { prompt: 'The minister asks what the headline will be either way.', options: ['Map both second-order effects honestly, including the ugly one', 'Focus the brief on the preferred option’s upside', 'Recommend delaying the decision past the news cycle'], skill: 'Situational Awareness & Systems Thinking' },
  ],
}

/* ────────────────────────────────────────────────────────────────────
   University mode — internship/graduate scenarios at real employers,
   their decision banks, packs and course templates.
   ──────────────────────────────────────────────────────────────────── */

export const UNI_ASSIGNABLE_SCENARIOS: typeof ASSIGNABLE_SCENARIOS = [
  { id: 'sc-charterhall', title: 'Property Internship — Charter Hall', emoji: '🏢', capabilities: ['Judgement & Decision-Making', 'Situational Awareness & Systems Thinking', 'Execution & Ownership'], blurb: 'Six weeks on a funds-management team. The asset review lands on your desk first.', decisions: 6, mins: 13 },
  { id: 'sc-lendlease', title: 'Assistant Project Manager — Lendlease', emoji: '🏗️', capabilities: ['Execution & Ownership', 'Collaboration', 'Problem Solving'], blurb: 'A tower build, a slipping program, and a subcontractor meeting in an hour.', decisions: 6, mins: 12 },
  { id: 'sc-deloitte', title: 'Graduate Consultant — Deloitte', emoji: '📊', capabilities: ['Reasoning & Critical Thinking', 'Problem Solving', 'Leadership & Influence'], blurb: 'The client wants an answer by Friday. The data says something nobody wants to hear.', decisions: 6, mins: 12 },
  { id: 'sc-macquarie', title: 'Analyst Intern — Macquarie', emoji: '📈', capabilities: ['Judgement & Decision-Making', 'Reasoning & Critical Thinking', 'Integrity & Ethics'], blurb: 'Your model disagrees with the director’s instinct. The meeting is at nine.', decisions: 5, mins: 11 },
  { id: 'sc-canva', title: 'Marketing Intern — Canva', emoji: '✨', capabilities: ['Adaptability & Cognitive Flexibility', 'Emotional Intelligence', 'Collaboration'], blurb: 'A campaign flops at launch. You’re closest to the data — and to the fix.', decisions: 5, mins: 10 },
  { id: 'sc-johnholland', title: 'Site Engineer Intern — John Holland', emoji: '⚙️', capabilities: ['Situational Awareness & Systems Thinking', 'Execution & Ownership', 'Integrity & Ethics'], blurb: 'A pour is booked, the inspection isn’t signed, and the forecast says rain.', decisions: 6, mins: 13 },
]

export const UNI_DECISION_BANK: typeof DECISION_BANK = {
  'sc-charterhall': [
    { prompt: 'Week one: the quarterly asset review needs a first pass, and the analyst who owns it is out.', options: ['Build the pass from last quarter’s template and flag every assumption you inherited', 'Wait for the analyst — it’s their model', 'Ask the fund manager to walk you through it live'], skill: 'Execution & Ownership' },
    { prompt: 'A tenant covenant looks weaker than the file suggests.', options: ['Pull the tenant’s latest filings and put the gap in writing before the meeting', 'Mention it verbally if it comes up', 'Assume the original underwriting caught it'], skill: 'Judgement & Decision-Making' },
    { prompt: 'The portfolio lead asks what you’d watch over the next two quarters.', options: ['Name the two assets where small signals compound — and what would change your mind', 'Recite the portfolio summary', 'Defer — you’re six weeks in'], skill: 'Situational Awareness & Systems Thinking' },
  ],
  'sc-lendlease': [
    { prompt: 'The program has slipped nine days and the subcontractor meeting starts in an hour.', options: ['Re-sequence the critical path first, then negotiate from a plan', 'Open the meeting by asking the sub to explain the slip', 'Escalate to the PM before doing anything'], skill: 'Problem Solving' },
    { prompt: 'Two trades both claim the same zone next week.', options: ['Walk the zone with both foremen and lock a shared sequence on the spot', 'Give it to the trade that’s behind', 'Let the site manager sort it'], skill: 'Collaboration' },
    { prompt: 'Your daily report could gloss the slip — the PM is already having a bad week.', options: ['Report it straight, with the recovery plan attached', 'Soften it to "minor sequencing adjustments"', 'Hold it a day to see if the gap closes'], skill: 'Execution & Ownership' },
  ],
  'sc-deloitte': [
    { prompt: 'The analysis says the client’s flagship product is the problem. Your manager hints at softening it.', options: ['Keep the finding, reframe the delivery around what the client can do next', 'Soften it — relationships fund the next engagement', 'Push it to the appendix'], skill: 'Reasoning & Critical Thinking' },
    { prompt: 'Half the data the client sent contradicts itself.', options: ['Reconcile the two sources and document which you trusted and why', 'Use the friendlier dataset', 'Ask the client which one they prefer'], skill: 'Problem Solving' },
    { prompt: 'The partner asks you — the grad — to open the readout.', options: ['Take it: one slide, one message, rehearsed twice in the corridor', 'Defer to the manager', 'Read the executive summary verbatim'], skill: 'Leadership & Influence' },
  ],
  'sc-macquarie': [
    { prompt: 'Your model says the deal underperforms. The director’s instinct says otherwise, loudly.', options: ['Present the model AND the three assumptions that would have to break for the director to be right', 'Adjust the assumptions until the output agrees', 'Send the model by email and skip the meeting'], skill: 'Integrity & Ethics' },
    { prompt: 'You find an error in your own work from last week — already circulated.', options: ['Correct it the same day, with a one-line note on what changed', 'Fix it quietly in the next version', 'It’s immaterial — leave it'], skill: 'Judgement & Decision-Making' },
    { prompt: 'Two hours before the meeting, new market data lands.', options: ['Re-run the sensitive cases only and annotate what moved', 'Rebuild everything and risk being late', 'Present the stale version — it was approved'], skill: 'Reasoning & Critical Thinking' },
  ],
  'sc-canva': [
    { prompt: 'The launch campaign is underperforming by 60% at day two.', options: ['Pull the cohort data, find where the funnel dies, and propose one change by lunch', 'Give it a week — campaigns need time', 'Recommend pausing all spend'], skill: 'Adaptability & Cognitive Flexibility' },
    { prompt: 'The designer whose hero asset underperformed is visibly deflated in the retro.', options: ['Separate the asset from the author — show the data killed the placement, not the design', 'Move past it quickly to spare them', 'Suggest a different designer next time'], skill: 'Emotional Intelligence' },
    { prompt: 'Your fix needs engineering time nobody budgeted.', options: ['Trade scope with the sprint lead: your change in, one low-impact ticket out', 'Ask your manager to escalate', 'Ship a manual workaround and log the debt'], skill: 'Collaboration' },
  ],
  'sc-johnholland': [
    { prompt: 'The concrete pour is booked for 6am; the inspection sign-off hasn’t landed.', options: ['Chase the certifier tonight and prep a hold-point plan if it slips', 'Pour anyway — the inspector "always signs"', 'Cancel the pour now and wear the cost'], skill: 'Integrity & Ethics' },
    { prompt: 'The forecast turns: 20mm possible from 10am.', options: ['Re-sequence to pour the critical section first, covers staged on standby', 'Trust the radar and run the full pour', 'Postpone everything 48 hours'], skill: 'Situational Awareness & Systems Thinking' },
    { prompt: 'The foreman says your staging plan "isn’t how we do it".', options: ['Walk it with him — adopt what he improves, keep what the plan protects', 'Defer entirely to experience', 'Pull rank via the site engineer'], skill: 'Execution & Ownership' },
  ],
}

export const UNI_GENERAL_PACKS: typeof GENERAL_PACKS = [
  { id: 'pack-intern', name: 'Internship Ready', emoji: '💼', blurb: 'Three placements — property, construction and brand — before the real applications open.', scenarioIds: ['sc-charterhall', 'sc-lendlease', 'sc-canva'] },
  { id: 'pack-grad', name: 'Graduate Programs', emoji: '🎓', blurb: 'The big-firm gauntlet: consulting, banking and tier-one construction.', scenarioIds: ['sc-deloitte', 'sc-macquarie', 'sc-johnholland'] },
  { id: 'pack-property', name: 'Property Track', emoji: '🏢', blurb: 'Funds management to the site gate — the full property pathway.', scenarioIds: ['sc-charterhall', 'sc-lendlease', 'sc-johnholland'] },
]

export const UNI_SUBJECT_TEMPLATES: SubjectProfile[] = [
  { id: 'usub-property', name: 'Property & Development', emoji: '🏢', attributes: ['Judgement & Decision-Making', 'Situational Awareness & Systems Thinking', 'Execution & Ownership'], isTemplate: true },
  { id: 'usub-finance', name: 'Finance & Investment', emoji: '📈', attributes: ['Reasoning & Critical Thinking', 'Judgement & Decision-Making', 'Integrity & Ethics'], isTemplate: true },
  { id: 'usub-consulting', name: 'Consulting & Strategy', emoji: '📊', attributes: ['Problem Solving', 'Reasoning & Critical Thinking', 'Leadership & Influence'], isTemplate: true },
  { id: 'usub-construction', name: 'Construction & PM', emoji: '🏗️', attributes: ['Execution & Ownership', 'Situational Awareness & Systems Thinking', 'Collaboration'], isTemplate: true },
  { id: 'usub-marketing', name: 'Marketing & Brand', emoji: '✨', attributes: ['Adaptability & Cognitive Flexibility', 'Emotional Intelligence', 'Collaboration'], isTemplate: true },
  { id: 'usub-law', name: 'Law & Compliance', emoji: '⚖️', attributes: ['Reasoning & Critical Thinking', 'Integrity & Ethics', 'Situational Awareness & Systems Thinking'], isTemplate: true },
  { id: 'usub-tech', name: 'Data & Software', emoji: '💻', attributes: ['Problem Solving', 'Reasoning & Critical Thinking', 'Execution & Ownership'], isTemplate: true },
  { id: 'usub-people', name: 'People & Organisations', emoji: '🧭', attributes: ['Emotional Intelligence', 'Leadership & Influence', 'Collaboration'], isTemplate: true },
]

/** Curated scenario packs for the "General practice" purpose — assigned as
 *  one bundle (one assignment per scenario), scores roll up per cohort. */
export const GENERAL_PACKS: { id: string; name: string; emoji: string; blurb: string; scenarioIds: string[] }[] = [
  { id: 'pack-starter', name: 'Starter Five', emoji: '🌱', blurb: 'A broad first workout — five scenarios covering all ten capabilities.', scenarioIds: ['sc-startup', 'sc-retail', 'sc-coach', 'sc-newsroom', 'sc-er'] },
  { id: 'pack-judgement', name: 'Judgement & Ethics', emoji: '⚖️', blurb: 'Pressure-test how they decide when the right call isn’t the easy one.', scenarioIds: ['sc-newsroom', 'sc-policy', 'sc-er'] },
  { id: 'pack-people', name: 'Leading People', emoji: '🧭', blurb: 'Influence, collaboration, and holding a room together.', scenarioIds: ['sc-coach', 'sc-retail', 'sc-startup'] },
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
    yearGroup: 12,
    totalUseHours: 0,
    parentName: '',
    parentEmail: '',
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

/** Whole-school roster sizes — ~300 students across the senior years. */
const YEAR_SIZES: { year: number; size: number }[] = [
  { year: 12, size: 104 },
  { year: 11, size: 102 },
  { year: 10, size: 96 },
]

const COHORT_DEFS = [
  { id: 'co-2026grads', name: '2026 Graduates', term: 'Semester 2 · 2026', code: 'GRAD26', year: 12, size: 24 },
  { id: 'co-yr12biz', name: 'Year 12 Business', term: 'Term 3', code: 'BIZ12A', year: 12, size: 22 },
  { id: 'co-employability', name: 'Employability Program', term: 'Rolling intake', code: 'EMPLOY', year: 11, size: 18 },
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

  // The whole-school roster first — every Year 10–12 student, enrolled on
  // Launch whether or not an advisor has put them in a class yet.
  for (const { year, size } of YEAR_SIZES) {
    for (let i = 0; i < size; i++) students.push(makeStudent(rand, seq++, year))
  }
  // Classes draw their rosters from the school roster, per year group.
  const cursorByYear: Record<number, number> = {}

  COHORT_DEFS.forEach((def, ci) => {
    const pool = students.filter((s) => s.yearGroup === def.year)
    const start = cursorByYear[def.year] ?? 0
    const ids = pool.slice(start, start + def.size).map((s) => s.id)
    cursorByYear[def.year] = start + def.size
    // The flagship cohort ships with two sample groups so the Groups tab
    // demos itself on first open.
    const groups: StudentGroup[] =
      def.id === 'co-2026grads'
        ? [
            { id: 'grp-stretch', name: 'Stretch squad', studentIds: ids.slice(0, 5), createdAt: new Date(Date.UTC(2026, 5, 2)).toISOString() },
            { id: 'grp-confidence', name: 'Confidence builders', studentIds: ids.slice(5, 11), createdAt: new Date(Date.UTC(2026, 5, 9)).toISOString() },
          ]
        : []
    cohorts.push({
      id: def.id,
      name: def.name,
      code: `CLASS-${def.code}`,
      term: def.term,
      studentIds: ids,
      groups,
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
   University seed — ~2,500 students across 1st–3rd year + Honours, with
   degrees and career interests; units (classes) drawn per year; seeded
   assignments use the internship scenario library.
   ──────────────────────────────────────────────────────────────────── */

const UNI_YEAR_SIZES: { year: number; size: number }[] = [
  { year: 1, size: 940 },
  { year: 2, size: 860 },
  { year: 3, size: 590 },
  { year: 4, size: 130 }, // Honours
]

const UNI_COHORT_DEFS = [
  { id: 'uco-prop301', name: 'PROP301 Property Development', term: 'Spring session · 2026', code: 'PROP3A', year: 3, size: 34 },
  { id: 'uco-mgmt201', name: 'MGMT201 Managing People', term: 'Spring session · 2026', code: 'MGMT2B', year: 2, size: 38 },
  { id: 'uco-careers', name: 'Careers Accelerator — Internship Ready', term: 'Rolling intake', code: 'ACCEL1', year: 3, size: 26 },
]

export function buildUniversitySeed(): EducatorSeed {
  const rand = mulberry32(20261103)
  const students: EdStudent[] = []
  const cohorts: Cohort[] = []
  const assignments: EdAssignment[] = []
  let seq = 1

  for (const { year, size } of UNI_YEAR_SIZES) {
    for (let i = 0; i < size; i++) students.push(makeStudent(rand, seq++, year, true))
  }
  const cursorByYear: Record<number, number> = {}

  UNI_COHORT_DEFS.forEach((def, ci) => {
    const pool = students.filter((s) => s.yearGroup === def.year)
    const start = cursorByYear[def.year] ?? 0
    const ids = pool.slice(start, start + def.size).map((s) => s.id)
    cursorByYear[def.year] = start + def.size
    const groups: StudentGroup[] =
      def.id === 'uco-prop301'
        ? [
            { id: 'ugrp-ch', name: 'Charter Hall applicants', studentIds: ids.slice(0, 6), createdAt: new Date(Date.UTC(2026, 5, 2)).toISOString() },
            { id: 'ugrp-site', name: 'Site visit crew', studentIds: ids.slice(6, 13), createdAt: new Date(Date.UTC(2026, 5, 9)).toISOString() },
          ]
        : []
    cohorts.push({
      id: def.id,
      name: def.name,
      code: `CLASS-${def.code}`,
      term: def.term,
      studentIds: ids,
      groups,
      createdAt: new Date(Date.UTC(2026, 4, 5 + ci)).toISOString(),
    })

    const nAssign = 2 + (ci % 2)
    for (let a = 0; a < nAssign; a++) {
      const scen = UNI_ASSIGNABLE_SCENARIOS[(ci + a) % UNI_ASSIGNABLE_SCENARIOS.length]
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
        capabilities: scen.capabilities,
        assignedTo: 'cohort',
        dueAt: new Date(Date.UTC(2026, 6, 10) + dueOffset * 864e5).toISOString(),
        opensAt: new Date(Date.UTC(2026, 5, 20 + a)).toISOString(),
        createdAt: new Date(Date.UTC(2026, 5, 18 + a)).toISOString(),
        progress,
      })
    }
  })

  const subjects: SubjectProfile[] = UNI_SUBJECT_TEMPLATES.slice(0, 4).map((t) => ({ ...t, isTemplate: false }))

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

/** Score → heat colour (cream→navy ramp, corporate register). */
export function heatColor(score: number): string {
  // 28..98 mapped onto a cream→navy ramp.
  const t = Math.max(0, Math.min(1, (score - 30) / 60))
  const from = [244, 240, 230] // #f4f0e6
  const to = [10, 42, 107]     // #0a2a6b — var(--launch-navy)
  const c = from.map((f, i) => Math.round(f + (to[i] - f) * t))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

/** Whether heat cell text should be light (dark bg) or dark. Navy darkens
 *  faster than the old teal ramp, so the threshold sits lower. */
export function heatTextLight(score: number): boolean {
  return score >= 58
}
