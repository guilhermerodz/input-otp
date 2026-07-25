'use client'

/* The closing CTA. The page opens on the motes field and closes on it — same
   effect, same accent — but here it is masked to the top of the section, so the
   light arrives from above and dies before it reaches the wordmark below.
   `input-otp` fills the floor, sunk into the footer border, running the same
   particle shader as the diamond sponsor's mark: the cursor pushes the letters
   apart and they spring back. A light travels the border underneath. */

import { Motes } from '@lucasmarkes/motes-react'
import * as React from 'react'

import { useParticleMark } from './particle-mark'

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

/* The wordmark ------------------------------------------------------------ */

const MARK_TEXT = 'input-otp'
/* The particles are drawn white, so this alpha *is* how bright the wordmark
   reads — at rest and in flight. Low enough to stay floor, not headline. */
const MARK_ALPHA = 0.14
/* Room around the letters for particles to fly into, and how much of the
   cursor's surroundings gets pushed. Both scale with a mark this size: the
   sponsor logo is 44px tall and uses a fraction of these. The brush is wide
   enough to take a whole letter at once — a cursor-sized one would look like
   a fault in the render rather than something you are doing. */
const MARK_PAD = 150
const MARK_FLOW_RADIUS = 130
/* Device pixels per particle: 8, so a particle is a 4pt square on a 2x screen.
   The sponsor logo samples one particle per pixel because it is 44px tall and
   has to stay legible; a section-wide wordmark can afford to break into pixels
   you can actually see. */
const MARK_PITCH = 8

/* Rasterizing text rather than an SVG means reading the font off the DOM copy
   — it is set in CSS (clamped to the viewport) and drawn by a webfont, so
   neither the size nor the metrics are known here until layout and fonts have
   settled. Everything the canvas needs comes from measureText on the same
   font string, which also places the canvas: its ink box is lined up with
   where the DOM copy's ink sits, so the crossfade between them doesn't move. */
function ParticleWordmark() {
  const textRef = React.useRef<HTMLSpanElement>(null)
  const [fontsReady, setFontsReady] = React.useState(false)
  /* The mark is sized in vw, so a resize invalidates the whole simulation.
     Kept in state to re-arm the hook, debounced so a drag rebuilds once. */
  const [width, setWidth] = React.useState(0)

  React.useEffect(() => {
    let alive = true
    document.fonts?.ready.then(() => {
      if (alive) setFontsReady(true)
    })
    return () => {
      alive = false
    }
  }, [])

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setWidth(window.innerWidth), 300)
    }
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const mark = useParticleMark(() => {
    const el = textRef.current
    if (!el) return null
    const style = getComputedStyle(el)
    const fontSize = parseFloat(style.fontSize)
    if (!fontSize) return null

    const probe = document.createElement('canvas').getContext('2d')
    if (!probe) return null
    const spacing = parseFloat(style.letterSpacing) || 0
    const apply = (ctx: CanvasRenderingContext2D, scale: number) => {
      ctx.font = `${style.fontWeight} ${fontSize * scale}px ${style.fontFamily}`
      /* Not in every engine yet; without it the canvas copy is a little wider
         than the DOM one, which only shows during the crossfade. */
      if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing * scale}px`
      ctx.textBaseline = 'alphabetic'
    }
    apply(probe, 1)
    const m = probe.measureText(MARK_TEXT)
    const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight
    const inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
    if (!(inkW > 0 && inkH > 0)) return null

    /* Where the DOM copy's ink starts, in the wrap's coordinates. The span is
       a block with line-height 1, so its baseline is half the leading below
       its top edge. */
    const box = el.getBoundingClientRect()
    const leading =
      (box.height - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2
    const inkLeft = el.offsetLeft - m.actualBoundingBoxLeft
    const inkTop =
      el.offsetTop +
      leading +
      m.fontBoundingBoxAscent -
      m.actualBoundingBoxAscent

    const canvas = mark.canvasRef.current
    if (canvas) {
      canvas.style.left = `${inkLeft - MARK_PAD}px`
      canvas.style.top = `${inkTop - MARK_PAD}px`
    }

    return {
      draw: (ctx, cols, rows) => {
        const scale = Math.min(cols / inkW, rows / inkH)
        apply(ctx, scale)
        ctx.fillStyle = `rgba(255, 255, 255, ${MARK_ALPHA})`
        ctx.fillText(
          MARK_TEXT,
          m.actualBoundingBoxLeft * scale,
          m.actualBoundingBoxAscent * scale,
        )
      },
      cssW: inkW,
      cssH: inkH,
      pad: MARK_PAD,
      pitch: MARK_PITCH,
      flowRadius: MARK_FLOW_RADIUS,
    }
  }, [fontsReady, width])

  return (
    <div
      className="xp-cta-mark"
      ref={mark.wrapRef}
      data-live={mark.live || undefined}
      aria-hidden="true"
    >
      <span className="xp-cta-mark-text xp-mono" ref={textRef}>
        {MARK_TEXT}
      </span>
      <canvas className="xp-cta-mark-canvas" ref={mark.canvasRef} />
    </div>
  )
}

export function CtaDaybreak({ starCount }: { starCount: string | null }) {
  const { ref, near, ready } = useMotesGate()

  return (
    <section className="xp-cta" ref={ref} data-rv-group>
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
      <ParticleWordmark />

      <div className="xp-cta-inner">
        <h2 className="xp-cta-title" data-rv="title">Your last OTP input.</h2>
        <p className="xp-cta-sub" data-rv="lede">
          MIT licensed, zero dependencies, one real input under the slots.
        </p>
        <div className="xp-cta-row" data-rv="action">
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
