import * as React from 'react'

type SelectionDirection = 'none' | 'forward' | 'backward'
/** [selectionStart, selectionEnd, selectionDirection] */
type Selection = [number, number, SelectionDirection]

interface SlotCenter {
  x: number
  y: number
}

interface Gesture {
  pointerId: number
  pointerType: string
  downAt: number
  downX: number
  downY: number
  /** Rendered slot centers, measured once at pointerdown (client coords). */
  centers: SlotCenter[]
  /** Slot index where the gesture started — ranges extend from here. */
  anchor: number
  lastSlot: number
  moved: boolean
  /** Pointer still down and the gesture not handed over to the native UI. */
  active: boolean
  upAt: number | null
  /** The selection this gesture wants the input to have right now. */
  intended: Selection
}

/** A touch held still longer than this belongs to the native long-press UI
 *  (iOS caret loupe + edit menu, Android selection handles). Past this point
 *  the gesture is abandoned entirely — no selection is applied and nothing
 *  is enforced — so the native menus present exactly as they would without
 *  this feature. Kept below the ~500ms the platforms need to trigger their
 *  long-press recognizers. */
const LONG_PRESS_MS = 400

/** Mobile browsers place the caret natively as part of the tap's default
 *  action, which lands *after* our pointerup handler applied the tapped
 *  slot. Keep re-asserting the intended range for a short window so that
 *  native caret placement cannot undo the tap. Must stay well below the
 *  time it takes to reach any edit-menu action (e.g. Select All), which
 *  must not be fought. */
const POST_UP_ENFORCE_MS = 250

/** Finger taps wobble by a few px — don't promote a wobbly tap to a drag. */
const TOUCH_SLOP_PX = 8
const MOUSE_SLOP_PX = 2

/** PointerEvent.detail is unreliable for click counts, so double-clicks are
 *  detected manually from two nearby pointerdowns. */
const DOUBLE_CLICK_MS = 400
const DOUBLE_CLICK_SLOP_PX = 8

/** Custom renderers can tag each slot element with `data-input-otp-slot`
 *  for exact pointer→slot hit mapping. shadcn/ui's `data-slot` convention
 *  is picked up automatically. Without tags, the container width is split
 *  evenly — exact for uniform slots, approximate around separators. */
const SLOT_SELECTOR = '[data-input-otp-slot], [data-slot="input-otp-slot"]'

function measureSlotCenters(
  container: HTMLElement,
  maxLength: number,
): SlotCenter[] {
  const els = container.querySelectorAll(SLOT_SELECTOR)
  if (els.length === maxLength) {
    return Array.prototype.map.call(els, (el: Element) => {
      const r = el.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    }) as SlotCenter[]
  }

  const rect = container.getBoundingClientRect()
  const isRTL = getComputedStyle(container).direction === 'rtl'
  return Array.from({ length: maxLength }, (_, i) => {
    const visualIdx = isRTL ? maxLength - 1 - i : i
    return {
      x: rect.left + ((visualIdx + 0.5) * rect.width) / maxLength,
      y: rect.top + rect.height / 2,
    }
  })
}

function nearestSlot(centers: SlotCenter[], x: number, y: number): number {
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < centers.length; i++) {
    const dx = centers[i].x - x
    const dy = centers[i].y - y
    const dist = dx * dx + dy * dy
    if (dist < bestDist) {
      bestDist = dist
      best = i
    }
  }
  return best
}

function selectionForTap(
  slot: number,
  valueLength: number,
  maxLength: number,
): Selection {
  if (valueLength === 0) {
    return [0, 0, 'none']
  }
  if (slot >= valueLength) {
    // Tapped an empty slot: park the caret at the end in insert mode
    // (a full input never reaches here — every slot holds a char).
    return valueLength === maxLength
      ? [valueLength - 1, valueLength, 'backward']
      : [valueLength, valueLength, 'none']
  }
  return [slot, slot + 1, 'forward']
}

