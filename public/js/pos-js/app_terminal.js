document.addEventListener('DOMContentLoaded', () => {

    // --- DATA DUMMY PRODUK ---
    const products = [
        { id: 1, name: "Kopi Hitam", sku: "KH001", price: 15000, image: "../../public/img/products/kopi-hitam.png" },
        { id: 2, name: "Cappuccino", sku: "CP002", price: 25000, image: "../../public/img/products/cappuccino.jpg" },
        { id: 3, name: "Latte", sku: "LT003", price: 28000, image: "../../public/img/products/latte.jpg" },
        { id: 4, name: "Roti Bakar", sku: "RB004", price: 22000, image: "../../public/img/products/roti-bakar.jpg" },
        { id: 5, name: "Croissant", sku: "CR005", price: 18000, image: "../../public/img/products/croissant.jpg" },
        { id: 6, name: "Teh Manis", sku: "TM006", price: 12000, image: "../../public/img/products/teh-manis.jpg" },

    ];

    // --- VARIABEL & ELEMEN DOM ---
    const productList = document.getElementById('product-list');
    const cartItems = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const totalPriceEl = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-button');
    const searchInput = document.getElementById('search-product');

    let cart = [];

    // --- FUNGSI-FUNGSI ---

    function renderProducts(productData) {
        productList.innerHTML = '';
        productData.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">Rp ${product.price.toLocaleString('id-ID')}</p>
            `;
            productCard.addEventListener('click', () => addProductToCart(product));
            productList.appendChild(productCard);
        });
    }

    
    function addProductToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        renderCart();
    }

    /**
     * Fungsi untuk menampilkan item di keranjang.
     */
    function renderCart() {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart-message">Keranjang masih kosong.</p>';
        } else {
            cartItems.innerHTML = '';
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-details">
                        <p class="cart-item-name">${item.name}</p>
                        <p class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</p>
                    </div>
                    <div class="cart-item-actions">
                        <input type="number" class="item-quantity" value="${item.quantity}" min="1" data-id="${item.id}">
                        <button class="remove-item-btn" data-id="${item.id}">×</button>
                    </div>
                `;
                cartItems.appendChild(cartItem);
            });
        }
        updateTotals();
        updateCheckoutButtonState();
    }

    /**
     * Fungsi untuk menghitung dan memperbarui total.
     */
    function updateTotals() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.11; // Pajak 11%
        const total = subtotal + tax;

        subtotalEl.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
        taxEl.textContent = `Rp ${tax.toLocaleString('id-ID')}`;
        totalPriceEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }

    /**
     * Mengatur status tombol checkout (aktif/nonaktif).
     */
    function updateCheckoutButtonState() {
        checkoutButton.disabled = cart.length === 0;
    }

    /**
     * Menangani perubahan kuantitas atau penghapusan item dari keranjang.
     * @param {Event} event - Event object.
     */
    function handleCartActions(event) {
        const target = event.target;
        const productId = parseInt(target.dataset.id);

        if (target.classList.contains('remove-item-btn')) {
            cart = cart.filter(item => item.id !== productId);
        }

        if (target.classList.contains('item-quantity')) {
            const newQuantity = parseInt(target.value);
            const itemInCart = cart.find(item => item.id === productId);
            if (itemInCart && newQuantity > 0) {
                itemInCart.quantity = newQuantity;
            } else {
                // Jika kuantitas 0 atau kurang, hapus item
                cart = cart.filter(item => item.id !== productId);
            }
        }
        renderCart();
    }
    
    // --- EVENT LISTENERS ---

    // Event listener untuk pencarian produk
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.sku.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts);
    });
    
    // Event listener untuk aksi di keranjang (quantity & remove)
    cartItems.addEventListener('change', handleCartActions);
    cartItems.addEventListener('click', handleCartActions);

    // Event listener untuk tombol checkout
    checkoutButton.addEventListener('click', () => {
        if (cart.length > 0) {
            // Simpan data keranjang dan total ke localStorage
            const orderDetails = {
                cart: cart,
                subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                tax: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.11,
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.11,
            };
            localStorage.setItem('currentOrder', JSON.stringify(orderDetails));
            
            // Arahkan ke halaman pembayaran
            window.location.href = 'pos_payment.html';
        }
    });

    // --- INISIALISASI ---
    renderProducts(products);
    renderCart();
});