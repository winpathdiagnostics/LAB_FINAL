// =====================================================================
// MAIN APPLICATION LOGIC (Navigation, Cart, Catalog, & Checkout)
// =====================================================================
// This file acts as the "brain" of your website. It controls how pages change,
// handles the search functionality, and processes the final checkout string.

// --- Global State Variables ---
let rateCard = [];          // Will hold all tests imported from data.js
let navHistory = ['home'];  // Keeps track of the pages the user visited so the "Back" button works
let userLocationLink = "";  // Stores the Google Maps link if they click "Pinpoint GPS"

// --- Security & Utility Functions ---

/**
 * Prevents Cross-Site Scripting (XSS) attacks.
 */
function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, match => {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match];
    });
}

/**
 * Safely parses string prices (like "5,999") into numbers.
 * We include this here so the UI can render safely even if billing.js is still loading.
 */
function safeParsePrice(priceString) {
    if (!priceString) return 0;
    const cleanString = priceString.toString().replace(/,/g, '');
    return parseFloat(cleanString) || 0;
}

// =====================================================================
// NAVIGATION & VIEW MANAGEMENT
// =====================================================================

/**
 * Opens and closes the mobile hamburger menu.
 */
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    if(!menu || !menuIcon || !closeIcon) return;

    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', isOpen);
    menuIcon.classList.toggle('hidden', !isOpen);
    closeIcon.classList.toggle('hidden', isOpen);
}

/**
 * The core Single Page Application (SPA) navigator.
 */
function switchView(viewId, pushToHistory = true) {
    const views = ['home-view', 'packages-page-view', 'contact-view', 'about-view', 'test-detail-view', 'privacy-view', 'terms-view', 'cart-view'];
    
    // Hide all views
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add('view-hidden');
    });
    
    // Show target view
    const target = document.getElementById(viewId + '-view');
    if (target) {
        target.classList.remove('view-hidden');
        if (pushToHistory) navHistory.push(viewId);
        window.scrollTo(0, 0);
    }

    // Auto-close mobile menu
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) toggleMobileMenu();
    
    // Manage Cart View state safely
    if (viewId === 'cart') {
        const emptyMsg = document.getElementById('empty-cart-msg');
        const cartContent = document.getElementById('cart-content');
        
        if (typeof cartItems !== 'undefined') {
            if (cartItems.length === 0) {
                if(emptyMsg) emptyMsg.classList.remove('hidden');
                if(cartContent) cartContent.classList.add('hidden');
            } else {
                if(emptyMsg) emptyMsg.classList.add('hidden');
                if(cartContent) cartContent.classList.remove('hidden');
                if (typeof updateBillingDisplay === 'function') updateBillingDisplay(); 
            }
        }
    }
    
    // Toggle floating WhatsApp button visibility
    const globalWa = document.getElementById('global-wa-btn');
    if (globalWa) {
        if (viewId === 'test-detail' || viewId === 'cart') {
            globalWa.classList.add('hidden');
        } else {
            globalWa.classList.remove('hidden');
        }
    }
}

/**
 * Handles the "Back" button logic.
 */
function goBack() {
    if (navHistory.length > 1) {
        navHistory.pop(); // Remove current page
        const prev = navHistory.pop(); // Get previous page
        switchView(prev, true);
    } else { 
        switchView('home'); 
    }
}

// =====================================================================
// CART PROXY FUNCTION
// =====================================================================

/**
 * A safe bridge between the HTML buttons and the billing.js logic.
 * It prevents the UI from crashing if a button is clicked too early.
 */
function addToCartById(testId) {
    const testObj = rateCard.find(t => t.id === testId);
    if (testObj) {
        if (typeof addToCart === 'function') {
            addToCart(testObj);
        } else {
            console.error("Cart system is not ready yet.");
            alert("Our cart system is currently loading, please try again in a second.");
        }
    }
}

// =====================================================================
// CHECKOUT & GPS INTEGRATION
// =====================================================================

