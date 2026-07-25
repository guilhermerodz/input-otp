/**
 * Five ways to bring the same page in.
 *
 * The markup is annotated once, with roles rather than animations:
 * `data-rv="title"`, `data-rv="lede"`, `data-rv="card"`… A role says how
 * important a thing is, never how it moves. Each variant below is a
 * choreographer that reads those roles and decides the rest — so all five
 * share one source of truth for hierarchy and differ only in language.
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
export type SplitMode = 'none' | 'words' | 'chars'

type Timing = {
  duration: number
  easing: string
}

export type Variant = {
  id: number
  /** Route segment; variant 1 lives at "/". */
  slug: string
  name: string
  blurb: string

  /** Scroll-linked rather than one-shot (only variant 3). */
  scrollLinked?: boolean

  /** Per-role text splitting. Anything unlisted animates as one block. */
  split: Partial<Record<Role, SplitMode>>

  base: Record<Role, number>
  step: Record<Role, number>
  /** Delay between successive glyphs/words of a split title. */
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
  /** Keyframes for one glyph/word of a split title. */
  glyph?(role: Role): [Keyframe[], Timing]

  /** Opt-in custom driver for split titles (used by the decode variant). */
  glyphDriver?: 'scramble'
}

/* Shared eases. `soft` is the reference project's expo-out — it covers most
   of its distance immediately, which is what makes a blur-up feel like it
   settles rather than travels. */
const soft = 'cubic-bezier(.22,1,.36,1)'
const softer = 'cubic-bezier(.16,1,.3,1)'
const snap = 'cubic-bezier(.2,.85,.3,1.06)'

/* ------------------------------------------------------------------ *
 * 1 — Cascade
 *
 * The house style: one continuous blur-up wave down the column. Titles
 * break into words so the headline assembles instead of arriving; every
 * other level shares the same motion with less travel, so the page reads
 * as a single gesture with volume differences.
 * ------------------------------------------------------------------ */
