// Pakai jQuery
$(document).ready(() => {

    // BARU: Muat daftar produk utama untuk cek stok
    const products = Storage.getLocal("products", []);

    // --- ELEMEN DOM ---
    const $cartItemsEl = $('#cart-items-payment');
    const $subtotalEl = $('#subtotal');
    const $taxEl = $('#tax');
    const $grandTotalEl = $('#grand-total');
    const $paymentMethodRadios = $('input[name="payment-method"]');
    const $cashPaymentDetails = $('#cash-payment-details');
    const $amountReceivedInput = $('#amount-received');
    const $changeAmountEl = $('#change-amount');
    const $completeSaleButton = $('#complete-sale-button');
    const $cancelButton = $('#cancel-button');

    let currentOrder = null;

    // --- FUNGSI-FUNGSI ---

    function formatRupiah(number) { return `Rp ${number.toLocaleString('id-ID')}`; }

    function loadOrderDetails() {
        currentOrder = Storage.getLocal('currentOrder');
        if (currentOrder && currentOrder.cart.length > 0) {
            renderAll();
        } else {
            alert('Keranjang kosong. Kembali ke terminal.');
            window.location.href = 'pos_terminal.html';
        }
    }
    
    function renderAll() {
        renderCartOnPaymentPage();
        updateTotalsOnPaymentPage();
        checkCartIsEmpty();
    }

    // DIUBAH: Template keranjang sekarang memiliki tombol + dan -
    function renderCartOnPaymentPage() {
        $cartItemsEl.empty();
        currentOrder.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const $cartItemDiv = $(`
                <div class="cart-item-payment">
                    <div class="item-info">
                        <span class="name">${item.name}</span>
                        <span class="price">${formatRupiah(item.price)}</span>
                    </div>
                    <div class="item-actions">
                        <button class="qty-btn-payment qty-minus-payment" data-sku="${item.sku}">-</button>
                        <span class="qty">x${item.quantity}</span>
                        <button class="qty-btn-payment qty-plus-payment" data-sku="${item.sku}">+</button>
                    </div>
                    <span class="total">${formatRupiah(itemTotal)}</span>
                    <button class="remove-item-btn-payment" data-sku="${item.sku}">×</button>
                </div>
            `);
            $cartItemsEl.append($cartItemDiv);
        });
    }

    function updateTotalsOnPaymentPage() {
        const subtotal = currentOrder.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.11;
        const total = subtotal + tax;

        currentOrder.subtotal = subtotal;
        currentOrder.tax = tax;
        currentOrder.total = total;

        $subtotalEl.text(formatRupiah(subtotal));
        $taxEl.text(formatRupiah(tax));
        $grandTotalEl.text(formatRupiah(total));

        // Perbarui juga data di localStorage setiap kali total berubah
        Storage.setLocal('currentOrder', currentOrder);
    }

    // BARU: Fungsi untuk mengubah jumlah barang
    function handleQuantityChange(sku, action) {
        const itemInCart = currentOrder.cart.find(item => item.sku === sku);
        if (!itemInCart) return;

        const originalProduct = products.find(p => p.sku === sku);
        const maxStock = originalProduct ? originalProduct.stock : 0;

        if (action === 'plus') {
            if (itemInCart.quantity < maxStock) {
                itemInCart.quantity++;
            } else {
                alert(`Stok untuk ${itemInCart.name} tidak mencukupi! (Maks: ${maxStock})`);
            }
        } else if (action === 'minus') {
            if (itemInCart.quantity > 1) {
                itemInCart.quantity--;
            } else {
                // Jika kuantitas 1 dan dikurangi, hapus item
                handleRemoveItem(sku);
                return; // Hentikan fungsi agar renderAll tidak dipanggil dua kali
            }
        }
        renderAll();
    }
    
    // DIPERBAIKI: Fungsi hapus item menggunakan SKU
    function handleRemoveItem(sku) {
        currentOrder.cart = currentOrder.cart.filter(item => item.sku !== sku);
        // Jika keranjang jadi kosong, kembali ke terminal
        if (currentOrder.cart.length === 0) {
            Storage.removeLocal('currentOrder');
            alert("Keranjang kosong, kembali ke terminal.");
            window.location.href = 'pos_terminal.html';
        } else {
            renderAll();
        }
    }

    function checkCartIsEmpty() { /* ... tidak ada perubahan ... */ }
    function handlePaymentMethodChange() { /* ... tidak ada perubahan ... */ }
    function calculateChange() { /* ... tidak ada perubahan ... */ }

    // --- EVENT LISTENERS ---
    
    // DIPERBAIKI & DITAMBAH: Event listener untuk semua tombol
    $cartItemsEl.on('click', '.remove-item-btn-payment', function() {
        handleRemoveItem($(this).data('sku'));
    });
    $cartItemsEl.on('click', '.qty-plus-payment', function() {
        handleQuantityChange($(this).data('sku'), 'plus');
    });
    $cartItemsEl.on('click', '.qty-minus-payment', function() {
        handleQuantityChange($(this).data('sku'), 'minus');
    });

    $paymentMethodRadios.on('change', handlePaymentMethodChange);
    $amountReceivedInput.on('input', calculateChange);
    $completeSaleButton.on('click', () => { /* ... tidak ada perubahan ... */ });

    // DIPERBAIKI: Event listener untuk tombol Batal
    $cancelButton.on('click', () => {
        window.location.href = 'pos_terminal.html';
    });

    // --- INISIALISASI ---
    loadOrderDetails();
    handlePaymentMethodChange();
});