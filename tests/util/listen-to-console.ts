import type { Page } from '@playwright/test'

export function listenToConsole(page: Page) {
  page.on('console', msg => console.log(msg.text()))
}