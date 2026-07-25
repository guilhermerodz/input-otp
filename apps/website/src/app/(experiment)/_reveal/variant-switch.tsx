import { VARIANTS } from './choreography'

/**
 * Hops between the five reveal variants. A review affordance while the
 * choreography is being chosen — not part of the page.
 */
export function VariantSwitch({ current }: { current: number }) {
  const active = VARIANTS.find(v => v.id === current)

  return (
    <nav className="rv-switch" aria-label="Reveal variant">
      <span className="rv-switch-label xp-mono">
        {active?.name}
        <span style={{ color: '#3f3f46' }}> · {active?.blurb}</span>
      </span>
      {VARIANTS.map(v => (
        <a
          key={v.id}
          href={`/${v.slug}`}
          className="xp-mono"
          aria-current={v.id === current ? 'page' : undefined}
          title={`${v.name} — ${v.blurb}`}
        >
          {v.id}
        </a>
      ))}
    </nav>
  )
}
