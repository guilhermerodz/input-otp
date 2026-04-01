import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/base')
})

test.describe('Base tests - Selections', () => {
  test.skip(
    process.env.CI === 'true',
    'Breaks in CI as it cannot handle Shift key',
  )

  test('should replace selected char if another is pressed', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')

    await input.pressSequentially('123')
    // arrow left on keyboard
    await input.press('ArrowLeft')
    await input.pressSequentially('1')
    await expect(input).toHaveValue('121')
  })
  test('should replace multi-selected chars if another is pressed', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')

    await input.pressSequentially('123456')
    await page.waitForTimeout(100)
    await input.press('Shift+ArrowLeft')
    await input.press('Shift+ArrowLeft')
    await page.waitForTimeout(100)
    await input.pressSequentially('1')
    await expect(input).toHaveValue('1231')
  })
  test('should replace last char if another one is pressed', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')

    await input.pressSequentially('1234567')
    await page.waitForTimeout(100)

    await expect(input).toHaveValue('123457')
  })
})
