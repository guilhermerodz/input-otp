import { expect, test } from '@playwright/test'

import { INPUT_NAMES } from './util/constants'

INPUT_NAMES.forEach(inputName => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/prop-forwarding')
    await page.waitForTimeout(200) // Needed for input mount/listeners setup
  })
  test.describe(`[${inputName}] Prop forwarding`, () => {
    test('should', async ({ page }) => {
      const container = page.locator(
        `[data-input-otp-container]:has([name="${inputName}"])`,
      )
      const input = page.locator(`[name=${inputName}]`)

      await expect(container).toHaveClass('testclassname')

      await expect(input).toBeDisabled()
      await expect(input).toHaveAttribute('inputmode', 'text')
      await expect(input).toHaveAttribute('maxlength', '3')
      await expect(input).toHaveAttribute('pattern', ' ')
    })
  })
})
