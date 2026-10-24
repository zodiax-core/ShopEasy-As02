const products = [
  { id: 1, name: 'Laptop', price: 1200, category: 'electronics', rating: 4.6, inStock: true, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80' },
  { id: 2, name: 'Wireless Headphones', price: 220, category: 'electronics', rating: 4.7, inStock: true, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80' },
  { id: 3, name: 'Classic Chair', price: 180, category: 'home', rating: 4.4, inStock: true, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
  { id: 4, name: 'Cotton T-Shirt', price: 35, category: 'fashion', rating: 4.3, inStock: true, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80' },
  { id: 5, name: 'Coffee Maker', price: 95, category: 'home', rating: 4.5, inStock: false, image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=900&q=80' },
  { id: 6, name: 'Novel Collection', price: 48, category: 'books', rating: 4.8, inStock: true, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80' },
  { id: 7, name: 'Smart Watch', price: 260, category: 'electronics', rating: 4.5, inStock: true, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80' },
  { id: 8, name: 'Running Shoes', price: 140, category: 'fashion', rating: 4.2, inStock: true, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80' },
  { id: 9, name: 'Desk Lamp', price: 64, category: 'home', rating: 4.1, inStock: true, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
  { id: 10, name: 'Programming Book', price: 58, category: 'books', rating: 4.9, inStock: true, image: 'https://images.unsplash.com/photo-1516979187454-437b4f08f2c9?auto=format&fit=crop&w=900&q=80' }
];

const CART_KEY = 'shopEasyCart';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

function saveCartToStorage() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Show every product in the list as a card in the product grid forEach, DOM
function displayProducts(list) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  grid.innerHTML = '';

  list.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
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
    `;
    grid.appendChild(card);
  });
}

// Return the products whose name contains the text, ignoring capital letters filter, includes
function searchProducts(list, text) {
  const searchText = String(text || '').trim().toLowerCase();
  if (!searchText) return list;
  return list.filter((product) => product.name.toLowerCase().includes(searchText));
}

// Return products of that category. If the category is "all", return the whole list filter
function filterByCategory(list, category) {
  if (!category || category === 'all') return list;
  return list.filter((product) => product.category === category);
}

// Return a sorted COPY of the list by price: "low" gives cheapest first, "high" gives most expensive first sort, spread
function sortProducts(list, order) {
  const sortedList = [...list];
  if (order === 'low') {
    return sortedList.sort((a, b) => a.price - b.price);
  }
  if (order === 'high') {
    return sortedList.sort((a, b) => b.price - a.price);
  }
  return sortedList;
}

// Return the product with that id, or the text "Product not found" find
function getProductById(list, id) {
  const foundProduct = list.find((product) => product.id === id);
  return foundProduct || 'Product not found';
}

// Add the product to the cart. If it is already there, increase its quantity by 1 find, spread
function addToCart(id) {
  const product = getProductById(products, id);
  if (typeof product === 'string') return cart;

  const existingItem = cart.find((item) => item.id === id);

  if (existingItem) {
    cart = cart.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
  } else {
    cart = [...cart, { id: product.id, quantity: 1 }];
  }

  saveCartToStorage();
  return cart;
}

// Return a new cart without that product filter
function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCartToStorage();
  return cart;
}

// Add change (+1 or -1) to the quantity. Remove the item if quantity becomes 0 map
function updateQuantity(id, change) {
  cart = cart
    .map((item) => item.id === id ? { ...item, quantity: item.quantity + change } : item)
    .filter((item) => item.quantity > 0);
  saveCartToStorage();
  return cart;
}

// Return the total of price x quantity for all cart items reduce
function getCartTotal(cartItems) {
  return cartItems.reduce((total, item) => {
    const product = getProductById(products, item.id);
    if (typeof product === 'string') return total;
    return total + product.price * item.quantity;
  }, 0);
}

// Add any number of prices and subtract the discount percent. Example: calculateBill(10, 100, 50) returns 135 rest, reduce
function calculateBill(discount, ...prices) {
  const total = prices.reduce((sum, price) => sum + Number(price), 0);
  const discountedTotal = total - (total * discount) / 100;
  return Number(discountedTotal.toFixed(2));
}

// Check every form field, show a red message under wrong fields, return true or false if, preventDef
function validateCheckout() {
  const form = document.getElementById('checkout-form');
  if (!form) return false;

  let isValid = true;

  const fields = {
    fullName: {
      element: document.getElementById('full-name'),
      message: 'Please enter your full name.'
    },
    email: {
      element: document.getElementById('email'),
      message: 'Enter a valid email address.'
    },
    phone: {
      element: document.getElementById('phone'),
      message: 'Enter a valid phone number.'
    },
    city: {
      element: document.getElementById('city'),
      message: 'Please select a city.'
    },
    address: {
      element: document.getElementById('address'),
      message: 'Address must be at least 10 characters.'
    }
  };

  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    const messageElement = field.element.parentElement.querySelector('.error-message');
    messageElement.textContent = '';

    let value = '';
    if (field.element.tagName === 'SELECT') {
      value = field.element.value;
    } else {
      value = field.element.value.trim();
    }

    if (key === 'fullName') {
      if (value.length < 2) {
        messageElement.textContent = field.message;
        isValid = false;
      }
    }

    if (key === 'email') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        messageElement.textContent = field.message;
        isValid = false;
      }
    }

    if (key === 'phone') {
      const phonePattern = /^[0-9+\-\s]{7,15}$/;
      if (!phonePattern.test(value)) {
        messageElement.textContent = field.message;
        isValid = false;
      }
    }

    if (key === 'city') {
      if (!value) {
        messageElement.textContent = field.message;
        isValid = false;
      }
    }

    if (key === 'address') {
      if (value.length < 10) {
        messageElement.textContent = field.message;
        isValid = false;
      }
    }
  });

  return isValid;
}
