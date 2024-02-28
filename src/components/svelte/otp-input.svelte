<script lang="ts">
  import { OTPInput } from '@lib/svelte'
  import Slot from './slot.svelte'

  let value = ''
</script>

<OTPInput
  name="svelte-input"
  bind:value={value}
  on:complete={value => console.log('completed with value', value)}
  maxlength={6}
  containerClass="group flex items-center has-[:disabled]:opacity-30"
  let:slots
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
