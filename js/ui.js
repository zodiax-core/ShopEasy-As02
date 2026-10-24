$(document).ready(function () {
  const statusMessage = $('#status-message');
  const productGrid = $('#product-grid');
  const themeToggle = $('#theme-toggle');

  function setTheme(mode) {
    const isDark = mode === 'dark';
    $('body').toggleClass('dark-theme', isDark);
    localStorage.setItem('shopEasyTheme', mode);
    const label = isDark ? 'Dark' : 'Light';
    $('.theme-label').text(label);
  }

  function updateCartCounter() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    $('.cart-badge').text(count);
  }

  function renderFeaturedProducts() {
    const featured = products.slice(0, 4);
    const featuredMarkup = featured.map((product) => `
      <article class="featured-card">
        <img src="${product.image}" alt="${product.name}" />
        <div class="featured-info">
          <span class="product-category">${product.category}</span>
          <h3>${product.name}</h3>
          <div class="product-meta">
            <span>⭐ ${product.rating}</span>
            <strong>$${product.price}</strong>
          </div>
        </div>
      </article>
    `).join('');
    $('#featured-products').html(featuredMarkup);
  }

  function renderProductList() {
    let list = [...products];
    const searchText = $('#product-search').val().trim();
    const selectedCategory = $('#category-filter').val();
    const selectedSort = $('#sort-products').val();

    list = searchProducts(list, searchText);
    list = filterByCategory(list, selectedCategory);
    list = sortProducts(list, selectedSort);

    if (list.length === 0) {
      statusMessage.text('No products match your search.').show();
      productGrid.empty();
      return;
    }

    statusMessage.hide();
    const markup = list.map((product) => `
      <article class="product-card">
        <img src="${product.image}" alt="${product.name}" />
        <div class="product-info">
          <span class="product-category">${product.category}</span>
          <h3>${product.name}</h3>
          <div class="product-meta">
            <span>⭐ ${product.rating}</span>
            <span>${product.inStock ? 'In stock' : 'Out of stock'}</span>
          </div>
          <div class="product-row">
            <strong>$${product.price}</strong>
            <button type="button" class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
          </div>
        </div>
      </article>
    `).join('');

    productGrid.html(markup);
  }

  function renderCart() {
    const tableBody = $('#cart-table tbody');
    if (!tableBody.length) return;

    if (cart.length === 0) {
      tableBody.html('<tr><td colspan="5">Your cart is empty.</td></tr>');
      $('#grand-total').text('$0.00');
      return;
    }

    tableBody.empty();
    cart.forEach((item) => {
      const product = getProductById(products, item.id);
      if (typeof product === 'string') return;
      const itemTotal = product.price * item.quantity;

      tableBody.append(`
        <tr>
          <td>${product.name}</td>
          <td>$${product.price}</td>
          <td>
            <div class="qty-controls">
              <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
              <span>${item.quantity}</span>
              <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
            </div>
          </td>
          <td>$${itemTotal}</td>
          <td><button type="button" class="remove-btn" data-id="${item.id}">Remove</button></td>
        </tr>
      `);
    });

    $('#grand-total').text(`$${getCartTotal(cart).toFixed(2)}`);
  }

  function loadProducts() {
    statusMessage.text('Loading...').show();

    $.getJSON('products.json')
      .done(function (data) {
        if (Array.isArray(data) && data.length > 0) {
          statusMessage.hide();
          products.length = 0;
          data.forEach((item) => products.push(item));
          renderProductList();
        } else {
          statusMessage.text('No products available.').show();
        }
      })
      .fail(function () {
        statusMessage.text('Unable to load products. Please try again later.').show();
      });
  }

  const savedTheme = localStorage.getItem('shopEasyTheme') || 'light';
  setTheme(savedTheme);
  updateCartCounter();

  if ($('#featured-products').length) {
    renderFeaturedProducts();
  }

  if ($('#product-grid').length) {
    loadProducts();

    document.getElementById('product-search').addEventListener('input', renderProductList);
    document.getElementById('category-filter').addEventListener('change', renderProductList);
    document.getElementById('sort-products').addEventListener('change', renderProductList);

    productGrid.get(0).addEventListener('click', function (event) {
      const button = event.target.closest('.add-to-cart-btn');
      if (!button) return;

      const productId = Number(button.dataset.id);
      addToCart(productId);
      updateCartCounter();
      const message = $('#status-message');
      message.text('Added to cart!').show().fadeOut(1200);
      if (window.location.href.includes('cart.html')) {
        renderCart();
      }
    });
  }

  if ($('#cart-table').length) {
    renderCart();

    document.addEventListener('click', function (event) {
      const qtyButton = event.target.closest('.qty-btn');
      if (qtyButton) {
        const action = qtyButton.dataset.action;
        const productId = Number(qtyButton.dataset.id);
        updateQuantity(productId, action === 'increase' ? 1 : -1);
        updateCartCounter();
        renderCart();
        return;
      }

      const removeButton = event.target.closest('.remove-btn');
      if (removeButton) {
        const productId = Number(removeButton.dataset.id);
        removeFromCart(productId);
        updateCartCounter();
        renderCart();
      }
    });

    const checkoutForm = document.getElementById('checkout-form');
    checkoutForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const isValid = validateCheckout();

      if (isValid) {
        $('#grand-total').text('$0.00');
        checkoutForm.reset();
        $('.error-message').text('');
        alert('Order placed successfully!');
      }
    });
  }

  themeToggle.on('click', function () {
    const nextTheme = $('body').hasClass('dark-theme') ? 'light' : 'dark';
    setTheme(nextTheme);
  });

  $('.faq-question').on('click', function () {
    $(this).next('.faq-answer').slideToggle();
    $(this).toggleClass('open');
  });

  $('.featured-card').fadeIn(700);
  $('.product-card').fadeIn(700);
});
