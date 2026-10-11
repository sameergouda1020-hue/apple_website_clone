document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const logoutButton = document.getElementById("logoutButton");
    const checkoutButton = document.getElementById("checkoutButton");
    const checkoutForm = document.getElementById("checkoutForm");
    const cancelCheckout = document.getElementById("cancelCheckout");

    const currentPage = window.location.pathname.split("/").pop();

    if (currentPage === "homepage.html" && localStorage.getItem("isLoggedIn") !== "true") {
        window.location.replace("login.html");
        return;
    }

    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const mobile = document.getElementById("mobile").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (password.length < 6) {
                alert("Password must contain at least 6 characters.");
                return;
            }

            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            const user = { name, email, mobile, password };

            localStorage.setItem("appleUser", JSON.stringify(user));

            alert("Registration successful! Please login.");
            window.location.href = "login.html";
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = document.getElementById("email").value.trim().toLowerCase();
            const password = document.getElementById("password").value;
            const savedUser = JSON.parse(localStorage.getItem("appleUser"));

            if (!savedUser) {
                alert("Please register first.");
                window.location.href = "registration.html";
                return;
            }

            if (email === savedUser.email && password === savedUser.password) {
                localStorage.setItem("isLoggedIn", "true");
                alert("Login successful!");
                window.location.href = "homepage.html";
            } else {
                alert("Incorrect email or password.");
            }
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            localStorage.removeItem("isLoggedIn");
            window.location.href = "login.html";
        });
    }

    const savedUser = JSON.parse(localStorage.getItem("appleUser"));

    if (savedUser) {
        const customerName = document.getElementById("customerName");
        const customerEmail = document.getElementById("customerEmail");
        const customerPhone = document.getElementById("customerPhone");

        if (customerName) customerName.value = savedUser.name;
        if (customerEmail) customerEmail.value = savedUser.email;
        if (customerPhone) customerPhone.value = savedUser.mobile;
    }

    if (checkoutButton) {
        checkoutButton.addEventListener("click", function () {
            const cart = JSON.parse(localStorage.getItem("appleCart")) || [];

            if (cart.length === 0) {
                alert("Your cart is empty. Please add a product first.");
                return;
            }

            document.getElementById("checkout").classList.remove("hidden");
            document.getElementById("checkout").scrollIntoView({ behavior: "smooth" });
            updateCartCount();
        });
    }

    if (cancelCheckout) {
        cancelCheckout.addEventListener("click", function () {
            document.getElementById("checkout").classList.add("hidden");
            document.getElementById("cart").scrollIntoView({ behavior: "smooth" });
        });
    }

    if (checkoutForm) {
        checkoutForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const cart = JSON.parse(localStorage.getItem("appleCart")) || [];

            if (cart.length === 0) {
                alert("Your cart is empty.");
                return;
            }

            const customerName = document.getElementById("customerName").value.trim();
            const total = cart.reduce(function (sum, item) {
                return sum + item.price * item.quantity;
            }, 0);

            document.getElementById("orderMessage").textContent =
                "Thank you, " + customerName + "! Your demo order total is " +
                formatPrice(total) + ".";

            localStorage.removeItem("appleCart");
            renderCart();

            document.getElementById("checkout").classList.add("hidden");
            document.getElementById("cart").classList.add("hidden");
            document.getElementById("products").classList.add("hidden");
            document.getElementById("orderSuccess").classList.remove("hidden");
            document.getElementById("orderSuccess").scrollIntoView({ behavior: "smooth" });
        });
    }

    renderCart();
});

function formatPrice(amount) {
    return "₹" + amount.toLocaleString("en-IN");
}

function addToCart(name, price, image) {
    let cart = JSON.parse(localStorage.getItem("appleCart")) || [];

    const existingItem = cart.find(function (item) {
        return item.name === name;
    });

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: Number(price),
            image: image,
            quantity: 1
        });
    }

    localStorage.setItem("appleCart", JSON.stringify(cart));
    renderCart();
    alert(name + " added to cart!");
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("appleCart")) || [];

    cart.splice(index, 1);

    localStorage.setItem("appleCart", JSON.stringify(cart));
    renderCart();
}

function renderCart() {
    const cart = JSON.parse(localStorage.getItem("appleCart")) || [];
    const cartItems = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    const cartTotal = document.getElementById("cartTotal");
    const checkoutTotal = document.getElementById("checkoutTotal");

    const count = cart.reduce(function (sum, item) {
        return sum + item.quantity;
    }, 0);

    const total = cart.reduce(function (sum, item) {
        return sum + item.price * item.quantity;
    }, 0);

    if (cartCount) cartCount.textContent = count;
    if (cartTotal) cartTotal.textContent = formatPrice(total);
    if (checkoutTotal) checkoutTotal.textContent = formatPrice(total);

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-gray-500">Your cart is empty.</p>';
        return;
    }

    cartItems.innerHTML = cart.map(function (item, index) {
        return `
            <div class="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-contain">
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold">${item.name}</h3>
                    <p class="text-gray-500">${formatPrice(item.price)} × ${item.quantity}</p>
                    <p class="font-medium mt-1">${formatPrice(item.price * item.quantity)}</p>
                </div>
                <button onclick="removeFromCart(${index})" class="text-red-600 text-sm hover:underline">Remove</button>
            </div>
        `;
    }).join("");
}