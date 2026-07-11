'use client'

import * as React from 'react'
import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp'
import { cn } from '@/lib/utils'

type Snapshot = {
  start: number | null
  end: number | null
  focused: boolean
}

/**
 * A real OTPInput wired to a live readout of the single hidden
 * <input> element behind it — value, selection range, focus.
 */
export function XRay({ className }: { className?: string }) {
  const [value, setValue] = React.useState('12')
  const [snap, setSnap] = React.useState<Snapshot>({
    start: null,
    end: null,
    focused: false,
  })

  return (
    <div className={cn('w-full', className)}>
      <OTPInput
        maxLength={6}
        value={value}
        onChange={setValue}
        pattern={REGEXP_ONLY_DIGITS}
        aria-label="Demo one-time password input with live internals readout"
        containerClassName="group flex items-center gap-1.5"
        render={({ slots, isFocused }) => (
          <>
            <Probe slots={slots} isFocused={isFocused} onSnapshot={setSnap} />
            {slots.map((slot, idx) => (
              <div
                key={idx}
                className={cn(
                  'keycap relative flex h-12 w-9 items-center justify-center rounded-md text-lg font-medium tabular-nums',
                  'transition-[box-shadow,border-color] duration-200 ease-out',
                  'group-hover:border-foreground/25',
                  slot.isActive &&
                    '!border-foreground/80 shadow-[0_0_0_1px_hsl(var(--foreground)/0.8)]',
                )}
              >
                {slot.char ?? (slot.hasFakeCaret ? <FakeCaret /> : null)}
              </div>
            ))}
          </>
        )}
      />

      <div
        aria-hidden
        className="mt-5 w-fit min-w-[17rem] rounded-lg border border-border bg-muted/40 px-4 py-3.5 font-mono text-xs leading-[1.9] text-muted-foreground"
      >
        <div>
          {'<input'}{' '}
          <span className="text-foreground">
            value=&quot;{value}
            <span className="text-muted-foreground">
              {'·'.repeat(6 - value.length)}
            </span>
            &quot;
          </span>
        </div>
        <div className="pl-[3ch]">
          selection=
          <span className="text-foreground">
            {snap.start === null ? 'null' : `[${snap.start}, ${snap.end}]`}
          </span>{' '}
          focused=
          <span
            className={cn(
              snap.focused
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-foreground',
            )}
          >
            {String(snap.focused)}
          </span>
        </div>
        <div className="pl-[3ch]">
          autocomplete=&quot;one-time-code&quot; {'/>'}
        </div>
      </div>
    </div>
  )
}

/** Reports slot state up without side effects during render. */
function Probe({
  slots,
  isFocused,
  onSnapshot,
}: {
  slots: { isActive: boolean }[]
  isFocused: boolean
  onSnapshot: (snap: Snapshot) => void
}) {
  const first = slots.findIndex(s => s.isActive)
  const last =
    slots.length - 1 - [...slots].reverse().findIndex(s => s.isActive)
  const start = first === -1 ? null : first
  const end = first === -1 ? null : last + 1

  React.useEffect(() => {
    onSnapshot({ start, end, focused: isFocused })
  }, [start, end, isFocused, onSnapshot])

  return null
}

function FakeCaret() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center motion-safe:animate-caret-blink">
      <div className="h-5 w-px bg-foreground" />
    </div>
  )
}
