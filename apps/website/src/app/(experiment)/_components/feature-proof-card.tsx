'use client'

import * as React from 'react'

import { useIsLive, usePrefersReducedMotion } from './use-live'

const CODE = ['4', '8', '2', '9', '1', '6'] as const

const CUT_MENU = ['Select All', 'Cut', 'Copy'] as const
const PASTE_MENU = ['Paste'] as const

/**
 * One continuous story told on one phone that is never torn down: the code
 * arrives by SMS, gets selected and cut, and comes back off the clipboard.
 *
 * Every frame below is a complete description of the screen. Nothing here
 * says how to get from one frame to the next — that is a CSS transition on a
 * node that stays mounted the whole way through, which is what stops the
 * scene changes from flashing.
 */
type Frame = {
  ms: number
  scene: number
  keyboard: 'up' | 'down'
  banner?: boolean
  suggest?: 'code' | 'press'
  filled?: boolean
  fill?: 'stagger' | 'atonce'
  selected?: boolean
  cutting?: boolean
  caret?: boolean
  tap?: boolean
  menu?: { items: readonly string[]; press?: number }
  clip?: 'rising' | 'parked' | 'diving'
  /** The frame that stands for this scene when nothing is allowed to move. */
  poster?: boolean
}

const FRAMES: Frame[] = [
  // 1 — sms autofill
  { ms: 900, scene: 0, keyboard: 'up', caret: true },
  { ms: 1300, scene: 0, keyboard: 'up', caret: true, banner: true },
  {
    ms: 1200,
    scene: 0,
    keyboard: 'up',
    caret: true,
    banner: true,
    suggest: 'code',
  },
  {
    ms: 460,
    scene: 0,
    keyboard: 'up',
    caret: true,
    banner: true,
    suggest: 'press',
  },
  {
    ms: 1500,
    scene: 0,
    keyboard: 'up',
    filled: true,
    fill: 'stagger',
    suggest: 'code',
    poster: true,
  },

  // 2 — select & cut
  { ms: 1100, scene: 1, keyboard: 'up', filled: true, selected: true },
  {
    ms: 800,
    scene: 1,
    keyboard: 'up',
    filled: true,
    selected: true,
    menu: { items: CUT_MENU },
  },
  {
    ms: 520,
    scene: 1,
    keyboard: 'up',
    filled: true,
    selected: true,
    menu: { items: CUT_MENU, press: 1 },
    poster: true,
  },
  {
    ms: 900,
    scene: 1,
    keyboard: 'up',
    cutting: true,
    caret: true,
    clip: 'rising',
  },
  // The keyboard gets out of the way, the way it does when a field is done
  // with. It has to come back before anything can be pasted.
  { ms: 1300, scene: 1, keyboard: 'down', caret: true, clip: 'parked' },

  // 3 — paste
  {
    ms: 900,
    scene: 2,
    keyboard: 'down',
    caret: true,
    clip: 'parked',
    tap: true,
  },
  { ms: 800, scene: 2, keyboard: 'up', caret: true, clip: 'parked' },
  {
    ms: 900,
    scene: 2,
    keyboard: 'up',
    caret: true,
    clip: 'parked',
    menu: { items: PASTE_MENU },
  },
  {
    ms: 520,
    scene: 2,
    keyboard: 'up',
    caret: true,
    clip: 'parked',
    menu: { items: PASTE_MENU, press: 0 },
  },
  {
    ms: 1100,
    scene: 2,
    keyboard: 'up',
    filled: true,
    fill: 'atonce',
    clip: 'diving',
  },
  {
    ms: 1500,
    scene: 2,
    keyboard: 'up',
    filled: true,
    fill: 'atonce',
    poster: true,
  },
]

/**
 * Scene and claim are the same three things, so they are one list. The rival
 * column is one representative implementation rather than a list of names:
 * separate inputs per digit is what the rest of the category renders, and it
 * is why each of these rows goes the way it does.
 */
const SCENES = [
  {
    label: 'SMS autofill',
    detail: 'autocomplete="one-time-code"',
    ours: 'native',
    theirs: 'first box only',
  },
  {
    label: 'Select and cut',
    detail: 'one selection model',
    ours: 'one range',
    theirs: 'per box',
  },
  {
    label: 'Paste the whole code',
    detail: 'one paste event',
    ours: 'one event',
    theirs: 'hand-rolled',
  },
] as const

/** First frame of each scene, and the one that stands for it when still. */
const SCENE_START = SCENES.map((_, index) =>
  FRAMES.findIndex(frame => frame.scene === index),
)
const SCENE_POSTER = SCENES.map(
  (_, index) =>
    FRAMES.findIndex(frame => frame.scene === index && frame.poster) ??
    SCENE_START[index],
)
/** How long a scene runs — its row's timer bar is set from this. */
const SCENE_MS = SCENES.map((_, index) =>
  FRAMES.reduce(
    (sum, frame) => (frame.scene === index ? sum + frame.ms : sum),
    0,
  ),
)

/**
 * Mounted once for the life of the card. A scene change only ever moves these
 * attributes, so the phone animates between states instead of being replaced.
 */
