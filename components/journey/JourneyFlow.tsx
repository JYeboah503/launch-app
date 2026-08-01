'use client'

/**
 * JourneyFlow — the school-platform path, v2 ("daylight" design).
 *
 * NOT a finite library: the student describes ANYTHING they love and a
 * journey is generated around it (mocked here — the real build generates
 * via FUSE; the flagships are examples, not the catalogue).
 *
 * Stages:
 *   MAP        — "What do you love?" hero input + example tiles, the trail
 *                of completed journey stamps, and the work-scenario summit
 *                (visible from day one, locked until two climbs).
 *   GENERATING — the "building your story…" beat that makes generation felt.
 *   PLAY       — the daylight shell: the SKY is the progress bar (each
 *                journey moves through its own day), waypoint trail,
 *                italic narrator, story-card choices, page-turn consequences.
 *                No timers, no scores, no test energy.
 *   REVEAL     — the constellation (10 faint stars; your three ignite),
 *                pathway shepherding, the funnel nudge, and the locked
 *                Launch Credential.
 *
 * Mobile-responsive by design — the doc pilots students on tablets/phones.
 */

import { useEffect, useMemo, useState } from 'react'
import {
  PASSIONS, JOURNEYS, JOURNEY_REVEALS, JOURNEY_SKIES,
  generateJourney, journeyById,
} from '@/lib/play/journeyScenarios'
import type { Scenario, DecisionOption, DecisionStep } from '@/lib/play/types'
import { ArrowLeft, ArrowRight, Lock, Unlock, Mountain } from 'lucide-react'

/* ── stamps: completed journeys persist ─────────────────────────── */
const STAMPS_KEY = 'launch.journeys.v1'
interface Stamp { journeyId: string; title: string; completedAt: string }
const loadStamps = (): Stamp[] => {
  try { const r = localStorage.getItem(STAMPS_KEY); return r ? JSON.parse(r) : [] } catch { return [] }
}
const saveStamp = (s: Stamp) => {
  try { localStorage.setItem(STAMPS_KEY, JSON.stringify([s, ...loadStamps()].slice(0, 20))) } catch { /* ignore */ }
}

type Stage = 'map' | 'generating' | 'play' | 'reveal'

