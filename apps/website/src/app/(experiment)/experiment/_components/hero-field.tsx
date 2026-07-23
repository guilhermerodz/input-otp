'use client'

import { Motes } from '@lucasmarkes/motes-react'

/**
 * Same field as the motes.lucasmarkes.com homepage hero: flow effect,
 * density 12, trail 0.35, cool near-white pointer accent, over a scrim
 * that keeps the copy legible (theirs is warm near-black; ours matches
 * this page's #09090b background).
 */
export function HeroField() {
  return (
    <>
      <Motes
        className="xp-hero-field"
        effect="flow"
        density={12}
        trail={0.35}
        accent="#ddeafe"
        aria-hidden="true"
      />
      <div className="xp-hero-scrim" aria-hidden="true" />
    </>
  )
}
