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
        "560045", 
        "560064" 
         
        // Example to add later: , "560066", "560067"
    ]
};

// =====================================================================
// CART & BILLING LOGIC
// =====================================================================

// This array holds the items currently added to the patient's cart
let cartItems = [];

/**
 * Helper function to parse prices safely.
 * Strips commas out of prices from data.js (e.g., "5,999" -> 5999)
 */
function parsePrice(priceString) {
    if (!priceString) return 0;
    const cleanString = priceString.toString().replace(/,/g, '');
    return parseFloat(cleanString) || 0;
}

/**
 * Adds a test or package to the cart.
 */
function addToCart(testObject) {
    const exists = cartItems.find(item => item.id === testObject.id);
    if (!exists) {
        cartItems.push(testObject);
        console.log(`Added: ${testObject.name}`);
        
        // Show success toast if it exists in the UI
        const toast = document.getElementById('toast');
        if(toast) {
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
        
        updateBillingDisplay();
        
        // Update global cart badge counters
        const desktopBadge = document.getElementById('cart-badge');
        const mobileBadge = document.getElementById('mobile-cart-count');
        if(desktopBadge) desktopBadge.innerText = cartItems.length;
        if(mobileBadge) mobileBadge.innerText = cartItems.length;
        
    } else {
        alert("This test is already in the cart.");
    }
}

/**
 * Removes an item from the cart.
 */
function removeFromCart(testId) {
    cartItems = cartItems.filter(item => item.id !== testId);
    updateBillingDisplay();
    
    const desktopBadge = document.getElementById('cart-badge');
    const mobileBadge = document.getElementById('mobile-cart-count');
    if(desktopBadge) desktopBadge.innerText = cartItems.length;
    if(mobileBadge) mobileBadge.innerText = cartItems.length;
}

/**
 * Calculates the total bill based on Cart Items, Configuration Fees, and Dynamic Discounts
 */
function updateBillingDisplay() {
    let subtotal = 0;
    let totalMrp = 0;
    
    // 1. Calculate Base Total & MRP
    cartItems.forEach(item => {
        subtotal += parsePrice(item.price);
        totalMrp += parsePrice(item.mrp || item.price); // Fallback to price if MRP is missing
    });

    // 2. Fetch the custom discount percentage (Y%) from the Clerk/Marketing input field
    const discountInputEl = document.getElementById('discount-input');
    const customDiscountPercentage = discountInputEl ? (parseFloat(discountInputEl.value) || 0) : 0;
    const safeDiscountPercentage = Math.min(Math.max(customDiscountPercentage, 0), 100);

    // 3. Fetch Operational Fees from BILLING_CONFIG
    // Only apply fees if there is at least 1 item in the cart
    const activeCollectionFee = cartItems.length > 0 ? BILLING_CONFIG.homeCollectionFee : 0;
    const activeBookingFee = cartItems.length > 0 ? BILLING_CONFIG.bookingFee : 0;
    const activePlatformFee = cartItems.length > 0 ? BILLING_CONFIG.platformFee : 0;

    // 4. Calculate Final Amounts
    // The discount is strictly applied to the subtotal of the tests, not the operational fees
    const discountAmount = (subtotal * safeDiscountPercentage) / 100;
    const finalTotal = subtotal + activeCollectionFee + activeBookingFee + activePlatformFee - discountAmount;
    
    // Calculate total money saved for the patient (Difference between Market MRP and Final Cart Value)
    const marketSavings = totalMrp - finalTotal;

    // -----------------------------------------------------------
    // DOM UPDATES (Connecting logic to HTML IDs)
    // -----------------------------------------------------------
    
    // Render the list of items in the cart UI
    const cartList = document.getElementById('cart-items-list');
    if (cartList) {
        if (cartItems.length === 0) {
            cartList.innerHTML = `<p class="text-xs text-gray-400 italic font-semibold">No tests selected yet.</p>`;
        } else {
            cartList.innerHTML = cartItems.map(item => `
                <div class="flex justify-between items-center bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                    <div>
                        <p class="font-bold text-gray-900 text-sm">${item.name}</p>
                        <p class="text-[11px] text-gray-500 mt-1 font-semibold uppercase tracking-widest">
                            <span class="line-through text-gray-400 mr-2">MRP ₹${item.mrp || item.price}</span> 
                            <span class="text-brand-blue font-black">₹${item.price}</span>
                        </p>
                    </div>
                    <button onclick="removeFromCart('${item.id}')" class="text-red-400 hover:text-red-600 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            `).join('');
        }
    }

    // Render the financial breakdown
    if (document.getElementById('bill-mrp')) document.getElementById('bill-mrp').innerText = `₹${totalMrp.toFixed(2)}`;
    if (document.getElementById('bill-subtotal')) document.getElementById('bill-subtotal').innerText = `₹${subtotal.toFixed(2)}`;
    if (document.getElementById('bill-collection')) document.getElementById('bill-collection').innerText = `₹${activeCollectionFee.toFixed(2)}`;
    if (document.getElementById('bill-booking')) document.getElementById('bill-booking').innerText = `₹${activeBookingFee.toFixed(2)}`;
    if (document.getElementById('bill-platform')) document.getElementById('bill-platform').innerText = `₹${activePlatformFee.toFixed(2)}`;
    if (document.getElementById('bill-discount')) document.getElementById('bill-discount').innerText = `-₹${discountAmount.toFixed(2)}`;
    if (document.getElementById('bill-total')) document.getElementById('bill-total').innerText = `₹${finalTotal.toFixed(2)}`;
    
    // Render the dynamic Savings Banner
    const savingsDisplay = document.getElementById('savings-display');
    if (savingsDisplay) {
        if (marketSavings > 0 && cartItems.length > 0) {
            savingsDisplay.innerText = `You save ₹${marketSavings.toFixed(2)} compared to standard market rates!`;
        } else {
            savingsDisplay.innerText = '';
        }
    }
}

// Add an event listener to trigger calculations immediately when a staff member types a discount %
document.addEventListener('DOMContentLoaded', () => {
    const discountInputEl = document.getElementById('discount-input');
    if (discountInputEl) {
        discountInputEl.addEventListener('input', updateBillingDisplay);
    }
});
