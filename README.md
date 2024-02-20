## OTP Input for React

https://github.com/guilhermerodz/input-otp/assets/10366880/7de9c10f-d7aa-48e8-93bc-c2cf0e3dfd49

One time passcode Input. Accessible & unstyled.

_Still writing docs/examples..._

## Usage

```bash
npm install input-otp
```

Import the `<OTPInput />`, create your `<Slot {...slot} />` component and perhaps a `<FakeCaret />`

## Default example

The example below uses `tailwindcss` `@shadcn/ui` `tailwind-merge` `clsx`:

```tsx
'use client'
import { OTPInput } from 'input-otp'

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
function Slot(props: { char: string | null; isActive: boolean }) {
  return (
    <div
      className={cn(
        'relative w-10 h-14 text-[2rem]',
        'flex items-center justify-center',
        'transition-all duration-300',
        'border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md',
        'group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20',
        'outline outline-0 outline-accent-foreground/20',
        { 'outline-4 outline-accent-foreground z-10': props.isActive },
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
      {props.char === null && props.isActive && <FakeCaret />}
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
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## API Reference

### OTPInput

The input root itself. It's works as a _container div_ that renders 1. your custom `<Slot {...slot} />` component and 2. a hidden native input (opacity 0). The underlying invisible input makes it accessible as the user only execute actions on it, not the container.

Mandatory props:

`maxLength`: Number of slots.
`render`: A JSX component for rendering slots. Receive the props:
  - `slots`: `Slot[]` being `type Slot = { isActive: boolean, char: string | null, hasFakeCaret: boolean }`
  - `isFocused`: Is the native input focused?
  - `isHovering`: Is the user hovering the root container?

Additional props:

`allowNavigation`: Default `true`. When `false`, the input will prevent keyboard navigation (like arrows) and multi-range (2+ chars) selections.

`inputMode`: Default `numeric`. When `text`, the component will set it's internal native HTML input attribute "inputMode".

`onBlur`: Attach a function when the input triggers `blur` event.

`onChange`: For controlled inputs (like _react-hook-form_).

`onComplete`: Attach a function to execute after the input value reaches its max length.

`value`: For controlled inputs (like _react-hook-form_).
