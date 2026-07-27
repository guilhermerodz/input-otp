'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { docsNav } from '../_lib/nav'

export function DocsSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Docs" className="text-sm">
      {docsNav.map(section => (
        <div key={section.title} className="pb-6">
          <p className="mb-2 px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
            {section.title}
          </p>
          <ul className="space-y-px">
            {section.pages.map(page => {
              const isActive = pathname === page.href
              return (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    onClick={onNavigate}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'block rounded-md px-3 py-1.5 text-[0.8125rem] leading-6 transition-colors duration-150',
                      isActive
                        ? 'bg-foreground/[0.07] font-medium text-foreground'
                        : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground',
                    )}
                  >
                    {page.label ?? page.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export function DocsMobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  // Close the drawer whenever the route changes.
  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-md border border-border/70 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M2 4h12M2 8h12M2 12h8" />
        </svg>
        Docs menu
      </button>

      {/* Portalled to <body>: this button lives inside the sticky header, whose
          `backdrop-filter` makes it the containing block for fixed-position
          descendants — a drawer rendered in place would be trapped in its 56px. */}
      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-x-0 bottom-0 top-14 z-[60] overflow-y-auto border-t border-border/60 bg-background px-4 py-6"
            role="dialog"
            aria-label="Docs navigation"
          >
            <DocsSidebarNav onNavigate={() => setOpen(false)} />
          </div>,
          document.body,
        )}
    </div>
  )
}
