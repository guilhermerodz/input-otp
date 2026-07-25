'use client'

/* The pointer as a light source, for any bordered box on the page.

   The hero row started this — see .xp-otp-spot in experiment.css, where each
   slot rim catches the cursor — and the same rule now runs the CTA, the
   install line, the tweet cards and the bento. One controller drives all of
   them: a single pointermove listener, one rect read per element per frame,
   and the rim itself is a span the controller appends, so a host only has to
   register and say how far its light reaches.

   Nothing is registered on touch or under reduced motion: there is no pointer
   to follow in the first case, and in the second the whole conceit is motion.  */

import * as React from 'react'

export type SpotlightOptions = {
  /** How far the pointer can be from the box before its rim goes dark. */
  reach?: number
  /** Radius of the light pool the pointer drags along the rim. */
  spread?: number
  /** How much of the light this rim returns, 0–1. */
  gain?: number
}

const DEFAULTS: Required<SpotlightOptions> = {
  reach: 320,
  spread: 240,
  gain: 1,
}

type Entry = Required<SpotlightOptions> & {
  ring: HTMLSpanElement
  /* Last values written, so a frame that changes nothing touches no styles. */
  spot: number
  mx: number
  my: number
}

const REGISTRY = new Map<HTMLElement, Entry>()

let pointerX = -99999
let pointerY = -99999
let frame = 0
let bound = false

/* Off-screen boxes still have to be walked (the marquee scrolls them back in),
   but nothing that far out can be lit, so they never reach the write phase. */
const MARGIN = 240

const supported = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

const paint = () => {
  frame = 0
  const els = Array.from(REGISTRY.keys())
  // Read every rect first, then write — one reflow per frame, not one each.
  const rects = els.map(el => el.getBoundingClientRect())
  let lit = false

  els.forEach((el, i) => {
    const rect = rects[i]
    const entry = REGISTRY.get(el)
    if (!entry) return

    const offscreen =
      rect.width === 0 ||
      rect.bottom < -MARGIN ||
      rect.top > window.innerHeight + MARGIN

    // Distance from the pointer to the box, 0 while it is inside.
    const dx = Math.max(rect.left - pointerX, 0, pointerX - rect.right)
    const dy = Math.max(rect.top - pointerY, 0, pointerY - rect.bottom)
    const near = offscreen
      ? 0
      : Math.max(0, 1 - Math.hypot(dx, dy) / entry.reach)
    // Squared: the falloff should be steep near the edge of the reach, so a
    // pointer crossing the page does not leave a wake of half-lit boxes.
    const spot = Math.round(near * near * entry.gain * 1000) / 1000

    if (spot !== entry.spot) {
      entry.spot = spot
      el.style.setProperty('--xp-spot', String(spot))
    }
    if (spot === 0) return

    lit = true
    const mx = Math.round(pointerX - rect.left)
    const my = Math.round(pointerY - rect.top)
    if (mx !== entry.mx) {
      entry.mx = mx
      el.style.setProperty('--xp-mx', `${mx}px`)
    }
    if (my !== entry.my) {
      entry.my = my
      el.style.setProperty('--xp-my', `${my}px`)
    }
  })

  /* Something is lit, so keep painting: the boxes move under a stationary
     cursor too — the tweet belt travels, the bento cards animate — and a rim
     drawn from a stale rect drifts off the pointer. The loop stops itself on
     the first frame with nothing lit. */
  if (lit) schedule()
}

const schedule = () => {
  if (!frame) frame = requestAnimationFrame(paint)
}

const onMove = (event: PointerEvent) => {
  pointerX = event.clientX
  pointerY = event.clientY
  schedule()
}

const onLeave = () => {
  pointerX = -99999
  pointerY = -99999
  schedule()
}

const bind = () => {
  if (bound) return
  bound = true
  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerleave', onLeave)
  // Scrolling and resizing move the boxes under a stationary cursor.
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
}

const unbind = () => {
  if (!bound) return
  bound = false
  window.removeEventListener('pointermove', onMove)
  document.removeEventListener('pointerleave', onLeave)
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
  if (frame) cancelAnimationFrame(frame)
  frame = 0
}

/**
 * Lights the rim of one box. Returns the undo.
 *
 * The rim is appended here rather than rendered by the host: it is decoration
 * with no place in anyone's markup, and every host would otherwise have to
 * carry the same aria-hidden span.
 */
export function registerSpotlight(
  el: HTMLElement,
  options: SpotlightOptions = {},
): () => void {
  if (!supported()) return () => {}

  const ring = document.createElement('span')
  ring.className = 'xp-spot-ring'
  ring.setAttribute('aria-hidden', 'true')
  el.appendChild(ring)

  const entry: Entry = {
    ...DEFAULTS,
    ...options,
    ring,
    spot: -1,
    mx: NaN,
    my: NaN,
  }
  el.style.setProperty('--xp-spot-spread', `${entry.spread}px`)
  REGISTRY.set(el, entry)
  bind()
  schedule()

  return () => {
    ring.remove()
    el.style.removeProperty('--xp-spot')
    el.style.removeProperty('--xp-spot-spread')
    REGISTRY.delete(el)
    if (REGISTRY.size === 0) unbind()
  }
}

/** Same thing for a whole set at once — a card grid, a marquee belt. */
export function registerSpotlights(
  els: Iterable<HTMLElement>,
  options: SpotlightOptions = {},
): () => void {
  const undos = Array.from(els, el => registerSpotlight(el, options))
  return () => undos.forEach(undo => undo())
}

/** Ref callback form, for a host that renders exactly one lit box. */
export function useSpotlight<T extends HTMLElement>(
  options: SpotlightOptions = {},
) {
  const optionsRef = React.useRef(options)
  optionsRef.current = options
  const undo = React.useRef<(() => void) | null>(null)

  return React.useCallback((el: T | null) => {
    undo.current?.()
    undo.current = el ? registerSpotlight(el, optionsRef.current) : null
  }, [])
}
