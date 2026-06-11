'use client'

import { useEffect } from 'react'

interface LaunchTransitionProps {
  isActive: boolean
  onComplete: () => void
}

export function LaunchTransition({ isActive, onComplete }: LaunchTransitionProps) {
  useEffect(() => {
    if (!isActive) return
    const timer = setTimeout(onComplete, 4000)
    return () => clearTimeout(timer)
  }, [isActive, onComplete])

  if (!isActive) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center"
      style={{
        background:
          'radial-gradient(60% 50% at 50% 50%, rgba(10,42,107,0.5) 0%, rgba(10,15,34,0.92) 60%, #0a0f22 100%)',
        animation: 'launchTransitionIn 0.4s cubic-bezier(0.2,0.7,0.2,1) forwards',
      }}
    >
      {/* Layered glow orbs */}
      <div
        aria-hidden
        className="absolute"
        style={{
          width: 480,
          height: 480,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 30% 30%, rgba(27, 158, 143,0.45), transparent 70%)',
          filter: 'blur(8px)',
          animation: 'launchOrbDrift 4s ease-out forwards',
        }}
      />
      <div
        aria-hidden
        className="absolute"
        style={{
          width: 720,
          height: 720,
          borderRadius: '50%',
          border: '1px solid rgba(146,184,255,0.25)',
          animation: 'launchRingSpin 8s linear infinite',
        }}
      />

      {/* Centred wordmark */}
      <div className="relative text-center">
        <div
          className="mb-6"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            opacity: 0,
            animation: 'launchEyebrowIn 1s ease-out 0.2s forwards',
          }}
        >
          <span className="brand-mark" aria-hidden />
          <span
            className="text-[12px] tracking-[0.3em] uppercase"
            style={{ fontFamily: 'var(--font-mono)', color: 'rgba(246,242,234,0.7)' }}
          >
            Launch · live scenario
          </span>
        </div>
        <h1
          className="select-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 'clamp(80px, 14vw, 220px)',
            letterSpacing: '-0.04em',
            lineHeight: 0.92,
            color: 'var(--lq-cream)',
            opacity: 0,
            filter: 'blur(30px)',
            animation: 'launchTitleIn 3.6s cubic-bezier(0.25,0.46,0.45,0.94) 0.2s forwards',
          }}
        >
          Launch.
        </h1>
        <p
          className="mt-6 max-w-[40ch] mx-auto"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 18,
            color: 'rgba(246,242,234,0.7)',
            opacity: 0,
            animation: 'launchEyebrowIn 1.2s ease-out 1.6s forwards',
          }}
        >
          Stepping into the room…
        </p>
      </div>

      <style>{`
        @keyframes launchTransitionIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes launchTitleIn {
          0%   { opacity: 0; transform: scale(0.7); filter: blur(30px); }
          30%  { opacity: 1; }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes launchEyebrowIn {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes launchOrbDrift {
          0%   { transform: translate3d(0, 0, 0) scale(0.8); }
          100% { transform: translate3d(40px, -30px, 0) scale(1.1); }
        }
        @keyframes launchRingSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
