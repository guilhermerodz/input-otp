import Link from 'next/link'

import { ComponentPreview } from '../_components/component-preview'
import { DocsPage, docsMetadata } from '../_components/docs-page'
import { A, C, Callout, H2, Li, P, Ul } from '../_components/prose'
import { BasicDemo } from '../_demos/basic'
import { GroupsDemo } from '../_demos/groups'

const HREF = '/docs'
export const metadata = docsMetadata(HREF)

export default function IntroductionPage() {
  return (
    <DocsPage
      href={HREF}
      hero={
        <ComponentPreview name="groups">
          <GroupsDemo />
        </ComponentPreview>
      }
    >
      <P>
        HTML has no one-time-password control. There is no{' '}
        <C>&lt;input type=&quot;otp&quot;&gt;</C>, so every product that asks
        for a six-digit code has to invent one — and almost everybody invents
        the same thing: six separate inputs, wired together with keydown
        handlers that shuffle focus between them.
      </P>
      <P>
        That approach breaks in ways that are easy to miss and hard to fix.{' '}
        <strong>input-otp</strong> takes the opposite route. It renders exactly
        one real text input, paints it invisible, and hands you the state you
        need to draw whatever you want on top.
      </P>

      <H2>Why one input</H2>
      <P>
        Everything a browser gives a text field for free — and there is a
        surprising amount — keeps working, because there is still a text field:
      </P>
      <Ul>
        <Li>
          <strong>SMS autofill.</strong>{' '}
          <C>autocomplete=&quot;one-time-code&quot;</C> only means anything on a
          single field. iOS and Android will drop the whole code straight in.
        </Li>
        <Li>
          <strong>Screen readers.</strong> One input has one accessible name,
          one value and one caret. Six inputs announce six unlabelled boxes and
          lose the reader on every focus jump.
        </Li>
        <Li>
          <strong>Every keybinding you never implemented.</strong> Select-all,
          word-delete, shift-arrow ranges, undo, the iOS long-press menu, the
          Android clipboard bar, middle-click paste on Linux. All native.
        </Li>
        <Li>
          <strong>Copy, cut and paste.</strong> Including partial pastes into
          the middle of a half-filled code, which the focus-shuffling approach
          essentially cannot do.
        </Li>
        <Li>
          <strong>Form semantics.</strong> One <C>name</C>, one value in{' '}
          <C>FormData</C>, <C>required</C> and <C>disabled</C> that mean what
          they say, and a real <C>&lt;label&gt;</C> that focuses it.
        </Li>
      </Ul>
      <P>
        What you give up is the ability to style that input directly — so the
        library gives it back as render state.{' '}
        <A href="/docs/anatomy">Anatomy</A> takes the lid off and shows you the
        whole mechanism.
      </P>

      <H2>What you write</H2>
      <P>
        There is one component. You tell it how long the code is, and you get an
        array of slots back — each one carrying its character, whether it is
        selected, and whether it should be drawing a caret. The markup is yours.
      </P>

      <ComponentPreview name="basic">
        <BasicDemo />
      </ComponentPreview>

      <P>
        <C>Slot</C> above is a plain <C>div</C> you write once and own forever —{' '}
        <A href="/docs/installation">Installation</A> has the full source to
        copy.
      </P>

      <Callout type="note" title="Unstyled, and it means it">
        <p>
          input-otp ships no CSS for your slots, no theme and no class names to
          override. The only styles it writes are the ones that make the
          invisible input behave — transparent selection, autofill suppression,
          and a handful of platform workarounds. Your design system stays in
          charge.
        </p>
      </Callout>

      <H2>What it handles for you</H2>
      <P>
        The interesting part of this library is not the API — it is the list of
        things that go wrong when you try to make one input look like six, and
        the fixes for each. A sample:
      </P>
      <Ul>
        <Li>
          A collapsed caret is ambiguous between two slots, so the selection is
          rewritten into a one-character range on every <C>selectionchange</C> —
          while still allowing a true insert caret at the end.
        </Li>
        <Li>
          Deleting text doesn&apos;t fire <C>selectionchange</C> in any browser,
          so the event is dispatched by hand.
        </Li>
        <Li>
          Password manager badges land on top of your last slot, so known
          extensions are detected and the input widens by 40px behind a
          clip-path to walk the badge out — with no visible layout shift.
        </Li>
        <Li>
          iOS renders the invisible text just wide enough to break the layout
          and refuses to show the long-press paste menu on a zero-opacity input,
          so there is a dedicated set of iOS-only rules and a paste handler.
        </Li>
        <Li>
          Autofill paints its own background colour over a field you asked to be
          transparent, so <C>:autofill</C> is neutralised and the state is
          shaken off with a synthetic <C>input</C> event.
        </Li>
        <Li>
          With JavaScript disabled, an invisible input is an unusable input — so
          a <C>&lt;noscript&gt;</C> stylesheet turns it back into an ordinary
          visible one.
        </Li>
      </Ul>
      <P>
        Each of these is written up with the reasoning and the exact fix in{' '}
        <A href="/docs/edge-cases">Edge cases</A>.
      </P>

      <H2>At a glance</H2>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: 'Bundle size',
            value: '~4 kB',
            note: 'minified + gzipped, zero dependencies',
          },
          {
            label: 'React',
            value: '16.8 → 19',
            note: 'hooks-era and up, RSC-friendly',
          },
          {
            label: 'Styling',
            value: 'None',
            note: 'bring your own, or copy a recipe',
          },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-lg border border-border/70 px-4 py-3.5"
          >
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
              {stat.label}
            </p>
            <p className="mt-1 text-lg font-medium text-foreground">
              {stat.value}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{stat.note}</p>
          </div>
        ))}
      </div>

      <H2>Where to go next</H2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          {
            href: '/docs/installation',
            title: 'Installation',
            body: 'Install the package and copy a slot component you can ship today.',
          },
          {
            href: '/docs/anatomy',
            title: 'Anatomy',
            body: 'X-ray the field and watch the selection algorithm run live.',
          },
          {
            href: '/docs/api',
            title: 'API reference',
            body: 'Every prop, render prop, data attribute and export.',
          },
          {
            href: '/docs/edge-cases',
            title: 'Edge cases',
            body: 'The full catalogue of platform quirks, and how each is absorbed.',
          },
        ].map(card => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-lg border border-border/70 px-4 py-3.5 transition-colors duration-150 hover:border-border hover:bg-foreground/[0.02]"
          >
            <p className="text-sm font-medium text-foreground">{card.title}</p>
            <p className="mt-1 text-[0.8125rem] leading-6 text-muted-foreground">
              {card.body}
            </p>
          </Link>
        ))}
      </div>
    </DocsPage>
  )
}
