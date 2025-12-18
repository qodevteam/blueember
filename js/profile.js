// Global State
let orders = [];
let currentUser = {};

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize mobile navigation if available
    if (typeof initMobileNav === 'function') {
        initMobileNav();
    }
    await loadUserProfile(); // Wait for user profile to load ID
    loadOrders();
    initializeProfileTabs();
    checkLoginStatus();
});

async function loadUserProfile() {
    // Get User for Multi-User Support
    if (window.DB) {
        const { data } = await window.DB.getUser();
        currentUser = data.user || {};
    } else {
        currentUser = JSON.parse(localStorage.getItem('be_current_user') || '{}');
    }

    // Determine Suffix for Keys
    const uidSuffix = currentUser.id ? `_${currentUser.id}` : '';

    // Standard user data from localStorage (Scoped)
    const savedAccountData = localStorage.getItem(`be_account_data${uidSuffix}`);
    const savedProfilePic = localStorage.getItem(`be_profile_picture${uidSuffix}`);

    // Update Header
    const welcomeMsg = document.getElementById('welcomeMsg');
    if (savedAccountData) {
        const data = JSON.parse(savedAccountData);
        if (data.firstName) {
            welcomeMsg.textContent = `Welcome back, ${data.firstName}!`;
        }
    } else if (currentUser.user_metadata && currentUser.user_metadata.full_name) {
        welcomeMsg.textContent = `Welcome back, ${currentUser.user_metadata.full_name}!`;
    } else if (currentUser.name) {
        welcomeMsg.textContent = `Welcome back, ${currentUser.name}!`;
    }

    // Update Profile Pic
    const profileImg = document.getElementById('dashboardProfilePic');
    const placeholder = document.querySelector('.profile-pic-placeholder');

    if (savedProfilePic) {
        profileImg.src = savedProfilePic;
        profileImg.style.display = 'block';
        placeholder.style.display = 'none';

        // Also update navbar icon
        const navImg = document.getElementById('profileIconImg');
        if (navImg) navImg.src = savedProfilePic;
    }
}

// ========================================
// ORDER MANAGEMENT
// ========================================

function loadOrders() {
    // Try to get from DB first (Multi-User)
    if (window.DB) {
        orders = window.DB.getMyOrders();
    } else {
        // Legacy/Fallback
        const storedOrders = localStorage.getItem('be_orders');
        if (storedOrders) {
            orders = JSON.parse(storedOrders);
        }
    }

    // Generate mock data for demo if no orders exist
    if (orders.length === 0) {
        orders = generateMockOrders();
        // Save mock orders to DB for persistence
        if (window.DB && currentUser.id) {
            orders.forEach(order => {
                window.DB.createOrder(order);
            });
            // Reload from DB to get proper IDs
            orders = window.DB.getMyOrders();
        }
    }

    renderDashboardStats();
    renderRecentOrders();
    renderAllOrders();
}

function generateMockOrders() {
    return [
        {
            id: 'EV-7829',
            date: 'Dec 18, 2024',
            status: 'Processing',
            total: 749.00,
            items: [
                { name: 'Haier FrostShield 400L', price: 749.00, quantity: 1, image: './assets/haier-refrigerator-01.jpg' }
            ],
            shipping: { street: '123 Tech Blvd', city: 'San Jose', state: 'CA', zip: '95110' },
            payment: 'Visa ending in 4242'
        },
        {
            id: 'EV-7828',
            date: 'Dec 10, 2024',
            status: 'Delivered',
            total: 399.00,
            items: [
                { name: 'Panasonic 7 Kg Front Load Inverter Washing Machine', price: 399.00, quantity: 1, image: './assets/home-product-02.jpg' }
            ],
            shipping: { street: '123 Tech Blvd', city: 'San Jose', state: 'CA', zip: '95110' },
            payment: 'PayPal'
        },
        {
            id: 'EV-7825',
            date: 'Nov 24, 2024',
            status: 'Delivered',
            total: 1199.00,
            items: [
                { name: 'Evora ClimatePro 1.5T', price: 599.00, quantity: 1, image: './assets/home-product-04.jpg' },
                { name: 'Evora MicroChef 30L', price: 229.00, quantity: 1, image: './assets/home-product-03.jpg' }
            ],
            shipping: { street: 'Home Address', city: 'New York', state: 'NY', zip: '10001' },
            payment: 'Mastercard ending in 8888'
        },
        {
            id: 'EV-7100',
            date: 'Oct 15, 2024',
            status: 'Cancelled',
            total: 1199.00,
            items: [
                { name: 'Apple iPhone 15 Pro Max 256GB', price: 1199.00, quantity: 1, image: './assets/apple-iphone-01.jpg' }
            ],
            shipping: { street: '123 Tech Blvd', city: 'San Jose', state: 'CA', zip: '95110' },
            payment: 'Visa ending in 4242'
        }
    ];
}

