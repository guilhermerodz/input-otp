'use client'

import { useEffect, useRef } from 'react'

/* Monochrome logo wall on a loop. Marks are trimmed brand glyphs paired with
   the name in the site's own type, so nine different logos read as one row
   instead of nine competing lockups. Hover anywhere pauses the belt; hover a
   single company brings it to full white. */

export const COMPANIES = [
  {
    name: 'Vercel',
    src: '/logos/vercel.svg',
    height: 15,
    href: 'https://vercel.com',
  },
  { name: 'xAI', src: '/logos/xai.svg', height: 18, href: 'https://x.ai' },
  {
    name: 'Lovable',
    src: '/logos/lovable.svg',
    height: 19,
    href: 'https://lovable.dev',
  },
  {
    name: 'ElevenLabs',
    src: '/logos/elevenlabs.svg',
    height: 17,
    href: 'https://elevenlabs.io',
  },
  {
    name: 'Sanity',
    src: '/logos/sanity.svg',
    height: 18,
    href: 'https://www.sanity.io',
  },
  // Clerk and Resend sponsor the library, so they get their tracked links here
  // too — same URLs as the sponsor tiers below.
  {
    name: 'Clerk',
    src: '/logos/clerk.svg',
    height: 19,
    href: 'https://go.clerk.com/input-otp',
  },
  {
    name: 'Resend',
    src: '/logos/resend.svg',
    height: 17,
    href: 'https://go.resend.com/input-otp',
  },
  {
    name: 'Cluely',
    src: '/logos/cluely.svg',
    height: 20,
    href: 'https://cluely.com',
  },
  {
    name: 'MongoDB',
    src: '/logos/mongodb.svg',
    height: 21,
    href: 'https://www.mongodb.com',
  },
] as const

/* Belt speed, px per second. */
const SPEED = 31

/* One pass of the belt. The track holds two of these and slides the width of
   exactly one, so the seam never shows. The clone is decoration: hidden from
   assistive tech and skipped by the tab order. */
function Belt({
  clone = false,
  innerRef,
}: {
  clone?: boolean
  innerRef?: React.Ref<HTMLDivElement>
}) {
  return (
    <div
      className="xp-usedby-belt"
      ref={innerRef}
      aria-hidden={clone || undefined}
    >
      {COMPANIES.map(company => (
        <div className="xp-usedby-cell" key={company.name}>
          <a
            className="xp-usedby-item"
            href={company.href}
            target="_blank"
            rel="noreferrer"
            tabIndex={clone ? -1 : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={company.src}
              alt=""
              style={{ height: company.height, width: 'auto' }}
            />
            <span className="xp-usedby-name">{company.name}</span>
          </a>
          <span className="xp-usedby-sep xp-mono" aria-hidden="true">
            /
          </span>
        </div>
      ))}
    </div>
  )
}

export function UsedByMarquee() {
  const bandRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const beltRef = useRef<HTMLDivElement>(null)
  const paused = useRef(false)

  /* The belt is driven here rather than by a CSS animation on purpose. A
     keyframe animation on a transform runs on the compositor, and its clock
     drifts from the main thread's whenever the tab is backgrounded — the next
     thing that touches the subtree (pausing it, or just repainting an opacity
     on hover) resyncs the two and the row visibly jumps. Advancing the offset
     ourselves means there is a single source of truth for where the belt is,
     so pausing is exactly where it was. */
  useEffect(() => {
    const band = bandRef.current
    const track = trackRef.current
    const belt = beltRef.current
    if (!band || !track || !belt) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let offset = 0
    let prev = 0
    let frame = 0

    const step = (now: number) => {
      /* A long gap — hidden tab, blocked main thread — must not teleport the
         belt, so a frame is charged at most a frame's worth of travel. */
      const dt = prev ? Math.min(now - prev, 32) : 0
      prev = now
      /* Wrapping by the belt's *current* width is invisible either way — the
         second belt sits exactly one width to the right — so a relayout mid
         travel (a font landing, a breakpoint) costs nothing here. */
      const width = belt.offsetWidth
      if (!paused.current && width > 0) {
        offset = (offset + (dt / 1000) * SPEED) % width
        track.style.transform = `translate3d(${-offset}px, 0, 0)`
      }
      frame = requestAnimationFrame(step)
    }

    const start = () => {
      if (frame) return
      prev = 0
      frame = requestAnimationFrame(step)
    }

    const stop = () => {
      if (!frame) return
      cancelAnimationFrame(frame)
      frame = 0
    }

    /* Nothing to animate while the strip is off screen. */
    const observer = new IntersectionObserver(entries => {
      if (entries[entries.length - 1].isIntersecting) start()
      else stop()
    })
    observer.observe(band)

    return () => {
      observer.disconnect()
      stop()
    }
  }, [])

  const hold = () => {
    paused.current = true
  }
  const release = () => {
    paused.current = false
  }

  return (
    <section className="xp-usedby-section">
      <div className="xp-usedby-eyebrow xp-mono">
        USED BY<span style={{ color: '#3f3f46' }}>_</span>
      </div>
      <div
        className="xp-usedby-band"
        ref={bandRef}
        onPointerEnter={hold}
        onPointerLeave={release}
        /* Keyboard users need the target to stop moving too. */
        onFocus={hold}
        onBlur={release}
      >
        <div className="xp-usedby-viewport">
          <div className="xp-usedby-track" ref={trackRef}>
            <Belt innerRef={beltRef} />
            <Belt clone />
          </div>
        </div>
      </div>
    </section>
  )
}
