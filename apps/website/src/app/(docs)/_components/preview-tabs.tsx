'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { CopyButton } from '@/components/copy-button'

/**
 * Preview ⇄ Code switch. Both panes are rendered on the server; this component
 * only decides which one is visible, so the demo keeps its state when you flip
 * to the code and back.
 */
export function PreviewTabs({
  preview,
  code,
  rawCode,
  /** Renders the demo on a dot-grid stage instead of a flat surface. */
  align = 'center',
  contentClassName,
}: {
  preview: React.ReactNode
  code: React.ReactNode
  rawCode: string
  align?: 'center' | 'start'
  contentClassName?: string
}) {
  const [tab, setTab] = React.useState<'preview' | 'code'>('preview')

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4 pb-3">
        <div
          role="tablist"
          aria-label="Demo view"
          className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/30 p-0.5"
        >
          {(['preview', 'code'] as const).map(value => (
            <button
              key={value}
              role="tab"
              type="button"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={cn(
                'rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors duration-150',
                tab === value
                  ? 'bg-foreground/[0.09] text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {value}
            </button>
          ))}
        </div>

        <CopyButton value={rawCode} />
      </div>

      {/* Both panes stay mounted and are only hidden, so switching to the code
          and back doesn't reset whatever you typed into the demo. The `display`
          is set inline because a utility class would fight with `flex`. */}
      <div className="overflow-hidden rounded-lg border border-border/70">
        <div
          style={{ display: tab === 'preview' ? undefined : 'none' }}
          className={cn(
            // Tight horizontal padding on phones: six 48px slots plus a dash is
            // already 328px, and the stage should not need a scroll for that.
            'bg-dot-grid flex min-h-[13rem] flex-col gap-6 overflow-x-auto px-3 py-8 sm:p-10',
            align === 'center' ? 'items-center justify-center' : 'items-start',
            contentClassName,
          )}
        >
          {preview}
        </div>
        <div
          style={{ display: tab === 'code' ? undefined : 'none' }}
          className="docs-code bg-[#101012]"
        >
          {code}
        </div>
      </div>
    </div>
  )
}
