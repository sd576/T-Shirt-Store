import { test as base, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { homePage, Size } from '../registration/homePage';
import { cartPage } from './cartPage';

type HomePage = ReturnType<typeof homePage>;
type CartPage = ReturnType<typeof cartPage>;

const generateNumericalSuffix = () => generateNumericalSuffixBetween(1000, 9999);

const generateNumericalSuffixBetween = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const test = base.extend<{ homePage: HomePage, cartPage: CartPage }>({
    homePage: async ({ page }, use) => {
    await use(homePage(page));
    },
    cartPage: async ({ page }, use) => {
        await use(cartPage(page));
    }
});

test("Home page", async ({ page, homePage, cartPage }) => {
  await test.step('Guests should be able to add items to cart', async () => {
    // ARRANGE\
    const expectedItem = 'Black T-Shirt';
    const expectedSize: Size = 'XL';

    // ACT
    await homePage.go();
    await homePage.selectSizeFor(expectedItem, expectedSize);
    const expectedPrice = await homePage.getPriceFor(expectedItem).textContent() ?? "";
    await homePage.addToCart(expectedItem);
  
    // ASSERT
    await expect(page).toHaveURL(/\/cart/);
    await expect.soft(cartPage.getItemName()).toHaveText(expectedItem);
    await expect.soft(cartPage.getItemSize()).toHaveText(`Size: ${expectedSize}`);
    await expect.soft(cartPage.getItemTotal()).toHaveText(expectedPrice);
    await expect.soft(cartPage.getItemQuantity()).toHaveValue("1");
    await expect.soft(cartPage.getItemTotal()).toHaveText(expectedPrice);
    await expect.soft(cartPage.getGrandTotal()).toHaveText(`Grand Total: ${expectedPrice}`);
  });
})
