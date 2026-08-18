'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { docsVersions, versionForPathname } from '../_lib/versions'
import { hrefInVersion } from '../_lib/nav'

/**
 * The docs version switcher. A native <select> under a styled chip: keyboard
 * support, screen-reader semantics and mobile pickers come free, and the
 * visible part stays a small bordered label that matches the header.
 *
 * Switching navigates to the same page in the target version, falling back
 * to that version's root when the page has no counterpart there.
 */
export function VersionSelector() {
  const pathname = usePathname()
  const router = useRouter()
  const current = versionForPathname(pathname)

  if (docsVersions.length < 2) {
    return (
      <span className="inline-flex h-6 items-center rounded-md border border-border/70 px-2 font-mono text-[0.6875rem] font-medium text-muted-foreground">
        {current.label}
      </span>
    )
  }

  return (
    <label className="relative inline-flex h-6 cursor-pointer items-center gap-1 rounded-md border border-border/70 pl-2 pr-1.5 font-mono text-[0.6875rem] font-medium text-muted-foreground transition-colors duration-150 hover:border-border hover:text-foreground">
      <span aria-hidden>{current.label}</span>
      <svg
        aria-hidden
        viewBox="0 0 8 8"
        className="h-2 w-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      >
        <path d="M1.5 3l2.5 2.5L6.5 3" />
      </svg>
      <select
        aria-label="Documentation version"
        value={current.id}
        onChange={event => {
          const target = docsVersions.find(
            version => version.id === event.target.value,
          )
          if (target && target.id !== current.id) {
            router.push(hrefInVersion(pathname, target))
          }
        }}
        className="absolute inset-0 cursor-pointer appearance-none opacity-0"
      >
        {docsVersions.map(version => (
          <option key={version.id} value={version.id}>
            {version.label}
            {version.status === 'latest' ? ' (latest)' : ''}
          </option>
        ))}
      </select>
    </label>
  )
}
