import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3039/props')
})

test.describe('Props tests', () => {
  test('should receive props accordingly', async ({ page }) => {
    const input1 = page.getByTestId('otp-input-wrapper-1').getByRole('textbox')
    const input2 = page.getByTestId('otp-input-wrapper-2').getByRole('textbox')
    const input3 = page.getByTestId('otp-input-wrapper-3').getByRole('textbox')
    const inputWrapper4 = page.getByTestId('otp-input-wrapper-4')
    const input5 = page.getByTestId('otp-input-wrapper-5').getByRole('textbox')
    const input6 = page.getByTestId('otp-input-wrapper-6').getByRole('textbox')
    const input7 = page.getByTestId('otp-input-wrapper-7').getByRole('textbox')

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
