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
  test('should scale down the input on iOS to hide the selection artifact', async ({ page }) => {
    // The native iOS selection artifact tracks the rendered text size, so
    // the input is visually scaled down 10x while its computed font-size
    // stays 16px (the minimum that does not trigger iOS focus zoom).
    await page.waitForFunction(() => {
      const styleEl = document.getElementById(
        'input-otp-style',
      ) as HTMLStyleElement | null
      return (styleEl?.sheet?.cssRules.length ?? 0) > 0
    })
    const iosRule = await page.evaluate(() => {
      const styleEl = document.getElementById(
        'input-otp-style',
      ) as HTMLStyleElement | null
      if (!styleEl?.sheet) {
        return null
      }
      return (
        Array.from(styleEl.sheet.cssRules)
          .map(rule => rule.cssText)
          .find(text => text.includes('-webkit-touch-callout')) ?? null
      )
    })
    expect(iosRule).not.toBeNull()
    expect(iosRule).toContain('font-size: 16px !important')
    expect(iosRule).toContain('transform: scale(0.1) !important')
    expect(iosRule).toContain('text-indent: -9999px !important')
    expect(iosRule).toContain('letter-spacing: -0.6em !important')

    // On engines where the @supports guard matches (real iOS WebKit),
    // also assert the rule wins over the inline styles.
    const matchesIOSGuard = await page.evaluate(() =>
      CSS.supports('-webkit-touch-callout', 'none'),
    )
    if (matchesIOSGuard) {
      const input = page.getByRole('textbox')
      await expect(input).toHaveCSS('font-size', '16px')
      await expect(input).toHaveCSS(
        'transform',
        'matrix(0.1, 0, 0, 0.1, 0, 0)',
      )
    }
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
