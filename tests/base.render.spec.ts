import { expect, test } from '@playwright/test'

import { INPUT_NAMES } from './util/constants'

INPUT_NAMES.forEach(inputName => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/base')
    await page.waitForTimeout(200) // Needed for input mount/listeners setup
  })
  test.describe(`[${inputName}] Base tests - Render`, () => {
    test('should expose focus flags', async ({ page }) => {
      const container = page.locator(
        `[data-input-otp-container]:has([name="${inputName}"])`,
      )
      const input = page.locator(`[name=${inputName}]`)

      await input.focus()
      expect(input).toBeFocused()
      expect(await container.getAttribute('data-is-focused')).toBe('true')

      await input.blur()
      expect(await container.getAttribute('data-is-focused')).toBe(null)
    })
    test('should expose hover flags', async ({ page }) => {
      const container = page.locator(
        `[data-input-otp-container]:has([name="${inputName}"])`,
      )
      const input = page.locator(`[name=${inputName}]`)

      expect(await container.getAttribute('data-is-hovering')).toBe(null)
      await input.hover()
      expect(await container.getAttribute('data-is-hovering')).toBe('true')
    })
  })
})
