'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { AnatomyAssembly } from './assembly'
import { AnatomyIsometric } from './isometric'
import { AnatomyPeel } from './peel'

const VARIANTS = [
  {
    id: 'assembly',
    label: 'Assembly',
    blurb: 'Build the field one decision at a time',
    Component: AnatomyAssembly,
  },
  {
    id: 'isometric',
    label: 'Isometric',
    blurb: 'Tilt the three layers apart and look at the stack',
    Component: AnatomyIsometric,
  },
  {
    id: 'peel',
    label: 'X-ray',
    blurb: 'Undo the five hiding techniques one by one',
    Component: AnatomyPeel,
  },
] as const

type VariantId = (typeof VARIANTS)[number]['id']

/**
 * Three ways into the same mechanism. They are deliberately different in kind
 * rather than in degree — a walkthrough, a diagram and an instrument — because
 * the thing being explained is a stack, a sequence *and* a pile of CSS, and no
 * single view carries all three.
 *
 * Only the active variant is mounted, so the page never has more than one live
 * field competing for the caret.
 */
export function AnatomyStage() {
  const [variant, setVariant] = React.useState<VariantId>('assembly')
  const active = VARIANTS.find(v => v.id === variant)!

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pb-3">
        <div
          role="tablist"
          aria-label="Anatomy view"
          className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/30 p-0.5"
        >
          {VARIANTS.map(v => (
            <button
              key={v.id}
              role="tab"
              type="button"
              aria-selected={variant === v.id}
              onClick={() => setVariant(v.id)}
              className={cn(
                'rounded px-2.5 py-1 text-xs font-medium transition-colors duration-150',
                variant === v.id
                  ? 'bg-foreground/[0.09] text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <p className="text-[0.8125rem] text-muted-foreground/80">
          {active.blurb}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/70">
        <active.Component />
      </div>
    </div>
  )
}
