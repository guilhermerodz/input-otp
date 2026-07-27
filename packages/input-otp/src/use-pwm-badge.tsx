import * as React from 'react'
import { OTPInputProps } from './types'

const PWM_BADGE_MARGIN_RIGHT = 18
const PWM_BADGE_SPACE_WIDTH_PX = 40
const PWM_BADGE_SPACE_WIDTH = `${PWM_BADGE_SPACE_WIDTH_PX}px` as const

/** The push strategy grows the input `PWM_BADGE_SPACE_WIDTH_PX` past the
 *  container, so the gutter must fit inside whatever box constrains
 *  horizontal overflow around the container. Otherwise the overhang either
 *  becomes scrollable overflow — a scrollbar appears and shifts the whole
 *  layout — or gets clipped, and some password managers refuse to render
 *  a badge whose anchor sits in a clipped region.
 *  Returns the free space, in px, between the container's right edge and
 *  the content edge of the nearest constraining box (viewport included). */
function availableBadgeSpace(container: HTMLElement): number {
  const containerRight = container.getBoundingClientRect().right

  // Start at the container itself: overflow set via `containerClassName`
  // also clips the absolutely-positioned input inside it.
  let el: HTMLElement | null = container
  while (el) {
    if (getComputedStyle(el).overflowX !== 'visible') {
      const rect = el.getBoundingClientRect()
      return rect.left + el.clientLeft + el.clientWidth - containerRight
    }
    el = el.parentElement
  }

  // No constraining ancestor — the viewport is the limit. Unlike
  // `window.innerWidth`, `clientWidth` excludes a vertical scrollbar.
  return document.documentElement.clientWidth - containerRight
}

const PASSWORD_MANAGERS_SELECTORS = [
  '[data-lastpass-icon-root]', // LastPass
  'com-1password-button', // 1Password
  '[data-dashlanecreated]', // Dashlane
  '[style$="2147483647 !important;"]', // Bitwarden
].join(',')

export function usePasswordManagerBadge({
  containerRef,
  inputRef,
  pushPasswordManagerStrategy,
  isFocused,
}: {
  containerRef: React.RefObject<HTMLDivElement>
  inputRef: React.RefObject<HTMLInputElement>
  pushPasswordManagerStrategy: OTPInputProps['pushPasswordManagerStrategy']
  isFocused: boolean
}) {
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

    const increaseWidthCase =
      (pushPasswordManagerStrategy === 'increase-width' ||
        // TODO: remove 'experimental-no-flickering' support in 2.0.0
        pushPasswordManagerStrategy === 'experimental-no-flickering') &&
      hasPWMBadge &&
      hasPWMBadgeSpace

    return increaseWidthCase
  }, [hasPWMBadge, hasPWMBadgeSpace, pushPasswordManagerStrategy])

  const trackPWMBadge = React.useCallback(() => {
    const container = containerRef.current
    const input = inputRef.current
    if (
      !container ||
      !input ||
      done ||
      pushPasswordManagerStrategy === 'none'
    ) {
      return
    }

    const elementToCompare = container

    // Get the top right-center point of the container.
    // That is usually where most password managers place their badge.
    const rightCornerX =
      elementToCompare.getBoundingClientRect().left +
      elementToCompare.offsetWidth
    const centereredY =
      elementToCompare.getBoundingClientRect().top +
      elementToCompare.offsetHeight / 2
    const x = rightCornerX - PWM_BADGE_MARGIN_RIGHT
    const y = centereredY

    // Do an extra search to check for famous password managers
    const pmws = document.querySelectorAll(PASSWORD_MANAGERS_SELECTORS)

    // If no password manager is automatically detect,
    // we'll try to dispatch document.elementFromPoint
    // to identify badges
    if (pmws.length === 0) {
      const maybeBadgeEl = document.elementFromPoint(x, y)

      // If the found element is the input itself,
      // then we assume it's not a password manager badge.
      // We are not sure. Most times that means there isn't a badge.
      if (maybeBadgeEl === container) {
        return
      }
    }

    // Re-measure the space before committing to the push: the interval
    // copy can be up to a second stale, and the layout may have changed
    // since — e.g. a validation message appearing as focus lands here.
    setHasPWMBadgeSpace(
      availableBadgeSpace(container) >= PWM_BADGE_SPACE_WIDTH_PX,
    )
    setHasPWMBadge(true)
    setDone(true)
  }, [containerRef, inputRef, done, pushPasswordManagerStrategy])

  React.useEffect(() => {
    const container = containerRef.current
    if (!container || pushPasswordManagerStrategy === 'none') {
      return
    }

    // Check if the badge gutter fits without overflowing or being clipped
    function checkHasSpace() {
      setHasPWMBadgeSpace(
        availableBadgeSpace(container) >= PWM_BADGE_SPACE_WIDTH_PX,
      )
    }

    checkHasSpace()
    const interval = setInterval(checkHasSpace, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [containerRef, pushPasswordManagerStrategy])

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

  return { hasPWMBadge, willPushPWMBadge, PWM_BADGE_SPACE_WIDTH }
}
