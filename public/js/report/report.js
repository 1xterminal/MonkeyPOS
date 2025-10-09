
$(document).ready(() => {
    const currentUser = Storage.getSession('currentUser');
    if (!currentUser) {
        alert("Anda harus login untuk melihat laporan.");
        window.location.href = '../login/login.html';
        return;
    }

    const salesHistory = Storage.getLocal('salesHistory', []);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const cashierSales = salesHistory.filter(sale => {
        const saleDate = new Date(sale.date);
        return sale.cashier === currentUser.name && saleDate >= sevenDaysAgo;
    });

    let totalSales = 0;
    const productSales = {};

    cashierSales.forEach(sale => {
        totalSales += sale.total;
        sale.items.forEach(item => {
            if (productSales[item.sku]) {
                productSales[item.sku].quantitySold += item.quantity;
            } else {
                productSales[item.sku] = {
                    productName: item.name,
                    quantitySold: item.quantity,
                    unitPrice: item.price,
                };
            }
        });
    });

    function formatRupiah(number) {
        return `Rp ${number.toLocaleString('id-ID')}`;
    }

    $('#cashier-name').text(currentUser.name);
    $('#total-sales').text(formatRupiah(totalSales));

    const productSalesData = Object.values(productSales).map(item => ({
        ...item,
        totalPrice: item.quantitySold * item.unitPrice
    }));

    const tableColumns = [
        { key: "productName", label: "Nama Produk" },
        { key: "quantitySold", label: "Jumlah Terjual" },
        { key: "unitPrice", label: "Harga Satuan", isCurrency: true },
        { key: "totalPrice", label: "Total Harga", isCurrency: true }
    ];

    const formattedData = productSalesData.map(item => ({
        ...item,
        unitPrice: formatRupiah(item.unitPrice),
        totalPrice: formatRupiah(item.totalPrice)
    }));

    createTable($('#product-sales-table-container'), tableColumns, formattedData, []);

    $('#print-report-btn').on('click', () => {
        window.print();
    });
});
