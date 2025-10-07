// Pakai jQuery
$(document).ready(() => {
    // Ambil data produk dari localStorage.
    const products = Storage.getLocal("products", []);

    // --- VARIABEL & ELEMEN DOM ---
    const $productList = $('#product-list');
    const $cartItems = $('#cart-items');
    const $subtotalEl = $('#subtotal');
    const $taxEl = $('#tax');
    const $totalPriceEl = $('#total-price');
    const $checkoutButton = $('#checkout-button');
    const $searchInput = $('#search-product');

    let cart = [];

    // --- FUNGSI-FUNGSI ---
    function formatRupiah(number) {
        return `Rp ${number.toLocaleString('id-ID')}`;
    }

    function renderProducts(productData) {
        $productList.empty();
        productData.forEach(product => {
            const imageUrl = product.image || 'https://via.placeholder.com/150/EEEEEE/000000/?text=No+Image';
            const $productCard = $(`
                <div class="product-card">
                    <img src="${imageUrl}" alt="${product.name}">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">${formatRupiah(product.price)}</p>
                </div>
            `);
            $productCard.on('click', () => addProductToCart(product));
            $productList.append($productCard);
        });
    }

    function addProductToCart(product) {
        const existingItem = cart.find(item => item.sku === product.sku);
        
        // Cek stok produk
        const originalProduct = products.find(p => p.sku === product.sku);
        const maxStock = originalProduct ? originalProduct.stock : 0;

        if (existingItem) {
            // Jika item sudah ada di keranjang, cek sebelum menambah jumlah
            if (existingItem.quantity < maxStock) {
                existingItem.quantity++;
            } else {
                alert(`Stok untuk ${product.name} tidak mencukupi! (Maks: ${maxStock})`);
            }
        } else {
            // Jika item baru, pastikan stok lebih dari 0
            if (maxStock > 0) {
                cart.push({ ...product, quantity: 1 });
            } else {
                alert(`Stok untuk ${product.name} sudah habis!`);
            }
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
                            <button class="qty-btn qty-minus" data-sku="${item.sku}">-</button>
                            <input type="number" class="item-quantity" value="${item.quantity}" min="1" data-sku="${item.sku}">
                            <button class="qty-btn qty-plus" data-sku="${item.sku}">+</button>
                            <button class="remove-item-btn" data-sku="${item.sku}">×</button>
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

    // function mengaktifkan/menonaktifkan tombol
    function updateCheckoutButtonState() {
        $checkoutButton.prop('disabled', cart.length === 0);
    }
    
    function handleCartActions(sku, action) {
        const itemInCart = cart.find(item => item.sku === sku);
        if (!itemInCart) return;

        // Cek stok produk sebelum mengubah jumlah
        const originalProduct = products.find(p => p.sku === sku);
        const maxStock = originalProduct ? originalProduct.stock : 0;

        switch (action) {
            case 'remove':
                cart = cart.filter(item => item.sku !== sku);
                break;
            case 'plus':
                if (itemInCart.quantity < maxStock) {
                    itemInCart.quantity++;
                } else {
                    alert(`Stok untuk ${itemInCart.name} tidak mencukupi! (Maks: ${maxStock})`);
                }
                break;
            case 'minus':
                if (itemInCart.quantity > 1) {
                    itemInCart.quantity--;
                } else {
                    cart = cart.filter(item => item.sku !== sku);
                }
                break;
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
    
    $cartItems.on('click', '.remove-item-btn', function() {
        handleCartActions($(this).data('sku'), 'remove');
    });
    $cartItems.on('click', '.qty-plus', function() {
        handleCartActions($(this).data('sku'), 'plus');
    });
    $cartItems.on('click', '.qty-minus', function() {
        handleCartActions($(this).data('sku'), 'minus');
    });
    
    $cartItems.on('change', '.item-quantity', function() {
        const sku = $(this).data('sku');
        let newQuantity = parseInt($(this).val());
        const itemInCart = cart.find(item => item.sku === sku);
        
        // Validasi input manual agar tidak melebihi stok
        const originalProduct = products.find(p => p.sku === sku);
        const maxStock = originalProduct ? originalProduct.stock : 0;

        if (newQuantity > maxStock) {
            alert(`Stok tidak mencukupi! (Maks: ${maxStock})`);
            newQuantity = maxStock; // Kembalikan nilai ke stok maksimal
            $(this).val(newQuantity);
        }

        if (itemInCart) {
            if (newQuantity > 0) {
                itemInCart.quantity = newQuantity;
            } else {
                cart = cart.filter(item => item.sku !== sku);
            }
            renderCart();
        }
    });

    $checkoutButton.on('click', () => {
        if (cart.length > 0) {
            const orderDetails = {
                cart: cart,
                subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                tax: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.11,
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.11,
            };
            Storage.setLocal('currentOrder', orderDetails);
            window.location.href = 'pos_payment.html';
        }
    });

    if (products.length === 0) {
        $productList.html("<p>Belum ada produk. Silakan tambahkan dari halaman 'Daftar Produk'.</p>");
    } else {
        renderProducts(products);
    }
    renderCart();
});