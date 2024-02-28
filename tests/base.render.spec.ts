import { expect, test } from '@playwright/test'

import { INPUT_NAMES } from '../util/constants'

test.describe.configure({ mode: 'serial' }) // Important
INPUT_NAMES.forEach((inputName) => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/base')
  })
  test.describe(`[${inputName}] Base tests - Render`, () => {
    test('should expose focus flags', async ({ page }) => {
      const container = page.locator(
        `[data-input-otp-container]:has([name="${inputName}"])`,
      )
      const input = page.locator(`[name=${inputName}]`)

      await input.focus()
      expect(input).toBeFocused()
      await page.waitForTimeout(200)
      expect(await container.getAttribute('data-is-focused')).toBe('true')

      await input.blur()
      await page.waitForTimeout(200)
      expect(await container.getAttribute('data-is-focused')).toBe(null)
    })
    test('should expose hover flags', async ({ page }) => {
      const container = page.locator(
        `[data-input-otp-container]:has([name="${inputName}"])`,
      )
      const input = page.locator(`[name=${inputName}]`)

      expect(await container.getAttribute('data-is-hovering')).toBe(null)

      await page.waitForTimeout(200)
      // const _rect = await input.boundingBox({ timeout: 2_000 })
      // expect(_rect).not.toBeNull()
      // const rect = _rect!
      // await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2, { steps: 10 })
      await input.hover()
      await page.waitForTimeout(200)

      expect(await container.getAttribute('data-is-hovering')).toBe('true')
    })
  })
})
