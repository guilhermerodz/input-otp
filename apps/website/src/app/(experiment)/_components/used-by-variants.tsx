'use client'

/* Five takes on the "used by" section, stacked so they can be compared on the
   page and one picked. Temporary: once a winner is chosen this file, its
   stylesheet and the gallery wrapper all go away, and the winner moves into
   used-by-marquee.tsx. */

import { useEffect, useRef, useState } from 'react'

import { COMPANIES, UsedByMarquee } from './used-by-marquee'

type Company = (typeof COMPANIES)[number]

const COUNT = COMPANIES.length

function Mark({ company, scale = 1 }: { company: Company; scale?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={company.src}
      alt=""
      style={{ height: Math.round(company.height * scale), width: 'auto' }}
    />
  )
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])
  return reduced
}

function Eyebrow({ children = 'USED BY' }: { children?: React.ReactNode }) {
  return (
    <div className="xp-usedby-eyebrow xp-mono">
      {children}
      <span style={{ color: '#3f3f46' }}>_</span>
    </div>
  )
}

/* 02 — trio ---------------------------------------------------------------
   Three companies at a time, evenly spaced. One cell at a time tears itself
   apart, swaps underneath the noise and comes back as the next company, its
   name scrambling through junk characters on the way. Each cell only ever
   advances by three, so with nine companies the three on screen are always
   distinct. */

const GLITCH_BEFORE = 240
const GLITCH_AFTER = 260
const TRIO_EVERY = 2400
const NOISE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*/<>_'

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

  return <span className="xp-usedby-name">{text}</span>
}

function Trio() {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState([0, 1, 2])
  const [glitching, setGlitching] = useState(-1)
  const turn = useRef(0)

  useEffect(() => {
    if (reduced) return
    const pending: ReturnType<typeof setTimeout>[] = []

    const cycle = setInterval(() => {
      const cell = turn.current % 3
      turn.current += 1
      setGlitching(cell)
      pending.push(
        setTimeout(() => {
          setShown(current =>
            current.map((index, i) =>
              i === cell ? (index + 3) % COUNT : index,
            ),
          )
        }, GLITCH_BEFORE),
        setTimeout(() => setGlitching(-1), GLITCH_BEFORE + GLITCH_AFTER),
      )
    }, TRIO_EVERY)

    return () => {
      clearInterval(cycle)
      pending.forEach(clearTimeout)
    }
  }, [reduced])

  return (
    <section className="xp-usedby-section">
      <Eyebrow />
      <div className="xp-uv-trio">
        {shown.map((index, cell) => {
          const company = COMPANIES[index]
          const hot = glitching === cell
          return (
            <a
              key={cell}
              className={`xp-uv-trio-cell${hot ? ' xp-uv-glitch' : ''}`}
              href={company.href}
              target="_blank"
              rel="noreferrer"
            >
              <Mark company={company} scale={1.2} />
              <ScrambledName name={company.name} active={hot} />
            </a>
          )
        })}
      </div>
    </section>
  )
}

/* 03 — reels --------------------------------------------------------------
   The intro's slot machine, kept running. Three windows, each rolling three
   companies deep on every pull, staggered so they land one after another. The
   strip is the list twice over, so a pull that runs past the end can snap back
   a full list length while the pixels stay identical. */

const REEL_HEIGHT = 62
const REEL_SPIN = 720
const REEL_EVERY = 3600
const STRIP = [...COMPANIES, ...COMPANIES]

