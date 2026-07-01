'use client'

/* Ported from LQV2.html App (lines 5006-5444). Wraps the LQ flow as a
   self-contained component that overlays the dashboard. */

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import {
  CompletionResult,
  HistoryEntry,
  Profile,
  Scenario,
  Theme,
  themeForVariant,
} from '@/lib/play/types'
import type { ScenarioVariant } from '@/lib/roles'
import './styles/play.css'
import { IntakeQuestionsScreen } from '@/components/play/IntakeQuestionsScreen'
import { CandidateProfileScreen } from '@/components/play/CandidateProfileScreen'
import { OptionFollowUpScreen } from '@/components/play/OptionFollowUpScreen'
import { PlayPartnerBanner } from '@/components/play/PlayPartnerBanner'
import {
  DecisionScreen,
  IntakeScreen,
  OpeningScreen,
  OutcomeBeat,
  OutcomeScreen,
  ReflectScreen,
  ReportScreen,
} from './screens'

const TWEAK_DEFAULTS = {
  theme: 'cinema' as Theme,
  showSkills: true,
  alwaysReflect: false,
  parallax: true,
}

const TRANSITIONS = ['zoom-punch', 'whip-right', 'iris-in', 'page-turn', 'drop-slam', 'kaleidoscope']

type Phase =
  | 'intake'
  | 'profile'           // full candidate profile capture (basic + comprehensive)
  | 'generic-intake'
  | 'opening'
  | { type: 'step'; stepIdx: number }
  | { type: 'option-followup'; entry: HistoryEntry; stepIdx: number; lastLabel?: string; followUp: { prompt: string; choices: { id: string; text: string; leaning: 'support' | 'neutral' | 'challenge'; reasoning?: string }[] } }
  | { type: 'beat'; entry: HistoryEntry; stepIdx: number; lastLabel?: string }
  | { type: 'reflect'; basedOn: number; lastLabel?: string }
  | 'outcome'
  | 'report'

