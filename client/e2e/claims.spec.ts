import { test, expect } from '@playwright/test';

test.describe('Claims Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Login as policyholder
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL('/');
  });

  test('should display dashboard', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Welcome back');
    await expect(page.locator('[data-testid="stats-cards"]')).toBeVisible();
  });

  test('should navigate to claims list', async ({ page }) => {
    await page.click('a[href="/claims"]');
    await expect(page).toHaveURL('/claims');
    await expect(page.locator('h1')).toContainText('Claims');
  });

  test('should create new claim', async ({ page }) => {
    // Navigate to new claim page
    await page.click('a[href="/claims/new"]');
    await expect(page).toHaveURL('/claims/new');
    
    // Fill out claim form
    await page.selectOption('select[name="policyId"]', 'POL-001');
    await page.click('button:has-text("Next")');
    
    await page.fill('input[name="incidentDate"]', '2024-01-15');
    await page.selectOption('select[name="incidentType"]', 'AUTO_ACCIDENT');
    await page.fill('textarea[name="description"]', 'Test accident description');
    await page.click('button:has-text("Next")');
    
    // Add claim item
    await page.selectOption('select[name="items.0.category"]', 'VEHICLE');
    await page.fill('input[name="items.0.description"]', 'Front bumper damage');
    await page.fill('input[name="items.0.estimatedCost"]', '1500');
    await page.click('button:has-text("Next")');
    
    // Skip document upload
    await page.click('button:has-text("Next")');
    
    // Review and submit
    await expect(page.locator('h3')).toContainText('Review Your Claim');
    await page.click('button:has-text("Submit Claim")');
    
    // Should redirect to claim detail page
    await expect(page).toHaveURL(/\/claims\/[a-f0-9-]+/);
    await expect(page.locator('h1')).toContainText('Claim Details');
  });

  test('should filter claims', async ({ page }) => {
    await page.goto('/claims');
    
    // Open filters
    await page.click('button:has-text("Filters")');
    
    // Filter by status
    await page.selectOption('select[name="status"]', 'SUBMITTED');
    
    // Verify filter is applied
    await expect(page.locator('[data-testid="claims-table"]')).toBeVisible();
  });

  test('should view claim details', async ({ page }) => {
    await page.goto('/claims');
    
    // Click on first claim
    await page.click('button:has-text("View"):first');
    
    // Should be on claim detail page
    await expect(page).toHaveURL(/\/claims\/[a-f0-9-]+/);
    await expect(page.locator('h1')).toContainText('Claim Details');
    await expect(page.locator('[data-testid="claim-overview"]')).toBeVisible();
  });
});

test.describe('Authentication', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Welcome back');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('button:has-text("Sign Out")');
    
    await expect(page).toHaveURL('/login');
  });
});
