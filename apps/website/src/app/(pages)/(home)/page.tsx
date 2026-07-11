import Link from 'next/link'
import { ChevronRightIcon } from 'lucide-react'

import { CopyNpmCommandButton } from '@/components/copy-button'
import { Icons } from '@/components/icons'
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import { ExampleCode } from '@/app/(local-pages)/example-playground/code'

import { Features } from './_components/features'
import { StyleGallery } from './_components/gallery'
import { Proof } from './_components/proof'
import { Showcase } from './_components/showcase'
import { HeroSponsorStrip, SponsorsSection } from './_components/sponsors'

const fadeUpClassname =
  'lg:motion-safe:opacity-0 lg:motion-safe:animate-fade-up'

async function getRepoStarCount() {
  try {
    const res = await fetch(
      'https://api.github.com/repos/guilhermerodz/input-otp',
    )
    const data = await res.json()
    const starCount = data.stargazers_count
    if (typeof starCount !== 'number') {
      return null
    }
    if (starCount > 999) {
      return (starCount / 1000).toFixed(1) + 'K'
    }
    return String(starCount)
  } catch {
    return null
  }
}

export default async function IndexPage() {
  const starCount = await getRepoStarCount()

  return (
    <div className="relative flex flex-1 flex-col items-center">
      {/* ————— Hero ————— */}
      <section className="hero-scene relative w-full overflow-hidden">
        <div
          aria-hidden
          className="bg-dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_65%_65%_at_50%_38%,black_20%,transparent_72%)]"
        />
        <div
          aria-hidden
          className="hero-spotlight pointer-events-none absolute inset-0"
        />

        <div className="container relative">
          <PageHeader className="max-w-none pb-10 lg:pt-28">
            <PageHeaderHeading
              className={cn(fadeUpClassname, 'text-balance tracking-[-0.035em]')}
            >
              Stop wasting time building OTP inputs.
            </PageHeaderHeading>

            <Showcase
              className={cn(
                fadeUpClassname,
                'lg:motion-safe:[animation-delay:400ms]',
              )}
            />

            <PageHeaderDescription
              className={cn(
                fadeUpClassname,
                'lg:motion-safe:[animation-delay:1300ms]',
              )}
            >
              One-time password input for React. Accessible. Unstyled.
              Customizable.{' '}
              <span className="whitespace-nowrap">
                Downloaded 700 million times.
              </span>
            </PageHeaderDescription>

            <PageActions
              className={cn(
                fadeUpClassname,
                'lg:motion-safe:[animation-delay:1500ms]',
              )}
            >
              <div className={buttonVariants({ variant: 'outline' })}>
                <div className="pr-1 text-muted-foreground">
                  <span className="text-foreground">npm</span> install input-otp
                </div>
                <CopyNpmCommandButton
                  commands={{
                    __npmCommand__: 'npm install input-otp',
                    __yarnCommand__: 'yarn add input-otp',
                    __pnpmCommand__: 'pnpm add input-otp',
                    __bunCommand__: 'bun add input-otp',
                  }}
                />
              </div>
              <Link
                target="_blank"
                rel="noreferrer"
                href={siteConfig.links.github}
                className={cn(
                  'group relative !py-0',
                  buttonVariants({ variant: 'outline' }),
                )}
              >
                <Icons.gitHub className="mr-2 h-4 w-4" />
                <div className="flex h-full items-center">
                  <div className="hidden md:[display:unset]">GitHub</div>
                  {starCount !== null && (
                    <>
                      <div className="mx-4 hidden h-full w-px bg-input md:[display:unset]" />
                      <div>{starCount}</div>
                    </>
                  )}
                </div>
              </Link>
            </PageActions>

            <div
              className={cn(
                fadeUpClassname,
                '-mt-2 lg:-mt-4 lg:motion-safe:[animation-delay:1700ms]',
              )}
            >
              <SponsorBadgeClerk />
            </div>

            <HeroSponsorStrip
              className={cn(
                fadeUpClassname,
                'mt-12 lg:motion-safe:[animation-delay:1900ms]',
              )}
            />
          </PageHeader>
        </div>
      </section>

      {/* ————— 700M proof counter ————— */}
      <Proof className="mt-14 md:mt-24" />

      {/* ————— One real input + features ————— */}
      <Features className="mt-28 md:mt-40 lg:mt-48" />

      {/* ————— Style gallery ————— */}
      <StyleGallery className="mt-28 md:mt-40 lg:mt-48" />

      {/* ————— Code ————— */}
      <section
        aria-labelledby="code-heading"
        className="mt-28 w-full md:mt-40 lg:mt-48"
      >
        <div className="mx-auto max-w-4xl px-6">
          <div className="max-w-[560px]">
            <h2
              id="code-heading"
              className="text-balance text-3xl font-bold leading-tight tracking-tight md:text-4xl"
            >
              Copy, paste, ship.
            </h2>
            <p className="mt-4 text-pretty text-base text-muted-foreground md:text-lg">
              Start from the six-slot input powering the top of this page — one
              render prop, styled with Tailwind.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5 font-mono text-xs text-muted-foreground">
              <span>slots.tsx</span>
              <span>React · Tailwind</span>
            </div>
            <div className="[&_pre]:!rounded-none [&_pre]:!border-0">
              <ExampleCode />
            </div>
          </div>
        </div>
      </section>

      {/* ————— Sponsors ————— */}
      <SponsorsSection className="mb-24 mt-28 md:mt-40 lg:mb-32 lg:mt-48" />
    </div>
  )
}

export const revalidate = 3600

const SponsorBadgeClerk = () => {
  return (
    <a href="https://go.clerk.com/input-otp" target="_blank" rel="noreferrer">
      <Badge
        variant="outline"
        className="flex h-12 flex-col items-center justify-center text-nowrap hover:bg-accent sm:h-10 sm:flex-row sm:justify-between sm:gap-8 sm:text-sm"
      >
        <span>Looking for an authentication solution?</span>

        <span className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <span>Get started with Clerk</span>
          <ChevronRightIcon className="size-3" />
        </span>
      </Badge>
    </a>
  )
}
