import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/props')
})

test.describe('Props tests', () => {
  test('should receive props accordingly', async ({ page }) => {
    const input1 = page.getByTestId('input-otp-wrapper-1').getByRole('textbox')
    const input2 = page.getByTestId('input-otp-wrapper-2').getByRole('textbox')
    const input3 = page.getByTestId('input-otp-wrapper-3').getByRole('textbox')
    const inputWrapper4 = page.getByTestId('input-otp-wrapper-4').first()
    const input5 = page.getByTestId('input-otp-wrapper-5').getByRole('textbox')
    const input6 = page.getByTestId('input-otp-wrapper-6').getByRole('textbox')
    const input7 = page.getByTestId('input-otp-wrapper-7').getByRole('textbox')

    await expect(input1).toBeDisabled()

    await expect(input2).toHaveAttribute('inputmode', 'numeric')

    await expect(input3).toHaveAttribute('inputmode', 'text')

    await expect(inputWrapper4).toHaveClass('testclassname')

    await expect(input5).toHaveAttribute('maxLength', '3')

    await expect(input6).toHaveAttribute('id', 'testid')
    await expect(input6).toHaveAttribute('name', 'testname')

    await expect(input7).toHaveAttribute('pattern', ' ')
  })
})
