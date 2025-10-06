// Pakai jQuery
$(document).ready(() => {

    // --- DATA DUMMY PRODUK (masih hardcode, masih menunggu product page & functionalities nya jadi(di kerjakan javier))---
    const products = [
        { id: 1, name: "Kopi Hitam", sku: "KH001", price: 15000, image: "../../public/img/products/kopi-hitam.png" },
        { id: 2, name: "Cappuccino", sku: "CP002", price: 25000, image: "../../public/img/products/cappuccino.jpg" },
        { id: 3, name: "Cappuccino", sku: "CP002", price: 25000, image: "../../public/img/products/cappuccino.jpg" },
        { id: 4, name: "Cappuccino", sku: "CP002", price: 25000, image: "../../public/img/products/cappuccino.jpg" },
        { id: 5, name: "Cappuccino", sku: "CP002", price: 25000, image: "../../public/img/products/cappuccino.jpg" },
        { id: 6, name: "Cappuccino", sku: "CP002", price: 25000, image: "../../public/img/products/cappuccino.jpg" },
        { id: 7, name: "Cappuccino", sku: "CP002", price: 25000, image: "../../public/img/products/cappuccino.jpg" },
        { id: 8, name: "Cappuccino", sku: "CP002", price: 25000, image: "../../public/img/products/cappuccino.jpg" },
        { id: 9, name: "Cappuccino", sku: "CP002", price: 25000, image: "../../public/img/products/cappuccino.jpg" },
        { id: 10, name: "Cappuccino", sku: "CP002", price: 25000, image: "../../public/img/products/cappuccino.jpg" },
        { id: 11, name: "Kopi Hitam", sku: "KH001", price: 15000, image: "../../public/img/products/kopi-hitam.png" },
        { id: 12, name: "Kopi Hitam", sku: "KH001", price: 15000, image: "../../public/img/products/kopi-hitam.png" },
        { id: 13, name: "Kopi Hitam", sku: "KH001", price: 15000, image: "../../public/img/products/kopi-hitam.png" },
        { id: 14, name: "Kopi Hitam", sku: "KH001", price: 15000, image: "../../public/img/products/kopi-hitam.png" },
        { id: 15, name: "Kopi Hitam", sku: "KH001", price: 15000, image: "../../public/img/products/kopi-hitam.png" },
    ];

    // --- VARIABEL & ELEMEN DOM (jQuery style) ---
    const $productList = $('#product-list');
    const $cartItems = $('#cart-items');
    const $subtotalEl = $('#subtotal');
    const $taxEl = $('#tax');
    const $totalPriceEl = $('#total-price');
    const $checkoutButton = $('#checkout-button');
    const $searchInput = $('#search-product');

    let cart = [];


    // --- FUNCTION FUNCTION ---
    function formatRupiah(number) {
        return `Rp ${number.toLocaleString('id-ID')}`;
    }

    function renderProducts(productData) {
        $productList.empty();
        productData.forEach(product => {
            const $productCard = $(`
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">${formatRupiah(product.price)}</p>
                </div>
            `);
            // event listener untuk menambah product ke keranjang
            $productCard.on('click', () => addProductToCart(product));
            $productList.append($productCard);
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

    function renderCart() {
        if (cart.length === 0) {
            $cartItems.html('<p class="empty-cart-message">Keranjang masih kosong.</p>');
        } else {
            $cartItems.empty();
            cart.forEach(item => {
                const $cartItem = $(`
                    <div class="cart-item">
                        <div class="cart-item-details">
                            <p class="cart-item-name">${item.name}</p>
                            <p class="cart-item-price">${formatRupiah(item.price)}</p>
                        </div>
                        <div class="cart-item-actions">
                            <input type="number" class="item-quantity" value="${item.quantity}" min="1" data-id="${item.id}">
                            <button class="remove-item-btn" data-id="${item.id}">×</button>
                        </div>
                    </div>
                `);
                $cartItems.append($cartItem);
            });
        }
        updateTotals();
        updateCheckoutButtonState();
    }

    function updateTotals() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.11;
        const total = subtotal + tax;

        $subtotalEl.text(formatRupiah(subtotal));
        $taxEl.text(formatRupiah(tax));
        $totalPriceEl.text(formatRupiah(total));
    }

    function updateCheckoutButtonState() {
        $checkoutButton.prop('disabled', cart.length === 0);
    }

    function handleCartActions(event) {
        const $target = $(event.target);
        const productId = parseInt($target.data('id'));

        if ($target.hasClass('remove-item-btn')) {
            cart = cart.filter(item => item.id !== productId);
        }

        if ($target.hasClass('item-quantity')) {
            const newQuantity = parseInt($target.val());
            const itemInCart = cart.find(item => item.id === productId);
            if (itemInCart && newQuantity > 0) {
                itemInCart.quantity = newQuantity;
            } else {
                cart = cart.filter(item => item.id !== productId);
            }
        }
        renderCart();
    }
    

    // --- EVENT LISTENERS ---
    $searchInput.on('input', (e) => {
        const searchTerm = $(e.target).val().toLowerCase();
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.sku.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts);
    });
    
    // event delegation untuk item yang dinamis
    $cartItems.on('change', '.item-quantity', handleCartActions);
    $cartItems.on('click', '.remove-item-btn', handleCartActions);

    $checkoutButton.on('click', () => {
        if (cart.length > 0) {
            const orderDetails = {
                cart: cart,
                subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                tax: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.11,
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.11,
            };
            localStorage.setItem('currentOrder', JSON.stringify(orderDetails));
            window.location.href = 'pos_payment.html';
        }
    });

    renderProducts(products);
    renderCart();
});