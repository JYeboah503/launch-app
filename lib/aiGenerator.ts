/**
 * AI scenario generator — produces grounded scenario questions + pre-qualifier
 * suggestions from the partner's setup inputs (JD + criteria + attributes +
 * values + career stage + count + difficulty).
 *
 * The function signature is shaped like a real LLM call (one async function,
 * a single input object, a typed return). Internally it's a deterministic
 * template engine for the demo so the build works offline at no cost.
 *
 * Dev hand-off: replace the body of `generateScenario` with an actual API
 * call (Anthropic / OpenAI). The system prompt to send is exported at the
 * bottom so devs have it ready. The input + return shape stay identical and
 * everything downstream keeps working.
 */

import type { ScenarioVariant } from '@/lib/roles'
import type { GenericIntakeQuestion } from '@/lib/play/types'
import { CAPABILITIES, ATTRIBUTES, getAttribute, getCapability } from '@/lib/builderData'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface GeneratorInput {
  roleTitle: string
  variant: ScenarioVariant       // playful / professional
  questionCount: number          // 3 / 6 / 9
  difficulty: Difficulty
  jobDescription?: string
  idealCriteria?: string
  attributeKeys?: string[]       // refs into ATTRIBUTES
  companyValues?: string
}

export type Leaning = 'support' | 'neutral' | 'challenge'

export interface OptionFollowUp {
  /** The "why did you choose that?" question wording, specific to this option. */
  prompt: string
  /** Three leaning-tagged sub-choices — support / neutral / challenge — each
   *  with a one-line reasoning note for the partner authoring side. */
  choices: { id: string; text: string; leaning: Leaning; reasoning?: string }[]
}

export interface GeneratedOption {
  id: string
  text: string
  /** Optional per-option follow-up tree — populated by the AI when the
   *  scenario is hard or the register is advanced. Each option's follow-up
   *  is specific to the choice the candidate just made — that's what makes
   *  it a real tree rather than a single shared probe. */
  followUp?: OptionFollowUp
}

export interface GeneratedDecision {
  id: string
  prompt: string
  capabilityKey: string
  difficulty: Difficulty
  options: GeneratedOption[]
}

export interface GeneratorOutput {
  decisions: GeneratedDecision[]
  /** Pre-qualifier suggestions seeded from the input. */
  preQualifiers: GenericIntakeQuestion[]
}

/* ---------------------------------------------------------------- */
/* Public API — async to mirror a real LLM call (which is async).   */
/* ---------------------------------------------------------------- */

export async function generateScenario(input: GeneratorInput): Promise<GeneratorOutput> {
  // Small artificial delay so the demo's "generating…" state has time to
  // breathe. Devs will remove this when they wire the real call.
  await new Promise((r) => setTimeout(r, 700))
  return generateScenarioSync(input)
}

/* ---------------------------------------------------------------- */
/* The deterministic engine — used both by the async wrapper and    */
/* by per-question regeneration (which is sync).                    */
/* ---------------------------------------------------------------- */

function generateScenarioSync(input: GeneratorInput): GeneratorOutput {
  const decisions = generateDecisions(input)
  const preQualifiers = generatePreQualifiers(input)
  return { decisions, preQualifiers }
}

/** Regenerate a single decision (keeps the rest pinned). */
export function regenerateDecision(
  input: GeneratorInput,
  capabilityKey: string,
  difficulty: Difficulty,
  seed?: number,
): GeneratedDecision {
  return makeDecision(input, capabilityKey, difficulty, seed)
}

/* ---------------------------------------------------------------- */
/* Internals                                                        */
/* ---------------------------------------------------------------- */

