/**
 * How the page comes in.
 *
 * The markup is annotated once, with roles rather than animations:
 * `data-rv="title"`, `data-rv="lede"`, `data-rv="card"`… A role says how
 * important a thing is, never how it moves. The choreography below reads
 * those roles and decides the rest, so hierarchy has a single source of
 * truth and the markup never mentions timing.
 *
 * Delay inside a group is always `base[role] + nth-of-that-role * step[role]`,
 * which is what makes the cascade read as structure instead of as a list: the
 * title lands, then the lede, then the body, then the small print — even when
 * the DOM order says otherwise.
 */

export type Role =
  | 'eyebrow'
  | 'title'
  | 'lede'
  | 'body'
  | 'action'
  | 'card'
  | 'chrome'

export const ROLES: Role[] = [
  'eyebrow',
  'title',
  'lede',
  'body',
  'action',
  'card',
  'chrome',
]

/** How a title is broken up before it animates. */
export type SplitMode = 'none' | 'words'

type Timing = {
  duration: number
  easing: string
}

export type Choreography = {
  /** Per-role text splitting. Anything unlisted animates as one block. */
  split: Partial<Record<Role, SplitMode>>

  base: Record<Role, number>
  step: Record<Role, number>
  /** Delay between successive words of a split title. */
  glyphStep: number
  /**
   * How much of the title's own dealing-out time the levels below it wait
   * for, 0–1. At 1 the lede starts as the last word of the headline lands;
   * at 0 it ignores the title entirely and the two overlap. Capped inside
   * the engine so a very long headline cannot stall the rest.
   */
  followTitle: number

  /** Keyframes for a whole element. */
  block(role: Role): [Keyframe[], Timing]
  /** Keyframes for one word of a split title. */
  glyph(role: Role): [Keyframe[], Timing]
}

/* The reference project's expo-out: it covers most of its distance
   immediately, which is what makes a blur-up feel like it settles rather
   than travels. */
const soft = 'cubic-bezier(.22,1,.36,1)'

/* ------------------------------------------------------------------ *
 * Cascade
 *
 * One continuous blur-up wave down the column. Titles break into words so
 * the headline assembles instead of arriving; every other level shares the
 * same motion with less travel, so the page reads as a single gesture with
 * volume differences.
 * ------------------------------------------------------------------ */
export const CASCADE: Choreography = {
  split: { title: 'words' },
  /* The lede must never resolve while the headline is still arriving —
     but "still arriving" is six words in the hero and two in a section
     heading, so the wait is expressed as followTitle rather than baked
     into these numbers. */
  followTitle: 1,
  base: {
    eyebrow: 0,
    title: 60,
    lede: 110,
    body: 170,
    card: 180,
    action: 300,
    chrome: 420,
  },
  step: {
    eyebrow: 80,
    title: 90,
    lede: 80,
    body: 70,
    card: 80,
    action: 70,
    chrome: 55,
  },
  glyphStep: 46,
  block(role) {
    const heavy = role === 'lede' || role === 'body'
    return [
      [
        {
          opacity: 0,
          transform: `translateY(${heavy ? 14 : 10}px)`,
          filter: `blur(${heavy ? 6 : 4}px)`,
        },
        { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
      ],
      { duration: heavy ? 620 : 520, easing: soft },
    ]
  },
  glyph() {
    return [
      [
        { opacity: 0, transform: 'translateY(16px)', filter: 'blur(9px)' },
        { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
      ],
      { duration: 760, easing: soft },
    ]
  },
}
