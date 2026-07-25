import { CodeBlock } from '../../_components/code-block'
import { DocsPage, docsMetadata } from '../../_components/docs-page'
import {
  A,
  C,
  Callout,
  Eyebrow,
  H2,
  H3,
  Kbd,
  Li,
  Ol,
  P,
  Ul,
} from '../../_components/prose'
import { AnatomyStage } from '../../_components/anatomy'
import { SelectionInspector } from '../../_components/selection-inspector'

const HREF = '/docs/anatomy'
export const metadata = docsMetadata(HREF)

const DOM_TREE = `<div data-input-otp-container style="position: relative; pointer-events: none">
  <!-- 1 — your markup, from render() or from children -->
  <div class="flex">
    <div>…</div>   <!-- slot 0 -->
    <div>…</div>   <!-- slot 1 -->
    …
  </div>

  <!-- 2 — the real field, stretched across the container -->
  <div style="position: absolute; inset: 0; pointer-events: none">
    <input
      data-input-otp
      autocomplete="one-time-code"
      inputmode="numeric"
      maxlength="6"
      value="482"
      data-input-otp-mss="3"
      data-input-otp-mse="3"
      style="
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        color: transparent;          /* the characters are there, just unseen */
        caret-color: transparent;    /* you draw the caret */
        background: transparent;
        opacity: 1;                  /* mandatory — iOS won't paste into 0 */
        letter-spacing: -.5em;       /* collapse the text into a narrow band */
        font-size: var(--root-height);
        pointer-events: all;         /* the one thing that is clickable */
      "
    />
  </div>
</div>`

const SELECTION_ALGO = `// Runs on every 'selectionchange', in the capture phase.
const isSingleCaret = start === end
const isInsertMode = start === value.length && value.length < maxLength

if (isSingleCaret && !isInsertMode) {
  const c = start

  if (c === 0) {
    // At the very start there is nothing to the left — claim slot 0.
    [start, end, direction] = [0, 1, 'forward']
  } else if (c === maxLength) {
    // At the very end there is nothing to the right — claim the last slot.
    [start, end, direction] = [c - 1, c, 'backward']
  } else if (maxLength > 1 && value.length > 1) {
    // In the middle, a caret at index c sits between slot c-1 and slot c.
    // Which one the user meant depends on the direction they arrived from.
    let offset = 0
    direction = c < prevEnd ? 'backward' : 'forward'

    const wasPreviouslyInserting = prevStart === prevEnd && prevStart < maxLength
    if (direction === 'backward' && !wasPreviouslyInserting) {
      offset = -1
    }

    [start, end] = [offset + c, offset + c + 1]
  }

  input.setSelectionRange(start, end, direction)
}`

const SLOT_DERIVATION = `slots = Array.from({ length: maxLength }).map((_, i) => {
  const isActive =
    isFocused &&
    mirrorSelectionStart !== null &&
    mirrorSelectionEnd !== null &&
    // a collapsed caret parked on this index (insert mode) …
    ((mirrorSelectionStart === mirrorSelectionEnd && i === mirrorSelectionStart) ||
      // … or this index falling inside the selected range
      (i >= mirrorSelectionStart && i < mirrorSelectionEnd))

  const char = value[i] ?? null

  return {
    char,
    placeholderChar: value[0] !== undefined ? null : placeholder?.[i] ?? null,
    isActive,
    // A caret only makes sense where there is no character to sit next to.
    hasFakeCaret: isActive && char === null,
  }
})`