function selectionForDrag(
  anchor: number,
  slot: number,
  valueLength: number,
): Selection {
  if (valueLength === 0) {
    return [0, 0, 'none']
  }
  const lo = Math.min(anchor, slot)
  const hi = Math.max(anchor, slot)
  if (lo >= valueLength) {
    // The whole drag happened past the typed chars
    return [valueLength, valueLength, 'none']
  }
  return [
    lo,
    Math.min(hi + 1, valueLength),
    slot < anchor ? 'backward' : 'forward',
  ]
}

/**
 * Maps pointer gestures onto slot selections: tapping/clicking a slot
 * selects it, dragging extends the selection across slots — the behavior a
 * user expects from a segmented input, which the invisible input cannot
 * provide natively because its text geometry has nothing to do with the
 * rendered slots.
 *
 * Mouse pointers are handled eagerly (native selection is prevented and
 * fully re-implemented). Touch pointers are handled cooperatively: native
 * defaults are never prevented, so focus, scrolling (via `touch-action:
 * pan-y`) and — critically — the iOS/Android long-press UIs keep working;
 * the intended slot selection is applied at the moments the platform allows
 * and briefly re-asserted when the native caret placement races it.
 */
export function useSlotSelection({
  inputRef,
  containerRef,
  maxLength,
  inputMetadataRef,
  setMirrorSelectionStart,
  setMirrorSelectionEnd,
}: {
  inputRef: React.RefObject<HTMLInputElement>
  containerRef: React.RefObject<HTMLDivElement>
  maxLength: number
  inputMetadataRef: React.MutableRefObject<{
    prev: [number | null, number | null, 'none' | 'forward' | 'backward']
  }>
  setMirrorSelectionStart: (value: number | null) => void
  setMirrorSelectionEnd: (value: number | null) => void
}) {
  const gestureRef = React.useRef<Gesture | null>(null)
  const lastMouseDownRef = React.useRef<{ at: number; x: number } | null>(null)

  const clearGesture = React.useCallback(() => {
    gestureRef.current = null
  }, [])

  /** Returns the gesture if it should still control the selection,
   *  clearing it lazily once its window has passed. */
  const liveGesture = React.useCallback((): Gesture | null => {
    const gesture = gestureRef.current
    if (!gesture) {
      return null
    }
    const now = Date.now()
    const expired =
      gesture.upAt !== null
        ? now - gesture.upAt > POST_UP_ENFORCE_MS
        : gesture.pointerType !== 'mouse' &&
          !gesture.moved &&
          now - gesture.downAt > LONG_PRESS_MS
    if (expired) {
      gestureRef.current = null
      return null
    }
    return gesture
  }, [])

  const applySelection = React.useCallback(
    (selection: Selection) => {
      const input = inputRef.current
      if (!input) {
        return
      }
      if (gestureRef.current) {
        gestureRef.current.intended = selection
      }
      if (
        input.selectionStart !== selection[0] ||
        input.selectionEnd !== selection[1]
      ) {
        input.setSelectionRange(selection[0], selection[1], selection[2])
      }
      setMirrorSelectionStart(selection[0])
      setMirrorSelectionEnd(selection[1])
      inputMetadataRef.current.prev = [selection[0], selection[1], selection[2]]
    },
    [
      inputRef,
      inputMetadataRef,
      setMirrorSelectionStart,
      setMirrorSelectionEnd,
    ],
  )

  /** Called by the focus listener. Returns true when a pointer gesture
   *  supplied the initial selection (tap-to-focus lands on the tapped slot
   *  instead of the default end-of-value selection). */
  const applySelectionOnFocus = React.useCallback((): boolean => {
    const gesture = liveGesture()
    if (!gesture) {
      return false
    }
    applySelection(gesture.intended)
    return true
  }, [applySelection, liveGesture])

  /** Called by the document selectionchange handler. Returns true when the
   *  gesture's intended selection was re-asserted over a competing native
   *  caret placement (the browser moves the caret at tap-end, after our
   *  handlers already ran). */
  const enforceSelection = React.useCallback(
    (input: HTMLInputElement): boolean => {
      const gesture = liveGesture()
      if (!gesture) {
        return false
      }
      const [start, end] = gesture.intended
      if (input.selectionStart === start && input.selectionEnd === end) {
        return false
      }
      if (
        gesture.pointerType !== 'mouse' &&
        !gesture.moved &&
        gesture.upAt === null
      ) {
        // A still-held touch has applied nothing yet, so a selection that
        // moved on its own here is the platform's long-press machinery
        // engaging (iOS caret loupe, Android handles) — which can happen
        // before the LONG_PRESS_MS cutoff. Hand the gesture over instead
        // of fighting the very interaction the edit menu hangs off of.
        gestureRef.current = null
        return false
      }
      applySelection(gesture.intended)
      return true
    },
    [applySelection, liveGesture],
  )

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLInputElement>) => {
      const container = containerRef.current
      if (e.button !== 0 || !e.isPrimary || !container) {
        return
      }
      const input = e.currentTarget
      const valueLength = input.value.length
      const centers = measureSlotCenters(container, maxLength)
      const slot = nearestSlot(centers, e.clientX, e.clientY)
      const isMouse = e.pointerType === 'mouse'

      let anchor = slot
      let intended = selectionForTap(slot, valueLength, maxLength)

      if (!isMouse && document.activeElement === input) {
        const selStart = input.selectionStart
        const selEnd = input.selectionEnd
        if (
          selStart !== null &&
          selEnd !== null &&
          selEnd - selStart > 1 &&
          slot >= selStart &&
          slot < selEnd
        ) {
          // Tapping inside a multi-slot selection keeps it, matching the
          // native "tap the selection to show the edit menu" gesture. This
          // is the only route to copy/cut/paste after a drag-made range: a
          // programmatic selection never auto-presents the menu, and the
          // drag's movement has already defeated the long-press recognizer
          // for that touch. Dragging still re-anchors from the tapped slot.
          intended = [selStart, selEnd, input.selectionDirection ?? 'none']
        }
      }

      if (isMouse) {
        const now = Date.now()
        const prev = inputMetadataRef.current.prev
        const lastDown = lastMouseDownRef.current
        lastMouseDownRef.current = { at: now, x: e.clientX }

        if (
          e.shiftKey &&
          document.activeElement === input &&
          prev[0] !== null &&
          prev[1] !== null
        ) {
          // Shift-click extends the current selection, like a text field
          anchor = slot >= prev[0] ? prev[0] : Math.max(0, prev[1] - 1)
          intended = selectionForDrag(anchor, slot, valueLength)
        } else if (
          lastDown &&
          now - lastDown.at < DOUBLE_CLICK_MS &&
          Math.abs(e.clientX - lastDown.x) <= DOUBLE_CLICK_SLOP_PX &&
          valueLength > 0
        ) {
          intended = [0, valueLength, 'forward']
        }
      }

      gestureRef.current = {
        pointerId: e.pointerId,
        pointerType: e.pointerType,
        downAt: Date.now(),
        downX: e.clientX,
        downY: e.clientY,
        centers,
        anchor,
        lastSlot: slot,
        moved: false,
        active: true,
        upAt: null,
        intended,
      }

      if (isMouse) {
        // Suppress the native mousedown defaults (focus + text-selection
        // drag over the invisible text) and re-implement them: focus stays
        // but the selection maps to slots. Touch is left untouched so
        // native focus, scrolling and long-press menus keep working.
        e.preventDefault()
        try {
          input.setPointerCapture(e.pointerId)
        } catch {
          // Losing capture only means the drag stops updating once the
          // pointer leaves the input — never worth throwing for.
        }
        if (document.activeElement !== input) {
          input.focus()
        } else {
          applySelection(intended)
        }
      }
    },
    [applySelection, containerRef, inputMetadataRef, maxLength],
  )

  // Backup for browsers where canceling pointerdown does not suppress the
  // compatibility mousedown's default actions (focus + selection drag).
  const onMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      const gesture = gestureRef.current
      if (gesture && gesture.active && gesture.pointerType === 'mouse') {
        e.preventDefault()
      }
    },
    [],
  )

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLInputElement>) => {
      const gesture = gestureRef.current
      if (!gesture || !gesture.active || e.pointerId !== gesture.pointerId) {
        return
      }
      const input = e.currentTarget

      if (!gesture.moved) {
        const slop =
          gesture.pointerType === 'mouse' ? MOUSE_SLOP_PX : TOUCH_SLOP_PX
        const dx = e.clientX - gesture.downX
        const dy = e.clientY - gesture.downY
        if (dx * dx + dy * dy < slop * slop) {
          return
        }
        if (
          gesture.pointerType !== 'mouse' &&
          Date.now() - gesture.downAt > LONG_PRESS_MS
        ) {
          // First movement only after the long-press threshold: this is
          // the native caret loupe / selection-handle drag, not a slot
          // drag. Hand the gesture over untouched.
          gestureRef.current = null
          return
        }
        gesture.moved = true
        if (document.activeElement !== input) {
          // A touch drag never produces the click that would focus the
          // input natively — claim focus so the selection is visible.
          input.focus()
        }
      }

      const slot = nearestSlot(gesture.centers, e.clientX, e.clientY)
      if (slot === gesture.lastSlot) {
        return
      }
      gesture.lastSlot = slot
      const selection = selectionForDrag(
        gesture.anchor,
        slot,
        input.value.length,
      )
      if (document.activeElement === input) {
        applySelection(selection)
      } else {
        // Focus was refused (possible on iOS outside a tap) — remember the
        // range so the focus listener can apply it when focus arrives.
        gesture.intended = selection
      }
    },
    [applySelection],
  )

  const onPointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLInputElement>) => {
      const gesture = gestureRef.current
      if (!gesture || e.pointerId !== gesture.pointerId) {
        return
      }
      const input = e.currentTarget

      if (gesture.pointerType === 'mouse') {
        // Native defaults were prevented, so there is nothing to enforce
        // after release.
        gestureRef.current = null
        return
      }

      const now = Date.now()
      if (!gesture.moved && now - gesture.downAt > LONG_PRESS_MS) {
        // Long-press release: the native edit menu is presenting — leave
        // the selection exactly where the platform put it.
        gestureRef.current = null
        return
      }

      gesture.active = false
      gesture.upAt = now
      if (document.activeElement === input) {
        // Tap: select the tapped slot. Selection is deferred to release on
        // touch so that a scroll starting on the input never moves it.
        applySelection(gesture.intended)
      } else if (gesture.moved) {
        // Drag on an unfocused input: no native click → no native focus.
        // The focus listener applies the dragged range.
        input.focus()
      }
      // Tap on an unfocused input: the native click focuses it right after
      // this event, and the focus listener applies the tapped slot.
    },
    [applySelection],
  )

  const onPointerCancel = React.useCallback(
    (e: React.PointerEvent<HTMLInputElement>) => {
      const gesture = gestureRef.current
      if (gesture && e.pointerId === gesture.pointerId) {
        // The browser claimed the gesture (scroll) — nothing was applied
        // for touch taps yet, so bailing out leaves no trace.
        gestureRef.current = null
      }
    },
    [],
  )

  return React.useMemo(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onMouseDown,
      applySelectionOnFocus,
      enforceSelection,
      clearGesture,
    }),
    [
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onMouseDown,
      applySelectionOnFocus,
      enforceSelection,
      clearGesture,
    ],
  )
}
