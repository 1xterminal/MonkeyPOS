$(document).ready(() => {
    const tableContainer = $('#product-table-container');
    const searchInput = $('#search-input');
    const searchButton = $('#search-button');

    // Use the helper to safely get the products array
    let products = Storage.getLocal("products", []);

    // dummy data for testing
    // const products = [
    //      { name: "Product A", sku: "A123", category: "Category 1", price: 1000, stock: 10 },
    //      { name: "Product B", sku: "B456", category: "Category 2", price: 2000, stock: 5 },
    //      { name: "Product C", sku: "C789", category: "Category 1", price: 1500, stock: 15 },
    // ];

    // Helper to save products to localStorage
    function saveProducts() {
        Storage.setLocal("products", products);
    }

    // Delete a product by its SKU
    function deleteProduct(sku) {
        products = products.filter(p => p.sku !== sku);
        saveProducts();
        renderTable(products);
    }

    // Main function to render the table
    function renderTable(productsToRender) {
        const tableColumns = [
            { key: "name", label: "Nama Produk" },
            { key: "sku", label: "SKU" },
            { key: "category", label: "Kategori" },
            { key: "price", label: "Harga" },
            { key: "stock", label: "Stok" }
        ];

        const tableActions = [
            {
                label: "Ubah",
                icon: "edit",
                className: "products-list-edit-button",
                onClick: (row) => {
                    // We need the original SKU to find the product
                    const originalProduct = products.find(p => p.name === row.name);
                    if (originalProduct) {
                         window.location.href = `product_edit.html?sku=${originalProduct.sku}`;
                    }
                }
            },
            {
                label: "Hapus",
                icon: "delete",
                className: "products-list-delete-button",
                onClick: (row) => {
                    // We need the original SKU to delete the product
                    const originalProduct = products.find(p => p.name === row.name);
                    if (originalProduct && confirm(`Are you sure you want to delete ${originalProduct.name}?`)) {
                        deleteProduct(originalProduct.sku);
                    }
                }
            }
        ];
        
        // Format the price into currency before rendering
        const formattedData = productsToRender.map(product => ({
            ...product,
            price: new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(product.price)
        }));

        createTable(tableContainer, tableColumns, formattedData, tableActions);
    }

    // Search function
    function searchProducts() {
        const searchTerm = searchInput.val().toLowerCase();
        if (searchTerm === '') {
            renderTable(products);
            return;
        }

        const filteredProducts = products.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            p.sku.toLowerCase().includes(searchTerm)
        );
        renderTable(filteredProducts);
    }

    // Event listeners
    searchButton.on("click", searchProducts);
    searchInput.on("keypress", (e) => {
        if (e.which === 13) { // 13 is the Enter key
            searchProducts();
        }
    });

    // Initial render of the table when the page loads
    renderTable(products);
});