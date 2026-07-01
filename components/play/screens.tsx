'use client'

/* Ported verbatim from LQV2.html (screens-v2.jsx, lines 3991-4942). */

import {
  KeyboardEvent,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Countdown,
  CompanyMark,
  Progress,
  RevealText,
  SceneBackdrop,
  SkillPulse,
  interp,
} from './parts'
import type {
  CompletionResult,
  DecisionOption,
  HistoryEntry,
  Profile,
  Scenario,
} from '@/lib/play/types'
import { hexToRgbTriple } from '@/lib/play/sampleScenarios'

interface ReflectStepShape {
  eyebrow?: string
  asker?: string
  prompt?: string
  options: { id: string; label: string; skill?: string | null }[]
}

/* ---------- IntakeScreen ---------- */

interface IntakeScreenProps {
  onContinue: (data: { name: string }) => void
}

export function IntakeScreen({ onContinue }: IntakeScreenProps) {
  const [name, setName] = useState<string>(() => {
    try {
      return localStorage.getItem('launch.name') || 'Jojo'
    } catch (e) {
      return 'Jojo'
    }
  })
  const submit = () => {
    const n = name.trim()
    try {
      if (n) localStorage.setItem('launch.name', n)
    } catch (e) {}
    onContinue({ name: n })
  }
  return (
    <div className="screen intake">
      <SceneBackdrop scene="tunnel" active={true} />
      <div className="top-bar">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-name">LAUNCH</span>
          <span className="brand-sep">·</span>
          <span className="brand-sub">intake</span>
        </div>
        <div className="mono meta">before we begin</div>
      </div>

      <div className="intake-body">
        <RevealText text="Before we begin" className="eyebrow" stagger={30} />
        <RevealText
          text="Your name."
          as="h1"
          className="display display-sm"
          stagger={55}
          delay={280}
        />
        <RevealText
          text="Something that sounds good when someone shouts it across a locker room, a newsroom, or a boardroom."
          className="lede"
          stagger={16}
          delay={900}
        />

        <div className="intake-fields">
          <input
            type="text"
            className="intake-input intake-input-big"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
            }}
          />
        </div>

        <div className="begin-row">
          <button className="begin" onClick={submit}>
            <span>Continue</span>
            <span className="begin-arrow">→</span>
          </button>
          <span className="mono faint">We'll name the rest of the cast for you.</span>
        </div>
      </div>
    </div>
  )
}

/* ---------- OpeningScreen ---------- */

interface OpeningScreenProps {
  scenario: Scenario
  profile: Profile
  onBegin: () => void
}

