/**
 * Journey profile — the student's intake answers, run history, and the
 * mock recommendation brain.
 *
 * The intake is the Ikigai triangle asked like a mate, not a form:
 *   1. What are you passionate about?          (love)
 *   2. What do you reckon you're good at?      (good at → seeds FUSE priors)
 *   3. You're 25 — what are you paid to do?    (paid for → industry funnel)
 * Then ONE tailored proposal ("we're thinking of making you X — go
 * ahead, or what would you rather?") before anything is played.
 *
 * After each run we record what was demonstrated and how they decided,
 * then suggest: (a) a scenario they'd be EFFECTIVE in, off their top
 * demonstrated capability, and (b) something entirely different.
 * Recommendations read as bespoke, generated scenarios (never a
 * catalogue) — clicking routes to the nearest built content. The real
 * build generates them with FUSE.
 */

import { journeyForPassion, journeyById, JOURNEYS } from '@/lib/play/journeyScenarios'
import type { Scenario } from '@/lib/play/types'

/* ---------------- Storage ---------------- */

export interface RunRecord {
  journeyId: string
  passionLabel: string
  skillCounts: Record<string, number>
  score: number
  completedAt: string
}

export interface JourneyProfile {
  passion: string
  strengths: string[]        // chip labels, plus free text if given
  strengthCaps: string[]     // the FUSE capabilities those chips map to
  payFor: string
  createdAt: string
  runs: RunRecord[]
}

const PROFILE_KEY = 'launch.journeyProfile.v1'

export function loadProfile(): JourneyProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    return p && typeof p === 'object' ? { runs: [], ...p } : null
  } catch {
    return null
  }
}

export function saveProfile(p: JourneyProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
  } catch {}
}

export function clearProfile() {
  try {
    localStorage.removeItem(PROFILE_KEY)
  } catch {}
}

export function appendRun(run: RunRecord) {
  const p = loadProfile()
  if (!p) return
  p.runs = [...(p.runs || []), run]
  saveProfile(p)
}

/* ---------------- Intake chips ---------------- */

/** Self-assessed strengths, phrased for a Year 8 — each secretly maps
 *  to a FUSE capability so the demo shows intake seeding the engine. */
export const STRENGTH_CHIPS: { id: string; label: string; cap: string }[] = [
  { id: 'people', label: 'Talking people around', cap: 'Leadership & Influence' },
  { id: 'calm', label: 'Staying calm when it all goes wrong', cap: 'Emotional Intelligence' },
  { id: 'organise', label: 'Organising chaos', cap: 'Situational Awareness & Systems Thinking' },
  { id: 'why', label: 'Working out why things happen', cap: 'Reasoning & Critical Thinking' },
  { id: 'right', label: 'Doing the right thing even when it costs', cap: 'Integrity & Ethics' },
  { id: 'improvise', label: 'Making it up as I go', cap: 'Adaptability & Cognitive Flexibility' },
]

export const PAY_CHIPS: { id: string; label: string; journeyId: string }[] = [
  { id: 'business', label: 'Running my own business', journeyId: 'journey-market' },
  { id: 'coach', label: 'Coaching or teaching people', journeyId: 'journey-footy' },
  { id: 'build', label: 'Building or fixing real things', journeyId: 'journey-farm' },
  { id: 'creative', label: 'Something creative', journeyId: 'journey-band' },
  { id: 'sport', label: 'Sport, somehow', journeyId: 'journey-surf' },
  { id: 'unsure', label: 'No idea yet — something real', journeyId: '' },
]

/* ---------------- The proposal ---------------- */

/** Generated-feeling scenario pitches per built target. */
const PROPOSAL_PITCH: Record<string, { title: string; hook: string }> = {
  'journey-footy': {
    title: 'You’re organising the grand final at your local footy club.',
    hook: 'Twelve days, one ground, a few hundred people coming — and the clipboard is yours.',
  },
  'journey-surf': {
    title: 'You’re running the junior surf comp at the point.',
    hook: 'Twenty kids, a shifting bank, and every call on the beach is yours.',
  },
  'journey-farm': {
    title: 'You’re second-in-command for harvest week.',
    hook: 'Four days, three paddocks, a storm on Thursday — the week runs through you.',
  },
  'journey-band': {
    title: 'You’re getting a band to show night in three weeks.',
    hook: 'The drummer just quit, the song is half-written, and the slot is prime time.',
  },
  'journey-market': {
    title: 'You’re taking your own stall to market day.',
    hook: 'Sixty things you made, one trestle table, eight hours of real customers.',
  },
}

export interface ScenarioProposal {
  journeyId: string
  title: string
  hook: string
  /** "Because you love X, reckon you're good at Y, and want to Z —" */
  framing: string
}

