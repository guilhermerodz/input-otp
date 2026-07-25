'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/* Nine companies, three on screen. Every few seconds one of them — never all
   three — tears itself apart, swaps underneath the noise and comes back as
   another, its name scrambling through junk characters on the way. The row
   itself never moves, so the section can sit under the hero without competing
   with it, and a logo is never a moving target to click. */

const COMPANIES = [
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

/* Each cell only ever advances by the number of cells, so every cell owns its
   own third of the list and the three on screen are always distinct. Holds as
   long as the list divides evenly by CELLS. */
const CELLS = 3
/* How often a cell turns over. The tear itself is the two constants below and
   is deliberately not tied to this one — the row can cycle faster without the
   glitch getting twitchier. */
const SWAP_EVERY = 1500
const GLITCH_BEFORE = 240
const GLITCH_AFTER = 260
const NOISE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*/<>_'

/* Proof each company actually ships it: a 16:9 screenshot per company, keyed
   off the logo's filename. Anything missing from the folder simply never
   opens — see the onError below. */
const shotFor = (src: string) =>
  src.replace('/logos/', '/used-by/').replace('.svg', '.png')

/* How far the screenshot rides from the cursor, and how close it may come to
   the edge of the window before it gets moved out of its own way. */
const SHOT_OFFSET = 22
const SHOT_PAD = 12

function Lockup({ company }: { company: (typeof COMPANIES)[number] }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="xp-usedby-mark"
        src={company.src}
        alt=""
        style={{ '--mark-h': `${company.height}px` } as React.CSSProperties}
      />
      <span className="xp-usedby-name">{company.name}</span>
    </>
  )
}

/* The name dissolves into junk for the length of the tear, then resolves as
   the real one — the swap reads as a decode rather than a cut. */
function ScrambledName({ name, active }: { name: string; active: boolean }) {
  const [text, setText] = useState(name)

  useEffect(() => {
    if (!active) {
      setText(name)
      return
    }
    const roll = () =>
      setText(
        Array.from(name, () =>
          NOISE.charAt(Math.floor(Math.random() * NOISE.length)),
        ).join(''),
      )
    roll()
    const id = setInterval(roll, 55)
    return () => clearInterval(id)
  }, [active, name])

  return (
    <span className={`xp-usedby-name${active ? ' xp-usedby-name--junk' : ''}`}>
      {text}
    </span>
  )
}

