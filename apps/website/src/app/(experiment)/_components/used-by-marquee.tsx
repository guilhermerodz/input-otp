'use client'

import { useEffect, useRef, useState } from 'react'

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
  /* Which cell is showing its screenshot, and which screenshots turned out not
     to exist — a company with no file in the folder just never opens one. */
  const [previewing, setPreviewing] = useState(-1)
  const [missing, setMissing] = useState<string[]>([])
  const turn = useRef(0)
  /* Pointer or keyboard focus on the row: whoever is reading it decides when
     it moves on. */
  const held = useRef(false)
  const onScreen = useRef(true)

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
        setShown(current =>
          current.map((index, i) =>
            i === cell ? (index + CELLS) % COMPANIES.length : index,
          ),
        )
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

  const hold = () => {
    held.current = true
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
    if (canPreview()) setPreviewing(cell)
  }

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
            <div className="xp-usedby-cell" key={cell}>
              {/* A column only ever shows its own third of the list, so it only
                  has to be as wide as the widest of those three. Stacking them
                  here, hidden, sizes the column from the data instead of from a
                  number that would rot the moment the list changes — and since
                  this never changes, neither does the column. */}
              <div className="xp-usedby-sizer" aria-hidden="true">
                {COMPANIES.filter((_, i) => i % CELLS === cell).map(
                  candidate => (
                    <span className="xp-usedby-item" key={candidate.name}>
                      <Lockup company={candidate} />
                    </span>
                  ),
                )}
              </div>
              {previewing === cell && !missing.includes(company.name) && (
                <span className="xp-usedby-shot" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shotFor(company.src)}
                    alt=""
                    decoding="async"
                    onError={() =>
                      setMissing(names =>
                        names.includes(company.name)
                          ? names
                          : [...names, company.name],
                      )
                    }
                  />
                </span>
              )}
              <a
                className={`xp-usedby-item${torn ? ' xp-usedby-tear' : ''}`}
                href={company.href}
                target="_blank"
                rel="noreferrer"
                onPointerEnter={() => open(cell)}
                onFocus={() => open(cell)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="xp-usedby-mark"
                  src={company.src}
                  alt=""
                  style={
                    { '--mark-h': `${company.height}px` } as React.CSSProperties
                  }
                />
                <ScrambledName name={company.name} active={torn} />
              </a>
            </div>
          )
        })}
      </div>
    </section>
  )
}
