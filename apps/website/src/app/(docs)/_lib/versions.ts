/**
 * The docs version registry. `/docs/*` always documents the latest stable
 * line; when a new major ships, the previous line is frozen as a full
 * snapshot under `/docs/v<major>/*` and registered here as `frozen`.
 *
 * Minor releases never fork the docs — additions are marked inline with
 * `since` badges instead (see PropsTable), so readers on an older minor can
 * tell exactly which parts don't apply to them yet.
 */

export interface DocsVersion {
  /** Stable registry key — the major line ('v1', 'v2'). */
  id: string
  /** What the version selector displays. */
  label: string
  /** This version's URL root: '/docs' for latest, '/docs/v1' for a snapshot. */
  base: string
  status: 'latest' | 'frozen'
}

export const docsVersions: DocsVersion[] = [
  { id: 'v1', label: 'v1.x', base: '/docs', status: 'latest' },
]

export const latestDocsVersion = docsVersions.find(
  version => version.status === 'latest',
)!

/** Which version a /docs pathname belongs to. Frozen bases win; everything else is latest. */
export function versionForPathname(pathname: string): DocsVersion {
  for (const version of docsVersions) {
    if (version.status !== 'frozen') continue
    if (pathname === version.base || pathname.startsWith(version.base + '/')) {
      return version
    }
  }
  return latestDocsVersion
}
