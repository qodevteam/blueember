/**
 * Cart Manager Module
 * Handles all cart-related functionality including add, remove, update operations
 */
class CartManager {
  static STORAGE_KEY = 'evoraCart';

  constructor() {
    this.cart = this.loadCart();
    this.elements = this.cacheDOM();
    this.bindEvents();
    this.updateCartDisplay();
  }

  cacheDOM() {
    return {
      cartCounters: document.querySelectorAll('nav .cart-count'),
      cartIcons: document.querySelectorAll('nav .cart-link'),
      mobileCartLink: document.getElementById('mobile-cart-link'),
      mobileCartCount: document.getElementById('mobile-cart-count'),
      cartPopup: document.getElementById('cart-popup'),
      cartOverlay: document.getElementById('cart-overlay'),
      cartClose: document.getElementById('cart-close'),
      cartItemsContainer: document.getElementById('cart-items-container'),
      cartTotal: document.getElementById('cart-total'),
      cartItemCount: document.getElementById('cart-item-count'),
      checkoutBtn: document.getElementById('checkout-btn'),
      continueBtn: document.getElementById('continue-btn'),
      hamburger: document.getElementById('hamburger'),
      mobileMenu: document.getElementById('mobileMenu'),
      closeBtn: document.getElementById('closeBtn'),
    };
  }

