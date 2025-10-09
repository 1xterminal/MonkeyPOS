$(document).ready(() => {
    // Helper untuk format mata uang
    function formatRupiah(value) {
        const number = Number(value) || 0;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
    }

    // 1. Ambil ID transaksi dari URL
    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get('id');

    if (!transactionId) {
        alert("ID Transaksi tidak ditemukan.");
        window.location.href = '../sales_history/sales_history.html';
        return;
    }

    // 2. Ambil data dari localStorage
    const salesHistory = Storage.getLocal('salesHistory', []);
    const transaction = salesHistory.find(t => t.id === transactionId);

    if (!transaction) {
        $('.transaction-card').html('<h1>Transaksi tidak ditemukan.</h1>');
        return;
    }

    // 3. Isi semua informasi ke elemen HTML
    // Informasi Header
    const transactionDate = new Date(transaction.date);
    $('#transactionId').text(transaction.id);
    $('#transactionDate').text(transactionDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }));
    $('#transactionTime').text(transactionDate.toLocaleTimeString('id-ID'));
    
    // Informasi Item
    const $itemsList = $('#itemsList');
    $itemsList.empty();
    transaction.items.forEach(item => {
        const row = `
            <tr>
                <td>${item.name}</td>
                <td class="text-right">${formatRupiah(item.price)}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${formatRupiah(item.price * item.quantity)}</td>
            </tr>`;
        $itemsList.append(row);
    });

    // Informasi Pembayaran
    $('#paymentMethod').text(transaction.paymentMethod);
    $('#cashier').text(transaction.cashier);
    $('#subtotal').text(formatRupiah(transaction.subtotal));
    $('#tax').text(formatRupiah(transaction.tax));
    $('#total').text(formatRupiah(transaction.total));

    // Logika untuk pembayaran tunai
    if (transaction.paymentMethod === 'cash') {
        $('#amountReceived').text(formatRupiah(transaction.amountReceived));
        $('#change').text(formatRupiah(transaction.change));
        $('.cash-detail').show(); // Tampilkan detail tunai
    } else {
        $('.cash-detail').hide(); // Sembunyikan jika bukan tunai
    }
    
    // 4. Atur tombol kembali
    $('#btnBack').on('click', () => {
        window.location.href = '../sales_history/sales_history.html';
    });
});