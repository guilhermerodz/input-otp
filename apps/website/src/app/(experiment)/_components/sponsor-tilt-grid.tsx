'use client'

import { useEffect, useRef } from 'react'

/** Degrees at the very corner of a card. Deliberately small — the border beams
 *  and the particle wordmark are already carrying this section. */
const MAX_TILT = 4.5

/** Slack around a tile's resting box, in px.
 *
 *  The hover region is the tile's *resting* box, not the shape it is currently
 *  tilted into — the card leans away from the cursor, so the edge you are
 *  pointing at is the one that recedes: 2.9px on a silver card, 10.9px on the
 *  685px-wide diamond. Hit-test the tilted geometry (which is what :hover and
 *  event targets do) and a cursor in that strip lands on the grid instead, the
 *  card snaps flat, the cursor is inside it again, and it tilts — a card left
 *  flickering under a cursor that never moved.
 *
 *  This margin is on top of that: pure slack for a cursor drifting just off a
 *  card. Well inside the 20px grid gap, so no two tiles claim the same point. */
const SAFE_AREA = 8

/** The grid items worth tilting: the beam wrappers around the sponsor cards and
 *  the dashed "become a sponsor" slots. BorderBeam also drops <style> tags in
 *  here as siblings, so this can't just be a child selector. */
const TILE_SELECTOR = '.xp-sponsor-beam-wrap, .xp-sponsor-cta'

/** A tile's resting box, in the grid's own layout coordinates. */
type Tile = {
  el: HTMLElement
  left: number
  top: number
  width: number
  height: number
}

const clampHalf = (n: number) => Math.min(0.5, Math.max(-0.5, n))

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
    let tiles: Tile[] = []
    let stale = true

    /* Measured from offsetLeft/offsetWidth, never getBoundingClientRect: a
       tile's rect carries its own tilt — and its reveal animation, which the
       engine may still be running — so measuring with it would feed the
       transform back into the numbers that produce it. Offsets are pure
       layout, blind to both. */
    const measure = () => {
      tiles = Array.from(grid.querySelectorAll<HTMLElement>(TILE_SELECTOR)).map(
        el => {
          // Tiles are direct children and the grid isn't positioned, so the grid
          // is either their offsetParent or shares it with them.
          const nested = el.offsetParent === grid
          return {
            el,
            left: el.offsetLeft - (nested ? 0 : grid.offsetLeft),
            top: el.offsetTop - (nested ? 0 : grid.offsetTop),
            width: el.offsetWidth,
            height: el.offsetHeight,
          }
        },
      )
      stale = false
    }

    /** The tile whose safe area the point falls in — nearest one, if the point
     *  is somehow claimed twice. */
    const pick = (x: number, y: number) => {
      let best: Tile | null = null
      let bestDist = Infinity
      for (const tile of tiles) {
        const dx = Math.max(tile.left - x, 0, x - (tile.left + tile.width))
        const dy = Math.max(tile.top - y, 0, y - (tile.top + tile.height))
        if (dx > SAFE_AREA || dy > SAFE_AREA) continue
        const dist = dx * dx + dy * dy
        if (dist < bestDist) {
          bestDist = dist
          best = tile
        }
      }
      return best
    }

    const restTile = () => {
      if (!active) return
      active.style.setProperty('--tilt-x', '0deg')
      active.style.setProperty('--tilt-y', '0deg')
      delete active.dataset.tilting
      active = null
    }

    const onMove = (e: PointerEvent) => {
      if (stale) measure()

      const gridRect = grid.getBoundingClientRect()
      // An ancestor can be scaled mid-reveal while the offsets above are not,
      // so bring the pointer into unscaled layout space before comparing.
      const scale = gridRect.width / grid.offsetWidth || 1
      const x = (e.clientX - gridRect.left) / scale
      const y = (e.clientY - gridRect.top) / scale

      const tile = pick(x, y)
      if (tile?.el !== active) restTile()
      if (!tile) return

      // Clamped, or the slack outside the box would tilt past MAX_TILT.
      const px = clampHalf((x - tile.left) / tile.width - 0.5)
      const py = clampHalf((y - tile.top) / tile.height - 0.5)
      tile.el.style.setProperty(
        '--tilt-x',
        `${(-py * 2 * MAX_TILT).toFixed(3)}deg`,
      )
      tile.el.style.setProperty(
        '--tilt-y',
        `${(px * 2 * MAX_TILT).toFixed(3)}deg`,
      )
      tile.el.dataset.tilting = 'on'
      active = tile.el
    }

    const invalidate = () => {
      stale = true
    }

    grid.addEventListener('pointermove', onMove)
    grid.addEventListener('pointerleave', restTile)
    grid.addEventListener('pointercancel', restTile)

    const resizeObserver = new ResizeObserver(invalidate)
    resizeObserver.observe(grid)
    // BorderBeam replaces the wrapper element on mount, retiring the node we
    // measured along with it.
    const mutationObserver = new MutationObserver(invalidate)
    mutationObserver.observe(grid, { childList: true })

    return () => {
      grid.removeEventListener('pointermove', onMove)
      grid.removeEventListener('pointerleave', restTile)
      grid.removeEventListener('pointercancel', restTile)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      restTile()
      delete grid.dataset.tilt
    }
  }, [])

  return (
    <div ref={gridRef} className={className} {...rest}>
      {children}
    </div>
  )
}
