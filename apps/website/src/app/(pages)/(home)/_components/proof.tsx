'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const TOTAL_DOWNLOADS = 700_000_000
const COUNT_UP_MS = 2200
// 33M downloads/month ≈ one download every 79ms.
const LIVE_TICK_MS = 79

const DIGIT_STRIP = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

export function Proof({ className }: { className?: string }) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const [value, setValue] = React.useState(TOTAL_DOWNLOADS)
  const [live, setLive] = React.useState(false)

  React.useEffect(() => {
    const el = panelRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let interval: ReturnType<typeof setInterval> | undefined
    let started = false

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return
        started = true
        observer.disconnect()

        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / COUNT_UP_MS)
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
          setValue(Math.round(eased * TOTAL_DOWNLOADS))
          if (t < 1) {
            raf = requestAnimationFrame(tick)
          } else {
            setLive(true)
            interval = setInterval(() => setValue(v => v + 1), LIVE_TICK_MS)
          }
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
      if (interval) clearInterval(interval)
    }
  }, [])

  const digits = value.toString().padStart(9, '0').split('')
  const groups = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)]

  return (
    <section
      id="after-hero-anchor"
      aria-labelledby="proof-heading"
      className={cn('w-full scroll-mt-24', className)}
    >
      <div className="mx-auto max-w-5xl px-6">
        <p className="sr-only">
          More than 700,000,000 total downloads on npm — around 33 million every
          month.
        </p>

        {/* The counter is a physical display: always dark, in both themes. */}
        <div
          ref={panelRef}
          aria-hidden
          className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-12 md:rounded-3xl md:py-16 lg:py-20"
        >
          <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgb(255_255_255/0.055)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_75%_90%_at_50%_50%,black_35%,transparent_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_65%_at_50%_0%,rgb(255_255_255/0.06),transparent_70%)]" />

          <div className="relative flex items-center justify-center">
            {groups.map((group, groupIdx) => (
              <React.Fragment key={groupIdx}>
                {groupIdx > 0 && (
                  <div className="flex w-3.5 items-center justify-center md:w-8 lg:w-10">
                    <div className="h-1 w-2 rounded-full bg-zinc-700 md:h-1.5 md:w-4" />
                  </div>
                )}
                <div className="flex gap-1 md:gap-1.5">
                  {group.map((digit, idx) => (
                    <DigitCell key={idx} digit={digit} live={live} />
                  ))}
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="relative mt-8 flex flex-col items-center justify-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] sm:flex-row sm:gap-8 md:mt-12">
            <span className="text-zinc-400">Total downloads on npm</span>
            <span className="flex items-center gap-2 text-emerald-400">
              <span className="relative flex size-1.5">
                <span
                  className={cn(
                    'absolute inline-flex size-full rounded-full bg-emerald-400',
                    live && 'motion-safe:animate-ping',
                  )}
                />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
              </span>
              counting at 33,000,000 / month
            </span>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-[560px] text-center md:mt-20">
          <h2
            id="proof-heading"
            className="text-balance text-3xl font-bold leading-tight tracking-tight md:text-4xl"
          >
            The most-installed OTP input on npm.
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground md:text-lg">
            Around 33 million downloads a month. It ships inside shadcn/ui and
            powers sign-in flows across the React ecosystem.
          </p>
        </div>
      </div>
    </section>
  )
}

function DigitCell({ digit, live }: { digit: string; live: boolean }) {
  const d = Number(digit)
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 text-zinc-50',
        'shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_2px_6px_-2px_rgb(0_0_0/0.6)]',
        'h-11 w-[1.65rem] text-xl font-medium tabular-nums',
        'md:h-[4.5rem] md:w-12 md:rounded-lg md:text-4xl',
        'lg:h-[5.5rem] lg:w-[3.75rem] lg:text-5xl',
      )}
    >
      <div
        className="flex h-full w-full flex-col will-change-transform"
        style={{
          // The column's border box is one cell tall (h-full), so
          // translateY percentages resolve per cell: one digit = 100%.
          transform: `translateY(${-d * 100}%)`,
          transition: live ? 'transform 70ms linear' : 'none',
        }}
      >
        {DIGIT_STRIP.map(n => (
          <span
            key={n}
            className="flex h-full w-full shrink-0 items-center justify-center"
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  )
}
