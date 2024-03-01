import { CopyNpmCommandButton } from '@/components/copy-button'
import { Icons } from '@/components/icons'
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header'
import { buttonVariants } from '@/components/ui/button'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Showcase } from './_components/showcase'
import { ExampleCode } from '@/app/(local-pages)/example-playground/code'

const fadeUpClassname =
  'lg:motion-safe:opacity-0 lg:motion-safe:animate-fade-up'

async function getRepoStarCount() {
  const res = await fetch(
    'https://api.github.com/repos/guilhermerodz/input-otp',
  )
  const data = await res.json()
  const starCount = data.stargazers_count
  
  if (starCount > 999) {
    return (starCount / 1000).toFixed(1) + 'K'
  }
  
  return starCount
}

export default async function IndexPage() {
  const starCount = await getRepoStarCount()

  return (
    <div className="container relative flex-1 flex flex-col justify-center items-center">
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
          One-time password input component for React. Accessible. Unstyled.
          Customizable. Open Source.
        </PageHeaderDescription>

        <PageActions
          className={cn(
            fadeUpClassname,
            'lg:motion-safe:[animation-delay:3000ms]',
          )}
        >
          <div className={buttonVariants({ variant: 'outline' })}>
            <div className="text-muted-foreground pr-1">
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
              'relative !py-0 group',
              buttonVariants({ variant: 'outline' }),
            )}
          >
            <Icons.gitHub className="mr-2 h-4 w-4" />
            <div className="flex items-center h-full">
              <div className="hidden md:[display:unset]">Github</div>
              <div className="hidden md:[display:unset] h-full w-px bg-input group-hover:bg-foregrounds mx-4" />
              <div>{starCount}</div>
            </div>
          </Link>
        </PageActions>
      </PageHeader>

      <ExampleCode />
    </div>
  )
}

export const revalidate = 3600
