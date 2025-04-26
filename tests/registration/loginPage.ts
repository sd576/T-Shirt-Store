import { Page } from "@playwright/test";

export const loginPage = (page: Page) => ({
    go: async () => {
        page.goto('./login');
    },
    inputEmail: async (email: string) => {
        const emailInputField = page.getByLabel('Email address');
        await emailInputField.click();
        await emailInputField.fill(email);
    },
    inputPassword: async (password: string) => {
        const passwordInputField = page.getByLabel('Password');
        await passwordInputField.click();
        await passwordInputField.fill(password);
    },
    logIn: async () => {
        await page.getByRole('button', { name: 'Login' }).click();
    }
});