/** Types */

interface InputOTPMetadata {
  prev: [number | null, number | null, 'none' | 'forward' | 'backward']
  isIOS: boolean
}
type HTMLInputElementWithMetadata<S extends symbol> = HTMLInputElement &
  Record<S, InputOTPMetadata>
interface MountProps {
  /** Props */
  container: HTMLDivElement
  input: HTMLInputElement
  maxLength: number
  regexp?: RegExp

  /** Params */
  setValue: (value: string) => void

  /** State/mirror setters */
  setMirrorSelectionStart: (value: number | null) => void
  setMirrorSelectionEnd: (value: number | null) => void
  setMirrorFocused: (value: boolean) => void
  setMirrorHovering: (value: boolean) => void

  isReact: boolean
}

/** Lifecycle */

function mount(initialProps: MountProps) {
  const symbol = Symbol('input-otp--metadata')

  /** Props */

  let props = initialProps as typeof initialProps & {
    input: HTMLInputElementWithMetadata<typeof symbol>
  }
  function updateProps(partialProps: Partial<MountProps>) {
    props = Object.assign(props, partialProps)
  }

  /**
   * Metadata setup
   */
  if (!props.input[symbol]) {
    props.input[symbol] = {
      prev: [
        props.input.selectionStart,
        props.input.selectionEnd,
        props.input.selectionDirection,
      ],
      isIOS:
        typeof window !== 'undefined' &&
        window?.CSS?.supports('-webkit-touch-callout', 'none'),
    }
  }
  const m = props.input[symbol]

  /** Handler Fns */
  function onDocumentSelectionChange() {
    if (document.activeElement !== props.input) {
      props.setMirrorSelectionStart(null)
      props.setMirrorSelectionEnd(null)
      return
    }

    // Aliases
    const _s = props.input.selectionStart
    const _e = props.input.selectionEnd
    const _dir = props.input.selectionDirection
    const _ml = props.input.maxLength
    const _val = props.input.value
    const _prev = m.prev

    // Algorithm
    let start = -1
    let end = -1
    let direction: 'forward' | 'backward' | 'none' = undefined
    if (_val.length !== 0 && _s !== null && _e !== null) {
      const isSingleCaret = _s === _e
      const isInsertMode = _s === _val.length && _val.length < _ml

      if (isSingleCaret && !isInsertMode) {
        const c = _s
        if (c === 0) {
          start = 0
          end = 1
          direction = 'forward'
        } else if (c === _ml) {
          start = c - 1
          end = c
          direction = 'backward'
        } else if (_ml > 2 && _val.length > 2) {
          let offset = 0
          if (_prev[0] !== null && _prev[1] !== null) {
            direction = c < _prev[1] ? 'backward' : 'forward'
            const wasPreviouslyInserting =
              _prev[0] === _prev[1] && _prev[0] < _ml
            if (direction === 'backward' && !wasPreviouslyInserting) {
              offset = -1
            }
          }

          start = offset + c
          end = offset + c + 1
        }
      }

      if (start !== -1 && end !== -1 && start !== end) {
        props.input.setSelectionRange(start, end, direction)
      }
    }

    // Finally, update the state
    const s = start !== -1 ? start : _s
    const e = end !== -1 ? end : _e
    const dir = direction ?? _dir
    props.setMirrorSelectionStart(s)
    props.setMirrorSelectionEnd(e)
    // Store the previous selection value
    m.prev = [s, e, dir]
  }
  function onChangeReact(e: Event) {
    // TODO: debounce this
    setTimeout(() => {
      // Forcefully remove :autofill state by dispatching a synthetic 'input' event
      props.input?.dispatchEvent(new Event('input'))
    }, 100)

    const target = e.target as HTMLInputElement
    const newValue = target.value.slice(0, props.maxLength)
    if (newValue.length > 0 && props.regexp && !props.regexp.test(newValue)) {
      e.preventDefault()
      return
    }
    props.setValue(newValue)
  }
  function onMouseOver() {
    props.setMirrorHovering(true)
  }
  function onMouseLeave() {
    props.setMirrorHovering(false)
  }
  function onFocus() {
    if (props.input) {
      const start = Math.min(props.input.value.length, props.maxLength - 1)
      const end = props.input.value.length
      props.input.setSelectionRange(start, end)
      props.setMirrorSelectionStart(start)
      props.setMirrorSelectionEnd(end)
    }
    props.setMirrorFocused(true)

    setTimeout(() => {
      const s = props.input?.selectionStart
      const e = props.input?.selectionEnd
      const dir = props.input?.selectionDirection
      if (s !== null && e !== null) {
        props.setMirrorSelectionStart(s)
        props.setMirrorSelectionEnd(e)
        m.prev = [s, e, dir]
      }
    }, 50)
  }
  function onBlur() {
    props.setMirrorFocused(false)
  }
  // Fix iOS pasting
  function onPaste(e: ClipboardEvent) {
    if (!m.isIOS || !e.clipboardData) {
      return
    }

    const content = e.clipboardData.getData('text/plain')
    e.preventDefault()

    const start = props.input.selectionStart
    const end = props.input.selectionEnd

    const isReplacing = start !== end

    const newValueUncapped = isReplacing
      ? props.input.value.slice(0, start) +
        content +
        props.input.value.slice(end) // Replacing
      : props.input.value.slice(0, start) +
        content +
        props.input.value.slice(start) // Inserting
    const newValue = newValueUncapped.slice(0, props.maxLength)

    if (newValue.length > 0 && props.regexp && !props.regexp.test(newValue)) {
      return
    }

    props.input.value = newValue
    props.setValue(newValue)

    const _start = Math.min(newValue.length, props.maxLength - 1)
    const _end = newValue.length

    props.input.setSelectionRange(_start, _end)
    props.setMirrorSelectionStart(_start)
    props.setMirrorSelectionEnd(_end)
  }

  /** Attach */
  document.addEventListener('selectionchange', onDocumentSelectionChange, {
    capture: true,
  })
  !initialProps.isReact && props.input.addEventListener('input', onChangeReact)
  props.input.addEventListener('mouseover', onMouseOver)
  props.input.addEventListener('mouseleave', onMouseLeave)
  props.input.addEventListener('focus', onFocus)
  props.input.addEventListener('blur', onBlur)
  props.input.addEventListener('paste', onPaste)

  /** Setup */
  let resizeObserver: ResizeObserver

  // TODO: perf benchmark with setTimeout(...,0)
  // TODO: test without requestAnimationFrame or setTimeout, without a wrapper at all
  requestAnimationFrame(() => {
    // Set initial mirror state
    onDocumentSelectionChange()
    document.activeElement === props.input && props.setMirrorFocused(true)
    ensureDocumentStyles()

    resizeObserver = createResizeObserver(props.container, props.input)
  })

  // TODO: setup badge detection

  /** Detach/cleanup */
  function unmount() {
    document.removeEventListener('selectionchange', onDocumentSelectionChange, {
      capture: true,
    })

    resizeObserver?.disconnect()
    !initialProps.isReact && props.input?.removeEventListener('input', onChangeReact)
    props.input?.removeEventListener('focus', onFocus)
    props.input?.removeEventListener('paste', onPaste)
  }

  return {
    unmount,
    updateProps,
    react: { onChange: onChangeReact },
  }
}

