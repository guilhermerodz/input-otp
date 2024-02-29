import { expect, test } from '@playwright/test'

import { INPUT_NAMES } from './util/constants'

INPUT_NAMES.forEach(inputName => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/base')
    await page.waitForTimeout(200) // Needed for input mount/listeners setup
  })
  test.describe(`[${inputName}] Base tests - On complete`, () => {
    test('should trigger onComplete function', async ({ page }) => {
      const container = page.locator(
        `[data-input-otp-container]:has([name="${inputName}"])`,
      )
      const input = page.locator(`[name=${inputName}]`)

      await input.focus()
      await input.pressSequentially('123456')
      expect(await input.getAttribute('data-completed-once')).toBe('123456')
    })
  })
})