/**
 * credentialReport.ts — data layer for the six-page Launch Capability
 * Report (the credential document careers leaders open from a student
 * profile, replicated from Launch_Capability_Report_Sample.pdf).
 *
 * The dashboard keeps its own ten capabilities (heatmap, radar, fit —
 * untouched). The REPORT presents the ten FUSE capabilities from the
 * designed document, each derived deterministically from the student's
 * dashboard scores, so every one of the ~2,800 sample students renders
 * their own six-page report at zero storage cost.
 */

import type { CapabilityScores, EdStudent } from '@/lib/educator'

/* ── The ten FUSE report capabilities, in document order ───────────── */

export type ReportFamily = 'Reasoning & Judgement' | 'People & Influence' | 'Character & Drive'

export interface ReportCap {
  id: string
  name: string
  /** Tight label for strength cards and generated prose. */
  short: string
  /** Lowercase descriptor for family blurbs ("Distinguished on analysis"). */
  noun: string
  family: ReportFamily
  /** Published instruments, rendered in italic serif under the name. */
  basis: string
  /** Fixed interview probe (pages 2–3 and the page-6 guide). */
  probe: string
  /** Page-1 one-liners: solid level vs still-building level. */
  demoHigh: string
  demoLow: string
  /** Headline-strength card body (two sentences, document voice). */
  card: string
  /** Verb phrase for the Launch summary quote. */
  verb: string
  /** Archetype fragment for the role-fit paragraph. */
  archetype: string
  /** Pages 2–3 observed behaviours / implications, by level band.
   *  {s1}/{s2} are replaced with the student's recent scenario titles. */
  observed: { high: string; mid: string; low: string }
  implications: { high: string; mid: string; low: string }
}

