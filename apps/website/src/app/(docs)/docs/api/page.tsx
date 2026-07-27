import { CodeBlock } from '../../_components/code-block'
import { DocsPage, docsMetadata } from '../../_components/docs-page'
import { A, C, Callout, H2, H3, Li, P, Ul } from '../../_components/prose'
import { AttributesTable, PropsTable } from '../../_components/props-table'

const HREF = '/docs/api'
export const metadata = docsMetadata(HREF)

const IMPORTS = `import {
  OTPInput,          // the component
  OTPInputContext,   // render state, for the children API

  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_CHARS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from 'input-otp'

import type { OTPInputProps, RenderProps, SlotProps } from 'input-otp'`

const RENDER_PROPS_TYPE = `interface RenderProps {
  slots: SlotProps[]
  isFocused: boolean
  isHovering: boolean
}

interface SlotProps {
  char: string | null
  placeholderChar: string | null
  isActive: boolean
  hasFakeCaret: boolean
}`

const REGEXPS = `export const REGEXP_ONLY_DIGITS = '^\\\\d+$'
export const REGEXP_ONLY_CHARS = '^[a-zA-Z]+$'
export const REGEXP_ONLY_DIGITS_AND_CHARS = '^[a-zA-Z0-9]+$'`

const CONTEXT_EXAMPLE = `import { OTPInput, OTPInputContext } from 'input-otp'

function Field() {
  return (
    <OTPInput maxLength={6} containerClassName="group flex">
      <Slot index={0} />
      <Slot index={1} />
      {/* … */}
    </OTPInput>
  )
}

function Slot({ index }: { index: number }) {
  const { slots } = React.useContext(OTPInputContext)
  const { char, isActive, hasFakeCaret } = slots[index]
  // …
}`

const NOSCRIPT_DEFAULT = `[data-input-otp] {
  --nojs-bg: white !important;
  --nojs-fg: black !important;

  background-color: var(--nojs-bg) !important;
  color: var(--nojs-fg) !important;
  caret-color: var(--nojs-fg) !important;
  letter-spacing: .25em !important;
  text-align: center !important;
  border: 1px solid var(--nojs-fg) !important;
  border-radius: 4px !important;
  width: 100% !important;
}
@media (prefers-color-scheme: dark) {
  [data-input-otp] {
    --nojs-bg: black !important;
    --nojs-fg: white !important;
  }
}`

