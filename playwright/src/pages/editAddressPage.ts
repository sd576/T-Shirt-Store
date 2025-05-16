// src/pages/editAddressPage.ts
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./basePage";

export class EditAddressPage {
  readonly page: Page;

  readonly pageHeading: Locator;
  readonly fullName: Locator;
  readonly email: Locator;
  readonly street: Locator;
  readonly addressLine2: Locator;
  readonly city: Locator;
  readonly postcode: Locator;
  readonly country: Locator;
  readonly phone: Locator;
  readonly saveBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading = page.getByRole("heading", { name: "Edit Shipping Address" });
    this.fullName = page.locator("#full_name");
    this.email = page.locator("#email");
    this.street = page.locator("#street");
    this.addressLine2 = page.locator("#address_line2");
    this.city = page.locator("#city");
    this.postcode = page.locator("#postcode");
    this.country = page.locator("#country");
    this.phone = page.locator("#phone");
    this.saveBtn = page.getByRole("button", { name: "Save" });
  }

  async assertPageHeading(heading: string) {
    await expect(this.pageHeading).toHaveText(heading);
  }

  async enterShippingStreet(street: string) {
    await this.street.waitFor({ state: "visible" });
    await this.street.fill(street);
  }

  async enterAddressLine2(addressLine2: string) {
    await this.addressLine2.waitFor({ state: "visible" });
    await this.addressLine2.fill(addressLine2);
  }

  async enterShippingCity(city: string) {
    await this.city.waitFor({ state: "visible" });
    await this.city.fill(city);
  }

  async enterShippingPostcode(postcode: string) {
    await this.postcode.waitFor({ state: "visible" });
    await this.postcode.fill(postcode);
  }

  async enterShippingCountry(country: string) {
    await this.country.waitFor({ state: "visible" });
    await this.country.fill(country);
  }

  async enterShippingPhone(phone: string) {
    await this.phone.waitFor({ state: "visible" });
    await this.phone.fill(phone);
  }

  async enterShippingEmail(shippingEmail: string) {
    await this.phone.waitFor({ state: "visible" });
    await this.phone.fill(shippingEmail);
  }

  async clickSave() {
    await this.saveBtn.click();
  }
}
