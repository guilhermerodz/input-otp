import { expect, test } from '@playwright/test'

import { INPUT_NAMES, getFrameworkName } from './util/constants'

INPUT_NAMES.forEach(inputName => {
  test.describe(`[${inputName}] With autofocus prop`, () => {
    test('should', async ({ page }) => {
      await page.goto(`/test/autofocus/${getFrameworkName(inputName)}`)
      await page.waitForTimeout(200) // Needed for input mount/listeners setup

      const input = page.locator(`[name=${inputName}]`)
      const isFocused = await input.evaluate(
        node => document.activeElement === node,
      )
      expect(isFocused).toBe(true)
    })
  })
})
