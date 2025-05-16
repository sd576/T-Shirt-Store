import { Page, Locator } from "@playwright/test";
import { expect as playwrightExpect } from "@playwright/test";

export class LoginPage {
  readonly pageHeading: Locator;
  readonly emailAddress: Locator;
  readonly password: Locator;
  readonly loginBtn: Locator;
  readonly clearFormBtn: Locator;
  readonly forgottenPasswordLnk: Locator;

  constructor(private page: Page) {
    this.pageHeading = page.locator("h2.mb-4");
    this.emailAddress = page.locator("#email");
    this.password = page.locator("#password");
    this.loginBtn = page.getByRole('button', { name: 'Login' });
    this.clearFormBtn = page.getByRole("button", { name: "Clear Form" });
    this.forgottenPasswordLnk = page.getByRole("link", {
      name: "Forgotten Password?",
    });
  }

  async assertPageHeading(expectedHeading: string) {
    await expect(this.pageHeading).toHaveText(expectedHeading);
  }

  async enterEmailAddress(email: string) {
    await this.emailAddress.waitFor({ state: "visible" });
    await this.emailAddress.fill(email);
  }

  async enterPassword(password: string) {
    await this.password.waitFor({ state: "visible" });
    await this.password.fill(password);
  }

  async clickLoginButton() {
    await this.loginBtn.click();
  }

  async clickClearFormButton() {
    await this.clearFormBtn.click();
  }

  async clickForgottenPasswordLink() {
    await this.forgottenPasswordLnk.click();
  }
}
function expect(pageHeading: Locator) {
  return playwrightExpect(pageHeading);
}
