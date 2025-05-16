import { test, expect } from "@playwright/test";
import { HomePage } from "../../src/pages/homePage";
import { ProductPage } from "../../src/pages/productPage";
import { CartPage } from "../../src/pages/cartPage";
import { CheckoutPage } from "../../src/pages/checkoutPage";
import { LoginPage } from "../../src/pages/loginPage";
import { PaymentPage } from "../../src/pages/paymentPage";
import { CheckoutCompletePage } from "../../src/pages/checkoutCompletePage";

test("Registered user checkout - 2 Black L T-Shirts end-to-end", async ({
  page,
}) => {
  const user = {
    email: "john@example.com",
    password: "password",
  };

  const order = {
    fullName: "John Doe",
    email: "john@example.com",
    street: "100 Main St",
    city: "London",
    postcode: "W1A 1AA",
    country: "United Kingdom",
    productName: "Black T-Shirt",
    size: "L",
    quantity: 2,
    price: "£15.99",
    total: "£31.98",
  };

  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const loginPage = new LoginPage(page);
  const paymentPage = new PaymentPage(page);
  const checkoutCompletePage = new CheckoutCompletePage(page);

  await homePage.goto();
  await expect(homePage.getPageHeadingText()).resolves.toContain(
    "Welcome to The T Shirt Store"
  );

  await homePage.goToLogin();

  await loginPage.assertPageHeading("Login to Your Account");
  await loginPage.clickClearFormButton();
  await loginPage.enterEmailAddress("john@example.com");
  await loginPage.enterPassword("password");
  await loginPage.clickLoginButton();

  await homePage.goto();
  await homePage.clickProductCardByName("Black T-Shirt");

  await productPage.assertPageHeading("Black T-Shirt");
  await productPage.selectSize("L");
  await productPage.setQuantity(4);
  await productPage.addToCart();

  await cartPage.assertPageHeading("Your Shopping Cart");
  await cartPage.assertCartItemCount(1);
  await cartPage.assertCartItem(0, {
    productName: "Black T-Shirt",
    size: "L",
    price: "£15.99",
    quantity: 4,
    total: "£63.96",
  });
  await cartPage.assertGrandTotal("£63.96");
  await cartPage.clickProceedToCheckout();

  await checkoutPage.assertPageHeading("Checkout");
  await checkoutPage.assertShippingName("John Doe");
  await checkoutPage.assertShippingEmail("john@example.com");
  await checkoutPage.assertShippingStreet("123 Main St");
  await checkoutPage.assertShippingCity("London");
  await checkoutPage.assertShippingPostcode("EC1A 1BB");
  await checkoutPage.assertShippingCountry("UK");

  await checkoutPage.clickContinueButton();

  await paymentPage.assertPageHeading("Enter Your Payment Details");
  await paymentPage.enterCardNumber("4242424242424242");
  await paymentPage.enterExpiryDate("12/26");
  await paymentPage.enterCvvNumber("123");
  await paymentPage.clickPay();

  await checkoutCompletePage.assertH1Heading("Thank You for Your Order!");
  await checkoutCompletePage.assertTotalPaid("£63.96");

  await checkoutCompletePage.clickContinueShoppingBtn();
});
