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

import { Downloads } from './_components/downloads'
import { Features } from './_components/features'
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
    <div className="container relative flex flex-1 flex-col items-center justify-center">
      <PageHeader>
        <PageHeaderHeading className={cn(fadeUpClassname)}>
          Stop wasting time building OTP inputs.
        </PageHeaderHeading>

        <Showcase
          className={cn(
            fadeUpClassname,
            'lg:motion-safe:[animation-delay:1000ms]',
          )}
        />

        <PageHeaderDescription
          className={cn(
            fadeUpClassname,
            'lg:motion-safe:[animation-delay:3000ms]',
          )}
        >
          One-time password input for React. Accessible. Unstyled. Customizable.{' '}
          <span className="whitespace-nowrap">
            Downloaded 700 million times.
          </span>
        </PageHeaderDescription>

        <PageActions
          className={cn(
            fadeUpClassname,
            'lg:motion-safe:[animation-delay:3000ms]',
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
            '-mt-2 lg:-mt-4 lg:motion-safe:[animation-delay:3000ms]',
          )}
        >
          <SponsorBadgeClerk />
        </div>

        <HeroSponsorStrip
          className={cn(
            fadeUpClassname,
            'mt-10 lg:motion-safe:[animation-delay:3400ms]',
          )}
        />
      </PageHeader>

      <Downloads className="mt-16 md:mt-28 lg:mt-36" />

      <Features className="mt-28 md:mt-40 lg:mt-48" />

      <div className="mt-28 w-full md:mt-40 lg:mt-48">
        <div className="mx-auto max-w-[560px] px-6 text-center">
          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight md:text-4xl">
            Copy, paste, make it yours.
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground md:text-lg">
            The exact input at the top of this page — one render prop, styled
            with Tailwind. Swap in your own design system whenever you like.
          </p>
        </div>
        <div className="mt-10">
          <ExampleCode />
        </div>
      </div>

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
