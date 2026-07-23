'use client'

import * as React from 'react'
import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp'
import type { SlotProps } from 'input-otp'
import { cn } from '@/lib/utils'

/**
 * Four functional OTP inputs, one component. The proof that
 * "unstyled" means every pixel belongs to your render prop.
 * The section header lives in the page; this is just the grid.
 */
export function StyleGallery({ className }: { className?: string }) {
  return (
    <div className={cn('w-full', className)}>
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-x-12 gap-y-14 sm:grid-cols-2">
          <GalleryItem label="keycaps.tsx">
            <KeycapsVariant />
          </GalleryItem>
          <GalleryItem label="underline.tsx">
            <UnderlineVariant />
          </GalleryItem>
          <GalleryItem label="grouped.tsx">
            <GroupedVariant />
          </GalleryItem>
          <GalleryItem label="masked.tsx">
            <MaskedVariant />
          </GalleryItem>
        </div>
      </div>
    </div>
  )
}

function GalleryItem({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex h-16 items-center">{children}</div>
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function useOtp(initial = '') {
  return React.useState(initial)
}

function FakeCaret({ className }: { className?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center motion-safe:animate-caret-blink">
      <div className={cn('h-5 w-px bg-foreground', className)} />
    </div>
  )
}

function KeycapsVariant() {
  const [value, setValue] = useOtp('4')
  return (
    <OTPInput
      maxLength={6}
      value={value}
      onChange={setValue}
      pattern={REGEXP_ONLY_DIGITS}
      aria-label="Keycap style demo input"
      containerClassName="group flex items-center"
      render={({ slots }) => (
        <div className="flex items-center gap-1.5">
          {slots.slice(0, 3).map((slot, idx) => (
            <KeycapCell key={idx} {...slot} />
          ))}
          <div className="mx-1 h-1 w-2.5 rounded-full bg-border" />
          {slots.slice(3).map((slot, idx) => (
            <KeycapCell key={idx} {...slot} />
          ))}
        </div>
      )}
    />
  )
}

function KeycapCell(props: SlotProps) {
  return (
    <div
      className={cn(
        'keycap relative flex h-12 w-9 items-center justify-center rounded-md text-lg font-medium tabular-nums',
        'transition-[box-shadow,border-color] duration-200 ease-out',
        props.isActive &&
          '!border-foreground/80 shadow-[0_0_0_1px_hsl(var(--foreground)/0.8)]',
      )}
    >
      {props.char}
      {props.hasFakeCaret && <FakeCaret />}
    </div>
  )
}

function UnderlineVariant() {
  const [value, setValue] = useOtp('80')
  return (
    <OTPInput
      maxLength={6}
      value={value}
      onChange={setValue}
      pattern={REGEXP_ONLY_DIGITS}
      aria-label="Underline style demo input"
      containerClassName="group flex items-center"
      render={({ slots }) => (
        <div className="flex items-center gap-2.5">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className={cn(
                'relative flex h-12 w-8 items-center justify-center border-b-2 border-border text-xl font-medium tabular-nums',
                'transition-colors duration-200 ease-out',
                slot.isActive && 'border-foreground',
              )}
            >
              {slot.char}
              {slot.hasFakeCaret && <FakeCaret />}
            </div>
          ))}
        </div>
      )}
    />
  )
}

function GroupedVariant() {
  const [value, setValue] = useOtp('19')
  return (
    <OTPInput
      maxLength={6}
      value={value}
      onChange={setValue}
      pattern={REGEXP_ONLY_DIGITS}
      aria-label="Grouped style demo input"
      containerClassName="group flex items-center"
      render={({ slots }) => (
        <div className="flex divide-x divide-border overflow-hidden rounded-xl border border-border shadow-sm">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className={cn(
                'relative flex h-12 w-10 items-center justify-center bg-muted/30 text-lg font-medium tabular-nums',
                'transition-colors duration-200 ease-out',
                slot.isActive && 'bg-muted',
              )}
            >
              {slot.char}
              {slot.hasFakeCaret && <FakeCaret />}
              {slot.isActive && (
                <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-foreground/70" />
              )}
            </div>
          ))}
        </div>
      )}
    />
  )
}

function MaskedVariant() {
  const [value, setValue] = useOtp('37')
  return (
    <OTPInput
      maxLength={4}
      value={value}
      onChange={setValue}
      pattern={REGEXP_ONLY_DIGITS}
      aria-label="Masked style demo input, four digits"
      containerClassName="group flex items-center"
      render={({ slots }) => (
        <div className="flex items-center gap-1.5">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className={cn(
                'keycap relative flex h-12 w-11 items-center justify-center rounded-md text-lg',
                'transition-[box-shadow,border-color] duration-200 ease-out',
                slot.isActive &&
                  '!border-foreground/80 shadow-[0_0_0_1px_hsl(var(--foreground)/0.8)]',
              )}
            >
              {slot.char !== null && (
                <div className="size-2.5 rounded-full bg-foreground" />
              )}
              {slot.hasFakeCaret && <FakeCaret />}
            </div>
          ))}
        </div>
      )}
    />
  )
}
