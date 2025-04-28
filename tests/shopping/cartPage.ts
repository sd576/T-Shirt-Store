import { Page } from "@playwright/test";

export const cartPage = (page: Page) => ({
    goCheckout: async () => {
        await page.getByRole('link', { name: 'Proceed to Checkout' }).click();
    },
    getImage: () => {
        return page.getByTestId('image');
    },
    getItemName: () => {
        return page.getByTestId('item-name');
    },
    getItemSize: () => {
        return page.getByTestId('item-size');
    },
    getItemQuantity: () => {
        return page.getByTestId('item-quantity');
    },
    getItemTotal: () => {
        return page.getByTestId('item-total');
    },
    getGrandTotal: () => {
        return page.getByTestId('grand-total');
    }
});