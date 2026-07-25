'use client'

import * as React from 'react'

/**
 * Compare tool, not a feature: swaps the hero slots' background between the
 * current flat fill and five subtle to-bottom gradients, all of them plain
 * paint — no blur, no backdrop compositing. The variant is an attribute on
 * <html>, so the real hero renders once and every variant is seen in place
 * — same motes field, same spotlight, same tour.
 *
 * Number keys 0–5 switch too, so you can flick between two candidates
 * without moving the pointer off the input.
 */
const VARIANTS = [
  { id: 'off', label: 'flat', hint: 'current — solid #0c0c0e' },
  { id: 'lift', label: 'lift', hint: 'dim at the top, thinning downward' },
  { id: 'well', label: 'well', hint: 'open at the top, gathering to a floor' },
  { id: 'sheet', label: 'sheet', hint: 'even veil, only the tint shifts' },
  { id: 'frost', label: 'frost', hint: 'cool accent wash, translucent base' },
  { id: 'seam', label: 'seam', hint: 'specular hairline on the top bevel' },
] as const

const STORAGE_KEY = 'xp-slot-bg'

export function SlotBgSwitcher() {
  const [variant, setVariant] = React.useState<string>('off')

  // Restore the last pick, so a reload doesn't reset the comparison.
  React.useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved && VARIANTS.some(v => v.id === saved)) setVariant(saved)
  }, [])

  React.useEffect(() => {
    document.documentElement.dataset.slotBg = variant
    window.localStorage.setItem(STORAGE_KEY, variant)
  }, [variant])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // The hero input swallows digits — only fire when it isn't the target.
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.isContentEditable)) return
      const n = Number(e.key)
      if (Number.isInteger(n) && n >= 0 && n < VARIANTS.length) {
        setVariant(VARIANTS[n].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="xp-bgswitch" role="group" aria-label="Hero slot background">
      <span className="xp-bgswitch-title">slot bg</span>
      {VARIANTS.map((v, i) => (
        <button
          key={v.id}
          type="button"
          title={`${v.hint}  ·  press ${i}`}
          aria-pressed={variant === v.id}
          className={`xp-bgswitch-btn ${
            variant === v.id ? 'xp-bgswitch-btn--on' : ''
          }`}
          onClick={() => setVariant(v.id)}
        >
          <span className={`xp-bgswitch-chip xp-bgswitch-chip--${v.id}`} />
          {v.label}
        </button>
      ))}
    </div>
  )
}
