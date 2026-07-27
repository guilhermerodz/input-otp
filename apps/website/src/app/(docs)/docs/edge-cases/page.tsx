import { CodeBlock } from '../../_components/code-block'
import { DocsPage, docsMetadata } from '../../_components/docs-page'
import { EdgeCase } from '../../_components/edge-case'
import { A, C, Callout, H2, Kbd, P } from '../../_components/prose'

const HREF = '/docs/edge-cases'
export const metadata = docsMetadata(HREF)

const CARET_WIDENING = `if (isSingleCaret && !isInsertMode) {
  if (c === 0) {
    [start, end, direction] = [0, 1, 'forward']
  } else if (c === maxLength) {
    [start, end, direction] = [c - 1, c, 'backward']
  } else if (maxLength > 1 && value.length > 1) {
    // …direction-aware, see below
  }
  input.setSelectionRange(start, end, direction)
}`

const INSERT_MODE = `const isInsertMode = start === value.length && value.length < maxLength

// A collapsed caret is only meaningful here: at the end of a code that
// isn't full yet. Widening it would select the last character, and the
// next keystroke would replace it instead of appending.`

const DIRECTION = `direction = c < prevEnd ? 'backward' : 'forward'

const wasPreviouslyInserting = prevStart === prevEnd && prevStart < maxLength
if (direction === 'backward' && !wasPreviouslyInserting) {
  offset = -1
}

[start, end] = [offset + c, offset + c + 1]`

const DELETE_DISPATCH = `const maybeHasDeleted =
  typeof previousValue === 'string' && newValue.length < previousValue.length

if (maybeHasDeleted) {
  // Cutting and deleting don't fire selectionchange, so fire it ourselves.
  document.dispatchEvent(new Event('selectionchange'))
}`

const SELECTION_CSS = `[data-input-otp]::selection {
  background: transparent !important;
  color: transparent !important;
}`

const AUTOFILL = `[data-input-otp]:autofill,
[data-input-otp]:-webkit-autofill {
  background: transparent !important;
  color: transparent !important;
  border-color: transparent !important;
  opacity: 0 !important;
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
  -webkit-text-fill-color: transparent !important;
}`

const SYNC_TIMEOUTS = `export function syncTimeouts(cb: () => unknown) {
  return [
    setTimeout(cb, 0),   // fast machines
    setTimeout(cb, 10),
    setTimeout(cb, 50),
  ]
}`

const IOS_METRICS = `@supports (-webkit-touch-callout: none) {
  [data-input-otp] {
    font-size: 16px !important;       /* the focus-zoom threshold */
    width: 1000% !important;          /* 10x layout box…           */
    height: 1000% !important;
    transform: scale(0.1) !important; /* …painted at 1/10th        */
    transform-origin: 0 0 !important;
    letter-spacing: -.6em !important;
    text-indent: -9999px !important;  /* park the text offscreen   */
    left: -1px !important;
    right: 1px !important;
  }
}`

const OPACITY = `opacity: '1', // Mandatory for iOS hold-paste`

const ROOT_HEIGHT = `const updateRootHeight = () => {
  container.style.setProperty('--root-height', \`\${container.clientHeight}px\`)
}
updateRootHeight()
new ResizeObserver(updateRootHeight).observe(container)

// …consumed by the input's own style:
fontSize: 'var(--root-height)'`

const POINTER_EVENTS = `// container
{ position: 'relative', pointerEvents: 'none', userSelect: 'none' }
// the wrapper around the input
{ position: 'absolute', inset: 0, pointerEvents: 'none' }
// the input itself
{ pointerEvents: 'all' }`

const BADGE_POINTER = `[data-input-otp] + * { pointer-events: all !important; }`

const SAFE_INSERT = `function safeInsertRule(sheet: CSSStyleSheet, rule: string) {
  try {
    sheet.insertRule(rule)
  } catch {
    console.error('input-otp could not insert CSS rule:', rule)
  }
}`

