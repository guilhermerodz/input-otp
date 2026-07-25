'use client'

import { useEffect, useRef } from 'react'

/** Degrees at the very corner of a card. Deliberately small — the border beams
 *  and the particle wordmark are already carrying this section. */
const MAX_TILT = 4.5

/** The grid items worth tilting: the beam wrappers around the sponsor cards and
 *  the dashed "become a sponsor" slots. BorderBeam also drops <style> tags in
 *  here as siblings, so this can't just be a child selector. */
const TILE_SELECTOR = '.xp-sponsor-beam-wrap, .xp-sponsor-cta'

export function SponsorTiltGrid({
  className,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<'div'>) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    // Touch has no hover to track, and a transform would only fight the tap.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    grid.dataset.tilt = 'on'

    // Delegated rather than bound per tile: the beam wrappers are swapped out
    // when BorderBeam mounts, which would strip listeners bound at mount.
    let active: HTMLElement | null = null

    const rest = () => {
      if (!active) return
      active.style.setProperty('--tilt-x', '0deg')
      active.style.setProperty('--tilt-y', '0deg')
      delete active.dataset.tilting
      active = null
    }

    const onMove = (e: PointerEvent) => {
      const target = e.target as Element | null
      const tile = target?.closest<HTMLElement>(TILE_SELECTOR) ?? null
      if (tile !== active) rest()
      if (!tile) return

      const rect = tile.getBoundingClientRect()
      // -0.5 .. 0.5 from the card's center, so a corner hits MAX_TILT.
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      tile.style.setProperty('--tilt-x', `${(-py * 2 * MAX_TILT).toFixed(3)}deg`)
      tile.style.setProperty('--tilt-y', `${(px * 2 * MAX_TILT).toFixed(3)}deg`)
      tile.dataset.tilting = 'on'
      active = tile
    }

    grid.addEventListener('pointermove', onMove)
    grid.addEventListener('pointerleave', rest)
    grid.addEventListener('pointercancel', rest)

    return () => {
      grid.removeEventListener('pointermove', onMove)
      grid.removeEventListener('pointerleave', rest)
      grid.removeEventListener('pointercancel', rest)
      rest()
      delete grid.dataset.tilt
    }
  }, [])

  return (
    <div ref={gridRef} className={className} {...rest}>
      {children}
    </div>
  )
}
