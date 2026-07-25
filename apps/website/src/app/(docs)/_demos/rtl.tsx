'use client'

import { OTPInput } from 'input-otp'

import { Slot } from '@/components/ui/otp-slot'

/**
 * OTP codes are read left-to-right even in RTL layouts, so the slot row keeps
 * its direction while the surrounding copy flips. `dir="ltr"` on the container
 * is the whole trick.
 */
export function RtlDemo() {
  return (
    <div dir="rtl" className="flex flex-col items-center gap-3">
      <label htmlFor="rtl-code" className="text-sm font-medium text-foreground">
        رمز التحقق
      </label>

      <OTPInput
        id="rtl-code"
        dir="ltr"
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

      <p className="text-sm text-muted-foreground">
        أدخل الرمز المكون من ٦ أرقام
      </p>
    </div>
  )
}
