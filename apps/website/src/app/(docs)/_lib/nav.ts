/**
 * The single source of truth for the docs sidebar, the prev/next pager and
 * every page's <title>. Adding a page means adding one entry here — the
 * sidebar and the pager pick it up automatically.
 */

export interface DocsPageMeta {
  title: string
  href: string
  /** Shown under the H1 and used as the page <meta name="description">. */
  description: string
  /** Sidebar-only shorthand, when the real title is too long for the rail. */
  label?: string
}

export interface DocsSection {
  title: string
  pages: DocsPageMeta[]
}

export const docsNav: DocsSection[] = [
  {
    title: 'Getting started',
    pages: [
      {
        title: 'Introduction',
        href: '/docs',
        description:
          'One invisible input, any UI you can imagine. The design decisions behind the most complete OTP field on the web.',
      },
      {
        title: 'Installation',
        href: '/docs/installation',
        description:
          'Add input-otp to a React app and render your first field in about a minute.',
      },
      {
        title: 'Anatomy',
        href: '/docs/anatomy',
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
        href: '/docs/styling',
        description:
          'Slots, fake carets, placeholders, groups and separators — plus the data attributes that let CSS do the work.',
      },
      {
        title: 'Validation & patterns',
        href: '/docs/validation',
        description:
          'Restrict what can be typed, keep pasted codes from bouncing, and pick the right mobile keyboard.',
        label: 'Validation',
      },
      {
        title: 'Forms',
        href: '/docs/forms',
        description:
          'Controlled and uncontrolled values, auto-submit on completion, react-hook-form, and server actions.',
      },
      {
        title: 'Accessibility',
        href: '/docs/accessibility',
        description:
          'Why one real input beats six fake ones, how to label it, and what a screen reader actually announces.',
      },
      {
        title: 'Password managers',
        href: '/docs/password-managers',
        description:
          'How input-otp detects 1Password, LastPass, Dashlane and Bitwarden badges and moves them out of your last slot. With a live simulator.',
        label: 'Password managers',
      },
      {
        title: 'Mobile & platforms',
        href: '/docs/mobile',
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
        href: '/docs/api',
        description:
          'Every prop, render prop, data attribute and export, with types.',
      },
      {
        title: 'Edge cases',
        href: '/docs/edge-cases',
        description:
          'The complete catalogue of browser and platform quirks this library absorbs, and the exact fix for each one.',
      },
      {
        title: 'Examples',
        href: '/docs/examples',
        description:
          'A gallery of finished fields you can copy: Stripe-style, segmented, underlined, masked, and more.',
      },
      {
        title: 'Troubleshooting',
        href: '/docs/troubleshooting',
        description:
          'Answers to the questions that come up most often in issues and discussions.',
      },
    ],
  },
]

/** Flat, ordered list of every docs page — used for prev/next. */
export const docsPages: DocsPageMeta[] = docsNav.flatMap(
  section => section.pages,
)

export function getDocsPage(href: string): DocsPageMeta | undefined {
  return docsPages.find(page => page.href === href)
}

export function getDocsPager(href: string) {
  const index = docsPages.findIndex(page => page.href === href)
  if (index === -1) {
    return { prev: undefined, next: undefined }
  }
  return {
    prev: index > 0 ? docsPages[index - 1] : undefined,
    next: index < docsPages.length - 1 ? docsPages[index + 1] : undefined,
  }
}