function ensureDocumentStyles() {
  if (!document.getElementById('input-otp-style')) {
    const styleEl = document.createElement('style')
    styleEl.id = 'input-otp-style'
    document.head.appendChild(styleEl)

    if (styleEl.sheet) {
      const autofillStyles =
        'background: transparent !important; text: transparent !important; border-color: transparent !important; opacity: 0 !important; box-shadow: none !important; -webkit-box-shadow: none !important; -webkit-text-fill-color: transparent !important;'

      safeInsertRule(
        styleEl.sheet,
        '[data-input-otp]::selection { background: transparent !important; }',
      )
      safeInsertRule(
        styleEl.sheet,
        `[data-input-otp]:autofill { ${autofillStyles} }`,
      )
      safeInsertRule(
        styleEl.sheet,
        `[data-input-otp]:-webkit-autofill { ${autofillStyles} }`,
      )
      // iOS
      safeInsertRule(
        styleEl.sheet,
        `@supports (-webkit-touch-callout: none) { [data-input-otp] { letter-spacing: -.6em !important; font-weight: 100 !important; font-stretch: ultra-condensed; font-optical-sizing: none !important; left: -1px !important; right: 1px !important; } }`,
      )
      // PWM badges
      safeInsertRule(
        styleEl.sheet,
        `[data-input-otp] + * { pointer-events: all !important; }`,
      )
    }
  }
}

function createResizeObserver(
  container: HTMLDivElement,
  input: HTMLInputElement,
) {
  // Track root height
  const updateRootHeight = () => {
    if (container) {
      container.style.setProperty('--root-height', `${input.clientHeight}px`)
    }
  }
  updateRootHeight()
  const resizeObserver = new ResizeObserver(updateRootHeight)
  resizeObserver.observe(input)
  return resizeObserver
}

/** Util */

function safeInsertRule(sheet: CSSStyleSheet, rule: string) {
  try {
    sheet.insertRule(rule)
  } catch {
    console.error('input-otp could not insert CSS rule:', rule)
  }
}

/** Misc */

// Decided to go with <noscript>
// instead of `scripting` CSS media query
// because it's a fallback for initial page load
// and the <script> tag won't be loaded
// unless the user has JS disabled.
const NOSCRIPT_CSS_FALLBACK = `
[data-input-otp] {
  --nojs-bg: white !important;
  --nojs-fg: black !important;

  background-color: var(--nojs-bg) !important;
  color: var(--nojs-fg) !important;
  caret-color: var(--nojs-fg) !important;
  letter-spacing: .25em !important;
  text-align: center !important;
  border: 1px solid var(--nojs-fg) !important;
  border-radius: 4px !important;
  width: 100% !important;
}
@media (prefers-color-scheme: dark) {
  [data-input-otp] {
    --nojs-bg: black !important;
    --nojs-fg: white !important;
  }
}`

/** Exports */

export { mount, NOSCRIPT_CSS_FALLBACK }