export const REPORT_CAPS: ReportCap[] = [
  {
    id: 'psca',
    name: 'Problem-Solving & Critical Analysis',
    short: 'Problem Solving',
    noun: 'analysis',
    family: 'Reasoning & Judgement',
    basis: 'Halpern HCTA · Watson-Glaser',
    probe: 'Tell me about a time you were handed a conclusion you did not agree with. How did you test it?',
    demoHigh: 'Tests assumptions, weighs the evidence',
    demoLow: 'Core analysis present, still consolidating',
    card: 'Solves novel, ambiguous problems with no clear precedent. Names assumptions and weighs evidence for quality, not volume.',
    verb: 'takes unfamiliar problems apart',
    archetype: 'a strong analyst',
    observed: {
      high: 'Named the assumptions in each scenario and tested them before acting. Weighed evidence by quality rather than volume, and did so in every scenario that called for it, including under time pressure.',
      mid: 'Broke each problem into parts and reasoned soundly from the evidence available. Tested assumptions when the scenario prompted it; doing so unprompted, every time, is the next habit.',
      low: 'Reached workable answers on familiar problems. On novel ones the first frame tended to stick — the rubric looks for assumptions named and tested before acting.',
    },
    implications: {
      high: 'Will challenge a weak brief and reach a defensible conclusion on an unfamiliar problem without waiting for precedent. Expect them to be the person others check their reasoning with.',
      mid: 'Handles routine and moderately novel analysis without escalation. Stretch problems will sharpen the unprompted habits.',
      low: 'Start with structured problems and name the reasoning you want to see. Improves quickly with worked examples.',
    },
  },
  {
    id: 'dmu',
    name: 'Decision-Making Under Uncertainty',
    short: 'Decision-Making',
    noun: 'decisions under uncertainty',
    family: 'Reasoning & Judgement',
    basis: 'A-DMC · Klein RPD',
    probe: 'Describe a decision you made without all the information. What would have made you reverse it?',
    demoHigh: 'Names the unknowns, sets a reversal point',
    demoLow: 'Decides with support, calibration building',
    card: 'Makes sound calls on incomplete information, calibrates confidence to evidence and pre-sets a point to reverse.',
    verb: 'makes sound calls on incomplete information',
    archetype: 'a decisive operator',
    observed: {
      high: 'Calibrated confidence to the evidence available, named what was unknown and what would change the call, and pre-set a reversal point before committing in {s1}.',
      mid: 'Made sound calls when most of the information was in, and named the unknowns when asked. Pre-setting a reversal point before committing is the next habit to lock in.',
      low: 'Preferred to gather more information before committing, and in timed scenarios that meant decisions arrived late. Confidence calibration is still building.',
    },
    implications: {
      high: 'Comfortable acting on incomplete information. Unlikely to freeze, and unlikely to over-commit.',
      mid: 'Reliable on decisions with normal stakes. Pair with a manager on the genuinely ambiguous ones at first.',
      low: 'Needs explicit decision deadlines and a named fallback. Improves when the cost of waiting is made visible.',
    },
  },
  {
    id: 'sa',
    name: 'Situational Awareness & Pattern Recognition',
    short: 'Situational Awareness',
    noun: 'awareness',
    family: 'Reasoning & Judgement',
    basis: 'Endsley SA model · SAGAT',
    probe: 'In your last group project, what did you notice going wrong before anyone said it?',
    demoHigh: 'Reads the cues, projects the next step',
    demoLow: 'Reads direct cues, projection building',
    card: 'Reads the cues early, projects the next step and flags the problem before it lands on anyone’s desk.',
    verb: 'reads situations early',
    archetype: 'an early reader of the room',
    observed: {
      high: 'Picked up the relevant cues in every scenario, read what was happening and projected the next step before it arrived — including second-order effects in {s2}.',
      mid: 'Picked up several relevant cues in each scenario and read what was happening. Projected the next step in some scenarios, not yet consistently.',
      low: 'Responded to direct cues once they surfaced. Cues that arrived early or obliquely were missed — the rubric looks for reading the room before the room announces itself.',
    },
    implications: {
      high: 'Reads a brief and a room early. Will flag the problem before it lands on anyone’s desk.',
      mid: 'Reads a room and a brief well. Anticipating second-order consequences is still developing.',
      low: 'Benefits from explicit context check-ins. Ask what they are noticing, not only what they are doing.',
    },
  },
  {
    id: 'adapt',
    name: 'Adaptability & Cognitive Flexibility',
    short: 'Adaptability',
    noun: 'adaptability',
    family: 'Reasoning & Judgement',
    basis: 'I-ADAPT-M · Pulakos taxonomy',
    probe: 'When has new information made you change an approach you had already committed to?',
    demoHigh: 'Changes strategy when the facts change',
    demoLow: 'Adjusts with prompting, flexibility building',
    card: 'Changes strategy when the facts change, and names the trigger rather than drifting.',
    verb: 'changes course when the facts change',
    archetype: 'a flexible thinker',
    observed: {
      high: 'Changed strategy when new information arrived and named the trigger. Held two competing frames in {s2} without collapsing one into the other.',
      mid: 'Adjusted the approach when the scenario made change unavoidable, without losing the thread. Naming the trigger out loud is the next step.',
      low: 'Tended to persist with the first approach after the facts had moved, and changed course when prompted. The rubric expects the change to be self-initiated.',
    },
    implications: {
      high: 'Adjusts to changed priorities when there is a reason to, rather than shifting under any pressure.',
      mid: 'Copes well with planned change. Sudden reversals take a beat longer.',
      low: 'Signal changes early and explain the why. Adaptation follows reliably once the reason is visible.',
    },
  },
  {
    id: 'la',
    name: 'Learning Agility',
    short: 'Learning Agility',
    noun: 'learning',
    family: 'Reasoning & Judgement',
    basis: 'Dweck mindset · Need for Cognition',
    probe: 'What is the last thing you had to learn from scratch, and how did you go about it?',
    demoHigh: 'Learns unfamiliar material fast',
    demoLow: 'Learns steadily on familiar ground',
    card: 'Engages unfamiliar material fast and treats difficulty as learnable, not as a verdict.',
    verb: 'learns unfamiliar material fast',
    archetype: 'a fast learner',
    observed: {
      high: 'Engaged unfamiliar material rather than retreating to known frames, and treated difficulty as learnable. Applied what one scenario taught inside the next.',
      mid: 'Engaged new material willingly and retained it across scenarios. Transferring it to a genuinely different context took a prompt.',
      low: 'Preferred known frames when the material turned unfamiliar. Improvement came with repetition rather than first exposure.',
    },
    implications: {
      high: 'Picks up a new domain quickly. Expect a fast ramp.',
      mid: 'Ramps well with structured onboarding and worked examples.',
      low: 'Give one domain at a time and revisit it. Depth before breadth.',
    },
  },
  {
    id: 'eq',
    name: 'Emotional Intelligence',
    short: 'Emotional Intelligence',
    noun: 'emotional intelligence',
    family: 'People & Influence',
    basis: 'MSCEIT (ability EI)',
    probe: 'Tell me about a time you had to deliver news someone did not want to hear.',
    demoHigh: 'Reads others’ emotions from cues',
    demoLow: 'Reads stated feelings, inference building',
    card: 'Reads what people feel from cues rather than labels, and reasons about how those feelings will shift.',
    verb: 'reads people well',
    archetype: 'a natural reader of people',
    observed: {
      high: 'Inferred what others felt from cues in the scenario rather than labelling them, and reasoned about how those feelings would shift. Influence preserved the other party’s choice.',
      mid: 'Read stated feelings accurately and responded with care. Inferring unstated emotion from thin cues appeared in some scenarios, not all.',
      low: 'Engaged with the task before the person. Emotional cues registered when explicit — the rubric looks for inference from tone and timing.',
    },
    implications: {
      high: 'Handles client and colleague tension constructively. Persuades without manipulating.',
      mid: 'Works well in a team day to day. High-stakes emotional conversations deserve a debrief partner at first.',
      low: 'Pair with an emotionally fluent colleague on people-heavy work, and name the human dimension explicitly in briefs.',
    },
  },
  {
    id: 'lead',
    name: 'Leadership & Influence',
    short: 'Leadership',
    noun: 'leadership',
    family: 'People & Influence',
    basis: 'MLQ-5X · French & Raven',
    probe: 'How did you bring a reluctant team member with you on something that mattered?',
    demoHigh: 'Leads through explanation and purpose',
    demoLow: 'Contributes first, leads when asked',
    card: 'Takes charge under pressure through explanation and shared purpose, tailored to the person in front of them.',
    verb: 'leads under pressure',
    archetype: 'a natural explainer',
    observed: {
      high: 'Moved people through explanation, evidence and shared purpose, tailored to the individual. No reliance on position or on ‘because I said so’.',
      mid: 'Took the lead when the scenario asked for it and brought most of the group along. Influence rested on the strength of the idea; tailoring it to the person is the next layer.',
      low: 'Contributed strongly as an individual and deferred the leadership moments to others. The rubric looks for stepping forward unprompted when the situation needs it.',
    },
    implications: {
      high: 'Will lead peers without formal authority. Suited to early project ownership.',
      mid: 'Ready for defined leadership moments — a workstream, a meeting — with the remit made explicit.',
      low: 'Grow influence through expertise first. Formal leadership can wait without any cost.',
    },
  },
  {
    id: 'collab',
    name: 'Collaboration & Team Effectiveness',
    short: 'Collaboration',
    noun: 'collaboration',
    family: 'People & Influence',
    basis: 'Salas Big Five of Teamwork · TKI',
    probe: 'Describe a disagreement inside a team you were part of. What did you do?',
    demoHigh: 'Backs teammates, thinks in team outcomes',
    demoLow: 'Strong solo, team habits building',
    card: 'Backs teammates up, updates the plan on team input and frames goals in team terms.',
    verb: 'lifts the team around them',
    archetype: 'a team-first contributor',
    observed: {
      high: 'Monitored teammates’ state, offered back-up and updated the plan on team input. Framed goals in team terms while keeping personal accountability.',
      mid: 'Carried their share and offered help when asked. Monitoring teammates and reshaping the plan on team input appeared sometimes, not every time.',
      low: 'Worked accurately alone and handed over cleanly. Spontaneous back-up behaviour and team-first framing appeared rarely.',
    },
    implications: {
      high: 'Reliable team contributor. Approaches conflict collaboratively rather than avoiding it.',
      mid: 'Solid in a functioning team. In a struggling one, name the team behaviours you want to see.',
      low: 'Start with paired work and explicit team roles. Team instincts build with exposure.',
    },
  },
  {
    id: 'integ',
    name: 'Integrity & Trustworthiness',
    short: 'Integrity',
    noun: 'integrity',
    family: 'Character & Drive',
    basis: 'HEXACO Honesty-Humility',
    probe: 'Tell me about a time doing the right thing cost you something.',
    demoHigh: 'Discloses own interest, stays consistent',
    demoLow: 'Honest under scrutiny, consistency building',
    card: 'Discloses their own interest and accepts the worse personal outcome when fairness requires it.',
    verb: 'acts straight when it costs',
    archetype: 'a straight dealer',
    observed: {
      high: 'Disclosed their own interest where it existed and accepted a worse personal outcome when fairness required it. Behaviour was consistent across every integrity-relevant scenario, which is the basis for the level.',
      mid: 'Chose the honest route in each scenario where the stakes were visible. Disclosure of their own interest arrived when prompted rather than volunteered.',
      low: 'Followed the rules as written. Where the right thing carried a personal cost the choice went both ways — the rubric looks for consistency.',
    },
    implications: {
      high: 'Trustworthy with client information and with discretionary judgement.',
      mid: 'Trustworthy in structured settings. Discretionary grey areas deserve a named escalation path.',
      low: 'Set explicit norms early and revisit them. Consistency follows clarity at this stage.',
    },
  },
  {
    id: 'resil',
    name: 'Resilience',
    short: 'Resilience',
    noun: 'resilience',
    family: 'Character & Drive',
    basis: 'CD-RISC · Brief Resilience Scale',
    probe: 'When something went badly wrong on something you cared about, what did you do in the following week?',
    demoHigh: 'Absorbs setbacks, returns with a plan',
    demoLow: 'Reframes setbacks, agency still building',
    card: 'Absorbs setbacks with their real weight and returns with a revised plan.',
    verb: 'comes back stronger from setbacks',
    archetype: 'a steady hand',
    observed: {
      high: 'Acknowledged setbacks with their real weight, reframed them as information and returned with a revised plan inside the same scenario. Agency held under sustained pressure.',
      mid: 'Recovered from setbacks and kept working. The reframe arrived after a pause; agency under sustained pressure was mostly consistent.',
      low: 'Acknowledged setbacks with their real weight and reframed them as information. Sense of agency under sustained pressure was less consistent, most visibly in {s1}.',
    },
    implications: {
      high: 'Holds up through an extended high-pressure period without extra scaffolding.',
      mid: 'Handles normal setbacks well. An extended high-pressure stretch deserves a check-in cadence.',
      low: 'May need support through the first extended high-pressure period. Improving with each attempt.',
    },
  },
]