  bindEvents() {
    // Add to cart - using event delegation for dynamically added elements
    document.addEventListener('click', (e) => {
      if (e.target.closest('.add-to-cart-btn')) {
        const button = e.target.closest('.add-to-cart-btn');
        this.addToCart(button);
        e.preventDefault();
      }
    });

    // Cart popup controls
    this.elements.cartIcons.forEach(icon => {
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showCartPopup();
      });
    });

    this.elements.mobileCartLink?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showCartPopup();
      this.elements.mobileMenu?.classList.remove('open');
      document.body.style.overflow = '';
    });

    this.elements.cartClose?.addEventListener('click', () => this.hideCartPopup());
    this.elements.cartOverlay?.addEventListener('click', () => this.hideCartPopup());
    this.elements.continueBtn?.addEventListener('click', () => this.hideCartPopup());

    // Checkout
    this.elements.checkoutBtn?.addEventListener('click', () => {
      if (this.cart.length === 0) {
        alert('Your cart is empty. Please add some items before checking out.');
        return;
      }
      window.location.href = 'checkout.html';
    });

    // Mobile menu
    if (this.elements.hamburger && this.elements.mobileMenu && this.elements.closeBtn) {
      this.elements.hamburger.addEventListener('click', () =>
        this.toggleMobileMenu(true)
      );

      this.elements.closeBtn.addEventListener('click', () =>
        this.toggleMobileMenu(false)
      );

      this.elements.mobileMenu.addEventListener('click', (e) => {
        if (e.target === this.elements.mobileMenu) {
          this.toggleMobileMenu(false);
        }
      });

      document.querySelectorAll('.mobile-dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
          e.preventDefault();
          const dropdown = toggle.nextElementSibling;
          const icon = toggle.querySelector('.toggle-icon');
          const isExpanded = dropdown.style.display === 'block';
          dropdown.style.display = isExpanded ? 'none' : 'block';
          icon.textContent = isExpanded ? '+' : '-';
        });
      });
    }

    // Keyboard & UX
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.elements.cartPopup?.classList.contains('active')) {
        this.hideCartPopup();
      }
    });

    document.addEventListener('wheel', (e) => {
      if (document.activeElement?.type === 'number') {
        document.activeElement.blur();
      }
    });

    // Delegate cart item interactions
    this.elements.cartItemsContainer.addEventListener('click', (e) => {
      const index = this.getCartItemIndex(e.target);
      if (index === null) return;

      if (e.target.closest('.cart-remove')) {
        this.removeFromCart(index);
      } else if (e.target.closest('.decrease')) {
        this.decreaseQuantity(index);
      } else if (e.target.closest('.increase')) {
        this.increaseQuantity(index);
      }
    });

    this.elements.cartItemsContainer.addEventListener('change', (e) => {
      const input = e.target.closest('.quantity-input');
      if (!input) return;

      const index = this.getCartItemIndex(input);
      if (index !== null) {
        const val = parseInt(input.value, 10);
        if (!isNaN(val) && val >= 1) {
          this.updateQuantity(index, val);
        } else {
          input.value = this.cart[index].quantity; // reset invalid input
        }
      }
    });
  }

  loadCart() {
    try {
      const saved = localStorage.getItem(CartManager.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Failed to parse cart from localStorage. Starting fresh.', error);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(CartManager.STORAGE_KEY, JSON.stringify(this.cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }

  getTotalItems() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotalPrice() {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  updateCartDisplay() {
    const totalItems = this.getTotalItems();

    // Update counters
    this.elements.cartCounters.forEach(counter => this.setTextContent(counter, totalItems));
    this.setTextContent(this.elements.mobileCartCount, totalItems);
    this.setTextContent(this.elements.cartItemCount, `(${totalItems})`);

    // Animation
    this.elements.cartCounters.forEach(counter => this.animateCounter(counter));

    // Render items & total
    this.renderCartItems();
    this.updateCartTotal();

    // Toggle checkout
    if (this.elements.checkoutBtn) {
      this.elements.checkoutBtn.disabled = totalItems === 0;
    }
  }

  setTextContent(el, text) {
    if (el) el.textContent = String(text);
  }

  animateCounter(el) {
    if (!el) return;
    el.classList.add('update-animation');
    setTimeout(() => el.classList.remove('update-animation'), 300);
  }

  updateCartTotal() {
    if (this.elements.cartTotal) {
      this.elements.cartTotal.innerHTML = `<span class="dollar-sign" style="font-family: 'Space Grotesk', sans-serif;">$</span>${this.getTotalPrice().toFixed(2)}`;
    }
  }

  renderCartItems() {
    if (this.cart.length === 0) {
      this.elements.cartItemsContainer.innerHTML = `
        <div class="cart-empty">
          <i class="fa-regular fa-face-sad-cry empty-cart-icon"></i>
          <h4>Your cart is empty</h4>
          <p>Add some products to see them here</p>
        </div>
      `;
      return;
    }

    const itemsHTML = this.cart
      .map((item, index) => {
        const imageUrl = item.image || 'https://via.placeholder.com/60x60?text=Product';
        return `
          <div class="cart-item cart-animation" data-cart-index="${index}">
            <img src="${this.escapeHtml(imageUrl)}" class="cart-item-img" alt="${this.escapeHtml(item.name)}">
            <div class="cart-item-details">
              <div class="cart-item-name">${this.escapeHtml(item.name)}</div>
              <div class="cart-item-price"><span class="dollar-sign" style="font-family: 'Space Grotesk', sans-serif;">$</span>${item.price.toFixed(2)}</div>
              <div class="cart-item-quantity">
                <button class="quantity-btn decrease" aria-label="Decrease quantity">
                  <i class="fas fa-minus"></i>
                </button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                <button class="quantity-btn increase" aria-label="Increase quantity">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
            <button class="cart-remove" aria-label="Remove item">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `;
      })
      .join('');

    this.elements.cartItemsContainer.innerHTML = itemsHTML;
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  getCartItemIndex(element) {
    const item = element.closest('[data-cart-index]');
    return item ? parseInt(item.dataset.cartIndex, 10) : null;
  }

  createToast(productName) {
    // Ensure toast container exists
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-2';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 12px 16px;
      transition: all 0.3s ease;
      z-index: 999999999;
    `;
    
    toast.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; flex: 1;">
          <div style="background: #04d85cff; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
            <i class="fa-solid fa-check" style="font-size: 18px;"></i>
          </div>
          <div>
            <div style="font-weight: 900; margin-bottom: 2px;">Added to Cart <span class="toast-cart-btn" style="background: none; border: none; color: #007bff; cursor: pointer; font-size: 14px; padding: 0; text-decoration: underline; position: relative; bottom: 1px; left:35px;">
            Go to Cart ->
          </span></div>
            <div style="font-size: 14px; color: #666;">${this.escapeHtml(productName)} added to your cart</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          
          <button class="toast-close" style="background: none; border: none; cursor: pointer; color: #999; font-size: 18px; position: relative; z-index: 10002;">
            &times;
          </button>
        </div>
      </div>
    `;

    // Add to container
    toastContainer.appendChild(toast);

    // Auto-remove after 3 seconds, with hover pause
    let timeoutId;
    const removeToast = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, 300);
    };

    const startTimeout = () => {
      timeoutId = setTimeout(removeToast, 3000);
    };

    startTimeout();

    toast.addEventListener('mouseenter', () => {
      clearTimeout(timeoutId);
    });

    toast.addEventListener('mouseleave', () => {
      startTimeout();
    });
    
    // Close button handler
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, 300);
    });

    // Go to cart button handler
    toast.querySelector('.toast-cart-btn').addEventListener('click', () => {
      this.showCartPopup();
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, 300);
    });
  }

  addToCart(button) {
    try {
      const productId = button.dataset.productId;
      const productName = button.dataset.productName;
      const productPrice = parseFloat(button.dataset.productPrice);
      const productImage = button.dataset.productImage || '';

      if (!productId || isNaN(productPrice)) {
        throw new Error('Invalid product data on button');
      }

      // Find if product already exists in cart
      const existingIndex = this.cart.findIndex(item => item.id === productId);
      
      if (existingIndex !== -1) {
        // If product exists, just increase quantity
        this.cart[existingIndex].quantity += 1;
      } else {
        // Otherwise add new product to cart
        this.cart.push({
          id: productId,
          name: productName,
          price: productPrice,
          image: productImage,
          quantity: 1,
        });
      }

      this.saveCart();
      this.updateCartDisplay();
      this.animateCartIcon();
      this.animateAddButton(button);
      
      // Show success toast notification
      this.createToast(productName);
      
    } catch (error) {
      console.error('Error adding item to cart:', error);
      alert('Sorry, there was an error adding this item to your cart. Please try again.');
    }
  }

  animateCartIcon() {
    this.elements.cartIcons.forEach(icon => {
      icon.classList.add('cart-icon-pulse');
      setTimeout(() => {
        icon.classList.remove('cart-icon-pulse');
      }, 500);
    });
  }

  animateAddButton(button) {
    const originalHTML = button.innerHTML;
    const originalClass = button.className;
    
    // Store button data attributes temporarily
    const buttonData = {};
    for (let attr of button.attributes) {
      if (attr.name.startsWith('data-')) {
        buttonData[attr.name] = attr.value;
      }
    }

    button.innerHTML = '<i class="fa-solid fa-check me-1"></i> Added!';
    button.classList.add('added');
    button.disabled = true;

    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.classList.remove('added');
      button.disabled = false;
      
      // Restore data attributes (in case they were lost)
      Object.entries(buttonData).forEach(([name, value]) => {
        button.setAttribute(name, value);
      });
    }, 1500);
  }

  removeFromCart(index) {
    try {
      const itemElement = this.elements.cartItemsContainer.querySelector(
        `[data-cart-index="${index}"]`
      );

      if (itemElement) {
        itemElement.classList.add('item-removed');
        setTimeout(() => {
          this.cart.splice(index, 1);
          this.saveCart();
          this.updateCartDisplay();
        }, 300);
      } else {
        this.cart.splice(index, 1);
        this.saveCart();
        this.updateCartDisplay();
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  }

  updateQuantity(index, newQuantity) {
    try {
      if (newQuantity < 1) newQuantity = 1;
      this.cart[index].quantity = newQuantity;
      this.saveCart();
      this.updateCartDisplay();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }

  decreaseQuantity(index) {
    try {
      if (this.cart[index].quantity > 1) {
        this.cart[index].quantity -= 1;
        this.saveCart();
        this.updateCartDisplay();
      } else {
        this.removeFromCart(index);
      }
    } catch (error) {
      console.error('Error decreasing quantity:', error);
    }
  }

  increaseQuantity(index) {
    try {
      this.cart[index].quantity += 1;
      this.saveCart();
      this.updateCartDisplay();
    } catch (error) {
      console.error('Error increasing quantity:', error);
    }
  }

  showCartPopup() {
    if (!this.elements.cartPopup) return;
    
    this.elements.cartPopup.classList.add('active');
    this.elements.cartOverlay?.classList.add('active');
    this.elements.cartPopup.style.display = 'block';
    this.elements.cartOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    this.updateCartDisplay(); // ensure freshness
  }

  hideCartPopup() {
    if (!this.elements.cartPopup) return;
    
    this.elements.cartPopup.classList.remove('active');
    this.elements.cartOverlay?.classList.remove('active');
    this.elements.cartPopup.style.display = 'none';
    this.elements.cartOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  toggleMobileMenu(open) {
    if (!this.elements.mobileMenu) return;
    this.elements.mobileMenu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
}

// CartManager initialization is handled by app.js

/* Search Bar Logic appended by Assistant */
document.addEventListener("DOMContentLoaded", function() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');

    // Only run if the search bar exists on this page
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function(e) {
            // Prevent submission if input is empty
            if (!searchInput.value.trim()) {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }
});

