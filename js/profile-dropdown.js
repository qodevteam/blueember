// Profile Dropdown Functionality
// Handles dropdown toggle, profile picture loading, and user info display

(function () {
    'use strict';

    // DOM Elements
    const profileIconBtn = document.getElementById('profileIconBtn');
    const profileDropdownContainer = document.getElementById('profileDropdownContainer');
    const profileIconImg = document.getElementById('profileIconImg');
    const dropdownHeaderImg = document.getElementById('dropdownHeaderImg'); // Header Image in Dropdown

    // Sidebar Elements
    const mobileAvatar = document.getElementById('navbar-avatar-img');
    const sidebarBrand = document.getElementById('sidebarBrand');
    const sidebarProfileContainer = document.getElementById('sidebarProfileContainer');

    // Mobile Dropdown Elements (New)
    const mobileProfileDropdown = document.getElementById('mobileProfileDropdown');
    const mobileDropdownName = document.getElementById('mobileDropdownName');
    const mobileDropdownEmail = document.getElementById('mobileDropdownEmail');
    const mobileDropdownLogoutBtn = document.getElementById('mobileDropdownLogoutBtn');

    // User Info Elements (Dropdown)
    const profileDropdownName = document.getElementById('profileDropdownName');
    const profileDropdownEmail = document.getElementById('profileDropdownEmail');

    // Toggle dropdown on profile icon click
    if (profileIconBtn && profileDropdownContainer) {
        profileIconBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            // Check if click is outside MAIN container AND not on the trigger buttons
            const isClickInside = profileDropdownContainer.contains(e.target);
            const isClickOnMainBtn = profileIconBtn.contains(e.target);

            // Check if click is outside MOBILE container AND not on the trigger
            const isClickInsideMobile = mobileProfileDropdown && mobileProfileDropdown.contains(e.target);
            const isClickOnSidebarProfile = sidebarProfileContainer && sidebarProfileContainer.contains(e.target);

            // Handle Desktop Dropdown Close
            if (!isClickInside && !isClickOnMainBtn) {
                if (profileDropdownContainer.classList.contains('visible')) {
                    closeDropdown();
                }
            }

            // Handle Mobile Dropdown Close
            if (!isClickInsideMobile && !isClickOnSidebarProfile && mobileProfileDropdown) {
                if (mobileProfileDropdown.style.display === 'block') {
                    toggleMobileDropdown(false);
                }
            }
        });

        // Prevent dropdown from closing when clicking inside it
        profileDropdownContainer.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    // Sidebar Profile Click Handler -> Toggles MOBILE Dropdown now
    if (sidebarProfileContainer) {
        sidebarProfileContainer.addEventListener('click', function (e) {
            e.stopPropagation();
            if (mobileProfileDropdown) {
                const isVisible = mobileProfileDropdown.style.display === 'block';
                toggleMobileDropdown(!isVisible);
            }
        });
    }

    function toggleMobileDropdown(show) {
        if (!mobileProfileDropdown) return;

        if (show) {
            mobileProfileDropdown.style.display = 'block';
            // Animation is handled by CSS keyframe on display: block
        } else {
            mobileProfileDropdown.style.display = 'none';
        }
    }

    function toggleDropdown() {
        const isVisible = profileDropdownContainer.classList.contains('visible');
        if (!isVisible) {
            profileDropdownContainer.style.display = 'block';
            setTimeout(() => {
                profileDropdownContainer.classList.add('visible');
            }, 10);
        } else {
            closeDropdown();
        }
    }

    function closeDropdown() {
        profileDropdownContainer.classList.remove('visible');
        setTimeout(() => {
            profileDropdownContainer.style.display = 'none';
        }, 300);
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

        if (profilePicture) {
            if (profileIconImg) profileIconImg.src = profilePicture;
            if (dropdownHeaderImg) dropdownHeaderImg.src = profilePicture; // Update dropdown header
            if (mobileAvatar) mobileAvatar.src = profilePicture; // Update mobile sidebar
        }
    }

    // Load user info (name/email) from DB or localStorage
    async function loadUserInfo() {
        try {
            if (typeof DB !== 'undefined') {
                const { data: { user } } = await DB.getUser();
                if (user) {
                    const fullName = user.user_metadata.full_name || 'User';
                    const email = user.email;

                    // Update Main Dropdown
                    if (profileDropdownName) profileDropdownName.textContent = fullName;
                    if (profileDropdownEmail) profileDropdownEmail.textContent = email;

                    // Update Sidebar Text (if needed by HTML, but we just use the name for the new dropdown)
                    const sidebarUserName = document.getElementById('sidebarUserName');
                    const sidebarUserEmail = document.getElementById('sidebarUserEmail');
                    if (sidebarUserName) sidebarUserName.textContent = fullName;
                    if (sidebarUserEmail) sidebarUserEmail.textContent = email;

                    // Update Mobile Dropdown Info
                    if (mobileDropdownName) mobileDropdownName.textContent = fullName;
                    if (mobileDropdownEmail) mobileDropdownEmail.textContent = email;
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
            btn = e.target.closest('.sign-out-btn, #signOutBtn, #nav-dropdown-logout, #mobile-logout-btn, .mobile-logout-btn, #mobileDropdownLogoutBtn');
        }

        const performLogout = async () => {
            if (btn) {
                // Ensure button is relative
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
                btn.insertAdjacentHTML('beforeend', spinnerHtml);
            }

            await new Promise(resolve => setTimeout(resolve, 3000));

            localStorage.removeItem('be_session');

            if (typeof DB !== 'undefined') {
                try {
                    await DB.signOut();
                } catch (error) {
                    console.warn('DB.signOut failed', error);
                }
            }

            window.location.href = 'login.html';
        };

        if (window.LogoutModal && typeof window.LogoutModal.confirm === 'function') {
            window.LogoutModal.confirm(performLogout);
        } else if (window.showLogoutConfirmation && typeof window.showLogoutConfirmation === 'function') {
            window.showLogoutConfirmation(performLogout);
        } else {
            if (confirm("Are you sure you want to log out?")) {
                await performLogout();
            }
        }
    }

    // Event Delegation for Sign Out
    document.addEventListener('click', async function (e) {
        const btn = e.target.closest('.sign-out-btn, #signOutBtn, #nav-dropdown-logout, #mobile-logout-btn, .mobile-logout-btn, #mobileDropdownLogoutBtn');
        if (btn) await handleLogout(e);
    });

    // Update Dropdown UI based on Auth State
    async function updateAuthUI() {
        if (typeof DB === 'undefined') return;

        const { data: { user } } = await DB.getUser();

        // Main Nav Buttons
        const authBtn = document.getElementById('nav-dropdown-logout') || document.getElementById('signOutBtn') || document.getElementById('nav-dropdown-login');
        const profileIconBtn = document.getElementById('profileIconBtn');
        const signupBtn = document.querySelector('.thebigthree-login\\/signup-btn');

        if (authBtn) {
            if (user) {
                // User is Logged In
                authBtn.id = 'nav-dropdown-logout';
                authBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i><span>Logout</span>';
                authBtn.href = '#';

                if (profileIconBtn) profileIconBtn.style.display = 'flex';
                if (signupBtn) signupBtn.style.display = 'none';

                // Mobile Sidebar: Show Profile, Hide Brand
                if (sidebarBrand) sidebarBrand.style.display = 'none';
                if (sidebarProfileContainer) sidebarProfileContainer.style.display = 'flex';

            } else {
                // User is Logged Out
                authBtn.id = 'nav-dropdown-login';
                authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Log In</span>';
                authBtn.href = 'login.html';

                if (profileIconBtn) profileIconBtn.style.display = 'none';
                if (signupBtn) signupBtn.style.display = 'flex';

                // Mobile Sidebar: Show Brand, Hide Profile
                if (sidebarBrand) sidebarBrand.style.display = 'block';
                if (sidebarProfileContainer) sidebarProfileContainer.style.display = 'none';

                // Also ensure mobile dropdown is closed/hidden
                if (mobileProfileDropdown) mobileProfileDropdown.style.display = 'none';
            }
        }
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function () {
        loadProfilePicture();

        if (typeof DB !== 'undefined') {
            loadUserInfo();
            updateAuthUI();
        } else {
            document.addEventListener('dbReady', function () {
                loadUserInfo();
                updateAuthUI();
            });
        }

        const signupBtn = document.getElementById('signupNavBtn');
        if (signupBtn) {
            signupBtn.addEventListener('click', () => window.location.href = 'login.html');
        }
    });

    window.addEventListener('profilePictureUpdated', loadProfilePicture);
    window.addEventListener('storage', function (e) {
        if (e.key === 'be_session') updateAuthUI();
    });

    window.ProfileDropdown = {
        loadProfilePicture,
        loadUserInfo,
        updateAuthUI
    };
})();



