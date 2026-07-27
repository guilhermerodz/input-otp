'use client'

import * as React from 'react'
import Script from 'next/script'

/* /public/rodz-signature.js — a dependency-free web component that draws the
   signature stroke by stroke. */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'rodz-signature': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        duration?: string
        color?: string
      }
    }
  }
}

type SignatureElement = HTMLElement & { replay?: () => void }

export function FooterSignature() {
  const hostRef = React.useRef<HTMLDivElement>(null)

  /* The element animates the moment the script upgrades it, which happens
     long before anyone reaches the footer. Restart the signing when it
     actually scrolls into view so the visitor sees it drawn. */
  React.useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let cancelled = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        customElements.whenDefined('rodz-signature').then(() => {
          if (cancelled) return
          host.querySelector<SignatureElement>('rodz-signature')?.replay?.()
        })
      },
      { threshold: 0.6 },
    )
    observer.observe(host)

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <Script src="/rodz-signature.js" strategy="lazyOnload" />
      <div ref={hostRef} className="xp-signature" aria-label="Guilherme Rodz">
        <rodz-signature duration="2800" color="#e4e4e7" />
      </div>
    </>
  )
}
