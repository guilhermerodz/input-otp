'use client'

import { Motes } from '@lucasmarkes/motes-react'

/**
 * Same field as the motes.lucasmarkes.com homepage hero: flow effect,
 * density 12, trail 0.35, cool near-white pointer accent. Legibility
 * comes from an elliptical mask on the canvas itself (see .xp-hero-field)
 * — nearly clear over the OTP input, fully visible toward the corners.
 */
export function HeroField() {
  return (
    <Motes
      className="xp-hero-field"
      effect="flow"
      density={12}
      trail={0.35}
      accent="#ddeafe"
      aria-hidden="true"
    />
  )
}
