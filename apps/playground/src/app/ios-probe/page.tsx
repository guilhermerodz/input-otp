'use client'

import * as React from 'react'

import { OTPInput } from 'input-otp'

// Manual probe page for the iOS-only native selection artifact (issues #32,
// #75, #110). Playwright never exercises the iOS branch (the
// -webkit-touch-callout guard only matches on iOS WebKit), so this page
// exists to be opened in an iOS Simulator / real device.
// Append ?legacy=1 to reproduce the pre-fix behavior (font-size equal to
// --root-height) for a before/after comparison.
const VARIANTS: Record<string, string> = {
  // Pre-fix behavior: font-size equal to --root-height.
  legacy: `[data-input-otp] { font-size: var(--root-height) !important; }`,
  // Control: below the 16px threshold — expected to trigger iOS focus zoom.
  tiny: `[data-input-otp] { font-size: 8px !important; }`,
  // Ultra-small experiment: computed font-size stays 16px (no focus zoom),
  // but the rendering is scaled down so the selection artifact becomes
  // sub-2px. The layout box is enlarged by the inverse scale so the hit
  // area still covers the container. Letter-spacing is relaxed so the
  // *rendered* selection width stays >=1px (the touch callout constraint).
  scale: `[data-input-otp] {
    font-size: 16px !important;
    width: 1000% !important;
    height: 1000% !important;
    transform: scale(0.1) !important;
    transform-origin: 0 0 !important;
    letter-spacing: .2em !important;
    left: 0 !important;
    right: 0 !important;
  }`,
}

export default function Page() {
  const ref = React.useRef<HTMLInputElement>(null)
  const [variant, setVariant] = React.useState('fixed')
  const [defaultValue, setDefaultValue] = React.useState<string | null>(null)

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setDefaultValue(params.get('value') ?? '123456')

    const v = params.get('variant') ?? (params.get('legacy') === '1' ? 'legacy' : null)
    // Free-form CSS overrides for quick experiments:
    // ?css=opacity:.1 scopes to the input; ?rawcss=<full rules> is verbatim.
    const extraCss = params.get('css')
    const rawCss = params.get('rawcss')
    const override = [
      v && VARIANTS[v] ? VARIANTS[v] : '',
      extraCss
        ? `[data-input-otp] { ${extraCss
            .split(';')
            .filter(d => d.trim())
            .map(d => `${d} !important`)
            .join('; ')}; }`
        : '',
      rawCss ?? '',
    ]
      .filter(Boolean)
      .join('\n')
    if (v && VARIANTS[v]) {
      setVariant(v)
    } else if (extraCss) {
      setVariant(`css: ${extraCss}`)
    }
    if (!override) {
      return
    }
    // Injected after the library's own stylesheet so it wins the cascade.
    const t = setTimeout(() => {
      const style = document.createElement('style')
      style.innerHTML = `@supports (-webkit-touch-callout: none) { ${override} }`
      document.head.appendChild(style)
    }, 300)
    return () => clearTimeout(t)
  }, [])

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('nofocus') === '1') {
      return
    }
    const selectAll = params.get('selectall') === '1'
    const t = setTimeout(() => {
      ref.current?.focus()
      if (selectAll) {
        setTimeout(() => ref.current?.setSelectionRange(0, ref.current.value.length), 300)
      }
    }, 800)
    return () => clearTimeout(t)
  }, [])

  // Tap-coordinate readout so screenshots can calibrate host->device mapping.
  const [tap, setTap] = React.useState('none')
  const tapCount = React.useRef(0)
  React.useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      tapCount.current += 1
      setTap(
        `#${tapCount.current} ${Math.round(e.clientX)},${Math.round(e.clientY)}`,
      )
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  return (
    <div
      style={{
        padding: 40,
        background: 'white',
        minHeight: '100vh',
        fontFamily: 'sans-serif',
      }}
    >
      <p data-testid="probe-mode">
        variant: {variant} · tap: {tap}
      </p>
      {defaultValue === null ? null : (
      <OTPInput
        ref={ref}
        maxLength={6}
        defaultValue={defaultValue}
        render={({ slots }) => (
          <div style={{ display: 'flex', gap: 8 }}>
            {slots.map((slot, idx) => (
              <div
                key={idx}
                style={{
                  width: 40,
                  height: 56,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  fontSize: 20,
                  color: '#111',
                  outline: slot.isActive ? '2px solid #bbb' : 'none',
                }}
              >
                {slot.char}
              </div>
            ))}
          </div>
        )}
      />
      )}
    </div>
  )
}
