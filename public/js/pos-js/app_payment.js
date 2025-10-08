// Pakai jQuery
$(document).ready(() => {
    const products = Storage.getLocal("products", []);

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

    function formatRupiah(number) {
        return `Rp ${number.toLocaleString('id-ID')}`;
    }

    function validatePaymentCompletion() {
        const selectedMethod = $('input[name="payment-method"]:checked').val();

        if (selectedMethod === 'cash') {
            const amountReceived = parseFloat($amountReceivedInput.val()) || 0;
            const total = Math.round(currentOrder.total);

            if (amountReceived >= total) {
                $completeSaleButton.prop('disabled', false);
            } else {
                $completeSaleButton.prop('disabled', true);
            }
        } else {
            $completeSaleButton.prop('disabled', false);
        }
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
        Storage.setLocal('currentOrder', currentOrder);
        validatePaymentCompletion();
    }

    function renderAll() {
        renderCartOnPaymentPage();
        updateTotalsOnPaymentPage();
    }

    function loadOrderDetails() {
        currentOrder = Storage.getLocal('currentOrder');
        if (currentOrder && currentOrder.cart.length > 0) {
            renderAll();
        } else {
            alert('Keranjang kosong. Kembali ke terminal.');
            window.location.href = 'pos_terminal.html';
        }
    }

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
                        <button class="qty-btn-payment qty-minus-payment" data-sku="${item.sku}">
                            <span class="material-symbols-outlined small">remove</span>
                        </button>
                        <span class="qty">x${item.quantity}</span>
                        <button class="qty-btn-payment qty-plus-payment" data-sku="${item.sku}">
                            <span class="material-symbols-outlined small">add</span>
                        </button>
                    </div>
                    <span class="total">${formatRupiah(itemTotal)}</span>
                    <button class="remove-item-btn-payment" data-sku="${item.sku}">
                        <span class="material-symbols-outlined small">close</span>
                    </button>
                </div>
            `);
            $cartItemsEl.append($cartItemDiv);
        });
    }

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
                handleRemoveItem(sku);
                return;
            }
        }
        renderAll();
    }

    function handleRemoveItem(sku) {
        currentOrder.cart = currentOrder.cart.filter(item => item.sku !== sku);
        if (currentOrder.cart.length === 0) {
            Storage.removeLocal('currentOrder');
            alert("Keranjang kosong, kembali ke terminal.");
            window.location.href = 'pos_terminal.html';
        } else {
            renderAll();
        }
    }

    function handlePaymentMethodChange() {
        const selectedMethod = $('input[name="payment-method"]:checked').val();
        $cashPaymentDetails.toggle(selectedMethod === 'cash');
        $amountReceivedInput.val('');
        $changeAmountEl.text('Rp 0');
        validatePaymentCompletion();
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
        validatePaymentCompletion();
    }

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

    $cancelButton.on('click', () => {
        window.location.href = 'pos_terminal.html';
    });

    $completeSaleButton.on('click', () => {
        const currentUser = Storage.getSession('currentUser', {
            name: 'Unknown'
        });

        const paymentMethod = $('input[name="payment-method"]:checked').val();
        let allProducts = Storage.getLocal('products', []);

        for (const itemInCart of currentOrder.cart) {
            // Cari produk yang cocok di daftar utama berdasarkan SKU
            const productToUpdate = allProducts.find(p => p.sku === itemInCart.sku);

            // Jika produk ditemukan, kurangi stoknya
            if (productToUpdate) {
                productToUpdate.stock -= itemInCart.quantity;
                // Pastikan stok tidak menjadi negatif
                if (productToUpdate.stock < 0) {
                    productToUpdate.stock = 0;
                }
            }
        }

        Storage.setLocal('products', allProducts);

        const newTransaction = {
            id: `INV-${Date.now()}`, date: new Date().toISOString(), cashier: currentUser.name,
            items: currentOrder.cart, subtotal: currentOrder.subtotal, tax: currentOrder.tax, total: currentOrder.total,
            paymentMethod: paymentMethod, amountReceived: null, change: null
        };

        if (paymentMethod === 'cash') {
            const amountReceived = parseFloat($amountReceivedInput.val()) || 0;
            const total = Math.round(currentOrder.total);
            newTransaction.amountReceived = amountReceived;
            newTransaction.change = amountReceived - total;
        }

        let salesHistory = Storage.getLocal('salesHistory', []);
        salesHistory.unshift(newTransaction);
        Storage.setLocal('salesHistory', salesHistory);
        Storage.removeLocal('currentOrder');

        window.location.href = `../receipt/transaction_receipt.html?id=${newTransaction.id}`;

    });

    loadOrderDetails();
    handlePaymentMethodChange();
});