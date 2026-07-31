'use client'

/**
 * JourneyFlow — the school-platform path ("Journeys" door). Three stages:
 *
 *   1. PICK    — warm passion picker: big tactile tiles + "tell us yours".
 *                The student never sees a test; they pick what they love.
 *   2. PLAY    — the existing play engine runs a gentle flagship journey
 *                (cinema shell, softened student-facing copy).
 *   3. REVEAL  — the gift at the end: capabilities demonstrated →
 *                pathway shepherding (subjects + directions + the funnel
 *                nudge toward work scenarios) → the Launch Credential,
 *                locked by default, unlock mocked for the prototype.
 */

import { useMemo, useState } from 'react'
import { ScenarioPlay } from '@/components/play'
import {
  PASSIONS, JOURNEY_REVEALS, journeyForPassion, journeyById,
} from '@/lib/play/journeyScenarios'
import type { Scenario } from '@/lib/play/types'
import { ArrowLeft, ArrowRight, Lock, Unlock, Sparkles } from 'lucide-react'

type Stage = 'pick' | 'play' | 'reveal'

export function JourneyFlow({ onExit, onWorkScenarios }: { onExit: () => void; onWorkScenarios: () => void }) {
  const [stage, setStage] = useState<Stage>('pick')
  const [name, setName] = useState('')
  const [loveText, setLoveText] = useState('')
  const [journey, setJourney] = useState<Scenario | null>(null)

  const start = (j: Scenario) => { setJourney(j); setStage('play') }

  if (stage === 'play' && journey) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#0e1833' }}>
        <ScenarioPlay
          scenario={journey}
          profile={{ name: name.trim() || 'Explorer' }}
          onComplete={() => setStage('reveal')}
          onExit={() => setStage('reveal')}
        />
      </div>
    )
  }

  if (stage === 'reveal' && journey) {
    return (
      <RevealScreen
        journey={journey}
        name={name.trim() || 'Explorer'}
        onAgain={() => { setJourney(null); setStage('pick') }}
        onWorkScenarios={onWorkScenarios}
        onDone={onExit}
      />
    )
  }

  /* ── Stage 1 · the passion picker ─────────────────────────────── */
  return (
    <main className="jf-root">
      <div className="jf-wrap">
        <button type="button" className="jf-back" onClick={onExit}><ArrowLeft className="w-4 h-4" /> Home</button>

        <div className="jf-eyebrow">Your journey</div>
        <h1 className="jf-h1">What do you love?</h1>
        <p className="jf-lede">Pick one. We&rsquo;ll build the story around it.</p>

        <div className="jf-name">
          <label className="jf-label" htmlFor="jf-name">I&rsquo;m</label>
          <input
            id="jf-name" type="text" className="jf-name-input" placeholder="your name"
            value={name} onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="jf-tiles">
          {PASSIONS.map((p, i) => (
            <button
              key={p.id} type="button" className="jf-tile"
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => start(journeyById(p.journeyId)!)}
            >
              <span className="jf-tile-emoji">{p.emoji}</span>
              <span className="jf-tile-label">{p.label}</span>
            </button>
          ))}
        </div>

        <div className="jf-or">
          <input
            type="text" className="jf-love"
            placeholder="or tell us — fishing with pop, baking, BMX…"
            value={loveText}
            onChange={(e) => setLoveText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && loveText.trim()) start(journeyForPassion(loveText)) }}
          />
          <button
            type="button" className="jf-go" disabled={!loveText.trim()}
            onClick={() => start(journeyForPassion(loveText))}
          >
            Let&rsquo;s go <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <style>{jfStyles}</style>
    </main>
  )
}

/* ── Stage 3 · the reveal ───────────────────────────────────────── */

