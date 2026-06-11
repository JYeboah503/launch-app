'use client'

/* Ported verbatim from LQV2.html (components-v2.jsx, lines 3653-3987). */
/* eslint-disable @next/next/no-img-element */

import {
  ReactNode,
  Ref,
  useEffect,
  useMemo,
  useState,
} from 'react'

interface RevealTextProps {
  text: string
  delay?: number
  stagger?: number
  className?: string
  as?: keyof JSX.IntrinsicElements
  innerRef?: Ref<any>
  highlight?: string
  children?: ReactNode
}

export function RevealText({
  text,
  delay = 0,
  stagger = 40,
  className = '',
  as = 'p',
  innerRef,
  highlight,
}: RevealTextProps) {
  if (text == null) return null
  const src = String(text)
  let hlStart = -1
  let hlEnd = -1
  if (highlight && typeof highlight === 'string') {
    hlStart = src.indexOf(highlight)
    if (hlStart >= 0) hlEnd = hlStart + highlight.length
  }
  const parts = src.split(/(\s+)/)
  let wi = 0
  let cursor = 0
  const Tag: any = as
  const children: ReactNode[] = parts.map((p, i) => {
    if (/^\s+$/.test(p)) {
      cursor += p.length
      return p
    }
    const idx = wi++
    const wStart = cursor
    const wEnd = cursor + p.length
    cursor = wEnd
    const isHL = hlStart >= 0 && wStart >= hlStart && wEnd <= hlEnd
    return (
      <span
        key={i}
        className={`rv-w${isHL ? ' rv-w-highlight' : ''}`}
        style={{ animationDelay: `${delay + idx * stagger}ms` }}
      >
        {p}
      </span>
    )
  })
  return (
    <Tag className={className} aria-label={text} ref={innerRef as any}>
      {children}
    </Tag>
  )
}

interface ProgressProps {
  current: number
  total: number
}

export function Progress({ current, total }: ProgressProps) {
  return (
    <div className="progress" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={
            'seg ' +
            (i < current ? 'done ' : '') +
            (i === current ? 'active' : '')
          }
        />
      ))}
    </div>
  )
}

/* Module-level shared timers — keyed by id so the same clock keeps
   ticking across screen mounts/unmounts without resetting. */
interface SharedTimer {
  t: number
  listeners: Set<(n: number) => void>
  interval: ReturnType<typeof setInterval> | null
}
const __sharedTimers: Record<string, SharedTimer> = (typeof window !== 'undefined'
  ? ((window as any).__sharedTimers = (window as any).__sharedTimers || {})
  : {}) as Record<string, SharedTimer>

function getSharedTimer(id: string, initial: number): SharedTimer {
  let timer = __sharedTimers[id]
  if (!timer) {
    timer = __sharedTimers[id] = {
      t: initial,
      listeners: new Set(),
      interval: null,
    }
    timer.interval = setInterval(() => {
      if (timer.t > 0) {
        timer.t -= 1
        timer.listeners.forEach((fn) => fn(timer.t))
      }
    }, 1000)
  }
  return timer
}

interface CountdownProps {
  seconds: number
  id?: string
}

export function Countdown({ seconds, id = 'default' }: CountdownProps) {
  const timer = useMemo(() => getSharedTimer(id, seconds), [id, seconds])
  const [t, setT] = useState(timer.t)
  useEffect(() => {
    timer.listeners.add(setT)
    setT(timer.t)
    return () => {
      timer.listeners.delete(setT)
    }
  }, [timer])
  const hh = String(Math.floor(t / 3600)).padStart(2, '0')
  const mm = String(Math.floor((t % 3600) / 60)).padStart(2, '0')
  const ss = String(t % 60).padStart(2, '0')
  return (
    <span className="clock">
      {hh}:{mm}:{ss}
    </span>
  )
}

interface OptIconProps {
  name?: string
}

