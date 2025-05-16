// src/pages/basePage.ts
import { Page, Locator } from "@playwright/test";

export class BasePage {
  readonly page: Page;
  readonly brandLink: Locator;
  readonly homeLink: Locator;
  readonly cartLink: Locator;
  readonly loginLink: Locator;
  readonly registerLink: Locator;
  readonly logoutButton: Locator;
  readonly myAccountLink: Locator;
  readonly welcomeMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.brandLink = page.getByRole("link", { name: "The T Shirt Store" });
    this.homeLink = page.getByRole("link", { name: "Home" });
    this.cartLink = page.getByRole("link", { name: "Cart" });
    this.loginLink = page.getByRole("link", { name: "Login" });
    this.registerLink = page.getByRole("link", { name: "Register" });
    this.logoutButton = page.getByRole("link", { name: "Logout" });
    this.myAccountLink = page.getByRole("link", { name: "My Account" });
    this.welcomeMessage = page.locator("span.nav-link", { hasText: "Welcome" });
  }

  async clickBrand() {
    await this.brandLink.click();
  }

  async clickHome() {
    await this.homeLink.click();
  }

  async clickCart() {
    await this.cartLink.click();
  }

  async clickLogin() {
    await this.loginLink.click();
  }

  async clickRegister() {
    await this.registerLink.click();
  }

  async clickLogout() {
    await this.logoutButton.click();
  }

  async clickMyAccount() {
    await this.myAccountLink.click();
  }

  async isLoggedIn(): Promise<boolean> {
    return this.welcomeMessage.isVisible();
  }

  async getCartCount(): Promise<number> {
    const badge = this.cartLink.locator(".badge");
    if (await badge.isVisible()) {
      const count = await badge.textContent();
      return parseInt(count || "0");
    }
    return 0;
  }
}