export const REPORT_FAMILIES: ReportFamily[] = ['Reasoning & Judgement', 'People & Influence', 'Character & Drive']

/* ── Scores: dashboard capabilities → report capabilities ──────────── */

const avg = (scores: CapabilityScores, keys: string[]) =>
  Math.round(keys.reduce((n, k) => n + (scores[k] ?? 0), 0) / keys.length)

/** Deterministic derivation — the report re-expresses the same evidence. */
export function reportScores(scores: CapabilityScores): Record<string, number> {
  return {
    psca: avg(scores, ['Problem Solving', 'Reasoning & Critical Thinking']),
    dmu: scores['Judgement & Decision-Making'] ?? 0,
    sa: scores['Situational Awareness & Systems Thinking'] ?? 0,
    adapt: scores['Adaptability & Cognitive Flexibility'] ?? 0,
    la: avg(scores, ['Reasoning & Critical Thinking', 'Adaptability & Cognitive Flexibility']),
    eq: scores['Emotional Intelligence'] ?? 0,
    lead: scores['Leadership & Influence'] ?? 0,
    collab: scores['Collaboration'] ?? 0,
    integ: scores['Integrity & Ethics'] ?? 0,
    resil: scores['Execution & Ownership'] ?? 0,
  }
}

/* ── Levels (five, criterion-referenced in the document's language) ── */

