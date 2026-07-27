# Changelog

## [1.5.0-beta.0]

- fix(input): disable spellcheck by default
  - Browsers would mark a filled code as a spelling error and underline it. `spellCheck` now defaults to `false`; passing your own `spellCheck` prop still overrides it.
- fix(input): feature-detect ResizeObserver before observing
  - Browsers without `ResizeObserver` (e.g. iOS Safari <13.4) crashed on mount. When the observer is unavailable, the root height is now simply measured once on mount.
- fix(input): fall back to 16px font-size until `--root-height` resolves
  - Before the variable is set, the invisible input inherited its font-size — and when that inherited size was under 16px, iOS Safari zoomed the whole page on focus or back-navigation.
- fix(input): clear pending sync timeouts on unmount
  - The autofill/selection sync timeouts could fire after unmount, causing state updates on an unmounted component — noisy `act()` warnings and flaky CI test runs.
- feat(input): add `nonce` prop
  - Applied to the `<style>` tag the library injects, so a `style-src` Content-Security-Policy that requires nonces no longer blocks it.
- fix(input): use the guarded input reference inside the selectionchange listener
  - Fixes a `null is not an object (evaluating 'setSelectionRange')` crash when the listener fired while the ref was already null.
- fix(input): opt the container out of browser translation
  - Chrome's translator rewrote the slots' text nodes (wrapping them in `<font>` elements), crashing React on the next re-render — easiest to hit with alphanumeric codes under an active page translation. The container now carries `translate="no"`; a one-time code is never meaningful to translate.
- fix(input): log CSS rule insertion failures as warnings, not errors
  - Some environments reject individual cosmetic selectors (`:autofill` in older Android WebViews, for instance). Nothing breaks when that happens, but the `console.error` was captured by Sentry and similar tools as if the application had failed. Same message, warning level.
- fix(input): clip the password manager gutter so it cannot shift the layout
  - While pushing a password manager badge the invisible input grows 40px past the container. It was already visually clipped, but the box still counted as scrollable overflow, producing a horizontal scrollbar and a layout shift inside constrained containers. The input's wrapper now clips horizontally; badges are unaffected since extensions render them in their own overlay.
- chore(types): narrow `onComplete` to `(value: string) => unknown`
  - The declaration was a variadic `(...args: any[]) => unknown`, but the only call site has always passed a single string. Handlers declaring extra parameters (which could never receive values) now fail to compile; every zero-arg or `(code: string)` handler keeps compiling unchanged.

## [1.4.2]

- chore(input): remove unintentional log within internal pasteListener

## [1.4.1]

- chore(input): add peer dep for react@19-rc

## [1.4.0]

I'm sorry to skip `1.3.0` due to an issue I've had while publishing the NPM package.

- chore(input): stop enforcing only digits regexp by default
  - Before 1.4.0, the input would take `REGEXP_ONLY_DIGITS` as the default pattern behavior, mistaking mobile users when they couldn't type in or even paste alphanumeric entries.
- feat(input): add pasteTransformer prop
  - Allows pasting invalid codes and then transforming them into something that the input's regex/pattern would accept. Example: you can now take "XXX-XXX" as pasted input even though you've determined a pattern of 6 numerical digits; just add a prop to your OTPInput: `pasteTransformer={pasted => pasted.replaceAll('-','')}`.
- feat(input): add placeholder
  - Input can now render a placeholder, all you should do is adjust your CSS to render it (look at the default example on README)!
  - The input's HTML now lives with an attribute `data-input-otp-placeholder-shown` when its content is empty.
- chore(input): remove re-focus feature for password manager badges
  - Fixed a bug where the input's `blur` event was triggering even if the user hasn't requested it. The sacrifice was to remove the auto re-focus feature for password manager badges, meaning if the password badge ever disappears, then the user himself has to re-trigger focus by manually clicking or selecting the input.

## [1.2.5]

- chore(input): add peer dep for react@19

## [1.2.4]

- fix(input): prevent single caret selection on deletion/cutting

## [1.2.3]

- fix(input/css): specify `color: transparent !important` for `::selection` modifier
- fix(input/node-env): check for CSS supports api before calling fn

## [1.2.2]

- chore(input): remove experimental flag `pushPasswordManagerStrategy`

## [1.2.1]

- fix(input): use `color` not `text` for autofillStyles
- chore(input): keep support for prop pushPasswordManagerStrategy="experimental-no-flickering"
- fix(input): prevent layout expansion when password managers aren't there and remove "experimental-no-flickering" strategy

## [1.2.0]

- chore(input): don't restrict inputMode typing

## [1.2.0-beta.1]

- fix(input): renderfn typing

## [1.2.0-beta.0]

- feat(input): add context option
- chore(input): remove unused type `SelectionType`

## [1.1.0]

- feat(input/no-js): allow opting out of no-js fallback
- fix(input/no-js): move noscript to the top
- chore(input): optimize use-badge
- fix(input): set no extra width on default noscript css fallback
- fix(input): check window during ssr
- fix(input/ios): add right: 1px to compensate left: -1px
- chore(input/ios): revert paste listener (re-add)
- chore(input): always trigger selection menu on ios
- perf(input): prevent trackPWMBadge when strategy is none
- fix(input): do not skip left slot
- fix(input): do not skip left slot when pressing arrowleft after insert mode
- fix(input): reinforce wrapper to pointerEvents none
- feat(input): add experimental push pwm badge
- chore(input): rename prop to pushPasswordManagerStrategy
- chore(input): move focus logic to _focusListener
- fix(input): reinforce no box shadows
- perf(input): rewrite core in a single event listener
- fix(input): safe insert css rules
- fix(input): prevent layout shift caused by password managers
- feat(input): add pwm badge space detector
- feat(input): add passwordManagerBehavior prop
- fix(input): forcefully remove :autofill
- feat(input): track password managers

## [1.0.1]

- fix(input): immediately update selection after paste
- fix(input): hide selection on iOS webkit

## [1.0.0]

- fix(input/firefox): use setselectionrange direction:backwards

## [0.3.31-beta]

No input scope changes for this version.

## [0.3.3-beta]

No input scope changes for this version.

## [0.3.2-beta]

No input scope changes for this version.

## [0.3.11-beta]

No input scope changes for this version.

## [0.3.1-beta]

No input scope changes for this version.

## [0.2.4]

- chore(input): always focus onContainerClick

## [0.2.1]

- fix(input): do not trigger `onComplete` twice

## [0.2]

No input scope changes for this version.