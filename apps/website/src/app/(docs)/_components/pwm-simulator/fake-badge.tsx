'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { getVendor, type VendorId } from './vendors'

/**
 * A stand-in for a browser extension's badge.
 *
 * It does two things a real badge does: it sits over the right end of the input,
 * and it carries the DOM marker that identifies its vendor. That second part is
 * what makes this a simulation rather than a picture — `input-otp`'s own
 * detection query finds this element and reacts to it exactly as it would to
 * the genuine extension.
 */
export function FakeBadge({
  vendor,
  /** Distance from the wrapper's right edge to the badge's right edge. */
  offsetRight,
  top,
}: {
  vendor: VendorId
  offsetRight: number
  top: number
}) {
  const { apply, swatch, glyph, id } = getVendor(vendor)
  const markerRef = React.useRef<HTMLElement>(null)

  // 1Password's marker *is* its tag name, so that vendor needs a real
  // <com-1password-button> in the tree. React 18 won't put a `class` on a custom
  // element and can't emit `!important` (which Bitwarden's fingerprint needs), so
  // the marker is configured by hand and the styling lives on its parent.
  const Marker = (
    id === '1password' ? 'com-1password-button' : 'span'
  ) as 'span'

  React.useEffect(() => {
    const el = markerRef.current
    if (!el) return
    el.setAttribute('style', 'position: absolute; inset: 0;')
    apply(el)
  }, [apply])

  return (
    <span
      aria-hidden
      data-fake-pwm-badge
      className={cn(
        'absolute z-[60] flex h-6 w-6 select-none items-center justify-center rounded',
        'text-[0.5625rem] font-bold leading-none tracking-tight',
        'shadow-[0_1px_4px_rgb(0_0_0/0.45)] transition-[right] duration-300 ease-out',
        swatch,
      )}
      style={{ right: offsetRight, top }}
    >
      <Marker ref={markerRef as React.Ref<HTMLSpanElement>} />
      <span className="relative">{glyph}</span>
    </span>
  )
}
