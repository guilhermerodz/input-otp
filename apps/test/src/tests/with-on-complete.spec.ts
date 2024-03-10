import { test, expect } from '@playwright/test'
import { modifier } from './util/modifier'

test.beforeEach(async ({ page }) => {
  await page.goto('/with-on-complete')
})

test.describe('With on complete tests', () => {
  test('should change the input value', async ({ page }) => {
    const input = page.getByRole('textbox')

    await input.pressSequentially('123456')
    await expect(input).toHaveValue('123456')

    await expect(input).toBeDisabled()
  })
})
