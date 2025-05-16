// src/pages/homePage.ts
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./basePage";

export class HomePage extends BasePage {
  readonly pageHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = this.page.getByRole("heading", {
      name: "Welcome to The T Shirt Store",
    });
  }

  async goto() {
    await this.page.goto("http://localhost:3000/", {
      waitUntil: "networkidle",
    });
  }

  async getPageHeadingText(): Promise<string> {
    return (await this.pageHeading.textContent()) || "";
  }

  /**
   * Click a product card by product name (e.g. 'Red T-Shirt')
   */
  async clickProductCardByName(name: string) {
    await this.page.getByRole("link", { name }).click();
  }

  /**
   * Click the Login link in the header
   */
  async goToLogin() {
    await this.clickLogin(); // from BasePage
  }

  /**
   * Click the Register link in the header
   */
  async goToRegister() {
    await this.clickRegister(); // from BasePage
  }
}
