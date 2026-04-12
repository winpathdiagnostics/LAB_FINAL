// =====================================================================
// MAIN APPLICATION LOGIC (Navigation, Cart, & Checkout)
// =====================================================================

// --- Global State Variables ---
let rateCard = [];
let navHistory = ['home'];
let shoppingCart = [];
let userLocationLink = "";

// --- Security Utility ---
// Sanitizes text to prevent DOM-based XSS attacks
function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, match => {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match];
    });
}

// --- Navigation & View Management ---
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', isOpen);
    menuIcon.classList.toggle('hidden', !isOpen);
    closeIcon.classList.toggle('hidden', isOpen);
}

function switchView(viewId, pushToHistory = true) {
    const views = ['home-view', 'packages-page-view', 'contact-view', 'about-view', 'test-detail-view', 'privacy-view', 'terms-view', 'cart-view'];
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add('view-hidden');
    });
    
    const target = document.getElementById(viewId + '-view');
    if (target) {
        target.classList.remove('view-hidden');
        if (pushToHistory) navHistory.push(viewId);
        window.scrollTo(0, 0);
    }

    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) toggleMobileMenu();
    
    if (viewId === 'cart') renderCartView();
    
    const globalWa = document.getElementById('global-wa-btn');
    if (globalWa) {
        if (viewId === 'test-detail' || viewId === 'cart') {
            globalWa.classList.add('hidden');
        } else {
            globalWa.classList.remove('hidden');
        }
    }
}

function goBack() {
    if (navHistory.length > 1) {
        navHistory.pop();
        const prev = navHistory.pop();
        switchView(prev, true);
    } else { switchView('home'); }
}

// --- Shopping Cart Functions ---
function addToCart(testId) {
    const test = rateCard.find(t => t.id === testId);
    if (test && !shoppingCart.some(item => item.id === testId)) {
        shoppingCart.push(test);
        updateCartBadge();
        showToast();
    }
}

function removeFromCart(testId) {
    shoppingCart = shoppingCart.filter(item => item.id !== testId);
    updateCartBadge();
    renderCartView();
}

function updateCartBadge() {
    const count = shoppingCart.length;
    const badges = document.querySelectorAll('#cart-badge');
    badges.forEach(b => b.innerText = count);
    const mobileBadge = document.getElementById('mobile-cart-count');
    if(mobileBadge) mobileBadge.innerText = count;
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 2500);
}

