import { test, expect } from '@playwright/test'

const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'

test.beforeEach(async ({ page }) => {
  await page.goto('/base')
})

test.describe('Base tests - Slots', () => {
  test('should expose the slot value', async ({ page }) => {
    const input = page.getByRole('textbox')

    await input.pressSequentially('1')
    await expect(input).toHaveValue('1')

    const slot0 = page.getByTestId('slot-0')
    await expect(slot0).toHaveAttribute('data-test-char', '1')

    await expect(page.getByTestId('slot-1')).not.toHaveAttribute(
      'data-test-char',
    )

    await input.pressSequentially('23456')
    await expect(input).toHaveValue('123456')

    await expect(page.getByTestId('slot-1')).toHaveAttribute(
      'data-test-char',
      '2',
    )
    await expect(page.getByTestId('slot-2')).toHaveAttribute(
      'data-test-char',
      '3',
    )
    await expect(page.getByTestId('slot-3')).toHaveAttribute(
      'data-test-char',
      '4',
    )
    await expect(page.getByTestId('slot-4')).toHaveAttribute(
      'data-test-char',
      '5',
    )
    await expect(page.getByTestId('slot-5')).toHaveAttribute(
      'data-test-char',
      '6',
    )
  })
})
