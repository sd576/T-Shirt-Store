import { Page, Locator, expect } from "@playwright/test";

export class CheckoutChoicePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly guestBtn: Locator;
  readonly loginBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 });
    this.guestBtn = page.getByRole("link", { name: /checkout as guest/i });
    this.loginBtn = page.getByRole("button", { name: "Log In" });
  }

  async assertPageHeading(expected: string) {
    await expect(this.heading).toHaveText(expected);
  }

  async checkoutAsGuest() {
    await this.guestBtn.click();
  }

  async clickLogin() {
    await this.loginBtn.click();
  }
}
