$(document).ready(() => {
    function formatRupiah(number) {
        return `Rp ${number.toLocaleString('id-ID')}`;
    }

    // 1. Dapatkan ID transaksi dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('id');

    if (!transactionId) {
        alert("ID Transaksi tidak ditemukan!");
        window.location.href = 'pos_terminal.html';
        return;
    }

    // 2. Ambil seluruh riwayat penjualan
    const salesHistory = Storage.getLocal('salesHistory', []);
    
    // 3. Cari transaksi yang sesuai dengan ID
    const transaction = salesHistory.find(sale => sale.id === transactionId);

    if (!transaction) {
        alert("Detail transaksi tidak ditemukan!");
        window.location.href = 'pos_terminal.html';
        return;
    }

    // 4. Tampilkan data ke elemen HTML
    $('#receipt-id').text(transaction.id);
    $('#receipt-date').text(new Date(transaction.date).toLocaleString('id-ID'));
    $('#receipt-cashier').text(transaction.cashier);
    $('#receipt-subtotal').text(formatRupiah(transaction.subtotal));
    $('#receipt-tax').text(formatRupiah(transaction.tax));
    $('#receipt-total').text(formatRupiah(transaction.total));
    $('#receipt-payment-method').text(transaction.paymentMethod.charAt(0).toUpperCase() + transaction.paymentMethod.slice(1));

    const $itemsTable = $('#receipt-items-table');
    transaction.items.forEach(item => {
        const itemRow = `
            <tr>
                <td>${item.name} (x${item.quantity})</td>
                <td style="text-align: right;">${formatRupiah(item.price * item.quantity)}</td>
            </tr>`;
        $itemsTable.append(itemRow);
    });

    // 5. Atur event listener untuk tombol
    $('#print-receipt-btn').on('click', () => {
        alert("Fitur cetak struk sedang dalam pengembangan!");
        // window.print(); // Kode untuk cetak nyata
    });

    $('#new-sale-btn').on('click', () => {
        window.location.href = 'pos_terminal.html';
    });
});