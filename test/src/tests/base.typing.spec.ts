import { test, expect } from '@playwright/test'
import { modifier } from './util/modifier'

test.beforeEach(async ({ page }) => {
  await page.goto('/base')
})

test.describe('Base tests - Typing', () => {
  test('should start as empty value', async ({ page }) => {
    const input = page.getByTestId('otp-input-wrapper').getByRole('textbox')

    await expect(input).toHaveValue('')
  })

  test('should change the input value', async ({ page }) => {
    const input = page.getByTestId('otp-input-wrapper').getByRole('textbox')

    await input.pressSequentially('1')
    await expect(input).toHaveValue('1')

    await input.pressSequentially('23456')
    await expect(input).toHaveValue('123456')
  })

  test('should prevent typing greater than max length', async ({ page }) => {
    const input = page.getByTestId('otp-input-wrapper').getByRole('textbox')

    await input.pressSequentially('1234567')
    await expect(input).toHaveValue('123457')
  })
  test('should slice pasting greater than max length', async ({ page }) => {
    const input = page.getByTestId('otp-input-wrapper').getByRole('textbox')
    const randomTextDiv = page.getByTestId('random-text')

    await randomTextDiv.focus()
    await randomTextDiv.fill('1234567')
    await page.keyboard.press(`${modifier}+KeyA`)
    await page.keyboard.press(`${modifier}+KeyC`)

    await input.focus()
    await page.keyboard.press(`${modifier}+KeyV`)

    await expect(input).toHaveValue('123456')
  })
})
