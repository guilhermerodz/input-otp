import * as React from 'react'
import { OTPInputProps } from './types'

const PWM_BADGE_MARGIN_RIGHT = 18
const PWM_BADGE_SPACE_WIDTH = '40px'
// const PWM_BADGE_SPACE_WIDTH = '0px'

const PASSWORD_MANAGERS_SELECTORS = [
  '[data-lastpass-icon-root]', // LastPass
  'com-1password-button', // 1Password
  '[data-dashlanecreated]', // Dashlane
].join(',')

export function usePasswordManagerBadge({
  inputRef,
  pwmAreaRef,
  pushPasswordManagerStrategy,
}: {
  inputRef: React.RefObject<HTMLInputElement>
  pwmAreaRef: React.RefObject<HTMLDivElement>
  pushPasswordManagerStrategy: OTPInputProps['pushPasswordManagerStrategy']
}) {
  // Metadata for instant updates (not React state)
  const pwmMetadata = React.useRef({
    done: false,
    refocused: false,
  })

  /** Password managers have a badge
   *  and I'll use this state to push them
   *  outside the input */
  const [hasPWMBadge, setHasPWMBadge] = React.useState(false)
  const [hasPWMBadgeSpace, setHasPWMBadgeSpace] = React.useState(false)

  const willPushPWMBadge = React.useMemo(() => {
    const noFlickeringCase =
      pushPasswordManagerStrategy === 'experimental-no-flickering' &&
      (!pwmMetadata.current.done || (pwmMetadata.current.done && hasPWMBadgeSpace && hasPWMBadge))

    const increaseWidthCase =
      pushPasswordManagerStrategy === 'increase-width' &&
      hasPWMBadge &&
      hasPWMBadgeSpace

    return increaseWidthCase || noFlickeringCase
  }, [hasPWMBadge, hasPWMBadgeSpace, pushPasswordManagerStrategy])

  const trackPWMBadge = React.useCallback(() => {
    const input = inputRef.current
    const pwmArea = pwmAreaRef.current
    if (
      !input ||
      !pwmArea ||
      pushPasswordManagerStrategy === 'none' ||
      pwmMetadata.current.done
    ) {
      return
    }

    const elementToCompare =
      pushPasswordManagerStrategy === 'increase-width' ? input : pwmArea

    // Get the top right-center point of the input.
    // That is usually where most password managers place their badge.
    const rightCornerX =
      elementToCompare.getBoundingClientRect().left +
      elementToCompare.offsetWidth
    const centereredY =
      elementToCompare.getBoundingClientRect().top +
      elementToCompare.offsetHeight / 2
    const x = rightCornerX - PWM_BADGE_MARGIN_RIGHT
    const y = centereredY
    const maybeBadgeEl = document.elementFromPoint(x, y)

    // Do an extra search to check for famous password managers
    const pmws = document.querySelectorAll(PASSWORD_MANAGERS_SELECTORS)

    const maybeHasBadge =
      pmws.length > 0 ||
      // If the found element is not the input itself,
      // then we assume it's a password manager badge.
      // We are not sure. Most times it'll be.
      maybeBadgeEl !== input

    if (!maybeHasBadge) {
      return
    }

    // Once the PWM badge is detected,
    // this function won't run anymore.
    pwmMetadata.current.done = true
    setHasPWMBadge(true)
  }, [inputRef, pushPasswordManagerStrategy, pwmAreaRef])

  React.useEffect(() => {
    if (pushPasswordManagerStrategy === 'none') {
      return
    }
    setTimeout(trackPWMBadge, 2000)
    setTimeout(trackPWMBadge, 5000)
    setTimeout(() => {
      pwmMetadata.current.done = true
    }, 6000)
  }, [pushPasswordManagerStrategy, trackPWMBadge])

  React.useEffect(() => {
    const input = inputRef.current
    const pwmArea = pwmAreaRef.current
    if (
      !input ||
      !pwmArea ||
      !hasPWMBadge ||
      pushPasswordManagerStrategy === 'none'
    ) {
      return
    }

    // For specific password managers,
    // the input has to be re-focused
    // to trigger a re-position of the badge.
    if (!pwmMetadata.current.refocused && document.activeElement === input) {
      const sel = [input.selectionStart, input.selectionEnd]
      input.blur()
      input.focus()
      // Recover the previous selection
      input.setSelectionRange(sel[0], sel[1])

      pwmMetadata.current.refocused = true
    }

    // Check if the PWM area is 100% visible
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        setHasPWMBadgeSpace(entry.intersectionRatio > 0.99)
      },
      { threshold: 1, root: null, rootMargin: '0px' },
    )

    observer.observe(pwmArea)

    return () => {
      observer.disconnect()
    }
  }, [
    hasPWMBadge,
    inputRef,
    pushPasswordManagerStrategy,
    pwmAreaRef,
    trackPWMBadge,
  ])

  return { willPushPWMBadge, trackPWMBadge, PWM_BADGE_SPACE_WIDTH }
}
