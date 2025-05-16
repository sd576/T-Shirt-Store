// src/pages/checkoutCompletePage.ts
import { Page, Locator, expect } from "@playwright/test";

// Page Heading: Order Summary
export class CheckoutCompletePage {
  readonly page: Page;
  readonly thankYouHeading: Locator;
  readonly orderSummaryHeading: Locator;
  readonly orderNumber: Locator;
  readonly orderDate: Locator;
  readonly totalPaid: Locator;
  readonly continueShoppingBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.thankYouHeading = page.locator("h1", {
      hasText: "Thank You for Your Order!",
    });
    this.orderSummaryHeading = page.locator("h3", { hasText: "Order Summary" });
    this.continueShoppingBtn = page.getByRole("link", {
      name: "Continue Shopping",
    });
    this.orderNumber = page.locator("#order-number-value");
    this.orderDate = page.locator("#order-date-value");
    this.totalPaid = page.locator("#order-total-value");
  }

  async assertH1Heading(expectedText: string) {
    await expect(this.thankYouHeading).toHaveText(expectedText);
  }

  async assertOrderNumber(expectedText: string) {
    await expect(this.orderNumber).toHaveText(expectedText);
  }

  async assertOrderDate(expectedText: string) {
    await expect(this.orderDate).toHaveText(expectedText);
  }

  async assertTotalPaid(expectedText: string) {
    await expect(this.totalPaid).toHaveText(expectedText);
  }

  async clickContinueShoppingBtn() {
    await this.continueShoppingBtn.click();
  }
}
