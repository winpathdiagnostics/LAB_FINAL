// =====================================================================
// MAIN APPLICATION LOGIC (Navigation, Cart, & Checkout)
// =====================================================================

// --- Global State Variables ---
// These variables hold the data while the user is actively using the website.
let rateCard = [];          // Will hold the combined packages and investigations
let navHistory = ['home'];  // Keeps track of the screens visited so the "Back" button works
let shoppingCart = [];      // Array holding the specific tests the user has selected
let userLocationLink = "";  // Holds the exact Google Maps GPS link when generated

// --- Security Utility ---
/**
 * Sanitizes text to prevent DOM-based XSS attacks.
 * This ensures that if a malicious script ever entered the data, it gets converted into harmless text.
 */
function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, match => {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match];
    });
}

// =====================================================================
// NAVIGATION & VIEW MANAGEMENT
// =====================================================================

/**
 * Opens and closes the mobile "hamburger" menu.
 */
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', isOpen);
    menuIcon.classList.toggle('hidden', !isOpen);
    closeIcon.classList.toggle('hidden', isOpen);
}

/**
 * The core routing function. It hides all views and shows only the one requested.
 * @param {string} viewId - The ID prefix of the section to show (e.g., 'home', 'cart')
 * @param {boolean} pushToHistory - Whether to record this jump in the back button history
 */
function switchView(viewId, pushToHistory = true) {
    const views = ['home-view', 'packages-page-view', 'contact-view', 'about-view', 'test-detail-view', 'privacy-view', 'terms-view', 'cart-view'];
    
    // Hide all views first
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add('view-hidden');
    });
    
    // Show the target view
    const target = document.getElementById(viewId + '-view');
    if (target) {
        target.classList.remove('view-hidden');
        if (pushToHistory) navHistory.push(viewId);
        window.scrollTo(0, 0); // Scroll to the top of the new page
    }

    // Close the mobile menu if it is currently open
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) toggleMobileMenu();
    
    // If the user navigated to the cart, dynamically render the cart UI
    if (viewId === 'cart') renderCartView();
    
    // Hide the global floating WhatsApp button if inside the Cart or Detail view
    // (Because those views have their own primary buttons)
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
 * Navigates to the previously viewed screen using the navHistory array.
 */
function goBack() {
    if (navHistory.length > 1) {
        navHistory.pop(); // Remove current view
        const prev = navHistory.pop(); // Get previous view
        switchView(prev, true);
    } else { 
        switchView('home'); 
    }
}


// =====================================================================
// SHOPPING CART FUNCTIONS
// =====================================================================

function addToCart(testId) {
    const test = rateCard.find(t => t.id === testId);
    
    // Check if the test exists and isn't already in the cart to prevent duplicates
    if (test && !shoppingCart.some(item => item.id === testId)) {
        shoppingCart.push(test);
        updateCartBadge();
        showToast();
    }
}

function removeFromCart(testId) {
    shoppingCart = shoppingCart.filter(item => item.id !== testId);
    updateCartBadge();
    renderCartView(); // Re-render to instantly remove the item from the screen
}

/**
 * Updates the red numbered bubbles (badges) on the Cart icons
 */
function updateCartBadge() {
    const count = shoppingCart.length;
    
    // Update Desktop Badges (using querySelectorAll in case of duplicates)
    const badges = document.querySelectorAll('#cart-badge');
    badges.forEach(b => b.innerText = count);
    
    // Update Mobile Drawer Badge
    const mobileBadge = document.getElementById('mobile-cart-count');
    if(mobileBadge) mobileBadge.innerText = count;
}

/**
 * Displays the "Added to Cart" popup notification at the bottom of the screen.
 */
function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 2500); // Hide after 2.5s
}

/**
 * Renders the Cart checkout screen, mapping the selected items and calculating the final bill.
 */
