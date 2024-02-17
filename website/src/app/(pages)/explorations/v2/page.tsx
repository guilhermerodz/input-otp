'use client'

import * as React from 'react'

export default function OtherPage() {
  const [value, setValue] = React.useState<string>('123456')

  return (
    <div className="flex flex-col w-full h-full items-center justify-center !text-black">
      <InputEngine value={value} setValue={setValue} maxLength={6} />
      <InputEngine
        value={value}
        setValue={setValue}
        maxLength={6}
        allowNavigation={false}
      />
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
function InputEngine({
  value,
  setValue,
  maxLength,
  allowNavigation = true,
  ...props
}: InputProps) {
  /** States, Refs and Memos */
  const inputRef = React.useRef<HTMLInputElement>(null)
  // Is the input ready to be used by the user?
  const [isReady, setIsReady] = React.useState<boolean>(false)
  // Shouldn't be used for any logic. Used for UI rendering purposes only.
  const [uiSelection, setUiSelection] = React.useState<Selection>([null, null])
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
        setUiSelection([
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
}

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
  const TIMES_MS = [1,5, 2_0, 5_0]

  return TIMES_MS.map((time) => setTimeout(fn, time))
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
