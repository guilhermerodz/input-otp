'use client'

import * as React from 'react'
import Link from 'next/link'

import {
  OTPInput,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from 'input-otp'
import { cn } from '@/lib/utils'

function Showcase({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm text-gray-500">{title}</span>
      {children}
    </div>
  )
}

function SlotGroup({
  slots,
}: {
  slots: { char: string | null; isActive: boolean; hasFakeCaret: boolean }[]
}) {
  return (
    <div className="flex items-center">
      {slots.map((slot, idx) => (
        <div
          key={idx}
          className={cn(
            'relative flex h-12 w-10 items-center justify-center border-y border-r border-gray-300 text-lg font-medium transition-all first:rounded-l-lg first:border-l last:rounded-r-lg',
            slot.isActive && 'z-10 ring-2 ring-blue-500',
          )}
        >
          {slot.char}
          {slot.hasFakeCaret && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-5 w-px animate-pulse bg-black" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <div className="container relative flex-1 flex flex-col justify-center items-center gap-12 py-12">
      <h1 className="text-2xl font-bold">input-otp playground</h1>

      <Showcase title="Default (6 digits)">
        <OTPInput
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          render={({ slots }) => <SlotGroup slots={slots} />}
        />
      </Showcase>

      <Showcase title="Alphanumeric">
        <OTPInput
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          render={({ slots }) => <SlotGroup slots={slots} />}
        />
      </Showcase>

      <Showcase title="4 characters">
        <OTPInput
          maxLength={4}
          render={({ slots }) => <SlotGroup slots={slots} />}
        />
      </Showcase>

      <Showcase title="With separator (3+3)">
        <OTPInput
          maxLength={6}
          render={({ slots }) => (
            <div className="flex items-center gap-3">
              <SlotGroup slots={slots.slice(0, 3)} />
              <span className="text-2xl text-gray-400">-</span>
              <SlotGroup slots={slots.slice(3)} />
            </div>
          )}
        />
      </Showcase>

      <div className="border-t pt-8 text-sm text-gray-400">
        <Link href="/base" className="underline">
          Test pages
        </Link>
      </div>
    </div>
  )
}
