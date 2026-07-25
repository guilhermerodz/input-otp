'use client'

import * as React from 'react'
import {
  OTPInput,
  REGEXP_ONLY_DIGITS_AND_CHARS,
  type SlotProps,
} from 'input-otp'

const CORRECT = '123456'

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="xp-kbd">{children}</kbd>
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
      {props.hasFakeCaret && <div className="xp-caret" />}
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

export function HeroOtp() {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const slotRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const hintTimers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const [value, setValue] = React.useState('')
  const [mode, setMode] = React.useState<Mode>('play')
  const [step, setStep] = React.useState(0)
  const [error, setError] = React.useState(false)
  // Locked from mount: the input cannot be focused or edited until the
  // hint hands the caret over — nothing shows as active before the
  // user's turn.
  const [locked, setLocked] = React.useState(true)
  const [active, setActive] = React.useState<number[]>([])
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

  React.useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches)
    setIsMac(/Mac/i.test(navigator.platform))
  }, [])

  /* The focus ring is one element gliding between slots (Luxe's shared
     indicator), measured off the real slot boxes so it survives the
     mobile size change. */
  const measureRing = React.useCallback(() => {
    const current = activeRef.current
    if (current.length === 1) {
      const el = slotRefs.current[current[0]]
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
      }
    } else {
      setRing(r => ({ ...r, visible: false }))
    }
  }, [])

  React.useLayoutEffect(measureRing, [active, measureRing])

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
  }

  const at = (ms: number, fn: () => void) =>
    hintTimers.current.push(setTimeout(fn, ms))

  // Suggest the right code: type 1, then 2 at a human pace, then unlock
  // and hand the caret over on the third slot. The input is disabled
  // while the ghost is typing so nobody can fight it for the keyboard.
  const runHint = (delay: number) => {
    at(delay, () => {
      setLocked(true)
      setValue('1')
    })
    at(delay + 280, () => setValue('12'))
    at(delay + 760, () => setLocked(false))
    at(delay + 800, () => inputRef.current?.focus())
  }

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

  // Wrong code: shake it off, then replay the suggestion.
  const failThenHint = () => {
    setError(true)
    at(450, () => {
      setError(false)
      setValue('')
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
          hold <Kbd>Shift</Kbd> + <Kbd>←</Kbd> — the selection grows slot by
          slot
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
  const finished = step >= steps.length

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
            if (mode === 'play') {
              clearHint()
              setLocked(false)
              setError(false)
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
            not this one — psst, it starts with 1 2 …
          </div>
        )}
        {mode === 'success' && (
          <div key="ok" className="xp-fade-text" style={{ color: '#34d399' }}>
            ✓ 123456 — you&apos;re in
          </div>
        )}
        {mode === 'tutorial' && !finished && (
          <div
            key={`step-${step}`}
            className="xp-fade-text"
            style={{ color: '#a1a1aa' }}
          >
            {steps[step]}
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
