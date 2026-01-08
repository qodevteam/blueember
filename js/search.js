// search.js - Handles all search functionality
document.addEventListener('DOMContentLoaded', () => {
  // Initialize search functionality
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('q') || '';

  // Set search input value if exists
  const searchInput = document.querySelector('.search-bar-container input');
  if (searchInput && searchTerm) {
    searchInput.value = searchTerm;
  }

  // Initialize UI components
  initBrandFilters();
  initPriceRange();
  initSortHandlers();
  initFilterHandlers();

  // Perform search (defaults to all products if searchTerm is empty)
  performSearch(searchTerm);

  // Handle form submission
  const searchForm = document.querySelector('.search-bar-container form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
      }
    });
  }

  // Process search when page loads with query parameter
  function performSearch(query) {
    // Get all filters and sorting preferences
    const selectedBrands = getSelectedBrands();
    const priceRange = getPriceRange();
    const sortBy = getSortPreference();

    // Filter and sort products
    let results = filterProducts(query, selectedBrands, priceRange);
    results = sortProducts(results, sortBy);

    // Render results
    renderResults(results, query);
  }

  // Initialize brand checkboxes from product data
  function initBrandFilters() {
    const brandFiltersContainer = document.getElementById('brand-filters');
    if (!brandFiltersContainer) return;

    // Extract unique brands from products
    const brands = [...new Set(products.map(product => product.brand))];
    brands.sort();

    // Create checkboxes for each brand
    brands.forEach(brand => {
      const brandDiv = document.createElement('div');
      brandDiv.className = 'form-check brand-checkbox';

      brandDiv.innerHTML = `
        <input class="form-check-input brand-filter" type="checkbox" value="${brand}" id="brand-${brand.replace(/\s+/g, '-')}" checked>
        <label class="form-check-label" for="brand-${brand.replace(/\s+/g, '-')}">
          ${brand} (${products.filter(p => p.brand === brand).length})
        </label>
      `;

      brandFiltersContainer.appendChild(brandDiv);
    });

    // Add event listeners to all brand checkboxes
    document.querySelectorAll('.brand-filter').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const searchTerm = getUrlParameter('q') || '';
        if (searchTerm) {
          performSearch(searchTerm);
        }
      });
    });
  }

  // Initialize price range sliders
  function initPriceRange() {
    const minSlider = document.getElementById('min-price');
    const maxSlider = document.getElementById('max-price');
    const minVal = document.getElementById('min-price-value');
    const maxVal = document.getElementById('max-price-value');

    if (!minSlider || !maxSlider || !minVal || !maxVal) return;

    // Set initial values based on product prices
    const prices = products.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Set slider attributes
    minSlider.min = Math.floor(minPrice / 100) * 100;
    minSlider.max = Math.ceil(maxPrice / 100) * 100;
    maxSlider.min = minSlider.min;
    maxSlider.max = minSlider.max;

    // Add event listeners
    minSlider.addEventListener('input', () => {
      if (parseInt(minSlider.value) > parseInt(maxSlider.value)) {
        maxSlider.value = minSlider.value;
      }
      updatePriceDisplay();
      applyFilters();
    });

    maxSlider.addEventListener('input', () => {
      if (parseInt(maxSlider.value) < parseInt(minSlider.value)) {
        minSlider.value = maxSlider.value;
      }
      updatePriceDisplay();
      applyFilters();
    });

    function updatePriceDisplay() {
      minVal.textContent = `$${parseInt(minSlider.value).toLocaleString()}`;
      maxVal.textContent = `$${parseInt(maxSlider.value).toLocaleString()}`;
    }

    function applyFilters() {
      const searchTerm = getUrlParameter('q') || '';
      if (searchTerm) {
        performSearch(searchTerm);
      }
    }
  }

  // Initialize sorting handlers
  function initSortHandlers() {
    const desktopSort = document.getElementById('sort-select');
    const mobileSort = document.getElementById('mobile-sort-select');

    if (desktopSort) {
      desktopSort.addEventListener('change', () => {
        const searchTerm = getUrlParameter('q') || '';
        if (searchTerm) {
          performSearch(searchTerm);
        }
      });
    }

    if (mobileSort) {
      mobileSort.addEventListener('change', () => {
        const searchTerm = getUrlParameter('q') || '';
        if (searchTerm) {
          // Sync with desktop sort
          if (desktopSort) desktopSort.value = mobileSort.value;
          performSearch(searchTerm);
        }
      });
    }
  }

  // Initialize filter handlers
  function initFilterHandlers() {
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
  }

  // Get selected brands from checkboxes
  function getSelectedBrands() {
    const selectedCheckboxes = document.querySelectorAll('.brand-filter:checked');
    return Array.from(selectedCheckboxes).map(cb => cb.value);
  }

  // Get price range from sliders
  function getPriceRange() {
    const minSlider = document.getElementById('min-price');
    const maxSlider = document.getElementById('max-price');

    return {
      min: minSlider ? parseInt(minSlider.value) : 0,
      max: maxSlider ? parseInt(maxSlider.value) : Infinity
    };
  }

  // Get sort preference
  function getSortPreference() {
    const desktopSort = document.getElementById('sort-select');
    const mobileSort = document.getElementById('mobile-sort-select');

    return desktopSort?.value || mobileSort?.value || 'relevance';
  }

  // Filter products based on search query, brands, and price range
  function filterProducts(query, selectedBrands, priceRange) {
    return products.filter(product => {
      // Check if product matches search query
      const matchesQuery = matchesSearchQuery(product, query);

      // Check if product is from selected brand
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);

      // Check if product is within price range
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;

      return matchesQuery && matchesBrand && matchesPrice;
    });
  }

  // Check if product matches search query (fuzzy matching)
  function matchesSearchQuery(product, query) {
    if (!query) return true;

    const normalizedQuery = query.toLowerCase();

    // Check in name
    if (product.name.toLowerCase().includes(normalizedQuery)) return true;

    // Check in description
    if (product.description.toLowerCase().includes(normalizedQuery)) return true;

    // Check in brand
    if (product.brand.toLowerCase().includes(normalizedQuery)) return true;

    // Fuzzy matching: check if all characters in query appear in order in name
    const nameChars = product.name.toLowerCase().replace(/\s+/g, '');
    const queryChars = normalizedQuery.replace(/\s+/g, '');

    let nameIndex = 0;
    let queryIndex = 0;

    while (nameIndex < nameChars.length && queryIndex < queryChars.length) {
      if (nameChars[nameIndex] === queryChars[queryIndex]) {
        queryIndex++;
      }
      nameIndex++;
    }

    return queryIndex === queryChars.length;
  }

  // Sort products based on criteria
  function sortProducts(products, sortBy) {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'brand-asc':
          return a.brand.localeCompare(b.brand);
        case 'brand-desc':
          return b.brand.localeCompare(a.brand);
        case 'relevance':
        default:
          return 0; // Default sort (will be handled by search relevance)
      }
    });
  }

  // Render search results
  function renderResults(results, query) {
    const resultsContainer = document.getElementById('results-container');
    const resultsInfo = document.getElementById('results-info');
    const noResultsDiv = document.getElementById('no-results');

    if (!resultsContainer || !resultsInfo || !noResultsDiv) return;

    // Update results count
    resultsInfo.textContent = `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`;

    // Clear previous results
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
      noResultsDiv.style.display = 'block';
      return;
    }

    // Hide no-results div
    noResultsDiv.style.display = 'none';

    // Create product cards
    results.forEach(product => {
      const productCard = createProductCard(product, query);
      resultsContainer.appendChild(productCard);
    });
  }

  // Create a single product card element
  function createProductCard(product, query) {
    const card = document.createElement('div');
    card.className = 'product-card';

    // Highlight search terms in name and description
    const highlightedName = highlightSearchTerms(product.name, query);
    const highlightedDesc = highlightSearchTerms(product.description, query);

    card.innerHTML = `
      <a href="${product.link}" class="text-decoration-none text-dark">
        <div class="product-img-container">
          <img src="${product.image}" alt="${product.name}" class="product-img">
        </div>
        <div class="heart-container" title="Wishlist" 
             data-product-id="${product.id}" 
             data-product-name="${product.name}" 
             data-product-price="${product.price}" 
             data-product-image="${product.image}">
          <input type="checkbox" class="checkbox">
          <div class="svg-container">
            <svg viewBox="0 0 24 24" class="svg-outline" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z"></path>
            </svg>
            <svg viewBox="0 0 24 24" class="svg-filled" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z"></path>
            </svg>
            <svg class="svg-celebrate" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
              <polygon points="10,10 20,20"></polygon>
              <polygon points="10,50 20,50"></polygon>
              <polygon points="20,80 30,70"></polygon>
              <polygon points="90,10 80,20"></polygon>
              <polygon points="90,50 80,50"></polygon>
              <polygon points="80,80 70,70"></polygon>
            </svg>
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-title">${highlightedName}</h3>
          <p class="product-desc">${highlightedDesc}</p>
          <div class="product-price">$${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <button class="add-to-cart add-to-cart-btn" data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${product.price}" data-product-image="${product.image}">
            Add to Cart
          </button>
        </div>
      </a>
      </div>
    `;

    return card;
  }

  // Highlight search terms in text
  function highlightSearchTerms(text, query) {
    if (!query) return text;

    const normalizedQuery = query.toLowerCase();
    const normalizedText = text.toLowerCase();

    // Find indices of query in text
    const indices = [];
    let startIndex = 0;

    while (startIndex < normalizedText.length) {
      const index = normalizedText.indexOf(normalizedQuery, startIndex);
      if (index === -1) break;

      indices.push({
        start: index,
        end: index + normalizedQuery.length
      });

      startIndex = index + normalizedQuery.length;
    }

    // If no matches, return original text
    if (indices.length === 0) return text;

    // Build highlighted text
    let highlightedText = '';
    let lastIndex = 0;

    indices.forEach(match => {
      // Add text before match
      highlightedText += text.substring(lastIndex, match.start);

      // Add highlighted match
      highlightedText += `<span class="highlight">${text.substring(match.start, match.end)}</span>`;

      // Update last index
      lastIndex = match.end;
    });

    // Add remaining text
    highlightedText += text.substring(lastIndex);

    return highlightedText;
  }


  // Clear all filters
  function clearAllFilters() {
    // Reset brand checkboxes
    document.querySelectorAll('.brand-filter').forEach(checkbox => {
      checkbox.checked = true;
    });

    // Reset price sliders
    const minSlider = document.getElementById('min-price');
    const maxSlider = document.getElementById('max-price');

    if (minSlider && maxSlider) {
      minSlider.value = minSlider.min;
      maxSlider.value = maxSlider.max;

      document.getElementById('min-price-value').textContent = `$${parseInt(minSlider.min).toLocaleString()}`;
      document.getElementById('max-price-value').textContent = `$${parseInt(maxSlider.max).toLocaleString()}`;
    }

    // Reset sort dropdowns
    const desktopSort = document.getElementById('sort-select');
    const mobileSort = document.getElementById('mobile-sort-select');

    if (desktopSort) desktopSort.value = 'relevance';
    if (mobileSort) mobileSort.value = 'relevance';

    // Reapply search
    const searchTerm = getUrlParameter('q') || '';
    if (searchTerm) {
      performSearch(searchTerm);
    }
  }

  // Get URL parameter
  function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }


  /* Search Bar Logic appended by Assistant */
  document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');

    // Only run if the search bar exists on this page
    if (searchForm && searchInput) {
      searchForm.addEventListener('submit', function (e) {
        // Prevent submission if input is empty
        if (!searchInput.value.trim()) {
          e.preventDefault();
          searchInput.focus();
        }
      });
    }
  });
});


