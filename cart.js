// =====================================================================
// SHOPPING CART & CHECKOUT LOGIC
// =====================================================================
// This file handles adding/removing items, rendering the cart UI, 
// capturing GPS locations, and formatting the final WhatsApp message.

// --- State Variables ---
let shoppingCart = [];      // Array to hold the tests the user wants to book
let userLocationLink = "";  // String to temporarily store the generated Google Maps link

/**
 * Adds a specific test to the shopping cart.
 * It checks if the item is already in the cart to prevent duplicates.
 */
function addToCart(testId) {
    // 'rateCard' is globally defined in your main HTML file
    const test = rateCard.find(t => t.id === testId);
    
    // Check if the test exists and isn't already in the cart
    if (test && !shoppingCart.some(item => item.id === testId)) {
        shoppingCart.push(test);
        updateCartBadge();
        showToast(); // Triggers the little "Added to Cart" popup
    }
}

/**
 * Removes a specific test from the shopping cart based on its ID,
 * then visually updates the cart badge and the cart screen.
 */
function removeFromCart(testId) {
    shoppingCart = shoppingCart.filter(item => item.id !== testId);
    updateCartBadge();
    renderCartView(); // Re-render the UI so the item disappears immediately
}

/**
 * Updates the little numbered bubbles (badges) on the Cart icons
 * in both the desktop header and the mobile menu drawer.
 */
function updateCartBadge() {
    const count = shoppingCart.length;
    
    // Update Desktop Badges
    const badges = document.querySelectorAll('#cart-badge');
    badges.forEach(b => b.innerText = count);
    
    // Update Mobile Drawer Badge
    const mobileBadge = document.getElementById('mobile-cart-count');
    if (mobileBadge) mobileBadge.innerText = count;
}

/**
 * Shows the "Added to Cart" notification banner at the bottom of the screen.
 * Automatically hides it after 2.5 seconds.
 */
function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 2500);
}

/**
 * Dynamically builds the HTML for the Cart View page.
 * Calculates subtotals, applies fees/discounts from billing.js, and displays the final total.
 */
function renderCartView() {
    const emptyMsg = document.getElementById('empty-cart-msg');
    const cartContent = document.getElementById('cart-content');
    const itemList = document.getElementById('cart-items-list');

    // If the cart is empty, show the "Empty Cart" illustration
    if (shoppingCart.length === 0) {
        emptyMsg.classList.remove('hidden');
        cartContent.classList.add('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        cartContent.classList.remove('hidden');

        itemList.innerHTML = '';
        let subtotal = 0;

        // Loop through everything in the cart and generate the HTML list items
        shoppingCart.forEach(item => {
            // Remove commas from prices like "5,999" so JavaScript can do math on them
            const priceNum = parseInt(item.price.replace(/,/g, ''));
            subtotal += priceNum;
            
            // Note: escapeHTML() is a global security function defined in index.html
            itemList.innerHTML += `
                <div class="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                        <h4 class="font-black text-sm text-gray-900">${escapeHTML(item.name)}</h4>
                        <span class="text-xs font-bold text-brand-blue uppercase tracking-widest">₹${escapeHTML(item.price)}</span>
                    </div>
                    <button onclick="removeFromCart('${escapeHTML(item.id)}')" class="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            `;
        });

        // Pull the configuration from your external billing.js file
        let config = typeof BILLING_CONFIG !== 'undefined' ? BILLING_CONFIG : { homeCollectionFee: 0, convenienceCharge: 0, discountPercentage: 0 };
        
        // Final Math Calculation
        const discountVal = (subtotal * (config.discountPercentage || 0)) / 100;
        const total = subtotal + config.homeCollectionFee + config.convenienceCharge - discountVal;
        
        // Update the Bill Summary UI texts
        document.getElementById('bill-subtotal').innerText = `₹${subtotal.toLocaleString()}`;
        document.getElementById('bill-collection').innerText = `₹${config.homeCollectionFee}`;
        document.getElementById('bill-convenience').innerText = `₹${config.convenienceCharge}`;
        
        const discountEl = document.getElementById('bill-discount');
        if (config.discountPercentage > 0 && subtotal > 0) {
            discountEl.innerText = `-₹${Math.round(discountVal).toLocaleString()} (${config.discountPercentage}%)`;
        } else {
            discountEl.innerText = `₹0`;
        }

        // Math.max(0, total) ensures the total never goes below zero if you give a massive discount
        document.getElementById('bill-total').innerText = `₹${Math.max(0, Math.round(total)).toLocaleString()}`;
    }
}

/**
 * Triggers the browser's built-in GPS module to find the user's exact coordinates.
 * Used exclusively for exact home collection pinpointing.
 */
function locateUser() {
    const statusEl = document.getElementById('location-status');
    statusEl.innerText = "Locating (Please allow permissions)...";
    statusEl.className = "text-xs font-semibold text-brand-blue italic";

    if (navigator.geolocation) {
        const options = {
            enableHighAccuracy: true,
            timeout: 10000, 
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            // Generate a clickable Google Maps link
            userLocationLink = `https://maps.google.com/?q=${lat},${lng}`;
            
            statusEl.innerText = "GPS Location Pinned Successfully! ✓";
            statusEl.className = "text-xs font-black uppercase tracking-widest text-brand-green mt-1";
        }, error => {
            console.error("GPS Error:", error);
            let errorMsg = "GPS Error. Please type your address manually.";
            
            if (error.code === 1) errorMsg = "GPS Access Denied. Please type your address manually.";
            else if (error.code === 2) errorMsg = "GPS Signal Unavailable. Please type your address.";
            else if (error.code === 3) errorMsg = "Location Request Timed Out. Please type your address.";
            
            statusEl.innerText = errorMsg;
            statusEl.className = "text-xs font-bold text-red-500 italic mt-1";
        }, options);
    } else {
        statusEl.innerText = "Geolocation not supported by this browser. Please type address.";
        statusEl.className = "text-xs font-bold text-red-500 italic mt-1";
    }
}

