/**
 * Seed data — preload realistic active roles + a candidate pool so a
 * partner landing on the corporate dashboard for the first time sees
 * actual state (not an empty zero-zero-zero shell).
 *
 * Three roles, ~190 submissions across them, profile-shaped distributions
 * that align with the role's pre-qualifier benchmarks (some passing, some
 * flagged). Lets the demo show off filters end-to-end without anyone
 * having to play a scenario first.
 *
 * Idempotent — `seedIfNeeded()` writes a flag the first time it runs
 * and skips on subsequent visits, so the partner's later-built scenarios
 * + real submissions never get clobbered.
 */

import { addCustomScenarioStub, listCustomScenarios, type CustomScenarioStub } from '@/lib/scenarioStore'
import { addSubmission, listSubmissions, type Submission } from '@/lib/submissionStore'
import { PREQUAL_SEEDS, type PrequalSeed } from '@/lib/builderData'
import type { GenericIntakeQuestion } from '@/lib/play/types'
import type { CandidateProfile } from '@/lib/candidateProfile'
import type { QuestionVerdict } from '@/lib/aiEvaluator'

/* ─────────────────────────────────────────────────────────────────── */
/* PUBLIC ENTRYPOINT                                                    */
/* ─────────────────────────────────────────────────────────────────── */

const SEED_FLAG = 'launch.seedData.v2.applied'  // bumped: adds decisions[]

/** Run on partner-side mount. Idempotent. */
export function seedIfNeeded(): { rolesSeeded: number; submissionsSeeded: number } {
  if (typeof window === 'undefined') return { rolesSeeded: 0, submissionsSeeded: 0 }
  try {
    if (window.localStorage.getItem(SEED_FLAG) === '1') {
      return { rolesSeeded: 0, submissionsSeeded: 0 }
    }
    // Wipe any prior-version seed data so re-seed lands cleanly with the
    // newer shape (decisions[], etc.). Real partner-built submissions
    // survive via id mismatch with seed-sub-* prefix.
    if (window.localStorage.getItem('launch.seedData.v1.applied') === '1') {
      window.localStorage.removeItem('launch.submissions.v1')
      window.localStorage.removeItem('launch.scenarioStore.v1')
      window.localStorage.removeItem('launch.seedData.v1.applied')
    }
  } catch { /* ignore */ }

  // Add roles — addCustomScenarioStub is idempotent on id, so even if the
  // flag was cleared we won't double-add.
  const roles = SEED_ROLES()
  for (const r of roles) addCustomScenarioStub(r)

  // Seed submissions for each role
  const subs = SEED_SUBMISSIONS(roles)
  for (const s of subs) addSubmission(s)

  try { window.localStorage.setItem(SEED_FLAG, '1') } catch { /* ignore */ }
  return { rolesSeeded: roles.length, submissionsSeeded: subs.length }
}

/** Active roles in the same shape a partner-built scenario would have. */
export type SeedRole = CustomScenarioStub & {
  /** Full activeRoles entry uses 'name' instead of 'title' in the dashboard. */
  name: string
}

/** Hydrate activeRoles state from the scenarioStore at mount. */
export function loadActiveRoles(): SeedRole[] {
  return listCustomScenarios().map((stub) => ({
    ...stub,
    name: stub.title,
  }))
}

/**
 * Convert Submissions into Student-shaped objects so the same
 * RoleApplicantFilters component can operate on them directly. Used on
 * the role detail page where the partner is filtering THIS role's actual
 * applicant pool (not the 1,200-strong global MOCK_STUDENTS).
 *
 * Accepts an optional `roleSkills` array — when present, the function
 * derives a per-skill score for each applicant so the role's capability
 * picker has something realistic to sort by. Seed data lacks real
 * decision-derived scores; real submissions will populate this from the
 * decisions[] array once the scenario→play data flow is fully wired.
 */
