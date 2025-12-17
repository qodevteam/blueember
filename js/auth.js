// Auth Logic using Mock Database (LocalStorage)

document.addEventListener('dbReady', () => {
    console.log('Auth Module: DB Ready');
    initializeAuth();
});

// Fallback if event already fired
if (window.DB) {
    initializeAuth();
}

function initializeAuth() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Login Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = loginForm.querySelector('button');

            setLoading(btn, true);

            try {
                const { data, error } = await DB.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) throw error;

                // Success
                showToast('Login Successful! Redirecting...', 'success');
                setTimeout(() => window.location.href = 'index.html', 1000);

            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                setLoading(btn, false);
            }
        });
    }

    // Signup Handler
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const fullName = document.getElementById('signup-name').value;
            const btn = signupForm.querySelector('button');

            setLoading(btn, true);

            try {
                // Create User
                const { data, error } = await DB.signUp(email, password, fullName);

                if (error) throw error;

                showToast('Account Created! Welcome ' + fullName, 'success');
                setTimeout(() => window.location.href = 'index.html', 1500);

            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                setLoading(btn, false);
            }
        });
    }

    // Logout Handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await DB.signOut();
            window.location.href = 'login.html';
        });
    }
}

// UI Helpers
function setLoading(btn, isLoading) {
    if (isLoading) {
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;
    } else {
        btn.innerHTML = btn.dataset.originalText;
        btn.disabled = false;
    }
}

function showToast(message, type = 'info') {
    // Check if toast container exists
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${type === 'error' ? '#ff4d4d' : '#2ecc71'};
        color: white;
        padding: 15px 25px;
        margin-bottom: 10px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease-out;
        font-family: 'Poppins', sans-serif;
    `;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
`;
document.head.appendChild(style);
