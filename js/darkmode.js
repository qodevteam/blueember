document.addEventListener('DOMContentLoaded', () => {
    // 1. Desktop Toggle: Create and inject if not exists (Legacy Support)
    let desktopBtn = document.getElementById('dark-mode-toggle');
    if (!desktopBtn) {
        desktopBtn = document.createElement('button');
        desktopBtn.id = 'dark-mode-toggle';
        desktopBtn.ariaLabel = 'Toggle Dark Mode';

        // Use existing classes plus new generic one
        desktopBtn.className = 'navbar-toggle theme-toggle-btn';

        // Initial icon placeholder
        desktopBtn.innerHTML = '<i class="bx bx-moon-star"></i> ';

        const navbarContainer = document.getElementById('dark-mode-li');
        if (navbarContainer) {
            navbarContainer.appendChild(desktopBtn);
        } else {
            document.body.appendChild(desktopBtn);
        }
    } else {
        // Enforce class if it was manually added but missing class
        desktopBtn.classList.add('theme-toggle-btn');
    }

    // 2. Attach Event Listeners to ALL theme toggles (desktop + mobile)
    const allToggles = document.querySelectorAll('#dark-mode-toggle, #mobile-theme-toggle, .theme-toggle-btn');

    allToggles.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleDarkModeLogic();
        });
    });

    // 3. Initialize State based on LocalStorage
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        enableDarkMode();
    } else {
        // Ensure UI is synced for light mode
        updateIcons(false);
    }
});

function toggleDarkModeLogic() {
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
    updateIcons(true);
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    updateIcons(false);
}

function updateIcons(isDark) {
    const allToggles = document.querySelectorAll('#dark-mode-toggle, #mobile-theme-toggle, .theme-toggle-btn');
    allToggles.forEach(btn => {
        if (isDark) {
            btn.innerHTML = '<i class="bx bx-sun-dim"></i>';
        } else {
            btn.innerHTML = '<i class="bx bx-moon-star"></i>';
        }
    });
}
