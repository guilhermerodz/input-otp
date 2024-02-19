import { test, expect } from '@playwright/test'

const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'

test.beforeEach(async ({ page }) => {
  await page.goto('/base')
})

test.describe('Base tests - Render', () => {
  test('should expose focus flags', async ({ page }) => {
    const input = page.getByTestId('input-otp-wrapper').getByRole('textbox')
    const renderer = page.getByTestId('input-otp-renderer')

    await input.focus()
    await expect(renderer).toHaveAttribute('data-test-render-is-focused', 'true')

    await input.blur()
    await page.waitForTimeout(100)
    await expect(renderer).not.toHaveAttribute('data-test-render-is-focused')
  })
  test('should expose hover flags', async ({ page }) => {
    const renderer = page.getByTestId('input-otp-renderer')

    await expect(renderer).not.toHaveAttribute('data-test-render-is-hovering')

    await renderer.hover()
    await expect(renderer).toHaveAttribute('data-test-render-is-hovering', 'true')
  })
})
