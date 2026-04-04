import { expect, test } from '@playwright/test'
import { modifier } from './util/modifier'

test.beforeEach(async ({ page }) => {
  await page.goto('/base')
})

/**
 * Set the input selection directly and wait for the component's mirrored
 * selection (mss) to reflect the new position. This avoids the race condition
 * where rapid ArrowLeft/Right presses conflict with the component's
 * selectionchange handler calling setSelectionRange.
 */
async function setSelectionAndWait(
  page: import('@playwright/test').Page,
  start: number,
  end: number,
) {
  const input = page.getByRole('textbox')
  await input.evaluate(
    (el: HTMLInputElement, [s, e]) => {
      el.setSelectionRange(s, e)
      el.dispatchEvent(new Event('selectionchange', { bubbles: true }))
    },
    [start, end] as [number, number],
  )
  await expect(input).toHaveAttribute('data-input-otp-mss', String(start))
}

test.describe('Backspace', () => {
  test('should backspace previous word (even if there is not a selected character)', async ({ page }) => {
    const input = page.getByRole('textbox')

    await input.pressSequentially('1234')
    await expect(input).toHaveValue('1234')

    await input.press(`${modifier}+Backspace`)
    await expect(input).toHaveValue('')
  })
  test('should backspace selected char', async ({ page }) => {
    const input = page.getByRole('textbox')

    await input.pressSequentially('123456')
    await expect(input).toHaveValue('123456')

    // Select char '4' at position [3,4], then delete backward
    await setSelectionAndWait(page, 3, 4)
    await input.press(`${modifier}+Backspace`)
    await expect(input).toHaveValue('12356')
  })
})
test.describe('Delete', () => {
  test('should forward-delete character when pressing delete', async ({ page }) => {
    const input = page.getByRole('textbox')

    await input.pressSequentially('123456')
    await expect(input).toHaveValue('123456')

    // Delete last char (selection is [5,6])
    await input.press('Delete')
    await expect(input).toHaveValue('12345')

    // Select first char [0,1] and delete it
    await setSelectionAndWait(page, 0, 1)
    await input.press('Delete')
    await expect(input).toHaveValue('2345')

    // Select char at [2,3] (which is '4') and delete it
    await setSelectionAndWait(page, 2, 3)
    await input.press('Delete')
    await expect(input).toHaveValue('235')
  })
})
