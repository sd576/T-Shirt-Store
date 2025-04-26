import { Page } from "@playwright/test";

export const myAccountPage = (page: Page) => {
    const logOutButton = page.getByRole('link').getByText('Logout');

    return {
        go: async () => {
            page.goto('./my-account');
        },
        inputEmail: async (email: string) => {
            const emailInputField = page.getByLabel('Email address');
            await emailInputField.click();
            await emailInputField.fill(email);
        },
        logOut: async () => {
            await logOutButton.click();
        },
        getWelcomeMessage: () => {
            return page.getByTestId('welcome-message');
        },
        getLogoutButton: () => {
            return logOutButton;
        },
        getFullName: () => {
            return page.locator('#user-fullname');
        },
        getEmail: () => {
            return page.locator('#user-email');
        }
    }
};