import { test, expect } from '@playwright/test';
import { registrationPage } from './registrationPage';

test('test', async ({ page }) => {
  // ACT
  await page.goto('http://localhost:3000/');

  await registrationPage(page).navigate();
  await registrationPage(page).inputUsername('someName');
  await registrationPage(page).inputEmail('someEmail');
  await registrationPage(page).inputPassword('somePassword');
  // await page.getByRole('button', { name: 'Clear Form' }).click();
  await registrationPage(page).submit();

  // ASSERT

});