export function proposeScenario(
  passion: string,
  strengths: string[],
  payFor: string,
  payJourneyId: string,
): ScenarioProposal {
  // Passion text drives the match; the pay answer breaks ties.
  let target: Scenario = journeyForPassion(passion)
  const passionMatched = target.id !== 'journey-surf' || /surf|beach|ocean|swim|wave/i.test(passion)
  if (!passionMatched && payJourneyId) {
    target = journeyById(payJourneyId) || target
  }
  const pitch = PROPOSAL_PITCH[target.id] || PROPOSAL_PITCH['journey-footy']
  const strengthBit =
    strengths.length > 0
      ? `reckon you’re good at ${strengths.slice(0, 2).map((s) => s.toLowerCase()).join(' and ')}`
      : 'back yourself when it counts'
  const payBit = payFor && payFor !== 'No idea yet — something real'
    ? `see yourself ${payFor.toLowerCase().replace(/^running/, 'running')}`
    : 'want something real'
  // Flip first-person words when playing their answer back to them
  // ("my sister" → "your sister").
  const passionEcho = passion
    .toLowerCase()
    .replace(/\bmy\b/g, 'your')
    .replace(/\bme\b/g, 'you')
    .replace(/\bi\b/g, 'you')
  return {
    journeyId: target.id,
    title: pitch.title,
    hook: pitch.hook,
    framing: `Because you love ${passionEcho}, ${strengthBit}, and ${payBit} one day — we built you this:`,
  }
}

/* ---------------- The analysis ---------------- */

/** One line per capability — "how you decide", in their language. */
const STYLE_LINES: Record<string, string> = {
  'Leadership & Influence': 'You bring people with you — you’d rather convince than command.',
  'Emotional Intelligence': 'You read the person before the problem.',
  'Situational Awareness & Systems Thinking': 'You see the whole board before you move a piece.',
  'Reasoning & Critical Thinking': 'You want the why before the what.',
  'Integrity & Ethics': 'You’ll pay full price to keep things straight.',
  'Adaptability & Cognitive Flexibility': 'When the plan breaks, you get faster.',
  'Judgement & Decision-Making': 'You commit. No half-decisions.',
  'Self-direction': 'When the options don’t fit, you make your own lane.',
}

export function styleLinesFromCounts(skillCounts: Record<string, number>): string[] {
  const top = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([cap]) => cap)
  return top.map((cap) => STYLE_LINES[cap]).filter(Boolean)
}

/* ---------------- The recommendations ---------------- */

/** Generated-feeling next-scenario pitches (routes to built content). */
const REC_PITCH: Record<string, { title: string; blurb: string }> = {
  'journey-surf': {
    title: 'The rip current call',
    blurb: 'Twenty kids in the water and the bank just shifted. Your comp, your whistle.',
  },
  'journey-footy': {
    title: 'The grand final clipboard',
    blurb: 'Twelve days to build a day a whole town shows up for.',
  },
  'journey-farm': {
    title: 'Storm’s coming Thursday',
    blurb: 'Four days, three paddocks, five people — and the sky has opinions.',
  },
  'journey-band': {
    title: 'Three weeks to show night',
    blurb: 'A quit drummer, a nervous first-timer, and a prime-time slot.',
  },
  'journey-market': {
    title: 'First real customers at 9am',
    blurb: 'Your own stall, your own prices, eight hours of small business.',
  },
}

/** For "effective in" — which built scenario exercises each capability hardest. */
const CAP_TO_JOURNEYS: Record<string, string[]> = {
  'Leadership & Influence': ['journey-band', 'journey-surf', 'journey-market'],
  'Emotional Intelligence': ['journey-band', 'journey-farm', 'journey-surf'],
  'Situational Awareness & Systems Thinking': ['journey-surf', 'journey-farm', 'journey-footy'],
  'Reasoning & Critical Thinking': ['journey-market', 'journey-farm', 'journey-band'],
  'Integrity & Ethics': ['journey-market', 'journey-surf', 'journey-footy'],
  'Adaptability & Cognitive Flexibility': ['journey-band', 'journey-market', 'journey-surf'],
  'Judgement & Decision-Making': ['journey-farm', 'journey-surf', 'journey-market'],
  'Self-direction': ['journey-market', 'journey-farm', 'journey-band'],
}

/** Contrast pairs for "something entirely different". */
const CONTRAST: Record<string, string> = {
  'journey-footy': 'journey-market',
  'journey-surf': 'journey-band',
  'journey-farm': 'journey-band',
  'journey-band': 'journey-farm',
  'journey-market': 'journey-surf',
}

export interface NextRec {
  journeyId: string
  title: string
  blurb: string
  reason: string
}

export function recommendNext(
  lastJourneyId: string,
  topCap: string,
  playedIds: string[],
): { effective: NextRec; different: NextRec } {
  const played = new Set([...playedIds, lastJourneyId])
  const capList = CAP_TO_JOURNEYS[topCap] || CAP_TO_JOURNEYS['Judgement & Decision-Making']
  const effId =
    capList.find((id) => !played.has(id)) ||
    JOURNEYS.map((j) => j.id).find((id) => !played.has(id)) ||
    capList[0]
  const diffCandidate = CONTRAST[lastJourneyId] || 'journey-market'
  let diffId = diffCandidate !== effId ? diffCandidate : CONTRAST[diffCandidate] || 'journey-surf'
  if (diffId === effId) {
    diffId = JOURNEYS.map((j) => j.id).find((id) => id !== effId && !played.has(id)) || diffId
  }
  const eff = REC_PITCH[effId]
  const diff = REC_PITCH[diffId]
  const capShort = topCap.split(' & ')[0].toLowerCase()
  return {
    effective: {
      journeyId: effId,
      title: eff.title,
      blurb: eff.blurb,
      reason: `Built for the ${capShort} you just showed.`,
    },
    different: {
      journeyId: diffId,
      title: diff.title,
      blurb: diff.blurb,
      reason: 'Nothing like what you just did — on purpose.',
    },
  }
}
