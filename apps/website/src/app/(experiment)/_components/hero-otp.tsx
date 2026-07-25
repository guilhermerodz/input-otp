'use client'

import * as React from 'react'
import {
  OTPInput,
  REGEXP_ONLY_DIGITS_AND_CHARS,
  type SlotProps,
} from 'input-otp'

const CORRECT = '123456'

/* Which physical key each chip in the tour stands for. ⌘ and Ctrl are the
   same chip on different platforms, so they share a token. */
const KEY_TOKEN: Record<string, string> = {
  '⌘': 'mod',
  Ctrl: 'mod',
  Shift: 'shift',
  '←': 'left',
}

const tokenFor = (label: string) => KEY_TOKEN[label] ?? label.toLowerCase()

type Presses = {
  /* Keys held down right now. */
  down: string[]
  /* Press counter per key — bumping it replays that chip's pulse. */
  pulse: Record<string, number>
}

const PressContext = React.createContext<Presses>({ down: [], pulse: {} })

/**
 * Mirrors the keys the tour names while the reader presses them.
 *
 * Modifiers come from the event flags rather than their own keydown, which
 * keeps them honest when a chord starts before the page had focus. The
 * plain keys get a release timer as well: a ⌘X hands the keyup to whatever
 * took the focus, and a chip must never be left looking held down.
 */
function usePresses(enabled: boolean, isMac: boolean): Presses {
  const [down, setDown] = React.useState<string[]>([])
  const [pulse, setPulse] = React.useState<Record<string, number>>({})
  const heldRef = React.useRef<Set<string>>(new Set())
  const timers = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  React.useEffect(() => {
    if (!enabled) return

    const release = (token: string) => {
      clearTimeout(timers.current[token])
      if (!heldRef.current.delete(token)) return
      setDown(Array.from(heldRef.current))
    }

    const press = (token: string, failsafe: number) => {
      if (failsafe) {
        clearTimeout(timers.current[token])
        timers.current[token] = setTimeout(() => release(token), failsafe)
      }
      // Auto-repeat keeps firing keydown; only the first one is a press.
      if (heldRef.current.has(token)) return
      heldRef.current.add(token)
      setDown(Array.from(heldRef.current))
      setPulse(p => ({ ...p, [token]: (p[token] ?? 0) + 1 }))
    }

    const plainKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') return 'left'
      return /^[a-z]$/i.test(e.key) ? e.key.toLowerCase() : null
    }

    // No failsafe on the modifiers: holding Shift down while walking the
    // selection left is the point of the last step. The flags on the next
    // event are what let them go.
    const syncMods = (e: KeyboardEvent) => {
      const held = (token: string, isHeld: boolean) =>
        isHeld ? press(token, 0) : release(token)
      held('mod', isMac ? e.metaKey : e.ctrlKey)
      held('shift', e.shiftKey)
    }

    const onDown = (e: KeyboardEvent) => {
      syncMods(e)
      const token = plainKey(e)
      if (token) press(token, 700)
    }
    const onUp = (e: KeyboardEvent) => {
      syncMods(e)
      const token = plainKey(e)
      if (token) release(token)
    }
    // Nothing can be held once the window is gone — and a chord that ends
    // in ⌘Tab would otherwise leave both chips stuck.
    const onBlur = () => {
      Object.values(timers.current).forEach(clearTimeout)
      heldRef.current.clear()
      setDown([])
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', onBlur)
      onBlur()
    }
  }, [enabled, isMac])

  return { down, pulse }
}

/* JetBrains Mono carries no ⌘ or ←, so both fall back to whatever symbol
   font the OS has — where they come out shorter than the capitals beside
   them and sit off the cap band. Drawn here instead, each viewBox cropped
   to its own ink so the glyph is exactly cap height on every platform. */
