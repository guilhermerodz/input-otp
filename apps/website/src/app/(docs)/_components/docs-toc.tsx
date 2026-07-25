'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

interface TocEntry {
  id: string
  text: string
  level: 2 | 3
}

/**
 * "On this page" rail. The headings are read out of the rendered article rather
 * than declared per page, so a page can never ship a table of contents that
 * disagrees with its own content.
 */
export function DocsToc() {
  const [entries, setEntries] = React.useState<TocEntry[]>([])
  const [activeId, setActiveId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const article = document.getElementById('docs-article')
    if (!article) return

    const headings = Array.from(
      article.querySelectorAll<HTMLElement>('h2[id], h3[id]'),
    )
    setEntries(
      headings.map(el => ({
        id: el.id,
        // The trailing "#" anchor link is part of the heading; drop it.
        text: (el.textContent ?? '').replace(/#$/, '').trim(),
        level: el.tagName === 'H2' ? 2 : 3,
      })),
    )

    if (headings.length === 0) return

    // Highlight the last heading whose top edge has passed the reading line.
    const readingLine = () => window.innerHeight * 0.25

    const sync = () => {
      const line = readingLine()
      let current: string | null = headings[0].id
      for (const el of headings) {
        if (el.getBoundingClientRect().top <= line) {
          current = el.id
        } else {
          break
        }
      }

      // At the very bottom of the page the last section may never cross the
      // line — claim it so the rail doesn't get stuck one entry short.
      const atBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 2
      if (atBottom) {
        current = headings[headings.length - 1].id
      }

      setActiveId(current)
    }

    sync()
    window.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      window.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  if (entries.length < 2) {
    return null
  }

  return (
    <nav aria-labelledby="toc-heading" className="text-sm">
      <p
        id="toc-heading"
        className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70"
      >
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-border/60">
        {entries.map(entry => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={cn(
                '-ml-px block border-l py-1 text-[0.8125rem] leading-5 transition-colors duration-150',
                entry.level === 2 ? 'pl-4' : 'pl-7',
                activeId === entry.id
                  ? 'border-foreground/70 text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