const SSR_GUARD = `isIOS:
  typeof window !== 'undefined' &&
  window?.CSS?.supports?.('-webkit-touch-callout', 'none')`

const INITIAL_SYNC = `// The browser may have restored a value into the input before React
// hydrated. Adopt it instead of clobbering it.
if (initialLoadRef.current.value !== input.value) {
  initialLoadRef.current.onChange(input.value)
}`

const ON_COMPLETE = `if (
  value !== previousValue &&
  previousValue.length < maxLength &&
  value.length === maxLength
) {
  onComplete?.(value)
}`

const PATTERN_WHOLE = `const newValue = e.currentTarget.value.slice(0, maxLength)
if (newValue.length > 0 && regexp && !regexp.test(newValue)) {
  e.preventDefault()
  return // the whole change is dropped
}`

const PASTE_RESTORE = `input.value = newValue
onChange(newValue)

const start = Math.min(newValue.length, maxLength - 1)
const end = newValue.length
input.setSelectionRange(start, end)
setMirrorSelectionStart(start)
setMirrorSelectionEnd(end)`

const BLUR_REGRESSION = `// Removed in 1.4.0:
// re-focusing the input after a badge appeared fired a blur the user
// never asked for. The auto-re-focus was cut; if a badge steals focus,
// the user clicks back in.`

const FOCUS_PLACEMENT = `const start = Math.min(input.value.length, maxLength - 1)
const end = input.value.length
input.setSelectionRange(start, end)`

