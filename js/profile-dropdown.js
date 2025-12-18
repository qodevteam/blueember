// Profile Dropdown Functionality
// Handles dropdown toggle, profile picture loading, and user info display

(function () {
    'use strict';

    // DOM Elements
    const profileIconBtn = document.getElementById('profileIconBtn');
    const profileDropdownContainer = document.getElementById('profileDropdownContainer'); // Changed target
    const profileIconImg = document.getElementById('profileIconImg');
    const dropdownProfileImg = document.getElementById('dropdownProfileImg');
    const profileDropdownName = document.getElementById('profileDropdownName');
    const profileDropdownEmail = document.getElementById('profileDropdownEmail');
    const signOutBtn = document.getElementById('signOutBtn');

    // Toggle dropdown on profile icon click
    if (profileIconBtn && profileDropdownContainer) {
        profileIconBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            const isVisible = profileDropdownContainer.classList.contains('visible');

            if (!isVisible) {
                // Open
                profileDropdownContainer.style.display = 'block';
                // Small delay to allow display block to apply before transition
                setTimeout(() => {
                    profileDropdownContainer.classList.add('visible');
                }, 10);
            } else {
                // Close
                profileDropdownContainer.classList.remove('visible');
                // Wait for transition to finish before hiding
                setTimeout(() => {
                    profileDropdownContainer.style.display = 'none';
                }, 300);
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (!profileDropdownContainer.contains(e.target) && !profileIconBtn.contains(e.target)) {
                if (profileDropdownContainer.classList.contains('visible')) {
                    profileDropdownContainer.classList.remove('visible');
                    setTimeout(() => {
                        profileDropdownContainer.style.display = 'none';
                    }, 300);
                }
            }
        });

        // Prevent dropdown from closing when clicking inside it
        profileDropdownContainer.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    // Load profile picture from localStorage
    async function loadProfilePicture() {
        let suffix = '';
        try {
            if (typeof DB !== 'undefined') {
                const { data } = await DB.getUser();
                if (data.user?.id) suffix = '_' + data.user.id;
            } else {
                const u = JSON.parse(localStorage.getItem('be_current_user') || '{}');
                if (u.id) suffix = '_' + u.id;
            }
        } catch (e) { console.warn('User fetch failed', e); }

        const profilePicture = localStorage.getItem('be_profile_picture' + suffix);
        const mobileAvatar = document.getElementById('navbar-avatar-img'); // Mobile sidebar avatar

        if (profilePicture) {
            if (profileIconImg) profileIconImg.src = profilePicture;
            if (dropdownProfileImg) dropdownProfileImg.src = profilePicture;
            if (mobileAvatar) mobileAvatar.src = profilePicture; // Update mobile sidebar
        }
    }

    // Load user info (name/email) from DB or localStorage
    async function loadUserInfo() {
        try {
            if (typeof DB !== 'undefined') {
                const { data: { user } } = await DB.getUser();
                if (user) {
                    if (profileDropdownName) {
                        const fullName = user.user_metadata.full_name || 'User';
                        profileDropdownName.textContent = fullName;
                    }
                    if (profileDropdownEmail) {
                        profileDropdownEmail.textContent = user.email;
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to load user info for dropdown', error);
        }
    }

    // Unified Logout Handler
    async function handleLogout(e) {
        if (e) e.preventDefault();

        // Find the button to animate
        let btn = null;
        if (e && e.target) {
            btn = e.target.closest('.sign-out-btn, #signOutBtn, #nav-dropdown-logout, #mobile-logout-btn, .mobile-logout-btn');
        }

        // Create the actual logout function
        const performLogout = async () => {
            if (btn) {
                // Ensure button is relative so the absolute spinner centers within it
                const computedStyle = window.getComputedStyle(btn);
                if (computedStyle.position === 'static') {
                    btn.style.position = 'relative';
                }

                // Spinner HTML Structure
                const spinnerHtml = `
                <div class="spinner center">
                    <div class="spinner-blade"></div>
                    <div class="spinner-blade"></div>
                    <div class="spinner-blade"></div>
                    <div class="spinner-blade"></div>
                    <div class="spinner-blade"></div>
                    <div class="spinner-blade"></div>
                    <div class="spinner-blade"></div>
                    <div class="spinner-blade"></div>
                    <div class="spinner-blade"></div>
                    <div class="spinner-blade"></div>
                    <div class="spinner-blade"></div>
                    <div class="spinner-blade"></div>
                </div>`;

                // Append spinner to the button
                btn.insertAdjacentHTML('beforeend', spinnerHtml);
            }

            // Wait 3 seconds
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Forcefully clear session only
            localStorage.removeItem('be_session');
            // Do NOT remove profilePicture here as it persists user settings

            if (typeof DB !== 'undefined') {
                try {
                    await DB.signOut();
                } catch (error) {
                    console.warn('DB.signOut failed, but localStorage has been cleared.', error);
                }
            }

            // Redirect to login page
            window.location.href = 'login.html';
        };

        // Use custom modal if available, otherwise fallback to native confirm
        if (window.LogoutModal && typeof window.LogoutModal.confirm === 'function') {
            window.LogoutModal.confirm(performLogout);
        } else if (window.showLogoutConfirmation && typeof window.showLogoutConfirmation === 'function') {
            window.showLogoutConfirmation(performLogout);
        } else {
            // Fallback to native confirm
            if (confirm("Are you sure you want to log out?")) {
                await performLogout();
            }
        }
    }

    // Event Delegation for Sign Out (Handles dynamic elements)
    document.addEventListener('click', async function (e) {
        // Check if the clicked element or its parent is the logout button
        const btn = e.target.closest('.sign-out-btn, #signOutBtn, #nav-dropdown-logout, #mobile-logout-btn, .mobile-logout-btn');

        if (btn) {
            await handleLogout(e);
        }
    });

    // Update Dropdown UI based on Auth State
    async function updateAuthUI() {
        if (typeof DB === 'undefined') return;

        const { data: { user } } = await DB.getUser();

        // Target the button (using the known ID or class)
        const authBtn = document.getElementById('nav-dropdown-logout') || document.getElementById('signOutBtn') || document.getElementById('nav-dropdown-login');
        const profileIconBtn = document.getElementById('profileIconBtn');
        const signupBtn = document.querySelector('.thebigthree-login\\/signup-btn'); // Target signup button

        if (authBtn) {
            if (user) {
                // User is Logged In -> Show Logout in dropdown
                authBtn.id = 'nav-dropdown-logout'; // Ensure ID matches
                authBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i><span>Logout</span>';
                authBtn.href = '#';

                // Show profile icon, hide signup button
                if (profileIconBtn) profileIconBtn.style.display = 'flex';
                if (signupBtn) signupBtn.style.display = 'none';

            } else {
                // User is Logged Out -> Show Login in dropdown
                authBtn.id = 'nav-dropdown-login';

                authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Log In</span>';
                authBtn.href = 'login.html';

                // Hide profile icon, show signup button
                if (profileIconBtn) profileIconBtn.style.display = 'none';
                if (signupBtn) signupBtn.style.display = 'flex';
            }
        }
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function () {
        loadProfilePicture();

        // Check if DB is ready
        if (typeof DB !== 'undefined') {
            loadUserInfo();
            updateAuthUI();
        } else {
            // Listen for dbReady event
            document.addEventListener('dbReady', function () {
                loadUserInfo();
                updateAuthUI();
            });
        }

        // Signup button redirect
        const signupBtn = document.getElementById('signupNavBtn');
        if (signupBtn) {
            signupBtn.addEventListener('click', function () {
                window.location.href = 'login.html';
            });
        }
    });

    // Listen for profile picture updates (custom event)
    window.addEventListener('profilePictureUpdated', function () {
        loadProfilePicture();
    });

    // Listen for auth state changes (simple storage check)
    window.addEventListener('storage', function (e) {
        if (e.key === 'be_session') {
            updateAuthUI();
        }
    });

    // Export functions for external use
    window.ProfileDropdown = {
        loadProfilePicture,
        loadUserInfo,
        updateAuthUI
    };
})();
