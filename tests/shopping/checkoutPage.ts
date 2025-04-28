import { Page } from "@playwright/test";

export const checkoutPage = (page: Page) => {
    const payButton = page.getByRole('button').getByText(/Pay £[\d.,]+ & Complete Order/);
    
    return {
        goCheckoutAsGuest: async () => {
            await page.getByRole('link', { name: 'Checkout as Guest' }).click();
        },
        typeFullName: async (fullName: string) => {
            await page.getByRole('textbox', { name: 'Full Name' }).fill(fullName);
        },
        typeEmailAddress: async (emailAddress: string) => {
            await page.getByRole('textbox', { name: 'Email Address' }).fill(emailAddress);
        },
        typeStreetAdddress: async (streetAddress: string) => {
            await page.getByRole('textbox', { name: 'Street Address' }).fill(streetAddress);
        },
        typeCity: async (city: string) => {
            await page.getByRole('textbox', { name: 'City' }).fill(city);
        },
        typePostcode: async (postcode: number) => {
            await page.getByRole('textbox', { name: 'Postcode' }).fill(postcode.toString());
        },
        typeCountry: async (country: string) => {
            await page.getByRole('textbox', { name: 'Country' }).fill(country);
        },
        continue: async () => {
            await page.getByRole('button', { name: 'Continue' }).click();
        },
        typeCardNumber: async (cardNumber: number) => {
            await page.getByRole('textbox', { name: 'Card Number' }).fill(cardNumber.toString());
        },
        typeExpiryDate: async (expiryDate: string) => {
            await page.getByRole('textbox', { name: 'Expiry Date (MM/YY)' }).fill(expiryDate);
        },
        typeCVV: async (cvv: number) => {
            await page.getByRole('textbox', { name: 'CVV' }).fill(cvv.toString());
        },
        pay: async () => {
            await payButton.click();
        },
        getTotalPaid: async () => {
            const extractedTotalPrice = await payButton.textContent();

            return extractedTotalPrice
                ?.replace('Pay ', '')
                .replace(' & Complete Order', '');
        }
    }
};
