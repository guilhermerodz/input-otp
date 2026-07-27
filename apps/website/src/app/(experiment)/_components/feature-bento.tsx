'use client'

import * as React from 'react'

import { ProofCard } from './feature-proof-card'
import { registerSpotlights } from './spotlight'
import { useIsLive, usePrefersReducedMotion } from './use-live'

function OtpSlots({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`xp-fb-slots${compact ? ' xp-fb-slots--compact' : ''}`}
      aria-hidden="true"
    >
      {['4', '8', '2', '9', '1', '6'].map((digit, index) => (
        <span
          key={index}
          className="xp-fb-slot"
          style={{ '--i': index } as React.CSSProperties}
        >
          <span>{digit}</span>
        </span>
      ))}
    </div>
  )
}

function CardHeading({
  index,
  title,
  copy,
}: {
  index: string
  title: string
  copy: string
}) {
  return (
    <header className="xp-fb-card-heading">
      <span className="xp-fb-card-index">{index}</span>
      <div>
        <h3>{title}</h3>
        <p>{copy}</p>
      </div>
    </header>
  )
}

const STYLE_VARIANTS = [
  { label: 'keycaps', file: 'keycaps.tsx', type: 'keycaps' },
  { label: 'underline', file: 'underline.tsx', type: 'underline' },
  { label: 'grouped', file: 'grouped.tsx', type: 'grouped' },
  { label: 'masked', file: 'masked.tsx', type: 'masked' },
] as const

/** How long each style holds before the carousel moves on. */
const SLIDE_MS = 3200

function StyleCard() {
  const cardRef = React.useRef<HTMLElement>(null)
  const tabsRef = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState(0)
  const [nav, setNav] = React.useState<{ from: number; dir: 1 | -1 }>({
    from: -1,
    dir: 1,
  })
  const [held, setHeld] = React.useState(false)

  const live = useIsLive(cardRef)
  const reducedMotion = usePrefersReducedMotion()
  const running = live && !held && !reducedMotion

  const goTo = React.useCallback(
    (next: number, dir: 1 | -1) => {
      if (next === active) return
      setNav({ from: active, dir })
      setActive(next)
    },
    [active],
  )

  const advance = React.useCallback(() => {
    goTo((active + 1) % STYLE_VARIANTS.length, 1)
  }, [active, goTo])

  // A new slide always gets the full dwell back. Declared before the timer so
  // it runs first when `active` changes.
  const remainingRef = React.useRef(SLIDE_MS)
  React.useEffect(() => {
    remainingRef.current = SLIDE_MS
  }, [active])

  // Hovering or focusing the card freezes the countdown where it stands rather
  // than restarting it, so the progress bar and the timer never drift apart.
  React.useEffect(() => {
    if (!running) return

    const startedAt = performance.now()
    const id = window.setTimeout(advance, remainingRef.current)

    return () => {
      window.clearTimeout(id)
      remainingRef.current = Math.max(
        0,
        remainingRef.current - (performance.now() - startedAt),
      )
    }
  }, [running, active, advance])

  const onTabsKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!step) return

    event.preventDefault()
    const count = STYLE_VARIANTS.length
    const next = (active + step + count) % count
    goTo(next, step > 0 ? 1 : -1)
    tabsRef.current?.querySelectorAll('button')[next]?.focus()
  }

  // Slides rest on the side they will enter from, and the one being replaced
  // leaves on the opposite side — so wrapping past the last style still reads
  // as forward motion.
  const restPos = nav.dir > 0 ? 'next' : 'prev'
  const exitPos = nav.dir > 0 ? 'prev' : 'next'

  return (
    <article
      ref={cardRef}
      data-rv="card"
      className="xp-fb-card xp-fb-styles"
      data-running={running}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHeld(false)
        }
      }}
    >
      <CardHeading
        index="02"
        title="Bring your own styles"
        copy="The same component, four render props. Pick one, or let it cycle."
      />
      <div className="xp-fb-styles-viewport">
        {STYLE_VARIANTS.map((style, index) => (
          <div
            className="xp-fb-style-slide"
            key={style.file}
            id={`xp-fb-style-panel-${index}`}
            role="tabpanel"
            aria-labelledby={`xp-fb-style-tab-${index}`}
            aria-hidden={index !== active}
            data-pos={
              index === active
                ? 'current'
                : index === nav.from
                  ? exitPos
                  : restPos
            }
          >
            <div
              className={`xp-fb-style-demo xp-fb-style-demo--${style.type}`}
              aria-hidden="true"
            >
              {['8', '0', '', '', '', ''].map((digit, slot) => (
                <span key={slot}>
                  {style.type === 'masked' && digit ? '•' : digit}
                  {slot === 2 && <i />}
                </span>
              ))}
            </div>
            <code>{style.file}</code>
          </div>
        ))}
      </div>
      <div
        ref={tabsRef}
        className="xp-fb-carousel-progress"
        role="tablist"
        aria-label="OTP input styles"
        onKeyDown={onTabsKeyDown}
      >
        {STYLE_VARIANTS.map((style, index) => (
          <button
            key={style.file}
            type="button"
            role="tab"
            id={`xp-fb-style-tab-${index}`}
            aria-controls={`xp-fb-style-panel-${index}`}
            aria-selected={index === active}
            tabIndex={index === active ? 0 : -1}
            className="xp-fb-carousel-step"
            onClick={() => goTo(index, index > active ? 1 : -1)}
          >
            <span className="xp-fb-carousel-step__name">{style.label}</span>
            <span className="xp-fb-carousel-step__track">
              <span className="xp-fb-carousel-step__fill" />
            </span>
          </button>
        ))}
      </div>
    </article>
  )
}

