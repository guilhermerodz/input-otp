'use client'

import { Motes } from '@lucasmarkes/motes-react'
import * as React from 'react'

/**
 * Same field as the motes.lucasmarkes.com homepage hero: flow effect,
 * density 12, trail 0.35, cool near-white pointer accent. Legibility
 * comes from an elliptical mask on the canvas itself (see .xp-hero-field)
 * — nearly clear over the OTP input, fully visible toward the corners.
 *
 * The canvas starts transparent and fades in over 800ms, so the field
 * arrives instead of popping. The fade is armed on the frame after the
 * first one motes paints, so none of the 800ms is spent on a blank canvas.
 */
export function HeroField() {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    let second = 0
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setReady(true))
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [])

  return (
    <Motes
      className="xp-hero-field"
      data-ready={ready || undefined}
      effect="flow"
      density={12}
      trail={0.35}
      accent="#ddeafe"
      aria-hidden="true"
    />
  )
}
