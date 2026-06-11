/**
 * Stub AI evaluator for generic intake answers.
 *
 * Deterministic, dependency-free — it inspects the candidate's free-text
 * answer for cues that map to each ticked criterion and returns a 0–10
 * score plus a one-line rationale per criterion. Aggregates the criteria
 * into a single per-question score (mean of the ticked criterion scores).
 *
 * Designed so the dev team can swap in a real LLM call later without
 * changing the rest of the platform — same input/output shape.
 */

import { CRITERION_TEMPLATES, type CriterionTemplate } from '@/lib/builderData'
import type { GenericIntakeQuestion } from '@/lib/play/types'

export interface CriterionVerdict {
  criterionId: string
  criterionLabel: string
  score: number      // 0–10
  rationale: string
}

export interface QuestionVerdict {
  questionId: string
  prompt: string
  answer: string
  /** Mean of the ticked criterion scores (0 if no criteria). */
  overall: number
  oneLiner: string
  criteria: CriterionVerdict[]
}

/* ---------------------------------------------------------------- */
/* Heuristics — each criterion gets a small keyword/cue dictionary.  */
/* Real AI replaces this; the data shape stays the same.             */
/* ---------------------------------------------------------------- */

const KEYWORDS: Record<string, string[]> = {
  'strong-interest':   ['interested', 'excited', 'passionate', 'specifically', 'your team', 'your work', 'your', "i've followed", "i've been watching"],
  'career-narrative':  ['journey', 'led me', 'progressed', 'over the years', 'started', 'transitioned', 'pivoted', 'after', 'before', 'background'],
  'genuine-curiosity': ['research', 'read', 'watched', 'noticed', 'curious', 'wonder', 'fascinated', 'how do you', 'why does'],
  'references-values': ['values', 'principles', 'mission', 'culture', 'integrity', 'transparency', 'ownership', 'craft', 'human', 'people-first'],
  'mission-fit':       ['mission', 'purpose', 'why it matters', 'meaningful', 'impact', 'change', 'make a difference', 'real-world'],
  'tone-confidence':   ['i can', 'i will', 'i would', "i'd", 'i believe', "i'm confident", 'i know', 'my approach'],
  'clear-concise':     [],      // judged by length penalty
  'specific-examples': ['for example', 'specifically', 'last', 'in 2', 'i led', 'i built', '%', '$', 'k ', 'thousand', 'million'],
  'relevant-experience': ['experience', 'worked', 'led', 'built', 'managed', 'shipped', 'launched', 'designed'],
  'self-aware-growth': ['learning', 'i still', 'i need to', 'i want to grow', 'improve', 'work on', "i'm not great at", "i don't yet"],
  'demonstrable-skill': ['built', 'shipped', 'designed', 'created', 'wrote', 'launched', 'analysed', 'analyzed', 'researched'],
  'team-collaborative': ['team', 'we', 'together', 'colleague', 'partner', 'collaborated', 'with', "we built"],
  'ownership-instinct': ['i owned', 'i led', 'i drove', 'i decided', 'i was responsible', 'my responsibility', 'mine to'],
  'long-game':         ['three years', '5 years', 'long-term', 'eventually', 'over time', 'grow into', 'build', 'trajectory', 'career'],
}

const RATIONALE_HIT: Record<string, string> = {
  'strong-interest':   'Answer names the role or org specifically — not generic enthusiasm.',
  'career-narrative':  'Answer describes a believable arc into this work.',
  'genuine-curiosity': 'Answer shows the candidate has actually researched the work.',
  'references-values': 'Answer echoes language tied to organisational values.',
  'mission-fit':       'Answer connects to a purpose-level reason for applying.',
  'tone-confidence':   'Answer is decisive, uses first-person agency.',
  'clear-concise':     'Answer is on-point and reasonably tight.',
  'specific-examples': 'Answer cites concrete examples or numbers.',
  'relevant-experience': 'Answer points at directly-relevant prior work.',
  'self-aware-growth': 'Answer candidly names growth areas.',
  'demonstrable-skill': 'Answer ties a concrete skill to a concrete output.',
  'team-collaborative': 'Answer credits a team / uses collaborative language.',
  'ownership-instinct': 'Answer takes first-person ownership of decisions.',
  'long-game':         'Answer references long-horizon thinking or trajectory.',
}

