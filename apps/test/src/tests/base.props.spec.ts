import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/props')
})

test.describe('Props tests', () => {
  test('should receive props accordingly', async ({ page }) => {
    const input1 = page.getByTestId('input-otp-1')
    const input2 = page.getByTestId('input-otp-2')
    const input3 = page.getByTestId('input-otp-3')
    const container4 = page.locator(
      `[data-input-otp-container]:has([data-testid="input-otp-4"])`,
    )
    const input5 = page.getByTestId('input-otp-5')
    const input6 = page.getByTestId('input-otp-6')
    const input7 = page.getByTestId('input-otp-7')

    await expect(input1).toBeDisabled()

    await expect(input2).toHaveAttribute('inputmode', 'numeric')

    await expect(input3).toHaveAttribute('inputmode', 'text')

    await expect(container4).toHaveClass('testclassname')

    await expect(input5).toHaveAttribute('maxLength', '3')

    await expect(input6).toHaveAttribute('id', 'testid')
    await expect(input6).toHaveAttribute('name', 'testname')

    await expect(input7).toHaveAttribute('pattern', ' ')
  })
})