const SCENARIO_TEMPLATES: Record<string, string[]> = {
  // Domain-flavoured situation templates, lightly keyword-seeded so the
  // demo feels role-specific without an actual LLM.
  default: [
    "You're in your first month as a {role}. A senior colleague asks for your view in front of the whole team — and you can see two things they've missed. What do you do first?",
    "It's 4:45pm on a Friday. A {role} task that's been on your plate slips through the cracks of a colleague's deadline and they're frustrated. What's your first move?",
    "A client emails the team praising you by name for work that was mostly someone else's. What do you do?",
    "You spot something in a shared report that doesn't look right. The {role} who built it is two levels above you. What's your first step?",
    "You're handed a brief with vague success criteria and a hard deadline. What's the first thing you do before starting work?",
    "A teammate is consistently late to your morning huddle. It's starting to slow the team. As the most junior {role} in the room, what's your move?",
    "Halfway through a project, a stakeholder changes their mind about a requirement you'd nearly finished. What do you do?",
    "A colleague shares an opportunity at another firm in a private message. What's your honest response?",
    "Your manager asks for a status update via Teams just as you're hitting a tricky blocker. What do you reply with?",
  ],
  property: [
    "A potential vendor expects to list their property at a price 18% above your market read. They've already had two valuations. What do you say?",
    "You're shadowing an appraisal when the seller pushes back on your manager's number. The seller asks you directly: 'And what do you think?' How do you answer?",
    "A prospective tenant complains on social media about an inspection you ran. The complaint is partly accurate, partly unfair. How do you respond?",
    "An older landlord won't accept your recommendation to refresh the property before re-listing. You believe it'll cost them 4–6 weeks vacancy. What's your call?",
    "Two agents in the office want to claim the same lead. You took the original call. What do you do?",
  ],
  finance: [
    "A senior analyst publishes a chart in a deck you helped on — the chart has a unit error that exaggerates the trend. The deck goes to the client in 90 minutes. What's your first move?",
    "You've been asked to run a model under a tight deadline. A field is missing input data. The shortcut: assume the prior year value. What do you do?",
    "Two stakeholders give you contradictory views on the assumption that drives 60% of the model output. They both expect you to align with them. What's your move?",
  ],
  marketing: [
    "A campaign is shipping today. Late in the day you spot a claim in the copy that you can't yet substantiate. Legal has already signed off based on an earlier version. What's your move?",
    "Your director wants to amplify a tweet about your brand that's gone viral. You're not sure the underlying claim in the tweet is correct. What do you say?",
  ],
}

