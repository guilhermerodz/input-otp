import { CodeBlock } from '../../_components/code-block'
import { ComponentPreview } from '../../_components/component-preview'
import { DocsPage, docsMetadata } from '../../_components/docs-page'
import { A, C, Callout, H2, H3, Kbd, Li, P, Ul } from '../../_components/prose'
import { LabelledDemo } from '../../_demos/labelled'
import { RtlDemo } from '../../_demos/rtl'

const HREF = '/docs/accessibility'
export const metadata = docsMetadata(HREF)

const LABEL_OPTIONS = `// Best: a visible label, associated by id.
<label htmlFor="code">Verification code</label>
<OTPInput id="code" name="code" maxLength={6} />

// When the design has no room for one:
<OTPInput aria-label="Verification code" maxLength={6} />

// When a heading already says it:
<h2 id="mfa-title">Enter your verification code</h2>
<OTPInput aria-labelledby="mfa-title" maxLength={6} />`

const DESCRIBEDBY = `<OTPInput
  id="code"
  maxLength={6}
  aria-describedby="code-hint code-error"
  aria-invalid={error !== null}
/>

<p id="code-hint">Enter the 6-digit code sent to •••• 4417.</p>
{error && <p id="code-error" role="alert">{error}</p>}`

const SEPARATOR = `{/* The value has no dash in it, so the dash must not be announced. */}
<div aria-hidden className="flex w-10 justify-center">
  <div className="h-1 w-3 rounded-full bg-border" />
</div>`

const SLOT_ARIA = `{/* Don't do this. The slots are decoration; the input is the control. */}
<div role="textbox" aria-label={\`Digit \${idx + 1}\`} tabIndex={0}>
  {slot.char}
</div>`

const LIVE_REGION = `{/* Optional: confirm arrival of an autofilled code. */}
<p role="status" className="sr-only">
  {value.length === maxLength ? 'Code complete' : ''}
</p>`