export type LevelBand = 'high' | 'mid' | 'low'

export interface ReportLevel {
  label: string
  /** 5 = Distinguished … 1 = Emerging; also the filled-square count. */
  filled: number
  /** Copy band for observed behaviours / implications. */
  band: LevelBand
  /** Style hook: lv-dst | lv-adv | lv-pro | lv-dev | lv-emg. */
  cls: string
  /** Italic tail line on a headline-strength card. */
  tail: string
}

export function reportLevel(score: number): ReportLevel {
  if (score >= 88) return { label: 'Distinguished', filled: 5, band: 'high', cls: 'lv-dst', tail: 'A level we see rarely at this stage.' }
  if (score >= 76) return { label: 'Advanced', filled: 4, band: 'high', cls: 'lv-adv', tail: 'A clear strength from day one.' }
  if (score >= 62) return { label: 'Proficient', filled: 3, band: 'mid', cls: 'lv-pro', tail: 'Sound and reliable. Ready for real responsibility.' }
  if (score >= 48) return { label: 'Developing', filled: 2, band: 'low', cls: 'lv-dev', tail: 'Present and improving with each attempt.' }
  return { label: 'Emerging', filled: 1, band: 'low', cls: 'lv-emg', tail: 'An early signal only.' }
}

/** Page-1 legend row, verbatim from the designed document. */
export const LEVEL_LEGEND: { label: string; cls: string; blurb: string }[] = [
  { label: 'Distinguished', cls: 'lv-dst', blurb: 'Performs at a level we see rarely. Expert reasoning, sustained.' },
  { label: 'Advanced', cls: 'lv-adv', blurb: 'A clear strength you can rely on from day one.' },
  { label: 'Proficient', cls: 'lv-pro', blurb: 'Sound and reliable. Ready for real responsibility.' },
  { label: 'Developing', cls: 'lv-dev', blurb: 'Present and improving with each attempt.' },
  { label: 'Emerging', cls: 'lv-emg', blurb: 'An early signal only.' },
]

