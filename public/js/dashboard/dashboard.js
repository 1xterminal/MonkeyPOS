$(document).ready(function() {
    const welcomeMessage = $('.welcome-message');
    const totalSalesCard = $('.dashboard-stats-cards .dashboard-card:nth-child(1) .dashboard-card-value');
    const totalTransactionsCard = $('.dashboard-stats-cards .dashboard-card:nth-child(2) .dashboard-card-value');
    const lowStockCard = $('.dashboard-stats-cards .dashboard-card:nth-child(3) .dashboard-card-value');
    const logoutButton = $('.logout-button');
    const headerTitle = $('.dashboard-header-title h1');
    const filterButtons = $('.dashboard-filter-button');

    const currentUserJSON = sessionStorage.getItem('currentUser');

    // Jika tidak ada pengguna di sessionStorage, kembali ke halaman login
    if (!currentUserJSON) {
        window.location.href = '../login/login.html';
        return;
    }
    const currentUser = JSON.parse(currentUserJSON);

    /* Fungsi untuk menghitung data berdasarkan periode */
    const calculateDataByPeriod = (period) => {
        // Ambil semua transaksi dari localStorage
        const allTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
        
        // Filter transaksi berdasarkan ID user
        const userTransactions = allTransactions.filter(tx => tx.cashierId === currentUser.id);
        
        const today = new Date();
        let startDate = new Date();
        
        // Tentukan rentang tanggal berdasarkan periode
        switch(period) {
            case '3bulan':
                startDate.setMonth(today.getMonth() - 3);
                break;
            case '30hari':
                startDate.setDate(today.getDate() - 30);
                break;
            case '7hari':
                startDate.setDate(today.getDate() - 7);
                break;
            case 'hariini':
            default:
                startDate = new Date(today);
                startDate.setHours(0, 0, 0, 0);
                break;
        }
        
        // Filter transaksi berdasarkan periode
        const filteredTransactions = userTransactions.filter(tx => {
            const transactionDate = new Date(tx.date);
            return transactionDate >= startDate && transactionDate <= today;
        });
        
        // Hitung total penjualan
        const totalSales = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        
        // Hitung jumlah transaksi
        const transactionCount = filteredTransactions.length;
        
        return {
            totalSales,
            transactionCount
        };
    };

    /* Fungsi untuk menghitung stok rendah */
    const calculateLowStock = () => {
        // Mengambil data produk dari localStorage
        const allProducts = JSON.parse(localStorage.getItem('products')) || [];

        // Filter stok produk yang dibawah 10
        const lowStockProducts = allProducts.filter(product => 
            typeof product.stock !== 'undefined' && product.stock < 10
        );

        // Menghitung jumlah produk stok rendah
        return lowStockProducts.length;
    };

    /* Proses Data Dashboard */
    const updateDashboard = (period = 'hariini') => {
        /* Pesan selamat datang */
        headerTitle.text(`Selamat Datang, ${currentUser.name}`);
        welcomeMessage.text(`Selamat Datang, ${currentUser.name}`);

        /* Hitung data berdasarkan periode */
        const { totalSales, transactionCount } = calculateDataByPeriod(period);
        
        /* Hitung stok rendah */
        const lowStockCount = calculateLowStock();

        // Tampilkan hasil di kartu status
        totalSalesCard.text(`Rp. ${totalSales.toLocaleString('id-ID')}`);
        totalTransactionsCard.text(`${transactionCount} Transaksi`);
        lowStockCard.text(`${lowStockCount} Produk`);
    };

    // Atur tombol filter hari ini menjadi default
    $('.dashboard-filter-button[data-period="hariini"]').addClass('active');

    // Filter button events
    filterButtons.click(function() {
        const period = $(this).data('period');
        filterButtons.removeClass('active');
        $(this).addClass('active');
        
        // Update dashboard dengan periode yang dipilih
        updateDashboard(period);
    });

    updateDashboard();

    /* Fungsi Logout Button */
    logoutButton.click(function () {
        // Hapus data user dari sessionStorage
        sessionStorage.removeItem('currentUser');
        // Diarahkan kembali ke halaman login
        window.location.href = '../login/login.html';
    });
});