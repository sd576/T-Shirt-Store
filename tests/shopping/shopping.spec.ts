import { test as base, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { homePage, Size } from '../registration/homePage';
import { cartPage } from './cartPage';
import { checkoutPage } from './checkoutPage';
import { orderPage } from './orderPage';

type HomePage = ReturnType<typeof homePage>;
type CartPage = ReturnType<typeof cartPage>;
type CheckoutPage = ReturnType<typeof checkoutPage>;
type OrderPage = ReturnType<typeof orderPage>;

const test = base.extend<{ homePage: HomePage, cartPage: CartPage, checkoutPage: CheckoutPage, orderPage: OrderPage }>({
    homePage: async ({ page }, use) => {
    await use(homePage(page));
    },
    cartPage: async ({ page }, use) => {
        await use(cartPage(page));
    },
    checkoutPage: async ({ page }, use) => {
        await use(checkoutPage(page));
    },
    orderPage: async ({ page }, use) => {
        await use(orderPage(page));
    }
});

const expectedFullName = 'John Doe';
const expectedAddress = 'Some Street Address 45';
const expectedCity = 'Madrid';
const expectedPostCode = 1112954;
const expectedCountry = 'Madrid';
const expectedEmail = 'john_doe@email.com';

test("Home page", async ({ page, homePage, cartPage, checkoutPage, orderPage }) => {
  await test.step('Guests should be able to add items to cart', async () => {
    // ARRANGE
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
    await expect.soft(cartPage.getItemQuantity()).toHaveValue('1');
    await expect.soft(cartPage.getItemTotal()).toHaveText(expectedPrice);
    await expect.soft(cartPage.getGrandTotal()).toHaveText(`Grand Total: ${expectedPrice}`);
  });

  await test.step('Guests should be able to go to checkout', async () => {
    // ACT
    await cartPage.goCheckout();
    await checkoutPage.goCheckoutAsGuest();
  
    // ASSERT
    await expect(page).toHaveURL(/\/checkout\/guest/);
  });

  await test.step('Guests should be able to go to payment page', async () => {
    // ACT
    await checkoutPage.typeFullName(expectedFullName);
    await checkoutPage.typeEmailAddress(expectedEmail);
    await checkoutPage.typeStreetAdddress(expectedAddress);
    await checkoutPage.typeCity(expectedCity);
    await checkoutPage.typePostcode(expectedPostCode);
    await checkoutPage.typeCountry(expectedCountry);
    await checkoutPage.continue();
  
    // ASSERT
    await expect(page).toHaveURL(/\/checkout\/payment/);
  });

  await test.step('Guests should be able to complete payment', async () => {
    // ACT
    await checkoutPage.typeCardNumber(3125621361267233);
    await checkoutPage.typeExpiryDate('12/29');
    await checkoutPage.typeCVV(778);
    const expectedTotal = await checkoutPage.getTotalPaid() ?? '';
    await checkoutPage.pay();
  
    // ASSERT
    await expect(page).toHaveURL(/\/checkout\/complete/);
    await expect.soft(orderPage.getOrderNumber()).toContainText('Order Number: ORD-');
    await expect.soft(orderPage.getStatus()).toHaveText('Status: Complete');
    await expect.soft(orderPage.getOrderDate()).toHaveText(`Order Date: ${new Date().toLocaleDateString()}`);
    await expect.soft(orderPage.getTotalPaid()).toHaveText(`Total Paid: ${expectedTotal}`);
    await expect.soft(orderPage.getFullName()).toHaveText(expectedFullName);
    await expect.soft(orderPage.getAddress()).toHaveText(expectedAddress);
    await expect.soft(orderPage.getCity()).toHaveText(expectedCity);
    await expect.soft(orderPage.getPostCode()).toHaveText(expectedPostCode.toString());
    await expect.soft(orderPage.getCountry()).toHaveText(expectedCountry);
    await expect.soft(orderPage.getEmail()).toHaveText(`Email: ${expectedEmail}`);
  });
})
