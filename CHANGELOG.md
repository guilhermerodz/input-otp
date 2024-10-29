# Changelog

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