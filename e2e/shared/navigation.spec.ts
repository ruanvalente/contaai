import { test, expect, type Page } from '@playwright/test'

async function openMobileMenuIfNeeded(page: Page) {
  const menuButton = page.locator('button[aria-controls="mobile-menu"]')
  if (await menuButton.isVisible()) {
    await menuButton.click()
    await page.locator('[role="menu"]').waitFor({ state: 'visible', timeout: 5000 })
  }
}

test.describe('Global Navigation', () => {
  test('should load landing page with header', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Descubra/i })).toBeVisible()
  })

  test('should navigate to explore page', async ({ page }) => {
    await page.goto('/')
    await openMobileMenuIfNeeded(page)
    await page.getByRole('link', { name: 'Explorar' }).first().click()
    await expect(page).toHaveURL('/explore')
  })

  test('should navigate to my-session page', async ({ page }) => {
    await page.goto('/')
    await openMobileMenuIfNeeded(page)
    await page.getByRole('link', { name: 'Minha Sessão' }).first().click()
    await expect(page).toHaveURL('/my-session')
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')
    await openMobileMenuIfNeeded(page)
    await page.getByRole('link', { name: 'Entrar' }).first().click()
    await expect(page).toHaveURL('/login')
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/')
    await openMobileMenuIfNeeded(page)
    await page.getByRole('link', { name: 'Criar Conta' }).first().click()
    await expect(page).toHaveURL('/register')
  })

  test('should navigate to downloads page', async ({ page }) => {
    await page.goto('/downloads')
    await expect(page).toHaveURL('/dashboard/downloads')
  })

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL('/dashboard/settings')
  })

  test('should show 404 for unknown route', async ({ page }) => {
    const response = await page.goto('/rota-inexistente')
    await expect(page.getByText('404').or(page.getByText('Page not found'))).toBeVisible()
  })
})
