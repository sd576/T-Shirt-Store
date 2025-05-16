import { Page, Locator, expect } from "@playwright/test";

// Page Heading: Create a New Account
export class RegisterPage {
  readonly pageHeading: Locator;
  readonly name: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly registerBtn: Locator;
  readonly clearFormBtn: Locator;

  constructor(private page: Page) {
    this.pageHeading = page.getByRole("heading", {
      name: "Create a New Account",
    });
    this.name = page.locator("#name");
    this.email = page.locator("#email");
    this.password = page.locator("#password");
    this.registerBtn = page.getByRole("button", { name: "Register" });
    this.clearFormBtn = page.getByRole("button", { name: "Clear Form" });
  }

  async getPageHeadingText(): Promise<string> {
    return (await this.pageHeading.textContent()) || "";
  }

  async enterName(name: string) {
    await this.name.waitFor({ state: "visible" });
    await this.name.fill(name);
  }

  async enterEmail(email: string) {
    await this.email.waitFor({ state: "visible" });
    await this.email.fill(email);
  }

  async enterPassword(password: string) {
    await this.password.waitFor({ state: "visible" });
    await this.password.fill(password);
  }

  async clickRegisterButton() {
    await this.registerBtn.click();
  }

  async clickClearFormButton() {
    await this.clearFormBtn.click();
  }
}