export function UsedByMarquee() {
  const rowRef = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState([0, 1, 2])
  const [glitching, setGlitching] = useState(-1)
  /* Which cell is showing its screenshot, and which screenshots have arrived.
     A card is only ever mounted around an image that has already decoded, so
     there is no blank frame while one loads and nothing to get stuck in when
     one is missing from the folder or a hover ends mid-request. */
  const [previewing, setPreviewing] = useState(-1)
  const [ready, setReady] = useState<Record<string, boolean>>({})
  const shotRef = useRef<HTMLDivElement>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const frame = useRef(0)
  const turn = useRef(0)
  /* Pointer or keyboard focus on the row: whoever is reading it decides when
     it moves on. */
  const held = useRef(false)
  const onScreen = useRef(true)
  const fetchShotRef = useRef((_: (typeof COMPANIES)[number]) => {})

  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let swapTimer: ReturnType<typeof setTimeout>
    let settleTimer: ReturnType<typeof setTimeout>

    const cycle = setInterval(() => {
      if (held.current || !onScreen.current) return
      const cell = turn.current % CELLS
      turn.current += 1

      setGlitching(cell)
      swapTimer = setTimeout(() => {
        setShown(current => {
          const next = current.map((index, i) =>
            i === cell ? (index + CELLS) % COMPANIES.length : index,
          )
          /* A swap can land under a pointer that arrived mid-tear. Start the
             incoming screenshot now so it is there by the time the tear ends. */
          if (held.current) fetchShotRef.current(COMPANIES[next[cell]])
          return next
        })
      }, GLITCH_BEFORE)
      settleTimer = setTimeout(
        () => setGlitching(-1),
        GLITCH_BEFORE + GLITCH_AFTER,
      )
    }, SWAP_EVERY)

    /* Nothing to swap through while the section is off screen. */
    const observer = new IntersectionObserver(entries => {
      onScreen.current = entries[entries.length - 1].isIntersecting
    })
    observer.observe(row)

    return () => {
      clearInterval(cycle)
      clearTimeout(swapTimer)
      clearTimeout(settleTimer)
      observer.disconnect()
    }
  }, [])

  /* Detached, so a hover that ends early cannot cancel it, and a company with
     no file in the folder simply never resolves — and so never opens. */
  const fetchShot = (company: (typeof COMPANIES)[number]) => {
    if (ready[company.name]) return
    const image = new Image()
    image.onload = () =>
      setReady(loaded => ({ ...loaded, [company.name]: true }))
    image.src = shotFor(company.src)
  }

  fetchShotRef.current = fetchShot

  const hold = () => {
    held.current = true
    /* Entering the row is the intent signal: the pointer still has to travel
       to a logo, which is enough time for these three to arrive. Only the three
       on screen, and only on hover — nobody downloads screenshots they never
       ask for. */
    if (canPreview()) shown.forEach(index => fetchShot(COMPANIES[index]))
  }
  const release = () => {
    held.current = false
    setPreviewing(-1)
  }

  /* Only worth fetching a screenshot where there is a pointer to open it with
     and room to put it. */
  const canPreview = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover)').matches &&
    window.innerWidth > 720

  const open = (cell: number) => {
    if (!canPreview()) return
    setPreviewing(cell)
    fetchShot(COMPANIES[shown[cell]])
  }

  /* Placement, the way a menu library does it: sit above the cursor by
     preference, flip below when the top of the window is in the way, and slide
     along the other axis to stay off both edges. Written straight to the node
     on a frame rather than through state — this runs on every mouse move. */
  const place = () => {
    const el = shotRef.current
    if (!el) return
    const { x, y } = pointer.current
    const { offsetWidth: w, offsetHeight: h } = el
    const vw = window.innerWidth
    const vh = window.innerHeight

    let side: 'top' | 'bottom' = 'top'
    let top = y - SHOT_OFFSET - h
    if (top < SHOT_PAD) {
      const below = y + SHOT_OFFSET
      if (below + h <= vh - SHOT_PAD) {
        top = below
        side = 'bottom'
      } else {
        /* Neither side fits: keep it on screen and let it overlap. */
        top = Math.max(SHOT_PAD, Math.min(top, vh - h - SHOT_PAD))
      }
    }
    const left = Math.max(SHOT_PAD, Math.min(x - w / 2, vw - w - SHOT_PAD))

    el.dataset.side = side
    el.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`
  }

  const track = (event: React.PointerEvent) => {
    pointer.current = { x: event.clientX, y: event.clientY }
    if (frame.current) return
    frame.current = requestAnimationFrame(() => {
      frame.current = 0
      place()
    })
  }

  /* Placed before the browser paints it, so it never shows up at the corner
     first and then jumps to the cursor. */
  useLayoutEffect(() => {
    if (previewing >= 0) place()
  })

  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    },
    [],
  )

  const hovered = previewing >= 0 ? COMPANIES[shown[previewing]] : null
  const shot =
    hovered && ready[hovered.name] && typeof document !== 'undefined'
      ? hovered
      : null

  return (
    <section className="xp-usedby-section">
      <div className="xp-usedby-eyebrow xp-mono">
        USED BY<span style={{ color: '#3f3f46' }}>_</span>
      </div>
      <div
        className="xp-usedby-row"
        ref={rowRef}
        onPointerEnter={hold}
        onPointerLeave={release}
        onFocus={hold}
        onBlur={release}
      >
        {shown.map((index, cell) => {
          const company = COMPANIES[index]
          const torn = glitching === cell
          return (
            <div
              className="xp-usedby-cell"
              key={cell}
              /* On the cell, which never re-keys or animates, rather than on
                 the link. The move handler is the safety net: if the enter is
                 ever missed, the next movement inside the column recovers. */
              onPointerEnter={event => {
                track(event)
                open(cell)
              }}
              onPointerMove={event => {
                track(event)
                if (previewing !== cell) open(cell)
              }}
            >
              {/* A column only ever shows its own third of the list, so it only
                  has to be as wide as the widest of those three. Stacking them
                  here, hidden, sizes the column from the data instead of from a
                  number that would rot the moment the list changes — and since
                  this never changes, neither does the column. */}
              <div className="xp-usedby-sizer" aria-hidden="true">
                {COMPANIES.filter((_, i) => i % CELLS === cell).map(
                  candidate => (
                    <span className="xp-usedby-lockup" key={candidate.name}>
                      <Lockup company={candidate} />
                    </span>
                  ),
                )}
              </div>
              <a
                className="xp-usedby-item"
                href={company.href}
                target="_blank"
                rel="noreferrer"
                onFocus={() => open(cell)}
              >
                {/* The tear lives on this span, never on the link: clip-path
                    clips hit-testing as well as pixels, so a torn link would
                    stop answering the pointer for the length of the glitch. */}
                <span
                  className={`xp-usedby-lockup${torn ? ' xp-usedby-tear' : ''}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="xp-usedby-mark"
                    src={company.src}
                    alt=""
                    style={
                      {
                        '--mark-h': `${company.height}px`,
                      } as React.CSSProperties
                    }
                  />
                  <ScrambledName name={company.name} active={torn} />
                </span>
              </a>
            </div>
          )
        })}
      </div>
      {shot &&
        createPortal(
          /* At the end of the body, out of reach of any ancestor's overflow,
             stacking context or transform — a fixed layer inside one of those
             would be positioned against it instead of the window. */
          <div className="xp-usedby-shot" ref={shotRef} aria-hidden="true">
            {/* Keyed by company so moving to another logo replays the
                arrival rather than silently swapping the image. */}
            <div className="xp-usedby-shot-card" key={shot.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shotFor(shot.src)} alt="" decoding="async" />
            </div>
          </div>,
          document.body,
        )}
    </section>
  )
}
