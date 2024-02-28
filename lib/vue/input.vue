<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { REGEXP_ONLY_DIGITS } from '../core/regexp'

import { changeListener, onMount } from '.'
import type { VueOTPInputProps } from './types'

defineOptions({
  name: 'OTPInput',
  inheritAttrs: false,
})

const {
  // Props
  maxlength,
  pattern = REGEXP_ONLY_DIGITS,
  inputmode = 'numeric',

  containerClass,

  // HTML defaults
  autocomplete = 'one-time-code',

  ...props
} = withDefaults(defineProps<VueOTPInputProps>(), {
  pattern: REGEXP_ONLY_DIGITS,
  inputmode: 'numeric',
})

const emit = defineEmits<{
  (event: 'complete', value: string): void
}>()

const value = defineModel({ default: '' })

/** Workarounds */
const onChange = (newValue: string) => {
  value.value = newValue
}
const regexp = computed(() =>
  pattern
    ? typeof pattern === 'string'
      ? new RegExp(pattern)
      : pattern
    : undefined,
)

/** Refs */
const containerRef = ref<HTMLDivElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
defineExpose({ ref: inputRef })

/** Mirror State for children-rendering-only purpose */
const mirrorHovering = ref(false)
const mirrorFocused = ref(false)
const mirrorSel = ref<[number, number]>([-1, -1])

onMounted(() => {
  const container = containerRef.value
  const input = inputRef.value
  if (!container || !input) {
    return
  }

  const mounted = onMount({
    container,
    input,
    maxLength: maxlength,
    onChange,
    regexp: regexp.value,
    updateMirror: (k, v) => {
      if (k === 'data-sel' && v !== undefined) {
        const [s, e] = v.split(',').map(Number)
        mirrorSel.value = [s, e]
      }
      if (k === 'data-is-focused') {
        mirrorFocused.value = Boolean(v)
      }
      if (k === 'data-is-hovering') {
        mirrorHovering.value = Boolean(v)
      }
    },
  })

  onUnmounted(() => {
    mounted.unmount()
  })
})

watch(
  [() => maxlength, value],
  ([maxlength, value], [_, previousValue]) => {
    if (previousValue === undefined) return

    if (
      value !== previousValue &&
      previousValue.length < maxlength &&
      value.length === maxlength
    )
      emit('complete', value)
  },
  { immediate: true },
)

const slots = computed(() => {
  return Array.from({ length: maxlength }).map((_, slotIdx) => {
    const isActive =
      mirrorFocused.value &&
      mirrorSel.value[0] !== null &&
      mirrorSel.value[1] !== null &&
      ((mirrorSel.value[0] === mirrorSel.value[1] &&
        slotIdx === mirrorSel.value[0]) ||
        (slotIdx >= mirrorSel.value[0] && slotIdx < mirrorSel.value[1]))

    const char =
      value.value[slotIdx] !== undefined ? value.value[slotIdx] : null

    return {
      char,
      isActive,
      hasFakeCaret: isActive && char === null,
    }
  })
})

const inputStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  textAlign: 'start',
  opacity: '1', // Mandatory for iOS hold-paste
  color: 'transparent',
  pointerEvents: 'all',
  background: 'transparent',
  caretColor: 'transparent',
  border: '0 solid transparent',
  outline: '0 solid transparent',
  lineHeight: '1',
  letterSpacing: '-.5em',
  fontSize: 'var(--root-height)',
} satisfies CSSProperties
</script>

<template>
  <div
    data-input-otp-container
    ref="containerRef"
    :style="{
      position: 'relative',
      userSelect: 'none',
      cursor: disabled ? 'default' : 'text',
    }"
    :class="containerClass"
  >
    <slot
      :slots="slots"
      :is-focused="mirrorFocused"
      :is-hovering="!disabled && mirrorHovering"
    />

    <input
      v-bind="{ ...$attrs, ...props }"
      :autocomplete="autocomplete"
      data-input-otp
      ref="inputRef"
      :style="inputStyle"
      :maxlength="maxlength"
      :value="value"
    />
  </div>
</template>
