const PRODUCTS = [
  {
    id: "iphone17",
    name: "iPhone 17",
    category: "iPhone",
    price: 79900,
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=900&q=85",
    description: "A premium smartphone experience for everyday creativity, photography and performance.",
    specs: ["Premium smartphone design", "High-resolution camera system", "Fast everyday performance", "Modern iOS-inspired experience"]
  },
  {
    id: "macbookair",
    name: "MacBook Air",
    category: "Mac",
    price: 99900,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85",
    description: "A slim and elegant laptop designed for productivity, learning and creative work.",
    specs: ["Slim portable design", "High-resolution display", "Comfortable keyboard", "Ideal for productivity and study"]
  },
  {
    id: "applewatch",
    name: "Apple Watch",
    category: "Watch",
    price: 29900,
    image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=900&q=85",
    description: "A modern smartwatch concept to complement your everyday style and routine.",
    specs: ["Modern watch design", "Customizable watch faces", "Everyday activity tracking concept", "Comfortable wrist fit"]
  },
  {
    id: "airpods",
    name: "AirPods",
    category: "Audio",
    price: 19900,
    image: "https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?auto=format&fit=crop&w=900&q=85",
    description: "A clean, compact wireless audio experience for music, calls and daily listening.",
    specs: ["Compact wireless design", "Portable charging case concept", "Convenient everyday listening", "Minimal, lightweight style"]
  }
];

const KEYS = {
  user: "savedUser",
  login: "isLoggedIn",
  cart: "appleCart",
  wishlist: "appleWishlist",
  history: "appleProductHistory",
  orders: "appleOrderHistory"
};

function readData(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUser() {
  return readData(KEYS.user, null);
}

function isLoggedIn() {
  return localStorage.getItem(KEYS.login) === "true" && !!getUser();
}

function money(amount) {
  return Number(amount || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  });
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function showMessage(elementId, message, success = false) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.textContent = message;
  element.className = success
    ? "text-sm text-green-600"
    : "text-sm text-red-600";
}

function notify(message) {
  let toast = document.getElementById("storeToast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "storeToast";
    toast.className =
      "fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-full shadow-lg text-sm max-w-[90%] text-center";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.remove("hidden");

  clearTimeout(window.storeToastTimer);
  window.storeToastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2600);
}

function requireLogin() {
  const protectedPages = [
    "homepage.html",
    "product-details.html",
    "cart.html",
    "wishlist.html",
    "orders.html",
    "profile.html",
    "product-history.html"
  ];

  const currentPage = location.pathname.split("/").pop() || "index.html";

  if (protectedPages.includes(currentPage) && !isLoggedIn()) {
    location.replace("login.html");
    return false;
  }

  return true;
}

function getProduct(id) {
  return PRODUCTS.find(product => product.id === id);
}

function getCart() {
  return readData(KEYS.cart, []);
}

function getWishlist() {
  return readData(KEYS.wishlist, []);
}

function getHistory() {
  return readData(KEYS.history, []);
}

function getOrders() {
  return readData(KEYS.orders, []);
}

function productCard(product, options = {}) {
  const wishlist = getWishlist();
  const isSaved = wishlist.includes(product.id);

  return `
    <article class="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <a href="product-details.html?id=${encodeURIComponent(product.id)}"
         class="block bg-white p-4">
        <img src="${product.image}" alt="${escapeHTML(product.name)}"
             loading="lazy" class="w-full h-48 object-contain rounded-xl"
             onerror="this.onerror=null;this.src='https://placehold.co/600x400/f3f4f6/6b7280?text=Product+Image'">
      </a>
      <div class="p-5 flex flex-col flex-1">
        <p class="text-xs uppercase tracking-wider text-gray-500">${escapeHTML(product.category)}</p>
        <a href="product-details.html?id=${encodeURIComponent(product.id)}"
           class="font-bold text-lg mt-1 hover:text-blue-600">${escapeHTML(product.name)}</a>
        <p class="font-semibold mt-2">${money(product.price)}</p>
        <div class="flex gap-2 mt-5">
          <button onclick="addToCart('${product.id}')"
            class="flex-1 bg-black hover:bg-gray-800 text-white rounded-full py-2.5 text-sm font-medium">
            Add to Cart
          </button>
          <button onclick="toggleWishlist('${product.id}')"
            aria-label="${isSaved ? "Remove from wishlist" : "Add to wishlist"}"
            class="border rounded-full w-11 h-11 text-xl hover:bg-gray-50">
            ${isSaved ? "♥" : "♡"}
          </button>
        </div>
        ${options.removeFromWishlist ? `
          <button onclick="removeFromWishlist('${product.id}')"
            class="text-red-600 text-sm mt-3">Remove from Wishlist</button>
        ` : ""}
        ${options.removeFromHistory ? `
          <button onclick="removeFromHistory('${product.id}')"
            class="text-gray-500 text-sm mt-3">Remove from History</button>
        ` : ""}
      </div>
    </article>
  `;
}

