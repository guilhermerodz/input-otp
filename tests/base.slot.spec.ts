import { expect, test } from '@playwright/test'

import { INPUT_NAMES } from './util/constants'

INPUT_NAMES.forEach(inputName => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/base')
    await page.waitForTimeout(200) // Needed for input mount/listeners setup
  })
  test.describe(`[${inputName}] Base tests - Slot`, () => {
    test('should expose the slot props', async ({ page }) => {
      const container = page.locator(
        `[data-input-otp-container]:has([name="${inputName}"])`,
      )
      const input = page.locator(`[name=${inputName}]`)

      const slots = await container.locator('[data-slot]').all()
      const [
        slot1,
        slot2,
        slot3,
        slot4,
        slot5,
        slot6,
      ] = slots
      
      await input.pressSequentially('1')
      await expect(input).toHaveValue('1')
      await expect(slot1).toHaveAttribute('data-test-char', '1')
      await expect(slot2).not.toHaveAttribute('data-test-char')
      await input.pressSequentially('23456')
      await expect(input).toHaveValue('123456')
      await expect(slot2).toHaveAttribute('data-test-char', '2')
      await expect(slot3).toHaveAttribute('data-test-char', '3')
      await expect(slot4).toHaveAttribute('data-test-char', '4')
      await expect(slot5).toHaveAttribute('data-test-char', '5')
      await expect(slot6).toHaveAttribute('data-test-char', '6')
    })
  })
})
