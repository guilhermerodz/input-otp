'use client'

import * as React from 'react'
import {
  BEATS,
  SENTENCES,
  StoryStage,
  useStoryScrub,
} from './story-shared'

/**
 * Variant 2 — "chalk talk": one flowing paragraph above the stage, read
 * like prose. The current sentence gets a highlighter sweep (the pen
 * dragging across the words) while past sentences settle into grey and
 * future ones wait, barely visible, for their beat.
 */
export function StoryV2() {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const sceneRef = React.useRef<HTMLDivElement>(null)
  const step = useStoryScrub(trackRef, sceneRef)

  return (
    <div ref={trackRef} className="relative h-[640vh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div
          ref={sceneRef}
          className="mx-auto flex w-full max-w-4xl flex-col items-center gap-12 px-6 lg:gap-16"
        >
          <p className="m-0 max-w-[52rem] text-pretty text-center text-xl font-semibold leading-relaxed tracking-tight text-white md:text-[1.55rem] md:leading-relaxed">
            {SENTENCES.map((sentence, i) => (
              <React.Fragment key={i}>
                <span
                  className="xp-hl"
                  style={
                    {
                      opacity: `var(--sent${i}, ${i === 0 ? 1 : 0.08})`,
                      '--hl': `var(--hl${i}, 0)`,
                    } as React.CSSProperties
                  }
                >
                  {sentence}
                </span>{' '}
              </React.Fragment>
            ))}
          </p>

          <StoryStage live={step === BEATS - 1} />
        </div>
      </div>
    </div>
  )
}
