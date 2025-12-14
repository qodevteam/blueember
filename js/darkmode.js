document.addEventListener('DOMContentLoaded', () => {
    // 1. Create and inject the toggle button if it doesn't exist
    if (!document.getElementById('dark-mode-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'dark-mode-toggle';
        toggleBtn.ariaLabel = 'Toggle Dark Mode';
        toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>'; updateIcon();

        // Append toggle button to specific container if it exists, otherwise body
        const navbarContainer = document.getElementById('dark-mode-li');
        if (navbarContainer) {
            navbarContainer.appendChild(toggleBtn);
            toggleBtn.classList.add('navbar-toggle'); // Add class for specific styling
        } else {
            document.body.appendChild(toggleBtn);
        }

        // Event listener for toggle
        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');

            // Save preference
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }

            updateIcon();
        });
    }

    // 3. Check LocalStorage for preference
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        enableDarkMode();
    }
});

function toggleDarkMode() {
    const body = document.body;
    if (body.classList.contains('dark-mode')) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
}

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
    updateIcon(true);
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    updateIcon(false);
}

function updateIcon(isDark) {
    const btn = document.getElementById('dark-mode-toggle');
    if (btn) {
        if (isDark) {
            btn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            btn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    }
}