const RATIONALE_MISS: Record<string, string> = {
  'strong-interest':   'Answer is generic — no specific signal of interest in this role.',
  'career-narrative':  'Answer doesn’t explain the path into this work.',
  'genuine-curiosity': 'No evidence of research into the role or org.',
  'references-values': 'No echo of organisational values or principles.',
  'mission-fit':       'No purpose-level connection articulated.',
  'tone-confidence':   'Answer hedges — light on first-person agency.',
  'clear-concise':     'Answer rambles or hedges; could be tightened.',
  'specific-examples': 'No concrete examples or numbers cited.',
  'relevant-experience': 'No directly-relevant prior work named.',
  'self-aware-growth': 'No acknowledgement of growth areas.',
  'demonstrable-skill': 'No concrete skill-to-output link.',
  'team-collaborative': 'Answer is solo-only — no team signal.',
  'ownership-instinct': 'Light on first-person agency.',
  'long-game':         'No long-horizon framing.',
}

function lowercase(s: string): string {
  return (s || '').toLowerCase().trim()
}

function countHits(needle: string[], haystack: string): number {
  if (!needle.length) return 0
  let n = 0
  for (const k of needle) if (k && haystack.includes(k)) n++
  return n
}

function scoreCriterion(c: CriterionTemplate, answer: string): CriterionVerdict {
  const text = lowercase(answer)
  const len = text.split(/\s+/).filter(Boolean).length

  // Empty / very short → weak by definition
  if (len < 8) {
    return {
      criterionId: c.id,
      criterionLabel: c.label,
      score: Math.max(0, Math.min(3, Math.floor(len / 3))),
      rationale: 'Answer is too short to evaluate meaningfully.',
    }
  }

  // Clear-and-concise is judged by length range, not keywords
  if (c.id === 'clear-concise') {
    const ideal = len >= 25 && len <= 120
    return {
      criterionId: c.id,
      criterionLabel: c.label,
      score: ideal ? 9 : len < 25 ? 5 : 6,
      rationale: ideal ? RATIONALE_HIT[c.id] : RATIONALE_MISS[c.id],
    }
  }

  const keywords = KEYWORDS[c.id] || []
  const hits = countHits(keywords, text)
  // Map hits → 0–10 with a small length bonus
  const lengthBonus = Math.min(2, Math.floor(len / 60))
  const base = Math.min(10, hits * 2.2 + lengthBonus)
  const score = Math.round(Math.max(0, Math.min(10, base)))
  return {
    criterionId: c.id,
    criterionLabel: c.label,
    score,
    rationale: score >= 6 ? RATIONALE_HIT[c.id] : RATIONALE_MISS[c.id],
  }
}

/* ---------------------------------------------------------------- */
/* Public API                                                       */
/* ---------------------------------------------------------------- */

export function evaluateAnswer(
  question: GenericIntakeQuestion,
  answer: string,
): QuestionVerdict {
  const criteria: CriterionVerdict[] = question.criterionIds
    .map((cid) => CRITERION_TEMPLATES.find((c) => c.id === cid))
    .filter((c): c is CriterionTemplate => Boolean(c))
    .map((c) => scoreCriterion(c, answer))

  const overall = criteria.length
    ? Math.round(criteria.reduce((n, v) => n + v.score, 0) / criteria.length)
    : 0
  const oneLiner = (() => {
    if (criteria.length === 0) return 'Stored unscored — no AI criteria selected.'
    if (overall >= 8) return 'Strong: hits the criteria well.'
    if (overall >= 5) return 'OK: partially meets the criteria.'
    return 'Weak: misses most of the criteria.'
  })()

  return {
    questionId: question.id,
    prompt: question.prompt,
    answer,
    overall,
    oneLiner,
    criteria,
  }
}

export function evaluateAll(
  questions: GenericIntakeQuestion[],
  answers: Record<string, string>,
): QuestionVerdict[] {
  return questions.map((q) => evaluateAnswer(q, answers[q.id] || ''))
}
