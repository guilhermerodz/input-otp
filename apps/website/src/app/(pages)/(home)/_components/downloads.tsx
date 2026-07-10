'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const TOTAL_DOWNLOADS = 700_000_000
const DURATION_MS = 2400

export function Downloads({ className }: { className?: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const hasAnimated = React.useRef(false)
  const [value, setValue] = React.useState(TOTAL_DOWNLOADS)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReducedMotion) return

    let raf = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return
        hasAnimated.current = true
        observer.disconnect()

        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION_MS)
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
          setValue(Math.round(eased * TOTAL_DOWNLOADS))
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        setValue(0)
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  const digits = value.toString().padStart(9, '0').split('')
  const groups = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)]

  return (
    <section
      id="after-hero-anchor"
      aria-labelledby="downloads-heading"
      className={cn('w-full scroll-mt-28', className)}
    >
      <p className="sr-only">
        700,000,000 total downloads on npm — around 33 million every month.
      </p>

      <div
        ref={containerRef}
        aria-hidden
        className="flex items-center justify-center"
      >
        {groups.map((group, groupIdx) => (
          <React.Fragment key={groupIdx}>
            {groupIdx > 0 && <GroupSeparator />}
            <div className="flex">
              {group.map((digit, idx) => (
                <DigitCell key={idx}>{digit}</DigitCell>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-[560px] px-6 text-center md:mt-14">
        <h2
          id="downloads-heading"
          className="text-balance text-2xl font-bold leading-tight tracking-tight md:text-4xl"
        >
          Seven hundred million downloads, and counting.
        </h2>
        <p className="mt-4 text-pretty text-base text-muted-foreground md:text-lg">
          input-otp is the most-installed OTP component on npm — around 33
          million downloads every month. It ships inside shadcn/ui and powers
          sign-in flows across the React ecosystem.
        </p>
      </div>
    </section>
  )
}

function DigitCell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center border-y border-r border-border first:rounded-l-md first:border-l last:rounded-r-md',
        'h-11 w-7 text-lg font-medium tabular-nums',
        'md:h-[4.5rem] md:w-12 md:text-4xl',
        'lg:h-24 lg:w-16 lg:text-5xl',
      )}
    >
      {children}
    </div>
  )
}

function GroupSeparator() {
  return (
    <div className="flex w-4 items-center justify-center md:w-8 lg:w-10">
      <div className="h-1 w-2 rounded-full bg-border md:h-1.5 md:w-4 lg:w-5" />
    </div>
  )
}
