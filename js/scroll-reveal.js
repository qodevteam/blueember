((w, d) => {
    'use strict';

    /**
     * ScrollReveal Manager
     * Handles viewport reveal animations using IntersectionObserver.
     */
    const SELECTORS = 'section, h2, .card, .product-card, .brand-card, .category-card, .form-card, .info-card, .product-item, .product';

    const ScrollReveal = {
        init() {
            this.createObserver();
            this.observeExistingElements();
            this.setupMutationObserver();
        },

        createObserver() {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    } else {
                        // Remove class when scrolling away to allow re-animation from both directions
                        entry.target.classList.remove('active');
                    }
                });
            }, {
                // Trigger when 10% of the element is visible
                threshold: 0.1,
                // Negative rootMargin at top and bottom creates a padding where reveal happens
                rootMargin: '-10px 0px -10px 0px'
            });
        },

        observeExistingElements() {
            // Auto-target major semantic elements to reduce manual work
            const targets = d.querySelectorAll(SELECTORS);
            targets.forEach(el => this.prepareAndObserve(el));

            // Also search for existing elements explicitly marked with .reveal
            const manualTargets = d.querySelectorAll('.reveal');
            manualTargets.forEach(el => {
                if (!el.classList.contains('reveal-up') && !el.classList.contains('reveal-down') && !el.classList.contains('reveal-scale')) {
                    el.classList.add('reveal-up');
                }
                this.observer.observe(el);
            });
        },

        prepareAndObserve(el) {
            if (el.dataset.revealSkip) return;

            // Only add reveal classes if not manually handled
            if (!el.classList.contains('reveal')) {
                el.classList.add('reveal', 'reveal-up');
            }

            this.observer.observe(el);
        },

        setupMutationObserver() {
            const mutationObserver = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check if node itself matches
                            if (node.matches(SELECTORS) || node.classList.contains('reveal')) {
                                this.prepareAndObserve(node);
                            }
                            // Check children (especially for injected results container)
                            const children = node.querySelectorAll(SELECTORS + ', .reveal');
                            children.forEach(child => this.prepareAndObserve(child));
                        }
                    });
                });
            });

            mutationObserver.observe(d.body, {
                childList: true,
                subtree: true
            });
        }
    };

    // Initialize when DOM is ready
    if (d.readyState === 'loading') {
        d.addEventListener('DOMContentLoaded', () => ScrollReveal.init());
    } else {
        ScrollReveal.init();
    }

})(window, document);