const cascade: Variant = {
  id: 1,
  slug: '',
  name: 'Cascade',
  blurb: 'Blur-up wave, word by word',
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

/* ------------------------------------------------------------------ *
 * 2 — Fill
 *
 * The page behaves like the thing it sells. Titles land character by
 * character the way digits drop into slots — a short overshoot and a
 * flash of light on the glyph as it seats — and every block below wipes
 * in left to right, the direction a code gets typed. Strictly one
 * direction, so the eye is always led forward.
 * ------------------------------------------------------------------ */
const fill: Variant = {
  id: 2,
  slug: '2',
  name: 'Fill',
  blurb: 'Slots filling left to right',
  split: { title: 'chars' },
  /* Barely waits: a machine filling a form fills all of it at once, and
     the typing headline reading over the top of that is the effect. */
  followTitle: 0.12,
  base: {
    eyebrow: 0,
    title: 40,
    lede: 260,
    body: 320,
    card: 280,
    action: 420,
    chrome: 480,
  },
  step: {
    eyebrow: 70,
    title: 110,
    lede: 90,
    body: 80,
    card: 95,
    action: 80,
    chrome: 50,
  },
  glyphStep: 26,
  block(role) {
    /* Text wipes with a touch of lift; surfaces wipe flat so the card
       edge itself is what draws across. */
    const text = role === 'lede' || role === 'body' || role === 'eyebrow'
    return [
      [
        {
          opacity: 0,
          clipPath: 'inset(0 100% 0 0)',
          transform: `translateX(${text ? -8 : -14}px)`,
        },
        {
          opacity: 1,
          clipPath: 'inset(0 0% 0 0)',
          transform: 'translateX(0)',
        },
      ],
      { duration: text ? 480 : 620, easing: softer },
    ]
  },
  glyph() {
    return [
      [
        {
          opacity: 0,
          transform: 'translateY(-14px) scaleY(.62)',
          textShadow: '0 0 18px rgba(250,250,250,.9)',
        },
        {
          opacity: 1,
          transform: 'translateY(0) scaleY(1)',
          textShadow: '0 0 10px rgba(250,250,250,.55)',
          offset: 0.6,
        },
        {
          opacity: 1,
          transform: 'translateY(0) scaleY(1)',
          textShadow: '0 0 0 rgba(250,250,250,0)',
        },
      ],
      { duration: 420, easing: snap },
    ]
  },
}

/* ------------------------------------------------------------------ *
 * 3 — Focus
 *
 * Not a reveal at all — a lens. Everything below the fold sits out of
 * focus and pulls sharp as it rises into the frame; everything that has
 * gone past recedes and dims instead of vanishing. Scroll-linked and
 * reversible, so the page always has a subject and the scrollbar is the
 * focus ring. Hierarchy is how far out of focus a level starts.
 * ------------------------------------------------------------------ */
const focus: Variant = {
  id: 3,
  slug: '3',
  name: 'Focus',
  blurb: 'Scroll-linked focus pull',
  scrollLinked: true,
  split: {},
  followTitle: 0,
  base: {
    eyebrow: 0,
    title: 80,
    lede: 220,
    body: 280,
    card: 240,
    action: 340,
    chrome: 400,
  },
  step: {
    eyebrow: 70,
    title: 90,
    lede: 80,
    body: 70,
    card: 80,
    action: 70,
    chrome: 50,
  },
  glyphStep: 0,
  block(role) {
    const d = FOCUS_DEPTH[role]
    return [
      [
        {
          opacity: 0,
          transform: `translateY(${d.y}px) scale(${1 - d.y / 900})`,
          filter: `blur(${d.blur}px)`,
        },
        { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0px)' },
      ],
      { duration: 720, easing: soft },
    ]
  },
}

/** How far out of the plane each level starts, for the focus variant. */
export const FOCUS_DEPTH: Record<Role, { blur: number; y: number }> = {
  title: { blur: 15, y: 34 },
  lede: { blur: 10, y: 26 },
  body: { blur: 8, y: 22 },
  card: { blur: 11, y: 30 },
  eyebrow: { blur: 6, y: 14 },
  action: { blur: 8, y: 20 },
  chrome: { blur: 4, y: 10 },
}

/* ------------------------------------------------------------------ *
 * 4 — Horizon
 *
 * Everything is lit from below. Text is revealed through a soft gradient
 * mask that sweeps up through it, so glyphs materialise out of their own
 * baseline rather than fading as rectangles — a whole headline surfacing
 * at once, weightier than a per-letter stagger. Surfaces, which would
 * clip badly under a mask, settle with a scale instead.
 * ------------------------------------------------------------------ */
const horizon: Variant = {
  id: 4,
  slug: '4',
  name: 'Horizon',
  blurb: 'Masked lift from below',
  split: { title: 'words' },
  /* A masked lift is slow and heavy by design; it only half-waits for the
     headline, or the section below would feel becalmed. */
  followTitle: 0.5,
  base: {
    eyebrow: 0,
    title: 90,
    lede: 200,
    body: 270,
    card: 220,
    action: 350,
    chrome: 410,
  },
  step: {
    eyebrow: 90,
    title: 120,
    lede: 100,
    body: 90,
    card: 110,
    action: 90,
    chrome: 60,
  },
  glyphStep: 70,
  block(role) {
    /* Cards get no mask: a masked card cuts its own border and any beam
       running along it. They rise and settle instead. */
    if (role === 'card' || role === 'action') {
      return [
        [
          { opacity: 0, transform: 'translateY(26px) scale(.985)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ],
        { duration: 760, easing: soft },
      ]
    }
    return [
      [
        {
          opacity: 0,
          transform: 'translateY(20px)',
          maskPosition: '0% 0%',
          WebkitMaskPosition: '0% 0%',
        },
        {
          opacity: 1,
          transform: 'translateY(0)',
          maskPosition: '0% 100%',
          WebkitMaskPosition: '0% 100%',
        },
      ],
      { duration: 900, easing: soft },
    ]
  },
  glyph() {
    return [
      [
        {
          opacity: 0,
          transform: 'translateY(24px)',
          maskPosition: '0% 0%',
          WebkitMaskPosition: '0% 0%',
        },
        {
          opacity: 1,
          transform: 'translateY(0)',
          maskPosition: '0% 100%',
          WebkitMaskPosition: '0% 100%',
        },
      ],
      { duration: 1000, easing: soft },
    ]
  },
}

/* ------------------------------------------------------------------ *
 * 5 — Decode
 *
 * Picks up where the slot machine left off. Titles arrive scrambled and
 * lock character by character, left to right, like a code resolving.
 * Everything else acquires signal — a couple of quick flickers and it is
 * there. Fast, technical, almost no travel: this variant creates
 * hierarchy with *time to lock* rather than with distance.
 * ------------------------------------------------------------------ */
const decode: Variant = {
  id: 5,
  slug: '5',
  name: 'Decode',
  blurb: 'Scramble and lock',
  split: { title: 'chars' },
  glyphDriver: 'scramble',
  /* Snappy: the lock is the payoff and it should not be preceded by
     dead air. */
  followTitle: 0.2,
  base: {
    eyebrow: 0,
    title: 60,
    lede: 240,
    body: 300,
    card: 230,
    action: 400,
    chrome: 460,
  },
  step: {
    eyebrow: 60,
    title: 120,
    lede: 70,
    body: 60,
    card: 70,
    action: 60,
    chrome: 40,
  },
  glyphStep: 34,
  block(role) {
    if (role === 'card') {
      /* A surface arrives under a scanline: it unrolls from the top and
         over-brightens for a frame as it seats. */
      return [
        [
          {
            opacity: 0,
            clipPath: 'inset(0 0 100% 0)',
            filter: 'brightness(1.9)',
          },
          { opacity: 1, clipPath: 'inset(0 0 0 0)', filter: 'brightness(1.5)', offset: 0.55 },
          { opacity: 1, clipPath: 'inset(0 0 0 0)', filter: 'brightness(1)' },
        ],
        { duration: 520, easing: 'cubic-bezier(.3,.9,.2,1)' },
      ]
    }
    /* Signal acquire: it stutters in rather than fading. */
    return [
      [
        { opacity: 0, filter: 'blur(3px)', transform: 'translateY(6px)' },
        { opacity: 0.55, filter: 'blur(1px)', transform: 'translateY(3px)', offset: 0.22 },
        { opacity: 0.12, filter: 'blur(2px)', transform: 'translateY(3px)', offset: 0.38 },
        { opacity: 0.9, filter: 'blur(0px)', transform: 'translateY(0)', offset: 0.62 },
        { opacity: 0.4, filter: 'blur(0px)', transform: 'translateY(0)', offset: 0.74 },
        { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' },
      ],
      { duration: 480, easing: 'linear' },
    ]
  },
}

export const VARIANTS: Variant[] = [cascade, fill, focus, horizon, decode]

export function variantById(id: number): Variant {
  return VARIANTS.find(v => v.id === id) ?? cascade
}
