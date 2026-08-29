/**
 * The frozen sidebar for the 1.x docs snapshot under /docs/v1. A literal
 * copy, not a derivation of the live nav: edits to the latest line's nav
 * must never leak into a frozen version.
 */

import type { DocsSection } from './nav'

export const docsNavV1: DocsSection[] = [
  {
    title: 'Getting started',
    pages: [
      {
        title: 'Introduction',
        href: '/docs/v1',
        description:
          'One invisible input, any UI you can imagine. The design decisions behind the most complete OTP field on the web.',
      },
      {
        title: 'Installation',
        href: '/docs/v1/installation',
        description:
          'Add input-otp to a React app and render your first field in about a minute.',
      },
      {
        title: 'Anatomy',
        href: '/docs/v1/anatomy',
        description:
          'X-ray the component: what the DOM really looks like, and how a single text input drives a row of slots.',
      },
    ],
  },
  {
    title: 'Guides',
    pages: [
      {
        title: 'Styling',
        href: '/docs/v1/styling',
        description:
          'Slots, fake carets, placeholders, groups and separators — plus the data attributes that let CSS do the work.',
      },
      {
        title: 'Validation & patterns',
        href: '/docs/v1/validation',
        description:
          'Restrict what can be typed, keep pasted codes from bouncing, and pick the right mobile keyboard.',
        label: 'Validation',
      },
      {
        title: 'Forms',
        href: '/docs/v1/forms',
        description:
          'Controlled and uncontrolled values, auto-submit on completion, react-hook-form, and server actions.',
      },
      {
        title: 'Accessibility',
        href: '/docs/v1/accessibility',
        description:
          'Why one real input beats six fake ones, how to label it, and what a screen reader actually announces.',
      },
      {
        title: 'Password managers',
        href: '/docs/v1/password-managers',
        description:
          'How input-otp detects 1Password, LastPass, Dashlane and Bitwarden badges and moves them out of your last slot. With a live simulator.',
        label: 'Password managers',
      },
      {
        title: 'Mobile & platforms',
        href: '/docs/v1/mobile',
        description:
          'SMS autofill, iOS long-press paste, Android keyboards, autofill styling, and the no-JS fallback.',
        label: 'Mobile & platforms',
      },
    ],
  },
  {
    title: 'Reference',
    pages: [
      {
        title: 'API reference',
        href: '/docs/v1/api',
        description:
          'Every prop, render prop, data attribute and export, with types.',
      },
      {
        title: 'Edge cases',
        href: '/docs/v1/edge-cases',
        description:
          'The complete catalogue of browser and platform quirks this library absorbs, and the exact fix for each one.',
      },
      {
        title: 'Examples',
        href: '/docs/v1/examples',
        description:
          'A gallery of finished fields you can copy: Stripe-style, segmented, underlined, masked, and more.',
      },
      {
        title: 'Troubleshooting',
        href: '/docs/v1/troubleshooting',
        description:
          'Answers to the questions that come up most often in issues and discussions.',
      },
    ],
  },
]
