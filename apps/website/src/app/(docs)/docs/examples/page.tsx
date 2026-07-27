import { CodeBlock } from '../../_components/code-block'
import { ComponentPreview } from '../../_components/component-preview'
import { DocsPage, docsMetadata } from '../../_components/docs-page'
import { A, C, H2, H3, P } from '../../_components/prose'
import { AlphanumericDemo } from '../../_demos/alphanumeric'
import { AutoSubmitDemo } from '../../_demos/auto-submit'
import { BasicDemo } from '../../_demos/basic'
import { ControlledDemo } from '../../_demos/controlled'
import { ContextApiDemo } from '../../_demos/context-api'
import { DisabledDemo } from '../../_demos/disabled'
import { GroupsDemo } from '../../_demos/groups'
import { InvalidDemo } from '../../_demos/invalid'
import { KeycapsDemo } from '../../_demos/keycaps'
import { LabelledDemo } from '../../_demos/labelled'
import { MaskedDemo } from '../../_demos/masked'
import { PinDemo } from '../../_demos/pin'
import { PlaceholderDemo } from '../../_demos/placeholder'
import { RtlDemo } from '../../_demos/rtl'
import { TextAlignDemo } from '../../_demos/text-align'
import { UnderlinedDemo } from '../../_demos/underlined'
import { VerifyCardDemo } from '../../_demos/verify-card'

const HREF = '/docs/examples'
export const metadata = docsMetadata(HREF)

const AUTOFOCUS = `// Every input attribute is forwarded, autoFocus included.
<OTPInput autoFocus maxLength={6} />

// Prefer this over autoFocus when the field isn't the only thing on screen —
// autoFocus scrolls the page to it on load, which can be disorienting.
const ref = React.useRef<HTMLInputElement>(null)
React.useEffect(() => {
  if (userJustRequestedACode) ref.current?.focus()
}, [userJustRequestedACode])`

const RESPONSIVE = `// Slots that shrink instead of overflowing a narrow viewport.
<OTPInput
  maxLength={6}
  containerClassName="group flex w-full max-w-xs items-center"
  render={({ slots }) => (
    <div className="flex w-full">
      {slots.map((slot, idx) => (
        <Slot key={idx} {...slot} className="h-12 w-full min-w-0 flex-1 text-base" />
      ))}
    </div>
  )}
/>`

export default function ExamplesPage() {
  return (
    <DocsPage href={HREF}>
      <P>
        Every example on this page renders the same component with the same
        state. Only the markup changes. Flip to the <strong>Code</strong> tab on
        any of them — that source is read straight off disk, so it is exactly
        what is running above it.
      </P>

      <H2>A complete verification flow</H2>
      <P>
        The one to copy if you are building the real thing: label, hint,
        auto-submit on completion, a pending state, an error that clears itself,
        focus recovery after a failure, and a resend cooldown. Type{' '}
        <C>424242</C> to succeed.
      </P>
      <ComponentPreview name="verify-card">
        <VerifyCardDemo />
      </ComponentPreview>

      <H2>Layouts</H2>

      <H3>Shared border</H3>
      <P>The default look: one continuous box, divided.</P>
      <ComponentPreview name="basic">
        <BasicDemo />
      </ComponentPreview>

      <H3>Two groups with a dash</H3>
      <P>
        Stripe&apos;s arrangement, and the reason many people recognise this
        pattern. <C>slots</C> is an array, so this is <C>slice</C> and a
        decorative divider.
      </P>
      <ComponentPreview name="groups">
        <GroupsDemo />
      </ComponentPreview>

      <H3>Separated boxes</H3>
      <P>Four rounded cells with gaps — the PIN shape.</P>
      <ComponentPreview name="pin">
        <PinDemo />
      </ComponentPreview>

      <H3>Underlined</H3>
      <P>
        No boxes at all: a rule under each character that thickens when active.
      </P>
      <ComponentPreview name="underlined">
        <UnderlinedDemo />
      </ComponentPreview>

      <H3>Keycaps</H3>
      <P>
        Tactile cells with the character dropping in as it lands. The animation
        is keyed on <C>slot.char</C> and sits behind <C>motion-safe:</C>.
      </P>
      <ComponentPreview name="keycaps">
        <KeycapsDemo />
      </ComponentPreview>

      <H3>Full width</H3>
      <P>
        Slots that flex instead of overflowing. Worth doing — six fixed-width
        slots will break a 320px viewport at 200% zoom.
      </P>
      <CodeBlock code={RESPONSIVE} />

      <H2>Behaviour</H2>

      <H3>Placeholder</H3>
      <ComponentPreview name="placeholder">
        <PlaceholderDemo />
      </ComponentPreview>

      <H3>Masked, with a reveal toggle</H3>
      <P>
        Masking is a rendering decision — the value is untouched, so revealing
        it is one boolean.
      </P>
      <ComponentPreview name="masked">
        <MaskedDemo />
      </ComponentPreview>

      <H3>Controlled</H3>
      <ComponentPreview name="controlled">
        <ControlledDemo />
      </ComponentPreview>

      <H3>Auto-submit on completion</H3>
      <ComponentPreview name="auto-submit">
        <AutoSubmitDemo />
      </ComponentPreview>

      <H3>Invalid state</H3>
      <ComponentPreview name="invalid">
        <InvalidDemo />
      </ComponentPreview>

      <H3>Disabled and read-only</H3>
      <ComponentPreview name="disabled">
        <DisabledDemo />
      </ComponentPreview>

      <H3>Alphanumeric</H3>
      <P>
        Remember <C>inputMode=&quot;text&quot;</C>, or mobile users get a keypad
        with no letters on it.
      </P>
      <ComponentPreview name="alphanumeric">
        <AlphanumericDemo />
      </ComponentPreview>

      <H3>Autofocus</H3>
      <CodeBlock code={AUTOFOCUS} />

      <H2>Composition</H2>

      <H3>Labelled field</H3>
      <P>
        A real <C>&lt;label&gt;</C>, a real hint, and no ARIA gymnastics — see{' '}
        <A href="/docs/accessibility">Accessibility</A>.
      </P>
      <ComponentPreview name="labelled">
        <LabelledDemo />
      </ComponentPreview>

      <H3>Named parts instead of a render prop</H3>
      <ComponentPreview name="context-api">
        <ContextApiDemo />
      </ComponentPreview>

      <H3>Right-to-left</H3>
      <ComponentPreview name="rtl">
        <RtlDemo />
      </ComponentPreview>

      <H3>Text alignment</H3>
      <P>
        Not a typography prop — it moves the invisible text, and with it the
        native caret and the iOS selection bubble.{' '}
        <A href="/docs/mobile#text-alignment">Why it matters</A>.
      </P>
      <ComponentPreview name="text-align">
        <TextAlignDemo />
      </ComponentPreview>
    </DocsPage>
  )
}
