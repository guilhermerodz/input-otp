import { CodeBlock } from '../../_components/code-block'
import { ComponentPreview } from '../../_components/component-preview'
import { DocsPage, docsMetadata } from '../../_components/docs-page'
import { A, C, Callout, H2, H3, Li, P, Ul } from '../../_components/prose'
import { AlphanumericDemo } from '../../_demos/alphanumeric'
import { TextAlignDemo } from '../../_demos/text-align'

const HREF = '/docs/mobile'
export const metadata = docsMetadata(HREF)

const AUTOCOMPLETE = `// Set for you unless you override it.
<input autocomplete="one-time-code" />`

const SMS_FORMAT = `Your verification code is 123456

@example.com #123456`

const IOS_CSS = `@supports (-webkit-touch-callout: none) {
  [data-input-otp] {
    letter-spacing: -.6em !important;   /* even tighter than the -.5em baseline */
    font-weight: 100 !important;
    font-stretch: ultra-condensed;
    font-optical-sizing: none !important;
    left: -1px !important;              /* nudge, then compensate */
    right: 1px !important;
  }
}`

const IOS_DETECT = `// The same @supports query, from JS — there is no better iOS signal.
const isIOS =
  typeof window !== 'undefined' &&
  window?.CSS?.supports?.('-webkit-touch-callout', 'none')`

const AUTOFILL_CSS = `[data-input-otp]:autofill,
[data-input-otp]:-webkit-autofill {
  background: transparent !important;
  color: transparent !important;
  border-color: transparent !important;
  opacity: 0 !important;
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
  -webkit-text-fill-color: transparent !important;
}`

const AUTOFILL_JS = `// Some browsers keep the :autofill state (and its yellow background) until
// the next real input event. So dispatch one.
inputRef.current?.dispatchEvent(new Event('input'))`

const NOSCRIPT = `<OTPInput
  maxLength={6}
  noScriptCSSFallback={\`
    [data-input-otp] {
      background: white !important;
      color: black !important;
      caret-color: black !important;
      letter-spacing: .25em !important;
      text-align: center !important;
      border: 1px solid black !important;
      border-radius: 4px !important;
      width: 100% !important;
    }
  \`}
/>`

const KEYBOARDS = `// numeric codes — a keypad, no letters
<OTPInput maxLength={6} inputMode="numeric" pattern={REGEXP_ONLY_DIGITS} />

// alphanumeric codes — the full keyboard
<OTPInput maxLength={6} inputMode="text" pattern={REGEXP_ONLY_DIGITS_AND_CHARS} />

// avoid: 'tel' adds *, # and pause characters your pattern will reject
<OTPInput maxLength={6} inputMode="tel" />`

