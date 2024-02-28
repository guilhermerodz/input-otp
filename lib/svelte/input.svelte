<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import type { FormEventHandler, HTMLInputAttributes } from 'svelte/elements'
  import { onBeforeUnmount } from 'vue'
  import {
    REGEXP_ONLY_DIGITS,
    onMount as coreOnMount,
    type RenderProps,
    type SlotProps,
  } from '../core'
  import { withPrevious } from './svelte-previous'

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

  interface $$Slots {
    default: {
      slots: SlotProps[]
      'is-focused': RenderProps['isFocused']
      'is-hovering': RenderProps['isHovering']
    }
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

  const [currentValue, previousValue] = withPrevious(value)
  $: $currentValue = value

  // on complete effect
  $: if (
    value !== undefined &&
    value !== null &&
    value.length === maxlength &&
    value !== $previousValue &&
    ($previousValue !== null && $previousValue !== undefined
      ? $previousValue.length !== maxlength
      : true)
  ) {
    dispatch('complete', value)
  }

  /** Fns */
  function onChange(newValue: string) {
    value = newValue
  }

  const inputHandler: FormEventHandler<HTMLInputElement> = e => {
    const input = e.currentTarget as HTMLInputElement
    if (!input) {
      return
    }
    const newValue = input.value.slice(0, maxlength)
    if (newValue.length !== 0 && regexp && !regexp.test(newValue)) {
      if ($previousValue !== undefined) {
        value = $previousValue!
      }
    }
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
    {disabled}
    {autocomplete}
    {inputmode}
    {maxlength}
  />
</div>
