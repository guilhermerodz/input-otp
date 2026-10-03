import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/rtl')
})

test.describe('RTL tests', () => {
  test('should lay out slots left to right inside an RTL page', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')
    await input.pressSequentially('123456')
    await expect(input).toHaveValue('123456')

    const first = await page.getByTestId('slot-0').boundingBox()
    const last = await page.getByTestId('slot-5').boundingBox()
    expect(first!.x).toBeLessThan(last!.x)
  })
})