function RevealScreen({ journey, name, onAgain, onWorkScenarios, onDone }: {
  journey: Scenario
  name: string
  onAgain: () => void
  onWorkScenarios: () => void
  onDone: () => void
}) {
  const reveal = JOURNEY_REVEALS[journey.id] || JOURNEY_REVEALS['journey-surf']
  const [unlocked, setUnlocked] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const credId = useMemo(() => `LNCH-${journey.id.slice(8, 10).toUpperCase()}-${(name.length * 7919 % 8999 + 1000)}`, [journey.id, name])

  return (
    <main className="jf-root">
      <div className="jf-wrap jf-wrap-wide">

        {/* 1 · Capability reveal */}
        <div className="jf-eyebrow"><Sparkles className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: 6 }} />That wasn&rsquo;t a test</div>
        <h1 className="jf-h1">Here&rsquo;s what you just showed, {name}.</h1>
        <p className="jf-lede">Real choices, real skills. These three stood out.</p>

        <div className="jf-caps">
          {reveal.capabilities.map((c, i) => (
            <div key={c.name} className="jf-cap" style={{ animationDelay: `${i * 140}ms` }}>
              <div className="jf-cap-level">{c.level}</div>
              <div className="jf-cap-name">{c.name}</div>
              <div className="jf-cap-line">{c.line}</div>
            </div>
          ))}
        </div>

        {/* 2 · Pathway shepherding */}
        <div className="jf-path">
          <h2 className="jf-h2">People who decide like you thrive in&hellip;</h2>
          <div className="jf-path-grid">
            <div>
              <div className="jf-label" style={{ marginBottom: 10 }}>Subjects to lean into</div>
              <div className="jf-chips">{reveal.subjects.map((s) => <span key={s} className="jf-chip">{s}</span>)}</div>
            </div>
            <div>
              <div className="jf-label" style={{ marginBottom: 10 }}>Directions worth a look</div>
              <div className="jf-chips">{reveal.directions.map((d) => <span key={d} className="jf-chip jf-chip-dir">{d}</span>)}</div>
            </div>
          </div>
          {/* The funnel nudge — maturing toward work scenarios */}
          <button type="button" className="jf-nudge" onClick={onWorkScenarios}>
            <span>
              <span className="jf-nudge-title">Ready for a bigger one?</span>
              <span className="jf-nudge-sub">Try a work scenario — same you, higher stakes.</span>
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* 3 · Launch Credential — locked until unlocked */}
        <div className="jf-cred-wrap">
          <div className={`jf-cred ${unlocked ? '' : 'is-locked'}`}>
            <div className="jf-cred-head">
              <span className="jf-cred-brand">LAUNCH CREDENTIAL</span>
              <span className="jf-cred-id">{credId}</span>
            </div>
            <div className="jf-cred-name">{name}</div>
            <div className="jf-cred-caps">
              {reveal.capabilities.map((c) => (
                <span key={c.name} className="jf-cred-cap">{c.name.split(' ')[0]} {c.level}</span>
              ))}
            </div>
            <div className="jf-cred-foot">Verified by Launch · {journey.role}</div>
          </div>

          {!unlocked && (
            <div className="jf-cred-gate">
              <Lock className="w-5 h-5" />
              {confirming ? (
                <div className="jf-gate-confirm">
                  <span>Unlocks with a school or family plan.</span>
                  <button type="button" className="jf-go" onClick={() => setUnlocked(true)}>
                    <Unlock className="w-4 h-4" /> Unlock (demo)
                  </button>
                </div>
              ) : (
                <button type="button" className="jf-gate-btn" onClick={() => setConfirming(true)}>
                  Unlock your credential
                </button>
              )}
            </div>
          )}
        </div>

        <div className="jf-foot">
          <button type="button" className="jf-ghost" onClick={onAgain}>Play another journey</button>
          <button type="button" className="jf-ghost" onClick={onDone}>Done</button>
        </div>
      </div>
      <style>{jfStyles}</style>
    </main>
  )
}

/* ── styles — warm, young, zero test-energy ─────────────────────── */

