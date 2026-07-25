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
`src/app/(experiment)/_data/npm-downloads.ts`. The fetch is cached for 12 hours,
so the page rebuilds itself at most twice a day.

`vercel.json` also runs `/api/refresh-stats` on a 12-hour cron, which drops that
cache entry on schedule instead of waiting for a visitor. Set `CRON_SECRET` in
the project's environment — Vercel sends it as `Authorization: Bearer …` on cron
invocations, and the route refuses anything else. Without the variable the route
answers 503 in production (and stays open locally, for testing).

If npm-stat is down or answers with something unusable, the section falls back
to the last figures committed in that file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
