import type { ScenarioVariant } from '@/lib/roles'

/**
 * Generic intake question — runs BEFORE the scenario. Two kinds:
 *
 * - 'open-text'   : free-response answer; AI evaluates against the ticked
 *                   templated criteria; returns a 0–10 score per question.
 * - 'hard-filter' : multiple choice answer; pass/fail check against the
 *                   org's allowed answers. Candidate still plays the scenario
 *                   either way — failed filters just badge the submission
 *                   as 'Not qualified' so the org can sort/filter quickly.
 *
 * Lives on the scenario alongside the decision steps.
 */
export interface GenericIntakeQuestion {
  id: string
  kind?: 'open-text' | 'hard-filter'  // defaults to 'open-text' for back-compat
  prompt: string
  /** Only used when kind === 'open-text' — refs into CRITERION_TEMPLATES. */
  criterionIds: string[]
  /** Only used when kind === 'hard-filter' — every possible answer the
   *  candidate picks from. */
  allowedAnswers?: string[]
  /** Only used when kind === 'hard-filter' — which of the allowedAnswers
   *  ARE the passing answers. If omitted, defaults to "the first one is
   *  the pass" for back-compat. The candidate is flagged below-benchmark
   *  if their pick is not in this list. */
  passingAnswers?: string[]
  /** Only used when kind === 'open-text' — minimum AI score (0–10) the
   *  averaged criteria must hit for the candidate to pass this question.
   *  Undefined ⇒ no benchmark (question is scored but never flagged). */
  minScore?: number
}

export type FactorKind = 'time' | 'live' | 'meter' | 'signal' | 'metric' | 'quote'
export type SceneId = 'locker' | 'whiteboard' | 'press' | 'court' | 'tunnel' | 'reflect' | string
export type Mood = 'private' | 'tense' | 'loud' | 'reflective' | string
export type Theme = 'cream' | 'cinema' | 'professional'

/**
 * Map a scenario variant to a play-flow theme.
 *
 * 'playful' → 'cinema' (today's dramatic, colourful default — preserves the
 * existing Quick-Play look exactly).
 * 'professional' → 'professional' (the new restrained, cooler register — see
 * `.lq-play-root[data-theme="professional"]` in play.css).
 */
export function themeForVariant(v?: ScenarioVariant): Theme {
  return v === 'professional' ? 'professional' : 'cinema'
}

export interface Factor {
  label: string
  value?: string
  kind?: FactorKind | string
  timeSeconds?: number
  timeId?: string
  tone?: 'mono' | string
}

export interface OptionStat {
  label: string
  change: string
}

export interface DecisionOption {
  id: string
  label: string
  skill?: string
  score?: number
  echo?: string
  consequence?: string
  surprise?: string
  insight?: string
  insightNavigate?: string
  ghost?: string
  stats?: OptionStat[]
  reactionColor?: string
}

export interface DecisionStep {
  kind: 'decision'
  mood?: Mood
  scene: SceneId
  sceneCaption?: string
  eyebrow: string
  prompt: string
  keyAsk?: string
  transition?: string
  factors: Factor[]
  options: DecisionOption[]
}

export interface OpeningContent {
  eyebrow: string
  title: string
  body: string
  imageCaption?: string
  ambient: Factor[]
}

export interface OutcomeContent {
  eyebrow: string
  title: string
  body: string
}

export interface ReflectContent {
  asker?: string
  prompt?: string
}

export interface Scenario {
  id: string
  role: string
  meta: string
  goal: { label: string; target: number }
  opening: OpeningContent
  steps: DecisionStep[]
  outcome: OutcomeContent
  reflect?: ReflectContent
  /** Visual register. Optional — when unset, the play flow keeps its default look. */
  variant?: ScenarioVariant
}

export interface Profile {
  name: string
  pronouns?: string
}

/* History entry — mirrors the LQ App entry shape. `kind: 'decision'` carries
   the full picked-option payload; `kind: 'reflect'` is just a label. */
export interface HistoryEntry {
  kind: 'decision' | 'reflect'
  id?: string
  label: string
  skill?: string
  consequence?: string
  echo?: string
  surprise?: string
  insight?: string
  insightNavigate?: string
  stats?: OptionStat[]
  ghost?: string
  score?: number
  reactionColor?: string
  stepIdx?: number
  custom?: boolean
  /** Candidate's follow-up choice if the picked option carried a branch.
   *  Captured during the option-followup phase and rolled up into the
   *  scenario history for analytics + the partner's review surface. */
  followUp?: {
    choiceId: string
    text: string
    leaning: 'support' | 'neutral' | 'challenge'
    /** Candidate's own words explaining the pick — optional, recommended.
     *  Displayed to the partner on the review surface alongside the picked
     *  choice; this is the free-text they can score against. */
    reasoning?: string
  }
}

export type CompletionResult =
  | { kind: 'back-to-dashboard' }
  | { kind: 'create-new-scenario' }
  | { kind: 'department-selected'; company: string; department: string }
