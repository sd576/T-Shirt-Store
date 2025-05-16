import { APIRequestContext, BrowserContext } from "@playwright/test";

/**
 * Seeds the cart with products and syncs the session into the browser context.
 */
export async function seedCartSession(
  context: BrowserContext,
  apiContext: APIRequestContext,
  items: Array<{
    productId: string;
    name: string;
    price: number;
    size: string;
    quantity: number;
    image: string;
  }>
): Promise<void> {
  // Step 1: Add each item via API
  for (const item of items) {
    const response = await apiContext.post("/api/cart", { data: item, });

    if (!response.ok()) {
      throw new Error(`❌ Failed to seed cart via API for item: ${item.name}`);
    }
  }

  // Step 2: Extract session cookies
  const { cookies } = await apiContext.storageState();

  // ✅ Step 3: Minimalist cookies — name, value, and url ONLY
  const validCookies = cookies.map((cookie) => ({
    name: cookie.name,
    value: cookie.value,
    url: "http://localhost:3000",
  }));

  // ✅ Step 4: Log and inject
  console.log("✅ Final cookies to inject:", validCookies);
  await context.addCookies(validCookies);
}