function useParallax(enabled: boolean, rootRef: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    if (!enabled) return
    const root = rootRef.current
    if (!root) return
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      root.querySelectorAll<HTMLElement>('.parallax-layer').forEach((el) => {
        const d = parseFloat(el.dataset.depth || '0.2')
        el.style.transform = `translate3d(${-x * d * 18}px, ${-y * d * 14}px, 0)`
      })
      root.querySelectorAll<HTMLElement>('.scene-bg').forEach((el) => {
        el.style.transform = `scale(1.08) translate3d(${-x * 12}px, ${-y * 8}px, 0)`
      })
      root.querySelectorAll<HTMLElement>('.sq').forEach((el) => {
        const r = el.getBoundingClientRect()
        const mx = ((e.clientX - r.left) / r.width) * 100
        const my = ((e.clientY - r.top) / r.height) * 100
        el.style.setProperty('--mx', mx + '%')
        el.style.setProperty('--my', my + '%')
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [enabled, rootRef])
}

const AUDIO_PROFILES: Record<string, any> = {
  'lakers-coach': { cutoff: 200, noiseGain: 0.1, oscFreq: 60, oscGain: 0.04, label: 'arena rumble' },
  'sephora-lead': { cutoff: 400, noiseGain: 0.08, oscFreq: 110, oscGain: 0.03, label: 'store bustle' },
  'newsroom-editor': { cutoff: 350, noiseGain: 0.07, oscFreq: 90, oscGain: 0.02, label: 'newsroom hum' },
  'er-resident': {
    cutoff: 250,
    noiseGain: 0.05,
    oscFreq: 0,
    oscGain: 0,
    beep: { freq: 1000, interval: 1.6, dur: 0.06, gain: 0.025 },
    label: 'monitor + bay',
  },
  'startup-founder': { cutoff: 150, noiseGain: 0.07, oscFreq: 80, oscGain: 0.025, label: 'office HVAC' },
  _default: { cutoff: 320, noiseGain: 0.1, oscFreq: 0, oscGain: 0, label: 'room tone' },
}

function useAmbientAudio(on: boolean, scenarioId: string) {
  const ctxRef = useRef<AudioContext | null>(null)
  useEffect(() => {
    if (!on) {
      if (ctxRef.current) {
        try {
          ctxRef.current.close()
        } catch (e) {}
        ctxRef.current = null
      }
      return
    }
    let ctx: AudioContext | undefined
    let beepInterval: ReturnType<typeof setInterval> | undefined
    try {
      const Ctor = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext
      ctx = new Ctor()
      const profile = AUDIO_PROFILES[scenarioId] || AUDIO_PROFILES._default

      const bufSize = ctx.sampleRate * 2
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
      const data = buf.getChannelData(0)
      let last = 0
      for (let i = 0; i < bufSize; i++) {
        const white = Math.random() * 2 - 1
        last = (last + 0.02 * white) / 1.02
        data[i] = last * 3.5
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buf
      noise.loop = true
      const filt = ctx.createBiquadFilter()
      filt.type = 'lowpass'
      filt.frequency.value = profile.cutoff
      const gain = ctx.createGain()
      gain.gain.value = 0
      noise.connect(filt).connect(gain).connect(ctx.destination)
      noise.start()
      gain.gain.linearRampToValueAtTime(profile.noiseGain, ctx.currentTime + 1.2)

      if (profile.oscFreq > 0) {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = profile.oscFreq
        const oscGain = ctx.createGain()
        oscGain.gain.value = 0
        osc.connect(oscGain).connect(ctx.destination)
        osc.start()
        oscGain.gain.linearRampToValueAtTime(profile.oscGain, ctx.currentTime + 1.5)
      }

      if (profile.beep) {
        const beep = profile.beep
        beepInterval = setInterval(() => {
          if (!ctxRef.current || !ctx) return
          const now = ctx.currentTime
          const b = ctx.createOscillator()
          const bg = ctx.createGain()
          b.type = 'sine'
          b.frequency.value = beep.freq
          bg.gain.value = 0
          b.connect(bg).connect(ctx.destination)
          b.start(now)
          bg.gain.setValueAtTime(0, now)
          bg.gain.linearRampToValueAtTime(beep.gain, now + 0.005)
          bg.gain.linearRampToValueAtTime(0, now + beep.dur)
          b.stop(now + beep.dur + 0.05)
        }, profile.beep.interval * 1000)
      }

      ctxRef.current = ctx
    } catch (e) {}
    return () => {
      try {
        if (beepInterval) clearInterval(beepInterval)
      } catch (e) {}
      try {
        ctx && ctx.close()
      } catch (e) {}
    }
  }, [on, scenarioId])
}

interface TransitionStackProps {
  keyName: string
  children: ReactNode
}

function TransitionStack({ keyName, children }: TransitionStackProps) {
  type Item = { key: string; node: ReactNode; phase: 'enter' | 'exit' }
  const [items, setItems] = useState<Item[]>([{ key: keyName, node: children, phase: 'enter' }])
  const prevKey = useRef(keyName)
  const cleanupTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (keyName !== prevKey.current) {
      setItems((prev) => {
        const outgoing = prev.map((p) => ({ ...p, phase: 'exit' as const }))
        return [...outgoing, { key: keyName, node: children, phase: 'enter' as const }]
      })
      prevKey.current = keyName
      if (cleanupTimer.current) clearTimeout(cleanupTimer.current)
      cleanupTimer.current = setTimeout(() => {
        setItems((prev) => prev.filter((p) => p.phase !== 'exit' || p.key === keyName))
        cleanupTimer.current = null
      }, 1100)
    } else {
      setItems((prev) => prev.map((p) => (p.key === keyName ? { ...p, node: children } : p)))
    }
  }, [keyName, children])
  return (
    <div className="stack">
      {items.map((item) => (
        <div key={item.key} className={`screen-wrap ${item.phase}`}>
          {item.node}
        </div>
      ))}
    </div>
  )
}

export interface ScenarioPlayProps {
  scenario: Scenario
  profile?: Profile
  onComplete: (result: CompletionResult) => void
  onExit?: () => void
  /** Visual register. When unset, the play flow keeps its default look
   *  (so Quick-Play / sample scenarios are unchanged). */
  variant?: ScenarioVariant
  /** Generic intake questions to run BEFORE the scenario (open text). */
  genericQuestions?: import('@/lib/play/types').GenericIntakeQuestion[]
  /** Called when the candidate finishes the generic intake portion.
   *  Now also passes the captured CandidateProfile so the host can persist
   *  it onto the Submission for partner-side filtering. */
  onIntakeComplete?: (
    answers: Record<string, string>,
    profile?: import('@/lib/candidateProfile').CandidateProfile,
  ) => void
}

