'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { CopyButton } from '@/components/copy-button'

const MANAGERS = {
  pnpm: 'pnpm add input-otp',
  npm: 'npm install input-otp',
  yarn: 'yarn add input-otp',
  bun: 'bun add input-otp',
} as const

type Manager = keyof typeof MANAGERS

export function InstallTabs() {
  const [manager, setManager] = React.useState<Manager>('pnpm')
  const command = MANAGERS[manager]

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-border/70 bg-[#101012]">
      <div
        role="tablist"
        aria-label="Package manager"
        className="flex items-center gap-1 border-b border-border/70 px-2"
      >
        {(Object.keys(MANAGERS) as Manager[]).map(key => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={manager === key}
            onClick={() => setManager(key)}
            className={cn(
              'relative px-2.5 py-2 font-mono text-xs transition-colors duration-150',
              manager === key
                ? 'text-foreground after:absolute after:inset-x-2.5 after:-bottom-px after:h-px after:bg-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <code className="overflow-x-auto font-mono text-[0.8125rem] text-foreground">
          <span className="select-none text-muted-foreground/60">$ </span>
          {command}
        </code>
        <CopyButton value={command} />
      </div>
    </div>
  )
}
