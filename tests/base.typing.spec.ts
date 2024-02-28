import { expect, test } from '@playwright/test'

import { INPUT_NAMES } from './util/constants'

INPUT_NAMES.forEach(inputName => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/base')
    await page.waitForTimeout(200) // Needed for input mount/listeners setup
  })
  test.describe(`[${inputName}] Base tests - Typing`, () => {
    test('should start as empty value', async ({ page }) => {
      const container = page.locator(
        `[data-input-otp-container]:has([name="${inputName}"])`,
      )
      const input = page.locator(`[name=${inputName}]`)

      await expect(input).toHaveValue('')
    })

    test('should change the input value', async ({ page }) => {
      const container = page.locator(
        `[data-input-otp-container]:has([name="${inputName}"])`,
      )
      const input = page.locator(`[name=${inputName}]`)

      await input.pressSequentially('1')
      await expect(input).toHaveValue('1')

      await input.pressSequentially('23456')
      await expect(input).toHaveValue('123456')
    })

    test('should prevent typing greater than max length', async ({ page }) => {
      const container = page.locator(
        `[data-input-otp-container]:has([name="${inputName}"])`,
      )
      const input = page.locator(`[name=${inputName}]`)

      await input.pressSequentially('1234567')
      await expect(input).toHaveValue('123457')
    })
  })
})
