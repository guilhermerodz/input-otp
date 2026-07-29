import { test, expect, Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/base')
})

/**
 * Wait until the component's mirrored selection (mss/mse) settles at the
 * expected range. Pointer-driven selection updates are applied through
 * React state, so polling the mirrored attributes keeps these tests
 * deterministic without arbitrary waits.
 */
async function expectMirrorSelection(page: Page, start: number, end: number) {
  const input = page.getByRole('textbox')
  await expect(input).toHaveAttribute('data-input-otp-mss', String(start))
  await expect(input).toHaveAttribute('data-input-otp-mse', String(end))
}

async function slotCenter(page: Page, idx: number) {
  const box = await page.getByTestId(`slot-${idx}`).boundingBox()
  if (!box) {
    throw new Error(`slot-${idx} has no bounding box`)
  }
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

/**
 * Dispatch a synthetic touch-pointer event sequence on the input. Playwright
 * can only synthesize taps for real touchscreens, so drags and long-presses
 * are dispatched as PointerEvents directly — they bubble to React's root
 * listener exactly like real ones. Native side effects (focus on tap end,
 * caret placement) don't run for synthetic events, which is fine: these
 * tests target the library's own gesture logic.
 */
async function dispatchTouch(
  page: Page,
  events: Array<{ type: string; x: number; y: number }>,
) {
  await page.evaluate(evts => {
    const input = document.querySelector('input[data-input-otp]')
    if (!input) {
      throw new Error('input not found')
    }
    for (const evt of evts) {
      input.dispatchEvent(
        new PointerEvent(evt.type, {
          bubbles: true,
          cancelable: true,
          composed: true,
          pointerId: 99,
          pointerType: 'touch',
          isPrimary: true,
          clientX: evt.x,
          clientY: evt.y,
          button: evt.type === 'pointermove' ? -1 : 0,
          buttons: evt.type === 'pointerup' ? 0 : 1,
        }),
      )
    }
  }, events)
}

test.describe('Base tests - Pointer Selections', () => {
  test('should select a filled slot on click and replace it when typing', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')
    await input.pressSequentially('123456')

    const c = await slotCenter(page, 2)
    await page.mouse.click(c.x, c.y)
    await expectMirrorSelection(page, 2, 3)

    await page.keyboard.press('9')
    await expect(input).toHaveValue('129456')
  })

  test('should keep the caret at the end when clicking past the filled slots', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')
    await input.pressSequentially('12')

    const c = await slotCenter(page, 4)
    await page.mouse.click(c.x, c.y)
    await expectMirrorSelection(page, 2, 2)

    await page.keyboard.press('3')
    await expect(input).toHaveValue('123')
  })

  test('should focus an empty input on click with the caret at the first slot', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')

    const c = await slotCenter(page, 3)
    await page.mouse.click(c.x, c.y)
    await expect(input).toBeFocused()
    await expectMirrorSelection(page, 0, 0)

    await page.keyboard.press('7')
    await expect(input).toHaveValue('7')
  })

  test('should select a range by dragging across slots', async ({ page }) => {
    const input = page.getByRole('textbox')
    await input.pressSequentially('123456')

    const from = await slotCenter(page, 1)
    const to = await slotCenter(page, 4)
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move(to.x, to.y, { steps: 8 })
    // Selection is live while still dragging
    await expectMirrorSelection(page, 1, 5)
    await page.mouse.up()
    await expectMirrorSelection(page, 1, 5)

    // Typing replaces the whole dragged range
    await page.keyboard.press('9')
    await expect(input).toHaveValue('196')
  })

  test('should select a range when dragging right to left', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')
    await input.pressSequentially('123456')

    const from = await slotCenter(page, 4)
    const to = await slotCenter(page, 1)
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move(to.x, to.y, { steps: 8 })
    await page.mouse.up()
    await expectMirrorSelection(page, 1, 5)
  })

  test('should clamp a drag to the filled slots', async ({ page }) => {
    const input = page.getByRole('textbox')
    await input.pressSequentially('123')

    const from = await slotCenter(page, 1)
    const to = await slotCenter(page, 5)
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move(to.x, to.y, { steps: 8 })
    await page.mouse.up()
    await expectMirrorSelection(page, 1, 3)
  })

  test('should focus and select when dragging on an unfocused input', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')
    await input.pressSequentially('123456')
    await input.evaluate(el => (el as HTMLInputElement).blur())
    await expect(input).not.toBeFocused()

    const from = await slotCenter(page, 0)
    const to = await slotCenter(page, 2)
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move(to.x, to.y, { steps: 8 })
    await page.mouse.up()

    await expect(input).toBeFocused()
    await expectMirrorSelection(page, 0, 3)
  })

  test('should select all slots on double click', async ({ page }) => {
    const input = page.getByRole('textbox')
    await input.pressSequentially('123456')

    const c = await slotCenter(page, 2)
    await page.mouse.dblclick(c.x, c.y)
    await expectMirrorSelection(page, 0, 6)
  })

  test('should select the tapped slot via touch pointers', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')
    await input.pressSequentially('123456')

    const c = await slotCenter(page, 1)
    // Touch applies the selection on release, so a scroll gesture starting
    // on the input never moves the selection
    await dispatchTouch(page, [{ type: 'pointerdown', x: c.x, y: c.y }])
    await expectMirrorSelection(page, 5, 6)
    await dispatchTouch(page, [{ type: 'pointerup', x: c.x, y: c.y }])
    await expectMirrorSelection(page, 1, 2)
  })

  test('should select a range by dragging via touch pointers', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')
    await input.pressSequentially('123456')

    const from = await slotCenter(page, 1)
    const to = await slotCenter(page, 4)
    const steps = 5
    await dispatchTouch(page, [
      { type: 'pointerdown', x: from.x, y: from.y },
      ...Array.from({ length: steps }, (_, i) => ({
        type: 'pointermove',
        x: from.x + ((to.x - from.x) * (i + 1)) / steps,
        y: from.y,
      })),
      { type: 'pointerup', x: to.x, y: to.y },
    ])
    await expectMirrorSelection(page, 1, 5)
  })

  test('should hand a touch long-press over to the native selection UI', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')
    await input.pressSequentially('123456')
    await expectMirrorSelection(page, 5, 6)

    const c1 = await slotCenter(page, 1)
    await dispatchTouch(page, [{ type: 'pointerdown', x: c1.x, y: c1.y }])
    // Held still past the long-press threshold: the gesture now belongs to
    // the native loupe/edit-menu, so later movements and the release must
    // not touch the selection
    await page.waitForTimeout(500)
    const c3 = await slotCenter(page, 3)
    await dispatchTouch(page, [
      { type: 'pointermove', x: c3.x, y: c3.y },
      { type: 'pointerup', x: c3.x, y: c3.y },
    ])
    await page.waitForTimeout(100)
    await expectMirrorSelection(page, 5, 6)
  })

  test('should keep a touch-selected range when tapping inside it', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')
    await input.pressSequentially('123456')

    // Drag-select slots 1..4 via touch
    const from = await slotCenter(page, 1)
    const to = await slotCenter(page, 4)
    const steps = 5
    await dispatchTouch(page, [
      { type: 'pointerdown', x: from.x, y: from.y },
      ...Array.from({ length: steps }, (_, i) => ({
        type: 'pointermove',
        x: from.x + ((to.x - from.x) * (i + 1)) / steps,
        y: from.y,
      })),
      { type: 'pointerup', x: to.x, y: to.y },
    ])
    await expectMirrorSelection(page, 1, 5)

    // Tapping inside the range keeps it — this is the gesture iOS uses to
    // present the edit menu over a selection, so collapsing it here would
    // make copy/cut/paste unreachable after a drag-select
    const inside = await slotCenter(page, 2)
    await dispatchTouch(page, [
      { type: 'pointerdown', x: inside.x, y: inside.y },
      { type: 'pointerup', x: inside.x, y: inside.y },
    ])
    await page.waitForTimeout(100)
    await expectMirrorSelection(page, 1, 5)

    // Tapping outside the range still selects the tapped slot
    const outside = await slotCenter(page, 5)
    await dispatchTouch(page, [
      { type: 'pointerdown', x: outside.x, y: outside.y },
      { type: 'pointerup', x: outside.x, y: outside.y },
    ])
    await expectMirrorSelection(page, 5, 6)
  })

  test('should hand over when the selection moves natively during a still touch hold', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')
    await input.pressSequentially('123456')
    await expectMirrorSelection(page, 5, 6)

    const c1 = await slotCenter(page, 1)
    await dispatchTouch(page, [{ type: 'pointerdown', x: c1.x, y: c1.y }])

    // Before the long-press threshold, the platform's long-press machinery
    // (iOS caret loupe) can engage and move the caret on its own. The
    // gesture must yield to it instead of re-asserting the tapped slot.
    await page.waitForTimeout(150)
    await input.evaluate(el => {
      ;(el as HTMLInputElement).setSelectionRange(3, 3)
      document.dispatchEvent(new Event('selectionchange'))
    })
    // The mid-text caret goes through the regular caret→slot remap
    // (previous selection was 5,6 so the caret at 3 selects slot 2)
    await expectMirrorSelection(page, 2, 3)

    // Releasing must not apply the originally tapped slot
    await dispatchTouch(page, [{ type: 'pointerup', x: c1.x, y: c1.y }])
    await page.waitForTimeout(100)
    await expectMirrorSelection(page, 2, 3)
  })

  test('should leave the selection untouched when a touch gesture is canceled', async ({
    page,
  }) => {
    const input = page.getByRole('textbox')
    await input.pressSequentially('123456')
    await expectMirrorSelection(page, 5, 6)

    const c = await slotCenter(page, 1)
    // A vertical swipe starting on the input turns into a scroll: the
    // browser sends pointercancel and the selection must not move
    await dispatchTouch(page, [
      { type: 'pointerdown', x: c.x, y: c.y },
      { type: 'pointercancel', x: c.x, y: c.y + 30 },
      { type: 'pointerup', x: c.x, y: c.y + 30 },
    ])
    await page.waitForTimeout(100)
    await expectMirrorSelection(page, 5, 6)
  })

  test('should select the tapped slot on real touchscreens', async ({
    page,
  }, testInfo) => {
    test.skip(
      !(testInfo.project.use as { hasTouch?: boolean }).hasTouch,
      'requires a touch-enabled project',
    )
    const input = page.getByRole('textbox')
    await input.pressSequentially('123456')

    const c = await slotCenter(page, 2)
    await page.touchscreen.tap(c.x, c.y)
    await expectMirrorSelection(page, 2, 3)
  })
})

test.describe('Base tests - Pointer Shift Selections', () => {
  test.skip(
    process.env.CI === 'true',
    'Breaks in CI as it cannot handle Shift key',
  )

  test('should extend the selection with shift-click', async ({ page }) => {
    const input = page.getByRole('textbox')
    await input.pressSequentially('123456')

    const c1 = await slotCenter(page, 1)
    await page.mouse.click(c1.x, c1.y)
    await expectMirrorSelection(page, 1, 2)

    const c4 = await slotCenter(page, 4)
    await page.keyboard.down('Shift')
    await page.mouse.click(c4.x, c4.y)
    await page.keyboard.up('Shift')
    await expectMirrorSelection(page, 1, 5)
  })
})
