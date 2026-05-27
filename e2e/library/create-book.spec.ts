import { test, expect } from '@playwright/test'

test.describe('Library - Create Book', () => {
  test('should open modal on Nova Historia click', async ({ page }) => {
    await page.goto('/dashboard/library')
    await page.locator('button:has-text("Nova História")').click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })

  test('should show modal with title and author inputs', async ({ page }) => {
    await page.goto('/dashboard/library')
    await page.locator('button:has-text("Nova História")').click()
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog.locator('#title')).toBeVisible()
    await expect(dialog.locator('#author')).toBeVisible()
  })

  test('should close modal on escape key', async ({ page }) => {
    await page.goto('/dashboard/library')
    await page.locator('button:has-text("Nova História")').click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should close modal on close button click', async ({ page }) => {
    await page.goto('/dashboard/library')
    await page.locator('button:has-text("Nova História")').click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await page.locator('[aria-label="Fechar modal"]').click()
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should show cancelar and criar historia buttons', async ({ page }) => {
    await page.goto('/dashboard/library')
    await page.locator('button:has-text("Nova História")').click()
    await expect(page.locator('[role="dialog"]').locator('button:has-text("Cancelar")')).toBeVisible()
    await expect(page.locator('[role="dialog"]').locator('button:has-text("Criar História")')).toBeVisible()
  })
})