function renderProductGrid(targetId, products) {
  const target = document.getElementById(targetId);
  if (!target) return;

  target.innerHTML = products.map(product => productCard(product)).join("");
}

function renderHeaderCounts() {
  const cartCount = getCart().reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = getWishlist().length;

  document.querySelectorAll("#cartCount").forEach(element => {
    element.textContent = cartCount;
  });

  document.querySelectorAll("#wishlistCount").forEach(element => {
    element.textContent = wishlistCount;
  });
}

function addToHistory(productId) {
  const product = getProduct(productId);
  if (!product) return;

  const history = getHistory().filter(id => id !== productId);
  history.unshift(productId);
  saveData(KEYS.history, history.slice(0, 20));
}

function addToCart(productId) {
  if (!isLoggedIn()) {
    location.href = "login.html";
    return;
  }

  const product = getProduct(productId);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveData(KEYS.cart, cart);
  addToHistory(productId);
  renderHeaderCounts();
  renderCart();
  notify(`${product.name} added to cart`);
}

function updateQuantity(productId, change) {
  const cart = getCart();
  const item = cart.find(entry => entry.id === productId);

  if (!item) return;

  item.quantity += change;

  const updatedCart = cart.filter(entry => entry.quantity > 0);
  saveData(KEYS.cart, updatedCart);
  renderCart();
  renderHeaderCounts();
}

function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveData(KEYS.cart, cart);
  renderCart();
  renderHeaderCounts();
  notify("Product removed from cart");
}

