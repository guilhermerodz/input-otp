'use client'

import * as React from 'react'
import type { SlotProps } from 'input-otp'

import { cn } from '@/lib/utils'

/**
 * The slot: one visible cell of the field.
 *
 * `input-otp` never renders this — it hands you `char`, `placeholderChar`,
 * `isActive` and `hasFakeCaret` and gets out of the way. Everything below is
 * plain markup you own.
 */
export function Slot({
  char,
  placeholderChar,
  isActive,
  hasFakeCaret,
  className,
}: SlotProps & { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-14 w-12 items-center justify-center',
        'text-[1.375rem] font-medium tabular-nums text-foreground',
        'border-y border-r border-foreground/[0.18] bg-foreground/[0.02]',
        'first:rounded-l-md first:border-l last:rounded-r-md',
        'transition-all duration-200',
        // The group-* hooks come from `containerClassName="group …"`.
        'group-hover:border-foreground/30 group-focus-within:border-foreground/30',
        'outline outline-0 outline-offset-0 outline-foreground/20',
        isActive && 'z-10 outline-2 outline-foreground/80',
        className,
      )}
    >
      {/* Placeholder characters are dimmed via a data attribute the library
          sets on the real input while the value is empty — no JS needed. */}
      <div className="group-has-[input[data-input-otp-placeholder-shown]]:text-muted-foreground/40">
        {char ?? placeholderChar}
      </div>

      {hasFakeCaret && <FakeCaret />}
    </div>
  )
}

/** The blinking bar. The real caret is transparent, so we draw our own. */
export function FakeCaret() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="h-7 w-px bg-foreground motion-safe:animate-caret-blink" />
    </div>
  )
}

/** Stripe-style dash between two groups of slots. */
export function FakeDash() {
  return (
    <div aria-hidden className="flex w-10 items-center justify-center">
      <div className="h-1 w-3 rounded-full bg-border" />
    </div>
  )
}

export function SlotGroup({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('flex', className)}>{children}</div>
}
