import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3039/with-allow-spaces')
})

test.describe('With allow spaces tests', () => {
  test('should prevent spaces in the input value', async ({ page }) => {
    const input = page.getByTestId('otp-input-wrapper-1').getByRole('textbox')

    await input.pressSequentially('1234567')
    await expect(input).toHaveValue('123457')
  })
  test('should allow spaces in the input value', async ({ page }) => {
    const input = page.getByTestId('otp-input-wrapper-2').getByRole('textbox')

    await input.pressSequentially('1')
    await expect(input).toHaveValue('1')

    await input.pressSequentially('  34')
    await expect(input).toHaveValue('1  34')
  })
})
