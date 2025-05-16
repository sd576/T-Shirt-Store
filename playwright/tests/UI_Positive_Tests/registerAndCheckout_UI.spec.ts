import { test, expect } from "@playwright/test";

import { HomePage } from "../../src/pages/homePage";
import { RegisterPage } from "../../src/pages/registerPage";
import { LoginPage } from "../../src/pages/loginPage";
import { MyAccountPage } from "../../src/pages/myAccountPage";
import { EditAddressPage } from "../../src/pages/editAddressPage";
import { ProductPage } from "../../src/pages/productPage";
import { CartPage } from "../../src/pages/cartPage";
import { CheckoutPage } from "../../src/pages/checkoutPage";
import { PaymentPage } from "../../src/pages/paymentPage";
import { CheckoutCompletePage } from "../../src/pages/checkoutCompletePage";

test("Register then Checkout end-to-end", async ({ page }) => {
  const testUser = {
    name: "Marc Bolan",
    email: "mbolan@bt.com",
    password: "password",
    street: "46 High Street",
    city: "Northwood",
    postcode: "HA6 1EB",
    country: "United Kingdom",
  };

  const homePage = new HomePage(page);
  const registerPage = new RegisterPage(page);
  const loginPage = new LoginPage(page);
  const myAccountPage = new MyAccountPage(page);
  const editAddressPage = new EditAddressPage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const paymentPage = new PaymentPage(page);
  const checkoutCompletePage = new CheckoutCompletePage(page);

  // 1. Go to homepage and register
  await homePage.goto();
  await expect(homePage.getPageHeadingText()).resolves.toContain(
    "Welcome to The T Shirt Store"
  );
  await homePage.goToRegister();

  await registerPage.enterName("Marc Bolan");
  await registerPage.enterEmail("mbolan@bt.com");
  await registerPage.enterPassword("password");
  await registerPage.clickRegisterButton();

  await loginPage.assertPageHeading("Login to Your Account");
  await loginPage.clickClearFormButton();
  await loginPage.enterEmailAddress("mbolan@bt.com");
  await loginPage.enterPassword("password");
  await loginPage.clickLoginButton();

  await myAccountPage.assertPageHeading("My Account");
  await myAccountPage.assertUserName("Marc Bolan");
  await myAccountPage.assertUserEmail("mbolan@bt.com");
  await myAccountPage.clickAddAddressBtn();

  await editAddressPage.assertPageHeading("Edit Shipping Address");
  await editAddressPage.enterShippingStreet("33 High Street");
  await editAddressPage.enterShippingCity("Northwood");
  await editAddressPage.enterShippingPostcode("HA6 1EB");
  await editAddressPage.enterShippingCountry("United Kingdom");
  await editAddressPage.enterShippingPhone("020 1234 5678");
  await editAddressPage.clickSave();

  await myAccountPage.assertShippingStreet("33 High Street");
  await myAccountPage.assertShippingCity("Northwood");
  await myAccountPage.assertShippingPostcode("HA6 1EB");
  await myAccountPage.assertShippingCountry("United Kingdom");
  await myAccountPage.assertPhoneNumber("020 1234 5678");
  await myAccountPage.clickHeaderHome();

  await homePage.clickProductCardByName("Union Jack T-Shirt");

  await productPage.assertPageHeading("Union Jack T-Shirt");
  await productPage.selectSize("XL");
  await productPage.setQuantity(4);
  await productPage.addToCart();

  await cartPage.assertPageHeading("Your Shopping Cart");
  await cartPage.assertCartItemCount(1);
  await cartPage.assertCartItem(0, {
    productName: "Union Jack T-Shirt",
    size: "XL",
    price: "£18.99",
    quantity: 4,
    total: "£75.96",
  });
  await cartPage.assertGrandTotal("£75.96");
  await cartPage.clickProceedToCheckout();

  await checkoutPage.assertPageHeading("Checkout");
  await checkoutPage.assertShippingName("Marc Bolan");
  await checkoutPage.assertShippingEmail("mbolan@bt.com");
  await checkoutPage.assertShippingStreet("33 High Street");
  await checkoutPage.assertShippingCity("Northwood");
  await checkoutPage.assertShippingPostcode("HA6 1EB");
  await checkoutPage.assertShippingCountry("United Kingdom");
  await checkoutPage.clickContinueButton();

  await paymentPage.assertPageHeading("Enter Your Payment Details");
  await paymentPage.enterCardNumber("4242424242424242");
  await paymentPage.enterExpiryDate("12/26");
  await paymentPage.enterCvvNumber("123");
  await paymentPage.clickPay();

  await checkoutCompletePage.assertH1Heading("Thank You for Your Order!");
  await checkoutCompletePage.assertTotalPaid("£75.96");
});

import sqlite3 from "sqlite3";
import { open } from "sqlite";

test.afterAll(async () => {
  console.log("🧹 afterAll: Deleting user Marc Bolan directly from DB...");

  const db = await open({
    filename:
      "/Volumes/Stuarts Documents/Playwright_T_Shirt_Store/T_Shirt_Store/database/ecommerce.db",
    driver: sqlite3.Database,
  });

  await db.run("DELETE FROM users WHERE email = ?", "mbolan@bt.com");

  console.log("✅ Deleted Marc Bolan directly from SQLite");

  await db.close();
});