import type { Student } from '@/components/student-list'
// Deterministic-ish per-submission, per-skill score so the same candidate
// always lands at the same level across re-renders. Avoids using Date/Math.random
// at render time (would cause re-shuffle on filter changes).
function seededSkillScore(submissionId: string, skill: string): number {
  let h = 0
  const s = submissionId + ':' + skill
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0
  // Map to 65–96 range so most are reasonably strong but distinguishable.
  return 65 + (Math.abs(h) % 32)
}
export function submissionsToStudents(subs: Submission[], roleSkills?: string[]): Student[] {
  return subs.map((s) => {
    const p = s.profile
    // Roll the intake verdicts into a single "overall" 0–100 for the
    // filter's "min overall" slider + the partner's at-a-glance card.
    const intakeAvg = s.intake.length === 0
      ? 0
      : Math.round(s.intake.reduce((n, v) => n + (v.overall || 0), 0) / s.intake.length * 10) // 0..100
    // Time to complete in ms
    const completionTimeMs = s.startedAt
      ? Math.max(0, new Date(s.submittedAt).getTime() - new Date(s.startedAt).getTime())
      : undefined
    // Every candidate carries a deterministic score on all 10 Launch
    // capabilities, regardless of which axes this particular scenario
    // explicitly tests. Lets the partner filter by any capability on the
    // role detail page without leaving holes in the data. (The original
    // scenario-tested axes still get surfaced separately wherever the UI
    // wants to lead with "scenario-specific" capabilities.)
    const LAUNCH_CAP_NAMES = [
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
    void roleSkills // arg kept for backwards-compat; scoring is now Launch-wide
    const topCapabilities = LAUNCH_CAP_NAMES.map((name) => ({
      name,
      level: seededSkillScore(s.id, name),
    }))
    return {
      id: s.id,
      name: p?.name || s.candidateName,
      interests: p?.industries || [],
      topCapabilities,
      overallScore: intakeAvg || seededSkillScore(s.id, '__overall__'),
      degree: p?.degree,
      atar: p?.atar,
      university: p?.university,
      graduationYear: p?.graduationYear,
      location: p?.location,
      workRights: p?.workRights as Student['workRights'],
      industries: p?.industries,
      selfRatedStrengths: p?.selfRatedStrengths,
      availableFrom: p?.availableFrom,
      expectedSalary: p?.expectedSalary as Student['expectedSalary'],
      willingRelocate: p?.willingRelocate as Student['willingRelocate'],
      prequalStatus: s.notQualified ? 'flagged' : 'passed',
      completionTimeMs,
    }
  })
}

/* ─────────────────────────────────────────────────────────────────── */
/* SEED ROLES                                                           */
/* ─────────────────────────────────────────────────────────────────── */

/** Helper: pull a seeded pre-qualifier into a GenericIntakeQuestion. */
function fromSeed(key: string): GenericIntakeQuestion {
  const seed = PREQUAL_SEEDS.find((s) => s.key === key)
  if (!seed) throw new Error(`Seed not found: ${key}`)
  return {
    id: `seedq-${key}`,
    kind: seed.kind,
    prompt: seed.prompt,
    criterionIds: seed.criterionIds || [],
    allowedAnswers: seed.allowedAnswers,
    passingAnswers: seed.passingAnswers,
    minScore: seed.minScore,
  }
}

const ONE_DAY = 24 * 60 * 60 * 1000

export function SEED_ROLES(): SeedRole[] {
  const now = Date.now()
  // Three roles, freshest first so they sort correctly on the dashboard.
  return [
    {
      id: 'seed-grad-property',
      title: 'Graduate Analyst — Property',
      name: 'Graduate Analyst — Property',
      code: 'PROP-GRAD-26',
      accessCode: 'PROP-GRAD-26',
      skills: ['Collaboration', 'Reasoning & Critical Thinking', 'Execution & Ownership'],
      questionsCount: 6,
      creatorType: 'corporate',
      variant: 'professional',
      createdAt: new Date(now - 8 * ONE_DAY).toISOString(),
      genericQuestions: [
        fromSeed('recent-graduate'),
        fromSeed('degree-type'),
        fromSeed('communication-collab'),
        fromSeed('industry-motivation'),
      ],
    } as SeedRole,
    {
      id: 'seed-investment-associate',
      title: 'Investment Associate',
      name: 'Investment Associate',
      code: 'INV-ASSOC-26',
      accessCode: 'INV-ASSOC-26',
      skills: ['Judgement & Decision-Making', 'Problem Solving', 'Integrity & Ethics'],
      questionsCount: 9,
      creatorType: 'corporate',
      variant: 'professional',
      createdAt: new Date(now - 14 * ONE_DAY).toISOString(),
      genericQuestions: [
        fromSeed('recent-graduate'),
        fromSeed('work-rights'),
        fromSeed('degree-type'),
        fromSeed('initiative-story'),
      ],
    } as SeedRole,
    {
      id: 'seed-brand-strategist',
      title: 'Brand Strategist — Marketing',
      name: 'Brand Strategist — Marketing',
      code: 'BRAND-STRAT-26',
      accessCode: 'BRAND-STRAT-26',
      skills: ['Leadership & Influence', 'Emotional Intelligence', 'Adaptability & Cognitive Flexibility'],
      questionsCount: 6,
      creatorType: 'corporate',
      variant: 'professional',
      createdAt: new Date(now - 22 * ONE_DAY).toISOString(),
      genericQuestions: [
        fromSeed('communication-collab'),
        fromSeed('extracurricular'),
        fromSeed('industry-motivation'),
      ],
    } as SeedRole,
  ]
}

/* ─────────────────────────────────────────────────────────────────── */
/* SEED SUBMISSIONS                                                     */
/* ─────────────────────────────────────────────────────────────────── */

const FIRST_NAMES = ['Sarah', 'James', 'Maya', 'Alex', 'Emma', 'David', 'Sophie', 'Michael', 'Jess', 'Daniel', 'Olivia', 'Chris', 'Isabella', 'Matthew', 'Ava', 'Andrew', 'Mia', 'Joshua', 'Emily', 'Ryan', 'Charlotte', 'Jacob', 'Amelia', 'William', 'Harper', 'Ben', 'Evelyn', 'Lucas', 'Abigail', 'Henry', 'Sam', 'Layla', 'Tom', 'Aisha', 'Priya', 'Marcus', 'Zara', 'Lachlan', 'Hugo', 'Tilly']
const LAST_NAMES = ['Chen', 'Riley', 'Patel', 'Kim', 'Rodriguez', 'Thompson', 'Garcia', 'Martinez', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Harris', 'Clark', 'Lewis', 'Walker', 'Hall', 'Young', 'Allen', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Nelson', 'Baker', 'Carter', 'Roberts', 'Phillips', 'Evans', 'Turner']
const UNIVERSITIES = ['University of Sydney', 'UNSW Sydney', 'University of Melbourne', 'Monash University', 'University of Queensland', 'ANU', 'UTS', 'Macquarie University', 'RMIT', 'University of Adelaide', 'University of Western Australia']
const LOCATIONS = ['Sydney, NSW', 'Melbourne, VIC', 'Brisbane, QLD', 'Perth, WA', 'Adelaide, SA', 'Canberra, ACT', 'Newcastle, NSW', 'Wollongong, NSW']
const INDUSTRIES_POOL = ['Property / Real Estate', 'Finance / Banking', 'Consulting / Strategy', 'Technology', 'Engineering', 'Marketing', 'Operations', 'Sales']

interface RoleSeedConfig {
  count: number
  /** Pass rate target (0-1) so partner sees a realistic mix of qualified/flagged. */
  passRate: number
  /** Degree-pool the candidates favour (matches role expectations). */
  degreePool: string[]
  /** Industry-pool candidates list as interests (matches role). */
  industryPool: string[]
}
const ROLE_CONFIG: Record<string, RoleSeedConfig> = {
  'seed-grad-property': {
    count: 84,
    passRate: 0.68,
    degreePool: ['Property / Real Estate', 'Finance / Commerce', 'Business / Marketing', 'Other'],
    industryPool: ['Property / Real Estate', 'Finance / Banking', 'Consulting / Strategy'],
  },
  'seed-investment-associate': {
    count: 62,
    passRate: 0.54,
    degreePool: ['Finance / Commerce', 'Property / Real Estate', 'Engineering', 'Law', 'Other'],
    industryPool: ['Finance / Banking', 'Consulting / Strategy', 'Property / Real Estate', 'Operations'],
  },
  'seed-brand-strategist': {
    count: 44,
    passRate: 0.78,
    degreePool: ['Business / Marketing', 'Finance / Commerce', 'Other'],
    industryPool: ['Marketing', 'Sales', 'Technology', 'Consulting / Strategy'],
  },
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
function pickSome<T>(arr: T[], min: number, max: number): T[] {
  const n = min + Math.floor(Math.random() * (max - min + 1))
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n)
}
function rng(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function genCandidateProfile(cfg: RoleSeedConfig): CandidateProfile {
  const firstName = pick(FIRST_NAMES)
  const lastName = pick(LAST_NAMES)
  return {
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    phone: '04' + Math.floor(10000000 + Math.random() * 89999999),
    location: pick(LOCATIONS),
    atar: Math.round(rng(88, 99.95) * 10) / 10,
    university: pick(UNIVERSITIES),
    degree: pick(cfg.degreePool),
    graduationYear: 2024 + Math.floor(Math.random() * 4),
    major: pick(['Finance', 'Real Estate', 'Marketing', 'Accounting', 'Economics', 'Management']),
    workRights: Math.random() < 0.7 ? 'citizen-permanent' : Math.random() < 0.5 ? 'visa-unrestricted' : 'visa-restricted',
    employmentStatus: pick(['studying', 'studying-working-pt', 'graduated-job-seeking', 'working-pt']),
    industries: pickSome(cfg.industryPool, 1, 3) as any,
    selfRatedStrengths: pickSome(
      ['collaboration', 'reasoning', 'execution', 'leadership', 'judgement', 'problemSolving', 'integrity', 'adaptability'],
      1, 3
    ),
    availableFrom: new Date(Date.now() + Math.floor(Math.random() * 120) * ONE_DAY).toISOString().slice(0, 10),
    expectedSalary: pick(['60-75', '75-90', '75-90', '90-110', '110-130', 'flexible']),
    willingRelocate: pick(['yes-anywhere', 'yes-in-country', 'yes-in-state', 'yes-in-state', 'no']),
  }
}

/**
 * Build a verdict for an intake question given whether the candidate is meant
 * to "pass" the overall benchmark — for seed data we just pin overall scores
 * above or below the partner-set minScore / pick a passing or non-passing answer.
 */
function genVerdict(q: GenericIntakeQuestion, shouldPass: boolean): QuestionVerdict {
  const kind = q.kind || 'open-text'
  if (kind === 'hard-filter') {
    const answers = q.allowedAnswers || []
    const passing = q.passingAnswers && q.passingAnswers.length > 0 ? q.passingAnswers : answers
    const failing = answers.filter((a) => !passing.includes(a))
    const picked = shouldPass ? pick(passing) : (failing.length > 0 ? pick(failing) : pick(answers))
    const qualified = passing.includes(picked)
    return {
      questionId: q.id,
      prompt: q.prompt,
      answer: picked,
      kind: 'hard-filter',
      overall: qualified ? 10 : 0,
      oneLiner: qualified ? 'Meets requirement.' : `Doesn’t meet requirement (answered: ${picked}).`,
      criteria: [],
      qualified,
      belowBenchmark: !qualified,
      benchmark: { kind: 'allowed-list', values: passing },
    }
  }
  // Open-text
  const min = q.minScore ?? 0
  const overall = shouldPass
    ? Math.min(10, Math.max(min, min + Math.floor(Math.random() * (10 - min + 1))))
    : Math.max(0, min - 1 - Math.floor(Math.random() * 3))
  const below = overall < min
  return {
    questionId: q.id,
    prompt: q.prompt,
    answer: '— (seed candidate)',
    kind: 'open-text',
    overall,
    oneLiner: below ? `Below benchmark — ${overall}/10, partner set ${min}/10.` : overall >= 8 ? 'Strong: hits the criteria well.' : 'OK: partially meets the criteria.',
    criteria: [],
    belowBenchmark: below || undefined,
    benchmark: q.minScore !== undefined ? { kind: 'min-score', value: q.minScore } : undefined,
  }
}

/** Per-role decision bank — realistic scenario decisions with 3 options each.
 *  Mock content; real plays will populate this from the live scenario at
 *  play time. The whole bank is what makes the path visualisation possible
 *  for seeded candidates. */
const DECISION_BANK: Record<string, Array<{ prompt: string; skill: string; options: string[] }>> = {
  'seed-grad-property': [
    { prompt: 'A senior agent disagrees with the comparable sales you used in a pitch deck. The pitch is in 18 minutes. What\'s your first move?', skill: 'Reasoning', options: ['Hold the comparables — defend them with sourced data.', 'Swap them out for the agent\'s preferred picks.', 'Mark both sets up; let the client see the spread.'] },
    { prompt: 'A tenant calls about an urgent gas-safety issue on a property you don\'t cover. Your colleague who manages it is on annual leave.', skill: 'Execution & Ownership', options: ['Triage it yourself; loop the colleague async.', 'Call the property manager rotation phone.', 'Pass the tenant to reception with the duty manager number.'] },
    { prompt: 'Mid-inspection, a buyer asks a yield question you don\'t know the answer to. The buyer is high-intent.', skill: 'Integrity & Ethics', options: ['Say you\'ll come back with the number tonight.', 'Estimate the range; flag it\'s a working figure.', 'Pivot to the figures you DO know that matter to the decision.'] },
    { prompt: 'You\'ve been asked to write a market update for a Tier-1 client. You have 90 minutes and three half-finished sources.', skill: 'Problem Solving', options: ['Ship a tight 1-pager from the strongest source.', 'Pull all three into a longer note with caveats.', 'Push back, asking for an extra day to triangulate properly.'] },
    { prompt: 'A colleague who\'s been at the firm 8 years asks you to "tweak" a valuation up by 3% to keep a client happy.', skill: 'Integrity & Ethics', options: ['Decline and explain your reasoning.', 'Run the higher number past the head of valuations first.', 'Find a defensible mid-point and document it.'] },
    { prompt: 'You\'re building the slides for a graduate cohort presentation. The team lead wants "story over data"; you think the data carries it.', skill: 'Collaboration', options: ['Lead with a story; back it with two strong charts.', 'Lead with the data; bookend it with the story.', 'Build two versions; let the team lead choose at dry-run.'] },
  ],
  'seed-investment-associate': [
    { prompt: 'A target company\'s last three years of EBITDA show a sharp jump in year 3 that the seller can\'t explain on the call. The deadline is Friday.', skill: 'Reasoning', options: ['Push the timeline; demand the underlying schedules.', 'Model both adjusted and unadjusted; flag the difference in the IC paper.', 'Lean on the auditor\'s sign-off and price it in the bid.'] },
    { prompt: 'A senior partner pressures you to soften a risk in the investment memo. The risk is real and material.', skill: 'Integrity & Ethics', options: ['Keep the risk verbatim; add mitigation language.', 'Reframe the risk as a "watch item" with monitoring plan.', 'Remove it from the memo; raise it verbally at IC.'] },
    { prompt: 'Mid-due-diligence, you find a customer concentration risk the analyst missed. The deal lead is presenting tomorrow.', skill: 'Execution & Ownership', options: ['Re-run the model overnight; brief the lead at 6am.', 'Flag it now; let the lead decide whether to delay.', 'Add it as a risk factor; keep the deal on schedule.'] },
    { prompt: 'A junior analyst keeps making the same modelling mistake. They\'re hard-working but disorganised.', skill: 'Leadership', options: ['Build a checklist with them and pair on the next one.', 'Take the work off their plate for the deal.', 'Escalate to the team lead for a formal conversation.'] },
    { prompt: 'You disagree with the partner\'s call on a deal you\'ve been on for 3 months. They want to bid; you think it\'s wrong.', skill: 'Judgement', options: ['Write a counter-memo; circulate before IC.', 'Bring up your concerns 1:1 before IC.', 'Defer to the partner; document your view for the file.'] },
    { prompt: 'A founder you\'re backing wants to hire a CTO who\'s a friend rather than the strongest candidate from your shortlist.', skill: 'Leadership', options: ['Push hard for the shortlist candidate; bring board pressure.', 'Set a 6-month performance gate for the friend; have the shortlist as backup.', 'Defer to the founder — it\'s their company.'] },
    { prompt: 'Your model says the IRR works at the asking price; your gut says the seller\'s confidence is suspicious.', skill: 'Situational', options: ['Trust the model; bid at the level.', 'Bid 8% under and walk if rejected.', 'Spend two more weeks on the diligence before bidding.'] },
    { prompt: 'A board member emails you directly with a "private question" about a portfolio company. The CEO doesn\'t know.', skill: 'Integrity & Ethics', options: ['Answer the question; copy the CEO.', 'Decline politely; ask them to use proper channels.', 'Answer the question privately; raise it with the partner.'] },
    { prompt: 'Markets crashed overnight. The IC paper you wrote yesterday no longer reflects reality.', skill: 'Adaptability', options: ['Withdraw the paper; rewrite the macro section.', 'Add a 1-page addendum; keep the body intact.', 'Present as-is and discuss the macro shift live.'] },
  ],
  'seed-brand-strategist': [
    { prompt: 'The creative director wants a louder campaign; the data says the audience responds to quieter, more authentic work.', skill: 'Reasoning', options: ['Pitch a quieter approach with the data to back it.', 'Build both routes; A/B them in a small market first.', 'Defer to the creative director — they have the taste call.'] },
    { prompt: 'A retail client wants their refresh to "feel premium" but their margins won\'t support premium pricing.', skill: 'Problem Solving', options: ['Reframe "premium" as craft and consistency, not luxury.', 'Push back on the brief; surface the contradiction.', 'Run a positioning workshop with the founders.'] },
    { prompt: 'Two designers on your team have a creative disagreement that\'s slowing the project. The client deadline is in 8 days.', skill: 'Collaboration', options: ['Bring them into a room; lead a structured debate.', 'Pick a direction yourself; commit and move.', 'Have them each ship their version; client picks.'] },
    { prompt: 'A junior strategist sent the client a deck that has the wrong logo on the wrong section. The client noticed.', skill: 'Integrity & Ethics', options: ['Own it yourself; protect the junior strategist publicly.', 'Be transparent with the client about who did what.', 'Send a corrected deck immediately; deal with the team conversation internally.'] },
    { prompt: 'A long-term client is asking for work that\'s outside your team\'s expertise. The fee is significant.', skill: 'Judgement', options: ['Take it; build the expertise as you go.', 'Refer them to a trusted partner agency; keep the relationship warm.', 'Take it and partner with a freelance specialist invisibly.'] },
    { prompt: 'You\'ve been asked to lead a pitch in two weeks. You\'ve never led a pitch before.', skill: 'Leadership', options: ['Accept and ask the partner to shadow you.', 'Co-lead with the partner; flag your inexperience to the team.', 'Decline; suggest the partner takes lead, you\'ll be the deputy.'] },
  ],
}

export function SEED_SUBMISSIONS(roles: SeedRole[]): Submission[] {
  const subs: Submission[] = []
  for (const role of roles) {
    const cfg = ROLE_CONFIG[role.id]
    if (!cfg) continue
    for (let i = 0; i < cfg.count; i++) {
      const shouldPass = Math.random() < cfg.passRate
      const profile = genCandidateProfile(cfg)
      // Generate verdicts for every intake question on the role
      const intake: QuestionVerdict[] = (role.genericQuestions || []).map((q) => {
        // For pass: every question scores at-or-above benchmark
        // For fail: at least ONE question scores below
        const oneFails = i % 3 === 0 // every third failure is single-question fail
        const passThisQ = shouldPass ? true : (oneFails ? Math.random() < 0.5 : true)
        const finalPass = shouldPass || passThisQ
        return genVerdict(q, finalPass)
      })
      // Recompute notQualified from verdicts so it's authoritative
      const notQualified = intake.some((v) => v.belowBenchmark === true) || !shouldPass
      // Final fix: if shouldPass but notQualified came out true (some non-passing verdict slipped through), force one to pass
      const finalNotQ = shouldPass
        ? intake.every((v) => v.belowBenchmark !== true) ? false : true
        : true
      // Submitted somewhere in the last 30 days, weighted to recent
      const ageDays = Math.floor(Math.random() * Math.random() * 30)
      const submittedAt = new Date(Date.now() - ageDays * ONE_DAY - Math.floor(Math.random() * ONE_DAY)).toISOString()
      // Decisions — deterministic per-submission pick at each step so the
      // path through the scenario is stable across re-renders. Uses the
      // role's DECISION_BANK; populates full prompt + 3 options per step.
      const bank = DECISION_BANK[role.id] || []
      const decisions = bank.map((d, stepIdx) => {
        const idHash = `${role.id}-${i}-${stepIdx}`
        let h = 0
        for (let c = 0; c < idHash.length; c++) h = ((h << 5) - h) + idHash.charCodeAt(c) | 0
        const pickedIdx = Math.abs(h) % 3
        return {
          stepIdx,
          prompt: d.prompt,
          skill: d.skill,
          label: d.options[pickedIdx],
          options: d.options.map((label, oi) => ({
            id: `opt-${stepIdx}-${oi}`,
            label,
            picked: oi === pickedIdx,
          })),
        }
      })
      subs.push({
        id: `seed-sub-${role.id}-${i}`,
        scenarioCode: role.accessCode,
        scenarioTitle: role.title,
        candidateName: profile.name,
        variant: role.variant === 'professional' ? 'professional' : 'playful',
        submittedAt,
        startedAt: new Date(Date.parse(submittedAt) - rng(4, 26) * 60 * 1000).toISOString(),
        profile,
        intake,
        notQualified: finalNotQ,
        decisions,
      })
    }
  }
  // Newest first so the dashboard's "Recent submissions" panel reads correctly.
  subs.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
  return subs
}
