import { test, expect } from '@playwright/test'

// The fallback badge probe runs on focus and re-runs at 2s and 5s.
// Waiting past the second probe proves the "no badge" verdict is stable
// and not just the pre-focus default.
const SECOND_PROBE_DELAY = 2_500

test.beforeEach(async ({ page }) => {
  await page.goto('/base')
})

test.describe('Base tests - Password manager badge', () => {
  test('should not reserve badge space when no password manager is present', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')

    await input.focus()
    await expect(input).toBeFocused()

    await expect(input).toHaveJSProperty('style.width', '100%')
    await expect(input).toHaveJSProperty('style.clipPath', '')

    await page.waitForTimeout(SECOND_PROBE_DELAY)

    await expect(input).toHaveJSProperty('style.width', '100%')
    await expect(input).toHaveJSProperty('style.clipPath', '')
  })

  test('should reserve badge space when a password manager is detected', async ({
    page,
  }) => {
    // Same marker attribute the library looks for (LastPass).
    await page.evaluate(() => {
      const badge = document.createElement('div')
      badge.setAttribute('data-lastpass-icon-root', '')
      document.body.appendChild(badge)
    })

    const input = page.getByRole('textbox')

    await input.focus()
    await expect(input).toBeFocused()

    await expect(input).toHaveJSProperty('style.width', 'calc(100% + 40px)')
    await expect(input).toHaveJSProperty(
      'style.clipPath',
      'inset(0px 40px 0px 0px)',
    )
  })
})
