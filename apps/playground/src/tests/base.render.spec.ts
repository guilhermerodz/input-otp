import { test, expect } from '@playwright/test'

const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'

test.beforeEach(async ({ page }) => {
  await page.goto('/base')
})

test.describe('Base tests - Render', () => {
  test('should expose focus flags', async ({ page }) => {
    const input = page.getByRole('textbox')
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

    const _rect = await renderer.boundingBox({ timeout: 2_000 })
    expect(_rect).not.toBeNull()
    const rect = _rect!
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2)

    await expect(renderer).toHaveAttribute('data-test-render-is-hovering', 'true')
  })
})
