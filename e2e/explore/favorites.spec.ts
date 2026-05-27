import { test, expect } from '@playwright/test'

test.describe('Explore - Favorites', () => {
  test('should show book cards on explore page', async ({ page }) => {
    await page.goto('/explore')
    const bookCard = page.locator('a[href^="/book/"]').first()
    await bookCard.waitFor({ state: 'visible', timeout: 10000 })
    await expect(bookCard).toBeVisible()
  })

  test('should load favorites page', async ({ page }) => {
    await page.goto('/favorites')
    await expect(page).toHaveURL('/dashboard/favorites')
  })

  test('should show empty state on dashboard favorites when empty', async ({ page }) => {
    await page.goto('/dashboard/favorites')
    await expect(page.getByText('Nenhum favorito')).toBeVisible()
  })
})