function renderCart() {
  const container = document.getElementById("cartItems");
  if (!container) return;

  const cart = getCart();
  const empty = document.getElementById("emptyCart");
  const summary = document.getElementById("orderSummary");
  const checkout = document.getElementById("checkout");

  if (empty) empty.classList.toggle("hidden", cart.length > 0);
  if (summary) summary.classList.toggle("hidden", cart.length === 0);

  if (cart.length === 0 && checkout) {
    checkout.classList.add("hidden");
  }

  container.innerHTML = cart.map(item => {
    const product = getProduct(item.id);
    if (!product) return "";

    return `
      <article class="bg-white border rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
        <img src="${product.image}" alt="${escapeHTML(product.name)}"
          class="w-full sm:w-28 h-40 sm:h-28 object-contain bg-white rounded-xl"
          onerror="this.onerror=null;this.src='https://placehold.co/300x300/f3f4f6/6b7280?text=Product'">
        <div class="flex-1">
          <a href="product-details.html?id=${product.id}" class="font-bold text-lg hover:text-blue-600">
            ${escapeHTML(product.name)}
          </a>
          <p class="text-sm text-gray-500 mt-1">${escapeHTML(product.category)}</p>
          <p class="font-semibold mt-2">${money(product.price)}</p>
          <button onclick="removeFromCart('${product.id}')"
            class="text-red-600 text-sm mt-3">Remove</button>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="updateQuantity('${product.id}', -1)"
            aria-label="Decrease quantity"
            class="border rounded-full w-9 h-9 font-semibold">−</button>
          <span class="font-semibold min-w-5 text-center">${item.quantity}</span>
          <button onclick="updateQuantity('${product.id}', 1)"
            aria-label="Increase quantity"
            class="border rounded-full w-9 h-9 font-semibold">+</button>
        </div>
        <p class="font-bold sm:w-28 sm:text-right">${money(product.price * item.quantity)}</p>
      </article>
    `;
  }).join("");

  const subtotal = cart.reduce((sum, item) => {
    const product = getProduct(item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const delivery = subtotal > 0 ? 0 : 0;
  const total = subtotal + delivery;

  const subtotalElement = document.getElementById("cartSubtotal");
  const deliveryElement = document.getElementById("deliveryCharge");
  const totalElement = document.getElementById("cartTotal");

  if (subtotalElement) subtotalElement.textContent = money(subtotal);
  if (deliveryElement) deliveryElement.textContent = delivery === 0 ? "Free" : money(delivery);
  if (totalElement) totalElement.textContent = money(total);

  renderHeaderCounts();
}

function toggleWishlist(productId) {
  if (!isLoggedIn()) {
    location.href = "login.html";
    return;
  }

  const product = getProduct(productId);
  if (!product) return;

  let wishlist = getWishlist();

  if (wishlist.includes(productId)) {
    wishlist = wishlist.filter(id => id !== productId);
    notify("Removed from wishlist");
  } else {
    wishlist.push(productId);
    notify("Added to wishlist");
  }

  saveData(KEYS.wishlist, wishlist);
  renderHeaderCounts();
  renderProductGrid("productGrid", PRODUCTS.filter(product => {
    const search = document.getElementById("productSearch")?.value.toLowerCase() || "";
    return product.name.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search);
  }));
  renderWishlist();
  renderProductDetails();
  renderProductGrid("featuredProducts", PRODUCTS);
  renderProductGrid("relatedProducts", PRODUCTS.filter(product => product.id !== productId));
  renderHistory();
}

function removeFromWishlist(productId) {
  saveData(KEYS.wishlist, getWishlist().filter(id => id !== productId));
  renderWishlist();
  renderHeaderCounts();
  notify("Removed from wishlist");
}

function renderWishlist() {
  const container = document.getElementById("wishlistItems");
  if (!container) return;

  const products = getWishlist().map(getProduct).filter(Boolean);
  container.innerHTML = products.map(product =>
    productCard(product, { removeFromWishlist: true })
  ).join("");

  document.getElementById("emptyWishlist")?.classList.toggle("hidden", products.length > 0);
}

function removeFromHistory(productId) {
  saveData(KEYS.history, getHistory().filter(id => id !== productId));
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById("historyItems");
  if (!container) return;

  const products = getHistory().map(getProduct).filter(Boolean);
  container.innerHTML = products.map(product =>
    productCard(product, { removeFromHistory: true })
  ).join("");

  document.getElementById("emptyHistory")?.classList.toggle("hidden", products.length > 0);
}

function renderProductDetails() {
  const container = document.getElementById("productDetails");
  if (!container) return;

  const productId = new URLSearchParams(location.search).get("id");
  const product = getProduct(productId);

  if (!product) {
    container.innerHTML = `
      <div class="bg-white border rounded-2xl p-8 text-center">
        <h1 class="text-2xl font-bold">Product not found</h1>
        <a href="homepage.html" class="inline-block mt-5 text-blue-600">Return to Shop</a>
      </div>`;
    return;
  }

  addToHistory(product.id);

  const isSaved = getWishlist().includes(product.id);

  container.innerHTML = `
    <section class="bg-white border rounded-3xl p-5 md:p-10 grid md:grid-cols-2 gap-8 md:gap-12">
      <div class="bg-gray-50 rounded-2xl p-4 flex items-center justify-center min-h-72">
        <img src="${product.image}" alt="${escapeHTML(product.name)}"
          class="w-full max-h-[440px] object-contain"
          onerror="this.onerror=null;this.src='https://placehold.co/600x500/f3f4f6/6b7280?text=Product+Image'">
      </div>
      <div class="flex flex-col justify-center">
        <p class="text-blue-600 font-semibold uppercase tracking-wider text-sm">${escapeHTML(product.category)}</p>
        <h1 class="text-3xl md:text-5xl font-bold mt-3">${escapeHTML(product.name)}</h1>
        <p class="text-2xl font-semibold mt-5">${money(product.price)}</p>
        <p class="text-gray-600 leading-7 mt-5">${escapeHTML(product.description)}</p>
        <h2 class="font-bold mt-7 mb-3">Highlights</h2>
        <ul class="space-y-2 text-gray-600">
          ${product.specs.map(spec => `<li>✓ ${escapeHTML(spec)}</li>`).join("")}
        </ul>
        <div class="flex flex-wrap gap-3 mt-8">
          <button onclick="addToCart('${product.id}')"
            class="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-7 py-3 font-semibold">
            Add to Cart
          </button>
          <button onclick="toggleWishlist('${product.id}')"
            class="border rounded-full px-6 py-3 font-semibold">
            ${isSaved ? "♥ Saved" : "♡ Add to Wishlist"}
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-5">Educational demo product listing. Specifications are illustrative.</p>
      </div>
    </section>
  `;

  renderProductGrid("relatedProducts", PRODUCTS.filter(item => item.id !== product.id));
}

function renderOrders() {
  const container = document.getElementById("ordersList");
  const emptyMessage = document.getElementById("emptyOrders");

  if (!container) return;

  const orders = JSON.parse(
    localStorage.getItem("appleOrderHistory") || "[]"
  );

  const user = JSON.parse(
    localStorage.getItem("savedUser") || "null"
  );

  const myOrders = user
    ? orders.filter(order =>
        order.email?.toLowerCase() === user.email?.toLowerCase()
      )
    : [];

  if (myOrders.length === 0) {
    container.innerHTML = "";
    emptyMessage?.classList.remove("hidden");
    if (emptyMessage) {
      emptyMessage.innerHTML = `
        <h2 class="text-xl font-bold">No orders yet</h2>
        <p class="text-gray-500 mt-2">
          Place an order from your shopping cart to see it here.
        </p>
        <a href="homepage.html"
          class="inline-block bg-blue-600 text-white rounded-full px-6 py-3 mt-5">
          Start Shopping
        </a>
      `;
    }
    return;

  emptyMessage?.classList.add("hidden");

  container.innerHTML = myOrders.map(order => `
    <article class="bg-white border rounded-2xl p-5 md:p-7 mb-5">
      <div class="flex flex-wrap justify-between gap-3 border-b pb-4">
        <div>
          <p class="text-sm text-gray-500">Order ID</p>
          <h2 class="font-bold">${order.id}</h2>
          <p class="text-sm text-gray-500 mt-1">${order.date}</p>
        </div>
        <span class="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm h-fit">
          ${order.status}
        </span>
      </div>

      <div class="py-4 space-y-3">
        ${order.items.map(item => {
          const product = PRODUCTS.find(p => p.id === item.id);

          if (!product) return "";

          return `
            <div class="flex justify-between gap-3 text-sm">
              <span>${product.name} × ${item.quantity}</span>
              <span>${money(product.price * item.quantity)}</span>
            </div>
          `;
        }).join("")}
      </div>

      <div class="border-t pt-4 flex justify-between font-bold">
        <span>Order Total</span>
        <span>${money(order.total)}</span>
      </div>
    </article>
  `).join("");
}

  container.innerHTML = orders.map(order => `
    <article class="bg-white border rounded-2xl p-5 md:p-7">
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b pb-4">
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wider">Order ID</p>
          <h2 class="font-bold mt-1">${escapeHTML(order.id)}</h2>
          <p class="text-sm text-gray-500 mt-1">${escapeHTML(order.date)}</p>
        </div>
        <span class="inline-flex bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
          ${escapeHTML(order.status)}
        </span>
      </div>
      <div class="py-4 space-y-3">
        ${order.items.map(item => {
          const product = getProduct(item.id);
          if (!product) return "";
          return `
            <div class="flex justify-between gap-4 text-sm">
              <span>${escapeHTML(product.name)} × ${item.quantity}</span>
              <span class="font-medium">${money(product.price * item.quantity)}</span>
            </div>`;
        }).join("")}
      </div>
      <div class="border-t pt-4 flex justify-between font-bold">
        <span>Order Total</span><span>${money(order.total)}</span>
      </div>
      <p class="text-xs text-gray-500 mt-3">Demo order only; no real payment or shipment has been arranged.</p>
    </article>
  `).join("");

  document.getElementById("emptyOrders")?.classList.toggle("hidden", orders.length > 0);
}

function renderProfile() {
  const form = document.getElementById("profileForm");
  if (!form) return;

  const user = getUser();
  if (!user) return;

  document.getElementById("profileName").value = user.name || "";
  document.getElementById("profileEmail").value = user.email || "";
  document.getElementById("profileMobile").value = user.mobile || "";
  document.getElementById("profileDisplayName").textContent = user.name || "Your Account";
  document.getElementById("profileDisplayEmail").textContent = user.email || "";
  document.getElementById("profileAvatar").textContent = (user.name || "U").trim().charAt(0).toUpperCase();
}

function bindRegistration() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const mobile = document.getElementById("mobile").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      showMessage("registerMessage", "Passwords do not match.");
      return;
    }

    const user = { name, email, mobile, password };
    saveData(KEYS.user, user);
    localStorage.setItem(KEYS.login, "false");

    showMessage("registerMessage", "Account created. Redirecting to login...", true);
    setTimeout(() => location.href = "login.html", 900);
  });
}

function bindLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const user = getUser();

    if (user && user.email.toLowerCase() === email && user.password === password) {
      localStorage.setItem(KEYS.login, "true");
      showMessage("loginMessage", "Login successful. Opening your store...", true);
      setTimeout(() => location.href = "homepage.html", 500);
    } else {
      showMessage("loginMessage", "Invalid email or password. Please register first if you don't have an account.");
    }
  });
}

function bindLogout() {
  document.getElementById("logoutButton")?.addEventListener("click", () => {
    localStorage.setItem(KEYS.login, "false");
    location.href = "login.html";
  });
}

function bindProfile() {
  const form = document.getElementById("profileForm");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    const user = getUser();
    if (!user) return;

    const updated = {
      ...user,
      name: document.getElementById("profileName").value.trim(),
      email: document.getElementById("profileEmail").value.trim().toLowerCase(),
      mobile: document.getElementById("profileMobile").value.trim()
    };

    if (!updated.name || !updated.email || !/^[0-9]{10}$/.test(updated.mobile)) {
      showMessage("profileMessage", "Enter a name, valid email and 10-digit mobile number.");
      return;
    }

    saveData(KEYS.user, updated);
    renderProfile();
    showMessage("profileMessage", "Profile updated successfully.", true);
  });
}

function bindCheckout() {
  const checkoutButton = document.getElementById("checkoutButton");
  const checkout = document.getElementById("checkout");
  const form = document.getElementById("checkoutForm");

  checkoutButton?.addEventListener("click", () => {
    const cart = getCart();

    if (!cart.length) {
      notify("Your cart is empty");
      return;
    }

    const user = getUser();

    if (user) {
      document.getElementById("customerName").value = user.name || "";
      document.getElementById("customerEmail").value = user.email || "";
      document.getElementById("customerPhone").value = user.mobile || "";
    }

    checkout?.classList.remove("hidden");
    checkout?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("cancelCheckout")?.addEventListener("click", () => {
    checkout?.classList.add("hidden");
  });

  form?.addEventListener("submit", event => {
    event.preventDefault();

    const cart = getCart();
    if (!cart.length) {
      showMessage("checkoutMessage", "Your cart is empty.");
      return;
    }

    const user = getUser();
    const name = document.getElementById("customerName").value.trim();
    const email = document.getElementById("customerEmail").value.trim().toLowerCase();
    const phone = document.getElementById("customerPhone").value.trim();
    const address = document.getElementById("customerAddress").value.trim();

    if (!name || !email || !/^[0-9]{10}$/.test(phone) || !address) {
      showMessage("checkoutMessage", "Please enter valid delivery details.");
      return;
    }

    const items = cart.map(item => ({
      id: item.id,
      quantity: item.quantity
    }));

    const total = items.reduce((sum, item) => {
      const product = getProduct(item.id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const order = {
      id: "AS-" + Date.now().toString().slice(-8),
      date: new Date().toLocaleString("en-IN"),
      name,
      email,
      phone,
      address,
      items,
      total,
      status: "Demo Order Placed"
    };

    const orders = getOrders();
    orders.unshift(order);
    saveData(KEYS.orders, orders);
    saveData(KEYS.cart, []);

    document.getElementById("orderMessage").textContent =
      `Order ${order.id} has been recorded. Total: ${money(total)}. This is a demo confirmation only.`;

    document.getElementById("cartItems")?.classList.add("hidden");
    document.getElementById("emptyCart")?.classList.add("hidden");
    document.getElementById("orderSummary")?.classList.add("hidden");
    checkout?.classList.add("hidden");
    document.getElementById("orderSuccess")?.classList.remove("hidden");

    renderHeaderCounts();
    notify("Demo order placed successfully");
    document.getElementById("orderSuccess")?.scrollIntoView({ behavior: "smooth" });
  });
}

function bindSearch() {
  const search = document.getElementById("productSearch");
  if (!search) return;

  search.addEventListener("input", () => {
    const term = search.value.trim().toLowerCase();
    const filtered = PRODUCTS.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );

    renderProductGrid("productGrid", filtered);
    document.getElementById("emptyProducts")?.classList.toggle("hidden", filtered.length > 0);
  });
}

function bindHistory() {
  document.getElementById("clearHistoryButton")?.addEventListener("click", () => {
    saveData(KEYS.history, []);
    renderHistory();
    notify("Browsing history cleared");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin()) return;

  bindRegistration();
  bindLogin();
  bindLogout();
  bindProfile();
  bindCheckout();
  bindSearch();
  bindHistory();

  renderProductGrid("featuredProducts", PRODUCTS);
  renderProductGrid("productGrid", PRODUCTS);
  renderCart();
  renderWishlist();
  renderHistory();
  renderOrders();
  renderProfile();
  renderProductDetails();
  renderHeaderCounts();
});