// src/pages/cartPage.ts
import { BasePage } from "./basePage";
import { Page, Locator, expect } from "@playwright/test";

export class CartPage extends BasePage {
  readonly pageHeading: Locator;
  readonly cartRows: Locator;
  readonly updateCartBtn: Locator;
  readonly proceedToCheckoutBtn: Locator;
  readonly continueShoppingBtn: Locator;
  readonly grandTotal: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator("body > main > h2");
    this.cartRows = page.locator("tbody tr");
    this.updateCartBtn = page.getByRole("button", { name: "Update Cart" });
    this.proceedToCheckoutBtn = page.getByRole("link", {
      name: "Proceed to Checkout",
    });
    this.continueShoppingBtn = page.getByRole("link", {
      name: "← Continue Shopping",
    });
    this.grandTotal = page.locator("h4", { hasText: "Grand Total:" });
  }

  // ─── Assertions ─────────────────────────────────────────────

  async assertPageHeading(expectedText: string) {
    await expect(this.pageHeading).toHaveText(expectedText);
  }

  async assertGrandTotal(expectedTotal: string) {
    await expect(this.grandTotal).toContainText(expectedTotal);
  }

  async assertCartItemCount(expectedCount: number) {
    await expect(this.cartRows).toHaveCount(expectedCount);
  }

  async assertCartItem(
    rowIndex: number,
    {
      productName,
      size,
      price,
      quantity,
      total,
    }: {
      productName: string;
      size: string;
      price: string;
      quantity: number;
      total: string;
    }
  ) {
    const row = this.cartRows.nth(rowIndex);
    await expect(row.getByText(productName)).toBeVisible();
    await expect(row.getByText(`Size: ${size}`)).toBeVisible();
    await expect(row.locator("td").nth(2)).toContainText(price);
    await expect(row.locator('input[type="number"]')).toHaveValue(
      String(quantity)
    );
    await expect(row.locator("td").nth(4)).toContainText(total);
  }

  // ─── Actions ────────────────────────────────────────────────

  async updateQuantityOfFirstItem(newQty: number) {
    const qtyInput = this.cartRows.first().locator('input[type="number"]');
    await qtyInput.fill(newQty.toString());
    await this.updateCartBtn.click();
  }

  async removeFirstItem() {
    const removeBtn = this.cartRows
      .first()
      .getByRole("button", { name: "Remove" });
    await removeBtn.click();
  }

  async clickProceedToCheckout() {
    await this.proceedToCheckoutBtn.click();
  }

  async clickContinueShopping() {
    await this.continueShoppingBtn.click();
  }

  // ─── Getters ────────────────────────────────────────────────

  async getGrandTotalText(): Promise<string> {
    return (
      (await this.grandTotal.textContent())
        ?.replace("Grand Total:", "")
        .trim() || ""
    );
  }

  async getCartItemCount(): Promise<number> {
    return this.cartRows.count();
  }
}