const OPTION_TEMPLATES: Record<string, string[][]> = {
  // Three-choice templates indexed by capability. Each set is written so
  // one option leans toward the capability, one toward 'play it safe',
  // and one toward 'avoid the issue' — keeps signal sharp.
  judgement: [
    ['Raise it directly with the senior, framing it as a question.', 'Wait until after the meeting and find them privately.', 'Let it go — they have more context than you do.'],
    ['Name the trade-off and propose a path you can defend.', 'Pick the lowest-risk option without explaining why.', 'Defer the decision back up the chain.'],
  ],
  integrity: [
    ['Reply-all crediting the person who actually did the work.', 'Thank the client privately and let it sit publicly.', 'Accept the credit — the team wins either way.'],
    ['Name the issue out loud, even if it makes the room uncomfortable.', 'Mention it later, 1:1, when the moment is calmer.', 'Move on — it’s not your call to make.'],
  ],
  reasoning: [
    ['Trace the number back to the source data before raising it.', 'Flag it as "looks off" and let the author investigate.', 'Trust the senior — they probably checked it already.'],
    ['Ask three sharp questions before agreeing to scope.', 'Take it on and figure out as you go.', 'Pass it to someone with more context.'],
  ],
  problemSolving: [
    ['Map the parts you can act on now vs the ones blocked.', 'Spend more time gathering input before you start.', 'Wait for a clearer brief from your manager.'],
    ['Cut the scope in half and ship the smallest useful piece.', 'Try to do all of it and protect the deadline.', 'Move the deadline back and do the full thing properly.'],
  ],
  leadership: [
    ['Step up: propose a plan and ask for two volunteers.', 'Wait for someone more senior to do it.', 'Quietly do the work yourself and tell no one.'],
    ['Name what you’ve seen and ask the team how they want to handle it.', 'Take the team lead aside and raise it privately.', 'Let the team figure it out organically.'],
  ],
  adaptability: [
    ['Update the plan publicly, name what changed, keep moving.', 'Push back to protect the original scope.', 'Try to deliver both old and new versions and let leadership pick.'],
    ['Pause, ask what changed, then re-plan in 10 minutes.', 'Keep going with the old plan until told otherwise.', 'Throw it back to the requester and ask for clarity.'],
  ],
  emotionalIntelligence: [
    ['Listen first, then check whether they want advice or just to be heard.', 'Solve it for them and move on.', 'Wait for them to bring it up again themselves.'],
    ['Acknowledge the tension out loud before getting back to the work.', 'Ignore it and stay focused on the task.', 'Match their energy and push harder back.'],
  ],
  execution: [
    ['Send a one-line message naming the slip + your fix + ETA.', 'Wait until you have a fully solved fix before saying anything.', 'Let it slide; it was small and you’ll catch up next week.'],
    ['Pick the next concrete action and do it now.', 'Block out time later this week to think it through.', 'Wait for more context before taking any action.'],
  ],
  collaboration: [
    ['Loop in your teammate before responding so you’re aligned.', 'Reply on behalf of the team without checking first.', 'Forward the message and let your teammate handle it.'],
    ['Acknowledge their frustration before defending what you did.', 'Explain why you did what you did first.', 'Stay quiet — let the moment pass.'],
  ],
  situationalAwareness: [
    ['Name the second-order effect out loud before deciding.', 'Focus on the immediate problem and worry about knock-ons later.', 'Take the decision the room expects you to take.'],
    ['Ask who else this affects before you commit.', 'Decide quickly so the team can move.', 'Wait for someone with more context to weigh in.'],
  ],
}

/**
 * Per-option follow-up template pool. Each option a candidate could pick gets
 * its OWN "why did you choose THIS?" question with three leaning-tagged
 * sub-choices. We rotate prompts by option index for a touch of variety;
 * sub-choices follow a consistent support/neutral/challenge pattern.
 */
const OPTION_FOLLOWUP_PROMPTS = [
  'Why did you go with that?',
  'What made that the right call?',
  'Walk us through your thinking.',
  'What were you weighing when you chose that?',
]

/**
 * Sub-choice template patterns, indexed by the LEANING of the parent option.
 * "Strong" parent option attracts conviction-style follow-ups; "Safe" attracts
 * pragmatic ones; "Weak" attracts hedging — but each gets the full leaning
 * trio so we still tag support/neutral/challenge against the candidate's
 * articulated reasoning.
 */
const FOLLOWUP_SUBCHOICES: Record<'strong' | 'safe' | 'weak', { text: string; leaning: Leaning; reasoning: string }[]> = {
  strong: [
    { text: 'It was the right thing to do even if it cost something in the moment.', leaning: 'support',  reasoning: 'Prioritises principle over expedience.' },
    { text: 'It was the most balanced response between candour and not blowing things up.', leaning: 'neutral',  reasoning: 'Pragmatic — protects relationships while still acting.' },
    { text: 'Honestly, I’m not 100% it was right — but waiting felt worse than acting.', leaning: 'challenge', reasoning: 'Self-aware — flags the trade-off they may have made wrong.' },
  ],
  safe: [
    { text: 'Holding back gave me more information before committing.', leaning: 'support',  reasoning: 'Treats restraint as deliberate, not avoidance.' },
    { text: 'It bought time without locking in a position I couldn’t walk back.', leaning: 'neutral',  reasoning: 'Optionality-focused — keeps the door open both ways.' },
    { text: 'In hindsight I waited too long — the moment to act was sharper than I read.', leaning: 'challenge', reasoning: 'Owns the cost of not deciding.' },
  ],
  weak: [
    { text: 'Avoiding it kept the team focused on what mattered more.', leaning: 'support',  reasoning: 'Frames inaction as a focus choice — sometimes right.' },
    { text: 'I figured it wasn’t mine to call yet — better to let it surface itself.', leaning: 'neutral',  reasoning: 'Diplomatic — pushes ownership back to context.' },
    { text: 'Honestly I’d revisit this — leaving it alone wasn’t the right move.', leaning: 'challenge', reasoning: 'Names that the chosen path probably wasn’t right.' },
  ],
}

