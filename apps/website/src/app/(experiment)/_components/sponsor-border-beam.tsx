'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { BorderBeam } from 'border-beam'

export function SponsorBorderBeam({
  tier,
  duration,
  revealRole,
  children,
}: {
  tier: 'diamond' | 'silver'
  duration: number
  /** Reveal role for the grid item. The beam runs on the wrapper, so the
   *  wrapper — not the card inside it — is what has to stay hidden until
   *  its turn, or a bare glowing outline shows up first. */
  revealRole?: string
  children: React.ReactNode
}) {
  const isDiamond = tier === 'diamond'
  // The wrapper is the grid item, so the tier has to reach it — the diamond
  // spans two of the three columns.
  const wrapClassName = `xp-sponsor-beam-wrap xp-sponsor-beam-wrap--${tier}`
  const reveal: Record<string, string> = revealRole ? { 'data-rv': revealRole } : {}
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className={wrapClassName} {...reveal}>
        {children}
      </div>
    )
  }

  return (
    <BorderBeam
      {...reveal}
      size="pulse-inner"
      colorVariant={isDiamond ? 'colorful' : 'mono'}
      strength={isDiamond ? 1 : 0.6}
      duration={duration}
      theme="dark"
      borderRadius={14}
      className={wrapClassName}
      style={
        isDiamond
          ? ({ '--pulse-glow-boost': 1.9 } as CSSProperties)
          : undefined
      }
    >
      {children}
    </BorderBeam>
  )
}