function renderDashboardStats() {
    document.getElementById('statTotalOrders').textContent = orders.length;
    // Mock review/wishlist counts for now
    document.getElementById('statReviews').textContent = '5';
    document.getElementById('statWishlist').textContent = '8';
}

function renderRecentOrders() {
    const tbody = document.getElementById('recentOrdersBody');
    if (!tbody) return;

    // Show top 3
    const recent = orders.slice(0, 3);

    tbody.innerHTML = recent.map(order => `
    <tr>
            <td><span style="font-weight: 600; color: #0099ff;">#${order.id}</span></td>
            <td>${order.date}</td>
            <td>${getStatusBadge(order.status)}</td>
            <td style="font-weight: 500;">$${order.total.toFixed(2)}</td>
            <td><button class="btn btn-outline" style="padding: 6px 12px; font-size: 13px;" onclick="viewOrderDetails('${order.id}')">View</button></td>
        </tr>
    `).join('');
}

function renderAllOrders(filter = 'all') {
    const tbody = document.getElementById('allOrdersBody');
    if (!tbody) return;

    let filteredOrders = orders;
    if (filter === 'active') {
        filteredOrders = orders.filter(o => ['Processing', 'Shipped'].includes(o.status));
    } else if (filter === 'completed') {
        filteredOrders = orders.filter(o => o.status === 'Delivered');
    } else if (filter === 'cancelled') {
        filteredOrders = orders.filter(o => o.status === 'Cancelled');
    }

    if (filteredOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px; color: #64748b;">No orders found.</td></tr>';
        return;
    }

    tbody.innerHTML = filteredOrders.map(order => `
    <tr>
            <td><span style="font-weight: 600; color: #0099ff;">#${order.id}</span></td>
            <td>${order.date}</td>
            <td style="color: #64748b; font-size: 13px;">${order.items.length} item(s)</td>
            <td>${getStatusBadge(order.status)}</td>
            <td style="font-weight: 500;">$${order.total.toFixed(2)}</td>
            <td><button class="btn btn-primary" style="padding: 6px 15px; font-size: 13px;" onclick="viewOrderDetails('${order.id}')">View Details</button></td>
        </tr>
    `).join('');
}

function getStatusBadge(status) {
    let className = 'status-processing'; // default
    if (status === 'Delivered') className = 'status-delivered';
    if (status === 'Cancelled') className = 'status-cancelled';

    return `<span class="status-badge ${className}">${status}</span>`;
}

// ========================================
// ORDER DETAILS & TABS
// ========================================

function initializeProfileTabs() {
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Filter listener
    const filterSelect = document.getElementById('orderFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            renderAllOrders(e.target.value);
        });
    }
}

function switchTab(tabId) {
    // Hide details view if open
    document.getElementById('orderDetailsView').style.display = 'none';

    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabId) btn.classList.add('active');
    });

    // Update content
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    const targetPane = document.getElementById(`${tabId} -tab`);
    if (targetPane) targetPane.classList.add('active');
}

