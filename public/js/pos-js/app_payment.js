document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMEN DOM ---
    const totalAmountEl = document.getElementById('total-amount');
    const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
    const cashPaymentDetails = document.getElementById('cash-payment-details');
    const amountReceivedInput = document.getElementById('amount-received');
    const changeAmountEl = document.getElementById('change-amount');
    const completeSaleButton = document.getElementById('complete-sale-button');
    const cancelButton = document.getElementById('cancel-button');
    
    let currentOrder = null;
    let total = 0;

    // --- FUNGSI-FUNGSI ---

    /**
     * Memuat data pesanan dari localStorage.
     */
    function loadOrderDetails() {
        const orderData = localStorage.getItem('currentOrder');
        if (orderData) {
            currentOrder = JSON.parse(orderData);
            total = Math.round(currentOrder.total); // Bulatkan total untuk menghindari masalah desimal
            totalAmountEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
        } else {
            // Jika tidak ada data, kembali ke terminal
            alert('Tidak ada data pesanan. Kembali ke terminal.');
            window.location.href = 'pos_terminal.html';
        }
    }

    /**
     * Menangani perubahan metode pembayaran.
     */
    function handlePaymentMethodChange() {
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
        if (selectedMethod === 'cash') {
            cashPaymentDetails.style.display = 'block';
        } else {
            cashPaymentDetails.style.display = 'none';
        }
        // Reset input saat metode berganti
        amountReceivedInput.value = '';
        changeAmountEl.textContent = 'Rp 0';
    }

    /**
     * Menghitung uang kembalian.
     */
    function calculateChange() {
        const amountReceived = parseFloat(amountReceivedInput.value) || 0;
        if (amountReceived >= total) {
            const change = amountReceived - total;
            changeAmountEl.textContent = `Rp ${change.toLocaleString('id-ID')}`;
        } else {
            changeAmountEl.textContent = 'Uang tidak cukup';
        }
    }

    // --- EVENT LISTENERS ---

    // Listener untuk perubahan metode pembayaran
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });

    // Listener untuk input uang diterima (real-time)
    amountReceivedInput.addEventListener('input', calculateChange);

    // Listener untuk tombol "Selesaikan Penjualan"
    completeSaleButton.addEventListener('click', () => {
        // Simulasi penyelesaian penjualan
        alert('Transaksi Berhasil!');
        
        // Hapus data dari localStorage setelah selesai
        localStorage.removeItem('currentOrder');
        
        // Arahkan ke halaman struk (jika sudah ada) atau kembali ke terminal
        // Sesuai dokumen, halaman berikutnya adalah receipt.html
        // window.location.href = 'receipt.html'; 
        
        // Untuk sekarang, kita kembali ke terminal
        window.location.href = 'pos_terminal.html'; 
    });

    // Listener untuk tombol "Batal"
    cancelButton.addEventListener('click', () => {
        // Kembali ke terminal tanpa menghapus data, jadi pesanan masih ada
        window.location.href = 'pos_terminal.html';
    });

    // --- INISIALISASI ---
    loadOrderDetails();
    handlePaymentMethodChange(); // Atur tampilan awal berdasarkan metode default
});