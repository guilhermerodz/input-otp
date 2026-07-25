'use client'

import * as React from 'react'

import { CASCADE, type Role, ROLES, type SplitMode } from './choreography'

/**
 * Drives every reveal on the page.
 *
 * It reads the annotations the markup already carries — `data-rv-group` for
 * a stagger unit, `data-rv="<role>"` for a level inside it — and hands them
 * to the choreography. The markup never mentions timing.
 *
 * Two things gate the start:
 *
 *  - the intro. Nothing may animate behind the slot machine's curtain, so
 *    every group waits for it, and the hero deliberately starts *during*
 *    the lift (see HERO_LEAD) so the page is already in motion by the time
 *    the curtain clears it. Otherwise the two read as separate events.
 *  - the viewport. Below-the-fold groups fire on an IntersectionObserver
 *    tuned to trip a little before the inner components' own observers, so
 *    a section is never mid-reveal while the demo inside it has already
 *    started playing.
 *
 * Elements start hidden from CSS (reveal.css), not from JS, so there is no
 * flash before this effect runs — and reduced-motion users never hide them
 * at all.
 */

/** How long after the curtain starts lifting the hero begins. The lift is
 *  700ms and uncovers the hero around 55% through it. */
const HERO_LEAD = 300
/** Repeat visitors skip the intro; give the first paint a beat anyway. */
const HERO_INSTANT = 90
/** If the intro never reports in, reveal regardless. */
const FAILSAFE = 6000

type Item = {
  el: HTMLElement
  role: Role
  /** nth element of this role within its group */
  seq: number
}

function roleOf(el: HTMLElement): Role {
  const raw = el.dataset.rv as Role
  return ROLES.includes(raw) ? raw : 'body'
}

/* Everything the choreography can touch, wiped back to the stylesheet. The
   `rv-done` flag is what drops the CSS start state along with it. */
const TOUCHED = ['opacity', 'transform', 'filter', 'will-change']

function clearInline(el: HTMLElement) {
  for (const prop of TOUCHED) el.style.removeProperty(prop)
  el.dataset.rvDone = '1'
}

/* An animation with `fill: both` keeps holding its last frame forever, which
   leaves every revealed element with a permanent compositor layer and a
   stacking context it never asked for. So each one hands its element back to
   the stylesheet and then cancels itself — the flag `clearInline` sets is
   what drops the hidden start state, so there is nothing to flash back to. */
function settle(anim: Animation, el: HTMLElement) {
  anim.onfinish = () => {
    clearInline(el)
    try {
      anim.cancel()
    } catch {
      /* ignore */
    }
  }
}

/* ------------------------------------------------------------------ *
 * Splitting
 *
 * Done at runtime rather than in the markup: the headings involved are
 * static strings, so React never re-renders over the spans this leaves
 * behind, and the annotated markup stays readable.
 * ------------------------------------------------------------------ */
function splitTitle(el: HTMLElement, mode: SplitMode): HTMLElement[] {
  if (mode === 'none' || el.dataset.rvSplit) return []
  el.dataset.rvSplit = mode

  const units: HTMLElement[] = []

  // Only direct text nodes get split; <br> and any inline markup is left
  // exactly where it was.
  const nodes = Array.from(el.childNodes)
  for (const node of nodes) {
    if (node.nodeType !== Node.TEXT_NODE) continue
    const text = node.textContent ?? ''
    if (!text.trim()) continue

    const frag = document.createDocumentFragment()
    // Keep the whitespace runs so wrapping and spacing survive.
    for (const chunk of text.split(/(\s+)/)) {
      if (!chunk) continue
      if (/^\s+$/.test(chunk)) {
        frag.appendChild(document.createTextNode(chunk))
        continue
      }
      const word = document.createElement('span')
      word.dataset.rvWord = ''
      word.textContent = chunk
      units.push(word)
      frag.appendChild(word)
    }
    el.replaceChild(frag, node)
  }

  if (units.length) {
    // The container itself must stay visible — only its pieces animate.
    el.dataset.rvHollow = '1'
  }
  return units
}

