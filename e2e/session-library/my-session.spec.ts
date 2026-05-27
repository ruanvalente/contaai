import { test, expect } from '@playwright/test'

test.describe('Session Library - Anonymous', () => {
  test('should load /my-session without login', async ({ page }) => {
    await page.goto('/my-session')
    await expect(page).toHaveURL('/my-session')
    await expect(page.getByRole('heading', { name: 'Minha Sessão' })).toBeVisible()
  })

  test('should show hero section with login and register CTAs', async ({ page }) => {
    await page.goto('/my-session')
    await expect(page.getByRole('link', { name: 'Fazer login' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Criar conta' })).toBeVisible()
  })

  test('should show Favoritos and Autores tabs', async ({ page }) => {
    await page.goto('/my-session')
    await expect(page.locator('button:has-text("Favoritos")')).toBeVisible()
    await expect(page.locator('button:has-text("Autores")')).toBeVisible()
  })

  test('should switch between tabs', async ({ page }) => {
    await page.goto('/my-session')
    await page.locator('button:has-text("Autores")').click()
    await expect(page.locator('button:has-text("Autores")')).toHaveClass(/text-white/)
  })

  test('should redirect to login on fazer login click', async ({ page }) => {
    await page.goto('/my-session')
    await page.getByRole('link', { name: 'Fazer login' }).click()
    await expect(page).toHaveURL('/login')
  })
})
