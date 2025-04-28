import { Page } from "@playwright/test";

export const orderPage = (page: Page) => ({
    getOrderNumber: () => {
        return page.locator('#order-number');
    },
    getStatus: () => {
        return page.locator('#order-status');
    },
    getOrderDate: () => {
        return page.locator('#order-date');
    },
    getTotalPaid: () => {
        return page.locator('#order-total');
    },
    getFullName: () => {
        return page.getByTestId('full-name');
    },
    getAddress: () => {
        return page.getByTestId('street');
    },
    getCity: () => {
        return page.getByTestId('city');
    },
    getPostCode: () => {
        return page.getByTestId('postcode');
    },
    getCountry: () => {
        return page.getByTestId('country');
    },
    getEmail: () => {
        return page.getByTestId('email');
    }
});
