import { CodeBlock } from '../../_components/code-block'
import { DocsPage, docsMetadata } from '../../_components/docs-page'
import { A, C, Callout, H2, H3, Li, Ol, P, Ul } from '../../_components/prose'
import { PwmSimulator } from '../../_components/pwm-simulator'

const HREF = '/docs/password-managers'
export const metadata = docsMetadata(HREF)

const SELECTORS = `const PASSWORD_MANAGERS_SELECTORS = [
  '[data-lastpass-icon-root]',            // LastPass
  'com-1password-button',                 // 1Password
  '[data-dashlanecreated]',               // Dashlane
  '[style$="2147483647 !important;"]',    // Bitwarden — fingerprinted by z-index
].join(',')`

const PROBE = `// The top-right of the container, 18px in, vertically centred —
// where password managers put their badge.
const x = container.getBoundingClientRect().left + container.offsetWidth - 18
const y = container.getBoundingClientRect().top + container.offsetHeight / 2

if (document.querySelectorAll(PASSWORD_MANAGERS_SELECTORS).length === 0) {
  const maybeBadgeEl = document.elementFromPoint(x, y)
  if (maybeBadgeEl === container) {
    return // nothing sitting on top of the field
  }
}

setHasPWMBadge(true)`

const PUSH = `// The invisible input grows by 40px …
width: willPushPWMBadge ? \`calc(100% + \${PWM_BADGE_SPACE_WIDTH})\` : '100%'

// … and immediately clips those 40px back off, so nothing moves on screen.
clipPath: willPushPWMBadge ? \`inset(0 \${PWM_BADGE_SPACE_WIDTH} 0 0)\` : undefined`

const POINTER_EVENTS = `/* The container is pointer-events: none, and a badge is injected as the
   input's next sibling — so give that sibling its clicks back. */
[data-input-otp] + * { pointer-events: all !important; }`

const OPT_OUT = `<OTPInput
  maxLength={6}
  // Take the 40px reservation off the table entirely.
  pushPasswordManagerStrategy="none"
/>`

const BLOCK_PWMS = `<OTPInput
  maxLength={6}
  // 1. turn off the built-in accommodation …
  pushPasswordManagerStrategy="none"
  // 2. … then tell each extension to stay away.
  data-lpignore="true"   // LastPass
  data-1p-ignore="true"  // 1Password
  data-form-type="other" // Dashlane
  data-bwignore="true"   // Bitwarden
/>`

const TIMING = `// Extensions inject their badge whenever they get around to it, so the
// check runs several times and then gives up.
setTimeout(trackPWMBadge, 0)
setTimeout(trackPWMBadge, 2000)
setTimeout(trackPWMBadge, 5000)
setTimeout(() => setDone(true), 6000)   // latch: stop looking`

const SPACE_CHECK = `// Re-checked every second: is there even room to the right of the field?
const distanceToRightEdge = window.innerWidth - container.getBoundingClientRect().right
setHasPWMBadgeSpace(distanceToRightEdge >= 40)`