export function OpeningScreen({ scenario, onBegin, profile }: OpeningScreenProps) {
  return (
    <div className="screen opening">
      <SceneBackdrop scene="tunnel" active={true} />

      <div className="top-bar">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-name">LAUNCH</span>
          <span className="brand-sep">·</span>
          <span className="brand-sub">live scenario</span>
        </div>
        <div className="meta-line">
          <RevealText text={scenario.meta} stagger={14} className="mono meta" as="span" />
        </div>
      </div>

      <div className="opening-body opening-body-edit">
        <div className="opening-col">
          {profile && profile.name ? (
            <RevealText
              text={`You're up, ${profile.name}.`}
              className="eyebrow eyebrow-name"
              stagger={30}
              delay={60}
            />
          ) : null}
          <RevealText
            text={scenario.role}
            className="eyebrow"
            stagger={30}
            delay={profile && profile.name ? 350 : 100}
          />
          <RevealText
            text={interp(scenario.opening.title, profile as any)}
            as="h1"
            className="display"
            stagger={55}
            delay={600}
          />
          <RevealText
            text={interp(scenario.opening.body, profile as any)}
            className="lede"
            stagger={18}
            delay={1600}
          />

          <div className="begin-row">
            <button className="begin" onClick={onBegin}>
              <span>Step in</span>
              <span className="begin-arrow">→</span>
            </button>
            <span className="mono faint">4 decisions · roughly 10 minutes · no do-overs</span>
          </div>
        </div>
      </div>

      <div className="ambient">
        {(scenario.opening.ambient || []).map((a, i) => (
          <div key={i} className="ambient-line">
            {a.label} ·{' '}
            {a.timeSeconds != null ? (
              <Countdown seconds={a.timeSeconds} id={a.timeId || `opening-${i}`} />
            ) : (
              a.value
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- EditorialOption / EditorialWriteIn ---------- */

interface EditorialOptionProps {
  option: DecisionOption
  onPick: (option: DecisionOption) => void
  selected: boolean
  disabled: boolean
  otherPicked: boolean
  animDelay: number
}

function EditorialOption({
  option,
  onPick,
  selected,
  disabled,
  otherPicked,
  animDelay,
}: EditorialOptionProps) {
  const state = selected ? 'picked' : otherPicked ? 'ghosted' : 'idle'
  return (
    <button
      className={`opt opt-${state}`}
      onClick={() => !disabled && onPick(option)}
      disabled={disabled}
      style={{ animationDelay: `${animDelay}ms` }}
    >
      <div className="opt-inner">
        <div className="opt-label">{option.label}</div>
      </div>
    </button>
  )
}

interface EditorialWriteInProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled: boolean
  selected: boolean
  otherPicked: boolean
  animDelay: number
}

function EditorialWriteIn({
  value,
  onChange,
  onSubmit,
  disabled,
  selected,
  otherPicked,
  animDelay,
}: EditorialWriteInProps) {
  const state = selected ? 'picked' : otherPicked ? 'ghosted' : 'idle'
  return (
    <div className={`opt opt-writein opt-${state}`} style={{ animationDelay: `${animDelay}ms` }}>
      <div className="opt-inner">
        <div className="writein-label mono">Your own answer</div>
        <textarea
          className="writein-text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here — only if you don't want to pick an option above."
          rows={2}
          disabled={disabled}
          onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
              e.preventDefault()
              onSubmit()
            }
          }}
        />
        <div className="writein-foot">
          <span className="mono hint">↵ to submit</span>
          <button className="writein-submit" onClick={onSubmit} disabled={!value.trim() || disabled}>
            Decide →
          </button>
        </div>
      </div>
      <span className="tear tear-top" aria-hidden />
      <span className="tear tear-bot" aria-hidden />
    </div>
  )
}

/* ---------- GoalMeter ---------- */

interface GoalMeterProps {
  goal: { label: string; target: number } | undefined
  value: number
  delta?: number | null
}

export function GoalMeter({ goal, value, delta }: GoalMeterProps) {
  if (!goal) return null
  const v = Math.max(0, Math.min(100, value))
  const tone = v >= 70 ? 'good' : v >= 45 ? 'mid' : 'warn'
  return (
    <div className={`goal-meter goal-tone-${tone}`} title={`${goal.label} · ${v}%`}>
      <span className="goal-meter-label mono">{goal.label}</span>
      <div className="goal-meter-track">
        <div className="goal-meter-fill" style={{ width: `${v}%` }} />
        {goal.target ? (
          <div
            className="goal-meter-target"
            style={{ left: `${Math.max(0, Math.min(100, goal.target))}%` }}
          />
        ) : null}
      </div>
      <span className="goal-meter-value mono">{v}%</span>
      {delta != null && delta !== 0 && (
        <span className={`goal-meter-delta ${delta > 0 ? 'up' : 'down'}`}>
          {delta > 0 ? `+${delta}` : delta}
        </span>
      )}
    </div>
  )
}

/* ---------- DecisionEcho ---------- */

interface DecisionEchoProps {
  echo?: { text: string; skill?: string } | null
}

function DecisionEcho({ echo }: DecisionEchoProps) {
  if (!echo || !echo.text) return null
  return (
    <div className="echo" title="Your last decision led here">
      <div className="echo-kicker">You decided</div>
      <div className="echo-text">{echo.text}</div>
      {echo.skill && <div className="echo-skill">{echo.skill}</div>}
    </div>
  )
}

/* ---------- useAutoFitPrompt ---------- */

function useAutoFitPrompt(dep: any): RefObject<any> {
  const promptRef = useRef<any>(null)
  useEffect(() => {
    const fit = () => {
      const el = promptRef.current
      if (!el) return
      const headline = el.closest?.('.edit-headline') as HTMLElement | null
      if (!headline) return
      el.style.fontSize = ''
      el.style.lineHeight = ''
      const measure = () => {
        const captionH =
          (headline.querySelector('.scene-caption') as HTMLElement | null)?.getBoundingClientRect()
            .height || 0
        const available = Math.max(120, headline.clientHeight - captionH - 40)
        let size = parseFloat(getComputedStyle(el).fontSize)
        let safety = 60
        while (el.scrollHeight > available && size > 14 && safety-- > 0) {
          size -= 1
          el.style.fontSize = size + 'px'
        }
      }
      requestAnimationFrame(() => requestAnimationFrame(measure))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [dep])
  return promptRef
}

/* ---------- DecisionScreen ---------- */

interface DecisionScreenProps {
  step: any
  index: number
  total: number
  onPick: (opt: DecisionOption) => void
  onCustom: (val: { label: string; skill: string } | string) => void
  showSkills: boolean
  lastSkill: string | null
  echo: { text: string; skill?: string } | null
  profile: Profile
  goal: { label: string; target: number }
  meterValue: number
  meterDelta: number | null
}

export function DecisionScreen({
  step,
  index,
  total,
  onPick,
  onCustom,
  showSkills,
  lastSkill,
  echo,
  profile,
  goal,
  meterValue,
  meterDelta,
}: DecisionScreenProps) {
  const [picked, setPicked] = useState<string | null>(null)
  const [custom, setCustom] = useState('')
  const promptRef = useAutoFitPrompt(step.prompt)

  const handle = (opt: DecisionOption) => {
    if (picked) return
    setPicked(opt.id)
    setTimeout(() => onPick(opt), 900)
  }
  const submitCustom = () => {
    if (picked || !custom.trim()) return
    setPicked('custom')
    setTimeout(() => onCustom({ label: `"${custom.trim()}"`, skill: 'Self-direction' }), 900)
  }

  const mood = step.mood || 'tense'
  const factors = step.factors || []

  return (
    <div className={`screen decision mood-${mood}`}>
      <SceneBackdrop scene={step.scene} active={true} />
      <DecisionEcho echo={echo} />

      <div className="top-bar">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-name">LAUNCH</span>
        </div>
        <Progress current={index} total={total} />
        <div className="mono meta">{step.eyebrow}</div>
      </div>
      <GoalMeter goal={goal} value={meterValue} delta={meterDelta} />

      <div className="edit-spread">
        <div className="edit-headline">
          <div className="headline-inner">
            <div className="scene-caption mono">{interp(step.sceneCaption, profile as any)}</div>
            <RevealText
              text={interp(step.prompt, profile as any)}
              as="h2"
              className="edit-prompt"
              stagger={65}
              delay={220}
              innerRef={promptRef}
            />
          </div>
        </div>

        <div className="factors">
          {factors.map((f: any, i: number) => {
            const timeMatch =
              f.tone === 'mono' &&
              typeof f.value === 'string' &&
              f.value.match(/^(\d+):(\d{2}):(\d{2})$/)
            const totalSecs = timeMatch
              ? parseInt(timeMatch[1], 10) * 3600 +
                parseInt(timeMatch[2], 10) * 60 +
                parseInt(timeMatch[3], 10)
              : null
            const kind =
              f.kind || (timeMatch ? 'time' : f.tone === 'mono' ? 'metric' : 'signal')
            return (
              <div
                key={i}
                className={`factor factor-${i} factor-kind-${kind} ${
                  f.tone === 'mono' ? 'factor-mono' : ''
                }`}
                style={{ animationDelay: `${600 + i * 120}ms` }}
              >
                <div className="factor-label mono">
                  <span className="factor-dot" aria-hidden />
                  {f.label}
                </div>
                <div className="factor-value">
                  {timeMatch && totalSecs != null ? (
                    <Countdown
                      seconds={totalSecs}
                      id={
                        /tip-?off|doors open|deadline|board meeting|time on floor|shift buffer|until you speak|to press|game clock/i.test(
                          f.label
                        )
                          ? `clock-${f.label}`
                          : f.label
                      }
                    />
                  ) : (
                    f.value
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="edit-options">
          {step.options.map((o: DecisionOption, i: number) => (
            <EditorialOption
              key={o.id}
              option={o}
              selected={picked === o.id}
              otherPicked={!!picked && picked !== o.id}
              disabled={!!picked}
              onPick={handle}
              animDelay={900 + i * 110}
            />
          ))}
          {/* Small divider so candidates read the two input modes as
              alternatives ("pick one OR write your own") rather than as
              a sequence. Savills feedback: candidates were clicking an
              option then feeling like they still needed to fill the box. */}
          <div
            className="edit-or"
            style={{ animationDelay: `${900 + step.options.length * 110 - 40}ms` }}
            aria-hidden
          >
            <span className="edit-or-line" />
            <span className="edit-or-label mono">or write your own</span>
            <span className="edit-or-line" />
          </div>
          <EditorialWriteIn
            value={custom}
            onChange={setCustom}
            onSubmit={submitCustom}
            selected={picked === 'custom'}
            otherPicked={!!picked && picked !== 'custom'}
            disabled={!!picked}
            animDelay={900 + step.options.length * 110}
          />
        </div>
      </div>

      {showSkills && lastSkill && (
        <div className="skill-float">
          <SkillPulse skill={lastSkill} />
        </div>
      )}
    </div>
  )
}

/* ---------- OutcomeBeat ---------- */

const SUSPENSE_MSGS = {
  bad: [
    'What have you done?',
    'Oh no.',
    'This is going to hurt.',
    'The cost is coming.',
    'Brace.',
    'No undo.',
    "You'll regret that.",
    "Something's about to break.",
    'Hold your breath.',
    'Wait for the fallout.',
  ],
  neutral: [
    "Let's see the effect…",
    'Something shifts…',
    'Watch.',
    'Hold.',
    'The room is responding…',
    'Here it comes.',
    'Consequences loading.',
    'You set this in motion.',
  ],
  good: [
    'Wait for it.',
    "Something's stirring.",
    'The ripple begins.',
    "Let's see what that buys.",
    'A signal, travelling.',
    "Watch who's paying attention.",
    'This is going to land.',
    'The room is leaning in.',
  ],
}

interface OutcomeBeatProps {
  entry: HistoryEntry
  step: any
  stepIdx: number
  totalSteps: number
  profile: Profile
  goal: { label: string; target: number }
  meterValue: number
  onContinue: () => void
}

export function OutcomeBeat({
  entry,
  step,
  stepIdx,
  totalSteps,
  profile,
  goal,
  meterValue,
  onContinue,
}: OutcomeBeatProps) {
  const picked: DecisionOption | null =
    step.options.find((o: DecisionOption) => o.id === entry?.id) ||
    step.options.find((o: DecisionOption) => o.label === entry?.label) ||
    null
  const alternates: DecisionOption[] = step.options.filter((o: DecisionOption) => o !== picked)

  const stripYou = (s: string | undefined): string => {
    if (typeof s !== 'string') return s || ''
    return s.replace(/^\s*(["“]?)You [^.!?]*?[.!?]["”]?\s*/i, '').trim() || s
  }
  const outcomeText = interp(
    entry?.surprise || entry?.consequence || stripYou(entry?.echo || ''),
    profile as any
  )

  const sc = typeof entry?.score === 'number' ? entry.score : 0
  const tone = sc >= 10 ? 'peak' : sc >= 5 ? 'good' : sc > 0 ? 'mild' : sc === 0 ? 'neutral' : 'bad'
  const toneKicker =
    tone === 'peak'
      ? 'A triumph'
      : tone === 'good'
      ? 'It landed'
      : tone === 'mild'
      ? 'A moment, caught'
      : tone === 'neutral'
      ? 'A moment, passed'
      : 'A cost'
  const toneFamily =
    tone === 'bad' ? 'smoke' : tone === 'neutral' || tone === 'mild' ? 'calm' : 'bloom'

  const [beatPhase, setBeatPhase] = useState<'suspense' | 'reveal'>('suspense')
  const [insightOpen, setInsightOpen] = useState(false)
  const suspenseMsg = useMemo(() => {
    const pool =
      tone === 'bad'
        ? SUSPENSE_MSGS.bad
        : tone === 'peak' || tone === 'good'
        ? SUSPENSE_MSGS.good
        : SUSPENSE_MSGS.neutral
    return pool[Math.floor(Math.random() * pool.length)]
  }, [tone])
  useEffect(() => {
    const t = setTimeout(() => setBeatPhase('reveal'), 2000)
    return () => clearTimeout(t)
  }, [])

  const toneRgbFallback =
    tone === 'peak'
      ? '255,210,125'
      : tone === 'good'
      ? '146,184,255'
      : tone === 'mild'
      ? '160,215,232'
      : tone === 'neutral'
      ? '233,228,214'
      : '255,112,112'
  const toneSolidFallback =
    tone === 'peak'
      ? '#ffd27d'
      : tone === 'good'
      ? '#92b8ff'
      : tone === 'mild'
      ? '#a0d7e8'
      : tone === 'neutral'
      ? '#e9e4d6'
      : '#ff7070'
  const toneSolid = entry?.reactionColor || toneSolidFallback
  const toneRgb = entry?.reactionColor ? hexToRgbTriple(entry.reactionColor) : toneRgbFallback
  const toneStyle: React.CSSProperties = {
    ['--tone' as any]: toneRgb,
    ['--tone-solid' as any]: toneSolid,
  }

  if (beatPhase === 'suspense') {
    return (
      <div
        className={`screen outcome-beat suspense suspense-${toneFamily} tone-${tone}`}
        style={toneStyle}
      >
        <SceneBackdrop scene={step.scene} active={true} />
        <div className="suspense-vignette" aria-hidden />
        <div className="suspense-pulse" aria-hidden />
        <div className="suspense-inner">
          <div className="suspense-kicker mono">Decision registered</div>
          <h1 className="suspense-text">{suspenseMsg}</h1>
        </div>
      </div>
    )
  }

  return (
    <div className={`screen outcome-beat reveal reveal-${toneFamily} tone-${tone}`} style={toneStyle}>
      <SceneBackdrop scene={step.scene} active={true} />
      <div className="beat-flash" aria-hidden />
      {toneFamily === 'smoke' && <div className="beat-smoke" aria-hidden />}
      {toneFamily === 'bloom' && <div className="beat-bloom" aria-hidden />}
      <div className="top-bar">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-name">LAUNCH</span>
        </div>
        <Progress current={stepIdx} total={totalSteps} />
        <div className="mono meta">{step.eyebrow}</div>
      </div>
      <GoalMeter goal={goal} value={meterValue} />

      <div className="beat-spread">
        <div className="beat-hero-wrap">
          <div className="beat-hero-glow" aria-hidden />
          <div className="beat-kicker mono">{toneKicker}</div>
          <h2 className="beat-narrative">{outcomeText}</h2>
          {entry?.stats && entry.stats.length > 0 && (() => {
            const pool: any[] = [
              { top: '6%', left: '-2%', tilt: '-1.4deg' },
              { top: '4%', right: '-2%', tilt: '1.1deg' },
              { bottom: '8%', left: '-2%', tilt: '0.9deg' },
              { bottom: '6%', right: '-2%', tilt: '-0.8deg' },
              { top: '42%', left: '-8%', tilt: '-1.2deg' },
              { top: '44%', right: '-8%', tilt: '1.5deg' },
              { top: '22%', left: '-10%', tilt: '0.6deg' },
              { bottom: '22%', right: '-10%', tilt: '-1.1deg' },
            ]
            const seed = (stepIdx * 37 + (entry.id || 'x').charCodeAt(0) * 13) % 97
            const picks: any[] = []
            const used = new Set<number>()
            for (let i = 0; i < entry.stats.length; i++) {
              const idx = (seed + i * 29) % pool.length
              let final = idx
              let tries = 0
              while (used.has(final) && tries < pool.length) {
                final = (final + 1) % pool.length
                tries++
              }
              used.add(final)
              picks.push(pool[final])
            }
            const accents = ['a', 'b', 'c', 'd']
            const accentOrder = [
              accents[seed % 4],
              accents[(seed + 2) % 4],
              accents[(seed + 1) % 4],
              accents[(seed + 3) % 4],
            ]
            return entry.stats.map((s: any, i: number) => {
              const p = picks[i] || pool[i % pool.length]
              const accent = accentOrder[i % 4]
              const { tilt, ...positionStyle } = p
              return (
                <div
                  key={i}
                  className={`beat-stat stat-accent-${accent}`}
                  style={{
                    ...positionStyle,
                    ['--stat-tilt' as any]: tilt,
                    animationDelay: `${780 + i * 220}ms`,
                  }}
                >
                  <div className="beat-stat-label mono">{s.label}</div>
                  <div
                    className="beat-stat-change"
                    style={{ animationDelay: `${900 + i * 220}ms` }}
                  >
                    {s.change}
                  </div>
                </div>
              )
            })
          })()}
        </div>

        {alternates.length > 0 && (
          <div className="beat-alternates">
            <div className="beat-alt-kicker mono">The roads not taken · hover to read</div>
            <div className="beat-alt-list">
              {alternates.map((alt, i) => (
                <div
                  className="beat-alt"
                  key={alt.id}
                  style={{ animationDelay: `${1300 + i * 140}ms` }}
                >
                  <div className="beat-alt-label">{alt.label}</div>
                  <div className="beat-alt-hover">
                    <span className="beat-alt-hover-kicker mono">Would have been</span>
                    <span className="beat-alt-hover-text">{alt.ghost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="begin-row beat-continue">
          <button className="begin" onClick={onContinue}>
            <span>Continue</span>
            <span className="begin-arrow">→</span>
          </button>
        </div>
      </div>

      <button
        className="insight-btn"
        onClick={() => setInsightOpen(true)}
        aria-label="Read the reaction"
        title="Read the reaction"
      >
        <span className="insight-dot" aria-hidden />
        <span>Read the reaction</span>
      </button>

      {insightOpen && (
        <div className="insight-panel" role="dialog" aria-label="Insight">
          <button
            className="insight-close"
            onClick={() => setInsightOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
          <div className="insight-kicker mono">Reading the reaction</div>
          <h3 className="insight-title">
            {entry?.skill ? `${entry.skill} · what just happened` : 'What just happened'}
          </h3>
          <p className="insight-body">
            {interp(
              entry?.insight ||
                'Your decision set a chain of quieter reactions in motion. Watch for where the follow-on effects show up — often in rooms and relationships downstream of the call you made.',
              profile as any
            )}
          </p>
          {entry?.insightNavigate && (
            <>
              <div className="insight-kicker mono">How to navigate it</div>
              <p className="insight-body">{interp(entry.insightNavigate, profile as any)}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ---------- ReflectScreen ---------- */

interface ReflectScreenProps {
  step: ReflectStepShape
  index: number
  total: number
  onPick: (opt: { id: string; label: string; skill?: string | null }) => void
  onCustom: (val: string) => void
  echo: { text: string; skill?: string } | null
  profile: Profile
  goal: { label: string; target: number }
  meterValue: number
  meterDelta: number | null
}

export function ReflectScreen({
  step,
  index,
  total,
  onPick,
  onCustom,
  echo,
  profile,
  goal,
  meterValue,
  meterDelta,
}: ReflectScreenProps) {
  const [picked, setPicked] = useState<string | null>(null)
  const [custom, setCustom] = useState('')
  const promptRef = useAutoFitPrompt(step.prompt)
  const handle = (opt: { id: string; label: string }) => {
    if (picked) return
    setPicked(opt.id)
    setTimeout(() => onPick(opt), 620)
  }
  const submitCustom = () => {
    if (picked || !custom.trim()) return
    setPicked('custom')
    setTimeout(() => onCustom(custom.trim()), 620)
  }

  return (
    <div className="screen decision mood-reflective">
      <SceneBackdrop scene="reflect" active={true} />
      <DecisionEcho echo={echo} />

      <div className="top-bar">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-name">LAUNCH</span>
        </div>
        <Progress current={index} total={total} />
        <div className="mono meta">{step.eyebrow || 'A beat between moments'}</div>
      </div>
      <GoalMeter goal={goal} value={meterValue} delta={meterDelta} />

      <div className="edit-spread">
        <div className="edit-headline">
          <div className="headline-inner">
            <div className="scene-caption mono">
              {interp(step.asker, profile as any) || 'A voice cuts in'}
            </div>
            <RevealText
              text={`“${interp(step.prompt, profile as any)}”`}
              as="h2"
              className="edit-prompt"
              stagger={50}
              delay={220}
              innerRef={promptRef}
            />
          </div>
        </div>

        <div className="edit-options">
          {step.options.map((o, i) => (
            <EditorialOption
              key={o.id}
              option={o as any}
              selected={picked === o.id}
              otherPicked={!!picked && picked !== o.id}
              disabled={!!picked}
              onPick={handle as any}
              animDelay={700 + i * 110}
            />
          ))}
          <div
            className="edit-or"
            style={{ animationDelay: `${700 + step.options.length * 110 - 40}ms` }}
            aria-hidden
          >
            <span className="edit-or-line" />
            <span className="edit-or-label mono">or write your own</span>
            <span className="edit-or-line" />
          </div>
          <EditorialWriteIn
            value={custom}
            onChange={setCustom}
            onSubmit={submitCustom}
            selected={picked === 'custom'}
            otherPicked={!!picked && picked !== 'custom'}
            disabled={!!picked}
            animDelay={700 + step.options.length * 110}
          />
        </div>
      </div>
    </div>
  )
}

/* ---------- OutcomeScreen ---------- */

interface OutcomeScreenProps {
  scenario: Scenario
  history: HistoryEntry[]
  onRestart: () => void
  onReport: () => void
  showSkills: boolean
}

export function OutcomeScreen({
  scenario,
  history,
  onRestart,
  onReport,
  showSkills,
}: OutcomeScreenProps) {
  const skills = history
    .filter((h) => h.skill)
    .reduce<Record<string, number>>((acc, h) => {
      acc[h.skill as string] = (acc[h.skill as string] || 0) + 1
      return acc
    }, {})
  return (
    <div className="screen outcome">
      <SceneBackdrop scene="court" active={true} />
      <div className="top-bar">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-name">LAUNCH</span>
        </div>
        <div className="mono meta">session · complete</div>
      </div>

      <div className="outcome-body">
        <RevealText text={scenario.outcome.eyebrow} className="eyebrow" stagger={30} />
        <RevealText
          text={scenario.outcome.title}
          as="h1"
          className="display display-sm"
          stagger={50}
          delay={300}
        />
        <RevealText text={scenario.outcome.body} className="lede" stagger={15} delay={1200} />

        <div className="trace">
          <div className="trace-head mono">decision trace</div>
          <ol className="trace-list">
            {history.map((h, i) => (
              <li key={i} style={{ animationDelay: `${1800 + i * 140}ms` }}>
                <span className="trace-num mono">0{i + 1}</span>
                <span className="trace-text">{h.label}</span>
                {showSkills && h.skill && <span className="trace-skill mono">{h.skill}</span>}
              </li>
            ))}
          </ol>
        </div>

        {showSkills && Object.keys(skills).length > 0 && (
          <div className="summary">
            <div className="summary-head mono">what an employer will see</div>
            <div className="summary-tags">
              {Object.entries(skills).map(([k, v]) => (
                <span className="summary-tag" key={k}>
                  <span className="summary-k">{k}</span>
                  <span className="summary-v mono">×{v}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="begin-row">
          <button className="begin" onClick={onReport}>
            <span>See your skills report</span>
            <span className="begin-arrow">→</span>
          </button>
          <button className="ghost-btn" onClick={onRestart}>
            <span>Run it again</span>
            <span>↻</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- ReportScreen ---------- */

interface ReportScreenProps {
  scenario: Scenario
  history: HistoryEntry[]
  onRestart: () => void
  onHome: () => void
  onComplete?: (result: CompletionResult) => void
}

export function ReportScreen({
  scenario,
  history,
  onRestart,
  onHome,
  onComplete,
}: ReportScreenProps) {
  const skillsMap = history
    .filter((h) => h.skill)
    .reduce<Record<string, number>>((acc, h) => {
      acc[h.skill as string] = (acc[h.skill as string] || 0) + 1
      return acc
    }, {})
  const topSkills = Object.entries(skillsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k]) => k)

  const narrative =
    'You demonstrated strong communication and judgment by prioritizing how information reached the room before deciding what to do with it. To improve, consider being more proactive in surfacing risks earlier and exploring alternative framings before defaulting to a familiar play. Your decision-making leans analytical — gathering and verifying information before reacting — and you maintained composure under visible pressure. Keep practicing different approaches to widen your range.'

  const companies = [
    { name: 'Canva', mark: 'canva' },
    { name: 'Google', mark: 'google' },
    { name: 'Netflix', mark: 'netflix' },
    { name: 'The Walt Disney Company', mark: 'disney' },
  ]

  const recommended = [
    {
      role: 'Founder · Seed-stage Startup',
      title: 'Runway is six weeks. Which ship?',
      blurb: 'Three features, one team. Choose what goes and what gets cut.',
      tone: 'Judgment · Prioritization',
    },
    {
      role: 'Hospital Chief Resident',
      title: 'Two codes. One elevator.',
      blurb: 'Triage in a moment where every delay has a name.',
      tone: 'Composure · Ethics',
    },
    {
      role: 'Newsroom Editor-in-Chief',
      title: 'Tip at 11:43pm. Front page at 6am.',
      blurb: 'Publish, verify, or kill. The story will travel either way.',
      tone: 'Integrity · Speed',
    },
  ]

  return (
    <div className="screen report">
      <SceneBackdrop scene="reflect" active={true} />

      <div className="top-bar">
        <div className="brand">
          <span className="brand-mark" />
          <span className="brand-name">LAUNCH</span>
          <span className="brand-sep">·</span>
          <span className="brand-sub">skills report</span>
        </div>
        <div className="mono meta">{scenario.role}</div>
      </div>

      <div className="report-body">
        <div className="report-grid">
          <div className="report-card skills-card">
            <div className="card-title">You've improved in these skills</div>
            <div className="score-chip">
              <span className="score-delta">+1.0</span>
              <span className="score-label mono">Performance Score</span>
            </div>
            <p className="report-prose">{narrative}</p>
            <div className="skill-chips">
              {topSkills.map((s) => (
                <div className="skill-chip" key={s}>
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="report-card companies-card">
            <div className="card-title">These companies would value your skills in LAUNCH</div>
            <div className="company-grid">
              {companies.map((c) => (
                <div
                  className="company-cell"
                  key={c.name}
                  role={onComplete ? 'button' : undefined}
                  tabIndex={onComplete ? 0 : undefined}
                  onClick={() =>
                    onComplete?.({
                      kind: 'department-selected',
                      company: c.name,
                      department: 'General',
                    })
                  }
                  style={onComplete ? { cursor: 'pointer' } : undefined}
                >
                  <CompanyMark name={c.mark} />
                  <div className="company-name">{c.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="recommended-section">
          <div className="section-head">Recommended scenarios</div>
          <div className="recommended-grid">
            {recommended.map((r, i) => (
              <button className="rec-card" key={i}>
                <div className="rec-role mono">{r.role}</div>
                <div className="rec-title">{r.title}</div>
                <div className="rec-blurb">{r.blurb}</div>
                <div className="rec-tone mono">{r.tone}</div>
                <div className="rec-arrow">Step in →</div>
              </button>
            ))}
          </div>
        </div>

        <div className="report-foot">
          <button className="ghost-btn" onClick={onRestart}>
            ↻ Run LAUNCH again
          </button>
          <button className="ghost-btn" onClick={onHome}>
            ← Back to start
          </button>
        </div>
      </div>
    </div>
  )
}