const jfStyles = `
  .jf-root { min-height: 100vh; background: linear-gradient(180deg, #faf6ec 0%, #f4efe2 100%); color: #22242a; }
  .jf-wrap { max-width: 760px; margin: 0 auto; padding: 48px 24px 90px; }
  .jf-wrap-wide { max-width: 860px; }
  .jf-back { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 40px; background: none; border: none; cursor: pointer; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #8a8c92; }
  .jf-back:hover { color: #22242a; }
  .jf-eyebrow { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700; color: var(--launch-teal-3, #126b60); margin-bottom: 14px; }
  .jf-h1 { font-family: var(--font-display); font-weight: 450; font-size: clamp(34px, 5.4vw, 58px); letter-spacing: -0.03em; line-height: 1.04; margin: 0 0 12px; }
  .jf-h2 { font-family: var(--font-display); font-weight: 500; font-size: clamp(22px, 3vw, 30px); letter-spacing: -0.02em; margin: 0 0 20px; }
  .jf-lede { font-size: 16px; color: #5d5f66; margin-bottom: 34px; }
  .jf-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600; color: #8a8c92; }

  .jf-name { display: flex; align-items: baseline; gap: 12px; margin-bottom: 26px; }
  .jf-name-input { border: none; border-bottom: 2px solid rgba(34,36,42,0.2); background: transparent; font-family: var(--font-display); font-size: 24px; padding: 2px 4px 6px; color: #22242a; outline: none; width: 240px; }
  .jf-name-input:focus { border-bottom-color: var(--launch-teal, #1B9E8F); }
  .jf-name-input::placeholder { color: #b9bbc1; }

  .jf-tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 26px; }
  @media (max-width: 620px) { .jf-tiles { grid-template-columns: repeat(2, 1fr); } }
  .jf-tile { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 30px 16px 24px; background: #fff; border: 1.5px solid rgba(34,36,42,0.08); border-radius: 22px; cursor: pointer; transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease; animation: jf-pop 420ms cubic-bezier(0.2, 0.8, 0.3, 1.1) both; }
  .jf-tile:hover { transform: translateY(-4px) rotate(-0.5deg); border-color: var(--launch-teal, #1B9E8F); box-shadow: 0 18px 34px -22px rgba(27, 158, 143, 0.55); }
  .jf-tile-emoji { font-size: 40px; line-height: 1; }
  .jf-tile-label { font-family: var(--font-display); font-weight: 500; font-size: 16px; }
  @keyframes jf-pop { from { opacity: 0; transform: translateY(14px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

  .jf-or { display: flex; gap: 10px; align-items: center; }
  .jf-love { flex: 1; border: 1.5px solid rgba(34,36,42,0.12); border-radius: 999px; background: #fff; padding: 13px 20px; font-family: var(--font-body); font-size: 15px; color: #22242a; outline: none; }
  .jf-love:focus { border-color: var(--launch-teal, #1B9E8F); }
  .jf-go { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 999px; border: none; background: #22242a; color: #fff; font-family: var(--font-body); font-weight: 600; font-size: 14px; cursor: pointer; transition: opacity 160ms ease, transform 160ms ease; }
  .jf-go:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
  .jf-go:disabled { opacity: 0.35; cursor: not-allowed; }

  /* Reveal */
  .jf-caps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 8px 0 52px; }
  @media (max-width: 680px) { .jf-caps { grid-template-columns: 1fr; } }
  .jf-cap { background: #fff; border: 1.5px solid rgba(34,36,42,0.08); border-radius: 20px; padding: 24px 22px; animation: jf-pop 480ms cubic-bezier(0.2, 0.8, 0.3, 1.1) both; }
  .jf-cap-level { font-family: var(--font-display); font-weight: 550; font-size: 44px; letter-spacing: -0.03em; color: var(--launch-teal-3, #126b60); line-height: 1; }
  .jf-cap-name { font-family: var(--font-display); font-weight: 500; font-size: 15px; margin: 10px 0 8px; }
  .jf-cap-line { font-size: 12.5px; color: #5d5f66; line-height: 1.55; }

  .jf-path { background: #fff; border: 1.5px solid rgba(34,36,42,0.08); border-radius: 22px; padding: 30px; margin-bottom: 52px; }
  .jf-path-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
  @media (max-width: 620px) { .jf-path-grid { grid-template-columns: 1fr; } }
  .jf-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .jf-chip { padding: 7px 14px; border-radius: 999px; background: rgba(27, 158, 143, 0.1); color: var(--launch-teal-3, #126b60); font-size: 13px; font-weight: 600; }
  .jf-chip-dir { background: rgba(34,36,42,0.06); color: #22242a; }
  .jf-nudge { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 14px; text-align: left; padding: 18px 22px; border-radius: 16px; border: none; background: #22242a; color: #fff; cursor: pointer; transition: transform 160ms ease, opacity 160ms ease; }
  .jf-nudge:hover { transform: translateY(-1px); opacity: 0.92; }
  .jf-nudge-title { display: block; font-family: var(--font-display); font-weight: 500; font-size: 17px; }
  .jf-nudge-sub { display: block; font-size: 12.5px; color: rgba(255,255,255,0.6); margin-top: 3px; }

  /* Credential */
  .jf-cred-wrap { position: relative; margin-bottom: 44px; }
  .jf-cred { background: linear-gradient(135deg, #171921, #232734 60%, #1c2c2a); border-radius: 22px; padding: 30px 32px; color: #fff; transition: filter 400ms ease; }
  .jf-cred.is-locked { filter: blur(7px) saturate(0.8); pointer-events: none; user-select: none; }
  .jf-cred-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 22px; }
  .jf-cred-brand { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.28em; font-weight: 700; color: var(--launch-teal, #1B9E8F); }
  .jf-cred-id { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; color: rgba(255,255,255,0.4); }
  .jf-cred-name { font-family: var(--font-display); font-weight: 500; font-size: clamp(26px, 4vw, 38px); letter-spacing: -0.02em; margin-bottom: 18px; }
  .jf-cred-caps { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }
  .jf-cred-cap { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; padding: 6px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.85); }
  .jf-cred-foot { font-size: 11px; color: rgba(255,255,255,0.45); }
  .jf-cred-gate { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #fff; }
  .jf-gate-btn { padding: 11px 22px; border-radius: 999px; border: 1.5px solid rgba(255,255,255,0.5); background: rgba(23,25,33,0.5); color: #fff; font-family: var(--font-body); font-weight: 600; font-size: 14px; cursor: pointer; backdrop-filter: blur(2px); }
  .jf-gate-btn:hover { border-color: #fff; }
  .jf-gate-confirm { display: flex; flex-direction: column; align-items: center; gap: 10px; font-size: 13px; text-shadow: 0 1px 8px rgba(0,0,0,0.5); }

  .jf-foot { display: flex; gap: 10px; }
  .jf-ghost { padding: 11px 20px; border-radius: 999px; border: 1.5px solid rgba(34,36,42,0.16); background: transparent; color: #5d5f66; font-family: var(--font-body); font-weight: 600; font-size: 13.5px; cursor: pointer; transition: border-color 160ms ease, color 160ms ease; }
  .jf-ghost:hover { border-color: #22242a; color: #22242a; }
`
