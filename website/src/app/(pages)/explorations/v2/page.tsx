'use client'

import * as React from 'react'

export default function OtherPage() {
  const [value, setValue] = React.useState<string>('123456')

  return (
    <div className="flex flex-col w-full h-full items-center justify-center !text-black">
      <CustomInput />
      <input />
      {/* <InputEngine value={value} setValue={setValue} maxLength={6} />
      <InputEngine
        value={value}
        setValue={setValue}
        maxLength={6}
        allowNavigation={false}
      /> */}
    </div>
  )
}

// Multiple inputs/div[contenteditable] exploration
function CustomInput() {
  // Should come as props
  const [value, setValue] = React.useState<string>('123456')
  const maxLength = 6

  // State, ref and memo

  // Effects

  // Handlers

  // Pre-render calculations
  const slots = Array.from({ length: maxLength }, (_, i) => i)

  const firstEmptySlotIdx = slots.findIndex((_, idx) => value[idx] === undefined || value[idx] === null)
  const currentSlot = firstEmptySlotIdx === -1 ? 0 : firstEmptySlotIdx
  
  // Render
  return (
    <div className="flex gap-1" role="textbox">
      {slots.map(item => (
        <input
          key={item}
          tabIndex={currentSlot === item ? 0 : -1}
          className="bg-white w-10 h-14"
          role="none"
        />
      ))}
    </div>
  )
}

type SelectionValue = number | null
type Selection = [SelectionValue, SelectionValue]

type Metadata = {
  latestInputSelection: Selection
}

type InputProps = {
  value: string
  // Caveat: setValue won't trigger native input.onChange, it only sets the state
  setValue: (value: string) => void

  maxLength: number
  allowNavigation?: boolean
}
/**
 * Caveats:
 * - The `setValue` function won't trigger native input.onChange event as it's only a state setter
 * - NEVER directly use `input.setSelectionRange(...)` as it will not clamp the selection range, always use `setInputSelectionRange` instead
 *
 * Rules:
 *
 * Desired behavior:
 * - When the input is not focused, the uiSelection is `[null,null]`
 * - When the input is focused and ready, the uiSelection is never `[null,null]`
 * - When `isReady===false`, the input is NEVER modifiable by user native trusted events
 */
