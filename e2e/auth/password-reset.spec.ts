import { test, expect } from '@playwright/test'

test.describe('Auth - Password Reset', () => {
  test('should show forgot password link on login page', async ({ page }) => {
    await page.goto('/login')
    const forgotLink = page.getByRole('link', { name: 'Esqueceu a senha' })
    await expect(forgotLink).toBeVisible()
    await expect(forgotLink).toHaveAttribute('href', '/forgot-password')
  })
})