export function JourneyFlow({ onExit, onWorkScenarios }: { onExit: () => void; onWorkScenarios: () => void }) {
  const [stage, setStage] = useState<Stage>('map')
  const [name, setName] = useState('')
  const [journey, setJourney] = useState<Scenario | null>(null)
  const [passionLabel, setPassionLabel] = useState('')
  const [stamps, setStamps] = useState<Stamp[]>([])
  useEffect(() => { setStamps(loadStamps()) }, [stage])

  const begin = (scenario: Scenario, label: string) => {
    setJourney(scenario); setPassionLabel(label); setStage('generating')
    setTimeout(() => setStage('play'), 2100)
  }

  if (stage === 'generating' && journey) {
    const sky = JOURNEY_SKIES[journey.id]?.[0] || ['#101c33', '#27406b']
    return (
      <main className="jd-root" style={{ background: `linear-gradient(180deg, ${sky[0]}, ${sky[1]})` }}>
        <div className="jd-gen">
          <div className="jd-gen-orb" />
          <p className="jd-gen-line" style={{ animationDelay: '150ms' }}>Reading what you love&hellip;</p>
          <p className="jd-gen-line" style={{ animationDelay: '1100ms' }}>Building your story around <em>{passionLabel.toLowerCase()}</em></p>
        </div>
        <style>{jdStyles}</style>
      </main>
    )
  }

  if (stage === 'play' && journey) {
    return (
      <JourneyPlay
        journey={journey} name={name.trim() || 'Explorer'}
        onDone={() => {
          saveStamp({ journeyId: journey.id, title: passionLabel || journey.role, completedAt: new Date().toISOString() })
          setStage('reveal')
        }}
        onBail={() => setStage('map')}
      />
    )
  }

  if (stage === 'reveal' && journey) {
    return (
      <Reveal
        journey={journey} name={name.trim() || 'Explorer'} stamps={stamps}
        onAgain={() => setStage('map')} onWorkScenarios={onWorkScenarios} onDone={onExit}
      />
    )
  }

  /* ── MAP ───────────────────────────────────────────────────────── */
  const done = new Set(stamps.map((s) => s.journeyId))
  const summitOpen = stamps.length >= 2
  return (
    <main className="jd-root jd-root-day">
      <div className="jd-wrap">
        <button type="button" className="jd-back" onClick={onExit}><ArrowLeft className="w-4 h-4" /> Home</button>

        <div className="jd-eyebrow">Journeys</div>
        <h1 className="jd-h1">What do you love?</h1>
        <p className="jd-lede">Anything. We&rsquo;ll build the story around it.</p>

        <div className="jd-hero-row">
          <input
            type="text" className="jd-name" placeholder="I'm…"
            value={name} onChange={(e) => setName(e.target.value)}
          />
          <PassionInput onGo={(text) => { const g = generateJourney(text); begin(g.scenario, g.passionLabel) }} />
        </div>

        <div className="jd-examples">
          <span className="jd-label">or start from one of these</span>
          <div className="jd-tiles">
            {PASSIONS.map((p, i) => (
              <button key={p.id} type="button" className="jd-tile" style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => begin(journeyById(p.journeyId)!, p.label)}>
                <span className="jd-tile-emoji">{p.emoji}</span>{p.label}
              </button>
            ))}
          </div>
        </div>

        {/* The trail — stamps below, summit above. Progress you can see. */}
        <div className="jd-trail">
          <div className="jd-label" style={{ marginBottom: 16 }}>Your trail</div>

          <div className={`jd-summit ${summitOpen ? 'is-open' : ''}`}>
            <Mountain className="w-5 h-5" />
            <span className="jd-summit-body">
              <span className="jd-summit-title">Work scenarios</span>
              <span className="jd-summit-sub">{summitOpen ? 'Unlocked — you’ve climbed enough. Higher stakes await.' : `Unlocks after 2 journeys · ${stamps.length}/2`}</span>
            </span>
            {summitOpen
              ? <button type="button" className="jd-go" onClick={onWorkScenarios}>Enter <ArrowRight className="w-4 h-4" /></button>
              : <Lock className="w-4 h-4" style={{ opacity: 0.5 }} />}
          </div>

          {JOURNEYS.map((j) => {
            const stamp = stamps.find((s) => s.journeyId === j.id)
            return (
              <button key={j.id} type="button" className={`jd-way ${stamp ? 'is-done' : ''}`} onClick={() => begin(j, j.role.split(' — ')[0])}>
                <span className="jd-way-dot" style={{ background: `linear-gradient(135deg, ${JOURNEY_SKIES[j.id]?.[3]?.[0] || '#888'}, ${JOURNEY_SKIES[j.id]?.[4]?.[1] || '#ccc'})` }} />
                <span className="jd-way-body">
                  <span className="jd-way-title">{j.role}</span>
                  <span className="jd-way-sub">{stamp ? `Completed · ${new Date(stamp.completedAt).toLocaleDateString()}` : `${j.steps.length} choices · ~10 min`}</span>
                </span>
                <span className="jd-way-cta">{stamp ? 'Again' : 'Play'} <ArrowRight className="w-3.5 h-3.5" /></span>
              </button>
            )
          })}
        </div>
      </div>
      <style>{jdStyles}</style>
    </main>
  )
}

function PassionInput({ onGo }: { onGo: (text: string) => void }) {
  const [text, setText] = useState('')
  return (
    <div className="jd-passion">
      <input
        type="text" className="jd-passion-input"
        placeholder="fishing with pop · BMX · baking · horses…"
        value={text} onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) onGo(text) }}
      />
      <button type="button" className="jd-go" disabled={!text.trim()} onClick={() => onGo(text)}>
        Build my journey <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

/* ── PLAY · the daylight shell ──────────────────────────────────── */

