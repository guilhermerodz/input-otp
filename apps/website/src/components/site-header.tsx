import Link from 'next/link'

import { siteConfig } from '../config/site'
import { cn } from '../lib/utils'
import { buttonVariants } from './ui/button'
import { Icons } from './icons'
import { ModeToggle } from './mode-toggle'

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

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Wordmark />

        <div className="flex items-center">
          <nav className="flex items-center">
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                  }),
                  'w-9 px-0',
                )}
              >
                <Icons.gitHub className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </div>
            </Link>
            <Link
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                  }),
                  'w-9 px-0',
                )}
              >
                <Icons.twitter className="h-3 w-3 fill-current" />
                <span className="sr-only">Twitter</span>
              </div>
            </Link>
          </nav>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
