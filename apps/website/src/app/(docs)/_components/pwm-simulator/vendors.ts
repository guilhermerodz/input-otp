/**
 * The four password managers `input-otp` looks for by name, and the exact hook
 * each one leaves in the DOM. These strings are copied from the library's
 * `PASSWORD_MANAGERS_SELECTORS` — the simulated badges below carry the real
 * markers, which is why the real detection code reacts to them.
 */

export type VendorId = '1password' | 'lastpass' | 'dashlane' | 'bitwarden'

export interface Vendor {
  id: VendorId
  label: string
  /** The selector the library matches on. */
  selector: string
  /** How the simulated badge announces itself. */
  apply: (el: HTMLElement) => void
  /** Badge colours, roughly matching each extension's real icon. */
  swatch: string
  glyph: string
}

export const VENDORS: Vendor[] = [
  {
    id: '1password',
    label: '1Password',
    selector: 'com-1password-button',
    // 1Password injects a custom element; the selector is its tag name, so the
    // simulated badge has to *be* that tag.
    apply: () => {},
    swatch: 'bg-[#1a6ce7] text-white',
    glyph: '1P',
  },
  {
    id: 'lastpass',
    label: 'LastPass',
    selector: '[data-lastpass-icon-root]',
    apply: el => el.setAttribute('data-lastpass-icon-root', ''),
    swatch: 'bg-[#d32d27] text-white',
    glyph: '••',
  },
  {
    id: 'dashlane',
    label: 'Dashlane',
    selector: '[data-dashlanecreated]',
    apply: el => el.setAttribute('data-dashlanecreated', 'true'),
    swatch: 'bg-[#0e353d] text-[#9ff2c0]',
    glyph: 'D',
  },
  {
    id: 'bitwarden',
    label: 'Bitwarden',
    // Bitwarden has no stable attribute, so the library fingerprints the
    // maximum z-index it stamps into the element's inline style.
    selector: '[style$="2147483647 !important;"]',
    apply: el => {
      // React can't emit `!important`, and the selector is an exact
      // ends-with match on the style attribute — so write it by hand.
      el.setAttribute(
        'style',
        `${el.getAttribute('style') ?? ''} z-index: 2147483647 !important;`,
      )
    },
    swatch: 'bg-[#175ddc] text-white',
    glyph: 'bw',
  },
]

export function getVendor(id: VendorId) {
  return VENDORS.find(v => v.id === id)!
}

/** Verbatim from `use-pwm-badge.tsx`. */
export const PASSWORD_MANAGERS_SELECTORS = VENDORS.map(v => v.selector).join(
  ',',
)

/** Verbatim from `use-pwm-badge.tsx`. */
export const PWM_BADGE_MARGIN_RIGHT = 18
export const PWM_BADGE_SPACE_WIDTH_PX = 40
