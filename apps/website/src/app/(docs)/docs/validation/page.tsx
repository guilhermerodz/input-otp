import { ClipboardSeed } from '../../_components/clipboard-seed'
import { CodeBlock } from '../../_components/code-block'
import { ComponentPreview } from '../../_components/component-preview'
import { DocsPage, docsMetadata } from '../../_components/docs-page'
import { A, C, Callout, H2, H3, Li, Ol, P, Ul } from '../../_components/prose'
import { AlphanumericDemo } from '../../_demos/alphanumeric'
import { DigitsOnlyDemo } from '../../_demos/digits-only'
import { PasteTransformerDemo } from '../../_demos/paste-transformer'

const HREF = '/docs/validation'
export const metadata = docsMetadata(HREF)

const PATTERN_BEHAVIOUR = `// Simplified from the change handler:
const newValue = event.currentTarget.value.slice(0, maxLength)

if (newValue.length > 0 && regexp && !regexp.test(newValue)) {
  return // the change is dropped whole — nothing is filtered out of it
}

onChange(newValue)`

const CUSTOM_PATTERN = `// Crockford base32: digits and letters, minus I, L, O and U.
<OTPInput maxLength={8} pattern="^[0-9A-HJKMNP-TV-Z]+$" inputMode="text" />

// Or hand it a RegExp — it is used as-is, so flags are yours to choose.
<OTPInput maxLength={6} pattern={/^[0-9a-f]+$/i} />`

const CASE_NORMALISE = `const [value, setValue] = React.useState('')

<OTPInput
  value={value}
  onChange={next => setValue(next.toUpperCase())}
  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
  maxLength={6}
/>`

const PASTE_VARIANTS = `// Strip anything that isn't a digit — hyphens, spaces, invisible characters
// that came along for the ride from an email client.
pasteTransformer={pasted => pasted.replace(/[^0-9]/g, '')}

// Pull the code out of a whole sentence: "Your code is 123456."
pasteTransformer={pasted => pasted.match(/\\d{6}/)?.[0] ?? pasted}

// Normalise case for an alphanumeric field.
pasteTransformer={pasted => pasted.trim().toUpperCase()}`

const VALIDATE_ON_COMPLETE = `<OTPInput
  maxLength={6}
  pattern={REGEXP_ONLY_DIGITS}
  onComplete={async code => {
    const result = await verify(code)
    if (!result.ok) setError('That code is incorrect.')
  }}
/>`

