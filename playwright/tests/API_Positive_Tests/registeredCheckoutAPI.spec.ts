import { test, expect, chromium, request } from "@playwright/test";
import { seedRegisteredOrder } from "../../src/utils/orderUtils";

test("Registered user can log in and complete checkout via API", async () => {
  const baseURL = "http://localhost:3000";
  const apiContext = await request.newContext({ baseURL });

  // 🔐 Login as John Doe
  const loginRes = await apiContext.post("/api/auth/login", {
    data: {
      email: "john@example.com",
      password: "password",
    },
  });

  expect(loginRes.ok()).toBeTruthy();
  console.log("✅ Logged in as John Doe");

  // 🛍️ Define cart items
  const items = [
    {
      productId: "4",
      name: "White T-Shirt",
      price: 15.99,
      size: "L",
      quantity: 1,
      image: "/images/tshirt_white.jpg",
    },
    {
      productId: "2",
      name: "Red T-Shirt",
      price: 15.99,
      size: "M",
      quantity: 2,
      image: "/images/tshirt_red.jpg",
    },
    {
      productId: "3",
      name: "Black T-Shirt",
      price: 15.99,
      size: "S",
      quantity: 1,
      image: "/images/tshirt_black.jpg",
    },
  ];

  // 🧪 Use registered-user-specific seeding
  const order = await seedRegisteredOrder({ apiContext, items });

  console.log("✅ Order placed via API:", order);

  // 🌐 Open browser using session state
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: "tmp/api-session.json",
  });
  const page = await context.newPage();

  console.log(
    `➡️ Visiting /checkout/success?orderId=${order.orderId}&guestCheckout=1`
  );

  await page.goto(
    `${baseURL}/checkout/success?orderId=${order.orderId}&guestCheckout=1`
  );
  await page.screenshot({ path: "success-page.png", fullPage: true });

  // ✅ Final assertions
  expect(order.orderId).toBeTruthy();
  expect(order.orderNumber).toBeTruthy();
  await expect(page.getByText("Thank you for your order")).toBeVisible();

  await browser.close();
});