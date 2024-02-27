<script setup lang="ts">
import { OTPInput } from '../../../lib/vue'
import Slot from './slot.vue'
</script>

<template>
  <OTPInput
    v-slot="{ slots }"
    :maxlength="6"
    container-class="group flex items-center has-[:disabled]:opacity-30"
  >
    <div class="flex">
      <Slot v-for="(slot, idx) in slots.slice(0, 3)" v-bind="slot" :key="idx" />
    </div>

    <!-- Fake Dash. Inspired by Stripe's MFA input. -->
    <div class="flex w-10 justify-center items-center">
      <div class="w-3 h-1 rounded-full bg-border" />
    </div>

    <div class="flex">
      <Slot v-for="(slot, idx) in slots.slice(3)" v-bind="slot" :key="idx" />
    </div>
  </OTPInput>
</template>
