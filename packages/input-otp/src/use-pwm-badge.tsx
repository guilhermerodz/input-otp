import * as React from 'react'
import { OTPInputProps } from './types'

const PWM_BADGE_MARGIN_RIGHT = 18
const PWM_BADGE_SPACE_WIDTH = '40px'

const PASSWORD_MANAGERS_SELECTORS = [
  '[data-lastpass-icon-root]', // LastPass
  'com-1password-button', // 1Password
  '[data-dashlanecreated]', // Dashlane
  '[style$="2147483647 !important;"]', // Bitwarden
].join(',')

export function usePasswordManagerBadge({
  inputRef,
  pwmAreaRef,
  pushPasswordManagerStrategy,
  isFocused,
}: {
  inputRef: React.RefObject<HTMLInputElement>
  pwmAreaRef: React.RefObject<HTMLDivElement>
  pushPasswordManagerStrategy: OTPInputProps['pushPasswordManagerStrategy']
  isFocused: boolean
}) {
  // Metadata for instant updates (not React state)
  const pwmMetadata = React.useRef<{
    done: boolean
    refocused: boolean
  }>({
    done: false,
    refocused: false,
  })

  /** Password managers have a badge
   *  and I'll use this state to push them
   *  outside the input */
  const [hasPWMBadge, setHasPWMBadge] = React.useState(false)
  const [hasPWMBadgeSpace, setHasPWMBadgeSpace] = React.useState(false)
  const [done, setDone] = React.useState(false)

  const willPushPWMBadge = React.useMemo(() => {
    if (pushPasswordManagerStrategy === 'none') {
      return false
    }

    const noFlickeringCase =
      pushPasswordManagerStrategy === 'experimental-no-flickering' &&
      (!done || (done && hasPWMBadgeSpace && hasPWMBadge))

    const increaseWidthCase =
      pushPasswordManagerStrategy === 'increase-width' &&
      hasPWMBadge &&
      hasPWMBadgeSpace

    return increaseWidthCase || noFlickeringCase
  }, [done, hasPWMBadge, hasPWMBadgeSpace, pushPasswordManagerStrategy])

  const trackPWMBadge = React.useCallback(() => {
    const input = inputRef.current
    const pwmArea = pwmAreaRef.current
    if (!input || !pwmArea || done || pushPasswordManagerStrategy === 'none') {
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

    setHasPWMBadge(true)
    setDone(true)

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
  }, [done, inputRef, pushPasswordManagerStrategy, pwmAreaRef])

  React.useEffect(() => {
    // Check if the PWM area is 100% visible
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        setHasPWMBadgeSpace(entry.intersectionRatio > 0.99)
      },
      { threshold: 1, root: null, rootMargin: '0px' },
    )

    pwmAreaRef.current && observer.observe(pwmAreaRef.current)

    return () => {
      observer.disconnect()
    }
  }, [pwmAreaRef])

  React.useEffect(() => {
    const _isFocused = isFocused || document.activeElement === inputRef.current

    if (pushPasswordManagerStrategy === 'none' || !_isFocused) {
      return
    }
    const t1 = setTimeout(trackPWMBadge, 0)
    const t2 = setTimeout(trackPWMBadge, 2000)
    const t3 = setTimeout(trackPWMBadge, 5000)
    const t4 = setTimeout(() => {
      setDone(true)
    }, 6000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [inputRef, isFocused, pushPasswordManagerStrategy, trackPWMBadge])

  return { willPushPWMBadge, PWM_BADGE_SPACE_WIDTH }
}
