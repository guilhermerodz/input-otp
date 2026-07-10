import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/base')
})

/**
 * Wait until the component's mirrored selection (mss/mse) settles at the
 * expected range. The selectionchange handler transforms the browser's raw
 * caret into a slot range asynchronously, so waiting between key presses
 * keeps keyboard-driven tests deterministic without giving up real key events.
 */
async function expectMirrorSelection(
  page: import('@playwright/test').Page,
  start: number,
  end: number,
) {
  const input = page.getByRole('textbox')
  await expect(input).toHaveAttribute('data-input-otp-mss', String(start))
  await expect(input).toHaveAttribute('data-input-otp-mse', String(end))
}

/**
 * Press a key and wait for the mirrored selection to settle. WebKit may skip
 * the document selectionchange event for caret movements inside the input
 * under load, so re-dispatch it manually after the press — same workaround
 * the component uses for deletions (see _changeListener in input.tsx). The
 * handler reads the live DOM selection, so a redundant dispatch is a no-op.
 */
async function pressAndExpectSelection(
  page: import('@playwright/test').Page,
  key: string,
  start: number,
  end: number,
) {
  const input = page.getByRole('textbox')
  await input.press(key)
  await input.evaluate(() =>
    document.dispatchEvent(new Event('selectionchange')),
  )
  await expectMirrorSelection(page, start, end)
}

test.describe('Base tests - Selections', () => {
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
  test('should replace last char if another one is pressed', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')

    await input.pressSequentially('1234567')
    await page.waitForTimeout(100)

    await expect(input).toHaveValue('123457')
  })
  test('should move slot selection with arrow keys when input is full', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')

    await input.pressSequentially('123456')
    await expect(input).toHaveValue('123456')
    // Typing to full keeps the last slot selected
    await expectMirrorSelection(page, 5, 6)

    // Moving backward selects the previous slot
    await pressAndExpectSelection(page, 'ArrowLeft', 4, 5)
    await pressAndExpectSelection(page, 'ArrowLeft', 3, 4)

    // Reversing direction moves the selection forward again
    await pressAndExpectSelection(page, 'ArrowRight', 4, 5)
    await pressAndExpectSelection(page, 'ArrowRight', 5, 6)

    // Selection is clamped at the last slot
    await pressAndExpectSelection(page, 'ArrowRight', 5, 6)

    // Walk all the way back to the first slot
    for (let i = 4; i >= 0; i--) {
      await pressAndExpectSelection(page, 'ArrowLeft', i, i + 1)
    }

    // Selection is clamped at the first slot
    await pressAndExpectSelection(page, 'ArrowLeft', 0, 1)
  })
  test('should select previous slot when pressing arrow left in insert mode', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')

    await input.pressSequentially('123')
    await expect(input).toHaveValue('123')
    // Partially filled input keeps a collapsed caret (insert mode)
    await expectMirrorSelection(page, 3, 3)

    // Leaving insert mode selects the char right before the caret
    await pressAndExpectSelection(page, 'ArrowLeft', 2, 3)

    // Subsequent presses keep shifting the selected slot backward
    await pressAndExpectSelection(page, 'ArrowLeft', 1, 2)
  })
})

test.describe('Base tests - Shift Selections', () => {
  test.skip(
    process.env.CI === 'true',
    'Breaks in CI as it cannot handle Shift key',
  )

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
})
