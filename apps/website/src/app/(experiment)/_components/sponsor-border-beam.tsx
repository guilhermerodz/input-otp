'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { BorderBeam } from 'border-beam'

export function SponsorBorderBeam({
  duration,
  revealRole,
  children,
}: {
  duration: number
  /** Reveal role for the grid item. The beam runs on the wrapper, so the
   *  wrapper — not the card inside it — is what has to stay hidden until
   *  its turn, or a bare glowing outline shows up first. */
  revealRole?: string
  children: React.ReactNode
}) {
  const reveal: Record<string, string> = revealRole
    ? { 'data-rv': revealRole }
    : {}
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="xp-sponsor-beam-wrap" {...reveal}>
        {children}
      </div>
    )
  }

  return (
    <BorderBeam
      {...reveal}
      size="pulse-inner"
      colorVariant="colorful"
      strength={1}
      duration={duration}
      theme="dark"
      borderRadius={14}
      className="xp-sponsor-beam-wrap"
      style={{ '--pulse-glow-boost': 1.9 } as CSSProperties}
    >
      {children}
    </BorderBeam>
  )
}
