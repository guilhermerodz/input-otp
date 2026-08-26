<div align="center">

# input-otp

**One invisible input, any UI you can imagine.**

The accessible, unstyled, fully featured one-time-password component for React.

[![npm](https://img.shields.io/npm/v/input-otp?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/input-otp)
[![downloads](https://img.shields.io/npm/dm/input-otp?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/input-otp)
[![bundle size](https://img.shields.io/bundlephobia/minzip/input-otp?style=flat&label=size&colorA=000000&colorB=000000)](https://bundlephobia.com/package/input-otp)
[![license](https://img.shields.io/npm/l/input-otp?style=flat&colorA=000000&colorB=000000)](./LICENSE)

[**Documentation**](https://input-otp.rodz.dev/docs) · [Examples](https://input-otp.rodz.dev/docs/examples) · [API](https://input-otp.rodz.dev/docs/api) · [Edge cases](https://input-otp.rodz.dev/docs/edge-cases)

</div>

<br />

<h4 align="center">Diamond Sponsor 💎</h4>
<p align="center">
<a href="https://go.clerk.com/input-otp" target="_blank">
<img alt="Clerk" src="https://input-otp.rodz.dev/sponsors/clerk-wordmark-white-in-black-bg.svg" width="240"/>
</a>
</p>
<p align="center"><sub><a href="https://go.clerk.com/input-otp"><b>Clerk</b> — the easiest way to add authentication to your application</a></sub></p>

<h4 align="center">Hero Sponsors</h4>
<table align="center">
<tr>
<td align="center">
<a href="https://evomi.com/?utm_source=github&utm_campaign=otp" target="_blank">
<img alt="Evomi" src="https://input-otp.rodz.dev/sponsors/evomi-wordmark-white-in-black-bg.svg" width="110"/>
</a>
</td>
<td align="center">
<a href="https://www.rapidproxy.io/?ref=inpu" target="_blank">
<img alt="Rapidproxy" src="https://raw.githubusercontent.com/guilhermerodz/input-otp/8476b12529c0d82ae2615e1414de2702c1779fb3/apps/website/public/sponsors/rapidproxy-wordmark-white-in-black-bg.svg" width="110"/>
</a>
</td>
</tr>
</table>
<p align="center"><sub><a href="https://evomi.com/?utm_source=github&utm_campaign=otp"><b>Evomi</b> — residential proxies from $0.49</a> · <a href="https://www.rapidproxy.io/?ref=inpu"><b>Rapidproxy</b> — residential proxies from $0.55</a></sub></p>

## Why

HTML has no one-time-password control. There is no `<input type="otp">`, so most
products build one out of six separate inputs wired together with keydown
handlers that shuffle focus between them — and quietly lose SMS autofill, screen
reader support, partial paste, undo, and half the keyboard along the way.

`input-otp` renders **exactly one real text input**, paints it invisible, and
hands you the state to draw whatever you want on top. Everything the browser
gives a text field keeps working, because there is still a text field.

- **SMS autofill** — `autocomplete="one-time-code"` only means something on a single field
- **Screen readers** — one control, one name, one value, one caret, one tab stop
- **Every keybinding you didn't implement** — select-all, word-delete, shift-arrow ranges, undo, the iOS long-press menu
- **Real paste** — including a partial paste into the middle of a half-filled code
- **Form semantics** — one `name`, one entry in `FormData`, a real `<label>` that focuses it
- **Unstyled** — no theme, no class names to override, no CSS to import
- **Small** — zero dependencies, React 16.8 → 19 (see the size badge above)

## Install

```bash
npm install input-otp
```

## Usage

`maxLength` is the number of slots. `render` receives them and returns your
markup — that's the whole contract.

```tsx
'use client'
import { OTPInput } from 'input-otp'

export function VerificationCode() {
  return (
    <OTPInput
      maxLength={6}
      containerClassName="group flex items-center"
      render={({ slots }) => (
        <div className="flex">
          {slots.map((slot, idx) => (
            <Slot key={idx} {...slot} />
          ))}
        </div>
      )}
    />
  )
}
```

Each slot tells you what to draw:

```tsx
import type { SlotProps } from 'input-otp'

function Slot({ char, placeholderChar, isActive, hasFakeCaret }: SlotProps) {
  return (
    <div
      className={cn(
        'relative flex h-14 w-12 items-center justify-center',
        'border-y border-r border-border first:rounded-l-md first:border-l last:rounded-r-md',
        'text-[1.375rem] font-medium tabular-nums transition-all duration-200',
        'outline outline-0 outline-foreground/80',
        isActive && 'z-10 outline-2', // this slot is being edited
      )}
    >
      {char ?? placeholderChar}
      {hasFakeCaret && <FakeCaret />} {/* the real caret is transparent */}
    </div>
  )
}
```

> The full, copy-pasteable slot component (with the caret keyframe and the
> Stripe-style dash) is in
> [**Installation**](https://input-otp.rodz.dev/docs/installation).

### Using shadcn/ui?

shadcn/ui's `input-otp` component wraps this library with pre-composed parts.
Same engine, `<InputOTPSlot index={0} />` instead of a render prop:

```bash
npx shadcn@latest add input-otp
```

## What it handles for you

The API is five props. The value is the list of things that go wrong when one
invisible input has to behave like six boxes — and the fix for each:

|                                             |                                                                                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A collapsed caret has no slot               | The selection is rewritten into a one-character range on every `selectionchange` — except at the append position, where a bare caret is meaningful                 |
| `ArrowLeft` appears to skip a slot          | Direction is inferred from the previous selection, with a guard for leaving insert mode                                                                            |
| Deleting doesn't fire `selectionchange`     | The event is dispatched by hand when the value shrinks                                                                                                             |
| Password manager badges cover the last slot | A badge is detected by known extension markers, then by probing the field's top-right corner; the input widens 40px behind a `clip-path` — no visible layout shift |
| iOS won't paste into an invisible input     | The field keeps `opacity: 1` and hides itself with transparent colours; paste is handled manually                                                                  |
| Autofill paints its own background          | `:autofill` is neutralised, and the state is shaken off with a synthetic `input` event                                                                             |
| No JavaScript means no visible field        | A `<noscript>` stylesheet turns the input back into a plain visible one                                                                                            |

Each of these — and a dozen more — is written up with the reasoning and the exact
code in [**Edge cases**](https://input-otp.rodz.dev/docs/edge-cases).

## Documentation

|                                                                        |                                                                 |
| ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| [Introduction](https://input-otp.rodz.dev/docs)                        | Why one input, and what you write                               |
| [Installation](https://input-otp.rodz.dev/docs/installation)           | Install, first render, a slot component to copy                 |
| [Anatomy](https://input-otp.rodz.dev/docs/anatomy)                     | X-ray the field and watch the selection algorithm run live      |
| [Styling](https://input-otp.rodz.dev/docs/styling)                     | Slots, carets, placeholders, groups, data attributes            |
| [Validation](https://input-otp.rodz.dev/docs/validation)               | `pattern`, `pasteTransformer`, `inputMode`                      |
| [Forms](https://input-otp.rodz.dev/docs/forms)                         | Controlled values, auto-submit, react-hook-form, server actions |
| [Accessibility](https://input-otp.rodz.dev/docs/accessibility)         | Labelling, keyboard, what a screen reader hears                 |
| [Password managers](https://input-otp.rodz.dev/docs/password-managers) | How badge detection works — **with a live simulator**           |
| [Mobile & platforms](https://input-otp.rodz.dev/docs/mobile)           | SMS autofill, iOS quirks, autofill styling, no-JS               |
| [API reference](https://input-otp.rodz.dev/docs/api)                   | Every prop, render prop, data attribute and export              |
| [Examples](https://input-otp.rodz.dev/docs/examples)                   | A gallery of finished fields to copy                            |
| [Troubleshooting](https://input-otp.rodz.dev/docs/troubleshooting)     | The questions that come up most                                 |

## API at a glance

```ts
type OTPInputProps = {
  maxLength: number                       // number of slots — required

  render?: (props: RenderProps) => React.ReactNode
  children?: React.ReactNode              // …or compose and read OTPInputContext

  value?: string
  onChange?: (newValue: string) => unknown   // a string, not an event
  onComplete?: (...args: any[]) => unknown // fires once, on the transition to full;
                                           // receives the value as a string (narrows in 2.0)

  pattern?: string | RegExp               // gates every change; no default
  placeholder?: string                    // per-slot placeholder characters
  pasteTransformer?: (pasted: string) => string

  containerClassName?: string             // the visible wrapper
  // className goes to the invisible input

  textAlign?: 'left' | 'center' | 'right'          // default 'left'
  inputMode?: 'numeric' | 'text' | ...             // default 'numeric'
  pushPasswordManagerStrategy?: 'increase-width' | 'none'
  noScriptCSSFallback?: string | null
  nonce?: string                          // for CSP style-src — applied to the injected <style> tag
}

interface SlotProps {
  char: string | null
  placeholderChar: string | null
  isActive: boolean
  hasFakeCaret: boolean
}
```

Every other `<input>` attribute is forwarded — `name`, `required`, `disabled`,
`autoFocus`, `aria-*`, `data-*` — and `ref` points at the real input.
`spellCheck` defaults to `false` (browsers would underline a full code as a
typo); pass `spellCheck` yourself to override.

Full reference: [**input-otp.rodz.dev/docs/api**](https://input-otp.rodz.dev/docs/api).

## Contributing

```bash
pnpm install
pnpm build:lib          # tsup → packages/input-otp/dist
pnpm dev:playground     # the Playwright target, port 3039
pnpm test               # Playwright, all browsers
```

Tests live in `apps/playground/src/tests`. Note that the iOS code path, SMS
autofill and password manager badges **cannot** be covered headlessly — see
[Mobile & platforms](https://input-otp.rodz.dev/docs/mobile#testing-across-platforms).

## Sponsors

<h4 align="center">Diamond Sponsor 💎</h4>
<p align="center">
<a href="https://go.clerk.com/input-otp" target="_blank">
<img alt="Clerk" src="https://input-otp.rodz.dev/sponsors/clerk-wordmark-white-in-black-bg.svg" width="240"/>
</a>
</p>

<h4 align="center">Hero Sponsors</h4>
<table align="center">
<tr>
<td align="center">
<a href="https://evomi.com/?utm_source=github&utm_campaign=otp" target="_blank">
<img alt="Evomi" src="https://input-otp.rodz.dev/sponsors/evomi-wordmark-white-in-black-bg.svg" width="110"/>
</a>
</td>
<td align="center">
<a href="https://www.rapidproxy.io/?ref=inpu" target="_blank">
<img alt="Rapidproxy" src="https://raw.githubusercontent.com/guilhermerodz/input-otp/8476b12529c0d82ae2615e1414de2702c1779fb3/apps/website/public/sponsors/rapidproxy-wordmark-white-in-black-bg.svg" width="110"/>
</a>
</td>
</tr>
</table>

- [Clerk](https://go.clerk.com/input-otp) — the easiest way to add authentication to your application
- [Evomi](https://evomi.com/?utm_source=github&utm_campaign=otp) — residential proxies from $0.49
- [Rapidproxy](https://www.rapidproxy.io/?ref=inpu) — residential proxies from $0.55

<br />

<div align="center">

MIT © [Guilherme Rodz](https://twitter.com/guilherme_rodz)

</div>
