// =====================================================================
// FINAL BILL CONFIGURATION (Editable Billing Logic)
// =====================================================================
// This file controls the extra charges and discounts applied at checkout.
// You can update these numbers at any time to instantly reflect on the live site.

const BILLING_CONFIG = {
    homeCollectionFee: 150,   // ₹ Flat fee added for the home visit service
    convenienceCharge: 50,    // ₹ Digital handling or platform fee
    discountPercentage: 10     // % Discount to subtract (e.g., 10 for 10% off)
};