/** Page 4 — Reading the levels, verbatim from the designed document. */
export const LEVEL_RUBRIC: { label: string; cls: string; filled: number; evidence: string; atWork: string; confirm: string }[] = [
  {
    label: 'Distinguished', cls: 'lv-dst', filled: 5,
    evidence: 'The expert behaviours in the rubric appear in every scenario that elicits the capability, unprompted, and hold under time pressure and conflicting goals. No error pattern. Example for Problem-Solving: tests the assumptions in the brief before acting, every time, and weighs evidence by quality rather than volume.',
    atWork: 'Performs the capability at a level we see rarely at this stage. Others will route hard problems in this area to them early. Ready for ownership that would normally wait a year or more.',
    confirm: 'Interview: the probe should produce a precise, first-person example with the expert behaviour in it, and a second example on request. First 90 days: the manager sees the behaviour without asking, and sees it under pressure.',
  },
  {
    label: 'Advanced', cls: 'lv-adv', filled: 4,
    evidence: 'The expert behaviours in the rubric appear in at least three quarters of the scenarios that elicit the capability, unprompted, with no error pattern. Example for Decision-Making: names the unknowns and pre-sets a reversal trigger before committing.',
    atWork: 'Works independently on unfamiliar problems in this capability. Peers and managers seek their judgement on it within the first months.',
    confirm: 'Interview: the probe should produce a specific, first-person example with the expert behaviour in it without you leading. First 90 days: the manager sees the behaviour without having to ask for it.',
  },
  {
    label: 'Proficient', cls: 'lv-pro', filled: 3,
    evidence: 'The core behaviours appear reliably in most scenarios; the expert behaviours appear sometimes. Sound reasoning, no recurring flaw. Example for Collaboration: monitors teammates and offers back-up, but does not yet reshape the plan on team input every time.',
    atWork: 'Performs the capability well under normal supervision. Graduate-ready. Will handle routine and moderately novel situations without escalation.',
    confirm: 'Interview: a solid example, possibly needing one follow-up question to reach the detail. First 90 days: reliable delivery; growth shows when given stretch, not when left alone.',
  },
  {
    label: 'Developing', cls: 'lv-dev', filled: 2,
    evidence: 'The core behaviours appear in some scenarios but not consistently, or only when the scenario cues are strong. The gap is named in the observed-behaviours column on pages 2 and 3.',
    atWork: 'Present but uneven. Needs structured feedback and exposure. Improves quickly when the manager names the behaviour they want to see.',
    confirm: 'Interview: expect a generic or second-hand example; probe for what they did personally. First 90 days: set one explicit expectation for this capability and review it at 30 and 60 days.',
  },
  {
    label: 'Emerging', cls: 'lv-emg', filled: 1,
    evidence: 'The behaviour appears rarely or in fragments across the scenarios that elicit it. There is not enough consistent evidence to place it higher. This is an early signal, not a fail.',
    atWork: 'Do not rely on this capability yet. Suitable where the role does not lean on it, or where development support is deliberate.',
    confirm: 'Interview: ask for any example at all; a candid answer about the gap is itself a positive indicator. First 90 days: pair with a colleague strong in it; check the live record for current levels.',
  },
]

