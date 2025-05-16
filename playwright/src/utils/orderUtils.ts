import { APIRequestContext } from "@playwright/test";

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
};

type GuestInfo = {
  fullName: string;
  email: string;
  street: string;
  city: string;
  postcode: string;
  country: string;
};

type PaymentInfo = {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
};

type SeedOrderParams = {
  apiContext: APIRequestContext;
  items: OrderItem[];
  guest: GuestInfo;
  payment?: PaymentInfo;
};

type SeededOrder = {
  orderId: string;
  orderNumber: string;
  totalPaid: number;
  createdAt: string;
  shipping: GuestInfo | any;
  items: OrderItem[];
};

/**
 * GUEST CHECKOUT flow:
 * 1. Add items to cart
 * 2. Submit guest info
 * 3. Submit mock payment
 * 4. Place order
 * 5. Save session state
 */
export async function seedFullOrder({
  apiContext,
  items,
  guest,
  payment = {
    cardNumber: "4242424242424242",
    expiryDate: "12/26",
    cvv: "123",
  },
}: SeedOrderParams): Promise<SeededOrder> {
  for (const item of items) {
    const cartRes = await apiContext.post("/api/cart", { data: item });
    if (!cartRes.ok()) {
      console.error("❌ Failed to add item to cart (guest)");
      console.error("🧾 Status:", cartRes.status());
      console.error("🧾 Item:", item);
      console.error("🧾 Response:", await cartRes.text());
      throw new Error("❌ Failed to add item to cart");
    }
  }

  const guestRes = await apiContext.post("/api/checkout/guest", {
    data: guest,
  });
  if (!guestRes.ok()) {
    console.error("❌ Guest response body:", await guestRes.text());
    throw new Error("❌ Failed to save guest info");
  }

  const paymentRes = await apiContext.post("/api/checkout/payment", {
    data: payment,
  });
  if (!paymentRes.ok()) throw new Error("❌ Payment failed");

  const placeOrderRes = await apiContext.post("/api/checkout/place-order");
  if (!placeOrderRes.ok()) {
    console.error(
      "❌ Order placement failed response:",
      await placeOrderRes.text()
    );
    throw new Error("❌ Failed to place order");
  }

  const result = await placeOrderRes.json();
  await apiContext.storageState({ path: "tmp/api-session.json" });

  return {
    orderId: result.orderId,
    orderNumber: result.orderNumber,
    totalPaid: result.totalPaid,
    shipping: guest,
    items,
    createdAt: result.createdAt,
  };
}

/**
 * REGISTERED CHECKOUT flow:
 * 1. Add items to cart
 * 2. Submit payment
 * 3. Place order
 * 4. Save session state
 */
export async function seedRegisteredOrder({
  apiContext,
  items,
}: {
  apiContext: APIRequestContext;
  items: OrderItem[];
}): Promise<SeededOrder> {
  for (const item of items) {
    const cartRes = await apiContext.post("/api/cart", { data: item });
    if (!cartRes.ok()) {
      console.error("❌ Failed to add item to cart (registered)");
      console.error("🧾 Status:", cartRes.status());
      console.error("🧾 Item:", item);
      console.error("🧾 Response:", await cartRes.text());
      throw new Error("❌ Failed to add item to cart");
    }
  }

  const paymentRes = await apiContext.post("/api/checkout/payment", {
    data: {
      cardNumber: "4242424242424242",
      expiryDate: "12/25",
      cvv: "123",
    },
  });
  if (!paymentRes.ok()) throw new Error("❌ Payment failed");

  const placeOrderRes = await apiContext.post("/api/checkout/place-order");
  if (!placeOrderRes.ok()) {
    console.error(
      "❌ Order placement failed response:",
      await placeOrderRes.text()
    );
    throw new Error("❌ Failed to place order");
  }

  const result = await placeOrderRes.json();
  await apiContext.storageState({ path: "tmp/api-session.json" });

  return {
    orderId: result.orderId,
    orderNumber: result.orderNumber,
    totalPaid: result.totalPaid,
    shipping: result.shipping,
    items,
    createdAt: result.createdAt,
  };
}
