import type {
  EventToListenerMap,
  HTMLInputElementWithMetadata,
} from './internal/types'
import { SelectionType } from './types'
import type { ContainerAttributes } from './types'

type ChangeEvent = Event & {
  currentTarget: { value: string }
  preventDefault: () => void
}

function setValue(params: {
  event: ChangeEvent
  onChange: (value: string) => void
  maxLength: number
  regexp?: RegExp
}) {
  const input = params.event.currentTarget as HTMLInputElementWithMetadata
  const newValue = input.value.slice(0, params.maxLength)
  if (newValue.length > 0 && params.regexp && !params.regexp?.test(newValue)) {
    params.event.preventDefault()
    return
  }
  params.onChange(newValue)
}

export function onMount({
  container,
  input,
  maxLength,
  regexp,
  onChange,
  updateMirror,
}: {
  container: HTMLElement
  input: HTMLInputElementWithMetadata
  maxLength: number
  onChange: (value: string) => void
  regexp?: RegExp
  updateMirror: <
    K extends keyof ContainerAttributes,
    V extends ContainerAttributes[K],
  >(
    key: K,
    value: V,
  ) => void
}) {
  function mutateAttribute<
    K extends keyof ContainerAttributes,
    V extends ContainerAttributes[K],
  >(k: K, v: V) {
    if (v === null || v === undefined) {
      container.removeAttribute(k)
    } else {
      container.setAttribute(k, v)
    }
    updateMirror(k, v)
  }
  function _selectListener() {
    const _start = input.selectionStart
    const _end = input.selectionEnd
    const isSelected = _start !== null && _end !== null

    if (input.value.length !== 0 && isSelected) {
      const isSingleCaret = _start === _end
      const isInsertMode =
        _start === input.value.length && input.value.length < maxLength

      if (isSingleCaret && !isInsertMode) {
        const caretPos = _start

        let start = -1
        let end = -1

        if (caretPos === 0) {
          start = 0
          end = 1
        } else if (caretPos === input.value.length) {
          start = input.value.length - 1
          end = input.value.length
        } else {
          start = caretPos
          end = caretPos + 1
        }

        if (start !== -1 && end !== -1) {
          input.setSelectionRange(start, end, 'backward')
        }
      }
    }

    syncTimeouts(() => {
      mutateAttribute(
        'data-sel',
        String(input.selectionStart ?? -1) +
          ',' +
          String(input.selectionEnd ?? -1),
      )
    })
  }
  function _mouseOverListener() {
    mutateAttribute('data-is-hovering', 'true')
  }
  function _mouseLeaveListener() {
    mutateAttribute('data-is-hovering', undefined)
  }
  function _keydownListener(e: KeyboardEvent) {
    const inputSel = [input.selectionStart, input.selectionEnd]
    if (inputSel[0] === null || inputSel[1] === null) {
      return
    }

    let selectionType: SelectionType
    if (inputSel[0] === inputSel[1]) {
      selectionType = SelectionType.CARET
    } else if (inputSel[1] - inputSel[0] === 1) {
      selectionType = SelectionType.CHAR
    } else if (inputSel[1] - inputSel[0] > 1) {
      selectionType = SelectionType.MULTI
    } else {
      throw new Error('Could not determine OTPInput selection type')
    }

    if (
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'ArrowUp' ||
      e.key === 'ArrowDown' ||
      e.key === 'Home' ||
      e.key === 'End'
    ) {
      if (
        e.key === 'ArrowLeft' &&
        selectionType === SelectionType.CHAR &&
        !e.shiftKey &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault()

        const start = Math.max(inputSel[0] - 1, 0)
        const end = Math.max(inputSel[1] - 1, 1)

        input.setSelectionRange(start, end)
      }

      if (
        e.altKey &&
        !e.shiftKey &&
        (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
      ) {
        e.preventDefault()

        if (e.key === 'ArrowLeft') {
          input.setSelectionRange(0, Math.min(1, input.value.length))
        }
        if (e.key === 'ArrowRight') {
          input.setSelectionRange(
            Math.max(0, input.value.length - 1),
            input.value.length,
          )
        }
      }
    }
  }
  function _keyupListener() {
    syncTimeouts(_selectListener)
  }
  function _clickListener() {
    input.__metadata__ = Object.assign({}, input.__metadata__, {
      lastClickTimestamp: Date.now(),
    })
  }
  function _dblclickListener() {
    const lastClickTimestamp = input.__metadata__?.lastClickTimestamp

    const isFocusing = document.activeElement === input
    if (
      lastClickTimestamp !== undefined &&
      isFocusing &&
      Date.now() - lastClickTimestamp <= 300 // Fast enough click
    ) {
      input.setSelectionRange(0, input.value.length)
      syncTimeouts(_selectListener)
    }
  }
  // Fix iOS pasting
  function _pasteListener(e: ClipboardEvent) {
    const start = input.selectionStart
    const end = input.selectionEnd

    if (!e.clipboardData) {
      return
    }
    if (start === null || end === null) {
      return
    }

    const content = e.clipboardData.getData('text/plain')
    e.preventDefault()

    const isReplacing = start !== end

    const newValueUncapped = isReplacing
      ? input.value.slice(0, start) + content + input.value.slice(end) // Replacing
      : input.value.slice(0, start) + content + input.value.slice(start) // Inserting
    const newValue = newValueUncapped.slice(0, maxLength)

    if (newValue.length > 0 && regexp && !regexp.test(newValue)) {
      return
    }

    onChange(newValue)

    const _start = Math.min(newValue.length, maxLength - 1)
    const _end = newValue.length
    input.setSelectionRange(_start, _end)
    mutateAttribute('data-sel', String(_start) + ',' + String(_end))
  }
  // function _inputListener() {
  //   syncTimeouts(_selectListener)
  // }
  function _inputListener(event: ChangeEvent) {
    setValue({
      event,
      onChange,
      regexp,
      maxLength,
    })
    syncTimeouts(_selectListener)
  }
  function _focusListener() {
    const start = Math.min(input.value.length, maxLength - 1)
    const end = input.value.length
    input.setSelectionRange(start, end)
    mutateAttribute('data-sel', String(start ?? -1) + ',' + String(end ?? -1))
    mutateAttribute('data-is-focused', 'true')

    // Run improved selection tracking while focused
    const interval = setInterval(() => {
      if (document.activeElement === input) {
        mutateAttribute(
          'data-sel',
          String(input.selectionStart ?? -1) +
            ',' +
            String(input.selectionEnd ?? -1),
        )
      } else {
        clearInterval(interval)
      }
    }, 50)
  }
  function _blurListener() {
    mutateAttribute('data-is-focused', undefined)
  }
  function _touchMoveOrEndListener() {
    const isFocusing = document.activeElement === input
    if (isFocusing) {
      setTimeout(() => {
        _selectListener()
      }, 50)
    }
  }

  const eventToListenerMap = {
    select: _selectListener,
    mouseover: _mouseOverListener,
    mouseenter: _mouseOverListener,
    mouseout: _mouseLeaveListener,
    mouseleave: _mouseLeaveListener,
    keydown: _keydownListener,
    keyup: _keyupListener,
    click: _clickListener,
    dblclick: _dblclickListener,
    paste: _pasteListener,
    // @ts-expect-error
    input: _inputListener,
    focus: _focusListener,
    blur: _blurListener,
    touchend: _touchMoveOrEndListener,
    touchmove: _touchMoveOrEndListener,
  } satisfies EventToListenerMap

  for (const [event, listener] of Object.entries(eventToListenerMap)) {
    input.addEventListener(
      event as any,
      listener as any,
      event === 'input' ? { capture: true } : undefined,
    )
  }

  if (!document.getElementById('input-otp-style')) {
    const styleEl = document.createElement('style')
    styleEl.id = 'input-otp-style'
    document.head.appendChild(styleEl)
    styleEl.sheet?.insertRule(
      '[data-input-otp]::selection { background: transparent !important; }',
    )
    styleEl.sheet?.insertRule(
      '[data-input-otp]:autofill { background: transparent !important; text: transparent !important; border-color: transparent !important; opacity: 0 !important; }',
    )
    styleEl.sheet?.insertRule(
      '[data-input-otp]:-webkit-autofill { background: transparent !important; text: transparent !important; border-color: transparent !important; opacity: 0 !important }',
    )
  }

  const updateRootHeight = () => {
    if (input) {
      container.style.setProperty('--root-height', `${input.clientHeight}px`)
    }
  }
  updateRootHeight()
  const resizeObserver = new ResizeObserver(updateRootHeight)
  resizeObserver.observe(input)

  const improvedTrackingTimeout = setTimeout(() => {
    if (input) {
      mutateAttribute(
        'data-sel',
        String(input.selectionStart ?? -1) +
          ',' +
          String(input.selectionEnd ?? -1),
      )
      mutateAttribute(
        'data-is-focused',
        input === document.activeElement ? 'true' : undefined,
      )
    }
  }, 20)

  return {
    unmount: () => {
      for (const [event, listener] of Object.entries(eventToListenerMap)) {
        input.removeEventListener(event as any, listener as any)
      }
      resizeObserver.disconnect()
      clearTimeout(improvedTrackingTimeout)
    },
  }
}

function syncTimeouts(cb: (...args: any[]) => unknown): number[] {
  const t1 = setTimeout(cb, 0) // For faster machines
  const t2 = setTimeout(cb, 1_0)
  const t3 = setTimeout(cb, 5_0)
  return [t1, t2, t3]
}