function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Switch to orders tab context visually (optional, but good UX)
    // Actually, let's keep it in the current tab context or use a modal overlay
    // The current HTML structure puts #orderDetailsView OUTSIDE tabs-content? No, let's check.
    // In my HTML update, it was INSIDE tabs-content but sibling to tabs.
    // Let's hide all tabs and show detail view.

    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.getElementById('orderDetailsView').style.display = 'block';

    // Populate Data
    document.getElementById('detailOrderId').textContent = `Order #${order.id} `;
    document.getElementById('detailOrderDate').textContent = order.date;
    document.getElementById('detailOrderStatus').textContent = order.status;
    document.getElementById('detailOrderStatus').className = `status - badge ${order.status === 'Delivered' ? 'status-delivered' : order.status === 'Cancelled' ? 'status-cancelled' : 'status-processing'} `;
    document.getElementById('detailOrderTotal').textContent = `$${order.total.toFixed(2)} `;

    document.getElementById('detailShippingAddr').textContent = `${order.shipping.street}, ${order.shipping.city}, ${order.shipping.state} ${order.shipping.zip} `;
    document.getElementById('detailPayment').textContent = order.payment;

    // Calculations
    const subtotal = order.total; // Simplification
    document.getElementById('detailSubtotal').textContent = `$${subtotal.toFixed(2)} `;
    document.getElementById('detailFinalTotal').textContent = `$${order.total.toFixed(2)} `;

    // Render Timeline
    const timelineContainer = document.querySelector('.order-timeline');
    renderTimeline(timelineContainer, order.status);

    // Render Items
    const itemsContainer = document.getElementById('detailItemsList');
    itemsContainer.innerHTML = order.items.map(item => `
    < div style = "display: flex; gap: 15px; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; background: white;" >
            <div style="width: 60px; height: 60px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <i class="bx bx-package" style="font-size: 24px; color: #94a3b8;"></i>
            </div>
            <div style="flex: 1;">
                <h4 style="margin: 0 0 5px 0; font-size: 15px;">${item.name}</h4>
                <p style="margin: 0; color: #64748b; font-size: 13px;">Qty: ${item.quantity}</p>
            </div>
            <div style="font-weight: 600;">$${item.price.toFixed(2)}</div>
        </div >
    `).join('');
}

function closeOrderDetails() {
    document.getElementById('orderDetailsView').style.display = 'none';
    // Go back to orders tab
    switchTab('orders');
}

function renderTimeline(container, status) {
    // Simple 3-step timeline
    // Order Placed -> Processing -> Shipped -> Delivered
    // If Cancelled, show red state

    // Style for timeline handled via inline for now or CSS
    // Let's add basic HTML structure
    const steps = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];
    let currentStepIndex = steps.indexOf(status);
    if (status === 'Processing') currentStepIndex = 1; // Simplify
    if (status === 'Cancelled') {
        container.innerHTML = `< div style = "padding: 15px; background: #fee2e2; color: #dc2626; border-radius: 8px; text-align: center; font-weight: 600;" >🚫 This order has been cancelled.</div > `;
        return;
    }

    // Fallback if status doesn't match exactly (e.g. 'Active') regarding index
    if (currentStepIndex === -1) currentStepIndex = 1; // Default to processing

    container.innerHTML = `
    < div style = "display: flex; justify-content: space-between; position: relative;" >
            <div style="position: absolute; top: 15px; left: 0; right: 0; height: 2px; background: #e2e8f0; z-index: 1;"></div>
            <div style="position: absolute; top: 15px; left: 0; width: ${(currentStepIndex / (steps.length - 1)) * 100}%; height: 2px; background: #10b981; z-index: 1; transition: width 0.5s ease;"></div>
            
            ${steps.map((step, index) => {
        const isCompleted = index <= currentStepIndex;
        return `
                    <div style="text-align: center; z-index: 2; width: 80px;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${isCompleted ? '#10b981' : '#f1f5f9'}; color: ${isCompleted ? 'white' : '#94a3b8'}; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto; font-weight: 600; border: 2px solid ${isCompleted ? '#10b981' : 'white'}; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            ${isCompleted ? '<i class="bx bx-check"></i>' : index + 1}
                        </div>
                        <span style="font-size: 12px; font-weight: 600; color: ${isCompleted ? '#1e293b' : '#94a3b8'};">${step}</span>
                    </div>
                `;
    }).join('')
        }
        </div >
    `;
}

function checkLoginStatus() {
    // Basic check - for demo purposes, create a mock user if none exists
    let user = localStorage.getItem('be_current_user');
    if (!user) {
        // Create a demo user for testing
        const demoUser = {
            id: 'demo_user_123',
            email: 'demo@example.com',
            user_metadata: { full_name: 'Demo User' }
        };
        localStorage.setItem('be_current_user', JSON.stringify(demoUser));
        localStorage.setItem('be_session', JSON.stringify(demoUser));
        user = JSON.stringify(demoUser);
    }

    // Update currentUser
    currentUser = JSON.parse(user);
}
