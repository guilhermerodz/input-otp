<script lang="ts">
  import { OTPInput } from '@lib/svelte'
  import Slot from './slot.svelte'

  let value = ''
  let completedOnce: string | undefined = undefined
</script>

<OTPInput
  name="svelte-input"
  data-completed-once={completedOnce}
  bind:value
  on:complete={e => {
    console.count('completing')
    completedOnce = e.detail
  }}
  let:slots
  maxlength={6}
  containerClass="group flex items-center has-[:disabled]:opacity-30"
  {...$$restProps}
>
  <div class="flex">
    {#each slots.slice(0, 3) as slot, idx (idx)}
      <Slot {slot} />
    {/each}
  </div>

  <!-- Fake Dash. Inspired by Stripe's MFA input. -->
  <div class="flex w-10 justify-center items-center">
    <div class="w-3 h-1 rounded-full bg-border" />
  </div>

  <div class="flex">
    {#each slots.slice(3) as slot, idx (idx)}
      <Slot {slot} />
    {/each}
  </div>
</OTPInput>
