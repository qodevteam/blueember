// Global State
let orders = [];
let currentUser = {};

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize mobile navigation if available
    if (typeof initMobileNav === 'function') {
        initMobileNav();
    }
    await loadUserProfile(); // Wait for user profile to load ID
    await loadOrders();
    initializeProfileTabs();
    initializeProfileModal();
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

async function loadOrders() {
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

    // Remove mock data generation - use only real data
    // If no orders exist, show empty state instead of mock data
    if (orders.length === 0) {
        console.log('No orders found for user');
    }

    // Render components with real data
    await renderDashboardStats();
    renderRecentOrders();
    renderAllOrders();
}

async function renderDashboardStats() {
    // Get real statistics from the database
    const stats = window.DB ? window.DB.getDashboardStats() : {
        totalOrders: orders.length,
        totalReviews: 0,
        totalWishlist: 0,
        totalSpent: 0
    };
    
    // Update dashboard statistics with real data
    const totalOrdersElement = document.getElementById('statTotalOrders');
    const totalReviewsElement = document.getElementById('statReviews');
    const totalWishlistElement = document.getElementById('statWishlist');
    const totalSpentElement = document.getElementById('statTotalSpent');
    
    if (totalOrdersElement) totalOrdersElement.textContent = stats.totalOrders;
    if (totalReviewsElement) totalReviewsElement.textContent = stats.totalReviews;
    if (totalWishlistElement) totalWishlistElement.textContent = stats.totalWishlist;
    if (totalSpentElement) totalSpentElement.textContent = `$${stats.totalSpent.toFixed(2)}`;
    
    console.log('Dashboard stats loaded:', stats);
}

function renderRecentOrders() {
    const tbody = document.getElementById('recentOrdersBody');
    if (!tbody) return;

    // Show top 3
    const recent = orders.slice(0, 3);

    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">No recent orders found.</td></tr>';
        return;
    }

    tbody.innerHTML = recent.map(order => {
        const currentStatus = calculateOrderStatus(order);
        const formattedDate = formatOrderDate(order.created_at || order.date);
        
        return `
        <tr>
            <td><span style="font-weight: 600; color: #0099ff;">#${order.id}</span></td>
            <td>${formattedDate}</td>
            <td>${getStatusBadge(currentStatus)}</td>
            <td style="font-weight: 500;">$${(order.total || 0).toFixed(2)}</td>
            <td><button class="btn btn-outline" style="padding: 6px 12px; font-size: 13px;" onclick="viewOrderDetails('${order.id}')">View</button></td>
        </tr>
        `;
    }).join('');
}

function renderAllOrders(filter = 'all') {
    const tbody = document.getElementById('allOrdersBody');
    if (!tbody) return;

    let filteredOrders = orders;
    if (filter === 'active') {
        filteredOrders = orders.filter(o => {
            const status = calculateOrderStatus(o);
            return ['Processing', 'Shipped'].includes(status);
        });
    } else if (filter === 'completed') {
        filteredOrders = orders.filter(o => calculateOrderStatus(o) === 'Delivered');
    } else if (filter === 'cancelled') {
        filteredOrders = orders.filter(o => calculateOrderStatus(o) === 'Cancelled');
    }

    if (filteredOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px; color: #64748b;">No orders found.</td></tr>';
        return;
    }

    tbody.innerHTML = filteredOrders.map(order => {
        const currentStatus = calculateOrderStatus(order);
        const formattedDate = formatOrderDate(order.created_at || order.date);
        const itemCount = order.items ? order.items.length : 0;
        
        return `
        <tr>
            <td><span style="font-weight: 600; color: #0099ff;">#${order.id}</span></td>
            <td>${formattedDate}</td>
            <td style="color: #64748b; font-size: 13px;">${itemCount} item(s)</td>
            <td>${getStatusBadge(currentStatus)}</td>
            <td style="font-weight: 500;">$${(order.total || 0).toFixed(2)}</td>
            <td><button class="btn btn-primary" style="padding: 6px 15px; font-size: 13px;" onclick="viewOrderDetails('${order.id}')">View Details</button></td>
        </tr>
        `;
    }).join('');
}

