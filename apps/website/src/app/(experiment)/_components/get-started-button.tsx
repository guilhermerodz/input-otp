'use client'

/* The page's one call to action, after Resend's — see .xp-btn in
   experiment.css. It appears twice, at the top of the hero and at the foot of
   the closing CTA, and the two have to be the same object: they are the same
   promise made at the start and at the end of the page. */

import { useSpotlight } from './spotlight'

export function GetStartedButton({ href }: { href: string }) {
  /* Short reach: the button is small and sits in a row with the install line,
     so its rim should light as the cursor arrives at it, not from across the
     hero. */
  const spot = useSpotlight<HTMLAnchorElement>({ reach: 200, spread: 150 })

  return (
    <a className="xp-btn" href={href} ref={spot}>
      Get started
      <svg
        className="xp-btn-chevron"
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M10.707 6.293a1 1 0 1 0-1.414 1.414l3.586 3.586a1 1 0 0 1 0 1.414l-3.586 3.586a1 1 0 0 0 1.414 1.414l5-5a1 1 0 0 0 0-1.414z"
        />
      </svg>
    </a>
  )
}
