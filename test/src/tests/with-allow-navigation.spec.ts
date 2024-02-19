import type { BrowserContext, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { modifier } from './util/modifier'

test.beforeEach(async ({ page }) => {
  await page.goto('/with-allow-navigation')
})

async function copyAndGetClipboardContent(params: {
  page: Page
  context: BrowserContext
}) {
  await params.context.grantPermissions(['clipboard-read', 'clipboard-write'])

  await params.page.keyboard.press(`${modifier}+KeyC`)
  const handle = await params.page.evaluateHandle(() =>
    navigator.clipboard.readText(),
  )

  const clipboardContent = await handle.jsonValue()

  return clipboardContent
}

test.describe('With allow navigation tests', () => {
  test('should allow navigation to the sides (arrows only)', async ({
    page,
    context,
  }) => {
    const input = page.getByTestId('otp-input-wrapper-1').getByRole('textbox')
    const getClipboard = () => copyAndGetClipboardContent({ page, context })

    await input.pressSequentially('1234')
    await input.press('ArrowLeft')
    await input.press('ArrowLeft')
    await input.press('ArrowLeft')
    expect(await getClipboard()).toEqual('2')
    await input.press('ArrowRight')
    expect(await getClipboard()).toEqual('3')
    await input.press('ArrowUp')
    expect(await getClipboard()).toEqual('1')
    await input.press('ArrowDown')
    await input.press('ArrowLeft')
    expect(await getClipboard()).toEqual('4')
  })
  test('should clamp navigation to the sides (arrows only)', async ({
    page,
    context,
  }) => {
    const input = page.getByTestId('otp-input-wrapper-1').getByRole('textbox')
    const getClipboard = () => copyAndGetClipboardContent({ page, context })

    await input.pressSequentially('123456')
    await input.press('ArrowLeft')
    await input.press('ArrowLeft')
    expect(await getClipboard()).toEqual('4')
    await input.press('ArrowRight')
    await input.press('ArrowRight')
    await input.press('ArrowRight')
    await input.press('ArrowRight')
    expect(await getClipboard()).toEqual('6')
  })
  test('should clamp navigation to the sides (cmd+arrows, home/end)', async ({
    page,
    context,
  }) => {
    const input = page.getByTestId('otp-input-wrapper-1').getByRole('textbox')
    const getClipboard = () => copyAndGetClipboardContent({ page, context })

    await input.pressSequentially('123456')
    await input.press(`${modifier}+ArrowLeft`)
    expect(await getClipboard()).toEqual('1')
    await input.press(`${modifier}+ArrowRight`)
    expect(await getClipboard()).toEqual('6')
  })
})
