import * as React from 'react'

import { cn } from '@/lib/utils'
import { slugify } from './prose'

const PLATFORM_STYLES: Record<string, string> = {
  iOS: 'border-sky-500/30 bg-sky-500/[0.07] text-sky-300/90',
  Firefox: 'border-orange-500/30 bg-orange-500/[0.07] text-orange-300/90',
  WebKit: 'border-sky-500/30 bg-sky-500/[0.07] text-sky-300/90',
  Chromium: 'border-violet-500/30 bg-violet-500/[0.07] text-violet-300/90',
  Extensions: 'border-emerald-500/30 bg-emerald-500/[0.07] text-emerald-300/90',
  'No JS': 'border-amber-500/30 bg-amber-500/[0.07] text-amber-300/90',
}

/**
 * One entry in the edge-case catalogue: what you see, why it happens, what the
 * library does about it. The rigid shape is deliberate — these are meant to be
 * scanned and compared, not read start to finish.
 */
export function EdgeCase({
  title,
  platforms,
  symptom,
  cause,
  fix,
  children,
}: {
  title: string
  /** Where the quirk lives. `'All'` is implicit and renders no badge. */
  platforms: string[]
  symptom: React.ReactNode
  cause: React.ReactNode
  fix: React.ReactNode
  /** Code block(s) illustrating the fix. */
  children?: React.ReactNode
}) {
  return (
    <section className="mt-10 scroll-mt-24" id={slugify(title)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <span className="flex flex-wrap gap-1.5">
          {platforms
            .filter(platform => platform !== 'All')
            .map(platform => (
              <span
                key={platform}
                className={cn(
                  'rounded border px-1.5 py-px text-[0.625rem] font-medium uppercase tracking-wide',
                  PLATFORM_STYLES[platform] ??
                    'border-border/70 text-muted-foreground',
                )}
              >
                {platform}
              </span>
            ))}
        </span>
      </div>

      <dl className="mt-3 space-y-2.5 border-l border-border/60 pl-4 text-[0.9375rem] leading-7">
        <Field label="Symptom">{symptom}</Field>
        <Field label="Cause">{cause}</Field>
        <Field label="Fix">{fix}</Field>
      </dl>

      {children}
    </section>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-x-3 sm:grid-cols-[minmax(0,4.5rem)_minmax(0,1fr)]">
      <dt className="pt-[0.2em] text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">
        {label}
      </dt>
      <dd className="text-muted-foreground [&>strong]:font-medium [&>strong]:text-foreground">
        {children}
      </dd>
    </div>
  )
}