function Glyph({ name }: { name: 'mod' | 'left' }) {
  const shared = {
    className: 'xp-kbd-glyph',
    role: 'img' as const,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  return name === 'mod' ? (
    <svg {...shared} viewBox="1.7 1.7 20.6 20.6" aria-label="Command">
      <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
    </svg>
  ) : (
    <svg {...shared} viewBox="3.7 3.7 16.6 16.6" aria-label="Left arrow">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  )
}

function Kbd({ children }: { children: string }) {
  const { down, pulse } = React.useContext(PressContext)
  const token = tokenFor(children)
  const nonce = pulse[token]
  return (
    <span className="xp-kbd-wrap">
      {/* Behind the chip and keyed on the press count: every press starts
          its own ring instead of riding the last one's animation. */}
      {nonce ? <span key={nonce} className="xp-kbd-pulse" aria-hidden /> : null}
      <kbd
        className={`xp-kbd ${children.length > 1 ? 'xp-kbd--wide' : ''} ${
          down.includes(token) ? 'xp-kbd--down' : ''
        }`}
      >
        {children === '⌘' ? (
          <Glyph name="mod" />
        ) : children === '←' ? (
          <Glyph name="left" />
        ) : (
          children
        )}
      </kbd>
    </span>
  )
}

/* How much of the cursor light each slot's rim returns. The hero's
   background field lights the row from the sides, so the outer slots are
   already the bright ones and the middle pair sits in the trough — the
   spotlight has to follow that falloff or the two lights disagree. */
const SPOT_GAIN = [1, 0.6, 0.34, 0.34, 0.6, 1]
/* How far the pointer can be from the input before the rims go dark. */
const SPOT_REACH = 560

function Slot(
  props: SlotProps & {
    error: boolean
    success: boolean
    staticActive: boolean
    /* The ghost hand is resting in this slot. Draws the same caret the real
       input would, so the suggestion reads as someone typing rather than as
       digits appearing on their own. */
    ghostCaret: boolean
    gain: number
    slotRef: (el: HTMLDivElement | null) => void
  },
) {
  return (
    <div
      ref={props.slotRef}
      style={{ '--xp-lit': props.gain } as React.CSSProperties}
      className={`xp-slot ${props.staticActive ? 'xp-slot--active' : ''} ${
        props.error ? 'xp-slot--error' : ''
      } ${props.success ? 'xp-slot--success' : ''}`}
    >
      {props.char !== null && (
        // Keyed on the char so every new digit replays the slide-in
        // (after Luxe UI's input-otp).
        <div key={props.char} className="xp-char-in">
          {props.char}
        </div>
      )}
      {(props.hasFakeCaret || props.ghostCaret) && <div className="xp-caret" />}
    </div>
  )
}

/* Reports which slots are active, without setting state during render. */
function ActiveProbe({
  slots,
  onChange,
}: {
  slots: { isActive: boolean }[]
  onChange: (idxs: number[]) => void
}) {
  const key = slots.map(s => (s.isActive ? '1' : '0')).join('')
  React.useEffect(() => {
    onChange(slots.flatMap((s, i) => (s.isActive ? [i] : [])))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return null
}

/* The success line, one span per letter, so it nods along with the input's
   own success bounce instead of just sitting there. Spaces stay plain text
   nodes: they keep the sentence wrappable, and only the letters carry the
   animation, each one a beat behind the last. */
function BouncingLine({ text }: { text: string }) {
  let letter = 0
  return (
    <>
      {Array.from(text).map((ch, idx) =>
        ch === ' ' ? (
          ' '
        ) : (
          <span
            key={idx}
            className="xp-win-letter"
            style={{ '--i': letter++ } as React.CSSProperties}
          >
            {ch}
          </span>
        ),
      )}
    </>
  )
}

type Ring = {
  x: number
  y: number
  w: number
  h: number
  radius: string
  visible: boolean
  /* True when the ring just appeared from hidden: position snaps into
     place and only the opacity fades — the glide is for moves between
     slots, not for arrival. */
  snap: boolean
}

type Mode = 'play' | 'success' | 'tutorial'

/* How long a satisfied step stays put before it starts to leave, and how
   long it takes to go. The fade matches xp-fade-text-out in the CSS. */
const STEP_HOLD = 700
const STEP_FADE = 550

export function HeroOtp() {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const slotRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const hintTimers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  /* Set when the suggestion has finished and the caret is owed to the
     reader; cleared by whoever hands it over or gives up on it. */
  const handOff = React.useRef(false)
  const [value, setValue] = React.useState('')
  const [mode, setMode] = React.useState<Mode>('play')
  const [step, setStep] = React.useState(0)
  // The step on screen trails the step the reader is on — see the hold
  // below. `leaving` is the stretch where the old one is fading out.
  const [shown, setShown] = React.useState(0)
  const [leaving, setLeaving] = React.useState(false)
  const [error, setError] = React.useState(false)
  // Locked from mount: the input cannot be focused or edited until the
  // hint hands the caret over — nothing shows as active before the
  // user's turn.
  const [locked, setLocked] = React.useState(true)
  const [active, setActive] = React.useState<number[]>([])
  /**
   * Where the ghost hand is, while the suggestion types itself.
   *
   * The input is disabled for that stretch, so input-otp reports no active
   * slot and the real ring has nothing to sit on — which is why the ring
   * used to appear on the third slot out of nowhere. This stands in for the
   * caret only when the input has none of its own, so a stale value can
   * never fight the real selection: whenever the field is focused, `active`
   * wins.
   */
  const [ghost, setGhost] = React.useState<number | null>(null)
  const [isMobile, setIsMobile] = React.useState(false)
  const [isMac, setIsMac] = React.useState(true)
  const [ring, setRing] = React.useState<Ring>({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    radius: '16px',
    visible: false,
    snap: true,
  })
  const valueRef = React.useRef(value)
  valueRef.current = value
  const activeRef = React.useRef(active)
  activeRef.current = active
  const stepRef = React.useRef(step)
  stepRef.current = step
  const ghostRef = React.useRef(ghost)
  ghostRef.current = ghost

  React.useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches)
    setIsMac(/Mac/i.test(navigator.platform))
  }, [])

  /* The focus ring is one element gliding between slots (Luxe's shared
     indicator), measured off the real slot boxes so it survives the
     mobile size change.

     A single active slot is the ring's home. With none — the field is
     blurred or disabled — the ghost takes over if it is holding a slot,
     which is what carries the ring through the self-typing suggestion and
     the error shake. A multi-slot selection has no single home, so the ring
     steps aside and the slots show the selection themselves. */
  const ringSlot = () => {
    const current = activeRef.current
    if (current.length === 1) return current[0]
    if (current.length === 0) return ghostRef.current
    return null
  }

  const measureRing = React.useCallback(() => {
    const idx = ringSlot()
    const el = idx === null ? null : slotRefs.current[idx]
    const wrap = wrapRef.current
    if (el && wrap) {
      const a = el.getBoundingClientRect()
      const b = wrap.getBoundingClientRect()
      setRing(prev => ({
        x: a.left - b.left,
        y: a.top - b.top,
        w: a.width,
        h: a.height,
        radius: getComputedStyle(el).borderRadius,
        visible: true,
        snap: !prev.visible,
      }))
    } else {
      setRing(r => ({ ...r, visible: false }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useLayoutEffect(measureRing, [active, ghost, measureRing])

  React.useEffect(() => {
    window.addEventListener('resize', measureRing)
    return () => window.removeEventListener('resize', measureRing)
  }, [measureRing])

  /* Cursor spotlight (hero only): feed each slot the pointer position in
     its own box, and fade the whole effect by how near the pointer is to
     the input. No enter/leave events — the distance falloff is the fade,
     so the light dies off smoothly wherever the cursor wanders. */
  React.useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let px = 0
    let py = 0

    const paint = () => {
      frame = 0
      // Read every rect first, then write — one reflow per frame, not six.
      const els = slotRefs.current.filter(Boolean) as HTMLDivElement[]
      const rects = els.map(el => el.getBoundingClientRect())
      const box = wrap.getBoundingClientRect()
      const dx = Math.max(box.left - px, 0, px - box.right)
      const dy = Math.max(box.top - py, 0, py - box.bottom)
      const near = Math.max(0, 1 - Math.hypot(dx, dy) / SPOT_REACH)
      wrap.style.setProperty('--xp-spot', String(near * near))
      els.forEach((el, i) => {
        el.style.setProperty('--xp-mx', `${px - rects[i].left}px`)
        el.style.setProperty('--xp-my', `${py - rects[i].top}px`)
      })
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint)
    }
    const onMove = (e: PointerEvent) => {
      px = e.clientX
      py = e.clientY
      schedule()
    }
    const onLeave = () => {
      wrap.style.setProperty('--xp-spot', '0')
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    // Scrolling and resizing move the slots under a stationary cursor.
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const clearHint = () => {
    hintTimers.current.forEach(clearTimeout)
    hintTimers.current = []
    handOff.current = false
  }

  const at = (ms: number, fn: () => void) =>
    hintTimers.current.push(setTimeout(fn, ms))

  /**
   * Whether the field is still worth handing the keyboard to.
   *
   * The hint lands about 1.7s after the intro clears, which is long enough
   * for someone to have started reading further down the page. Focusing an
   * input that has scrolled away pulls the whole page back up to it — and
   * because the page scrolls smoothly, it does so as a long glide that
   * reads like the site fighting you. It also hands the keyboard to a
   * field the reader can no longer see, and on a phone opens the keyboard
   * for it. Mostly-visible is the bar: a field peeking in at the edge is
   * not one you want to start typing into.
   */
  const fieldOnScreen = () => {
    const box = wrapRef.current?.getBoundingClientRect()
    if (!box || box.height === 0) return false
    // Named for the measurement, not the step counter `shown` above it.
    const visible =
      Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0)
    return visible >= box.height * 0.6
  }

  // Suggest the right code: type 1, then 2 at a human pace, then unlock
  // and hand the caret over on the third slot. The input is disabled
  // while the ghost is typing so nobody can fight it for the keyboard.
  //
  // The ghost caret takes each slot *before* its digit lands and moves on as
  // it appears, which is the order a real hand does it in — sit in the slot,
  // press the key, carry on to the next. It also means the ring is already
  // on screen and travelling by the time it reaches the third slot, instead
  // of blinking into existence there once focus arrives.
  const runHint = (delay: number) => {
    at(delay, () => {
      setLocked(true)
      setValue('')
      setGhost(0)
    })
    at(delay + 300, () => {
      setValue('1')
      setGhost(1)
    })
    at(delay + 620, () => {
      setValue('12')
      setGhost(2)
    })
    at(delay + 940, () => {
      handOff.current = true
      setLocked(false)
    })
  }

  /**
   * Hands the caret over, once the input is genuinely able to take it.
   *
   * `focus()` on a disabled input is a no-op, so unlocking and focusing has
   * to straddle a commit — as two timers 40ms apart it worked only as long
   * as nothing delayed them into the same task, and a throttled tab does
   * exactly that. Waiting for the render that clears `disabled` makes the
   * ordering a fact rather than a hope.
   */
  React.useLayoutEffect(() => {
    if (locked || !handOff.current) return
    handOff.current = false
    // preventScroll even when it is on screen: it may be only just inside
    // the fold, and centring itself would still move the page under
    // someone who never asked for the caret.
    if (fieldOnScreen()) {
      inputRef.current?.focus({ preventScroll: true })
    }
    // The ghost stays on the third slot through a successful hand-off:
    // focus lands there too, but `active` only catches up an effect later,
    // and dropping the ghost here would blink the ring off for that frame.
    // A hand-off that did not happen is the opposite — nothing owns the
    // caret, so nothing should be drawing one.
    if (document.activeElement !== inputRef.current) setGhost(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked])

  // On load, once the intro curtain is gone, the hint plays by itself.
  React.useEffect(() => {
    const begin = () => {
      if (valueRef.current !== '') return
      runHint(900)
    }
    const w = window as unknown as { __xpIntroDone?: boolean }
    if (w.__xpIntroDone) {
      begin()
    } else {
      window.addEventListener('xp:intro-done', begin, { once: true })
    }
    // Failsafe: never leave the input locked if the intro signal is lost.
    const failsafe = setTimeout(() => setLocked(false), 10000)
    return () => {
      window.removeEventListener('xp:intro-done', begin)
      clearTimeout(failsafe)
      clearHint()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Wrong code: shake it off, then replay the suggestion.
   *
   * Locked for the whole recovery, not just the shake. A full field puts the
   * selection on the last slot, so every further keypress overwrites that
   * one digit — input-otp behaving exactly as it should, but it kept the
   * value at six characters and each of those keystrokes cancelled the
   * pending hint, which left the field stranded in the red state with no
   * replay coming. Swallowing the spam is what makes the recovery reliable.
   *
   * The ghost holds the last slot meanwhile: disabling a focused input
   * blurs it, and without a stand-in the ring would snap away just as the
   * shake starts.
   */
  const failThenHint = () => {
    setError(true)
    setLocked(true)
    setGhost(5)
    at(450, () => {
      setError(false)
      setValue('')
      setGhost(null)
    })
    runHint(850)
  }

  // Correct code: green vertical bounce, then hand the stage to the tour
  // and disarm the input — from here on nothing is right or wrong.
  const succeed = () => {
    setMode('success')
    at(1300, () => setMode('tutorial'))
  }

  /* ————— The tour ————— */

  const modK = isMac ? '⌘' : 'Ctrl'

  const steps: React.ReactNode[] = isMobile
    ? [
        <>long-press the code and tap Select All</>,
        <>tap Cut — the whole code lifts out</>,
        <>long-press and Paste it back</>,
        <>drag the handles around part of it, then cut or paste just that</>,
      ]
    : [
        <>
          press <Kbd>{modK}</Kbd>
          <Kbd>A</Kbd> to select every slot
        </>,
        <>
          cut it all — <Kbd>{modK}</Kbd>
          <Kbd>X</Kbd>
        </>,
        <>
          bring it back — <Kbd>{modK}</Kbd>
          <Kbd>V</Kbd>
        </>,
        <>
          hold <Kbd>Shift</Kbd>
          <Kbd>←</Kbd> — the selection grows slot by slot
        </>,
        <>
          now cut or paste just that slice — <Kbd>{modK}</Kbd>
          <Kbd>X</Kbd> / <Kbd>{modK}</Kbd>
          <Kbd>V</Kbd>
        </>,
      ]
  const cutStep = 1
  const pasteStep = 2
  const sliceStep = isMobile ? 3 : 4
  const finished = shown >= steps.length

  // Selection-driven steps advance when the user actually does the thing.
  React.useEffect(() => {
    if (mode !== 'tutorial') return
    if (step === 0 && active.length === 6) {
      setStep(1)
    } else if (
      !isMobile &&
      step === 3 &&
      active.length >= 2 &&
      active.length < 6
    ) {
      setStep(4)
    }
  }, [active, mode, step, isMobile])

  /* The label does not swap the instant the reader gets a step right —
     that reads as the instruction being taken away rather than as having
     done it. The satisfied line holds where it is for a beat, then fades
     out slowly, and only then does the next one fade in. */
  React.useEffect(() => {
    // A step landing mid-fade doesn't restart the hold: the line is already
    // on its way out, and it lands on whatever step is current when it goes.
    if (leaving || step === shown) return
    const t = setTimeout(() => setLeaving(true), STEP_HOLD)
    return () => clearTimeout(t)
  }, [step, shown, leaving])

  React.useEffect(() => {
    if (!leaving) return
    const t = setTimeout(() => {
      setShown(stepRef.current)
      setLeaving(false)
    }, STEP_FADE)
    return () => clearTimeout(t)
  }, [leaving])

  const onClip = (kind: 'cut' | 'copy' | 'paste') => {
    if (mode !== 'tutorial') return
    if (step === cutStep && kind === 'cut') {
      setStep(pasteStep)
    } else if (step === pasteStep && kind === 'paste') {
      setStep(pasteStep + 1)
    } else if (
      step === sliceStep &&
      (kind === 'cut' || kind === 'paste') &&
      // Any multi-slot selection completes the tour. Holding Shift+← all
      // the way grows the selection to all six slots — that must count
      // too, or the tour dead-ends on the final cut.
      activeRef.current.length >= 2
    ) {
      setStep(steps.length)
    }
  }

  const success = mode === 'success'
  const multi = active.length > 1
  /* Same rule the ring follows: the ghost only draws a caret while the input
     has no selection of its own, so the real one and the stand-in can never
     both be on screen. */
  const ghostAt = active.length === 0 ? ghost : null
  // Only the desktop tour shows key chips to light up.
  const presses = usePresses(mode === 'tutorial' && !isMobile, isMac)

  return (
    <>
      <div
        ref={wrapRef}
        style={{ position: 'relative' }}
        onCutCapture={() => onClip('cut')}
        onCopyCapture={() => onClip('copy')}
        onPasteCapture={() => onClip('paste')}
      >
        <OTPInput
          ref={inputRef}
          value={value}
          disabled={locked}
          onChange={v => {
            // A real keystroke or paste takes over from any pending hint.
            // The field is focused to have produced this, so `active` is
            // driving the ring and letting the ghost go is free.
            if (mode === 'play') {
              clearHint()
              setLocked(false)
              setError(false)
              setGhost(null)
            }
            setValue(v)
          }}
          onComplete={(v: string) => {
            if (mode !== 'play') return
            clearHint()
            if (v === CORRECT) {
              succeed()
            } else {
              failThenHint()
            }
          }}
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          inputMode="text"
          autoComplete="one-time-code"
          containerClassName={`xp-otp-container xp-otp-spot ${
            error ? 'xp-otp-shake' : ''
          } ${success ? 'xp-otp-bounce' : ''}`}
          render={({ slots }) => (
            <>
              <ActiveProbe slots={slots} onChange={setActive} />
              <div style={{ display: 'flex', gap: 10 }}>
                {slots.slice(0, 3).map((slot, idx) => (
                  <Slot
                    key={idx}
                    {...slot}
                    error={error}
                    success={success}
                    staticActive={slot.isActive && multi}
                    ghostCaret={ghostAt === idx}
                    gain={SPOT_GAIN[idx]}
                    slotRef={el => {
                      slotRefs.current[idx] = el
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 24, color: '#3f3f46' }}>·</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {slots.slice(3).map((slot, idx) => (
                  <Slot
                    key={idx}
                    {...slot}
                    error={error}
                    success={success}
                    staticActive={slot.isActive && multi}
                    ghostCaret={ghostAt === idx + 3}
                    gain={SPOT_GAIN[idx + 3]}
                    slotRef={el => {
                      slotRefs.current[idx + 3] = el
                    }}
                  />
                ))}
              </div>
            </>
          )}
        />

        {/* The gliding focus ring */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: ring.w,
            height: ring.h,
            borderRadius: ring.radius,
            transform: `translate(${ring.x}px, ${ring.y}px)`,
            boxShadow: `0 0 0 2px ${
              error ? '#ef4444' : success ? '#34d399' : '#fafafa'
            }`,
            opacity: ring.visible ? 1 : 0,
            transition: ring.snap
              ? 'opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease'
              : 'transform 0.13s ease-in-out, opacity 0.12s ease, box-shadow 0.2s ease',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Status line: error nudge → success → guided tour, all on fades */}
      <div
        style={{
          minHeight: 36,
          display: 'grid',
          placeItems: 'center',
          fontSize: 14,
          textAlign: 'center',
          padding: '4px 16px 0',
        }}
      >
        {mode === 'play' && error && (
          <div key="err" className="xp-fade-text" style={{ color: '#f87171' }}>
            nope. it starts with 1 2 …
          </div>
        )}
        {mode === 'success' && (
          <div key="ok" className="xp-fade-text" style={{ color: '#34d399' }}>
            <BouncingLine text="✓ 123456 — you guessed it! let's play" />
          </div>
        )}
        {mode === 'tutorial' && !finished && (
          <div
            key={`step-${shown}`}
            className={`xp-fade-text ${leaving ? 'xp-fade-text--out' : ''}`}
            style={{ color: '#a1a1aa' }}
          >
            <PressContext.Provider value={presses}>
              {steps[shown]}
            </PressContext.Provider>
          </div>
        )}
        {mode === 'tutorial' && finished && (
          <div key="fin" className="xp-fade-text" style={{ color: '#a1a1aa' }}>
            that&apos;s input-otp!{' '}
            <a
              href="#how"
              style={{
                color: '#fafafa',
                textDecoration: 'underline',
                textUnderlineOffset: 4,
              }}
            >
              I want to see how it works
            </a>
          </div>
        )}
      </div>
    </>
  )
}