export default function AnatomyPage() {
  return (
    <DocsPage href={HREF}>
      <P>
        Everything this library does follows from one decision: keep a real text
        input, and stop trying to make it look like anything. The input is still
        there, still focusable, still holding the value — it is simply painted
        out of existence and laid over the top of your slots.
      </P>

      <H2>See it</H2>
      <P>
        Three views of the same field, in three registers.{' '}
        <strong>Assembly</strong> builds it up one decision at a time.{' '}
        <strong>Isometric</strong> tilts the stack apart so you can see what
        sits on what. <strong>X-ray</strong> lets you undo the five hiding
        techniques individually and watch what each one was responsible for.
      </P>
      <P>
        Every view is a live field — amber is the real <C>&lt;input&gt;</C>,
        cyan is the container. Click in and type, arrow around, select a range.
        What you see in amber is the native caret and the native selection; the
        slots are following it.
      </P>

      <AnatomyStage />

      <Callout type="note" title="The tracking is measured, not guessed">
        <p>
          When a view spreads the text back out, the letter-spacing is computed
          at runtime from the input&apos;s real font metrics, so one character
          lands over exactly one slot. Hard-coding an <C>em</C> value would
          drift with whatever the platform calls <C>monospace</C> — and a reveal
          that doesn&apos;t line up would teach the wrong thing.
        </p>
      </Callout>

      <H2>The DOM</H2>
      <P>
        Three elements, in this order. The order matters — the input is painted
        after your slots so it wins the hit test, and the container is{' '}
        <C>pointer-events: none</C> so clicks fall through your decorative
        markup and land on the field.
      </P>
      <CodeBlock code={DOM_TREE} lang="html" />
      <Ul>
        <Li>
          <strong>The container</strong> is <C>position: relative</C> and{' '}
          <C>user-select: none</C>. It takes your <C>containerClassName</C>, and
          it is the element a password manager measures against.
        </Li>
        <Li>
          <strong>Your slots</strong> are ordinary children. The library never
          touches them; it only hands you state.
        </Li>
        <Li>
          <strong>The input</strong> fills the container absolutely. It is the
          only node with <C>pointer-events: all</C>, which is why one click
          anywhere in the field focuses it and puts the caret in the right
          place.
        </Li>
      </Ul>

      <Callout type="note" title="Why not opacity: 0?">
        <p>
          Because iOS refuses to show the long-press <em>Paste</em> menu for a
          fully transparent input. The field keeps <C>opacity: 1</C> and hides
          itself with transparent <C>color</C>, <C>caret-color</C>,{' '}
          <C>background</C> and <C>::selection</C> instead. That constraint
          shapes a surprising amount of the implementation — see{' '}
          <A href="/docs/edge-cases#ios-refuses-to-paste-into-an-invisible-input">
            Edge cases
          </A>
          .
        </p>
      </Callout>

      <H3>
        Why <C>font-size: var(--root-height)</C>
      </H3>
      <P>
        A <C>ResizeObserver</C> writes the input&apos;s pixel height into{' '}
        <C>--root-height</C> on the container, and the input&apos;s font size is
        set from it. The point is to make the native caret and the native
        selection highlight the same height as your slots — so when the browser
        draws its own UI (a selection band, a drag handle, the iOS bubble), it
        lines up with the boxes the user can see, instead of hugging a 16px line
        in the middle.
      </P>

      <H2>Selection is mirrored, not owned</H2>
      <P>
        The library never stores &quot;the active slot&quot; as its own idea of
        truth. It listens to <C>document</C> for <C>selectionchange</C> in the
        capture phase, reads <C>selectionStart</C>, <C>selectionEnd</C> and{' '}
        <C>selectionDirection</C> off the input, sometimes rewrites them, and
        mirrors the result into React state. Your slots render from the mirror.
      </P>
      <P>
        Mirroring rather than owning is what keeps every native gesture working.
        Shift-arrow ranges, <Kbd>⌥</Kbd>-delete, double-click word select,
        drag-select, the Android clipboard bar, middle-click paste — none of
        them are implemented here. They all just move the selection, and the
        mirror follows.
      </P>

      <H3>The rewrite</H3>
      <P>
        There is one thing a slotted UI cannot represent: a collapsed caret. A
        caret at index 3 sits <em>between</em> slot 2 and slot 3, so &quot;which
        slot is active&quot; has no answer. The fix is to widen it into a
        one-character range, which also makes typing overwrite the slot you are
        standing on — exactly what people expect from an OTP field.
      </P>
      <CodeBlock code={SELECTION_ALGO} lang="ts" />
      <P>Three details in there earn their keep:</P>
      <Ol>
        <Li>
          <strong>Insert mode is exempt.</strong> When the caret is collapsed at
          the end of a code that isn&apos;t full yet, that <em>is</em> a
          meaningful position — it&apos;s where the next character goes.
          Widening it would select the last typed character and the next
          keystroke would replace it instead of appending.
        </Li>
        <Li>
          <strong>The edges are special-cased.</strong> At index 0 there is no
          slot to the left, and at index <C>maxLength</C> there is none to the
          right, so those two clamp outward instead of guessing.
        </Li>
        <Li>
          <strong>Direction is inferred from the previous selection.</strong>{' '}
          Comparing the new caret against the stored <C>[prevStart, prevEnd]</C>{' '}
          tells the algorithm whether the user is moving left or right, and a
          backward move needs the extra <C>offset = -1</C> to land on the slot
          they were aiming at. Without it, pressing <Kbd>←</Kbd> appears to skip
          a slot.
        </Li>
      </Ol>
      <Callout type="note" title="wasPreviouslyInserting">
        <p>
          The one subtle guard: if the previous state was a collapsed insert
          caret, a backward move should <em>not</em> take the <C>-1</C> offset.
          Coming out of insert mode, index <C>c</C> already names the slot the
          user wants. This is the fix behind{' '}
          <em>
            &quot;do not skip left slot when pressing arrowleft after insert
            mode&quot;
          </em>
          .
        </p>
      </Callout>

      <H3>Watch it run</H3>
      <P>
        Type, arrow, select a range, cut, paste. The readout is the input&apos;s
        real selection <em>after</em> the rewrite, next to the mirrored values
        your render function receives.
      </P>
      <div className="mt-6 overflow-hidden rounded-lg border border-border/70">
        <div className="bg-dot-grid px-6 py-10">
          <SelectionInspector />
        </div>
      </div>

      <H2>From selection to slots</H2>
      <P>
        Once the mirror is settled, deriving the render state is almost
        uninteresting — which is the point:
      </P>
      <CodeBlock code={SLOT_DERIVATION} lang="ts" />
      <P>
        Note <C>hasFakeCaret</C>: a caret is only reported for an active slot
        that has no character. A slot with a character in it is drawn selected
        instead, because that is what typing will replace.
      </P>

      <H2>The parts that aren&apos;t the algorithm</H2>
      <P>
        Three supporting mechanisms run alongside the selection mirror. Each has
        its own page, because each exists to absorb a specific piece of platform
        reality.
      </P>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          {
            title: 'Injected stylesheet',
            body: 'One <style id="input-otp-style"> appended once per page: transparent ::selection, neutralised autofill, iOS metrics, and a pointer-events escape hatch for password manager badges.',
            href: '/docs/edge-cases',
          },
          {
            title: 'Badge detection',
            body: 'Finds known password manager extensions and reserves 40px of clipped width so their badge lands beside the field instead of on top of the last slot.',
            href: '/docs/password-managers',
          },
          {
            title: 'No-JS fallback',
            body: 'A <noscript> stylesheet that turns the invisible input back into a plain visible one when the bundle never arrives.',
            href: '/docs/mobile#without-javascript',
          },
        ].map(card => (
          <a
            key={card.title}
            href={card.href}
            className="rounded-lg border border-border/70 px-4 py-3.5 transition-colors duration-150 hover:border-border hover:bg-foreground/[0.02]"
          >
            <Eyebrow>{card.title}</Eyebrow>
            <p className="mt-1.5 text-[0.8125rem] leading-6 text-muted-foreground">
              {card.body}
            </p>
          </a>
        ))}
      </div>
    </DocsPage>
  )
}
