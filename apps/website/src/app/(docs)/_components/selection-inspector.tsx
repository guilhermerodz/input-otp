'use client'

import * as React from 'react'
import { OTPInput } from 'input-otp'

import { cn } from '@/lib/utils'
import { FakeCaret } from '@/components/ui/otp-slot'

const MAX_LENGTH = 6

interface Reading {
  value: string
  start: number | null
  end: number | null
  direction: string | null
  mss: string | null
  mse: string | null
  focused: boolean
}

/**
 * A live window into the state machine. Type, arrow around, select, cut, paste —
 * the readout underneath is the input's actual selection after `input-otp` has
 * normalised it, plus the mirrored values it hands to your render function.
 */
export function SelectionInspector() {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [value, setValue] = React.useState('1234')
  const [reading, setReading] = React.useState<Reading | null>(null)

  React.useEffect(() => {
    const read = () => {
      const input = inputRef.current
      if (!input) return
      setReading({
        value: input.value,
        start: input.selectionStart,
        end: input.selectionEnd,
        direction: input.selectionDirection,
        // The library publishes its mirrored selection as data attributes, so
        // CSS (and this panel) can read it without touching React.
        mss: input.getAttribute('data-input-otp-mss'),
        mse: input.getAttribute('data-input-otp-mse'),
        focused: document.activeElement === input,
      })
    }

    read()
    // Non-capturing, so this runs *after* the library's capture-phase listener
    // has already rewritten the range — we report the normalised result.
    document.addEventListener('selectionchange', read)
    document.addEventListener('focusin', read)
    document.addEventListener('focusout', read)
    return () => {
      document.removeEventListener('selectionchange', read)
      document.removeEventListener('focusin', read)
      document.removeEventListener('focusout', read)
    }
  }, [])

  const mode = describeMode(reading)

  return (
    <div className="flex w-full flex-col items-center gap-7">
      <OTPInput
        ref={inputRef}
        maxLength={MAX_LENGTH}
        value={value}
        onChange={next => {
          setValue(next)
          // Deletions and pastes settle a tick after the change event.
          setTimeout(
            () => document.dispatchEvent(new Event('selectionchange')),
            0,
          )
        }}
        containerClassName="group flex items-center"
        render={({ slots }) => (
          <div className="flex">
            {slots.map((slot, idx) => (
              <div
                key={idx}
                className={cn(
                  'relative flex h-14 w-12 flex-col items-center justify-center',
                  'border-y border-r border-border bg-background/40 text-[1.375rem] font-medium tabular-nums text-foreground',
                  'first:rounded-l-md first:border-l last:rounded-r-md',
                  'outline outline-0 outline-foreground/80 transition-all duration-200',
                  slot.isActive && 'z-10 outline-2',
                )}
              >
                {slot.char}
                {slot.hasFakeCaret && <FakeCaret />}
                <span
                  aria-hidden
                  className="absolute bottom-0.5 font-mono text-[0.5625rem] leading-none text-muted-foreground/40"
                >
                  {idx}
                </span>
              </div>
            ))}
          </div>
        )}
      />

      <div className="w-full max-w-lg overflow-hidden rounded-lg border border-border/70 bg-background/60">
        <dl className="divide-y divide-border/60 font-mono text-xs">
          <Row label="value">
            {reading?.value ? `"${reading.value}"` : '""'}
          </Row>
          <Row label="selectionStart / End">
            {reading?.focused
              ? `${fmt(reading.start)} → ${fmt(reading.end)}`
              : '— (blurred)'}
          </Row>
          <Row label="selectionDirection">
            {reading?.focused ? reading.direction ?? 'none' : '—'}
          </Row>
          <Row label="data-input-otp-mss / mse">
            {reading?.mss ?? '—'} / {reading?.mse ?? '—'}
          </Row>
          <Row label="branch">
            <span className={cn('rounded px-1.5 py-0.5', mode.className)}>
              {mode.label}
            </span>
          </Row>
        </dl>
      </div>

      <p className="max-w-lg text-center text-xs leading-6 text-muted-foreground">
        Notice that a bare caret never survives: whenever the value isn&apos;t
        full-and-at-the-end, the library widens the collapsed caret into a
        one-character range so exactly one slot can be “active”.
      </p>
    </div>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)] gap-4 px-4 py-2">
      <dt className="text-muted-foreground/70">{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  )
}

function fmt(n: number | null) {
  return n === null ? 'null' : String(n)
}

function describeMode(reading: Reading | null) {
  if (!reading || !reading.focused) {
    return {
      label: 'blurred — no active slot',
      className: 'bg-muted/60 text-muted-foreground',
    }
  }
  const { start, end, value } = reading
  if (start === null || end === null) {
    return {
      label: 'no selection',
      className: 'bg-muted/60 text-muted-foreground',
    }
  }
  if (value.length === 0) {
    return {
      label: 'empty — caret parked at slot 0',
      className: 'bg-sky-500/15 text-sky-300',
    }
  }
  if (start === end && start === value.length && value.length < MAX_LENGTH) {
    return {
      label: 'insert mode — appending at the end',
      className: 'bg-emerald-500/15 text-emerald-300',
    }
  }
  if (end - start === 1) {
    return {
      label: `overwrite mode — slot ${start} selected`,
      className: 'bg-amber-500/15 text-amber-300',
    }
  }
  if (end > start) {
    return {
      label: `multi-slot range — slots ${start}…${end - 1}`,
      className: 'bg-violet-500/15 text-violet-300',
    }
  }
  return {
    label: 'collapsed caret',
    className: 'bg-muted/60 text-muted-foreground',
  }
}
