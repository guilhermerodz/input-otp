import { CodeBlock } from '../../_components/code-block'
import { DocsPage, docsMetadata } from '../../_components/docs-page'
import { A, C, H2, H3, Li, P, Ul } from '../../_components/prose'

const HREF = '/docs/troubleshooting'
export const metadata = docsMetadata(HREF)

const FOCUS_RING = `<OTPInput
  // on the input itself — this is where the stray ring comes from
  className="focus-visible:ring-0 focus-visible:outline-none"
  // not here
  containerClassName="group flex items-center"
/>`

const WRONG_CLASSNAME = `// Nothing appears to happen: these styles land on the invisible input.
<OTPInput className="flex items-center gap-2" />

// This is what you meant.
<OTPInput containerClassName="flex items-center gap-2" />`

const USE_CLIENT = `'use client' // ← at the top of the file that renders OTPInput

import { OTPInput } from 'input-otp'`

const SLOT_UNDEFINED = `// Reading the context outside an OTPInput gives you {} — so slots is undefined.
const { slots } = React.useContext(OTPInputContext)
return <div>{slots[index].char}</div>   // 💥

// The slot component has to be a descendant of the field:
<OTPInput maxLength={6}>
  <Slot index={0} />
</OTPInput>`

const NO_LETTERS = `<OTPInput
  maxLength={6}
  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
  inputMode="text"          // ← without this, mobile gets a keypad
  autoCapitalize="characters"
  autoCorrect="off"
  spellCheck={false}
/>`

const PASTE_FIX = `// A strict pattern rejects the whole paste, hyphens and all.
<OTPInput
  pattern={REGEXP_ONLY_DIGITS}
  pasteTransformer={pasted => pasted.replace(/[^0-9]/g, '')}
/>`

const BAD_PATTERN = `pattern="^\\d{6}$"   // ✗ the first keystroke fails, so nothing can be typed
pattern={REGEXP_ONLY_DIGITS}  // ✓ '^\\d+$' — accepts every partial value`

const Z_INDEX = `// The active slot's ring is clipped by its neighbour's border.
className={cn('relative', isActive && 'z-10 outline-2')}`

const OVERRIDE_WIDTH = `/* Badge wider than the 40px the library reserves. */
[data-input-otp] {
  width: calc(100% + 56px) !important;
  clip-path: inset(0 56px 0 0) !important;
}`

const DEFAULT_VALUE = `// Warns: value and defaultValue both reach the input.
<OTPInput maxLength={6} defaultValue="123" />

// No warning, same result.
const [value, setValue] = React.useState('123')
<OTPInput maxLength={6} value={value} onChange={setValue} />`

const CONTROLLED_STUCK = `// onChange gives you a string, not an event.
<OTPInput value={value} onChange={setValue} />          // ✓
<OTPInput value={value} onChange={e => setValue(e.target.value)} />  // ✗`

