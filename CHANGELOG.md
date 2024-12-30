# Changelog

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