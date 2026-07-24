import { Anatomy } from './_components/anatomy'
import { StyleGallery } from './_components/gallery'
import { CopyCommand } from './_components/copy-command'
import { HeroField } from './_components/hero-field'
import { HeroOtp } from './_components/hero-otp'
import { Preloader } from './_components/preloader'

const GITHUB_URL = 'https://github.com/guilhermerodz/input-otp'
const CLERK_URL = 'https://go.clerk.com/input-otp'
const RESEND_URL = 'https://go.resend.com/input-otp'
const EVOMI_URL = 'https://evomi.com/?utm_source=github&utm_campaign=otp'

const border = '1px solid #1c1c1f'
const card = {
  border: '1px solid #1f1f23',
  background: '#0c0c0e',
  borderRadius: 14,
} as const

function Logo() {
  const cap = {
    width: 22,
    height: 27,
    display: 'grid',
    placeItems: 'center',
    fontSize: 12,
    fontWeight: 600,
    color: '#fafafa',
    border: '1px solid #3f3f46',
  } as const

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex' }} className="xp-mono">
        <div style={{ ...cap, borderRadius: '7px 0 0 7px' }}>o</div>
        <div style={{ ...cap, borderLeft: 'none' }}>t</div>
        <div
          style={{ ...cap, borderLeft: 'none', borderRadius: '0 7px 7px 0' }}
        >
          p
        </div>
      </div>
      <span
        style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}
      >
        input-otp
      </span>
    </div>
  )
}

function Testimonial(props: {
  initials: string
  name: string
  handle: string
  quote: React.ReactNode
  views: string
}) {
  return (
    <div
      style={{
        ...card,
        padding: 26,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#18181b',
            border: '1px solid #27272a',
            display: 'grid',
            placeItems: 'center',
            fontSize: 14,
            fontWeight: 600,
            color: '#a1a1aa',
          }}
        >
          {props.initials}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{props.name}</div>
          <div style={{ fontSize: 12.5, color: '#71717a' }}>{props.handle}</div>
        </div>
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.6, color: '#e4e4e7' }}>
        {props.quote}
      </div>
      <div style={{ fontSize: 12.5, color: '#71717a', marginTop: 'auto' }}>
        {props.views} views
      </div>
    </div>
  )
}

const FEATURES = [
  {
    id: '01',
    title: 'Accessible by default',
    desc: 'screen readers see the single real input it is — caret, selection, copy-paste and keyboard navigation behave natively',
  },
  {
    id: '02',
    title: 'Autofill that actually works',
    desc: 'one-tap SMS codes on iOS and Android — autocomplete="one-time-code" is the default, platform quirks already handled',
  },
  {
    id: '03',
    title: 'Paste just works',
    desc: 'paste the whole code, every slot fills',
  },
  {
    id: '04',
    title: 'Friendly to password managers',
    desc: 'detects the badges injected by 1Password, LastPass, Dashlane and Bitwarden, and keeps them off your slots',
  },
  {
    id: '05',
    title: 'Bring your own styles',
    desc: 'unstyled primitives, render slots your way',
  },
  {
    id: '06',
    title: 'Pattern validation',
    desc: 'digits, alphanumeric, or custom regex',
  },
  {
    id: '07',
    title: 'Tiny and dependency-free',
    desc: 'zero runtime dependencies, a few kilobytes over the wire, React 16.8+',
  },
]

