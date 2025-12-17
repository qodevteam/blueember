// Logout Button Injector
// Injects a logout button dynamically when user is logged in
// Handles logout functionality with confirmation

(function() {
    'use strict';

    // Configuration
    const LOGOUT_BUTTON_ID = 'injected-logout-btn';
    const MOBILE_LOGOUT_ID = 'injected-mobile-logout-btn';

    // Create logout button element
    function createLogoutButton() {
        const btn = document.createElement('button');
        btn.id = LOGOUT_BUTTON_ID;
        btn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        btn.style.cssText = `
            padding: 8px 15px;
            background: white;
            font-family: 'Rubik', sans-serif;
            border-radius: 40px;
            font-size: 15px;
            border: none;
            cursor: pointer;
            color: #333;
            transition: all 0.3s ease;
            display: none; /* Hidden by default */
        `;
        btn.onmouseover = () => btn.style.background = '#f0f0f0';
        btn.onmouseout = () => btn.style.background = 'white';
        return btn;
    }

    // Create mobile logout button
    function createMobileLogoutButton() {
      const btn = document.createElement('button');
      btn.id = MOBILE_LOGOUT_ID;
      btn.className = 'mobile-logout-btn';
      btn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
      return btn;
    }

    // Logout handler
    async function handleLogout() {
        // Confirmation dialog
        if (!confirm('Are you sure you want to logout?')) {
            return;
        }

        try {
            // Sign out from DB
            if (window.DB && typeof window.DB.signOut === 'function') {
                await window.DB.signOut();
            }

            // Clear local session
            localStorage.removeItem('be_session');

            // Reload page to update UI
            window.location.reload();
        } catch (error) {
            console.error('Logout failed:', error);
            alert('Logout failed. Please try again.');
        }
    }

    // Desktop button not needed - only mobile sidebar
    function injectDesktopButton() {
        // No desktop injection
    }

    // Inject mobile button
    function injectMobileButton() {
        const sidebarFooter = document.querySelector('.sidebar-footer');
        if (!sidebarFooter) return;

        // Remove existing injected button if any
        const existing = document.getElementById(MOBILE_LOGOUT_ID);
        if (existing) existing.remove();

        const logoutBtn = createMobileLogoutButton();
        logoutBtn.addEventListener('click', handleLogout);

        // Insert in footer
        sidebarFooter.appendChild(logoutBtn);
    }

    // Update button visibility based on auth state
    async function updateButtonVisibility() {
        if (!window.DB) return;

        try {
            const { data: { user } } = await window.DB.getUser();
            const isLoggedIn = !!user;

            // Desktop button
            const desktopBtn = document.getElementById(LOGOUT_BUTTON_ID);
            if (desktopBtn) {
                desktopBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
            }

            // Mobile button
            const mobileBtn = document.getElementById(MOBILE_LOGOUT_ID);
            if (mobileBtn) {
                mobileBtn.style.display = isLoggedIn ? 'block' : 'none';
            }

            // Hide signup button when logged in
            const signupBtn = document.getElementById('signupNavBtn');
            if (signupBtn) {
                signupBtn.style.display = isLoggedIn ? 'none' : 'inline-block';
            }

        } catch (error) {
            console.error('Failed to check auth state:', error);
        }
    }

    // Initialize
    function init() {
        // Inject buttons
        injectDesktopButton();
        injectMobileButton();

        // Update visibility
        updateButtonVisibility();

        // Listen for auth changes
        if (window.DB) {
            // Initial check
            updateButtonVisibility();
        } else {
            // Wait for DB ready
            document.addEventListener('dbReady', updateButtonVisibility);
        }

        // Listen for storage changes (logout from other tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'be_session') {
                updateButtonVisibility();
            }
        });
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();