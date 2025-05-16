// src/pages/paymentPage.ts
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./basePage";

// Page Heading: Enter Your Payment Details
export class PaymentPage extends BasePage {
  readonly pageHeading: Locator;
  readonly cardNumber: Locator;
  readonly expiryDate: Locator;
  readonly cvv: Locator;
  readonly payBtn: Locator;
  readonly backToReviewBtn: Locator;

  constructor(page: Page) {
    super(page);

    this.pageHeading = page.getByRole("heading", {
      name: "Enter Your Payment Details",
    });
    this.cardNumber = page.getByRole("textbox", { name: "Card Number" });
    this.expiryDate = page.getByRole("textbox", {
      name: "Expiry Date (MM/YY)",
    });
    this.cvv = page.getByRole("textbox", { name: "CVV" });
    this.payBtn = page.getByRole("button", { name: "Pay" });
    this.backToReviewBtn = page.getByRole("button", { name: "Back to Review" });
  }

  // ─── Assertions ──────────────────────────────────────────

  async assertPageHeading(expected: string) {
    await expect(this.pageHeading).toHaveText(expected);
  }

  // ─── Actions ─────────────────────────────────────────────

  async enterCardNumber(cardNumber: string) {
    await this.cardNumber.click();
    await this.cardNumber.type(cardNumber, { delay: 50 });
  }

  async enterExpiryDate(expiryDate: string) {
    await this.expiryDate.fill(expiryDate);
  }

  async enterCvvNumber(cvv: string) {
    await this.cvv.fill(cvv);
  }

  async clickPay() {
    await this.payBtn.click();
  }

  async clickBackToReview() {
    await this.backToReviewBtn.click();
  }

  async fillPaymentDetails(payment: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  }) {
    await this.enterCardNumber(payment.cardNumber);
    await this.enterExpiryDate(payment.expiryDate);
    await this.enterCvvNumber(payment.cvv);
  }
}
