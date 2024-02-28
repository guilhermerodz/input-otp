<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import type { HTMLInputAttributes } from 'svelte/elements'
  import { onBeforeUnmount } from 'vue'
  import {
    REGEXP_ONLY_DIGITS,
    changeListener,
    onMount as coreOnMount,
  } from '../core'
  import { writable } from 'svelte/store'

  interface $$Props extends HTMLInputAttributes {
    value?: string
    oncomplete?: (...args: any[]) => unknown

    // Overriding HTML input props
    autocomplete?: string
    pattern?: string
    disabled?: boolean
    maxlength: number
    inputmode?: 'numeric' | 'text'

    containerClass: string | undefined
  }

  let container: HTMLDivElement
  let input: HTMLInputElement

  /** Attributes */
  export let maxlength: number
  export let pattern = REGEXP_ONLY_DIGITS
  export let inputmode: 'numeric' | 'text' = 'numeric'
  export let autocomplete = 'one-time-code'
  export let disabled = false

  /** Workarounds */
  export let value: string = ''
  let regexp = pattern
    ? typeof pattern === 'string'
      ? new RegExp(pattern)
      : pattern
    : undefined

  /** Props */
  export let containerClass: string | undefined

  /** Mirror State */
  let mirrorFocused = false
  let mirrorHovering = false
  let mirrorSel: [number, number] = [-1, -1]

  let mounted: ReturnType<typeof coreOnMount>
  onMount(() => {
    mounted = coreOnMount({
      container,
      input,
      maxLength: maxlength,
      onChange,
      regexp,
      updateMirror: (k, v) => {
        if (k === 'data-sel' && v !== undefined) {
          const [s, e] = v.split(',').map(Number)
          mirrorSel = [s, e]
        }
        if (k === 'data-is-focused') {
          mirrorFocused = Boolean(v)
        }
        if (k === 'data-is-hovering') {
          mirrorHovering = Boolean(v)
        }
      },
    })
  })

  onBeforeUnmount(() => {
    mounted.unmount()
  })

  let allPreviousValues = [value]
  function getPreviousValue() {
    return allPreviousValues[allPreviousValues.length - 1]
  }

  // TODO: oncomplete
  // let previousValue: string = value
  $: if (value !== getPreviousValue()) {
    if (value.length === maxlength && getPreviousValue().length < maxlength) {
      dispatch('complete', value)
    }
    // previousValue = value
    // allPreviousValues.push(value)
  }

  /** Fns */
  function onChange(newValue: string) {
    value = newValue
  }

  function inputHandler(e: InputEvent) {
    const input = e.currentTarget as HTMLInputElement
    if (!input) {
      return
    }
    if (input.value.length !== 0 && regexp && !regexp.test(input.value)) {
      value = getPreviousValue()
    }
    allPreviousValues = [...allPreviousValues.slice(-2), value]
  }

  const dispatch = createEventDispatcher<{
    // Native events
    input: HTMLElementEventMap['input']

    // Custom events
    complete: string
  }>()

  $: slots = Array.from({ length: maxlength }).map((_, slotIdx) => {
    const isActive =
      mirrorFocused &&
      mirrorSel[0] !== null &&
      mirrorSel[1] !== null &&
      ((mirrorSel[0] === mirrorSel[1] && slotIdx === mirrorSel[0]) ||
        (slotIdx >= mirrorSel[0] && slotIdx < mirrorSel[1]))

    const char = value[slotIdx] !== undefined ? value[slotIdx] : null

    return {
      char,
      isActive,
      hasFakeCaret: isActive && char === null,
    }
  })
</script>

<div
  data-input-otp-container
  bind:this={container}
  style="position: relative; user-select: none; -webkit-user-select: none"
  class={containerClass}
>
  <slot
    {slots}
    is-focused={mirrorFocused}
    is-hovering={!disabled && mirrorHovering}
  />

  <input
    data-input-otp
    style="position: absolute; inset: 0; width: 100%; height: 100%; display: flex; text-align: start; opacity: 1; color: transparent; pointer-events: all; background: transparent; caret-color: transparent; border: 0 solid transparent; outline: 0 solid transparent; line-height: 1; letter-spacing: -.5em; font-size: var(--root-height);"
    {...$$restProps}
    bind:value
    bind:this={input}
    on:input={inputHandler}
    pattern={regexp?.source}
    {autocomplete}
    {inputmode}
    {maxlength}
  />
</div>
