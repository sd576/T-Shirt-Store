import { APIRequestContext } from "@playwright/test";

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
};

type SeededOrder = {
  orderId: string;
  orderNumber: string;
  totalPaid: number;
  createdAt: string;
  shipping: any;
  items: OrderItem[];
};

export async function seedRegisteredOrder({
  apiContext,
  items,
}: {
  apiContext: APIRequestContext;
  items: OrderItem[];
}): Promise<SeededOrder> {
  for (const item of items) {
    const cartRes = await apiContext.post("/api/cart", { data: item });
    if (!cartRes.ok()) throw new Error("❌ Failed to add item to cart");
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
  if (!placeOrderRes.ok()) throw new Error("❌ Failed to place order");

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