// ========================================
// HELPER FUNCTIONS
// ========================================

// Format date string to readable format
function formatOrderDate(dateString) {
    if (!dateString) return 'N/A';
    
    // Handle both ISO strings and already formatted dates
    if (dateString.includes('T')) {
        // ISO string
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }
    
    // Already formatted date string
    return dateString;
}

// Calculate accurate order status based on timestamps
function calculateOrderStatus(order) {
    // If order has explicit status, use it
    if (order.status && order.status !== 'Processing') {
        return order.status;
    }
    
    // Calculate status based on creation time and shipping
    const createdAt = new Date(order.created_at || order.date);
    const now = new Date();
    const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 7) {
        return 'Delivered';
    } else if (daysDiff >= 3) {
        return 'Shipped';
    } else {
        return 'Processing';
    }
}

// Generate realistic order timeline with timestamps
function generateOrderTimeline(order) {
    const createdAt = new Date(order.created_at || order.date);
    const status = calculateOrderStatus(order);
    
    const timeline = [
        {
            step: 'Order Placed',
            timestamp: createdAt,
            completed: true
        },
        {
            step: 'Processing',
            timestamp: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000), // +1 day
            completed: true
        },
        {
            step: 'Shipped',
            timestamp: new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000), // +3 days
            completed: ['Shipped', 'Delivered'].includes(status)
        },
        {
            step: 'Delivered',
            timestamp: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 days
            completed: status === 'Delivered'
        }
    ];
    
    return timeline;
}

function getStatusBadge(status) {
    let className = 'status-processing'; // default
    if (status === 'Delivered') className = 'status-delivered';
    if (status === 'Cancelled') className = 'status-cancelled';
    if (status === 'Shipped') className = 'status-shipped';

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
    const targetPane = document.getElementById(`${tabId}-tab`);
    if (targetPane) targetPane.classList.add('active');
}

