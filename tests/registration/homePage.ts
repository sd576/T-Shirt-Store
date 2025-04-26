import { Page } from "@playwright/test";

export const homePage = (page: Page) => ({
    go: async () => {
        await page.goto('.');
    },
    goRegister: async () => {
        await page.getByText('Register').click();
    }
});