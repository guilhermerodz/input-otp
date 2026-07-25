'use client'

/* The closing CTA. The page opens on the motes field and closes on it — same
   effect, same accent — but here it is masked to the top of the section, so the
   light arrives from above and dies before it reaches the wordmark below.
   `input-otp` sits in outline, sunk into the footer border, with a wide glow
   lifting it off that border and a light travelling along it. */

import { Motes } from '@lucasmarkes/motes-react'
import * as React from 'react'

const GITHUB_URL = 'https://github.com/guilhermerodz/input-otp'

/* Nothing runs a canvas for a section nobody has reached. The field mounts a
   screen ahead of the viewport, then fades in on the frame after motes' first
   paint, so none of the 800ms fade is spent on an empty canvas. */
function useMotesGate() {
  const ref = React.useRef<HTMLElement>(null)
  const [near, setNear] = React.useState(false)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const host = ref.current
    if (!host) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (!near) return
    let second = 0
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setReady(true))
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [near])

  return { ref, near, ready }
}

export function CtaDaybreak({ starCount }: { starCount: string | null }) {
  const { ref, near, ready } = useMotesGate()

  return (
    <section className="xp-cta" ref={ref}>
      {near && (
        <Motes
          className="xp-cta-field"
          data-ready={ready || undefined}
          effect="flow"
          density={9}
          trail={0.32}
          accent="#ddeafe"
          aria-hidden="true"
        />
      )}
      <span className="xp-cta-mark xp-mono" aria-hidden="true">
        input-otp
      </span>
      <span className="xp-cta-glow" aria-hidden="true" />

      <div className="xp-cta-inner">
        <h2 className="xp-cta-title">Your last OTP input.</h2>
        <p className="xp-cta-sub">
          MIT licensed, zero dependencies, one real input under the slots.
        </p>
        <div className="xp-cta-row">
          <a className="xp-cta-key xp-cta-key--primary" href={GITHUB_URL}>
            Get started
            <span className="xp-cta-key-glyph xp-mono" aria-hidden="true">
              ↵
            </span>
          </a>
          <a
            className="xp-cta-key xp-cta-key--ghost xp-cta-key--star"
            href={GITHUB_URL}
          >
            <span aria-hidden="true">★</span> {starCount ?? '3.2k'} on GitHub
          </a>
        </div>
      </div>

      <span className="xp-cta-line" aria-hidden="true" />
    </section>
  )
}
