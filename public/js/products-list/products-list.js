$(document).ready(() => {
    //getting the table
    const tableContainer = $('#product-table-container');

    //getting the search input and buttons
    const searchInput = $('#search-input');
    const searchButton = $('#search-button');

    //getting the products list
    let products;

    if(localStorage.getItem("products") != null){
        products = JSON.parse(localStorage.getItem("products"));
    }
    else{
        products = [];
    }

    //save products to localStorage
    function saveProducts() {
        localStorage.setItem("products", JSON.stringify(products));
    }

    //delete product
    function deleteProduct(sku) {
        //updates the products list by filtering out the deleted product
        products = products.filter(p => p.sku !== sku);
        
        //save new array
        saveProducts();

        //render table with updated data
        renderTable(products);
    }

    //render table
    function renderTable(productsToRender) {
        //define columns for the product table
        const tableColumns = [
            { key: "name", label: "Nama Produk" },
            { key: "sku", label: "SKU" },
            { key: "category", label: "Kategori" },
            { key: "price", label: "Harga" },
            { key: "stock", label: "Stok" }
        ];

        //define the table actions (what you can do to the data)
        const tableActions = [
            {
                label: "Ubah",
                icon: "edit",
                className: "products-edit-button",
                onClick: (row) => {
                    window.location.href = `product_edit.html?sku=${row.sku}`;
                }
            },
            {
                label: "Hapus",
                icon: "delete",
                className: "products-delete-button",
                onClick: (row) => {
                    deleteProduct(row.sku);
                }
            }
        ];

        //formats the price to IDR
        const formattedData = dataToRender.map(product => ({
            ...product,
            price: new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 2
            }).format(product.price)
        }));

        //create table
        createTable(tableContainer, tableColumns, formattedData, tableActions);
    }

    //search function
    function searchProducts() {
        var searchTerm = searchInput.val().toLowerCase();

        //if the search bar is empty
        if (searchTerm === '') {
            renderTable(products);
            return;
        }

        var filteredProducts = products.filter(p => {
            var productName = p.name.toLowerCase();
            var productSKU = p.sku.toLowerCase();
            return productName.includes(searchTerm) || productSKU.includes(searchTerm);
        });

        renderTable(filteredProducts);
    }

    //event listener for the search button
    searchButton.on("click", searchProducts);

    //search when pressing enter
    searchInput.on("keypress", (e) => {
        if (e.which === 13){
            searchProducts();
        }
    });

    renderTable(products);
});