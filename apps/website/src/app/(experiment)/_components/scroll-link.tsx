'use client'

import * as React from 'react'

/* The native jump lands instantly, which means the visitor skips straight
   past everything between the hero and the section. This scroll takes its
   time on purpose — fast out of the gate, then a long glide — so the page
   gets seen on the way down. */
const DURATION = 1250

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export function smoothScrollToY(top: number, onArrive?: () => void) {
  const to = Math.max(
    0,
    Math.min(top, document.documentElement.scrollHeight - window.innerHeight),
  )

  /* The page sets `scroll-behavior: smooth`, which would turn every frame's
     scrollTo into a restarted native glide chasing the last waypoint — the
     scroll stalls, then lags the easing by seconds. Park it on `auto` while
     this animation owns the scroll. */
  const root = document.documentElement
  const previousBehavior = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  const restoreBehavior = () => {
    root.style.scrollBehavior = previousBehavior
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, to)
    restoreBehavior()
    onArrive?.()
    return
  }

  const from = window.scrollY
  const start = performance.now()
  let raf = 0

  /* The visitor grabbing the wheel mid-flight wins immediately. */
  const interruptions = ['wheel', 'touchstart', 'keydown'] as const
  const cancel = () => {
    cancelAnimationFrame(raf)
    cleanup()
  }
  const cleanup = () => {
    interruptions.forEach(event => window.removeEventListener(event, cancel))
    restoreBehavior()
  }
  interruptions.forEach(event =>
    window.addEventListener(event, cancel, { passive: true }),
  )

  const step = (now: number) => {
    const t = Math.min(1, (now - start) / DURATION)
    window.scrollTo(0, from + (to - from) * easeOutCubic(t))
    if (t < 1) {
      raf = requestAnimationFrame(step)
    } else {
      cleanup()
      onArrive?.()
    }
  }
  raf = requestAnimationFrame(step)
}

export function smoothScrollToId(id: string) {
  const target = document.getElementById(id)
  if (!target) return
  smoothScrollToY(target.getBoundingClientRect().top + window.scrollY, () => {
    /* Hand keyboard focus to the section so tabbing continues from where
       the visitor landed, same as a native anchor jump. */
    target.tabIndex = -1
    target.focus({ preventScroll: true })
  })
}

/**
 * In-page link that glides to `toId` instead of jumping, and keeps the hash
 * out of the URL — the address bar is the heading anchors' job. The href
 * stays real so the link still works without JavaScript.
 */
export function ScrollLink({
  toId,
  children,
  ...rest
}: {
  toId: string
  children: React.ReactNode
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <a
      {...rest}
      href={`#${toId}`}
      onClick={event => {
        event.preventDefault()
        smoothScrollToId(toId)
      }}
    >
      {children}
    </a>
  )
}
