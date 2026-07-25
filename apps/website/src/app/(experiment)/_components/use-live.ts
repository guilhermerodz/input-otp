'use client'

import * as React from 'react'

/**
 * True only while the node is on screen and the tab is in the foreground.
 * Every self-running demo on this page gates on it, so nothing animates in a
 * background tab or below the fold.
 */
export function useIsLive(ref: React.RefObject<HTMLElement>) {
  const [live, setLive] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    let onScreen = false
    const sync = () => setLive(onScreen && !document.hidden)
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        sync()
      },
      { threshold: 0.08 },
    )

    observer.observe(node)
    document.addEventListener('visibilitychange', sync)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [ref])

  return live
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  return reduced
}

/**
 * Walks a loop of steps whose durations are given in milliseconds. Only the
 * step boundaries re-render — the movement between them belongs to CSS
 * transitions, so a scene costs a handful of renders per loop rather than one
 * per frame.
 *
 * `frozenAt` pins the sequence to a single representative step, which is how
 * these scenes present themselves under `prefers-reduced-motion`.
 */
export function useSequence(
  durations: readonly number[],
  live: boolean,
  frozenAt?: number,
) {
  const [step, setStep] = React.useState(0)
  // Sequences of different lengths share this hook, so a step carried over
  // from a longer one is folded back into range rather than read past the end.
  const safe = durations.length ? step % durations.length : 0

  React.useEffect(() => {
    if (!live || frozenAt !== undefined) return

    const id = window.setTimeout(
      () => setStep(current => (current + 1) % durations.length),
      durations[safe],
    )
    return () => window.clearTimeout(id)
  }, [safe, live, durations, frozenAt])

  return frozenAt ?? safe
}
