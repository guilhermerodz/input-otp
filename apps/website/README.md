This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Download stats

The landing page's "trusted at scale" counter (and the milestone the intro
celebrates) comes from npm-stat, not from numbers typed into the source — see
`src/app/(experiment)/_data/npm-downloads.ts`.

Two things keep it fresh, and **either one is enough on its own**:

1. The fetch carries a 12-hour `revalidate`, so the first visitor after the
   window closes triggers a rebuild of any page that reads it.
2. `/api/refresh-stats` drops the same cache entry on a schedule, wired to a
   cron in `vercel.json`.

The cron is the belt to the first path's braces. It only changes the outcome
when nobody visits for half a day — without it the numbers still refresh, just
lazily, on the next visit rather than on the hour. **Skipping it breaks
nothing.** Deploy without a cron and the counter still ages correctly.

If npm-stat is down or answers with something unusable, the section falls back
to the last figures committed in that file. A stale floor beats an empty
section, and the numbers only ever move up.

### `CRON_SECRET`

A value you invent, not one Vercel issues. When the variable exists on the
project, Vercel attaches `Authorization: Bearer <CRON_SECRET>` to the requests
its scheduler makes, and `/api/refresh-stats` rejects anything that doesn't
match.

It exists because the route sits on a public URL and every hit drops a cache
entry and makes an outbound request to npm-stat. Unauthenticated, it is a way
for a stranger to use this site as a load generator against npm-stat while
forcing endless rebuilds.

Generate one — any high-entropy string, at least 16 characters, alphanumeric so
it travels safely in a header:

```bash
openssl rand -hex 32
```

Add it under **Settings → Environment Variables** on the Vercel project, scoped
to Production, or:

```bash
vercel env add CRON_SECRET production
```

Then redeploy. Environment changes only take effect on a new deployment.

How the route behaves:

| Environment | `CRON_SECRET` | Behaviour |
|---|---|---|
| Local | unset | Open, so you can call it while developing |
| Local | set | Enforced, same as production |
| Production | unset | `503 CRON_SECRET is not configured` |
| Production | set | `401` unless the bearer token matches |

The production 503 is deliberate: a public, unauthenticated cache-buster is
worse than a cron that does nothing, so the route refuses to run rather than
quietly accept anyone. The consequence is that until the variable is set, the
scheduled refresh accomplishes nothing — set it before or at deploy, not after
you notice stale numbers. The counter itself is unaffected either way, since
the `revalidate` path doesn't go through this route at all.

One thing to check against your Vercel plan: the schedule is `0 0,12 * * *`,
twice daily. Hobby projects have been limited to one cron trigger per day, so
if this project is on Hobby, drop it to `0 0 * * *` in `vercel.json` — the
12-hour `revalidate` still covers the gap.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
