// =====================================================================
// BILLING & FEE CONFIGURATION
// =====================================================================
// Adjust these values anytime. The website will automatically update.
// This file acts as the central source of truth for all pricing rules, 
// fees, and service area restrictions. Keeping these values here makes 
// it extremely easy to update without having to touch the complex main.js code.

const BILLING_CONFIG = {
    // --- Standard Operational Fees (in ₹) ---
    // These are added to the final bill during the checkout process.
    homeCollectionFee: 110,  // Charge for the phlebotomist visiting the patient's home
    bookingFee: 30,          // Administrative fee for processing the digital booking
    platformFee: 10,         // Fee for platform maintenance and tech infrastructure
    
    // --- Discount Codes Dictionary ---
    // Format: "CODENAME": percentage_number
    // Add, edit, or remove promo codes here. The math in main.js will automatically
    // validate these codes and apply the corresponding percentage off the test subtotal.
    validDiscountCodes: {
        "WINPATH20": 20,     // 20% off tests
        "HEALTH50": 50,      // 50% off tests
        "DRDSA10": 10        // 10% off tests
    },

    // --- SERVICEABLE PINCODES (HOME COLLECTION RADIUS) ---
    // Only users entering these exact 6-digit codes can proceed to the WhatsApp checkout.
    // The 'checkPincode()' function in main.js cross-references against this array.
    // To expand your service area in Bengaluru, simply add the new pincodes here as strings.
    serviceablePincodes: [
        "560001", 
        "560002", 
        "560003", 
        "560008", 
        "560034", 
        "560038" 
        // Example to add later: , "560066", "560067"
    ]
};
