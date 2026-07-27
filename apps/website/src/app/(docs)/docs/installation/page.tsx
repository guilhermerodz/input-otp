import { CodeBlock } from '../../_components/code-block'
import { ComponentPreview } from '../../_components/component-preview'
import { DocsPage, docsMetadata } from '../../_components/docs-page'
import { InstallTabs } from '../../_components/install-tabs'
import {
  A,
  C,
  Callout,
  H2,
  H3,
  Kbd,
  Li,
  P,
  Step,
  Steps,
  Ul,
} from '../../_components/prose'
import { readProjectSource } from '../../_lib/source'
import { BasicDemo } from '../../_demos/basic'

const HREF = '/docs/installation'
export const metadata = docsMetadata(HREF)

const SLOT_SOURCE = readProjectSource('src/components/ui/otp-slot.tsx')

const FIRST_RENDER = `'use client'

import { OTPInput } from 'input-otp'

export function VerificationCode() {
  return (
    <OTPInput
      maxLength={6}
      render={({ slots }) => (
        <div style={{ display: 'flex', gap: 4 }}>
          {slots.map((slot, idx) => (
            <div key={idx} style={{ width: 40, height: 52, border: '1px solid #333' }}>
              {slot.char}
            </div>
          ))}
        </div>
      )}
    />
  )
}`

const TAILWIND_CONFIG = `// tailwind.config.ts
export default {
  theme: {
    extend: {
      keyframes: {
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
      },
      animation: {
        'caret-blink': 'caret-blink 1.2s ease-out infinite',
      },
    },
  },
}`

const VSCODE_SETTINGS = `// .vscode/settings.json
{
  "tailwindCSS.classAttributes": ["class", "className", ".*ClassName"]
}`

export default function InstallationPage() {
  return (
    <DocsPage href={HREF}>
      <P>
        input-otp is a single component with no dependencies beyond React. There
        is no provider to mount, no CSS file to import and no config step.
      </P>

      <Steps>
        <Step title="Install the package">
          <InstallTabs />
          <P>
            React 16.8 or newer is the only peer dependency, up to and including
            React 19.
          </P>
        </Step>

        <Step title="Render a field">
          <P>
            <C>maxLength</C> is the number of slots. <C>render</C> receives them
            and returns your markup — that&apos;s the entire contract.
          </P>
          <CodeBlock code={FIRST_RENDER} />
          <Callout type="warning" title="Client component">
            <p>
              The component uses browser APIs (selection, <C>ResizeObserver</C>,{' '}
              <C>document.elementFromPoint</C>), so in the Next.js App Router it
              has to live under <C>&apos;use client&apos;</C>. It renders
              correctly on the server — it just needs to hydrate.
            </p>
          </Callout>
        </Step>

        <Step title="Make it look like something">
          <P>
            The starter above is deliberately ugly. Below is the slot component
            used throughout these docs — copy it into your project as{' '}
            <C>components/ui/otp-slot.tsx</C> and you have a field you can ship.
          </P>
          <CodeBlock code={SLOT_SOURCE} title="components/ui/otp-slot.tsx" />
          <P>
            It expects Tailwind, the <C>cn</C> helper from{' '}
            <A href="https://ui.shadcn.com/docs/installation">shadcn/ui</A>, and
            one keyframe for the blinking caret:
          </P>
          <CodeBlock code={TAILWIND_CONFIG} lang="ts" />
        </Step>

        <Step title="Wire it up">
          <P>Which leaves you here:</P>
          <ComponentPreview name="basic">
            <BasicDemo />
          </ComponentPreview>
        </Step>
      </Steps>

      <H2>Already using shadcn/ui?</H2>
      <P>
        shadcn/ui&apos;s <C>input-otp</C> component is a thin wrapper around
        this library — same engine, pre-composed parts. If you want{' '}
        <C>{'<InputOTPSlot index={0} />'}</C> instead of a render prop, install
        it from the registry:
      </P>
      <CodeBlock code="npx shadcn@latest add input-otp" lang="bash" />
      <P>
        It uses the <A href="/docs/api#context">Context API</A> form of this
        component under the hood, so everything in these docs still applies.
      </P>

      <H2>Editor setup</H2>
      <P>
        <C>containerClassName</C> won&apos;t get Tailwind IntelliSense out of
        the box because it isn&apos;t named <C>className</C>. One setting fixes
        it for every <C>*ClassName</C> prop:
      </P>
      <CodeBlock code={VSCODE_SETTINGS} lang="json" />

      <H2>Verifying the install</H2>
      <P>
        A field that&apos;s wired up correctly should pass all of these on the
        first try — if any of them fail, something in the setup is off:
      </P>
      <Ul>
        <Li>
          Clicking anywhere in the row of slots focuses the field and puts the
          caret in a sensible place.
        </Li>
        <Li>
          <Kbd>⌘A</Kbd> selects the whole code, and typing replaces it.
        </Li>
        <Li>Pasting a full code fills every slot at once.</Li>
        <Li>
          Tabbing away removes the active-slot highlight; tabbing back restores
          it at the end of the value.
        </Li>
      </Ul>

      <H3>Next</H3>
      <P>
        <A href="/docs/anatomy">Anatomy</A> shows what you just rendered, from
        the inside.
      </P>
    </DocsPage>
  )
}