function checkPincode() {
    const input = document.getElementById('checkout-pincode');
    const errorMsg = document.getElementById('pincode-error');
    const checkoutBtn = document.getElementById('checkout-btn');
    if(!input) return;
    
    const val = input.value.trim();

    if (typeof BILLING_CONFIG === 'undefined' || !BILLING_CONFIG.serviceablePincodes) return;

    if (val.length === 6) {
        if (BILLING_CONFIG.serviceablePincodes.includes(val)) {
            input.classList.remove('border-red-500', 'text-red-500');
            input.classList.add('border-brand-green', 'text-brand-green');
            if(errorMsg) errorMsg.classList.add('hidden');
            if (checkoutBtn) {
                checkoutBtn.disabled = false;
                checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        } else {
            input.classList.remove('border-brand-green', 'text-brand-green');
            input.classList.add('border-red-500', 'text-red-500');
            if(errorMsg) errorMsg.classList.remove('hidden');
            if (checkoutBtn) {
                checkoutBtn.disabled = true; 
                checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        }
    } else {
        input.classList.remove('border-red-500', 'text-red-500', 'border-brand-green', 'text-brand-green');
        if(errorMsg) errorMsg.classList.add('hidden');
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
}

function locateUser() {
    const statusEl = document.getElementById('location-status');
    if(!statusEl) return;
    
    statusEl.innerText = "Locating (Please allow permissions)...";
    statusEl.className = "text-xs font-semibold text-brand-blue italic";

    if (navigator.geolocation) {
        const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
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

async function proceedToWhatsApp() {
    if (typeof cartItems === 'undefined' || cartItems.length === 0) return;

    // Gather inputs
    const nameEl = document.getElementById('checkout-name');
    const ageEl = document.getElementById('checkout-age');
    const genderEl = document.getElementById('checkout-gender');
    const mobileEl = document.getElementById('checkout-mobile');
    const emailEl = document.getElementById('checkout-email');
    const pincodeEl = document.getElementById('checkout-pincode'); 
    const addressEl = document.getElementById('checkout-address');

    const name = nameEl ? nameEl.value.trim() : "";
    const age = ageEl ? ageEl.value.trim() : "";
    const gender = genderEl ? genderEl.value : "";
    const mobile = mobileEl ? mobileEl.value.trim() : "";
    const email = emailEl ? emailEl.value.trim() : "";
    const pincode = pincodeEl ? pincodeEl.value.trim() : ""; 
    const address = addressEl ? addressEl.value.trim() : "";

    // Reset red borders
    [nameEl, ageEl, genderEl, mobileEl, pincodeEl, addressEl].forEach(el => {
        if (el) el.classList.remove('border-red-500', 'ring-2', 'ring-red-500');
    });

    // Validation
    let missingFields = [];
    if (!name) { missingFields.push("Full Name"); if(nameEl) nameEl.classList.add('border-red-500', 'ring-2', 'ring-red-500'); }
    if (!age) { missingFields.push("Age"); if(ageEl) ageEl.classList.add('border-red-500', 'ring-2', 'ring-red-500'); }
    if (!gender) { missingFields.push("Gender"); if(genderEl) genderEl.classList.add('border-red-500', 'ring-2', 'ring-red-500'); }
    if (!mobile) { missingFields.push("Mobile Number"); if(mobileEl) mobileEl.classList.add('border-red-500', 'ring-2', 'ring-red-500'); }
    
    if (typeof BILLING_CONFIG !== 'undefined' && BILLING_CONFIG.serviceablePincodes) {
        if (!pincode || pincode.length !== 6) { 
            missingFields.push("Valid 6-Digit Pincode"); 
            if(pincodeEl) pincodeEl.classList.add('border-red-500', 'ring-2', 'ring-red-500'); 
        } else if (!BILLING_CONFIG.serviceablePincodes.includes(pincode)) {
            alert("We apologize, but Winpath Diagnostics currently does not offer home collection services at pincode " + pincode + ". Please contact us directly for alternative arrangements.");
            return;
        }
    }

    if (!address && !userLocationLink) { 
        missingFields.push("Home Collection Address (or GPS Location)"); 
        if(addressEl) addressEl.classList.add('border-red-500', 'ring-2', 'ring-red-500'); 
    }

    if (missingFields.length > 0) {
        alert("Please fill out the following mandatory fields:\n\n- " + missingFields.join("\n- "));
        return;
    }

    // Build WhatsApp Message
    let message = `*NEW HOME COLLECTION BOOKING*\n\n`;
    message += `*Customer Details:*\n`;
    message += `Name: ${name}\n`;
    message += `Age: ${age} Yrs | Gender: ${gender}\n`;
    message += `Mobile: ${mobile}\n`;
    if (email) message += `Email: ${email}\n`;
    message += `Pincode: ${pincode}\n`; 
    if (userLocationLink) message += `GPS Link: ${userLocationLink}\n`;
    if (address) message += `Address Note: ${address}\n\n`;

    message += `*Selected Tests:*\n`;
    let subtotal = 0;
    
    cartItems.forEach((item, index) => {
        message += `${index + 1}. ${item.name} (₹${item.price})\n`;
        const p = safeParsePrice(item.price);
        subtotal += p;
    });

    let config = typeof BILLING_CONFIG !== 'undefined' ? BILLING_CONFIG : { homeCollectionFee: 0, bookingFee: 0, platformFee: 0 };
    
    let promoDiscountAmount = typeof appliedPromoDiscount !== 'undefined' ? (subtotal * appliedPromoDiscount) / 100 : 0;
    let totalDiscount = promoDiscountAmount;

    const totalFees = config.homeCollectionFee + config.bookingFee + config.platformFee;
    const total = subtotal + totalFees - totalDiscount;

    message += `\n*Billing Summary:*\n`;
    message += `Subtotal: ₹${subtotal.toLocaleString()}\n`;
    if (config.homeCollectionFee > 0) message += `Home Collection: ₹${config.homeCollectionFee}\n`;
    if (config.bookingFee > 0) message += `Booking Fee: ₹${config.bookingFee}\n`;
    if (config.platformFee > 0) message += `Platform Fee: ₹${config.platformFee}\n`;
    
    if (promoDiscountAmount > 0) {
        message += `Promo Code (${typeof appliedPromoCodeStr !== 'undefined' ? appliedPromoCodeStr : ''}): -₹${promoDiscountAmount.toFixed(2)}\n`;
    }
    
    message += `*Total Amount: ₹${Math.max(0, total).toFixed(2)}*`;

    // Visual Loading State
    const checkoutBtn = document.getElementById('checkout-btn');
    const originalBtnText = checkoutBtn ? checkoutBtn.innerText : "Proceed";
    if(checkoutBtn) {
        checkoutBtn.innerText = "Processing Details...";
        checkoutBtn.disabled = true;
    }

    // Google Sheets Dispatch
    const customerData = {
        name: name,
        age: age,
        gender: gender,
        mobile: mobile,
        email: email || "N/A",
        address: (pincode ? `[${pincode}] ` : '') + (address || "N/A"),
        gpsLink: userLocationLink || "N/A",
        tests: cartItems.map(item => item.name).join(", "),
        totalAmount: Math.max(0, Math.round(total)),
        promoCode: (typeof appliedPromoCodeStr !== 'undefined' && appliedPromoCodeStr) ? appliedPromoCodeStr : "None"
    };

    if (typeof recordPatientDetails === 'function') {
        try { await recordPatientDetails(customerData); } catch(e) { console.error("Sheet Sync Failed", e); }
    }
    
    if(checkoutBtn) {
        checkoutBtn.innerText = originalBtnText;
        checkoutBtn.disabled = false;
    }

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/919380116362?text=${encodedMessage}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
}

// =====================================================================
// CATALOG LOGIC & RENDERING
// =====================================================================

function filterByCategory(type, value) {
    switchView('packages-page');
    const titleEl = document.getElementById('menu-title');
    const subEl = document.getElementById('menu-subtitle');
    const clearBtn = document.getElementById('clear-btn');
    
    if(titleEl) titleEl.innerHTML = `${escapeHTML(value)} <span class="brand-gradient-text italic">Tests.</span>`;
    if(subEl) subEl.innerText = `Browsing specialized screenings for ${escapeHTML(value)}`;
    if(clearBtn) clearBtn.classList.remove('hidden');
    
    const filtered = rateCard.filter(t => t.category && t.category[type] === value);
    renderTests(filtered);
    clearSearchInput(false); 
}

let searchTimeout;
function handleSearchInput() {
    const input = document.getElementById('test-search');
    const clearBtn = document.getElementById('search-clear-icon');
    if(!input) return;

    if (input.value.length > 0 && clearBtn) clearBtn.classList.remove('hidden');
    else if (clearBtn) clearBtn.classList.add('hidden');
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { filterTests(); }, 300);
}

function clearSearchInput(executeFilter = true) {
    const input = document.getElementById('test-search');
    const clearBtn = document.getElementById('search-clear-icon');
    if(input) input.value = '';
    if(clearBtn) clearBtn.classList.add('hidden');
    if (executeFilter) filterTests();
}

function filterTests() {
    const searchEl = document.getElementById('test-search');
    if(!searchEl) return;

    const rawQuery = searchEl.value.toLowerCase();
    const query = rawQuery.replace(/[^a-z0-9\s-]/g, ''); 
    
    if(query === "") { 
        renderTests(rateCard.slice(0, 18)); 
    } else { 
        renderTests(rateCard.filter(t => t.name.toLowerCase().includes(query) || (t.params && t.params.toLowerCase().includes(query)))); 
    }
}

function clearFilter() {
    clearSearchInput(false);
    const clearBtn = document.getElementById('clear-btn');
    const titleEl = document.getElementById('menu-title');
    const subEl = document.getElementById('menu-subtitle');

    if(clearBtn) clearBtn.classList.add('hidden');
    if(titleEl) titleEl.innerHTML = `Test <span class="brand-gradient-text italic">Menu.</span>`;
    if(subEl) subEl.innerText = "Browsing 100+ clinical investigations";
    filterTests();
}

function showTestDetail(testId) {
    const test = rateCard.find(t => t.id === testId);
    if (!test) return;
    const content = document.getElementById('detail-content');
    if(!content) return;

    const safeName = escapeHTML(test.name);
    const safePrice = escapeHTML(test.price);
    const safeMrp = escapeHTML(test.mrp || test.price);
    const safeImportance = escapeHTML(test.importance);
    const safeParams = escapeHTML(test.params);
    
    const priceNum = safeParsePrice(test.price);
    const mrpNum = safeParsePrice(test.mrp);
    const hasDiscount = mrpNum > priceNum;
    const discountPercent = hasDiscount ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0;

    let bodyHtml = test.isPackage ? `
            <div class="space-y-12">
                <div>
                    <h3 class="text-[10px] font-black uppercase text-brand-blue tracking-[0.2em] mb-4 underline underline-offset-4 decoration-brand-cyan">Clinical Importance</h3>
                    <p class="text-xl text-gray-600 font-medium leading-relaxed">${safeImportance}</p>
                </div>
                <div class="bg-gray-50 p-10 rounded-[3rem] border border-gray-100">
                    <h3 class="text-[10px] font-black uppercase text-brand-blue tracking-[0.2em] mb-6">Tested Parameters</h3>
                    <p class="text-lg font-bold text-gray-900 italic leading-relaxed tracking-tight underline decoration-brand-cyan/20 underline-offset-8">${safeParams}</p>
                </div>
            </div>` : 
            `<div class="bg-gray-50 p-10 rounded-[3rem] border border-gray-100"><p class="text-lg text-gray-500 font-medium leading-relaxed">This standalone investigation is processed using ISO 15189:2022 standardized protocols. Results will be delivered within 24 hours.</p></div>`;

    content.innerHTML = `
        <div class="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 class="text-4xl sm:text-6xl font-black text-gray-900 mb-8 tracking-tighter uppercase leading-tight">${safeName}</h2>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div class="lg:col-span-2">${bodyHtml}</div>
                <div class="hidden lg:block">
                    <div class="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100 sticky top-32">
                        <div class="text-[9px] font-black text-gray-400 uppercase mb-2">Service Fee</div>
                        ${hasDiscount ? `<div class="text-lg font-bold text-gray-400 tracking-tight"><span class="line-through">MRP ₹${safeMrp}</span> <span class="text-brand-green ml-2">(${discountPercent}% OFF)</span></div>` : ''}
                        <div class="text-5xl font-black brand-gradient-text tracking-tighter mb-8">₹${safePrice}</div>
                        <button onclick="addToCartById('${escapeHTML(test.id)}')" class="block w-full py-5 brand-gradient-bg text-white text-[10px] font-black uppercase tracking-widest rounded-2xl text-center shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-200 p-6 pb-8 z-[60] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[2rem] flex justify-between items-center">
            <div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Service Fee</p>
                <div class="flex items-baseline gap-2">
                    <div class="text-3xl font-black brand-gradient-text tracking-tighter leading-none">₹${safePrice}</div>
                    ${hasDiscount ? `<div class="text-sm font-bold text-gray-400"><span class="line-through">₹${safeMrp}</span> <span class="text-brand-green ml-1">${discountPercent}% OFF</span></div>` : ''}
                </div>
            </div>
            <button onclick="addToCartById('${escapeHTML(test.id)}')" class="px-8 py-4 brand-gradient-bg text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">Add to Cart</button>
        </div>
    `;
    switchView('test-detail');
}

function renderTests(tests) {
    const container = document.getElementById('test-results');
    if(!container) return;
    
    container.innerHTML = tests.length > 0 ? '' : '<p class="col-span-full py-20 text-center font-bold text-gray-400">No clinical parameters matched your search</p>';
    
    const sorted = [...tests].sort((a,b) => (b.isPackage ? 1 : 0) - (a.isPackage ? 1 : 0));
    
    sorted.forEach(test => {
        const card = document.createElement('div');
        const isPkg = test.isPackage;
        
        const priceNum = safeParsePrice(test.price);
        const mrpNum = safeParsePrice(test.mrp);
        const hasDiscount = mrpNum > priceNum;
        const discountPercent = hasDiscount ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0;
        const safeMrp = escapeHTML(test.mrp || test.price);

        card.className = `test-card p-8 rounded-[2.5rem] shadow-sm flex flex-col h-full ${isPkg ? 'bg-brand-blue/5 border-brand-blue/20' : 'bg-white'}`;
        card.innerHTML = `
            <div class="flex justify-between items-start mb-6 cursor-pointer" onclick="showTestDetail('${escapeHTML(test.id)}')">
                <h4 class="text-lg font-black text-gray-900 leading-tight text-left hover:text-brand-blue transition-colors">${escapeHTML(test.name)}</h4>
                <div class="text-right shrink-0 ml-4">
                    ${hasDiscount ? `<div class="text-xs font-bold text-gray-400 tracking-tight"><span class="line-through">₹${safeMrp}</span> <span class="text-brand-green ml-1">${discountPercent}% OFF</span></div>` : ''}
                    <div class="text-xl font-black brand-gradient-text">₹${escapeHTML(test.price)}</div>
                </div>
            </div>
            ${isPkg ? `<p class="text-[10px] text-brand-blue font-black uppercase tracking-widest mb-4 text-left">Health Package</p><div class="bg-gray-50/80 p-5 rounded-2xl flex-grow mb-6 text-left cursor-pointer" onclick="showTestDetail('${escapeHTML(test.id)}')"><p class="text-[10px] text-gray-600 font-semibold italic line-clamp-2">${escapeHTML(test.params)}</p></div>` : `<div class="flex-grow cursor-pointer" onclick="showTestDetail('${escapeHTML(test.id)}')"></div>`}
            <button onclick="addToCartById('${escapeHTML(test.id)}')" class="w-full py-3 mt-4 bg-brand-cyan/10 text-brand-blue hover:bg-brand-blue hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors">Add to Cart</button>
        `;
        container.appendChild(card);
    });
}

function populateFeaturedPackages() {
    const container = document.getElementById('featured-packages-grid');
    if(!container) return;
    container.innerHTML = "";
    
    const featuredIds = ['p-3', 'p-4', 'p-5', 'p-2']; 
    
    featuredIds.forEach(id => {
        const pkg = rateCard.find(t => t.id === id);
        if(pkg) {
            const priceNum = safeParsePrice(pkg.price);
            const mrpNum = safeParsePrice(pkg.mrp);
            const hasDiscount = mrpNum > priceNum;
            const discountPercent = hasDiscount ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0;
            const safeMrp = escapeHTML(pkg.mrp || pkg.price);

            const card = document.createElement('div');
            card.className = `bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-xl transition-all ${id==='p-5' ? 'transform scale-[1.03] z-10 border-2 border-brand-cyan/20 shadow-2xl relative' : ''}`;
            let badgeHtml = id === 'p-5' ? `<div class="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 brand-gradient-bg rounded-full text-white text-[9px] font-black uppercase tracking-widest shadow-lg">Most Popular</div>` : '';
            card.innerHTML = `
                ${badgeHtml}
                <div class="cursor-pointer" onclick="showTestDetail('${escapeHTML(pkg.id)}')">
                    <h3 class="text-2xl font-black text-gray-900 mb-2 hover:text-brand-blue transition-colors">${escapeHTML(pkg.name)}</h3>
                    <p class="text-[11px] text-gray-400 font-medium leading-relaxed mb-8 italic line-clamp-2">${escapeHTML(pkg.importance)}</p>
                    <div class="mb-8">
                        ${hasDiscount ? `<div class="text-sm font-bold text-gray-400 tracking-tight"><span class="line-through">MRP ₹${safeMrp}</span> <span class="text-brand-green ml-2">${discountPercent}% OFF</span></div>` : ''}
                        <div class="text-3xl font-black text-brand-blue leading-none">₹${escapeHTML(pkg.price)}</div>
                    </div>
                </div>
                <div class="mt-auto">
                    <button onclick="addToCartById('${escapeHTML(pkg.id)}')" class="w-full py-4 ${id==='p-5' ? 'brand-gradient-bg text-white shadow-xl hover:scale-[1.02]' : 'bg-gray-50 text-brand-blue hover:bg-gray-100'} text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">Add to Cart</button>
                </div>
            `;
            container.appendChild(card);
        }
    });
}

function renderRoadmap() {
    const container = document.getElementById('roadmap-container');
    if (!container) return;
    container.innerHTML = '';
    
    if (typeof roadmapGoals !== 'undefined') {
        roadmapGoals.forEach((goal) => {
            const isCompleted = goal.status === 'completed';
            const dotStyle = isCompleted ? 'brand-gradient-bg border-white' : 'bg-white border-brand-cyan/40';
            const textStyle = isCompleted ? 'text-gray-900' : 'text-gray-400';
            container.innerHTML += `
                <div class="relative pl-8 sm:pl-12 group cursor-default">
                    <div class="absolute left-[-9px] top-2 w-4 h-4 rounded-full border-2 ${dotStyle} z-10"></div>
                    <div class="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100 group-hover:shadow-xl transition-all">
                        <span class="text-[10px] font-black uppercase tracking-widest text-brand-cyan mb-2 block">${escapeHTML(goal.year)} ${isCompleted ? '' : '(Goal)'}</span>
                        <h4 class="text-xl font-black ${textStyle} mb-2 tracking-tight group-hover:text-brand-blue transition-colors">${escapeHTML(goal.title)}</h4>
                        <p class="text-sm text-gray-500 leading-relaxed">${escapeHTML(goal.desc)}</p>
                    </div>
                </div>
            `;
        });
    }
}

// =====================================================================
// INITIALIZATION
// =====================================================================

document.addEventListener('DOMContentLoaded', () => { 
    // Safely load the test databases
    try {
        if (typeof healthPackages !== 'undefined' && typeof investigations !== 'undefined') {
            rateCard = [...healthPackages, ...investigations];
        } else {
            console.error("WARNING: data.js arrays (healthPackages/investigations) are missing or not loaded yet.");
        }
    } catch(e) {
        console.error("Error loading rateCard", e);
    }
    
    // Safely initialize each distinct UI block
    try { filterTests(); } catch(e) { console.error("Error rendering Test List:", e); }
    try { renderRoadmap(); } catch(e) { console.error("Error rendering Roadmap:", e); }
    try { populateFeaturedPackages(); } catch(e) { console.error("Error rendering Featured Packages:", e); }
});