/** Page 5 — Measurement basis rows, verbatim from the designed document. */
export const MEASUREMENT_ROWS: { element: string; status: string; detail: string }[] = [
  { element: 'How a level is set', status: 'Pattern across scenarios', detail: 'Every response is scored against the capability’s behavioural anchors. A level is issued only when at least five scenarios elicit the capability and results vary by no more than one level; otherwise the report shows Insufficient evidence.' },
  { element: 'Reference point', status: 'Criterion-referenced', detail: 'Levels are set against the rubric, not by ranking against other candidates. Ranking against the Launch talent pool is available to employers in the talent-pool view.' },
  { element: 'What is measured', status: 'Ten capabilities', detail: 'Three families: Reasoning & Judgement, People & Influence, Character & Drive. Each capability is scored on its own terms; the ten are not summed into a single score.' },
  { element: 'Method', status: 'Scenario-based work sample', detail: 'Open-text responses to realistic workplace scenarios. Each capability has its own rubric and every scoring rule is tied to a published instrument, listed on page 1. Length and vocabulary do not score.' },
  { element: 'Reasoning ability', status: 'Measured applied', detail: 'Numerical, verbal and logical reasoning are assessed inside the scenarios, through Problem-Solving and Decision-Making, where the ability is used. There is no standalone abstract reasoning score.' },
  { element: 'Reliability', status: 'Consistent', detail: 'The same response produces the same score. Scores align with trained expert raters. Responses flagged for cultural context, ethical judgement or ambiguity are reviewed by a human marker.' },
  { element: 'Fairness controls', status: 'In place', detail: 'No demographic field is a scoring input. Free-text responses are tested counterfactually so that a personal disclosure in the text does not move a score.' },
  { element: 'Values and culture alignment', status: 'Available', detail: 'Employers share the values and behaviours that matter in their culture. Launch weights the relevant capabilities and scenario content so alignment is scored from demonstrated behaviour and reported alongside the standard levels.' },
  { element: 'Validity of this copy', status: 'To 21 July 2028', detail: 'Levels describe performance on the date this copy was produced. The record is live and moves with the student’s performance, and the student can issue a current copy at any time.' },
]

/* ── Generated prose ───────────────────────────────────────────────── */