function renderCartView() {
    const emptyMsg = document.getElementById('empty-cart-msg');
    const cartContent = document.getElementById('cart-content');
    const itemList = document.getElementById('cart-items-list');

    // Show empty message if cart is empty
    if (shoppingCart.length === 0) {
        emptyMsg.classList.remove('hidden');
        cartContent.classList.add('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        cartContent.classList.remove('hidden');

        itemList.innerHTML = '';
        let subtotal = 0;

        // Render each selected test item
        shoppingCart.forEach(item => {
            // Strip commas from prices (e.g., "5,999" -> 5999) to do math
            const priceNum = parseInt(item.price.replace(/,/g, ''));
            subtotal += priceNum;
            
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

        // Safe import of BILLING_CONFIG (from billing.js)
        let config = typeof BILLING_CONFIG !== 'undefined' ? BILLING_CONFIG : { homeCollectionFee: 0, convenienceCharge: 0, discountPercentage: 0 };
        
        // Final Billing Math
        const discountVal = (subtotal * (config.discountPercentage || 0)) / 100;
        const total = subtotal + config.homeCollectionFee + config.convenienceCharge - discountVal;
        
        // Apply values to UI
        document.getElementById('bill-subtotal').innerText = `₹${subtotal.toLocaleString()}`;
        document.getElementById('bill-collection').innerText = `₹${config.homeCollectionFee}`;
        document.getElementById('bill-convenience').innerText = `₹${config.convenienceCharge}`;
        
        const discountEl = document.getElementById('bill-discount');
        if (config.discountPercentage > 0 && subtotal > 0) {
            discountEl.innerText = `-₹${Math.round(discountVal).toLocaleString()} (${config.discountPercentage}%)`;
        } else {
            discountEl.innerText = `₹0`;
        }

        // Using Math.max(0) ensures the bill doesn't go into negative numbers
        document.getElementById('bill-total').innerText = `₹${Math.max(0, Math.round(total)).toLocaleString()}`;
    }
}


// =====================================================================
// CHECKOUT & GPS INTEGRATION
// =====================================================================

/**
 * Requests the browser's high-accuracy GPS coordinates to ensure
 * precise home collections for Phlebotomists.
 */
function locateUser() {
    const statusEl = document.getElementById('location-status');
    statusEl.innerText = "Locating (Please allow permissions)...";
    statusEl.className = "text-xs font-semibold text-brand-blue italic";

    if (navigator.geolocation) {
        const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            // Generate a usable Google Maps link
            userLocationLink = `https://maps.google.com/?q=${lat},${lng}`;
            
            statusEl.innerText = "GPS Location Pinned Successfully! ✓";
            statusEl.className = "text-xs font-black uppercase tracking-widest text-brand-green mt-1";
        }, error => {
            console.error("GPS Error:", error);
            let errorMsg = "GPS Error. Please type your address manually.";
            
            // specific error catching to inform the user
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
    // 1. Grab the actual input elements
    const nameEl = document.getElementById('checkout-name');
    const ageEl = document.getElementById('checkout-age');
    const genderEl = document.getElementById('checkout-gender');
    const mobileEl = document.getElementById('checkout-mobile');
    const emailEl = document.getElementById('checkout-email');
    const addressEl = document.getElementById('checkout-address');

    // Extract values
    const name = nameEl.value.trim();
    const age = ageEl.value.trim();
    const gender = genderEl.value;
    const mobile = mobileEl.value.trim();
    const email = emailEl.value.trim();
    const address = addressEl.value.trim();

    // 2. Reset any previous error highlights
    [nameEl, ageEl, genderEl, mobileEl, addressEl].forEach(el => {
        if (el) el.classList.remove('border-red-500', 'ring-2', 'ring-red-500');
    });

    // 3. Validate mandatory fields and apply red borders to missing ones
    let missingFields = [];

    if (!name) { 
        missingFields.push("Full Name"); 
        nameEl.classList.add('border-red-500', 'ring-2', 'ring-red-500'); 
    }
    if (!age) { 
        missingFields.push("Age"); 
        ageEl.classList.add('border-red-500', 'ring-2', 'ring-red-500'); 
    }
    if (!gender) { 
        missingFields.push("Gender"); 
        genderEl.classList.add('border-red-500', 'ring-2', 'ring-red-500'); 
    }
    if (!mobile) { 
        missingFields.push("Mobile Number"); 
        mobileEl.classList.add('border-red-500', 'ring-2', 'ring-red-500'); 
    }
    if (!address && !userLocationLink) { 
        missingFields.push("Home Collection Address (or GPS Location)"); 
        addressEl.classList.add('border-red-500', 'ring-2', 'ring-red-500'); 
    }

    // 4. Show popup message if validation failed
    if (missingFields.length > 0) {
        alert("Please fill out the following mandatory fields:\n\n- " + missingFields.join("\n- "));
        return;
    }

    let message = `*NEW HOME COLLECTION BOOKING*\n\n`;
    message += `*Customer Details:*\n`;
    message += `Name: ${name}\n`;
    message += `Age: ${age} Yrs | Gender: ${gender}\n`;
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

    message += `\n*Billing Summary:*\nSubtotal: ₹${subtotal.toLocaleString()}\nHome Collection: ₹${config.homeCollectionFee}\nConvenience Fee: ₹${config.convenienceCharge}\n`;
    if (config.discountPercentage > 0 && subtotal > 0) {
        message += `Discount (${config.discountPercentage}%): -₹${Math.round(discountVal).toLocaleString()}\n`;
    }
    message += `*Total Amount: ₹${Math.max(0, Math.round(total)).toLocaleString()}*`;

    const checkoutBtn = document.getElementById('checkout-btn');
    const originalBtnText = checkoutBtn.innerText;
    checkoutBtn.innerText = "Processing Details...";
    checkoutBtn.disabled = true;

    // Log to Google Sheets
    const customerData = {
        name: name,
        age: age,
        gender: gender,
        mobile: mobile,
        email: email || "N/A",
        address: address || "N/A",
        gpsLink: userLocationLink || "N/A",
        tests: shoppingCart.map(item => item.name).join(", "),
        totalAmount: Math.max(0, Math.round(total))
    };

    if (typeof recordPatientDetails === 'function') {
        await recordPatientDetails(customerData);
    }
    
    checkoutBtn.innerText = originalBtnText;
    checkoutBtn.disabled = false;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/919380116362?text=${encodedMessage}`;
    
    shoppingCart = [];
    updateCartBadge();
    switchView('home');
    window.open(waUrl, '_blank', 'noopener,noreferrer');
}

// --- Menu & Catalog Filtering ---
function filterByCategory(type, value) {
    switchView('packages-page');
    // Update the visual headers to show what the user is browsing
    document.getElementById('menu-title').innerHTML = `${escapeHTML(value)} <span class="brand-gradient-text italic">Tests.</span>`;
    document.getElementById('menu-subtitle').innerText = `Browsing specialized screenings for ${escapeHTML(value)}`;
    document.getElementById('clear-btn').classList.remove('hidden');
    
    // Execute filter
    const filtered = rateCard.filter(t => t.category && t.category[type] === value);
    renderTests(filtered);
    clearSearchInput(false); 
}

// Variables for debounce logic to prevent the browser from stuttering on mobile typing
let searchTimeout;

/**
 * Triggers slightly after the user stops typing to process the search effectively.
 */
function handleSearchInput() {
    const input = document.getElementById('test-search');
    const clearBtn = document.getElementById('search-clear-icon');
    
    if (input.value.length > 0) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { filterTests(); }, 300);
}

/**
 * Clears the search bar input via the "X" button.
 */
function clearSearchInput(executeFilter = true) {
    const input = document.getElementById('test-search');
    input.value = '';
    document.getElementById('search-clear-icon').classList.add('hidden');
    if (executeFilter) filterTests();
}

/**
 * Searches the master rateCard for items matching the name OR clinical parameters.
 */
function filterTests() {
    const rawQuery = document.getElementById('test-search').value.toLowerCase();
    // Security: strict regex stripping on the search box to prevent exploitation
    const query = rawQuery.replace(/[^a-z0-9\s-]/g, '');
    
    if(query === "") { 
        // If empty, show first 18 items to avoid rendering all 100+ at once immediately
        renderTests(rateCard.slice(0, 18)); 
    } 
    else { 
        renderTests(rateCard.filter(t => t.name.toLowerCase().includes(query) || (t.params && t.params.toLowerCase().includes(query)))); 
    }
}

function clearFilter() {
    clearSearchInput(false);
    document.getElementById('clear-btn').classList.add('hidden');
    document.getElementById('menu-title').innerHTML = `Test <span class="brand-gradient-text italic">Menu.</span>`;
    document.getElementById('menu-subtitle').innerText = "Browsing 100+ clinical investigations";
    filterTests();
}


// =====================================================================
// DYNAMIC UI RENDERING (Injecting HTML Elements)
// =====================================================================

/**
 * Renders the detail view for a specific test clicked by the user.
 */
function showTestDetail(testId) {
    const test = rateCard.find(t => t.id === testId);
    if (!test) return;
    const content = document.getElementById('detail-content');

    const safeName = escapeHTML(test.name);
    const safePrice = escapeHTML(test.price);
    const safeImportance = escapeHTML(test.importance);
    const safeParams = escapeHTML(test.params);

    // Differentiate content rendering between "Packages" and standalone "Investigations"
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
                        <div class="text-5xl font-black brand-gradient-text tracking-tighter mb-8">₹${safePrice}</div>
                        <button onclick="addToCart('${escapeHTML(test.id)}')" class="block w-full py-5 brand-gradient-bg text-white text-[10px] font-black uppercase tracking-widest rounded-2xl text-center shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Add to Cart</button>
                        <p class="text-[8px] text-center text-gray-400 mt-6 font-bold uppercase tracking-widest italic">Digital reports in 24 hours</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Mobile Sticky Footer CTA -->
        <div class="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-200 p-6 pb-8 z-[60] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[2rem] flex justify-between items-center animate-in slide-in-from-bottom-full">
            <div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Service Fee</p>
                <div class="text-3xl font-black brand-gradient-text tracking-tighter leading-none">₹${safePrice}</div>
            </div>
            <button onclick="addToCart('${escapeHTML(test.id)}')" class="px-8 py-4 brand-gradient-bg text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">Add to Cart</button>
        </div>
    `;
    switchView('test-detail');
}

/**
 * Compiles test objects into visual HTML cards for the Catalog page.
 */
function renderTests(tests) {
    const container = document.getElementById('test-results');
    container.innerHTML = tests.length > 0 ? '' : '<p class="col-span-full py-20 text-center font-bold text-gray-400">No clinical parameters matched your search</p>';
    
    // Sort packages to the top naturally
    const sorted = [...tests].sort((a,b) => (b.isPackage ? 1 : 0) - (a.isPackage ? 1 : 0));
    
    sorted.forEach(test => {
        const card = document.createElement('div');
        const isPkg = test.isPackage;
        const safeName = escapeHTML(test.name);
        const safePrice = escapeHTML(test.price);
        const safeParams = escapeHTML(test.params);

        card.className = `test-card p-8 rounded-[2.5rem] shadow-sm flex flex-col h-full ${isPkg ? 'bg-brand-blue/5 border-brand-blue/20' : 'bg-white'}`;
        card.innerHTML = `
            <div class="flex justify-between items-start mb-6 cursor-pointer" onclick="showTestDetail('${escapeHTML(test.id)}')">
                <h4 class="text-lg font-black text-gray-900 leading-tight text-left hover:text-brand-blue transition-colors">${safeName}</h4>
                <span class="text-xl font-black brand-gradient-text ml-4 shrink-0">₹${safePrice}</span>
            </div>
            ${isPkg ? `<p class="text-[10px] text-brand-blue font-black uppercase tracking-widest mb-4 text-left">Health Package</p><div class="bg-gray-50/80 p-5 rounded-2xl flex-grow mb-6 text-left cursor-pointer" onclick="showTestDetail('${escapeHTML(test.id)}')"><span class="text-[8px] font-black text-brand-blue uppercase block mb-2 opacity-50">Parameters</span><p class="text-[10px] text-gray-600 font-semibold italic line-clamp-2">${safeParams}</p></div>` : `<div class="flex-grow cursor-pointer" onclick="showTestDetail('${escapeHTML(test.id)}')"></div>`}
            <button onclick="addToCart('${escapeHTML(test.id)}')" class="w-full py-3 mt-4 bg-brand-cyan/10 text-brand-blue hover:bg-brand-blue hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors">Add to Cart</button>
        `;
        container.appendChild(card);
    });
}

/**
 * Automatically places exactly the 4 chosen spotlight packages on the Homepage UI.
 */
function populateFeaturedPackages() {
    const container = document.getElementById('featured-packages-grid');
    if(!container) return;
    container.innerHTML = "";
    
    const featuredIds = ['p-3', 'p-4', 'p-5', 'p-2']; 
    featuredIds.forEach(id => {
        const pkg = rateCard.find(t => t.id === id);
        if(pkg) {
            const card = document.createElement('div');
            // Give "p-5" (Seniors) the special popped-out active styling
            card.className = `bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-xl transition-all ${id==='p-5' ? 'transform scale-[1.03] z-10 border-2 border-brand-cyan/20 shadow-2xl relative' : ''}`;
            
            let badgeHtml = id === 'p-5' ? `<div class="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 brand-gradient-bg rounded-full text-white text-[9px] font-black uppercase tracking-widest shadow-lg">Most Popular</div>` : '';
            
            card.innerHTML = `
                ${badgeHtml}
                <div class="cursor-pointer" onclick="showTestDetail('${escapeHTML(pkg.id)}')">
                    <h3 class="text-2xl font-black text-gray-900 mb-2 hover:text-brand-blue transition-colors">${escapeHTML(pkg.name)}</h3>
                    <p class="text-[11px] text-gray-400 font-medium leading-relaxed mb-8 italic line-clamp-2">${escapeHTML(pkg.importance)}</p>
                    <div class="text-3xl font-black text-brand-blue mb-8">₹${escapeHTML(pkg.price)}</div>
                </div>
                <div class="mt-auto">
                    <button onclick="addToCart('${escapeHTML(pkg.id)}')" class="w-full py-4 ${id==='p-5' ? 'brand-gradient-bg text-white shadow-xl hover:scale-[1.02]' : 'bg-gray-50 text-brand-blue hover:bg-gray-100'} text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">Add to Cart</button>
                </div>
            `;
            container.appendChild(card);
        }
    });
}

/**
 * Loops through the external roadmapGoals array to build the "Strategic Roadmap" UI in About Us.
 */
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
                    <div class="absolute left-[-9px] top-2 w-4 h-4 rounded-full border-2 ${dotStyle} group-hover:scale-150 transition-transform duration-300 shadow-sm z-10"></div>
                    <div class="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100 group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-brand-cyan/40">
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
// APP INITIALIZATION
// =====================================================================
window.onload = () => { 
    // Securely pull the lists from data.js into the main state variable
    if (typeof healthPackages !== 'undefined' && typeof investigations !== 'undefined') {
        rateCard = [...healthPackages, ...investigations];
    }
    
    // Execute rendering on load
    filterTests(); 
    renderRoadmap(); 
    populateFeaturedPackages();
};
