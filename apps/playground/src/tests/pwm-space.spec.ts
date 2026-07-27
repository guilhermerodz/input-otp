import { test, expect } from '@playwright/test'

// Planting a known password manager marker makes badge detection
// deterministic: the library finds it by selector on the first probe
// (right after focus) instead of relying on the elementFromPoint fallback.
async function plantFakeBadge(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const badge = document.createElement('div')
    badge.setAttribute('data-lastpass-icon-root', '')
    document.body.appendChild(badge)
  })
}

// The badge probe runs on focus and re-runs at 2s and 5s, and the space
// check re-runs every second. Waiting past the 2s probe proves a verdict
// is stable rather than just the pre-focus default.
const SECOND_PROBE_DELAY = 2_500

test.beforeEach(async ({ page }) => {
  await page.goto('/pwm-space')
})

test.describe('Password manager badge space', () => {
  test('pushes the badge when the gutter fits', async ({ page }) => {
    await plantFakeBadge(page)

    const input = page.getByTestId('roomy').getByRole('textbox')
    await input.focus()
    await expect(input).toBeFocused()

    await expect(input).toHaveJSProperty('style.width', 'calc(100% + 40px)')
    await expect(input).toHaveJSProperty(
      'style.clipPath',
      'inset(0px 40px 0px 0px)',
    )
  })

  test('does not push inside a constrained scroll container', async ({
    page,
  }) => {
    await plantFakeBadge(page)

    const card = page.getByTestId('tight')
    const input = card.getByRole('textbox')
    await input.focus()
    await expect(input).toBeFocused()

    await page.waitForTimeout(SECOND_PROBE_DELAY)

    await expect(input).toHaveJSProperty('style.width', '100%')

    // The actual symptom from #107: the overhang registering as
    // scrollable overflow on an ancestor.
    const overflows = await card.evaluate(
      el => el.scrollWidth > el.clientWidth,
    )
    expect(overflows).toBe(false)
  })
})