const joinAnd = (items: string[]) =>
  items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`

export interface ScoredCap { cap: ReportCap; score: number; level: ReportLevel }

export function scoredCaps(scores: CapabilityScores): ScoredCap[] {
  const rs = reportScores(scores)
  return REPORT_CAPS.map((cap) => ({ cap, score: rs[cap.id], level: reportLevel(rs[cap.id]) }))
}

/** "Distinguished on analysis, Advanced on decisions under uncertainty, …" */
function levelListing(caps: ScoredCap[]): string {
  const order = ['Distinguished', 'Advanced', 'Proficient', 'Developing', 'Emerging']
  const parts: string[] = []
  for (const label of order) {
    const nouns = caps.filter((c) => c.level.label === label).map((c) => c.cap.noun)
    if (nouns.length > 0) parts.push(`${label} on ${joinAnd(nouns)}`)
  }
  return parts.join(', ')
}

const FAMILY_CLOSER: Record<ReportFamily, string> = {
  'Reasoning & Judgement': 'The combination is a {role} who can take an unfamiliar problem apart and commit to a course of action without being told what to think.',
  'People & Influence': 'The influence style is explanatory and relational rather than positional — people come along because the reasoning is visible.',
  'Character & Drive': '{closer}',
}

/** Family banner blurb (pages 2–3). */
export function familyBlurb(family: ReportFamily, all: ScoredCap[], first: string, uni: boolean): string {
  const caps = all.filter((c) => c.cap.family === family)
  const famMeans = REPORT_FAMILIES.map((f) => {
    const fc = all.filter((c) => c.cap.family === f)
    return { f, mean: fc.reduce((n, c) => n + c.score, 0) / fc.length }
  })
  const strongest = famMeans.reduce((a, b) => (b.mean > a.mean ? b : a)).f
  const lead = family === strongest ? `${first}’s strongest family. ` : ''
  const famMean = caps.reduce((n, c) => n + c.score, 0) / caps.length
  let closer = FAMILY_CLOSER[family].replace('{role}', uni ? 'graduate' : 'school leaver')
  if (famMean < 62) closer = 'The foundations are present; consistency across scenarios is the current work, and the trend is upward.'
  if (family === 'Character & Drive') {
    const weakest = caps.reduce((a, b) => (b.score < a.score ? b : a))
    closer = weakest.level.band === 'high'
      ? 'Consistent behaviour across scenarios is the basis for both levels.'
      : `${weakest.cap.short} is the development priority and is trending up with each attempt.`
  }
  return `${lead}${levelListing(caps)}. ${closer}`
}

/** Launch summary quote (page 1). */
export function launchSummary(student: EdStudent, all: ScoredCap[], uni: boolean, yearLabel: string): string {
  const first = student.name.split(' ')[0]
  const top = [...all].sort((a, b) => b.score - a.score)
  const strengths = top.slice(0, 3).map((c) => c.cap.verb)
  const weakest = top[top.length - 1]
  const where = uni
    ? (student.yearGroup >= 4 ? 'is in the Honours year' : `is in ${yearLabel.toLowerCase()} of ${student.course ?? 'their degree'}`)
    : `is in Year ${student.yearGroup}`
  const record = uni ? 'a transcript' : 'a report card'
  return `${first} ${where}, and the capability profile tells a story ${record} can’t. Across live workplace scenarios ${first} ${joinAnd(strengths)}. ${weakest.cap.short} is the one to keep developing, and it is improving with each attempt.`
}

/** Role-fit paragraph (page 3 closer and the page-6 card). */
export function roleFitReading(student: EdStudent, all: ScoredCap[], uni: boolean): string {
  const top = [...all].sort((a, b) => b.score - a.score)
  const [a, b] = top
  const weakest = top[top.length - 1]
  const roles = uni
    ? `graduate roles in ${(student.careerInterest ?? 'their field').toLowerCase()}`
    : 'school-leaver and early-entry programs'
  return `The pattern is ${a.cap.archetype} and ${b.cap.archetype} whose ${weakest.cap.noun} is still being built. For ${roles}, that is a hire to back with a manager who gives early, direct feedback — and to stretch quickly on problems that need taking apart.`
}

/** Score trajectory: overall growth and the two biggest per-capability gains. */
export function reportGains(student: EdStudent): { overall: number; gains: { short: string; pct: number }[]; weakestGain: { short: string; pct: number } } {
  const firstSnap = student.history[0]?.scores ?? student.scores
  const before = reportScores(firstSnap)
  const now = reportScores(student.scores)
  const deltas = REPORT_CAPS.map((cap) => ({
    short: cap.short,
    pct: Math.max(2, (now[cap.id] ?? 0) - (before[cap.id] ?? 0)),
    score: now[cap.id] ?? 0,
  }))
  const overall = Math.max(2, Math.round(deltas.reduce((n, d) => n + d.pct, 0) / deltas.length))
  const gains = [...deltas].sort((a, b) => b.pct - a.pct).slice(0, 2)
  const weakest = deltas.reduce((a, b) => (b.score < a.score ? b : a))
  return { overall, gains, weakestGain: { short: weakest.short, pct: weakest.pct } }
}

/** "Property Internship — Charter Hall" → "the Charter Hall scenario". */
export function scenarioRef(title?: string): string {
  if (!title) return 'a timed scenario'
  const tail = title.includes('—') ? title.split('—').pop()!.trim() : title
  return `the ${tail} scenario`
}

/** Fill {s1}/{s2} placeholders with the student's recent scenario titles. */
export function fillScenarios(text: string, runTitles: string[]): string {
  return text
    .replace('{s1}', scenarioRef(runTitles[0]))
    .replace('{s2}', scenarioRef(runTitles[1] ?? runTitles[0]))
}
