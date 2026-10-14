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

test('stackup editor changes via thickness and supports local export',async({page,isMobile})=>{
 await page.goto('/');
 const navigate=async(label)=>{if(isMobile)await page.getByRole('button',{name:'Toggle navigation'}).click();await page.getByText(label,{exact:true}).last().click();};
 await navigate('Stackup designer');
 await expect(page.getByRole('heading',{name:'Stackup designer'})).toBeVisible();
 await expect(page.getByText('1.600 mm total')).toBeVisible();
 const downloadPromise=page.waitForEvent('download');
 await page.getByRole('button',{name:'Save JSON'}).click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toMatch(/stackup\.json$/);
 await navigate('Via parameters');
 await expect(page.getByRole('heading',{name:'Via parameters'})).toBeVisible();
 await expect(page.getByText('Board thickness')).toBeVisible();
 await expect(page.getByText('Electrical results')).toBeVisible();
});

test('microstrip tracks the active stackup',async({page,isMobile})=>{
 await page.goto('/');
 const nav=async(label)=>{if(isMobile)await page.getByRole('button',{name:'Toggle navigation'}).click();await page.getByText(label,{exact:true}).last().click();};
 await nav('Microstrip design');
 await page.getByRole('textbox',{name:'Geometry source'}).click();
 await page.getByRole('option',{name:/Active stackup · top signal/}).click();
 await expect(page.getByText(/Linked to Four-layer example/)).toBeVisible();
 await expect(page.getByRole('textbox',{name:'Reference plane distance'})).toBeDisabled();
 await nav('Stackup designer');
 await expect(page.getByRole('heading',{name:'Stackup designer'})).toBeVisible();
 await nav('Microstrip design');
 await expect(page.getByRole('heading',{name:'Microstrip design'})).toBeVisible();
});

test('invalid material curve is not committed',async({page,isMobile})=>{
 await page.goto('/');
 if(isMobile)await page.getByRole('button',{name:'Toggle navigation'}).click();
 await page.getByText('Stackup designer',{exact:true}).last().click();
 await expect(page.getByText('Material frequency samples').first()).toBeVisible();
 await page.getByRole('button',{name:'Apply curve'}).first().click();
 await expect(page.getByText('Source required').first()).toBeVisible();
});
