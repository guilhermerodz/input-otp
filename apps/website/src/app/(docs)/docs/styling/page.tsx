import { CodeBlock } from '../../_components/code-block'
import { ComponentPreview } from '../../_components/component-preview'
import { DocsPage, docsMetadata } from '../../_components/docs-page'
import { A, C, Callout, H2, H3, Li, P, Ul } from '../../_components/prose'
import { BasicDemo } from '../../_demos/basic'
import { ContextApiDemo } from '../../_demos/context-api'
import { GroupsDemo } from '../../_demos/groups'
import { KeycapsDemo } from '../../_demos/keycaps'
import { PlaceholderDemo } from '../../_demos/placeholder'
import { UnderlinedDemo } from '../../_demos/underlined'

const HREF = '/docs/styling'
export const metadata = docsMetadata(HREF)

const TWO_CLASSNAMES = `<OTPInput
  // the container that wraps your slots
  containerClassName="group flex items-center gap-2"
  // the real, invisible input
  className="focus-visible:ring-0"
/>`

const FOCUS_RING = `<OTPInput
  maxLength={6}
  containerClassName="group flex items-center rounded-lg ring-offset-2 ring-offset-background
                      has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
  render={({ slots, isFocused, isHovering }) => (
    // isFocused / isHovering are there when you'd rather branch in JS
    …
  )}
/>`

const CARET_CSS = `/* the keyframe the docs' FakeCaret uses */
@keyframes caret-blink {
  0%, 70%, 100% { opacity: 1 }
  20%, 50%      { opacity: 0 }
}`

const PLACEHOLDER_CSS = `/* Dim placeholder characters without threading a prop:
   the attribute lives on the input, so read it from the container's group. */
<div className="group-has-[input[data-input-otp-placeholder-shown]]:text-muted-foreground/40">
  {char ?? placeholderChar}
</div>`

const RESIZE = `/* The library writes the input's height here on every resize.
   Use it if you want something to scale with the field. */
[data-input-otp-container] {
  --root-height: 56px; /* written by a ResizeObserver */
}`

