import Link from 'next/link'
import { Icons } from '../../../components/icons'
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '../../../components/page-header'
import { buttonVariants } from '../../../components/ui/button'
import { siteConfig } from '../../../config/site'
import { cn } from '../../../lib/utils/cn'
import { Showcase } from './_components/showcase'

export default function IndexPage() {
  const fadeUpClassname = 'motion-safe:opacity-0 motion-safe:animate-fade-up'

  return (
    <div className="container relative flex-1 flex flex-col justify-center">
      <PageHeader>
        <PageHeaderHeading className={cn(fadeUpClassname)}>
          Stop wasting time building OTP inputs.
        </PageHeaderHeading>

        <Showcase className={cn(fadeUpClassname, 'motion-safe:delay-1000')} />

        <PageHeaderDescription
          className={cn(fadeUpClassname, 'motion-safe:delay-1500')}
        >
          One-time password input component for React. Accessible. Unstyled.
          Customizable. Open Source.
        </PageHeaderDescription>

        <PageActions className={cn(fadeUpClassname, 'motion-safe:delay-1500')}>
          <Link href="/docs" className={cn(buttonVariants())}>
            Get Started
          </Link>
          <Link
            target="_blank"
            rel="noreferrer"
            href={siteConfig.links.github}
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <Icons.gitHub className="mr-2 h-4 w-4" />
            GitHub
          </Link>
        </PageActions>
      </PageHeader>
    </div>
  )
}
