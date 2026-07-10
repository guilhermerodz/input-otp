import Image from 'next/image'
import { ChevronRightIcon } from 'lucide-react'

import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

const SPONSORS = {
  clerk: {
    name: 'Clerk',
    href: 'https://go.clerk.com/input-otp',
    tagline:
      'The easiest way to add authentication and complete user management to your application.',
    wordmarkLight: '/sponsors/clerk-wordmark-black-trimmed.svg',
    wordmarkDark: '/sponsors/clerk-wordmark-white-trimmed.svg',
    // Intrinsic aspect ratio of the trimmed wordmark artwork.
    ratio: 3.45,
  },
  resend: {
    name: 'Resend',
    href: 'https://go.resend.com/input-otp',
    tagline: 'Email for developers.',
    wordmarkLight: '/sponsors/resend-wordmark-black-trimmed.svg',
    wordmarkDark: '/sponsors/resend-wordmark-white-trimmed.svg',
    ratio: 4.7,
  },
  evomi: {
    name: 'Evomi',
    href: 'https://evomi.com/?utm_source=github&utm_campaign=otp',
    tagline: 'Swiss residential proxies for developers.',
    wordmarkLight: '/sponsors/evomi-wordmark-black-trimmed.svg',
    wordmarkDark: '/sponsors/evomi-wordmark-white-trimmed.svg',
    ratio: 4.07,
  },
} as const

function Wordmark({
  sponsor,
  className,
}: {
  sponsor: (typeof SPONSORS)[keyof typeof SPONSORS]
  className?: string
}) {
  return (
    <div
      className={cn('relative', className)}
      style={{ aspectRatio: sponsor.ratio }}
    >
      <Image
        alt={`${sponsor.name} logo`}
        src={sponsor.wordmarkLight}
        fill
        className="object-contain dark:hidden"
      />
      <Image
        alt={`${sponsor.name} logo`}
        src={sponsor.wordmarkDark}
        fill
        className="hidden object-contain dark:block"
      />
    </div>
  )
}

/** Slim logo strip anchoring the hero — Resend and Evomi keep their hero placement. */
export function HeroSponsorStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex flex-col items-center gap-4 sm:flex-row', className)}
    >
      <span className="text-sm text-muted-foreground">Sponsored by</span>
      <div className="flex items-center gap-7">
        {[SPONSORS.resend, SPONSORS.evomi].map(sponsor => (
          <a
            key={sponsor.name}
            href={sponsor.href}
            target="_blank"
            rel="noreferrer sponsored"
            title={sponsor.name}
            className="opacity-60 transition-opacity duration-200 hover:opacity-100 focus-visible:opacity-100"
          >
            <Wordmark sponsor={sponsor} className="h-5" />
          </a>
        ))}
      </div>
    </div>
  )
}

/** Full sponsors section — Clerk featured with its CTA, Resend and Evomi as tiles. */
export function SponsorsSection({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="sponsors-heading"
      className={cn('w-full', className)}
    >
      <div className="mx-auto max-w-3xl px-6">
        <div className="max-w-[560px]">
          <h2
            id="sponsors-heading"
            className="text-balance text-2xl font-bold leading-tight tracking-tight md:text-4xl"
          >
            Free, MIT-licensed — kept that way by its sponsors.
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground md:text-lg">
            These companies fund the maintenance of input-otp so it stays open
            source for everyone.
          </p>
        </div>

        <a
          href={SPONSORS.clerk.href}
          target="_blank"
          rel="noreferrer sponsored"
          className="group mt-10 flex flex-col gap-8 rounded-xl border border-border p-8 transition-colors duration-300 hover:border-foreground/25 sm:flex-row sm:items-center sm:justify-between md:p-10"
        >
          <div className="max-w-[24rem]">
            <Wordmark sponsor={SPONSORS.clerk} className="h-7" />
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              {SPONSORS.clerk.tagline}
            </p>
          </div>
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 self-start whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-medium sm:self-auto',
              'bg-[#6C47FF] text-white transition-colors duration-200 group-hover:bg-[#5835e0]',
            )}
          >
            Get started with Clerk
            <ChevronRightIcon
              aria-hidden
              className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
            />
          </span>
        </a>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[SPONSORS.resend, SPONSORS.evomi].map(sponsor => (
            <a
              key={sponsor.name}
              href={sponsor.href}
              target="_blank"
              rel="noreferrer sponsored"
              className="group flex flex-col justify-between gap-6 rounded-xl border border-border p-6 transition-colors duration-300 hover:border-foreground/25"
            >
              <Wordmark sponsor={sponsor} className="h-6 self-start" />
              <p className="text-sm text-muted-foreground">{sponsor.tagline}</p>
            </a>
          ))}
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Interested in sponsoring input-otp?{' '}
          <a
            href={siteConfig.links.twitter}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
          >
            Reach out on X
          </a>
          .
        </p>
      </div>
    </section>
  )
}
