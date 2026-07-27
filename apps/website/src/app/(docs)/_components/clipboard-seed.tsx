'use client'

import * as React from 'react'

/**
 * Puts a sample code on the clipboard so a reader can actually try a paste
 * behaviour without leaving the page. Docs furniture, not part of any example.
 */
export function ClipboardSeed({ value }: { value: string }) {
  const [state, setState] = React.useState<'idle' | 'copied' | 'blocked'>(
    'idle',
  )

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setState('copied')
        } catch {
          // Clipboard writes need a secure context and user permission.
          setState('blocked')
        }
        setTimeout(() => setState('idle'), 2400)
      }}
      className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground"
    >
      {state === 'copied' && `Copied “${value}” — now paste it above`}
      {state === 'blocked' && `Copy “${value}” by hand`}
      {state === 'idle' && `Copy “${value}” to the clipboard`}
    </button>
  )
}
