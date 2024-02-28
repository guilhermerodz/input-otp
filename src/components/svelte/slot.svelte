<script lang="ts">
  import { cn } from '@/lib/utils'
  import type { SlotProps } from '@lib/core'

  export let slot: SlotProps
</script>

<div
  data-slot
  data-test-char={slot.char}
  class={cn(
    'relative w-10 h-14 text-[2rem]',
    'flex items-center justify-center',
    'transition-all duration-300',
    'border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md',
    'group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20',
    'outline outline-0 outline-accent-foreground/20',
    { 'outline-4 outline-accent-foreground': slot.isActive },
  )}
>
  {#if slot.char !== null}
    <div>
      {slot.char}
    </div>
  {/if}

  <!-- Emulate a Fake Caret -->
  {#if slot.hasFakeCaret}
    <div
      class="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink"
    >
      <div class="w-px h-8 bg-white" />
    </div>
  {/if}
</div>
