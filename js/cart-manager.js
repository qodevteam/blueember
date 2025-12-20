/**
 * CartManager - Handles all cart operations
 */
class CartManager {
  constructor() {
    this.cart = [];
    this.init();
  }

  init() {
    this.loadCart();
    this.bindEvents();
    this.updateCartDisplay();
  }

  loadCart() {
    try {
      const saved = localStorage.getItem('evoraCart');
      this.cart = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Failed to load cart:', error);
      this.cart = [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem('evoraCart', JSON.stringify(this.cart));
    } catch (error) {
      console.warn('Failed to save cart:', error);
    }
  }

  bindEvents() {
    // Bind add to cart buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
        e.preventDefault();
        const button = e.target.classList.contains('add-to-cart-btn') ? e.target : e.target.closest('.add-to-cart-btn');
        this.addToCart(button);
      }
    });

    // Bind cart popup events
    this.bindCartPopupEvents();
  }

  addToCart(button) {
    const productId = button.getAttribute('data-product-id');
    const productName = button.getAttribute('data-product-name');
    const productPrice = parseFloat(button.getAttribute('data-product-price'));
    const productImage = button.getAttribute('data-product-image');

    if (!productId || !productName || isNaN(productPrice)) {
      console.error('Invalid product data for add to cart');
      return;
    }

    // Check if item already exists in cart
    const existingItem = this.cart.find(item => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
        quantity: 1
      });
    }

    this.saveCart();
    this.updateCartDisplay();
    this.showCartNotification(productName);

    // Close modal if it's open
    this.closeProductModal();
  }

  updateCartDisplay() {
    // Update cart count
    const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
    const cartCounters = document.querySelectorAll('.cart-count');

    cartCounters.forEach(counter => {
      if (counter) {
        counter.textContent = totalItems;
      }
    });

    // Update cart popup content
    this.updateCartPopup();
  }

  updateCartPopup() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotal = document.getElementById('cart-total');
    const cartItemCount = document.getElementById('cart-item-count');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!cartItemsContainer || !cartTotal || !cartItemCount) return;

    if (this.cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="text-center py-3">Your cart is empty</p>';
      cartTotal.textContent = '$0.00';
      cartItemCount.textContent = '(0)';
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    let total = 0;
    let itemCount = 0;

    cartItemsContainer.innerHTML = this.cart.map(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      itemCount += item.quantity;

      return `
        <div class="cart-item" data-product-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-details">
            <h4 class="cart-item-name">${item.name}</h4>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            <div class="cart-item-quantity">
              <button class="quantity-btn minus" data-product-id="${item.id}">-</button>
              <span class="quantity">${item.quantity}</span>
              <button class="quantity-btn plus" data-product-id="${item.id}">+</button>
            </div>
          </div>
          <button class="cart-item-remove" data-product-id="${item.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
    }).join('');

    cartTotal.textContent = `$${total.toFixed(2)}`;
    cartItemCount.textContent = `(${itemCount})`;
    if (checkoutBtn) checkoutBtn.disabled = false;

    // Bind quantity and remove buttons
    this.bindCartItemEvents();
  }

  bindCartItemEvents() {
    // Quantity buttons
    document.querySelectorAll('.quantity-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-product-id');
        const isPlus = e.target.classList.contains('plus');

        this.updateQuantity(productId, isPlus ? 1 : -1);
      });
    });

    // Remove buttons
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.closest('.cart-item-remove').getAttribute('data-product-id');
        this.removeFromCart(productId);
      });
    });
  }

  updateQuantity(productId, change) {
    const item = this.cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
      this.removeFromCart(productId);
    } else {
      this.saveCart();
      this.updateCartDisplay();
    }
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartDisplay();
  }

  bindCartPopupEvents() {
    // Watch for cart popup becoming active
    const cartPopup = document.getElementById('cart-popup');
    if (cartPopup) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (cartPopup.classList.contains('active')) {
              // Cart popup is now active, update the display
              setTimeout(() => this.updateCartDisplay(), 50);
            }
          }
        });
      });
      observer.observe(cartPopup, { attributes: true });
    }

    // Also bind to cart links as fallback
    const cartLinks = document.querySelectorAll('.cart-link, #mobile-cart-link');
    cartLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Let cart.js handle the popup, we'll update via the observer
      });
    });
  }

  showCartNotification(productName) {
    // Simple notification
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
      <div class="cart-notification-content">
        <i class="fas fa-check-circle"></i>
        <span>${productName} added to cart!</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Add styles if not present
    if (!document.getElementById('cart-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'cart-notification-styles';
      style.textContent = `
        .cart-notification {
          position: fixed;
          top: 100px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          animation: slideInRight 0.3s ease;
        }
        .cart-notification-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }

  closeProductModal() {
    const modal = document.getElementById('productModal');
    const modalOverlay = document.getElementById('modalOverlay');

    if (modal && modalOverlay) {
      modalOverlay.classList.remove('show');
      modal.classList.remove('show');
      modal.style.display = 'none';
      modalOverlay.style.display = 'none';
    }
  }

  getCart() {
    return this.cart;
  }

  getTotalItems() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartDisplay();
  }
}

// Make CartManager globally available
window.CartManager = CartManager;