function PasswordCard() {
  return (
    <article data-rv="card" className="xp-fb-card xp-fb-password">
      <CardHeading
        index="03"
        title="Friendly to password managers"
        copy="Detect the injected badge, make 40px of clipped room, and keep it clear of the final slot."
      />
      <div className="xp-fb-password-stage" aria-hidden="true">
        <div className="xp-fb-password-window">
          <div className="xp-fb-password-input">
            <OtpSlots compact />
            {/* The clipped strip stays visible so the badge has somewhere to
                land — otherwise the mechanism reads as the badge vanishing. */}
            <span className="xp-fb-password-mask" />
            <span className="xp-fb-password-badge">◆</span>
          </div>
        </div>
        <div className="xp-fb-measure xp-fb-measure--base">
          <span>visual input</span>
        </div>
        <div className="xp-fb-measure xp-fb-measure--extra">
          <span>+40px</span>
        </div>
      </div>
      {/* One declaration per line: at four columns these wrapped mid-token. */}
      <code className="xp-fb-mechanism-code">
        <span>width: calc(100% + 40px)</span>
        <span>clip-path: inset(0 40px 0 0)</span>
      </code>
    </article>
  )
}

function PatternCard() {
  return (
    <article data-rv="card" className="xp-fb-card xp-fb-pattern">
      <CardHeading
        index="04"
        title="Pattern validation"
        copy="Import the library’s regex and pass it directly to the real input."
      />
      <div
        className="xp-fb-diff"
        role="group"
        aria-label="Code example using REGEXP_ONLY_DIGITS"
      >
        <div>
          <i>+</i>
          <code>
            import {'{'} REGEXP_ONLY_DIGITS {'}'} from &apos;input-otp&apos;
          </code>
        </div>
        <div className="xp-fb-diff-quiet">
          <i> </i>
          <code>&lt;OTPInput</code>
        </div>
        <div>
          <i>+</i>
          <code>
            {'  '}pattern={'{'}REGEXP_ONLY_DIGITS{'}'}
          </code>
        </div>
        <div className="xp-fb-diff-quiet">
          <i> </i>
          <code>
            {'  '}maxLength={'{'}6{'}'} /&gt;
          </code>
        </div>
      </div>
      <div className="xp-fb-validation-stage" aria-hidden="true">
        <span className="xp-fb-validation-label">next character</span>
        <div className="xp-fb-character-gate">
          <span className="xp-fb-character xp-fb-character--bad">A</span>
          <span className="xp-fb-character xp-fb-character--good">7</span>
          <span className="xp-fb-gate-line" />
        </div>
        <span className="xp-fb-validation-result">
          <i>✓</i> /^\d+$/
        </span>
      </div>
    </article>
  )
}

function TinyCard() {
  return (
    <article data-rv="card" className="xp-fb-card xp-fb-tiny">
      <CardHeading
        index="05"
        title="Tiny and dependency-free"
        copy="Measured from the published input-otp@1.4.2 package."
      />
      <div className="xp-fb-weight-stage" aria-hidden="true">
        <div className="xp-fb-package-cube">
          <span>otp</span>
        </div>
        <div className="xp-fb-scale-arm">
          <span />
        </div>
        <div className="xp-fb-weight-readout">
          <strong>
            3.98 <small>kB</small>
          </strong>
          <span>gzipped ESM</span>
        </div>
      </div>
      <dl className="xp-fb-package-facts">
        <div>
          <dt>9.8 kB</dt>
          <dd>minified ESM</dd>
        </div>
        <div>
          <dt>0</dt>
          <dd>runtime dependencies</dd>
        </div>
      </dl>
    </article>
  )
}

export function FeatureBento() {
  const sectionRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const cards = Array.from(
      section.querySelectorAll<HTMLElement>('.xp-fb-card'),
    )
    const setDocumentState = () => {
      cards.forEach(card => {
        card.classList.toggle('xp-fb-is-document-hidden', document.hidden)
      })
    }
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          entry.target.classList.toggle(
            'xp-fb-is-paused',
            !entry.isIntersecting,
          )
        })
      },
      { threshold: 0.08 },
    )

    cards.forEach(card => observer.observe(card))
    document.addEventListener('visibilitychange', setDocumentState)
    setDocumentState()

    /* The cursor rim on every card, from the same list the pause observer
       walks. The reach is wider here than on the hero controls: these are big
       boxes tiled tight, and the light should arrive with the cursor rather
       than only once it is over a card. */
    const unspot = registerSpotlights(cards, { reach: 260, spread: 380 })

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', setDocumentState)
      unspot()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="xp-fb"
      aria-labelledby="xp-features-title"
      data-rv-group
    >
      <div className="xp-fb-intro">
        <div>
          <span className="xp-fb-path" data-rv="eyebrow">
            ~/features
          </span>
          <h2 id="xp-features-title" data-rv="title">
            Small API.
            <br />
            Unusually capable.
          </h2>
        </div>
        <div className="xp-fb-intro-side">
          <p data-rv="lede">
            What a single native input can do when the visible slots only
            mirror its state.
          </p>
        </div>
      </div>

      <div className="xp-fb-grid" data-rv-group>
        <ProofCard />
        <StyleCard />
        <PasswordCard />
        <PatternCard />
        <TinyCard />
      </div>
    </section>
  )
}
