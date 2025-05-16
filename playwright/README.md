# 🧪 Playwright T-Shirt Store – UI & API Testing Demo

This Playwright project is a complete **end-to-end testing framework** built with **Playwright and TypeScript**, focused on simulating a full guest checkout flow for The "T Shirt Store" using a combination of fast API calls and a final UI check:.

## 🔍 Flow Overview:

🛒 Cart is seeded via API
Adds items directly into the cart using POST /api/cart.

🚚 Guest shipping info submitted via API
Mocks the shipping form with POST /api/checkout/guest.

💳 Mock payment submitted via API
Uses POST /api/checkout/payment to simulate card details.

📦 Order placed via API
Calls POST /api/checkout/place-order to save the order.

🌐 Browser opens the success page
Launches a real browser page to GET /checkout/success?orderId=...
✅ Confirms that:

- The thank-you message is shown ..
- The total paid matches the API result

---

## 🧪 What’s Being Tested?

🔁 Guest Checkout Flow (Hybrid: API + UI)

- ✅ Cart creation via API (POST /api/cart)
- ✅ Shipping info via API (POST /api/checkout/guest)
- ✅ Mock payment via API (POST /api/checkout/payment)
- ✅ Order placement (POST /api/checkout/place-order)
- ✅ Final UI assertion on /checkout/success

👤 New User Registration & Checkout (Full API + UI)

- ✅ Registers a user via POST /api/auth/register
- ✅ Logs in via POST /api/auth/login
- ✅ Saves address (POST /api/user/address)
- ✅ Adds items, pays, places order
- ✅ UI confirms order placed correctly (with session state)

👨‍💻 Registered User Checkout

- ✅ Logs in with pre-seeded user (john@example.com)
- ✅ Adds cart items and completes checkout
- ✅ Order state and total validated in UI

- ✅ Cart creation via API
  Adds items directly using POST /api/cart (faster than UI clicks)

- ✅ Guest shipping info via API
  Mocks the shipping form with POST /api/checkout/guest

- ✅ Mock payment processing via API
  Simulates payment with basic card validation (POST /api/checkout/payment)

- ✅ Order placement via API
  Finalizes the order and stores it in the database

- ✅ Success page rendered via UI
  Opens /checkout/success in the browser and:

- \*\* Confirms Thank You message is visible
- \*\* Verifies Total Paid matches API response
- \*\* Saves a screenshot of the final confirmation

---

## 📁 Folder Structure

```
Playwright_T_Shirt_Store/
├── src/
│ └── pages/                # Page Object Models (POMs)
├── utils/
│ └── cartUtils.ts/
├── tests/                  # Feature test specs
├── .gitignore
├── package-lock.json
├── package.json
├── playwright.config.ts    # Config file
├── README.md
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

After running `npm install`, you can use the following scripts in your terminal:

### ✅ To Get Up and Running

Run the following two commands:

- **`npx playwright test`** → Runs all the tests.

- **`npx playwright test guestUserPurchase.spec.ts`** → Run a specific test (e.g. guest checkout)
- **`npx playwright test <test_name> --debug`** → Runs your test in debug mode, which pauses on failures and opens the Playwright inspector for step-by-step debugging.

- **`npx playwright test <test_name> --ui`** → Launches the Playwright Test UI, an interactive test runner GUI where you can.

- **`npx playwright test <test_name> --trace on`** → Enables trace recording, which captures screenshots, DOM snapshots, console logs, and more — so you can replay exactly what happened.

You can then open the trace with:

```bash
npx playwright show-trace trace.zip
```

You must also have trace: 'on' or 'retain-on-failure' set in playwright.config.ts for it to work consistently.

To combine all of these commands so that a specific test runs in debug mode and records a trace:

```bash
npx playwright test guestUserPurchase.spec.ts --debug --trace on
```
