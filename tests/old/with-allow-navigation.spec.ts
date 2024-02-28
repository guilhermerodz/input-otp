import type { BrowserContext, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { modifier } from '../util/modifier'

test.beforeEach(async ({ page }) => {
  await page.goto('/with-allow-navigation')
})

function getInputSelection(params: { page: Page }) {
  const inputSelection = params.page.evaluate(() => {
    const input = document.activeElement
    if (!(input instanceof HTMLInputElement)) {
      return
    }
    if (input.selectionStart === null || input.selectionEnd === null) {
      return
    }
    const selectedContent = input.value.substring(
      input.selectionStart,
      input.selectionEnd,
    )
    return selectedContent
  })

  return inputSelection
}

test.describe('With allow navigation tests', () => {
  test('should allow navigation to the sides (arrows only)', async ({
    page,
    context,
  }) => {
    const input = page.getByTestId('input-otp-wrapper-1').getByRole('textbox')

    await input.pressSequentially('1234')
    await input.press('ArrowLeft')
    await input.press('ArrowLeft')
    await input.press('ArrowLeft')
    expect(await getInputSelection({ page })).toEqual('2')
    await input.press('ArrowRight')
    expect(await getInputSelection({ page })).toEqual('3')
    await input.press('ArrowUp')
    expect(await getInputSelection({ page })).toEqual('1')
    await input.press('ArrowDown')
    await input.press('ArrowLeft')
    expect(await getInputSelection({ page })).toEqual('4')
  })
  test('should clamp navigation to the sides (arrows only)', async ({
    page,
    context,
  }) => {
    const input = page.getByTestId('input-otp-wrapper-1').getByRole('textbox')

    await input.pressSequentially('123456')
    await input.press('ArrowLeft')
    await input.press('ArrowLeft')
    expect(await getInputSelection({ page })).toEqual('4')
    await input.press('ArrowRight')
    await input.press('ArrowRight')
    await input.press('ArrowRight')
    await input.press('ArrowRight')
    expect(await getInputSelection({ page })).toEqual('6')
  })
  test('should clamp navigation to the sides (cmd+arrows, home/end)', async ({
    page,
    context,
  }) => {
    const input = page.getByTestId('input-otp-wrapper-1').getByRole('textbox')

    await input.pressSequentially('123456')
    await input.press(`${modifier}+ArrowLeft`)
    expect(await getInputSelection({ page })).toEqual('1')
    await input.press(`${modifier}+ArrowRight`)
    expect(await getInputSelection({ page })).toEqual('6')
  })
})
