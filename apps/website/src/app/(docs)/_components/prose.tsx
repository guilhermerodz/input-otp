import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

/**
 * Docs typography primitives. Every page is written with these instead of raw
 * tags so headings get their anchor ids (and hover links) for free and the
 * vertical rhythm stays identical across pages.
 */

/** Turns "Selection is mirrored, not owned" into "selection-is-mirrored-not-owned". */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function headingText(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(headingText).join('')
  if (React.isValidElement(children)) {
    return headingText(
      (children.props as { children?: React.ReactNode }).children,
    )
  }
  return ''
}

function AnchorLink({ id }: { id: string }) {
  return (
    <a
      href={`#${id}`}
      aria-label="Link to this section"
      className="ml-2 align-middle text-muted-foreground/50 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100"
    >
      #
    </a>
  )
}

export function H2({
  children,
  id: providedId,
}: {
  children: React.ReactNode
  id?: string
}) {
  const id = providedId ?? slugify(headingText(children))
  return (
    <h2
      id={id}
      className="group mt-16 scroll-mt-24 border-t border-border/50 pt-8 text-xl font-semibold tracking-tight text-foreground first:mt-0 first:border-0 first:pt-0"
    >
      {children}
      <AnchorLink id={id} />
    </h2>
  )
}

export function H3({
  children,
  id: providedId,
}: {
  children: React.ReactNode
  id?: string
}) {
  const id = providedId ?? slugify(headingText(children))
  return (
    <h3
      id={id}
      className="group mt-10 scroll-mt-24 text-base font-semibold tracking-tight text-foreground"
    >
      {children}
      <AnchorLink id={id} />
    </h3>
  )
}

export function H4({ children }: { children: React.ReactNode }) {
  const id = slugify(headingText(children))
  return (
    <h4
      id={id}
      className="mt-8 scroll-mt-24 text-sm font-semibold tracking-tight text-foreground"
    >
      {children}
    </h4>
  )
}

export function P({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        'mt-4 text-[0.9375rem] leading-7 text-muted-foreground [&>strong]:font-medium [&>strong]:text-foreground',
        className,
      )}
    >
      {children}
    </p>
  )
}

/** The one-sentence summary that sits under a page's H1. */
export function Lede({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-balance text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
      {children}
    </p>
  )
}

export function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mt-4 space-y-2.5 text-[0.9375rem] leading-7 text-muted-foreground">
      {children}
    </ul>
  )
}

export function Ol({ children }: { children: React.ReactNode }) {
  return (
    <ol className="mt-4 list-inside list-decimal space-y-2.5 text-[0.9375rem] leading-7 text-muted-foreground marker:text-muted-foreground/60">
      {children}
    </ol>
  )
}

export function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="relative pl-5 before:absolute before:left-0 before:top-[0.8em] before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground/50 [&>strong]:font-medium [&>strong]:text-foreground">
      {children}
    </li>
  )
}

/** Inline code. Deliberately quiet — the docs are full of it. */
export function C({ children }: { children: React.ReactNode }) {
  return (
    <code className="whitespace-nowrap rounded border border-border/60 bg-muted/50 px-[0.35em] py-[0.15em] font-mono text-[0.85em] text-foreground">
      {children}
    </code>
  )
}

export function A({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const isExternal = href.startsWith('http')
  const className =
    'font-medium text-foreground underline decoration-border decoration-1 underline-offset-4 transition-colors duration-150 hover:decoration-foreground'

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

/** A keyboard key, for the keybinding tables. */
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-[1.4em] min-w-[1.4em] items-center justify-center rounded border border-border bg-gradient-to-b from-muted/70 to-muted px-[0.4em] font-mono text-[0.8em] font-medium text-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.06)]">
      {children}
    </kbd>
  )
}

const CALLOUT_STYLES = {
  note: {
    box: 'border-border/70 bg-muted/25',
    label: 'text-muted-foreground',
  },
  tip: {
    box: 'border-emerald-500/25 bg-emerald-500/[0.06]',
    label: 'text-emerald-400/90',
  },
  warning: {
    box: 'border-amber-500/25 bg-amber-500/[0.06]',
    label: 'text-amber-400/90',
  },
} as const

export function Callout({
  type = 'note',
  title,
  children,
}: {
  type?: keyof typeof CALLOUT_STYLES
  title?: string
  children: React.ReactNode
}) {
  const styles = CALLOUT_STYLES[type]
  return (
    <aside
      className={cn(
        'mt-6 rounded-lg border px-4 py-3.5 text-[0.9375rem] leading-7 text-muted-foreground',
        '[&>p]:mt-0 [&>p+p]:mt-3 [&>ul]:mt-2',
        styles.box,
      )}
    >
      {title && (
        <p
          className={cn(
            'mb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]',
            styles.label,
          )}
        >
          {title}
        </p>
      )}
      {children}
    </aside>
  )
}

/** Small caps section label, used above grids of cards. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
      {children}
    </p>
  )
}

export function Steps({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 [counter-reset:step]">
      <div className="ml-4 border-l border-border/70 pl-8">{children}</div>
    </div>
  )
}

export function Step({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="relative pb-10 last:pb-0 [counter-increment:step]">
      <span
        aria-hidden
        className="absolute -left-[3.05rem] top-0 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-xs font-medium text-muted-foreground before:content-[counter(step)]"
      />
      <h3
        id={slugify(title)}
        className="scroll-mt-24 text-base font-semibold tracking-tight text-foreground"
      >
        {title}
      </h3>
      {children}
    </div>
  )
}
