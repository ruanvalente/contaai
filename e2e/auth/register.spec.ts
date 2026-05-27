import { test, expect } from '@playwright/test'

test.describe('Auth - Register', () => {
  test('should load the register page', async ({ page }) => {
    await page.goto('/register')
    await expect(page).toHaveURL('/register')
    await expect(page.getByRole('heading', { name: 'Criar conta' })).toBeVisible()
    await expect(page.locator('#register-name')).toBeVisible()
    await expect(page.locator('#register-email')).toBeVisible()
    await expect(page.locator('#register-password')).toBeVisible()
    await expect(page.locator('#register-confirm-password')).toBeVisible()
  })

  test('should show submit button with Criar conta text', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('link', { name: 'Entre' }).click()
    await expect(page).toHaveURL('/login')
  })

  test('should show terms and privacy links', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('link', { name: 'Termos de Uso' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Política de Privacidade' })).toBeVisible()
  })

  test('should show error on empty submission', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('button', { name: 'Criar conta' }).click()
    await expect(page.locator('[role="alert"]')).toBeVisible()
  })

  test('should navigate to home via logo link', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('link', { name: /ContaAI/i }).click()
    await expect(page).toHaveURL('/')
  })
})
