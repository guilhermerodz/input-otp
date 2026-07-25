'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { BorderBeam } from 'border-beam'

export function SponsorBorderBeam({
  tier,
  duration,
  children,
}: {
  tier: 'diamond' | 'silver'
  duration: number
  children: React.ReactNode
}) {
  const isDiamond = tier === 'diamond'
  // The wrapper is the grid item, so the tier has to reach it — the diamond
  // spans two of the three columns.
  const wrapClassName = `xp-sponsor-beam-wrap xp-sponsor-beam-wrap--${tier}`
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className={wrapClassName}>{children}</div>
  }

  return (
    <BorderBeam
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