export function OptIcon({ name }: OptIconProps) {
  const common = {
    width: 28,
    height: 28,
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.25,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'whisper':
      return (
        <svg {...common}>
          <path d="M8 20c2-1 3-3 3-6 0-3 2-5 5-5s5 2 5 5" />
          <path d="M20 14c2 0 4 1 4 4" />
          <circle cx="11" cy="22" r="1.2" />
        </svg>
      )
    case 'address':
      return (
        <svg {...common}>
          <path d="M6 10h20v10H16l-6 5v-5H6z" />
          <path d="M11 14h10M11 17h6" />
        </svg>
      )
    case 'silent':
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="10" />
          <path d="M10 16h12" />
        </svg>
      )
    case 'spark':
      return (
        <svg {...common}>
          <path d="M16 4v8M16 20v8M4 16h8M20 16h8M8 8l5 5M19 19l5 5M24 8l-5 5M13 19l-5 5" />
        </svg>
      )
    case 'anchor':
      return (
        <svg {...common}>
          <circle cx="16" cy="8" r="3" />
          <path d="M16 11v17M9 24c3 3 11 3 14 0M8 20H5M24 20h3" />
        </svg>
      )
    case 'split':
      return (
        <svg {...common}>
          <path d="M16 6v6M10 26l6-10 6 10" />
          <circle cx="16" cy="6" r="1.5" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path d="M16 4l10 4v8c0 7-10 12-10 12S6 23 6 16V8z" />
        </svg>
      )
    case 'frame':
      return (
        <svg {...common}>
          <rect x="5" y="9" width="22" height="14" />
          <path d="M10 14h12M10 18h8" />
        </svg>
      )
    case 'walk':
      return (
        <svg {...common}>
          <circle cx="14" cy="6" r="2.5" />
          <path d="M14 10l-3 7 5 3 3 6M11 17l-5 2M20 14l5 2" />
        </svg>
      )
    case 'star':
      return (
        <svg {...common}>
          <path d="M16 5l3 8 9 1-7 6 2 9-7-5-7 5 2-9-7-6 9-1z" />
        </svg>
      )
    case 'wave':
      return (
        <svg {...common}>
          <path d="M4 20c3-6 6-6 9 0s6 6 9 0 6-6 6 0" />
          <path d="M4 12c3-4 6-4 9 0" opacity=".4" />
        </svg>
      )
    case 'hidden':
      return (
        <svg {...common}>
          <path d="M4 16s5-8 12-8 12 8 12 8-5 8-12 8S4 16 4 16z" />
          <circle cx="16" cy="16" r="3" />
          <path d="M6 6l20 20" opacity=".5" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="8" />
        </svg>
      )
  }
}

interface SkillPulseProps {
  skill: string | null
}

export function SkillPulse({ skill }: SkillPulseProps) {
  if (!skill) return null
  return (
    <div className="skill-pulse" key={skill}>
      <span className="dot" />
      <span>Logged · {skill}</span>
    </div>
  )
}

interface ShapeStageProps {
  variant?: string
  size?: string
}

export function ShapeStage({ variant = 'tunnel', size = 'large' }: ShapeStageProps) {
  return (
    <div className={`shape-stage shape-${variant} shape-${size}`}>
      <div className="arc" />
      <div className="ring" />
      <div className="orb orb-a" />
      <div className="orb orb-b" />
    </div>
  )
}

interface CompanyMarkProps {
  name: string
}

export function CompanyMark({ name }: CompanyMarkProps) {
  switch (name) {
    case 'canva':
      return <div className="cm cm-canva">Canva</div>
    case 'google':
      return (
        <div className="cm cm-google">
          <span style={{ color: '#4285F4' }}>G</span>
          <span style={{ color: '#EA4335' }}>o</span>
          <span style={{ color: '#FBBC05' }}>o</span>
          <span style={{ color: '#4285F4' }}>g</span>
          <span style={{ color: '#34A853' }}>l</span>
          <span style={{ color: '#EA4335' }}>e</span>
        </div>
      )
    case 'netflix':
      return <div className="cm cm-netflix">NETFLIX</div>
    case 'disney':
      return <div className="cm cm-disney">Disney</div>
    default:
      return <div className="cm">{name}</div>
  }
}

