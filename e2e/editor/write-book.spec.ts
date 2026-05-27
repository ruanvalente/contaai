import { test, expect } from '@playwright/test'

test.describe('Editor - Write Book', () => {
  test('should show editor page structure when authenticated', async ({ page }) => {
    await page.goto('/dashboard/library')
    await expect(page.getByRole('heading', { name: 'Minha Biblioteca' })).toBeVisible()
  })
})