function renderCartView() {
    const emptyMsg = document.getElementById('empty-cart-msg');
    const cartContent = document.getElementById('cart-content');
    const itemList = document.getElementById('cart-items-list');

    if (shoppingCart.length === 0) {
        emptyMsg.classList.remove('hidden');
        cartContent.classList.add('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        cartContent.classList.remove('hidden');

        itemList.innerHTML = '';
        let subtotal = 0;

        shoppingCart.forEach(item => {
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

        // Billing calculation using config from billing.js
        let config = typeof BILLING_CONFIG !== 'undefined' ? BILLING_CONFIG : { homeCollectionFee: 0, convenienceCharge: 0, discountPercentage: 0 };
        const discountVal = (subtotal * (config.discountPercentage || 0)) / 100;
        const total = subtotal + config.homeCollectionFee + config.convenienceCharge - discountVal;
        
        document.getElementById('bill-subtotal').innerText = `₹${subtotal.toLocaleString()}`;
        document.getElementById('bill-collection').innerText = `₹${config.homeCollectionFee}`;
        document.getElementById('bill-convenience').innerText = `₹${config.convenienceCharge}`;
        
        const discountEl = document.getElementById('bill-discount');
        if (config.discountPercentage > 0 && subtotal > 0) {
            discountEl.innerText = `-₹${Math.round(discountVal).toLocaleString()} (${config.discountPercentage}%)`;
        } else {
            discountEl.innerText = `₹0`;
        }

        document.getElementById('bill-total').innerText = `₹${Math.max(0, Math.round(total)).toLocaleString()}`;
    }
}

// --- Checkout & GPS Integration ---
function locateUser() {
    const statusEl = document.getElementById('location-status');
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
    const name = document.getElementById('checkout-name').value.trim();
    const mobile = document.getElementById('checkout-mobile').value.trim();
    const email = document.getElementById('checkout-email').value.trim();
    const address = document.getElementById('checkout-address').value.trim();

    if (!name || !mobile || (!address && !userLocationLink)) {
        alert("Please fill out your Name, Mobile Number, and provide an Address/Location.");
        return;
    }

    let message = `*NEW HOME COLLECTION BOOKING*\n\n*Patient Details:*\nName: ${name}\nMobile: ${mobile}\n`;
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
    const patientData = {
        name: name,
        mobile: mobile,
        email: email || "N/A",
        address: address || "N/A",
        gpsLink: userLocationLink || "N/A",
        tests: shoppingCart.map(item => item.name).join(", "),
        totalAmount: Math.max(0, Math.round(total))
    };

    if (typeof recordPatientDetails === 'function') {
        await recordPatientDetails(patientData);
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
    document.getElementById('menu-title').innerHTML = `${escapeHTML(value)} <span class="brand-gradient-text italic">Tests.</span>`;
    document.getElementById('menu-subtitle').innerText = `Browsing specialized screenings for ${escapeHTML(value)}`;
    document.getElementById('clear-btn').classList.remove('hidden');
    
    const filtered = rateCard.filter(t => t.category && t.category[type] === value);
    renderTests(filtered);
    clearSearchInput(false); 
}

let searchTimeout;
function handleSearchInput() {
    const input = document.getElementById('test-search');
    const clearBtn = document.getElementById('search-clear-icon');
    if (input.value.length > 0) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { filterTests(); }, 300);
}

function clearSearchInput(executeFilter = true) {
    const input = document.getElementById('test-search');
    input.value = '';
    document.getElementById('search-clear-icon').classList.add('hidden');
    if (executeFilter) filterTests();
}

function filterTests() {
    const rawQuery = document.getElementById('test-search').value.toLowerCase();
    const query = rawQuery.replace(/[^a-z0-9\s-]/g, '');
    if(query === "") { renderTests(rateCard.slice(0, 18)); } 
    else { renderTests(rateCard.filter(t => t.name.toLowerCase().includes(query) || (t.params && t.params.toLowerCase().includes(query)))); }
}

// --- UI Rendering ---
function showTestDetail(testId) {
    const test = rateCard.find(t => t.id === testId);
    if (!test) return;
    const content = document.getElementById('detail-content');

    const safeName = escapeHTML(test.name);
    const safePrice = escapeHTML(test.price);
    const safeImportance = escapeHTML(test.importance);
    const safeParams = escapeHTML(test.params);

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

function renderTests(tests) {
    const container = document.getElementById('test-results');
    container.innerHTML = tests.length > 0 ? '' : '<p class="col-span-full py-20 text-center font-bold text-gray-400">No clinical parameters matched your search</p>';
    const sorted = [...tests].sort((a,b) => (b.isPackage ? 1 : 0) - (a.isPackage ? 1 : 0));
    
    sorted.forEach(test => {
        const card = document.createElement('div');
        card.className = `test-card p-8 rounded-[2.5rem] shadow-sm flex flex-col h-full ${test.isPackage ? 'bg-brand-blue/5 border-brand-blue/20' : 'bg-white'}`;
        card.innerHTML = `
            <div class="flex justify-between items-start mb-6 cursor-pointer" onclick="showTestDetail('${escapeHTML(test.id)}')">
                <h4 class="text-lg font-black text-gray-900 leading-tight text-left hover:text-brand-blue transition-colors">${escapeHTML(test.name)}</h4>
                <span class="text-xl font-black brand-gradient-text ml-4 shrink-0">₹${escapeHTML(test.price)}</span>
            </div>
            ${test.isPackage ? `<p class="text-[10px] text-brand-blue font-black uppercase tracking-widest mb-4 text-left">Health Package</p><div class="bg-gray-50/80 p-5 rounded-2xl flex-grow mb-6 text-left cursor-pointer" onclick="showTestDetail('${escapeHTML(test.id)}')"><span class="text-[8px] font-black text-brand-blue uppercase block mb-2 opacity-50">Parameters</span><p class="text-[10px] text-gray-600 font-semibold italic line-clamp-2">${escapeHTML(test.params)}</p></div>` : `<div class="flex-grow cursor-pointer" onclick="showTestDetail('${escapeHTML(test.id)}')"></div>`}
            <button onclick="addToCart('${escapeHTML(test.id)}')" class="w-full py-3 mt-4 bg-brand-cyan/10 text-brand-blue hover:bg-brand-blue hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors">Add to Cart</button>
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
            const card = document.createElement('div');
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

// --- App Initialization ---
window.onload = () => { 
    if (typeof healthPackages !== 'undefined' && typeof investigations !== 'undefined') {
        rateCard = [...healthPackages, ...investigations];
    }
    filterTests(); 
    renderRoadmap(); 
    populateFeaturedPackages();
};