function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Switch to orders tab context visually
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.getElementById('orderDetailsView').style.display = 'block';

    // Calculate current status and format date
    const currentStatus = calculateOrderStatus(order);
    const formattedDate = formatOrderDate(order.created_at || order.date);
    
    // Populate Data with real data
    const orderIdElement = document.getElementById('detailOrderId');
    const orderDateElement = document.getElementById('detailOrderDate');
    const orderStatusElement = document.getElementById('detailOrderStatus');
    const orderTotalElement = document.getElementById('detailOrderTotal');
    const shippingAddrElement = document.getElementById('detailShippingAddr');
    const paymentElement = document.getElementById('detailPayment');
    const subtotalElement = document.getElementById('detailSubtotal');
    const finalTotalElement = document.getElementById('detailFinalTotal');
    
    if (orderIdElement) orderIdElement.textContent = `Order #${order.id} `;
    if (orderDateElement) orderDateElement.textContent = formattedDate;
    if (orderStatusElement) {
        orderStatusElement.textContent = currentStatus;
        orderStatusElement.className = `status-badge ${
            currentStatus === 'Delivered' ? 'status-delivered' : 
            currentStatus === 'Cancelled' ? 'status-cancelled' : 
            currentStatus === 'Shipped' ? 'status-shipped' : 'status-processing'
        }`;
    }
    if (orderTotalElement) orderTotalElement.textContent = `$${(order.total || 0).toFixed(2)} `;
    if (shippingAddrElement && order.shipping) {
        shippingAddrElement.textContent = `${order.shipping.street}, ${order.shipping.city}, ${order.shipping.state} ${order.shipping.zip} `;
    }
    if (paymentElement) paymentElement.textContent = order.payment || 'N/A';

    // Calculations
    const subtotal = order.total || 0;
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)} `;
    if (finalTotalElement) finalTotalElement.textContent = `$${subtotal.toFixed(2)} `;

    // Render Timeline with real timestamps
    const timelineContainer = document.querySelector('.order-timeline');
    if (timelineContainer) {
        renderTimeline(timelineContainer, order);
    }

    // Render Items
    const itemsContainer = document.getElementById('detailItemsList');
    if (itemsContainer && order.items) {
        itemsContainer.innerHTML = order.items.map(item => `
        <div style="display: flex; gap: 15px; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; background: white;">
            <div style="width: 60px; height: 60px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <i class="bx bx-package" style="font-size: 24px; color: #94a3b8;"></i>
            </div>
            <div style="flex: 1;">
                <h4 style="margin: 0 0 5px 0; font-size: 15px;">${item.name}</h4>
                <p style="margin: 0; color: #64748b; font-size: 13px;">Qty: ${item.quantity}</p>
            </div>
            <div style="font-weight: 600;">$${(item.price || 0).toFixed(2)}</div>
        </div>
        `).join('');
    }
}

function closeOrderDetails() {
    document.getElementById('orderDetailsView').style.display = 'none';
    // Go back to orders tab
    switchTab('orders');
}

function renderTimeline(container, order) {
    // Handle cancelled orders
    const currentStatus = calculateOrderStatus(order);
    if (currentStatus === 'Cancelled') {
        container.innerHTML = `
        <div style="padding: 15px; background: #fee2e2; color: #dc2626; border-radius: 8px; text-align: center; font-weight: 600;">
            🚫 This order has been cancelled.
        </div>
        `;
        return;
    }

    // Generate timeline with real timestamps
    const timeline = generateOrderTimeline(order);
    const completedSteps = timeline.filter(step => step.completed).length;
    
    container.innerHTML = `
    <div style="display: flex; justify-content: space-between; position: relative; margin-bottom: 20px;">
        <div style="position: absolute; top: 15px; left: 0; right: 0; height: 2px; background: #e2e8f0; z-index: 1;"></div>
        <div style="position: absolute; top: 15px; left: 0; width: ${(completedSteps / (timeline.length - 1)) * 100}%; height: 2px; background: #10b981; z-index: 1; transition: width 0.5s ease;"></div>
        
        ${timeline.map((step, index) => {
            const isCompleted = step.completed;
            const stepDate = step.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            return `
            <div style="text-align: center; z-index: 2; width: 80px;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: ${isCompleted ? '#10b981' : '#f1f5f9'}; color: ${isCompleted ? 'white' : '#94a3b8'}; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto; font-weight: 600; border: 2px solid ${isCompleted ? '#10b981' : 'white'}; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    ${isCompleted ? '<i class="bx bx-check"></i>' : index + 1}
                </div>
                <span style="font-size: 12px; font-weight: 600; color: ${isCompleted ? '#1e293b' : '#94a3b8'};">${step.step}</span>
                ${isCompleted ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">${stepDate}</div>` : ''}
            </div>
            `;
        }).join('')}
    </div>
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

// ========================================
// PROFILE IMAGE MODAL
// ========================================

let imageScale = 1;
let translateX = 0;
let translateY = 0;
let initialDistance = 0;
let lastScale = 1;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let initialTranslateX = 0;
let initialTranslateY = 0;

function initializeProfileModal() {
    const profilePicContainer = document.querySelector('.profile-pic-container');
    const modalOverlay = document.getElementById('profileModalOverlay');
    const modal = document.getElementById('profileImageModal');
    const modalImage = document.getElementById('profileModalImage');
    const closeBtn = document.getElementById('profileModalCloseBtn');

    if (!profilePicContainer || !modalOverlay || !modal || !modalImage) return;

    // Open modal on click
    profilePicContainer.addEventListener('click', () => {
        const profileImg = document.getElementById('dashboardProfilePic');
        if (profileImg && profileImg.src && profileImg.style.display !== 'none') {
            modalImage.src = profileImg.src;
            imageScale = 1;
            translateX = 0;
            translateY = 0;
            updateImageTransform();
            modalImage.style.transformOrigin = 'center center';
            openProfileModal();
        }
    });

    // Close modal on overlay click
    modalOverlay.addEventListener('click', closeProfileModal);

    // Close modal on modal window click (but not on image)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeProfileModal();
        }
    });

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeProfileModal();
        }
    });

    // Close modal on close button click
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProfileModal);
    }

    // Zoom functionality
    // Mouse wheel zoom
    modalImage.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = modalImage.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        modalImage.style.transformOrigin = `${x}% ${y}%`;

        const delta = e.deltaY > 0 ? -0.10 : 0.10;
        imageScale = Math.max(imageScale + delta, 0.1);
        clampTranslate();
        updateImageTransform();
    });

    // Touch and mouse interactions
    let touches = [];
    modalImage.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            touches = Array.from(e.touches);
            initialDistance = getDistance(touches[0], touches[1]);
            lastScale = imageScale;
            isDragging = false; // Stop dragging if pinch starts
        } else if (e.touches.length === 1 && imageScale > 1) {
            e.preventDefault();
            isDragging = true;
            dragStartX = e.touches[0].clientX;
            dragStartY = e.touches[0].clientY;
            initialTranslateX = translateX;
            initialTranslateY = translateY;
        }
    });

    modalImage.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentTouches = Array.from(e.touches);
            const currentDistance = getDistance(currentTouches[0], currentTouches[1]);
            const scaleChange = currentDistance / initialDistance;
            const adjustedScaleChange = 1 + (scaleChange - 1) * 0.6;
            imageScale = Math.max(lastScale * adjustedScaleChange, 0.1);

            // Set transform origin to center of touches
            const centerX = (currentTouches[0].clientX + currentTouches[1].clientX) / 2;
            const centerY = (currentTouches[0].clientY + currentTouches[1].clientY) / 2;
            const rect = modalImage.getBoundingClientRect();
            const x = ((centerX - rect.left) / rect.width) * 100;
            const y = ((centerY - rect.top) / rect.height) * 100;
            modalImage.style.transformOrigin = `${x}% ${y}%`;

            clampTranslate();
            updateImageTransform();
        } else if (isDragging && e.touches.length === 1 && imageScale > 1) {
            e.preventDefault();
            const deltaX = (e.touches[0].clientX - dragStartX) * 0.6;
            const deltaY = (e.touches[0].clientY - dragStartY) * 0.6;
            translateX = initialTranslateX + deltaX;
            translateY = initialTranslateY + deltaY;
            clampTranslate();
            updateImageTransform();
        }
    });

    modalImage.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            touches = [];
        }
        isDragging = false;
    });

    // Mouse drag
    modalImage.addEventListener('mousedown', (e) => {
        if (imageScale > 1) {
            e.preventDefault();
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            initialTranslateX = translateX;
            initialTranslateY = translateY;
            modalImage.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging && imageScale > 1) {
            e.preventDefault();
            const deltaX = (e.clientX - dragStartX) * 0.6;
            const deltaY = (e.clientY - dragStartY) * 0.6;
            translateX = initialTranslateX + deltaX;
            translateY = initialTranslateY + deltaY;
            clampTranslate();
            updateImageTransform();
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        modalImage.style.cursor = '';
    });
}

function updateImageTransform() {
    const modalImage = document.getElementById('profileModalImage');
    modalImage.style.transform = `scale(${imageScale}) translate(${translateX}px, ${translateY}px)`;
}

function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function clampTranslate() {
    if (imageScale <= 1) {
        translateX = 0;
        translateY = 0;
        return;
    }
    const modal = document.getElementById('profileImageModal');
    const rect = modal.getBoundingClientRect();
    const maxX = (imageScale - 1) * rect.width / 2;
    const maxY = (imageScale - 1) * rect.height / 2;
    translateX = Math.max(-maxX, Math.min(maxX, translateX));
    translateY = Math.max(-maxY, Math.min(maxY, translateY));
}

function openProfileModal() {
    const modalOverlay = document.getElementById('profileModalOverlay');
    const modal = document.getElementById('profileImageModal');
    const closeBtn = document.getElementById('profileModalCloseBtn');

    modalOverlay.classList.add('show');
    modal.classList.add('show');
    modalOverlay.setAttribute('aria-hidden', 'false');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (closeBtn) closeBtn.style.display = 'flex';
}

function closeProfileModal() {
    const modalOverlay = document.getElementById('profileModalOverlay');
    const modal = document.getElementById('profileImageModal');
    const closeBtn = document.getElementById('profileModalCloseBtn');

    modalOverlay.classList.remove('show');
    modal.classList.remove('show');
    modalOverlay.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (closeBtn) closeBtn.style.display = 'none';
}



