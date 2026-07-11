import { cn } from '@/lib/utils'
import { XRay } from './xray'

const FEATURES = [
  {
    title: 'Autofill that actually works',
    body: 'One-tap SMS codes on iOS and Android — autocomplete="one-time-code" is the default, and the platform-specific input quirks are already handled for you.',
  },
  {
    title: 'Friendly to password managers',
    body: 'Detects the badges injected by 1Password, LastPass, Dashlane and Bitwarden, and keeps them from covering your slots.',
  },
  {
    title: 'Accessible by default',
    body: 'Screen readers see the single real input it is. Caret movement, selection ranges, copy-paste and keyboard navigation all behave natively.',
  },
  {
    title: 'Tiny and dependency-free',
    body: 'Zero runtime dependencies, a few kilobytes over the wire, compatible with React 16.8 and later.',
  },
] as const

export function Features({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="features-heading"
      className={cn('w-full', className)}
    >
      <div className="mx-auto grid max-w-5xl gap-x-20 gap-y-14 px-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2
            id="features-heading"
            className="text-balance text-3xl font-bold leading-tight tracking-tight md:text-4xl"
          >
            One real input, wearing your design.
          </h2>
          <p className="mt-4 max-w-[48ch] text-pretty text-base text-muted-foreground md:text-lg">
            Under the hood there is a single invisible{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
              &lt;input&gt;
            </code>
            . The slots you see just mirror its state. Type below and watch it
            live — value, selection, focus.
          </p>

          <XRay className="mt-8" />
        </div>

        <ul className="divide-y divide-border border-y border-border lg:self-center">
          {FEATURES.map(feature => (
            <li key={feature.title} className="py-7 first:pt-6 last:pb-6">
              <h3 className="text-base font-semibold md:text-lg">
                {feature.title}
              </h3>
              <p className="mt-2 max-w-[58ch] text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
                {feature.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