export default function TroubleshootingPage() {
  return (
    <DocsPage href={HREF}>
      <P>
        The questions that come up most often, in rough order of frequency.
        Nearly all of them are one of three things: styles on the wrong element,
        a pattern that rejects partial values, or a missing{' '}
        <C>&apos;use client&apos;</C>.
      </P>

      <H2>Styling</H2>

      <H3>My styles do nothing</H3>
      <P>
        You almost certainly put them on <C>className</C>, which goes to the
        invisible input. Visible styling belongs on <C>containerClassName</C>.
      </P>
      <CodeBlock code={WRONG_CLASSNAME} />

      <H3>There&apos;s an unwanted ring or border on focus</H3>
      <P>
        Your CSS reset or design system is styling <C>input:focus</C>, and the
        invisible input is an input. Cancel it there — on <C>className</C>, not
        the container:
      </P>
      <CodeBlock code={FOCUS_RING} />

      <H3>The active slot&apos;s outline is clipped</H3>
      <P>
        With a shared border, the next slot paints over the previous one&apos;s
        outline. Raise the active slot:
      </P>
      <CodeBlock code={Z_INDEX} />

      <H3>
        <C>containerClassName</C> has no Tailwind autocomplete
      </H3>
      <P>
        It isn&apos;t named <C>className</C>, so the extension ignores it. Add
        this to <C>.vscode/settings.json</C>:
      </P>
      <CodeBlock
        code={`{ "tailwindCSS.classAttributes": ["class", "className", ".*ClassName"] }`}
        lang="json"
      />

      <H2>Input and validation</H2>

      <H3>I can&apos;t type letters</H3>
      <P>
        Two independent causes, and it&apos;s usually both: a digits-only{' '}
        <C>pattern</C>, and <C>inputMode</C> still at its <C>numeric</C> default
        so the mobile keyboard has no letters on it.
      </P>
      <CodeBlock code={NO_LETTERS} />

      <H3>Nothing can be typed at all</H3>
      <P>
        Your pattern pins the length. It is tested against every intermediate
        value, so a one-character value has to pass:
      </P>
      <CodeBlock code={BAD_PATTERN} />

      <H3>Pasting a code does nothing</H3>
      <P>
        The clipboard text has something your pattern rejects — a hyphen, a
        space, a trailing newline — and a failed pattern discards the whole
        paste rather than filtering it.
      </P>
      <CodeBlock code={PASTE_FIX} />

      <H3>The value never changes</H3>
      <P>
        <C>onChange</C> receives a <em>string</em>, not an event. Reading{' '}
        <C>e.target.value</C> off it gives you <C>undefined</C>:
      </P>
      <CodeBlock code={CONTROLLED_STUCK} />

      <H3>
        <C>onComplete</C> fires more than once per code
      </H3>
      <P>
        It fires on the transition into a full value, so editing a complete code
        and refilling it fires again — that is intended. If you are seeing
        duplicate network requests, disable the field while the request is in
        flight; see{' '}
        <A href="/docs/forms#while-the-request-is-in-flight">Forms</A>.
      </P>

      <H2>Setup</H2>

      <H3>&quot;useState only works in a Client Component&quot;</H3>
      <P>
        The component needs the browser. In the Next.js App Router, the file
        that renders it has to be a client component:
      </P>
      <CodeBlock code={USE_CLIENT} />

      <H3>
        <C>Cannot read properties of undefined (reading &apos;char&apos;)</C>
      </H3>
      <P>
        A composed slot is reading <C>OTPInputContext</C> from outside an{' '}
        <C>OTPInput</C>. The context defaults to an empty object rather than
        throwing, so the failure surfaces one level down:
      </P>
      <CodeBlock code={SLOT_UNDEFINED} />

      <H3>
        &quot;Input elements must be either controlled or uncontrolled&quot;
      </H3>
      <P>
        Passing <C>defaultValue</C> produces this React warning. The component
        always renders the input with a <C>value</C> — it reads{' '}
        <C>defaultValue</C> to seed its internal state, and then forwards it to
        the input along with everything else, so React sees both. It is noise
        rather than breakage: the value seeds correctly either way. To keep the
        console clean, seed the state yourself instead:
      </P>
      <CodeBlock code={DEFAULT_VALUE} />

      <H3>Hydration mismatch on first load</H3>
      <P>
        Usually because something in your slot markup depends on a value the
        server can&apos;t know. Note that <C>isFocused</C> and <C>isHovering</C>{' '}
        are both <C>false</C> on the server, and the selection mirror is{' '}
        <C>null</C> — so no slot is active in the initial HTML, by design.
        Don&apos;t branch your markup structure on those; branch classes.
      </P>

      <H2>Password managers</H2>

      <H3>The badge still covers my last slot</H3>
      <P>
        The reserved gutter is a fixed 40px. A wider badge, or one anchored
        further in than 18px, will overlap anyway. Widen it yourself:
      </P>
      <CodeBlock code={OVERRIDE_WIDTH} lang="css" />
      <P>
        Or check whether the accommodation ran at all — <C>input.style.width</C>{' '}
        should read <C>calc(100% + 40px)</C>. The{' '}
        <A href="/docs/password-managers">simulator</A> shows both values live.
      </P>

      <H3>I don&apos;t want a badge on this field at all</H3>
      <P>
        Turn off the library&apos;s accommodation and opt out with each
        vendor&apos;s own attribute —{' '}
        <A href="/docs/password-managers#blocking-the-badge-altogether">
          the exact set is here
        </A>
        . Do both, or you get no badge and 40px reserved for one.
      </P>

      <H2>Behaviour that looks like a bug and isn&apos;t</H2>
      <Ul>
        <Li>
          <strong>Typing replaces the character under the caret</strong> rather
          than inserting before it. Deliberate: a collapsed caret is widened to
          a one-character range so a slot can be highlighted, which makes typing
          overwrite. The exception is the append position at the end of a
          partial code.
        </Li>
        <Li>
          <strong>Several slots highlight at once.</strong> That&apos;s a real
          multi-character selection — <Shift />
          -arrow or a drag. All the covered slots report <C>isActive</C>.
        </Li>
        <Li>
          <strong>No slot is highlighted when the field is blurred.</strong> The
          mirror is cleared on blur, so nothing is active. Style{' '}
          <C>focus-within</C> if you want a resting state.
        </Li>
        <Li>
          <strong>
            The input is 40px wider than the container in devtools.
          </strong>{' '}
          Password manager accommodation. The extra width is clipped away and
          hit-testing is unaffected;{' '}
          <A href="/docs/password-managers">the details</A>, including a note on
          when it fires more eagerly than intended.
        </Li>
        <Li>
          <strong>
            A <C>&lt;style id=&quot;input-otp-style&quot;&gt;</C> appeared in{' '}
            <C>head</C>.
          </strong>{' '}
          One per page, inserted once. Every rule is scoped to{' '}
          <C>[data-input-otp]</C>.
        </Li>
      </Ul>

      <H2>Still stuck</H2>
      <P>
        Open an issue on{' '}
        <A href="https://github.com/guilhermerodz/input-otp/issues">GitHub</A>.
        A minimal reproduction plus the browser and OS gets you an answer much
        faster — and if it involves iOS or a password manager, say so up front,
        because neither can be reproduced in a headless browser.
      </P>
    </DocsPage>
  )
}

function Shift() {
  return (
    <kbd className="inline-flex items-center rounded border border-border bg-muted px-1.5 font-mono text-[0.8em] text-foreground">
      ⇧
    </kbd>
  )
}