export function ScenarioPlay({
  scenario: initialScenario,
  profile: incomingProfile,
  onComplete,
  onExit,
  variant,
  genericQuestions,
  onIntakeComplete,
}: ScenarioPlayProps) {
  const [scenario, setScenario] = useState<Scenario>(initialScenario)
  const [profile, setProfile] = useState<Profile>({
    name: incomingProfile?.name?.trim() || '',
    pronouns: incomingProfile?.pronouns,
  })
  // Professional variant = same dark navy canvas as cinema, but with the
  // decorative chrome (parallax shapes, ambient drift, floating skills) dialled
  // off so the experience reads as a calm Apple settings panel, not a cinema.
  const resolvedVariant = variant ?? initialScenario.variant
  const isProfessional = resolvedVariant === 'professional'
  const [tweaks, setTweaks] = useState({
    ...TWEAK_DEFAULTS,
    theme: resolvedVariant ? themeForVariant(resolvedVariant) : TWEAK_DEFAULTS.theme,
    parallax: isProfessional ? false : TWEAK_DEFAULTS.parallax,
    showSkills: isProfessional ? false : TWEAK_DEFAULTS.showSkills,
  })
  const hasGeneric = !!genericQuestions && genericQuestions.length > 0
  // Phase routing now opens with the comprehensive candidate profile screen
  // (replaces the old "just your name" intake) so the partner gets the full
  // filter-fuel for every play submission:
  //   no-name              → profile → generic-intake? → (opening | step-0)
  //   name (Quick-Play)    → generic-intake? → (opening | step-0)
  const initialPhase: Phase = profile.name
    ? hasGeneric
      ? 'generic-intake'
      : isProfessional ? { type: 'step', stepIdx: 0 } : 'opening'
    : 'profile'
  const [phase, setPhase] = useState<Phase>(initialPhase)
  /** Full candidate profile captured on the profile-phase screen. */
  const [candidateProfile, setCandidateProfile] = useState<import('@/lib/candidateProfile').CandidateProfile | null>(null)
  const [genericAnswers, setGenericAnswers] = useState<Record<string, string>>({})
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [lastSkill, setLastSkill] = useState<string | null>(null)
  const [reflectDone, setReflectDone] = useState<Set<number>>(new Set())
  const [audioOn, setAudioOn] = useState(false)
  const [curtain, setCurtain] = useState<'closing' | 'opening' | null>(null)
  const [lastEcho, setLastEcho] = useState<{ text: string; skill?: string } | null>(null)
  const [meterValue, setMeterValue] = useState(50)
  const [meterDelta, setMeterDelta] = useState<number | null>(null)

  const rootRef = useRef<HTMLDivElement | null>(null)

  useParallax(tweaks.parallax !== false, rootRef)
  useAmbientAudio(audioOn, scenario.id)

  const decisionSteps = useMemo(
    () => scenario.steps.filter((s) => s.kind === 'decision'),
    [scenario]
  )
  const totalDecisions = decisionSteps.length

  const transitionIdx = useRef(0)

  const transitionTo = (next: Phase) => {
    let kind: string = 'cross-fade'
    if (typeof next === 'object' && next.type === 'step') {
      const step = decisionSteps[next.stepIdx]
      kind = (step as any)?.transition || TRANSITIONS[next.stepIdx % TRANSITIONS.length]
    } else if (typeof next === 'object' && next.type === 'beat') {
      kind = 'iris-in'
    } else if (typeof next === 'object' && next.type === 'reflect') {
      kind = 'slow-zoom'
    } else if (next === 'outcome') {
      kind = 'cross-fade'
    } else if (next === 'report') {
      kind = 'page-turn'
    }
    if (rootRef.current) rootRef.current.setAttribute('data-transition', kind)
    setCurtain('closing')
    setTimeout(() => {
      setPhase(next)
      setCurtain('opening')
      setTimeout(() => setCurtain(null), 1100)
    }, 450)
  }

  const handleBegin = () => transitionTo({ type: 'step', stepIdx: 0 })

  const handleIntakeDone = (p: { name: string }) => {
    setProfile((prev) => ({ ...prev, name: p.name }))
    if (hasGeneric) transitionTo('generic-intake')
    // Advanced jumps straight to the first decision (no opening narrative).
    else if (isProfessional) transitionTo({ type: 'step', stepIdx: 0 })
    else transitionTo('opening')
  }

  const handleGenericIntakeDone = (answers: Record<string, string>) => {
    setGenericAnswers(answers)
    if (onIntakeComplete) onIntakeComplete(answers, candidateProfile || undefined)
    if (isProfessional) transitionTo({ type: 'step', stepIdx: 0 })
    else transitionTo('opening')
  }

  const advanceAfterConsequence = (currentIdx: number, lastLabel?: string) => {
    // Advanced strips reflect screens AND the mid-summary outcome screen —
    // the final report is the only bookend.
    if (isProfessional) {
      const nextIdx = currentIdx + 1
      if (nextIdx >= totalDecisions) transitionTo('report')
      else transitionTo({ type: 'step', stepIdx: nextIdx })
      return
    }
    const shouldReflect =
      tweaks.alwaysReflect || (currentIdx === 0 && !reflectDone.has(0))
    if (shouldReflect && !reflectDone.has(currentIdx)) {
      setReflectDone(new Set([...Array.from(reflectDone), currentIdx]))
      transitionTo({ type: 'reflect', basedOn: currentIdx, lastLabel })
    } else {
      const nextIdx = currentIdx + 1
      if (nextIdx >= totalDecisions) transitionTo('outcome')
      else transitionTo({ type: 'step', stepIdx: nextIdx })
    }
  }

  const handleBeatContinue = () => {
    if (typeof phase !== 'object' || phase.type !== 'beat') return
    advanceAfterConsequence(phase.stepIdx, phase.lastLabel)
  }

  const afterPick = (entry: HistoryEntry, currentIdx: number, lastLabel: string) => {
    setHistory((h) => [...h, entry])
    if (entry.skill) {
      setLastSkill(entry.skill)
      setTimeout(() => setLastSkill(null), 2200)
    }
    const echoText =
      entry.echo ||
      (entry.label && entry.consequence
        ? `You chose: ${entry.label.replace(/\.+$/, '')}. ${entry.consequence}`
        : entry.consequence) ||
      entry.label
    setLastEcho({ text: echoText, skill: entry.skill })
    // Advanced skips the outcome-beat reveal entirely — straight to next Q.
    if (isProfessional) {
      advanceAfterConsequence(currentIdx, lastLabel)
    } else {
      transitionTo({ type: 'beat', entry, stepIdx: currentIdx, lastLabel })
    }
  }

  const applyScore = (delta: number | undefined) => {
    if (typeof delta !== 'number' || delta === 0) return
    setMeterValue((v) => Math.max(0, Math.min(100, v + delta)))
    setMeterDelta(delta)
    setTimeout(() => setMeterDelta(null), 1600)
  }

  const handleDecisionPick = (opt: any) => {
    if (typeof phase !== 'object' || phase.type !== 'step') return
    const entry: HistoryEntry = {
      kind: 'decision',
      id: opt.id,
      label: opt.label,
      skill: opt.skill,
      consequence: opt.consequence,
      echo: opt.echo,
      surprise: opt.surprise,
      insight: opt.insight,
      insightNavigate: opt.insightNavigate,
      stats: opt.stats,
      ghost: opt.ghost,
      score: opt.score || 0,
      reactionColor: opt.reactionColor,
      stepIdx: phase.stepIdx,
    }
    applyScore(entry.score)

    // If the chosen option carries a follow-up tree, take the candidate
    // through the branch before proceeding. Otherwise: straight to the
    // existing afterPick flow.
    const followUp = (opt && opt.followUp) || null
    if (followUp && Array.isArray(followUp.choices) && followUp.choices.length > 0) {
      transitionTo({
        type: 'option-followup',
        entry,
        stepIdx: phase.stepIdx,
        lastLabel: opt.label,
        followUp,
      })
      return
    }
    afterPick(entry, phase.stepIdx, opt.label)
  }

  /** Candidate's follow-up choice inside an option's branch — capture it on
   *  the parent decision entry and then proceed as if we'd taken the normal
   *  afterPick path. */
  const handleFollowUpPick = (choice: { id: string; text: string; leaning: 'support' | 'neutral' | 'challenge' }) => {
    if (typeof phase !== 'object' || phase.type !== 'option-followup') return
    const enrichedEntry: HistoryEntry = {
      ...phase.entry,
      followUp: { choiceId: choice.id, text: choice.text, leaning: choice.leaning },
    } as HistoryEntry
    afterPick(enrichedEntry, phase.stepIdx, phase.lastLabel || '')
  }

  const handleDecisionCustom = (val: string | { label: string; skill?: string }) => {
    if (typeof phase !== 'object' || phase.type !== 'step') return
    const label = typeof val === 'string' ? `"${val}"` : val.label
    const skill = typeof val === 'string' ? 'Self-direction' : val.skill || 'Self-direction'
    const entry: HistoryEntry = {
      kind: 'decision',
      id: 'custom',
      label,
      skill,
      consequence: 'A decision in your own words. The room reshapes around it.',
      echo: `You chose your own path — ${label}. The room reshapes around it.`,
      stats: [
        { label: 'YOUR PATH', change: 'self-chosen' },
        { label: 'ROOM RESHAPE', change: 'pending' },
      ],
      score: 0,
      stepIdx: phase.stepIdx,
      custom: true,
    }
    afterPick(entry, phase.stepIdx, label)
  }

  const handleReflectPick = (opt: { id: string; label: string; skill?: string | null }) => {
    if (typeof phase !== 'object' || phase.type !== 'reflect') return
    setHistory((h) => [...h, { kind: 'reflect', label: opt.label }])
    const nextIdx = phase.basedOn + 1
    if (nextIdx >= totalDecisions) transitionTo('outcome')
    else transitionTo({ type: 'step', stepIdx: nextIdx })
  }
  const handleReflectCustom = (val: string) => {
    if (typeof phase !== 'object' || phase.type !== 'reflect') return
    setHistory((h) => [...h, { kind: 'reflect', label: `"${val}"`, custom: true }])
    const nextIdx = phase.basedOn + 1
    if (nextIdx >= totalDecisions) transitionTo('outcome')
    else transitionTo({ type: 'step', stepIdx: nextIdx })
  }

  const handleRestart = () => {
    setHistory([])
    setReflectDone(new Set())
    setLastSkill(null)
    setMeterValue(50)
    setMeterDelta(null)
    setLastEcho(null)
    transitionTo('intake')
  }

  const handleShowReport = () => transitionTo('report')

  const reflectStep = {
    eyebrow: 'A beat between moments',
    asker: scenario.reflect?.asker || 'A voice cuts in',
    prompt:
      scenario.reflect?.prompt ||
      'Alright — talk me through it. Why that one, and not the others?',
    options: [
      { id: 'a', label: 'Honestly? Gut call. Felt right.', skill: null as string | null },
      { id: 'b', label: 'Waiting was going to hurt more than being wrong.', skill: null },
      { id: 'c', label: 'I was reading the room, not the playbook.', skill: null },
    ],
  }

  let screenKey: string = 'opening'
  if (phase === 'intake') screenKey = 'intake'
  else if (phase === 'profile') screenKey = 'profile'
  else if (phase === 'generic-intake') screenKey = 'generic-intake'
  else if (typeof phase === 'object' && phase.type === 'option-followup') screenKey = `fu-${phase.stepIdx}-${phase.entry.id}`
  else if (phase === 'outcome') screenKey = 'outcome'
  else if (phase === 'report') screenKey = 'report'
  else if (typeof phase === 'object' && phase.type === 'step') screenKey = `step-${phase.stepIdx}`
  else if (typeof phase === 'object' && phase.type === 'reflect')
    screenKey = `reflect-${phase.basedOn}`
  else if (typeof phase === 'object' && phase.type === 'beat') screenKey = `beat-${phase.stepIdx}`
  screenKey = `${scenario.id}::${screenKey}`

  const close = () => {
    if (onExit) onExit()
    else onComplete({ kind: 'back-to-dashboard' })
  }

  return (
    <div
      ref={rootRef}
      className="lq-play-root app"
      data-theme={tweaks.theme}
      data-screen-label={screenKey}
    >
      {/* Partner branding banner — only for scenarios generated via a
          partner access code (professional variant). Hangs from the
          top-right, reads the partner's logo + name from localStorage. */}
      {isProfessional && <PlayPartnerBanner />}
      <TransitionStack keyName={screenKey}>
        {phase === 'intake' && <IntakeScreen onContinue={handleIntakeDone} />}
        {phase === 'profile' && (
          <CandidateProfileScreen
            isProfessional={isProfessional}
            onContinue={(p) => {
              setCandidateProfile(p)
              setProfile({ name: p.name })
              // Persist name like the legacy IntakeScreen did
              try { if (p.name) localStorage.setItem('launch.name', p.name) } catch {}
              if (!hasGeneric && onIntakeComplete) {
                // No pre-qualifier intake — host needs the profile NOW so it
                // can land on the Submission when the scenario completes.
                onIntakeComplete({}, p)
              }
              const next: Phase = hasGeneric
                ? 'generic-intake'
                : isProfessional ? { type: 'step', stepIdx: 0 } : 'opening'
              transitionTo(next)
            }}
          />
        )}
        {phase === 'generic-intake' && hasGeneric && (
          <IntakeQuestionsScreen
            questions={genericQuestions!}
            candidateName={profile.name}
            onComplete={handleGenericIntakeDone}
          />
        )}
        {typeof phase === 'object' && phase.type === 'option-followup' && (
          <OptionFollowUpScreen
            entry={phase.entry}
            followUp={phase.followUp}
            theme={tweaks.theme}
            isProfessional={isProfessional}
            onPick={handleFollowUpPick}
          />
        )}
        {phase === 'opening' && (
          <OpeningScreen scenario={scenario} onBegin={handleBegin} profile={profile} />
        )}
        {typeof phase === 'object' && phase.type === 'step' && (
          <DecisionScreen
            step={decisionSteps[phase.stepIdx] as any}
            index={phase.stepIdx}
            total={totalDecisions}
            onPick={handleDecisionPick}
            onCustom={handleDecisionCustom}
            showSkills={tweaks.showSkills}
            lastSkill={lastSkill}
            echo={phase.stepIdx > 0 ? lastEcho : null}
            profile={profile}
            goal={scenario.goal}
            meterValue={meterValue}
            meterDelta={meterDelta}
          />
        )}
        {typeof phase === 'object' && phase.type === 'beat' && (
          <OutcomeBeat
            entry={phase.entry}
            step={decisionSteps[phase.stepIdx] as any}
            stepIdx={phase.stepIdx}
            totalSteps={totalDecisions}
            profile={profile}
            goal={scenario.goal}
            meterValue={meterValue}
            onContinue={handleBeatContinue}
          />
        )}
        {typeof phase === 'object' && phase.type === 'reflect' && (
          <ReflectScreen
            step={reflectStep}
            index={phase.basedOn}
            total={totalDecisions}
            onPick={handleReflectPick}
            onCustom={handleReflectCustom}
            echo={lastEcho}
            profile={profile}
            goal={scenario.goal}
            meterValue={meterValue}
            meterDelta={meterDelta}
          />
        )}
        {phase === 'outcome' && (
          <OutcomeScreen
            scenario={scenario}
            history={history.filter((h) => h.kind === 'decision')}
            onRestart={handleRestart}
            onReport={handleShowReport}
            showSkills={tweaks.showSkills}
          />
        )}
        {phase === 'report' && (
          <ReportScreen
            scenario={scenario}
            history={history.filter((h) => h.kind === 'decision')}
            onRestart={handleRestart}
            onHome={close}
            onComplete={onComplete}
          />
        )}
      </TransitionStack>

      {curtain && <div className={`curtain ${curtain === 'closing' ? 'closing' : ''}`} />}

      <button
        className="audio-btn"
        onClick={() => setAudioOn((a) => !a)}
        title={audioOn ? 'Mute ambient' : 'Play ambient room tone'}
      >
        {audioOn ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 10v4h4l5 4V6l-5 4H3z" />
            <path d="M16 8c1.5 1.5 1.5 6.5 0 8M19 5c3 3 3 11 0 14" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 10v4h4l5 4V6l-5 4H3z" />
            <path d="M16 9l6 6M22 9l-6 6" />
          </svg>
        )}
      </button>

      {/* Theme toggle + exit — positioned bottom-left so they don't clash with the LQ top bar / audio btn. */}
      <div
        style={{
          position: 'fixed',
          bottom: 18,
          left: 18,
          zIndex: 50,
          display: 'flex',
          gap: 8,
        }}
      >
        <button
          onClick={() =>
            setTweaks((t) => ({ ...t, theme: t.theme === 'cream' ? 'cinema' : 'cream' }))
          }
          style={{
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.85)',
            borderRadius: 999,
            padding: '8px 14px',
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          {tweaks.theme === 'cream' ? 'Cinema' : 'Cream'}
        </button>
        <button
          onClick={close}
          style={{
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.85)',
            borderRadius: 999,
            padding: '8px 14px',
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          ← Exit
        </button>
      </div>
    </div>
  )
}

export default ScenarioPlay