export function RevealRoot({ children }: { children: React.ReactNode }) {
  const hostRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const animations: Animation[] = []
    const timers: ReturnType<typeof setTimeout>[] = []
    const cleanups: (() => void)[] = []
    let disposed = false

    const groups = Array.from(
      host.querySelectorAll<HTMLElement>('[data-rv-group]'),
    )
    /** Snap everything to its resting state, right now. */
    const finalizeAll = () => {
      for (const anim of animations) {
        try {
          anim.finish()
        } catch {
          /* an animation that has not started yet throws; ignore */
        }
      }
      // Re-queried rather than captured: some grid items are client-only
      // components that swap their host element on mount (the sponsor cards
      // do this to hang a border beam on the grid item), so a node captured
      // at mount can already be detached.
      for (const el of Array.from(
        host.querySelectorAll<HTMLElement>('[data-rv]'),
      )) {
        clearInline(el)
        el.querySelectorAll<HTMLElement>('[data-rv-word]').forEach(clearInline)
      }
    }

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('animate' in Element.prototype)
    ) {
      finalizeAll()
      return
    }

    /* ---- group bookkeeping ---------------------------------------- */

    const itemsOf = (group: HTMLElement): Item[] => {
      const counts: Partial<Record<Role, number>> = {}
      return Array.from(group.querySelectorAll<HTMLElement>('[data-rv]'))
        // Groups nest — a long section can hand its grid a cascade of its
        // own — so an item belongs to its *nearest* group, not every
        // ancestor group.
        .filter(el => el.closest('[data-rv-group]') === group)
        .map(el => {
          const role = roleOf(el)
          const seq = counts[role] ?? 0
          counts[role] = seq + 1
          return { el, role, seq }
        })
    }

    /* A split title deals itself out over time, and how long that takes
       depends on how many words it has. The hero headline is six words; a
       section heading is two. Without accounting for that, delays tuned so
       the lede does not resolve under an unfinished hero headline leave
       every section below sitting on an empty gap. So the levels that
       follow a title wait for the title's own span — capped, because a
       long headline should overlap what comes after it rather than block
       it — and the choreography says how much of that it wants. */
    const FOLLOW_CAP = 300

    const delayOf = (item: Item, follow: number) =>
      CASCADE.base[item.role] +
      (item.role === 'title' || item.role === 'eyebrow' ? 0 : follow) +
      item.seq * CASCADE.step[item.role]

    /* ---- playback --------------------------------------------------- */

    const play = (group: HTMLElement, extra = 0) => {
      if (disposed || group.dataset.rvPlayed) return
      group.dataset.rvPlayed = '1'

      const items = itemsOf(group)

      // Split first, so the group's title span is known before anything is
      // scheduled against it.
      const split = new Map<HTMLElement, HTMLElement[]>()
      let titleSpan = 0
      for (const item of items) {
        const mode = CASCADE.split[item.role] ?? 'none'
        if (mode === 'none') continue
        const units = splitTitle(item.el, mode)
        if (!units.length) continue
        split.set(item.el, units)
        if (item.role === 'title') {
          titleSpan = Math.max(titleSpan, (units.length - 1) * CASCADE.glyphStep)
        }
      }
      const follow = CASCADE.followTitle * Math.min(titleSpan, FOLLOW_CAP)

      for (const item of items) {
        const delay = delayOf(item, follow) + extra
        const units = split.get(item.el) ?? []

        if (units.length) {
          const [keyframes, timing] = CASCADE.glyph(item.role)
          units.forEach((unit, i) => {
            unit.style.willChange = 'opacity, transform, filter'
            const anim = unit.animate(keyframes, {
              ...timing,
              delay: delay + i * CASCADE.glyphStep,
              fill: 'both',
            })
            settle(anim, unit)
            animations.push(anim)
          })
          continue
        }

        const [keyframes, timing] = CASCADE.block(item.role)
        item.el.style.willChange = 'opacity, transform, filter'
        const anim = item.el.animate(keyframes, {
          ...timing,
          delay,
          fill: 'both',
        })
        settle(anim, item.el)
        animations.push(anim)
      }
    }

    /* ---- wiring ---------------------------------------------------- */

    const heroGroups = groups.filter(g => g.dataset.rvGroup === 'hero')
    const restGroups = groups.filter(g => g.dataset.rvGroup !== 'hero')

    let armed = false
    /** Below-fold groups that came into view before the intro finished. */
    const pending = new Set<HTMLElement>()

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const group = entry.target as HTMLElement
          observer.unobserve(group)
          if (armed) play(group)
          else pending.add(group)
        }
      },
      // Trips just inside the fold — early enough that a section is never
      // still revealing when the demo inside it starts, late enough that
      // the motion is actually seen.
      { threshold: 0, rootMargin: '0px 0px -5% 0px' },
    )

    for (const group of restGroups) observer.observe(group)

    const arm = (lead: number) => {
      if (armed || disposed) return
      armed = true
      for (const group of heroGroups) play(group, lead)
      // Anything already on screen joins the same wave, offset so it does
      // not race the hero.
      pending.forEach(group => play(group, lead + 120))
      pending.clear()
    }

    const w = window as unknown as { __xpIntroDone?: boolean }
    let heroTimer: ReturnType<typeof setTimeout> | undefined

    if (w.__xpIntroDone) {
      heroTimer = setTimeout(() => arm(0), HERO_INSTANT)
    } else {
      // The curtain is still up. Start with the lift if we hear about it,
      // otherwise fall back to the "fully gone" signal.
      const onLift = () => {
        clearTimeout(heroTimer)
        heroTimer = setTimeout(() => arm(0), HERO_LEAD)
      }
      const onDone = () => {
        if (!armed) {
          clearTimeout(heroTimer)
          arm(0)
        }
      }
      window.addEventListener('xp:intro-lift', onLift, { once: true })
      window.addEventListener('xp:intro-done', onDone, { once: true })
      heroTimer = setTimeout(() => arm(0), FAILSAFE)
      cleanups.push(() => {
        window.removeEventListener('xp:intro-lift', onLift)
        window.removeEventListener('xp:intro-done', onDone)
      })
    }
    if (heroTimer) timers.push(heroTimer)

    // A tab that goes away mid-cascade comes back finished, not frozen
    // halfway through a blur.
    const onVisibility = () => {
      if (document.hidden) finalizeAll()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      disposed = true
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      timers.forEach(clearTimeout)
      cleanups.forEach(fn => fn())
      for (const anim of animations) {
        try {
          anim.cancel()
        } catch {
          /* ignore */
        }
      }
    }
  }, [])

  return (
    <div ref={hostRef} data-rv-root style={{ display: 'contents' }}>
      {children}
    </div>
  )
}
