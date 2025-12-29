# Order Tracking & Notification System Implementation

## Overview
A complete order tracking system has been implemented, featuring real-time status simulation, cross-tab synchronization, and smart notifications integrated into the chatbot and profile page. The system is designed with a premium aesthetic and robust local simulation logic.

## Key Features

### 1. Robust Core (`js/order-manager.js`)
- **OrderManager Module**: Handles `ember_orders_v2` in `localStorage`.
- **Status Simulation**: Automatically updates status (Processing -> Packed -> Shipped -> Delivered) over a 3-day cycle.
- **Demo Mode**: Automatically seeds a demonstration order if the order list is empty, allowing immediate testing of the "Packed" status.
- **Debug Tools**: `window.debugFastForward(hours)` available in console to fast-forward time.
- **Cross-Tab Sync**: Listens for storage events to update UI across tabs instantly.

### 2. Premium Visuals
- **CSS Power**: 
    - **Glassmorphism Notifications**: Notification cards use backdrop-filter and smooth hover effects (`chatbot.css`).
    - **Pulsing Indicators**: Red dots on the chatbot icon use a multi-layer pulse animation.
    - **Visual Progress Bar**: The Order Details page features a custom-coded CSS progress bar with animated filling and dynamic status icons (`profile.js`).
- **Status Badges**: Glowy, color-coded badges for all statuses (Processing, Packed, Shipped, Delivered, Cancelled).

### 3. Deep Integration
- **Checkout**: `checkout.html` creation flows immediately into the tracking system. Includes syntax fixes for media queries.
- **Profile**: 
    - **Deep Linking**: `profile.html?orderId=#123` auto-scrolls to details.
    - **Visual Timeline**: Replaced static text with a dynamic graphical timeline.
    - **Cancellation**: Logic allows cancelling within 24h, updating status and notifications instantly.
- **Chatbot**:
    - **Notification Center**: Dedicated view for alerts.
    - **Smart Unread Counts**: Auto-updates badge numbers.

## Usage Guide
1. **First Run**: Load the page. If you have no orders, a "Demo Order" is created (25 hours old) so you can see it in "Packed" state immediately.
2. **Place Order**: Use Checkout. You'll get an "Order Placed" notification.
3. **Check Status**: Go to Profile -> My Orders. Click "View Details" to see the animated timeline.
4. **Notifications**: Click the Chatbot -> Notifications tab.
5. **Fast Forward**: Open Console (F12) and type `debugFastForward(24)` to skip a day and see status changes.

## Files Modified
- `js/order-manager.js`: Core logic + Demo Seed.
- `js/profile.js`: Visual Timeline + Cancellation Logic.
- `js/chatbot.js`: Notification View.
- `chatbot.css`: Premium Styles (Glassmorphism, Pulse).
- `checkout.html`: Fixed syntax error in styles.
- `js/checkout.js`: Integration hook.
