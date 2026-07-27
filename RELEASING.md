# Releasing

Two things ship from this repo, and they ship independently.

|                                    | Lives on            | Ships when                       |
| ---------------------------------- | ------------------- | -------------------------------- |
| The website (`input-otp.rodz.dev`) | branch `production` | you push `master` → `production` |
| The npm package (`input-otp`)      | tags `v*`           | you push a `v*` tag              |

`master` is neither. It is the integration branch: merge into it freely, nothing
user-facing moves. Vercel builds it as a preview at `next.input-otp.rodz.dev`.

## Ship the website

```bash
pnpm ship:site     # git push origin master:production
```

Fast-forward only. `git log production` is an accurate record of what is live.

## Ship the package

1. Write the entry in `CHANGELOG.md` first — `## [1.5.0-beta.1]`, prose, by hand.
   The release script refuses to cut a version that has no section.
2. Make sure `master` is pushed and CI is green. The script refuses to tag
   unpushed commits.
3. Cut it:

```bash
pnpm release:beta:first   # 1.4.2 → 1.5.0-beta.0   start a beta line
pnpm release:beta         # → 1.5.0-beta.1         bump an existing beta
pnpm release:minor        # → 1.5.0                promote to stable
pnpm release:patch
pnpm release:major
pnpm release:dry          # print what would happen, change nothing
```

That bumps `packages/input-otp/package.json`, commits, tags, pushes. **It does
not publish.** The tag triggers `.github/workflows/release.yml`, which re-runs
the whole suite on a clean checkout and publishes from CI with provenance, then
opens a GitHub release using that changelog section.

Pre-release versions land on their own npm dist-tag (`1.5.0-beta.1` → `beta`) and
leave `latest` alone. Only a stable version moves `latest`.

To publish an exact version, bypassing the bump keywords:

```bash
node scripts/release.mjs 1.5.0-beta.1
```

If a publish fails halfway, re-run the workflow from the Actions tab with
`workflow_dispatch` and the existing tag — no new tag needed.

## One-time setup

- Vercel → Settings → Git → **Production Branch** = `production`
- Vercel → Domains → assign `next.input-otp.rodz.dev` to branch `master`
- Repo secret `NPM_TOKEN` (automation token). To drop the token entirely,
  configure this repo + `release.yml` as a trusted publisher on npmjs.com and
  delete the `env:` block on the publish step — OIDC takes over.

## Notes

- Nothing publishes from a laptop. There is no bypass script; if you need to skip
  a check, fix the check.
- `apps/website` depends on `input-otp: workspace:*`, so the docs site always
  reflects `master`, not npm. That is intentional — but it means the staging site
  can document APIs that are not published yet.
- The npm `beta` dist-tag sat at `1.2.0-beta.1` from March 2024 until the 1.5
  line. Cutting a beta refreshes it.
