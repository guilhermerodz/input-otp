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
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="xp-sponsor-beam-wrap">{children}</div>
  }

  return (
    <BorderBeam
      size="pulse-inner"
      colorVariant={isDiamond ? 'colorful' : 'mono'}
      strength={isDiamond ? 1 : 0.6}
      duration={duration}
      theme="dark"
      borderRadius={14}
      className="xp-sponsor-beam-wrap"
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