function Reel({ start, delay }: { start: number; delay: number }) {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(start)
  const [spinning, setSpinning] = useState(false)
  const [snapping, setSnapping] = useState(false)
  const settled = useRef(start)

  useEffect(() => {
    if (reduced) return
    const timers: ReturnType<typeof setTimeout>[] = []

    const pull = () => {
      const target = settled.current + 3
      setSpinning(true)
      setSnapping(false)
      setIndex(target)
      timers.push(
        setTimeout(() => {
          setSpinning(false)
          if (target >= COUNT) {
            /* One list length back is the same picture, so the jump is only
               visible to the maths. */
            settled.current = target - COUNT
            setSnapping(true)
            setIndex(settled.current)
            timers.push(setTimeout(() => setSnapping(false), 50))
          } else {
            settled.current = target
          }
        }, REEL_SPIN),
      )
    }

    timers.push(
      setTimeout(() => {
        pull()
        timers.push(setInterval(pull, REEL_EVERY))
      }, delay),
    )

    return () => timers.forEach(clearTimeout)
  }, [reduced, delay])

  const current = STRIP[settled.current % COUNT]

  return (
    <div className="xp-uv-reel">
      <div
        className={`xp-uv-reel-strip${snapping ? ' xp-uv-reel-strip--snap' : ''}${
          spinning ? ' xp-uv-reel-strip--spin' : ''
        }`}
        style={{ transform: `translateY(${-index * REEL_HEIGHT}px)` }}
      >
        {STRIP.map((company, i) => (
          <div className="xp-uv-reel-cell" key={i} aria-hidden="true">
            <Mark company={company} scale={0.85} />
            <span className="xp-uv-reel-name">{company.name}</span>
          </div>
        ))}
      </div>
      {/* One tab stop per window, always pointing at whatever it landed on. */}
      <a
        className="xp-uv-reel-hit"
        href={current.href}
        target="_blank"
        rel="noreferrer"
      >
        <span className="xp-uv-sr">{current.name}</span>
      </a>
    </div>
  )
}

function Reels() {
  return (
    <section className="xp-usedby-section">
      <Eyebrow />
      <div className="xp-uv-reels">
        <Reel start={0} delay={0} />
        <Reel start={3} delay={180} />
        <Reel start={6} delay={360} />
      </div>
    </section>
  )
}

/* 04 — keypad -------------------------------------------------------------
   All nine at once, in the shape of the thing the library builds: a grid of
   slots. A light walks the diagonal, lifting each cell as it passes, which
   is the same gesture as the slot spotlight in the hero. */

function Keypad() {
  return (
    <section className="xp-usedby-section">
      <Eyebrow />
      <div className="xp-uv-keypad">
        {COMPANIES.map((company, i) => (
          <a
            key={company.name}
            className="xp-uv-key"
            href={company.href}
            target="_blank"
            rel="noreferrer"
            style={
              { '--d': Math.floor(i / 3) + (i % 3) } as React.CSSProperties
            }
          >
            <Mark company={company} scale={1.05} />
            <span className="xp-usedby-name">{company.name}</span>
          </a>
        ))}
      </div>
    </section>
  )
}

/* 05 — ticker -------------------------------------------------------------
   One company at a time on a single line, each one typed in by the caret the
   rest of the page already uses. Nothing moves except the caret, so it sits
   quietly under the hero instead of competing with it. */

const TICKER_EVERY = 2600

function Ticker() {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setIndex(i => (i + 1) % COUNT), TICKER_EVERY)
    return () => clearInterval(id)
  }, [reduced])

  const company = COMPANIES[index]

  return (
    <section className="xp-usedby-section xp-uv-ticker-section">
      <div className="xp-uv-ticker">
        <span className="xp-uv-ticker-label xp-mono">USED BY</span>
        <span className="xp-uv-ticker-slot">
          {/* Re-keyed on every change so the reveal animation restarts. The
              caret rides inside the lockup, so it stops at the end of this
              name rather than at the end of the widest one. */}
          <a
            className="xp-uv-ticker-item"
            key={index}
            href={company.href}
            target="_blank"
            rel="noreferrer"
          >
            <Mark company={company} scale={1.15} />
            <span className="xp-usedby-name">{company.name}</span>
            <span className="xp-uv-ticker-caret" />
          </a>
        </span>
      </div>
    </section>
  )
}

/* Gallery ---------------------------------------------------------------- */

const VARIANTS: [string, React.ReactNode][] = [
  ['01 — belt', <UsedByMarquee key="01" />],
  ['02 — trio, glitch swap', <Trio key="02" />],
  ['03 — reels', <Reels key="03" />],
  ['04 — keypad, light on the diagonal', <Keypad key="04" />],
  ['05 — ticker, one at a time', <Ticker key="05" />],
]

export function UsedByVariants() {
  return (
    <>
      {VARIANTS.map(([label, node]) => (
        <div className="xp-uv-wrap" key={label}>
          <span className="xp-uv-tag xp-mono">{label}</span>
          {node}
        </div>
      ))}
    </>
  )
}
