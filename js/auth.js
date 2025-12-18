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
        // Store original content
        btn.dataset.originalText = btn.innerHTML;
        
        // Create spinner element
        const spinner = document.createElement('div');
        spinner.className = 'spinner center';
        spinner.innerHTML = `
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
        `;
        
        // Replace button content with spinner
        btn.innerHTML = spinner.outerHTML;
        btn.disabled = true;
    } else {
        // Restore original content
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
    
    /* Custom Spinner CSS */
    .spinner {
        font-size: 28px;
        position: relative;
        display: inline-block;
        width: 1em;
        height: 1em;
    }
    
    .spinner.center {
        position: relative;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
    }
    
    .spinner .spinner-blade {
        position: absolute;
        left: 0.4629em;
        bottom: 0;
        width: 0.074em;
        height: 0.2777em;
        border-radius: 0.0555em;
        background-color: transparent;
        -webkit-transform-origin: center -0.2222em;
        -ms-transform-origin: center -0.2222em;
        transform-origin: center -0.2222em;
        animation: spinner-fade9234 1s infinite linear;
    }
    
    .spinner .spinner-blade:nth-child(1) {
        -webkit-animation-delay: 0s;
        animation-delay: 0s;
        -webkit-transform: rotate(0deg);
        -ms-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    
    .spinner .spinner-blade:nth-child(2) {
        -webkit-animation-delay: 0.083s;
        animation-delay: 0.083s;
        -webkit-transform: rotate(30deg);
        -ms-transform: rotate(30deg);
        transform: rotate(30deg);
    }
    
    .spinner .spinner-blade:nth-child(3) {
        -webkit-animation-delay: 0.166s;
        animation-delay: 0.166s;
        -webkit-transform: rotate(60deg);
        -ms-transform: rotate(60deg);
        transform: rotate(60deg);
    }
    
    .spinner .spinner-blade:nth-child(4) {
        -webkit-animation-delay: 0.249s;
        animation-delay: 0.249s;
        -webkit-transform: rotate(90deg);
        -ms-transform: rotate(90deg);
        transform: rotate(90deg);
    }
    
    .spinner .spinner-blade:nth-child(5) {
        -webkit-animation-delay: 0.332s;
        animation-delay: 0.332s;
        -webkit-transform: rotate(120deg);
        -ms-transform: rotate(120deg);
        transform: rotate(120deg);
    }
    
    .spinner .spinner-blade:nth-child(6) {
        -webkit-animation-delay: 0.415s;
        animation-delay: 0.415s;
        -webkit-transform: rotate(150deg);
        -ms-transform: rotate(150deg);
        transform: rotate(150deg);
    }
    
    .spinner .spinner-blade:nth-child(7) {
        -webkit-animation-delay: 0.498s;
        animation-delay: 0.498s;
        -webkit-transform: rotate(180deg);
        -ms-transform: rotate(180deg);
        transform: rotate(180deg);
    }
    
    .spinner .spinner-blade:nth-child(8) {
        -webkit-animation-delay: 0.581s;
        animation-delay: 0.581s;
        -webkit-transform: rotate(210deg);
        -ms-transform: rotate(210deg);
        transform: rotate(210deg);
    }
    
    .spinner .spinner-blade:nth-child(9) {
        -webkit-animation-delay: 0.664s;
        animation-delay: 0.664s;
        -webkit-transform: rotate(240deg);
        -ms-transform: rotate(240deg);
        transform: rotate(240deg);
    }
    
    .spinner .spinner-blade:nth-child(10) {
        -webkit-animation-delay: 0.747s;
        animation-delay: 0.747s;
        -webkit-transform: rotate(270deg);
        -ms-transform: rotate(270deg);
        transform: rotate(270deg);
    }
    
    .spinner .spinner-blade:nth-child(11) {
        -webkit-animation-delay: 0.83s;
        animation-delay: 0.83s;
        -webkit-transform: rotate(300deg);
        -ms-transform: rotate(300deg);
        transform: rotate(300deg);
    }
    
    .spinner .spinner-blade:nth-child(12) {
        -webkit-animation-delay: 0.913s;
        animation-delay: 0.913s;
        -webkit-transform: rotate(330deg);
        -ms-transform: rotate(330deg);
        transform: rotate(330deg);
    }
    
    @keyframes spinner-fade9234 {
        0% {
            background-color:rgb(120, 120, 120);
        }
        
        100% {
            background-color: transparent;
        }
    }
`;
document.head.appendChild(style);
