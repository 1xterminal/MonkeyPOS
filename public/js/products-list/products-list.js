$(document).ready(() => {
    // define columns for the product table
    const tableColumns = [
        { key: "name", label: "Nama Produk"}
    ];

    // define data rows for the product table
    const productData = [
        localStorage.getItem("products", [])
    ];

    const tableContainer = $('product-table-container');

    createTable(tableContainer, tableColumns, productData);
})