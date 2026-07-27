# Landing page — handoff

Branch: `codex/continue-landing` (diverged from `master` at `9b96062`).
Scope: everything here is the `apps/website` landing rebuild. The core
`input-otp` library was **not** touched.

## What this branch is

A ground-up rebuild of the marketing site's landing page (`/`), themed around
the **700M downloads** milestone with a tactile "keycap" visual language and a
sequence of interactive, OTP-flavored set pieces. It started life as an
isolated `/experiment` route and was later merged to become the single `/`.

Run it:

```bash
pnpm install
pnpm dev:playground   # or: cd apps/website && pnpm dev
# website dev server → http://localhost:3040
```

Everything lives under `apps/website/src/app/(experiment)/`. That route group
**is** the homepage now — `(experiment)/page.tsx` is the real `/`. Don't be
misled by the folder name.

## The page, section by section

`experiment-view.tsx` is the top-level composition. Sections in order:

1. **Preloader / intro** (`_components/preloader.tsx`) — an odometer /
   slot-machine spin that lands on `700.000.000`, with a lever pull and a
   caret that types a thank-you. Plays **once per session**, gated on
   `localStorage['xp-intro-seen']`, and is skipped before first paint when
   already seen (blocking script) to avoid a flash. **To see the page without
   it, set that key** — e.g. in Playwright:
   `page.addInitScript(() => localStorage.setItem('xp-intro-seen', '1'))`.
2. **Hero OTP input** (`_components/hero-otp.tsx`, `hero-field.tsx`) — a
   Luxe-style live OTP field with sliding digits, a gliding focus ring, ghost
   typing, an error shake on a wrong code, and a scripted 6-beat interactive
   tour (select → cut → paste → grow → slice → reveal). This is the most
   intricate, state-heavy component on the page.
3. **Stats + used-by + sponsors** — static content in `experiment-view.tsx`.
   The Clerk gold-sponsor card now renders the **particle-shader logo** (see
   below) instead of a flat `<img>`.
4. **"How I built it"** isometric scroll-story (`_components/story-iso.tsx`,
   `story-shared.tsx`) — the live variant, wired into the page. `story-v1.tsx`
   / `story-v2.tsx` (routes `/story-1`, `/story-2`) are **earlier alternates
   kept for reference**, not linked from `/`.
5. **Style gallery** (`_components/gallery.tsx`) — the same OTP component under
   different render props, all live/typeable.
6. CTA + footer.

## Most recent work — Clerk particle-shader logo

`_components/clerk-particles.tsx`, a dependency-free **raw WebGL2** component,
a high-fidelity take on basement.studio's Vercel Ship particle effect
(https://basement.studio/post/shipping-ship-behind-the-particle-shader-effect-for-vercels-conf).

How it works:

- The wordmark image is rasterized offscreen at **device-pixel resolution**
  into particle "home" positions. Samples retain the source alpha, so the
  settled canvas matches the antialiased wordmark; the individual particles
  reveal themselves only while moving.
- A low-res ping-pong **flow FBO** encodes direction-to-cursor (RG) and
  magnitude (B), fading each frame → cursor inertia, not 1:1 tracking.
- A ping-pong **RGBA32F position/velocity FBO** integrates: flow-field
  **repulsion** (particles flee the cursor), a spring back to home, and
  damping. Draws as additive point sprites via `gl_VertexID` (no buffers).
- Resting home positions are **pixel-snapped** so the texture rasterizes
  cleanly without seams or subpixel shimmer.

Design decisions worth knowing before you touch it:

- **It is logo-agnostic.** Props are `src` / `alt` / `height`; it reads any
  image's alpha channel. Reusing it for Resend/Evomi is a one-liner. The name
  and the gold glow tint (`vec3(1.0, 0.85, 0.55)` in `POINTS_FS`, chosen to
  match the GOLD SPONSOR card) are the only Clerk-specific bits. If you
  generalize it, rename to something like `LogoParticles` and lift the glow
  color to a prop.
- **Only alpha is used** — particles render white/gold, so a full-color logo
  becomes a white silhouette. Color-preserving would need a second RGB texture
  sampled per cell.
- Graceful degradation is built in: pauses offscreen (IntersectionObserver)
  and on hidden tabs, respects `prefers-reduced-motion`, caps DPR at 2, and
  **falls back to the static `<img>`** if WebGL2 / float render targets are
  unavailable or the image isn't canvas-readable (must be same-origin/CORS).

Tunable constants at the top of the file: `FLOW_RADIUS_CSS`, `FORCE`,
`SPRING`, `DAMPING`.

## State of the branch

- **Working tree is clean; everything is committed.**
- `pnpm --filter website lint` and `tsc --noEmit` **pass**.
- This branch has **not** been pushed and has no upstream.
- It has **not** been merged with `master`. Master carries newer Playwright
  test fixes (`playwright.config.ts`, `base.selections.spec.ts`) that
  **conflict** with this branch's versions of those two files. Bringing master
  in requires resolving those two test files by hand — deliberately left for
  whoever does the integration, so a wrong test-merge doesn't sneak in here.

## Verifying visual work

There's no visual test harness; iterate with the playground's Playwright
(`apps/playground` has `@playwright/test`) driving `localhost:3040` and
screenshotting. Remember to set `xp-intro-seen` to skip the intro, and capture
`scale: 'device'` for retina-accurate pixels when judging the particle grid.

## Suggested next steps

- **Integrate with `master`**: merge and resolve the two test-file conflicts,
  then push. This is the main blocker to landing the work.
- Decide the fate of the alternate story variants (`story-v1/v2`, `/story-1`,
  `/story-2`) — keep as reference or delete.
- Optional: generalize `ClerkParticles` → `LogoParticles` and apply it to the
  other sponsor logos if the effect earns its place.
- Cross-device/perf pass on the particle logo and the hero tour on real
  mobile — both are GPU/animation heavy.

## Note for the person merging

The particle work replaced the Clerk `<img>` in two spots originally; only the
gold-sponsor card uses `ClerkParticles` now. The 17px hero badge still uses the
flat SVG on purpose — it's too small for the grid to read.
