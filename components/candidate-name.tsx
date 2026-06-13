'use client'

/**
 * CandidateName — single rendering point for any candidate / student /
 * applicant display name on the corporate dashboard.
 *
 * The current strategy is a visual CSS blur: the row stays clickable, the
 * shape of the text + its length are preserved (so the layout doesn't
 * shift), but the identifier is unreadable. Underlying data is untouched
 * so search/filter still operate on the real string.
 *
 * Centralising this means the masking strategy can be swapped later
 * (e.g. pseudonyms like "Candidate #1247", initials, or fully redacted)
 * by editing one file instead of every render site.
 *
 * Accessibility: blurring the visual without hiding the string from the
 * accessibility tree would leak what we're trying to mask — so the inner
 * span carries `aria-hidden` and the wrapper exposes a generic label.
 */

import { ReactNode } from 'react'

interface Props {
  name: string
  /** Optional trailing content rendered INSIDE the blur (e.g. a period). */
  suffix?: ReactNode
  className?: string
}

export function CandidateName({ name, suffix, className }: Props) {
  return (
    <span
      className={['candidate-name', className].filter(Boolean).join(' ')}
      aria-label="Candidate name redacted"
    >
      <span aria-hidden="true">{name}{suffix}</span>
    </span>
  )
}
