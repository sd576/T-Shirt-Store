import { test as base, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { registrationPage } from './registrationPage';
import { homePage } from './homePage';
import { loginPage } from './loginPage';
import { myAccountPage } from './myAccountPage';

type RegistrationPage = ReturnType<typeof registrationPage>;
type HomePage = ReturnType<typeof homePage>;
type LoginPage = ReturnType<typeof loginPage>;
type MyAccountPage = ReturnType<typeof myAccountPage>;

const generateNumericalSuffix = () => generateNumericalSuffixBetween(1000, 9999);

const generateNumericalSuffixBetween = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const test = base.extend<{ registrationPage: RegistrationPage, homePage: HomePage, loginPage: LoginPage, myAccountPage: MyAccountPage }>({
  registrationPage: async ({ page }, use) => {
    await use(registrationPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(homePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(loginPage(page));
  },
  myAccountPage: async ({ page }, use) => {
    await use(myAccountPage(page));
  }
});

test("Registration page", async ({ page, homePage, registrationPage, loginPage, myAccountPage }) => {
  const someValidUsername = `someName${generateNumericalSuffix()}`;
  const someValidEmail = `someEmail${generateNumericalSuffix()}@email.com`;
  const someValidPassword = `somePassword${generateNumericalSuffix()}`;

  await test.step('Successful registration should navigate to login page', async () => {
    // ACT
    await homePage.go();
    await homePage.goRegister();
    await registrationPage.inputUsername(someValidUsername);
    await registrationPage.inputEmail(someValidEmail);
    await registrationPage.inputPassword(someValidPassword);
    await registrationPage.submit();
  
    // ASSERT
    await expect(registrationPage.getSuccessMessage()).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  await test.step('Existing User can login', async () => {
    // ACT
    await loginPage.inputEmail(someValidEmail);
    await loginPage.inputPassword(someValidPassword);
    await loginPage.logIn();

    // ASSERT
    await expect(page).toHaveURL(/\/my-account/);
    await expect(myAccountPage.getWelcomeMessage()).toHaveText(` Welcome, ${someValidUsername}! `, { ignoreCase: true });
    await expect(myAccountPage.getFullName()).toHaveText(`Username: ${someValidUsername}`);
    await expect(myAccountPage.getEmail()).toHaveText(`Email: ${someValidEmail}`);
  });

  await test.step('Existing User can log out', async () => {
    // ACT
    await myAccountPage.logOut();

    // ASSERT
    await expect(page).toHaveURL(/\/login/);
  });
})
