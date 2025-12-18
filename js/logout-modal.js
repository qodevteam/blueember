// Logout Modal Handler
// Manages the custom logout confirmation modal

(function() {
    'use strict';

    let logoutCallback = null;
    let currentModal = null;

    // Initialize the modal when DOM is ready
    function initLogoutModal() {
        const modal = document.getElementById('logoutModal');
        const overlay = document.getElementById('logoutModalOverlay');
        const cancelBtn = document.getElementById('logoutCancelBtn');
        const confirmBtn = document.getElementById('logoutConfirmBtn');

        if (!modal || !overlay || !cancelBtn || !confirmBtn) {
            console.warn('Logout modal elements not found');
            return;
        }

        // Cancel button click handler
        cancelBtn.addEventListener('click', hideLogoutModal);

        // Confirm button click handler
        confirmBtn.addEventListener('click', handleLogoutConfirm);

        // Close modal when clicking overlay
        overlay.addEventListener('click', hideLogoutModal);

        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && currentModal === 'logout') {
                hideLogoutModal();
            }
        });

        // Prevent modal close when clicking inside modal content
        const modalContent = modal.querySelector('.logout-modal-content');
        if (modalContent) {
            modalContent.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }

    // Show the logout modal
    function showLogoutModal(callback) {
        logoutCallback = callback;
        currentModal = 'logout';
        
        const modal = document.getElementById('logoutModal');
        const confirmBtn = document.getElementById('logoutConfirmBtn');
        
        if (!modal) {
            console.error('Logout modal not found');
            // Fallback to native confirm if modal not available
            if (confirm("Are you sure you want to log out?")) {
                if (typeof callback === 'function') {
                    callback();
                }
            }
            return;
        }

        // Reset button state
        if (confirmBtn) {
            confirmBtn.classList.remove('loading');
            confirmBtn.disabled = false;
        }

        // Show modal with animation
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        
        // Add animation classes
        const overlay = modal.querySelector('.logout-modal-overlay');
        const content = modal.querySelector('.logout-modal-content');
        
        if (overlay) {
            overlay.classList.add('show');
        }
        if (content) {
            content.classList.add('show');
        }

        // Focus the cancel button for accessibility
        const cancelBtn = document.getElementById('logoutCancelBtn');
        if (cancelBtn) {
            setTimeout(() => cancelBtn.focus(), 100);
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    // Hide the logout modal
    function hideLogoutModal() {
        const modal = document.getElementById('logoutModal');
        if (!modal) return;

        const overlay = modal.querySelector('.logout-modal-overlay');
        const content = modal.querySelector('.logout-modal-content');
        
        // Add animation classes for closing
        if (overlay) {
            overlay.classList.remove('show');
            overlay.classList.add('hide');
        }
        if (content) {
            content.classList.remove('show');
            content.classList.add('hide');
        }

        // Hide modal after animation
        setTimeout(() => {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            
            if (overlay) {
                overlay.classList.remove('hide');
            }
            if (content) {
                content.classList.remove('hide');
            }

            // Reset state
            currentModal = null;
            logoutCallback = null;

            // Restore body scroll
            document.body.style.overflow = '';
        }, 300);
    }

    // Handle logout confirmation
    async function handleLogoutConfirm() {
        const confirmBtn = document.getElementById('logoutConfirmBtn');
        
        // Show loading state
        if (confirmBtn) {
            confirmBtn.classList.add('loading');
            confirmBtn.disabled = true;
        }

        // Add 2.8 second delay as requested
        await new Promise(resolve => setTimeout(resolve, 2800));

        // Execute the logout callback
        if (typeof logoutCallback === 'function') {
            try {
                await logoutCallback();
            } catch (error) {
                console.error('Logout error:', error);
                // Reset button state on error
                if (confirmBtn) {
                    confirmBtn.classList.remove('loading');
                    confirmBtn.disabled = false;
                }
                return;
            }
        }

        // Hide modal after successful logout
        hideLogoutModal();
    }

    // Public API - replace native confirm for logout
    function confirmLogout(callback) {
        showLogoutModal(callback);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLogoutModal);
    } else {
        initLogoutModal();
    }

    // Expose API globally
    window.LogoutModal = {
        confirm: confirmLogout,
        show: showLogoutModal,
        hide: hideLogoutModal
    };

    // Auto-replace native confirm for logout-related scenarios
    // This will be called by the existing logout handlers
    window.showLogoutConfirmation = confirmLogout;

})();