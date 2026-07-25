'use client'

/* Three tweets on a loop. Each card is a real x.com post as far down as it
   goes — avatar, blue check, the affiliation badge the account actually carries,
   the reply header, the date — and the whole card is the anchor to the post, so
   the only thing it asks of a reader is a click.

   Where x.com prints reply/like counts the card prints who the person is
   instead: a like tally says nothing about why their word carries here, and the
   work they're known for does. Those are real links, which is why the card is a
   div with a stretched anchor over it rather than an anchor itself — a link
   inside a link is not a thing the DOM will keep. */

import { useEffect, useRef } from 'react'

import { registerSpotlights } from './spotlight'

/* A tweet body is lines of pieces, not a string, because the blue bits are not
   decoration — a t.co link and a mention render differently from the text around
   them. */
type Piece = string | { link: string } | { mention: string } | { mark: string }

/* The bio is pieces too, so the projects inside it can be links rather than
   domains printed as prose. */
type BioPiece = string | { text: string; href: string }

type Tweet = {
  key: string
  name: string
  handle: string
  avatar: string
  badge: string
  company: string
  href: string
  date: string
  bio: BioPiece[]
  replyingTo?: string[]
  body: Piece[][]
}

const TWEETS: Tweet[] = [
  {
    key: 'rauchg',
    name: 'Guillermo Rauch',
    handle: '@rauchg',
    avatar: '/spotted-by/rauchg.jpg',
    badge: '/spotted-by/badge-vercel.png',
    company: 'Vercel',
    href: 'https://x.com/rauchg/status/1759689594155708715',
    date: 'Feb 19, 2024',
    bio: ['Founder & CEO of ', { text: 'Vercel', href: 'https://vercel.com' }],
    body: [['This React OTP input 🔥'], [{ link: 'input-otp.rodz.dev' }]],
  },
  {
    key: 'emilkowalski',
    name: 'Emil Kowalski',
    handle: '@emilkowalski',
    avatar: '/spotted-by/emilkowalski.jpg',
    badge: '/spotted-by/badge-linear.jpg',
    company: 'Linear',
    href: 'https://x.com/emilkowalski/status/2074169272717152716',
    date: 'Jul 6, 2026',
    bio: [
      'Design Engineer at Linear, author of ',
      { text: 'animations.dev', href: 'https://animations.dev' },
      ', ',
      { text: 'sonner', href: 'https://sonner.emilkowal.ski' },
      ' and ',
      { text: 'vaul', href: 'https://vaul.emilkowal.ski' },
    ],
    /* Ten libraries in a 344px card would set the height of the whole row and
       leave the two short posts in a hole. The list is elided to the one line
       this page is about, with an ellipsis on either side standing in for the
       nine it isn't — the same shape as the post, a tenth of the height. */
    body: [
      ['Some of my favorite UI libraries:'],
      [],
      ['…'],
      [{ mark: 'input-otp for one-time passwords.' }],
      ['…'],
    ],
  },
  {
    key: 'steventey',
    name: 'Steven Tey',
    handle: '@steventey',
    avatar: '/spotted-by/steventey.jpg',
    badge: '/spotted-by/badge-dub.jpg',
    company: 'Dub.co',
    href: 'https://x.com/steventey/status/1759721166267359501',
    date: 'Feb 19, 2024',
    bio: ['Founder & CEO of ', { text: 'Dub', href: 'https://dub.co' }],
    replyingTo: ['@rauchg', '@guilherme_rodz'],
    body: [['incredible work ', { mention: '@guilherme_rodz' }, ' 👏']],
  },
]

/* Belt speed, px per second — a shade quicker than the logo wall, because a card
   is a much wider thing to get past. */
const SPEED = 34

/* One pass of the belt. The list is doubled inside a single pass on purpose:
   three cards are narrower than the page, and a belt shorter than its own
   viewport leaves a hole at the seam. */
const PASS = [...TWEETS, ...TWEETS]

function VerifiedCheck() {
  return (
    <svg
      className="xp-tw-check"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
    </svg>
  )
}

function XMark() {
  return (
    <svg
      className="xp-tw-x"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function Body({ lines }: { lines: Piece[][] }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line.map((piece, j) => {
            if (typeof piece === 'string') return piece
            if ('link' in piece)
              return (
                <span className="xp-tw-blue" key={j}>
                  {piece.link}
                </span>
              )
            if ('mention' in piece)
              return (
                <span className="xp-tw-blue" key={j}>
                  {piece.mention}
                </span>
              )
            return (
              <span className="xp-tw-mark" key={j}>
                {piece.mark}
              </span>
            )
          })}
          {/* Real newlines under `white-space: pre-wrap`, so a folded body ends
              on a line the same way the full one does. */}
          {i < lines.length - 1 ? '\n' : null}
        </span>
      ))}
    </>
  )
}

/* Grid, not a stack of rows: the avatar sits in its own column beside the name
   and the body spans both, which is how x.com lays a single post out. */