export default function AccessibilityPage() {
  return (
    <DocsPage href={HREF}>
      <P>
        Accessibility is the reason this library is built the way it is.
        Everything on this page follows from having one real input instead of
        six fake ones — which means most of it is about what you{' '}
        <em>don&apos;t</em> have to do.
      </P>

      <H2>What a screen reader hears</H2>
      <P>
        With six inputs, a screen reader encounters six separate unlabelled text
        fields. Focus jumps between them programmatically after every keystroke,
        so the reader re-announces a new control mid-word, the user has no idea
        how many characters are left, and reviewing what they typed means
        tabbing through the set and listening to each box in isolation.
      </P>
      <P>
        With one input there is one control, one accessible name, one value and
        one caret. <Kbd>←</Kbd> and <Kbd>→</Kbd> read out the characters.
        Select-all reads the whole code. Nothing is announced that the user
        didn&apos;t cause.
      </P>
      <Callout type="note" title="Where this came from">
        <p>
          Stripe&apos;s MFA input was the original inspiration — and the
          original complaint. It renders a one-character input with sibling divs
          cloning the characters, and the screen-reader experience never
          recovers from that. The fix was to keep the input whole and make it
          invisible instead.
        </p>
      </Callout>

      <H2>Labelling</H2>
      <P>
        The one thing you must do. An unlabelled field is announced as
        &quot;edit text&quot; with no indication of what it wants.
      </P>
      <ComponentPreview name="labelled">
        <LabelledDemo />
      </ComponentPreview>
      <CodeBlock code={LABEL_OPTIONS} />
      <P>
        Because <C>id</C> is forwarded to the real input, a plain{' '}
        <C>&lt;label htmlFor&gt;</C> works — and clicking the label focuses the
        field, with the caret placed correctly.
      </P>

      <H3>Instructions and errors</H3>
      <P>
        Say how long the code is and where it came from. Point{' '}
        <C>aria-describedby</C> at both the hint and the error; the ids are read
        in the order you list them, and a missing id is skipped rather than
        breaking.
      </P>
      <CodeBlock code={DESCRIBEDBY} />

      <H2>Don&apos;t re-label the slots</H2>
      <P>
        The most common accessibility mistake made <em>with</em> this library is
        adding ARIA to the decoration. The slots are presentational; the input
        is the control. Giving a slot a role, a label or a <C>tabIndex</C>{' '}
        creates phantom controls that trap keyboard users in a field that
        isn&apos;t real.
      </P>
      <CodeBlock code={SLOT_ARIA} />
      <P>
        Separators are the same story — visual only, and <C>aria-hidden</C> so
        they aren&apos;t announced as part of a value that doesn&apos;t contain
        them:
      </P>
      <CodeBlock code={SEPARATOR} />

      <H2>Keyboard</H2>
      <P>
        None of this is implemented by the library. It is what a text input
        does, and it keeps working because the input was never taken apart:
      </P>
      <div className="mt-6 overflow-hidden rounded-lg border border-border/70">
        <dl className="divide-y divide-border/60 text-sm">
          {[
            [
              '←  →',
              'Move between slots. The selection is widened to one character, so the slot you land on is the slot you edit.',
            ],
            [
              '⇧ ←  ⇧ →',
              'Extend a selection across several slots. All of them report isActive.',
            ],
            ['⌘A  Ctrl A', 'Select the whole code. Typing replaces it.'],
            [
              '⌫  Delete',
              'Delete backwards or forwards, exactly as in a text field.',
            ],
            ['⌥⌫  Ctrl ⌫', 'Delete the whole code — it is one “word”.'],
            [
              '⌘C  ⌘X  ⌘V',
              'Copy, cut and paste, including a partial paste into the middle of a half-filled code.',
            ],
            ['⌘Z', 'Undo. Native input history, not a reimplementation.'],
            [
              'Tab',
              'Leave the field. There is exactly one tab stop, not maxLength of them.',
            ],
          ].map(([keys, meaning]) => (
            <div
              key={keys}
              className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)] sm:gap-6 sm:px-5"
            >
              <dt className="font-mono text-xs text-foreground">{keys}</dt>
              <dd className="text-[0.8125rem] leading-6 text-muted-foreground">
                {meaning}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <Callout type="tip" title="One tab stop">
        <p>
          Worth stating plainly, because it is the accessibility difference
          users notice first: a six-input field costs six tab stops to get past.
          This one costs one.
        </p>
      </Callout>

      <H2>Focus visibility</H2>
      <P>
        The input&apos;s own outline is removed — a ring around an invisible box
        floating over your slots would look like a bug. So the visible focus
        state is your responsibility, and it must exist.
      </P>
      <Ul>
        <Li>
          Style the active slot from <C>isActive</C>, and make it obvious: a 2px
          outline, not a subtle tint.
        </Li>
        <Li>
          Consider a container-level ring as well, via{' '}
          <C>has-[:focus-visible]</C> — it tells the user the field is focused
          even when the active slot is off to one side.
        </Li>
        <Li>
          Don&apos;t rely on the blinking caret alone. It is invisible to anyone
          using <C>prefers-reduced-motion</C>, since the animation should be
          behind <C>motion-safe:</C>.
        </Li>
      </Ul>

      <H2>Announcing completion</H2>
      <P>
        When a code is autofilled from an SMS, every slot fills at once with no
        keystrokes — which a screen reader has no reason to mention. If your
        flow doesn&apos;t immediately submit, a small live region closes that
        gap:
      </P>
      <CodeBlock code={LIVE_REGION} />
      <P>
        Keep it <C>role=&quot;status&quot;</C> (polite). An assertive region
        will interrupt whatever the user is listening to.
      </P>

      <H2>Right-to-left</H2>
      <P>
        Codes are read left-to-right in every locale, so the slot row should
        keep its direction while the page around it flips. Set{' '}
        <C>dir=&quot;ltr&quot;</C> on the field and let everything else inherit
        RTL:
      </P>
      <ComponentPreview name="rtl">
        <RtlDemo />
      </ComponentPreview>

      <H2>Zoom and reflow</H2>
      <P>
        Six slots at a comfortable size will overflow a 320px viewport at 200%
        zoom. Because your slots are just elements, the fix is ordinary CSS —
        shrink the slots at small widths, or drop the separator. Avoid wrapping
        the row onto two lines: the selection is a single continuous range, and
        a wrapped row makes multi-slot selections read as two disconnected
        fragments.
      </P>

      <H2>A short audit</H2>
      <P>
        Before shipping a field, check these. They are the ones that actually
        get missed:
      </P>
      <Ul>
        <Li>
          The field has an accessible name — read it out loud from the label.
        </Li>
        <Li>The hint states the code&apos;s length.</Li>
        <Li>
          Focus is visible without motion, and visible on the container as well
          as the slot.
        </Li>
        <Li>
          Errors are announced, associated with the field, and cleared when the
          user edits.
        </Li>
        <Li>Nothing in the slot markup has a role, a label or a tab stop.</Li>
        <Li>
          Separators are <C>aria-hidden</C>.
        </Li>
        <Li>Tabbing through the form hits the field exactly once.</Li>
      </Ul>
      <P>
        <A href="/docs/mobile">Mobile &amp; platforms</A> covers the rest of the
        real-world behaviour: SMS autofill, iOS paste, and what happens when
        JavaScript never arrives.
      </P>
    </DocsPage>
  )
}
