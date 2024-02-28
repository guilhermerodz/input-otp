import { test, expect } from '@playwright/test'
import { INPUT_NAMES } from './util/constants'

INPUT_NAMES.forEach(inputName => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/base')
    await page.waitForTimeout(200) // Needed for input mount/listeners setup
  })
  test.describe(`[${inputName}] Base tests - Selections`, () => {
    test.skip(
      process.env.CI === 'true',
      'Breaks in CI as it cannot handle Shift key',
    )

    test('should replace selected char if another is pressed', async ({
      page,
    }) => {
      const container = page.locator(
        `[data-input-otp-container]:has([name="${inputName}"])`,
      )
      const input = page.locator(`[name=${inputName}]`)

      await input.focus()
      await input.pressSequentially('123')
      await expect(input).toHaveValue('123')
      await input.press('ArrowLeft')
      await input.press('1')
      await expect(input).toHaveValue('121')
    })
    test('should replace multi-selected chars if another is pressed', async ({
      page,
    }) => {
      const container = page.locator(
        `[data-input-otp-container]:has([name="${inputName}"])`,
      )
      const input = page.locator(`[name=${inputName}]`)

      await input.pressSequentially('123456')
      await input.press('Shift+ArrowLeft')
      await input.press('Shift+ArrowLeft')
      await input.pressSequentially('1')
      await expect(input).toHaveValue('1231')
    })
    test('should replace last char if another one is pressed', async ({
      page,
    }) => {
      const container = page.locator(
        `[data-input-otp-container]:has([name="${inputName}"])`,
      )
      const input = page.locator(`[name=${inputName}]`)

      await input.pressSequentially('123456')
      await input.press('7')
      await expect(input).toHaveValue('123457')
    })
  })
})
