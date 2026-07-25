import * as React from 'react'

import { cn } from '@/lib/utils'
import { CopyButton } from '@/components/copy-button'
import { highlight } from '../_lib/highlight'

/**
 * A standalone, copyable code block. Highlighting happens on the server at
 * build time, so no syntax-highlighter ships to the browser.
 */
export async function CodeBlock({
  code,
  lang = 'tsx',
  title,
  className,
  copy = true,
}: {
  code: string
  lang?: string
  title?: string
  className?: string
  copy?: boolean
}) {
  const html = await highlight(code, lang)

  return (
    <div
      className={cn(
        'group/code relative mt-6 overflow-hidden rounded-lg border border-border/70 bg-[#101012]',
        className,
      )}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-2">
          <span className="font-mono text-xs text-muted-foreground">
            {title}
          </span>
        </div>
      )}

      <div className="docs-code" dangerouslySetInnerHTML={{ __html: html }} />

      {copy && (
        <div className="absolute right-3 top-2.5 opacity-0 transition-opacity duration-150 group-hover/code:opacity-100 focus-within:opacity-100">
          <CopyButton value={code} />
        </div>
      )}
    </div>
  )
}