export default function MobilePage() {
  return (
    <DocsPage href={HREF}>
      <P>
        Most of the code in this library exists because of the things on this
        page. A single invisible input is a clean idea on a desktop browser; on
        a phone it runs into a decade of platform behaviour that assumes inputs
        are visible.
      </P>

      <H2>SMS autofill</H2>
      <P>
        The payoff for keeping one input.{' '}
        <C>autocomplete=&quot;one-time-code&quot;</C> is set by default, and
        both iOS and Android will offer the code from the incoming message —
        dropping all six characters in at once.
      </P>
      <CodeBlock code={AUTOCOMPLETE} lang="html" />
      <Ul>
        <Li>
          This only works on a <strong>single</strong> field. Split the code
          across six inputs and the platform has nowhere to put it — the reason
          the six-input pattern feels worse on a phone than in a desktop
          browser.
        </Li>
        <Li>
          Overriding <C>autoComplete</C> with anything else turns it off.
        </Li>
        <Li>
          The value arrives as one change, so <C>onComplete</C> fires exactly
          once — which is what makes <A href="/docs/forms">auto-submit</A> feel
          instant.
        </Li>
      </Ul>
      <H3>Getting the message right</H3>
      <P>
        Autofill depends as much on your SMS copy as on your markup. iOS looks
        for a recognisable code near a keyword; Android&apos;s SMS Retriever API
        wants the <C>@domain #code</C> footer:
      </P>
      <CodeBlock code={SMS_FORMAT} lang="text" />
      <Callout type="note">
        <p>
          Autofill also cannot be tested in a simulator or in Playwright — it
          needs a real device receiving a real message. It is the one feature
          here you have to verify by hand.
        </p>
      </Callout>

      <H2>iOS</H2>
      <P>
        iOS Safari is the hardest surface, and it needs three separate
        accommodations.
      </P>

      <H3>The input cannot be invisible</H3>
      <P>
        iOS refuses to show the long-press <em>Paste</em> menu on an input with{' '}
        <C>opacity: 0</C> — which would be the obvious way to hide the field. So
        the input keeps <C>opacity: 1</C> and is hidden by making its{' '}
        <C>color</C>, <C>caret-color</C>, <C>background</C> and{' '}
        <C>::selection</C> transparent instead. Every one of those has to be
        transparent independently, which is why the injected stylesheet exists
        at all.
      </P>

      <H3>The text is still laid out</H3>
      <P>
        An invisible glyph still occupies space, and iOS&apos;s text metrics are
        different enough that <C>-.5em</C> of negative tracking isn&apos;t
        enough to keep the characters inside the field. A set of iOS-only
        overrides squeezes them further:
      </P>
      <CodeBlock code={IOS_CSS} lang="css" />
      <P>
        The <C>left: -1px</C> / <C>right: 1px</C> pair is the smallest of these
        and the most telling: the nudge that fixed the glyph position also
        shifted the field, so the second declaration puts the box back.
      </P>
      <P>
        Detection is the same <C>@supports</C> query, read from JavaScript —
        there is no more reliable iOS signal that doesn&apos;t involve sniffing
        the user agent:
      </P>
      <CodeBlock code={IOS_DETECT} lang="ts" />
      <Callout type="warning" title="This branch is untestable in CI">
        <p>
          <C>-webkit-touch-callout</C> is supported by exactly one engine on
          exactly one platform, so no headless browser — including
          Playwright&apos;s WebKit — ever takes this path. Changes to the iOS
          behaviour have to be checked on a real device.
        </p>
      </Callout>

      <H3>Paste has to be handled by hand</H3>
      <P>
        Even with the menu showing, letting the browser perform the insertion on
        iOS produces the wrong value. So on iOS — and on every platform once you
        pass <C>pasteTransformer</C> — the library takes the paste over: it
        reads <C>clipboardData</C>, calls <C>preventDefault()</C>, splices the
        text in at the caret (replacing the selection if there is one),
        truncates to <C>maxLength</C>, checks the pattern, and restores the
        selection itself.
      </P>
      <P>
        That restoration is the part worth knowing about: after a paste the
        caret is placed at <C>min(newValue.length, maxLength - 1)</C> through{' '}
        <C>newValue.length</C> — so a full code leaves the last slot selected
        rather than leaving the caret past the end.
      </P>

      <H2>Android</H2>
      <P>
        Android is mostly unremarkable, which is the benefit of using a real
        input. Two things to get right:
      </P>
      <ComponentPreview name="alphanumeric">
        <AlphanumericDemo />
      </ComponentPreview>
      <CodeBlock code={KEYBOARDS} />
      <Ul>
        <Li>
          <strong>Pick the keyboard deliberately.</strong> <C>inputMode</C>{' '}
          defaults to <C>numeric</C>. An alphanumeric field that forgets to
          change it hands mobile users a keypad with no letters on it.
        </Li>
        <Li>
          <strong>Expect autocorrect and prediction.</strong> Add{' '}
          <C>autoCorrect=&quot;off&quot;</C> and <C>spellCheck={'{false}'}</C>{' '}
          for alphanumeric codes; some keyboards will otherwise try to be
          helpful about a six-letter &quot;word&quot;.
        </Li>
        <Li>
          The clipboard bar, the text-selection handles and the magnifier all
          work, because they operate on the input&apos;s selection — the same
          selection the library mirrors.
        </Li>
      </Ul>

      <H2 id="text-alignment">Text alignment</H2>
      <P>
        <C>textAlign</C> is a mobile prop wearing a typography prop&apos;s name.
        It does not move your slots. What it changes is where the invisible text
        — and therefore the native caret, the selection band and the iOS
        long-press bubble — sits inside the field.
      </P>
      <ComponentPreview name="text-align">
        <TextAlignDemo />
      </ComponentPreview>
      <P>
        The default, <C>left</C>, is the recommendation. <C>center</C> looks
        tidier if you ever reveal the input, but it changes which slot a tap
        lands on: the browser resolves a tap to the nearest character position,
        and with centred text those positions no longer line up with the slots
        the user is aiming at.
      </P>

      <H2>Autofill styling</H2>
      <P>
        Browsers paint autofilled fields with their own background — famously a
        pale yellow — using rules that beat almost anything you write. On a
        field that is supposed to be transparent, that lights up as a coloured
        rectangle over your slots. Two defences, both needed:
      </P>
      <CodeBlock code={AUTOFILL_CSS} lang="css" />
      <P>
        And because some browsers keep the <C>:autofill</C> state until the next
        real input event, one is dispatched:
      </P>
      <CodeBlock code={AUTOFILL_JS} lang="ts" />
      <P>
        That dispatch is fired from a small helper that runs the same callback
        at <C>0ms</C>, <C>10ms</C> and <C>50ms</C> — a pragmatic answer to the
        fact that different browsers settle their autofill and selection state
        at different moments, and there is no event that reliably marks
        &quot;done&quot;.
      </P>

      <H2 id="without-javascript">Without JavaScript</H2>
      <P>
        A transparent input with no script to drive it is an invisible, unusable
        field. So the component renders a <C>&lt;noscript&gt;</C> stylesheet —
        first in the output, before the field itself — that turns the input back
        into a plain, visible, perfectly usable text box.
      </P>
      <P>
        Your slots stay in the page (they are server-rendered markup), so the
        fallback deliberately gives the input an opaque background: it covers
        them rather than fighting them for the same space.
      </P>
      <CodeBlock code={NOSCRIPT} />
      <Ul>
        <Li>Pass your own CSS string to match your design system.</Li>
        <Li>
          Pass <C>null</C> to remove the fallback. Not recommended — it means a
          progressive-enhancement failure leaves users staring at an empty
          field.
        </Li>
        <Li>
          It is a <C>&lt;noscript&gt;</C> tag rather than the <C>scripting</C>{' '}
          CSS media query on purpose: <C>noscript</C> is honoured during the
          initial parse, which is exactly when the bundle hasn&apos;t arrived.
        </Li>
      </Ul>

      <H2>Testing across platforms</H2>
      <Ul>
        <Li>
          <strong>Playwright covers the core.</strong> Typing, selection,
          deletion, paste and the slot derivation are all testable headlessly,
          across Chromium, Firefox and WebKit.
        </Li>
        <Li>
          <strong>The iOS branch is not.</strong> The <C>@supports</C> guard
          never matches in a headless engine.
        </Li>
        <Li>
          <strong>Nor is SMS autofill, nor password manager badges.</strong>{' '}
          Both need a real device or a real browser extension — which is what
          the <A href="/docs/password-managers">simulator</A> is for.
        </Li>
      </Ul>
    </DocsPage>
  )
}
