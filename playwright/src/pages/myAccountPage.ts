// src/pages/myAccountPage.ts
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./basePage";

// Page Heading: My Account
export class MyAccountPage {
  readonly page: Page;

  readonly pageHeading: Locator;
  readonly navHomeBtn: Locator;
  readonly navMyAccountBtn: Locator;
  readonly navCartBtn: Locator;
  readonly userFullName: Locator;
  readonly userEmail: Locator;
  readonly shippingName: Locator;
  readonly shippingStreet: Locator;
  readonly shippingCity: Locator;
  readonly shippingPostcode: Locator;
  readonly shippingCountry: Locator;
  readonly shippingPhone: Locator;
  readonly shippingEmail: Locator;
  readonly editAddressBtn: Locator;
  readonly orderRows: Locator;
  readonly shopNowBtn: Locator;
  readonly addAddressBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading = page.getByRole("heading", { name: "My Account" });
    this.navHomeBtn = page.getByRole("link", { name: "Home" });
    this.navMyAccountBtn = page.getByRole("link", { name: "My Account" });
    this.navCartBtn = page.getByRole("link", { name: "Cart" });

    this.userFullName = page.locator("#user-fullname");
    this.userEmail = page.locator("#user-email");

    this.shippingName = page.locator("#shipping-name");
    this.shippingStreet = page.locator("#shipping-street");
    this.shippingCity = page.locator("#shipping-city");
    this.shippingPostcode = page.locator("#shipping-postcode");
    this.shippingCountry = page.locator("#shipping-country");
    this.shippingPhone = page.locator("#shipping-phone");
    this.shippingEmail = page.locator("#shipping-email");
    this.editAddressBtn = page.getByRole("link", { name: "Edit Address" });

    this.shopNowBtn = page.getByRole("link", { name: "Shop Now" });
    this.addAddressBtn = page.getByRole("link", { name: "Add Address" });
    this.orderRows = page.locator("tbody > tr");
  }

  async assertPageHeading(heading: string) {
    await expect(this.pageHeading).toHaveText(heading);
  }

  async assertUserName(userFullName: string) {
    await expect(this.userFullName).toContainText(`${userFullName}`);
  }

  async assertUserEmail(userEmail: string) {
    await expect(this.userEmail).toContainText(`${userEmail}`);
  }

  async assertShippingStreet(street: string) {
    await expect(this.shippingStreet).toContainText(street);
  }

  async assertShippingCity(city: string) {
    await expect(this.shippingCity).toContainText(city);
  }

  async assertShippingPostcode(shippingPostcode: string) {
    await expect(this.shippingPostcode).toContainText(shippingPostcode);
  }

  async assertShippingCountry(shippingCountry: string) {
    await expect(this.shippingCountry).toContainText(shippingCountry);
  }

  async assertPhoneNumber(shippingPhone: string) {
    await expect(this.shippingPhone).toContainText(shippingPhone);
  }

  async getOrderCount(): Promise<number> {
    return await this.orderRows.count();
  }

  async deleteOrderByIndex(index: number) {
    const deleteBtn = this.orderRows
      .nth(index)
      .getByRole("button", { name: "Delete" });
    await deleteBtn.click();
  }

  async clickShopNowBtn() {
    await this.shopNowBtn.click();
  }

  async clickAddAddressBtn() {
    await this.addAddressBtn.click();
  }

  async clickHeaderHome() {
    await this.navHomeBtn.click();
  }

  async clickHeaderMyAccount() {
    await this.navMyAccountBtn.click();
  }

  async clickHeaderCart() {
    await this.navCartBtn.click();
  }
}
