
$(document).ready(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('id');
    const salesHistory = Storage.getLocal('salesHistory', []);
    const transaction = salesHistory.find(t => t.id === transactionId);

    if (!transaction) {
        alert('Transaksi tidak ditemukan!');
        window.location.href = '../pos/pos_terminal.html';
        return;
    }

    function formatRupiah(number) {
        return `Rp ${number.toLocaleString('id-ID')}`;
    }

    function populateReceipt() {
        const {
            date,
            items,
            tax,
            total,
            amountReceived,
            change
        } = transaction;

        const formattedDate = new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const formattedTime = new Date(date).toLocaleTimeString('id-ID');

        $('.date').text(formattedDate);
        $('.time').text(formattedTime);

        const $carts = $('#carts');
        $carts.empty();
        items.forEach(item => {
            const $cartItem = $(`
                <div class="cart">
                    <div class="cart-detail">
                        <span class="product-name">${item.name}</span>
                        <span class="product-price">${formatRupiah(item.price)} × ${item.quantity}</span>
                    </div>
                    <span class="total-price">${formatRupiah(item.price * item.quantity)}</span>
                </div>

            ` + (
                item.discount
                ? `
                <div class="discount">
                    <span class="discount-amount">Diskon ${item.discount * 100}%</span>
                    <span class="discount-after">${formatRupiah(item.price - (item.price * item.discount))}</span>
                </div>
                `
                : ""));
            $carts.append($cartItem);
        });

        $('#payment-tax').text(formatRupiah(tax));
        $('#payment-total').text(formatRupiah(total));
        $('#payment-received').text(formatRupiah(amountReceived || 0));
        $('#payment-change').text(formatRupiah(change || 0));
    }

    $('#back-to-pos').on('click', () => {
        window.location.href = '../pos/pos_terminal.html';
    });

    $('#print-receipt').on('click', () => {
        window.print();
    });

    populateReceipt();
});
