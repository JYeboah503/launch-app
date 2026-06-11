'use client'

interface AISummaryProps {
  studentName?: string
  improvements?: string[]
}

export function AISummary({
  studentName = 'William',
  improvements = ['Leadership', 'Problem Solving'],
}: AISummaryProps) {
  const skillsText = improvements.slice(0, 2).join(' and ')

  return (
    <div
      className="editorial-card relative overflow-hidden p-8 h-full"
      style={{
        background:
          'linear-gradient(180deg, rgba(27, 158, 143,0.18) 0%, rgba(27, 158, 143,0.05) 60%, rgba(27, 158, 143,0.02) 100%)',
      }}
    >
      <div
        className="absolute -top-32 -right-32 w-72 h-72 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(146,184,255,0.28), transparent 70%)' }}
        aria-hidden
      />
      <div
        className="absolute -bottom-28 -left-24 w-64 h-64 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.18), transparent 70%)' }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col justify-between h-full gap-6">
        <div>
          <div className="editorial-eyebrow mb-3">Launch summary · this week</div>
          <h2
            className="mb-4"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: 'clamp(22px, 2.6vw, 32px)',
              letterSpacing: '-0.018em',
              lineHeight: 1.1,
              color: 'var(--lq-cream)',
            }}
          >
            You&rsquo;re in the top 10% this week for{' '}
            <span style={{ color: 'var(--launch-lime)' }}>{skillsText}</span>.
          </h2>
        </div>

        <p
          className="text-base sm:text-lg"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            color: 'rgba(246, 242, 234, 0.7)',
            lineHeight: 1.55,
          }}
        >
          {studentName}, your progress this month shows incredible growth.
          You&rsquo;ve demonstrated exceptional improvement in problem-solving
          and consistently engaged with complex scenarios. Keep leveraging your
          strengths while continuing to build on emerging capabilities.
        </p>
      </div>
    </div>
  )
}