export default function EdgeCasesPage() {
  return (
    <DocsPage href={HREF}>
      <P>
        This is the real content of the library. The API is four or five props;
        the value is the list below — every place where &quot;one invisible
        input pretending to be six boxes&quot; collides with how browsers
        actually behave, and what it costs to absorb each collision.
      </P>
      <P>
        Each entry is written the same way on purpose: what you would see, why
        it happens, and what the library does. Most of them are one or two lines
        of code that took a bug report to find.
      </P>

      <H2>The selection algorithm</H2>
      <P>
        Four related problems, all downstream of one fact: a text caret can sit
        between two characters, and a row of slots has no way to draw that.
      </P>

      <EdgeCase
        title="A collapsed caret has no slot"
        platforms={['All']}
        symptom={
          <>
            With the caret between slot 2 and slot 3, either both highlight or
            neither does — and typing sometimes inserts, sometimes overwrites.
          </>
        }
        cause={
          <>
            <C>selectionStart === selectionEnd</C> is a position{' '}
            <em>between</em> characters. &quot;Which slot is active&quot; is not
            a question that position can answer.
          </>
        }
        fix={
          <>
            On every <C>selectionchange</C>, widen a collapsed caret into a
            one-character range with{' '}
            <C>setSelectionRange(start, end, direction)</C>. Exactly one slot is
            active, and typing overwrites it — which is what people expect from
            a code field.
          </>
        }
      >
        <CodeBlock code={CARET_WIDENING} lang="ts" />
      </EdgeCase>

      <EdgeCase
        title="…except when you're appending"
        platforms={['All']}
        symptom={
          <>
            After typing three characters, the fourth keystroke replaces the
            third instead of adding to it.
          </>
        }
        cause={
          <>
            The blanket widening above also catches the legitimate insert caret
            at the end of a partial value, turning an append into an overwrite.
          </>
        }
        fix={
          <>
            Detect insert mode and exempt it. A collapsed caret at the end of a
            not-yet-full value <strong>is</strong> meaningful.
          </>
        }
      >
        <CodeBlock code={INSERT_MODE} lang="ts" />
      </EdgeCase>

      <EdgeCase
        title="Pressing ArrowLeft appears to skip a slot"
        platforms={['All']}
        symptom={
          <>
            Moving left with <Kbd>←</Kbd> jumps two slots at a time — and it
            only happens when arriving from the end of the value.
          </>
        }
        cause={
          <>
            A caret at index <C>c</C> borders slot <C>c-1</C> and slot <C>c</C>.
            Which one the user meant depends on the direction they arrived from,
            and the selection API doesn&apos;t tell you.
          </>
        }
        fix={
          <>
            Keep the previous <C>[start, end, direction]</C> in a ref, infer
            direction by comparing against it, and shift the range one slot left
            on a backward move. The <C>wasPreviouslyInserting</C> guard
            suppresses that shift when leaving insert mode, where index <C>c</C>{' '}
            already names the right slot.
          </>
        }
      >
        <CodeBlock code={DIRECTION} lang="ts" />
      </EdgeCase>

      <EdgeCase
        title="Deleting doesn't fire selectionchange"
        platforms={['All']}
        symptom={
          <>
            Press <Kbd>⌫</Kbd> or cut a selection and the highlighted slot goes
            stale — it stays where the old selection was until you move the
            caret.
          </>
        }
        cause={
          <>
            No browser fires <C>selectionchange</C> for a deletion or a cut,
            even though the selection demonstrably changed. The mirror never
            learns about it.
          </>
        }
        fix={
          <>
            Compare lengths in the change handler and dispatch the event by hand
            when the value shrank.
          </>
        }
      >
        <CodeBlock code={DELETE_DISPATCH} lang="ts" />
        <Callout type="note">
          <p>
            The library&apos;s own comment flags the cost: this also fires when
            you <Kbd>⌘A</Kbd> and paste something shorter, which is a wasted
            pass. A cheap recomputation was judged better than a missed one.
          </p>
        </Callout>
      </EdgeCase>

      <H2>Making an input invisible</H2>

      <EdgeCase
        title="The selection highlight is still painted"
        platforms={['All']}
        symptom={
          <>
            Select the code and a blue band appears across the slots — the
            browser drawing its own selection over your UI.
          </>
        }
        cause={
          <>
            <C>color: transparent</C> hides the glyphs but not the selection
            highlight, which is painted by <C>::selection</C> and ignores the
            element&apos;s own colour.
          </>
        }
        fix={
          <>
            Neutralise both halves of it. Setting only the background leaves the
            selected text drawn in the highlight&apos;s foreground colour —
            visible again.
          </>
        }
      >
        <CodeBlock code={SELECTION_CSS} lang="css" />
      </EdgeCase>

      <EdgeCase
        title="Autofill paints its own background"
        platforms={['Chromium', 'WebKit']}
        symptom={
          <>
            After a password manager or SMS autofill, a pale yellow rectangle
            sits on top of the slots.
          </>
        }
        cause={
          <>
            The <C>:autofill</C> pseudo-class carries UA styles that outrank
            almost anything you write — including a plain{' '}
            <C>background: transparent</C>.
          </>
        }
        fix={
          <>
            Override every property it touches with <C>!important</C>, including{' '}
            <C>-webkit-text-fill-color</C>, which is what actually controls the
            text colour in that state.
          </>
        }
      >
        <CodeBlock code={AUTOFILL} lang="css" />
      </EdgeCase>

      <EdgeCase
        title="The :autofill state outlives the autofill"
        platforms={['Chromium']}
        symptom={<>The yellow tint stays until the user types something.</>}
        cause={
          <>
            Some browsers clear <C>:autofill</C> only on the next real input
            event, not when the value changes programmatically.
          </>
        }
        fix={
          <>
            Dispatch a synthetic <C>input</C> event — and do it three times, at{' '}
            <C>0ms</C>, <C>10ms</C> and <C>50ms</C>, because different engines
            settle at different moments and none of them signals when
            they&apos;re done.
          </>
        }
      >
        <CodeBlock code={SYNC_TIMEOUTS} lang="ts" />
      </EdgeCase>

      <EdgeCase
        title="insertRule throws and takes the component with it"
        platforms={['All']}
        symptom={
          <>
            The whole field fails to mount in an environment with a restrictive
            Content-Security-Policy, or when a browser doesn&apos;t recognise
            one of the rules.
          </>
        }
        cause={
          <>
            <C>CSSStyleSheet.insertRule</C> throws on an unparseable rule or a
            blocked stylesheet, and the throw happens inside an effect.
          </>
        }
        fix={
          <>
            Insert each rule individually, inside a <C>try/catch</C>. A rule
            that can&apos;t be applied logs and is skipped; the rest still land.
          </>
        }
      >
        <CodeBlock code={SAFE_INSERT} lang="ts" />
      </EdgeCase>

      <H2>iOS</H2>

      <EdgeCase
        title="iOS refuses to paste into an invisible input"
        platforms={['iOS']}
        symptom={
          <>
            Long-press the field on an iPhone and no <em>Paste</em> item appears
            in the menu — or no menu at all.
          </>
        }
        cause={
          <>
            iOS suppresses the editing menu for inputs it considers non-visible,
            and <C>opacity: 0</C> qualifies.
          </>
        }
        fix={
          <>
            Never use <C>opacity: 0</C>. The input keeps <C>opacity: 1</C> and
            hides itself through transparent <C>color</C>, <C>caret-color</C>,{' '}
            <C>background</C> and <C>::selection</C> instead. This one
            constraint is why the injected stylesheet exists.
          </>
        }
      >
        <CodeBlock code={OPACITY} lang="ts" />
      </EdgeCase>

      <EdgeCase
        title="The native selection shows through the invisible input"
        platforms={['iOS']}
        symptom={
          <>
            A thin, caret-tall line appears in the field whenever a range is
            selected — the artifact tracked in{' '}
            <A href="https://github.com/guilhermerodz/input-otp/issues/32">
              #32
            </A>
            . Fixed in <C>1.5.0-beta.1</C>.
          </>
        }
        cause={
          <>
            iOS paints the selection highlight and caret in a native layer that
            ignores <C>::selection</C>, CSS <C>opacity</C> and ancestor
            clipping. The one thing it respects is the rendered text geometry.
          </>
        }
        fix={
          <>
            An iOS-only block parks the text offscreen (<C>text-indent</C>) so
            nothing paints at rest, and scales the input down 10x — with a
            compensating 10x layout box, so the tap area still matches the
            container — which floors the highlight at iOS&apos;s ~2px minimum.
            Computed <C>font-size</C> stays at 16px, below which focusing would
            zoom the page. During a pointer gesture the text is revealed at the
            fingertip via an inline <C>text-indent</C> so the copy/paste menu
            can anchor, and hidden again on typing, blur or scroll. The{' '}
            <C>left: -1px</C> / <C>right: 1px</C> pair survives from the old
            metrics fix: the nudge that repositioned the glyphs also moved the
            field, so the second declaration restores it.
          </>
        }
      >
        <CodeBlock code={IOS_METRICS} lang="css" />
      </EdgeCase>

      <EdgeCase
        title="Native paste inserts the wrong value"
        platforms={['iOS']}
        symptom={
          <>Pasting a code on iOS produces a mangled or truncated value.</>
        }
        cause={
          <>
            The browser&apos;s own insertion doesn&apos;t agree with the
            field&apos;s collapsed metrics and rewritten selection.
          </>
        }
        fix={
          <>
            Handle <C>onPaste</C> directly: read <C>clipboardData</C>,{' '}
            <C>preventDefault()</C>, splice at the caret (replacing the
            selection if any), truncate to <C>maxLength</C>, test the pattern,
            then restore the selection explicitly so a full paste leaves the
            last slot selected instead of a caret past the end. Passing{' '}
            <C>pasteTransformer</C> enables this path on every platform.
          </>
        }
      >
        <CodeBlock code={PASTE_RESTORE} lang="ts" />
      </EdgeCase>

      <EdgeCase
        title="CSS.supports doesn't exist during SSR"
        platforms={['All']}
        symptom={
          <>
            <C>TypeError: Cannot read properties of undefined</C> when the
            component renders on a server.
          </>
        }
        cause={
          <>
            iOS detection uses <C>window.CSS.supports</C>, and there is no{' '}
            <C>window</C> in Node — nor a <C>CSS</C> object in some non-browser
            DOM shims.
          </>
        }
        fix={
          <>
            Guard the whole chain, not just <C>window</C>.
          </>
        }
      >
        <CodeBlock code={SSR_GUARD} lang="ts" />
      </EdgeCase>

      <H2>Geometry and hit testing</H2>

      <EdgeCase
        title="Clicks land on your slots instead of the field"
        platforms={['All']}
        symptom={
          <>
            Clicking a slot does nothing, or focuses the field but drops the
            caret at the wrong index.
          </>
        }
        cause={
          <>
            Your decorative markup is painted in the same box as the input.
            Whichever element wins the hit test receives the click.
          </>
        }
        fix={
          <>
            Make the container and the input&apos;s wrapper{' '}
            <C>pointer-events: none</C>, and give the input{' '}
            <C>pointer-events: all</C>. Clicks fall straight through the
            decoration to the one element that should have them, so the browser
            places the caret at the character nearest the click — the slot the
            user aimed at.
          </>
        }
      >
        <CodeBlock code={POINTER_EVENTS} lang="ts" />
      </EdgeCase>

      <EdgeCase
        title="The native caret and selection are the wrong size"
        platforms={['All']}
        symptom={
          <>
            Native UI — the selection band, drag handles, the iOS magnifier —
            hugs a thin line in the middle of a tall field instead of matching
            the slots.
          </>
        }
        cause={
          <>
            Those affordances are sized from the text, and the text has no idea
            how tall your slots are.
          </>
        }
        fix={
          <>
            A <C>ResizeObserver</C> publishes the container&apos;s pixel height
            as <C>--root-height</C>, and the input&apos;s <C>font-size</C> is
            set from it. It is measured on the container rather than the input
            because on iOS the input&apos;s layout box is enlarged 10x by the
            scale-down fix. Native UI then matches the boxes the user can see.
          </>
        }
      >
        <CodeBlock code={ROOT_HEIGHT} lang="ts" />
      </EdgeCase>

      <EdgeCase
        title="Firefox loses the selection direction"
        platforms={['Firefox']}
        symptom={
          <>
            Extending a selection leftwards collapses it, or moves the wrong end
            of the range.
          </>
        }
        cause={
          <>
            <C>setSelectionRange(start, end)</C> without a direction defaults to{' '}
            <C>forward</C>, discarding the fact that the user was selecting
            backwards.
          </>
        }
        fix={
          <>
            Always pass the third argument. The algorithm already computes{' '}
            <C>direction</C> — it just has to be handed over.
          </>
        }
      />

      <H2>Password managers</H2>

      <EdgeCase
        title="The badge covers your last slot"
        platforms={['Extensions']}
        symptom={
          <>
            1Password, LastPass, Dashlane or Bitwarden draws its icon over the
            sixth character.
          </>
        }
        cause={
          <>
            Extensions anchor their badge to the input&apos;s top-right corner.
            For an OTP field, that corner is the last slot.
          </>
        }
        fix={
          <>
            Detect the extension, widen the input by 40px so the badge follows
            it out, and clip those 40px away so nothing visibly moves.{' '}
            <A href="/docs/password-managers">
              Full write-up, with a simulator
            </A>
            .
          </>
        }
      />

      <EdgeCase
        title="…and then the badge isn't clickable"
        platforms={['Extensions']}
        symptom={<>The badge appears in the right place but ignores clicks.</>}
        cause={
          <>
            The container is <C>pointer-events: none</C>, and the extension
            injects its badge as a child of that subtree — inheriting the block.
          </>
        }
        fix={<>One rule, targeting whatever ends up next to the input.</>}
      >
        <CodeBlock code={BADGE_POINTER} lang="css" />
      </EdgeCase>

      <EdgeCase
        title="Chasing the badge stole focus"
        platforms={['Extensions']}
        symptom={
          <>
            <C>onBlur</C> fired without the user doing anything — breaking
            validation that runs on blur.
          </>
        }
        cause={
          <>
            An earlier version re-focused the input after the badge appeared, to
            re-run detection. The round trip produced a real blur event.
          </>
        }
        fix={
          <>
            The auto-re-focus was removed in 1.4.0. The trade is explicit: if a
            badge appears and steals focus, the user clicks back in. A phantom
            blur was judged worse than a manual re-focus.
          </>
        }
      >
        <CodeBlock code={BLUR_REGRESSION} lang="ts" />
      </EdgeCase>

      <EdgeCase
        title="The gutter was reserved for everyone"
        platforms={['Extensions']}
        symptom={
          <>
            With no extension installed, focusing the field still set{' '}
            <C>input.style.width</C> to <C>calc(100% + 40px)</C>.
          </>
        }
        cause={
          <>
            The fallback probe bailed out only when <C>elementFromPoint</C>{' '}
            returned the <em>container</em>. It never does — the invisible input
            is the one node in the field with <C>pointer-events: all</C>, so it
            is always the topmost element at the probe point.
          </>
        }
        fix={
          <>
            Compare against the input instead, and treat a <C>null</C> hit — the
            point is off-screen — as &ldquo;learned nothing&rdquo; rather than
            as a badge. Fixed after 1.4.2. Nothing visibly changed either way:
            the clip-path hid the extra width and clipped hit-testing with it.{' '}
            <A href="/docs/password-managers#how-detection-works">
              How detection works
            </A>
            .
          </>
        }
      />

      <H2>State and lifecycle</H2>

      <EdgeCase
        title="The browser restored a value before React hydrated"
        platforms={['All']}
        symptom={
          <>
            Reload a page mid-flow (or navigate back) and the slots are empty
            while the input holds a value.
          </>
        }
        cause={
          <>
            Browsers restore form state before hydration. React&apos;s initial
            state says <C>&quot;&quot;</C>; the DOM says otherwise.
          </>
        }
        fix={
          <>
            On mount, compare the input&apos;s value against the initial value
            and adopt the DOM&apos;s version.
          </>
        }
      >
        <CodeBlock code={INITIAL_SYNC} lang="ts" />
      </EdgeCase>

      <EdgeCase
        title="onComplete fired twice"
        platforms={['All']}
        symptom={<>The verification request is sent two or three times.</>}
        cause={
          <>
            Firing whenever <C>value.length === maxLength</C> re-fires on every
            unrelated re-render while the code is full.
          </>
        }
        fix={
          <>
            Fire on the <em>transition</em>: the previous value must have been
            shorter than <C>maxLength</C> and the new one exactly{' '}
            <C>maxLength</C>. Editing a complete code and refilling it fires
            again, correctly.
          </>
        }
      >
        <CodeBlock code={ON_COMPLETE} lang="ts" />
      </EdgeCase>

      <EdgeCase
        title="Focusing the field put the caret past the end"
        platforms={['All']}
        symptom={
          <>
            Tab into a full code and no slot is highlighted, because the caret
            is at index <C>maxLength</C>.
          </>
        }
        cause={
          <>
            The default focus behaviour places the caret at the end of the
            value, which for a full code is one past the last slot.
          </>
        }
        fix={
          <>
            Clamp the start to <C>maxLength - 1</C> on focus, so a full code
            lands with its last slot selected and a partial one lands in insert
            mode.
          </>
        }
      >
        <CodeBlock code={FOCUS_PLACEMENT} lang="ts" />
      </EdgeCase>

      <EdgeCase
        title="A rejected paste silently loses valid characters"
        platforms={['All']}
        symptom={
          <>
            With a digits-only pattern, pasting <C>123-456</C> does nothing at
            all — not even <C>123456</C>.
          </>
        }
        cause={
          <>
            The pattern is tested against the whole prospective value, and a
            failure discards the entire change. It is a gate, not a filter —
            which is the correct behaviour for typing, and surprising for
            pasting.
          </>
        }
        fix={
          <>
            <C>pasteTransformer</C> rewrites the clipboard text before
            validation sees it. It also means your pattern must accept partial
            values — <C>^\d+$</C>, never <C>{'^\\d{6}$'}</C>.
          </>
        }
      >
        <CodeBlock code={PATTERN_WHOLE} lang="ts" />
      </EdgeCase>

      <EdgeCase
        title="Digits-only was the default"
        platforms={['All']}
        symptom={
          <>
            Before 1.4.0, alphanumeric codes couldn&apos;t be typed or pasted,
            with no indication why. Worst on mobile, where the keyboard also
            defaulted to a keypad.
          </>
        }
        cause={
          <>
            <C>pattern</C> defaulted to <C>REGEXP_ONLY_DIGITS</C>, so every
            letter was rejected by a rule the developer never wrote.
          </>
        }
        fix={
          <>
            The default was removed. Nothing is restricted unless you set{' '}
            <C>pattern</C> — and if you do restrict to letters, set{' '}
            <C>inputMode=&quot;text&quot;</C> too.
          </>
        }
      />

      <H2>Progressive enhancement</H2>

      <EdgeCase
        title="No JavaScript means no visible field"
        platforms={['No JS']}
        symptom={
          <>
            With the bundle blocked or still loading, the page shows empty slot
            outlines and a field nobody can see or use.
          </>
        }
        cause={
          <>
            The slots are server-rendered markup, but the input is only
            invisible because of styles that assume a script will drive it.
          </>
        }
        fix={
          <>
            Render a <C>&lt;noscript&gt;</C> stylesheet that restores the input
            to a plain visible text box, with an opaque background so it covers
            the inert slots. It is placed first in the output, and it is{' '}
            <C>&lt;noscript&gt;</C> rather than the <C>scripting</C> media query
            because <C>noscript</C> is honoured during the initial parse —
            exactly when the bundle hasn&apos;t arrived.
          </>
        }
      />

      <H2>What isn&apos;t solved</H2>
      <P>In the interest of honesty, the known limits:</P>
      <div className="mt-4 space-y-2.5 text-[0.9375rem] leading-7 text-muted-foreground">
        <p>
          <strong className="font-medium text-foreground">
            Badges wider than 40px.
          </strong>{' '}
          The reserved gutter is a constant. An extension with a larger badge,
          or one anchored further in than 18px, will still overlap — override
          the width on <C>[data-input-otp]</C> yourself.
        </p>
        <p>
          <strong className="font-medium text-foreground">
            Unknown extensions are detected by what they paint.
          </strong>{' '}
          The fallback probe asks what sits at one point in the corner. Anything
          the user happens to have overlapping that point counts as a badge, and
          a badge drawn anywhere else does not —{' '}
          <A href="/docs/password-managers#how-detection-works">details</A>.
        </p>
        <p>
          <strong className="font-medium text-foreground">
            A tight container skips the push.
          </strong>{' '}
          The space check walks up to the nearest ancestor that constrains
          horizontal overflow, and the gutter is only reserved when the full
          40px fit. When they don&apos;t, the badge stays over the last slot —
          the same rendering as <C>pushPasswordManagerStrategy=&quot;none&quot;</C>.
        </p>
        <p>
          <strong className="font-medium text-foreground">
            The iOS path can&apos;t be tested headlessly.
          </strong>{' '}
          The <C>@supports (-webkit-touch-callout: none)</C> guard never matches
          in a headless engine, Playwright&apos;s WebKit included. Every change
          to iOS behaviour needs a real device.
        </p>
        <p>
          <strong className="font-medium text-foreground">
            Wrapped slot rows read badly.
          </strong>{' '}
          The selection is one continuous range; a row that wraps onto two lines
          makes a multi-slot selection look like two disconnected fragments.
        </p>
      </div>
    </DocsPage>
  )
}