function TweetCard({ tweet, clone }: { tweet: Tweet; clone?: boolean }) {
  return (
    <div
      className="xp-tw"
      /* The second pass is decoration: hidden from assistive tech and skipped
         by the tab order, so a reader meets each tweet once. */
      aria-hidden={clone || undefined}
    >
      {/* Stretched over the whole card, under the bio's own links: anywhere a
          reader clicks that isn't a project goes to the post. */}
      <a
        className="xp-tw-open"
        href={tweet.href}
        target="_blank"
        rel="noreferrer"
        tabIndex={clone ? -1 : undefined}
      >
        <span className="xp-sr">
          {tweet.name} on X, {tweet.date}
        </span>
      </a>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="xp-tw-avatar" src={tweet.avatar} alt="" />

      <div className="xp-tw-head">
        <div className="xp-tw-name">
          <span className="xp-tw-realname">{tweet.name}</span>
          <VerifiedCheck />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="xp-tw-badge"
            src={tweet.badge}
            alt={tweet.company}
            title={tweet.company}
          />
        </div>
        <div className="xp-tw-handle">{tweet.handle}</div>
      </div>

      <XMark />

      {tweet.replyingTo ? (
        <div className="xp-tw-replying">
          Replying to{' '}
          {tweet.replyingTo.map((handle, i) => (
            <span key={handle}>
              {i > 0 ? ' ' : null}
              <span className="xp-tw-blue">{handle}</span>
            </span>
          ))}
        </div>
      ) : null}

      <p className="xp-tw-body">
        <Body lines={tweet.body} />
      </p>

      <p className="xp-tw-bio">
        {tweet.bio.map((piece, i) =>
          typeof piece === 'string' ? (
            piece
          ) : (
            <a
              className="xp-tw-bio-link"
              key={i}
              href={piece.href}
              target="_blank"
              rel="noreferrer"
              tabIndex={clone ? -1 : undefined}
            >
              {piece.text}
            </a>
          ),
        )}
      </p>
    </div>
  )
}

function Belt({
  clone = false,
  innerRef,
}: {
  clone?: boolean
  innerRef?: React.Ref<HTMLDivElement>
}) {
  return (
    <div className="xp-sp-belt" ref={innerRef} aria-hidden={clone || undefined}>
      {PASS.map((tweet, i) => (
        <TweetCard key={`${tweet.key}-${i}`} tweet={tweet} clone={clone} />
      ))}
    </div>
  )
}

export function SpottedMarquee() {
  const bandRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const beltRef = useRef<HTMLDivElement>(null)
  const paused = useRef(false)

  /* The belt is driven here rather than by a CSS animation, for the same reason
     the logo wall is: a keyframe animation on a transform runs on the
     compositor, and its clock drifts from the main thread's whenever the tab is
     backgrounded — the next thing that touches the subtree (pausing it, or just
     repainting a hover) resyncs the two and the row visibly jumps. Advancing the
     offset ourselves means there is a single source of truth for where the belt
     is, so pausing is exactly where it was. */
  useEffect(() => {
    const band = bandRef.current
    const track = trackRef.current
    const belt = beltRef.current
    if (!band || !track || !belt) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let offset = 0
    let prev = 0
    let frame = 0

    const step = (now: number) => {
      /* A long gap — hidden tab, blocked main thread — must not teleport the
         belt, so a frame is charged at most a frame's worth of travel. */
      const dt = prev ? Math.min(now - prev, 32) : 0
      prev = now
      /* Wrapping by the belt's *current* width is invisible either way — the
         second belt sits exactly one width to the right — so a relayout mid
         travel (a font landing, a breakpoint) costs nothing here. */
      const width = belt.offsetWidth
      if (!paused.current && width > 0) {
        offset = (offset + (dt / 1000) * SPEED) % width
        track.style.transform = `translate3d(${-offset}px, 0, 0)`
      }
      frame = requestAnimationFrame(step)
    }

    const start = () => {
      if (frame) return
      prev = 0
      frame = requestAnimationFrame(step)
    }

    const stop = () => {
      if (!frame) return
      cancelAnimationFrame(frame)
      frame = 0
    }

    /* Nothing to animate while the row is off screen. */
    const observer = new IntersectionObserver(entries => {
      if (entries[entries.length - 1].isIntersecting) start()
      else stop()
    })
    observer.observe(band)

    return () => {
      observer.disconnect()
      stop()
    }
  }, [])

  /* The cursor rim, on both passes: the clone is what the reader is looking at
     for half of every lap, and a card that lights on one pass and not the
     other would give the seam away. Registered from here rather than per card
     because the belt is built once and never re-renders. */
  useEffect(() => {
    const band = bandRef.current
    if (!band) return
    return registerSpotlights(
      band.querySelectorAll<HTMLElement>('.xp-tw'),
      /* Reach is short relative to a 344px card: the belt puts three or four
         of them across the page, and a wide reach would light the neighbours
         of whichever one the cursor is actually on. */
      { reach: 220, spread: 300 },
    )
  }, [])

  const hold = () => {
    paused.current = true
  }
  const release = () => {
    paused.current = false
  }

  return (
    <section className="xp-sp-section" data-rv-group>
      <h2 className="xp-sp-title" data-rv="title">Spotted by the best</h2>
      <div className="xp-sp-sub" data-rv="lede">
        People we admire, admiring back
        <span style={{ color: '#3f3f46' }}>_</span>
      </div>
      <div
        className="xp-sp-band"
        data-rv="card"
        ref={bandRef}
        onPointerEnter={hold}
        onPointerLeave={release}
        /* A card is a link, so keyboard users need the target to stop moving
           too. */
        onFocus={hold}
        onBlur={release}
      >
        <div className="xp-sp-viewport">
          <div className="xp-sp-track" ref={trackRef}>
            <Belt innerRef={beltRef} />
            <Belt clone />
          </div>
        </div>
      </div>
    </section>
  )
}