/** Classify an option by its position in the 3-option set (strong / safe / weak). */
function leaningOfOption(idx: number): 'strong' | 'safe' | 'weak' {
  return idx === 0 ? 'strong' : idx === 1 ? 'safe' : 'weak'
}

function buildOptionFollowUp(parentOptionIdx: number, seed: number): OptionFollowUp {
  const tone = leaningOfOption(parentOptionIdx)
  const subChoices = FOLLOWUP_SUBCHOICES[tone].map((c, i) => ({
    id: `fu-${parentOptionIdx}-${i}`,
    text: c.text,
    leaning: c.leaning,
    reasoning: c.reasoning,
  }))
  return {
    prompt: pickByIndex(OPTION_FOLLOWUP_PROMPTS, seed + parentOptionIdx * 3),
    choices: subChoices,
  }
}

function pickByIndex<T>(arr: T[], idx: number): T {
  return arr[Math.abs(idx) % arr.length]
}

function detectDomain(input: GeneratorInput): 'property' | 'finance' | 'marketing' | 'default' {
  const blob = `${input.roleTitle} ${input.jobDescription || ''} ${input.idealCriteria || ''}`.toLowerCase()
  if (/(real estate|property|residential|valuation|leasing|agent|savills|cbre|jll|knight frank)/.test(blob)) return 'property'
  if (/(finance|analyst|banking|equity|broker|investment|portfolio|m&a|asset)/.test(blob)) return 'finance'
  if (/(marketing|brand|campaign|content|advert|growth|comms|pr)/.test(blob)) return 'marketing'
  return 'default'
}

function pickCapabilitiesFor(input: GeneratorInput, count: number): string[] {
  // If attributes were picked, prefer the capabilities they map to. Cycle to
  // fill up to count. Otherwise spread across all capabilities.
  const fromAttrs = (input.attributeKeys || [])
    .map((k) => getAttribute(k)?.capabilityKey)
    .filter((c): c is string => Boolean(c))
  const ordered = fromAttrs.length > 0
    ? Array.from(new Set([...fromAttrs, ...CAPABILITIES.map((c) => c.key)]))
    : CAPABILITIES.map((c) => c.key)
  const picked: string[] = []
  for (let i = 0; i < count; i++) picked.push(pickByIndex(ordered, i))
  return picked
}

function fillRolePlaceholder(template: string, role: string): string {
  return template.replace(/\{role\}/g, role || 'graduate')
}

function makeDecision(
  input: GeneratorInput,
  capabilityKey: string,
  difficulty: Difficulty,
  seed = Math.floor(Math.random() * 1_000_000),
): GeneratedDecision {
  const domain = detectDomain(input)
  const promptPool = SCENARIO_TEMPLATES[domain] || SCENARIO_TEMPLATES.default
  const optionPool = OPTION_TEMPLATES[capabilityKey] || OPTION_TEMPLATES.judgement
  const prompt = fillRolePlaceholder(pickByIndex(promptPool, seed), input.roleTitle)

  // Each option gets its own follow-up tree when the difficulty / register
  // calls for it. The follow-up is leaning-tone matched to the option (the
  // strong/safe/weak position in the trio).
  const wantsTree = input.variant === 'professional' || difficulty === 'hard'
  const options: GeneratedOption[] = pickByIndex(optionPool, seed).map((t, i) => ({
    id: String.fromCharCode(97 + i),
    text: t,
    followUp: wantsTree ? buildOptionFollowUp(i, seed) : undefined,
  }))

  return {
    id: `q-${seed.toString(36)}`,
    prompt,
    capabilityKey,
    difficulty,
    options,
  }
}