export default function PasswordManagersPage() {
  return (
    <DocsPage href={HREF}>
      <P>
        Password managers decorate anything that smells like a credential field
        with a small badge, anchored to its top-right corner. On an ordinary
        text input that badge sits harmlessly in the padding. On an OTP field,
        the top-right corner <em>is</em> the last slot — so the badge lands
        squarely on top of the sixth character.
      </P>
      <P>
        You cannot move it: it belongs to a browser extension, in a different
        stacking context, positioned from the input&apos;s own box. What you{' '}
        <em>can</em> do is change the box.
      </P>

      <H2>Try it without installing anything</H2>
      <P>
        The badges below are simulations — but not pictures. Each one carries
        the exact DOM marker its real extension leaves behind, which means the
        library&apos;s own detection code finds them and responds for real. The
        readout underneath is measured off the live input, not written by hand.
      </P>
      <Callout type="tip" title="Focus the field">
        <p>
          Detection only runs while the input has focus, so click into the field
          after changing a setting. Changing a setting remounts the field,
          because the check latches once it has made up its mind.
        </p>
      </Callout>

      <PwmSimulator />

      <P>
        Switch the strategy to <C>none</C> with an extension installed and you
        can see the problem the feature exists to solve: the badge parks itself
        over the last slot.
      </P>

      <H2>How the accommodation works</H2>
      <P>
        The trick is that the badge is positioned relative to the <em>input</em>
        , while the slots you can see belong to the <em>container</em>. Those
        are two different boxes. So the input is made 40px wider than the
        container — which drags the badge 40px to the right, clear of the last
        slot — and then those same 40px are clipped away, so nothing about the
        field&apos;s appearance or hit area changes.
      </P>
      <CodeBlock code={PUSH} lang="ts" />
      <Ul>
        <Li>
          <strong>No layout shift.</strong> The container never resizes; the
          growth happens on an absolutely positioned child and is clipped in the
          same frame.
        </Li>
        <Li>
          <strong>No lost clicks.</strong> <C>clip-path</C> clips hit-testing
          too, so the clickable area stays exactly the visible field.
        </Li>
        <Li>
          <strong>The badge stays usable.</strong> One CSS rule hands pointer
          events back to whatever the extension injects next to the input:
        </Li>
      </Ul>
      <CodeBlock code={POINTER_EVENTS} lang="css" />

      <H2>How detection works</H2>
      <P>Two passes, cheapest first.</P>

      <H3>1. Look for the extension by name</H3>
      <P>
        Four vendors leave a stable, identifiable mark on the page. Bitwarden
        has no useful attribute, so it is fingerprinted by the maximum-
        <C>z-index</C> inline style it stamps on its overlay:
      </P>
      <CodeBlock code={SELECTORS} lang="ts" />
      <P>
        Turn on <em>Show the detection probe point</em> in the simulator and
        switch vendors — the <C>querySelectorAll(…).length</C> row is this query
        running against the fake badge.
      </P>

      <H3>2. Otherwise, probe the corner</H3>
      <P>
        For anything not on that list, the library asks the browser what is
        actually painted at the badge&apos;s usual position:
      </P>
      <CodeBlock code={PROBE} lang="ts" />

      <Callout type="warning" title="Current behaviour of the fallback probe">
        <p>
          In 1.4.2 this second pass effectively always says yes. The topmost
          element at that point is the invisible input — it is the one node in
          the field with <C>pointer-events: all</C> — but the comparison is
          against the <em>container</em>, so <C>maybeBadgeEl === container</C>{' '}
          is never true and the gutter is reserved for everyone.
        </p>
        <p>
          You can verify it in the simulator: set the extension to{' '}
          <strong>None</strong>, focus the field, and watch{' '}
          <C>input.style.width</C> still become <C>calc(100% + 40px)</C>. It is
          invisible in practice — the clip-path hides the extra width and
          hit-testing is unchanged — so this is a correctness note, not a bug
          you need to work around. Set{' '}
          <C>pushPasswordManagerStrategy=&quot;none&quot;</C> if you want the
          reservation gone.
        </p>
      </Callout>

      <H3>Timing, and knowing when to stop</H3>
      <P>
        An extension injects its badge on its own schedule — sometimes before
        the page settles, sometimes seconds after a field is focused. So the
        check is retried, then abandoned:
      </P>
      <CodeBlock code={TIMING} lang="ts" />
      <P>
        The latch matters. Without it the library would keep measuring the
        corner of a field forever, and any DOM the user happens to hover over
        the input would re-trigger the accommodation.
      </P>

      <H3>Is there even room?</H3>
      <P>
        Reserving space to the right is pointless if the field is already
        against the edge of the viewport — the badge will be clamped inside
        regardless. So the available space is measured, and re-measured once a
        second:
      </P>
      <CodeBlock code={SPACE_CHECK} lang="ts" />
      <P>
        Both conditions have to hold: a badge was detected <em>and</em> there
        are at least 40px to the right. Otherwise the width stays at <C>100%</C>
        .
      </P>

      <H2>Opting out</H2>
      <P>
        The accommodation is on by default. If you would rather it weren&apos;t
        — because your field sits in a tight layout, or you have your own
        arrangement with the extensions — turn it off:
      </P>
      <CodeBlock code={OPT_OUT} />
      <P>
        This also stops the detection work entirely: no probing, no interval.
      </P>

      <H3>Blocking the badge altogether</H3>
      <P>
        A stronger position: tell the extensions not to decorate the field at
        all. Every major password manager honours an opt-out attribute, and
        since the component forwards unknown props to the input, you can just
        add them.
      </P>
      <CodeBlock code={BLOCK_PWMS} />
      <Callout type="note">
        <p>
          Turn the library&apos;s strategy off when you do this, or you get
          both: no badge <em>and</em> 40px reserved for one. Worth remembering
          that these attributes are honoured at each vendor&apos;s discretion,
          and a new extension you have never heard of will ignore all four —
          which is the case the default accommodation exists for.
        </p>
      </Callout>

      <H2>Debugging a badge in your own app</H2>
      <Ol>
        <Li>
          Focus the field. Detection is focus-gated, so nothing happens until
          you do.
        </Li>
        <Li>
          Read <C>input.style.width</C> in devtools. <C>calc(100% + 40px)</C>{' '}
          means the accommodation fired; <C>100%</C> means it didn&apos;t.
        </Li>
        <Li>
          If it fired but the badge still overlaps, the badge is more than 40px
          wide or anchored further in than 18px. There is no prop for this —
          override the input&apos;s width with your own CSS on{' '}
          <C>[data-input-otp]</C>.
        </Li>
        <Li>
          If it didn&apos;t fire, check the distance from the field to the right
          edge of the <em>viewport</em> (not the container) — under 40px and the
          reservation is skipped by design.
        </Li>
        <Li>
          If the badge is visible but unclickable, something in your CSS is
          beating <C>[data-input-otp] + * {'{ pointer-events: all }'}</C>.
        </Li>
      </Ol>

      <P>
        One more platform surface to go:{' '}
        <A href="/docs/mobile">Mobile &amp; platforms</A>.
      </P>
    </DocsPage>
  )
}
