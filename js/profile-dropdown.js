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
    function loadProfilePicture() {
        const profilePicture = localStorage.getItem('profilePicture');
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

        // 1. Confirm intention
        if (!window.confirm("Are you sure you want to log out?")) {
            return;
        }

        // Forcefully clear everything
        localStorage.removeItem('be_session');
        localStorage.removeItem('profilePicture');

        if (typeof DB !== 'undefined') {
            try {
                await DB.signOut();
            } catch (error) {
                console.warn('DB.signOut failed, but localStorage has been cleared.', error);
            }
        }

        // Redirect to login page
        window.location.href = 'login.html';
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