function generateDecisions(input: GeneratorInput): GeneratedDecision[] {
  const caps = pickCapabilitiesFor(input, input.questionCount)
  return caps.map((cap, i) => makeDecision(input, cap, input.difficulty, i * 7 + 13))
}

function generatePreQualifiers(input: GeneratorInput): GenericIntakeQuestion[] {
  const blob = `${input.roleTitle} ${input.jobDescription || ''} ${input.idealCriteria || ''}`.toLowerCase()
  const seeds: GenericIntakeQuestion[] = []

  // Education timing — useful for grad programs
  if (/(grad(?!e)|graduate|junior|early career|cadet|trainee)/.test(blob)) {
    seeds.push({
      id: `g-${Math.random().toString(36).slice(2, 8)}`,
      kind: 'hard-filter',
      prompt: 'When did you (or will you) graduate?',
      criterionIds: [],
      allowedAnswers: ['Currently studying', 'Final year', 'Graduated in the last 2 years', 'Graduated more than 2 years ago'],
    })
  }

  // Degree filter — only when the JD/criteria mentions preferred disciplines
  if (/(property|finance|business|economics|commerce|degree|discipline)/.test(blob)) {
    seeds.push({
      id: `g-${Math.random().toString(36).slice(2, 8)}`,
      kind: 'hard-filter',
      prompt: 'Which best describes your degree?',
      criterionIds: [],
      allowedAnswers: ['Property / Real Estate', 'Finance / Economics / Business', 'Other discipline', 'No tertiary study'],
    })
  }

  // Why-this-org — always useful for soft signal
  seeds.push({
    id: `g-${Math.random().toString(36).slice(2, 8)}`,
    kind: 'open-text',
    prompt: input.companyValues
      ? 'Why are you interested in joining us, given what we stand for?'
      : 'Why are you interested in this role?',
    criterionIds: ['strong-interest', 'tone-confidence', 'references-values'],
  })

  // Extracurricular / industry engagement — surfaces effort
  if (/(extracurricular|engagement|involve|outside|interest)/.test(blob)) {
    seeds.push({
      id: `g-${Math.random().toString(36).slice(2, 8)}`,
      kind: 'open-text',
      prompt: 'Tell us about extracurricular activity that has shaped how you work.',
      criterionIds: ['specific-examples', 'ownership-instinct', 'self-aware-growth'],
    })
  }

  return seeds
}

/* ---------------------------------------------------------------- */
/* Devs: this is the system prompt to send to a real LLM. The user  */
/* message would be a JSON serialisation of GeneratorInput. The     */
/* expected response shape is GeneratorOutput.                       */
/* ---------------------------------------------------------------- */

export const LLM_SYSTEM_PROMPT = `You are a scenario authoring assistant for Launch, an assessment platform.
Given a hiring brief (role, level, JD, ideal candidate criteria, attributes, company values),
generate a set of crisp scenario questions that test the requested capabilities under realistic
constraints. Each question should:
- be 1–2 sentences, grounded in the role's domain;
- have exactly 3 answer options, one strong, one safe, one weak;
- be tagged with a single capability it primarily tests;
- carry a difficulty (easy/medium/hard) consistent with the requested overall difficulty;
- include a "why probe" follow-up when difficulty is 'hard' or level is 'advanced'.
Also propose 3–5 pre-qualifier questions appropriate to the brief — mix of:
- 'hard-filter' (multiple choice gates: education timing, degree, location, etc.)
- 'open-text' (soft signals scored against ticked criteria).
Return JSON matching the GeneratorOutput TypeScript interface exactly.`
