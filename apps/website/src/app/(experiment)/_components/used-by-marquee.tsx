/* Monochrome logo wall on a loop. Marks are trimmed brand glyphs paired with
   the name in the site's own type, so nine different logos read as one row
   instead of nine competing lockups. Hover anywhere pauses the belt; hover a
   single company brings it to full white. */

const COMPANIES = [
  { name: 'Vercel', src: '/logos/vercel.svg', height: 15 },
  { name: 'xAI', src: '/logos/xai.svg', height: 18 },
  { name: 'Lovable', src: '/logos/lovable.svg', height: 19 },
  { name: 'ElevenLabs', src: '/logos/elevenlabs.svg', height: 17 },
  { name: 'Sanity', src: '/logos/sanity.svg', height: 18 },
  { name: 'Clerk', src: '/logos/clerk.svg', height: 19 },
  { name: 'Resend', src: '/logos/resend.svg', height: 17 },
  { name: 'Cluely', src: '/logos/cluely.svg', height: 20 },
  { name: 'MongoDB', src: '/logos/mongodb.svg', height: 21 },
] as const

/* One pass of the belt. The track holds two of these and slides exactly half
   its width, so the seam never shows. */
function Belt({ clone = false }: { clone?: boolean }) {
  return (
    <div className="xp-usedby-belt" aria-hidden={clone || undefined}>
      {COMPANIES.map(company => (
        <div className="xp-usedby-cell" key={company.name}>
          <div className="xp-usedby-item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={company.src}
              alt=""
              style={{ height: company.height, width: 'auto' }}
            />
            <span className="xp-usedby-name">{company.name}</span>
          </div>
          <span className="xp-usedby-sep xp-mono" aria-hidden="true">
            /
          </span>
        </div>
      ))}
    </div>
  )
}

export function UsedByMarquee() {
  return (
    <section className="xp-usedby-section">
      <div className="xp-usedby-eyebrow xp-mono">
        USED BY<span style={{ color: '#3f3f46' }}>_</span>
      </div>
      <div className="xp-usedby-band">
        <div className="xp-usedby-viewport">
          <div className="xp-usedby-track">
            <Belt />
            <Belt clone />
          </div>
        </div>
      </div>
    </section>
  )
}