type Beat = { kind: 'opening' } | { kind: 'step'; i: number } | { kind: 'after'; i: number; opt: DecisionOption } | { kind: 'outcome' }

function JourneyPlay({ journey, name, onDone, onBail }: { journey: Scenario; name: string; onDone: () => void; onBail: () => void }) {
  const [beat, setBeat] = useState<Beat>({ kind: 'opening' })
  const [own, setOwn] = useState('')
  const skies = JOURNEY_SKIES[journey.id] || JOURNEY_SKIES['journey-surf']
  const skyIdx = beat.kind === 'opening' ? 0 : beat.kind === 'outcome' ? skies.length - 1 : Math.min((beat.kind === 'after' ? beat.i + 1 : beat.i) + 1, skies.length - 2)
  const sky = skies[skyIdx]
  const fill = (s: string) => s.replace(/\{name\}/g, name)
  const step: DecisionStep | null = beat.kind === 'step' ? (journey.steps[beat.i] as DecisionStep) : null
  const late = skyIdx >= skies.length - 2 // light skies → dark ink text

  const pick = (i: number, opt: DecisionOption) => { setOwn(''); setBeat({ kind: 'after', i, opt }) }
  const next = (i: number) => (i + 1 < journey.steps.length ? setBeat({ kind: 'step', i: i + 1 }) : setBeat({ kind: 'outcome' }))

  return (
    <main className={`jd-root jd-play ${late ? 'is-late' : ''}`} style={{ background: `linear-gradient(180deg, ${sky[0]}, ${sky[1]})` }}>
      <div className="jd-wrap jd-wrap-play">
        <button type="button" className="jd-back jd-back-play" onClick={onBail}><ArrowLeft className="w-4 h-4" /> Leave the story</button>

        {beat.kind === 'opening' && (
          <div className="jd-beat">
            <div className="jd-eyebrow-play">{fill(journey.opening.eyebrow)}</div>
            <h1 className="jd-prompt">{fill(journey.opening.title)}</h1>
            <p className="jd-narrator">{fill(journey.opening.body)}</p>
            <button type="button" className="jd-go jd-go-big" onClick={() => setBeat({ kind: 'step', i: 0 })}>
              Step in <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step && beat.kind === 'step' && (
          <div className="jd-beat" key={beat.i}>
            <div className="jd-eyebrow-play">{step.eyebrow}</div>
            {step.sceneCaption && <p className="jd-narrator jd-narrator-sm">{fill(step.sceneCaption)}</p>}
            <h1 className="jd-prompt">{fill(step.prompt)}</h1>
            <div className="jd-cards">
              {step.options.map((o, oi) => (
                <button key={o.id} type="button" className="jd-card" style={{ animationDelay: `${oi * 90}ms` }} onClick={() => pick(beat.i, o)}>
                  {o.label}
                </button>
              ))}
            </div>
            <div className="jd-own">
              <input
                type="text" className="jd-own-input" placeholder="or, in your own words…"
                value={own} onChange={(e) => setOwn(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && own.trim()) pick(beat.i, {
                    id: 'own', label: own.trim(),
                    echo: 'You did it your way.', consequence: 'The morning bent around your call — and held.',
                    stats: [{ label: 'YOUR PATH', change: 'self-chosen' }],
                  })
                }}
              />
            </div>
          </div>
        )}

        {beat.kind === 'after' && (
          <div className="jd-beat">
            <div className="jd-eyebrow-play">What happened next</div>
            <h1 className="jd-prompt jd-prompt-echo">{fill(beat.opt.echo || beat.opt.consequence || 'The story moved.')}</h1>
            {beat.opt.consequence && beat.opt.echo && <p className="jd-narrator">{fill(beat.opt.consequence)}</p>}
            {beat.opt.stats && (
              <div className="jd-chips">
                {beat.opt.stats.map((s) => <span key={s.label} className="jd-chip">{s.label.toLowerCase()} · {s.change}</span>)}
              </div>
            )}
            <button type="button" className="jd-go jd-go-big" onClick={() => next(beat.i)}>
              Keep going <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {beat.kind === 'outcome' && (
          <div className="jd-beat">
            <div className="jd-eyebrow-play">{fill(journey.outcome.eyebrow)}</div>
            <h1 className="jd-prompt">{fill(journey.outcome.title)}</h1>
            <p className="jd-narrator">{fill(journey.outcome.body)}</p>
            <button type="button" className="jd-go jd-go-big" onClick={onDone}>
              See what you showed <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* The waypoint trail — stones on sand, not a progress bar */}
        <div className="jd-waytrail" aria-hidden>
          {[-1, ...journey.steps.map((_, i) => i)].map((i) => {
            const here = (beat.kind === 'opening' && i === -1) || ((beat.kind === 'step' || beat.kind === 'after') && beat.i === i)
            const past = beat.kind === 'outcome' || (beat.kind !== 'opening' && i < (beat.kind === 'step' || beat.kind === 'after' ? beat.i : -1)) || (i === -1 && beat.kind !== 'opening')
            return <span key={i} className={`jd-stone ${here ? 'is-here' : ''} ${past ? 'is-past' : ''}`} />
          })}
          <span className={`jd-stone jd-stone-star ${beat.kind === 'outcome' ? 'is-here' : ''}`}>✦</span>
        </div>
      </div>
      <style>{jdStyles}</style>
    </main>
  )
}

/* ── REVEAL · constellation + pathways + credential ─────────────── */

const STAR_POS = [
  [12, 30], [26, 14], [40, 34], [55, 10], [68, 28], [82, 16], [90, 42], [22, 52], [50, 56], [76, 58],
] // % coords in the sky box

function Reveal({ journey, name, stamps, onAgain, onWorkScenarios, onDone }: {
  journey: Scenario; name: string; stamps: Stamp[]
  onAgain: () => void; onWorkScenarios: () => void; onDone: () => void
}) {
  const reveal = JOURNEY_REVEALS[journey.id] || JOURNEY_REVEALS['journey-surf']
  const [unlocked, setUnlocked] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const litIdx = useMemo(() => [1, 4, 8], []) // which stars ignite
  const credId = `LNCH-${journey.id.slice(8, 10).toUpperCase()}-${(name.length * 7919 % 8999 + 1000)}`

  return (
    <main className="jd-root jd-root-day">
      <div className="jd-wrap jd-wrap-wide">
        <div className="jd-eyebrow">That wasn&rsquo;t a test</div>
        <h1 className="jd-h1">Here&rsquo;s what you showed, {name}.</h1>

        {/* Constellation — 10 faint stars, your three ignite */}
        <div className="jd-sky">
          {STAR_POS.map(([x, y], i) => {
            const lit = litIdx.indexOf(i)
            const cap = lit >= 0 ? reveal.capabilities[lit] : null
            return (
              <span key={i} className={`jd-star ${cap ? 'is-lit' : ''}`} style={{ left: `${x}%`, top: `${y}%`, animationDelay: cap ? `${400 + lit * 500}ms` : undefined }}>
                {cap && (
                  <span className="jd-star-tag" style={{ animationDelay: `${700 + lit * 500}ms` }}>
                    <b>{cap.level}</b> {cap.name}
                  </span>
                )}
              </span>
            )
          })}
        </div>
        <div className="jd-cap-lines">
          {reveal.capabilities.map((c, i) => (
            <p key={c.name} className="jd-cap-line" style={{ animationDelay: `${900 + i * 500}ms` }}>{c.line}</p>
          ))}
        </div>

        {/* Pathways + the funnel nudge */}
        <div className="jd-path">
          <h2 className="jd-h2">People who decide like you thrive in&hellip;</h2>
          <div className="jd-path-grid">
            <div><div className="jd-label" style={{ marginBottom: 10 }}>Subjects</div>
              <div className="jd-chips">{reveal.subjects.map((s) => <span key={s} className="jd-chip jd-chip-teal">{s}</span>)}</div></div>
            <div><div className="jd-label" style={{ marginBottom: 10 }}>Directions</div>
              <div className="jd-chips">{reveal.directions.map((d) => <span key={d} className="jd-chip">{d}</span>)}</div></div>
          </div>
          <button type="button" className="jd-nudge" onClick={onWorkScenarios}>
            <span><span className="jd-nudge-title">Ready for a bigger one?</span>
              <span className="jd-nudge-sub">A work scenario — same you, higher stakes.</span></span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Credential — stamps fill it; locked until unlocked */}
        <div className="jd-cred-wrap">
          <div className={`jd-cred ${unlocked ? '' : 'is-locked'}`}>
            <div className="jd-cred-head"><span className="jd-cred-brand">LAUNCH CREDENTIAL</span><span className="jd-cred-id">{credId}</span></div>
            <div className="jd-cred-name">{name}</div>
            <div className="jd-chips" style={{ marginBottom: 14 }}>
              {reveal.capabilities.map((c) => <span key={c.name} className="jd-chip jd-chip-dark">{c.name.split(' ')[0]} {c.level}</span>)}
            </div>
            <div className="jd-cred-stamps">
              {[0, 1, 2, 3, 4].map((i) => <span key={i} className={`jd-slot ${i < Math.min(Math.max(stamps.length, 1), 5) ? 'is-filled' : ''}`} />)}
              <span className="jd-cred-foot">{Math.min(Math.max(stamps.length, 1), 5)}/5 journey stamps · Verified by Launch</span>
            </div>
          </div>
          {!unlocked && (
            <div className="jd-cred-gate">
              <Lock className="w-5 h-5" />
              {confirming ? (
                <div className="jd-gate-confirm">
                  <span>Unlocks with a school or family plan.</span>
                  <button type="button" className="jd-go" onClick={() => setUnlocked(true)}><Unlock className="w-4 h-4" /> Unlock (demo)</button>
                </div>
              ) : (
                <button type="button" className="jd-gate-btn" onClick={() => setConfirming(true)}>Unlock your credential</button>
              )}
            </div>
          )}
        </div>

        <div className="jd-foot">
          <button type="button" className="jd-ghost" onClick={onAgain}>Another journey</button>
          <button type="button" className="jd-ghost" onClick={onDone}>Done</button>
        </div>
      </div>
      <style>{jdStyles}</style>
    </main>
  )
}

/* ── daylight styles — warm, responsive, zero test energy ───────── */

const jdStyles = `
  .jd-root { min-height: 100vh; transition: background 1200ms ease; }
  .jd-root-day { background: linear-gradient(180deg, #fdf8ec 0%, #f3ecdb 100%); color: #22242a; }
  .jd-wrap { max-width: 820px; margin: 0 auto; padding: 40px 22px 90px; }
  .jd-wrap-wide { max-width: 880px; }
  .jd-wrap-play { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding-bottom: 110px; }
  .jd-back { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 34px; background: none; border: none; cursor: pointer; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #8a8c92; }
  .jd-back:hover { color: #22242a; }
  .jd-back-play { position: absolute; top: 22px; left: 22px; color: rgba(255,255,255,0.55); z-index: 5; }
  .jd-back-play:hover { color: #fff; }
  .is-late .jd-back-play { color: rgba(34,36,42,0.5); } .is-late .jd-back-play:hover { color: #22242a; }
  .jd-eyebrow { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700; color: var(--launch-teal-3, #126b60); margin-bottom: 12px; }
  .jd-h1 { font-family: var(--font-display); font-weight: 450; font-size: clamp(34px, 6vw, 58px); letter-spacing: -0.03em; line-height: 1.03; margin: 0 0 10px; color: #22242a; }
  .jd-h2 { font-family: var(--font-display); font-weight: 500; font-size: clamp(21px, 3vw, 28px); letter-spacing: -0.02em; margin: 0 0 18px; }
  .jd-lede { font-size: 16px; color: #5d5f66; margin-bottom: 30px; }
  .jd-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600; color: #8a8c92; }

  .jd-hero-row { display: flex; gap: 10px; margin-bottom: 22px; flex-wrap: wrap; }
  .jd-name { width: 130px; border: 1.5px solid rgba(34,36,42,0.12); border-radius: 999px; background: #fff; padding: 13px 18px; font-family: var(--font-display); font-size: 16px; outline: none; }
  .jd-name:focus { border-color: var(--launch-teal, #1B9E8F); }
  .jd-passion { flex: 1; display: flex; gap: 10px; min-width: 280px; }
  .jd-passion-input { flex: 1; border: 1.5px solid rgba(34,36,42,0.12); border-radius: 999px; background: #fff; padding: 13px 20px; font-size: 15px; outline: none; }
  .jd-passion-input:focus { border-color: var(--launch-teal, #1B9E8F); }
  .jd-go { display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 999px; border: none; background: #22242a; color: #fff; font-family: var(--font-body); font-weight: 600; font-size: 14px; cursor: pointer; white-space: nowrap; transition: opacity 160ms ease, transform 160ms ease; }
  .jd-go:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
  .jd-go:disabled { opacity: 0.35; cursor: not-allowed; }
  .jd-go-big { padding: 14px 26px; font-size: 15px; margin-top: 8px; }

  .jd-examples { margin-bottom: 44px; }
  .jd-tiles { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 10px; }
  .jd-tile { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 999px; background: #fff; border: 1.5px solid rgba(34,36,42,0.08); font-family: var(--font-body); font-weight: 600; font-size: 14px; cursor: pointer; animation: jd-pop 380ms cubic-bezier(0.2,0.8,0.3,1.1) both; transition: border-color 160ms ease, transform 160ms ease; }
  .jd-tile:hover { border-color: var(--launch-teal, #1B9E8F); transform: translateY(-2px); }
  .jd-tile-emoji { font-size: 19px; }
  @keyframes jd-pop { from { opacity: 0; transform: translateY(10px) scale(0.96); } to { opacity: 1; transform: none; } }

  .jd-trail { border-top: 1.5px solid rgba(34,36,42,0.08); padding-top: 26px; }
  .jd-summit { display: flex; align-items: center; gap: 14px; padding: 18px 20px; border-radius: 18px; background: #22242a; color: #fff; margin-bottom: 12px; }
  .jd-summit.is-open { background: linear-gradient(135deg, #145f55, #1B9E8F); }
  .jd-summit-body { flex: 1; } .jd-summit-title { display: block; font-family: var(--font-display); font-weight: 500; font-size: 16px; }
  .jd-summit-sub { display: block; font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 2px; }
  .jd-way { width: 100%; display: flex; align-items: center; gap: 14px; text-align: left; padding: 14px 16px; border-radius: 16px; background: #fff; border: 1.5px solid rgba(34,36,42,0.07); margin-bottom: 10px; cursor: pointer; transition: border-color 160ms ease, transform 160ms ease; }
  .jd-way:hover { border-color: #22242a; transform: translateY(-1px); }
  .jd-way.is-done { background: rgba(27,158,143,0.06); }
  .jd-way-dot { width: 34px; height: 34px; border-radius: 12px; flex-shrink: 0; }
  .jd-way-body { flex: 1; min-width: 0; }
  .jd-way-title { display: block; font-family: var(--font-display); font-weight: 500; font-size: 15px; }
  .jd-way-sub { display: block; font-size: 11.5px; color: #8a8c92; margin-top: 1px; }
  .jd-way-cta { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; color: var(--launch-teal-3, #126b60); white-space: nowrap; }

  /* generating */
  .jd-gen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; color: rgba(255,255,255,0.9); text-align: center; padding: 20px; }
  .jd-gen-orb { width: 54px; height: 54px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.15) 70%); animation: jd-breathe 1.6s ease-in-out infinite; }
  @keyframes jd-breathe { 0%,100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.18); opacity: 1; } }
  .jd-gen-line { font-family: var(--font-display); font-style: italic; font-size: clamp(17px, 2.6vw, 23px); opacity: 0; animation: jd-fadein 700ms ease forwards; }
  @keyframes jd-fadein { to { opacity: 1; } }

  /* play */
  .jd-play { color: #fff; position: relative; }
  .jd-play.is-late { color: #22242a; }
  .jd-beat { animation: jd-fadein 600ms ease both; }
  .jd-eyebrow-play { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700; opacity: 0.6; margin-bottom: 14px; }
  .jd-prompt { font-family: var(--font-display); font-weight: 450; font-size: clamp(26px, 4.6vw, 44px); letter-spacing: -0.025em; line-height: 1.12; margin: 0 0 16px; max-width: 24ch; color: inherit; }
  .jd-prompt-echo { font-style: italic; }
  .jd-narrator { font-family: var(--font-display); font-style: italic; font-size: clamp(15px, 2vw, 18px); line-height: 1.6; opacity: 0.82; max-width: 58ch; margin-bottom: 26px; }
  .jd-narrator-sm { font-size: 14px; margin-bottom: 10px; }
  .jd-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 14px; }
  @media (max-width: 700px) { .jd-cards { grid-template-columns: 1fr; } }
  .jd-card { text-align: left; padding: 20px; border-radius: 18px; background: rgba(255,255,255,0.94); color: #22242a; border: 1.5px solid transparent; font-family: var(--font-display); font-weight: 500; font-size: 15.5px; line-height: 1.45; cursor: pointer; animation: jd-pop 420ms cubic-bezier(0.2,0.8,0.3,1.1) both; transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease; }
  .jd-card:hover { transform: translateY(-3px); border-color: var(--launch-teal, #1B9E8F); box-shadow: 0 16px 30px -20px rgba(0,0,0,0.5); }
  .jd-own-input { width: 100%; border: 1.5px dashed rgba(255,255,255,0.35); border-radius: 999px; background: rgba(255,255,255,0.08); padding: 12px 20px; font-size: 14px; color: inherit; outline: none; }
  .is-late .jd-own-input { border-color: rgba(34,36,42,0.25); background: rgba(255,255,255,0.5); }
  .jd-own-input::placeholder { color: currentColor; opacity: 0.55; }
  .jd-own-input:focus { border-style: solid; border-color: var(--launch-teal, #1B9E8F); }
  .jd-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }
  .jd-chip { padding: 7px 14px; border-radius: 999px; background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.25); font-size: 12.5px; font-weight: 600; }
  .jd-root-day .jd-chip { background: rgba(34,36,42,0.05); border-color: rgba(34,36,42,0.1); color: #22242a; }
  .is-late .jd-chip { background: rgba(34,36,42,0.07); border-color: rgba(34,36,42,0.14); }
  .jd-chip-teal { background: rgba(27,158,143,0.1) !important; border-color: transparent !important; color: var(--launch-teal-3, #126b60) !important; }
  .jd-chip-dark { background: rgba(255,255,255,0.1) !important; border-color: rgba(255,255,255,0.25) !important; color: rgba(255,255,255,0.85) !important; }
  .jd-waytrail { position: absolute; bottom: 30px; left: 0; right: 0; display: flex; align-items: center; justify-content: center; gap: 14px; }
  .jd-stone { width: 9px; height: 9px; border-radius: 50%; background: currentColor; opacity: 0.25; transition: all 400ms ease; }
  .jd-stone.is-past { opacity: 0.55; }
  .jd-stone.is-here { opacity: 1; transform: scale(1.5); box-shadow: 0 0 0 5px rgba(255,255,255,0.15); }
  .jd-stone-star { background: none; width: auto; height: auto; font-size: 13px; }

  /* reveal */
  .jd-sky { position: relative; height: 240px; border-radius: 22px; background: linear-gradient(180deg, #101c33, #27406b); margin: 18px 0 8px; overflow: hidden; }
  .jd-star { position: absolute; width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.35); }
  .jd-star.is-lit { width: 11px; height: 11px; margin: -3px; background: #fff; animation: jd-ignite 900ms ease both; box-shadow: 0 0 18px 4px rgba(255,255,240,0.7); }
  @keyframes jd-ignite { from { transform: scale(0.2); opacity: 0; } 60% { transform: scale(1.5); } to { transform: scale(1); opacity: 1; } }
  .jd-star-tag { position: absolute; top: 14px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.04em; color: rgba(255,255,255,0.9); background: rgba(0,0,0,0.3); border-radius: 999px; padding: 4px 10px; opacity: 0; animation: jd-fadein 600ms ease forwards; }
  .jd-star-tag b { color: #7fe0d2; }
  @media (max-width: 700px) { .jd-star-tag { font-size: 8.5px; } .jd-sky { height: 200px; } }
  .jd-cap-lines { margin: 16px 0 44px; }
  .jd-cap-line { font-family: var(--font-display); font-style: italic; font-size: 15px; color: #5d5f66; line-height: 1.6; margin: 4px 0; opacity: 0; animation: jd-fadein 600ms ease forwards; }
  .jd-path { background: #fff; border: 1.5px solid rgba(34,36,42,0.08); border-radius: 22px; padding: 28px; margin-bottom: 46px; }
  .jd-path-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-bottom: 22px; }
  @media (max-width: 620px) { .jd-path-grid { grid-template-columns: 1fr; } }
  .jd-nudge { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 14px; text-align: left; padding: 18px 22px; border-radius: 16px; border: none; background: #22242a; color: #fff; cursor: pointer; transition: transform 160ms ease, opacity 160ms ease; }
  .jd-nudge:hover { transform: translateY(-1px); opacity: 0.92; }
  .jd-nudge-title { display: block; font-family: var(--font-display); font-weight: 500; font-size: 17px; }
  .jd-nudge-sub { display: block; font-size: 12.5px; color: rgba(255,255,255,0.6); margin-top: 3px; }
  .jd-cred-wrap { position: relative; margin-bottom: 40px; }
  .jd-cred { background: linear-gradient(135deg, #171921, #232734 60%, #1c2c2a); border-radius: 22px; padding: 28px 30px; color: #fff; transition: filter 400ms ease; }
  .jd-cred.is-locked { filter: blur(7px) saturate(0.8); pointer-events: none; user-select: none; }
  .jd-cred-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 18px; flex-wrap: wrap; gap: 6px; }
  .jd-cred-brand { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.28em; font-weight: 700; color: var(--launch-teal, #1B9E8F); }
  .jd-cred-id { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; color: rgba(255,255,255,0.4); }
  .jd-cred-name { font-family: var(--font-display); font-weight: 500; font-size: clamp(24px, 4vw, 36px); letter-spacing: -0.02em; margin-bottom: 14px; }
  .jd-cred-stamps { display: flex; align-items: center; gap: 7px; }
  .jd-slot { width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.35); }
  .jd-slot.is-filled { background: var(--launch-teal, #1B9E8F); border-color: var(--launch-teal, #1B9E8F); }
  .jd-cred-foot { font-size: 11px; color: rgba(255,255,255,0.45); margin-left: 8px; }
  .jd-cred-gate { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #fff; }
  .jd-gate-btn { padding: 11px 22px; border-radius: 999px; border: 1.5px solid rgba(255,255,255,0.5); background: rgba(23,25,33,0.5); color: #fff; font-weight: 600; font-size: 14px; cursor: pointer; backdrop-filter: blur(2px); }
  .jd-gate-btn:hover { border-color: #fff; }
  .jd-gate-confirm { display: flex; flex-direction: column; align-items: center; gap: 10px; font-size: 13px; text-shadow: 0 1px 8px rgba(0,0,0,0.5); }
  .jd-foot { display: flex; gap: 10px; }
  .jd-ghost { padding: 11px 20px; border-radius: 999px; border: 1.5px solid rgba(34,36,42,0.16); background: transparent; color: #5d5f66; font-weight: 600; font-size: 13.5px; cursor: pointer; transition: border-color 160ms ease, color 160ms ease; }
  .jd-ghost:hover { border-color: #22242a; color: #22242a; }
`
