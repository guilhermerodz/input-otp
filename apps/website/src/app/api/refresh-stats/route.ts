import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

import {
  NPM_DOWNLOADS_TAG,
  getDownloadStats,
} from '../../(experiment)/_data/npm-downloads'

/* The scheduled half of the refresh. vercel.json runs this once a day; it
   drops the cached npm-stat response and pulls a fresh one, which rebuilds the
   landing page's "trusted at scale" numbers whether or not anyone visited in
   the meantime.

   Daily rather than twice-daily because the account is on Hobby, where any
   expression that fires more than once a day fails the deployment outright.

   The fetch in _data/npm-downloads.ts carries a 12-hour window on its own, so
   the cron is an optimisation, not the mechanism — a deployment with no cron at
   all still refreshes, just lazily, on the first visit after the window closes. */

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  /* Vercel sends this header on cron invocations when CRON_SECRET is set in
     the project's environment. Without the variable the endpoint is only open
     locally — an unauthenticated cache-buster on a public URL is a way to be
     someone's load generator. */
  const secret = process.env.CRON_SECRET
  if (secret) {
    if (request.headers.get('authorization') !== `Bearer ${secret}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  } else if (process.env.NODE_ENV === 'production') {
    return new NextResponse('CRON_SECRET is not configured', { status: 503 })
  }

  revalidateTag(NPM_DOWNLOADS_TAG)

  /* Fetch straight back so the cron pays for the round trip instead of the
     next visitor, and so the response says what was actually read. */
  const stats = await getDownloadStats()

  return NextResponse.json({ revalidated: true, ...stats })
}
