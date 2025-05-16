// src/pages/checkoutPage.ts
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./basePage";

export class CheckoutPage extends BasePage {
  // Headings and actions
  readonly pageHeading: Locator;
  readonly proceedToPaymentBtn: Locator;

  // Shipping details (static, rendered as text)
  readonly shippingName: Locator;
  readonly shippingEmail: Locator;
  readonly shippingStreet: Locator;
  readonly shippingCity: Locator;
  readonly shippingPostcode: Locator;
  readonly shippingCountry: Locator;

  // Order summary elements
  readonly productSummary: Locator;
  readonly productQuantity: Locator;
  readonly productPrice: Locator;
  readonly orderTotal: Locator;

  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);

    this.pageHeading = page.locator("main h1"); // "Review Your Order"
    this.proceedToPaymentBtn = page.getByRole("button", {
      name: "Proceed to Payment",
    });

    this.shippingName = page.locator("#name");
    this.shippingEmail = page.locator("#email");
    this.shippingStreet = page.locator("#street");
    this.shippingCity = page.locator("#city");
    this.shippingPostcode = page.locator("#postcode");
    this.shippingCountry = page.locator("#country");
    this.productSummary = page.locator(".product-summary");
    this.productQuantity = page.locator(".product-quantity");
    this.productPrice = page.locator("#product-price");
    this.orderTotal = page.locator("#order-total");
    this.continueButton = page.getByRole("button", { name: "Continue" });
  }

  // ─── Page Heading ─────────────────────────────────────────
  async assertPageHeading(expected: string) {
    await expect(this.pageHeading).toHaveText(expected);
  }

  // ─── Shipping Info Assertions ─────────────────────────────
  async assertShippingDetails({
    fullName,
    email,
    street,
    city,
    postcode,
    country,
  }: {
    fullName: string;
    email: string;
    street: string;
    city: string;
    postcode: string;
    country: string;
  }) {
    await expect(this.shippingName).toContainText(fullName);
    await expect(this.shippingEmail).toContainText(email);
    await expect(this.shippingStreet).toContainText(street);
    await expect(this.shippingCity).toContainText(city);
    await expect(this.shippingPostcode).toContainText(postcode);
    await expect(this.shippingCountry).toContainText(country);
  }

  async assertShippingName(expectedText: string) {
    await expect(this.shippingName).toHaveValue(expectedText);
  }

  async assertShippingEmail(expectedText: string) {
    await expect(this.shippingEmail).toHaveValue(expectedText);
  }

  async assertShippingStreet(expectedText: string) {
    await expect(this.shippingStreet).toHaveValue(expectedText);
  }

  async assertShippingCity(expectedText: string) {
    await expect(this.shippingCity).toHaveValue(expectedText);
  }

  async assertShippingPostcode(expectedText: string) {
    await expect(this.shippingPostcode).toHaveValue(expectedText);
  }

  async assertShippingCountry(expectedText: string) {
    await expect(this.shippingCountry).toHaveValue(expectedText);
  }

  async assertProductSummary(expectedText: string) {
    await expect(this.productSummary).toHaveText(expectedText);
  }

  async assertProductQuantity(expectedText: string) {
    await expect(this.productQuantity).toHaveText(expectedText);
  }

  async assertProductPrice(expectedText: string) {
    await expect(this.productPrice).toHaveText(expectedText);
  }

  async assertOrderTotal(expectedText: string) {
    await expect(this.orderTotal).toHaveText(expectedText);
  }

  // ─── Action ───────────────────────────────────────────────
  async clickContinueButton() {
    await Promise.all([
      this.page.waitForNavigation({ url: /\/checkout\/payment/ }),
      this.continueButton.click(),
    ]);
  }
}
