// Pake jQuery
$(document).ready(() => {

    // --- AMBIL ELEMEN DOM ---
    const $completeSaleButton = $('#complete-sale-button');
    const $cartItemsEl = $('#cart-items-payment');
    const $subtotalEl = $('#subtotal');
    const $taxEl = $('#tax');
    const $grandTotalEl = $('#grand-total');
    const $paymentMethodRadios = $('input[name="payment-method"]');
    const $cashPaymentDetails = $('#cash-payment-details');
    const $amountReceivedInput = $('#amount-received');
    const $changeAmountEl = $('#change-amount');
    const $cancelButton = $('#cancel-button');

    let currentOrder = null;

    function formatRupiah(number) {
        return `Rp ${number.toLocaleString('id-ID')}`;
    }

    function loadOrderDetails() {
        // Menggunakan Storage Helper untuk mengambil data
        currentOrder = Storage.getLocal('currentOrder');

        if (currentOrder) {
            renderAll();
        } else {
            alert('Tidak ada data pesanan. Kembali ke terminal.');
            window.location.href = 'pos_terminal.html';
        }
    }
    
    function renderAll() {
        renderCartOnPaymentPage();
        updateTotalsOnPaymentPage();
        checkCartIsEmpty();
    }

    function renderCartOnPaymentPage() {
        if (!currentOrder || currentOrder.cart.length === 0) {
            $cartItemsEl.html('<p class="empty-cart-message">Keranjang kosong.</p>');
            return;
        }

        $cartItemsEl.empty();
        currentOrder.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const $cartItemDiv = $(`
                <div class="cart-item-payment">
                    <span class="name">${item.name}</span>
                    <span class="qty">x${item.quantity}</span>
                    <span class="total">${formatRupiah(itemTotal)}</span>
                    <button class="remove-item-btn-payment" data-id="${item.id}">×</button>
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
    }

    function handleRemoveItem(productId) {
        currentOrder.cart = currentOrder.cart.filter(item => item.id !== productId);
        // Menggunakan Storage Helper untuk memperbarui data
        Storage.setLocal('currentOrder', currentOrder);
        renderAll();
    }

    function checkCartIsEmpty() {
        const isEmpty = !currentOrder || currentOrder.cart.length === 0;
        $completeSaleButton.prop('disabled', isEmpty);
    }
    
    function handlePaymentMethodChange() {
        const selectedMethod = $('input[name="payment-method"]:checked').val();
        $cashPaymentDetails.toggle(selectedMethod === 'cash');
        $amountReceivedInput.val('');
        $changeAmountEl.text('Rp 0');
    }

    function calculateChange() {
        const amountReceived = parseFloat($amountReceivedInput.val()) || 0;
        const total = Math.round(currentOrder.total);
        if (amountReceived >= total) {
            const change = amountReceived - total;
            $changeAmountEl.text(formatRupiah(change));
        } else {
            $changeAmountEl.text('Uang tidak cukup');
        }
    }

    // --- EVENT LISTENERS ---
    $cartItemsEl.on('click', '.remove-item-btn-payment', function() {
        const productId = parseInt($(this).data('id'));
        handleRemoveItem(productId);
    });

    $paymentMethodRadios.on('change', handlePaymentMethodChange);
    $amountReceivedInput.on('input', calculateChange);

    $completeSaleButton.on('click', () => {
        // 1. Dapatkan data user yang sedang login
        const currentUser = Storage.getSession('currentUser', { name: 'Unknown' });

        // 2. Buat objek transaksi baru yang lengkap
        const newTransaction = {
            id: `INV-${Date.now()}`, 
            date: new Date().toISOString(),
            cashier: currentUser.name,
            items: currentOrder.cart,
            subtotal: currentOrder.subtotal,
            tax: currentOrder.tax,
            total: currentOrder.total,
            paymentMethod: $('input[name="payment-method"]:checked').val()
        };

        // 3. Ambil riwayat penjualan yang sudah ada, atau buat array baru
        let salesHistory = Storage.getLocal('salesHistory', []);

        // 4. Tambahkan transaksi baru ke riwayat
        salesHistory.unshift(newTransaction);

        // 5. Simpan kembali riwayat penjualan yang sudah diperbarui
        Storage.setLocal('salesHistory', salesHistory);

        // 6. Hapus data pesanan saat ini
        Storage.removeLocal('currentOrder');
        
        // 7. Arahkan ke halaman struk dengan membawa ID transaksi
        window.location.href = `receipt.html?id=${newTransaction.id}`;
    });

    loadOrderDetails();
    handlePaymentMethodChange();
});