const InputEngine = React.forwardRef<HTMLInputElement, InputProps>(
  ({ value, setValue, maxLength, allowNavigation = true, ...props }, ref) => {
    /** States, Refs and Memos */
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(
      ref,
      () => {
        const el = inputRef.current as HTMLInputElement

        const _select = el.select.bind(el)
        el.select = () => {
          if (!allowNavigation) {
            return
          }

          console.log('selecting')

          _select()
          // Proxy to update the caretData
          updateMirror([0, el.value.length])
        }
        return el
      },
      [allowNavigation],
    )
    // Is the input ready to be used by the user?
    const [isReady, setIsReady] = React.useState<boolean>(false)
    // Shouldn't be used for any logic. Used for UI rendering purposes only.
    const [mirror, updateMirror] = React.useState<Selection>([null, null])
    const metadata = React.useRef<Metadata>({
      latestInputSelection: [null, null],
    })

    /** Effects */

    /** Utils */
    const setInputSelectionRange = React.useCallback(
      (start: SelectionValue, end: SelectionValue, newValue?: string) =>
        inputRef.current
          ? _setClampedSelectionRange(
              inputRef.current,
              start,
              end,
              maxLength,
              newValue ?? value,
            )
          : void 0,
      [maxLength, value],
    )

    const handleSelection = React.useCallback(
      (sel: Selection, newValue?: string) => {
        if (!inputRef.current) {
          return
        }

        if (sel[0] === null || sel[1] === null) {
          return
        }

        if (!allowNavigation && Math.abs(sel[0] - sel[1]) > 1) {
          console.log('should prevent selection')
          setInputSelectionRange(value.length - 1, value.length)
        }
        const isEventZeroSelection = sel[0] === sel[1]

        if (isEventZeroSelection && sel[0] !== null && sel[1] !== null) {
          const caretPosition = sel[0]

          // console.log({ caretPosition, maxLength })

          if (value.length === 0) {
            // Do nothing
          } else if (caretPosition === maxLength) {
            setInputSelectionRange(maxLength - 1, maxLength, newValue)
          } else if (
            caretPosition === value.length &&
            caretPosition < maxLength
          ) {
            // Do nothing
          } else if (caretPosition === 0) {
            setInputSelectionRange(0, 1, newValue)
          } else {
            const prevSel = metadata.current.latestInputSelection
            if (prevSel) {
              const isLeftDirection = caretPosition === prevSel[0]
              if (isLeftDirection) {
                setInputSelectionRange(caretPosition - 1, caretPosition)
              } else {
                setInputSelectionRange(caretPosition, caretPosition + 1)
              }
            }
          }

          setIsReady(true)
          updateMirror([
            inputRef.current.selectionStart,
            inputRef.current.selectionEnd,
          ])
        }
      },
      [maxLength, setInputSelectionRange, value.length],
    )

    function forceRecalculateSelection() {
      inputRef.current &&
        handleSelection([
          inputRef.current.selectionStart,
          inputRef.current.selectionEnd,
        ])
    }

    /** Handlers */
    function handleInputKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {}
    function handleInputKeyDown(e: React.KeyboardEvent) {
      console.log(e.key)
      if (SPECIAL_KEYS.includes(e.key)) {
        setIsReady(false)
        syncTimeoutWorkaround(forceRecalculateSelection)
      }

      if (!allowNavigation && NAVIGATION_KEYS.includes(e.key)) {
        e.preventDefault()
      }
    }
    function handleInputSelect(e: React.SyntheticEvent<HTMLInputElement>) {
      const eventSel: Selection = [
        e.currentTarget.selectionStart,
        e.currentTarget.selectionEnd,
      ]

      handleSelection(eventSel)

      // Update metadata
      metadata.current.latestInputSelection = eventSel
    }
    function handleInputFocus(e: React.FocusEvent<HTMLInputElement>) {
      setIsReady(false)
      setInputSelectionRange(value.length - 1, value.length)
      setIsReady(true)
    }
    function handleInputBlur(e: React.FocusEvent<HTMLInputElement>) {}
    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
      const isInserting = e.target.value.length > value.length

      e.preventDefault()

      if (isReady) {
        const newValue = e.target.value.slice(0, maxLength)

        const regexp = /.*/ // TODO: use props.regex
        const tested = regexp.test(newValue)

        if (tested) {
          setIsReady(false)
          setValue(newValue)
        }
      } else {
        // Do nothing
      }
    }

    React.useEffect(() => {
      if (!inputRef.current) {
        return
      }

      handleSelection(
        [inputRef.current.selectionStart, inputRef.current.selectionEnd],
        value,
      )
    }, [handleSelection, value])

    /** Render */
    return (
      <input
        // Visual
        className="w-1/2 h-12"
        // Ref
        ref={inputRef}
        // Props
        value={value}
        maxLength={maxLength}
        // Events
        onChange={handleInputChange}
        onSelect={handleInputSelect}
        onKeyDown={handleInputKeyDown}
        onKeyUp={handleInputKeyUp}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
    )
  },
)
InputEngine.displayName = 'InputEngine'

function IsolatedInput() {}

/** Util Fns */
function _setClampedSelectionRange(
  input: HTMLInputElement,
  start: SelectionValue,
  end: SelectionValue,
  maxLength: number,
  newValue: string,
) {
  if (start === null || end === null) {
    input.setSelectionRange(null, null)
    return
  }

  const clampedStart = Math.max(0, start)
  const clampedEnd = Math.min(newValue.length, end, maxLength)

  input.setSelectionRange(clampedStart, clampedEnd)
}

function syncTimeoutWorkaround<T extends Function>(fn: T): number[] {
  const TIMES_MS = [1, 5, 2_0, 5_0]

  return TIMES_MS.map(time => setTimeout(fn, time))
}

const NAVIGATION_KEYS = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
]
const MODIFIER_KEYS = ['Ctrl', 'Shift', 'Alt']
const SPECIAL_KEYS = [...NAVIGATION_KEYS, ...MODIFIER_KEYS]
