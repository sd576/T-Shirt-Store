// src/pages/guestCheckoutPage.ts
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./basePage";

interface GuestDetails {
  fullName: string;
  email: string;
  street: string;
  city: string;
  postcode: string;
  country: string;
  phoneNumber?: string;
}

export class GuestCheckoutPage extends BasePage {
  readonly pageHeading: Locator;

  private fullNameInput: Locator;
  private emailAddressInput: Locator;
  private phoneNumberInput: Locator;
  private streetAddressInput: Locator;
  private cityInput: Locator;
  private postcodeInput: Locator;
  private countryInput: Locator;
  private continueBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole("heading", { name: "Checkout" });

    this.fullNameInput = page.getByRole("textbox", { name: "Full Name" });
    this.emailAddressInput = page.getByRole("textbox", { name: "Email Address" });
    this.phoneNumberInput = page.getByRole("textbox", {
      name: "Phone Number (optional)",
    });
    this.streetAddressInput = page.getByRole("textbox", { name: "Street Address" });
    this.cityInput = page.getByRole("textbox", { name: "City" });
    this.postcodeInput = page.getByRole("textbox", { name: "Postcode" });
    this.countryInput = page.getByRole("textbox", { name: "Country" });
    this.continueBtn = page.getByRole("button", { name: "Continue" });
  }

  // ─── Setters ──────────────────────────────────────────────

  async fullName(value: string) {
    await this.fullNameInput.fill(value);
  }

  async emailAddress(value: string) {
    await this.emailAddressInput.fill(value);
  }

  async phoneNumber(value: string) {
    await this.phoneNumberInput.fill(value);
  }

  async streetAddress(value: string) {
    await this.streetAddressInput.fill(value);
  }

  async city(value: string) {
    await this.cityInput.fill(value);
  }

  async postcode(value: string) {
    await this.postcodeInput.fill(value);
  }

  async country(value: string) {
    await this.countryInput.fill(value);
  }

  async clickContinue() {
    await this.continueBtn.click();
  }

  // ─── Assertions ───────────────────────────────────────────

  async assertPageHeading(expected: string = "Checkout") {
    await expect(this.pageHeading).toHaveText(expected);
  }

  async assertOrderItemSummary(
    product: string,
    size: string,
    quantity: number,
    price: string
  ) {
    const summaryText = `${product} (Size: ${size}) Qty: ${quantity} ${price}`;
    await expect(this.page.getByText(summaryText)).toBeVisible();
  }

  async assertOrderTotal(total: string) {
    await expect(this.page.getByText(`Total ${total}`)).toBeVisible();
  }
}