interface SceneSilhouetteProps {
  scene: string
}

export function SceneSilhouette({ scene }: SceneSilhouetteProps) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (scene) {
    case 'locker':
      return (
        <>
          <svg
            className="silo silo-far parallax-layer"
            data-depth="0.15"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            {...common}
            aria-hidden
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x={60 + i * 110} y="200" width="90" height="520" rx="3" />
            ))}
            <line x1="0" y1="720" x2="1440" y2="720" />
          </svg>
          <svg
            className="silo silo-mid parallax-layer"
            data-depth="0.35"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            {...common}
            aria-hidden
          >
            <rect x="200" y="760" width="1040" height="34" rx="6" />
            <line x1="240" y1="794" x2="240" y2="860" />
            <line x1="1200" y1="794" x2="1200" y2="860" />
            <rect x="480" y="60" width="480" height="8" rx="3" />
          </svg>
          <svg
            className="silo silo-near parallax-layer"
            data-depth="0.7"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            {...common}
            aria-hidden
          >
            <path d="M 1180 180 L 1230 160 L 1280 180 L 1290 360 L 1170 360 Z" />
            <line x1="1230" y1="130" x2="1230" y2="160" />
            <circle cx="1230" cy="126" r="4" />
          </svg>
        </>
      )
    case 'whiteboard':
      return (
        <>
          <svg
            className="silo silo-far parallax-layer"
            data-depth="0.15"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            {...common}
            aria-hidden
          >
            <rect x="180" y="150" width="1080" height="560" rx="6" />
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={i} x1="220" y1={230 + i * 100} x2="1220" y2={230 + i * 100} opacity="0.35" />
            ))}
          </svg>
          <svg
            className="silo silo-mid parallax-layer"
            data-depth="0.4"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            {...common}
            aria-hidden
          >
            <path d="M 320 290 Q 420 250 520 300 T 720 290" />
            <path d="M 320 400 L 520 400 L 520 480 L 720 480" />
            <circle cx="900" cy="360" r="30" />
            <circle cx="980" cy="430" r="18" />
            <line x1="900" y1="360" x2="980" y2="430" />
          </svg>
        </>
      )
    case 'press':
      return (
        <>
          <svg
            className="silo silo-far parallax-layer"
            data-depth="0.12"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            {...common}
            aria-hidden
          >
            {Array.from({ length: 80 }).map((_, i) => (
              <circle
                key={i}
                cx={(i % 20) * 72 + 40}
                cy={Math.floor(i / 20) * 60 + 540}
                r="6"
                opacity="0.5"
              />
            ))}
          </svg>
          <svg
            className="silo silo-mid parallax-layer"
            data-depth="0.45"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            {...common}
            aria-hidden
          >
            <g transform="translate(360 340)">
              <rect x="-18" y="-36" width="36" height="60" rx="18" />
              <line x1="0" y1="24" x2="0" y2="320" />
              <path d="M -40 24 Q 0 60 40 24" />
            </g>
            <g transform="translate(1020 380)">
              <rect x="-22" y="-40" width="44" height="70" rx="20" />
              <line x1="0" y1="30" x2="0" y2="320" />
              <path d="M -46 30 Q 0 70 46 30" />
            </g>
          </svg>
          <svg
            className="silo silo-near parallax-layer"
            data-depth="0.8"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            {...common}
            aria-hidden
          >
            <circle cx="1340" cy="120" r="6" fill="currentColor" opacity="0.9" />
            <rect x="1270" y="80" width="130" height="80" rx="6" />
            <circle cx="1320" cy="120" r="18" />
          </svg>
        </>
      )
    case 'court':
      return (
        <>
          <svg
            className="silo silo-far parallax-layer"
            data-depth="0.12"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            {...common}
            aria-hidden
          >
            <ellipse cx="720" cy="880" rx="900" ry="120" opacity="0.4" />
            {Array.from({ length: 40 }).map((_, i) => (
              <circle
                key={i}
                cx={(i * 38 + 20) % 1440}
                cy={820 + (i % 3) * 20}
                r="5"
                opacity="0.35"
              />
            ))}
          </svg>
          <svg
            className="silo silo-mid parallax-layer"
            data-depth="0.4"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            {...common}
            aria-hidden
          >
            <path d="M 420 700 Q 720 480 1020 700" />
            <rect x="580" y="640" width="280" height="110" />
            <circle cx="720" cy="640" r="70" />
          </svg>
          <svg
            className="silo silo-near parallax-layer"
            data-depth="0.75"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            {...common}
            aria-hidden
          >
            <rect x="660" y="160" width="120" height="80" rx="3" />
            <line x1="720" y1="240" x2="720" y2="300" />
            <ellipse cx="720" cy="300" rx="28" ry="8" />
            <path d="M 696 300 L 700 350 L 740 350 L 744 300" opacity="0.7" />
          </svg>
        </>
      )
    case 'tunnel':
      return (
        <>
          <svg
            className="silo silo-far parallax-layer"
            data-depth="0.08"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            {...common}
            aria-hidden
          >
            {[0.18, 0.32, 0.48, 0.68, 0.92].map((k, i) => {
              const w = 1440 * k
              const h = 900 * k
              const x = 720 - w / 2
              const y = 450 - h / 2
              return (
                <path
                  key={i}
                  d={`M ${x} ${y + h} L ${x} ${y + 60} Q 720 ${y - 30} ${x + w} ${y + 60} L ${x + w} ${y + h}`}
                  opacity={0.25 + i * 0.12}
                />
              )
            })}
          </svg>
          <svg
            className="silo silo-mid parallax-layer"
            data-depth="0.35"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            {...common}
            aria-hidden
          >
            {[0.2, 0.32, 0.48, 0.68].map((k, i) => {
              const w = 400 * (1 - k)
              const x = 720 - w / 2
              const y = 900 * 0.12 + i * 90
              return <rect key={i} x={x} y={y} width={w} height="4" rx="2" opacity={0.3 + i * 0.15} />
            })}
          </svg>
        </>
      )
    case 'reflect':
      return (
        <svg
          className="silo silo-far parallax-layer"
          data-depth="0.18"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          {...common}
          aria-hidden
        >
          {[120, 200, 300, 420, 560, 720].map((r, i) => (
            <circle key={i} cx="720" cy="450" r={r} opacity={0.35 - i * 0.045} />
          ))}
        </svg>
      )
    default:
      return null
  }
}

interface SceneBackdropProps {
  scene: string
  active?: boolean
}

export function SceneBackdrop({ scene, active }: SceneBackdropProps) {
  return (
    <div className={`scene scene-${scene} ${active ? 'live' : ''}`}>
      <div className="scene-bg parallax-layer" data-depth="0.03" />
      <div className="scene-nebula parallax-layer" data-depth="0.1" />
      <div className="scene-glow glow-a parallax-layer" data-depth="0.25" />
      <div className="scene-glow glow-b parallax-layer" data-depth="0.45" />
      <div className="scene-haze" />
      <div className="scene-vignette" />
    </div>
  )
}

/* Token interpolation — replaces {name}, {pronouns} etc. with profile fields. */
export function interp(s: string | undefined | null, vars?: Record<string, string | undefined>): string {
  if (typeof s !== 'string' || !vars) return s || ''
  return s.replace(/\s?\{(\w+)\}/g, (match: string, k: string) => {
    const v = vars[k]
    if (v == null || v === '') return ''
    return (match.startsWith(' ') ? ' ' : '') + v
  })
}
