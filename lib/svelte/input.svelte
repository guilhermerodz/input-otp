<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import type { HTMLInputAttributes } from 'svelte/elements'

  import {
    REGEXP_ONLY_DIGITS,
    type RenderProps,
    type SlotProps,
  } from '@lib/core'
  import { onMount as coreOnMount } from '@lib/core/internal/input'
  import type { HTMLInputElementWithMetadata } from '@lib/core/internal/types'

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
      input: input as HTMLInputElementWithMetadata,
      metadata: {
        maxLength: maxlength,
        onChange: t => {
          value = t
        },
        onComplete: t => dispatch('complete', t),
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
      },
    })
  })
  onDestroy(() => {
    mounted !== undefined && mounted.unmount()
  })

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
    pattern={regexp?.source}
    {disabled}
    {autocomplete}
    {inputmode}
    {maxlength}
  />
</div>
