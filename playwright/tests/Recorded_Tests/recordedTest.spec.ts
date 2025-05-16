import { test, expect } from "@playwright/test";

test.skip("test", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page
    .getByRole("heading", { name: "Welcome to The T Shirt Store" })
    .click();
  await page.getByRole("link", { name: "Black T-Shirt" }).click();
  await page.getByLabel("Select Size").selectOption("XL");
  await page.getByRole("spinbutton", { name: "Quantity" }).click();
  await page.getByRole("spinbutton", { name: "Quantity" }).fill("4");
  await page.getByRole("button", { name: "Add to Cart" }).click();
  await page.getByRole("link", { name: "Proceed to Checkout" }).click();
  await page.getByRole("link", { name: "Checkout as Guest" }).click();
  await page.getByRole("textbox", { name: "Full Name" }).click();
  await page.getByRole("textbox", { name: "Full Name" }).fill("Peter andre");
  await page.getByRole("textbox", { name: "Full Name" }).press("Tab");
  await page.getByRole("textbox", { name: "Email Address" }).fill("pa@bt.com");
  await page.getByRole("textbox", { name: "Email Address" }).press("Tab");
  await page
    .getByRole("textbox", { name: "Phone Number (optional)" })
    .press("Tab");
  await page
    .getByRole("textbox", { name: "Street Address" })
    .fill("23 high st");
  await page.getByRole("textbox", { name: "Street Address" }).press("Tab");
  await page.getByRole("textbox", { name: "City" }).fill("northwood");
  await page.getByRole("textbox", { name: "City" }).press("Tab");
  await page.getByRole("textbox", { name: "Postcode" }).fill("ha6 1eb");
  await page.getByRole("textbox", { name: "Postcode" }).press("Tab");
  await page.getByRole("textbox", { name: "Country" }).fill("united kingdom");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByText("Name: Peter Andre").click();
  await page.getByText("Email: pa@bt.com").click();
  await page.getByText("Street: 23 High St").click();
  await page.getByText("City: Northwood").click();
  await page.getByText("Postcode: HA6 1EB").click();
  await page.getByText("Country: United Kingdom").click();
  await page.getByRole("button", { name: "Proceed to Payment" }).click();
  await page.getByRole("textbox", { name: "Card Number" }).click();
  await page
    .getByRole("textbox", { name: "Card Number" })
    .fill("1111222233334444");
  await page.getByRole("textbox", { name: "Expiry Date (MM/YY)" }).click();
  await page
    .getByRole("textbox", { name: "Expiry Date (MM/YY)" })
    .fill("10/27");
  await page.getByRole("textbox", { name: "Expiry Date (MM/YY)" }).press("Tab");
  await page.getByRole("textbox", { name: "CVV" }).fill("343");
  await page
    .getByRole("button", { name: "Pay £63.96 & Complete Order" })
    .click();
  await page.getByRole("link", { name: "Continue Shopping" }).click();
  await page
    .getByRole("heading", { name: "Welcome to The T Shirt Store" })
    .click();
});
