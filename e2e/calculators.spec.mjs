import { test, expect } from '@playwright/test';
test('thermal calculator shows a finite result and source', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', {name: 'Conductor thermal'})).toBeVisible();
  await expect(page.getByText('Estimated temperature rise')).toBeVisible();
  await expect(page.getByRole('link', {name: /Trace Currents and Temperatures Revisited/i})).toBeVisible();
  await expect(page.locator('body')).not.toContainText('NaN');
});
test('microstrip analysis and target impedance synthesis', async ({page,isMobile}) => {
  await page.goto('/');
  if(isMobile) await page.getByRole('button',{name:/toggle navigation/i}).first().click().catch(async()=>{await page.locator('button[aria-label]').first().click()});
  await page.getByText('Microstrip design', {exact:true}).last().click();
  await expect(page.getByRole('heading', {name: 'Microstrip design'})).toBeVisible();
  await expect(page.getByText('Width for 50.0 Ω')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('NaN');
});
