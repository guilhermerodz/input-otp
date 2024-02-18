import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/with-autofocus')
})

test.describe('With autofocus tests', () => {
  test('should autofocus', async ({ page }) => {
    const input = page.getByTestId('otp-input-wrapper').getByRole('textbox')

    await expect(input).toBeFocused()
  })
})
