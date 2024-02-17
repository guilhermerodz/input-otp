import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3039/disabled')
})

test.describe('Disabled tests', () => {
  test('should autofocus', async ({ page }) => {
    const input = page.getByTestId('otp-input-wrapper').getByRole('textbox')

    await expect(input).toBeDisabled()
  })
})
