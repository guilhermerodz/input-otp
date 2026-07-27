/* The download figures behind "trusted at scale" — read from npm-stat rather
   than typed into the source by hand, so the counter ages with the package
   instead of with the last person who remembered to update it.

   This is the same data the npm-stat charts page draws:
   https://npm-stat.com/charts.html?package=input-otp&from=2024-01-01&to=<today>
   The page itself is a chart in a browser; this is the JSON endpoint it calls.

   Refreshed every 12 hours. Two things arrange that, and either one is enough:
   the fetch below carries `revalidate`, so the first visitor after the window
   closes triggers a rebuild of any page that reads it, and `/api/refresh-stats`
   (wired to a cron in vercel.json) drops the same cache entry on a schedule so
   a quiet half-day still ends with fresh numbers. */

/* The package's first publish is 2024-02-19, so this start date reaches
   everything — same `from` the charts URL uses. */
const FROM = '2024-01-01'
const PACKAGE = 'input-otp'

export const NPM_DOWNLOADS_TAG = 'npm-downloads'

/* Twelve hours. */
export const NPM_DOWNLOADS_REVALIDATE = 12 * 60 * 60

export type DownloadStats = {
  /** Milliseconds. The instant `total` was true as of — the end of the last
   *  day npm reported, which is what the live counter extrapolates from. */
  anchorAt: number
  /** Every daily figure npm has for the package, summed. */
  total: number
  /** The last seven reported days. */
  weekly: number
}

/* What the section renders when npm-stat is unreachable or answers with
   something unusable. Read on 2026-07-24; a stale floor beats an empty
   section, and the numbers only ever move up. */
const FALLBACK: DownloadStats = {
  anchorAt: Date.parse('2026-07-25T00:00:00Z'),
  total: 766_740_941,
  weekly: 33_082_674,
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

/** Sums npm-stat's day → downloads map into the three numbers the section
 *  needs. Returns null for anything that doesn't look like a real answer. */
function summarize(days: Record<string, number>): DownloadStats | null {
  const dates = Object.keys(days).sort()
  if (dates.length < 7) return null

  let total = 0
  for (const date of dates) {
    const n = days[date]
    /* npm returns 0 for days its own pipeline missed — a gap, not a quiet
       day. Nothing to do but add it as zero, which keeps the total a floor.
       That is the side to be wrong on. */
    if (typeof n !== 'number' || !Number.isFinite(n) || n < 0) return null
    total += n
  }
  if (total <= 0) return null

  const weekly = dates.slice(-7).reduce((sum, date) => sum + days[date], 0)

  /* npm-stat reports whole days, so the total is true as of midnight after
     the last one it has. */
  const anchorAt =
    Date.parse(`${dates[dates.length - 1]}T00:00:00Z`) + 86_400_000
  if (!Number.isFinite(anchorAt)) return null

  return { anchorAt, total, weekly }
}

export async function getDownloadStats(): Promise<DownloadStats> {
  const url = `https://npm-stat.com/api/download-counts?package=${PACKAGE}&from=${FROM}&until=${today()}`

  try {
    const res = await fetch(url, {
      next: { revalidate: NPM_DOWNLOADS_REVALIDATE, tags: [NPM_DOWNLOADS_TAG] },
    })
    if (!res.ok) return FALLBACK

    const body = (await res.json()) as Record<string, Record<string, number>>
    const days = body?.[PACKAGE]
    if (!days || typeof days !== 'object') return FALLBACK

    const stats = summarize(days)
    if (!stats) return FALLBACK

    /* The count is cumulative from a fixed start date, so it can only grow.
       A smaller answer than the floor means npm-stat is having a bad day,
       not that installs were returned. */
    return stats.total < FALLBACK.total ? FALLBACK : stats
  } catch {
    return FALLBACK
  }
}

/** The round number the intro celebrates — the last hundred million crossed.
 *  Always four characters wide, which the slot machine's four reels and the
 *  typed thank-you both count on. */
export function milestoneLabel(total: number) {
  const hundreds = Math.floor(total / 1e8)
  if (hundreds < 10) return `${hundreds * 100}M`
  return `${(hundreds / 10).toFixed(1)}B`
}
