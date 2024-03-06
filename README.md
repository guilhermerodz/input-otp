# OTP Input for React

https://github.com/guilhermerodz/input-otp/assets/10366880/753751f5-eda8-4145-a4b9-7ef51ca5e453

## Usage

```bash
npm install input-otp
```

Then import the component.

```diff
+'use client'
+import { OTPInput } from 'input-otp'

function MyForm() {
  return <form>
+   <OTPInput maxLength={6} render={({slots})  => (...)} />
  </form>
}
```

## Default example

The example below uses `tailwindcss` `@shadcn/ui` `tailwind-merge` `clsx`:

```tsx
'use client'
import { OTPInput, SlotProps } from 'input-otp'
<OTPInput
  maxLength={6}
  containerClassName="group flex items-center has-[:disabled]:opacity-30"
  render={({ slots }) => (
    <>
      <div className="flex">
        {slots.slice(0, 3).map((slot, idx) => (
          <Slot key={idx} {...slot} />
        ))}
      </div>

      <FakeDash />

      <div className="flex">
        {slots.slice(3).map((slot, idx) => (
          <Slot key={idx} {...slot} />
        ))}
      </div>
    </>
  )}
/>

// Feel free to copy. Uses @shadcn/ui tailwind colors.
function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        'relative w-10 h-14 text-[2rem]',
        'flex items-center justify-center',
        'transition-all duration-300',
        'border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md',
        'group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20',
        'outline outline-0 outline-accent-foreground/20',
        { 'outline-4 outline-accent-foreground': props.isActive },
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
      {props.hasFakeCaret && <FakeCaret />}
    </div>
  )
}

// You can emulate a fake textbox caret!
function FakeCaret() {
  return (
    <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
      <div className="w-px h-8 bg-white" />
    </div>
  )
}

// Inspired by Stripe's MFA input.
function FakeDash() {
  return (
    <div className="flex w-10 justify-center items-center">
      <div className="w-3 h-1 rounded-full bg-border" />
    </div>
  )
}

// tailwind.config.ts for the blinking caret animation.
const config = {
  theme: {
    extend: {
      keyframes: {
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
      },
      animation: {
        'caret-blink': 'caret-blink 1.2s ease-out infinite',
      },
    },
  },
}

// Small utility to merge class names.
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import type { ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## How it works

There's currently no native OTP/2FA/MFA input in HTML, which means people are either going with 1. a simple input design or 2. custom designs like this one.
This library works by rendering an invisible input as a sibling of the slots, contained by a `relative`ly positioned parent (the container root called _OTPInput_).

## Features

<details>
<summary>Supports iOS + Android copy-paste-cut</summary>

https://github.com/guilhermerodz/input-otp/assets/10366880/bdbdc96a-23da-4e89-bff8-990e6a1c4c23

</details>

<details>
<summary>Automatic OTP code retrieval from transport (e.g SMS)</summary>

By default, this input uses `autocomplete='one-timecode'` and it works as it's a single input. 

https://github.com/guilhermerodz/input-otp/assets/10366880/5705dac6-9159-443b-9c27-b52e93c60ea8

</details>

<details>
<summary>Supports screen readers (a11y)</summary>

Stripe was my first inspiration to build this library.

Take a look at Stripe's input. The screen reader does not behave like it normally should on a normal single input.
That's because Stripe's solution is to render a 1-digit input with "clone-divs" rendering a single char per div.

https://github.com/guilhermerodz/input-otp/assets/10366880/3d127aef-147c-4f28-9f6c-57a357a802d0

So we're rendering a single input with invisible/transparent colors instead.
The screen reader now gets to read it, but there is no appearance. Feel free to build whatever UI you want:

https://github.com/guilhermerodz/input-otp/assets/10366880/718710f0-2198-418c-8fa0-46c05ae5475d

</details>

<details>
<summary>Supports all keybindings</summary>

Should be able to support all keybindings of a common text input as it's an input.

https://github.com/guilhermerodz/input-otp/assets/10366880/185985c0-af64-48eb-92f9-2e59be9eb78f

</details>

## API Reference

### OTPInput

The root container. Define settings for the input via props. Then, use the `render` prop to create the slots.

#### Props

```ts
type OTPInputProps = {
  // The number of slots
  maxLength: number

  // Render function creating the slots
  render: (props: RenderProps) => React.ReactElement

  // The class name for the root container
  containerClassName?: string

  // Value state controlling the input
  value?: string
  // Setter for the controlled value (or callback for uncontrolled value)
  onChange?: (newValue: string) => unknown

  // Callback when the input is complete
  onComplete?: (...args: any[]) => unknown

  // Where is the text located within the input
  // Affects click-holding or long-press behavior
  // Default: 'left'
  textAlign?: 'left' | 'center' | 'right'

  // Virtual keyboard appearance on mobile
  // Default: 'numeric'
  inputMode?: 'numeric' | 'text'
}
```

## Examples

<details>
<summary>Automatic form submission on OTP completion</summary>

```tsx
export default function Page() {
  const formRef = useRef<HTMLFormElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <form ref={formRef}>
      <OTPInput
        // ... automatically submit the form
        onComplete={() => formRef.current?.submit()}
        // ... or focus the button like as you wish
        onComplete={() => buttonRef.current?.focus()}
      />

      <button ref={buttonRef}>Submit</button>
    </form>
  )
}
```
</details>

<details>
<summary>Automatically focus the input when the page loads</summary>

```tsx
export default function Page() {
  return (
    <form ref={formRef}>
      <OTPInput
        autoFocus
        // Pro tip: accepts all common HTML input props...
      />
    </form>
  )
}
```
</details>

## Caveats

<details>
<summary>If you're using experiencing an unwanted border on input focus:</summary>

```diff
<OTPInput
  // Add class to the input itself
+ className="focus-visible:ring-0"
  // Not the container
  containerClassName="..."
/>
```
</details>

<details>
<summary>If you want to centralize input text/selection, use the `textAlign` prop:</summary>

```diff
<OTPInput
  // customizable but not recommended
+ textAlign="center"
/>
```

NOTE: this also affects the selected caret position after a touch/click

`textAlign="left"`
<img src="https://github.com/guilhermerodz/input-otp/assets/10366880/685a03df-2b69-4a36-b21c-e453f6098f79" width="300" />
<br>

`textAlign="center"`
<img src="https://github.com/guilhermerodz/input-otp/assets/10366880/e0f15b97-ceb8-40c8-96b7-fa3a8896379f" width="300" />
<br>

`textAlign="right"`
<img src="https://github.com/guilhermerodz/input-otp/assets/10366880/26697579-0e8b-4dad-8b85-3a036102e951" width="300" />
<br>

</details>

<details>
<summary>Add Tailwind autocomplete for `containerClassname` attribute in VS Code.</summary>

Add the following setting to your `.vscode/settings.json`:
```diff
{
  "tailwindCSS.classAttributes": [
    "class",
    "className",
+   ".*ClassName"
  ]
}
```
</details>
