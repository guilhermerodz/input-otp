import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/base')
})

test.describe('Base tests - Paste', () => {
  test('should overwrite from the caret forward instead of merging with trailing chars', async ({
    page,
    browserName,
  }) => {
    // Firefox's ClipboardEvent constructor discards a custom clipboardData
    // DataTransfer (yields an empty one instead), so this synthetic-paste
    // technique can't carry content there — confirmed no alternative works
    // in this environment either: context.grantPermissions(['clipboard-read',
    // 'clipboard-write']) throws "Unknown permission" on both Firefox and
    // WebKit, and even on Chromium (where the grant succeeds) a real
    // keyboard Control+V does not trigger an actual paste under Playwright's
    // headless automation. The fix itself isn't Firefox-specific — this is
    // a test-simulation gap, not a product gap.
    test.skip(
      browserName === 'firefox',
      "Firefox's ClipboardEvent constructor ignores custom clipboardData, and no cross-browser real-paste simulation works in this environment",
    )

    const input = page.getByRole('textbox')

    await input.pressSequentially('12')
    await expect(input).toHaveValue('12')

    // Move the caret to slot 0, the way a real click would. The library
    // narrows this into selection [0, 1) via onDocumentSelectionChange —
    // correct for keystroke-overwrite, but paste must not inherit it.
    await input.evaluate(el => {
      const input = el as HTMLInputElement
      input.setSelectionRange(0, 0)
      document.dispatchEvent(new Event('selectionchange'))
    })
    await expect(input).toHaveAttribute('data-input-otp-mss', '0')
    await expect(input).toHaveAttribute('data-input-otp-mse', '1')

    await input.evaluate(el => {
      const input = el as HTMLInputElement
      const dt = new DataTransfer()
      dt.setData('text/plain', '1111')
      input.dispatchEvent(
        new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: dt,
        }),
      )
    })

    // Previously produced "11112" — the pasted content merged with the
    // leftover "2" instead of overwriting from the caret forward.
    await expect(input).toHaveValue('1111')
  })

  test('should truncate a paste that overflows maxLength', async ({
    page,
    browserName,
  }) => {
    // See the justification in the previous test — no working cross-browser
    // real-paste simulation exists in this environment.
    test.skip(
      browserName === 'firefox',
      "Firefox's ClipboardEvent constructor ignores custom clipboardData, and no cross-browser real-paste simulation works in this environment",
    )

    const input = page.getByRole('textbox')

    await input.pressSequentially('12')

    await input.evaluate(el => {
      const input = el as HTMLInputElement
      input.setSelectionRange(0, 0)
      document.dispatchEvent(new Event('selectionchange'))
    })

    await input.evaluate(el => {
      const input = el as HTMLInputElement
      const dt = new DataTransfer()
      dt.setData('text/plain', '1234567')
      input.dispatchEvent(
        new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: dt,
        }),
      )
    })

    await expect(input).toHaveValue('123456')
  })

  test('should leave read-only and disabled inputs to native paste', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === 'firefox',
      "Firefox's ClipboardEvent constructor ignores custom clipboardData",
    )

    const input = page.getByRole('textbox')

    await input.pressSequentially('12')

    for (const property of ['readOnly', 'disabled'] as const) {
      const wasNotPrevented = await input.evaluate((el, property) => {
        const input = el as HTMLInputElement
        input[property] = true
        const clipboardData = new DataTransfer()
        clipboardData.setData('text/plain', '1111')
        return input.dispatchEvent(
          new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData,
          }),
        )
      }, property)

      expect(wasNotPrevented).toBe(true)
      await expect(input).toHaveValue('12')
      await input.evaluate((el, property) => {
        const input = el as HTMLInputElement
        input[property] = false
      }, property)
    }
  })
})
