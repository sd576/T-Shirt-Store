import { test, expect, chromium, request } from "@playwright/test";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

test("Register user then complete checkout via API", async () => {
  const baseURL = "http://localhost:3000";

  const user = {
    name: "Marc Bolan",
    email: `mbolan+${Date.now()}@bt.com`,
    password: "password",
    street: "46 High Street",
    city: "Northwood",
    postcode: "HA6 1EB",
    country: "United Kingdom",
    phone: "1234567890",
  };

  const product = {
    productId: "6",
    name: "Union Jack T-Shirt",
    price: 18.99,
    size: "XL",
    quantity: 4,
    image: "/images/tshirt_unionjack.jpg",
  };

  // 1️⃣ Initial API context
  const apiContext = await request.newContext({ baseURL });

  // Register
  const registerRes = await apiContext.post("/api/auth/register", {
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
    },
  });
  expect(registerRes.ok()).toBeTruthy();

  // Login
  const loginRes = await apiContext.post("/api/auth/login", {
    data: {
      email: user.email,
      password: user.password,
    },
  });
  expect(loginRes.ok()).toBeTruthy();
  console.log("✅ Logged in as", user.email);

  // Save session state
  await apiContext.storageState({ path: "tmp/api-session.json" });
  await apiContext.dispose();

  // 2️⃣ Create new context using saved session
  const restoredContext = await request.newContext({
    baseURL,
    storageState: "tmp/api-session.json",
  });

  // Save address
  const addressRes = await restoredContext.post("/api/user/address", {
    data: {
      street: user.street,
      city: user.city,
      postcode: user.postcode,
      country: user.country,
      phone: user.phone,
    },
  });
  expect(addressRes.ok()).toBeTruthy();
  console.log("✅ Address saved");

  // Add to cart
  const addToCartRes = await restoredContext.post("/api/cart", {
    data: {
      productId: product.productId,
      name: product.name,
      price: product.price,
      size: product.size,
      quantity: product.quantity,
      image: product.image,
    },
  });
  expect(addToCartRes.ok()).toBeTruthy();

  // Payment
  const paymentRes = await restoredContext.post("/api/checkout/payment", {
    data: {
      cardNumber: "4242424242424242",
      expiryDate: "12/25",
      cvv: "123",
    },
  });
  expect(paymentRes.ok()).toBeTruthy();

  // Place order
  const placeOrderRes = await restoredContext.post("/api/checkout/place-order");
  expect(placeOrderRes.ok()).toBeTruthy();

  const order = await placeOrderRes.json();
  console.log("✅ Order placed successfully", order);
  expect(Number(order.totalPaid)).toBeCloseTo(75.96, 2);

  // Open browser and confirm success page
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: "tmp/api-session.json",
  });
  const page = await context.newPage();

  await page.goto(`${baseURL}/checkout/success?orderId=${order.orderId}`);
  await expect(page.getByRole("heading", { name: /thank you/i })).toBeVisible();
  await expect(
    page.getByText(new RegExp(`Total Paid:\\s*£${order.totalPaid}`))
  ).toBeVisible();

  await browser.close();
});

test.afterAll(async () => {
  console.log("🧹 Cleaning up: Deleting user Marc Bolan directly from DB...");

  const db = await open({
    filename:
      "/Volumes/Stuarts Documents/Playwright_T_Shirt_Store/T_Shirt_Store/database/ecommerce.db",
    driver: sqlite3.Database,
  });

  await db.run("DELETE FROM users WHERE email = ?", "mbolan@bt.com");

  console.log("✅ Test user deleted from SQLite");
  await db.close();
});
