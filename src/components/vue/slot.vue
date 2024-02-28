<script setup lang="ts">
import { cn } from '../../lib/utils'
import type { SlotProps } from '../../../lib/vue'

defineProps<SlotProps>()
</script>

<template>
  <div
    data-slot
    :data-test-char="$props.char"
    :class="
      cn(
        'relative w-10 h-14 text-[2rem]',
        'flex items-center justify-center',
        'transition-all duration-300',
        'border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md',
        'group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20',
        'outline outline-0 outline-accent-foreground/20',
        { 'outline-4 outline-accent-foreground': $props.isActive },
      )
    "
  >
    <div v-if="$props.char !== null">
      {{ $props.char }}
    </div>

    <!-- Emulate a Fake Caret -->
    <div
      v-if="$props.hasFakeCaret"
      className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink"
    >
      <div className="w-px h-8 bg-white" />
    </div>
  </div>
</template>
