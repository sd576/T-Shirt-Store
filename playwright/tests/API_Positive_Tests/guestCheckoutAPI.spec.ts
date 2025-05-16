import { test, expect, chromium, request } from "@playwright/test";
import { seedFullOrder } from "../../src/utils/orderUtils";

let order: any;

test.beforeEach(async () => {
  const baseURL = "http://localhost:3000";

  const guest = {
    fullName: "David Jarvis",
    email: "someone@bt.com",
    street: "98 High Street",
    city: "Northwood",
    postcode: "HA6 1EB",
    country: "United Kingdom",
    phone: "07967 114433",
  };

  const product = {
    productId: "2",
    name: "Blue T-Shirt",
    price: 15.99,
    size: "M",
    quantity: 2,
    image: "/images/tshirt_blue.jpg",
  };

  order = await seedFullOrder({
    apiContext: await request.newContext({ baseURL }),
    items: [product],
    guest,
  });
});

test("Thank you page reflects correct order total", async ({ page }) => {
  await page.goto(
    `http://localhost:3000/checkout/success?orderId=${order.orderId}`
  );

  await expect(page.getByRole("heading", { name: /thank you/i })).toBeVisible();
  await expect(
    page.getByText(new RegExp(`Total Paid:\\s*£${order.totalPaid}`))
  ).toBeVisible();
});