function Phone({ frame }: { frame: Frame }) {
  return (
    <div className="pc-phone" aria-hidden="true">
      <div className="pc-phone__screen">
        <div className="pc-banner" data-in={frame.banner || undefined}>
          <span className="pc-banner__icon" />
          <span className="pc-banner__body">
            <b>Messages</b>
            <span>482916 is your verification code</span>
          </span>
        </div>

        <div className="pc-phone__head">
          <b>Verify it&apos;s you</b>
          <span>Code sent to ••• 4417</span>
        </div>

        <div className="pc-phone__field">
          <span className="pc-clip" data-phase={frame.clip}>
            482916 <small>clipboard</small>
          </span>

          {/* The touch equivalent of ⌘A / ⌘X / ⌘V. One of its items is always
              the thing that happens on the next frame. */}
          <span className="pc-menu" data-in={frame.menu ? true : undefined}>
            {(frame.menu?.items ?? CUT_MENU).map((item, index) => (
              <b
                key={item}
                data-press={frame.menu?.press === index || undefined}
              >
                {item}
              </b>
            ))}
          </span>

          <div
            className="pc-field"
            data-filled={frame.filled || undefined}
            data-fill={frame.fill}
            data-selected={frame.selected || undefined}
            data-cutting={frame.cutting || undefined}
            data-caret={frame.caret || undefined}
            data-tap={frame.tap || undefined}
          >
            {CODE.map((digit, index) => (
              <span
                key={index}
                className="pc-slot"
                style={{ '--i': index } as React.CSSProperties}
              >
                <span className="pc-slot__digit">{digit}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="pc-keyboard" data-state={frame.keyboard}>
          <div className="pc-suggestions">
            <span />
            <span className="pc-suggestions__code" data-state={frame.suggest}>
              <b>482916</b>
            </span>
            <span />
          </div>
          <div className="pc-keyrows">
            {[10, 9, 7].map((count, row) => (
              <div key={row}>
                {Array.from({ length: count }, (_, key) => (
                  <i key={key} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProofCard() {
  const cardRef = React.useRef<HTMLElement>(null)
  const tabsRef = React.useRef<HTMLDivElement>(null)
  const [index, setIndex] = React.useState(0)
  const [held, setHeld] = React.useState(false)

  const live = useIsLive(cardRef)
  const reducedMotion = usePrefersReducedMotion()
  const running = live && !held && !reducedMotion

  // A new frame gets its full dwell. Declared before the timer so it runs
  // first when the frame changes.
  const remainingRef = React.useRef(FRAMES[0].ms)
  React.useEffect(() => {
    remainingRef.current = FRAMES[index].ms
  }, [index])

  // Hovering or focusing freezes the countdown where it stands rather than
  // restarting it, so the row's timer never drifts from the scene.
  React.useEffect(() => {
    if (!running) return

    const startedAt = performance.now()
    const id = window.setTimeout(
      () => setIndex(current => (current + 1) % FRAMES.length),
      remainingRef.current,
    )

    return () => {
      window.clearTimeout(id)
      remainingRef.current = Math.max(
        0,
        remainingRef.current - (performance.now() - startedAt),
      )
    }
  }, [running, index])

  const scene = FRAMES[index].scene
  // Reduced motion holds each scene on the frame that shows its outcome.
  const frame = reducedMotion ? FRAMES[SCENE_POSTER[scene]] : FRAMES[index]

  const goToScene = (next: number) => setIndex(SCENE_START[next])

  const onTabsKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? -1
          : 0
    if (!step) return

    event.preventDefault()
    const next = (scene + step + SCENES.length) % SCENES.length
    goToScene(next)
    tabsRef.current?.querySelectorAll('button')[next]?.focus()
  }

  return (
    <article
      ref={cardRef}
      data-rv="card"
      className="xp-fb-card xp-fb-comparison pc"
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
      <header className="xp-fb-card-heading">
        <span className="xp-fb-card-index">01</span>
        <div>
          <h3>One real input. Native wins.</h3>
          <p>
            The slots are visual. The browser, keyboard and assistive tech still
            meet a single HTML input.
          </p>
        </div>
      </header>

      <div className="pc-body">
        <div
          className="pc-stage"
          id="pc-scene-panel"
          role="tabpanel"
          aria-labelledby={`pc-scene-tab-${scene}`}
        >
          <Phone frame={frame} />
        </div>

        {/* The comparison is also the transport: each row plays its own claim
            and carries the timer for it. */}
        <div
          ref={tabsRef}
          className="pc-verdicts"
          role="tablist"
          aria-orientation="vertical"
          aria-label="Native behaviors, compared with other OTP inputs"
          onKeyDown={onTabsKeyDown}
        >
          <div className="pc-verdicts__head" aria-hidden="true">
            <span>Native behavior</span>
            <span>input-otp</span>
            <span>other inputs</span>
          </div>

          {SCENES.map((claim, i) => (
            <button
              key={claim.label}
              type="button"
              role="tab"
              id={`pc-scene-tab-${i}`}
              aria-controls="pc-scene-panel"
              aria-selected={i === scene}
              tabIndex={i === scene ? 0 : -1}
              className="pc-verdict"
              style={
                { '--pc-scene-ms': `${SCENE_MS[i]}ms` } as React.CSSProperties
              }
              aria-label={`${claim.label}. input-otp: ${claim.ours}. Other inputs: ${claim.theirs}.`}
              onClick={() => goToScene(i)}
            >
              <span className="pc-verdict__claim" aria-hidden="true">
                <strong>{claim.label}</strong>
                <small>{claim.detail}</small>
              </span>
              <span
                className="pc-verdict__mark pc-verdict__mark--yes"
                aria-hidden="true"
              >
                <i>✓</i>
                {claim.ours}
              </span>
              <span
                className="pc-verdict__mark pc-verdict__mark--no"
                aria-hidden="true"
              >
                <i>✕</i>
                {claim.theirs}
              </span>
              <span className="pc-verdict__track" aria-hidden="true">
                <span className="pc-verdict__fill" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </article>
  )
}
