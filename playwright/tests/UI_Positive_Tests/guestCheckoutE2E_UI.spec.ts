import { test, expect } from "@playwright/test";
import { HomePage } from "../../src/pages/homePage";
import { ProductPage } from "../../src/pages/productPage";
import { CartPage } from "../../src/pages/cartPage";
import { CheckoutChoicePage } from "../../src/pages/checkoutChoicePage";
import { GuestCheckoutPage } from "../../src/pages/guestCheckoutPage";
import { PaymentPage } from "../../src/pages/paymentPage";
import { CheckoutCompletePage } from "../../src/pages/checkoutCompletePage";

test("Guest checkout - Blue M size T-Shirt end-to-end", async ({ page }) => {
  const order = {
    fullName: "Bob Blogs",
    email: "bb@bt.com",
    street: "32 High St",
    city: "Northwood",
    postcode: "HA6 1EB",
    country: "United Kingdom",
    productName: "Blue T-Shirt", // was 'Red T-Shirt' before — fix for consistency
    size: "M",
    quantity: 2,
    price: "£15.99",
    total: "£31.98",
  };

  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutChoicePage = new CheckoutChoicePage(page);
  const guestCheckoutPage = new GuestCheckoutPage(page);
  const paymentPage = new PaymentPage(page);
  const checkoutCompletePage = new CheckoutCompletePage(page);

  // ─── Home ──────────────────────────────────────────────
  await homePage.goto();
  await expect(homePage.getPageHeadingText()).resolves.toContain(
    "Welcome to The T Shirt Store"
  );

  await homePage.clickProductCardByName("Blue T-Shirt");

  // ─── Product Page ──────────────────────────────────────
  await productPage.assertPageHeading("Blue T-Shirt");
  await productPage.selectSize("M");
  await productPage.setQuantity(2);
  await productPage.addToCart(); // now waits for cart to render

  // ─── Cart Page ─────────────────────────────────────────
  // await cartPage.assertPageHeading("Your Shopping Cart");
  await cartPage.assertCartItemCount(1);
  await cartPage.assertCartItem(0, {
    productName: "Blue T-Shirt",
    size: "M",
    price: "£15.99",
    quantity: 2,
    total: "£31.98",
  });
  await cartPage.assertGrandTotal("£31.98");
  await cartPage.clickProceedToCheckout();

  // ─── Checkout Choice Page ──────────────────────────────
  await checkoutChoicePage.assertPageHeading("How Would You Like to Checkout?");
  await checkoutChoicePage.checkoutAsGuest();

  // ─── Guest Checkout Form ───────────────────────────────
  await guestCheckoutPage.assertPageHeading("Checkout");
  await guestCheckoutPage.fullName(order.fullName);
  await guestCheckoutPage.emailAddress(order.email);
  await guestCheckoutPage.phoneNumber("07967 114433");
  await guestCheckoutPage.streetAddress(order.street);
  await guestCheckoutPage.city(order.city);
  await guestCheckoutPage.postcode(order.postcode);
  await guestCheckoutPage.country(order.country);
  await guestCheckoutPage.clickContinue();

  // ─── Payment Page ──────────────────────────────────────
  await paymentPage.assertPageHeading("Enter Your Payment Details");
  await paymentPage.enterCardNumber("4242424242424242");
  await paymentPage.enterExpiryDate("12/26");
  await paymentPage.enterCvvNumber("123");
  await paymentPage.clickPay();

  // ─── Confirmation ──────────────────────────────────────
  await checkoutCompletePage.assertH1Heading("Thank You for Your Order!");
  await checkoutCompletePage.assertTotalPaid("£31.98");
  await checkoutCompletePage.clickContinueShoppingBtn();
});