export function ExperimentView({ starCount }: { starCount: string | null }) {
  return (
    <div className="xp">
      <Preloader />

      {/* Nav */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 40px',
          borderBottom: border,
        }}
      >
        <Logo />
        <nav
          className="xp-nav-links"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            fontSize: 14,
            color: '#a1a1aa',
          }}
        >
          <a href={`${GITHUB_URL}#readme`}>Docs</a>
          <a href="https://input-otp.rodz.dev">Examples</a>
          <a href="#sponsors">Sponsors</a>
          <a
            href={GITHUB_URL}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid #27272a',
              borderRadius: 999,
              padding: '7px 14px',
              color: '#fafafa',
              fontSize: 13,
            }}
          >
            ★ {starCount ?? '3.2k'}
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section
        className="xp-hero"
        style={{ textAlign: 'center', padding: '84px 40px 56px' }}
      >
        <HeroField />
        <div className="xp-hero-copy">
        <h1
          className="xp-hero-title"
          style={{
            margin: 0,
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            maxWidth: 740,
            textWrap: 'balance',
          }}
        >
          Stop wasting time building OTP inputs.
        </h1>
        <p
          style={{
            margin: '20px 0 0',
            fontSize: 18,
            lineHeight: 1.6,
            color: '#a1a1aa',
            maxWidth: 540,
          }}
        >
          One-time passcode input for React. Unstyled, accessible, and
          copy-paste friendly out of the box.
        </p>

        <HeroOtp />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginTop: 26,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <a
            href={GITHUB_URL}
            style={{
              background: '#fafafa',
              color: '#09090b',
              fontSize: 14,
              fontWeight: 600,
              padding: '13px 26px',
              borderRadius: 999,
            }}
          >
            Get started
          </a>
          <CopyCommand />
        </div>

        <a
          href={CLERK_URL}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginTop: 22,
            ...card,
            borderRadius: 12,
            padding: '13px 22px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sponsors/clerk-wordmark-white-trimmed.svg"
            alt="Clerk"
            style={{ height: 17, width: 'auto' }}
          />
          <span style={{ fontSize: 13, color: '#a1a1aa' }}>
            Looking for an authentication solution?{' '}
            <span style={{ color: '#fafafa', fontWeight: 600 }}>
              Get started with Clerk →
            </span>
          </span>
        </a>
        </div>
      </section>

      {/* Stats + Used by */}
      <section style={{ padding: '56px 40px', borderTop: border, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#71717a' }}>
          Trusted at scale<span style={{ color: '#3f3f46' }}>_</span>
        </div>
        <div
          className="xp-stats"
          style={{ display: 'flex', justifyContent: 'center', gap: 72, marginTop: 28 }}
        >
          {[
            ['700M+', 'total downloads'],
            ['33M', 'weekly downloads'],
            ['shadcn/ui', 'featured component'],
          ].map(([big, small]) => (
            <div key={small}>
              <div
                style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em' }}
              >
                {big}
              </div>
              <div style={{ fontSize: 13, color: '#71717a', marginTop: 4 }}>
                {small}
              </div>
            </div>
          ))}
        </div>
        <div
          className="xp-usedby"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 44,
            marginTop: 44,
          }}
        >
          <span
            style={{
              fontSize: 12,
              letterSpacing: '0.18em',
              color: '#71717a',
              fontWeight: 600,
            }}
          >
            USED BY
          </span>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 9, opacity: 0.75 }}
          >
            <svg width="17" height="15" viewBox="0 0 76 65" fill="#fafafa">
              <path d="M37.59.25l36.95 64H.64l36.95-64z" />
            </svg>
            <span
              style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em' }}
            >
              Vercel
            </span>
          </div>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.75 }}
          >
            <svg width="12" height="26" viewBox="0 0 250 570" fill="#fafafa">
              <path d="M125 0s15 30 40 75c38 68 65 135 65 205 0 88-40 165-90 220l-8 55h-14l-8-55c-50-55-90-132-90-220 0-70 27-137 65-205C110 30 125 0 125 0z" />
            </svg>
            <span
              style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em' }}
            >
              MongoDB
            </span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sponsors/resend-wordmark-white-trimmed.svg"
            alt="Resend"
            style={{ height: 17, width: 'auto', opacity: 0.75 }}
          />
        </div>
      </section>

      {/* Spotted by the best */}
      <section style={{ padding: '56px 40px', borderTop: border }}>
        <h2
          style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}
        >
          Spotted by the best
        </h2>
        <div style={{ fontSize: 14, color: '#71717a', marginTop: 6 }}>
          People we admire, admiring back
          <span style={{ color: '#3f3f46' }}>_</span>
        </div>
        <div
          className="xp-grid-3"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 20,
            marginTop: 28,
          }}
        >
          <Testimonial
            initials="GR"
            name="Guillermo Rauch"
            handle="@rauchg · CEO, Vercel"
            quote={
              <>
                This React OTP input 🔥
                <br />
                <span style={{ color: '#71717a' }}>input-otp.rodz.dev</span>
              </>
            }
            views="252.6K"
          />
          <Testimonial
            initials="EK"
            name="Emil Kowalski"
            handle="@emilkowalski · Design Engineer, author of animations.dev"
            quote={
              <>
                Some of my favorite UI libraries:{' '}
                <span
                  style={{
                    background: '#1e2936',
                    borderRadius: 3,
                    padding: '1px 3px',
                  }}
                >
                  input-otp for one-time passwords.
                </span>
              </>
            }
            views="225.6K"
          />
          <Testimonial
            initials="C"
            name="Colin Sidoti"
            handle="@tweetsbycolin · Co-founder & CEO, Clerk"
            quote="🙌 fantastic library!"
            views="659"
          />
        </div>
      </section>

      {/* Sponsors */}
      <section id="sponsors" style={{ padding: '56px 40px', borderTop: border }}>
        <h2
          style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}
        >
          Our sponsors
        </h2>
        <div style={{ fontSize: 14, color: '#71717a', marginTop: 6 }}>
          Thank you for believing in what we&apos;re building
          <span style={{ color: '#3f3f46' }}>_</span>
        </div>

        <div
          className="xp-grid-sponsors"
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: 20,
            marginTop: 28,
          }}
        >
          <a
            href={CLERK_URL}
            style={{
              border: '1px solid #3d3423',
              background: '#0e0d0a',
              borderRadius: 14,
              padding: 40,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sponsors/clerk-wordmark-white-trimmed.svg"
              alt="Clerk"
              style={{ height: 30, width: 'auto' }}
            />
            <div
              style={{
                fontSize: 12,
                letterSpacing: '0.1em',
                color: '#d4b262',
                fontWeight: 600,
              }}
            >
              GOLD SPONSOR
            </div>
          </a>
          <a
            href={GITHUB_URL}
            style={{
              border: '1px dashed #27272a',
              borderRadius: 14,
              display: 'grid',
              placeItems: 'center',
              fontSize: 24,
              color: '#3f3f46',
              minHeight: 100,
            }}
          >
            +
          </a>
        </div>
        <div
          className="xp-grid-3"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 20,
            marginTop: 20,
          }}
        >
          {[
            ['/sponsors/resend-wordmark-white-trimmed.svg', 'Resend', RESEND_URL],
            ['/sponsors/evomi-wordmark-white-trimmed.svg', 'Evomi', EVOMI_URL],
          ].map(([src, alt, href]) => (
            <a
              key={alt}
              href={href}
              style={{
                border: '1px solid #1f1f23',
                borderRadius: 14,
                padding: 30,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                style={{ height: 19, width: 'auto', opacity: 0.85 }}
              />
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  color: '#8f9aa6',
                  fontWeight: 600,
                }}
              >
                SILVER SPONSOR
              </div>
            </a>
          ))}
          <a
            href={GITHUB_URL}
            style={{
              border: '1px dashed #27272a',
              borderRadius: 14,
              display: 'grid',
              placeItems: 'center',
              fontSize: 24,
              color: '#3f3f46',
              minHeight: 100,
            }}
          >
            +
          </a>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '56px 40px', borderTop: border }}>
        <div
          className="xp-mono"
          style={{ fontSize: 13, color: '#71717a', marginBottom: 8 }}
        >
          ~/features
        </div>
        <div style={{ borderTop: border }}>
          {FEATURES.map(f => (
            <div
              key={f.id}
              style={{
                display: 'flex',
                gap: 24,
                padding: '22px 0',
                borderBottom: border,
                alignItems: 'baseline',
                flexWrap: 'wrap',
              }}
            >
              <span className="xp-mono" style={{ color: '#71717a', fontSize: 13 }}>
                {f.id}
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, width: 260 }}>
                {f.title}
              </span>
              <span style={{ fontSize: 14, color: '#a1a1aa' }}>{f.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How I built it */}
      <section id="how" style={{ padding: '56px 0 0', borderTop: border }}>
        <div style={{ padding: '0 40px' }}>
          <h2
            style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            How I built it
          </h2>
          <div style={{ fontSize: 14, color: '#71717a', marginTop: 6 }}>
            One real input, wearing your design — the slots you see just mirror
            its state. Keep scrolling<span style={{ color: '#3f3f46' }}>_</span>
          </div>
        </div>
        <Anatomy />
      </section>

      {/* Style gallery */}
      <section style={{ padding: '56px 40px', borderTop: border }}>
        <h2
          style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}
        >
          Unstyled by default. Styled by you.
        </h2>
        <div style={{ fontSize: 14, color: '#71717a', marginTop: 6 }}>
          Every input below is the same component with a different render prop —
          they all type, paste and autofill for real
          <span style={{ color: '#3f3f46' }}>_</span>
        </div>
        <StyleGallery className="mt-12" />
      </section>

      {/* CTA */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 22,
          padding: '72px 40px',
          borderTop: border,
          textAlign: 'center',
        }}
      >
        <h2
          style={{ margin: 0, fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em' }}
        >
          Ship your verify screen today.
        </h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <a
            href={GITHUB_URL}
            style={{
              background: '#fafafa',
              color: '#09090b',
              fontSize: 14,
              fontWeight: 600,
              padding: '12px 24px',
              borderRadius: 999,
            }}
          >
            Get started
          </a>
          <a
            href={GITHUB_URL}
            style={{
              border: '1px solid #27272a',
              color: '#fafafa',
              fontSize: 14,
              fontWeight: 600,
              padding: '12px 24px',
              borderRadius: 999,
            }}
          >
            GitHub
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 40px',
          borderTop: border,
          fontSize: 13,
          color: '#71717a',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <span>MIT © Guilherme Rodz</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href={`${GITHUB_URL}#readme`}>Docs</a>
          <a href={GITHUB_URL}>GitHub</a>
          <a href="https://twitter.com/guilherme_rodz">Twitter</a>
        </div>
      </footer>
    </div>
  )
}
