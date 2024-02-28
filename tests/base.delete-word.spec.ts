import { expect, test } from '@playwright/test'

import { INPUT_NAMES } from './util/constants'
import { modifier } from './util/modifier'

INPUT_NAMES.forEach(inputName => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/base')
    await page.waitForTimeout(200) // Needed for input mount/listeners setup
  })
  test.describe(`[${inputName}] Base tests - Delete word`, () => {
    test('should backspace previous word (even if there is not a selected character)', async ({
      page,
    }) => {
      const container = page.locator(
        `[data-input-otp-container]:has([name="${inputName}"])`,
      )
      const input = page.locator(`[name=${inputName}]`)

      await input.pressSequentially('1234')
      await expect(input).toHaveValue('1234')

      await input.press(`${modifier}+Backspace`)
      await expect(input).toHaveValue('')
    })
    test('should backspace selected char', async ({ page }) => {
      const container = page.locator(
        `[data-input-otp-container]:has([name="${inputName}"])`,
      )
      const input = page.locator(`[name=${inputName}]`)

      await input.pressSequentially('123456')
      await expect(input).toHaveValue('123456')

      await input.press('ArrowLeft')
      await input.press('ArrowLeft')
      await input.press(`${modifier}+Backspace`)

      await expect(input).toHaveValue('12356')
    })
    test('should forward-delete character when pressing delete', async ({
      page,
    }) => {
      const container = page.locator(
        `[data-input-otp-container]:has([name="${inputName}"])`,
      )
      const input = page.locator(`[name=${inputName}]`)

      await input.pressSequentially('123456')
      await expect(input).toHaveValue('123456')

      await input.press('Delete')
      await expect(input).toHaveValue('12345')
      await input.press('ArrowLeft')
      await input.press('ArrowLeft')
      await input.press('ArrowLeft')
      await input.press('ArrowLeft')
      await input.press('ArrowLeft')
      await input.press('Delete')
      await expect(input).toHaveValue('2345')
      await input.press('ArrowRight')
      await input.press('ArrowRight')
      await input.press('Delete')
      await expect(input).toHaveValue('235')
    })
  })
})
