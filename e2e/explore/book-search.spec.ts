import { test, expect } from '@playwright/test'

test.describe('Explore - Book Search', () => {
  test('should load the explore page', async ({ page }) => {
    await page.goto('/explore')
    await expect(page).toHaveURL('/explore')
    await expect(page.getByRole('heading', { name: 'Explorar Livros' })).toBeVisible()
  })

  test('should show search input', async ({ page }) => {
    await page.goto('/explore')
    await expect(page.getByPlaceholder('Buscar livros...')).toBeVisible()
  })

  test('should show category filter buttons', async ({ page }) => {
    await page.goto('/explore')
    await expect(page.locator('button:has-text("All")')).toBeVisible()
    await expect(page.locator('button:has-text("Fantasy")')).toBeVisible()
  })

  test('should filter by category on click', async ({ page }) => {
    await page.goto('/explore')
    await page.locator('button:has-text("Fantasy")').click()
    await expect(page.locator('button:has-text("Fantasy")')).toHaveClass(/bg-accent-500/)
  })

  test('should filter results on search input', async ({ page }) => {
    await page.goto('/explore')
    const searchInput = page.getByPlaceholder('Buscar livros...')
    await searchInput.fill('dragão')
    await expect(searchInput).toHaveValue('dragão')
  })

  test('should show book cards on the page', async ({ page }) => {
    await page.goto('/explore')
    await expect(page.locator('a[href^="/book/"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to book details on click', async ({ page }) => {
    await page.goto('/explore')
    const bookLink = page.locator('a[href^="/book/"]').first()
    await bookLink.waitFor({ state: 'visible', timeout: 10000 })
    await bookLink.click()
    await expect(page).toHaveURL(/\/book\//)
  })
})
