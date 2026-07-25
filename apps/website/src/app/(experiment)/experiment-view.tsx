import { ExternalLink } from 'lucide-react'

import { ClerkParticles } from './_components/clerk-particles'
import { CtaDaybreak } from './_components/cta-daybreak'
import { FeatureBento } from './_components/feature-bento'
import { SponsorBorderBeam } from './_components/sponsor-border-beam'
import { StoryIso } from './_components/story-iso'
import { CopyCommand } from './_components/copy-command'
import { HeroField } from './_components/hero-field'
import { HeroOtp } from './_components/hero-otp'
import { Preloader } from './_components/preloader'
import { SlotBgSwitcher } from './_components/slot-bg-switcher'
import { SpottedMarquee } from './_components/spotted-marquee'
import { StatsOdometer } from './_components/stats-odometer'
import { UsedByMarquee } from './_components/used-by-marquee'

const GITHUB_URL = 'https://github.com/guilhermerodz/input-otp'
const GITHUB_SPONSORS_URL = 'https://github.com/sponsors/guilhermerodz'
const CLERK_URL = 'https://go.clerk.com/input-otp'
const RESEND_URL = 'https://go.resend.com/input-otp'
const EVOMI_URL = 'https://evomi.com/?utm_source=github&utm_campaign=otp'

const SILVER_SPONSORS = [
  {
    src: '/sponsors/resend-wordmark-white-trimmed.svg',
    alt: 'Resend',
    href: RESEND_URL,
    logoHeight: 23,
    beamDuration: 3.17,
  },
  {
    src: '/sponsors/evomi-wordmark-white-trimmed.svg',
    alt: 'Evomi',
    href: EVOMI_URL,
    logoHeight: 27,
    beamDuration: 3.73,
  },
] as const

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
      <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>
        input-otp
      </span>
    </div>
  )
}

export function ExperimentView({ starCount }: { starCount: string | null }) {
  return (
    <div className="xp">
      <Preloader />
      <SlotBgSwitcher />

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

      <UsedByMarquee />

      <StatsOdometer />

      <SpottedMarquee />

      {/* Sponsors */}
      <section
        id="sponsors"
        style={{ padding: '56px 40px', borderTop: border }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          Our sponsors
        </h2>
        <div style={{ fontSize: 14, color: '#71717a', marginTop: 6 }}>
          Thank you for believing in what we&apos;re building
          <span style={{ color: '#3f3f46' }}>_</span>
        </div>

        <div className="xp-sponsors-grid">
          <SponsorBorderBeam tier="diamond" duration={4.1}>
            <a
              href={CLERK_URL}
              target="_blank"
              rel="noreferrer"
              className="xp-sponsor-card xp-sponsor-card--diamond"
              style={{
                border: '1px solid #29292f',
                background: '#0c0c0e',
                borderRadius: 14,
                padding: 40,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <ClerkParticles
                src="/sponsors/clerk-wordmark-white-trimmed.svg"
                alt="Clerk"
                height={44}
              />
              <span className="xp-sponsor-tier-label">
                <span>DIAMOND SPONSOR</span>
                <ExternalLink size={9} strokeWidth={1.75} aria-hidden="true" />
              </span>
            </a>
          </SponsorBorderBeam>
          <a
            href={GITHUB_SPONSORS_URL}
            target="_blank"
            rel="noreferrer"
            className="xp-sponsor-cta xp-sponsor-cta--filler"
            aria-label="Become a sponsor"
          >
            <span className="xp-sponsor-cta-plus" aria-hidden="true">
              +
            </span>
            <span className="xp-sponsor-cta-label" aria-hidden="true">
              <span>Become a sponsor</span>
              <ExternalLink size={12} strokeWidth={1.75} />
            </span>
          </a>
          {SILVER_SPONSORS.map(
            ({ src, alt, href, logoHeight, beamDuration }) => (
              <SponsorBorderBeam
                key={alt}
                tier="silver"
                duration={beamDuration}
              >
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="xp-sponsor-card xp-sponsor-card--silver"
                  style={{
                    border: '1px solid #1f1f23',
                    borderRadius: 14,
                    padding: 30,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={alt}
                    style={{ height: logoHeight, width: 'auto', opacity: 0.85 }}
                  />
                  <span className="xp-sponsor-tier-label">
                    <span>SILVER SPONSOR</span>
                    <ExternalLink
                      size={9}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </span>
                </a>
              </SponsorBorderBeam>
            ),
          )}
          <a
            href={GITHUB_SPONSORS_URL}
            target="_blank"
            rel="noreferrer"
            className="xp-sponsor-cta"
            aria-label="Become a sponsor"
          >
            <span className="xp-sponsor-cta-plus" aria-hidden="true">
              +
            </span>
            <span className="xp-sponsor-cta-label" aria-hidden="true">
              <span>Become a sponsor</span>
              <ExternalLink size={12} strokeWidth={1.75} />
            </span>
          </a>
        </div>
      </section>

      <FeatureBento />

      {/* How I built it */}
      <section id="how" style={{ padding: '56px 0 0', borderTop: border }}>
        <div style={{ padding: '0 40px' }}>
          <h2
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            How I built it
          </h2>
          <div style={{ fontSize: 14, color: '#71717a', marginTop: 6 }}>
            One real input, wearing your design — the slots you see just mirror
            its state. Keep scrolling<span style={{ color: '#3f3f46' }}>_</span>
          </div>
        </div>
        <StoryIso />
      </section>

      <CtaDaybreak starCount={starCount} />

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
