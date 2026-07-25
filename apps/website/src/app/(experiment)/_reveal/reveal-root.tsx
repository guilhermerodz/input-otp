'use client'

import * as React from 'react'

import {
  FOCUS_DEPTH,
  type Role,
  ROLES,
  type SplitMode,
  type Variant,
  variantById,
} from './choreography'

/**
 * Drives every reveal on the page.
 *
 * It reads the annotations the markup already carries — `data-rv-group` for
 * a stagger unit, `data-rv="<role>"` for a level inside it — and hands them
 * to the chosen variant's choreographer. The markup never mentions timing,
 * so all five variants run against identical DOM.
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

/* Marks a subtree whose elements drive their own transform from pointer
   state — the sponsor grid's tilt is the one that exists today. The
   scroll-linked variant writes transforms on every frame, so it would win
   that fight permanently; inside one of these it conveys depth with opacity
   and blur alone and leaves the transform to its owner. */
const OWNS_TRANSFORM = '[data-tilt]'

const CHAR_POOL = 'abcdefghijklmnopqrstuvwxyz'
const CHAR_POOL_UPPER = CHAR_POOL.toUpperCase()
const DIGIT_POOL = '0123456789'

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

/* Everything the variants can touch, wiped back to the stylesheet. The
   `rv-done` flag is what drops the CSS start state (and, for the masked
   variant, the mask itself — a mask left behind would clip forever). */
const TOUCHED = [
  'opacity',
  'transform',
  'filter',
  'clip-path',
  'will-change',
  'text-shadow',
  'mask-image',
  '-webkit-mask-image',
  'mask-position',
  '-webkit-mask-position',
]

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
 * Done at runtime rather than in the markup: only two of the five
 * variants want split titles, and the headings involved are static
 * strings, so React never re-renders over the spans. Words are wrapped
 * even in "chars" mode — bare inline-block glyphs would let a line break
 * fall inside a word.
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
      if (mode === 'words') {
        word.textContent = chunk
        units.push(word)
      } else {
        // In chars mode the word is only there to keep line breaks between
        // words: it never animates, so it must not be treated as hidden —
        // an unanimated word wrapper would take its whole title down with it.
        word.dataset.rvDone = '1'
        for (const ch of Array.from(chunk)) {
          const glyph = document.createElement('span')
          glyph.dataset.rvChar = ''
          glyph.textContent = ch
          word.appendChild(glyph)
          units.push(glyph)
        }
      }
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

/* Glyph widths for a given font, measured once on a canvas so the whole
   pool costs no layout at all. */
const widthCache = new Map<string, { ch: string; w: number }[]>()
let measureCtx: CanvasRenderingContext2D | null | undefined

function poolWidths(font: string, pool: string) {
  const key = `${font}|${pool}`
  const hit = widthCache.get(key)
  if (hit) return hit
  if (measureCtx === undefined) {
    measureCtx = document.createElement('canvas').getContext('2d')
  }
  const ctx = measureCtx
  const measured = Array.from(pool).map(ch => ({
    ch,
    w: ctx ? ((ctx.font = font), ctx.measureText(ch).width) : 0,
  }))
  widthCache.set(key, measured)
  return measured
}

/* ------------------------------------------------------------------ *
 * Decode driver
 *
 * Each glyph churns through stand-ins and locks. Two things have to hold
 * or a scrambling headline turns to mush:
 *
 *  - the box must not resize, so each glyph's width is measured and
 *    pinned before the first swap;
 *  - the stand-ins must actually *fit* that box. Dropping a `w` into an
 *    `i`-sized slot overflows it and collides with the neighbours on both
 *    sides, which is unreadable in a way plain noise is not. So each
 *    glyph draws from the handful of pool characters closest to its own
 *    width in this exact font.
 * ------------------------------------------------------------------ */
