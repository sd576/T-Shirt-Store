import { Page } from "@playwright/test";

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';

export const homePage = (page: Page) => {
    const itemCard = (itemName: string) => page.getByTestId(itemName.toLowerCase().replace(" ", "_"));

    return {
        go: async () => {
            await page.goto('.');
        },
        goRegister: async () => {
            await page.getByText('Register').click();
        },
        selectSizeFor: async (itemName: string, size: Size) => {
            await itemCard(itemName).locator('select[name="size"]').selectOption(size);
        },
        addToCart: async (itemName: string) => {
            await itemCard(itemName).getByRole('button', { name: 'Add to Cart' }).click();
        },
        getPriceFor: (itemName: string) => {
            return itemCard(itemName).getByTestId('card-price');
        }
    }
};
