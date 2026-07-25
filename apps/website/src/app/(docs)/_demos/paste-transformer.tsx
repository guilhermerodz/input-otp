'use client'

import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp'

import { Slot } from '@/components/ui/otp-slot'

export function PasteTransformerDemo() {
  return (
    <OTPInput
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS}
      // The pattern forbids hyphens and the length is 6, so "123-456" would be
      // rejected outright. Strip the separator before validation sees it.
      pasteTransformer={pasted => pasted.replace(/[^0-9]/g, '')}
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