function scramble(units: HTMLElement[], delays: number[]): () => void {
  const timers: ReturnType<typeof setTimeout>[] = []

  // One read pass, then one write pass: measuring after the first pin
  // would measure the pinned width back.
  const finals = units.map(u => u.textContent ?? '')
  const widths = units.map(u => u.getBoundingClientRect().width)
  const fonts = units.map(u => {
    const s = getComputedStyle(u)
    return `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`
  })

  units.forEach((u, i) => {
    u.style.display = 'inline-block'
    u.style.width = `${widths[i]}px`
    u.style.textAlign = 'center'
  })

  units.forEach((unit, i) => {
    const final = finals[i]
    if (!final.trim()) {
      unit.style.opacity = '1'
      return
    }
    const pool = /[0-9]/.test(final)
      ? DIGIT_POOL
      : final === final.toUpperCase()
        ? CHAR_POOL_UPPER
        : CHAR_POOL

    // The six nearest-width stand-ins, so the churn never spills out of
    // the glyph's own box.
    const target = poolWidths(fonts[i], pool)
      // Never stand in for a glyph with itself — a letter that is already
      // correct reads as locked, and the lock is the payoff.
      .filter(c => c.ch !== final)
      .map(c => ({ ...c, d: Math.abs(c.w - widths[i]) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 6)
      .map(c => c.ch)

    const swaps = 5 + (i % 4)
    for (let s = 0; s < swaps; s++) {
      timers.push(
        setTimeout(
          () => {
            unit.style.opacity = '1'
            unit.style.color = '#a1a1aa'
            unit.textContent = target[(i * 3 + s * 5) % target.length]
          },
          delays[i] + s * 42,
        ),
      )
    }
    timers.push(
      setTimeout(
        () => {
          unit.textContent = final
          unit.style.opacity = '1'
          unit.style.color = ''
          unit.style.width = ''
          unit.style.display = ''
          unit.style.textAlign = ''
        },
        delays[i] + swaps * 42,
      ),
    )
  })

  return () => timers.forEach(clearTimeout)
}

export function RevealRoot({
  variant: variantId,
  children,
}: {
  variant: number
  children: React.ReactNode
}) {
  const hostRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const variant = variantById(variantId)
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
      // Re-queried rather than captured — see the note on staleness in
      // runFocusPull; a node captured at mount can already be detached.
      for (const el of Array.from(
        host.querySelectorAll<HTMLElement>('[data-rv]'),
      )) {
        clearInline(el)
        el.querySelectorAll<HTMLElement>('[data-rv-word],[data-rv-char]').forEach(
          u => {
            clearInline(u)
            u.style.width = ''
            u.style.display = ''
            u.style.textAlign = ''
            u.style.color = ''
          },
        )
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
       it — and each variant says how much of that it wants. */
    const FOLLOW_CAP = 300

    const delayOf = (item: Item, follow: number) =>
      variant.base[item.role] +
      (item.role === 'title' || item.role === 'eyebrow' ? 0 : follow) +
      item.seq * variant.step[item.role]

    /* ---- one-shot playback ---------------------------------------- */

    const play = (group: HTMLElement, extra = 0) => {
      if (disposed || group.dataset.rvPlayed) return
      group.dataset.rvPlayed = '1'

      const items = itemsOf(group)
      const scrambleUnits: HTMLElement[] = []
      const scrambleDelays: number[] = []

      // Split first, so the group's title span is known before anything is
      // scheduled against it.
      const split = new Map<HTMLElement, HTMLElement[]>()
      let titleSpan = 0
      for (const item of items) {
        const mode = variant.split[item.role] ?? 'none'
        if (mode === 'none') continue
        const units = splitTitle(item.el, mode)
        if (!units.length) continue
        split.set(item.el, units)
        if (item.role === 'title') {
          titleSpan = Math.max(titleSpan, (units.length - 1) * variant.glyphStep)
        }
      }
      const follow =
        variant.followTitle * Math.min(titleSpan, FOLLOW_CAP)

      for (const item of items) {
        const delay = delayOf(item, follow) + extra
        const units = split.get(item.el) ?? []

        if (units.length) {
          if (variant.glyphDriver === 'scramble') {
            units.forEach((u, i) => {
              scrambleUnits.push(u)
              scrambleDelays.push(delay + i * variant.glyphStep)
            })
            continue
          }
          const build = variant.glyph ?? variant.block
          const [keyframes, timing] = build(item.role)
          units.forEach((unit, i) => {
            unit.style.willChange = 'opacity, transform, filter'
            const anim = unit.animate(keyframes, {
              ...timing,
              delay: delay + i * variant.glyphStep,
              fill: 'both',
            })
            settle(anim, unit)
            animations.push(anim)
          })
          continue
        }

        const [keyframes, timing] = variant.block(item.role)
        item.el.style.willChange = 'opacity, transform, filter'
        const anim = item.el.animate(keyframes, {
          ...timing,
          delay,
          fill: 'both',
        })
        settle(anim, item.el)
        animations.push(anim)
      }

      if (scrambleUnits.length) {
        cleanups.push(scramble(scrambleUnits, scrambleDelays))
      }
    }

    /* ---- scroll-linked playback (variant 3) ------------------------ */

    const runFocusPull = (scrollGroups: HTMLElement[]) => {
      /* Some grid items are client-only components that render a placeholder
         and then swap their host element on mount (the sponsor cards do this
         to hang a border beam on the grid item). A list captured once would
         hold those detached placeholders and leave the real cards stuck at
         their hidden start state — so the list re-resolves whenever any of
         it has been swapped out from under us. */
      const collect = () => {
        const found = scrollGroups.flatMap(g => itemsOf(g))
        for (const { el } of found) el.style.willChange = 'opacity, filter'
        return found
      }
      let items = collect()

      const frame = () => {
        if (disposed) return
        if (items.some(item => !item.el.isConnected)) items = collect()
        const vh = window.innerHeight

        // Read everything first, write everything after. Interleaving the
        // two would force a layout per element on every frame of a scroll.
        const rects = items.map(item => item.el.getBoundingClientRect())

        items.forEach(({ el, role }, i) => {
          const rect = rects[i]
          // Skip anything nowhere near the frame — blur is expensive and
          // there are a lot of these.
          if (rect.bottom < -vh || rect.top > vh * 2) return

          const depth = FOCUS_DEPTH[role]

          // Coming up from the bottom: sharpens over the last ~44% of the
          // approach, so it is already legible well before it centres.
          const enter = clamp((vh - rect.top) / (vh * 0.44))
          // Leaving past the top: recedes rather than disappearing. It only
          // ever gives back about two thirds of its presence — content you
          // have already read stays readable, it just stops being the
          // subject. Anything stronger and scrolling back up feels broken.
          const leave = clamp(1 - rect.bottom / (vh * 0.22))

          const blur = depth.blur * (1 - enter) + depth.blur * 0.3 * leave
          const y = depth.y * (1 - enter) - depth.y * 0.5 * leave
          const scale = 1 - (depth.y / 900) * (1 - enter + 0.4 * leave)

          el.style.opacity = String((0.04 + 0.96 * enter) * (1 - 0.68 * leave))
          el.style.filter = blur < 0.06 ? 'none' : `blur(${blur.toFixed(2)}px)`

          // Checked per frame, not once: the owner only claims the subtree
          // once it has decided the pointer supports it, which can land
          // after this loop is already running — and by then we may have
          // written a transform that has to be handed back.
          if (el.closest(OWNS_TRANSFORM)) {
            el.style.removeProperty('transform')
            return
          }
          el.style.transform =
            Math.abs(y) < 0.1 && scale > 0.999
              ? 'none'
              : `translateY(${y.toFixed(2)}px) scale(${scale.toFixed(4)})`
        })
      }

      // Coalesced by frame timestamp rather than by a "queued" flag: a flag
      // stays latched if its frame is ever dropped — which is exactly what
      // happens when the page loads in a background tab — and the whole
      // effect would then be stuck at its start state for good.
      let lastFrame = -1
      const request = () => {
        requestAnimationFrame(now => {
          if (now === lastFrame) return
          lastFrame = now
          frame()
        })
      }

      window.addEventListener('scroll', request, { passive: true })
      window.addEventListener('resize', request)
      request()
      // Nothing scrolls on its own, so the post-hydration element swaps above
      // need a couple of frames scheduled for them explicitly.
      timers.push(setTimeout(request, 120), setTimeout(request, 700))
      cleanups.push(() => {
        window.removeEventListener('scroll', request)
        window.removeEventListener('resize', request)
      })
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

    if (variant.scrollLinked) {
      runFocusPull(restGroups)
    } else {
      for (const group of restGroups) observer.observe(group)
    }

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
      if (document.hidden && !variant.scrollLinked) finalizeAll()
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
  }, [variantId])

  return (
    <div ref={hostRef} data-rv-variant={variantId} style={{ display: 'contents' }}>
      {children}
    </div>
  )
}

function clamp(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n
}