export default function StylingPage() {
  return (
    <DocsPage href={HREF}>
      <P>
        There is no theme to extend and no class names to override. The field is
        a row of elements you wrote, and the library&apos;s only job is telling
        you which of them is active, which has a character, and where a caret
        belongs.
      </P>

      <H2>The two class names</H2>
      <P>
        This is the single most common source of confusion, so it&apos;s worth
        being blunt about it: <C>containerClassName</C> styles the wrapper you
        can see; <C>className</C> goes to the invisible input.
      </P>
      <CodeBlock code={TWO_CLASSNAMES} />
      <P>
        Almost all of your styling belongs on the container. Reach for{' '}
        <C>className</C> only when you need to change the input itself — most
        often to cancel a global focus ring that your CSS reset applies to every{' '}
        <C>input</C>.
      </P>
      <Callout type="tip" title="Start the container with group">
        <p>
          Making the container a Tailwind <C>group</C> is what lets a slot read
          field-level state — <C>group-focus-within:</C>, <C>group-hover:</C>,{' '}
          <C>group-has-[input[data-input-otp-placeholder-shown]]:</C> — without
          any of it being passed down as props.
        </p>
      </Callout>

      <H2>Anatomy of a slot</H2>
      <P>
        A slot needs to answer four questions, and it gets all four handed to
        it:
      </P>
      <Ul>
        <Li>
          <strong>What&apos;s in me?</strong> <C>char ?? placeholderChar</C>.
        </Li>
        <Li>
          <strong>Am I the one being edited?</strong> <C>isActive</C> — draw the
          ring, raise the <C>z-index</C> so it isn&apos;t clipped by the next
          slot&apos;s border.
        </Li>
        <Li>
          <strong>Should I blink?</strong> <C>hasFakeCaret</C>, which is only
          true for an active slot with nothing in it.
        </Li>
        <Li>
          <strong>Is the whole field off?</strong> Read it from the input with{' '}
          <C>has-[:disabled]</C> on the container.
        </Li>
      </Ul>
      <ComponentPreview name="basic">
        <BasicDemo />
      </ComponentPreview>

      <H3>The fake caret</H3>
      <P>
        The real caret is <C>caret-color: transparent</C>, because a native
        caret in a field with collapsed letter-spacing lands nowhere useful. So
        you draw one: an absolutely positioned bar that blinks.
      </P>
      <CodeBlock code={CARET_CSS} lang="css" />
      <P>
        Wrap the animation in <C>motion-safe:</C> — a blinking caret is exactly
        the kind of thing <C>prefers-reduced-motion</C> exists for.
      </P>

      <H3>Placeholders</H3>
      <P>
        <C>placeholderChar</C> is only non-null while the value is empty, so the
        placeholder disappears as a unit on the first keystroke rather than
        dissolving one slot at a time.
      </P>
      <ComponentPreview name="placeholder">
        <PlaceholderDemo />
      </ComponentPreview>
      <CodeBlock code={PLACEHOLDER_CSS} />

      <H2>Groups and separators</H2>
      <P>
        <C>slots</C> is a plain array, so grouping is <C>slice</C>. Nothing in
        the library knows or cares that there is a dash in the middle — which
        also means a separator must be <C>aria-hidden</C>, since the value it
        sits inside has no dash in it.
      </P>
      <ComponentPreview name="groups">
        <GroupsDemo />
      </ComponentPreview>

      <H2>Composition instead of a callback</H2>
      <P>
        If you would rather write <C>{'<Slot index={0} />'}</C> than map over an
        array — because your design system wants named parts, or because a
        wrapper component sits between the field and its slots — drop the{' '}
        <C>render</C> prop and read{' '}
        <A href="/docs/api#context">OTPInputContext</A>.
      </P>
      <ComponentPreview name="context-api">
        <ContextApiDemo />
      </ComponentPreview>

      <H2>Field-level state</H2>
      <P>
        Focus rings usually want to sit on the container, not the slot. You can
        drive that from CSS with <C>has-[:focus-visible]</C>, or from JS with
        the <C>isFocused</C> and <C>isHovering</C> render props:
      </P>
      <CodeBlock code={FOCUS_RING} />
      <P>
        <C>isHovering</C> is already <C>false</C> when the field is disabled, so
        you don&apos;t need to guard it.
      </P>

      <H3>Scaling with the field</H3>
      <P>
        The container carries <C>--root-height</C>, kept in sync with the
        input&apos;s pixel height by a <C>ResizeObserver</C>. It exists so the
        library can size the invisible text, but nothing stops you using it:
      </P>
      <CodeBlock code={RESIZE} lang="css" />

      <H2>Two more looks</H2>
      <P>
        Both of these use the exact same component and the exact same state —
        only the markup differs. More in <A href="/docs/examples">Examples</A>.
      </P>
      <H3>Underlined</H3>
      <ComponentPreview name="underlined">
        <UnderlinedDemo />
      </ComponentPreview>
      <H3>Keycaps</H3>
      <ComponentPreview name="keycaps">
        <KeycapsDemo />
      </ComponentPreview>

      <H2>What the library styles</H2>
      <P>
        For completeness: the library appends one{' '}
        <C>&lt;style id=&quot;input-otp-style&quot;&gt;</C> to <C>head</C>, once
        per page. Every rule in it is scoped to <C>[data-input-otp]</C> and
        exists to make the invisible input behave — transparent selection,
        neutralised autofill, iOS text metrics, and a <C>pointer-events</C>{' '}
        exception so a password manager badge stays clickable. None of it
        touches your slots. <A href="/docs/edge-cases">Edge cases</A> walks
        through each rule and why it is there.
      </P>
    </DocsPage>
  )
}