/**
 * Final Checkout Action: 
 * 1. Validates form inputs
 * 2. Compiles everything into a clean WhatsApp string
 * 3. Sends data to Google Sheets (if enabled)
 * 4. Redirects to WhatsApp
 */
async function proceedToWhatsApp() {
    const name = document.getElementById('checkout-name').value.trim();
    const mobile = document.getElementById('checkout-mobile').value.trim();
    const email = document.getElementById('checkout-email').value.trim();
    const address = document.getElementById('checkout-address').value.trim();

    // Enforce mandatory fields
    if (!name || !mobile || (!address && !userLocationLink)) {
        alert("Please fill out your Name, Mobile Number, and provide an Address/Location.");
        return;
    }

    // Build the WhatsApp message string
    let message = `*NEW HOME COLLECTION BOOKING*\n\n`;
    message += `*Patient Details:*\n`;
    message += `Name: ${name}\n`;
    message += `Mobile: ${mobile}\n`;
    if (email) message += `Email: ${email}\n`;
    if (userLocationLink) message += `GPS Link: ${userLocationLink}\n`;
    if (address) message += `Address Note: ${address}\n\n`;

    message += `*Selected Tests:*\n`;
    let subtotal = 0;
    shoppingCart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} (₹${item.price})\n`;
        subtotal += parseInt(item.price.replace(/,/g, ''));
    });

    let config = typeof BILLING_CONFIG !== 'undefined' ? BILLING_CONFIG : { homeCollectionFee: 0, convenienceCharge: 0, discountPercentage: 0 };
    const discountVal = (subtotal * (config.discountPercentage || 0)) / 100;
    const total = subtotal + config.homeCollectionFee + config.convenienceCharge - discountVal;

    message += `\n*Billing Summary:*\n`;
    message += `Subtotal: ₹${subtotal.toLocaleString()}\n`;
    message += `Home Collection: ₹${config.homeCollectionFee}\n`;
    message += `Convenience Fee: ₹${config.convenienceCharge}\n`;
    
    if (config.discountPercentage > 0 && subtotal > 0) {
        message += `Discount (${config.discountPercentage}%): -₹${Math.round(discountVal).toLocaleString()}\n`;
    }
    message += `*Total Amount: ₹${Math.max(0, Math.round(total)).toLocaleString()}*`;

    // Visual loading state on the button
    const checkoutBtn = document.getElementById('checkout-btn');
    const originalBtnText = checkoutBtn.innerText;
    checkoutBtn.innerText = "Processing Details...";
    checkoutBtn.disabled = true;

    // --- Google Sheets Handoff ---
    const patientData = {
        name: name,
        mobile: mobile,
        email: email || "N/A",
        address: address || "N/A",
        gpsLink: userLocationLink || "N/A",
        tests: shoppingCart.map(item => item.name).join(", "),
        totalAmount: Math.max(0, Math.round(total))
    };

    // If patient-details.js is loaded, send the data to Google Sheets
    if (typeof recordPatientDetails === 'function') {
        await recordPatientDetails(patientData);
    }
    
    checkoutBtn.innerText = originalBtnText;
    checkoutBtn.disabled = false;

    // URL Encode the string to format spaces, line-breaks, and special chars for WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/919380116362?text=${encodedMessage}`;
    
    // Clear out the cart and navigate to the homepage before opening the new tab
    shoppingCart = [];
    updateCartBadge();
    switchView('home'); // This depends on switchView() from main index.html logic
    
    window.open(waUrl, '_blank', 'noopener,noreferrer');
}
