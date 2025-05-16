import { test, expect, request, chromium } from "@playwright/test";
import { ProductPage } from "../../src/pages/productPage";
import fs from "fs";

// 👇 Save screenshots in the same folder structure
const screenshotDir = "./tests/API_Negative_Tests/screenshots";
if (!fs.existsSync(screenshotDir))
  fs.mkdirSync(screenshotDir, { recursive: true });

test("❌ Order amount exceeds stock level error displayed", async () => {
  const productId = 6;
  const size = "L";
  const baseURL = "http://localhost:3000";

  // 1️⃣ Fetch live stock data from API
  const apiContext = await request.newContext({ baseURL });
  const stockRes = await apiContext.get(`/api/products/${productId}/stock`);
  expect(stockRes.ok()).toBeTruthy();

  const product = await stockRes.json();
  const currentStock = product.stock.find(
    (s: { size: string; quantity: number }) => s.size === size
  )?.quantity;
  expect(currentStock).toBeDefined();

  console.log(`📦 Current stock for size ${size}: ${currentStock}`);

  // 2️⃣ Open product page in the browser
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const productPage = new ProductPage(page);
  await page.goto(`${baseURL}/product/${productId}`);

  // 3️⃣ Interact via Page Object methods
  await productPage.selectSize(size);
  await productPage.setQuantity(currentStock! + 1);
  await productPage.addToCart();

  await productPage.assertOverstockError(size, currentStock!);

  // 📸 Screenshot after modal appears
  await page.screenshot({
    path: `tests/screenshots/overstock-error-${size}.png`,
    fullPage: true,
  });
});
