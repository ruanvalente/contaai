import { test, expect } from '@playwright/test'

test.describe('Library - My Books', () => {
  test('should redirect /library to /dashboard/library', async ({ page }) => {
    await page.goto('/library')
    await expect(page).toHaveURL(/\/dashboard\/library/)
  })

  test('should load the library page', async ({ page }) => {
    await page.goto('/dashboard/library')
    await expect(page.getByRole('heading', { name: 'Minha Biblioteca' })).toBeVisible()
  })

  test('should show Nova Historia button', async ({ page }) => {
    await page.goto('/dashboard/library')
    await expect(page.locator('button:has-text("Nova História")')).toBeVisible()
  })

  test('should show filter tabs', async ({ page }) => {
    await page.goto('/dashboard/library')
    await expect(page.locator('button:has-text("Minhas Histórias")')).toBeVisible()
    await expect(page.locator('button:has-text("Em Leitura")')).toBeVisible()
    await expect(page.locator('button:has-text("Concluídas")')).toBeVisible()
  })

  test('should switch between tabs', async ({ page }) => {
    await page.goto('/dashboard/library')
    await page.locator('button:has-text("Em Leitura")').click()
    await expect(page.locator('button:has-text("Em Leitura")')).toHaveClass(/bg-accent-500/)
  })
})
