'use client'

import * as React from 'react'
import {
  BEATS,
  SENTENCES,
  StoryStage,
  useStoryScrub,
} from './story-shared'

/**
 * Variant 1 — "margin lecture": the story stands as a tall column of big
 * sentences on the left, the stage performs on the right. The current
 * sentence burns bright; the ones behind it dim, the ones ahead wait in
 * the dark and fade in as their beat arrives.
 */
export function StoryV1() {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const sceneRef = React.useRef<HTMLDivElement>(null)
  const step = useStoryScrub(trackRef, sceneRef)

  return (
    <div ref={trackRef} className="relative h-[640vh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div
          ref={sceneRef}
          className="mx-auto grid w-full max-w-5xl items-center gap-y-10 px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-20"
        >
          <div className="flex flex-col gap-5 lg:gap-7">
            {SENTENCES.map((sentence, i) => (
              <p
                key={i}
                className="m-0 text-balance text-xl font-semibold leading-snug tracking-tight text-white md:text-[1.7rem] md:leading-snug"
                style={{ opacity: `var(--sent${i}, ${i === 0 ? 1 : 0.08})` }}
              >
                {sentence}
              </p>
            ))}
          </div>

          <div className="lg:pt-6">
            <StoryStage live={step === BEATS - 1} />
          </div>
        </div>
      </div>
    </div>
  )
}