export default function ValidationPage() {
  return (
    <DocsPage href={HREF}>
      <P>
        Validation here splits cleanly in two. <C>pattern</C> decides what is
        allowed to enter the field at all — a syntax gate, enforced on every
        keystroke and paste. Whether the code is <em>correct</em> is a question
        for your server, and belongs in <C>onComplete</C>.
      </P>

      <H2>pattern</H2>
      <P>
        Pass a string or a <C>RegExp</C>. Three common ones are exported so you
        don&apos;t have to write them:
      </P>
      <ComponentPreview name="digits-only">
        <DigitsOnlyDemo />
      </ComponentPreview>

      <Callout type="note" title="No default pattern since 1.4.0">
        <p>
          Earlier versions applied <C>REGEXP_ONLY_DIGITS</C> whether you asked
          or not, which quietly broke alphanumeric codes — mobile users in
          particular couldn&apos;t type or paste them and got no feedback about
          why. Today nothing is restricted until you set <C>pattern</C>{' '}
          yourself.
        </p>
      </Callout>

      <H3>It rejects, it doesn&apos;t filter</H3>
      <P>
        This is the behaviour to internalise: the pattern is tested against the{' '}
        <em>entire</em> prospective value, and a failure discards the whole
        change. It never strips the offending characters and keeps the rest.
      </P>
      <CodeBlock code={PATTERN_BEHAVIOUR} lang="ts" />
      <P>Which means, with a digits-only pattern:</P>
      <Ul>
        <Li>
          Typing <C>a</C> does nothing at all — no flicker, no partial insert.
        </Li>
        <Li>
          Pasting <C>12a456</C> does nothing either. Not <C>12456</C>, not{' '}
          <C>12</C>. Nothing.
        </Li>
        <Li>
          So your pattern must accept every <em>intermediate</em> value, not
          just the finished one. Anchoring with <C>+</C> rather than a fixed{' '}
          <C>{'{6}'}</C> is what makes that work — <C>^\d+$</C> matches <C>1</C>{' '}
          as happily as <C>123456</C>.
        </Li>
      </Ul>
      <Callout type="warning" title="Don’t pin the length in the pattern">
        <p>
          <C>{'^\\d{6}$'}</C> looks right and is a trap: the very first
          keystroke produces a one-character value, which fails, so the field
          can never be filled. Length is <C>maxLength</C>&apos;s job.
        </p>
      </Callout>

      <H3>Custom patterns</H3>
      <CodeBlock code={CUSTOM_PATTERN} />
      <P>
        The pattern is also mirrored onto the input&apos;s native <C>pattern</C>{' '}
        attribute, so native form validation and <C>:invalid</C> line up with it
        for free.
      </P>

      <H2>Letters, and the keyboard problem</H2>
      <P>
        <C>inputMode</C> defaults to <C>numeric</C>, which on a phone means a
        keypad with no letters on it. An alphanumeric field that forgets to
        change this is unusable on mobile — the single most reported issue with
        codes that aren&apos;t purely numeric.
      </P>
      <ComponentPreview name="alphanumeric">
        <AlphanumericDemo />
      </ComponentPreview>
      <P>
        <C>autoCapitalize=&quot;characters&quot;</C> nudges mobile keyboards
        toward caps, but it is a hint, not a guarantee. If your codes are
        case-insensitive, normalise the value rather than trusting the keyboard:
      </P>
      <CodeBlock code={CASE_NORMALISE} />

      <H2>Pasting</H2>
      <P>
        Codes arrive from the outside world with punctuation attached —{' '}
        <C>123-456</C> from an email, <C>123 456</C> from a chat message, a
        trailing newline from a terminal. Against a strict pattern, every one of
        those pastes silently does nothing.
      </P>
      <P>
        <C>pasteTransformer</C> runs on the clipboard text before validation
        sees it, so the paste that would have been rejected becomes the paste
        you wanted:
      </P>
      <ComponentPreview name="paste-transformer">
        <div className="flex flex-col items-center gap-5">
          <PasteTransformerDemo />
          <ClipboardSeed value="123-456" />
        </div>
      </ComponentPreview>
      <CodeBlock code={PASTE_VARIANTS} lang="ts" />

      <Callout type="note" title="What providing it changes">
        <p>
          Without <C>pasteTransformer</C>, the library only takes over the paste
          event on iOS (where it has to —{' '}
          <A href="/docs/edge-cases#ios-refuses-to-paste-into-an-invisible-input">
            see why
          </A>
          ). Providing it switches on that manual path everywhere, which means
          pastes are inserted by the library on all platforms: at the caret,
          replacing the selection if there is one, and truncated to{' '}
          <C>maxLength</C>.
        </p>
      </Callout>

      <H2>Verifying the code</H2>
      <P>
        <C>onComplete</C> fires exactly once on the transition into a full value
        — including when the value arrives all at once from a paste or an SMS
        autofill, which is precisely when you want it.
      </P>
      <CodeBlock code={VALIDATE_ON_COMPLETE} />
      <P>The order to think in, for a field that also shows errors:</P>
      <Ol>
        <Li>
          <C>pattern</C> keeps malformed input out.
        </Li>
        <Li>
          <C>onComplete</C> submits the finished code.
        </Li>
        <Li>
          Your rejection sets an error state; <C>aria-invalid</C> and{' '}
          <C>role=&quot;alert&quot;</C> announce it.
        </Li>
        <Li>
          <C>onChange</C> clears the error as soon as the user edits, so they
          aren&apos;t shouted at while fixing it.
        </Li>
      </Ol>
      <P>
        <A href="/docs/forms">Forms</A> has that wired up end to end.
      </P>
    </DocsPage>
  )
}
