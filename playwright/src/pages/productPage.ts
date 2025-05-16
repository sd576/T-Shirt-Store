// src/pages/productPage.ts
import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./basePage";

export class ProductPage extends BasePage {
  readonly pageHeading: Locator;
  readonly sizeSelector: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly productPrice: Locator;
  readonly productColor: Locator;
  readonly errorModal: Locator;
  readonly errorModalBody: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator("#product-heading");
    this.sizeSelector = page.locator("#product-size");
    this.quantityInput = page.locator("#product-quantity");
    this.addToCartButton = page.locator("#add-to-cart");
    this.productPrice = page.locator("#product-price");
    this.productColor = page.locator("#product-color");

    this.errorModal = page.locator("#errorModal");
    this.errorModalBody = page.locator("#errorModalBody");
  }

  async assertPageHeading(expectedText: string) {
    await expect(this.pageHeading).toHaveText(expectedText);
  }

  async selectSize(size: string) {
    await this.sizeSelector.selectOption(size);
  }

  async setQuantity(qty: number) {
    await this.quantityInput.fill(qty.toString());
  }

  async addToCart() {
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      this.addToCartButton.click(),
    ]);
  }

  async assertOverstockError(size: string, quantity: number) {
    await expect(this.errorModal).toBeVisible();
    await expect(this.errorModalBody).toHaveText(
      `Only ${quantity} left for size "${size}".`
    );
  }
}
