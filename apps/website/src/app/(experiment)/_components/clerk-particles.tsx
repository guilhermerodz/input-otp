'use client'

import * as React from 'react'

import { useParticleMark } from './particle-mark'

/* The diamond sponsor's wordmark, rasterized from its SVG and handed to the
   particle system (see particle-mark.tsx). The static <img> stays for layout,
   no-JS and reduced motion, and fades out as the particles fly in. */
export function ClerkParticles({
  src,
  alt,
  height,
  pad = 56,
}: {
  src: string
  alt: string
  height: number
  pad?: number
}) {
  const imgRef = React.useRef<HTMLImageElement>(null)
  /* The mark's width comes from the SVG's own aspect ratio, so there is
     nothing to measure until it has loaded. Kept in state, not a ref: it has
     to re-arm the hook. */
  const [loaded, setLoaded] = React.useState(false)

  const { wrapRef, canvasRef, live } = useParticleMark(() => {
    const img = imgRef.current
    if (!img?.naturalWidth) return null
    return {
      draw: (ctx, cols, rows) => ctx.drawImage(img, 0, 0, cols, rows),
      cssW: (height * img.naturalWidth) / img.naturalHeight,
      cssH: height,
      pad,
    }
  }, [src, height, pad, loaded])

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-flex' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{
          height,
          width: 'auto',
          opacity: live ? 0 : 1,
          transition: 'opacity 0.25s ease',
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: 'absolute',
          top: -pad,
          left: -pad,
          pointerEvents: 'none',
          opacity: live ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
    </div>
  )
}