export default function ApiPage() {
  return (
    <DocsPage href={HREF}>
      <H2>Exports</H2>
      <CodeBlock code={IMPORTS} />

      <H2 id="otpinput">OTPInput</H2>
      <P>
        The only component. It renders the container, your slots and the real
        input, and forwards every unrecognised prop to that input — so anything
        you can put on <C>&lt;input&gt;</C> works here, including <C>name</C>,{' '}
        <C>required</C>, <C>autoFocus</C>, <C>onKeyDown</C>, <C>aria-*</C> and{' '}
        <C>data-*</C>.
      </P>

      <H3>Own props</H3>
      <PropsTable
        rows={[
          {
            name: 'maxLength',
            type: 'number',
            required: true,
            description:
              'How many slots the field has, and the maximum length of the value. The render function receives exactly this many slots.',
          },
          {
            name: 'render',
            type: '(props: RenderProps) => React.ReactNode',
            description: (
              <>
                Returns the field&apos;s markup from the current slot state.
                Required unless you pass <code>children</code> and read state
                from <A href="#context">OTPInputContext</A> instead — the two
                are mutually exclusive at the type level.
              </>
            ),
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: (
              <>
                The composition alternative to <code>render</code>. Children are
                wrapped in an <code>OTPInputContext</code> provider.
              </>
            ),
          },
          {
            name: 'value',
            type: 'string',
            description: (
              <>
                Makes the field controlled. Pair it with <code>onChange</code>,
                which receives a string rather than an event. Omit both and the
                component keeps its own state, seeded from{' '}
                <code>defaultValue</code> — though that combination{' '}
                <A href="/docs/troubleshooting#input-elements-must-be-either-controlled-or-uncontrolled">
                  warns in development
                </A>
                .
              </>
            ),
          },
          {
            name: 'onChange',
            type: '(newValue: string) => unknown',
            description: (
              <>
                Receives the new value as a <em>string</em>, not an event — the
                shape you almost always want. Fires for typing, pasting, cutting
                and deleting.
              </>
            ),
          },
          {
            name: 'onComplete',
            type: '(...args: any[]) => unknown',
            description: (
              <>
                Called once when the value transitions from shorter than{' '}
                <code>maxLength</code> to exactly <code>maxLength</code>.
                Editing a full code and refilling it fires it again;
                re-rendering with the same full value does not.
              </>
            ),
          },
          {
            name: 'pattern',
            type: 'string | RegExp',
            description: (
              <>
                Rejects any change whose <em>whole</em> new value fails the test
                — so an invalid keystroke or paste is dropped rather than
                filtered. Also mirrored onto the input&apos;s native{' '}
                <code>pattern</code> attribute. Since 1.4.0 there is no default:
                anything is allowed until you say otherwise.
              </>
            ),
          },
          {
            name: 'placeholder',
            type: 'string',
            description: (
              <>
                Per-slot placeholder characters, exposed as{' '}
                <code>slot.placeholderChar</code> while the value is empty. Also
                set as <code>aria-placeholder</code> on the input.
              </>
            ),
          },
          {
            name: 'pasteTransformer',
            type: '(pasted: string) => string',
            description: (
              <>
                Rewrites clipboard text before it is validated and inserted. The
                usual job is stripping separators, e.g.{' '}
                <code>
                  pasted =&gt; pasted.replaceAll(&apos;-&apos;, &apos;&apos;)
                </code>
                . Providing it also enables the library&apos;s manual paste path
                on every platform, not just iOS.
              </>
            ),
          },
          {
            name: 'containerClassName',
            type: 'string',
            description: (
              <>
                Class name for the container element. Keep{' '}
                <code>className</code> for the input itself — they are separate
                on purpose, and mixing them up is the most common styling
                mistake.
              </>
            ),
          },
          {
            name: 'textAlign',
            type: "'left' | 'center' | 'right'",
            default: "'left'",
            description: (
              <>
                Where the invisible text sits inside the input. It does not move
                your slots; it changes which slot a tap lands on and where iOS
                anchors its selection bubble.{' '}
                <A href="/docs/mobile#text-alignment">Details</A>.
              </>
            ),
          },
          {
            name: 'inputMode',
            type: "'numeric' | 'text' | 'decimal' | 'tel' | 'search' | 'email' | 'url'",
            default: "'numeric'",
            description: (
              <>
                Which on-screen keyboard mobile browsers offer. Switch to{' '}
                <code>&apos;text&apos;</code> for alphanumeric codes — a numeric
                keypad cannot type letters.
              </>
            ),
          },
          {
            name: 'pushPasswordManagerStrategy',
            type: "'increase-width' | 'none'",
            default: "'increase-width'",
            description: (
              <>
                Whether to reserve clipped width so a password manager badge
                lands beside the field instead of over the last slot.{' '}
                <A href="/docs/password-managers">
                  Full explanation and simulator
                </A>
                .
              </>
            ),
          },
          {
            name: 'noScriptCSSFallback',
            type: 'string | null',
            default: 'a built-in stylesheet',
            description: (
              <>
                CSS injected inside <code>&lt;noscript&gt;</code> to make the
                input visible and usable when JavaScript never runs. Pass your
                own string to restyle it, or <code>null</code> to opt out (not
                recommended).
              </>
            ),
          },
          {
            name: 'nonce',
            type: 'string',
            description: (
              <>
                Applied to the <code>&lt;style&gt;</code> tag the library
                injects, so a <code>style-src</code> Content-Security-Policy
                that requires nonces doesn&apos;t block it. Only needed under
                such a CSP.
              </>
            ),
          },
        ]}
      />

      <Callout type="note" title="autoComplete defaults to one-time-code">
        <p>
          Unless you pass your own, the input gets{' '}
          <C>autoComplete=&quot;one-time-code&quot;</C>, which is what lets iOS
          and Android offer the code straight from the SMS. Overriding it turns
          SMS autofill off. <C>spellCheck</C> likewise defaults to{' '}
          <C>false</C> — browsers would underline a full code as a typo — and
          passing your own value overrides it.
        </p>
      </Callout>

      <H2 id="render-props">Render props</H2>
      <CodeBlock code={RENDER_PROPS_TYPE} lang="ts" />
      <PropsTable
        rows={[
          {
            name: 'slots',
            type: 'SlotProps[]',
            description: (
              <>
                One entry per slot, always <code>maxLength</code> long.
              </>
            ),
          },
          {
            name: 'isFocused',
            type: 'boolean',
            description:
              'Whether the real input currently has focus. Useful for a container-level focus ring.',
          },
          {
            name: 'isHovering',
            type: 'boolean',
            description: (
              <>
                Pointer is over the input, and the field is not{' '}
                <code>disabled</code>.
              </>
            ),
          },
        ]}
      />

      <H3>SlotProps</H3>
      <PropsTable
        rows={[
          {
            name: 'char',
            type: 'string | null',
            description: (
              <>
                The character in this slot, or <code>null</code> if the value
                hasn&apos;t reached it yet.
              </>
            ),
          },
          {
            name: 'placeholderChar',
            type: 'string | null',
            description: (
              <>
                This slot&apos;s character from the <code>placeholder</code>{' '}
                prop. Non-null only while the value is completely empty — so{' '}
                <code>char ?? placeholderChar</code> is the whole rendering
                rule.
              </>
            ),
          },
          {
            name: 'isActive',
            type: 'boolean',
            description:
              'This slot is inside the current selection (or is the insert position). More than one slot can be active at once when a range is selected.',
          },
          {
            name: 'hasFakeCaret',
            type: 'boolean',
            description: (
              <>
                True when the slot is active <em>and</em> empty — the one place
                a blinking caret makes sense. The native caret is transparent,
                so this is your cue to draw one.
              </>
            ),
          },
        ]}
      />

      <H2 id="context">OTPInputContext</H2>
      <P>
        The same <C>RenderProps</C> object, delivered through context instead of
        a callback. Drop the <C>render</C> prop, pass children, and any
        descendant can read slot state — which is how shadcn/ui builds{' '}
        <C>{'<InputOTPSlot index={0} />'}</C>.
      </P>
      <CodeBlock code={CONTEXT_EXAMPLE} />
      <Callout type="warning">
        <p>
          Reading the context outside an <C>OTPInput</C> gives you an empty
          object, not an error — <C>slots[index]</C> will be <C>undefined</C>.
          If a composed slot crashes, check that it is actually inside the
          provider.
        </p>
      </Callout>

      <H2 id="data-attributes">Data attributes</H2>
      <P>
        The library publishes its state onto the DOM as well as into React,
        which lets CSS react to it without any prop threading. All three live on
        the input, so <C>group-has-[…]</C> or a sibling selector reaches them
        from your slots.
      </P>
      <AttributesTable
        rows={[
          {
            name: 'data-input-otp',
            on: 'the input',
            description:
              'Marks the real field. Every rule in the library’s injected stylesheet is scoped to this attribute — and so is anything you want to override.',
          },
          {
            name: 'data-input-otp-container',
            on: 'the container',
            description:
              'The wrapper that takes containerClassName. Also what password manager detection measures against.',
          },
          {
            name: 'data-input-otp-placeholder-shown',
            on: 'the input',
            description: (
              <>
                Present while the value is empty. Renamed from{' '}
                <code>data-input-otp-empty</code> in 1.4.0. This is the hook the
                docs&apos; slot uses to dim placeholder characters:{' '}
                <code>
                  group-has-[input[data-input-otp-placeholder-shown]]:opacity-40
                </code>
                .
              </>
            ),
          },
          {
            name: 'data-input-otp-mss / data-input-otp-mse',
            on: 'the input',
            description:
              'The mirrored selection start and end. Mostly an internal debugging aid, but readable if you want CSS or an external tool to follow the caret.',
          },
        ]}
      />
      <P>
        Standard input pseudo-classes work too, and are usually the cleanest
        route to whole-field states: <C>has-[:disabled]</C>,{' '}
        <C>has-[:read-only]</C>, <C>has-[:invalid]</C>, <C>focus-within</C>.
      </P>

      <H2 id="regexps">Exported patterns</H2>
      <P>
        Three ready-made patterns, so the common cases don&apos;t need a regex
        literal in your JSX:
      </P>
      <CodeBlock code={REGEXPS} lang="ts" />
      <Ul>
        <Li>
          <C>REGEXP_ONLY_DIGITS</C> — numeric codes.
        </Li>
        <Li>
          <C>REGEXP_ONLY_CHARS</C> — letters only.
        </Li>
        <Li>
          <C>REGEXP_ONLY_DIGITS_AND_CHARS</C> — alphanumeric, the usual choice
          for backup codes.
        </Li>
      </Ul>

      <H2 id="ref">Ref</H2>
      <P>
        <C>ref</C> is forwarded to the real <C>&lt;input&gt;</C> — not to the
        container. So <C>inputRef.current.focus()</C>, <C>.select()</C>,{' '}
        <C>.setSelectionRange()</C> and <C>react-hook-form</C>&apos;s{' '}
        <C>register()</C> all behave normally.
      </P>

      <H2 id="noscript">Default no-JS stylesheet</H2>
      <P>
        For reference, this is what <C>noScriptCSSFallback</C> contains unless
        you replace it:
      </P>
      <CodeBlock code={NOSCRIPT_DEFAULT} lang="css" />
    </DocsPage>
  )
}
