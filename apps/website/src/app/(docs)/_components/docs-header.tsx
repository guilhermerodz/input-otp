import Link from 'next/link'

import { siteConfig } from '@/config/site'
import { Icons } from '@/components/icons'
import { DocsMobileNav } from './docs-sidebar'

function Wordmark() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span aria-hidden className="flex">
        <span className="flex h-4 w-3 items-center justify-center rounded-l-sm border border-r-0 border-foreground/40 transition-colors duration-200 group-hover:border-foreground" />
        <span className="flex h-4 w-3 items-center justify-center border border-foreground/40 transition-colors duration-200 group-hover:border-foreground">
          <span className="h-2 w-px bg-foreground/70 motion-safe:animate-caret-blink" />
        </span>
        <span className="flex h-4 w-3 items-center justify-center rounded-r-sm border border-l-0 border-foreground/40 transition-colors duration-200 group-hover:border-foreground" />
      </span>
      <span className="text-sm font-semibold tracking-tight">input-otp</span>
    </Link>
  )
}

export function DocsHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-[100rem] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Wordmark />
          <span aria-hidden className="hidden h-4 w-px bg-border/70 sm:block" />
          <Link
            href="/docs"
            className="hidden text-sm font-medium text-foreground sm:block"
          >
            Docs
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <DocsMobileNav />
          <a
            href="https://www.npmjs.com/package/input-otp"
            target="_blank"
            rel="noreferrer"
            className="hidden text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground sm:block"
          >
            npm
          </a>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground"
          >
            <Icons.gitHub className="h-4 w-4" />
          </a>
          <a
            href={siteConfig.links.twitter}
            target="_blank"
            rel="noreferrer"
            aria-label="X"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground"
          >
            <Icons.twitter className="h-3 w-3 fill-current" />
          </a>
        </div>
      </div>
    </header>
  )
}
