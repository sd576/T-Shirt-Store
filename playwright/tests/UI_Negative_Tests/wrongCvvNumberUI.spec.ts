import { test, expect } from "@playwright/test";
import { HomePage } from "../../src/pages/homePage";
import { ProductPage } from "../../src/pages/productPage";
import { CartPage } from "../../src/pages/cartPage";
import { CheckoutChoicePage } from "../../src/pages/checkoutChoicePage";
import { CheckoutPage } from "../../src/pages/checkoutPage";
import { GuestCheckoutPage } from "../../src/pages/guestCheckoutPage";
import { PaymentPage } from "../../src/pages/paymentPage";
import { CheckoutCompletePage } from "../../src/pages/checkoutCompletePage";

test("should reject CVV of 999 with validation error", async ({ page }) => {
  const order = {
    fullName: "Geoff Stone",
    email: "gs@bt.com",
    street: "44 High St",
    city: "Northwood",
    postcode: "HA6 1EB",
    country: "United Kingdom",
    productName: "Black T-Shirt",
    size: "L",
    quantity: 4,
    price: "£15.99",
    total: "£63.96",
  };

  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutChoicePage = new CheckoutChoicePage(page);
  const checkoutPage = new CheckoutPage(page);
  const guestCheckoutPage = new GuestCheckoutPage(page);
  const paymentPage = new PaymentPage(page);
  const checkoutCompletePage = new CheckoutCompletePage(page);

  await homePage.goto();
  await homePage.clickProductCardByName("Union Jack T-Shirt");

  await productPage.assertPageHeading("Union Jack T-Shirt");
  await productPage.selectSize("L");
  await productPage.setQuantity(5);
  await productPage.addToCart();

  await cartPage.assertPageHeading("Your Shopping Cart");
  await cartPage.assertCartItemCount(1);
  await cartPage.assertCartItem(0, {
    productName: "Union Jack T-Shirt",
    size: "L",
    price: "£18.99",
    quantity: 5,
    total: "£94.95",
  });
  await cartPage.assertGrandTotal("£94.95");
  await cartPage.clickProceedToCheckout();

  await checkoutChoicePage.assertPageHeading("How Would You Like to Checkout?");
  await checkoutChoicePage.checkoutAsGuest();

  await guestCheckoutPage.assertPageHeading("Checkout");
  await guestCheckoutPage.fullName("Matt Sterling");
  await guestCheckoutPage.emailAddress("ms@bt.com");
  await guestCheckoutPage.phoneNumber("07967 886655");
  await guestCheckoutPage.streetAddress("38 High Street");
  await guestCheckoutPage.city("Northwood");
  await guestCheckoutPage.postcode("HA6 1EB");
  await guestCheckoutPage.country("United Kingdom");
  await guestCheckoutPage.clickContinue();

  await paymentPage.assertPageHeading("Enter Your Payment Details");
  await paymentPage.enterCardNumber("4242424242424242");
  await paymentPage.enterExpiryDate("12/26");
  await paymentPage.enterCvvNumber("999");
  await paymentPage.clickPay();

  await expect(page.locator(".alert.alert-danger")).toContainText(
    "CVV must be 3 digits and cannot be 000 or 999."
  );

  await page.screenshot({ path: "cvv-validation-message.png", fullPage: true });
});
