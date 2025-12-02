import { test, expect } from '@playwright/test';

test('dashboard loads correctly', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.locator('h1')).toContainText('Algorithmic Tokenomics');
  await expect(page.getByRole('heading', { name: 'Trading Volume' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Buyback Pot' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '30-Day Projection' })).toBeVisible();
  
  // Check for analytics section
  await expect(page.getByText('Your Analytics')).toBeVisible();
  await expect(page.getByText('Your Trading Volume')).toBeVisible();

  // Check for Swap Card
  await expect(page.getByRole('heading', { name: 'Instant Swap' })).toBeVisible();
});

test('staking button is present', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.locator('text=Stake Tokens')).toBeVisible();
});