import { Page } from "@playwright/test";

export const cartPage = (page: Page) => ({
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
    // await page.getByRole('link', { name: 'Proceed to Checkout' }).click();
    // await page.getByRole('link', { name: 'Checkout as Guest' }).click();
});