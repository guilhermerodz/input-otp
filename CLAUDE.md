# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

input-otp is a React component library for OTP (One-Time Password) inputs. It uses a single invisible `<input>` element positioned inside a container, with selection state mirrored for UI rendering. The library is unstyled, fully accessible, and handles iOS/Android quirks, password manager badges, and SMS autofill.

## Monorepo Structure

- **packages/input-otp/** — Core library (published to npm as `input-otp`)
- **apps/playground/** — Next.js app (port 3039) with component showcase and Playwright E2E tests
- **apps/website/** — Next.js documentation site

Uses pnpm workspaces + Turborepo.

## Common Commands

```bash
pnpm install              # Install dependencies
pnpm build                # Build all packages (Turbo)
pnpm build:lib            # Build only the library (tsup → dist/)
pnpm dev                  # Dev mode for all packages
pnpm dev:playground       # Dev mode for playground app only
pnpm test                 # Run Playwright E2E tests (all browsers)
pnpm test:ui              # Run Playwright tests with UI
pnpm lint:lib             # Lint the library
pnpm type-check           # TypeScript type checking
pnpm format               # Prettier formatting
```

Tests require the library to be built first (`pnpm build:lib`). Turbo handles this dependency automatically when running `pnpm test`.

## Library Architecture (packages/input-otp/src/)

| File | Role |
|------|------|
| `input.tsx` | Core `OTPInput` component — renders invisible input, tracks selection state, handles all keyboard/paste/focus logic |
| `types.ts` | TypeScript interfaces (`OTPInputProps`, slot types, render props) |
| `regexp.ts` | Exported regex patterns: `REGEXP_ONLY_DIGITS`, `REGEXP_ONLY_CHARS`, `REGEXP_ONLY_DIGITS_AND_CHARS` |
| `use-pwm-badge.tsx` | Password manager badge detection via `elementFromPoint` |
| `sync-timeouts.ts` | Utility for synced timeouts at 0ms/10ms/50ms intervals |
| `use-previous.ts` | Hook to track previous value |

The component exposes a `render` prop (or Context API) that receives slot state (char, focus, caret position) for custom UI rendering.

## Build

Library builds with tsup: entry `src/index.ts` → CJS (`dist/index.js`), ESM (`dist/index.mjs`), types (`dist/index.d.ts`). Minified with sourcemaps.

## Testing

All tests are Playwright E2E tests in `apps/playground/src/tests/`. Test files cover typing, rendering, selections, slot behavior, props, word deletion, autofocus, and onComplete. Tests run across Chromium, Firefox, WebKit, and mobile viewports.

Set `WINDOWED_TESTS=1` to run tests in headed mode with slow-mo.

## Code Style

- 2 spaces, no semicolons, single quotes, trailing commas, LF line endings
- Prettier config in root `package.json`
- Target: ES2015, JSX: React (not react-jsx)
- Peer dependency: React 16.8+
