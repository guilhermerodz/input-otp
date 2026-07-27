import * as React from 'react'

export interface PropRow {
  name: string
  type: string
  default?: string
  required?: boolean
  description: React.ReactNode
}

/**
 * The API reference table. One row per prop: signature on the left, prose on the
 * right. Collapses to stacked cards on small screens rather than scrolling
 * sideways, because the type column is the widest thing in the docs.
 */
export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-border/70">
      <dl className="divide-y divide-border/70">
        {rows.map(row => (
          <div
            key={row.name}
            className="grid gap-x-8 gap-y-2 px-4 py-4 sm:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] sm:px-5"
          >
            <dt className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <code className="font-mono text-[0.8125rem] font-medium text-foreground">
                  {row.name}
                </code>
                {row.required && (
                  <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1 py-px text-[0.625rem] font-medium uppercase tracking-wide text-amber-400/90">
                    required
                  </span>
                )}
              </div>
              <p className="mt-1.5 break-words font-mono text-[0.75rem] leading-5 text-muted-foreground/80">
                {row.type}
              </p>
              {row.default !== undefined && (
                <p className="mt-1 font-mono text-[0.75rem] leading-5 text-muted-foreground/60">
                  = {row.default}
                </p>
              )}
            </dt>
            <dd className="min-w-0 text-[0.875rem] leading-6 text-muted-foreground [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-foreground">
              {row.description}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** Same shape, for data-attribute reference sections. */
export function AttributesTable({
  rows,
}: {
  rows: { name: string; on: string; description: React.ReactNode }[]
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-border/70">
      <dl className="divide-y divide-border/70">
        {rows.map(row => (
          <div
            key={row.name}
            className="grid gap-x-8 gap-y-2 px-4 py-4 sm:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] sm:px-5"
          >
            <dt className="min-w-0">
              <code className="break-words font-mono text-[0.8125rem] font-medium text-foreground">
                {row.name}
              </code>
              <p className="mt-1.5 text-[0.75rem] leading-5 text-muted-foreground/70">
                on {row.on}
              </p>
            </dt>
            <dd className="min-w-0 text-[0.875rem] leading-6 text-muted-foreground [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-foreground">
              {row.description}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
