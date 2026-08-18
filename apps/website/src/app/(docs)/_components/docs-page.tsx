import * as React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'

import { getDocsPage, getDocsPager, hrefInVersion } from '../_lib/nav'
import { latestDocsVersion, versionForPathname } from '../_lib/versions'
import { DocsToc } from './docs-toc'
import { Lede } from './prose'

/**
 * Builds a page's <head> from the same nav entry that titles it. Frozen
 * snapshot pages are kept out of search results and point their canonical
 * at the latest equivalent, so old-version pages never outrank current ones.
 */
export function docsMetadata(href: string): Metadata {
  const page = getDocsPage(href)
  if (!page) return {}
  const metadata: Metadata = {
    title: page.title,
    description: page.description,
    openGraph: { title: page.title, description: page.description },
  }
  if (versionForPathname(href).status === 'frozen') {
    metadata.robots = { index: false }
    metadata.alternates = {
      canonical: hrefInVersion(href, latestDocsVersion),
    }
  }
  return metadata
}

/** Shown at the top of every frozen snapshot page. */
function FrozenVersionBanner({ href }: { href: string }) {
  const version = versionForPathname(href)
  if (version.status !== 'frozen') return null

  return (
    <div className="mb-8 flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-lg border border-border/70 bg-foreground/[0.03] px-4 py-3 text-[0.8125rem] leading-6 text-muted-foreground">
      <span>
        These docs are for <strong>input-otp {version.label}</strong>. The
        latest line is {latestDocsVersion.label} —
      </span>
      <Link
        href={hrefInVersion(href, latestDocsVersion)}
        className="font-medium text-foreground underline decoration-foreground/30 underline-offset-2 transition-colors duration-150 hover:decoration-foreground"
      >
        view this page in the current docs
      </Link>
    </div>
  )
}

function Pager({ href }: { href: string }) {
  const { prev, next } = getDocsPager(href)
  if (!prev && !next) return null

  return (
    <nav
      aria-label="Pagination"
      className="mt-20 grid gap-3 border-t border-border/50 pt-8 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="group rounded-lg border border-border/70 px-4 py-3 transition-colors duration-150 hover:border-border hover:bg-foreground/[0.02]"
        >
          <span className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/70">
            Previous
          </span>
          <span className="mt-0.5 block text-sm font-medium text-foreground">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          href={next.href}
          className="group rounded-lg border border-border/70 px-4 py-3 text-right transition-colors duration-150 hover:border-border hover:bg-foreground/[0.02] sm:col-start-2"
        >
          <span className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground/70">
            Next
          </span>
          <span className="mt-0.5 block text-sm font-medium text-foreground">
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  )
}

/**
 * The frame every docs page renders into: H1 + lede from the nav config, the
 * article body, the "On this page" rail, and the prev/next pager.
 */
export function DocsPage({
  href,
  children,
  /** Optional element rendered between the lede and the body (e.g. a hero demo). */
  hero,
}: {
  href: string
  children: React.ReactNode
  hero?: React.ReactNode
}) {
  const page = getDocsPage(href)

  return (
    <div className="flex min-w-0 flex-1 justify-center gap-12 xl:gap-16">
      <div className="min-w-0 max-w-3xl flex-1 py-10 lg:py-14">
        <FrozenVersionBanner href={href} />

        <header>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-[2.125rem]">
            {page?.title}
          </h1>
          {page?.description && <Lede>{page.description}</Lede>}
        </header>

        {hero}

        <article id="docs-article" className="mt-12">
          {children}
        </article>

        <Pager href={href} />
      </div>

      <aside className="hidden w-52 shrink-0 xl:block">
        <div className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto py-14">
          <DocsToc />
        </div>
      </aside>
    </div>
  )
}
