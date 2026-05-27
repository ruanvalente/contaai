import { test, expect } from '@playwright/test'

test.describe('Auth - Login', () => {
  test('should load the login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: 'Bem-vindo de volta' })).toBeVisible()
    await expect(page.locator('#login-email')).toBeVisible()
    await expect(page.locator('#login-password')).toBeVisible()
  })

  test('should show submit button with Entrar text', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Cadastre-se' }).click()
    await expect(page).toHaveURL('/register')
  })

  test('should show forgot password link', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('link', { name: 'Esqueceu a senha' })).toBeVisible()
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#login-email', 'invalido@email.com')
    await page.fill('#login-password', 'senhaerrada')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.locator('[role="alert"]')).toBeVisible()
  })

  test('should navigate to home via logo link', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /ContaAI/i }).click()
    await expect(page).toHaveURL('/')
  })
})
